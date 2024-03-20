import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {GridApi, GridOptions, GridReadyEvent, RowNode, ValueSetterParams} from 'ag-grid-community';
import {
  ITR_JSON,
  OnSalary,
  OtherThanSalary16A,
  OtherThanSalary26QB,
  OtherThanTDSTCS,
  TCS,
  TaxPaid,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AgGridMaterialSelectEditorComponent } from 'src/app/modules/shared/dropdown.component';
import { CustomDateComponent } from 'src/app/modules/shared/date.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import * as moment from 'moment';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { TdsOtherThanSalaryComponent } from '../../components/tds-other-than-salary/tds-other-than-salary.component';
import { TdsOnSalaryComponent } from '../../components/tds-on-salary/tds-on-salary.component';
import { SelectionComponent } from './selection-component/selection-component.component';
import { MatDialog } from '@angular/material/dialog';
import { RowGroupingDisplayType } from 'ag-grid-community';
import { TcsComponent } from '../../components/tcs/tcs.component';
import { AdvanceTaxPaidComponent } from '../../components/advance-tax-paid/advance-tax-paid.component';
import { TdsTypeCellRenderer } from './tds-type-cell-renderer';
import { param } from 'jquery';

@Component({
  selector: 'app-taxes-paid',
  templateUrl: './taxes-paid.component.html',
  styleUrls: ['./taxes-paid.component.scss'],
})
export class TaxesPaidComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
  @ViewChild('other') private tdsOtherThanSalaryComponent;
  @ViewChild('panBased') private tdsOtherThanSalaryComponent1;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  deletedFileData: any = [];
  isAddOther: number;
  step: any = 0;
  isAddSalary: number;
  isAddPanBased: number;
  isAddTcs: number;
  isAddAdvance: number;
  onSalaryGridOptions: GridOptions;
  onSalaryGridApi: GridApi;
  tdsOtherThanSalary16AGridOptions: GridOptions;
  tdsOtherThanSalary16AGridApi: GridApi;
  tdsOtherThanSalary26QBGridOptions: GridOptions;
  tdsOtherThanSalary26QBGridApi: GridApi;
  tcsGridOptions: GridOptions;
  tcsGridApi: GridApi;
  otherThanTdsTcsGridOptions: GridOptions;
  otherThanTdsTcsGridApi: GridApi;

  allTdsDetails: GridOptions;
  public groupDisplayType: RowGroupingDisplayType = 'groupRows';
  onSalary: any = [];
  isTaxesPaid: Number;
  @Input() taxPaid: TaxPaid;
  assetList: any;
  tdsMode = 'VIEW';
  tdsOtherMode = 'VIEW';
  tdsPanMode = 'VIEW';
  tcsMode = 'VIEW';
  advanceMode = 'VIEW';

  //index when switching view to edit
  tdsEditIndex = 0;
  tdsOtherEditIndex = 0;
  tdsPanEditIndex = 0;
  tcsEditIndex = 0;
  advanceEditIndex = 0;
  PREV_ITR_JSON: any;

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    let taxPaidData = this.ITR_JSON.taxPaid;
    if (taxPaidData) {
      this.taxPaid = taxPaidData;
    }

    this.onSalaryGridOptions = this.initGridOptions(this.TDS_TYPE_CODE, this.onSalaryGridApi);
    // this.onSalaryGridApi = this.onSalaryGridOptions.api;
    this.tdsOtherThanSalary16AGridOptions = this.initGridOptions(this.TDS_OTHER_TYPE_CODE, this.tdsOtherThanSalary16AGridApi);
    this.tdsOtherThanSalary26QBGridOptions = this.initGridOptions(this.TDS_PAN_TYPE_CODE, this.tdsOtherThanSalary26QBGridOptions);
    this.tcsGridOptions = this.initGridOptions(this.TCS_TYPE_CODE, this.tcsGridApi);
    this.otherThanTdsTcsGridOptions = this.initGridOptions(this.ADVANCE_TYPE_CODE, this.otherThanTdsTcsGridApi);

    this.allTdsDetails = <GridOptions>{
      rowData: this.tdsDetailCreateRowData(''),
      columnDefs: this.tdsDetailCreateColumnDef(''),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      isRowSelectable: (params) => {
        return !params.data.isFullWidth;
      },
      onGridReady: (params) => {},
      isFullWidthRow: (params) => {
        // return isFullWidth(params.rowNode.data);
        return params.rowNode.data.isFullWidth;
      },
      // see AG Grid docs cellRenderer for details on how to build cellRenderers
      fullWidthCellRenderer: TdsTypeCellRenderer,
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.hasEdit = true;
        });
        if (event.api.getSelectedRows().length === 0) {
          this.assetList.forEach((asset: any) => {
            asset.hasEdit = false;
          });
        }
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
    };
    this.allTdsDetails.api?.setRowData(this.assetList);
  }

  initGridOptions(type, gridApi){
    return <GridOptions>{
      rowData: this.tdsDetailCreateRowData(type),
      columnDefs: this.tdsDetailCreateColumnDef(type),
      pagination: true,
      paginationPageSize: 20,
      onGridReady(params: GridReadyEvent) {
        console.log('api updated', params.api)
        this.onSalaryGridApi = params.api;
      }
    };
  }

  headOfIncomeDropdownTDS2 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false },
  ];

  headOfIncomeDropdownTDS3 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false },
  ];

  ngOnInit() {
    this.getItrDocuments();
  }

  editTaxesPaid(type, index?) {
    if (type === this.TDS_TYPE_CODE) {
      this.tdsMode = 'EDIT';
      this.tdsEditIndex = index;
    } else if (type === this.TDS_OTHER_TYPE_CODE) {
      this.tdsOtherMode = 'EDIT';
      this.tdsOtherEditIndex = index;
    } else if (type === this.TDS_PAN_TYPE_CODE) {
      this.tdsPanMode = 'EDIT';
      this.tdsPanEditIndex = index;
    } else if (type === this.TCS_TYPE_CODE) {
      this.tcsMode = 'EDIT';
      this.tcsEditIndex = index;
    } else if (type === this.ADVANCE_TYPE_CODE) {
      this.advanceMode = 'EDIT';
      this.advanceEditIndex = index;
    }
  }

  addTaxesPaid(isEdit, index?) {
    this.isTaxesPaid = Math.random();
    const dialogRefSelect = this.matDialog.open(SelectionComponent, {
      data: {
        assetIndex: this.totalEntries
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRefSelect.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        if (result.type === this.TDS_TYPE_CODE) {
          this.tdsMode = 'VIEW';
          if(!this.taxPaid?.onSalary){
            this.taxPaid.onSalary = [];
          }
          this.taxPaid?.onSalary?.push(result.cgObject.salaryArray[0]);
          this.updateDataTables(this.TDS_TYPE_CODE);
        }
        if (result.type === this.TDS_OTHER_TYPE_CODE) {
          if(!this.taxPaid?.otherThanSalary16A){
            this.taxPaid.otherThanSalary16A = [];
          }
          this.taxPaid?.otherThanSalary16A?.push(
            result.cgObject.salaryArray[0]
          );
          this.updateDataTables(this.TDS_OTHER_TYPE_CODE);
        }
        if (result.type === this.TDS_PAN_TYPE_CODE) {
          if(!this.taxPaid?.otherThanSalary26QB){
            this.taxPaid.otherThanSalary26QB = [];
          }
          this.taxPaid?.otherThanSalary26QB?.push(
            result.cgObject.salaryArray[0]
          );
          this.updateDataTables(this.TDS_PAN_TYPE_CODE);
        }
        if (result.type === this.TCS_TYPE_CODE) {
          if(!this.taxPaid?.tcs){
            this.taxPaid.tcs = [];
          }
          this.taxPaid?.tcs?.push(result.cgObject.salaryArray[0]);
          this.updateDataTables(this.TCS_TYPE_CODE);
        }
        if (result.type === this.ADVANCE_TYPE_CODE) {
          if(!this.taxPaid?.otherThanTDSTCS){
            this.taxPaid.otherThanTDSTCS = [];
          }
          this.taxPaid?.otherThanTDSTCS?.push(result.cgObject.salaryArray[0]);
          this.updateDataTables(this.ADVANCE_TYPE_CODE);
        }

      }
    });
    // this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());
  }

  updateDataTables(type){
    this.Copy_ITR_JSON.taxPaid = this.taxPaid;
    sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
    );
    this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData(type));
  }

  totalEntries = 0;
  TDS_TYPE_CODE = 'tdsOnSalary';
  TCS_TYPE_CODE = 'tcs';
  TDS_OTHER_TYPE_CODE = 'tdsOtherThanSalary16A';
  TDS_PAN_TYPE_CODE = 'tdsOtherThanSalaryPanBased';
  ADVANCE_TYPE_CODE = 'selfAssessment';
  tdsDetailCreateRowData(type) {
    let counter = 0;
    this.totalEntries = 0;
    this.assetList = [];
    if(type === this.TDS_TYPE_CODE) {
      this.taxPaid?.onSalary?.forEach((asset) => {
        let copy: any = {};
        Object.assign(copy, asset);
        copy.isFullWidth = false;
        copy.hasEdit = false;
        // set tds Type
        copy.tdsType = 'TDS On Salary';
        copy.tdsCode = this.TDS_TYPE_CODE;
        this.assetList.push(copy);
        copy.index = counter++;
        copy.srNo = copy.index;
      });
      this.totalEntries += counter;
      this.tdsMode = counter === 0 ? 'EDIT' : 'VIEW';
    }

    if(type === this.TDS_OTHER_TYPE_CODE) {
      counter = 0;
      this.taxPaid?.otherThanSalary16A?.forEach((asset) => {
        let copy: any = {};
        Object.assign(copy, asset);
        copy.hasEdit = false;
        // set tds Type
        copy.tdsType = 'TDS Other than Salary';
        copy.tdsCode = this.TDS_OTHER_TYPE_CODE;
        this.assetList.push(copy);
        copy.index = counter++;
        copy.srNo = copy.index;
      });
      this.totalEntries += counter;
    }

    if(type === this.TDS_PAN_TYPE_CODE) {
      counter = 0;
      this.taxPaid?.otherThanSalary26QB?.forEach((asset) => {
        let copy: any = {};
        Object.assign(copy, asset);
        copy.hasEdit = false;

        // set tds Type
        copy.tdsType = 'TDS other than salary (panBased) 26QB';
        copy.tdsCode = this.TDS_PAN_TYPE_CODE;

        // Rename specific properties
        copy.deductorTAN = copy.deductorPAN;
        delete copy.deductorPAN;

        this.assetList.push(copy);
        copy.index = counter++;
        copy.srNo = copy.index;
      });
      this.totalEntries += counter;
    }

    if(type === this.ADVANCE_TYPE_CODE){
      counter = 0;
      this.taxPaid?.otherThanTDSTCS?.forEach((asset) => {
        let copy: any = {};
        Object.assign(copy, asset);
        copy.hasEdit = false;

        // Rename specific properties
        copy.deductorName = copy.bsrCode;
        copy.deductorTAN = copy.challanNumber;
        copy.totalAmountCredited = this.datePipe.transform(
            new Date(copy.dateOfDeposit),
            'dd/MM/yyyy'
        );
        copy.totalTdsDeposited = copy.totalTax;

        delete copy.bsrCode;
        delete copy.challanNumber;
        delete copy.dateOfDeposit;
        delete copy.totalTax;
        // set tds Type
        copy.tdsType = 'Self assessment or Advance tax';
        copy.tdsCode = this.ADVANCE_TYPE_CODE;
        this.assetList.push(copy);
        copy.index = counter++;
        copy.srNo = copy.index;
      });
      this.totalEntries += counter;
    }

    if(type === this.TCS_TYPE_CODE){
      counter = 0;
      this.taxPaid?.tcs?.forEach((asset) => {
        let copy: any = {};
        Object.assign(copy, asset);
        copy.hasEdit = false;
        // Rename specific properties
        copy.deductorName = copy.collectorName;
        copy.deductorTAN = copy.collectorTAN;
        copy.totalAmountCredited = copy.totalAmountPaid;
        copy.totalTdsDeposited = copy.totalTcsDeposited;

        // set tds Type
        copy.tdsType = 'TCS';
        copy.tdsCode = this.TCS_TYPE_CODE;

        delete copy.collectorName;
        delete copy.collectorTAN;
        delete copy.totalAmountPaid;
        delete copy.totalTcsDeposited;
        this.assetList.push(copy);
        copy.index = counter++;
        // copy.srNo = copy.index;
      });
      this.totalEntries += counter;
    }

    return this.assetList;
  }

  salaryColNames = {
    'deductorTAN' : 'TAN of the Employer',
    'deductorName' : 'Name of the Employer',
    'totalAmountCredited' : 'Income chargeable under salaries',
    'totalTdsDeposited' : 'Total tax deducted'
  }
  otherColNames = {
    'deductorTAN' : 'TAN of Deductor',
    'deductorName' : 'Name of Deductor',
    'totalAmountCredited' : 'Total Amount credited',
    'totalTdsDeposited' : 'Total tax deducted'
  }

  tcsColNames = {
    'deductorTAN' : 'TAN of Collector',
    'deductorName' : 'Name of Collector',
    'totalAmountCredited' : 'Total Amount credited',
    'totalTdsDeposited' : 'Total TCS deposited'
  }
  advanceColNames = {
    'deductorTAN' : 'Serial No of Challan',
    'deductorName' : 'BSR Code',
    'totalAmountCredited' : 'Date of Deposit',
    'totalTdsDeposited' : 'Total Tax Paid'
  }

  getColumnName(type, column){
    if(type === this.TDS_TYPE_CODE){
      return this.salaryColNames[column];
    }
    if(type === this.TCS_TYPE_CODE){
      return this.tcsColNames[column];
    }
    if(type === this.ADVANCE_TYPE_CODE){
      return this.advanceColNames[column];
    }
    return this.otherColNames[column];
  }

  tdsDetailCreateColumnDef(type) {
    var self = this;
    return [
      {
        headerName: this.getColumnName(type, 'deductorTAN'),
        field: 'deductorTAN',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorTAN;
        },
      },
      {
        headerName: this.getColumnName(type, 'deductorName'),
        field: 'deductorName',
        // width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorName;
        },
      },
      {
        headerName: this.getColumnName(type, 'totalAmountCredited'),
        field: 'totalAmountCredited',
        // width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalAmountCredited;
        },
      },
      {
        headerName: this.getColumnName(type, 'totalTdsDeposited'),
        field: 'totalTdsDeposited',
        // width: 120,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalTdsDeposited;
        },
      },
      {
        headerName: 'Head of Income',
        field: 'headOfIncome',
        editable: false,
        suppressMovable: true,
        hide: !(type === self.TDS_OTHER_TYPE_CODE || type === self.TDS_PAN_TYPE_CODE),
        valueGetter: function nameFromCode(params) {
          if(type === self.TDS_OTHER_TYPE_CODE){
            return self.headOfIncomeDropdownTDS2.filter(element => element.code === params.data.headOfIncome)[0]?.name;
          } else {
            return self.headOfIncomeDropdownTDS3.filter(element => element.code === params.data.headOfIncome)[0]?.name;
          }
        },
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
    ];
  }

  getIncomeHead(type, headOfIncome){
    if(type === this.TDS_OTHER_TYPE_CODE){
      return this.headOfIncomeDropdownTDS2.filter(element => element.code === headOfIncome)[0].name;
    } else {
      return this.headOfIncomeDropdownTDS3.filter(element => element.code === headOfIncome)[0].name;
    }
  }

  public onTdsDetailRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE Asset:', params.data);
          this.deleteAsset(params.data, params.api, params.node);
          break;
        }
        case 'edit': {
          this.editTaxesPaid(params.data.tdsCode, params.data.index);
          break;
        }
      }
    }
  }

  isAssetSelected() {
    return this.assetList.filter((asset) => asset.hasEdit === true).length > 0;
  }

  deleteAsset(data, gridapi:GridApi, rowNode:RowNode) {

    // need to refresh grid
    // gridapi?.removeItems([rowNode]);
    if(data.tdsCode === this.TDS_TYPE_CODE){
      this.taxPaid?.onSalary?.splice(data.index, 1);
    } else if(data.tdsCode === this.TDS_OTHER_TYPE_CODE){
      this.taxPaid?.otherThanSalary16A.splice(data.index, 1);
    } else if(data.tdsCode === this.TDS_PAN_TYPE_CODE){
      this.taxPaid?.otherThanSalary26QB.splice(data.index, 1);
    } else if(data.tdsCode === this.TCS_TYPE_CODE){
      this.taxPaid?.tcs.splice(data.index, 1);
    } else if(data.tdsCode === this.ADVANCE_TYPE_CODE){
      this.taxPaid?.otherThanTDSTCS?.splice(data.index);
    }

    console.log(this.taxPaid);
    this.Copy_ITR_JSON.taxPaid = this.taxPaid;
    // sessionStorage.setItem(
    //     AppConstants.ITR_JSON,
    //     JSON.stringify(this.Copy_ITR_JSON)
    // );
  }

  saveAll(save?) {
    if(save && save.type === this.TDS_TYPE_CODE){
      if(!save.saved){
        this.tdsMode = 'VIEW';
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.onSalaryGridOptions = this.initGridOptions(this.TDS_TYPE_CODE, this.onSalaryGridApi);
        return;
      } else {
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.onSalaryGridOptions = this.initGridOptions(this.TDS_TYPE_CODE, this.onSalaryGridApi);
      }

    }
    if(save && (save.type === this.TDS_OTHER_TYPE_CODE || save.type === this.TDS_PAN_TYPE_CODE)){
      if(!save.saved){
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        if(save.type === this.TDS_OTHER_TYPE_CODE){
          this.tdsOtherMode = 'VIEW';
          this.tdsOtherThanSalary16AGridOptions = this.initGridOptions(save.type, this.tdsOtherThanSalary16AGridApi);
        } else {
          this.tdsPanMode = 'VIEW';
          this.tdsOtherThanSalary26QBGridOptions = this.initGridOptions(save.type, this.tdsOtherThanSalary26QBGridApi);
        }

        return;
      } else {
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        if(save.type === this.TDS_OTHER_TYPE_CODE){
          this.tdsOtherMode = 'VIEW';
          this.tdsOtherThanSalary16AGridOptions = this.initGridOptions(save.type, this.tdsOtherThanSalary16AGridApi);
        } else {
          this.tdsPanMode = 'VIEW';
          this.tdsOtherThanSalary26QBGridOptions = this.initGridOptions(save.type, this.tdsOtherThanSalary26QBGridApi);
        }
      }
    }

    if(save && save.type === this.TCS_TYPE_CODE){
      if(!save.saved){
        this.tcsMode = 'VIEW';
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.tcsGridOptions = this.initGridOptions(this.TCS_TYPE_CODE, this.tcsGridApi);
        return;
      } else {
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.tcsGridOptions = this.initGridOptions(this.TCS_TYPE_CODE, this.tcsGridApi);
      }
    }

    if(save && save.type === this.ADVANCE_TYPE_CODE){
      if(!save.saved){
        this.advanceMode = 'VIEW';
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.otherThanTdsTcsGridOptions = this.initGridOptions(this.ADVANCE_TYPE_CODE, this.otherThanTdsTcsGridApi);
        return;
      } else {
        this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
        this.taxPaid = this.Copy_ITR_JSON.taxPaid;
        // this.onSalaryGridApi?.setRowData(this.tdsDetailCreateRowData(this.TDS_TYPE_CODE));
        this.otherThanTdsTcsGridOptions = this.initGridOptions(this.ADVANCE_TYPE_CODE, this.otherThanTdsTcsGridApi);
      }
    }

    this.loading = true;

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: ITR_JSON) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Tds updated successfully.');
        if(!save) {
          this.saveAndNext.emit(false);
        }
        // this.saveAndNext.emit({ subTab: true, tabName: 'CAPITAL' });
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to update tds.');
        this.loading = false;
      }
    );
  }

  getItrDocuments() {
    const param1 = `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    });
  }

  deleteFile(fileName) {
    let adminId = this.utilsService.getLoggedInUserID();
    var path = '/itr/cloud/files?actionBy=' + adminId;
    let filePath = `${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log(
      'URL path: ',
      path,
      ' filePath: ',
      filePath,
      ' Request body: ',
      reqBody
    );
    // https://uat-api.taxbuddy.com/itr/cloud/files?actionBy=%7BuserId%7D
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe(
      (response: any) => {
        this.utilsService.showSnackBar(response.response);
        this.getItrDocuments();
      },
      (error) => {
        this.utilsService.showSnackBar(error.response);
      }
    );
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        this.deletedFileData = res;
        console.log('Deleted file detail info: ', this.deletedFileData);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getItrDocuments();
    }
  }

  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: '',
  };
  getDocsUrl(index) {
    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl =
          this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }

  //new design
  addMore(type) {
    if (type === 'salary') {
      this.isAddSalary = Math.random();
    } else if (type === 'other') {
      this.tdsOtherThanSalaryComponent.addSalary();
    } else if (type === 'panBased') {
      this.tdsOtherThanSalaryComponent1.addSalary();
    } else if (type === 'tcs') {
      this.isAddTcs = Math.random();
    } else if (type === 'advance') {
      this.isAddAdvance = Math.random();
    }
  }

  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(false);
    //this.router.navigate(['/itr-filing/itr']);
  }
}

function extractValues(mappings) {
  const array = [];
  if (mappings) {
    mappings.forEach((element) => {
      array.push(element);
    });
  }
  // console.log("")
  return array;
}

function lookupValue(mappings, key) {
  let country = '';
  mappings.forEach((element) => {
    if (element.code === key) {
      country = element.name;
    }
  });
  if (country !== '' && country !== undefined && country !== null) {
    return `${country[0]}${country.substr(1).toLowerCase()}`;
  } else {
    return '';
  }
}

// convert value to code
function lookupKey(mappings, name) {
  mappings.forEach((element) => {
    if (element.code === name) {
      return element.name;
    }
  });
}
