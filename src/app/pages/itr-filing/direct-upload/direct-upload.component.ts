import { UtilsService } from 'app/services/utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { HttpHeaders, HttpRequest, HttpEvent, HttpEventType, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { AppConstants } from 'app/shared/constants';
import { Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';

@Component({
  selector: 'app-direct-upload',
  templateUrl: './direct-upload.component.html',
  styleUrls: ['./direct-upload.component.css']
})
export class DirectUploadComponent implements OnInit {
  @ViewChild('stepper', { static: true, read: MatStepper }) private stepper: MatStepper;

  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  personalForm: FormGroup;
  incomeForm: FormGroup;
  taxSavingForm: FormGroup;
  insuranceForm: FormGroup;
  tdsTcsForm: FormGroup;
  declarationForm: FormGroup;
  tabIndex = 0;
  viewer = 'DOC';
  docUrl = '';
  showError: boolean;
  errorMessage: string;
  successMsg: string;
  itrDocuments = [];

  upload: boolean = false;
  constructor(private httpClient: HttpClient, private router: Router, private itrMsService: ItrMsService, private utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.getDocuments();
  }

  isErrorMessage: string = '';
  uploaded: number;
  showProgress: boolean;
  filesize: string;
  loaded: string;
  onUploadFile(event) {
    let fileList: FileList = event.target.files;
    this.file = FileList = event.target.files;
    console.log("My fileList after Select==", fileList[0].name)
    this.fileName = fileList[0].name;
  }
  uploadXML() {

    this.loading = true;
    this.showError = false;
    let param = `/itr/api/directFilling?itrId=${this.ITR_JSON.itrId}`
    if (this.file !== undefined && this.file !== null) {
      let myfile: File = this.file[0];
      let formData: FormData = new FormData();
      formData.append('file', myfile);
      // const user = JSON.parse(sessionStorage.getItem('user_object'));
      const user = JSON.parse(localStorage.getItem('UMD'));
      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${user.id_token}`
        }),
        reportProgress: true
      };
      const url = environment.url + param;
      const req = new HttpRequest('POST', url, formData, httpOptions);
      this.httpClient.request(req).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent!');
            console.log('HttpEventType.Sent ', HttpEventType.Sent);
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header received!');
            break;
          case HttpEventType.UploadProgress:
            this.showProgress = true;
            this.filesize = Math.round((event.total / 1024)).toString();
            this.loaded = Math.round((event.loaded / 1024)).toString();
            this.uploaded = Math.round(event.loaded * 100 / event.total);
            console.log(`Download in progress! ${this.uploaded} % loaded`);
            break;
          case HttpEventType.Response:
            console.log('Done!', event.body);
            this.loading = false;
            sessionStorage.setItem('DIRECT_UPLOAD_RES', JSON.stringify(HttpEventType.Response))
            this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'success' } })

            this.showProgress = false;
            // this.ITR_JSON = event.body;
            // this.encrDecrService.set(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
            this.successMsg = "Successfully uploaded XML file."

          // this.callerObj.getXml();
          case HttpEventType.User:
            console.log('Done!', HttpEventType.User);
        }

      }, error => {
        this.loading = false;
        this.showError = true;
        this.showProgress = false;
        console.log("File upload Error", error)
        console.log("File upload Error status", error.error.message)
        if (error.error.status === 400 && error.error.detail === "ERROR") {
          this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'fail' } })
          this.errorMessage = 'Oops! failed to upload your XML...';
        } else if (error.error.status === 400 && error.error.detail === "DELAY") {
          this.errorMessage = 'Delayed Please check on ITR website';
          this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'delay' } })
        }
      })
    } else {
      this.loading = false;
      this.showError = true;
      this.utilsService.showSnackBar
    }
    // }
  }
  file: File;
  fileName: any;
  selectFile(event) {
    let fileList: FileList = event.target.files;
    this.file = FileList = event.target.files;
    console.log("My fileList after Select==", fileList[0].name)
    this.fileName = fileList[0].name;
  }

  saveAndNext(event) {
    this.stepper.next();
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
  }

  commonDocuments = []
  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.commonDocuments = result;
    })
  }

  uploadSummary() {
    this.loading = true;
    this.showError = false;
    let param = `/itr/summary/upload-and-send`
    if (this.file !== undefined && this.file !== null) {
      let myfile: File = this.file[0];
      let formData: FormData = new FormData();
      formData.append('file', myfile);
      formData.append('userId', this.ITR_JSON.userId.toString());
      // const user = JSON.parse(sessionStorage.getItem('user_object'));
      const user = JSON.parse(localStorage.getItem('UMD'));
      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${user.id_token}`
        }),
        reportProgress: true
      };
      const url = environment.url + param;
      const req = new HttpRequest('POST', url, formData, httpOptions);
      this.httpClient.request(req).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent!');
            console.log('HttpEventType.Sent ', HttpEventType.Sent);
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header received!');
            break;
          case HttpEventType.UploadProgress:
            this.showProgress = true;
            this.filesize = Math.round((event.total / 1024)).toString();
            this.loaded = Math.round((event.loaded / 1024)).toString();
            this.uploaded = Math.round(event.loaded * 100 / event.total);
            console.log(`Download in progress! ${this.uploaded} % loaded`);
            break;
          case HttpEventType.Response:
            console.log('Done!', event.body);
            this.loading = false;
            this.utilsService.showSnackBar(event.body['response']);
            this.showProgress = false;
          case HttpEventType.User:
            this.file = null;
            console.log('Done!', HttpEventType.User);
            this.getDocuments();
        }

      }, error => {
        this.loading = false;
        this.showProgress = false;
        console.log("File upload Error", error)
        this.utilsService.showSnackBar('Error while uploading Summary.');

      })
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please select file!')
    }
    // }
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
}
