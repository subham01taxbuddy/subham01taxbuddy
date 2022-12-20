import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { FixedAssetsDetails, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddBalanceSheetComponent } from '../add-balance-sheet/add-balance-sheet.component';
@Component({
  selector: 'app-depreciation-dialog',
  templateUrl: './depreciation-dialog.component.html',
  styleUrls: ['./depreciation-dialog.component.scss']
})
export class DepreciationDialogComponent implements OnInit {
  public depreciationGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  depreciationData: FixedAssetsDetails = {
    id: null,
    assetType: null,
    description: null,
    bookValue: null,
    depreciationRate: null,
    depreciationAmount: null,
    fixedAssetClosingAmount: null,
  }

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<DepreciationDialogComponent>,

  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.getDepreciationTableData([]);
  }

  getDepreciationTableData(rowsData) {
    this.depreciationGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createDepreciationColumnDef(rowsData),
      onGridReady: () => {
        this.depreciationGridOptions.api.sizeColumnsToFit();
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

  createDepreciationColumnDef(rowsData) {
    return [
      {
        headerName: 'Description *',
        field: 'description',
        suppressMovable: true,
        editable: false,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.description ? params.data.description.toLocaleString('en-IN') : params.data.description;
        },
      },

      {
        headerName: 'Asset Type *',
        field: 'assetType',
        suppressMovable: true,
        editable: false,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.assetType ? params.data.assetType.toLocaleString('en-IN') : params.data.assetType;
        },
      },

      {
        headerName: 'Book Value *',
        field: 'bookValue',
        editable: false,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.bookValue ? params.data.bookValue.toLocaleString('en-IN') : params.data.bookValue;
        },
      },

      {
        headerName: 'Depreciation Rate *',
        editable: false,
        field: 'depreciationRate',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depreciationRate ? params.data.depreciationRate.toLocaleString('en-IN') : params.data.depreciationRate;
        },
      },
      {
        headerName: 'Depreciation Amount',
        editable: false,
        field: 'depreciationAmount',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.depreciationAmount ? params.data.depreciationAmount.toLocaleString('en-IN') : params.data.depreciationAmount;
        },
      },
      {
        headerName: 'Closing Fixed Asset Amount',
        editable: false,
        field: 'fixedAssetClosingAmount',
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.fixedAssetClosingAmount ? params.data.fixedAssetClosingAmount.toLocaleString('en-IN') : params.data.fixedAssetClosingAmount;
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


  public onDepreciationRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteDepreciation(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addDepreciationRow('EDIT', params.data, 'depreciation', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteDepreciation(index) {
    this.depreciationGridOptions.rowData.splice(index, 1);
    this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
  }

  addDepreciationRow(mode, data: any, type, index?) {
    if (mode === 'ADD') {
      const length = this.depreciationGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(AddBalanceSheetComponent, {
      data: {
        mode: mode,
        data: data,
        type: type
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('DepreciationDialogData=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.depreciationGridOptions.rowData.push(result);
          this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.depreciationGridOptions.rowData[index] = result;
          this.depreciationGridOptions.api.setRowData(this.depreciationGridOptions.rowData);
        }
      }
    });

  }
  closeDepreciationDialog() {
    this.dialogRef.close(this.depreciationGridOptions.rowData);
  }
}
