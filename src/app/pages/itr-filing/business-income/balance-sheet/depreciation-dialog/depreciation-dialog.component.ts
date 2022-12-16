import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { BusinessDescription, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddBalanceSheetComponent } from '../add-balance-sheet/add-balance-sheet.component';
@Component({
  selector: 'app-depreciation-dialog',
  templateUrl: './depreciation-dialog.component.html',
  styleUrls: ['./depreciation-dialog.component.scss']
})
export class DepreciationDialogComponent implements OnInit {
  public professionalGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  balanceData: BusinessDescription = {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    businessDescription: null,
  }

  commonForm: FormGroup;
  total1 = 0;
  total2 = 0;
  difference = 0;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: FormBuilder,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.getProfessionalTableData([]);
  }

  getProfessionalTableData(rowsData) {
    this.professionalGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createProfessionalColumnDef(rowsData),
      onGridReady: () => {
        this.professionalGridOptions.api.sizeColumnsToFit();
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

  createProfessionalColumnDef(rowsData) {
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


  public onProfessionalRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteProfession(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditProfessionalRow('EDIT', params.data, 'depreciation', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteProfession(index) {
    this.professionalGridOptions.rowData.splice(index, 1);
    this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
  }

  addEditProfessionalRow(mode, data: any, type, index?) {
    if (mode === 'ADD') {
      const length = this.professionalGridOptions.rowData.length;
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
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.professionalGridOptions.rowData.push(result);
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.professionalGridOptions.rowData[index] = result;
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
      }
    });

  }
}
