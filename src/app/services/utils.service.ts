// import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import { concatMap, Observable, Subject } from 'rxjs';
import { ItrMsService } from './itr-ms.service';
import { UserMsService } from './user-ms.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiEndpoints } from '../modules/shared/api-endpoint';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ITR_JSON,
  OptedInNewRegime,
  OptedOutNewRegime,
} from '../modules/shared/interfaces/itr-input.interface';
import { AppConstants } from '../modules/shared/constants';
import { ItrActionsComponent } from '../modules/shared/components/itr-actions/itr-actions.component';
import { Environment } from 'ag-grid-community';
import { parse } from '@typescript-eslint/parser';
import { AppSetting } from '../modules/shared/app.setting';
import { StorageService } from '../modules/shared/services/storage.service';

@Injectable()
export class UtilsService {
  ITR_JSON!: ITR_JSON;
  loading: boolean = false;
  private subject = new Subject<any>();
  uploadedJson: any;
  jsonData: any;
  constructor(
    private snackBar: MatSnackBar,
    private itrMsService: ItrMsService,
    private router: Router,
    private dialog: MatDialog,
    private serializer: UrlSerializer,
    private userMsService: UserMsService,
    private storageService: StorageService
  ) {}
  /**
   * @function isNonEmpty()
   * @param param
   * @description This function is used for checking the expected parameter is empty undefined or null, this function will be used for objects as well as strings
   * @author Ashish Hulwan
   * @returns this will return boolean value
   */
  isNonEmpty(param: any): boolean {
    if (param !== null && param !== undefined && param !== '') return true;
    else return false;
  }

  isNonZero(param: any): boolean {
    if (
      Number(param) !== 0 &&
      param !== null &&
      param !== undefined &&
      param !== ''
    )
      return true;
    else return false;
  }

