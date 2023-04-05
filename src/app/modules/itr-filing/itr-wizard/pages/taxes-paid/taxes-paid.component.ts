import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GridOptions, ValueSetterParams } from 'ag-grid-community';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AgGridMaterialSelectEditorComponent } from 'src/app/modules/shared/dropdown.component';
import { CustomDateComponent } from 'src/app/modules/shared/date.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import * as moment from 'moment';
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";
@Component({
  selector: 'app-taxes-paid',
  templateUrl: './taxes-paid.component.html',
  styleUrls: ['./taxes-paid.component.css']
})
export class TaxesPaidComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
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

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
  }

  ngOnInit() {
    this.getItrDocuments();
  }

  saveAll() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Tds updated successfully.');
      // this.saveAndNext.emit({ subTab: true, tabName: 'CAPITAL' });
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update tds.');
      this.loading = false;
    });
  }

  getItrDocuments() {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    })
  }

  deleteFile(fileName) {
    let adminId = this.utilsService.getLoggedInUserID();
    var path = '/itr/cloud/files?actionBy=' + adminId;
    let filePath = `${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    // https://uat-api.taxbuddy.com/itr/cloud/files?actionBy=%7BuserId%7D
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((response: any) => {
      this.utilsService.showSnackBar(response.response);
      this.getItrDocuments();
    },
      error => {
        this.utilsService.showSnackBar(error.response);
      })
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.deletedFileData = res;
      console.log('Deleted file detail info: ', this.deletedFileData);
    },
      error => {
        this.loading = false;
      })
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

  //new design
  addMore(type) {
    if (type === 'salary') {
      this.isAddSalary = Math.random();
    } else if (type === 'other') {
      this.isAddOther = Math.random();
    } else if (type === 'panBased') {
      this.isAddPanBased = Math.random();
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
    if (element.code === key) {
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
    if (element.code === name) {
      return element.name
    }
  });
}
