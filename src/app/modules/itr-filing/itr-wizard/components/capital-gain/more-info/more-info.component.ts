import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ColumnFunctionCallbackParams, GridOptions, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, PastYearLosses } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { CustomDateComponent } from 'src/app/modules/shared/date.component';
import * as moment from 'moment';
import { Location } from "@angular/common";


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
  pastYearLosses: PastYearLosses[];
  totalLoss: PastYearLosses;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    private itrMsService: ItrMsService,
    public location: Location
  ) {
    this.rowHeight = 50;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.pastYearLosses = this.ITR_JSON.pastYearLosses;
    if (!this.pastYearLosses || this.pastYearLosses.length == 0) {
      this.pastYearLosses = [];
      this.pastYearLosses.push(this.createPastYearLoss('2014-15'));
      this.pastYearLosses.push(this.createPastYearLoss('2015-16'));
      this.pastYearLosses.push(this.createPastYearLoss('2016-17'));
      this.pastYearLosses.push(this.createPastYearLoss('2017-18'));
      this.pastYearLosses.push(this.createPastYearLoss('2018-19'));
      this.pastYearLosses.push(this.createPastYearLoss('2019-20'));
      this.pastYearLosses.push(this.createPastYearLoss('2020-21'));
      this.pastYearLosses.push(this.createPastYearLoss('2021-22'));
    }
    this.getTableData();
  }

  createPastYearLoss(year) {
    return {
      hasEdit: false,
      pastYear: null,
      assessmentPastYear: year,
      dateofFilling: '',
      housePropertyLoss: null,
      broughtForwordBusinessLoss: null,
      STCGLoss: null,
      LTCGLoss: null,
      speculativeBusinessLoss: null,
      setOffWithCurrentYearSpeculativeBusinessIncome: null,
      setOffWithCurrentYearBroughtForwordBusinessIncome: null,
      setOffWithCurrentYearHPIncome: null,
      setOffWithCurrentYearSTCGIncome: null,
      setOffWithCurrentYearLTCGIncome: null,
      carryForwardAmountBusiness: null,
      carryForwardAmountSpeculative: null,
      carryForwardAmountHP: null,
      carryForwardAmountSTCGIncome: null,
      carryForwardAmountLTCGIncome: null,
      totalLoss: null
    }
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
        // field: 'assessmentPastYear',
        editable: false,
        suppressMovable: true,
        pinned: 'left',
        width: 100,
        valueGetter: (params: ValueGetterParams) => {
          return params.data.assessmentPastYear;
        }
      },
      {
        headerName: 'Date of Filing',
        field: 'dateofFilling',
        editable: (params: ColumnFunctionCallbackParams) => { return this.canLastCellBeEdited(params) },
        suppressMovable: true,
        cellEditor: 'agDateInput',
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
        cellClassRules: {
          'filing-date': function (param) {
            return true
          }
        },
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
        editable: (params: ColumnFunctionCallbackParams) => { return this.canLastCellBeEdited(params) },
        cellStyle: function (params) {
          if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
            return { backgroundColor: '#cecec8bd' };
          }
          return null;
        },
        valueGetter: (params: ValueGetterParams) => {
          let rowIndex = params.node.rowIndex;
          if (rowIndex >= 8) {
            return this.totalLoss.housePropertyLoss;
          } else {
            return params.data.housePropertyLoss;
          }
        },
        valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
          let newValInt = parseInt(params.newValue);
          let valueChanged = params.data.housePropertyLoss !== newValInt;
          if (valueChanged) {
            params.data.housePropertyLoss = newValInt ? newValInt : params.oldValue;
          }
          //update total
          this.totalLoss.housePropertyLoss = this.pastYearLosses.map(i => i.housePropertyLoss).reduce((a, b) => a + b, 0)

          return valueChanged;
        },

      },

      {
        headerName: 'Business & Speculative income',
        cellStyle: { textAlign: 'center' },
        // cellStyle: function (params: any) {
        //   return {
        //     'textAlign': 'center !important;',//, display: 'flex',
        //     // 'align-items': 'center',
        //     'justify-content': 'center !important;'
        //   }
        // },
        editable: false,
        children: [
          {
            headerName: 'Brought Forward Business Loss',
            field: 'broughtForwordBusinessLoss',
            editable: (params: ColumnFunctionCallbackParams) => { return this.canLastCellBeEdited(params) },
            suppressMovable: true,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            },
            valueGetter: (params: ValueGetterParams) => {
              let rowIndex = params.node.rowIndex;
              if (rowIndex >= 8) {
                return this.totalLoss.broughtForwordBusinessLoss;
              } else {
                return params.data.broughtForwordBusinessLoss;
              }
            },
            valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
              let newValInt = parseInt(params.newValue);
              let valueChanged = params.data.broughtForwordBusinessLoss !== newValInt;
              if (valueChanged) {
                params.data.broughtForwordBusinessLoss = newValInt ? newValInt : params.oldValue;
              }
              //update total
              this.totalLoss.broughtForwordBusinessLoss = this.pastYearLosses.map(i => i.broughtForwordBusinessLoss).reduce((a, b) => a + b, 0)

              return valueChanged;
            },

          },
          {
            headerName: 'Loss from Speculative Business',
            field: 'speculativeBusinessLoss',
            editable: (params: ColumnFunctionCallbackParams) => { return (this.canCellBeEdited(params) && this.canLastCellBeEdited(params)) },
            suppressMovable: true,
            cellStyle: function (params) {
              if ((params.node.rowIndex == '0' || params.node.rowIndex == '1' || params.node.rowIndex == '2' || params.node.rowIndex == '3') || (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11')) {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            },
            valueGetter: (params: ValueGetterParams) => {
              let rowIndex = params.node.rowIndex;
              if (rowIndex >= 8) {
                return this.totalLoss.speculativeBusinessLoss;
              } else {
                return params.data.speculativeBusinessLoss;
              }
            },
            valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
              let newValInt = parseInt(params.newValue);
              let valueChanged = params.data.speculativeBusinessLoss !== newValInt;
              if (valueChanged) {
                params.data.speculativeBusinessLoss = newValInt ? newValInt : params.oldValue;
              }

              //update total
              this.totalLoss.speculativeBusinessLoss = this.pastYearLosses.map(i => i.speculativeBusinessLoss).reduce((a, b) => a + b, 0)
              return valueChanged;
            },
          },
        ],
      },
      {
        headerName: 'Capital Gain Loss',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'space-around'
          }
        },
        editable: false,
        children: [
          {
            headerName: 'Short Term Capital Loss',
            field: 'STCGLoss',
            width: 180,
            editable: (params: ColumnFunctionCallbackParams) => { return this.canLastCellBeEdited(params) },
            suppressMovable: true,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            },
            valueGetter: (params: ValueGetterParams) => {
              let rowIndex = params.node.rowIndex;
              if (rowIndex >= 8) {
                return this.totalLoss.STCGLoss;
              } else {
                return params.data.STCGLoss;
              }
            },
            valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
              let newValInt = parseInt(params.newValue);
              let valueChanged = params.data.STCGLoss !== newValInt;
              if (valueChanged) {
                params.data.STCGLoss = newValInt ? newValInt : params.oldValue;
              }

              //update total
              this.totalLoss.STCGLoss = this.pastYearLosses.map(i => i.STCGLoss).reduce((a, b) => a + b, 0)

              return valueChanged;
            },

          },
          {
            headerName: 'Long Term Capital Loss',
            field: 'LTCGLoss',
            width: 180,
            editable: (params: ColumnFunctionCallbackParams) => { return this.canLastCellBeEdited(params) },
            suppressMovable: true,
            cellStyle: function (params) {
              if (params.node.rowIndex == '8' || params.node.rowIndex == '9' || params.node.rowIndex == '10' || params.node.rowIndex == '11') {
                return { backgroundColor: '#cecec8bd' };
              }
              return null;
            },
            valueGetter: (params: ValueGetterParams) => {
              let rowIndex = params.node.rowIndex;
              if (rowIndex >= 8) {
                return this.totalLoss.LTCGLoss;
              } else {
                return params.data.LTCGLoss;
              }
            },
            valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
              let newValInt = parseInt(params.newValue);
              let valueChanged = params.data.LTCGLoss !== newValInt;
              if (valueChanged) {
                params.data.LTCGLoss = newValInt ? newValInt : params.oldValue;
              }

              //update total
              this.totalLoss.LTCGLoss = this.pastYearLosses.map(i => i.LTCGLoss).reduce((a, b) => a + b, 0)

              return valueChanged;
            },

          },
        ],
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
          if (params.node.rowIndex != '8' || params.node.rowIndex != '9' || params.node.rowIndex != '10' || params.node.rowIndex != '11') {
            return `<button type="button" class="action_icon add_button" title="Delete">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
          </button>`;
          }

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
      frameworkComponents: {
        agDateInput: CustomDateComponent,
      },
      suppressRowTransform: true
    };
  }

  getRowData() {
    let data = [];
    data = data.concat(this.pastYearLosses);
    this.totalLoss = this.createPastYearLoss('Total of earlier year losses');
    this.pastYearLosses.forEach(element => {
      this.totalLoss.LTCGLoss += element.LTCGLoss;
    });
    data.push(this.totalLoss);
    return data;
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
    let loss = this.pastYearLosses[index];
    this.pastYearLosses.splice(index, 1, this.createPastYearLoss(loss.assessmentPastYear));
    this.scheduleCFLLoss.api.setRowData(this.getRowData());

  }

  continue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let isError = false;
    this.pastYearLosses.forEach(element => {
      if (element.dateofFilling && (element.LTCGLoss == 0 && element.STCGLoss == 0 && element.broughtForwordBusinessLoss == 0 && element.housePropertyLoss == 0 && element.speculativeBusinessLoss == 0)) {
        isError = true;
      }
    });
    if (isError) {
      this.utilsService.showSnackBar('Please enter the any of the loss value.');
      this.utilsService.smoothScrollToTop();
      return;
    }
    this.Copy_ITR_JSON.pastYearLosses = this.pastYearLosses;
    console.log(this.Copy_ITR_JSON)
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Schedule CFL updated successfully');
      console.log('Schedule CFL=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add schedule CFL, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}

