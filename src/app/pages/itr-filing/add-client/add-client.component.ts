import { DatePipe, TitleCasePipe } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css'],
  providers: [DatePipe, TitleCasePipe]
})
export class AddClientComponent implements OnInit, OnDestroy {

  loading: boolean;
  ITR_JSON: ITR_JSON;
  addClientForm: FormGroup;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  headers: any;
  otpSend: boolean;
  uploadDoc: any;
  isValidateJson: boolean;
  validateJsonResponse: any; 

  page: any = {
    addClient: true,
    directUpload: false
  }
  personalInfo: any;

  constructor(private fb: FormBuilder, private utilsService: UtilsService, private itrService: ItrMsService, public datePipe: DatePipe, private utiService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.addClientForm = this.fb.group({
      panNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      otp: []
    })

    this.personalInfo = this.ITR_JSON.family[0];
    this.addClientForm.controls['dateOfBirth'].setValue(this.personalInfo.dateOfBirth);
    this.addClientForm.controls['panNumber'].setValue(this.ITR_JSON.panNumber);
    console.log('ITR_JSON: ', this.ITR_JSON);
    console.log('addClientForm value: ', this.addClientForm.value);

    let headerObj = {
      'panNumber': this.addClientForm.controls.panNumber.value,
      'assessmentYear':this.ITR_JSON.assessmentYear,
      'userId':this.ITR_JSON.userId
    }
    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
  }

  setOtpValidation(){
    if(!this.addClientForm.controls['panNumber'].valid){
      this.otpSend =false;
      this.addClientForm.controls['otp'].setValidators(null);
      this.addClientForm.controls['otp'].updateValueAndValidity();
    }
  }

  setUpperCase(){
    this.addClientForm.controls['panNumber'].setValue(this.utilsService.isNonEmpty(this.addClientForm.controls['panNumber'].value) ? this.addClientForm.controls['panNumber'].value.toUpperCase() : this.addClientForm.controls['panNumber'].value);
  }

