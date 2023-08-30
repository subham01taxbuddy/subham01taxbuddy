import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
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

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );
    if (natureOfBusiness) {
      this.natureOfBusinessList = natureOfBusiness.filter(
        (item: any) => item.section === '44ADA'
      );
      console.log(this.natureOfBusinessList, 'natureOfbusinessList');
    } else {
      // this.getMastersData();
      // this.dataSource;
    }
  }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
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

    ///// OLD CODE
    // if (this.Copy_ITR_JSON.business?.presumptiveIncomes) {
    //   let incomeDetails;
    //   let data = this.Copy_ITR_JSON.business?.presumptiveIncomes?.filter(
    //     (item: any) => item.businessType === 'PROFESSIONAL'
    //   );
    //   if (data.length > 0) {
    //     let businessArray = [];
    //     data.forEach((obj: any) => {
    //       incomeDetails = obj.incomes;
    //       for (let i = 0; i < obj.incomes.length; i++) {
    //         incomeDetails[i].natureOfBusiness = obj.natureOfBusiness;
    //         incomeDetails[i].tradeName = obj.tradeName;
    //         businessArray.push(incomeDetails[i]);
    //       }
    //     });
    // this.getProfessionalTableData(businessArray);
    //   this.dataSource = new MatTableDataSource(businessArray);
    // } else {
    // this.getProfessionalTableData([]);
    // localStorage.setItem('data',JSON.stringify(professionalData));
    // var parsedData = JSON.parse(localStorage.getItem('data'));
    // this.dataSource = new MatTableDataSource(parsedData);
    //     this.dataSource = new MatTableDataSource(data);
    //   }
    // } else {
    // this.getProfessionalTableData([]);
    // localStorage.setItem('data',JSON.stringify(professionalData));
    // var parsedData = JSON.parse(localStorage.getItem('data'));
    // this.dataSource = new MatTableDataSource(parsedData);
    //   this.dataSource = new MatTableDataSource([]);
    // }
  }

  get getProfIncomeArray() {
    return <FormArray>this.profIncomeForm.get('profIncomeFormArray');
  }

  createProfIncomeForm(index, income) {
    console.log(income?.incomes[index]?.receipts);
    console.log(income?.incomes[index]?.presumptiveIncome);

    return this.fb.group({
      id: null,
      index: [index],
      hasEdit: [false],
      natureOfBusiness: [
        income?.natureOfBusiness || null,
        [Validators.required],
      ],
      tradeName: [income?.tradeName || null, [Validators.required]],
      receipts: [income?.incomes[0]?.receipts || null, [Validators.required]],
      presumptiveIncome: [
        income?.incomes[0]?.presumptiveIncome || null,
        [Validators.required],
      ],
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  addProfIncomeForm() {
    let form = this.createProfIncomeForm(0, null);
    (this.profIncomeForm.controls['profIncomeFormArray'] as FormArray).insert(
      0,
      form
    );
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
    profIncomeFormArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        profIncomeFormArray.removeAt(index);
      }
    });
  }

  ////// OLD CODE
  getBusinessName(data) {
    let business = this.natureOfBusinessList?.filter(
      (item: any) => item.code === data.natureOfBusiness
    );
    return business && business[0] ? (business[0] as any).label : null;
  }

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

  // public onProfessionalRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         this.deleteProfession(params.rowIndex);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addEditProfessionalRow('EDIT', params.data, params.rowIndex);
  //         break;
  //       }
  //     }
  //   }
  // }

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
          // this.professionalGridOptions.rowData.push(result);
          // this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
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
          // this.professionalGridOptions.rowData[index] = result;
          // this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
      }
    });
  }

  onContinue() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.profIncomeForm.valid) {
      // all the arrays with type professional under presumptive income
      let profBusiness = this.ITR_JSON.business?.presumptiveIncomes;

      // form values
      let profBusinessFormIncome =
        this.profIncomeForm.controls['profIncomeFormArray'].value;

      // array that will be stored unde presumptive income
      let presBusinessIncome = [];

      // IF PROF INCOME FORM IS VALID
      profBusinessFormIncome?.forEach((element) => {
        let isAdded = false;
        presBusinessIncome.forEach((data) => {
          if (data.natureOfBusiness == element.natureOfBusiness) {
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

      // check if business is present
      if (!this.Copy_ITR_JSON.business) {
        this.Copy_ITR_JSON.business = {
          presumptiveIncomes: [],
          profitLossACIncomes: [],
          financialParticulars: null,
          fixedAssetsDetails: [],
          businessDescription: [],
        };
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      }

      // check if presumptive income is present under business
      if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = [];
      }

      // if presumptive is present then check the length of presumptive
      if (!profBusiness || profBusiness.length === 0) {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      } else {
        this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome;
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'professional income added successfully'
          );
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add professional income, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.utilsService.showSnackBar(
        'Please check if all the professional income details are correct'
      );
      this.loading = false;
    }

    // let presBusinessIncome = [];
    // this.dataSource.data.forEach((element) => {
    //   let isAdded = false;
    //   presBusinessIncome.forEach((data) => {
    //     if (data.natureOfBusiness == element.natureOfBusiness) {
    //       isAdded = true;
    //       data.incomes.push({
    //         id: null,
    //         incomeType: 'PROFESSIONAL',
    //         receipts: element.receipts,
    //         presumptiveIncome: element.presumptiveIncome,
    //         periodOfHolding: null,
    //         minimumPresumptiveIncome: null,
    //         registrationNo: null,
    //         ownership: null,
    //         tonnageCapacity: null,
    //       });
    //     }
    //   });
    //   if (!isAdded) {
    //     presBusinessIncome.push({
    //       id: null,
    //       businessType: 'PROFESSIONAL',
    //       natureOfBusiness: element.natureOfBusiness,
    //       label: null,
    //       tradeName: element.tradeName,
    //       salaryInterestAmount: null,
    //       taxableIncome: null,
    //       exemptIncome: null,
    //       incomes: [
    //         {
    //           id: null,
    //           incomeType: 'PROFESSIONAL',
    //           receipts: element.receipts,
    //           presumptiveIncome: element.presumptiveIncome,
    //           periodOfHolding: null,
    //           minimumPresumptiveIncome: null,
    //           registrationNo: null,
    //           ownership: null,
    //           tonnageCapacity: null,
    //         },
    //       ],
    //     });
    //   }
    // });
  }
}
