import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { GridOptions, ValueSetterParams } from 'ag-grid-community';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
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
  onSalaryGridOptions: GridOptions;
  tdsOtherThanSalary16AGridOptions: GridOptions;
  tdsOtherThanSalary26QBGridOptions: GridOptions;
  tcsGridOptions: GridOptions;
  otherThanTdsTcsGridOptions: GridOptions;
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
  public columnDefs: ColDef[] = [
    { field: 'edit' },
    { field: 'tdsDetail', rowGroup: true, hide: true },
    { field: 'tanPan' },
    { field: 'name' },
    { field: 'totalAmountCredited' },
    { field: 'totalTdsDeposited' },
    { field: 'headOfIncome' },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
  };
  public groupDisplayType: RowGroupingDisplayType = 'groupRows';
  public rowData!: tdsDetails[];

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    // this.taxesPaidGridOptions = <GridOptions>{
    //   rowData: [],
    //   columnDefs: this.taxesPaidColumnDef(),
    //   enableCellChangeFlash: true,
    //   enableCellTextSelection: true,
    //   onGridReady: (params) => {},
    //   sortable: true,
    // };
  }

  ngOnInit() {
    this.getItrDocuments();
  }

  addMoreTaxesPaid(mode) {
    const dialogRef = this.matDialog.open(TdsOnSalaryComponent, {
      data: {
        mode: mode,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });
    dialogRef.componentInstance.formDataSubmitted.subscribe((result) => {
      let mappedDatas: tdsDetails[] = [];
      result.forEach((element, i) => {
        let mappedData: tdsDetails = {
          edit: result[i].hasEdit || false,
          tdsDetail: 'TDS On Salary',
          tanPan: result[i].deductorTAN || '',
          name: result[i].deductorName || '',
          totalAmountCredited: result[i].totalAmountCredited || 0,
          totalTdsDeposited: result[i].totalTdsDeposited || 0,
          headOfIncome: '', // You need to provide a value for this property based on your data source
        };

        mappedDatas.push(mappedData);
      });
      this.rowData = mappedDatas;
      console.log('Result add CG=', this.rowData, result);
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.rowData;
    console.log(this.rowData, 'rowData');
  }

  editSecuritiesForm(event) {}

  taxesPaidColumnDef() {
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['hasEdit'].value;
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'TAN / PAN',
        field: 'tanPan',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['nameOfTheUnits'].value;
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellOrBuyQuantity'].value;
        },
      },
      {
        headerName: 'Total amount credited',
        field: 'amountCredited',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellDate'].value;
        },
      },
      {
        headerName: 'Total Tax Deducted',
        field: 'totalTaxDeducted',
        width: 200,
        textAlign: 'center',
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellValuePerUnit'].value;
        },
      },
      {
        headerName: 'Select Head of Income',
        field: 'headOfIncome',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellValue'].value;
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
