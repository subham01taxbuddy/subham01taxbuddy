import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { GridOptions } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit {
  rowHeight: number;
  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog) {
    this.rowHeight = 50;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.getTableData();
  }
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  public scheduleCFLLoss: GridOptions;

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
  }

  canDeactivate() {
    return true;
  }

  CreateColumnDef() {
    return [
      {
        headerName: 'Assessment Year',
        field: 'AssessmentYear',
        editable: false,
        suppressMovable: true,
        pinned: 'left',
        width: 150,
      },
      {
        headerName: 'Date of Filing',
        field: 'DOF',
        editable: true,
        suppressMovable: true,
      },

      {
        headerName: 'House property Loss',
        field: 'HPL',
        suppressMovable: true,
        editable: true,
      },

      {
        headerName: 'Loss from business other than loss from speculative business and specified business',
        editable: false,
        children: [
          {
            headerName: 'a. Brought Forward Business Loss',
            field: 'FBL',
            editable: false,
            suppressMovable: true,
          },
          {
            headerName: 'b. Amount as adjusted on account of opting for taxation u/s 115BAC',
            field: 'taxation',
            editable: false,
            width: 300,
            suppressMovable: true,
          },

          {
            headerName: 'c. Brought forward Business loss available for set off during the year [c=a-b]',
            field: 'FBLDuringYear',
            suppressMovable: true,
            editable: false,
            width: 300,
          }
        ],
        suppressMovable: true,
      },
      {
        headerName: 'Short Term Capital Loss',
        field: 'STCL',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Long Term Capital Loss',
        field: 'LTCL',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Loss from Speculative Business',
        field: 'LFSB',
        editable: false,
        suppressMovable: true,
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: { textAlign: 'center' }
      }
    ];
  }

  getTableData() {
    this.scheduleCFLLoss = <GridOptions>{
      rowData: this.getRowData(),
      columnDefs: this.CreateColumnDef(),
      onGridReady: () => {
        this.scheduleCFLLoss.api.sizeColumnsToFit();
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

  getRowData() {
    return [
      { AssessmentYear: '2014-15', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2015-16', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2016-17', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2017-18', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2018-19', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2019-20', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2020-21', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2021-22', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: 'Total of earlier year losses', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: 'Adjustment of above losses in schedule BFLA', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: '2022-23 (Current Year Losses)', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
      { AssessmentYear: 'Total Loss carried forward to future years', DOF: '', HPL: '', FBL: '', taxation: '', FBLDuringYear: '', STCL: '', LTCL: '', LFSB: '', Actions: '' },
    ];
  }


  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.delete(params.rowIndex);
          break;
        }

      }
    }
  }


  delete(index) {
    this.scheduleCFLLoss.rowData.splice(index, 1);
    this.scheduleCFLLoss.api.setRowData(this.scheduleCFLLoss.rowData);

  }

  continue() {
  }
}
