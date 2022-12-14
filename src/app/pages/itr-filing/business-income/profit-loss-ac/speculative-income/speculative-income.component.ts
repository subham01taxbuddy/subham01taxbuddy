import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { businessIncome, professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ProfessionalDialogComponent } from '../../presumptive-income/presumptive-professional-income/professional-dialog/professional-dialog.component';

@Component({
  selector: 'app-speculative-income',
  templateUrl: './speculative-income.component.html',
  styleUrls: ['./speculative-income.component.scss']
})
export class SpeculativeIncomeComponent implements OnInit {
  public professionalGridOptions: GridOptions;
  professionalData: professionalIncome = {
    natureOfBusiness: null,
    tradeName: null,
    receipts: null,
    presumptiveIncome: null,
  }

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
  ) { }

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
        headerName: 'Turnover from speculative activity',
        field: 'natureOfProfession',
        suppressMovable: true,
        editable: false,
        width: 400,
        valueGetter: function nameFromCode(params) {
          return params.data.natureOfProfession ? params.data.natureOfProfession.toLocaleString('en-IN') : params.data.natureOfProfession;
        },
      },

      {
        headerName: 'Gross Profit',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 290,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName ? params.data.tradeName.toLocaleString('en-IN') : params.data.tradeName;
        },
      },

      {
        headerName: 'Expenditure, if any',
        editable: false,
        field: 'grossReceipts',
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.grossReceipts ? params.data.grossReceipts.toLocaleString('en-IN') : params.data.grossReceipts;
        },
      },

      {
        headerName: 'Net income from speculative income',
        field: 'presumptiveIncome',
        editable: false,
        width: 250,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.presumptiveIncome ? params.data.presumptiveIncome.toLocaleString('en-IN') : params.data.presumptiveIncome;
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
          this.addEditProfessionalRow('EDIT', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  deleteProfession(index) {
    this.professionalGridOptions.rowData.splice(index, 1);
    this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
  }

  addEditProfessionalRow(mode, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.professionalGridOptions.rowData.length;
      // data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(ProfessionalDialogComponent, {
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

  onContinue() {

  }
}