  verifyPan() {
    if (this.addClientForm.valid) {
      this.loading = true;
      this.headers = new HttpHeaders();
      
      
      const param = '/eri/v1/api';
      const request = {
        "serviceName": "EriAddClientService",
        "pan": this.addClientForm.controls['panNumber'].value,
        "dateOfBirth": this.datePipe.transform(this.addClientForm.controls['dateOfBirth'].value, 'yyyy-MM-dd'),
        "otpSourceFlag": "E"
      }

      this.itrService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if(res.hasOwnProperty('messages') ){
            if(res.messages instanceof Array && res.messages.length > 0)
            this.utiService.showSnackBar(res.messages[0].desc);
            this.otpSend =true;
            this.addClientForm.controls['otp'].setValidators([Validators.required])
          }
        }
        else{
          if(res.hasOwnProperty('errors') ){
            if(res.errors instanceof Array && res.errors.length > 0)
            this.utiService.showSnackBar(res.errors[0].desc);
            this.otpSend =false;
            // if(res.errors[0].desc.includes('is already a client')){
            //   this.otpSend = true;
            // }
            this.addClientForm.controls['otp'].setValidators(null)
          }
        }
      },
        error => {
          this.utiService.showSnackBar('Something went wrong, try after some time.');
          this.loading = false;
          this.otpSend =false;
          this.addClientForm.controls['otp'].setValidators(null)
        })

    }
  }

  verifyOtp(){
    if(this.addClientForm.valid){
      this.loading = true;
      const param = '/eri/v1/api';
      const request = {
        "serviceName": "EriValidateClientService",
        "pan": this.addClientForm.controls['panNumber'].value,
        "otp": this.addClientForm.controls['otp'].value,
        "otpSourceFlag": "E"
      }

      this.itrService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if(res.hasOwnProperty('messages') ){
            if(res.messages instanceof Array && res.messages.length > 0)
            this.utiService.showSnackBar(res.messages[0].desc);
            this.changePage();
          }
        }
        else{
          if(res.errors instanceof Array && res.errors.length > 0){
            this.utiService.showSnackBar(res.errors[0].desc);
          }
          else if(res.messages instanceof Array && res.messages.length > 0){
            this.utiService.showSnackBar(res.messages[0].desc);
          }
        }
      },
        error => {
          this.loading = false;
          this.utiService.showSnackBar('Something went wrong, try after some time.');
        })
    }
  }

  uploadFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  uploadDocument(document){
    this.loading = true;
    const formData = new FormData();
    formData.append("file", document);
    let annualYear = this.ITR_JSON.assessmentYear.toString().slice(0,4);
    console.log('annualYear: ',annualYear);
    //let cloudFileMetaData = '{"formCode":"' + this.ITR_JSON.itrType + ',"ay":' + this.ITR_JSON.assessmentYear + ',"filingTypeCd":"O","userId ":' + this.ITR_JSON.userId + ',"filingTeamMemberId":' + this.ITR_JSON.filingTeamMemberId + '"}';
    formData.append("formCode",this.ITR_JSON.itrType);
    formData.append("ay", annualYear);
    formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    // formData.append("userId",this.ITR_JSON.userId.toString());
    // formData.append("filingTeamMemberId", this.ITR_JSON.filingTeamMemberId.toString());
    let param = '/eri/direct-upload-validate-json';
    this.itrService.postMethodForEri(param, formData).subscribe((res: any) => {
      this.loading = false;
      this.isValidateJson = true;
      console.log('uploadDocument response =>', res);
      if(this.utiService.isNonEmpty(res)){
        if (res && res.successFlag) {
          if(res.hasOwnProperty('messages') ){
            if(res.messages instanceof Array && res.messages.length > 0)
            this.utiService.showSnackBar(res.messages[0].desc);
            setTimeout(()=>{
              this.utiService.showSnackBar('JSON validated successfully.');
            },3000);
          }
        }
        else{
          if(res.errors instanceof Array && res.errors.length > 0){
            this.utiService.showSnackBar(res.errors[0].desc);
          }
          else if(res.messages instanceof Array && res.messages.length > 0){
            this.utiService.showSnackBar(res.messages[0].desc);
          }
        }
      }
      else{
        this.utiService.showSnackBar('Response is null, try after some time.');
      }
      
    }, error => {
      this.loading = false;
      this.isValidateJson = false;
      this.utiService.showSnackBar('Something went wrong, try after some time.');
    })
  }

  changePage(){
    this.page.directUpload = !this.page.directUpload;
    this.page.addClient = !this.page.addClient;
  }

  submit(){
    this.loading = true;
    const formData = new FormData();
    formData.append("file", this.uploadDoc);
    let annualYear = this.ITR_JSON.assessmentYear.toString().slice(0,4);
    console.log('annualYear: ',annualYear);
    formData.append("formCode",this.ITR_JSON.itrType);
    formData.append("ay", annualYear);
    formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    formData.append("userId",this.ITR_JSON.userId.toString());
    formData.append("filingTeamMemberId", this.ITR_JSON.filingTeamMemberId.toString());
    let param = '/eri/direct-upload-submit-json';
    this.itrService.postMethodForEri(param, formData).subscribe((res: any) => {
      this.loading = false;
      this.validateJsonResponse = res;
      console.log('uploadDocument response =>', res);
      if (res && res.successFlag) {
        if(res.hasOwnProperty('messages') ){
          if(res.messages instanceof Array && res.messages.length > 0)
          this.utiService.showSnackBar(res.messages[0].desc);
        }
      }
      else{
        this.validateJsonResponse = '';
          if(res.errors instanceof Array && res.errors.length > 0){
            this.utiService.showSnackBar(res.errors[0].desc);
          }
          else if(res.messages instanceof Array && res.messages.length > 0){
            this.utiService.showSnackBar(res.messages[0].desc);
          }
      }
    }, error => {
      this.validateJsonResponse = '';
      this.loading = false;
      this.utiService.showSnackBar('Something went wrong, try after some time.');
    })
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('ERI-Request-Header');
  }
}
