import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { GridOptions, IsColumnFuncParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit {
  rowHeight: number;
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  public scheduleCFLLoss: GridOptions;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    private itrMsService: ItrMsService,
  ) {
    this.rowHeight = 50;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.getTableData();
  }

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
        field: 'assessmentPastYear',
        editable: false,
        suppressMovable: true,
        pinned: 'left',
        width: 150,
      },
      {
        headerName: 'Date of Filing',
        field: 'dateofFilling',
        editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
        suppressMovable: true,
        cellStyle: function (params) {
          if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        }
      },

      {
        headerName: 'House property Loss',
        field: 'housePropertyLoss',
        suppressMovable: true,
        editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
        cellStyle: function (params) {
          if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        }

      },

      {
        headerName: 'Loss from business other than loss from speculative business and specified business',
        editable: false,
        children: [
          {
            headerName: 'a. Brought Forward Business Loss',
            field: 'broughtForwordBusinessLoss',
            editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
            suppressMovable: true,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            }

          },
          {
            headerName: 'b. Amount as adjusted on account of opting for taxation u/s 115BAC',
            field: 'adjustedAmount',
            editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
            width: 300,
            suppressMovable: true,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            }

          },

          {
            headerName: 'c. Brought forward Business loss available for set off during the year [c=a-b]',
            field: 'setOffDuringTheYear',
            suppressMovable: true,
            editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
            width: 300,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            }

          }
        ],
        suppressMovable: true,
      },
      {
        headerName: 'Short Term Capital Loss',
        field: 'STCGLoss',
        editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
        suppressMovable: true,
        cellStyle: function (params) {
          if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        }

      },
      {
        headerName: 'Long Term Capital Loss',
        field: 'LTCGLoss',
        editable: (params: IsColumnFuncParams) => { return this.canLastCellBeEdited(params) },
        suppressMovable: true,
        cellStyle: function (params) {
          if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        }

      },
      {
        headerName: 'Loss from Speculative Business',
        field: 'speculativeBusinessLoss',
        editable: (params: IsColumnFuncParams) => { return (this.canCellBeEdited(params) && this.canLastCellBeEdited(params)) },
        suppressMovable: true,
        cellStyle: function (params) {
          if ((params.node.rowIndex == '0' || params.node.rowIndex == '1' || params.node.rowIndex == '2' || params.node.rowIndex == '3') || (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11')) {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        }


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

  canCellBeEdited(params) {
    if (params.node.rowIndex == '0' || params.node.rowIndex == '1' || params.node.rowIndex == '2' || params.node.rowIndex == '3') {
      return false;
    }
    return true;
  }


  canLastCellBeEdited(params) {
    if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
      return false;
    }
    return true;
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
      { assessmentPastYear: '2014-15', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2015-16', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2016-17', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2017-18', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2018-19', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2019-20', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2020-21', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2021-22', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: 'Total of earlier year losses', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: 'Adjustment of above losses in schedule BFLA', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: '2022-23 (Current Year Losses)', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
      { assessmentPastYear: 'Total Loss carried forward to future years', dateofFilling: '', housePropertyLoss: '', broughtForwordBusinessLoss: '', adjustedAmount: '', setOffDuringTheYear: '', STCGLoss: '', LTCGLoss: '', speculativeBusinessLoss: '', Actions: '' },
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
    this.Copy_ITR_JSON.carryForwordLosses = this.scheduleCFLLoss.rowData;
    console.log(this.Copy_ITR_JSON)
    this.loading = true;
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Schedule CFL updated successfully');
      console.log('Assets & Liabilities save result=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add schedule CFL, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}

