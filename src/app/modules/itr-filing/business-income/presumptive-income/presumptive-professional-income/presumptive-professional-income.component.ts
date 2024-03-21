import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ITR_JSON, professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
@Component({
  selector: 'app-presumptive-professional-income',
  templateUrl: './presumptive-professional-income.component.html',
  styleUrls: ['./presumptive-professional-income.component.scss'],
})
export class PresumptiveProfessionalIncomeComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  profIncomeForm: UntypedFormGroup;
  profIncomeFormArray: UntypedFormArray;
  loading: boolean;
  amountFifty: number = 0;
  amountFiftyMax: number = 0;
  submitted = false;
  activeIndex: number;
  gridOptions: GridOptions;
  selectedFormGroup: UntypedFormGroup;
  @Output() presProfessionalSaved = new EventEmitter<boolean>();
  percentage = 0;
  minGrossIncome = (50 / 100) * 50;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: UntypedFormBuilder
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
          this.profIncomeFormArray.controls
        );
      },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.profIncomeFormArray.controls.forEach((formGroup: UntypedFormGroup) => {
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
    let profBusiness = this.ITR_JSON.business?.presumptiveIncomes?.filter(
      (acIncome) => acIncome.businessType === 'PROFESSIONAL');
    this.profIncomeFormArray = new UntypedFormArray([]);
    let srn = this.profIncomeFormArray.controls.length > 0 ? this.profIncomeFormArray.controls.length : 0;
    this.selectedFormGroup = this.createProfIncomeForm(srn);
    this.activeIndex = -1;
    if (profBusiness && profBusiness.length > 0) {
      profBusiness.forEach((element, index) => {
        let form = this.createProfIncomeForm(index, element);
        this.profIncomeFormArray.push(form);
      });
    }
    this.profIncomeForm = this.fb.group({
      profIncomeFormArray: this.profIncomeFormArray,
    });
  }

  get getProfIncomeArray() {
    return <UntypedFormArray>this.profIncomeForm.get('profIncomeFormArray');
  }

  createProfIncomeForm(index, income?) {
    console.log(income?.incomes[index]?.receipts);
    console.log(income?.incomes[index]?.presumptiveIncome);

    let form = this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [income?.natureOfBusiness || null, [Validators.required]],
      tradeName: [income?.tradeName || null, [Validators.required]],
      description: [income?.description || null],
      receipts: [income?.incomes[0]?.receipts || 0, [Validators.required, Validators.max(5000000)],],
      presumptiveIncome: [income?.incomes[0]?.presumptiveIncome || 0, [Validators.required, Validators.min(this.amountFifty)]],
      minimumPresumptiveIncome: [income?.incomes[0]?.minimumPresumptiveIncome || 0],
    });
    return form;
  }

  profSelected() {
    const profIncomeFormArray = <UntypedFormArray>(
      this.profIncomeForm?.get('profIncomeFormArray')
    );
    return (
      profIncomeFormArray.controls.filter(
        (element) => (element as UntypedFormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteArray() {
    let array = <UntypedFormArray>this.profIncomeForm.get('profIncomeFormArray');
    array.controls = array.controls.filter((element) => !(element as UntypedFormGroup).controls['hasEdit'].value);
    this.selectedFormGroup.reset();
    this.gridOptions?.api?.setRowData(this.profIncomeFormArray.controls);
    this.activeIndex = -1;
  }

  calculatePresumptive() {
    this.percentage = 0;
    this.amountFifty = 0;
    this.amountFiftyMax = 0;
    this.amountFifty = this.selectedFormGroup.controls['receipts'].value;
    this.amountFiftyMax = this.selectedFormGroup.controls['receipts'].value;
    this.amountFifty = Math.round(Number((this.amountFifty / 100) * 50));
    this.selectedFormGroup.controls['minimumPresumptiveIncome'].setValue(this.amountFifty);

    if (this.selectedFormGroup.controls['presumptiveIncome'].value >= 0) {
      this.selectedFormGroup.controls['presumptiveIncome'].setValidators([
        Validators.required, Validators.min(this.amountFifty), Validators.max(this.amountFiftyMax)]);
      this.selectedFormGroup.controls['presumptiveIncome'].updateValueAndValidity();
    } else {
      this.selectedFormGroup.controls['presumptiveIncome'].clearValidators();
      this.selectedFormGroup.controls['presumptiveIncome'].updateValueAndValidity();
    }

    const percentage = Math.ceil(
      (parseFloat(this.selectedFormGroup.controls['presumptiveIncome'].value) * 100) / parseFloat(this.selectedFormGroup.controls['receipts'].value)
    );
    this.percentage = percentage;
  }

  dataSource = new MatTableDataSource<professionalIncome>();
  selection = new SelectionModel<professionalIncome>(true, []);

  onContinue() {
    let profBusinessFormIncome = (this.profIncomeForm.controls['profIncomeFormArray'] as UntypedFormArray).getRawValue();
    let receiptsTotal = profBusinessFormIncome.reduce((acc, value) => acc + parseFloat(value?.receipts), 0);

    if (receiptsTotal > 5000000) {
      this.utilsService.showSnackBar('Please make sure that the receipts total in Professional details is within the specified limit');
      return;
    }
    this.loading = true;
    this.submitted = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.profIncomeForm.valid) {
      this.submitted = false;
      // all the arrays with type professional under presumptive income
      // array that will be stored unde presumptive income
      let presBusinessIncome = [];
      // IF PROF INCOME FORM IS VALID
      profBusinessFormIncome?.forEach((element) => {
        let isAdded = false;
        presBusinessIncome.forEach((data) => {
          if (data.natureOfBusiness === element.natureOfBusiness) {
            isAdded = true;
            data.incomes.push({
              id: null,
              incomeType: 'PROFESSIONAL',
              receipts: element.receipts,
              presumptiveIncome: element.presumptiveIncome,
              periodOfHolding: null,
              minimumPresumptiveIncome: element.minimumPresumptiveIncome,
              registrationNo: null,
              ownership: null,
              tonnageCapacity: null,
            });
          }
        });

        if (!isAdded) {
          presBusinessIncome.push({
            id: null,
            businessType: 'PROFESSIONAL',
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
                incomeType: 'PROFESSIONAL',
                receipts: element.receipts,
                presumptiveIncome: element.presumptiveIncome,
                periodOfHolding: null,
                minimumPresumptiveIncome: element.minimumPresumptiveIncome,
                registrationNo: null,
                ownership: null,
                tonnageCapacity: null,
              },
            ],
          });
        }
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
          (item: any) => item.businessType !== 'PROFESSIONAL'
        );
        this.Copy_ITR_JSON.business.presumptiveIncomes =
          data.concat(presBusinessIncome);
      }
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.Copy_ITR_JSON));
      this.loading = false;
      this.presProfessionalSaved.emit(true);
    } else {
      const profIncomeArray = this.getProfIncomeArray;

      // check if any recipt or presumptive income is 0 and remove that
      profIncomeArray.controls.forEach((element, index) => {
        if (
          (element.value.receipts === 0 || element.value.receipts === '0') &&
          (element.value.presumptiveIncome === 0 ||
            element.value.presumptiveIncome === '0')
        ) {
          profIncomeArray.removeAt(index);
        }
      });

      // once removed check if all are not 0
      const allNonZero = profIncomeArray.controls.every((element) => {
        return (
          element.value.receipts !== 0 || element.value.presumptiveIncome !== 0
        );
      });

      //  if every value is non-zero then call function again
      if (allNonZero && this.profIncomeForm.valid) {
        this.onContinue();
        this.loading = false;
        this.utilsService.smoothScrollToTop();
        this.presProfessionalSaved.emit(true);
      } else {
        this.presProfessionalSaved.emit(false);
        this.loading = false;
      }
    }
  }

  businessClicked(event) {
    this.selectedFormGroup.controls['natureOfBusiness'].setValue(event);
  }


  clearForm() {
    this.selectedFormGroup.reset();
    this.calculatePresumptive();
  }

  saveManualEntry() {
    if (this.selectedFormGroup.invalid) {
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, 'accordBtn1');
      return;
    }

    let result = this.selectedFormGroup.getRawValue();

    if (this.activeIndex === -1) {
      let srn = (this.profIncomeForm.controls['profIncomeFormArray'] as UntypedFormArray).length;
      let form = this.createProfIncomeForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.profIncomeForm.controls['profIncomeFormArray'] as UntypedFormArray).push(form);
    } else {
      (this.profIncomeForm.controls['profIncomeFormArray'] as UntypedFormGroup).controls[this.activeIndex].patchValue(result);
    }
    this.gridOptions.api?.setRowData(this.profIncomeFormArray.controls);
    this.activeIndex = -1;
    this.clearForm();
    this.percentage = 0;
    this.utilsService.showSnackBar("Record saved successfully.");
  }

  editForm(event) {
    let i = event.rowIndex;
    this.selectedFormGroup.patchValue(
      ((this.profIncomeForm.controls['profIncomeFormArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).getRawValue());
    this.calculatePresumptive();
    this.activeIndex = i;
  }

  columnDef() {
    let self = this;
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
        headerName: 'Gross Receipts',
        field: 'receipts',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          let receipts = params.data.controls['receipts'].value;
          return receipts;
        },
        valueFormatter: function (params) {
          let receipts = params.data.controls['receipts'].value;
          return `₹ ${receipts}`;
        }
      },
      {
        headerName: 'Minimum Presumptive Income',
        field: 'minimumPresumptiveIncome',
        width: 180,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          const minimumPresumptiveIncome = Number(params.data.controls['minimumPresumptiveIncome'].value)
          return minimumPresumptiveIncome;
        },
        valueFormatter: function (params) {
          const minimumPresumptiveIncome = Number(params.data.controls['minimumPresumptiveIncome'].value)
          return `₹ ${minimumPresumptiveIncome}`;
        }
      },
      {
        headerName: 'Presumptive income',
        field: 'presumptiveIncome',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['presumptiveIncome'].value;
        },
        valueFormatter: function (params) {
          const presumptiveIncome = params.data.controls['presumptiveIncome'].value;
          return `₹ ${presumptiveIncome}`;
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
