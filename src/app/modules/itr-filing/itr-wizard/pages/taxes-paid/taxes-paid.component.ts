import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { GridOptions, ValueSetterParams } from 'ag-grid-community';
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
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { data } from 'jquery';
import {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  RowGroupingDisplayType,
} from 'ag-grid-community';

export interface tdsDetails {
  edit: boolean;
  tdsDetail: string;
  tanPan: string;
  name: string;
  totalAmountCredited: number;
  totalTdsDeposited: number;
  headOfIncome: string;
}

@Component({
  selector: 'app-taxes-paid',
  templateUrl: './taxes-paid.component.html',
  styleUrls: ['./taxes-paid.component.css'],
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
  tdsOtherThanSalary16AGridOptions: GridOptions;
  tdsOtherThanSalary26QBGridOptions: GridOptions;
  tcsGridOptions: GridOptions;
  otherThanTdsTcsGridOptions: GridOptions;

  allTdsDetails: GridOptions;
  public groupDisplayType: RowGroupingDisplayType = 'groupRows';
  onSalary: any = [];

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.tdsDetailsCallInConstructor();
  }

  ngOnInit() {
    this.getItrDocuments();
  }

  addMoreTaxesPaid(mode, type, rowIndex, assetDetails?) {
    const dialogRef = this.matDialog.open(TdsOnSalaryComponent, {
      data: {
        mode: mode,
        assetType: type,
        rowIndex: rowIndex,
        assetDetails: assetDetails,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.componentInstance.formDataSubmitted.subscribe((result) => {
      console.log('Result add CG=', result);
      this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
      this.onSalary = this.ITR_JSON?.taxPaid?.onSalary;

      if (result !== undefined) {
        if (mode === 'ADD') {
          result.forEach((element) => {
            this.onSalary.push(element);
          });
          setTimeout(() => {
            this.allTdsDetails.api?.setRowData(this.onSalary);
          }, 0);
        } else {
          this.onSalary.splice(result.rowIndex, 1, result);
          setTimeout(() => {
            this.allTdsDetails.api?.setRowData(this.onSalary);
          }, 0);
        }
        // this.calculateCg();
      }
    });
  }

  tdsDetailsCallInConstructor() {
    this.allTdsDetails = <GridOptions>{
      rowData: this.tdsDetailCreateRowData(),
      columnDefs: this.tdsDetailCreateColumnDef(),
      onGridReady: () => {
        this.allTdsDetails.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
      },
      suppressRowTransform: true,
      rowGroup: true,
      autoGroupColumnDef: {
        headerName: 'TDS Type',
        field: 'deductorTAN',
      },
    };
  }

  tdsDetailCreateRowData() {
    return this.ITR_JSON.taxPaid.onSalary;
  }

  tdsDetailCreateColumnDef() {
    return [
      {
        headerName: 'TDS Type',
        field: 'deductorTAN',
        rowGroup: true,
        hide: true,
      },
      {
        headerName: 'TAN / PAN',
        field: 'deductorTAN',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorTAN;
        },
      },
      {
        headerName: 'Name',
        field: 'deductorName',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.deductorName;
        },
      },
      {
        headerName: 'Total Amount Creditsed',
        field: 'totalAmountCredited',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalAmountCredited;
        },
      },
      {
        headerName: 'Total TDS deposited',
        field: 'totalTdsDeposited',
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
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
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
        pinned: 'right',
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

  saveAll() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

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
        this.saveAndNext.emit(false);
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
