import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, ViewChild, AfterContentChecked } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-itr-wizard',
  templateUrl: './itr-wizard.component.html',
  styleUrls: ['./itr-wizard.component.css']
})
export class ItrWizardComponent implements OnInit, AfterContentChecked {
  @ViewChild('stepper', { read: MatStepper }) private stepper: MatStepper;
  personalForm: FormGroup;
  incomeForm: FormGroup;
  taxSavingForm: FormGroup;
  insuranceForm: FormGroup;
  tdsTcsForm: FormGroup;
  declarationForm: FormGroup;
  tabIndex = 0;
  ITR_JSON: ITR_JSON;
  documents = []
  deletedFileData: any = [];
  viewer = 'DOC';
  docUrl = '';
  loading = false;
  personalInfoSubTab = 0;
  incomeSubTab = 0; 
  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('Inside on init itr wizard')
  }
  ngAfterContentChecked() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }
  previousTab(tab) {
    // if (tab === 'personal') {
    //   this.progressBarValue = 20;
    //   this.tabIndex = 0;
    // } else if (tab === 'income') {
    //   this.progressBarValue = 40;
    //   this.tabIndex = 1;
    // } else if (tab === 'taxSaving') {
    //   this.progressBarValue = 60;
    //   this.tabIndex = 2;
    // } else if (tab === 'insurance') {
    //   this.progressBarValue = 80;
    //   this.tabIndex = 3;
    // } else if (tab === 'taxPlaner') {
    //   this.progressBarValue = 0;
    //   // this.router.navigate(['/save-tax/tax-planner']);
    //   this.router.navigate(['/tax-planner']);
    // }
  }

  saveAndNext(event) {
    // need to check
    console.log('save and next function', event)
    if (event.subTab) {
      if (event.tabName === 'PERSONAL') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1
      } else if (event.tabName === 'OTHER') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1
      } else if (event.tabName === 'CAPITAL') {
        //other sources tab is 3, as tabs before this don't have save button
        this.incomeSubTab = 5
      }
    } else {
      this.stepper.next();
    }
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
    this.getDocuments();
    console.log('tab changed', this.tabIndex)
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getDocuments();
    }
  }

  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
    })
  }

  getSignedUrl(document) {
    console.log('document selected', document);
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }

    this.loading = true;
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  deleteFile(fileName) {
    let adminId = JSON.parse(localStorage.getItem("UMD"));
    var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
    let filePath = `${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((response: any) => {
      console.log('Doc delete response: ', response);
      this.utilsService.showSnackBar(response.response);
      this.getDocuments();
    },
      error => {
        console.log('Doc delete ERROR response: ', error.response);
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

  closeDialog() {
    this.deletedFileData = [];
  }
}
