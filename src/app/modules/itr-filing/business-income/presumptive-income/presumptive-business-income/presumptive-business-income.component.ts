import { data } from 'jquery';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { businessIncome, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { BusinessDialogComponent } from './business-dialog/business-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

const businessData: businessIncome[] = [{
  id: null,
  natureOfBusiness: null,
  tradeName: null,
  receipts: null,
  presumptiveIncome: null,
  periodOfHolding: null,
  minimumPresumptiveIncome: null,
}]

@Component({
  selector: 'app-presumptive-business-income',
  templateUrl: './presumptive-business-income.component.html',
  styleUrls: ['./presumptive-business-income.component.scss']
})
export class PresumptiveBusinessIncomeComponent implements OnInit {
  public businessGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  businessData: businessIncome = {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    receipts: null,
    presumptiveIncome: null,
    periodOfHolding: null,
    minimumPresumptiveIncome: null,
  }
  loading: boolean;
  natureOfBusinessList: [];

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
    if (natureOfBusiness) {
      this.natureOfBusinessList = natureOfBusiness.filter((item: any) => item.section === '44AD');
    } else {
      this.getMastersData();
    }
    
  }

  ngOnInit(): void {
    if (this.Copy_ITR_JSON.business.presumptiveIncomes) {
      let incomeDetails;
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType === "BUSINESS");
      if (data.length > 0) {
        // let businessArray = [];
        // data.forEach((obj: any) => {
        //   incomeDetails = obj.incomes;
        //   for (let i = 0; i < obj.incomes.length; i++) {
        //     incomeDetails[i].natureOfBusiness = obj.natureOfBusiness;
        //     incomeDetails[i].tradeName = obj.tradeName;
        //     businessArray.push(incomeDetails[i]);
        //   }
        // });
        this.getBusinessTableData(data);
      }
      else {
        this.getBusinessTableData([]);
      }
    } else {
      this.getBusinessTableData([]);
    }
  }

//   displayedColumns: string[] = ['select','Profession', 'TradeName', 'BusinessDescription'];
//   dataSource = new MatTableDataSource<businessIncome>(businessData);
//   selection = new SelectionModel<businessIncome>(true, []);
  
//   isAllSelected() {
//     const numSelected = this.selection.selected.length;
//     const numRows = this.dataSource.data.length;
//     return numSelected === numRows;
//   }
  
//   masterToggle() {
//     this.isAllSelected() ?
//         this.selection.clear() :
//         this.dataSource.data.forEach(row => this.selection.select(row));
//   }
//   removeSelectedRows() {
//     this.selection.selected.forEach(item => {
//      let index: number = this.dataSource.data.findIndex(d => d === item);
//      console.log(this.dataSource.data.findIndex(d => d === item));
//      this.dataSource.data.splice(index,1);

