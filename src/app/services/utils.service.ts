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
  Employer,
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
import { ReportService } from './report-service';
import {
  Form,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import {BifurcationComponent} from "../modules/itr-filing/salary/bifurcation/bifurcation.component";

@Injectable()
export class UtilsService {
  ITR_JSON!: ITR_JSON;
  loading: boolean = false;
  private subject = new Subject<any>();
  uploadedJson: any;
  jsonData: any;
  value: any;
  salaryValues: any;
  constructor(
    private snackBar: MatSnackBar,
    private itrMsService: ItrMsService,
    private router: Router,
    private dialog: MatDialog,
    private serializer: UrlSerializer,
    private userMsService: UserMsService,
    private storageService: StorageService,
    private reportService: ReportService
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
      aadhaarEnrolmentId: '',
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
      foreignIncome: {
        id: 1,
        taxPaidOutsideIndiaFlag: null,
        taxReliefAssessmentYear: null,
        taxAmountRefunded: null,
        taxReliefClaimed: [],
        foreignAssets: {
          id: null,
          depositoryAccounts: [],
          custodialAccounts: [],
          equityAndDebtInterest: [],
          cashValueInsurance: [],
          financialInterestDetails: [],
          immovablePropertryDetails: [],
          capitalAssetsDetails: [],
          signingAuthorityDetails: [],
          trustsDetails: [],
          otherIncomeDetails: [],
        },
      },
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
        nameOfDistrict: null,
        landInAcre: null,
        owner: null,
        typeOfLand: null,
        pinCode: null,
      },
      itrProgress: [],
      directorInCompany: [],
      unlistedSharesDetails: [],
      partnerInFirmFlag: 'N',
      partnerFirms: [],
      partnerInFirms: [],
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
      aisLastUploadedDownloadedDate: itrJson
        ? itrJson.aisLastUploadedDownloadedDate
        : null,
      prefillData: itrJson ? itrJson.prefillData : null,
      prefillDataSource: itrJson ? itrJson.prefillDataSource : null,
      aisDataSource: itrJson ? itrJson.aisDataSource : null,
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
      portugeseCC5AFlag: 'N',
      schedule5a: undefined,
      isITRU :false,
      itrSummaryJson: null,
      isItrSummaryJsonEdited: false,
      liableSection44AAflag: 'N',
      incomeDeclaredUsFlag: 'N',
      totalSalesExceedOneCr: null,
      aggregateOfAllAmountsReceivedFlag: null,
      aggregateOfAllPaymentsMadeFlag: null,
      liableSection44ABFlag:'N',

      agriculturalIncome: {
        grossAgriculturalReceipts: null,
        expenditureIncurredOnAgriculture: null,
        unabsorbedAgriculturalLoss: null,
        agriIncomePortionRule7: null,
        netAgriculturalIncome: null,
      },

      agriculturalLandDetails: [
        {
          nameOfDistrict: null,
          pinCode: null,
          landInAcre: null,
          owner: null, //"O - Owned; H - Held on lease"
          typeOfLand: null, //"IRG - Irrigated; RF - Rain-fed"
        },
      ],

      giftTax: {
        aggregateValueWithoutConsideration: 0,
        aggregateValueWithoutConsiderationNotTaxable: false,
        immovablePropertyWithoutConsideration: 0,
        immovablePropertyWithoutConsiderationNotTaxable: false,
        immovablePropertyInadequateConsideration: 0,
        immovablePropertyInadequateConsiderationNotTaxable: false,
        anyOtherPropertyWithoutConsideration: 0,
        anyOtherPropertyWithoutConsiderationNotTaxable: false,
        anyOtherPropertyInadequateConsideration: 0,
        anyOtherPropertyInadequateConsiderationNotTaxable: false,
      },

      winningsUS115BB: [{ 
        source: null,
        quarter1: 0,
        quarter2: 0,
        quarter3: 0,
        quarter4: 0,
        quarter5: 0,
        total: 0,
      }],
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
    // 'https://dev-api.taxbuddy.com/report/bo/sme/all-list?active=true&page=0&pageSize=10' \
    const param = `/bo/sme/all-list?active=true&page=0&pageSize=10000`;
    return await this.reportService.getMethod(param).toPromise();
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
    const param = `/bo/sme-details-new/${loggedInUserId}?partnerType=INDIVIDUAL,PRINCIPAL`;
    return await this.reportService.getMethod(param).toPromise();
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

  manageFilerLoginSession(userId: any){
     //https://uat-api.taxbuddy.com/user/sme-login?smeUserId=7002
     let token = sessionStorage.getItem('webToken');
     let query = ''
     if (token) {
       query = `&firebaseWebToken=${token}`;
     }
     const param = `/sme-login?smeUserId=${userId}${query}`;
     this.userMsService.postMethod(param).subscribe((res: any) => {
       if (res.success) {
         console.log('sme login registered successfully');
       } else {
         console.log('login', res);
       }
     });
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
    const param = `/bo/sme-details-new/${loggedInUserId}?leader=true`;
    return await this.reportService.getMethod(param).toPromise();
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
      if (
        itemPropertyName !== null &&
        itemPropertyName !== '' &&
        itemPropertyName in testObject
      ) {
        testObject[itemPropertyName].duplicate = true;
        item.duplicate = true;
        seenDuplicate = true;
      } else {
        if (itemPropertyName !== 'GGGGG0000G') {
          testObject[itemPropertyName] = item;
          delete item.duplicate;
        }
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
    if (itrObject.itrSummaryJson) {
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

  getUserDetailsByUserId(userId) {
    //https://uat-api.taxbuddy.com/user/search/userprofile/query?userId=3210
    const param = `/search/userprofile/query?userId=${userId}`;
    return this.userMsService.getMethodNew(param);
  }

  getFilerIdByMobile(mobile,ITR?){
    //user list api to get filerId for create subscription
    //https://uat-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&serviceType=ITR&mobileNumber=3263636364
    let param ='';
    let role = this.getUserRoles();
    let loggedInSmeId = this.getLoggedInUserID();
    let userFilter = '';
    if(role.includes('ROLE_LEADER')){
      userFilter='&leaderUserId='+ loggedInSmeId ;
    }
    if(ITR){
      param = `/bo/user-list-new?page=0&pageSize=20&mobileNumber=${mobile}${userFilter}`
    }else{
      param = `/bo/user-list-new?page=0&pageSize=20&itrChatInitiated=true&mobileNumber=${mobile}${userFilter}`
    }

    return this.userMsService.getMethodNew(param);
  }

  getActiveUsers(mobile){
   //api to check weather user is active
  // https://api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&mobileNumber=8840046021&active=false
    const param = `/bo/user-list-new?page=0&pageSize=20&mobileNumber=${mobile}&active=false`
    return this.userMsService.getMethodNew(param);
  }

  /**
   * API call to get pan details with user id
   * @param panNumber PAN number for which details to be checked
   * @param userId The user with which the PAN is associated, user id is optional when creating when user
   */
  getPanDetails(panNumber, userId?) {
    const param = userId
      ? `/itr/api/getPanDetail?panNumber=${panNumber}&userId=${userId}`
      : `/itr/api/getPanDetail?panNumber=${panNumber}`;
    return this.userMsService.getMethodInfo(param);
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

  getPartnerType() {
    const loggedInSmeInfo = JSON.parse(
      sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) ?? ''
    );
    if (
      this.isNonEmpty(loggedInSmeInfo) &&
      this.isNonEmpty(loggedInSmeInfo[0].partnerType)
    ) {
      return loggedInSmeInfo[0].partnerType;
    }
  }

  async getFilersList() {
    // https://uat-api.taxbuddy.com/user/sme-details-new/3000?filer=true
    let loggedInUserId = environment.admin_id;
    console.log('logged in sme id ', loggedInUserId);
    const param = `/bo/sme-details-new/${loggedInUserId}?partnerType=INDIVIDUAL,PRINCIPAL`;
    // return await this.userMsService.getMethod(param).toPromise();
    this.reportService.getMethod(param).subscribe((res: any) => {
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

  private dataSubject = new Subject<any>();

  sendData(data: any, component: string) {
    this.dataSubject.next({ data, component });
  }

  getData() {
    return this.dataSubject.asObservable();
  }

  setSalaryValues(values) {
    this.salaryValues = values;
  }

  getSalaryValues() {
    return this.salaryValues;
  }

  highlightInvalidFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      if (formGroup.get(key) instanceof FormControl) {
        const controlErrors: ValidationErrors = formGroup.get(key).errors;
        if (controlErrors != null) {
          console.log(formGroup);
          Object.keys(controlErrors).forEach((keyError) => {
            console.log(
              'Key control: ' +
                key +
                ', keyError: ' +
                keyError +
                ', err value: ',
              controlErrors[keyError]
            );
            formGroup.controls[key].markAsTouched();
            return;
          });
        }
      } else if (formGroup.get(key) instanceof FormGroup) {
        this.highlightInvalidFormFields(formGroup.get(key) as FormGroup);
      } else if (formGroup.get(key) instanceof FormArray) {
        let formArray = formGroup.get(key) as FormArray;
        formArray.controls.forEach((element) => {
          this.highlightInvalidFormFields(element as FormGroup);
        });
      }
    });
  }

  setChange(value) {
    return (this.value = value);
  }

  getChange() {
    return this.value;
  }

  getCountryCodeList() {
    return [
      '93:AFGHANISTAN',
      '1001:ÅLAND ISLANDS',
      '355:ALBANIA',
      '213:ALGERIA',
      '684:AMERICAN SAMOA',
      '376:ANDORRA',
      '244:ANGOLA',
      '1264:ANGUILLA',
      '1010:ANTARCTICA',
      '1268:ANTIGUA AND BARBUDA',
      '54:ARGENTINA',
      '374:ARMENIA',
      '297:ARUBA',
      '61:AUSTRALIA',
      '43:AUSTRIA',
      '994:AZERBAIJAN',
      '1242:BAHAMAS',
      '973:BAHRAIN',
      '880:BANGLADESH',
      '1246:BARBADOS',
      '375:BELARUS',
      '32:BELGIUM',
      '501:BELIZE',
      '229:BENIN',
      '1441:BERMUDA',
      '975:BHUTAN',
      '591:BOLIVIA (PLURINATIONAL STATE OF)',
      '1002:BONAIRE, SINT EUSTATIUS AND SABA',
      '387:BOSNIA AND HERZEGOVINA',
      '267:BOTSWANA',
      '1003:BOUVET ISLAND',
      '55:BRAZIL',
      '1014:BRITISH INDIAN OCEAN TERRITORY',
      '673:BRUNEI DARUSSALAM',
      '359:BULGARIA',
      '226:BURKINA FASO',
      '257:BURUNDI',
      '238:CABO VERDE',
      '855:CAMBODIA',
      '237:CAMEROON',
      '1:CANADA',
      '1345:CAYMAN ISLANDS',
      '236:CENTRAL AFRICAN REPUBLIC',
      '235:CHAD',
      '56:CHILE',
      '86:CHINA',
      '9:CHRISTMAS ISLAND',
      '672:COCOS (KEELING) ISLANDS',
      '57:COLOMBIA',
      '270:COMOROS',
      '242:CONGO',
      '243:CONGO (DEMOCRATIC REPUBLIC OF THE)',
      '682:COOK ISLANDS',
      '506:COSTA RICA',
      "225:CÔTE D'IVOIRE",
      '385:CROATIA',
      '53:CUBA',
      '1015:CURAÇAO',
      '357:CYPRUS',
      '420:CZECHIA',
      '45:DENMARK',
      '253:DJIBOUTI',
      '1767:DOMINICA',
      '1809:DOMINICAN REPUBLIC',
      '593:ECUADOR',
      '20:EGYPT',
      '503:EL SALVADOR',
      '240:EQUATORIAL GUINEA',
      '291:ERITREA',
      '372:ESTONIA',
      '251:ETHIOPIA',
      '500:FALKLAND ISLANDS (MALVINAS)',
      '298:FAROE ISLANDS',
      '679:FIJI',
      '358:FINLAND',
      '33:FRANCE',
      '594:FRENCH GUIANA',
      '689:FRENCH POLYNESIA',
      '1004:FRENCH SOUTHERN TERRITORIES',
      '241:GABON',
      '220:GAMBIA',
      '995:GEORGIA',
      '49:GERMANY',
      '233:GHANA',
      '350:GIBRALTAR',
      '30:GREECE',
      '299:GREENLAND',
      '1473:GRENADA',
      '590:GUADELOUPE',
      '1671:GUAM',
      '502:GUATEMALA',
      '1481:GUERNSEY',
      '224:GUINEA',
      '245:GUINEA-BISSAU',
      '592:GUYANA',
      '509:HAITI',
      '1005:HEARD ISLAND AND MCDONALD ISLANDS',
      '6:HOLY SEE',
      '504:HONDURAS',
      '852:HONG KONG',
      '36:HUNGARY',
      '354:ICELAND',
      '62:INDONESIA',
      '98:IRAN (ISLAMIC REPUBLIC OF)',
      '964:IRAQ',
      '353:IRELAND',
      '1624:ISLE OF MAN',
      '972:ISRAEL',
      '5:ITALY',
      '1876:JAMAICA',
      '81:JAPAN',
      '1534:JERSEY',
      '962:JORDAN',
      '7:KAZAKHSTAN',
      '254:KENYA',
      '686:KIRIBATI',
      "850:KOREA(DEMOCRATIC PEOPLE'S REPUBLIC OF)",
      '82:KOREA (REPUBLIC OF)',
      '965:KUWAIT',
      '996:KYRGYZSTAN',
      "856:LAO PEOPLE'S DEMOCRATIC REPUBLIC",
      '371:LATVIA',
      '961:LEBANON',
      '266:LESOTHO',
      '231:LIBERIA',
      '218:LIBYA',
      '423:LIECHTENSTEIN',
      '370:LITHUANIA',
      '352:LUXEMBOURG',
      '853:MACAO',
      '389:MACEDONIA(THE FORMER YUGOSLAV REPUBLIC OF)',
      '261:MADAGASCAR',
      '256:MALAWI',
      '60:MALAYSIA',
      '960:MALDIVES',
      '223:MALI',
      '356:MALTA',
      '692:MARSHALL ISLANDS',
      '596:MARTINIQUE',
      '222:MAURITANIA',
      '230:MAURITIUS',
      '269:MAYOTTE',
      '52:MEXICO',
      '691:MICRONESIA (FEDERATED STATES OF)',
      '373:MOLDOVA (REPUBLIC OF)',
      '377:MONACO',
      '976:MONGOLIA',
      '382:MONTENEGRO',
      '1664:MONTSERRAT',
      '212:MOROCCO',
      '258:MOZAMBIQUE',
      '95:MYANMAR',
      '264:NAMIBIA',
      '674:NAURU',
      '977:NEPAL',
      '31:NETHERLANDS',
      '687:NEW CALEDONIA',
      '64:NEW ZEALAND',
      '505:NICARAGUA',
      '227:NIGER',
      '234:NIGERIA',
      '683:NIUE',
      '15:NORFOLK ISLAND',
      '1670:NORTHERN MARIANA ISLANDS',
      '47:NORWAY',
      '968:OMAN',
      '92:PAKISTAN',
      '680:PALAU',
      '970:PALESTINE, STATE OF',
      '507:PANAMA',
      '675:PAPUA NEW GUINEA',
      '595:PARAGUAY',
      '51:PERU',
      '63:PHILIPPINES',
      '1011:PITCAIRN',
      '48:POLAND',
      '14:PORTUGAL',
      '1787:PUERTO RICO',
      '974:QATAR',
      '262:RÉUNION',
      '40:ROMANIA',
      '8:RUSSIAN FEDERATION',
      '250:RWANDA',
      '1006:SAINT BARTHÉLEMY',
      '290: SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA',
      '1869:SAINT KITTS AND NEVIS',
      '1758:SAINT LUCIA',
      '1007:SAINT MARTIN (FRENCH PART)',
      '508:SAINT PIERRE AND MIQUELON',
      '1784:SAINT VINCENT AND THE GRENADINES',
      '685:SAMOA',
      '378:SAN MARINO',
      '239:SAO TOME AND PRINCIPE',
      '966:SAUDI ARABIA',
      '221:SENEGAL',
      '381:SERBIA',
      '248:SEYCHELLES',
      '232:SIERRA LEONE',
      '65:SINGAPORE',
      '1721:SINT MAARTEN (DUTCH PART)',
      '421:SLOVAKIA',
      '386:SLOVENIA',
      '677:SOLOMON ISLANDS',
      '252:SOMALIA',
      '28:SOUTH AFRICA',
      '1008:SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
      '211:SOUTH SUDAN',
      '35:SPAIN',
      '94:SRI LANKA',
      '249:SUDAN',
      '597:SURINAME',
      '1012:SVALBARD AND JAN MAYEN',
      '268:SWAZILAND',
      '46:SWEDEN',
      '41:SWITZERLAND',
      '963:SYRIAN ARAB REPUBLIC',
      '886:TAIWAN, PROVINCE OF CHINA[A]',
      '992:TAJIKISTAN',
      '255:TANZANIA, UNITED REPUBLIC OF',
      '66:THAILAND',
      '670:TIMOR-LESTE (EAST TIMOR)',
      '228:TOGO',
      '690:TOKELAU',
      '676:TONGA',
      '1868:TRINIDAD AND TOBAGO',
      '216:TUNISIA',
      '90:TURKEY',
      '993:TURKMENISTAN',
      '1649:TURKS AND CAICOS ISLANDS',
      '688:TUVALU',
      '256:UGANDA',
      '380:UKRAINE',
      '971:UNITED ARAB EMIRATES',
      '44:UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND',
      '2:UNITED STATES OF AMERICA',
      '1009:UNITED STATES MINOR OUTLYING ISLANDS',
      '598:URUGUAY',
      '998:UZBEKISTAN',
      '678:VANUATU',
      '58:VENEZUELA (BOLIVARIAN REPUBLIC OF)',
      '84:VIET NAM',
      '1284:VIRGIN ISLANDS (BRITISH)',
      '1340:VIRGIN ISLANDS (U.S.)',
      '681:WALLIS AND FUTUNA',
      '1013:WESTERN SAHARA',
      '967:YEMEN',
      '260:ZAMBIA',
      '263:ZIMBABWE',
      '9999:OTHERS',
    ];
  }

  getBifurcation(localEmployer: Employer) {
    let bifurcation = {
      SEC17_1: {total: 0, value: {}},
      SEC17_2: {total: 0, value: {}},
      SEC17_3: {total: 0, value: {}}
    };
    let total = 0;
    localEmployer.salary.forEach(income => {
      if(income.salaryType !== 'SEC17_1'){
        bifurcation.SEC17_1.value[income.salaryType] = income.taxableAmount;
        total += income.taxableAmount;
      }
    });
    bifurcation.SEC17_1.total = total;
    total = 0;
    localEmployer.perquisites.forEach(income => {
      if(income.perquisiteType !== 'SEC17_2'){
        bifurcation.SEC17_2.value[income.perquisiteType] = income.taxableAmount;
        total += income.taxableAmount;
      }
    });
    bifurcation.SEC17_2.total = total;
    total = 0;
    localEmployer.profitsInLieuOfSalaryType.forEach(income => {
      if(income.salaryType !== 'SEC17_3'){
        bifurcation.SEC17_3.value[income.salaryType] = income.taxableAmount;
        total += income.taxableAmount;
      }
    });
    bifurcation.SEC17_3.total = total;

    return bifurcation;
  }

  resetBifurcation(localEmployer: Employer, section) {
    let total = 0;
    if(section === 'SEC17_1') {
      localEmployer.salary = localEmployer.salary.filter(income => income.salaryType === 'SEC17_1');
    }

    if(section === 'SEC17_2') {
      localEmployer.perquisites = localEmployer.perquisites.filter(income => income.perquisiteType === 'SEC17_2');
    }

    if(section === 'SEC17_3') {
      localEmployer.profitsInLieuOfSalaryType = localEmployer.profitsInLieuOfSalaryType.filter(
          income => income.salaryType === 'SEC17_3');
    }

    return localEmployer;
  }

  updateEmployerBifurcation(localEmployer: Employer, section, bifurcationResult: any){
    const salaryValues = this.getSalaryValues()?.salary;
    if(section === 'SEC17_1') {
      const bifurcationValues = bifurcationResult?.SEC17_1?.value
          ? bifurcationResult?.SEC17_1?.value
          : salaryValues?.[0];

      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          // if (element && element !== 0) {
            localEmployer?.salary?.push({
              salaryType: key,
              taxableAmount: element,
              exemptAmount: 0,
            });
          // }
        }
      }
    }
    if(section === 'SEC17_2') {
      const bifurcationValues = bifurcationResult?.SEC17_2?.value
          ? bifurcationResult?.SEC17_2?.value
          : salaryValues?.[0];

      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          // if (element && element !== 0) {
            localEmployer?.perquisites?.push({
              perquisiteType: key,
              taxableAmount: element,
              exemptAmount: 0
            });
          // }
        }
      }
    }
    if(section === 'SEC17_3') {
      const bifurcationValues = bifurcationResult?.SEC17_3?.value
          ? bifurcationResult?.SEC17_3?.value
          : salaryValues?.[0];

      for (const key in bifurcationValues) {
        if (bifurcationValues.hasOwnProperty(key)) {
          const element = parseFloat(bifurcationValues[key]);
          console.log(element);
          // if (element && element !== 0) {
            localEmployer?.profitsInLieuOfSalaryType?.push({
              salaryType: key,
              taxableAmount: element,
              exemptAmount: 0,
            });
          // }
        }
      }
    }
    return localEmployer;
  }
}
