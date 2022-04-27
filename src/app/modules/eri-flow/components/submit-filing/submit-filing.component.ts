import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Input, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
declare let $: any;
@Component({
  selector: 'app-submit-filing',
  templateUrl: './submit-filing.component.html',
  styleUrls: ['./submit-filing.component.scss']
})
export class SubmitFilingComponent implements OnInit {
  uploadDoc: any;
  loading = false;
  ITR_JSON: ITR_JSON;
  isValidateJson = false;
  validateJsonResponse: any;
  submitJsonForm: FormGroup;
  @Input() data: any;
  constructor(private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private fb: FormBuilder) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.submitJsonForm = this.fb.group({
      assessmentYear: ['', [Validators.required]],
      itrType: ['', [Validators.required]],
      returnType: ['', [Validators.required]]
    });
  }
  selectJson(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }
  upload() {
    console.log('upload')
    document.getElementById("input-file-id").click();
  }

  validateJson(document) {
    if (this.submitJsonForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append("file", document);
      let annualYear = this.submitJsonForm.controls['assessmentYear'].value.toString().slice(0, 4);
      console.log('annualYear: ', annualYear);
      formData.append("formCode", this.submitJsonForm.controls['itrType'].value);
      formData.append("ay", annualYear);
      formData.append("filingTypeCd", this.submitJsonForm.controls['returnType'].value);
      let param = '/eri/direct-upload-validate-json';
      this.itrMsService.postMethodForEri(param, formData).subscribe((res: any) => {
        this.loading = false;
        this.isValidateJson = true;
        console.log('uploadDocument response =>', res);
        if (this.utilsService.isNonEmpty(res)) {
          if (res && res.successFlag) {
            if (res.hasOwnProperty('messages')) {
              if (res.messages instanceof Array && res.messages.length > 0)
                this.utilsService.showSnackBar(res.messages[0].desc);
              setTimeout(() => {
                this.utilsService.showSnackBar('JSON validated successfully.');
              }, 3000);
            }
          }
          else {
            if (res.errors instanceof Array && res.errors.length > 0) {
              this.utilsService.showSnackBar(res.errors[0].desc);
            }
            else if (res.messages instanceof Array && res.messages.length > 0) {
              this.utilsService.showSnackBar(res.messages[0].desc);
            }
          }
        }
        else {
          this.utilsService.showSnackBar('Response is null, try after some time.');
        }

      }, error => {
        this.loading = false;
        this.isValidateJson = false;
        this.utilsService.showSnackBar('Something went wrong, try after some time.');
      })
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  submit() {
    if (this.submitJsonForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append("file", this.uploadDoc);
      let annualYear = this.submitJsonForm.controls['assessmentYear'].value.toString().slice(0, 4);
      console.log('annualYear: ', annualYear);
      formData.append("formCode", this.submitJsonForm.controls['itrType'].value);
      formData.append("ay", annualYear);
      formData.append("filingTypeCd", this.submitJsonForm.controls['returnType'].value);
      formData.append("userId", this.data.userId);
      // formData.append("filingTeamMemberId", this.ITR_JSON.filingTeamMemberId.toString());
      let param = '/eri/direct-upload-submit-json';
      this.itrMsService.postMethodForEri(param, formData).subscribe((res: any) => {
        this.loading = false;
        this.validateJsonResponse = res;
        console.log('uploadDocument response =>', res);
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar(res.messages[0].desc);
          }
        } else {
          this.validateJsonResponse = '';
          if (res.errors instanceof Array && res.errors.length > 0) {
            this.utilsService.showSnackBar(res.errors[0].desc);
          } else if (res.messages instanceof Array && res.messages.length > 0) {
            this.utilsService.showSnackBar(res.messages[0].desc);
          }
        }
      }, error => {
        this.validateJsonResponse = '';
        this.loading = false;
        this.utilsService.showSnackBar('Something went wrong, try after some time.');
      })
    }
  }

}
