import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridOptions } from 'ag-grid-community';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDatePickerDirective } from '../mat-date-picker.directive';

@Component({
  selector: 'app-add-deduction',
  templateUrl: './add-deduction.component.html',
  styleUrls: ['./add-deduction.component.scss']
})
export class AddDeductionComponent implements OnInit {
  public bondsGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  frameworkComponents;
  deduction = true;
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
      columnDefs: this.createColumnDef(),
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
        srNo: '', typeOfDeduction: 'Deduction 54F', purchaseDate: new Date(), costOfNewAsset: '', depositedAmount: '', deductionAmount: '', Actions: ''
      }
    ];
  }

  createColumnDef() {
    return [

      {
        headerName: 'Sr. No',
        field: 'srNo',
        editable: true,
        suppressMovable: true,
        width: 100,
      },


      {
        headerName: this.deduction ? 'Type of deduction *' : 'Type of deduction',
        field: 'typeOfDeduction',
        suppressMovable: true,
        editable: false,
        width: 190,
        valueGetter: function nameFromCode(params) {
          return params.data.typeOfDeduction ? params.data.typeOfDeduction.toLocaleString('en-IN') : params.data.typeOfDeduction;
        },
      },
      {
        headerName: this.deduction ? 'Purchase date of new asset *' : 'Purchase date of new asset',
        field: 'purchaseDate',
        editable: true,
        width: 200,
        suppressMovable: true,
        cellEditor: "datePicker",
        valueGetter: function nameFromCode(params) {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        },
      },

      {
        headerName: this.deduction ? 'Cost of new Asset *' : 'Cost of new Asset',
        field: 'costOfNewAsset',
        editable: true,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfNewAsset ? params.data.costOfNewAsset.toLocaleString('en-IN') : params.data.costOfNewAsset;
        },
      },

      {
        headerName: this.deduction ? 'Amount deposited in CGAS before due date *' : 'Amount deposited in CGAS before due date',
        field: 'depositedAmount',
        editable: true,
        width: 235,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depositedAmount ? params.data.depositedAmount.toLocaleString('en-IN') : params.data.depositedAmount;
        },
      },
      {
        headerName: 'Amount of deduction claimed',
        field: 'deductionAmount',
        editable: true,
        width: 200,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductionAmount ? params.data.deductionAmount.toLocaleString('en-IN') : params.data.deductionAmount;
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
        },
      },
    ];
  }

  updateColumn() {
    this.bondsGridOptions.api.setColumnDefs([

      {
        headerName: 'Sr. No',
        field: 'srNo',
        editable: true,
        suppressMovable: true,
        width: 100,
      },


      {
        headerName: this.deduction ? 'Type of deduction *' : 'Type of deduction',
        field: 'typeOfDeduction',
        suppressMovable: true,
        editable: false,
        width: 190,
        valueGetter: function nameFromCode(params) {
          return params.data.typeOfDeduction ? params.data.typeOfDeduction.toLocaleString('en-IN') : params.data.typeOfDeduction;
        },
      },
      {
        headerName: this.deduction ? 'Purchase date of new asset *' : 'Purchase date of new asset',
        field: 'purchaseDate',
        editable: true,
        width: 200,
        suppressMovable: true,
        cellEditor: "datePicker",
        valueGetter: function nameFromCode(params) {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        },
      },

      {
        headerName: this.deduction ? 'Cost of new Asset *' : 'Cost of new Asset',
        field: 'costOfNewAsset',
        editable: true,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfNewAsset ? params.data.costOfNewAsset.toLocaleString('en-IN') : params.data.costOfNewAsset;
        },
      },

      {
        headerName: this.deduction ? 'Amount deposited in CGAS before due date *' : 'Amount deposited in CGAS before due date',
        field: 'depositedAmount',
        editable: true,
        width: 235,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depositedAmount ? params.data.depositedAmount.toLocaleString('en-IN') : params.data.depositedAmount;
        },
      },
      {
        headerName: 'Amount of deduction claimed',
        field: 'deductionAmount',
        editable: true,
        width: 200,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductionAmount ? params.data.deductionAmount.toLocaleString('en-IN') : params.data.deductionAmount;
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
        },
      },
    ]);
  }
}
