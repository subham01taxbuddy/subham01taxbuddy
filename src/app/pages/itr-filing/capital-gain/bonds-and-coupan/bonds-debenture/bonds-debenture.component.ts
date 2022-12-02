import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditableCallbackParams, GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { CapitalGain, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDatePickerDirective } from '../mat-date-picker.directive';

@Component({
  selector: 'app-bonds-debenture',
  templateUrl: './bonds-debenture.component.html',
  styleUrls: ['./bonds-debenture.component.scss']
})
export class BondsDebentureComponent implements OnInit {
  public bondsGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  frameworkComponents;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {
    this.frameworkComponents = { datePicker: MatDatePickerDirective };
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.getTableData([]);

  }

  ngOnInit(): void {
    this.getTableData(this.createRowData());

  }
  getTableData(rowsData) {
    this.bondsGridOptions = <GridOptions>{
      rowData: this.createRowData(),
      columnDefs: this.createColumnDef(rowsData),
      onGridReady: () => {
        this.bondsGridOptions.api.sizeColumnsToFit();
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

  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.delete(params.rowIndex);
          break;
        }
        // case 'edit': {
        //   this.addRow('EDIT', params.data);
        //   break;
        // }
      }
    }
  }

  delete(index) {
    this.bondsGridOptions.rowData.splice(index, 1);
    this.bondsGridOptions.api.setRowData(this.bondsGridOptions.rowData);
  }


  addRow(mode, data) {
    // if (mode = 'EDIT') {
    //   this.bondsGridOptions.rowData.splice((data.id - 1), 1, this.createRowData());
    // }
    if (mode = 'ADD') {
      this.bondsGridOptions.rowData.push(this.createRowData());
    }
    this.bondsGridOptions.api.setRowData(this.bondsGridOptions.rowData);

    return;
  }

  createRowData() {
    return [
      {
        srNo: '', buyDate: new Date(), costOfAcquisition: '', costOfImprovement: '', saleDate: new Date(), saleValue: '', expenses: '', typeOfCapitalGain: '', totalCapitalGain: '', Actions: ''
      }
    ];
  }

  createColumnDef(rowsData) {
    return [

      {
        headerName: 'Sr. No',
        field: 'srNo',
        editable: true,
        suppressMovable: true,
        width: 50,
      },
      {
        headerName: 'Buy Date',
        field: 'buyDate',
        editable: true,
        width: 90,
        suppressMovable: true,
        cellEditor: "datePicker",
        cellRenderer: (params) => {
          return params.data.buyDate ? (new Date(params.data.buyDate)).toLocaleDateString('en-IN') : '';
        }
      },

      {
        headerName: 'Cost of Acquisition without indexation (Purchase value)',
        field: 'costOfAcquisition',
        suppressMovable: true,
        editable: true,
        width: 190,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfAcquisition ? params.data.costOfAcquisition.toLocaleString('en-IN') : params.data.costOfAcquisition;
        },
      },

      {
        headerName: 'Cost of improvement without indexation',
        field: 'costOfImprovement',
        editable: true,
        suppressMovable: true,
        width: 170,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfImprovement ? params.data.costOfImprovement.toLocaleString('en-IN') : params.data.costOfImprovement;
        },
      },
      {
        headerName: 'Sale Date',
        field: 'saleDate',
        editable: true,
        width: 90,
        suppressMovable: true,
        cellEditor: "datePicker",
        valueGetter: function nameFromCode(params) {
          return params.data.saleDate ? (new Date(params.data.saleDate)).toLocaleDateString('en-IN') : '';

        },
      },
      {
        headerName: 'Sale value/Full value consideration',
        field: 'saleValue',
        editable: true,
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.saleValue ? params.data.saleValue.toLocaleString('en-IN') : params.data.saleValue;
        },
      },
      {
        headerName: 'Expenses',
        field: 'expenses',
        editable: true,
        width: 120,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.expenses ? params.data.expenses.toLocaleString('en-IN') : params.data.expenses;
        },
      },
      {
        headerName: 'Type of capital gain',
        field: 'typeOfCapitalGain',
        editable: false,
        suppressMovable: true,
        suppressChangeDetection: true,
        width: 140,
        valueGetter: function nameFromCode(params: EditableCallbackParams) {
          var firstDate = moment(params.data.buyDate)
          var secondDate = moment(params.data.saleDate);
          let diffInMonths = Math.abs(firstDate.diff(secondDate, 'months'));
          console.log("diffInMonths", diffInMonths)
          if (diffInMonths >= 36) {
            params.data.typeOfCapitalGain = "LTCG"
          } else {
            params.data.typeOfCapitalGain = "STCG"

          }
          return params.data.typeOfCapitalGain
        },
      },
      {
        headerName: 'Total capital gain',
        field: 'totalCapitalGain',
        editable: true,
        width: 125,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalCapitalGain ? params.data.totalCapitalGain.toLocaleString('en-IN') : params.data.totalCapitalGain;
        },
      },
      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 80,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Delete Employer" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
          // <button type="button" class="action_icon add_button"  title = "Update Employer details" style = "border: none;
          // background: transparent; font - size: 16px; cursor: pointer; color: green">
          //   < i class="fa fa-pencil" aria - hidden="true" data - action - type="edit" > </i>
          //     < /button>
        },
      },
    ];
  }


}
