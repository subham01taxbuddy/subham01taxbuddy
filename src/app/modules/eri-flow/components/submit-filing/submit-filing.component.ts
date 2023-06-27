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
import { UserMsService } from 'src/app/services/user-ms.service';

declare let $: any;
@Component({
  selector: 'app-submit-filing',
  templateUrl: './submit-filing.component.html',
  styleUrls: ['./submit-filing.component.scss'],
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
  @Input() userDetails: any;
  jsonData: any;
  userProfile: any;
  constructor(
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private userMsService: UserMsService
  ) {
    console.log(this.itrData, 'itrdata');
    this.itrData = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.log('ITR Object in submit filing:', this.itrData);
    this.jsonData = this.utilsService.getAddClientJsonData();
    console.log(this.jsonData, 'JSONData');
    this.submitJsonForm = this.fb.group({
      assessmentYear: ['', [Validators.required]],
      itrType: [{ value: '', disabled: true }, [Validators.required]],
      returnType: [{ value: '', disabled: true }, [Validators.required]],
    });
    this.manualUpdateForm = this.fb.group({
      userId: ['', [Validators.required]],
      itrId: ['', [Validators.required]],
      email: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      panNumber: ['', [Validators.required]],
      aadharNumber: [''],
      assesseeType: ['INDIVIDUAL', [Validators.required]],
      assessmentYear: ['2023-2024', [Validators.required]],
      financialYear: ['2022-2023', [Validators.required]],
      isRevised: ['', [Validators.required]],
      eFillingCompleted: [true],
      eFillingDate: [''],
      ackNumber: [''],
      itrType: ['', [Validators.required]],
      itrTokenNumber: [''],
      filingTeamMemberId: ['', [Validators.required]],
      filingSource: ['MANUALLY', [Validators.required]],
    });

  }
  selectJson(file: FileList) {
    console.log('File', file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  // getUserProfile(userId){
  //   let param = '/search/userprofile/query?userId=' + userId;
  //   this.userMsService.getMethod(param).subscribe(
  //     (res: any) => {
  //       console.log('Get user info by userId: ', res);
  //       if (res && res.records instanceof Array) {
  //         this.userProfile = res.records[0];
  //       }
  //     });
  // }

  validateJson(document) {
    if (this.submitJsonForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append('file', document);
      let annualYear = this.submitJsonForm.controls['assessmentYear'].value
        .toString()
        .slice(0, 4);
      console.log('annualYear: ', annualYear);
      formData.append(
        'formCode',
        this.submitJsonForm.controls['itrType'].value
      );
      formData.append('ay', annualYear);
      formData.append(
        'filingTypeCd',
        this.submitJsonForm.controls['returnType'].value
      );
      let param = '/eri/direct-upload-validate-json';

      let headerObj = {
        panNumber: this.itrData.panNumber,
        assessmentYear: '2022-2023',
        userId: this.itrData.userId.toString(),
      };
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

      this.itrMsService.postMethodForEri(param, formData).subscribe(
        (res: any) => {
          this.loading = false;
          this.isValidateJson = true;
          console.log('uploadDocument response =>', res);
          if (this.utilsService.isNonEmpty(res)) {
            if (res && res.successFlag) {
              if (res.hasOwnProperty('messages')) {
                if (res.messages instanceof Array && res.messages.length > 0)
                  this.utilsService.showSnackBar(res.messages[0].desc);
                setTimeout(() => {
                  this.utilsService.showSnackBar(
                    'JSON validated successfully.'
                  );
                }, 3000);
              }
            } else {
              if (res.errors instanceof Array && res.errors.length > 0) {
                this.utilsService.showSnackBar(res.errors[0].desc);
              } else if (
                res.messages instanceof Array &&
                res.messages.length > 0
              ) {
                this.utilsService.showSnackBar(res.messages[0].desc);
              }
            }
          } else {
            this.utilsService.showSnackBar(
              'Response is null, try after some time.'
            );
          }
        },
        (error) => {
          this.loading = false;
          this.isValidateJson = false;
          this.utilsService.showSnackBar(
            'Something went wrong, try after some time.'
          );
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  submit() {
    if (this.submitJsonForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append('file', this.uploadDoc);
      let annualYear = this.submitJsonForm.controls['assessmentYear'].value
        .toString()
        .slice(0, 4);
      console.log('annualYear: ', annualYear);
      formData.append(
        'formCode',
        this.submitJsonForm.controls['itrType'].value
      );
      formData.append('ay', annualYear);
      formData.append(
        'filingTypeCd',
        this.submitJsonForm.controls['returnType'].value
      );
      formData.append('userId', this.itrData.userId);
      formData.append('filingTeamMemberId', this.itrData.filingTeamMemberId);
      let headerObj = {
        panNumber: this.itrData.panNumber,
        assessmentYear: '2022-2023',
        userId: this.itrData.userId.toString(),
      };
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      let param = '/eri/direct-upload-submit-json';
      this.itrMsService.postMethodForEri(param, formData).subscribe(
        (res: any) => {
          this.loading = false;
          // {"messages":[],"errors":[],"arnNumber":"651278200050622","successFlag":true,"transactionNo":"ITR000246149901","httpStatus":"ACCEPTED","header":{"formName":null}}
          this.validateJsonResponse = res;
          console.log('uploadDocument response =>', res);
          if (res && res.successFlag) {
            if (res.httpStatus === 'ACCEPTED' && res.transactionNo) {
              this.utilsService.showSnackBar(
                'Successfully filed with transaction no: ' + res.transactionNo
              );
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
            } else if (
              res.messages instanceof Array &&
              res.messages.length > 0
            ) {
              this.utilsService.showSnackBar(res.messages[0].desc);
            }
          }
        },
        (error) => {
          this.validateJsonResponse = '';
          this.loading = false;
          this.utilsService.showSnackBar(
            'Something went wrong, try after some time.'
          );
        }
      );
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

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  updateManualFiling() {
    this.jsonData = this.utilsService.getAddClientJsonData();
    let details = JSON.parse(sessionStorage.getItem('addClientData'));
    let itrId = '';

    const param = `/profile/${details.userId}`;
    this.userMsService.getMethod(param).subscribe((res:any) => {
      console.log(res);
      let itrType = '';
      let panNumber = '';
      if (this.jsonData.ITR.hasOwnProperty('ITR1')) {
        itrType = 'ITR1';
        panNumber = this.jsonData.ITR[itrType].PersonalInfo.PAN;
      } else if (this.jsonData.ITR.hasOwnProperty('ITR2')) {
        itrType = 'ITR2';
        panNumber = this.jsonData.ITR[itrType].PartA_GEN1.PersonalInfo.PAN;
      } else if (this.jsonData.ITR.hasOwnProperty('ITR3')) {
        itrType = 'ITR3';
        panNumber = this.jsonData.ITR[itrType].PartA_GEN1.PersonalInfo.PAN;
      } else if (this.jsonData.ITR.hasOwnProperty('ITR4')) {
        itrType = 'ITR4';
        panNumber = this.jsonData.ITR[itrType].PersonalInfo.PAN;
      }
      if(res.panNumber !== panNumber){
        //check the pan in json with pan in profile
        this.utilsService.showSnackBar('PAN Number from profile and PAN number from json are different please confirm once.')
        return;
      } else {
        const param1 = `/subscription-payment-status?userId=${details.userId}&serviceType=ITR`;
        this.itrMsService.getMethod(param1).subscribe(
          (res: any) => {
            if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
              if (details.itrObjectStatus === 'CREATE') {
                //no ITR object found, create a new ITR object
                this.loading = true;
                let profile = this.getUserProfile(details.userId).catch((error) => {
                  this.loading = false;
                  console.log(error);
                  this.utilsService.showSnackBar(error.error.detail);
                  return;
                });
                let objITR = this.utilsService.createEmptyJson(
                  profile,
                  details?.assessmentYear,
                  '2022-2023'
                );
                //Object.assign(obj, this.ITR_JSON)
                // Ashwini: Current implementation sends filing team member id as logged in user id.
                // So credit will go to the one who files ITR
                // changing the filingTeamMemberId to filerUserId so credit will go to assigned filer
                objITR.filingTeamMemberId = details.callerAgentUserId; //loggedInId;
                objITR.userId = details.userId;
                objITR.assessmentYear = details.assessmentYear;
                objITR.isRevised = 'N';
                //this.ITR_JSON = JSON.parse(JSON.stringify(obj))
                console.log('obj:', objITR);

                //update status to WIP
                //this.updateITRtoWIP(data, objITR, currentFyDetails[0].assessmentYear);

                const param = '/itr';
                this.itrMsService.postMethod(param, objITR).subscribe(
                  (result: any) => {
                    console.log('My iTR Json successfully created-==', result);
                    this.loading = false;
                    objITR = result;
                    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(objITR));
                  },
                  (error) => {
                    this.loading = false;
                  }
                );
                this.loading = false;
                console.log('end');
              } else {
                //one more ITR objects in place, use existing ITR object
                let itrFilter =
                  details.itrObjectStatus !== 'MULTIPLE_ITR'
                    ? `&itrId=${details.openItrId}`
                    : '';
                const param =
                  `/itr?userId=${details.userId}&assessmentYear=${details.assessmentYear}` +
                  itrFilter;
                this.itrMsService.getMethod(param).subscribe(
                  async (result: any) => {
                    console.log(`My ITR by ${param}`, result);
                    if (result == null || result.length == 0) {
                      //no ITR found, error case
                      this.utilsService.showErrorMsg(
                        'Something went wrong. Please try again'
                      );
                    } else if (result.length == 1) {
                      //update status to WIP
                      //this.updateITRtoWIP(data, result[0], currentFyDetails[0].assessmentYear);
                      let workingItr = result[0];
                      // Object.entries(workingItr).forEach((key, value) => {
                      //   console.log(key, value)
                      //   if (key[1] === null) {
                      //     delete workingItr[key[0]];
                      //   }
                      // });
                      let obj = this.utilsService.createEmptyJson(
                        null,
                        details.assessmentYear,
                        '2022-2023'
                      );
                      Object.assign(obj, workingItr);
                      workingItr.filingTeamMemberId = details.callerAgentUserId;
                      console.log('obj:', obj);
                      workingItr = JSON.parse(JSON.stringify(obj));
                      sessionStorage.setItem(
                        AppConstants.ITR_JSON,
                        JSON.stringify(workingItr)
                      );
                    } else {
                      //multiple ITRs found, navigate to ITR tab with the results
                      this.router.navigateByUrl('/tasks/filings', {
                        state: {mobileNumber: details?.mobileNumber},
                      });
                    }
                  },
                  async (error: any) => {
                    console.log('Error:', error);
                    this.utilsService.showErrorMsg(
                      'Something went wrong. Please try again'
                    );
                  }
                );
              }

              const ITRJSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
              ITRJSON.itrSummaryJson = this.jsonData;
              console.log(ITRJSON, 'ITRJSON');
              sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(ITRJSON));

              itrId = ITRJSON?.itrId;

              if (this.jsonData) {
                let finalJson = this.jsonData.ITR;
                let itrType = '';
                if (finalJson.hasOwnProperty('ITR1')) {
                  itrType = 'ITR1';
                } else if (finalJson.hasOwnProperty('ITR2')) {
                  itrType = 'ITR2';
                } else if (finalJson.hasOwnProperty('ITR3')) {
                  itrType = 'ITR3';
                } else if (finalJson.hasOwnProperty('ITR4')) {
                  itrType = 'ITR4';
                }
                if (itrType === 'ITR1' || itrType === 'ITR4') {
                  this.manualUpdateForm.controls['panNumber'].setValue(
                    finalJson[itrType].PersonalInfo.PAN
                  );
                  this.manualUpdateForm.controls['email'].setValue(
                    finalJson[itrType].PersonalInfo.Address?.EmailAddress
                  );
                  this.manualUpdateForm.controls['isRevised'].setValue(
                    finalJson[itrType].FilingStatus?.ReturnFileSec === 11 ? 'N' : 'Y'
                  );

                  this.manualUpdateForm.controls['itrType'].setValue(
                    itrType === 'ITR1' ? '1' : '4'
                  );
                }

                if (itrType === 'ITR2' || itrType === 'ITR3') {
                  this.manualUpdateForm.controls['panNumber'].setValue(
                    finalJson[itrType].PartA_GEN1.PersonalInfo?.PAN
                  );
                  this.manualUpdateForm.controls['email'].setValue(
                    finalJson[itrType].PartA_GEN1.PersonalInfo?.Address?.EmailAddress
                  );

                  this.manualUpdateForm.controls['isRevised'].setValue(
                    finalJson[itrType].PartA_GEN1?.FilingStatus?.ReturnFileSec === 11
                      ? 'N'
                      : 'Y'
                  );

                  this.manualUpdateForm.controls['itrType'].setValue(
                    itrType === 'ITR2' ? '2' : '3'
                  );
                }

                this.manualUpdateForm.controls['filingTeamMemberId'].setValue(
                  details.callerAgentUserId
                );
                this.manualUpdateForm.controls['userId'].setValue(details?.userId);
                this.manualUpdateForm.controls['contactNumber'].setValue(details?.mobileNumber);
                this.manualUpdateForm.controls['itrId'].setValue(itrId);
              }
              if (this.manualUpdateForm.valid) {
                let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
                  width: '50%',
                  height: 'auto',
                  data: this.manualUpdateForm.getRawValue(),
                });

                disposable.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed');
                });

                sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(ITRJSON));
              } else {
                this.utilsService.showSnackBar(
                  'All the required details for updating manually are not present. Please make sure that you have successfully uploaded the json in the previous step'
                );
              }
            } else {
              this.utilsService.showSnackBar(
                'Please make sure all the invoices are paid before updating the filing status.'
              );
            }
          });
      }
    });
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
        data: {
          ITR_JSON: res,
          arnNumber: arnNumber,
          transactionNo: transactionNo,
        },
      });

      disposable.afterClosed().subscribe((result) => {
        this.router.navigate(['/tasks/assigned-users-new']);
      });
    });
  }
}
