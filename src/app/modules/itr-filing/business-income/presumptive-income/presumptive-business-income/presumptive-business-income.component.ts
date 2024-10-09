import { NewPresumptiveIncomes } from './../../../../shared/interfaces/itr-input.interface';
import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FormArray, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';

@Component({
  selector: 'app-presumptive-business-income',
  templateUrl: './presumptive-business-income.component.html',
  styleUrls: ['./presumptive-business-income.component.scss'],
})
export class PresumptiveBusinessIncomeComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean;

  businessArray = [];
  businessData: any;
  busIncomeForm: UntypedFormGroup;
  busIncomeFormArray: FormArray;
  submitted: boolean = false;
  amountSix: number = 0;
  maxSixAmt: number = 0;
  amountEight: number = 0;
  maxEightAmt: number = 0;
  amountEightAnyOther: number = 0;
  maxEightAnyOtherAmt: number = 0;
  @Output() presBusinessSaved = new EventEmitter<boolean>();
  cashPercentage = 0;
  bankPercentage = 0;
  anyOtherPercentage = 0;
  bankPerWidth = 0;
  cashPerWidth = 0;
  anyOtherPerWidth = 0;
  bankMinIncomePercentage = (50 / 100) * 6;
  cashMinIncomePercentage = (50 / 100) * 8;

  activeIndex: number;
  gridOptions: GridOptions;
  selectedFormGroup: UntypedFormGroup;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: UntypedFormBuilder, private elementRef: ElementRef
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    // setting grids data
    this.gridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        params.api?.setRowData(
          this.busIncomeFormArray.controls
        );
      },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.busIncomeFormArray.controls.forEach((formGroup: UntypedFormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
      },
      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  ngOnInit(): void {
    let presBusiness = this.ITR_JSON.business?.presumptiveIncomes?.filter(
      (acIncome) => acIncome.businessType === 'BUSINESS'
    );

    this.busIncomeFormArray = new FormArray([]);
    let srn = this.busIncomeFormArray.controls.length > 0 ? this.busIncomeFormArray.controls.length : 0;
    this.selectedFormGroup = this.createBusIncomeForm(srn);
    this.activeIndex = -1;

    if (presBusiness && presBusiness.length > 0) {
      presBusiness.forEach((element, index) => {
        let form = this.createBusIncomeForm(index, element);
        this.busIncomeFormArray.push(form);
      });
    }
    this.busIncomeForm = this.fb.group({
      busIncomeFormArray: this.busIncomeFormArray,
    });
    this.gridOptions.api?.setRowData(
      this.busIncomeFormArray.controls
    );
  }

  get getBusIncomeArray() {
    return <FormArray>this.busIncomeForm.get('busIncomeFormArray');
  }

  createBusIncomeForm(index, income?) {
    let cash = income?.incomes?.filter((element) => element.incomeType === 'CASH')[0];
    let bank = income?.incomes?.filter((element) => element.incomeType === 'BANK')[0];
    let anyOther = income?.incomes?.filter((element) => element.incomeType === 'ANY_OTHER')[0];

    console.log(cash, bank);
    let form = this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [income?.natureOfBusiness || null, [Validators.required],],
      tradeName: [income?.tradeName || null, [Validators.required]],
      description: [income?.description || null],
      bankReceipts: [bank ? bank.receipts : 0, [Validators.required]],
      bankMinIncome: [bank ? bank.minimumPresumptiveIncome : 0, [Validators.required],],
      bankPreIncome: [bank ? bank.presumptiveIncome : 0],
      cashReceipts: [cash ? cash.receipts : 0, [Validators.required]],
      cashMinIncome: [cash ? cash.minimumPresumptiveIncome : 0, [Validators.required],],
      cashPreIncome: [cash ? cash.presumptiveIncome : 0],
      anyOtherMode: [anyOther ? anyOther.receipts : 0, [Validators.required]],
      anyOtherMinIncome: [anyOther ? anyOther.minimumPresumptiveIncome : 0, [Validators.required],],
      anyOtherPreIncome: [anyOther ? anyOther.presumptiveIncome : 0],
    });
    return form;
  }

  busSelected() {
    const busIncomeFormArray = <FormArray>(this.busIncomeForm?.get('busIncomeFormArray'));
    return (busIncomeFormArray.controls.filter((element) => (element as UntypedFormGroup).controls['hasEdit'].value === true).length > 0);
  }

  deleteArray() {
    let array = <FormArray>this.busIncomeForm.get('busIncomeFormArray');
    array.controls = array.controls.filter((element) => !(element as UntypedFormGroup).controls['hasEdit'].value);
    this.selectedFormGroup.reset();
    this.gridOptions?.api?.setRowData(this.busIncomeFormArray.controls);
    this.activeIndex = -1;
  }

  calculatePresumptiveIncome(incomeType, setValue?) {
    let total = parseFloat(this.selectedFormGroup.controls['bankReceipts'].value) + parseFloat(this.selectedFormGroup.controls['cashReceipts'].value) + parseFloat(this.selectedFormGroup.controls['anyOtherMode'].value);
    if (total > 20000000) {
      let cashReceipts = total / 100 * 5;
      if (cashReceipts > parseFloat(this.selectedFormGroup.controls['cashReceipts'].value)) {
        this.selectedFormGroup.controls['bankReceipts'].setValidators([Validators.max(30000000)]);
        this.selectedFormGroup.controls['bankReceipts'].updateValueAndValidity();
        this.selectedFormGroup.controls['cashReceipts'].setValidators([Validators.max(30000000)]);
        this.selectedFormGroup.controls['cashReceipts'].updateValueAndValidity();
        this.selectedFormGroup.controls['anyOtherMode'].setValidators([Validators.max(30000000)]);
        this.selectedFormGroup.controls['anyOtherMode'].updateValueAndValidity();
      } else {
        this.selectedFormGroup.controls['bankReceipts'].setValidators([Validators.max(20000000)]);
        this.selectedFormGroup.controls['bankReceipts'].updateValueAndValidity();
        this.selectedFormGroup.controls['cashReceipts'].setValidators([Validators.max(20000000)]);
        this.selectedFormGroup.controls['cashReceipts'].updateValueAndValidity();
        this.selectedFormGroup.controls['anyOtherMode'].setValidators([Validators.max(20000000)]);
        this.selectedFormGroup.controls['anyOtherMode'].updateValueAndValidity();
      }

    }

    if (incomeType === 'cash') {
      this.amountEight = this.selectedFormGroup.controls['cashReceipts'].value;
      this.maxEightAmt = this.selectedFormGroup.controls['cashReceipts'].value;
      this.amountEight = Math.ceil(Number((this.amountEight / 100) * 8));

      if (setValue) {
        this.selectedFormGroup.controls['cashMinIncome'].setValue(this.amountEight);
      }

      if (this.selectedFormGroup.controls['cashPreIncome'].value >= 0) {
        this.selectedFormGroup.controls['cashPreIncome'].setValidators([
          Validators.min(this.amountEight), Validators.max(this.maxEightAmt)]);
        this.selectedFormGroup.controls['cashPreIncome'].updateValueAndValidity();
      } else {
        this.selectedFormGroup.controls['cashPreIncome'].clearValidators();
        this.selectedFormGroup.controls['cashPreIncome'].updateValueAndValidity();
      }
    } else if (incomeType === 'bank') {
      this.amountSix = this.selectedFormGroup.controls['bankReceipts'].value;
      this.maxSixAmt = this.selectedFormGroup.controls['bankReceipts'].value;
      this.amountSix = Math.ceil(Number((this.amountSix / 100) * 6));

      if (setValue) {
        this.selectedFormGroup.controls['bankMinIncome'].setValue(this.amountSix);
      }

      if (this.selectedFormGroup.controls['bankPreIncome'].value >= 0) {
        this.selectedFormGroup.controls['bankPreIncome'].setValidators([
          Validators.min(this.amountSix), Validators.max(this.maxSixAmt)]);
        this.selectedFormGroup.controls['bankPreIncome'].updateValueAndValidity();
      } else {
        this.selectedFormGroup.controls['bankPreIncome'].clearValidators();
        this.selectedFormGroup.controls['bankPreIncome'].updateValueAndValidity();
      }
    } else if (incomeType === 'anyOther') {
      this.amountEightAnyOther = this.selectedFormGroup.controls['anyOtherMode'].value;
      this.maxEightAnyOtherAmt = this.selectedFormGroup.controls['anyOtherMode'].value;
      this.amountEightAnyOther = Math.ceil(Number((this.amountEightAnyOther / 100) * 8));

      if (setValue) {
        this.selectedFormGroup.controls['anyOtherMinIncome'].setValue(this.amountEightAnyOther);
      }

      if (this.selectedFormGroup.controls['anyOtherPreIncome'].value >= 0) {
        this.selectedFormGroup.controls['anyOtherPreIncome'].setValidators([
          Validators.min(this.amountEightAnyOther), Validators.max(this.maxEightAnyOtherAmt)]);
        this.selectedFormGroup.controls['anyOtherPreIncome'].updateValueAndValidity();
      } else {
        this.selectedFormGroup.controls['anyOtherPreIncome'].clearValidators();
        this.selectedFormGroup.controls['anyOtherPreIncome'].updateValueAndValidity();
      }
    }
    const cashReceipts = parseFloat(this.selectedFormGroup.controls['cashReceipts'].value);
    const cashPreIncome = parseFloat(this.selectedFormGroup.controls['cashPreIncome'].value);
    let cashPercentage = 0;
    if (cashReceipts > 0) {
      cashPercentage = Math.ceil((cashPreIncome * 100) / cashReceipts);
    }
    this.cashPercentage = cashPercentage;
    let cashPerWidth = (50 / 100) * cashPercentage
    this.cashPerWidth = cashPerWidth;

    const anyOtherMode = parseFloat(this.selectedFormGroup.controls['anyOtherMode'].value);
    const anyOtherPreIncome = parseFloat(this.selectedFormGroup.controls['anyOtherPreIncome'].value);
    let anyOtherPercentage = 0;
    if (anyOtherMode > 0) {
      anyOtherPercentage = Math.ceil((anyOtherPreIncome * 100) / anyOtherMode);
    }
    this.anyOtherPercentage = anyOtherPercentage;
    let anyOtherPerWidth = (50 / 100) * anyOtherPercentage
    this.anyOtherPerWidth = anyOtherPerWidth;

    const bankReceipts = parseFloat(this.selectedFormGroup.controls['bankReceipts'].value);
    const bankPreIncome = parseFloat(this.selectedFormGroup.controls['bankPreIncome'].value);

    let bankPercentage = 0;
    if (bankReceipts > 0) {
      bankPercentage = Math.ceil((bankPreIncome * 100) / bankReceipts);
    }
    this.bankPercentage = bankPercentage;
    let bankPerWidth = (50 / 100) * bankPercentage
    this.bankPerWidth = bankPerWidth;
  }

  selection = new SelectionModel<NewPresumptiveIncomes>(true, []);

  onContinue() {
    let BusinessFormIncome = (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray).getRawValue();

    let bankReceiptsTotal = BusinessFormIncome.reduce((acc, value) => acc + parseFloat(value?.bankReceipts), 0);
    let cashReceiptsTotal = BusinessFormIncome.reduce((acc, value) => acc + parseFloat(value?.cashReceipts), 0);
    let anyOtherModeTotal = BusinessFormIncome.reduce((acc, value) => acc + parseFloat(value?.anyOtherMode), 0);
    let total = bankReceiptsTotal + cashReceiptsTotal + anyOtherModeTotal;
    if (total >= 20000000) {
      let cashReceiptsInPercent = total / 100 * 5;
      if (cashReceiptsTotal < cashReceiptsInPercent) {
        if (total > 30000000) {
          this.utilsService.showSnackBar('The overall turnover limit u/s 44AD exceeds.');
          return;
        }
      } else {
        if (total != 20000000) {
          this.utilsService.showSnackBar('The overall turnover limit u/s 44AD exceeds.');
          return;
        }
      }
    }

    this.loading = true;
    this.submitted = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.busIncomeForm.valid) {
      this.submitted = false;
      let presBusinessIncome = [];
      BusinessFormIncome?.forEach((element) => {
          presBusinessIncome.push({
            id: null,
            businessType: 'BUSINESS',
            natureOfBusiness: element.natureOfBusiness,
            label: null,
            tradeName: element.tradeName,
            description: element.description,
            salaryInterestAmount: null,
            taxableIncome: null,
            exemptIncome: null,
            incomes: [
              {
                id: null,
                incomeType: 'BANK',
                receipts: element.bankReceipts,
                presumptiveIncome: element.bankPreIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: element.bankMinIncome,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
              {
                id: null,
                incomeType: 'CASH',
                receipts: element.cashReceipts,
                presumptiveIncome: element.cashPreIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: element.cashMinIncome,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
              {
                id: null,
                incomeType: 'ANY_OTHER',
                receipts: element.anyOtherMode,
                presumptiveIncome: element.anyOtherPreIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: element.anyOtherMinIncome,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
            ],
          });
      });
      console.log('presBusinessIncome', presBusinessIncome);
      console.log(this.Copy_ITR_JSON);

      if (!this.Copy_ITR_JSON?.business) {
        this.Copy_ITR_JSON.business = {
          presumptiveIncomes: [],
          financialParticulars: {
            difference: null,
            id: null,
            grossTurnOverAmount: null,
            membersOwnCapital: null,
            securedLoans: null,
            unSecuredLoans: null,
            advances: null,
            sundryCreditorsAmount: null,
            otherLiabilities: null,
            totalCapitalLiabilities: null,
            fixedAssets: null,
            inventories: null,
            sundryDebtorsAmount: null,
            balanceWithBank: null,
            cashInHand: null,
            loanAndAdvances: null,
            otherAssets: null,
            totalAssets: null,
            investment: null,
            GSTRNumber: null,
          },
          businessDescription: [],
          fixedAssetsDetails: [],
          profitLossACIncomes: [],
        };
      }

      if (!this.Copy_ITR_JSON?.business?.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else {
        let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter(
          (item: any) => item.businessType !== 'BUSINESS'
        );
        this.Copy_ITR_JSON.business.presumptiveIncomes =
          data.concat(presBusinessIncome);
      }

      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.Copy_ITR_JSON));
      this.loading = false;
      this.presBusinessSaved.emit(true);
    } else {
      const busIncomeArray = this.getBusIncomeArray;

      // check if any receipt or presumptive income is 0 and remove that
      busIncomeArray.controls.forEach((element, index) => {
        if ((element.value.bankReceipts === 0 || element.value.bankReceipts === '0') &&
          (element.value.bankPreIncome === 0 || element.value.bankPreIncome === '0') &&
          (element.value.cashReceipts === 0 || element.value.cashReceipts === '0') &&
          (element.value.cashPreIncome === 0 || element.value.cashPreIncome === '0') &&
          (element.value.anyOtherMode === 0 || element.value.anyOtherMode === '0') &&
          (element.value.anyOtherPreIncome === 0 || element.value.anyOtherPreIncome === '0')) {
          busIncomeArray.removeAt(index);
        }
      });

      // once removed check if all are not 0
      const allNonZero = busIncomeArray.controls.every((element) => {
        return (element.value.receipts !== 0 || element.value.presumptiveIncome !== 0);
      });

      //  if every value is non-zero then call function again
      if (allNonZero && this.busIncomeForm.valid) {
        this.onContinue();
        this.loading = false;
        this.presBusinessSaved.emit(false);
        this.utilsService.smoothScrollToTop();
      } else {
        this.loading = false;
        this.presBusinessSaved.emit(false);
      }
    }
  }

  businessClicked(event) {
    this.selectedFormGroup.controls['natureOfBusiness'].setValue(event);
  }


  clearForm() {
    this.selectedFormGroup.reset();
    this.calculatePresumptiveIncome('cash', true);
    this.calculatePresumptiveIncome('bank', true);
    this.calculatePresumptiveIncome('anyOther', true);
  }

  saveManualEntry() {
    if (this.selectedFormGroup.invalid) {
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, 'accordBtn1', this.elementRef);
      return;
    }

    let total = parseFloat(this.selectedFormGroup.controls['bankReceipts'].value) + parseFloat(this.selectedFormGroup.controls['cashReceipts'].value) + parseFloat(this.selectedFormGroup.controls['anyOtherMode'].value);
    if (total >= 20000000) {
      let cashReceiptsInPercent = total / 100 * 5;
      if (parseFloat(this.selectedFormGroup.controls['cashReceipts'].value) < cashReceiptsInPercent) {
        if (total > 30000000) {
          this.utilsService.showSnackBar('The overall turnover limit u/s 44AD exceeds.');
          return;
        }
      } else {
        if (total != 20000000) {
          this.utilsService.showSnackBar('The overall turnover limit u/s 44AD exceeds.');
          return;
        }
      }
    }
    let result = this.selectedFormGroup.getRawValue();

    if (this.activeIndex === -1) {
      let srn = (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray).length;
      let form = this.createBusIncomeForm(srn);
      form.patchValue(result);
      form.patchValue({ index: srn });
      (this.busIncomeForm.controls['busIncomeFormArray'] as FormArray).push(form);
    } else {
      (this.busIncomeForm.controls['busIncomeFormArray'] as UntypedFormGroup).controls[this.activeIndex].patchValue(result);
    }
    this.gridOptions.api?.setRowData(this.busIncomeFormArray.controls);
    this.activeIndex = -1;
    this.clearForm();
    this.cashPercentage = 0;
    this.bankPercentage = 0;
    this.bankPerWidth = 0;
    this.cashPerWidth = 0;
    this.anyOtherPerWidth = 0;
    this.anyOtherPerWidth = 0;
    // this.onContinue();
    this.utilsService.showSnackBar("Record saved successfully.");
  }

  editForm(event) {
    let i = event.rowIndex;
    this.selectedFormGroup.patchValue(
      ((this.busIncomeForm.controls['busIncomeFormArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).getRawValue());
    this.calculatePresumptiveIncome('cash', true);
    this.calculatePresumptiveIncome('bank', true);
    this.calculatePresumptiveIncome('anyOther', true);
    this.activeIndex = i;
    document.getElementById("business_id").scrollIntoView();
  }

  columnDef() {
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Nature Of Business',
        field: 'natureOfBusiness',
        width: 250,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
          let natureOfBusinessName;
          natureOfBusiness.forEach(element => {
            if (element.code === params.data.controls['natureOfBusiness'].value)
              natureOfBusinessName = element.label;
          });
          return natureOfBusinessName;
        },
        valueFormatter: function (params) {
          let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
          let natureOfBusinessName;
          natureOfBusiness.forEach(element => {
            if (element.code === params.data.controls['natureOfBusiness'].value)
              natureOfBusinessName = element.label;
          });
          return natureOfBusinessName;
        }
      },
      {
        headerName: 'Trade Name',
        field: 'tradeName',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['tradeName'].value;
        },
        valueFormatter: function (params) {
          const tradeName = params.data.controls['tradeName'].value;
          return `${tradeName}`;
        }
      },
      {
        headerName: 'Description',
        field: 'description',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['description'].value;
        },
        valueFormatter: function (params) {
          const description = params.data.controls['description'].value;
          return `${description}`;
        }
      },
      {
        headerName: 'Bank Receipts',
        field: 'bankReceipts',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          let bankReceipts = params.data.controls['bankReceipts'].value;
          return bankReceipts;
        },
        valueFormatter: function (params) {
          let bankReceipts = params.data.controls['bankReceipts'].value;
          return `₹ ${bankReceipts}`;
        }
      },
      {
        headerName: 'Bank Minimum Presumptive Income',
        field: 'bankMinIncome',
        width: 180,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          const bankMinIncome = Number(params.data.controls['bankMinIncome'].value)
          return bankMinIncome;
        },
        valueFormatter: function (params) {
          const bankMinIncome = Number(params.data.controls['bankMinIncome'].value)
          return `₹ ${bankMinIncome}`;
        }
      },
      {
        headerName: 'Bank presumptive income',
        field: 'bankPreIncome',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['bankPreIncome'].value;
        },
        valueFormatter: function (params) {
          const bankPreIncome = params.data.controls['bankPreIncome'].value;
          return `₹ ${bankPreIncome}`;
        }
      },
      {
        headerName: 'Cash Receipts',
        field: 'cashReceipts',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['cashReceipts'].value;
        },
        valueFormatter: function (params) {
          const cashReceipts = params.data.controls['cashReceipts'].value;
          return `₹ ${cashReceipts}`;
        }
      },
      {
        headerName: 'Cash Minimum Presumptive Income',
        field: 'cashMinIncome',
        width: 200,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let cashMinIncome = Number(params.data.controls['cashMinIncome'].value);
          return cashMinIncome;
        },
        valueFormatter: function (params) {
          let cashMinIncome = Number(params.data.controls['cashMinIncome'].value);
          return `₹ ${cashMinIncome}`;
        }
      },
      {
        headerName: 'Cash Presumptive Income',
        field: 'cashPreIncome',
        width: 200,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let cashPreIncome = Number(params.data.controls['cashPreIncome'].value);
          return cashPreIncome;
        },
        valueFormatter: function (params) {
          let cashPreIncome = Number(params.data.controls['cashPreIncome'].value);
          return `₹ ${cashPreIncome}`;
        }
      },
      {
        headerName: 'Any Other Mode',
        field: 'anyOtherMode',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['anyOtherMode'].value;
        },
        valueFormatter: function (params) {
          const anyOtherMode = params.data.controls['anyOtherMode'].value;
          return `₹ ${anyOtherMode}`;
        }
      },
      {
        headerName: 'Any Other Min Presumptive Income',
        field: 'anyOtherMinIncome',
        width: 200,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let anyOtherMinIncome = Number(params.data.controls['anyOtherMinIncome'].value);
          return anyOtherMinIncome;
        },
        valueFormatter: function (params) {
          let anyOtherMinIncome = Number(params.data.controls['anyOtherMinIncome'].value);
          return `₹ ${anyOtherMinIncome}`;
        }
      },
      {
        headerName: 'Any Other Presumptive Income',
        field: 'anyOtherPreIncome',
        width: 200,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let anyOtherPreIncome = Number(params.data.controls['anyOtherPreIncome'].value);
          return anyOtherPreIncome;
        },
        valueFormatter: function (params) {
          let anyOtherPreIncome = Number(params.data.controls['anyOtherPreIncome'].value);
          return `₹ ${anyOtherPreIncome}`;
        }
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-pencil" data-action-type="edit"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }
}
