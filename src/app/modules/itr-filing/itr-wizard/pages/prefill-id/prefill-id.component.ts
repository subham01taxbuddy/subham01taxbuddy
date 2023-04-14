import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Inject } from '@angular/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { OtherIncomeComponent } from '../../../other-income/other-income.component';
import { AddClientsComponent } from '../../components/add-clients/add-clients.component';
import { Subscription } from 'rxjs';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-prefill-id',
  templateUrl: './prefill-id.component.html',
  styleUrls: ['./prefill-id.component.scss'],
})
export class PrefillIdComponent implements OnInit {
  downloadPrefillChecked: boolean = false;
  uploadPrefillChecked: boolean = false;
  uploadJsonChecked: boolean = false;
  downloadPrefill: boolean = false;
  uploadDoc: any;
  loading = false;
  showEriView = false;
  ITR_JSON: ITR_JSON;
  ITR_Type: string;
  @Input() data: any;
  @Output() skipPrefill: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
    private toastMessageService: ToastMessageService,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    console.log();
  }

  subscription: Subscription;

  subscribeToEmmiter(componentRef) {
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child: AddClientsComponent = componentRef;
    child.skipAddClient.subscribe(() => {
      this.skipToSources();
    });
    child.completeAddClient.subscribe(() => {
      this.showPrefillView();
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  skipToSources() {
    this.skipPrefill.emit(null);
  }

  proceedAfterUpload() {
    this.skipPrefill.emit(null);
  }

  showPrefillView() {
    this.showEriView = false;
  }

  addClient() {
    this.showEriView = true;
    this.router.navigate(['/itr-filing/itr/eri']);
  }

  downloadPrefillOpt() {
    this.downloadPrefill = true;
  }

  // PREFILL PAN VALIDATION
  uploadJsonFile(file: FileList) {
    console.log('File in prefill', file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);

      //read the file to get details upload and validate
      const reader = new FileReader();
      reader.onload = (e: any) => {
        let jsonRes = e.target.result;
        let JSONData = JSON.parse(jsonRes);

        let panNo = JSONData.personalInfo?.pan;
        let mobileNo = JSONData.personalInfo?.address?.mobileNo;
        if (panNo !== this.data?.panNumber) {
          this.toastMessageService.alert(
            'error',
            'PAN Number from profile and PAN number from json are different please confirm once.'
          );
          console.log('PAN mismatch');
          return;
        } else {
          this.uploadPrefillJson();
        }
      };
      reader.readAsText(this.uploadDoc);
    }
  }

  // Uploading Utility JSON
  uploadUtilityItrJson(file: FileList) {
    if (file.length > 0) {
      this.uploadDoc = file.item(0);

      //read the file to get details upload and validate
      const reader = new FileReader();
      reader.onload = (e: any) => {
        let jsonRes = e.target.result;
        let JSONData = JSON.parse(jsonRes);
        // console.log('JSONData: ', JSONData);
        this.mapItrJson(JSONData.ITR);
      };
      reader.readAsText(this.uploadDoc);
    }
  }

  ITR_Obj: ITR_JSON;
  mapItrJson(ItrJSON: any) {
    // ITR_Obj IS THE TB ITR OBJECT
    this.ITR_Obj = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('TB ITR OBJ - this.ITR_Obj: ', this.ITR_Obj);

    // ITR JSON IS THE UPLOADED UTILITY JSON
    console.log('Uploaded Utility: ', ItrJSON);

    if (ItrJSON.hasOwnProperty('ITR1')) {
      this.ITR_Obj.itrType = '1';
      this.ITR_Type = 'ITR1';
    } else if (ItrJSON.hasOwnProperty('ITR2')) {
      this.ITR_Obj.itrType = '2';
      this.ITR_Type = 'ITR2';
    } else if (ItrJSON.hasOwnProperty('ITR3')) {
      this.ITR_Obj.itrType = '3';
      this.ITR_Type = 'ITR3';
    } else if (ItrJSON.hasOwnProperty('ITR4')) {
      this.ITR_Obj.itrType = '4';
      this.ITR_Type = 'ITR4';
    }

    //Finding the way
    console.log(ItrJSON[this.ITR_Type]);

    // HAVE TO CREATE SEPERATE AS THE JSON STRUCTURE IS DIFFERENT FOR DIFFERENT ITR TYPES
    if ((this.ITR_Type = 'ITR1')) {
      // CUSTOMER PROFILE
      this.ITR_Obj.panNumber = ItrJSON[this.ITR_Type].PersonalInfo.PAN;
      this.ITR_Obj.contactNumber =
        ItrJSON[this.ITR_Type].PersonalInfo.Address.MobileNo;
      this.ITR_Obj.email =
        ItrJSON[this.ITR_Type].PersonalInfo.Address.EmailAddress;
      this.ITR_Obj.family[0].fName =
        ItrJSON[this.ITR_Type].PersonalInfo.AssesseeName.FirstName;
      this.ITR_Obj.family[0].lName =
        ItrJSON[this.ITR_Type].PersonalInfo.AssesseeName.SurNameOrOrgName;
      this.ITR_Obj.family[0].fatherName =
        ItrJSON[this.ITR_Type].Verification.Declaration.FatherName;
      // HAVE TO SET THE RES STATUS MANUALLY AS THIS KEY IS NOT AVAILABLE IN JSON AS OF 14/04/23 AND ONLY "RESIDENT" ARE ALLOWED UNDER ITR1 - PENDING
      this.ITR_Obj.residentialStatus = 'Resident';

      // HAVE TO CHECK WHAT IS THE VALUE THAT WE ARE TAKING FOR EMPLOYER CATEGORY AS THE KEY IN JSON MIGHT BE DIFFERENT - PENDING
      this.ITR_Obj.employerCategory =
        ItrJSON[this.ITR_Type].PersonalInfo.EmployerCategory;
      // HAVE TO SET THE RETURN TYPE HERE - PENDING
      // this.ITR_Obj.returnType =
      //   ItrJSON[this.ITR_Type].FilingStatus.ReturnFileSec;
      this.ITR_Obj.aadharNumber =
        ItrJSON[this.ITR_Type].PersonalInfo.AadhaarCardNo;
      this.ITR_Obj.family[0].dateOfBirth =
        ItrJSON[this.ITR_Type].PersonalInfo.DOB;

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_Obj)
      );
      console.log(this.ITR_Obj);
    }

    this.ITR_Obj.employerCategory = ItrJSON.PersonalInfo.EmployerCategory;
    this.ITR_Obj.regime = ItrJSON.FilingStatus.NewTaxRegime;

    let address = ItrJSON.PersonalInfo.Address;
    this.ITR_Obj.email = address.EmailAddress;
    this.ITR_Obj.contactNumber = address.MobileNo;
    this.ITR_Obj.contactNumber = address.MobileNo;

    let hole_address =
      (address.hasOwnProperty('ResidenceNo') ? address.ResidenceNo : '') +
      ' ,' +
      (address.hasOwnProperty('ResidenceName') ? address.ResidenceName : '') +
      ' ,' +
      (address.hasOwnProperty('RoadOrStreet') ? address.RoadOrStreet : '') +
      ' ,' +
      (address.hasOwnProperty('LocalityOrArea') ? address.LocalityOrArea : '');
    this.ITR_Obj.address.premisesName = hole_address;
    this.ITR_Obj.address.pinCode = address.PinCode;

    //country, city, state data getting through api call unsin pine code

    var assessmentYear;
    if (ItrJSON.hasOwnProperty('Form_ITR1')) {
      assessmentYear = ItrJSON.Form_ITR1.AssessmentYear;
    } else if (ItrJSON.hasOwnProperty('Form_ITR4')) {
      assessmentYear = ItrJSON.Form_ITR4.AssessmentYear;
    }

    if (assessmentYear === '2023') {
      this.ITR_Obj.assessmentYear = '2023-24';
      this.ITR_Obj.financialYear = '2022-23';
    } else if (assessmentYear === '2022') {
      this.ITR_Obj.assessmentYear = '2022-23';
      this.ITR_Obj.financialYear = '2021-22';
    } else if (assessmentYear === '2021') {
      this.ITR_Obj.assessmentYear = '2021-22';
      this.ITR_Obj.financialYear = '2020-21';
    } else if (assessmentYear === '2020') {
      this.ITR_Obj.assessmentYear = '2020-21';
      this.ITR_Obj.financialYear = '2019-20';
    }

    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_Obj));
  }

  upload(type: string) {
    if (type == 'pre-filled') {
      document.getElementById('input-jsonfile-id').click();
    } else if (type == 'utility') {
      document.getElementById('input-utility-file-jsonfile-id').click();
    }
  }

  uploadPrefillJson() {
    //https://uat-api.taxbuddy.com/itr/eri/prefill-json/upload
    this.loading = true;
    const formData = new FormData();
    formData.append('file', this.uploadDoc);
    formData.append('assessmentYear', this.data.assessmentYear);
    formData.append('userId', this.data.userId.toString());
    let param = '/eri/prefill-json/upload';
    this.itrMsService.postMethod(param, formData).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('uploadDocument response =>', res);
        if (res && res.success) {
          this.utilsService.showSnackBar(res.message);
          //prefill uploaded successfully, fetch ITR again
          this.fetchUpdatedITR();
        } else {
          if (res.errors instanceof Array && res.errors.length > 0) {
            this.utilsService.showSnackBar(res.errors[0].desc);
          } else if (res.messages instanceof Array && res.messages.length > 0) {
            this.utilsService.showSnackBar(res.messages[0].desc);
          }
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Something went wrong, try after some time.'
        );
      }
    );
  }

  async fetchUpdatedITR() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

    const param = `/itr?userId=${this.data.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}&itrId=${this.data.itrId}`;
    this.itrMsService.getMethod(param).subscribe(
      async (result: any) => {
        console.log('My ITR by user Id and Assessment Years=', result);
        if (result == null || result.length == 0) {
          //invalid case here
          this.utilsService.showErrorMsg(
            'Something went wrong. Please try again.'
          );
        } else if (result.length == 1) {
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(result[0])
          );
        } else {
          //multiple ITRs found, invalid case
          this.utilsService.showErrorMsg(
            'Something went wrong. Please try again.'
          );
        }
      },
      async (error: any) => {
        console.log('Error:', error);
        this.loading = false;
        this.utilsService.showErrorMsg(
          'Something went wrong. Please try again.'
        );
      }
    );
  }

  onCheckboxChange(checkboxNumber: number) {
    if (checkboxNumber === 1) {
      this.uploadPrefillChecked = false;
      this.uploadJsonChecked = false;
    }
    if (checkboxNumber === 2) {
      this.downloadPrefillChecked = false;
      this.uploadJsonChecked = false;
    }
    if (checkboxNumber === 3) {
      this.downloadPrefillChecked = false;
      this.uploadPrefillChecked = false;
    }
  }

  addClientOverBot() {
    const param = `/eri/send-otp-payload?userId=${this.data.userId}&serviceType=ITR`;

    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        if (res && res.success) {
          this.utilsService.showSnackBar(
            'Add Client over chatbot has been initiated'
          );
        } else {
          this.utilsService.showSnackBar('An error occured. Please try again');
        }
      },
      (error) => {
        this.utilsService.showSnackBar(
          'Something went wrong, try after some time.'
        );
        this.loading = false;
      }
    );
  }
}
