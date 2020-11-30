import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ITR_JSON } from './../shared/interfaces/itr-input.interface';

@Injectable()

export class UtilsService {
    constructor(private snackBar: MatSnackBar,) { }
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

    showErrorMsg(errorCode){
        var errorMessage = '';
        if(errorCode === 400){
            errorMessage = 'Bad request, invalid input request.';
        }
        else if(errorCode === 401){
            errorMessage = 'Unauthorized user.';
        }
        else if(errorCode === 403){
            errorMessage = 'You do not have access of this part.';
        }
        else if(errorCode === 404){
            errorMessage = 'Data not found in system.';
        }
        else if(errorCode === 500){
            errorMessage = 'Internal server error.';
        }
        return errorMessage;
    }

}