  removeNullProperties(obj) {
    for (const key in obj) {
      // pastYear Losses
      if (key === 'pastYearLosses') {
        if (obj[key] === null || obj[key].length === 0) {
          obj[key] = [
            {
              id: null,
              assessmentPastYear: '2015-16',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2016-17',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2017-18',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2018-19',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2019-20',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2020-21',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2021-22',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2022-23',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
          ];
        }
      }
      //movableAsset
      if (
        key === 'movableAsset' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        obj[key] = obj[key]?.map((item) => {
          // Filter out null or undefined keys from each object
          return Object.entries(item).reduce((acc, [k, v]) => {
            if (v !== null && v !== undefined) {
              acc[k] = v;
            }
            return acc;
          }, {});
        });
        obj[key] = Object.keys(obj[key][0]).length === 0 ? [] : obj[key];
        console.log(obj[key]);
      }
      //profitLossAC
      if (
        key === 'profitLossACIncomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          const profitLossACIncomes = obj[key][i]?.incomes;
          if (
            (obj[key][i]?.netProfitfromNonSpeculativeIncome === 0 ||
              obj[key][i]?.netProfitfromNonSpeculativeIncome === null) &&
            obj[key][i]?.incomes.length === 0
          ) {
            delete obj[key][i];
          }
        }
      }

      //Employers - allowances & deductions
      if (
        key === 'employers' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        //allowances
        for (let i = 0; i < obj[key]?.length; i++) {
          const salaryAllowance = obj[key][i]?.allowance;
          if (
            salaryAllowance &&
            Array.isArray(salaryAllowance) &&
            salaryAllowance.length > 0
          ) {
            for (let j = salaryAllowance.length - 1; j >= 0; j--) {
              if (
                salaryAllowance[j] &&
                (salaryAllowance[j]?.exemptAmount === 0 ||
                  salaryAllowance[j]?.exemptAmount === null)
              ) {
                salaryAllowance.splice(j, 1);
              }
            }
          }
        }

        //deductions
        for (let i = 0; i < obj[key]?.length; i++) {
          const salaryDeductions = obj[key][i]?.deductions;
          if (
            salaryDeductions &&
            Array.isArray(salaryDeductions) &&
            salaryDeductions?.length > 0
          ) {
            for (let j = salaryDeductions?.length - 1; j >= 0; j--) {
              if (
                salaryDeductions[j] &&
                (salaryDeductions[j]?.exemptAmount === 0 ||
                  salaryDeductions[j]?.exemptAmount === null)
              ) {
                salaryDeductions.splice(j, 1);
              }
            }
          }
        }
      }

      //LOANS
      if (key === 'loans' && Array.isArray(obj[key]) && obj[key]?.length > 0) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.interestPaidPerAnum === 0 ||
              obj[key][i]?.interestPaidPerAnum === null) &&
            (obj[key][i]?.principalPaidPerAnum === 0 ||
              obj[key][i]?.principalPaidPerAnum === null) &&
            (obj[key][i]?.loanAmount === 0 || obj[key][i]?.loanAmount === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //EXPENSES
      if (
        key === 'expenses' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //INSURANCES
      if (
        key === 'insurances' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.medicalExpenditure === 0 ||
              obj[key][i]?.medicalExpenditure === null) &&
            (obj[key][i]?.premium === 0 || obj[key][i]?.premium === null) &&
            (obj[key][i]?.preventiveCheckUp === 0 ||
              obj[key][i]?.preventiveCheckUp === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //INCOMES
      if (
        key === 'incomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //DONATIONS
      if (
        key === 'donations' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.schemeCode === '' ||
              obj[key][i]?.schemeCode === null) &&
            (obj[key][i]?.amountOtherThanCash === 0 ||
              obj[key][i]?.amountOtherThanCash === null) &&
            (obj[key][i]?.amountInCash === 0 ||
              obj[key][i]?.amountInCash === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //DIVIDENDINCOMES
      if (
        key === 'dividendIncomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key].length; i++) {
          if (obj[key][i]?.income === 0 || obj[key][i]?.income === null) {
            delete obj[key][i];
          }
        }
      }

      //INVESTMENTS
      if (
        key === 'investments' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //DISABILITIES
      if (
        key === 'disabilities' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //HOUSEPROPERTIESLOAN
      if (
        key === 'houseProperties' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          const HPloans = obj[key][i]?.loans;
          if (HPloans && Array.isArray(HPloans) && HPloans?.length > 0) {
            for (let j = HPloans?.length - 1; j >= 0; j--) {
              if (
                HPloans[j] &&
                (HPloans[j]?.interestAmount === 0 ||
                  HPloans[j]?.interestAmount === null) &&
                (HPloans[j]?.principalAmount === 0 ||
                  HPloans[j]?.principalAmount === null)
              ) {
                HPloans.splice(j, 1);
              }
            }
          }
        }
      }

      //for All Others
      if (obj[key] === null) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          obj[key] = obj[key]?.filter((item) => item !== null);
        } else {
          this.removeNullProperties(obj[key]);
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }
    }

    return obj;
  }

  smoothScrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  currencyFormatter(val: any) {
    if (this.isNonEmpty(val)) {
      return val.toLocaleString('en-IN');
    } else {
      return 0;
    }
  }
  gstinValidator = new RegExp(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/
  );
  isGSTINValid(gstin: any) {
    let result = this.gstinValidator.test(gstin);
    console.log('GSTIN check result', result);
    return result;
  }

  //scroll to specific div
  smoothScrollToDiv(divId: any) {
    console.log(divId);
    return document
      .getElementById(divId)
      .scrollIntoView({ behavior: 'smooth' });
  }

  showSnackBar(msg: any) {
    this.snackBar.open(msg, 'OK', {
      verticalPosition: 'top',
      horizontalPosition: 'center',
      duration: 10000,
    });
  }

  async getITRByUserIdAndAssesmentYear(
    profile: any,
    ref?: any,
    filingTeamMemberId?: any
  ) {
    console.log('filingTeamMemberId====', filingTeamMemberId);
    this.loading = true;
    // this.isLoggedIn = this.encrDecrService.get(AppConstants.IS_USER_LOGGED_IN);
    // let list = []
    const fyList = await this.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.showSnackBar('There is no any active filing year available');
      return;
    }
    // const currentAy = (currentFyDetails.length > 0 ? currentFyDetails[0].assessmentYear : AppConstants.ayYear)
    // const currentFy = (currentFyDetails.length > 0 ? currentFyDetails[0].financialYear : AppConstants.ayYear)
    const param = `/itr?userId=${profile.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}`;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log('My ITR by user Id and Assesment Years=', result);
        if (result.length !== 0) {
          let isWIP_ITRFound = true;
          for (let i = 0; i < result.length; i++) {
            let currentFiledITR = result.filter(
              (item: any) =>
                item.assessmentYear === currentFyDetails[0].assessmentYear &&
                item.eFillingCompleted
            );
            if (
              result[i].eFillingCompleted ||
              result[i].ackStatus === 'SUCCESS' ||
              result[i].ackStatus === 'DELAY'
            ) {
              //   return "REVIEW"
            } else {
              //   return "CONTINUE"
              isWIP_ITRFound = false;
              this.ITR_JSON = result[i];
              if (currentFiledITR.length > 0) {
                currentFiledITR = currentFiledITR.filter(
                  (item: any) => item.isRevised === 'N'
                );
                if (currentFiledITR.length > 0) {
                  this.ITR_JSON.orgITRAckNum = currentFiledITR[0].ackNumber;
                  this.ITR_JSON.orgITRDate = currentFiledITR[0].eFillingDate;
                }
              }
              Object.entries(this.ITR_JSON).forEach((key, value) => {
                console.log(key, value);
                if (key[1] === null) {
                  delete this.ITR_JSON[key[0]];
                }
                // if(key )
                // delete this.ITR_JSON[key];
              });
              console.log('this.ITR_JSON after deleted keys:', this.ITR_JSON);

              break;
            }
          }

          if (!isWIP_ITRFound) {
            this.loading = false;
            let obj = this.createEmptyJson(
              profile,
              currentFyDetails[0].assessmentYear,
              currentFyDetails[0].financialYear
            );
            Object.assign(obj, this.ITR_JSON);
            console.log('obj:', obj);
            this.ITR_JSON = JSON.parse(JSON.stringify(obj));
            this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
            console.log('this.ITR_JSON in utils', this.ITR_JSON);
            console.log('profile', profile);
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_JSON)
            );
            this.router.navigate(['/itr-filing/itr'], {
              state: {
                userId: this.ITR_JSON.userId,
                panNumber: profile.panNumber,
                eriClientValidUpto: profile.eriClientValidUpto,
                name: profile.fName + ' ' + profile.lName,
              },
            });
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
            if (ref === 'ITR') {
              let disposable = this.dialog.open(ItrActionsComponent, {
                width: '50%',
                height: 'auto',
                data: {
                  itrObjects: result,
                },
              });
              disposable.afterClosed().subscribe((result) => {
                console.log('The dialog was closed');
              });
              return;
            }
            alert('ITR Filed/Acknowledgement not received');
          }
        } else {
          this.ITR_JSON = this.createEmptyJson(
            profile,
            currentFyDetails[0].assessmentYear,
            currentFyDetails[0].financialYear
          );
          this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
          const param = '/itr';
          this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
            (result: any) => {
              console.log('My iTR Json successfully created-==', result);
              this.ITR_JSON = result;
              this.loading = false;
              sessionStorage.setItem(
                AppConstants.ITR_JSON,
                JSON.stringify(this.ITR_JSON)
              );
              this.router.navigate(['/itr-filing/itr'], {
                state: {
                  userId: this.ITR_JSON.userId,
                  panNumber: profile.panNumber,
                  eriClientValidUpto: profile.eriClientValidUpto,
                  name: profile.fName + ' ' + profile.lName,
                },
              });
            },
            (error) => {
              this.loading = false;
            }
          );
        }
      },
      (error) => {
        if (error.status === 404) {
          this.ITR_JSON = this.createEmptyJson(
            profile,
            currentFyDetails[0].assessmentYear,
            currentFyDetails[0].financialYear
          );
          this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
          const param = '/itr';
          this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
            (result: any) => {
              console.log('My iTR Json successfully created-==', result);
              this.loading = false;
              this.ITR_JSON = result;
              sessionStorage.setItem(
                AppConstants.ITR_JSON,
                JSON.stringify(this.ITR_JSON)
              );
              this.router.navigate(['/itr-filing/itr'], {
                state: {
                  userId: this.ITR_JSON.userId,
                  panNumber: profile.panNumber,
                  eriClientValidUpto: profile.eriClientValidUpto,
                  name: profile.fName + ' ' + profile.lName,
                },
              });
            },
            (error) => {
              this.loading = false;
            }
          );
        } else {
          // Handle another error conditions like 500 etc.
          this.loading = false;
        }
      }
    );
  }

  createEmptyJson(
    profile: any,
    assessmentYear: any,
    financialYear: any,
    itrId?: any,
    filingTeamMemberId?: any,
    id?: any,
    itrJson?: any
  ) {
    const ITR_JSON: ITR_JSON = {
      id: id ? id : null,
      ackStatus: itrJson ? itrJson.ackStatus : '',
      acknowledgementReceived: itrJson
        ? itrJson.acknowledgementReceived
        : false,
      userId: this.isNonEmpty(profile) ? profile.userId : null,
      itrId: itrId ? itrId : null,
      pid: '',
      email: this.isNonEmpty(profile) ? profile.emailAddress : '',
      contactNumber: this.isNonEmpty(profile) ? profile.mobileNumber : '',
      panNumber: this.isNonEmpty(profile) ? profile.panNumber : '',
      aadharNumber: '',
      residentialStatus: this.isNonEmpty(profile)
        ? profile.residentialStatus
        : '',
      maritalStatus: this.isNonEmpty(profile) ? profile.maritalStatus : '',
      assesseeType: '',
      assessmentYear: assessmentYear,
      currency: 'INR',
      locale: 'en_IN',
      financialYear: financialYear,
      filingTeamMemberId: filingTeamMemberId ? filingTeamMemberId : null,
      planIdSelectedByUser: null,
      planIdSelectedByTaxExpert: null,
      eFillingPortalPassword: '*****',
      isRevised: itrJson ? itrJson.isRevised : 'N',
      isDefective: itrJson ? itrJson.isDefective : 'N',
      dateOfNotice: itrJson ? itrJson.dateOfNotice : '',
      noticeIdentificationNo: itrJson ? itrJson.noticeIdentificationNo : '',
      isLate: itrJson ? itrJson.isLate : 'N',
      eFillingCompleted: itrJson ? itrJson.eFillingCompleted : false,
      eFillingDate: itrJson ? itrJson.eFillingDate : '',
      employerCategory: '',
      orgITRAckNum: itrJson ? itrJson.orgITRAckNum : null,
      ackNumber: itrJson ? itrJson.ackNumber : '',
      orgITRDate: itrJson ? itrJson.orgITRDate : '',
      itrType: '',
      planName: '',
      regime: '',
      previousYearRegime: '',
      family: [
        {
          pid: null,
          fName: this.isNonEmpty(profile) ? profile.fName : '',
          mName: this.isNonEmpty(profile) ? profile.mName : '',
          lName: this.isNonEmpty(profile) ? profile.lName : '',
          fatherName: this.isNonEmpty(profile) ? profile.fatherName : '',
          age: null,
          gender: this.isNonEmpty(profile) ? profile.gender : '',
          relationShipCode: 'SELF',
          relationType: 'SELF',
          dateOfBirth: this.isNonEmpty(profile) ? profile.dateOfBirth : '',
        },
      ],
      address: {
        flatNo: '',
        premisesName: '',
        road: '',
        area: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
      },
      // this.isNonEmpty(profile) && this.isNonEmpty(profile.address) ? profile.address[0] : null,
      upload: [],
      employers: [],
      houseProperties: [
        // {
        //   propertyType: 'LOP',
        //   grossAnnualRentReceived: null,
        //   propertyTax: null,
        //   ownerPercentage: null,
        //   address: '',
        //   city: '',
        //   state: '',
        //   country: '',
        //   pinCode: '',
        //   taxableIncome: null,
        //   exemptIncome: null,
        //   isEligibleFor80EE: false,
        //   isEligibleFor80EEA: false,
        //   tenant: [],
        //   coOwners: [],
        //   loans: [
        //     {
        //       loanType: 'HOUSING',
        //       principalAmount: null,
        //       interestAmount: null,
        //     },
        //   ],
        // },
      ],
      capitalGain: [],
      business: {
        presumptiveIncomes: [],
        financialParticulars: {
          difference: null,
          id: null,
          grossTurnOverAmount: null,
          membersOwnCapital: null,
          securedLoans: null,
          unSecuredLoans: null,
          advances: null,
          sundryCreditorsAmount: null,
          otherLiabilities: null,
          totalCapitalLiabilities: null,
          fixedAssets: null,
          inventories: null,
          sundryDebtorsAmount: null,
          balanceWithBank: null,
          cashInHand: null,
          loanAndAdvances: null,
          otherAssets: null,
          totalAssets: null,
          investment: null,
          GSTRNumber: null,
        },
        businessDescription: [],
        fixedAssetsDetails: [],
        profitLossACIncomes: [],
      },
      pastYearLosses: [],
      foreignIncome: null,
      incomes: [
        // {
        //   incomeType: 'SAVING_INTEREST',
        //   details: null,
        //   amount: 0,
        //   expenses: null,
        // },
        // {
        //   incomeType: 'FD_RD_INTEREST',
        //   details: null,
        //   amount: 0,
        //   expenses: null,
        // },
        // {
        //   incomeType: 'TAX_REFUND_INTEREST',
        //   details: null,
        //   amount: 0,
        //   expenses: null,
        // },
        // {
        //   incomeType: 'ANY_OTHER',
        //   details: null,
        //   amount: 0,
        //   expenses: null,
        // },
        // {
        //   incomeType: 'FAMILY_PENSION',
        //   details: 'FAMILY_PENSION',
        //   amount: 0,
        //   expenses: null,
        // },
      ],
      dividendIncomes: [
        // { income: 0, date: '2022-04-28T18:30:00.000Z', quarter: 1 },
        // { income: 0, date: '2022-07-28T18:30:00.000Z', quarter: 2 },
        // { income: 0, date: '2022-09-28T18:30:00.000Z', quarter: 3 },
        // { income: 0, date: '2022-12-28T18:30:00.000Z', quarter: 4 },
        // { income: 0, date: '2023-03-20T18:30:00.000Z', quarter: 5 },
      ],
      exemptIncomes: [
        // { natureDesc: 'AGRI', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(10D)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(11)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(12)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(13)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(16)', amount: 0, othNatOfInc: null },
        // { natureDesc: 'DMDP', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(17)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(17A)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(18)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(10BC)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(19)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(26)', amount: 0, othNatOfInc: null },
        // { natureDesc: '10(26AAA)', amount: 0, othNatOfInc: null },
        // { natureDesc: 'OTH', amount: 0, othNatOfInc: null },
      ],
      investments: [
        // { investmentType: 'ELSS', amount: 0, details: 'ELSS' },
        // {
        //   investmentType: 'PENSION_FUND',
        //   amount: 0,
        //   details: 'PENSION_FUND',
        // },
        // {
        //   investmentType: 'PS_EMPLOYEE',
        //   amount: 0,
        //   details: 'PS_EMPLOYEE',
        // },
        // {
        //   investmentType: 'PS_EMPLOYER',
        //   amount: 0,
        //   details: 'PS_EMPLOYER',
        // },
        // {
        //   investmentType: 'PENSION_SCHEME',
        //   amount: 0,
        //   details: 'PENSION_SCHEME',
        // },
      ],
      donations: [],
      loans: [
        // {
        //   loanType: 'EDUCATION',
        //   name: null,
        //   interestPaidPerAnum: 0,
        //   principalPaidPerAnum: 0,
        //   loanAmount: 0,
        //   details: null,
        // },
      ],

      expenses: [
        // {
        //   expenseType: 'HOUSE_RENT_PAID',
        //   expenseFor: null,
        //   details: null,
        //   amount: 0,
        //   noOfMonths: 0,
        // },
        // {
        //   expenseType: 'ELECTRIC_VEHICLE',
        //   expenseFor: null,
        //   details: null,
        //   amount: 0,
        //   noOfMonths: 0,
        // },
      ],
      insurances: [
        {
          typeOfPolicy: '',
          sumAssured: 0,
          insuranceType: 'HEALTH',
          policyFor: 'DEPENDANT',
          premium: 0,
          medicalExpenditure: 0,
          preventiveCheckUp: 0,
          healthCover: null,
        },
        {
          typeOfPolicy: '',
          sumAssured: 0,
          insuranceType: 'HEALTH',
          policyFor: 'PARENTS',
          premium: 0,
          medicalExpenditure: 0,
          preventiveCheckUp: 0,
          healthCover: null,
        },
      ],
      assetsLiabilities: null,
      bankDetails:
        this.isNonEmpty(profile) && this.isNonEmpty(profile.bankDetails)
          ? profile.bankDetails
          : [],
      taxPaid: {
        onSalary: [],
        otherThanSalary16A: [],
        otherThanSalary26QB: [],
        tcs: [],
        otherThanTDSTCS: [],
        paidRefund: [],
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
        haveUnlistedShares: false,
      },
      agriculturalDetails: {
        nameOfDistrict: '',
        landInAcre: null,
        owner: '',
        typeOfLand: '',
        pinCode: '',
      },
      itrProgress: [],
      directorInCompany: [],
      unlistedSharesDetails: [],
      dateOfDividendIncome: null,
      lastVisitedURL: '',
      seventhProviso139: null,
      depPayInvClmUndDednVIA: 'N',
      declaration: {
        capacity: null,
        childOf: null,
        name: null,
        panNumber: null,
        place: '',
      },
      disabilities: [],
      disability: undefined,
      movableAsset: [],
      immovableAsset: [],
      prefillDate: itrJson ? itrJson.prefillDate : null,
      prefillData: itrJson ? itrJson.prefillData : null,
      prefillDataSource: itrJson ? itrJson.prefillDataSource : null,
      everOptedNewRegime: {
        acknowledgementNumber: '',
        assessmentYear: '',
        date: '',
        everOptedNewRegime: false,
      },
      everOptedOutOfNewRegime: {
        acknowledgementNumber: '',
        assessmentYear: '',
        date: '',
        everOptedOutOfNewRegime: false,
      },
      optionForCurrentAY: {
        acknowledgementNumber: '',
        assessmentYear: '',
        date: '',
        currentYearRegime: '',
      },
      section89: null,
      acknowledgement89: null,
      acknowledgementDate89: null,

      section90: null,
      acknowledgement90: null,
      acknowledgementDate90: null,

      section91: null,
      acknowledgement91: null,
      acknowledgementDate91: null,

      itrSummaryJson: null,
      isItrSummaryJsonEdited: false,
    };

    return ITR_JSON;
  }

  setUploadedJson(data: any) {
    this.uploadedJson = data;
  }

  getUploadedJson() {
    return this.uploadedJson;
  }

  sendMessage(message: any) {
    console.log('get message: ', message);
    this.subject.next({ text: message });
  }

  clearMessages() {
    this.subject.next(null);
  }

  onMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  showErrorMsg(errorCode) {
    var errorMessage = '';
    if (errorCode === 400) {
      errorMessage = 'Bad request, invalid input request.';
    } else if (errorCode === 401) {
      errorMessage = 'Unauthorized user.';
    } else if (errorCode === 403) {
      errorMessage = 'You do not have access of this part.';
    } else if (errorCode === 404) {
      errorMessage = 'Data not found in system.';
    } else if (errorCode === 500) {
      errorMessage = 'Internal server error.';
    } else {
      errorMessage = 'Something went wrong.';
    }
    return errorMessage;
  }

  getCloudFy(financialYear) {
    let startFy = financialYear.slice(0, 5);
    let endFy = financialYear.slice(7, 9);
    return startFy + endFy;
    // return '2020-21';
  }

  async getStoredFyList() {
    const fyList = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
    console.log('fyList', fyList);
    if (
      this.isNonEmpty(fyList) &&
      fyList instanceof Array &&
      fyList.length > 0
    ) {
      return fyList;
    } else {
      let res: any = await this.getFyList().catch((error) => {
        this.loading = false;
        console.log(error);
        this.showSnackBar('Error While getting financial year list.');
        return [];
      });
      if (res && res.success && res.data instanceof Array) {
        sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
        return res.data;
      }
    }
  }

  async getFyList() {
    const param = `${ApiEndpoints.itrMs.filingDates}`;
    return await this.itrMsService.getMethod(param).toPromise();
  }

  async getStoredSmeList() {
    const smeList = JSON.parse(
      sessionStorage.getItem(AppConstants.SME_LIST) || null
    );
    // console.log('fyList', fyList);
    if (
      this.isNonEmpty(smeList) &&
      smeList instanceof Array &&
      smeList.length > 0
    ) {
      smeList.sort((a, b) => (a.name > b.name ? 1 : -1));
      return smeList;
    } else {
      if (!this.getLoggedInUserID()) {
        return [];
      }
      let res: any = await this.getSmeList().catch((error) => {
        this.loading = false;
        console.log(error);
        this.showSnackBar('Error While getting SME list.');
        return [];
      });
      if (res.success && res.data && res.data.content instanceof Array) {
        let activeSme = res.data.content.filter((item) => item.active);
        activeSme.sort((a, b) => (a.name > b.name ? 1 : -1));
        sessionStorage.setItem(
          AppConstants.SME_LIST,
          JSON.stringify(activeSme)
        );
        return activeSme;
      }
      return [];
    }
  }
  async getSmeList() {
    const param = `/sme/all-list?page=0&size=1000`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  async getStoredAgentList(action?: any) {
    let agentList = JSON.parse(
      sessionStorage.getItem(AppConstants.AGENT_LIST) || null
    );
    if (action === 'REFRESH') {
      agentList = [];
    }
    if (
      this.isNonEmpty(agentList) &&
      agentList instanceof Array &&
      agentList.length > 0
    ) {
      agentList.sort((a, b) => (a.name > b.name ? 1 : -1));
      return agentList;
    } else {
      if (!this.getLoggedInUserID()) {
        return [];
      }
      let res: any = await this.getAgentList().catch((error) => {
        this.loading = false;
        console.log(error);
        this.showSnackBar('Error While getting SME list.');
        return [];
      });
      if (res && res.data instanceof Array) {
        res.data.sort((a, b) => (a.name > b.name ? 1 : -1));
        sessionStorage.setItem(
          AppConstants.AGENT_LIST,
          JSON.stringify(res.data)
        );
        return res.data;
      }
    }
    return [];
  }
  async getAgentList() {
    //https://uat-api.taxbuddy.com/user/sme-details-new/3000?page=0&size=100&filer=true
    const loggedInUserId = this.getLoggedInUserID();
    const param = `/sme-details-new/${loggedInUserId}?filer=true`;
    return await this.userMsService.getMethodNew(param).toPromise();
  }

  async getStoredMasterStatusList() {
    const masterStatus = JSON.parse(
      sessionStorage.getItem(AppConstants.MASTER_STATUS) ?? null
    );
    if (
      this.isNonEmpty(masterStatus) &&
      masterStatus instanceof Array &&
      masterStatus.length > 0
    ) {
      return masterStatus;
    } else {
      let res: any = await this.getMasterStatusList().catch((error) => {
        this.loading = false;
        console.log(error);
        this.showSnackBar('Error While getting MASTER_STATUS list.');
        return [];
      });
      if (res && res instanceof Array) {
        sessionStorage.setItem(AppConstants.MASTER_STATUS, JSON.stringify(res));
        return res;
      }
    }
    return [];
  }
  async getMasterStatusList() {
    const param = `/${ApiEndpoints.userMs.itrStatusMasterBo}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  createUrlParams(queryParams: any) {
    const tree = this.router.createUrlTree([], { queryParams });
    console.log(this.serializer.serialize(tree));
    return this.serializer.serialize(tree).split('?').pop();
  }

  logAction(userId: any, action: any) {
    const param = `/action-time`;
    const request = {
      userId: userId,
      action: action,
    };
    this.userMsService.postMethod(param, request).subscribe((res) => {});
  }

  getMyCallingNumber() {
    const loggedInSmeInfo = JSON.parse(
      sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) ?? ''
    );
    if (
      this.isNonEmpty(loggedInSmeInfo) &&
      this.isNonEmpty(loggedInSmeInfo[0].callingNumber)
    ) {
      return loggedInSmeInfo[0].callingNumber;
    }
    // const SME_LIST: any = await this.getStoredSmeList();
    // const sme = SME_LIST.filter((item: any) => item.userId === userObj.USER_UNIQUE_ID);
    // if (sme instanceof Array && sme.length > 0 && (sme[0]['roles'].length > 0 && sme[0]['roles'].includes('ROLE_CALLING_TEAM'))) {

    //     return sme[0].mobileNumber;
    // }
    return false;
  }

  async getStoredMyAgentList() {
    const agentList = JSON.parse(
      sessionStorage.getItem(AppConstants.MY_AGENT_LIST) || null
    );
    // console.log('fyList', fyList);
    if (
      this.isNonEmpty(agentList) &&
      agentList instanceof Array &&
      agentList.length > 0
    ) {
      agentList.sort((a, b) => (a.name > b.name ? 1 : -1));
      return agentList;
    } else {
      let res: any = await this.getMyAgentList().catch((error) => {
        this.loading = false;
        console.log(error);
        this.showSnackBar('Error While getting My Agent list.');
        return [];
      });
      if (res.success && res.data instanceof Array) {
        res.data.sort((a, b) => (a.name > b.name ? 1 : -1));
        sessionStorage.setItem(
          AppConstants.MY_AGENT_LIST,
          JSON.stringify(res.data)
        );
        return res.data;
      }
      return [];
    }
  }
  async getMyAgentList() {
    const loggedInUserId = this.getLoggedInUserID();
    //https://api.taxbuddy.com/user/sme-details-new/24346?owner=true&assigned=true
    const param = `/sme-details-new/${loggedInUserId}?owner=true&assigned=true`;
    return await this.userMsService.getMethodNew(param).toPromise();
  }

  async getCurrentItr(userId: any, ay: any, filingTeamMemberId?: any) {
    console.log('filingTeamMemberId====', filingTeamMemberId);
    this.loading = true;
    const fyList = await this.getStoredFyList();
    const currentFyDetails = fyList.filter(
      (item: any) => item.assessmentYear === ay
    );
    let result: any = await this.getItr(userId, ay).catch((error) => {
      console.log('ITR list error=>', error);
      return error;
    });
    if (result && result.error) {
      if (result.error.status === 404) {
        let res: any = await this.postFreshItr(
          userId,
          ay,
          currentFyDetails[0].financialYear,
          filingTeamMemberId
        ).catch((error) => {});
        this.loading = false;
        if (res && res.itrId) {
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(res));
          return res;
        }
      }
    } else if (result && result instanceof Array) {
      console.log('ITR list success=>', result);
      if (result.length !== 0) {
        let isWIP_ITRFound = true;
        for (let i = 0; i < result.length; i++) {
          let currentFiledITR = result.filter(
            (item: any) => item.assessmentYear === ay && item.eFillingCompleted
          );
          if (
            result[i].eFillingCompleted ||
            result[i].ackStatus === 'SUCCESS' ||
            result[i].ackStatus === 'DELAY'
          ) {
            //   return "REVIEW"
          } else {
            //   return "CONTINUE"
            isWIP_ITRFound = false;
            this.ITR_JSON = result[i];
            if (currentFiledITR.length > 0) {
              currentFiledITR = currentFiledITR.filter(
                (item: any) => item.isRevised === 'N'
              );
              if (currentFiledITR.length > 0) {
                this.ITR_JSON.orgITRAckNum = currentFiledITR[0].ackNumber;
                this.ITR_JSON.orgITRDate = currentFiledITR[0].eFillingDate;
              }
            }
            Object.entries(this.ITR_JSON).forEach((key, value) => {
              if (key[1] === null) {
                delete this.ITR_JSON[key[0]];
              }
              // if(key )
              // delete this.ITR_JSON[key];
            });

            break;
          }
        }

        if (!isWIP_ITRFound) {
          this.loading = false;
          let profile = {
            userId: userId,
          };
          let obj = this.createEmptyJson(
            profile,
            ay,
            currentFyDetails[0].financialYear
          );
          Object.assign(obj, this.ITR_JSON);
          console.log('obj:', obj);
          this.ITR_JSON = JSON.parse(JSON.stringify(obj));
          this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
          console.log('this.ITR_JSONthis.ITR_JSONthis.ITR_JSON', this.ITR_JSON);
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          // this.router.navigate(['/pages/itr-filing/customer-profile']);
          return this.ITR_JSON;
        } else {
          this.loading = false;
          // TODO need to check the flow for revise return;
          // if (ref === "ITR") {
          //     let disposable = this.dialog.open(ItrActionsComponent, {
          //         width: '50%',
          //         height: 'auto',
          //         data: {
          //             itrObjects: result,
          //         }
          //     })
          //     disposable.afterClosed().subscribe(result => {
          //         console.log('The dialog was closed');
          //     });
          //     return;
          // }
          alert('ITR Filed/Acknowledgement not received');
        }
      } else {
        let result: any = await this.postFreshItr(
          userId,
          ay,
          currentFyDetails[0].financialYear,
          filingTeamMemberId
        ).catch((error) => {});
        this.loading = false;
        if (result && result.itrId) {
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
          return result;
        }
        // this.ITR_JSON = this.createEmptyJson(null, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
        // this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
        // const param = '/itr';
        // this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
        //     console.log('My iTR Json successfully created-==', result);
        //     this.ITR_JSON = result;
        //     this.loading = false;
        //     sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        //     // this.router.navigate(['/pages/itr-filing/customer-profile']);
        // }, error => {
        //     this.loading = false;
        // });
      }
    }
  }

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }
  async getItr(userId: any, ay: string) {
    const param = `/itr?userId=${userId}&assessmentYear=${ay}`;
    return await this.itrMsService.getMethod(param).toPromise();
  }

  async postFreshItr(
    userId: any,
    ay: string,
    fy: string,
    filingTeamMemberId: any
  ) {
    let profile = {
      userId: userId,
    };
    this.ITR_JSON = this.createEmptyJson(profile, ay, fy);
    this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
    const param = '/itr';
    return await this.itrMsService.postMethod(param, this.ITR_JSON).toPromise();
  }

  async getAllBankByIfsc() {
    const param = '/bankCodeDetails';
    return await this.userMsService.getMethod(param).toPromise();
  }

  async getBankByIfsc(ifscCode) {
    const bankList = JSON.parse(
      sessionStorage.getItem(AppConstants.BANK_LIST) || null
    );
    if (
      this.isNonEmpty(bankList) &&
      bankList instanceof Array &&
      bankList.length > 0
    ) {
      const bank = bankList.filter(
        (item: any) =>
          item.ifscCode.substring(0, 4) === ifscCode.substring(0, 4)
      );
      return bank[0];
    } else {
      let res: any = await this.getAllBankByIfsc().catch((error) => {
        console.log(error);
        this.showSnackBar('Error While getting My Bank list.');
        return [];
      });
      if (res && res instanceof Array) {
        const bank = res.filter(
          (item: any) =>
            item.ifscCode.substring(0, 4) === ifscCode.substring(0, 4)
        );
        sessionStorage.setItem(AppConstants.BANK_LIST, JSON.stringify(res));
        return bank[0];
      }
      return [];
    }
  }

  checkDuplicateInObject(propertyName, inputArray) {
    let seenDuplicate = false,
      // eslint-disable-next-line prefer-const
      testObject = {};

    inputArray.map(function (item) {
      const itemPropertyName = item[propertyName];
      if (itemPropertyName in testObject) {
        testObject[itemPropertyName].duplicate = true;
        item.duplicate = true;
        seenDuplicate = true;
      } else {
        testObject[itemPropertyName] = item;
        delete item.duplicate;
      }
    });

    return seenDuplicate;
  }

  async getPincodeData(pinCode) {
    const promise = new Promise<any>((resolve, reject) => {
      let data = null;
      if (pinCode.valid) {
        const param = '/pincode/' + pinCode.value;
        // return await this.userMsService.getMethod(param).toPromise();
        this.userMsService.getMethod(param).subscribe(
          (result: any) => {
            data = {
              country: 'INDIA',
              countryCode: '91',
              city: result.districtName,
              stateCode: result.stateCode,
            };
            resolve(data);
          },
          (error) => {
            if (error.status === 404) {
              reject(error);
            }
          }
        );
      } else {
        console.log('pinCode invalid', pinCode);
      }
    });
    return promise;
  }

  // updateAssignmentToggle(assignmentToggleData) :Observable<any>{
  //     return this.httpClient.post('environment.url' + '/user/sme/assignment-logic-toggle', assignmentToggleData)
  // }

  // getAssignmentToggle() :Observable<any>{
  //     return this.httpClient.get('environment.url' + '/user/sme/assignment-logic-toggle')
  // }

  private updateItrObject(result, itrObject: ITR_JSON) {
    //update type in ITR object & save
    itrObject.itrType = result?.data?.itrType;
    const param =
      '/itr/' +
      itrObject.userId +
      '/' +
      itrObject.itrId +
      '/' +
      itrObject.assessmentYear;
    return this.itrMsService.putMethod(param, itrObject);
  }

  /**
   * This method shall be used throughout ITR utility for saving the ITR json data to backend.
   * The exception cases are for saving the initial data after prefill or summary json upload.
   * @param itrObject The ITR object to be saved to backend
   */
  saveItrObject(itrObject: ITR_JSON): Observable<any> {
    //https://api.taxbuddy.com/itr/itr-type?itrId={itrId}
    if (itrObject.itrSummaryJson) {
      itrObject.isItrSummaryJsonEdited = true;
      const param =
        '/itr/' +
        itrObject.userId +
        '/' +
        itrObject.itrId +
        '/' +
        itrObject.assessmentYear;
      return this.itrMsService.putMethod(param, itrObject);
    } else {
      itrObject.isItrSummaryJsonEdited = false;
      const param = `/itr/itr-type`;
      return this.itrMsService
        .postMethod(param, itrObject)
        .pipe(concatMap((result) => this.updateItrObject(result, itrObject)));
    }
  }

  saveFinalItrObject(itrObject: ITR_JSON): Observable<any> {
    //https://api.taxbuddy.com/itr/itr-type?itrId={itrId}
    const param = `/itr/itr-type`;
    return this.itrMsService
      .postMethod(param, itrObject)
      .pipe(concatMap((result) => this.updateItrObject(result, itrObject)));
  }

  uploadInitialItrObject(itrObject: ITR_JSON): Observable<any> {
    if(itrObject.itrSummaryJson) {
      itrObject.isItrSummaryJsonEdited = false;
      const param =
        '/itr/' +
        itrObject.userId +
        '/' +
        itrObject.itrId +
        '/' +
        itrObject.assessmentYear;
      return this.itrMsService.putMethod(param, itrObject);
    } else {
      itrObject.isItrSummaryJsonEdited = false;
      const param = `/itr/itr-type`;
      return this.itrMsService
        .postMethod(param, itrObject)
        .pipe(concatMap((result) => this.updateItrObject(result, itrObject)));
    }
  }

  getDueDateDetails() {
    //https://uat-api.taxbuddy.com/itr/due-date
    const param = '/due-date';
    return this.itrMsService.getMethod(param);
  }

  getUserDetailsByMobile(loggedInSmeId, mobile) {
    //https://uat-api.taxbuddy.com/user/search/userprofile/query?mobileNumber=3210000078
    const param = `/search/userprofile/query?mobileNumber=${mobile}`;
    return this.userMsService.getMethodNew(param);
  }

  getCgSummary(userId, assessmentYear) {
    const param = '/cg-summary';
    let request = {
      userId: userId,
      assessmentYear: assessmentYear,
    };
    return this.itrMsService.postMethod(param, request);
  }

  getInt(value) {
    return value ? parseInt(value) : 0;
  }

  findAssesseeType(panNumber) {
    let assesseeType = '';
    if (panNumber.substring(4, 3) === 'P') {
      assesseeType = 'INDIVIDUAL';
    } else if (panNumber.substring(4, 3) === 'H') {
      assesseeType = 'HUF';
    } else {
      assesseeType = 'INDIVIDUAL';
    }
    return assesseeType;
  }

  getLoggedInUserID() {
    let smeInfoStr = sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO);
    if (smeInfoStr) {
      const loggedInSmeInfo = JSON.parse(smeInfoStr ?? '');
      if (
        this.isNonEmpty(loggedInSmeInfo) &&
        this.isNonEmpty(loggedInSmeInfo[0].userId)
      ) {
        return loggedInSmeInfo[0].userId;
      }
    } else {
      //send id from local storage, but fetch data in session storage..
      // probably the case is for sharing the login between tabs
      const userData = this.storageService.getLocalStorage(AppSetting.UMD_KEY);
      this.fetchSmeInfo(userData.USER_UNIQUE_ID);
      return userData.USER_UNIQUE_ID;
    }
  }

  fetchSmeInfo(userId) {
    const param = `/sme-details-new/${userId}?smeUserId=${userId}`;
    // this.requestManager.addRequest(this.SME_INFO, this.userMsService.getMethodNew(param));
    this.userMsService.getMethodNew(param).subscribe(
      (res: any) => {
        if (res.success) {
          sessionStorage.setItem(
            AppConstants.LOGGED_IN_SME_INFO,
            JSON.stringify(res.data)
          );
        }
      },
      (error) => {
        console.log('error in fetching sme info', error);
      }
    );
  }

  getIdToken() {
    let userData = JSON.parse(localStorage.getItem('UMD'));
    return userData ? userData.id_token : null;
  }

  getUserRoles() {
    const loggedInSmeInfo = JSON.parse(
      sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) ?? ''
    );
    if (
      this.isNonEmpty(loggedInSmeInfo) &&
      this.isNonEmpty(loggedInSmeInfo[0].roles)
    ) {
      return loggedInSmeInfo[0].roles;
    }
  }

  async getFilersList() {
    // https://uat-api.taxbuddy.com/user/sme-details-new/3000?filer=true
    let loggedInUserId = environment.admin_id;
    console.log('logged in sme id ', loggedInUserId);
    const param = `/sme-details-new/${loggedInUserId}?filer=true`;
    // return await this.userMsService.getMethod(param).toPromise();
    this.userMsService.getMethodNew(param).subscribe((res: any) => {
      console.log('filer List Result', res);
      if (res.success && res.data instanceof Array) {
        let filerList = res.data;
        sessionStorage.setItem(
          AppConstants.ALL_FILERS_LIST,
          JSON.stringify(filerList)
        );
        return filerList;
      }
      // if (res.success) {
      //   sessionStorage.setItem(AppConstants.ALL_FILERS_LIST, JSON.stringify(res.data))
      // }
    });
    // sessionStorage.setItem("autosave", field.value);
  }

  setAddClientJsonData(data: any) {
    this.jsonData = data;
    console.log(this.jsonData, 'this.jsonData');
  }

  getAddClientJsonData() {
    return this.jsonData;
  }
}
