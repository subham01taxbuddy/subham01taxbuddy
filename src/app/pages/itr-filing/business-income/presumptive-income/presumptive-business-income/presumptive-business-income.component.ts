import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { businessIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { BusinessDialogComponent } from './business-dialog/business-dialog.component';

@Component({
  selector: 'app-presumptive-business-income',
  templateUrl: './presumptive-business-income.component.html',
  styleUrls: ['./presumptive-business-income.component.scss']
})
export class PresumptiveBusinessIncomeComponent implements OnInit {
  public businessGridOptions: GridOptions;
  businessData: businessIncome = {
    natureOfBusiness: null,
    tradeOfBusiness: null,
    receiptBank: null,
    income6: null,
    receiptMode: null,
    income8: null,
  }

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
  ) { }

  ngOnInit(): void {
    this.getBusinessTableData([]);
  }

  getBusinessTableData(rowsData) {
    this.businessGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createBusinessColumnDef(rowsData),
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

  createBusinessColumnDef(rowsData) {
    return [
      {
        headerName: 'Nature of Business',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 310,
        valueGetter: function nameFromCode(params) {
          return params.data.natureOfBusiness ? params.data.natureOfBusiness.toLocaleString('en-IN') : params.data.natureOfBusiness;
        },
      },

      {
        headerName: 'Trade of Business',
        field: 'tradeOfBusiness',
        editable: false,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeOfBusiness ? params.data.tradeOfBusiness.toLocaleString('en-IN') : params.data.tradeOfBusiness;
        },
      },

      {
        headerName: 'Gross turnover of the year-Received in bank',
        editable: false,
        // width: 340,
        children: [
          {
            headerName: 'Receipt received in bank',
            field: 'receiptBank',
            editable: false,
            width: 170,
            suppressMovable: true,
            valueGetter: function nameFromCode(params) {
              return params.data.receiptBank ? params.data.receiptBank.toLocaleString('en-IN') : params.data.receiptBank;
            },
          },
          {
            headerName: 'presumptive income at 6%',
            field: 'income6',
            editable: false,
            suppressMovable: true,
            suppressChangeDetection: true,
            width: 170,
          }
        ],
        suppressMovable: true,
      },

      {
        headerName: 'Gross turnover of the year-Received in any other mode',
        editable: false,
        // width: 340,
        children: [
          {
            headerName: 'Receipt received in any other mode',
            field: 'receiptMode',
            editable: false,
            width: 170,
            suppressMovable: true,
            valueGetter: function nameFromCode(params) {
              return params.data.receiptMode ? params.data.receiptMode.toLocaleString('en-IN') : params.data.receiptMode;
            },
          },
          {
            headerName: 'presumptive income at 8%',
            field: 'income8',
            editable: false,
            suppressMovable: true,
            suppressChangeDetection: true,
            width: 170,
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
      // data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(BusinessDialogComponent, {
      data: {
        mode: mode,
        data: data
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
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

  }
}
