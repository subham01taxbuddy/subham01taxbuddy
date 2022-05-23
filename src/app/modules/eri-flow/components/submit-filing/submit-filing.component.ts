import { UpdateManualFilingDialogComponent } from '../../../shared/components/update-manual-filing-dialog/update-manual-filing-dialog.component';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-submit-filing',
  templateUrl: './submit-filing.component.html',
  styleUrls: ['./submit-filing.component.scss']
})
export class SubmitFilingComponent implements OnInit, OnChanges {
  uploadDoc: any;
  loading = false;
  // ITR_JSON: ITR_JSON;
  isValidateJson = false;
  validateJsonResponse: any;
  submitJsonForm: FormGroup;
  manualUpdateForm: FormGroup;
  @Input() itrData: any;
  constructor(private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private dialog: MatDialog,) {
    // this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.log('ITR Object in submit filing:', this.itrData)
    this.submitJsonForm = this.fb.group({
      assessmentYear: ['', [Validators.required]],
      itrType: ['', [Validators.required]],
      returnType: ['', [Validators.required]]
    });
    this.manualUpdateForm = this.fb.group({
      userId: ['', [Validators.required]],
      itrId: ['', [Validators.required]],
      email: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      panNumber: ['', [Validators.required]],
      aadharNumber: ['', [Validators.required]],
      assesseeType: ['', [Validators.required]],
      assessmentYear: ['', [Validators.required]],
      financialYear: ['', [Validators.required]],
      isRevised: ['', [Validators.required]],
      eFillingCompleted: [true],
      eFillingDate: [''],
      ackNumber: [''],
      itrType: ['', [Validators.required]],
      itrTokenNumber: [''],
      filingTeamMemberId: ['', [Validators.required]],
      filingSource: ['MANUALLY', [Validators.required]]
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
      formData.append("userId", this.itrData.userId);
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
  ngOnChanges() {
    console.log('ngOnChanges Submit filing:', this.itrData);
    if (this.itrData) {
      this.manualUpdateForm.patchValue(this.itrData);
      this.findAssesseeType();
    }
  }
  updateManualFiling() {
    if (this.manualUpdateForm.valid) {
      // let manulFiling = {
      //   "userId": this.itrData.userId,
      //   "itrId": this.itrData.itrId,
      //   "email": this.itrData.email,
      //   "contactNumber": this.itrData.contactNumber,
      //   "panNumber": this.itrData.panNumber,
      //   "aadharNumber": this.itrData.aadharNumber,
      //   "assesseeType": this.itrData.assesseeType,
      //   "assessmentYear": this.itrData.assessmentYear,
      //   "financialYear": this.itrData.financialYear,
      //   "isRevised": this.itrData.isRevised,
      //   "eFillingCompleted": true,
      //   "eFillingDate": "",
      //   "ackNumber": "",
      //   "itrType": this.itrData.itrType,
      //   "itrTokenNumber": "",
      //   "filingTeamMemberId": this.itrData.filingTeamMemberId,
      //   "filingSource": "MANUALLY"
      // }

      let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
        width: '50%',
        height: 'auto',
        data: this.manualUpdateForm.getRawValue()
      })

      disposable.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    } else {
      this.utilsService.showSnackBar('Please fetch the summary on previous tab first and then update the details here.')
    }
  }

  findAssesseeType() {
    if (this.manualUpdateForm.controls['panNumber'].valid) {
      const pan = this.manualUpdateForm.controls['panNumber'].value;
      if (pan.substring(4, 3) === 'P') {
        this.manualUpdateForm.controls['assesseeType'].setValue('INDIVIDUAL');
      } else if (pan.substring(4, 3) === 'H') {
        this.manualUpdateForm.controls['assesseeType'].setValue('HUF');
      } else {
        this.manualUpdateForm.controls['assesseeType'].setValue('INDIVIDUAL');
      }
    }
  }
}
