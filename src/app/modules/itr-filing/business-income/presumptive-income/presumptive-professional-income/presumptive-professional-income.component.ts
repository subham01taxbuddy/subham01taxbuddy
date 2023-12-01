import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GridOptions } from 'ag-grid-community';
import {
  ITR_JSON,
  professionalIncome,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ProfessionalDialogComponent } from './professional-dialog/professional-dialog.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  public professionalGridOptions: GridOptions;
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
  @Output() presProfessionalSaved = new EventEmitter<boolean>();
  percentage: any[] = [];

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit(): void {
    this.config = {
      id: 'professionConfig',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: 0,
    };

    let profBusiness = this.ITR_JSON.business?.presumptiveIncomes?.filter(
      (acIncome) => acIncome.businessType === 'PROFESSIONAL'
    );

    this.profIncomeFormArray = new FormArray([]);
    if (profBusiness && profBusiness.length > 0) {
      profBusiness.forEach((element, index) => {
        let form = this.createProfIncomeForm(index, element);
        this.profIncomeFormArray.push(form);
      });
    } else {
      let form = this.createProfIncomeForm(0, null);
      this.profIncomeFormArray.push(form);
    }
    this.profIncomeForm = this.fb.group({
      profIncomeFormArray: this.profIncomeFormArray,
    });

    this.profIncomeFormArray.controls.forEach((formgroup, index) => {
      this.calculatePresumptive(null, index, false);
    });
    this.config.totalItems = this.profIncomeFormArray.controls.length;
  }

  get getProfIncomeArray() {
    return <FormArray>this.profIncomeForm.get('profIncomeFormArray');
  }

  createProfIncomeForm(index, income) {
    console.log(income?.incomes[index]?.receipts);
    console.log(income?.incomes[index]?.presumptiveIncome);

    let form = this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [
        income?.natureOfBusiness || null,
        [Validators.required],
      ],
      tradeName: [income?.tradeName || null, [Validators.required]],
      description: [income?.description || null],
      receipts: [
        income?.incomes[0]?.receipts || 0,
        [Validators.required, Validators.max(5000000)],
      ],
      presumptiveIncome: [
        income?.incomes[0]?.presumptiveIncome || 0,
        [Validators.required, Validators.min(this.amountFifty)],
      ],
      minimumPresumptiveIncome: [
        income?.incomes[0]?.minimumPresumptiveIncome || 0,
      ],
    });
    return form;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  addProfIncomeForm() {
    if (this.profIncomeForm.valid) {
      this.submitted = false;
      let form = this.createProfIncomeForm(0, null);
      (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray).insert(
        0,
        form
      );
    } else {
      this.submitted = true;
    }
  }

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
    const profIncomeFormArray = <FormArray>(
      this.profIncomeForm.get('profIncomeFormArray')
    );
    profIncomeFormArray.controls = profIncomeFormArray.controls.filter(
      (element) => !(element as FormGroup).controls['hasEdit'].value
    );
    this.config.totalItems = profIncomeFormArray.controls.length;
  }

  calculatePresumptive(event, index, setValue?) {
    this.percentage = [];
    const profIncomeFormArray = <FormArray>(
      this.profIncomeForm.get('profIncomeFormArray')
    );

    for (let i = 0; i < profIncomeFormArray.length; i++) {
      const receipt = (profIncomeFormArray.at(i) as FormGroup).get('receipts');
      const minimumPresumptiveIncome = (
        profIncomeFormArray.at(i) as FormGroup
      ).get('minimumPresumptiveIncome');
      const presumptiveIncome = (profIncomeFormArray.at(i) as FormGroup).get(
        'presumptiveIncome'
      );
      const natOfBusiness = (profIncomeFormArray.at(i) as FormGroup).get(
        'natureOfBusiness'
      ).value;

      this.amountFifty = 0;
      this.amountFiftyMax = 0;
      this.amountFifty = receipt?.value;
      this.amountFiftyMax = receipt?.value;
      this.amountFifty = Math.round(Number((this.amountFifty / 100) * 50));

      minimumPresumptiveIncome?.setValue(this.amountFifty);

      let PresumptiveIncome =
        presumptiveIncome.value !== ''
          ? parseFloat(presumptiveIncome.value)
          : 0;

      if (PresumptiveIncome || PresumptiveIncome === 0) {
        presumptiveIncome?.setValidators([
          Validators.required,
          Validators.min(this.amountFifty),
          Validators.max(this.amountFiftyMax),
        ]);
        presumptiveIncome.updateValueAndValidity();
      } else {
        presumptiveIncome.clearValidators();
        presumptiveIncome.updateValueAndValidity();
      }

      const percentage = Math.ceil(
        (parseFloat(presumptiveIncome.value) * 100) / parseFloat(receipt.value)
      );
      this.percentage.push({ natOfBusiness, percentage });
      console.log(
        this.percentage[0] === natOfBusiness ? this.percentage[1] : 0
      );
    }

    console.log(this.percentage);
  }

  ////// OLD CODE
  // getBusinessName(data) {
  //   let business = this.natureOfBusinessList?.filter(
  //     (item: any) => item.code === data.natureOfBusiness
  //   );
  //   return business && business[0] ? (business[0] as any).label : null;
  // }

  displayedColumns: string[] = [
    'select',
    'natureOfBusiness',
    'tradeName',
    'receipts',
    'presumptiveIncome',
  ];
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

  getProfessionalTableData(rowsData) {
    this.professionalGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createProfessionalColumnDef(
        this.natureOfBusinessList,
        rowsData
      ),
      onGridReady: () => {
        this.professionalGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false,
      },
      suppressRowTransform: true,
    };
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

  deleteProfession(index) {
    this.professionalGridOptions.rowData.splice(index, 1);
    this.professionalGridOptions.api.setRowData(
      this.professionalGridOptions.rowData
    );
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
    this.loading = true;
    this.submitted = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.profIncomeForm.valid) {
      this.submitted = false;

      // all the arrays with type professional under presumptive income
      let profBusiness = this.ITR_JSON.business?.presumptiveIncomes;

      // form values
      let profBusinessFormIncome = (
        this.profIncomeForm.controls['profIncomeFormArray'] as FormArray
      ).getRawValue();

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
              minimumPresumptiveIncome: null,
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
                minimumPresumptiveIncome: null,
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

  businessClicked(event, index) {
    //this.profIncomeForm.controls['profIncomeFormArray'].controls[0].controls['natureOfBusiness'].value
    (
      (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray)
        .controls[index] as FormGroup
    ).controls['natureOfBusiness'].setValue(event);
  }
}
