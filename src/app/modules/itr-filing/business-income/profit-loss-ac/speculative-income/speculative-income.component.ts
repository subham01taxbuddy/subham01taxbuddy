import { Component, ElementRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITR_JSON, ProfitLossIncomes, } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-speculative-income',
  templateUrl: './speculative-income.component.html',
  styleUrls: ['./speculative-income.component.scss'],
})
export class SpeculativeIncomeComponent implements OnInit {
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  specIncomeFormArray: FormArray;
  specIncomeForm: UntypedFormGroup;
  gridOptions: GridOptions;
  selectedFormGroup: UntypedFormGroup;
  activeIndex: number;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
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
          this.specIncomeFormArray.controls
        );
      },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.specIncomeFormArray.controls.forEach((formGroup: UntypedFormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
      },
      sortable: true,
    };
  }

  ngOnInit(): void {
    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter((acIncome) => acIncome.businessType === 'SPECULATIVEINCOME')[0];
    this.specIncomeFormArray = new FormArray([]);
    let srn = this.specIncomeFormArray.controls.length > 0 ? this.specIncomeFormArray.controls.length : 0;
    this.selectedFormGroup = this.createSpecIncomeForm(srn);
    this.activeIndex = -1;

    if (specBusiness?.incomes.length) {
      let index = 0;
      for (let income of specBusiness.incomes) {
        let form = this.createSpecIncomeForm(index++, income);
        this.specIncomeFormArray.push(form);
      }
    }
    this.specIncomeForm = this.fb.group({
      specIncomesArray: this.specIncomeFormArray,
    });
    this.gridOptions.api?.setRowData(
      this.specIncomeFormArray.controls
    );
    this.calculateNetIncome();
  }

  updateData() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter((acIncome) => acIncome.businessType === 'SPECULATIVEINCOME')[0];
    if (specBusiness?.incomes.length) {
      let index = 0;
      for (let income of specBusiness.incomes) {
        let form = this.createSpecIncomeForm(index++, income);
        this.specIncomeFormArray.push(form);
      }
    }
    this.gridOptions.api?.setRowData(this.specIncomeFormArray.controls);
    this.calculateNetIncome();
  }

  get getIncomeArray() {
    return (this.specIncomeForm.get('specIncomesArray') as FormArray).controls;
  }

  createSpecIncomeForm(index?, income?: ProfitLossIncomes) {
    return this.fb.group({
      index: [index],
      hasEdit: [false],
      brokerName: [income?.brokerName ? income?.brokerName : 'Manual'],
      turnOver: [income?.turnOver],
      grossProfit: [income?.grossProfit],
      expenditure: [income?.expenditure],
      netIncome: [income ? (income?.netIncomeFromSpeculativeIncome) : 0],
    });
  }

  calculateNetIncome() {
    let turnover = this.selectedFormGroup.controls['turnOver'].value;
    let turnoverValue = parseFloat(this.selectedFormGroup?.controls['turnOver']?.value ?
      this.selectedFormGroup?.controls['turnOver']?.value : null);
    let grossProfitValue = parseFloat(this.selectedFormGroup?.controls['grossProfit']?.value
      ? this.selectedFormGroup?.controls['grossProfit']?.value : 0);
    let expenditureValue = parseFloat(this.selectedFormGroup?.controls['expenditure']?.value
      ? this.selectedFormGroup?.controls['expenditure']?.value : 0);
    this.selectedFormGroup.controls['netIncome'].setValue(grossProfitValue - expenditureValue);
    this.selectedFormGroup.controls['netIncome'].updateValueAndValidity();
    if (turnover && turnover.value == 0) {
      this.selectedFormGroup.controls['grossProfit'].setValidators([Validators.required, Validators.max(turnover.value)]);
      this.selectedFormGroup.controls['turnOver'].setValidators([Validators.required]);
      this.selectedFormGroup.controls['expenditure'].setValue(0);
      this.selectedFormGroup.controls['grossProfit'].setValue(0);
      this.selectedFormGroup.controls['netIncome'].setValue(0);
      this.selectedFormGroup.controls['netIncome'].updateValueAndValidity();
    }
    if (this.selectedFormGroup) {
      if (this.selectedFormGroup.controls['expenditure'].value && (!this.selectedFormGroup.controls['turnOver'].value || !this.selectedFormGroup.controls['grossProfit'].value)) {
        this.selectedFormGroup.controls['grossProfit'].setValidators([Validators.required, Validators.max(this.selectedFormGroup.controls['turnOver'].value)]);
        this.selectedFormGroup.controls['grossProfit'].updateValueAndValidity();
        this.selectedFormGroup.controls['turnOver'].setValidators([Validators.required]);
        this.selectedFormGroup.controls['turnOver'].updateValueAndValidity();
        this.selectedFormGroup.controls['turnOver'].markAllAsTouched();
        this.selectedFormGroup.controls['grossProfit'].markAllAsTouched();
      }
    }
    if (grossProfitValue > turnoverValue) {
      this.selectedFormGroup.controls['grossProfit'].setValidators([Validators.required, Validators.max(this.selectedFormGroup.controls['turnOver'].value)]);
      this.selectedFormGroup.controls['grossProfit'].updateValueAndValidity();
    } else if (grossProfitValue <= turnoverValue) {
      this.selectedFormGroup.controls['grossProfit'].setValidators([Validators.required]);
      this.selectedFormGroup.controls['grossProfit'].updateValueAndValidity();

    }
  }

  addSpecIncomeForm() {
    let form = this.createSpecIncomeForm(0, null);
    (this.specIncomeForm.controls['specIncomesArray'] as FormArray).insert(0, form);
  }

  onContinue() {
    this.calculateNetIncome();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter(
      (acIncome) => acIncome?.businessType === 'SPECULATIVEINCOME'
    );
    if (this.specIncomeForm.valid || !this.specIncomeForm.controls['specIncomesArray']['controls'].length) {
      let specBusinessIncome = {
        id: null,
        businessType: 'SPECULATIVEINCOME',
        incomes: this.specIncomeForm.controls['specIncomesArray'].value,
      };
      if (!this.Copy_ITR_JSON.business.profitLossACIncomes) {
        this.Copy_ITR_JSON.business.profitLossACIncomes = [];
      }
      if (!specBusiness || specBusiness?.length === 0) {
        this.Copy_ITR_JSON.business.profitLossACIncomes.push(
          specBusinessIncome
        );
      }

      if (specBusiness.length === 0) {
        specBusiness = this.Copy_ITR_JSON.business?.profitLossACIncomes?.filter(
          (acIncome) => acIncome?.businessType === 'SPECULATIVEINCOME'
        );
      }

      specBusiness[0].incomes = [];

      if (this.specIncomeForm?.controls['specIncomesArray'].value.length > 0) {
        (
          this.specIncomeForm?.controls['specIncomesArray'] as UntypedFormArray
        )?.controls?.forEach((form: UntypedFormGroup) => {
          specBusiness[0]?.incomes?.push(form?.value);
        });
      }

      console.log(specBusiness);
      let grossProfit = 0;
      let netIncome = 0;

      specBusiness[0]?.incomes?.forEach((element) => {
        grossProfit += element?.grossProfit;
        netIncome += element?.grossProfit - element?.expenditure;
      });
      console.log(grossProfit, netIncome, 'totalOfGP');

      specBusiness[0].totalgrossProfitFromSpeculativeIncome = grossProfit;
      specBusiness[0].netProfitfromSpeculativeIncome = netIncome;

      let index = this.Copy_ITR_JSON.business?.profitLossACIncomes?.findIndex(
        (item) => item?.businessType === 'SPECULATIVEINCOME'
      );

      if (this.specIncomeForm?.controls['specIncomesArray'].value.length > 0) {
        if (index || index === 0) {
          this.Copy_ITR_JSON.business.profitLossACIncomes[index] =
            specBusiness[0];
        } else {
          this.Copy_ITR_JSON.business.profitLossACIncomes?.push(specBusiness[0]);
        }
      } else {
        if (index || index === 0) {
          this.Copy_ITR_JSON.business.profitLossACIncomes.splice(index, 1);
        }
      }

      console.log(this.Copy_ITR_JSON);
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      return true;
    } else {
      //show errors
      $('input.ng-invalid').first().focus();
      this.utilsService.highlightInvalidFormFields(this.specIncomeForm, 'accordBtn', this.elementRef);
      return false;
    }
  }

  specSelected() {
    const specIncomesArray = <FormArray>(this.specIncomeForm.get('specIncomesArray'));
    return (
      specIncomesArray.controls.filter(
        (element) => (element as UntypedFormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteArray() {
    let array = <FormArray>this.specIncomeForm.get('specIncomesArray');
    array.controls = array.controls.filter(
      (element) => !(element as UntypedFormGroup).controls['hasEdit'].value
    );
    this.selectedFormGroup.reset();
    this.gridOptions?.api?.setRowData(this.specIncomeFormArray.controls);
    this.activeIndex = -1;
  }

  clearForm() {
    this.selectedFormGroup.reset();
    this.selectedFormGroup.controls['brokerName'].setValue('Manual');
  }

  saveManualEntry() {
    if (this.selectedFormGroup.invalid) {
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, 'accordBtn1', this.elementRef);
      return;
    }

    let result = this.selectedFormGroup.getRawValue();
    if (this.activeIndex === -1) {
      let srn = (this.specIncomeForm.controls['specIncomesArray'] as FormArray).length;
      let form = this.createSpecIncomeForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.specIncomeForm.controls['specIncomesArray'] as FormArray).push(form);
    } else {
      (this.specIncomeForm.controls['specIncomesArray'] as UntypedFormGroup).controls[this.activeIndex].patchValue(result);
    }
    this.gridOptions.api?.setRowData(this.specIncomeFormArray.controls);
    this.activeIndex = -1;
    this.clearForm();
    this.utilsService.showSnackBar("Record saved successfully.");
  }

  editForm(event) {
    let i = event.rowIndex;
    this.selectedFormGroup.patchValue(
      ((this.specIncomeForm.controls['specIncomesArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).getRawValue());
    this.calculateNetIncome();
    this.activeIndex = i;
    document.getElementById("speculative_id").scrollIntoView();
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
        headerName: 'Broker Name',
        field: 'brokerName',
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
          return params.data.controls['brokerName'].value;
        },
        valueFormatter: function (params) {
          const brokerName = params.data.controls['brokerName'].value;
          return brokerName;
        }
      },
      {
        headerName: 'Turnover',
        field: 'turnOver',
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
          return params.data.controls['turnOver'].value;
        },
        valueFormatter: function (params) {
          const turnOver = params.data.controls['turnOver'].value;
          return `₹ ${turnOver}`;
        }
      },
      {
        headerName: 'Gross Profit',
        field: 'grossProfit',
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
          return params.data.controls['grossProfit'].value;
        },
        valueFormatter: function (params) {
          const grossProfit = params.data.controls['grossProfit'].value;
          return `₹ ${grossProfit}`;
        }
      },
      {
        headerName: 'Expenditure',
        field: 'expenditure',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['expenditure'].value;
        },
        valueFormatter: function (params) {
          const expenditure = params.data.controls['expenditure'].value;
          return `₹ ${expenditure}`;
        }
      },
      {
        headerName: 'Net Income',
        field: 'netIncome',
        width: 180,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          const netIncome = Number(params.data.controls['grossProfit'].value) - Number(params.data.controls['expenditure'].value)
          return netIncome;
        },
        valueFormatter: function (params) {
          const netIncome = Number(params.data.controls['grossProfit'].value) - Number(params.data.controls['expenditure'].value)
          return `₹ ${netIncome}`;
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
