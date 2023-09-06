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
import { SelectionComponent } from './selection-component/selection-component.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { data } from 'jquery';
import {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  RowGroupingDisplayType,
} from 'ag-grid-community';
import { TcsComponent } from '../../components/tcs/tcs.component';
import { AdvanceTaxPaidComponent } from '../../components/advance-tax-paid/advance-tax-paid.component';

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
  isTaxesPaid: Number;
  @Input() taxPaid: TaxPaid;
  assetList: any;

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private matDialog: MatDialog
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let taxPaidData = this.ITR_JSON.taxPaid;
    if (taxPaidData) {
      this.taxPaid = taxPaidData;
    }

    this.allTdsDetails = <GridOptions>{
      rowData: this.tdsDetailCreateRowData(),
      columnDefs: this.tdsDetailCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      onGridReady: (params) => {},
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

  ngOnInit() {
    this.getItrDocuments();
  }

  addTaxesPaid(isEdit, index?) {
    this.isTaxesPaid = Math.random();
    const dialogRefSelect = this.matDialog.open(SelectionComponent, {
      data: {},
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRefSelect.afterClosed().subscribe((result) => {
      if (result === 'tdsOnSalary') {
        const dialogRef = this.matDialog.open(TdsOnSalaryComponent, {
          data: {
            isTaxesPaid: this.isTaxesPaid,
            assetIndex: index,
          },
          closeOnNavigation: true,
          disableClose: false,
          width: '100%',
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('Result of tdsOnSalary:', result);
          if (result !== undefined) {
            if (!isEdit) {
              this.taxPaid.onSalary.push(result.cgObject.salaryArray[index]);
            }
          }
        });
      } else if (result === 'tdsOtherThanSalary16A') {
        const dialogRef = this.matDialog.open(TdsOtherThanSalaryComponent, {
          data: {
            isTaxesPaid: this.isTaxesPaid,
            assetIndex: index,
          },
          closeOnNavigation: true,
          disableClose: false,
          width: '100%',
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('Result of tdsOtherThanSalary16A:', result);
          if (result !== undefined) {
            if (!isEdit) {
              // this.taxPaid.otherThanSalary16A.push(result.cgObject.salaryArray[index]);
            }
          }
        });
      } else if (result === 'tdsOtherThanSalaryPanBased') {
      } else if (result === 'tcs') {
        const dialogRef = this.matDialog.open(TcsComponent, {
          data: {
            isTaxesPaid: this.isTaxesPaid,
            assetIndex: index,
          },
          closeOnNavigation: true,
          disableClose: false,
          width: '100%',
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('Result of tcs:', result);
          if (result !== undefined) {
            if (!isEdit) {
              this.taxPaid.tcs.push(result.cgObject.salaryArray[index]);
            }
          }
        });
      } else if (result === 'selfAssessment') {
        const dialogRef = this.matDialog.open(AdvanceTaxPaidComponent, {
          data: {
            isTaxesPaid: this.isTaxesPaid,
            assetIndex: index,
          },
          closeOnNavigation: true,
          disableClose: false,
          width: '100%',
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('Result of advanceTax:', result);
          if (result !== undefined) {
            if (!isEdit) {
              // this.taxPaid.otherThanSalary16A.push(result.cgObject.salaryArray[index]);
            }
          }
        });
      }
    });
  }

  tdsDetailCreateRowData() {
    this.assetList = [];
    this.taxPaid.onSalary.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      this.assetList.push(copy);
    });
    this.taxPaid.otherThanSalary16A.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      this.assetList.push(copy);
    });
    this.taxPaid.otherThanSalary26QB.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      this.assetList.push(copy);
    });
    this.taxPaid.otherThanTDSTCS.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      this.assetList.push(copy);
    });
    this.taxPaid.tcs.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      // Rename specific properties
      copy.deductorName = copy.collectorName;
      copy.deductorTAN = copy.collectorTAN;
      copy.totalAmountCredited = copy.totalAmountPaid;
      copy.totalTdsDeposited = copy.totalTcsDeposited;
      delete copy.collectorName;
      delete copy.collectorTAN;
      delete copy.totalAmountPaid;
      delete copy.totalTcsDeposited;
      this.assetList.push(copy);
    });
    return this.assetList;
  }

  tdsDetailCreateColumnDef() {
    return [
      {
        headerName: 'TDS Type',
        field: 'deductorTAN',
        rowGroup: true,
      },
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
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

  public onTdsDetailRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE Asset:', params.data);
          this.deleteAsset();
          break;
        }
        case 'edit': {
          this.addTaxesPaid('EDIT', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteAsset() {
    //delete improvement for asset
    this.taxPaid = this.assetList.filter((asset) => asset.hasEdit != true);
    this.assetList = this.assetList.filter((asset) => asset.hasEdit != true);
    this.allTdsDetails.api?.setRowData(this.tdsDetailCreateRowData());

    // this.onSalary.splice(i, 1);
    // this.allTdsDetails.api?.setRowData(this.onSalary);
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
