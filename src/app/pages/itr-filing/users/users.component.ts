import { AppConstants } from 'app/shared/constants';
import { ItrMsService } from './../../../services/itr-ms.service';
/**
* @Component UsersComponent
* @author Ashish Hulwan
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { UtilsService } from 'app/services/utils.service';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { environment } from 'environments/environment';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [DatePipe]
})

export class UsersComponent implements OnInit {
  loading: boolean = false;
  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  services: any = [];
  active_subscriptions: any = [];
  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, {
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];
  ITR_JSON: ITR_JSON;

  constructor(navbarService: NavbarService, public router: Router, public http: HttpClient, private itrMsService: ItrMsService,
    public _toastMessageService: ToastMessageService, private datePipe: DatePipe, private utilsService: UtilsService,
  ) {
    NavbarService.getInstance(null).component_link_2 = 'activate-package';
    NavbarService.getInstance(null).component_link_3 = '';
    NavbarService.getInstance(null).showBtns = 'activate-package';
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
  }


  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
    this.user_data = [];
    if (this.searchVal !== "") {
      this.getUserSearchList(key, this.searchVal);
    }
  }

  getUserSearchList(key, searchValue) {
    return new Promise((resolve, reject) => {
      this.user_data = [];
      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
        console.log("Search result:", res)
        if (Array.isArray(res.records)) {
          this.user_data = res.records
        }
        return resolve(true)
      }, err => {
        //let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(err.error.status));
        return resolve(false)
      });
    });
  }
  startFiling(userDetails) {
    this.loading = true;
    this.getITRByUserIdAndAssesmentYear(userDetails);
  }

  getITRByUserIdAndAssesmentYear(profile) {
    // this.isLoggedIn = this.encrDecrService.get(AppConstants.IS_USER_LOGGED_IN);
    const param = '/itr?userId=' + profile.userId + '&assessmentYear=' + AppConstants.ayYear;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('My ITR by user Id and Assesment Years=', result);
      if (result.length !== 0) {
        let isWIP_ITRFound = true;
        for (let i = 0; i < result.length; i++) {
          let currentFiledITR = result.filter(item => (item.assessmentYear === AppConstants.ayYear && item.eFillingCompleted));
          if (result[i].eFillingCompleted || result[i].ackStatus === 'SUCCESS' || result[i].ackStatus === 'DELAY') {
            //   return "REVIEW"
          } else {
            //   return "CONTINUE"
            isWIP_ITRFound = false;
            this.ITR_JSON = result[i];
            if (currentFiledITR.length > 0) {
              currentFiledITR = currentFiledITR.filter(item => item.isRevised === 'N');
              if (currentFiledITR.length > 0) {
                this.ITR_JSON.orgITRAckNum = currentFiledITR[0].ackNumber;
                this.ITR_JSON.orgITRDate = currentFiledITR[0].eFillingDate;
              }
            }
            console.log('this.ITR_JSON JUST before saving:', this.ITR_JSON)
            Object.entries(this.ITR_JSON).forEach((key, value) => {
              console.log(key, value)
              if (key[1] === null) {
                delete this.ITR_JSON[key[0]];
              }
              // if(key )
              // delete this.ITR_JSON[key];
            });
            console.log('this.ITR_JSON after deleted keys:', this.ITR_JSON)

            break;
          }
        }

        if (!isWIP_ITRFound) {
          this.loading = false;
          let obj = this.createEmptyJson(profile, AppConstants.ayYear, AppConstants.fyYear)
          Object.assign(obj, this.ITR_JSON)
          console.log('obj:', obj)
          this.ITR_JSON = JSON.parse(JSON.stringify(obj))
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.router.navigate(['/pages/itr-filing/customer-profile'])
          /* if (this.utilsService.isNonEmpty(profile.panNumber)) {
            if (this.utilsService.isNonEmpty(this.ITR_JSON.panNumber) ? (this.ITR_JSON.panNumber !== profile.panNumber) : false) {
              this.openConformationDialog(this.ITR_JSON, profile, assessmentYear, financialYear);
            } else {
              if (this.utilsService.isNonEmpty(this.ITR_JSON.lastVisitedURL)) {
                this.lastVisitedDialog();
              } else {
                //this.router.navigate(['/revisereturn']);
                this.router.navigate(['/assited']);
              }
            }
          } else {
            if (this.utilsService.isNonEmpty(this.ITR_JSON.lastVisitedURL)) {
              this.lastVisitedDialog();
            } else {
              // this.router.navigate(['/revisereturn']);
              this.router.navigate(['/assited']);
            }
          } */
        } else {
          this.loading = false;
          alert('ITR Fillied/Acknowledgement not received');
        }

      } else {
        this.ITR_JSON = this.createEmptyJson(profile, AppConstants.ayYear, AppConstants.fyYear);

        const param = '/itr';
        this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
          console.log('My iTR Json successfully created-==', result);
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.router.navigate(['/pages/itr-filing/customer-profile'])
        }, error => {
          this.loading = false;
        });
      }

    }, error => {
      if (error.status === 404) {
        this.ITR_JSON = this.createEmptyJson(profile, AppConstants.ayYear, AppConstants.fyYear);
        const param = '/itr';
        this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
          console.log('My iTR Json successfully created-==', result);
          this.loading = false;
          this.ITR_JSON = result;
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.router.navigate(['/pages/itr-filing/customer-profile'])
        }, error => {
          this.loading = false;
        });
      } else {
        // Handle another error conditions like 500 etc.
        this.loading = false;
      }
    });
  }

  createEmptyJson(profile, assessmentYear, financialYear) {
    const ITR_JSON: ITR_JSON = {
      ackStatus: '',
      acknowledgementReceived: false,
      userId: profile.userId,
      itrId: null,
      pid: '',
      email: profile.emailAddress,
      contactNumber: profile.mobileNumber,
      panNumber: profile.panNumber,
      aadharNumber: '', // profile.aadharNumber,
      residentialStatus: profile.residentialStatus,
      maritalStatus: profile.maritalStatus,
      assesseeType: '',
      assessmentYear: assessmentYear,
      currency: 'INR',
      locale: 'en_IN',
      financialYear: financialYear,
      filingTeamMemberId: null,
      planIdSelectedByUser: null,
      planIdSelectedByTaxExpert: null,
      eFillingPortalPassword: '*****',
      isRevised: 'N',
      isDefective: 'N',
      dateOfNotice: '',
      noticeIdentificationNo: '',
      isLate: 'N',
      eFillingCompleted: false,
      eFillingDate: '',
      employerCategory: '',
      orgITRAckNum: null,
      ackNumber: '',
      orgITRDate: '',
      itrType: '',
      planName: '',
      family: [
        {
          pid: null,
          fName: profile.fName,
          mName: profile.mName,
          lName: profile.lName,
          fatherName: profile.fatherName, // Added by arati
          age: null,
          gender: profile.gender,
          relationShipCode: 'SELF',
          relationType: 'SELF',
          dateOfBirth: profile.dateOfBirth
        }
      ],
      address: this.utilsService.isNonEmpty(profile.address) ? profile.address[0] : null,
      declaration: null,
      disability: null,
      upload: [],
      employers: [],
      houseProperties: [],
      capitalGain: [],
      business: {
        presumptiveIncomes: [],
        financialParticulars: null
      },
      pastYearLosses: [],
      foreignIncome: null,
      incomes: [],
      investments: [],
      donations: [],
      loans: [],
      expenses: [],
      insurances: [],
      assetsLiabilities: null,
      bankDetails: this.utilsService.isNonEmpty(profile.bankDetails) ? profile.bankDetails : [],
      taxPaid: {
        onSalary: [],
        otherThanSalary16A: [],
        otherThanSalary26QB: [],
        tcs: [],
        otherThanTDSTCS: [],
        paidRefund: []
      },
      systemFlags: {
        hasSalary: false,
        hasHouseProperty: false,
        hasMultipleProperties: false,
        hasForeignAssets: false,
        hasCapitalGain: false,
        hasBroughtForwardLosses: false,
        hasAgricultureIncome: false,
        hasOtherIncome: false,
        hasParentOverSixty: false,
        hasBusinessProfessionIncome: false,
        hasFutureOptionsIncome: false,
        hasNRIIncome: false,
        hraAvailed: false,
        directorInCompany: false,
        haveUnlistedShares: false
      },
      agriculturalDetails: {
        nameOfDistrict: '',
        landInAcre: null,
        owner: '',
        typeOfLand: '',
        pinCode: ''
      },
      itrProgress: [],
      directorInCompany: [],
      unlistedSharesDetails: [],
      dateOfDividendIncome: null,
      lastVisitedURL: '',
      seventhProviso139: null,
      depPayInvClmUndDednVIA: 'N'
    };

    return ITR_JSON;
  }
}
