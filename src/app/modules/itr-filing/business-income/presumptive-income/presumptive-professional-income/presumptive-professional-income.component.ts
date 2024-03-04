import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import {
  ITR_JSON,
  professionalIncome,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ProfessionalDialogComponent } from './professional-dialog/professional-dialog.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';

const professionalData: professionalIncome[] = [
  {
    natureOfBusiness: null,
    tradeName: null,
    receipts: null,
    presumptiveIncome: null,
  },
];
@Component({
  selector: 'app-presumptive-professional-income',
  templateUrl: './presumptive-professional-income.component.html',
  styleUrls: ['./presumptive-professional-income.component.scss'],
})
export class PresumptiveProfessionalIncomeComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  profIncomeForm: FormGroup;
  profIncomeFormArray: FormArray;
  professionalData: professionalIncome = {
    natureOfBusiness: null,
    tradeName: null,
    receipts: null,
    presumptiveIncome: null,
  };
  loading: boolean;
  natureOfBusinessList: any;
  config: any;
  amountFifty: number = 0;
  amountFiftyMax: number = 0;
  submitted = false;
  activeIndex: number;
  gridOptions: GridOptions;
  selectedFormGroup: FormGroup;
  @Output() presProfessionalSaved = new EventEmitter<boolean>();
  percentage = 0;
  minGrossIncome = (50 / 100) * 50;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
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
          this.profIncomeFormArray.controls.forEach((formGroup: FormGroup) => {
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
    this.config = {
      id: 'professionConfig',
      itemsPerPage: 2,
      currentPage: 1,
    };

    let profBusiness = this.ITR_JSON.business?.presumptiveIncomes?.filter(
      (acIncome) => acIncome.businessType === 'PROFESSIONAL'
    );

    this.profIncomeFormArray = new FormArray([]);
    let srn = this.profIncomeFormArray.controls.length > 0 ? this.profIncomeFormArray.controls.length : 0;
    this.selectedFormGroup = this.createProfIncomeForm(srn);
    this.activeIndex = -1;

    if (profBusiness && profBusiness.length > 0) {
      profBusiness.forEach((element, index) => {
        let form = this.createProfIncomeForm(index, element);
        this.profIncomeFormArray.push(form);
      });
    } else {
      // let form = this.createProfIncomeForm(0, null);
      // this.profIncomeFormArray.push(form);
    }
    this.profIncomeForm = this.fb.group({
      profIncomeFormArray: this.profIncomeFormArray,
    });

    this.profIncomeFormArray.controls.forEach((formgroup, index) => {
      // this.calculatePresumptive();
    });
  }

  get getProfIncomeArray() {
    return <FormArray>this.profIncomeForm.get('profIncomeFormArray');
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

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  // addProfIncomeForm() {
  //   if (this.profIncomeForm.valid) {
  //     this.submitted = false;
  //     let form = this.createProfIncomeForm(0, null);
  //     (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray).insert(0, form);
  //     this.percentage.unshift({ "natOfBusiness": "", "percentage": 0 });
  //   } else {
  //     this.submitted = true;
  //   }
  // }

  profSelected() {
    const profIncomeFormArray = <FormArray>(
      this.profIncomeForm?.get('profIncomeFormArray')
    );
    return (
      profIncomeFormArray.controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteArray() {
    // const profIncomeFormArray = <FormArray>this.profIncomeForm.get('profIncomeFormArray');
    // profIncomeFormArray.controls = profIncomeFormArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
    let array = <FormArray>this.profIncomeForm.get('profIncomeFormArray');
    array.controls = array.controls.filter(
      (element) => !(element as FormGroup).controls['hasEdit'].value
    );
    this.selectedFormGroup.reset();
    this.gridOptions?.api?.setRowData(this.profIncomeFormArray.controls);
    this.activeIndex = -1;
  }

  calculatePresumptive() {
    this.percentage = 0;
    // const profIncomeFormArray = <FormArray>(
    //   this.profIncomeForm.get('profIncomeFormArray')
    // );

    // for (let i = 0; i < profIncomeFormArray.length; i++) {
    const receipt = this.selectedFormGroup.controls['receipts'].value;
    const minimumPresumptiveIncome = this.selectedFormGroup.controls['minimumPresumptiveIncome'].value;
    const presumptiveIncome = this.selectedFormGroup.controls['presumptiveIncome'].value;
    const natOfBusiness = this.selectedFormGroup.controls['natureOfBusiness'].value;

    this.amountFifty = 0;
    this.amountFiftyMax = 0;
    this.amountFifty = this.selectedFormGroup.controls['receipts'].value;
    this.amountFiftyMax = this.selectedFormGroup.controls['receipts'].value;
    this.amountFifty = Math.round(Number((this.amountFifty / 100) * 50));

    this.selectedFormGroup.controls['minimumPresumptiveIncome'].setValue(this.amountFifty);

    // let PresumptiveIncome =
    //   presumptiveIncome.value !== ''
    //     ? parseFloat(presumptiveIncome.value)
    //     : 0;

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
    // console.log(
    //   this.percentage[0] === natOfBusiness ? this.percentage[1] : 0
    // );
    // }

    console.log(this.percentage);
  }

  dataSource = new MatTableDataSource<professionalIncome>();
  selection = new SelectionModel<professionalIncome>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  removeSelectedRows() {
    this.selection.selected.forEach((item) => {
      let index: number = this.dataSource.data.findIndex((d) => d === item);
      console.log(this.dataSource.data.findIndex((d) => d === item));
      this.dataSource.data.splice(index, 1);

      this.dataSource = new MatTableDataSource<professionalIncome>(
        this.dataSource.data
      );
    });
    this.selection = new SelectionModel<professionalIncome>(true, []);
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        let natureOfBusinessAll = result.natureOfBusiness;
        this.loading = false;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(natureOfBusinessAll)
        );
        this.natureOfBusinessList = natureOfBusinessAll.filter(
          (item: any) => item.section === '44ADA'
        );
        sessionStorage.setItem('MASTER', JSON.stringify(result));
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }


  createProfessionalColumnDef(natureOfBusinessList, rowsData) {
    return [
      {
        headerName: 'Nature of Profession',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 400,
        valueGetter: function nameFromCode(params) {
          console.log(natureOfBusinessList.length);
          let business = natureOfBusinessList.filter(
            (item) => item.code === params.data.natureOfBusiness
          );
          return business[0] ? business[0].label : null;
        },
      },

      {
        headerName: 'Trade Name',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 290,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName
            ? params.data.tradeName.toLocaleString('en-IN')
            : params.data.tradeName;
        },
      },

      {
        headerName: 'Gross Receipt',
        editable: false,
        field: 'receipts',
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.receipts
            ? params.data.receipts.toLocaleString('en-IN')
            : params.data.receipts;
        },
      },

      {
        headerName: 'presumptive Income min 50%',
        field: 'presumptiveIncome',
        editable: false,
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.presumptiveIncome
            ? params.data.presumptiveIncome.toLocaleString('en-IN')
            : params.data.presumptiveIncome;
        },
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 100,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button"  title="Update Bonds details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>
          <button type="button" class="action_icon add_button" title="Delete Bonds" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }


  addProfessionalRow(mode, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.dataSource.data.length;
    }
    const dialogRef = this.matDialog.open(ProfessionalDialogComponent, {
      data: {
        mode: mode,
        data: this.dataSource.data,
        natureList: this.dataSource.data,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.dataSource.data.push(result);
          this.dataSource = new MatTableDataSource(this.dataSource.data);
        }
      }
    });
  }

  editProfessionalRow(mode, data: any, index?) {
    const dialogRef = this.matDialog.open(ProfessionalDialogComponent, {
      data: {
        mode: mode,
        data: this.selection.selected[0],
        natureList: this.dataSource.data,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'EDIT') {
          let itemIndex = this.dataSource.data.findIndex(
            (item) => item.tradeName == this.selection.selected[0].tradeName
          );
          this.dataSource.data[itemIndex] = result;
          this.dataSource = new MatTableDataSource(this.dataSource.data);
          this.selection.clear();
        }
      }
    });
  }

  onContinue() {
    // form values
    let profBusinessFormIncome = (
      this.profIncomeForm.controls['profIncomeFormArray'] as FormArray
    ).getRawValue();

    let receiptsTotal = profBusinessFormIncome.reduce(
      (acc, value) => acc + parseFloat(value?.receipts),
      0
    );

    if (receiptsTotal > 5000000) {
      this.utilsService.showSnackBar(
        'Please make sure that the receipts total in Professional details is within the specified limit'
      );
      return;
    }
    this.loading = true;
    this.submitted = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.profIncomeForm.valid) {
      this.submitted = false;

      // all the arrays with type professional under presumptive income
      let profBusiness = this.ITR_JSON.business?.presumptiveIncomes;

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
    // (
    //   (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray)
    //     .controls[index] as FormGroup
    // ).controls['natureOfBusiness'].setValue(event);
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
      let srn = (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray).length;
      let form = this.createProfIncomeForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray).push(form);
    } else {
      (this.profIncomeForm.controls['profIncomeFormArray'] as FormGroup).controls[this.activeIndex].patchValue(result);
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
      ((this.profIncomeForm.controls['profIncomeFormArray'] as FormGroup).controls[i] as FormGroup).getRawValue());
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