//      this.dataSource = new MatTableDataSource<businessIncome>(this.dataSource.data);
//    });
//    this.selection = new SelectionModel<businessIncome>(true, []);
//  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      let natureOfBusinessAll = result.natureOfBusiness;
      this.loading = false;
      sessionStorage.setItem('NATURE_OF_BUSINESS', JSON.stringify(natureOfBusinessAll));
      this.natureOfBusinessList = natureOfBusinessAll.filter((item: any) => item.section === '44AD');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to get nature of Business list, please try again.');
      this.utilsService.smoothScrollToTop();

    });
  }

  getBusinessTableData(rowsData) {
    this.businessGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createBusinessColumnDef(this.natureOfBusinessList, rowsData),
      onGridReady: () => {
        this.businessGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false
      },
      suppressRowTransform: true
    };
  }

  createBusinessColumnDef(natureOfBusinessList, rowsData) {
    return [
      {
        headerName: 'Nature of Business',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 310,
        valueGetter: function nameFromCode(params) {
          console.log(natureOfBusinessList.length);
          let business = natureOfBusinessList.filter(item => item.code === params.data.natureOfBusiness);
          return business[0] ? business[0].label : null;
        },
      },
      {
        headerName: 'Trade of Business',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName ? params.data.tradeName.toLocaleString('en-IN') : params.data.tradeName;
        },
      },
      {
        headerName: 'Gross turnover of the year-Received in bank',
        editable: false,
        children: [
          {
            headerName: 'Receipt received in bank',
            field: 'receipts',
            editable: false,
            width: 170,
            suppressMovable: true,
            valueGetter: function nameFromCode(params) {
              console.log('receipts', params.data.incomes);
              let bank = params.data.incomes.filter(item => (item.incomeType === 'BANK'));
              return bank[0] ? bank[0].receipts : null;
            },
          },
          {
            headerName: 'presumptive income at 6%',
            field: 'presumptiveIncome',
            editable: false,
            suppressMovable: true,
            suppressChangeDetection: true,
            width: 170,
            valueGetter: function nameFromCode(params) {
              let bank = params.data.incomes.filter(item => (item.incomeType === 'BANK'));
              return bank[0] ? bank[0].presumptiveIncome : null;
            },
          }
        ],
        suppressMovable: true,
      },
      {
        headerName: 'Gross turnover of the year-Received in any other mode',
        editable: false,
        children: [
          {
            headerName: 'Receipt received in any other mode',
            // field: 'periodOfHolding',
            editable: false,
            width: 170,
            suppressMovable: true,
            valueGetter: function nameFromCode(params) {
              let cash = params.data.incomes.filter(item => (item.incomeType === 'CASH'));
              return cash[0] ? cash[0].receipts.toLocaleString('en-IN') : null;
            },
          },
          {
            headerName: 'presumptive income at 8%',
            // field: 'minimumPresumptiveIncome',
            editable: false,
            suppressMovable: true,
            suppressChangeDetection: true,
            width: 170,
            valueGetter: function nameFromCode(params) {
              let cash = params.data.incomes.filter(item => (item.incomeType === 'CASH'));
              return cash[0] ? cash[0].presumptiveIncome.toLocaleString('en-IN') : null;
            },
          }
        ],
        suppressMovable: true,
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

  public onBusinessRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteBusiness(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditBusinessRow('EDIT', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  deleteBusiness(index) {
    this.businessGridOptions.rowData.splice(index, 1);
    this.businessGridOptions.api.setRowData(this.businessGridOptions.rowData);
  }

  addEditBusinessRow(mode, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.businessGridOptions.rowData.length;
    }

    const dialogRef = this.matDialog.open(BusinessDialogComponent, {
      data: {
        mode: mode,
        data: this.businessGridOptions.rowData[index],
        natureList: this.businessGridOptions.rowData,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.businessGridOptions.rowData.push(result);
          this.businessGridOptions.api.setRowData(this.businessGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.businessGridOptions.rowData[index] = result;
          this.businessGridOptions.api.setRowData(this.businessGridOptions.rowData);
        }
      }
    });
  }

  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    // let presBusinessIncome = [];
    // this.businessGridOptions.rowData.forEach(element => {
    //   let isAdded = false;
    //   presBusinessIncome.forEach(data => {
    //     if (data.natureOfBusiness == element.natureOfBusiness) {
    //       isAdded = true;
    //       data.incomes.push({
    //         "id": element.id,
    //         "incomeType": "BUSINESS",
    //         "receipts": element.receipts,
    //         "presumptiveIncome": element.presumptiveIncome,
    //         "periodOfHolding": element.periodOfHolding,
    //         "minimumPresumptiveIncome": element.minimumPresumptiveIncome,
    //         "registrationNo": null,
    //         "ownership": null,
    //         "tonnageCapacity": null
    //       });
    //     }
    //   });
    //   if (!isAdded) {
    //     presBusinessIncome.push({
    //       "id": element.id,
    //       "businessType": "BUSINESS",
    //       "natureOfBusiness": element.natureOfBusiness,
    //       "label": null,
    //       "tradeName": element.tradeName,
    //       "salaryInterestAmount": null,
    //       "taxableIncome": null,
    //       "exemptIncome": null,
    //       "incomes": [{
    //         "id": element.id,
    //         "incomeType": "BUSINESS",
    //         "receipts": element.receipts,
    //         "presumptiveIncome": element.presumptiveIncome,
    //         "periodOfHolding": element.periodOfHolding,
    //         "minimumPresumptiveIncome": element.minimumPresumptiveIncome,
    //         "registrationNo": null,
    //         "ownership": null,
    //         "tonnageCapacity": null
    //       }]
    //     });
    //   };
    // });
    // console.log("presBusinessIncome", presBusinessIncome)

    if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
      this.Copy_ITR_JSON.business.presumptiveIncomes = this.businessGridOptions.rowData;
    } else {
      let data = this.Copy_ITR_JSON.business.presumptiveIncomes.filter((item: any) => item.businessType != "BUSINESS");
      this.Copy_ITR_JSON.business.presumptiveIncomes = (data).concat(this.businessGridOptions.rowData)
    }
    console.log(this.Copy_ITR_JSON);

    this.utilsService.saveItrObject( this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.loading = false;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Business income added successfully');
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add business income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
