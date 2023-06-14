import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UpdateManualFilingDialogComponent } from '../../../shared/components/update-manual-filing-dialog/update-manual-filing-dialog.component';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessSubmitFilingComponent } from '../success-submit-filing/success-submit-filing.component';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
declare let $: any;
@Component({
  selector: 'app-submit-filing',
  templateUrl: './submit-filing.component.html',
  styleUrls: ['./submit-filing.component.scss']
})
export class SubmitFilingComponent implements OnInit, OnChanges {
  uploadDoc: any;
  loading = false;
  selectedOption = 'MANUAL';
  // ITR_JSON: ITR_JSON;
  isValidateJson = false;
  validateJsonResponse: any;
  submitJsonForm: FormGroup;
  manualUpdateForm: FormGroup;
  @Input() itrData: any;
  constructor(private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router) {
    this.itrData = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.log('ITR Object in submit filing:', this.itrData)
    this.submitJsonForm = this.fb.group({
      assessmentYear: ['', [Validators.required]],
      itrType: [{ value: '', disabled: true }, [Validators.required]],
      returnType: [{ value: '', disabled: true }, [Validators.required]]
    });
    this.manualUpdateForm = this.fb.group({
      userId: ['', [Validators.required]],
      itrId: ['', [Validators.required]],
      email: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      panNumber: ['', [Validators.required]],
      aadharNumber: [''],
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

      let headerObj = {
        'panNumber': this.itrData.panNumber,
        'assessmentYear': '2022-2023',
        'userId': this.itrData.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

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
      formData.append("filingTeamMemberId", this.itrData.filingTeamMemberId);
      let headerObj = {
        'panNumber': this.itrData.panNumber,
        'assessmentYear': '2022-2023',
        'userId': this.itrData.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      let param = '/eri/direct-upload-submit-json';
      this.itrMsService.postMethodForEri(param, formData).subscribe((res: any) => {
        this.loading = false;
        // {"messages":[],"errors":[],"arnNumber":"651278200050622","successFlag":true,"transactionNo":"ITR000246149901","httpStatus":"ACCEPTED","header":{"formName":null}}
        this.validateJsonResponse = res;
        console.log('uploadDocument response =>', res);
        if (res && res.successFlag) {
          if (res.httpStatus === 'ACCEPTED' && res.transactionNo) {
            this.utilsService.showSnackBar('Successfully filed with transaction no: ' + res.transactionNo);
            this.openSuccessDialog(res.arnNumber, res.transactionNo);
            return;
          }
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
      this.submitJsonForm.patchValue(this.itrData);
      this.submitJsonForm.controls['returnType'].setValue('O');
      this.findAssesseeType();
      if (this.itrData.isRevised === 'Y') {
        this.submitJsonForm.controls['returnType'].setValue('R');
      }

    }
  }
  updateManualFiling() {
    if (this.manualUpdateForm.valid) {
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

  openSuccessDialog(arnNumber, transactionNo) {
    const param = '/itr/searchByItrId?itrId=' + this.itrData.itrId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      let disposable = this.dialog.open(SuccessSubmitFilingComponent, {
        width: '50%',
        height: 'auto',
        data: { ITR_JSON: res, arnNumber: arnNumber, transactionNo: transactionNo }
      })

      disposable.afterClosed().subscribe(result => {
        this.router.navigate(['/tasks/assigned-users-new'])
      });
    })
  }
}
