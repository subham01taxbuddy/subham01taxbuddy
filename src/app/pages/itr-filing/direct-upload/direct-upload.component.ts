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

  // callerObj: StatisticItrComponent;
  showError: boolean;
  errorMessage: string;
  // uploadXMLForm: FormGroup;
  successMsg: string;
  successValue: boolean = false;
  busy: boolean = false
  itrDocuments = [];

  upload: boolean = false;
  constructor(private httpClient: HttpClient, private router: Router, private itrMsService: ItrMsService,) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.getItrDocuments();
    this.getCommonDocuments();
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
    debugger
    this.loading = true;
    this.showError = false;
    this.successValue = false;
    let param = `/itr/api/directFilling?itrId=${this.ITR_JSON.itrId}`
    // if (this.uploadXMLForm.valid) {
    /* if (this.uploadXMLForm.controls['caId'].value !== null && this.uploadXMLForm.controls['caId'].value !== undefined && this.uploadXMLForm.controls['caId'].value !== "") {
      param = "api/directFilling?caId=" + this.uploadXMLForm.controls['caId'].value
    } */
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
      this.busy = true;
      this.httpClient.request(req).subscribe((event: HttpEvent<any>) => {
        // this.busy = false
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

            this.busy = false;
            this.showProgress = false;
            // this.ITR_JSON = event.body;
            // this.encrDecrService.set(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
            this.successValue = true
            this.successMsg = "Successfully uploaded XML file."
            setTimeout(() => {
              this.successValue = false;
              // this.result = true;
              // this.close();
            }, 4000)
          // this.callerObj.getXml();
          case HttpEventType.User:
            console.log('Done!', HttpEventType.User);
        }

      }, error => {
        this.loading = false;

        this.successValue = false;
        this.showError = true;
        this.showProgress = false;
        this.busy = false
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
      this.errorMessage = "Please select the file";
      setTimeout(() => {
        this.showError = false;
      }, 3000)
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
  getCommonDocuments() {
    const param = `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.commonDocuments = result;
    })
  }
  getItrDocuments() {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
      this.getDocsUrl(0);
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

  getCommonDocsUrl(index) {
    if (this.commonDocuments.length > 0) {
      const docType = this.commonDocuments[index].fileName.split('.').pop();
      if (this.commonDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.commonDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.commonDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }
  }
}
