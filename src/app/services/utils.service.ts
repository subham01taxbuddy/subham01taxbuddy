import { ItrActionsComponent } from './../shared/components/itr-actions/itr-actions.component';
import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AppConstants } from 'app/shared/constants';
import { Observable, Subject } from 'rxjs';
import { ITR_JSON } from './../shared/interfaces/itr-input.interface';
import { ItrMsService } from './itr-ms.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { UserMsService } from './user-ms.service';

@Injectable()

export class UtilsService {
    ITR_JSON: ITR_JSON;
    loading: boolean = false;
    private subject = new Subject<any>();
    constructor(private snackBar: MatSnackBar, private itrMsService: ItrMsService,
        private router: Router, private dialog: MatDialog,
        private userMsService: UserMsService,) { }
    /**
    * @function isNonEmpty()
    * @param param
    * @description This function is used for checking the expected parameter is empty undefined or null, this function will be used for objects as well as strings
    * @author Ashish Hulwan
    * @returns this will return boolean value
    */
    isNonEmpty(param): boolean {
        if (param !== null && param !== undefined && param !== "")
            return true
        else
            return false
    }

    isNonZero(param): boolean {
        if (Number(param) !== 0 && param !== null && param !== undefined && param !== "")
            return true
        else
            return false
    }

    smoothScrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    currencyFormatter(val) {
        if (this.isNonEmpty(val)) {
            return val.toLocaleString('en-IN')
        } else {
            return 0
        }
    }
    gstinValidator = new RegExp(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/);
    isGSTINValid(gstin) {
        let result = this.gstinValidator.test(gstin);
        console.log("GSTIN check result", result)
        return result
    }

    //scroll to specific div
    smoothScrollToDiv(divId) {
        console.log(divId)
        return document.getElementById(divId).scrollIntoView({ behavior: "smooth" });
    }

    showSnackBar(msg) {
        this.snackBar.open(msg, 'OK', {
            verticalPosition: 'top',
            horizontalPosition: 'center',
            duration: 3000
        });
    }

    async getITRByUserIdAndAssesmentYear(profile, ref?: any, filingTeamMemberId?: any) {
        console.log('filingTeamMemberId====', filingTeamMemberId);
        this.loading = true;
        // this.isLoggedIn = this.encrDecrService.get(AppConstants.IS_USER_LOGGED_IN);
        // let list = []
        const fyList = await this.getStoredFyList();
        const currentFyDetails = fyList.filter(item => item.isFilingActive);
        if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
            this.showSnackBar('There is no any active filing year available')
            return;
        }
        // const currentAy = (currentFyDetails.length > 0 ? currentFyDetails[0].assessmentYear : AppConstants.ayYear)
        // const currentFy = (currentFyDetails.length > 0 ? currentFyDetails[0].financialYear : AppConstants.ayYear)
        const param = `/itr?userId=${profile.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}`;
        this.itrMsService.getMethod(param).subscribe((result: any) => {
            console.log('My ITR by user Id and Assesment Years=', result);
            if (result.length !== 0) {
                let isWIP_ITRFound = true;
                for (let i = 0; i < result.length; i++) {
                    let currentFiledITR = result.filter(item => (item.assessmentYear === currentFyDetails[0].assessmentYear && item.eFillingCompleted));
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
                    let obj = this.createEmptyJson(profile, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear)
                    Object.assign(obj, this.ITR_JSON)
                    console.log('obj:', obj)
                    this.ITR_JSON = JSON.parse(JSON.stringify(obj))
                    this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
                    console.log('this.ITR_JSONthis.ITR_JSONthis.ITR_JSON', this.ITR_JSON);
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
                    if (ref === "ITR") {
                        let disposable = this.dialog.open(ItrActionsComponent, {
                            width: '50%',
                            height: 'auto',
                            data: {
                                itrObjects: result,
                            }
                        })
                        disposable.afterClosed().subscribe(result => {
                            console.log('The dialog was closed');
                        });
                        return;
                    }
                    alert('ITR Fillied/Acknowledgement not received');
                }

            } else {
                this.ITR_JSON = this.createEmptyJson(profile, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
                this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
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
                this.ITR_JSON = this.createEmptyJson(profile, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
                this.ITR_JSON.filingTeamMemberId = filingTeamMemberId;
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
            userId: this.isNonEmpty(profile) ? profile.userId : null,
            itrId: null,
            pid: '',
            email: this.isNonEmpty(profile) ? profile.emailAddress : '',
            contactNumber: this.isNonEmpty(profile) ? profile.mobileNumber : '',
            panNumber: this.isNonEmpty(profile) ? profile.panNumber : '',
            aadharNumber: '', // profile.aadharNumber,
            residentialStatus: this.isNonEmpty(profile) ? profile.residentialStatus : '',
            maritalStatus: this.isNonEmpty(profile) ? profile.maritalStatus : '',
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
                    fName: this.isNonEmpty(profile) ? profile.fName : '',
                    mName: this.isNonEmpty(profile) ? profile.mName : '',
                    lName: this.isNonEmpty(profile) ? profile.lName : '',
                    fatherName: this.isNonEmpty(profile) ? profile.fatherName : '', // Added by arati
                    age: null,
                    gender: this.isNonEmpty(profile) ? profile.gender : '',
                    relationShipCode: 'SELF',
                    relationType: 'SELF',
                    dateOfBirth: this.isNonEmpty(profile) ? profile.dateOfBirth : ''
                }
            ],
            address: this.isNonEmpty(profile) && this.isNonEmpty(profile.address) ? profile.address[0] : null,
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
            bankDetails: this.isNonEmpty(profile) && this.isNonEmpty(profile.bankDetails) ? profile.bankDetails : [],
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

    sendMessage(message: any) {
        console.log('get message: ', message)
        this.subject.next({ text: message });
    }

    clearMessages() {
        this.subject.next();
    }

    onMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    showErrorMsg(errorCode) {
        var errorMessage = '';
        if (errorCode === 400) {
            errorMessage = 'Bad request, invalid input request.';
        }
        else if (errorCode === 401) {
            errorMessage = 'Unauthorized user.';
        }
        else if (errorCode === 403) {
            errorMessage = 'You do not have access of this part.';
        }
        else if (errorCode === 404) {
            errorMessage = 'Data not found in system.';
        }
        else if (errorCode === 500) {
            errorMessage = 'Internal server error.';
        }
        else{
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
        if (this.isNonEmpty(fyList) && fyList instanceof Array) {
            return fyList;
        } else {
            let res: any = await this.getFyList().catch(error => {
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
        const smeList = JSON.parse(sessionStorage.getItem(AppConstants.SME_LIST));
        // console.log('fyList', fyList);
        if (this.isNonEmpty(smeList) && smeList instanceof Array) {
            return smeList;
        } else {
            let res: any = await this.getSmeList().catch(error => {
                this.loading = false;
                console.log(error);
                this.showSnackBar('Error While getting SME list.');
                return [];
            });
            if (res && res instanceof Array) {
                sessionStorage.setItem(AppConstants.SME_LIST, JSON.stringify(res));
                return res;
            }
        }
    }
    async getSmeList() {
        const param = `${ApiEndpoints.userMs.smeDetails}`;
        return await this.userMsService.getMethod(param).toPromise();
    }
}