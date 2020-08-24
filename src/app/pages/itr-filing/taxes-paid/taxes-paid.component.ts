import { TCS, OtherThanTDSTCS } from './../../../shared/interfaces/itr-input.interface';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GridOptions, GridApi } from 'ag-grid-community';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { NumericEditor } from 'app/shared/numeric-editor.component';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { AgGridMaterialSelectEditorComponent } from 'app/shared/dropdown.component';
import { CustomDateComponent } from 'app/shared/date.component';
import { ItrMsService } from 'app/services/itr-ms.service';
import * as moment from 'moment';

@Component({
  selector: 'app-taxes-paid',
  templateUrl: './taxes-paid.component.html',
  styleUrls: ['./taxes-paid.component.css']
})
export class TaxesPaidComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();

  loading: boolean = false;
  onSalaryGridOptions: GridOptions;
  tdsOtherThanSalary16AGridOptions: GridOptions;
  tdsOtherThanSalary26QBGridOptions: GridOptions;
  tcsGridOptions: GridOptions;
  otherThanTdsTcsGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  itrDocuments = [];
  // headOfIncomeDropdownTDS2 = [];

  // headOfIncomeDropdownTDS3 = [
  //   { name: 'Income from business and Profession', code: 'BP' },
  //   { name: 'Income from House Property', code: 'HP' },
  //   { name: 'Income from Capital Gains', code: 'CG' },
  //   { name: 'Income from Other Source', code: 'OS' },
  //   { name: 'Exempt Income', code: 'EI' }
  // ];

  constructor(public utilsService: UtilsService, private itrMsService: ItrMsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    // if (this.ITR_JSON.itrType === '4') {
    //   this.headOfIncomeDropdownTDS2 = [
    //     { name: 'Income from business and Profession', code: 'BP' },
    //     { name: 'Income from House Property', code: 'HP' },
    //     { name: 'Income from Other Source', code: 'OS' },
    //     { name: 'Exempt Income', code: 'EI' }
    //   ];
    //   this.headOfIncomeDropdownTDS3 = [
    //     { name: 'Income from House Property', code: 'HP' },
    //   ];
    // } else {
    //   this.headOfIncomeDropdownTDS2 = [
    //     { name: 'Income from House Property', code: 'HP' },
    //     { name: 'Income from Capital Gains', code: 'CG' },
    //     { name: 'Income from Other Sources', code: 'OS' },
    //     { name: 'Exempt Income', code: 'EI' }
    //   ];
    //   this.headOfIncomeDropdownTDS3 = [
    //     { name: 'Income from House Property', code: 'HP' },
    //     { name: 'Income from Capital Gains', code: 'CG' },
    //     { name: 'Income from Other Sources', code: 'OS' },
    //     { name: 'Exempt Income', code: 'EI' }
    //   ];
    // }
  }

  ngOnInit() {
    this.getItrDocuments();

    this.onSalaryCallInConstructor();
    this.onSalaryGridOptions.rowData = this.ITR_JSON.taxPaid.onSalary;
    this.tdsOtherThanSalary16ACallInConstructor();
    this.tdsOtherThanSalary16AGridOptions.rowData = this.ITR_JSON.taxPaid.otherThanSalary16A;
    this.tdsOtherThanSalary26QBCallInConstructor();
    this.tdsOtherThanSalary26QBGridOptions.rowData = this.ITR_JSON.taxPaid.otherThanSalary26QB;
    this.tcsCallInConstructor();
    this.tcsGridOptions.rowData = this.ITR_JSON.taxPaid.tcs;
    this.otherThanTdsTcsCallInConstructor();
    this.otherThanTdsTcsGridOptions.rowData = this.ITR_JSON.taxPaid.otherThanTDSTCS;
  }

  onSalaryCallInConstructor() {
    this.onSalaryGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData(),
      columnDefs: this.createOnSalaryColoumnDef(),
      onGridReady: () => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'deductorTAN') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'deductorName') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        // agDateInput: CustomDateComponent,
        // matSelect: AgGridMaterialSelectEditorComponent
      },
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    };
  }

  createOnSalaryColoumnDef() {
    return [
      {
        headerName: 'TAN of employer',
        field: 'deductorTAN',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.deductorTAN)) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.deductorTAN)) {
            return ('Please enter valid TAN number');
          }
        },
      },
      {
        headerName: 'Name of employer',
        field: 'deductorName',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorName.length < 1 || params.data.deductorName.length > 125) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorTAN.length < 1 || params.data.deductorTAN.length > 125) {
            return ('Name of employer cannot be more than 125 characters.');
          }
        },
      },
      {
        headerName: 'Total amount credited',
        field: 'totalAmountCredited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total amount credited should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Total tax deducted',
        field: 'totalTdsDeposited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total tax deducted should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
      <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
     </button>`,
        width: 70,
        pinned: 'right',
        cellStyle: { textAlign: 'center' }
      },
    ];
  }

  createOnSalaryRowData() {
    const newData = [];
    newData.push({
      srNo: null,
      deductorTAN: '',
      deductorName: '',
      totalAmountCredited: null,
      totalTdsDeposited: null,
      taxDeduction: [],
    });
    return newData;
  }

  public onSalaryRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.onSalaryGridOptions.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  onAddRow(val) {
    const data = this.createOnSalaryRowData();

    const temp = this.onSalaryGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.deductorTAN) &&
          this.utilsService.isNonEmpty(temp[i].data.deductorName) &&
          this.utilsService.isNonEmpty(temp[i].data.totalAmountCredited) &&
          this.utilsService.isNonEmpty(temp[i].data.totalTdsDeposited)) {
          if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.deductorTAN)) {
            isDataValid = true;
          } else {
            return this.utilsService.showSnackBar('Please enter valid TAN Number');
          }
        } else {
          isDataValid = false;
          break;
        }
      }
    } else {
      isDataValid = true;
    }
    if (val === 'ADD') {
      if (isDataValid) {
        this.onSalaryGridOptions.api.updateRowData({ add: data });
        this.onSalaryGridOptions.api.setFocusedCell(this.onSalaryGridOptions.api.getRenderedNodes().length - 1, 'deductorTAN', '');
      } else {
        this.utilsService.showSnackBar('Please fill current row first.');
      }
    } else {
      if (isDataValid) {
        return true;
      } else {
        this.utilsService.showSnackBar('Please enter TDS on Salary details');
        return false
      }
    }

  }



  // tdsOtherThanSalary16A
  tdsOtherThanSalary16ACallInConstructor() {
    this.tdsOtherThanSalary16AGridOptions = <GridOptions>{
      rowData: this.createTdsotherThanSalary16ARowData(),
      columnDefs: this.createTdsotherThanSalary16AColoumnDef(),
      onGridReady: () => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'deductorTAN') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'deductorName') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        // agDateInput: CustomDateComponent,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    };
  }

  createTdsotherThanSalary16AColoumnDef() {
    return [
      {
        headerName: 'TAN of deductor',
        field: 'deductorTAN',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.deductorTAN)) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.deductorTAN)) {
            return ('Please enter valid TAN number');
          }
        },
      },
      {
        headerName: 'Select head of income',
        field: 'headOfIncome',
        editable: true,
        suppressMovable: true,
        cellEditor: 'matSelect',
        cellEditorParams: { values: extractValues(headOfIncomeDropdownTDS2) },
        valueFormatter: function (params) {
          console.log('params valueFormatter', params);
          return lookupValue(headOfIncomeDropdownTDS2, params.value);
        },
        valueParser: function (params) {
          console.log('params parser', params);
          return lookupKey(headOfIncomeDropdownTDS2, params.newValue);
        }
      },
      {
        headerName: 'Name of deductor',
        field: 'deductorName',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorName.length < 1 || params.data.deductorName.length > 125) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorName.length < 1 || params.data.deductorName.length > 125) {
            return ('Name of deductor cannot be more than 125 characters.');
          }
        },
      },
      {
        headerName: 'Total amount credited',
        field: 'totalAmountCredited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total amount credited should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Total tax deducted',
        field: 'totalTdsDeposited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total tax deducted should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
      <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
     </button>`,
        width: 70,
        pinned: 'right',
        cellStyle: { textAlign: 'center' }
      },
    ];
  }

  createTdsotherThanSalary16ARowData() {
    const newData = [];
    newData.push({
      srNo: null,
      deductorTAN: '',
      deductorName: '',
      uniqueTDSCerNo: '',
      totalAmountCredited: null,
      totalTdsDeposited: null,
      headOfIncome: '',
      taxDeduction: [],
    });
    return newData;
  }

  public tdsOtherThanSalary16ARowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {

          this.tdsOtherThanSalary16AGridOptions.api.updateRowData({ remove: [params.data] });


          break;
        }
      }
    }
  }

  addTdsOtherThanSalary16A(val) {
    const data = this.createTdsotherThanSalary16ARowData();

    const temp = this.tdsOtherThanSalary16AGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.deductorTAN) &&
          this.utilsService.isNonEmpty(temp[i].data.headOfIncome) &&
          this.utilsService.isNonEmpty(temp[i].data.deductorName) &&
          this.utilsService.isNonEmpty(temp[i].data.totalAmountCredited) &&
          this.utilsService.isNonEmpty(temp[i].data.totalTdsDeposited)) {
          if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.deductorTAN)) {
            isDataValid = true;
          } else {
            return this.utilsService.showSnackBar('Please enter valid TAN Number');
          }
        } else {
          isDataValid = false;
          break;
        }
      }
    } else {
      isDataValid = true;
    }
    if (val === 'ADD') {
      if (isDataValid) {
        this.tdsOtherThanSalary16AGridOptions.api.updateRowData({ add: data });
        this.tdsOtherThanSalary16AGridOptions.api.setFocusedCell(this.tdsOtherThanSalary16AGridOptions.api.getRenderedNodes().length - 1, 'deductorTAN', '');
      } else {
        this.utilsService.showSnackBar('Please fill current row first.');
      }
    } else {
      if (isDataValid) {
        return true;
      } else {
        this.utilsService.showSnackBar('Please enter TDS other than Salary details');
        return false
      }
    }

  }


  // 26QB

  // tdsOtherThanSalary16A
  tdsOtherThanSalary26QBCallInConstructor() {
    this.tdsOtherThanSalary26QBGridOptions = <GridOptions>{
      rowData: this.createTdsotherThanSalary26QBRowData(),
      columnDefs: this.createTdsotherThanSalary26QBColoumnDef(),
      onGridReady: () => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'deductorPAN') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'deductorName') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        // agDateInput: CustomDateComponent,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    };
  }

  createTdsotherThanSalary26QBColoumnDef() {
    return [
      {
        headerName: 'PAN of deductor',
        field: 'deductorPAN',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorPAN.length !== 10 || !new RegExp(AppConstants.panNumberRegex).test(params.data.deductorPAN)) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorPAN.length !== 10 || !new RegExp(AppConstants.panNumberRegex).test(params.data.deductorPAN)) {
            return ('Please enter valid PAN number');
          }
        },
      },
      {
        headerName: 'Head of income',
        field: 'headOfIncome',
        editable: true,
        suppressMovable: true,
        cellEditor: 'matSelect',
        cellEditorParams: { values: extractValues(headOfIncomeDropdownTDS3) },
        valueFormatter: function (params) {
          console.log('params valueFormatter', params);
          return lookupValue(headOfIncomeDropdownTDS3, params.value);
        },
        valueParser: function (params) {
          console.log('params parser', params);
          return lookupKey(headOfIncomeDropdownTDS3, params.newValue);
        }
      },
      {
        headerName: 'Name of deductor',
        field: 'deductorName',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.deductorName.length < 1 || params.data.deductorName.length > 125) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.deductorName.length < 1 || params.data.deductorName.length > 125) {
            return ('Name of deductor cannot be more than 125 characters.');
          }
        },
      },
      {
        headerName: 'Total amount credited',
        field: 'totalAmountCredited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total amount credited should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Total tax deducted',
        field: 'totalTdsDeposited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total tax deducted should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
      <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
     </button>`,
        width: 70,
        pinned: 'right',
        cellStyle: { textAlign: 'center' }
      },
    ];
  }

  createTdsotherThanSalary26QBRowData() {
    const newData = [];
    newData.push({
      srNo: null,
      deductorPAN: '',
      deductorName: '',
      uniqueTDSCerNo: '',
      totalAmountCredited: null,
      totalTdsDeposited: null,
      headOfIncome: '',
      taxDeduction: [],
    });
    return newData;
  }

  public tdsOtherThanSalary26QBRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.tdsOtherThanSalary26QBGridOptions.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  addTdsOtherThanSalary26QB(val) {
    const data = this.createTdsotherThanSalary26QBRowData();

    const temp = this.tdsOtherThanSalary26QBGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.deductorPAN) &&
          this.utilsService.isNonEmpty(temp[i].data.headOfIncome) &&
          this.utilsService.isNonEmpty(temp[i].data.deductorName) &&
          this.utilsService.isNonEmpty(temp[i].data.totalAmountCredited) &&
          this.utilsService.isNonEmpty(temp[i].data.totalTdsDeposited)) {
          if (new RegExp(AppConstants.panNumberRegex).test(temp[i].data.deductorPAN)) {
            isDataValid = true;
          } else {
            return this.utilsService.showSnackBar('Please enter valid PAN Number');
          }
        } else {
          isDataValid = false;
          break;
        }
      }
    } else {
      isDataValid = true;
    }
    if (val === 'ADD') {
      if (isDataValid) {
        this.tdsOtherThanSalary26QBGridOptions.api.updateRowData({ add: data });
        this.tdsOtherThanSalary26QBGridOptions.api.setFocusedCell(this.tdsOtherThanSalary26QBGridOptions.api.getRenderedNodes().length - 1, 'deductorPAN', '');
      } else {
        this.utilsService.showSnackBar('Please fill current row first.');
      }
    } else {
      if (isDataValid) {
        return true;
      } else {
        this.utilsService.showSnackBar('Please enter TDS other than Salary details');
        return false
      }
    }

  }


  // TCS
  tcsCallInConstructor() {
    this.tcsGridOptions = <GridOptions>{
      rowData: this.createTcsRowData(),
      columnDefs: this.createTcsColoumnDef(),
      onGridReady: () => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'collectorTAN') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'collectorName') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        // agDateInput: CustomDateComponent,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    };
  }

  createTcsColoumnDef() {
    return [
      {
        headerName: 'TAN of collector',
        field: 'collectorTAN',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.collectorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.collectorTAN)) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.collectorTAN.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.collectorTAN)) {
            return ('Please enter valid TAN number');
          }
        },
      },
      {
        headerName: 'Collector name',
        field: 'collectorName',
        editable: true,
        suppressMovable: true,
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.collectorName.length < 1 || params.data.collectorName.length > 125) {
              return true;
            }
            else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.collectorName.length < 1 || params.data.collectorName.length > 125) {
            return ('Name of collector cannot be more than 125 characters.');
          }
        },
      },
      {
        headerName: 'Amount paid',
        field: 'totalAmountPaid',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Amount paid should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Total TCS deposited',
        field: 'totalTcsDeposited',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total TCS deposited should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`,
        width: 70,
        pinned: 'right',
        cellStyle: { textAlign: 'center' }
      },
    ];
  }

  createTcsRowData() {
    const newData = [];
    newData.push({
      srNo: null,
      collectorTAN: '',
      collectorName: '',
      totalAmountPaid: null,
      totalTcsDeposited: null,
      taxDeduction: [],
    });
    return newData;
  }

  public tcsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.tcsGridOptions.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  addTcs(val) {
    const data = this.createTcsRowData();

    const temp = this.tcsGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.collectorTAN) &&
          this.utilsService.isNonEmpty(temp[i].data.collectorName) &&
          this.utilsService.isNonEmpty(temp[i].data.totalAmountPaid) &&
          this.utilsService.isNonEmpty(temp[i].data.totalTcsDeposited)) {
          if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.collectorTAN)) {
            isDataValid = true;
          } else {
            return this.utilsService.showSnackBar('Please enter valid TAN Number');
          }
        } else {
          isDataValid = false;
          break;
        }
      }
    } else {
      isDataValid = true;
    }
    if (val === 'ADD') {
      if (isDataValid) {
        this.tcsGridOptions.api.updateRowData({ add: data });
        this.tcsGridOptions.api.setFocusedCell(this.tcsGridOptions.api.getRenderedNodes().length - 1, 'collectorTAN', '');
      } else {
        this.utilsService.showSnackBar('Please fill current row first.');
      }
    } else {
      if (isDataValid) {
        return true;
      } else {
        this.utilsService.showSnackBar('Please enter TCS details');
        return false
      }
    }

  }


  // OtherThanTDSTCS
  otherThanTdsTcsCallInConstructor() {
    this.otherThanTdsTcsGridOptions = <GridOptions>{
      rowData: this.createOtherThanTdsTcsRowData(),
      columnDefs: this.createOtherThanTdsTcsColoumnDef(),
      onGridReady: () => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'bsrCode') {
          event.node.setDataValue(event.column.getColId(), event.value.toString().substr(0, 7));
        } else if (event.column.getColId() === 'challanNumber') {
          event.node.setDataValue(event.column.getColId(), event.value.toString().substr(0, 5));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        agDateInput: CustomDateComponent,
      },
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    };
  }

  createOtherThanTdsTcsColoumnDef() {
    return [
      {
        headerName: 'BSR code',
        field: 'bsrCode',
        editable: true,
        suppressMovable: true,
        // cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            if (params.data.bsrCode.length !== 7) {
              return true;
            } else {
              return false;
            }
          },
        },
        tooltip: function (params) {
          if (params.data.bsrCode.length !== 7) {
            return ('Please enter 7 digit BSR code');
          }
        },
      },
      {
        headerName: 'Date of deposit',
        field: 'dateOfDeposit',
        editable: true,
        suppressMovable: true,
        cellEditor: 'agDateInput',
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
        // cellClassRules: {
        //   'invalid-row': function (params) {
        //     if (params.data.collectorName.length < 1 || params.data.collectorName.length > 125) {
        //       return true;
        //     }
        //     else {
        //       return false;
        //     }
        //   },
        // },
        // tooltip: function (params) {
        //   if (params.data.collectorName.length < 1 || params.data.collectorName.length > 125) {
        //     return ('Name of collector cannot be more than 125 characters.');
        //   }
        // },
      },
      {
        headerName: 'Serial number of challan',
        field: 'challanNumber',
        editable: true,
        suppressMovable: true,
        // cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Serial number of challan should be numeric, upto 5 digit.');
        },
      },
      {
        headerName: 'Total tax paid',
        field: 'totalTax',
        editable: true,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        tooltip: function (params) {
          return ('Total tax paid should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        template:
          `<button type="button" class="action_icon add_button" title="Clear" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`,
        width: 70,
        pinned: 'right',
        cellStyle: { textAlign: 'center' }
      },
    ];
  }

  createOtherThanTdsTcsRowData() {
    const newData = [];
    newData.push({
      srNo: null,
      bsrCode: '',
      dateOfDeposit: '',
      challanNumber: '',
      totalTax: null,
    });
    return newData;
  }

  public otherThanTdsTcsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.otherThanTdsTcsGridOptions.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  addOtherThanTdsTcs(val) {
    const data = this.createOtherThanTdsTcsRowData();

    const temp = this.otherThanTdsTcsGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.bsrCode) &&
          this.utilsService.isNonEmpty(temp[i].data.dateOfDeposit) &&
          this.utilsService.isNonEmpty(temp[i].data.challanNumber) &&
          this.utilsService.isNonEmpty(temp[i].data.totalTax)) {
          // if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.collectorTAN)) {
          //   isDataValid = true;
          // } else {
          //   return this.utilsService.showSnackBar('Please enter valid TAN Number');
          // }
          isDataValid = true;
        } else {
          isDataValid = false;
          break;
        }
      }
    } else {
      isDataValid = true;
    }
    if (val === 'ADD') {
      if (isDataValid) {
        this.otherThanTdsTcsGridOptions.api.updateRowData({ add: data });
        this.otherThanTdsTcsGridOptions.api.setFocusedCell(this.otherThanTdsTcsGridOptions.api.getRenderedNodes().length - 1, 'bsrCode', '');
      } else {
        this.utilsService.showSnackBar('Please fill current row first.');
      }
    } else {
      if (isDataValid) {
        return true;
      } else {
        this.utilsService.showSnackBar('Please enter Advance/ Self assessment tax details');
        return false
      }
    }

  }


  saveAndContinue() {
    this.loading = true;
    var onSalary = []
    var tdsOtherThanSalary16A = []
    var tdsOtherThanSalary26QB = []
    var tcs = []
    var otherThanTdsTcs = []
    if (this.onAddRow('SAVE')) {
      if (this.onSalaryGridOptions.api.getRenderedNodes().length > 0) {
        let data = this.onSalaryGridOptions.api.getRenderedNodes();
        for (let i = 0; i < data.length; i++) {
          onSalary.push(data[i].data);
        }
        this.ITR_JSON.taxPaid.onSalary = onSalary;
      }
    }
    if (this.addTdsOtherThanSalary16A('SAVE')) {
      if (this.tdsOtherThanSalary16AGridOptions.api.getRenderedNodes().length > 0) {
        let data = this.tdsOtherThanSalary16AGridOptions.api.getRenderedNodes();
        for (let i = 0; i < data.length; i++) {
          tdsOtherThanSalary16A.push(data[i].data);
        }
        this.ITR_JSON.taxPaid.otherThanSalary16A = tdsOtherThanSalary16A;
      }
    }

    if (this.addTdsOtherThanSalary26QB('SAVE')) {
      if (this.tdsOtherThanSalary26QBGridOptions.api.getRenderedNodes().length > 0) {
        let data = this.tdsOtherThanSalary26QBGridOptions.api.getRenderedNodes();
        for (let i = 0; i < data.length; i++) {
          tdsOtherThanSalary26QB.push(data[i].data);
        }
        this.ITR_JSON.taxPaid.otherThanSalary26QB = tdsOtherThanSalary26QB;
      }
    }

    if (this.addTcs('SAVE')) {
      if (this.tcsGridOptions.api.getRenderedNodes().length > 0) {
        let data = this.tcsGridOptions.api.getRenderedNodes();
        for (let i = 0; i < data.length; i++) {
          tcs.push(data[i].data);
        }
        this.ITR_JSON.taxPaid.tcs = tcs;
      }
    }

    if (this.addOtherThanTdsTcs('SAVE')) {
      debugger
      if (this.otherThanTdsTcsGridOptions.api.getRenderedNodes().length > 0) {
        let data = this.otherThanTdsTcsGridOptions.api.getRenderedNodes();
        for (let i = 0; i < data.length; i++) {
          otherThanTdsTcs.push(data[i].data);
        }
        this.ITR_JSON.taxPaid.otherThanTDSTCS = otherThanTdsTcs;
      }
    }

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Taxes paid updated successfully.');
      this.saveAndNext.emit(true);
    }, error => {
      this.utilsService.showSnackBar('Failed to update Taxes paid.');
      this.loading = false;
    });
  }

  getItrDocuments() {
    // TODO
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      console.log('Documents ITR', result)
      this.itrDocuments = result;
      // this.getDocsUrl(0);
    })
  }


  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: ''
  };
  getDocsUrl(index) {
    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }

}
let headOfIncomeDropdownTDS2 = [
  { name: 'Income from business and Profession', code: 'BP' },
  { name: 'Income from House Property', code: 'HP' },
  { name: 'Income from Other Source', code: 'OS' },
  { name: 'Exempt Income', code: 'EI' }
];
let headOfIncomeDropdownTDS3 = [
  { name: 'Income from business and Profession', code: 'BP' },
  { name: 'Income from House Property', code: 'HP' },
  { name: 'Income from Capital Gains', code: 'CG' },
  { name: 'Income from Other Source', code: 'OS' },
  { name: 'Exempt Income', code: 'EI' }
];

function extractValues(mappings) {
  const array = [];
  if (mappings) {
    mappings.forEach(element => {
      array.push(element);
    });
  }
  // console.log("")
  return array;
}

function lookupValue(mappings, key) {
  let country = '';
  mappings.forEach(element => {
    if (element.code == key) {
      country = element.name
    }
  });
  if (country !== '' && country !== undefined && country !== null) {
    return `${country[0]}${country.substr(1).toLowerCase()}`;
  } else {
    return ''
  }
}

// convert value to code
function lookupKey(mappings, name) {
  mappings.forEach(element => {
    if (element.code == name) {
      return element.name
    }
  });
}