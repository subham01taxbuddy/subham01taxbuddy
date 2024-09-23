import { formatDate } from "@angular/common";
import { ITR_JSON } from "../modules/shared/interfaces/itr-input.interface";
import { UtilsService } from "./utils.service";
import { environment } from "../../environments/environment";
import { ItrMsService } from "./itr-ms.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class SummaryConversionService {

    ITR_Type = '';
    ITR14_IncomeDeductions = '';
    taxComputation = '';
    regime = '';

    constructor(private utilsService: UtilsService,
        private itrMsService: ItrMsService,
        private httpClient: HttpClient) { }
    convertJsonToObject(ItrJSON: any, ITR_Obj: ITR_JSON, userProfile: any) {
        //setting itrSummaryJson in ITR obj
        ITR_Obj.itrSummaryJson = ItrJSON;


        // Setting the ITR Type in ITR Object and updating the ITR_Type and incomeDeductions key
        {
            if (ItrJSON.hasOwnProperty('ITR1')) {
                ITR_Obj.itrType = '1';
                this.ITR_Type = 'ITR1';
                this.ITR14_IncomeDeductions = 'ITR1_IncomeDeductions';
                this.taxComputation = 'ITR1_TaxComputation';
            } else if (ItrJSON.hasOwnProperty('ITR2')) {
                ITR_Obj.itrType = '2';
                this.ITR_Type = 'ITR2';
            } else if (ItrJSON.hasOwnProperty('ITR3')) {
                ITR_Obj.itrType = '3';
                this.ITR_Type = 'ITR3';
            } else if (ItrJSON.hasOwnProperty('ITR4')) {
                ITR_Obj.itrType = '4';
                this.ITR_Type = 'ITR4';
                this.ITR14_IncomeDeductions = 'IncomeDeductions';
                this.taxComputation = 'TaxComputation';
            }
        }

        // Setting the assessmentYear
        {
            let assessmentYear;
            if (ItrJSON[this.ITR_Type].hasOwnProperty('Form_ITR1')) {
                assessmentYear = ItrJSON[this.ITR_Type].Form_ITR1?.AssessmentYear;
            } else if (ItrJSON[this.ITR_Type].hasOwnProperty('Form_ITR4')) {
                assessmentYear = ItrJSON[this.ITR_Type].Form_ITR4?.AssessmentYear;
            } else if (ItrJSON[this.ITR_Type].hasOwnProperty('Form_ITR2')) {
                assessmentYear = ItrJSON[this.ITR_Type].Form_ITR2?.AssessmentYear;
            } else if (ItrJSON[this.ITR_Type].hasOwnProperty('Form_ITR3')) {
                assessmentYear = ItrJSON[this.ITR_Type].Form_ITR3?.AssessmentYear;
            }

            if (assessmentYear === '2023') {
                ITR_Obj.assessmentYear = '2023-2024';
                ITR_Obj.financialYear = '2022-2023';
            } else if (assessmentYear === '2022') {
                ITR_Obj.assessmentYear = '2022-2023';
                ITR_Obj.financialYear = '2021-2022';
            } else if (assessmentYear === '2021') {
                ITR_Obj.assessmentYear = '2021-2022';
                ITR_Obj.financialYear = '2020-2021';
            } else if (assessmentYear === '2020') {
                ITR_Obj.assessmentYear = '2020-2021';
                ITR_Obj.financialYear = '2019-2020';
            }
        }

        // setting assesseType, need to set for HUF dynamically later
        ITR_Obj.assesseeType = 'INDIVIDUAL';

        // SOME DEDUCTION FIELDS, HP CODE UPDATE
        if (this.ITR_Type === 'ITR1' || this.ITR_Type === 'ITR4') {
            // Error if PAN does not match the PAN in ITR OBJECT
            if (
                ITR_Obj?.panNumber !== ItrJSON[this.ITR_Type].PersonalInfo?.PAN
            ) {
                ITR_Obj = this.utilsService.createEmptyJson(
                    userProfile,
                    ITR_Obj.assessmentYear,
                    ITR_Obj.financialYear,
                    ITR_Obj.itrId,
                    ITR_Obj.filingTeamMemberId,
                    ITR_Obj.id
                );
                console.log(ITR_Obj, 'ITRJSON');
                ITR_Obj.itrSummaryJson = null;
                ITR_Obj.itrSummaryJson = null;

                console.log(
                    'PAN from the uploaded JSON and the PAN from Users Profile / Customer Profile are different'
                );
            }

            if (
                ITR_Obj.panNumber === ItrJSON[this.ITR_Type].PersonalInfo?.PAN
            ) {
                // PERSONAL INFORMATION
                {
                    // CUSTOMER PROFILE
                    {
                        if (ITR_Obj.isRevised === 'N') {
                            ITR_Obj.isRevised =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.ReturnFileSec === 17
                                    ? 'Y'
                                    : 'N';
                        } else if (ITR_Obj.isRevised === 'Y') {
                            if (
                                ItrJSON[this.ITR_Type]?.FilingStatus?.ReturnFileSec !== 17 &&
                                ItrJSON[this.ITR_Type]?.FilingStatus?.ReturnFileSec !== 11
                            ) {
                                ITR_Obj.isRevised = 'N';
                            } else if (
                                ITR_Obj.isRevised === 'Y' &&
                                ItrJSON[this.ITR_Type]?.FilingStatus?.ReturnFileSec === 11
                            ) {
                                console.log(
                                    'Looks like you are trying to update an orignal return but a revise return for the user has already been filed. You cannot file an original return once a revise return is already filed.'
                                );
                                return;
                            }
                        }

                        ITR_Obj.email =
                            ItrJSON[this.ITR_Type].PersonalInfo.Address?.EmailAddress;
                        ITR_Obj.family[0].fName =
                            ItrJSON[this.ITR_Type].PersonalInfo.AssesseeName?.FirstName;
                        ITR_Obj.family[0].mName =
                            ItrJSON[this.ITR_Type].PersonalInfo.AssesseeName?.MiddleName;
                        ITR_Obj.family[0].lName =
                            ItrJSON[
                                this.ITR_Type
                            ].PersonalInfo.AssesseeName?.SurNameOrOrgName;
                        ITR_Obj.family[0].fatherName =
                            ItrJSON[this.ITR_Type].Verification.Declaration?.FatherName;

                        ItrJSON[this.ITR_Type]?.FilingStatus?.ReceiptNo
                            ? (ITR_Obj.orgITRAckNum =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.ReceiptNo)
                            : (ITR_Obj.orgITRAckNum = null);

                        ItrJSON[this.ITR_Type]?.FilingStatus?.OrigRetFiledDate
                            ? (ITR_Obj.orgITRDate = this.parseAndFormatDate(
                                ItrJSON[this.ITR_Type]?.FilingStatus?.OrigRetFiledDate
                            ))
                            : (ITR_Obj.orgITRDate = null);

                        if (this.ITR_Type === 'ITR1') {
                            if (ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegime === 'N') {
                                this.regime = 'OLD';
                                ITR_Obj.regime = this.regime;
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegime === 'Y'
                            ) {
                                this.regime = 'NEW';
                                ITR_Obj.regime = this.regime;
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else {
                                console.log(
                                    'Type of regime is not present in the uploaded JSON'
                                );
                            }
                        }

                        if (this.ITR_Type === 'ITR4') {
                            // "description": "1 - Opting in now; 2 - Not opting; 3 - Continue to opt; 4 - Opt out; 5 - Not eligible to opt in",
                            // optionForCurrentAY
                            if (
                                ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime === 1
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else if (
                                ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime === 2
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime === 3
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else if (
                                ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime === 4
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime === 5
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                !ItrJSON[this.ITR_Type].FilingStatus?.OptingNewTaxRegime
                            ) {
                                console.log(
                                    'Tax Regime detail is not present for this JSON. OptingNewTaxRegime is missing in the JSON '
                                );
                            }

                            // everOptedNewRegime
                            {
                                //Setting 1st question as yes / no
                                if (
                                    ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegime === 'Y'
                                ) {
                                    ITR_Obj.everOptedNewRegime.everOptedNewRegime = true;
                                } else {
                                    ITR_Obj.everOptedNewRegime.everOptedNewRegime = false;
                                }

                                // setting first question details
                                {
                                    if (ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.AssessmentYear)
                                        ITR_Obj.everOptedNewRegime.assessmentYear = ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.AssessmentYear;

                                    if (ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate)
                                        ITR_Obj.everOptedNewRegime.date = this.parseAndFormatDate(ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate);

                                    if (ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo)
                                        ITR_Obj.everOptedNewRegime.acknowledgementNumber = ItrJSON[this.ITR_Type].FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo;
                                }

                            }

                            //  everOptedOutOfNewRegime
                            {
                                //Setting 1st question as yes / no
                                if (ItrJSON[this.ITR_Type]?.FilingStatus?.OptedOutNewTaxRegime === 'Y') {
                                    ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime = true;
                                } else {
                                    ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime = false;
                                }

                                // setting second question details
                                {
                                    if (ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls?.AssessmentYear)
                                        ITR_Obj.everOptedOutOfNewRegime.assessmentYear = ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls?.AssessmentYear;

                                    if (ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate)
                                        ITR_Obj.everOptedOutOfNewRegime.date = this.parseAndFormatDate(ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls.Form10IEDtls?.Form10IEDate);

                                    if (ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo)
                                        ITR_Obj.everOptedOutOfNewRegime.acknowledgementNumber =
                                            ItrJSON[this.ITR_Type].FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo;
                                }

                            }

                            ITR_Obj.regime = ITR_Obj.optionForCurrentAY?.currentYearRegime;

                            this.regime = ITR_Obj.optionForCurrentAY?.currentYearRegime;

                            if (ItrJSON[this.ITR_Type].FilingStatus?.Form10IEDate)
                                ITR_Obj.optionForCurrentAY.date = this.parseAndFormatDate(ItrJSON[this.ITR_Type].FilingStatus?.Form10IEDate);

                            if (ItrJSON[this.ITR_Type].FilingStatus?.Form10IEAckNo)
                                ITR_Obj.optionForCurrentAY.acknowledgementNumber = ItrJSON[this.ITR_Type].FilingStatus?.Form10IEAckNo;


                        }

                        // HAVE TO SET THE RES STATUS MANUALLY AS THIS KEY IS NOT AVAILABLE IN JSON AS OF 14/04/23 AND ONLY "RESIDENT" ARE ALLOWED UNDER ITR1 & ITR4
                        ITR_Obj.residentialStatus = 'RESIDENT';

                        // Updating employer category based on the key that we get from json in our itr obj employer category
                        {
                            let jsonEmployerCategory =
                                ItrJSON[this.ITR_Type].PersonalInfo?.EmployerCategory;

                            if (jsonEmployerCategory === 'CGOV') {
                                ITR_Obj.employerCategory = 'CENTRAL_GOVT';
                            } else if (jsonEmployerCategory === 'SGOV') {
                                ITR_Obj.employerCategory = 'GOVERNMENT';
                            } else if (jsonEmployerCategory === 'PSU') {
                                ITR_Obj.employerCategory = 'PRIVATE';
                            } else if (jsonEmployerCategory === 'PE') {
                                ITR_Obj.employerCategory = 'PE';
                            } else if (jsonEmployerCategory === 'PESG') {
                                ITR_Obj.employerCategory = 'PESG';
                            } else if (jsonEmployerCategory === 'PEPS') {
                                ITR_Obj.employerCategory = 'PEPS';
                            } else if (jsonEmployerCategory === 'PEO') {
                                ITR_Obj.employerCategory = 'PENSIONERS';
                            } else if (jsonEmployerCategory === 'OTH') {
                                ITR_Obj.employerCategory = 'OTHER';
                            } else if (jsonEmployerCategory === 'NA') {
                                ITR_Obj.employerCategory = 'NA';
                            } else {
                                ITR_Obj.employerCategory = 'OTHER';
                            }
                        }

                        ITR_Obj.aadharNumber =
                            ItrJSON[this.ITR_Type].PersonalInfo?.AadhaarCardNo;

                        ITR_Obj.aadhaarEnrolmentId = ItrJSON[this.ITR_Type]?.PersonalInfo?.AadhaarEnrolmentId;
                        // Date is converted in the required format by BO which is utc we get normaL date 29/01/2000 from JSON
                        ITR_Obj.family[0].dateOfBirth = new Date(this.utcDate);
                    }

                    // PERSONAL DETAILS
                    {
                        // ADDRESS DETAILS -
                        {
                            ITR_Obj.address.pinCode = ItrJSON[this.ITR_Type].PersonalInfo.Address?.PinCode;
                            ITR_Obj.address.country = ItrJSON[this.ITR_Type].PersonalInfo.Address?.CountryCode;
                            ITR_Obj.address.state = ItrJSON[this.ITR_Type].PersonalInfo.Address?.StateCode;
                            ITR_Obj.address.city = ItrJSON[
                                this.ITR_Type
                            ].PersonalInfo.Address?.CityOrTownOrDistrict;
                            ITR_Obj.address.flatNo =
                                ItrJSON[this.ITR_Type].PersonalInfo.Address?.ResidenceNo;
                            ITR_Obj.address.premisesName =
                                ItrJSON[this.ITR_Type].PersonalInfo.Address?.ResidenceName;
                            ITR_Obj.address.area =
                                ItrJSON[this.ITR_Type].PersonalInfo.Address?.RoadOrStreet +
                                ItrJSON[this.ITR_Type].PersonalInfo.Address?.LocalityOrArea;
                        }

                        //BANK DETAILS
                        {
                            const UtilityBankDetails =
                                ItrJSON[this.ITR_Type].Refund.BankAccountDtls
                                    ?.AddtnlBankDetails;

                            if (!UtilityBankDetails || UtilityBankDetails.length === 0) {
                                ITR_Obj.bankDetails = [];
                                console.log(
                                    'There are no bank details in the JSON that you have provided'
                                );
                            } else {
                                ITR_Obj.bankDetails = UtilityBankDetails?.map(
                                    ({ IFSCCode, BankName, BankAccountNo, UseForRefund }) => {
                                        return {
                                            id: null,
                                            bankType: null,
                                            ifsCode: IFSCCode,
                                            name: BankName,
                                            accountNumber: BankAccountNo,
                                            hasRefund: UseForRefund === 'true',
                                            swiftcode: null,
                                            countryName: '91',
                                        };
                                    }
                                );
                            }
                        }

                        // SEVENTH PROVISIO DETAILS
                        {
                            ITR_Obj.seventhProviso139 = {
                                seventhProvisio139: 'N',
                                strDepAmtAggAmtExcd1CrPrYrFlg: null,
                                depAmtAggAmtExcd1CrPrYrFlg: null,
                                strIncrExpAggAmt2LkTrvFrgnCntryFlg: null,
                                incrExpAggAmt2LkTrvFrgnCntryFlg: null,
                                strIncrExpAggAmt1LkElctrctyPrYrFlg: null,
                                incrExpAggAmt1LkElctrctyPrYrFlg: null,
                                clauseiv7provisio139i: null,
                                clauseiv7provisio139iDtls: null,
                            };

                            ITR_Obj.seventhProviso139.seventhProvisio139 =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.SeventhProvisio139;

                            ITR_Obj.seventhProviso139.strIncrExpAggAmt1LkElctrctyPrYrFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.IncrExpAggAmt1LkElctrctyPrYrFlg;
                            ITR_Obj.seventhProviso139.incrExpAggAmt1LkElctrctyPrYrFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.AmtSeventhProvisio139iii;

                            ITR_Obj.seventhProviso139.strIncrExpAggAmt2LkTrvFrgnCntryFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.IncrExpAggAmt2LkTrvFrgnCntryFlg;
                            ITR_Obj.seventhProviso139.incrExpAggAmt2LkTrvFrgnCntryFlg =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.AmtSeventhProvisio139ii;

                            if (this.ITR_Type === 'ITR1') {
                                ITR_Obj.seventhProviso139.clauseiv7provisio139i =
                                    ItrJSON[this.ITR_Type]?.FilingStatus?.clauseiv7provisio139i;
                                if (ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.clauseiv7provisio139iDtls) {
                                    ITR_Obj.seventhProviso139.clauseiv7provisio139iDtls =
                                        ItrJSON[
                                            this.ITR_Type
                                        ]?.FilingStatus?.clauseiv7provisio139iDtls?.map(
                                            (element) => ({
                                                nature: parseFloat(
                                                    element?.clauseiv7provisio139iNature
                                                ),
                                                amount: parseFloat(
                                                    element?.clauseiv7provisio139iAmount
                                                ),
                                            })
                                        );
                                }

                                // 1cr is not present in seventhProvisio for ITR1 so setting it as N
                                ITR_Obj.seventhProviso139.strDepAmtAggAmtExcd1CrPrYrFlg =
                                    'N';
                            } else if (this.ITR_Type === 'ITR4') {
                                ITR_Obj.seventhProviso139.clauseiv7provisio139i =
                                    ItrJSON[this.ITR_Type]?.FilingStatus?.clauseiv7provisio139i;
                                if (ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.clauseiv7provisio139iDtls) {
                                    ITR_Obj.seventhProviso139.clauseiv7provisio139iDtls =
                                        ItrJSON[
                                            this.ITR_Type
                                        ]?.FilingStatus?.clauseiv7provisio139iDtls?.map(
                                            (element) => ({
                                                nature: parseFloat(
                                                    element?.clauseiv7provisio139iNature
                                                ),
                                                amount: parseFloat(
                                                    element?.clauseiv7provisio139iAmount
                                                ),
                                            })
                                        );
                                }

                                ITR_Obj.seventhProviso139.strDepAmtAggAmtExcd1CrPrYrFlg =
                                    ItrJSON[
                                        this.ITR_Type
                                    ]?.FilingStatus?.DepAmtAggAmtExcd1CrPrYrFlg;
                                ITR_Obj.seventhProviso139.depAmtAggAmtExcd1CrPrYrFlg =
                                    ItrJSON[
                                        this.ITR_Type
                                    ]?.FilingStatus?.AmtSeventhProvisio139i;
                            }
                        }
                    }
                }

                // SALARY
                {
                    {
                        const salaryDetails =
                            ItrJSON[this.ITR_Type]?.[this.ITR14_IncomeDeductions];
                        console.log(salaryDetails, 'salaryDetails');

                        if (
                            salaryDetails?.IncomeFromSal === 0 ||
                            salaryDetails?.IncomeFromSal === null
                        ) {
                            ITR_Obj.employers = [];
                        } else {
                            let keys = {
                                id: '',
                                employerName: 'Employer',
                                address: '',
                                city: '',
                                pinCode: '',
                                state: '',
                                employerPAN: '',
                                employerTAN: '',
                                periodFrom: '',
                                periodTo: '',
                                taxableIncome:
                                    salaryDetails?.IncomeFromSal === 0 ||
                                        salaryDetails?.IncomeFromSal === null
                                        ? 0
                                        : salaryDetails?.IncomeFromSal,
                                standardDeduction:
                                    salaryDetails?.DeductionUs16ia === 0 ||
                                        salaryDetails?.DeductionUs16ia === null ||
                                        this.regime === 'NEW'
                                        ? 0
                                        : salaryDetails?.DeductionUs16ia,
                                employerCategory: '',
                                exemptIncome:
                                    salaryDetails?.AllwncExemptUs10?.TotalAllwncExemptUs10 ===
                                        0 ||
                                        salaryDetails?.AllwncExemptUs10?.TotalAllwncExemptUs10 ===
                                        null ||
                                        this.regime === 'NEW'
                                        ? 0
                                        : salaryDetails?.AllwncExemptUs10?.TotalAllwncExemptUs10,
                                taxRelief: null,
                                taxDeducted: null,
                                salary:
                                    salaryDetails?.Salary === 0 ||
                                        salaryDetails?.Salary === null
                                        ? []
                                        : [
                                            {
                                                salaryType: 'SEC17_1',
                                                taxableAmount: salaryDetails?.Salary,
                                                exemptAmount: 0,
                                            },
                                        ],
                                allowance:
                                    salaryDetails?.AllwncExemptUs10?.TotalAllwncExemptUs10 ===
                                        0 ||
                                        salaryDetails?.AllwncExemptUs10?.TotalAllwncExemptUs10 ===
                                        null ||
                                        this.regime === 'NEW'
                                        ? [
                                            {
                                                allowanceType: 'GRATUITY',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'COMMUTED_PENSION',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LEAVE_ENCASHMENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ANY_OTHER',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                        ]
                                        : [
                                            {
                                                allowanceType: 'HOUSE_RENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LTA',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'CHILDREN_EDUCATION',
                                                taxableAmount: 0,
                                                exemptAmount: 0,
                                            },
                                            {
                                                allowanceType: 'GRATUITY',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'COMMUTED_PENSION',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LEAVE_ENCASHMENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ANY_OTHER',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ALL_ALLOWANCES',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                        ],
                                perquisites:
                                    salaryDetails?.PerquisitesValue === 0 ||
                                        salaryDetails?.PerquisitesValue === null
                                        ? []
                                        : [
                                            {
                                                perquisiteType: 'SEC17_2',
                                                taxableAmount: salaryDetails?.PerquisitesValue,
                                                exemptAmount: 0,
                                            },
                                        ],
                                profitsInLieuOfSalaryType:
                                    salaryDetails?.ProfitsInSalary === 0 ||
                                        salaryDetails?.ProfitsInSalary === null
                                        ? []
                                        : [
                                            {
                                                salaryType: 'SEC17_3',
                                                taxableAmount: salaryDetails?.ProfitsInSalary,
                                                exemptAmount: 0,
                                            },
                                        ],
                                deductions:
                                    this.regime === 'NEW'
                                        ? []
                                        : [
                                            {
                                                deductionType: 'PROFESSIONAL_TAX',
                                                taxableAmount: null,
                                                exemptAmount: salaryDetails?.ProfessionalTaxUs16iii,
                                            },

                                            {
                                                deductionType: 'ENTERTAINMENT_ALLOW',
                                                taxableAmount: null,
                                                exemptAmount:
                                                    this.ITR_Type === 'ITR1'
                                                        ? salaryDetails?.EntertainmentAlw16ii
                                                        : salaryDetails?.EntertainmntalwncUs16ii,
                                            },
                                        ],
                                upload: [],
                                calculators: null,
                            };

                            ITR_Obj.employers.push(keys);

                            this.updateSalaryAllowances(ItrJSON, ITR_Obj,
                                salaryDetails?.AllwncExemptUs10?.AllwncExemptUs10Dtls?.map(
                                    (value) => value.SalNatureDesc
                                ),
                                this.ITR_Type
                            );

                            ITR_Obj.systemFlags.hasSalary = true;
                        }
                    }
                }

                // HOUSE PROPERTY
                {
                    {
                        const housePropertyDetails =
                            ItrJSON[this.ITR_Type]?.[this.ITR14_IncomeDeductions];
                        console.log(housePropertyDetails, 'housePropertyDetails');

                        if (
                            housePropertyDetails?.TotalIncomeOfHP === 0 ||
                            housePropertyDetails?.TotalIncomeOfHP === null
                        ) {
                            ITR_Obj.houseProperties = [];
                        } else {
                            let hpKeys = {
                                propertyType:
                                    housePropertyDetails?.TypeOfHP === 'S'
                                        ? 'SOP'
                                        : housePropertyDetails?.TypeOfHP === 'L'
                                            ? 'LOP'
                                            : housePropertyDetails?.TypeOfHP === 'D'
                                                ? 'DLOP'
                                                : housePropertyDetails?.TypeOfHP,
                                grossAnnualRentReceivedTotal:
                                    housePropertyDetails?.GrossRentReceived,
                                grossAnnualRentReceived:
                                    housePropertyDetails?.GrossRentReceived,

                                propertyTax: housePropertyDetails?.TaxPaidlocalAuth,
                                ownerPercentage: null,
                                address: '',
                                city: '',
                                state: '',
                                country: '',
                                pinCode: '',
                                taxableIncome: housePropertyDetails?.TotalIncomeOfHP,
                                exemptIncome: housePropertyDetails?.AnnualValue30Percent,
                                isEligibleFor80EE:
                                    housePropertyDetails.DeductUndChapVIA?.Section80EE > 0
                                        ? true
                                        : false,
                                isEligibleFor80EEA:
                                    housePropertyDetails.DeductUndChapVIA?.Section80EEA > 0
                                        ? true
                                        : false,
                                tenant: [],
                                coOwners: [],
                                loans:
                                    housePropertyDetails?.InterestPayable === 0 ||
                                        housePropertyDetails?.InterestPayable === null
                                        ? []
                                        : [
                                            {
                                                loanType: 'HOUSING',
                                                principalAmount: null,
                                                interestAmount:
                                                    housePropertyDetails?.InterestPayable,
                                            },
                                        ],
                                ArrearsUnrealizedRentRcvd: Math.round(
                                    housePropertyDetails?.ArrearsUnrealizedRentRcvd
                                ),
                                totalArrearsUnrealizedRentReceived:
                                    (Math.round(
                                        housePropertyDetails?.ArrearsUnrealizedRentRcvd
                                    ) *
                                        100) /
                                    30,
                            };

                            ITR_Obj.houseProperties.push(hpKeys);
                            ITR_Obj.systemFlags.hasHouseProperty = true;
                        }
                    }
                }

                // OTHER INCOMES
                {
                    if (
                        ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions]?.OthersInc
                            ?.OthersIncDtlsOthSrc
                    ) {
                        // All other incomes
                        if (ITR_Obj.incomes) {
                            //getting all the other income keys from the JSON and passing it to the updateOtherIncomes function
                            const availableOtherIncomes = ItrJSON[this.ITR_Type][
                                this.ITR14_IncomeDeductions
                            ]?.OthersInc?.OthersIncDtlsOthSrc?.map(
                                (value) => value?.OthSrcNatureDesc
                            );
                            this.updateOtherIncomes(ItrJSON, ITR_Obj, availableOtherIncomes, this.ITR_Type);
                        } else {
                            console.log(
                                'ITROBJECT => OTHERINCOMES',
                                'ITR_Obj.incomes is empty'
                            );
                        }
                    } else {
                        console.log(
                            'ITRJSON => OTHERINCOMES',
                            `ItrJSON[this.ITR_Type]${[
                                this.ITR14_IncomeDeductions,
                            ]}.OthersInc.OthersIncDtlsOthSrc does not exist`
                        );
                    }

                }

                // EXEMPT INCOME
                {
                    if (this.ITR_Type === 'ITR1') {
                        if (
                            ItrJSON[this.ITR_Type]?.ITR1_IncomeDeductions
                                ?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls
                        ) {
                            if (ITR_Obj.exemptIncomes) {
                                //getting all the exempt income keys from the JSON and passing it to the updateExemptIncomes function
                                const availableExemptIncomes = ItrJSON[
                                    this.ITR_Type
                                ]?.ITR1_IncomeDeductions?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls?.map(
                                    (value) => value.NatureDesc
                                );
                                this.updateExemptIncomes(ItrJSON, ITR_Obj,
                                    availableExemptIncomes,
                                    this.ITR_Type
                                );
                            } else {
                                console.log(
                                    'ITROBJECT => Exempt Incomes => ITR1 => Exempt Incomes There are no details under exemptIncomes in the ITR Obj'
                                );
                            }
                        } else {
                            console.log(
                                'ITRJSON => EXEMPT INCOME DETAILS => ITR1, ItrJSON[this.ITR_Type]?.ITR1_IncomeDeductions?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls'
                            );
                        }
                    }

                    if (this.ITR_Type === 'ITR4') {
                        if (
                            ItrJSON[this.ITR_Type]?.TaxExmpIntIncDtls?.OthersInc
                                ?.OthersIncDtls
                        ) {
                            if (ITR_Obj.exemptIncomes) {
                                //getting all the exempt income keys from the JSON and passing it to the updateExemptIncomes function
                                const availableExemptIncomes = ItrJSON[
                                    this.ITR_Type
                                ]?.TaxExmpIntIncDtls?.OthersInc?.OthersIncDtls?.map(
                                    (value) => value.NatureDesc
                                );
                                this.updateExemptIncomes(ItrJSON, ITR_Obj,
                                    availableExemptIncomes,
                                    this.ITR_Type
                                );
                            } else {
                                console.log(
                                    'ITROBJECT => Exempt Incomes => ITR4 => There are no details under exemptIncomes in the ITR Obj'
                                );
                            }
                        } else {
                            console.log(
                                'ITRJSON => Exempt Incomes => ITR4 =>, ItrJSON[this.ITR_Type]?.TaxExmpIntIncDtls?.OthersInc?.OthersIncDtls);'
                            );
                        }
                    }

                }

                // INVESTMENT AND DEDUCTIONS - 80GG, 80EE, 80EEA PENDING
                {
                    if (
                        ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions]
                            .DeductUndChapVIA
                    ) {
                        if (ITR_Obj.investments) {
                            //getting all the deductions keys from the JSON and passing it to the updateInvestments function
                            const availableInvestments = Object.entries(
                                ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions]
                                    .DeductUndChapVIA
                            ).filter(([key, value]) => key !== 'TotalChapVIADeductions');
                            this.updateInvestments(ItrJSON, ITR_Obj, availableInvestments, this.ITR_Type);
                        } else {
                            console.log(
                                'ITR OBJ => Investments => There are no details under investments in the ITR Obj'
                            );
                        }
                    } else {
                        console.log(
                            'ITRJSON => INVESTMENTS =>',
                            `ItrJSON ${[this.ITR_Type]}${[
                                this.ITR14_IncomeDeductions,
                            ]}.DeductUndChapVIA does not exist in JSON`
                        );
                    }

                }

                // TAXES PAID
                {
                    //SALARY TDS
                    {
                        const jsonSalaryTDS =
                            ItrJSON[this.ITR_Type]?.TDSonSalaries?.TDSonSalary;

                        if (!jsonSalaryTDS || jsonSalaryTDS.length === 0) {
                            ITR_Obj.taxPaid.onSalary = [];
                            console.log(
                                'There are no tax paid salary details in the JSON that you have provided'
                            );
                        } else {
                            ITR_Obj.taxPaid.onSalary = jsonSalaryTDS.map(
                                ({
                                    EmployerOrDeductorOrCollectDetl: {
                                        TAN,
                                        EmployerOrDeductorOrCollecterName,
                                    },
                                    IncChrgSal,
                                    TotalTDSSal,
                                }) => {
                                    return {
                                        id: null,
                                        srNo: null,
                                        deductorName: EmployerOrDeductorOrCollecterName,
                                        deductorTAN: TAN,
                                        totalAmountCredited: IncChrgSal,
                                        totalTdsDeposited: TotalTDSSal,
                                        taxDeduction: null,
                                    };
                                }
                            );
                        }

                    }

                    // OTHER THAN SALARY 16A - have to add two more options of CG, NA for headOfIncome option
                    {
                        const otherThanSalary16A =
                            this.ITR_Type === 'ITR1'
                                ? 'TDSonOthThanSal'
                                : 'TDSonOthThanSalDtls';

                        const jsonOtherThanSalaryTDS: Array<object> =
                            ItrJSON[this.ITR_Type]?.TDSonOthThanSals?.[otherThanSalary16A];

                        if (jsonOtherThanSalaryTDS) {
                            const mapJsonToITRObj16A = ({
                                EmployerOrDeductorOrCollectDetl,
                                AmtForTaxDeduct,
                                ClaimOutOfTotTDSOnAmtPaid,
                                TANOfDeductor,
                                TDSClaimed,
                                GrossAmount,
                                HeadOfIncome,
                                TDSDeducted,
                                BroughtFwdTDSAmt,
                                TDSCreditCarriedFwd,
                            }) => {
                                const TAN =
                                    this.ITR_Type === 'ITR1'
                                        ? EmployerOrDeductorOrCollectDetl.TAN
                                        : TANOfDeductor;
                                const deductorName =
                                    this.ITR_Type === 'ITR1'
                                        ? EmployerOrDeductorOrCollectDetl.EmployerOrDeductorOrCollecterName
                                        : null;

                                return {
                                    id: null,
                                    srNo: null,
                                    deductorName,
                                    deductorTAN: TAN,
                                    totalTdsDeposited:
                                        this.ITR_Type === 'ITR1'
                                            ? ClaimOutOfTotTDSOnAmtPaid
                                            : TDSClaimed,
                                    uniqueTDSCerNo: null,
                                    taxDeduction: null,
                                    totalAmountCredited:
                                        this.ITR_Type === 'ITR1' ? AmtForTaxDeduct : GrossAmount,
                                    headOfIncome:
                                        this.ITR_Type === 'ITR4' ? HeadOfIncome : null,
                                };
                            };

                            ITR_Obj.taxPaid.otherThanSalary16A =
                                jsonOtherThanSalaryTDS?.map(mapJsonToITRObj16A);

                        }
                    }

                    // TDS3Details / otherThanSalary26QB
                    {
                        const jsonOtherThanSalary26QBTDS3 =
                            ItrJSON[this.ITR_Type]?.ScheduleTDS3Dtls?.TDS3Details ?? [];

                        const mapJsonToITRObj = ({
                            PANofTenant,
                            NameOfTenant,
                            GrsRcptToTaxDeduct,
                            TDSClaimed,
                            GrossAmount,
                            HeadOfIncome,
                            TDSDeducted,
                            TDSCreditCarriedFwd,
                            BroughtFwdTDSAmt,
                        }) => {
                            return {
                                id: null,
                                srNo: null,
                                deductorName: this.ITR_Type === 'ITR1' ? NameOfTenant : null,
                                deductorPAN: PANofTenant,
                                totalTdsDeposited: TDSClaimed,
                                uniqueTDSCerNo: null,
                                taxDeduction: null,
                                totalAmountCredited:
                                    this.ITR_Type === 'ITR1' ? GrsRcptToTaxDeduct : GrossAmount,
                                headOfIncome: this.ITR_Type === 'ITR4' ? HeadOfIncome : null,
                            };
                        };

                        ITR_Obj.taxPaid.otherThanSalary26QB =
                            jsonOtherThanSalary26QBTDS3?.map(mapJsonToITRObj);

                    }

                    // TCS - TAX COLLECTED AT SOURCE
                    {
                        const jsonTCS = ItrJSON[this.ITR_Type]?.ScheduleTCS?.TCS;

                        if (!jsonTCS || jsonTCS.length === 0) {
                            ITR_Obj.taxPaid.tcs = [];
                            console.log(
                                'There are no TCS tax paid other than salary details in the JSON that you have provided'
                            );
                        } else {
                            ITR_Obj.taxPaid.tcs = jsonTCS?.map(
                                ({
                                    EmployerOrDeductorOrCollectDetl: {
                                        TAN,
                                        EmployerOrDeductorOrCollecterName,
                                    },
                                    AmtTaxCollected,
                                    AmtTCSClaimedThisYear,
                                    Amtfrom26AS,
                                }) => {
                                    return {
                                        id: null,
                                        srNo: null,
                                        collectorName: EmployerOrDeductorOrCollecterName,
                                        collectorTAN: TAN,
                                        totalAmountPaid:
                                            this.ITR_Type === 'ITR1'
                                                ? AmtTaxCollected
                                                : Amtfrom26AS,
                                        totalTaxCollected: 0,
                                        totalTcsDeposited: AmtTCSClaimedThisYear,
                                        taxDeduction: null,
                                    };
                                }
                            );
                        }

                    }

                    // Advance and self assessment tax
                    {
                        const taxPayment =
                            this.ITR_Type === 'ITR1' ? 'TaxPayments' : 'ScheduleIT';
                        const jsonAdvSAT =
                            ItrJSON[this.ITR_Type]?.[taxPayment]?.TaxPayment;

                        if (!jsonAdvSAT || jsonAdvSAT.length === 0) {
                            ITR_Obj.taxPaid.otherThanTDSTCS = [];
                            console.log(
                                'There are no advance taxes or self assessment taxes paid details in the JSON that you have provided'
                            );
                        } else {
                            ITR_Obj.taxPaid.otherThanTDSTCS = jsonAdvSAT?.map(
                                ({ BSRCode, DateDep, SrlNoOfChaln, Amt }) => {
                                    return {
                                        id: null,
                                        srNo: null,
                                        totalTax: Amt,
                                        bsrCode: BSRCode,
                                        dateOfDeposit: this.parseAndFormatDate(DateDep),
                                        challanNumber: SrlNoOfChaln,
                                        majorHead: null,
                                        minorHead: null,
                                        tax: null,
                                        surcharge: null,
                                        educationCess: null,
                                        other: null,
                                    };
                                }
                            );
                        }
                    }

                }

                // BUSINESS AND PROFESSION - PRESUMPTIVE INCOME
                {
                    if (this.ITR_Type === 'ITR4') {
                        {
                            const NatOfBus44AD =
                                ItrJSON[this.ITR_Type].ScheduleBP.NatOfBus44AD;
                            const NatOfBus44ADLength = NatOfBus44AD?.length;

                            const PersumptiveInc44AD =
                                ItrJSON[this.ITR_Type].ScheduleBP?.PersumptiveInc44AD;

                            NatOfBus44AD?.forEach((obj) => {
                                ITR_Obj.systemFlags.hasBusinessProfessionIncome = true;
                                let newObject = {
                                    receipts: null,
                                    presumptiveIncome: null,
                                    minimumPresumptiveIncome: null,
                                    periodOfHolding: null,
                                    id: null,
                                    businessType: 'BUSINESS',
                                    natureOfBusiness: obj.CodeAD,
                                    label: null,
                                    tradeName: obj.NameOfBusiness,
                                    salaryInterestAmount: null,
                                    taxableIncome: null,
                                    exemptIncome: null,
                                    incomes: [
                                        {
                                            id: null,
                                            incomeType: 'CASH',
                                            receipts:
                                                PersumptiveInc44AD.GrsTrnOverAnyOthMode /
                                                NatOfBus44ADLength,
                                            presumptiveIncome:
                                                PersumptiveInc44AD.PersumptiveInc44AD8Per /
                                                NatOfBus44ADLength,
                                            periodOfHolding: 0,
                                            minimumPresumptiveIncome: 0,
                                            registrationNo: null,
                                            ownership: null,
                                            tonnageCapacity: null,
                                        },
                                        {
                                            id: null,
                                            incomeType: 'BANK',
                                            receipts:
                                                PersumptiveInc44AD.GrsTrnOverBank /
                                                NatOfBus44ADLength,
                                            presumptiveIncome:
                                                PersumptiveInc44AD.PersumptiveInc44AD6Per /
                                                NatOfBus44ADLength,
                                            periodOfHolding: 0,
                                            minimumPresumptiveIncome: 0,
                                            registrationNo: null,
                                            ownership: null,
                                            tonnageCapacity: null,
                                        },
                                    ],
                                };

                                // Updating business Description
                                let businessDescriptionObject = {
                                    id: null,
                                    natureOfBusiness: obj.CodeAD,
                                    tradeName: obj.NameOfBusiness,
                                    businessDescription: obj.Description,
                                };
                                ITR_Obj.business.presumptiveIncomes.push(newObject);
                                ITR_Obj.business.businessDescription.push(
                                    businessDescriptionObject
                                );
                            });

                            ITR_Obj.systemFlags.hasBusinessProfessionIncome = true;

                        }

                        // Profession44ADA
                        {
                            const NatOfBus44ADA =
                                ItrJSON[this.ITR_Type]?.ScheduleBP?.NatOfBus44ADA;
                            const NatOfBus44ADALength = NatOfBus44ADA?.length;

                            const PersumptiveInc44ADA =
                                ItrJSON[this.ITR_Type].ScheduleBP.PersumptiveInc44ADA;

                            NatOfBus44ADA?.forEach((obj) => {
                                ITR_Obj.systemFlags.hasBusinessProfessionIncome = true;
                                let newObject = {
                                    receipts: null,
                                    presumptiveIncome: null,
                                    minimumPresumptiveIncome: null,
                                    periodOfHolding: null,
                                    id: null,
                                    businessType: 'PROFESSIONAL',
                                    natureOfBusiness: obj.CodeADA,
                                    label: null,
                                    tradeName: obj.NameOfBusiness,
                                    salaryInterestAmount: null,
                                    taxableIncome: null,
                                    exemptIncome: null,
                                    incomes: [
                                        {
                                            id: null,
                                            incomeType: 'PROFESSIONAL',
                                            receipts:
                                                PersumptiveInc44ADA?.GrsReceipt / NatOfBus44ADALength,
                                            presumptiveIncome:
                                                PersumptiveInc44ADA?.TotPersumptiveInc44ADA /
                                                NatOfBus44ADALength,
                                            periodOfHolding: 0,
                                            minimumPresumptiveIncome: 0,
                                            registrationNo: null,
                                            ownership: null,
                                            tonnageCapacity: null,
                                        },
                                    ],
                                };

                                // updating professinalBusiness Decription
                                let professionDescriptionObject = {
                                    id: null,
                                    natureOfBusiness: obj.CodeADA,
                                    tradeName: obj.NameOfBusiness,
                                    businessDescription: obj.Description,
                                };

                                ITR_Obj.business.presumptiveIncomes.push(newObject);
                                ITR_Obj.business.businessDescription.push(
                                    professionDescriptionObject
                                );
                            });

                        }

                        // Financial Particulars - Balance Sheet
                        {
                            let balanceSheetKeys: any;
                            if (this.ITR_Type === 'ITR4') {
                                balanceSheetKeys = {
                                    id: null,
                                    grossTurnOverAmount: null,
                                    membersOwnCapital:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.PartnerMemberOwnCapital,
                                    securedLoans:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.SecuredLoans,
                                    unSecuredLoans:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.UnSecuredLoans,
                                    advances:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.Advances,
                                    sundryCreditorsAmount:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.SundryCreditors,
                                    otherLiabilities:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.OthrCurrLiab,
                                    totalCapitalLiabilities:
                                        ItrJSON[this.ITR_Type].ScheduleBP.FinanclPartclrOfBusiness
                                            .TotCapLiabilities,
                                    fixedAssets:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.FixedAssets,
                                    inventories:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.Inventories,
                                    sundryDebtorsAmount:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.SundryDebtors,
                                    balanceWithBank:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.BalWithBanks,
                                    cashInHand:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.CashInHand,
                                    loanAndAdvances:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.LoansAndAdvances,
                                    otherAssets:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.OtherAssets,
                                    totalAssets:
                                        ItrJSON[this.ITR_Type].ScheduleBP
                                            ?.FinanclPartclrOfBusiness?.TotalAssets,
                                    investment: null,
                                    GSTRNumber: null,
                                    difference: null,
                                };

                                // Check if balanceSheetKeys is not empty and all values are zero
                                const isBalanceSheetKeysEmpty = Object.values(
                                    balanceSheetKeys
                                ).every((value) => value === null || value === 0);

                                if (!isBalanceSheetKeysEmpty) {
                                    ITR_Obj.business.financialParticulars =
                                        balanceSheetKeys;
                                }
                            }

                        }
                    }
                }

                //setting relief
                {
                    //section89
                    if (ItrJSON[this.ITR_Type][this.taxComputation]?.Section89) {
                        ITR_Obj.section89 =
                            ItrJSON[this.ITR_Type][this.taxComputation]?.Section89;
                    }

                }

                // DECLARATION
                {
                    let capacity = '';
                    if (ItrJSON[this.ITR_Type].Verification.Capacity === 'S') {
                        capacity = 'Self';
                    } else {
                        console.log(
                            'Declaration => Verification => Capacity other than self is not allowed'
                        );
                    }
                    {
                        ITR_Obj.declaration.name =
                            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerName;
                        ITR_Obj.declaration.panNumber =
                            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerPAN;
                        ITR_Obj.declaration.place = '';
                        ITR_Obj.declaration.capacity = capacity;
                        ITR_Obj.declaration.childOf =
                            ItrJSON[this.ITR_Type].Verification.Declaration.FatherName;
                        ITR_Obj.declaration.place =
                            ItrJSON[this.ITR_Type].Verification.Place;
                    }


                }

                console.log(ITR_Obj);
            }
        }

        if (this.ITR_Type === 'ITR2' || this.ITR_Type === 'ITR3') {
            if (
                ITR_Obj?.panNumber !==
                ItrJSON[this.ITR_Type].PartA_GEN1.PersonalInfo?.PAN
            ) {
                ITR_Obj = this.utilsService.createEmptyJson(
                    userProfile,
                    ITR_Obj.assessmentYear,
                    ITR_Obj.financialYear,
                    ITR_Obj.itrId,
                    ITR_Obj.filingTeamMemberId,
                    ITR_Obj.id
                );
                console.log(ITR_Obj, 'ITRJSON');
                ITR_Obj.itrSummaryJson = null;
                ITR_Obj.itrSummaryJson = null;


                console.log(
                    'PAN from the uploaded JSON and the PAN from Users Profile / Customer Profile are different'
                );
            }

            if (
                ITR_Obj.panNumber ===
                ItrJSON[this.ITR_Type].PartA_GEN1.PersonalInfo?.PAN
            ) {
                // PERSONAL INFORMATION
                {
                    // CUSTOMER PROFILE
                    {
                        if (ITR_Obj.isRevised === 'N') {
                            ITR_Obj.isRevised =
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.ReturnFileSec === 17
                                    ? 'Y'
                                    : 'N';
                        } else if (ITR_Obj.isRevised === 'Y') {
                            if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.ReturnFileSec !== 17 &&
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.ReturnFileSec !== 11
                            ) {
                                ITR_Obj.isRevised = 'N';
                            } else if (
                                ITR_Obj.isRevised === 'Y' &&
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.ReturnFileSec === 11
                            ) {
                                console.log(
                                    'Looks like you are trying to update an orignal return but a revise return for the user has already been filed. You cannot file an original return once a revise return is already filed.'
                                );
                                return;
                            }
                        }

                        ITR_Obj.email =
                            ItrJSON[
                                this.ITR_Type
                            ].PartA_GEN1.PersonalInfo?.Address?.EmailAddress;

                        ITR_Obj.family[0].fName =
                            ItrJSON[
                                this.ITR_Type
                            ].PartA_GEN1.PersonalInfo?.AssesseeName?.FirstName;

                        ITR_Obj.family[0].mName =
                            ItrJSON[
                                this.ITR_Type
                            ].PartA_GEN1.PersonalInfo?.AssesseeName?.MiddleName;

                        ITR_Obj.family[0].lName =
                            ItrJSON[
                                this.ITR_Type
                            ].PartA_GEN1.PersonalInfo?.AssesseeName?.SurNameOrOrgName;

                        ITR_Obj.family[0].fatherName =
                            ItrJSON[this.ITR_Type].Verification.Declaration?.FatherName;

                        ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.ReceiptNo
                            ? (ITR_Obj.orgITRAckNum =
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.ReceiptNo)
                            : (ITR_Obj.orgITRAckNum = null);

                        ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OrigRetFiledDate
                            ? (ITR_Obj.orgITRDate = this.parseAndFormatDate(
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OrigRetFiledDate
                            ))
                            : (ITR_Obj.orgITRDate = null);

                        // SETTING REGIME TYPE FOR ITR2
                        if (this.ITR_Type === 'ITR2') {
                            if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.NewTaxRegime === 'N'
                            ) {
                                this.regime = 'OLD';
                                ITR_Obj.regime = this.regime;
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    .NewTaxRegime === 'Y'
                            ) {
                                this.regime = 'NEW';
                                ITR_Obj.regime = this.regime;
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else {
                                console.log(
                                    'Type of regime is not present in the uploaded JSON'
                                );
                            }
                        }

                        if (this.ITR_Type === 'ITR3') {
                            // "description": "1 - Opting in now; 2 - Not opting; 3 - Continue to opt; 4 - Opt out; 5 - Not eligible to opt in",
                            // optionForCurrentAY
                            if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime === 1
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime === 2
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime === 3
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'NEW';
                            } else if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime === 4
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime === 5
                            ) {
                                ITR_Obj.optionForCurrentAY.currentYearRegime = 'OLD';
                            } else if (
                                !ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.OptingNewTaxRegime
                            ) {
                                console.log(
                                    'Tax Regime detail is not present for this JSON. OptingNewTaxRegime is missing in the JSON '
                                );
                            }

                            // everOptedNewRegime
                            {
                                //Setting 1st question as yes / no
                                if (
                                    ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                        ?.NewTaxRegime === 'Y'
                                ) {
                                    ITR_Obj.everOptedNewRegime.everOptedNewRegime = true;
                                } else {
                                    ITR_Obj.everOptedNewRegime.everOptedNewRegime = false;
                                }

                                // setting first question details
                                {
                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls?.AssessmentYear)
                                        ITR_Obj.everOptedNewRegime.assessmentYear = ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls?.AssessmentYear;

                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate)
                                        ITR_Obj.everOptedNewRegime.date = this.parseAndFormatDate(ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate);

                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo)
                                        ITR_Obj.everOptedNewRegime.acknowledgementNumber = ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.NewTaxRegimeDtls.Form10IEDtls?.Form10IEAckNo;
                                }

                            }

                            //  everOptedOutOfNewRegime
                            {
                                //Setting 1st question as yes / no
                                if (
                                    ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                        ?.OptedOutNewTaxRegime === 'Y'
                                ) {
                                    ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime =
                                        true;
                                } else {
                                    ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime =
                                        false;
                                }

                                // setting second question details
                                {
                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls?.AssessmentYear)
                                        ITR_Obj.everOptedOutOfNewRegime.assessmentYear = ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls?.AssessmentYear;

                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEDate)
                                        ITR_Obj.everOptedOutOfNewRegime.date =
                                            this.parseAndFormatDate(ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls.Form10IEDtls?.Form10IEDate);

                                    if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo)
                                        ITR_Obj.everOptedOutOfNewRegime.acknowledgementNumber =
                                            ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.OptedOutNewTaxRegimeDtls?.Form10IEDtls?.Form10IEAckNo;
                                }

                            }

                            ITR_Obj.regime =
                                ITR_Obj.optionForCurrentAY?.currentYearRegime;

                            this.regime =
                                ITR_Obj.optionForCurrentAY?.currentYearRegime;

                            if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.Form10IEDate)
                                ITR_Obj.optionForCurrentAY.date = this.parseAndFormatDate(ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.Form10IEDate);

                            if (ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.Form10IEAckNo)
                                ITR_Obj.optionForCurrentAY.acknowledgementNumber = ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus?.Form10IEAckNo;

                        }

                        // SETTING RESIDENTIAL STATUS
                        const residentialStatusJson =
                            ItrJSON[this.ITR_Type].PartA_GEN1.FilingStatus
                                ?.ResidentialStatus;

                        if (residentialStatusJson === 'RES') {
                            ITR_Obj.residentialStatus = 'RESIDENT';
                        } else if (residentialStatusJson === 'NRI') {
                            ITR_Obj.residentialStatus = 'NON_RESIDENT';
                        } else if (residentialStatusJson === 'NOR') {
                            ITR_Obj.residentialStatus = 'NON_ORDINARY';
                        } else if (!residentialStatusJson) {
                            this.utilsService.showErrorMsg(
                                'Residential Status is not present in the JSON. Please verify the json before proceeding ahead'
                            );
                        }

                        // Updating employer details based on the key that we get from json in our itr obj employer category
                        {
                            let jsonEmployerCategory: any;
                            if (ItrJSON[this.ITR_Type].ScheduleS?.Salaries) {
                                jsonEmployerCategory =
                                    ItrJSON[this.ITR_Type].ScheduleS?.Salaries[0]
                                        ?.NatureOfEmployment;
                            } else {
                                jsonEmployerCategory = 'OTH';
                            }

                            if (jsonEmployerCategory === 'CGOV') {
                                ITR_Obj.employerCategory = 'CENTRAL_GOVT';
                            } else if (jsonEmployerCategory === 'SGOV') {
                                ITR_Obj.employerCategory = 'GOVERNMENT';
                            } else if (jsonEmployerCategory === 'PSU') {
                                ITR_Obj.employerCategory = 'PRIVATE';
                            } else if (jsonEmployerCategory === 'PE') {
                                ITR_Obj.employerCategory = 'PE';
                            } else if (jsonEmployerCategory === 'PESG') {
                                ITR_Obj.employerCategory = 'PESG';
                            } else if (jsonEmployerCategory === 'PEPS') {
                                ITR_Obj.employerCategory = 'PEPS';
                            } else if (jsonEmployerCategory === 'PEO') {
                                ITR_Obj.employerCategory = 'PENSIONERS';
                            } else if (jsonEmployerCategory === 'OTH') {
                                ITR_Obj.employerCategory = 'OTHER';
                            } else if (jsonEmployerCategory === 'NA') {
                                ITR_Obj.employerCategory = 'NA';
                            } else {
                                ITR_Obj.employerCategory = 'OTHER';
                            }
                        }

                        ITR_Obj.aadharNumber =
                            ItrJSON[this.ITR_Type].PartA_GEN1.PersonalInfo?.AadhaarCardNo;

                        ITR_Obj.aadhaarEnrolmentId = ItrJSON[this.ITR_Type]?.PartA_GEN1?.PersonalInfo?.AadhaarEnrolmentId;
                        // Date is converted in the required format by BO which is utc we get normat date 29/01/2000 from JSON
                        ITR_Obj.family[0].dateOfBirth = new Date(this.utcDate);
                    }

                    // PERSONAL DETAILS
                    {
                        // ADDRESS DETAILS -
                        {
                            ITR_Obj.address.pinCode =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.PinCode;

                            ITR_Obj.address.country =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.CountryCode;

                            ITR_Obj.address.state =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.StateCode;

                            ITR_Obj.address.city =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.CityOrTownOrDistrict;

                            ITR_Obj.address.flatNo =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.ResidenceNo;

                            ITR_Obj.address.premisesName =
                                ItrJSON[
                                    this.ITR_Type
                                ].PartA_GEN1.PersonalInfo?.Address?.ResidenceName;

                            ITR_Obj.address.area =
                                ItrJSON[this.ITR_Type].PartA_GEN1.PersonalInfo?.Address
                                    ?.RoadOrStreet +
                                ItrJSON[this.ITR_Type].PartA_GEN1.PersonalInfo?.Address
                                    ?.LocalityOrArea;
                        }

                        // BANK DETAILS
                        {
                            const UtilityBankDetails =
                                ItrJSON[this.ITR_Type].PartB_TTI?.Refund?.BankAccountDtls
                                    ?.AddtnlBankDetails;

                            if (!UtilityBankDetails || UtilityBankDetails.length === 0) {
                                ITR_Obj.bankDetails = [];
                                console.log(
                                    'There are no bank details in the JSON that you have provided'
                                );
                            } else {
                                ITR_Obj.bankDetails = UtilityBankDetails.map(
                                    ({ IFSCCode, BankName, BankAccountNo, UseForRefund }) => {
                                        return {
                                            id: null,
                                            bankType: null,
                                            ifsCode: IFSCCode,
                                            name: BankName,
                                            accountNumber: BankAccountNo,
                                            hasRefund: UseForRefund === 'true',
                                            swiftcode: null,
                                            countryName: '91',
                                        };
                                    }
                                );
                            }
                        }

                        // SEVENTH PROVISIO DETAILS
                        {
                            ITR_Obj.seventhProviso139 = {
                                seventhProvisio139: 'N',
                                strDepAmtAggAmtExcd1CrPrYrFlg: null,
                                depAmtAggAmtExcd1CrPrYrFlg: null,
                                strIncrExpAggAmt2LkTrvFrgnCntryFlg: null,
                                incrExpAggAmt2LkTrvFrgnCntryFlg: null,
                                strIncrExpAggAmt1LkElctrctyPrYrFlg: null,
                                incrExpAggAmt1LkElctrctyPrYrFlg: null,
                                clauseiv7provisio139i: null,
                                clauseiv7provisio139iDtls: null,
                            };

                            ITR_Obj.seventhProviso139.seventhProvisio139 =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.SeventhProvisio139;

                            ITR_Obj.seventhProviso139.strIncrExpAggAmt1LkElctrctyPrYrFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.IncrExpAggAmt1LkElctrctyPrYrFlg;
                            ITR_Obj.seventhProviso139.incrExpAggAmt1LkElctrctyPrYrFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.AmtSeventhProvisio139iii;

                            ITR_Obj.seventhProviso139.strIncrExpAggAmt2LkTrvFrgnCntryFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.IncrExpAggAmt2LkTrvFrgnCntryFlg;
                            ITR_Obj.seventhProviso139.incrExpAggAmt2LkTrvFrgnCntryFlg =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.AmtSeventhProvisio139ii;

                            ITR_Obj.seventhProviso139.clauseiv7provisio139i =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.clauseiv7provisio139i;
                            if (ItrJSON[
                                this.ITR_Type
                            ]?.FilingStatus?.clauseiv7provisio139iDtls) {
                                ITR_Obj.seventhProviso139.clauseiv7provisio139iDtls =
                                    ItrJSON[
                                        this.ITR_Type
                                    ]?.FilingStatus?.clauseiv7provisio139iDtls?.map(
                                        (element) => ({
                                            nature: parseFloat(element?.clauseiv7provisio139iNature),
                                            amount: parseFloat(element?.clauseiv7provisio139iAmount),
                                        })
                                    );
                            }

                            ITR_Obj.seventhProviso139.strDepAmtAggAmtExcd1CrPrYrFlg =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.FilingStatus?.DepAmtAggAmtExcd1CrPrYrFlg;
                            ITR_Obj.seventhProviso139.depAmtAggAmtExcd1CrPrYrFlg =
                                ItrJSON[this.ITR_Type]?.FilingStatus?.AmtSeventhProvisio139i;
                        }
                    }

                    // OTHER INFORMATION
                    {
                        // setting director details
                        {
                            if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.CompDirectorPrvYrFlg === 'Y'
                            ) {
                                ITR_Obj.systemFlags.directorInCompany = true;
                                const directorDetails =
                                    ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                        ?.CompDirectorPrvYr?.CompDirectorPrvYrDtls;
                                if (!directorDetails || directorDetails.length === 0) {
                                    ITR_Obj.directorInCompany = [];
                                } else {
                                    ITR_Obj.directorInCompany = directorDetails.map(
                                        ({
                                            NameOfCompany,
                                            CompanyType,
                                            PAN,
                                            SharesTypes,
                                            DIN,
                                        }) => {
                                            return {
                                                id: null,
                                                companyName: NameOfCompany,
                                                companyPAN: PAN,
                                                typeOfCompany: CompanyType,
                                                sharesType:
                                                    SharesTypes === 'L' ? 'LISTED' : 'UN_LISTED',
                                                din: DIN,
                                            };
                                        }
                                    );
                                }
                            } else {
                                ITR_Obj.systemFlags.directorInCompany = false;
                            }
                        }

                        // setting unlisted shares details
                        {
                            if (
                                ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                    ?.HeldUnlistedEqShrPrYrFlg === 'Y'
                            ) {
                                ITR_Obj.systemFlags.haveUnlistedShares = true;
                                const HeldUnlistedEqShrPrYrFlg =
                                    ItrJSON[this.ITR_Type].PartA_GEN1?.FilingStatus
                                        ?.HeldUnlistedEqShrPrYr?.HeldUnlistedEqShrPrYrDtls;
                                if (
                                    !HeldUnlistedEqShrPrYrFlg ||
                                    HeldUnlistedEqShrPrYrFlg.length === 0
                                ) {
                                    ITR_Obj.unlistedSharesDetails = [];
                                } else {
                                    ITR_Obj.unlistedSharesDetails =
                                        HeldUnlistedEqShrPrYrFlg.map(
                                            ({
                                                NameOfCompany,
                                                CompanyType,
                                                PAN,
                                                OpngBalNumberOfShares,
                                                OpngBalCostOfAcquisition,
                                                ShrAcqDurYrNumberOfShares,
                                                DateOfSubscrPurchase,
                                                FaceValuePerShare,
                                                IssuePricePerShare,
                                                PurchasePricePerShare,
                                                ShrTrnfNumberOfShares,
                                                ShrTrnfSaleConsideration,
                                                ClsngBalNumberOfShares,
                                                ClsngBalCostOfAcquisition,
                                            }) => {
                                                return {
                                                    companyName: NameOfCompany,
                                                    typeOfCompany: CompanyType,
                                                    companyPAN: PAN,
                                                    openingShares: OpngBalNumberOfShares,
                                                    openingCOA: OpngBalCostOfAcquisition,
                                                    acquiredShares: ShrAcqDurYrNumberOfShares,
                                                    purchaseDate: DateOfSubscrPurchase,
                                                    faceValuePerShare: FaceValuePerShare,
                                                    issuePricePerShare: IssuePricePerShare,
                                                    purchasePricePerShare: PurchasePricePerShare,
                                                    transferredShares: ShrTrnfNumberOfShares,
                                                    saleConsideration: ShrTrnfSaleConsideration,
                                                    closingShares: ClsngBalNumberOfShares,
                                                    closingCOA: ClsngBalCostOfAcquisition,
                                                };
                                            }
                                        );
                                }
                            } else {
                                ITR_Obj.systemFlags.haveUnlistedShares = false;
                            }
                        }

                        // partnership firm details
                        {
                            if (this.ITR_Type === 'ITR3') {
                                ITR_Obj.partnerInFirmFlag =
                                    ItrJSON[
                                        this.ITR_Type
                                    ]?.PartA_GEN1?.FilingStatus?.PartnerInFirmFlg;
                                ITR_Obj.partnerInFirms = ItrJSON[
                                    this.ITR_Type
                                ]?.PartA_GEN1?.FilingStatus?.PartnerInFirm?.PartnerInFirmDtls?.map(
                                    (element) => ({
                                        name: element?.NameOfFirm,
                                        panNumber: element?.PAN,
                                    })
                                );

                                // setting partnership firm object
                                {
                                    if (!ITR_Obj.partnerFirms) {
                                        ITR_Obj.partnerFirms = [];
                                    }

                                    ITR_Obj.partnerFirms = ItrJSON[
                                        this.ITR_Type
                                    ]?.ScheduleIF?.PartnerFirmDetails?.map((element) => ({
                                        name: element?.FirmName,
                                        panNumber: element?.FirmPAN,
                                        isLiableToAudit: element?.IsLiableToAudit,
                                        sec92EFirmFlag: element?.Sec92EFirmFlag,
                                        profitSharePercent: element?.ProfitSharePercent,
                                        profitShareAmount: element?.ProfitShareAmt,
                                        capitalBalanceOn31stMarch: element?.FirmCapBalOn31Mar,
                                    }));
                                }
                            }
                        }

                        // setting schedule5A portuguese code
                        {
                            if (ItrJSON[this.ITR_Type]?.Schedule5A2014) {
                                if (!ITR_Obj.schedule5a) {
                                    ITR_Obj.schedule5a = {
                                        nameOfSpouse: null,
                                        panOfSpouse: null,
                                        aadhaarOfSpouse: null,
                                        booksSpouse44ABFlg: null,
                                        booksSpouse92EFlg: null,
                                        headIncomes: [],
                                    };
                                }

                                ITR_Obj.schedule5a.nameOfSpouse =
                                    ItrJSON[this.ITR_Type]?.Schedule5A2014?.NameOfSpouse;
                                ITR_Obj.schedule5a.panOfSpouse =
                                    ItrJSON[this.ITR_Type]?.Schedule5A2014?.PANOfSpouse;

                                ITR_Obj.portugeseCC5AFlag = 'Y';

                                if (this.ITR_Type === 'ITR3') {
                                    ITR_Obj.schedule5a.aadhaarOfSpouse =
                                        ItrJSON[this.ITR_Type]?.Schedule5A2014?.AadhaarOfSpouse;

                                    ITR_Obj.schedule5a.booksSpouse44ABFlg =
                                        ItrJSON[
                                            this.ITR_Type
                                        ]?.Schedule5A2014?.BooksSpouse44ABFlg;

                                    ITR_Obj.schedule5a.booksSpouse92EFlg =
                                        ItrJSON[this.ITR_Type]?.Schedule5A2014?.BooksSpouse92EFlg;
                                } else {
                                    ITR_Obj.schedule5a.booksSpouse44ABFlg = 'N';
                                    ITR_Obj.schedule5a.booksSpouse92EFlg = 'N';
                                }

                                const originalValue = [
                                    ItrJSON[this.ITR_Type]?.Schedule5A2014?.HPHeadIncome,
                                    ItrJSON[this.ITR_Type]?.Schedule5A2014?.CapGainHeadIncome,
                                    ItrJSON[this.ITR_Type]?.Schedule5A2014
                                        ?.OtherSourcesHeadIncome,
                                    this.ITR_Type === 'ITR3'
                                        ? ItrJSON[this.ITR_Type]?.Schedule5A2014?.BusHeadIncome
                                        : null,
                                ];

                                const transformObject = (originalObject, typeOfIncome) => ({
                                    apportionedAmountOfSpouse:
                                        originalObject?.AmtApprndOfSpouse || 0,
                                    apportionedTDSOfSpouse:
                                        originalObject?.TDSApprndOfSpouse || 0,
                                    headOfIncome: typeOfIncome || '',
                                    incomeReceived: originalObject?.IncRecvdUndHead || 0,
                                    tdsDeductedAmount: originalObject?.AmtTDSDeducted || 0,
                                });

                                // Transform the original object
                                originalValue?.forEach((element, index) => {
                                    const headOfIncome = [
                                        'HP',
                                        'CAPITAL_GAIN',
                                        'OTHER_SOURCE',
                                        'BUSINESS',
                                    ]?.[index];

                                    if (element) {
                                        const transformedObject = transformObject(
                                            element,
                                            headOfIncome
                                        );

                                        if (transformedObject) {
                                            ITR_Obj.schedule5a?.headIncomes?.push(
                                                transformedObject
                                            );
                                        }
                                    }
                                });
                            } else {
                                ITR_Obj.portugeseCC5AFlag = 'N';
                            }
                        }
                    }
                }

                //SALARY - FOR ITR 2 SALARY ALLOWANCES ARE BEING SET AGAINST 1ST EMPLOYER ONLY
                {
                    const salaries = ItrJSON[this.ITR_Type].ScheduleS?.Salaries;
                    const salaryTypes = [
                        { code: 'SEC17_1', desc: 'Salary' },
                        { code: 'BASIC_SALARY', desc: 'Basic Salary', natureDesc: '1' },
                        { code: 'DA', desc: 'Dearness Allowance', natureDesc: '2' },
                        {
                            code: 'CONVEYANCE',
                            desc: 'Conveyance Allowance',
                            natureDesc: '3',
                        },
                        {
                            code: 'HOUSE_RENT',
                            desc: 'House Rent Allowance',
                            natureDesc: '4',
                        },
                        { code: 'LTA', desc: 'Leave Travel Allowance', natureDesc: '5' },
                        {
                            code: 'CHILDREN_EDUCATION',
                            desc: 'Children Education Allowance',
                            natureDesc: '6',
                        },
                        {
                            code: 'OTHER_ALLOWANCE',
                            desc: 'Other Allowance',
                            natureDesc: '7',
                        },
                        {
                            code: 'CONTRI_80CCD',
                            desc: 'Contribution towards pension scheme (80CCD)',
                            natureDesc: '8',
                        },
                        {
                            code: 'RULE11',
                            desc: 'Amount deemed to be income under rule 11 of Fourth Schedule',
                            natureDesc: '9',
                        },
                        {
                            code: 'RULE6',
                            desc: 'Amount deemed to be income under rule 6 of Fourth Schedule',
                            natureDesc: '10',
                        },
                        {
                            code: 'ANN_PENSION',
                            desc: 'Annuity or Pension',
                            natureDesc: '11',
                        },
                        {
                            code: 'COMM_PENSION',
                            desc: 'Commuted Pension',
                            natureDesc: '12',
                        },
                        { code: 'GRATUITY', desc: 'Gratuity', natureDesc: '13' },
                        {
                            code: 'FEES_COMMISSION',
                            desc: 'Fees/Commission',
                            natureDesc: '14',
                        },
                        {
                            code: 'ADV_SALARY',
                            desc: 'Advance of Salary',
                            natureDesc: '15',
                        },
                        {
                            code: 'LEAVE_ENCASH',
                            desc: 'Leave Encashment',
                            natureDesc: '16',
                        },
                        {
                            code: 'CONTRI_80CCH',
                            desc: 'Contribution by central government towards Agnipath scheme (80CCH)',
                            natureDesc: '17',
                        },
                        { code: 'OTH', desc: 'Others', natureDesc: 'OTH' },
                    ];
                    const perquisiteTypes = [
                        {
                            code: 'SEC17_2',
                            desc: 'Income chargeable under the head Perquisities',
                            natureDesc: null,
                        },
                        { code: 'ACCOMODATION', desc: 'Accommodation', natureDesc: '1' },
                        {
                            code: 'MOTOR_CAR',
                            desc: 'Cars / Other Automotive',
                            natureDesc: '2',
                        },
                        {
                            code: 'SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT',
                            desc: 'Sweeper, gardener, watchman, or personal attendant',
                            natureDesc: '3',
                        },
                        {
                            code: 'GAST_ELECTRICITY_WATER',
                            desc: 'Gas, electricity, water',
                            natureDesc: '4',
                        },
                        {
                            code: 'INTEREST_FREE_LOANS',
                            desc: 'Interest-free or concessional loans',
                            natureDesc: '5',
                        },
                        {
                            code: 'HOLIDAY_EXPENSES',
                            desc: 'Holiday expenses',
                            natureDesc: '6',
                        },
                        {
                            code: 'FREE_OR_CONCESSIONAL_TRAVEL',
                            desc: 'Free or concessional travel',
                            natureDesc: '7',
                        },
                        { code: 'FREE_MEALS', desc: 'Free meals', natureDesc: '8' },
                        { code: 'FREE_EDU', desc: 'Free education', natureDesc: '9' },
                        {
                            code: 'GIFT_VOUCHERS',
                            desc: 'Gifts, vouchers, etc.',
                            natureDesc: '10',
                        },
                        {
                            code: 'CREDIT_CARD_EXPENSES',
                            desc: 'Credit card expenses',
                            natureDesc: '11',
                        },
                        { code: 'CLUB_EXP', desc: 'Club expenses', natureDesc: '12' },
                        {
                            code: 'USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE',
                            desc: 'Use of movable assets by employees',
                            natureDesc: '13',
                        },
                        {
                            code: 'TRANSFER_OF_ASSET_TO_EMPLOYEE',
                            desc: 'Transfer of assets to employee',
                            natureDesc: '14',
                        },
                        {
                            code: 'VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE',
                            desc: 'Value of other benefits/amenities/service/privilege',
                            natureDesc: '15',
                        },
                        {
                            code: 'SECTION_80_IAC_TAX_TO_BE_DEFERED',
                            desc: 'Stock options allotted or transferred by employer being an eligible start-up referred to in section 80-IAC-Tax to be deferred',
                            natureDesc: '16',
                        },
                        {
                            code: 'STOCK_OPTIONS_OTHER_THAN_ESOP',
                            desc: 'Stock options (non-qualified options) other than ESOP',
                            natureDesc: '17',
                        },
                        {
                            code: 'SCHEME_TAXABLE_US_17_2_VII',
                            desc: 'Contribution by employer to fund and scheme taxable under section 17(2)(vii)',
                            natureDesc: '18',
                        },
                        {
                            code: 'SCHEME_TAXABLE_US_17_2_VIIA',
                            desc: 'Annual accretion by way of interest, dividend etc. to the balance at the credit of fund and scheme referred to in section 17(2)(vii) and taxable under section 17(2)(viia)',
                            natureDesc: '19',
                        },
                        {
                            code: 'SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED',
                            desc: 'Stock options allotted or transferred by employer being an eligible start-up referred to in section 80-IAC-Tax not to be deferred',
                            natureDesc: '21',
                        },
                        {
                            code: 'OTH_BENEFITS_AMENITIES',
                            desc: 'Other benefits or amenities',
                            natureDesc: 'OTH',
                        },
                    ];
                    const profitInLieuTypes = [
                        {
                            code: 'SEC17_3',
                            desc: 'Income chargeable under the head profitInLieu',
                            natureDesc: null,
                        },
                        {
                            code: 'COMPENSATION_ON_VRS',
                            desc: 'Compensation due/received by an assessee from his employer or former employer in connection with the termination of his employment or modification thereto',
                            natureDesc: '1',
                        },
                        {
                            code: 'PAYMENT_DUE',
                            desc: 'Any payment due/received by an assessee from his employer or a former employer or from a provident or other fund, sum received under Keyman Insurance Policy including Bonus thereto',
                            natureDesc: '2',
                        },
                        {
                            code: 'AMOUNT_DUE',
                            desc: 'Any amount due/received by assessee from any person before joining or after cessation of employment with that person',
                            natureDesc: '3',
                        },
                        { code: 'ANY_OTHER', desc: 'Any Other', natureDesc: 'OTH' },
                    ];

                    if (salaries && salaries !== 0) {
                        ITR_Obj.systemFlags.hasSalary = true;
                        salaries.forEach((salary: any) => {
                            const employerDetails = {
                                id: '',
                                employerName: salary?.NameOfEmployer,
                                address: salary?.AddressDetail?.AddrDetail,
                                city: salary?.AddressDetail?.CityOrTownOrDistrict,
                                pinCode: salary?.AddressDetail?.PinCode,
                                state: salary?.AddressDetail?.StateCode,
                                employerPAN: '',
                                employerTAN: salary?.TANofEmployer,
                                periodFrom: '',
                                periodTo: '',
                                taxableIncome: null,
                                standardDeduction:
                                    ItrJSON[this.ITR_Type].ScheduleS?.DeductionUnderSection16ia,
                                employerCategory: salary?.NatureOfEmployment,
                                exemptIncome: null,
                                taxRelief: null,
                                taxDeducted: null,
                                salary: salaryTypes
                                    .map((type) => {
                                        if (type?.code === 'SEC17_1') {
                                            return {
                                                salaryType: type.code,
                                                taxableAmount: salary?.Salarys?.Salary,
                                                exemptAmount: 0,
                                            };
                                        } else {
                                            let amount =
                                                salary?.Salarys?.NatureOfSalary?.OthersIncDtls?.find(
                                                    (element) =>
                                                        element?.NatureDesc === type?.natureDesc
                                                )?.OthAmount || 0;
                                            if (amount && amount > 0) {
                                                return {
                                                    salaryType: type?.code,
                                                    taxableAmount: amount,
                                                    exemptAmount: 0,
                                                };
                                            } else {
                                                return null;
                                            }
                                        }
                                    })
                                    .filter(Boolean),
                                allowance:
                                    this.regime === 'NEW'
                                        ? [
                                            {
                                                allowanceType: 'GRATUITY',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'COMMUTED_PENSION',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LEAVE_ENCASHMENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ANY_OTHER',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                        ]
                                        : [
                                            {
                                                allowanceType: 'HOUSE_RENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LTA',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'CHILDREN_EDUCATION',
                                                taxableAmount: 0,
                                                exemptAmount: 0,
                                            },
                                            {
                                                allowanceType: 'GRATUITY',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'COMMUTED_PENSION',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'LEAVE_ENCASHMENT',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ANY_OTHER',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },

                                            {
                                                allowanceType: 'REMUNERATION_REC',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'US_10_7',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'FIRST_PROVISO',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'SECOND_PROVISO',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'COMPENSATION_ON_VRS',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'NON_MONETARY_PERQUISITES',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'US_10_14I',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },

                                            {
                                                allowanceType: 'US_10_14II',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                            {
                                                allowanceType: 'ALL_ALLOWANCES',
                                                taxableAmount: 0,
                                                exemptAmount: null,
                                            },
                                        ],
                                perquisites: perquisiteTypes
                                    .map((type) => {
                                        if (type?.code === 'SEC17_2') {
                                            return {
                                                perquisiteType: type.code,
                                                taxableAmount: salary?.Salarys?.ValueOfPerquisites,
                                                exemptAmount: 0,
                                            };
                                        } else {
                                            let amount =
                                                salary?.Salarys?.NatureOfPerquisites?.OthersIncDtls?.find(
                                                    (element) =>
                                                        element?.NatureDesc === type?.natureDesc
                                                )?.OthAmount || 0;
                                            if (amount && amount > 0) {
                                                return {
                                                    perquisiteType: type?.code,
                                                    taxableAmount: amount,
                                                    exemptAmount: 0,
                                                };
                                            } else {
                                                return null;
                                            }
                                        }
                                    })
                                    .filter(Boolean),
                                profitsInLieuOfSalaryType: profitInLieuTypes
                                    .map((type) => {
                                        if (type?.code === 'SEC17_3') {
                                            return {
                                                salaryType: type.code,
                                                taxableAmount: salary?.Salarys?.ProfitsinLieuOfSalary,
                                                exemptAmount: 0,
                                            };
                                        } else {
                                            let amount =
                                                salary?.Salarys?.NatureOfProfitInLieuOfSalary?.OthersIncDtls?.find(
                                                    (element) =>
                                                        element?.NatureDesc === type?.natureDesc
                                                )?.OthAmount || 0;
                                            if (amount && amount > 0) {
                                                return {
                                                    salaryType: type?.code,
                                                    taxableAmount: amount,
                                                    exemptAmount: 0,
                                                };
                                            } else {
                                                return null;
                                            }
                                        }
                                    })
                                    .filter(Boolean),
                                deductions:
                                    this.regime === 'NEW'
                                        ? []
                                        : [
                                            {
                                                deductionType: 'PROFESSIONAL_TAX',
                                                taxableAmount: null,
                                                exemptAmount: 0,
                                            },

                                            {
                                                deductionType: 'ENTERTAINMENT_ALLOW',
                                                taxableAmount: null,
                                                exemptAmount: 0,
                                            },
                                        ],
                                upload: [],
                                calculators: null,
                            };
                            ITR_Obj.employers.push(employerDetails);
                        });

                        // calling updateSalaryAllowance function to update allowances and deductions if regime is OLD.
                        if (this.regime === 'OLD') {
                            // setting salary Allowances
                            const availableSalaryAllowances = ItrJSON[
                                this.ITR_Type
                            ].ScheduleS?.AllwncExemptUs10?.AllwncExemptUs10Dtls?.map(
                                (value) => value.SalNatureDesc
                            );

                            this.updateSalaryAllowances(ItrJSON, ITR_Obj,
                                availableSalaryAllowances,
                                this.ITR_Type
                            );

                            //Setting professional tax
                            ITR_Obj.employers.forEach(
                                (employer) =>
                                (employer.deductions.find(
                                    (deductionType) =>
                                        deductionType.deductionType === 'PROFESSIONAL_TAX'
                                ).exemptAmount =
                                    ItrJSON[this.ITR_Type].ScheduleS?.ProfessionalTaxUs16iii /
                                    salaries.length)
                            );

                            //Setting entertainment allowance
                            ITR_Obj.employers.forEach(
                                (employer) =>
                                (employer.deductions.find(
                                    (deductionType) =>
                                        deductionType.deductionType === 'ENTERTAINMENT_ALLOW'
                                ).exemptAmount =
                                    ItrJSON[this.ITR_Type].ScheduleS
                                        ?.EntertainmntalwncUs16ii / salaries.length)
                            );
                        }
                    }
                }

                // HOUSE PROPERTIES
                {
                    const houseProperties =
                        ItrJSON[this.ITR_Type].ScheduleHP?.PropertyDetails;

                    if (houseProperties && houseProperties !== 0) {
                        ITR_Obj.systemFlags.hasHouseProperty = true;
                        houseProperties.forEach((houseProperty) => {
                            const housePropertyDetails = {
                                id: null,
                                propertyType:
                                    houseProperty?.ifLetOut === 'Y'
                                        ? 'LOP'
                                        : houseProperty?.ifLetOut === 'N'
                                            ? 'SOP'
                                            : houseProperty?.ifLetOut === 'D'
                                                ? 'DLOP'
                                                : 'LOP',
                                grossAnnualRentReceivedTotal:
                                    houseProperty?.Rentdetails?.AnnualLetableValue,
                                grossAnnualRentReceived:
                                    houseProperty?.Rentdetails?.AnnualLetableValue,

                                // Not able to map annualValue as we are not storing it in the ITRobject. The final annual value and deduction are wrong for itr2
                                propertyTax: houseProperty?.Rentdetails?.LocalTaxes,
                                address: houseProperty?.AddressDetailWithZipCode?.AddrDetail,
                                ownerOfProperty: null,
                                otherOwnerOfProperty: null,
                                city: houseProperty?.AddressDetailWithZipCode
                                    ?.CityOrTownOrDistrict,
                                state: houseProperty?.AddressDetailWithZipCode?.StateCode,
                                country: houseProperty?.AddressDetailWithZipCode?.CountryCode,
                                pinCode: houseProperty?.AddressDetailWithZipCode?.PinCode,
                                taxableIncome: houseProperty?.Rentdetails?.IncomeOfHP,
                                exemptIncome:
                                    houseProperty?.Rentdetails?.ThirtyPercentOfBalance,
                                isEligibleFor80EE: null, // how to decide which property needs to be marked as true in case deduction 80ee, 80eea is present
                                isEligibleFor80EEA: null, // how to decide which property needs to be marked as true in case deduction 80ee, 80eea is present
                                ownerPercentage: null,
                                coOwners: houseProperty?.CoOwners?.map(
                                    ({
                                        CoOwnersSNo,
                                        NameCoOwner,
                                        PAN_CoOwner,
                                        Aadhaar_CoOwner,
                                        PercentShareProperty,
                                    }) => ({
                                        id: null,
                                        name: NameCoOwner,
                                        isSelf: null,
                                        panNumber: PAN_CoOwner,
                                        percentage: PercentShareProperty,
                                    })
                                ),
                                tenant: houseProperty?.TenantDetails?.map(
                                    ({
                                        TenantSNo,
                                        NameofTenant,
                                        PANofTenant,
                                        AadhaarofTenant,
                                    }) => ({
                                        id: null,
                                        name: NameofTenant,
                                        panNumber: PANofTenant,
                                    })
                                ),
                                loans: [
                                    {
                                        id: null,
                                        loanType: 'HOUSING',
                                        principalAmount: null,
                                        interestAmount: houseProperty?.Rentdetails?.IntOnBorwCap,
                                    },
                                ],
                                ArrearsUnrealizedRentRcvd: Math.round(
                                    houseProperty?.Rentdetails?.ArrearsUnrealizedRentRcvd
                                ),
                                totalArrearsUnrealizedRentReceived:
                                    (Math.round(
                                        houseProperty?.Rentdetails?.ArrearsUnrealizedRentRcvd
                                    ) *
                                        100) /
                                    30,
                            };
                            ITR_Obj.houseProperties.push(housePropertyDetails);
                        });
                    }
                }

                // OTHER INCOME
                {
                    // DIVIDEND INCOMES
                    const jsonDividendObj =
                        ItrJSON[this.ITR_Type].ScheduleOS?.DividendIncUs115BBDA
                            ?.DateRange;

                    if (jsonDividendObj?.Upto15Of6) {
                        ITR_Obj.dividendIncomes.push({
                            income: jsonDividendObj?.Upto15Of6,
                            date: '2022-04-28T18:30:00.000Z',
                            quarter: 1,
                        });
                    }

                    if (jsonDividendObj?.Upto15Of9) {
                        ITR_Obj.dividendIncomes.push({
                            income: jsonDividendObj?.Upto15Of9,
                            date: '2022-07-28T18:30:00.000Z',
                            quarter: 2,
                        });
                    }

                    if (jsonDividendObj?.Up16Of9To15Of12) {
                        ITR_Obj.dividendIncomes.push({
                            income: jsonDividendObj?.Up16Of9To15Of12,
                            date: '2022-09-28T18:30:00.000Z',
                            quarter: 3,
                        });
                    }

                    if (jsonDividendObj?.Up16Of12To15Of3) {
                        ITR_Obj.dividendIncomes.push({
                            income: jsonDividendObj?.Up16Of12To15Of3,
                            date: '2022-12-28T18:30:00.000Z',
                            quarter: 4,
                        });
                    }

                    if (jsonDividendObj?.Up16Of3To31Of3) {
                        ITR_Obj.dividendIncomes.push({
                            income: jsonDividendObj?.Up16Of3To31Of3,
                            date: '2023-03-20T18:30:00.000Z',
                            quarter: 5,
                        });
                    }

                    const DividendGross =
                        ItrJSON[this.ITR_Type].ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.DividendGross;

                    // savings income
                    const IntrstFrmSavingBank =
                        ItrJSON[this.ITR_Type].ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstFrmSavingBank;

                    if (IntrstFrmSavingBank && IntrstFrmSavingBank !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'SAVING_INTEREST',
                            details: null,
                            amount: IntrstFrmSavingBank,
                            expenses: null,
                        });
                    }

                    // interest from deposits
                    const IntrstFrmTermDeposit =
                        ItrJSON[this.ITR_Type].ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstFrmTermDeposit;

                    if (IntrstFrmTermDeposit && IntrstFrmTermDeposit !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'FD_RD_INTEREST',
                            details: null,
                            amount: IntrstFrmTermDeposit,
                            expenses: null,
                        });
                    }

                    // interest from income tax refund
                    const IntrstFrmIncmTaxRefund =
                        ItrJSON[this.ITR_Type].ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstFrmIncmTaxRefund;

                    if (IntrstFrmIncmTaxRefund && IntrstFrmIncmTaxRefund !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'FD_RD_INTEREST',
                            details: null,
                            amount: IntrstFrmIncmTaxRefund,
                            expenses: null,
                        });
                    }

                    // family pension
                    const FamilyPension =
                        ItrJSON[this.ITR_Type].ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.FamilyPension;

                    if (FamilyPension && FamilyPension !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'FAMILY_PENSION',
                            details: 'FAMILY_PENSION',
                            amount: FamilyPension,
                            expenses: null,
                        });
                    }

                    // pf 10 11 I
                    const pfInterest1011IP =
                        ItrJSON[this.ITR_Type]?.ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstSec10XIFirstProviso;

                    if (pfInterest1011IP && pfInterest1011IP !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'INTEREST_ACCRUED_10_11_I_P',
                            details: '',
                            amount: pfInterest1011IP,
                            expenses: null,
                        });
                    }

                    // pf 10 11 II
                    const pfInterest1011IIP =
                        ItrJSON[this.ITR_Type]?.ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstSec10XISecondProviso;

                    if (pfInterest1011IIP && pfInterest1011IIP !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'INTEREST_ACCRUED_10_11_II_P',
                            details: '',
                            amount: pfInterest1011IIP,
                            expenses: null,
                        });
                    }

                    // pf 10 12 I
                    const pfInterest1012IP =
                        ItrJSON[this.ITR_Type]?.ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstSec10XIIFirstProviso;

                    if (pfInterest1012IP && pfInterest1012IP !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'INTEREST_ACCRUED_10_12_I_P',
                            details: '',
                            amount: pfInterest1012IP,
                            expenses: null,
                        });
                    }

                    // pf 10 12 I
                    const pfInterest1012IIP =
                        ItrJSON[this.ITR_Type]?.ScheduleOS
                            ?.IncOthThanOwnRaceHorse?.IntrstSec10XIISecondProviso;

                    if (pfInterest1012IIP && pfInterest1012IIP !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'INTEREST_ACCRUED_10_12_II_P',
                            details: '',
                            amount: pfInterest1012IIP,
                            expenses: null,
                        });
                    }

                    // any other
                    const IncChargeable =
                        ItrJSON[this.ITR_Type].ScheduleOS?.IncChargeable;

                    if (IncChargeable && IncChargeable !== 0) {
                        ITR_Obj.incomes.push({
                            incomeType: 'ANY_OTHER',
                            details: null,
                            amount:
                                IncChargeable -
                                IntrstFrmSavingBank -
                                IntrstFrmTermDeposit -
                                IntrstFrmIncmTaxRefund -
                                FamilyPension -
                                DividendGross -
                                pfInterest1011IP -
                                pfInterest1011IIP -
                                pfInterest1012IP -
                                pfInterest1012IIP,
                            expenses: null,
                        });
                    }

                    // gift income
                    {
                        ITR_Obj.giftTax.aggregateValueWithoutConsideration =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleOS?.IncOthThanOwnRaceHorse?.Aggrtvaluewithoutcons562x;

                        ITR_Obj.giftTax.anyOtherPropertyInadequateConsideration =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleOS?.IncOthThanOwnRaceHorse?.Anyotherpropinadeqcons562x;

                        ITR_Obj.giftTax.anyOtherPropertyWithoutConsideration =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleOS?.IncOthThanOwnRaceHorse?.Anyotherpropwithoutcons562x;

                        ITR_Obj.giftTax.immovablePropertyInadequateConsideration =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleOS?.IncOthThanOwnRaceHorse?.Immovpropinadeqcons562x;

                        ITR_Obj.giftTax.immovablePropertyWithoutConsideration =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleOS?.IncOthThanOwnRaceHorse?.Immovpropwithoutcons562x;
                    }
                }

                // SCHEDULE AL
                {
                    const ImmovableDetails =
                        ItrJSON[this.ITR_Type].ScheduleAL?.ImmovableDetails;

                    if (ImmovableDetails) {
                        ImmovableDetails.forEach((element) => {
                            const immovableDetail = {
                                amount: element.Amount,
                                area: element.AddressAL.LocalityOrArea,
                                city: element.AddressAL.CityOrTownOrDistrict,
                                country: element.AddressAL.CountryCode,
                                description: element.Description,
                                flatNo: element.AddressAL.ResidenceNo,
                                hasEdit: false,
                                pinCode: element.AddressAL.PinCode,
                                premisesName: element.AddressAL.ResidenceName,
                                road: element.AddressAL.RoadOrStreet,
                                srn: 0,
                                state: element.AddressAL.StateCode,
                            };

                            ITR_Obj.immovableAsset.push(immovableDetail);
                        });

                    }
                }

                //MOVABLE ASSET PENDING - ERROR WHILE SAVING NOT ABLE TO MAP

                // TAXES PAID
                {
                    {
                        //SALARY TDS
                        {
                            const jsonSalaryTDS =
                                ItrJSON[this.ITR_Type]?.ScheduleTDS1?.TDSonSalary;

                            if (!jsonSalaryTDS || jsonSalaryTDS.length === 0) {
                                ITR_Obj.taxPaid.onSalary = [];
                                console.log(
                                    'There are no tax paid salary details in the JSON that you have provided'
                                );
                            } else {
                                ITR_Obj.taxPaid.onSalary = jsonSalaryTDS?.map(
                                    ({
                                        EmployerOrDeductorOrCollectDetl: {
                                            TAN,
                                            EmployerOrDeductorOrCollecterName,
                                        },
                                        IncChrgSal,
                                        TotalTDSSal,
                                    }) => {
                                        return {
                                            id: null,
                                            srNo: null,
                                            deductorName: EmployerOrDeductorOrCollecterName,
                                            deductorTAN: TAN,
                                            totalAmountCredited: IncChrgSal,
                                            totalTdsDeposited: TotalTDSSal,
                                            taxDeduction: null,
                                        };
                                    }
                                );
                            }

                        }

                        // OTHER THAN SALARY 16A - have to add two more options of CG, NA for headOfIncome option
                        // {
                        // const otherThanSalary16A =
                        //   this.ITR_Type === 'ITR2'
                        //     ? 'TDSonOthThanSal'
                        //     : 'TDSonOthThanSalDtls';
                        // console.log('otherThanSalary16A', otherThanSalary16A);

                        const jsonOtherThanSalaryTDS: Array<object> =
                            ItrJSON[this.ITR_Type]?.ScheduleTDS2?.TDSOthThanSalaryDtls;

                        if (jsonOtherThanSalaryTDS) {
                            const mapJsonToITRObj16A = ({
                                TaxDeductCreditDtls: {
                                    TaxDeductedOwnHands,
                                    TaxClaimedOwnHands,
                                },
                                TDSCreditName,
                                TANOfDeductor,
                                GrossAmount,
                                HeadOfIncome,
                                AmtCarriedFwd,
                            }) => {
                                return {
                                    id: null,
                                    srNo: null,
                                    deductorName: null,
                                    deductorTAN: TANOfDeductor,
                                    totalTdsDeposited: TaxClaimedOwnHands,
                                    uniqueTDSCerNo: null,
                                    taxDeduction: null,
                                    totalAmountCredited: GrossAmount,
                                    headOfIncome: HeadOfIncome = 'OS',
                                };
                            };

                            ITR_Obj.taxPaid.otherThanSalary16A =
                                jsonOtherThanSalaryTDS?.map(mapJsonToITRObj16A);

                        }
                    }

                    // TDS3Details / otherThanSalary26QB
                    {
                        const jsonOtherThanSalary26QBTDS3 =
                            ItrJSON[this.ITR_Type]?.ScheduleTDS3?.TDS3onOthThanSalDtls ??
                            [];

                        const mapJsonToITRObj = ({
                            TaxDeductCreditDtls: {
                                TaxDeductedOwnHands,
                                TaxClaimedOwnHands,
                            },
                            TDSCreditName,
                            PANOfBuyerTenant,
                            AadhaarOfBuyerTenant,
                            GrossAmount,
                            HeadOfIncome,
                            AmtCarriedFwd,
                        }) => {
                            return {
                                id: null,
                                srNo: null,
                                deductorName: null,
                                deductorPAN: PANOfBuyerTenant,
                                totalTdsDeposited: TaxClaimedOwnHands,
                                uniqueTDSCerNo: null,
                                taxDeduction: null,
                                totalAmountCredited: GrossAmount,
                                headOfIncome: HeadOfIncome = 'OS',
                            };
                        };

                        ITR_Obj.taxPaid.otherThanSalary26QB =
                            jsonOtherThanSalary26QBTDS3?.map(mapJsonToITRObj);

                    }

                    // TCS - TAX COLLECTED AT SOURCE
                    // {
                    //   const jsonTCS = ItrJSON[this.ITR_Type]?.ScheduleTCS?.TCS;

                    //   if (!jsonTCS || jsonTCS.length === 0) {
                    //     ITR_Obj.taxPaid.tcs = [];
                    //     console.log(
                    //       'There are no TCS tax paid other than salary details in the JSON that you have provided'
                    //     );
                    //   } else {
                    //     ITR_Obj.taxPaid.tcs = jsonTCS?.map(
                    //       ({
                    //         TCSCurrFYDtls: { TCSAmtCollOwnHand },
                    //         TCSClaimedThisYearDtls: {
                    //           TCSAmtCollOthrHands: { TCSAmtCollSpouseOrOthrHand },
                    //         },
                    //         TCSCreditOwner,
                    //         EmployerOrDeductorOrCollectTAN,
                    //         AmtCarriedFwd,
                    //       }) => {
                    //         return {
                    //           id: null,
                    //           srNo: null,
                    //           collectorName: EmployerOrDeductorOrCollectTAN,
                    //           collectorTAN: EmployerOrDeductorOrCollectTAN,
                    //           totalAmountPaid: TCSAmtCollSpouseOrOthrHand,
                    //           totalTaxCollected: 0,
                    //           totalTcsDeposited: TCSAmtCollSpouseOrOthrHand,
                    //           taxDeduction: null,
                    //         };
                    //       }
                    //     );
                    //   }


                    // Advance and self assessment tax
                    {
                        const jsonAdvSAT = ItrJSON[this.ITR_Type]?.ScheduleIT?.TaxPayment;

                        if (!jsonAdvSAT || jsonAdvSAT.length === 0) {
                            ITR_Obj.taxPaid.otherThanTDSTCS = [];
                            console.log(
                                'There are no advance taxes or self assessment taxes paid details in the JSON that you have provided'
                            );
                        } else {
                            ITR_Obj.taxPaid.otherThanTDSTCS = jsonAdvSAT?.map(
                                ({ BSRCode, DateDep, SrlNoOfChaln, Amt }) => {
                                    return {
                                        id: null,
                                        srNo: null,
                                        totalTax: Amt,
                                        bsrCode: BSRCode,
                                        dateOfDeposit: this.parseAndFormatDate(DateDep),
                                        challanNumber: SrlNoOfChaln,
                                        majorHead: null,
                                        minorHead: null,
                                        tax: null,
                                        surcharge: null,
                                        educationCess: null,
                                        other: null,
                                    };
                                }
                            );
                        }
                    }

                }

                // INVESTMENTS / DEDUCTIONS
                {
                    if (ItrJSON[this.ITR_Type]?.ScheduleVIA?.DeductUndChapVIA) {
                        if (ITR_Obj.investments) {
                            //getting all the investments keys from the JSON and passing it to the updateInvestments function
                            const availableInvestments = Object.entries(
                                ItrJSON[this.ITR_Type].ScheduleVIA?.DeductUndChapVIA
                            ).filter(([key, value]) => key !== 'TotalChapVIADeductions');

                            console.log('availableInvestments==>>', availableInvestments);

                            this.updateInvestments(ItrJSON, ITR_Obj, availableInvestments, this.ITR_Type);
                        } else {
                            console.log(
                                'ITR OBJ => Investments => There are no details under investments in the ITR Obj'
                            );
                        }
                    } else {
                        console.log(
                            'ITRJSON => INVESTMENTS =>',
                            `ItrJSON ${[
                                this.ITR_Type,
                            ]}.ScheduleVIA?.DeductUndChapVIA does not exist in JSON`
                        );
                    }

                }

                // EXEMPT INCOME
                {
                    if (
                        ITR_Obj.exemptIncomes &&
                        ItrJSON[this.ITR_Type]?.ScheduleEI?.OthersInc
                            ?.OthersIncDtls
                    ) {
                        // getting all the exempt income keys from the JSON and passing it to the updateExemptIncomes function
                        const availableExemptIncomes = ItrJSON[
                            this.ITR_Type
                        ].ScheduleEI?.OthersInc?.OthersIncDtls?.map(
                            (value) => value.NatureDesc
                        );
                        this.updateExemptIncomes(ItrJSON, ITR_Obj, availableExemptIncomes, this.ITR_Type);
                    }

                    // agriculture rebate
                    {
                        if (!ITR_Obj.agriculturalIncome) {
                            ITR_Obj.agriculturalIncome = {
                                agriIncomePortionRule7: null,
                                expenditureIncurredOnAgriculture: null,
                                grossAgriculturalReceipts: null,
                                netAgriculturalIncome: null,
                                unabsorbedAgriculturalLoss: null,
                            };
                        }

                        ITR_Obj.agriculturalIncome.expenditureIncurredOnAgriculture =
                            ItrJSON[this.ITR_Type].ScheduleEI?.ExpIncAgri;

                        ITR_Obj.agriculturalIncome.grossAgriculturalReceipts =
                            ItrJSON[this.ITR_Type].ScheduleEI?.GrossAgriRecpt;

                        ITR_Obj.agriculturalIncome.netAgriculturalIncome =
                            ItrJSON[
                                this.ITR_Type
                            ].ScheduleEI?.NetAgriIncOrOthrIncRule7;

                        ITR_Obj.agriculturalIncome.unabsorbedAgriculturalLoss =
                            ItrJSON[this.ITR_Type].ScheduleEI?.UnabAgriLossPrev8;

                        // agriculture land details
                        {
                            const agriLandDetails =
                                ItrJSON[this.ITR_Type].ScheduleEI?.ExcNetAgriInc
                                    ?.ExcNetAgriIncDtls;

                            if (agriLandDetails && agriLandDetails?.length > 0) {
                                if (!ITR_Obj.agriculturalLandDetails) {
                                    ITR_Obj.agriculturalLandDetails = [];
                                }
                                ITR_Obj.agriculturalLandDetails = agriLandDetails?.map(
                                    (element) => ({
                                        landInAcre: element?.MeasurementOfLand,
                                        nameOfDistrict: element?.NameOfDistrict,
                                        owner: element?.AgriLandOwnedFlag,
                                        pinCode: element?.PinCode,
                                        typeOfLand: element?.AgriLandIrrigatedFlag,
                                    })
                                );
                            }
                        }
                    }
                }

                // DECLARATION
                {
                    let capacity = '';
                    if (ItrJSON[this.ITR_Type].Verification.Capacity === 'S') {
                        capacity = 'Self';
                    } else {
                        console.log(
                            'Declaration => Verification => Capacity other than self is not allowed'
                        );
                    }
                    {
                        ITR_Obj.declaration.name =
                            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerName;

                        ITR_Obj.declaration.panNumber =
                            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerPAN;

                        ITR_Obj.declaration.place = '';

                        ITR_Obj.declaration.capacity = capacity;

                        ITR_Obj.declaration.childOf =
                            ItrJSON[this.ITR_Type].Verification.Declaration.FatherName;

                        ITR_Obj.declaration.place =
                            ItrJSON[this.ITR_Type].Verification.Place;
                    }

                }

                // Financial Particulars - Balance Sheet
                {
                    let balanceSheetKeys: any;
                    if (this.ITR_Type === 'ITR3') {
                        balanceSheetKeys = {
                            id: null,

                            grossTurnOverAmount: null,

                            membersOwnCapital:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundSrc?.PropFund
                                    ?.TotPropFund,

                            securedLoans:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundSrc?.LoanFunds?.SecrLoan
                                    ?.TotSecrLoan,

                            unSecuredLoans:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundSrc?.LoanFunds
                                    ?.UnsecrLoan?.TotUnSecrLoan,

                            advances:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.LoanAdv?.TotLoanAdv,

                            sundryCreditorsAmount:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrLiabilitiesProv?.CurrLiabilities?.SundryCred,

                            otherLiabilities:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrLiabilitiesProv?.Provisions?.TotProvisions,

                            totalCapitalLiabilities:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrLiabilitiesProv?.CurrLiabilities?.TotCurrLiabilities -
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrLiabilitiesProv?.CurrLiabilities?.SundryCred,

                            fixedAssets:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.FixedAsset
                                    ?.TotFixedAsset,

                            inventories:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrAsset?.Inventories?.TotInventries,

                            sundryDebtorsAmount:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrAsset?.SndryDebtors,

                            balanceWithBank:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrAsset?.CashOrBankBal?.BankBal,

                            cashInHand:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.CurrAsset?.CashOrBankBal?.CashinHand,

                            loanAndAdvances:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.CurrAssetLoanAdv
                                    ?.LoanAdv?.TotLoanAdv,

                            otherAssets: null,

                            totalAssets: null,

                            investment:
                                ItrJSON[this.ITR_Type].PARTA_BS?.FundApply?.Investments
                                    ?.TotInvestments,

                            GSTRNumber: null,

                            difference: null,
                        };

                        // Check if balanceSheetKeys is not empty and all values are zero
                        const isBalanceSheetKeysEmpty = Object.values(
                            balanceSheetKeys
                        ).every((value) => value === null || value === 0);

                        if (!isBalanceSheetKeysEmpty) {
                            ITR_Obj.business.financialParticulars = balanceSheetKeys;
                        }
                        ITR_Obj.systemFlags.hasBusinessProfessionIncome = true;
                    }

                }

                // SCHEDULE VDA
                {
                    const vdaDetails =
                        ItrJSON[this.ITR_Type]?.ScheduleVDA?.ScheduleVDADtls;
                    console.log(vdaDetails, 'jsonVdaDetails');

                    if (vdaDetails) {
                        const vdaToPush = vdaDetails?.map((vda, index) => {
                            // Check if ConsidReceived is a string before applying replace
                            const sellValue =
                                vda?.ConsidReceived && typeof vda.ConsidReceived === 'string'
                                    ? parseFloat(vda.ConsidReceived.replace(/,/g, ''))
                                    : vda?.ConsidReceived;

                            return {
                                algorithm: 'vdaCrypto',
                                capitalGain: vda?.IncomeFromVDA,
                                gainType: 'NA',
                                headOfIncome: vda?.HeadUndIncTaxed,
                                purchaseCost: parseFloat(vda?.AcquisitionCost),
                                purchaseDate: vda?.DateofAcquisition,
                                purchaseValuePerUnit: parseFloat(vda?.AcquisitionCost),
                                sellDate: vda?.DateofTransfer,
                                sellOrBuyQuantity: 1,
                                sellValue: sellValue,
                                sellValuePerUnit: sellValue,
                                srn: index++,
                            };
                        });

                        console.log(vdaToPush, 'vdaToPush');
                        if (vdaToPush) {
                            const toSave = {
                                assessmentYear: '2023-2024',
                                assesseeType: 'INDIVIDUAL',
                                residentialStatus: 'RESIDENT',
                                assetType: 'VDA',
                                assetDetails: vdaToPush,
                                improvement: [],
                                buyersDetails: [],
                            };

                            console.log(toSave, 'tosave');

                            // Pusing all the vda details in the capital gain array
                            if (toSave) {
                                ITR_Obj?.capitalGain?.push(toSave);

                            }
                        }
                    }
                }

                // SCHEDULE CG
                {
                    //LTCG
                    {
                        // ZERO COUPON BONDS
                        {
                            const Proviso112Applicabledtls =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.LongTermCapGain23?.Proviso112Applicable;

                            if (Proviso112Applicabledtls) {
                                Proviso112Applicabledtls.forEach(({ zcb }, index) => {
                                    if (
                                        zcb === Proviso112Applicabledtls[0] &&
                                        Proviso112Applicabledtls[0] &&
                                        Proviso112Applicabledtls[0]?.Proviso112Applicabledtls
                                            ?.BalanceCG !== 0 &&
                                        Proviso112Applicabledtls[0] &&
                                        Proviso112Applicabledtls[0]?.Proviso112Applicabledtls
                                            ?.FullConsideration !== 0
                                    ) {
                                        const zcbDetail = {
                                            assessmentYear: ITR_Obj.assessmentYear,
                                            assesseeType: ITR_Obj.assesseeType,
                                            residentialStatus: ITR_Obj.residentialStatus,
                                            assetType: 'ZERO_COUPON_BONDS',
                                            deduction: [
                                                {
                                                    srn: index,
                                                    underSection: 'Deduction 54F',
                                                    orgAssestTransferDate: null,
                                                    purchaseDate: null,
                                                    panOfEligibleCompany: null,
                                                    purchaseDatePlantMachine: null,
                                                    costOfNewAssets: null,
                                                    investmentInCGAccount: null,
                                                    totalDeductionClaimed: zcb.Proviso112Applicabledtls
                                                        ?.DeductionUs54F
                                                        ? zcb.Proviso112Applicabledtls?.DeductionUs54F
                                                        : null,
                                                    costOfPlantMachinary: null,
                                                    usedDeduction: null,
                                                },
                                            ],
                                            improvement: [
                                                {
                                                    id: null,
                                                    srn: index,
                                                    financialYearOfImprovement: null,
                                                    dateOfImprovement: null,
                                                    costOfImprovement: zcb.Proviso112Applicabledtls
                                                        ?.DeductSec48?.ImproveCost
                                                        ? zcb.Proviso112Applicabledtls?.DeductSec48
                                                            ?.ImproveCost
                                                        : null,
                                                    indexCostOfImprovement: null,
                                                },
                                            ],
                                            buyersDetails: [],
                                            assetDetails: [
                                                {
                                                    id: null,
                                                    hasIndexation: null,
                                                    isUploaded: null,
                                                    srn: index,
                                                    description: null,
                                                    gainType: 'LONG',
                                                    sellDate: this.parseAndFormatDate('2023-03-15'),
                                                    sellValue: null,
                                                    stampDutyValue: null,
                                                    valueInConsideration:
                                                        zcb.Proviso112Applicabledtls?.FullConsideration,
                                                    sellExpense:
                                                        zcb.Proviso112Applicabledtls.DeductSec48
                                                            ?.ExpOnTrans,
                                                    purchaseDate: this.parseAndFormatDate('2022-03-13'),
                                                    purchaseCost:
                                                        zcb.Proviso112Applicabledtls?.DeductSec48
                                                            ?.AquisitCost,
                                                    isinCode: null,
                                                    nameOfTheUnits: null,
                                                    sellOrBuyQuantity: 1,
                                                    sellValuePerUnit: null,
                                                    purchaseValuePerUnit: null,
                                                    algorithm: 'cgProperty',
                                                    isIndexationBenefitAvailable: null,
                                                    whetherDebenturesAreListed: null,
                                                    fmvAsOn31Jan2018: null,
                                                    capitalGain:
                                                        zcb.Proviso112Applicabledtls?.CapgainonAssets,
                                                    cgBeforeDeduction:
                                                        zcb.Proviso112Applicabledtls?.CapgainonAssets,
                                                    indexCostOfAcquisition: null,
                                                    totalFairMarketValueOfCapitalAsset: null,
                                                    grandFatheredValue: null,
                                                    brokerName: null,
                                                },
                                            ],
                                            deductionAmount: null,
                                        };

                                        ITR_Obj.capitalGain.push(zcbDetail);

                                        ITR_Obj.systemFlags.hasCapitalGain = true;
                                    }
                                });
                            }
                        }

                        // SALE OF BONDS DEBENTURE
                        {
                            const SaleofBondsDebntr =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.LongTermCapGain23?.SaleofBondsDebntr;

                            if (
                                SaleofBondsDebntr &&
                                SaleofBondsDebntr?.BalanceCG &&
                                SaleofBondsDebntr?.BalanceCG !== 0 &&
                                SaleofBondsDebntr?.FullConsideration &&
                                SaleofBondsDebntr?.FullConsideration !== 0
                            ) {
                                const SaleofBondsDebntrDetails = {
                                    assessmentYear: ITR_Obj?.assessmentYear,
                                    assesseeType: ITR_Obj?.assesseeType,
                                    residentialStatus: ITR_Obj?.residentialStatus,
                                    assetType: 'BONDS',
                                    deduction: [
                                        {
                                            srn: 0,
                                            underSection: 'Deduction 54F',
                                            orgAssestTransferDate: null,
                                            purchaseDate: null,
                                            panOfEligibleCompany: null,
                                            purchaseDatePlantMachine: null,
                                            costOfNewAssets: null,
                                            investmentInCGAccount: null,
                                            totalDeductionClaimed: SaleofBondsDebntr?.DeductionUs54F
                                                ? SaleofBondsDebntr?.DeductionUs54F
                                                : null,
                                            costOfPlantMachinary: null,
                                            usedDeduction: null,
                                        },
                                    ],
                                    improvement: [
                                        {
                                            id: null,
                                            srn: 0,
                                            financialYearOfImprovement: null,
                                            dateOfImprovement: null,
                                            costOfImprovement: SaleofBondsDebntr?.DeductSec48
                                                ?.ImproveCost
                                                ? SaleofBondsDebntr?.DeductSec48?.ImproveCost
                                                : null,
                                            indexCostOfImprovement: null,
                                        },
                                    ],
                                    buyersDetails: [],
                                    assetDetails: [
                                        {
                                            id: null,
                                            hasIndexation: null,
                                            isUploaded: null,
                                            srn: 0,
                                            description: null,
                                            gainType: 'LONG',
                                            sellDate: this.parseAndFormatDate('2023-03-15'),
                                            sellValue: null,
                                            stampDutyValue: null,
                                            valueInConsideration:
                                                SaleofBondsDebntr?.FullConsideration,
                                            sellExpense: SaleofBondsDebntr?.DeductSec48?.ExpOnTrans,
                                            purchaseDate: this.parseAndFormatDate('2020-03-13'),
                                            purchaseCost:
                                                SaleofBondsDebntr?.DeductSec48?.AquisitCost,
                                            isinCode: null,
                                            nameOfTheUnits: null,
                                            sellOrBuyQuantity: 1,
                                            sellValuePerUnit: null,
                                            purchaseValuePerUnit: null,
                                            algorithm: 'cgProperty',
                                            isIndexationBenefitAvailable: null,
                                            whetherDebenturesAreListed: null,
                                            fmvAsOn31Jan2018: null,
                                            capitalGain: SaleofBondsDebntr?.CapgainonAssets,
                                            cgBeforeDeduction: SaleofBondsDebntr?.CapgainonAssets,
                                            indexCostOfAcquisition: null,
                                            totalFairMarketValueOfCapitalAsset: null,
                                            grandFatheredValue: null,
                                            brokerName: null,
                                        },
                                    ],
                                    deductionAmount: null,
                                };

                                ITR_Obj.capitalGain.push(SaleofBondsDebntrDetails);
                                ITR_Obj.systemFlags.hasCapitalGain = true;
                            }
                        }

                        // OTHER ASSETS
                        {
                            const SaleofAssetNA =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.LongTermCapGain23?.SaleofAssetNA;

                            if (
                                SaleofAssetNA &&
                                SaleofAssetNA?.BalanceCG &&
                                SaleofAssetNA?.BalanceCG !== 0 &&
                                SaleofAssetNA?.FullConsideration &&
                                SaleofAssetNA?.FullConsideration !== 0
                            ) {
                                const SaleofAssetNADetail = {
                                    assessmentYear: ITR_Obj.assessmentYear,
                                    assesseeType: ITR_Obj.assesseeType,
                                    residentialStatus: ITR_Obj.residentialStatus,
                                    assetType: 'GOLD',
                                    deduction: [
                                        {
                                            srn: 0,
                                            underSection: 'Deduction 54F',
                                            orgAssestTransferDate: null,
                                            purchaseDate: null,
                                            panOfEligibleCompany: null,
                                            purchaseDatePlantMachine: null,
                                            costOfNewAssets: null,
                                            investmentInCGAccount: null,
                                            totalDeductionClaimed: SaleofAssetNA?.DeductionUs54F
                                                ? SaleofAssetNA?.DeductionUs54F
                                                : null,
                                            costOfPlantMachinary: null,
                                            usedDeduction: null,
                                        },
                                    ],
                                    improvement: [
                                        {
                                            id: null,
                                            srn: 0,
                                            financialYearOfImprovement: null,
                                            dateOfImprovement: null,
                                            costOfImprovement: SaleofAssetNA?.DeductSec48
                                                ?.ImproveCost
                                                ? SaleofAssetNA?.DeductSec48?.ImproveCost
                                                : null,
                                            indexCostOfImprovement: null,
                                        },
                                    ],
                                    buyersDetails: [],
                                    assetDetails: [
                                        {
                                            id: null,
                                            hasIndexation: null,
                                            isUploaded: null,
                                            srn: 0,
                                            description: null,
                                            gainType: 'LONG',
                                            sellDate: this.parseAndFormatDate('2023-03-15'),
                                            sellValue: SaleofAssetNA?.FullConsideration,
                                            stampDutyValue: null,
                                            valueInConsideration: null,
                                            sellExpense: SaleofAssetNA?.DeductSec48?.ExpOnTrans,
                                            purchaseDate: this.parseAndFormatDate('2020-03-13'),
                                            purchaseCost: SaleofAssetNA?.DeductSec48?.AquisitCost,
                                            isinCode: null,
                                            nameOfTheUnits: null,
                                            sellOrBuyQuantity: 1,
                                            sellValuePerUnit: null,
                                            purchaseValuePerUnit: null,
                                            algorithm: 'cgProperty',
                                            isIndexationBenefitAvailable: null,
                                            whetherDebenturesAreListed: null,
                                            fmvAsOn31Jan2018: null,
                                            capitalGain: SaleofAssetNA?.CapgainonAssets,
                                            cgBeforeDeduction: SaleofAssetNA?.CapgainonAssets,
                                            indexCostOfAcquisition: null,
                                            totalFairMarketValueOfCapitalAsset: null,
                                            grandFatheredValue: null,
                                            brokerName: null,
                                        },
                                    ],
                                    deductionAmount: null,
                                };
                                ITR_Obj.capitalGain.push(SaleofAssetNADetail);
                                ITR_Obj.systemFlags.hasCapitalGain = true;
                            }
                        }

                        // LAND & BUILDING
                        {
                            const SaleofLandBuildDtls =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.LongTermCapGain23?.SaleofLandBuild?.SaleofLandBuildDtls;

                            if (SaleofLandBuildDtls) {
                                SaleofLandBuildDtls?.forEach((landAndBuilding, index) => {
                                    if (
                                        landAndBuilding?.FullConsideration &&
                                        landAndBuilding?.FullConsideration !== 0 &&
                                        landAndBuilding?.Balance &&
                                        landAndBuilding?.Balance !== 0
                                    ) {
                                        const SaleofLandBuildDetails = {
                                            assessmentYear: ITR_Obj.assessmentYear,
                                            assesseeType: ITR_Obj.assesseeType,
                                            residentialStatus: ITR_Obj.residentialStatus,
                                            assetType: 'PLOT_OF_LAND',
                                            deduction: [
                                                landAndBuilding?.ExemptionOrDednUs54
                                                    ?.ExemptionOrDednUs54Dtls
                                                    ? landAndBuilding?.ExemptionOrDednUs54?.ExemptionOrDednUs54Dtls?.map(
                                                        (
                                                            { ExemptionSecCode, ExemptionAmount },
                                                            index
                                                        ) => ({
                                                            srn: index,
                                                            underSection: ExemptionSecCode,
                                                            orgAssestTransferDate: null,
                                                            purchaseDate: null,
                                                            panOfEligibleCompany: null,
                                                            purchaseDatePlantMachine: null,
                                                            costOfNewAssets: null,
                                                            investmentInCGAccount: null,
                                                            totalDeductionClaimed: ExemptionAmount
                                                                ? ExemptionAmount
                                                                : null,
                                                            costOfPlantMachinary: null,
                                                            usedDeduction: null,
                                                        })
                                                    )
                                                    : {
                                                        srn: index,
                                                        underSection: 'Deduction 54F',
                                                        orgAssestTransferDate: null,
                                                        purchaseDate: null,
                                                        panOfEligibleCompany: null,
                                                        purchaseDatePlantMachine: null,
                                                        costOfNewAssets: null,
                                                        investmentInCGAccount: null,
                                                        totalDeductionClaimed: null,
                                                        costOfPlantMachinary: null,
                                                        usedDeduction: null,
                                                    },
                                            ],
                                            improvement: [
                                                {
                                                    id: null,
                                                    srn: index,
                                                    financialYearOfImprovement: null,
                                                    dateOfImprovement: null,
                                                    costOfImprovement: landAndBuilding?.ImproveCost,
                                                    indexCostOfImprovement: null,
                                                },
                                            ],
                                            buyersDetails:
                                                landAndBuilding?.TrnsfImmblPrprty?.TrnsfImmblPrprtyDtls?.map(
                                                    (
                                                        {
                                                            NameOfBuyer,
                                                            PANofBuyer,
                                                            PercentageShare,
                                                            Amount,
                                                            AddressOfProperty,
                                                            StateCode,
                                                            CountryCode,
                                                            PinCode,
                                                        },
                                                        index
                                                    ) => ({
                                                        aadhaarNumber: null,
                                                        address: AddressOfProperty,
                                                        amount: Amount,
                                                        country: CountryCode,
                                                        name: NameOfBuyer,
                                                        pan: PANofBuyer,
                                                        pin: PinCode,
                                                        share: PercentageShare,
                                                        srn: index,
                                                        state: StateCode,
                                                    })
                                                ),
                                            assetDetails: [
                                                {
                                                    id: null,
                                                    hasIndexation: null,
                                                    isUploaded: null,
                                                    srn: index,
                                                    description: null,
                                                    gainType: 'LONG',
                                                    sellDate: this.parseAndFormatDate(
                                                        landAndBuilding?.DateofSale
                                                            ? landAndBuilding?.DateofSale
                                                            : '2023-03-15'
                                                    ),
                                                    sellValue: landAndBuilding?.FullConsideration,
                                                    stampDutyValue: landAndBuilding?.PropertyValuation,
                                                    valueInConsideration:
                                                        landAndBuilding?.FullConsideration50C,
                                                    sellExpense: landAndBuilding?.ExpOnTrans,
                                                    purchaseDate: this.parseAndFormatDate(
                                                        landAndBuilding?.DateofPurchase
                                                            ? landAndBuilding?.DateofPurchase
                                                            : '2021-03-13'
                                                    ),
                                                    purchaseCost: landAndBuilding?.AquisitCost,
                                                    isinCode: null,
                                                    nameOfTheUnits: null,
                                                    sellOrBuyQuantity: 1,
                                                    sellValuePerUnit: null,
                                                    purchaseValuePerUnit: null,
                                                    algorithm: 'cgProperty',
                                                    isIndexationBenefitAvailable: null,
                                                    whetherDebenturesAreListed: null,
                                                    fmvAsOn31Jan2018: null,
                                                    capitalGain: landAndBuilding?.Balance,
                                                    cgBeforeDeduction: landAndBuilding?.Balance,
                                                    indexCostOfAcquisition:
                                                        landAndBuilding?.AquisitCostIndex,
                                                    totalFairMarketValueOfCapitalAsset: null,
                                                    grandFatheredValue: null,
                                                    brokerName: null,
                                                },
                                            ],
                                            deductionAmount: null,
                                        };
                                        ITR_Obj.capitalGain.push(SaleofLandBuildDetails);
                                        ITR_Obj.systemFlags.hasCapitalGain = true;

                                    }
                                });
                            }
                        }

                        // EQUITY 112A
                        {
                            const EquityMF112A =
                                ItrJSON[this.ITR_Type].Schedule112A
                                    ?.Schedule112ADtls;

                            if (EquityMF112A) {
                                EquityMF112A?.forEach((equityLtcg) => {
                                    let itrObjEquity112a = ITR_Obj?.capitalGain?.find(
                                        (equity112a) =>
                                            equity112a?.assetType === 'EQUITY_SHARES_LISTED'
                                    );

                                    if (itrObjEquity112a) {
                                        itrObjEquity112a?.assetDetails.push({
                                            id: null,
                                            isUploaded: null,
                                            srn: null,
                                            description: null,
                                            gainType: 'LONG',
                                            sellDate: this.parseAndFormatDate('2023-03-15'),
                                            sellValue: equityLtcg?.TotSaleValue,
                                            stampDutyValue: null,
                                            valueInConsideration: null,
                                            sellExpense: equityLtcg?.ExpExclCnctTransfer,
                                            purchaseDate: this.parseAndFormatDate('2021-03-13'),
                                            purchaseCost: equityLtcg?.AcquisitionCost,
                                            isinCode: equityLtcg?.ISINCode,
                                            nameOfTheUnits: equityLtcg?.ShareUnitName,
                                            sellOrBuyQuantity: 1,
                                            sellValuePerUnit: equityLtcg?.TotSaleValue,
                                            purchaseValuePerUnit: equityLtcg?.AcquisitionCost,
                                            algorithm: 'cgSharesMF',
                                            isIndexationBenefitAvailable: null,
                                            whetherDebenturesAreListed: null,
                                            fmvAsOn31Jan2018: equityLtcg?.FairMktValuePerShareunit,
                                            capitalGain: equityLtcg.Balance,
                                            cgBeforeDeduction: equityLtcg.Balance,
                                            indexCostOfAcquisition: null,
                                            grandFatheredValue: null,
                                            brokerName: null,
                                            //TODO: shreekant update for summary json key
                                            totalFairMarketValueOfCapitalAsset: null,
                                        });
                                    } else {
                                        const equityLtcgDetail = {
                                            assessmentYear: ITR_Obj.assessmentYear,
                                            assesseeType: ITR_Obj.assesseeType,
                                            residentialStatus: ITR_Obj.residentialStatus,
                                            assetType: 'EQUITY_SHARES_LISTED',
                                            deduction: [
                                                {
                                                    srn: 0,
                                                    underSection: 'Deduction 54F',
                                                    orgAssestTransferDate: null,
                                                    purchaseDate: null,
                                                    panOfEligibleCompany: null,
                                                    purchaseDatePlantMachine: null,
                                                    costOfNewAssets: null,
                                                    investmentInCGAccount: null,
                                                    totalDeductionClaimed: null,
                                                    costOfPlantMachinary: null,
                                                    usedDeduction: null,
                                                },
                                            ],
                                            improvement: [
                                                {
                                                    id: null,
                                                    srn: null,
                                                    financialYearOfImprovement: null,
                                                    dateOfImprovement: null,
                                                    costOfImprovement: null,
                                                    indexCostOfImprovement: null,
                                                },
                                            ],
                                            buyersDetails: [],
                                            assetDetails: [
                                                {
                                                    id: null,
                                                    hasIndexation: null,
                                                    isUploaded: null,
                                                    srn: null,
                                                    description: null,
                                                    gainType: 'LONG',
                                                    sellDate: this.parseAndFormatDate('2023-03-15'),
                                                    sellValue: equityLtcg?.TotSaleValue,
                                                    stampDutyValue: null,
                                                    valueInConsideration: null,
                                                    sellExpense: equityLtcg?.ExpExclCnctTransfer,
                                                    purchaseDate: this.parseAndFormatDate('2021-03-13'),
                                                    purchaseCost: equityLtcg?.AcquisitionCost,
                                                    isinCode: equityLtcg?.ISINCode,
                                                    nameOfTheUnits: equityLtcg?.ShareUnitName,
                                                    sellOrBuyQuantity: 1,
                                                    sellValuePerUnit: equityLtcg?.TotSaleValue,
                                                    purchaseValuePerUnit: equityLtcg?.AcquisitionCost,
                                                    algorithm: 'cgSharesMF',
                                                    isIndexationBenefitAvailable: null,
                                                    whetherDebenturesAreListed: null,
                                                    fmvAsOn31Jan2018:
                                                        equityLtcg?.FairMktValuePerShareunit,
                                                    capitalGain: equityLtcg.Balance,
                                                    cgBeforeDeduction: equityLtcg.Balance,
                                                    indexCostOfAcquisition: null,
                                                    grandFatheredValue: null,
                                                    brokerName: null,
                                                    //TODO: shreekant update for summary json
                                                    totalFairMarketValueOfCapitalAsset: null,
                                                },
                                            ],
                                            deductionAmount: null,
                                        };
                                        ITR_Obj.capitalGain.push(equityLtcgDetail);
                                    }

                                    ITR_Obj.systemFlags.hasCapitalGain = true;
                                });

                                ITR_Obj.systemFlags.hasCapitalGain = true;

                            }
                        }
                    }

                    // STCG
                    {
                        // OTHER ASSETS
                        {
                            const SaleOnOtherAssets =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.ShortTermCapGainFor23?.SaleOnOtherAssets;

                            if (
                                SaleOnOtherAssets &&
                                SaleOnOtherAssets?.CapgainonAssets !== 0 &&
                                SaleOnOtherAssets?.FullConsideration !== 0
                            ) {
                                const SaleOnOtherAssetsDetail = {
                                    assessmentYear: ITR_Obj.assessmentYear,
                                    assesseeType: ITR_Obj.assesseeType,
                                    residentialStatus: ITR_Obj.residentialStatus,
                                    assetType: 'GOLD',
                                    deduction: [
                                        {
                                            srn: 0,
                                            underSection: 'Deduction 54F',
                                            orgAssestTransferDate: null,
                                            purchaseDate: null,
                                            panOfEligibleCompany: null,
                                            purchaseDatePlantMachine: null,
                                            costOfNewAssets: null,
                                            investmentInCGAccount: null,
                                            totalDeductionClaimed: null,
                                            costOfPlantMachinary: null,
                                            usedDeduction: null,
                                        },
                                    ],
                                    improvement: [
                                        {
                                            id: null,
                                            srn: 0,
                                            financialYearOfImprovement: null,
                                            dateOfImprovement: null,
                                            costOfImprovement: SaleOnOtherAssets?.DeductSec48
                                                ?.ImproveCost
                                                ? SaleOnOtherAssets?.DeductSec48?.ImproveCost
                                                : null,
                                            indexCostOfImprovement: null,
                                        },
                                    ],
                                    buyersDetails: [],
                                    assetDetails: [
                                        {
                                            id: null,
                                            hasIndexation: null,
                                            isUploaded: null,
                                            srn: 0,
                                            description: null,
                                            gainType: 'SHORT',
                                            sellDate: this.parseAndFormatDate('2023-03-15'),
                                            sellValue: SaleOnOtherAssets?.FullConsideration,
                                            stampDutyValue: null,
                                            valueInConsideration: null,
                                            sellExpense: SaleOnOtherAssets?.DeductSec48?.ExpOnTrans,
                                            purchaseDate: this.parseAndFormatDate('2022-04-15'),
                                            purchaseCost:
                                                SaleOnOtherAssets?.DeductSec48?.AquisitCost,
                                            isinCode: null,
                                            nameOfTheUnits: null,
                                            sellOrBuyQuantity: 1,
                                            sellValuePerUnit: null,
                                            purchaseValuePerUnit: null,
                                            algorithm: 'cgProperty',
                                            isIndexationBenefitAvailable: null,
                                            whetherDebenturesAreListed: null,
                                            fmvAsOn31Jan2018: null,
                                            capitalGain: SaleOnOtherAssets?.CapgainonAssets,
                                            cgBeforeDeduction: SaleOnOtherAssets?.CapgainonAssets,
                                            indexCostOfAcquisition: null,
                                            totalFairMarketValueOfCapitalAsset: null,
                                            grandFatheredValue: null,
                                            brokerName: null,
                                        },
                                    ],
                                    deductionAmount: null,
                                };

                                ITR_Obj.capitalGain.push(SaleOnOtherAssetsDetail);
                                ITR_Obj.systemFlags.hasCapitalGain = true;
                            }
                        }

                        // EQUITY 111A
                        {
                            const EquityMFonSTT =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.ShortTermCapGainFor23?.EquityMFonSTT;

                            EquityMFonSTT?.forEach((equityStcg) => {
                                if (equityStcg === EquityMFonSTT[0]) {
                                    let itrObjEquity111a = ITR_Obj.capitalGain?.find(
                                        (equity111a) =>
                                            equity111a?.assetType === 'EQUITY_SHARES_LISTED'
                                    );

                                    if (itrObjEquity111a) {
                                        itrObjEquity111a?.assetDetails?.push({
                                            id: null,
                                            isUploaded: null,
                                            srn: null,
                                            description: null,
                                            gainType: 'SHORT',
                                            sellDate: this.parseAndFormatDate('2023-03-15'),
                                            sellValue:
                                                equityStcg.EquityMFonSTTDtls?.FullConsideration,
                                            stampDutyValue: null,
                                            valueInConsideration: null,
                                            sellExpense:
                                                equityStcg.EquityMFonSTTDtls.DeductSec48?.ExpOnTrans,
                                            purchaseDate: this.parseAndFormatDate('2022-04-15'),
                                            purchaseCost:
                                                equityStcg.EquityMFonSTTDtls.DeductSec48?.AquisitCost,
                                            isinCode: null,
                                            nameOfTheUnits: null,
                                            sellOrBuyQuantity: 1,
                                            sellValuePerUnit:
                                                equityStcg.EquityMFonSTTDtls?.FullConsideration,
                                            purchaseValuePerUnit:
                                                equityStcg.EquityMFonSTTDtls.DeductSec48?.AquisitCost,
                                            algorithm: 'cgSharesMF',
                                            isIndexationBenefitAvailable: null,
                                            whetherDebenturesAreListed: null,
                                            fmvAsOn31Jan2018: null,
                                            capitalGain:
                                                equityStcg.EquityMFonSTTDtls?.CapgainonAssets,
                                            cgBeforeDeduction:
                                                equityStcg.EquityMFonSTTDtls?.CapgainonAssets,
                                            indexCostOfAcquisition: null,
                                            grandFatheredValue: null,
                                            brokerName: null,
                                            //TODO: shreekant update for summary json tool
                                            totalFairMarketValueOfCapitalAsset: null,
                                        });
                                    } else {
                                        const equityStcgDetail = {
                                            assessmentYear: ITR_Obj.assessmentYear,
                                            assesseeType: ITR_Obj.assesseeType,
                                            residentialStatus: ITR_Obj.residentialStatus,
                                            assetType: 'EQUITY_SHARES_LISTED',
                                            deduction: [
                                                {
                                                    srn: 0,
                                                    underSection: 'Deduction 54F',
                                                    orgAssestTransferDate: null,
                                                    purchaseDate: null,
                                                    panOfEligibleCompany: null,
                                                    purchaseDatePlantMachine: null,
                                                    costOfNewAssets: null,
                                                    investmentInCGAccount: null,
                                                    totalDeductionClaimed: null,
                                                    costOfPlantMachinary: null,
                                                    usedDeduction: null,
                                                },
                                            ],
                                            improvement: [
                                                {
                                                    id: null,
                                                    srn: null,
                                                    financialYearOfImprovement: null,
                                                    dateOfImprovement: null,
                                                    costOfImprovement:
                                                        equityStcg.EquityMFonSTTDtls?.DeductSec48
                                                            ?.ImproveCost,
                                                    indexCostOfImprovement: null,
                                                },
                                            ],
                                            buyersDetails: [],
                                            assetDetails: [
                                                {
                                                    id: null,
                                                    hasIndexation: null,
                                                    isUploaded: null,
                                                    srn: null,
                                                    description: null,
                                                    gainType: 'SHORT',
                                                    sellDate: this.parseAndFormatDate('2023-03-15'),
                                                    sellValue:
                                                        equityStcg.EquityMFonSTTDtls?.FullConsideration,
                                                    stampDutyValue: null,
                                                    valueInConsideration: null,
                                                    sellExpense:
                                                        equityStcg.EquityMFonSTTDtls.DeductSec48
                                                            ?.ExpOnTrans,
                                                    purchaseDate: this.parseAndFormatDate('2022-04-15'),
                                                    purchaseCost:
                                                        equityStcg.EquityMFonSTTDtls.DeductSec48
                                                            ?.AquisitCost,
                                                    isinCode: null,
                                                    nameOfTheUnits: null,
                                                    sellOrBuyQuantity: 1,
                                                    sellValuePerUnit:
                                                        equityStcg.EquityMFonSTTDtls?.FullConsideration,
                                                    purchaseValuePerUnit:
                                                        equityStcg.EquityMFonSTTDtls.DeductSec48
                                                            ?.AquisitCost,
                                                    algorithm: 'cgSharesMF',
                                                    isIndexationBenefitAvailable: null,
                                                    whetherDebenturesAreListed: null,
                                                    fmvAsOn31Jan2018: null,
                                                    capitalGain:
                                                        equityStcg.EquityMFonSTTDtls?.CapgainonAssets,
                                                    cgBeforeDeduction:
                                                        equityStcg.EquityMFonSTTDtls?.CapgainonAssets,
                                                    indexCostOfAcquisition: null,
                                                    totalFairMarketValueOfCapitalAsset: null,
                                                    grandFatheredValue: null,
                                                    brokerName: null,
                                                },
                                            ],
                                            deductionAmount: null,
                                        };
                                        ITR_Obj.capitalGain.push(equityStcgDetail);
                                    }

                                    ITR_Obj.systemFlags.hasCapitalGain = true;
                                }
                            });

                        }

                        // LAND & BUILDING
                        {
                            const SaleofLandBuildDtlsStcg =
                                ItrJSON[this.ITR_Type].ScheduleCGFor23
                                    ?.ShortTermCapGainFor23?.SaleofLandBuild
                                    ?.SaleofLandBuildDtls;

                            if (SaleofLandBuildDtlsStcg) {
                                SaleofLandBuildDtlsStcg?.forEach((landAndBuilding, index) => {
                                    if (
                                        landAndBuilding?.FullConsideration &&
                                        landAndBuilding?.FullConsideration !== 0 &&
                                        landAndBuilding?.Balance &&
                                        landAndBuilding?.Balance !== 0
                                    ) {
                                        const SaleofLandBuildStcgDetails = {
                                            assessmentYear: ITR_Obj.assessmentYear,
                                            assesseeType: ITR_Obj.assesseeType,
                                            residentialStatus: ITR_Obj.residentialStatus,
                                            assetType: 'PLOT_OF_LAND',
                                            deduction: [
                                                {
                                                    srn: index,
                                                    underSection: 'Deduction 54F',
                                                    orgAssestTransferDate: null,
                                                    purchaseDate: null,
                                                    panOfEligibleCompany: null,
                                                    purchaseDatePlantMachine: null,
                                                    costOfNewAssets: null,
                                                    investmentInCGAccount: null,
                                                    totalDeductionClaimed: null,
                                                    costOfPlantMachinary: null,
                                                    usedDeduction: null,
                                                },
                                            ],
                                            improvement: [
                                                {
                                                    id: null,
                                                    srn: index,
                                                    financialYearOfImprovement: null,
                                                    dateOfImprovement: null,
                                                    costOfImprovement: landAndBuilding?.ImproveCost
                                                        ? landAndBuilding?.ImproveCost
                                                        : null,
                                                    indexCostOfImprovement: null,
                                                },
                                            ],
                                            buyersDetails:
                                                landAndBuilding.TrnsfImmblPrprty?.TrnsfImmblPrprtyDtls?.map(
                                                    (
                                                        {
                                                            NameOfBuyer,
                                                            PANofBuyer,
                                                            PercentageShare,
                                                            Amount,
                                                            AddressOfProperty,
                                                            StateCode,
                                                            CountryCode,
                                                            PinCode,
                                                        },
                                                        index
                                                    ) => ({
                                                        aadhaarNumber: null,
                                                        address: AddressOfProperty,
                                                        amount: Amount,
                                                        country: CountryCode,
                                                        name: NameOfBuyer,
                                                        pan: PANofBuyer,
                                                        pin: PinCode,
                                                        share: PercentageShare,
                                                        srn: index,
                                                        state: StateCode,
                                                    })
                                                ),
                                            assetDetails: [
                                                {
                                                    id: null,
                                                    hasIndexation: null,
                                                    isUploaded: null,
                                                    srn: index,
                                                    description: null,
                                                    gainType: 'SHORT',
                                                    sellDate: this.parseAndFormatDate(
                                                        landAndBuilding?.DateofSale
                                                            ? landAndBuilding?.DateofSale
                                                            : '2023-03-15'
                                                    ),
                                                    sellValue: landAndBuilding?.FullConsideration,
                                                    stampDutyValue: landAndBuilding?.PropertyValuation,
                                                    valueInConsideration:
                                                        landAndBuilding?.FullConsideration50C,
                                                    sellExpense: landAndBuilding?.ExpOnTrans,
                                                    purchaseDate: this.parseAndFormatDate(
                                                        landAndBuilding?.DateofPurchase
                                                            ? landAndBuilding?.DateofPurchase
                                                            : '2022-04-15'
                                                    ),
                                                    purchaseCost: landAndBuilding?.AquisitCost,
                                                    isinCode: null,
                                                    nameOfTheUnits: null,
                                                    sellOrBuyQuantity: 1,
                                                    sellValuePerUnit: null,
                                                    purchaseValuePerUnit: null,
                                                    algorithm: 'cgProperty',
                                                    isIndexationBenefitAvailable: null,
                                                    whetherDebenturesAreListed: null,
                                                    fmvAsOn31Jan2018: null,
                                                    capitalGain: landAndBuilding?.Balance,
                                                    cgBeforeDeduction: landAndBuilding?.Balance,
                                                    indexCostOfAcquisition:
                                                        landAndBuilding?.AquisitCostIndex,
                                                    totalFairMarketValueOfCapitalAsset: null,
                                                    grandFatheredValue: null,
                                                    brokerName: null,
                                                },
                                            ],
                                            deductionAmount: null,
                                        };
                                        ITR_Obj.capitalGain.push(SaleofLandBuildStcgDetails);
                                        ITR_Obj.systemFlags.hasCapitalGain = true;
                                    }
                                });
                            }

                        }
                    }
                }

                // SCHEDULE FOREIGN INCOME
                {
                    if (!ITR_Obj.foreignIncome) {
                        ITR_Obj.foreignIncome = {
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
                        };
                    }

                    ITR_Obj.foreignIncome.taxReliefClaimed = ItrJSON[
                        this.ITR_Type
                    ]?.ScheduleFSI?.ScheduleFSIDtls?.map((element, index) => ({
                        id: '0',
                        claimedDTAA:
                            ItrJSON[this.ITR_Type]?.ScheduleTR1?.ScheduleTR[index]
                                ?.ReliefClaimedUsSection,
                        reliefClaimedUsSection:
                            ItrJSON[this.ITR_Type]?.ScheduleTR1?.ScheduleTR[index]
                                ?.ReliefClaimedUsSection,
                        countryCode: element?.CountryCodeExcludingIndia,
                        countryName: element?.CountryName,
                        taxPayerID: element?.TaxIdentificationNo,
                        headOfIncome: [
                            {
                                id: '0',
                                incomeType: 'SALARY',
                                claimedDTAA: element?.IncFromSal?.DTAAReliefUs90or90A,
                                outsideIncome: element?.IncFromSal?.IncFrmOutsideInd,
                                outsideTaxPaid: element?.IncFromSal?.TaxPaidOutsideInd,
                                taxPayable: element?.IncFromSal?.TaxPayableinInd,
                                taxRelief: element?.IncFromSal?.TaxReliefinInd,
                            },
                            {
                                id: '0',
                                incomeType: 'HOUSE',
                                claimedDTAA: element?.IncFromHP?.DTAAReliefUs90or90A,
                                outsideIncome: element?.IncFromHP?.IncFrmOutsideInd,
                                outsideTaxPaid: element?.IncFromHP?.TaxPaidOutsideInd,
                                taxPayable: element?.IncFromHP?.TaxPayableinInd,
                                taxRelief: element?.IncFromHP?.TaxReliefinInd,
                            },
                            {
                                id: '0',
                                incomeType: 'CAPITAL_GAIN',
                                claimedDTAA: element?.IncCapGain?.DTAAReliefUs90or90A,
                                outsideIncome: element?.IncCapGain?.IncFrmOutsideInd,
                                outsideTaxPaid: element?.IncCapGain?.TaxPaidOutsideInd,
                                taxPayable: element?.IncCapGain?.TaxPayableinInd,
                                taxRelief: element?.IncCapGain?.TaxReliefinInd,
                            },
                            {
                                id: '0',
                                incomeType: 'OTHER',
                                claimedDTAA: element?.IncOthSrc?.DTAAReliefUs90or90A,
                                outsideIncome: element?.IncOthSrc?.IncFrmOutsideInd,
                                outsideTaxPaid: element?.IncOthSrc?.TaxPaidOutsideInd,
                                taxPayable: element?.IncOthSrc?.TaxPayableinInd,
                                taxRelief: element?.IncOthSrc?.TaxReliefinInd,
                            },
                            this.ITR_Type === 'ITR3' && element?.IncFromBusiness
                                ? {
                                    id: '0',
                                    incomeType: 'BUSINESS_OR_PROFESSION',
                                    claimedDTAA:
                                        element?.IncFromBusiness?.DTAAReliefUs90or90A,
                                    outsideIncome: element?.IncFromBusiness?.IncFrmOutsideInd,
                                    outsideTaxPaid:
                                        element?.IncFromBusiness?.TaxPaidOutsideInd,
                                    taxPayable: element?.IncFromBusiness?.TaxPayableinInd,
                                    taxRelief: element?.IncFromBusiness?.TaxReliefinInd,
                                }
                                : null,
                        ].filter(Boolean),
                    }));
                }

                // SCHEDULE TR
                {
                    ITR_Obj.foreignIncome.taxPaidOutsideIndiaFlag =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleTR1?.TaxPaidOutsideIndFlg;

                    if (
                        ItrJSON[this.ITR_Type]?.ScheduleTR1
                            ?.TaxPaidOutsideIndFlg === 'YES'
                    ) {
                        ITR_Obj.foreignIncome.taxAmountRefunded =
                            ItrJSON[this.ITR_Type]?.ScheduleTR1?.AmtTaxRefunded;
                        ITR_Obj.foreignIncome.taxReliefAssessmentYear =
                            ItrJSON[this.ITR_Type]?.ScheduleTR1?.AssmtYrTaxRelief;
                    }
                }

                // SCHEDULE FA
                {
                    // depositoryAccounts - DetailsForiegnBank
                    if (!ITR_Obj.foreignIncome.foreignAssets.depositoryAccounts) {
                        ITR_Obj.foreignIncome.foreignAssets.depositoryAccounts = [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.depositoryAccounts =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsForiegnBank?.map((element) => ({
                            accountNumber: element?.ForeignAccountNumber,
                            accountOpeningDate: element?.AccOpenDate,
                            addressOfInstitution: element?.AddressOfBank,
                            cashValue: null,
                            closingBalance: element?.ClosingBalance,
                            countryCode: element?.CountryCodeExcludingIndia,
                            countryName: element?.CountryName,
                            dateOfContract: null,
                            grossAmountNature: null,
                            grossInterestPaid: element?.IntrstAccured,
                            nameOfInstitution: element?.Bankname,
                            peakBalance: element?.PeakBalanceDuringYear,
                            status: element?.OwnerStatus,
                            totalGrossAmountPaid: null,
                            zipCode: element?.ZipCode,
                        }));

                    // custodialAccounts - DtlsForeignCustodialAcc
                    if (!ITR_Obj.foreignIncome.foreignAssets.custodialAccounts) {
                        ITR_Obj.foreignIncome.foreignAssets.custodialAccounts = [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.custodialAccounts =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DtlsForeignCustodialAcc?.map((element) => ({
                            accountNumber: element?.AccountNumber,
                            accountOpeningDate: element?.AccOpenDate,
                            addressOfInstitution: element?.FinancialInstAddress,
                            cashValue: null,
                            closingBalance: element?.ClosingBalance,
                            countryCode: element?.CountryCodeExcludingIndia,
                            countryName: element?.CountryName,
                            dateOfContract: null,
                            grossAmountNature:
                                element?.NatureOfAmount === 'I'
                                    ? 'Interest'
                                    : element?.NatureOfAmount === 'D'
                                        ? 'Dividend'
                                        : element?.NatureOfAmount === 'S'
                                            ? 'Proceeds from sale or redemption of financial assets'
                                            : element?.NatureOfAmount === 'O'
                                                ? 'Other income'
                                                : element?.NatureOfAmount === 'N'
                                                    ? 'No Amount Paid/Credited'
                                                    : 'Select',
                            grossInterestPaid: element?.GrossAmtPaidCredited,
                            nameOfInstitution: element?.FinancialInstName,
                            peakBalance: element?.PeakBalanceDuringPeriod,
                            status: element?.Status,
                            totalGrossAmountPaid: null,
                            zipCode: element?.ZipCode,
                        }));

                    // // equityAndDebtInterest - DtlsForeignEquityDebtInterest
                    if (
                        !ITR_Obj.foreignIncome.foreignAssets.equityAndDebtInterest
                    ) {
                        ITR_Obj.foreignIncome.foreignAssets.equityAndDebtInterest =
                            [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.equityAndDebtInterest =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DtlsForeignEquityDebtInterest?.map((element) => ({
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            nameOfEntity: element?.NameOfEntity,
                            addressOfEntity: element?.AddressOfEntity,
                            zipCode: element?.ZipCode,
                            natureOfEntity: element?.NatureOfEntity,
                            dateOfInterest: element?.InterestAcquiringDate,
                            initialValue: element?.InitialValOfInvstmnt,
                            peakValue: element?.PeakBalanceDuringPeriod,
                            closingValue: element?.ClosingBalance,
                            totalGrossAmountPaid: element?.TotGrossAmtPaidCredited,
                            totalGrossProceedsFromSale: element?.TotGrossProceeds,
                        }));

                    // // cashValueInsurance - DtlsForeignCashValueInsurance
                    if (!ITR_Obj.foreignIncome.foreignAssets.cashValueInsurance) {
                        ITR_Obj.foreignIncome.foreignAssets.cashValueInsurance = [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.cashValueInsurance =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DtlsForeignCashValueInsurance?.map((element) => ({
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            nameOfInstitution: element?.FinancialInstName,
                            addressOfInstitution: element?.FinancialInstAddress,
                            zipCode: element?.ZipCode,
                            dateOfContract: element?.ContractDate,
                            cashValue: element?.CashValOrSurrenderVal,
                            totalGrossAmountPaid: element?.TotGrossAmtPaidCredited,
                            accountNumber: null,
                            accountOpeningDate: null,
                            closingBalance: null,
                            grossAmountNature: null,
                            grossInterestPaid: null,
                            peakBalance: null,
                            status: null,
                        }));

                    // // financialInterestDetails - DetailsFinancialInterest
                    if (
                        !ITR_Obj.foreignIncome.foreignAssets.financialInterestDetails
                    ) {
                        ITR_Obj.foreignIncome.foreignAssets.financialInterestDetails =
                            [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.financialInterestDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsFinancialInterest?.map((element) => ({
                            id: null,
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            zipCode: element?.ZipCode,
                            natureOfEntity: element?.NatureOfEntity,
                            nameOfEntity: element?.NameOfEntity,
                            address: element?.AddressOfEntity,
                            natureOfInterest: element?.NatureOfInt,
                            date: element?.DateHeld,
                            totalInvestments: element?.TotalInvestment,
                            accruedIncome: element?.IncFromInt,
                            amount: element?.IncTaxAmt,
                            natureOfIncome: element?.NatureOfInc,
                            numberOfSchedule: parseFloat(element?.IncTaxSchNo),
                            scheduleOfferd:
                                element?.IncTaxSch === 'SA'
                                    ? 'Salary'
                                    : element?.IncTaxSch === 'HP'
                                        ? 'House Property'
                                        : element?.IncTaxSch === 'BU'
                                            ? 'Business'
                                            : element?.IncTaxSch === 'CG'
                                                ? 'Capital Gains'
                                                : element?.IncTaxSch === 'OS'
                                                    ? 'Other Sources'
                                                    : element?.IncTaxSch === 'EI'
                                                        ? 'Exempt Income'
                                                        : element?.IncTaxSch === 'NI'
                                                            ? 'No Income during the year'
                                                            : 'Select',
                        }));

                    // // immovablePropertryDetails - DetailsImmovableProperty
                    if (
                        !ITR_Obj.foreignIncome.foreignAssets
                            .immovablePropertryDetails
                    ) {
                        ITR_Obj.foreignIncome.foreignAssets.immovablePropertryDetails =
                            [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.immovablePropertryDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsImmovableProperty?.map((element) => ({
                            id: null,
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            zipCode: element?.ZipCode,
                            address: element?.AddressOfProperty,
                            ownerShip: element?.Ownership,
                            date: element?.DateOfAcq,
                            totalInvestments: element?.TotalInvestment,
                            derivedIncome: element?.IncDrvProperty,
                            natureOfIncome: element?.NatureOfInc,
                            amount: element?.IncTaxAmt,
                            numberOfSchedule: parseFloat(element?.IncTaxSchNo),
                            scheduleOfferd:
                                element?.IncTaxSch === 'SA'
                                    ? 'Salary'
                                    : element?.IncTaxSch === 'HP'
                                        ? 'House Property'
                                        : element?.IncTaxSch === 'BU'
                                            ? 'Business'
                                            : element?.IncTaxSch === 'CG'
                                                ? 'Capital Gains'
                                                : element?.IncTaxSch === 'OS'
                                                    ? 'Other Sources'
                                                    : element?.IncTaxSch === 'EI'
                                                        ? 'Exempt Income'
                                                        : element?.IncTaxSch === 'NI'
                                                            ? 'No Income during the year'
                                                            : 'Select',
                        }));

                    // capitalAssetsDetails - DetailsOthAssets
                    if (
                        !ITR_Obj.foreignIncome.foreignAssets.capitalAssetsDetails
                    ) {
                        ITR_Obj.foreignIncome.foreignAssets.capitalAssetsDetails =
                            [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.capitalAssetsDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsOthAssets?.map((element) => ({
                            id: null,
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            zipCode: element?.ZipCode,
                            natureOfAsstes: element?.NatureOfAsset,
                            ownerShip: element?.Ownership,
                            date: element?.DateOfAcq,
                            totalInvestments: element?.TotalInvestment,
                            derivedIncome: element?.IncDrvAsset,
                            natureOfIncome: element?.NatureOfInc,
                            amount: element?.IncTaxAmt,
                            scheduleOfferd:
                                element?.IncTaxSch === 'SA'
                                    ? 'Salary'
                                    : element?.IncTaxSch === 'HP'
                                        ? 'House Property'
                                        : element?.IncTaxSch === 'BU'
                                            ? 'Business'
                                            : element?.IncTaxSch === 'CG'
                                                ? 'Capital Gains'
                                                : element?.IncTaxSch === 'OS'
                                                    ? 'Other Sources'
                                                    : element?.IncTaxSch === 'EI'
                                                        ? 'Exempt Income'
                                                        : element?.IncTaxSch === 'NI'
                                                            ? 'No Income during the year'
                                                            : 'Select',
                            numberOfSchedule: parseFloat(element?.IncTaxSchNo),
                        }));

                    // signingAuthorityDetails - DetailsOfAccntsHvngSigningAuth
                    if (
                        !ITR_Obj.foreignIncome.foreignAssets.signingAuthorityDetails
                    ) {
                        ITR_Obj.foreignIncome.foreignAssets.signingAuthorityDetails =
                            [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.signingAuthorityDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsOfAccntsHvngSigningAuth?.map((element) => ({
                            id: null,
                            institutionName: element?.NameOfInstitution,
                            address: element?.AddressOfInstitution,
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            zipCode: element?.ZipCode,
                            accountHolderName: element?.NameMentionedInAccnt,
                            accountNumber: element?.InstitutionAccountNumber,
                            peakBalance: element?.PeakBalanceOrInvestment,
                            isTaxableinYourHand: element?.IncAccuredTaxFlag,
                            accruedIncome: element?.IncAccuredInAcc,
                            amount: element?.IncOfferedAmt,
                            scheduleOfferd:
                                element?.IncOfferedSch === 'SA'
                                    ? 'Salary'
                                    : element?.IncOfferedSch === 'HP'
                                        ? 'House Property'
                                        : element?.IncOfferedSch === 'BU'
                                            ? 'Business'
                                            : element?.IncOfferedSch === 'CG'
                                                ? 'Capital Gains'
                                                : element?.IncOfferedSch === 'OS'
                                                    ? 'Other Sources'
                                                    : element?.IncOfferedSch === 'EI'
                                                        ? 'Exempt Income'
                                                        : element?.IncOfferedSch === 'NI'
                                                            ? 'No Income during the year'
                                                            : 'Select',
                            numberOfSchedule: parseFloat(element?.IncOfferedSchNo),
                        }));

                    // trustsDetails - DetailsOfTrustOutIndiaTrustee
                    if (!ITR_Obj.foreignIncome.foreignAssets.trustsDetails) {
                        ITR_Obj.foreignIncome.foreignAssets.trustsDetails = [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.trustsDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsOfTrustOutIndiaTrustee?.map((element) => ({
                            id: null,
                            countryName: element?.CountryName,
                            countryCode: element?.CountryCodeExcludingIndia,
                            zipCode: element?.ZipCode,
                            trustName: element?.NameOfTrust,
                            trustAddress: element?.AddressOfTrust,
                            trusteesName: element?.NameOfOtherTrustees,
                            trusteesAddress: element?.AddressOfOtherTrustees,
                            settlorName: element?.NameOfSettlor,
                            settlorAddress: element?.AddressOfSettlor,
                            beneficiariesName: element?.NameOfBeneficiaries,
                            beneficiariesAddress: element?.AddressOfBeneficiaries,
                            date: element?.DateHeld,
                            isTaxableinYourHand: element?.IncDrvTaxFlag,
                            derivedIncome: element?.IncDrvFromTrust,
                            amount: element?.IncOfferedAmt,
                            scheduleOfferd:
                                element?.IncOfferedSch === 'SA'
                                    ? 'Salary'
                                    : element?.IncOfferedSch === 'HP'
                                        ? 'House Property'
                                        : element?.IncOfferedSch === 'BU'
                                            ? 'Business'
                                            : element?.IncOfferedSch === 'CG'
                                                ? 'Capital Gains'
                                                : element?.IncOfferedSch === 'OS'
                                                    ? 'Other Sources'
                                                    : element?.IncOfferedSch === 'EI'
                                                        ? 'Exempt Income'
                                                        : element?.IncOfferedSch === 'NI'
                                                            ? 'No Income during the year'
                                                            : 'Select',
                            numberOfSchedule: parseFloat(element?.IncOfferedSchNo),
                        }));

                    // // otherIncomeDetails - DetailsOthAssets
                    if (!ITR_Obj.foreignIncome.foreignAssets.otherIncomeDetails) {
                        ITR_Obj.foreignIncome.foreignAssets.otherIncomeDetails = [];
                    }
                    ITR_Obj.foreignIncome.foreignAssets.otherIncomeDetails =
                        ItrJSON[
                            this.ITR_Type
                        ]?.ScheduleFA?.DetailsOfOthSourcesIncOutsideIndia?.map(
                            (element) => ({
                                id: null,
                                countryName: element?.CountryName,
                                countryCode: element?.CountryCodeExcludingIndia,
                                zipCode: element?.ZipCode,
                                name: element?.NameOfPerson,
                                address: element?.AddressOfPerson,
                                derivedIncome: element?.IncDerived,
                                natureOfIncome: element?.NatureOfInc,
                                isTaxableinYourHand: element?.IncDrvTaxFlag,
                                amount: element?.IncOfferedAmt,
                                scheduleOfferd: element?.IncOfferedSch,
                                numberOfSchedule: element?.IncOfferedSchNo,
                            })
                        );
                }

                // SCHEDULE CFL
                {
                    const CFL = ItrJSON[this.ITR_Type]?.ScheduleCFL;

                    // AY 2014 - 2015
                    {
                        const LossCFFromPrev8thYearFromAY =
                            CFL?.LossCFFromPrev8thYearFromAY;

                        if (LossCFFromPrev8thYearFromAY) {
                            const LossCFFromPrev8thYearFromAYItrObj = {
                                id: null,
                                assessmentPastYear: '2014-15',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev8thYearFromAYItrObj
                            );
                        }
                    }

                    // AY 2015 - 2016
                    {
                        const LossCFFromPrev7thYearFromAY =
                            CFL?.LossCFFromPrev7thYearFromAY;

                        if (LossCFFromPrev7thYearFromAY) {
                            const LossCFFromPrev7thYearFromAYITtrObj = {
                                id: null,
                                assessmentPastYear: '2015-16',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev7thYearFromAYITtrObj
                            );
                        }
                    }

                    // AY 2016 - 2017
                    {
                        const LossCFFromPrev6thYearFromAY =
                            CFL?.LossCFFromPrev6thYearFromAY;

                        if (
                            LossCFFromPrev6thYearFromAY &&
                            LossCFFromPrev6thYearFromAY.DateOfFiling
                        ) {
                            const LossCFFromPrev6thYearFromAYITtrObj = {
                                id: null,
                                assessmentPastYear: '2016-17',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev6thYearFromAYITtrObj
                            );
                        }
                    }

                    // AY 2017 - 2018
                    {
                        const LossCFFromPrev5thYearFromAY =
                            CFL?.LossCFFromPrev5thYearFromAY;

                        if (
                            LossCFFromPrev5thYearFromAY &&
                            LossCFFromPrev5thYearFromAY.DateOfFiling
                        ) {
                            const LossCFFromPrev5thYearFromAYITtrObj = {
                                id: null,
                                assessmentPastYear: '2017-18',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev5thYearFromAYITtrObj
                            );
                        }
                    }

                    // AY 2018 - 2019
                    {
                        const LossCFFromPrev4thYearFromAY =
                            CFL?.LossCFFromPrev4thYearFromAY;

                        if (
                            LossCFFromPrev4thYearFromAY &&
                            LossCFFromPrev4thYearFromAY.DateOfFiling
                        ) {
                            const LossCFFromPrev4thYearFromAYITtrObj = {
                                id: null,
                                assessmentPastYear: '2018-19',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev4thYearFromAYITtrObj
                            );
                        }
                    }

                    // AY 2019 - 2020
                    {
                        const LossCFFromPrev3rdYearFromAY =
                            CFL?.LossCFFromPrev3rdYearFromAY;

                        if (
                            LossCFFromPrev3rdYearFromAY &&
                            LossCFFromPrev3rdYearFromAY.DateOfFiling
                        ) {
                            const LossCFFromPrev3rdYearFromAYITtrObj = {
                                id: null,
                                assessmentPastYear: '2019-20',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev3rdYearFromAYITtrObj
                            );
                        }
                    }

                    // AY 2020 - 2021
                    {
                        const LossCFFromPrev2ndYearFromAY =
                            CFL?.LossCFFromPrev2ndYearFromAY;

                        if (
                            LossCFFromPrev2ndYearFromAY &&
                            LossCFFromPrev2ndYearFromAY.DateOfFiling
                        ) {
                            const LossCFFromPrev2ndYearFromAYItrObj = {
                                id: null,
                                assessmentPastYear: '2020-21',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                                        ?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                                        ?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(
                                LossCFFromPrev2ndYearFromAYItrObj
                            );
                        }
                    }

                    // AY 2021 - 2022
                    {
                        const LossCFFromPrevYrToAY = CFL?.LossCFFromPrevYrToAY;

                        if (LossCFFromPrevYrToAY && LossCFFromPrevYrToAY.DateOfFiling) {
                            const LossCFFromPrevYrToAYItrObj = {
                                id: null,
                                assessmentPastYear: '2021-22',
                                dateofFilling: this.parseAndFormatDate(
                                    LossCFFromPrevYrToAY?.CarryFwdLossDetail?.DateOfFiling
                                ),
                                housePropertyLoss:
                                    LossCFFromPrevYrToAY?.CarryFwdLossDetail?.TotalHPPTILossCF,
                                pastYear: 0,
                                STCGLoss:
                                    LossCFFromPrevYrToAY?.CarryFwdLossDetail
                                        ?.TotalSTCGPTILossCF,
                                LTCGLoss:
                                    LossCFFromPrevYrToAY?.CarryFwdLossDetail
                                        ?.TotalLTCGPTILossCF,

                                hasEdit: null,
                                speculativeBusinessLoss: null,
                                broughtForwordBusinessLoss: null,
                                setOffWithCurrentYearSpeculativeBusinessIncome: null,
                                setOffWithCurrentYearBroughtForwordBusinessIncome: null,
                                setOffWithCurrentYearHPIncome: null,
                                setOffWithCurrentYearSTCGIncome: null,
                                setOffWithCurrentYearLTCGIncome: null,
                                carryForwardAmountBusiness: null,
                                carryForwardAmountSpeculative: null,
                                carryForwardAmountHP: null,
                                carryForwardAmountSTCGIncome: null,
                                carryForwardAmountLTCGIncome: null,
                                totalLoss: null,
                            };

                            ITR_Obj.pastYearLosses.push(LossCFFromPrevYrToAYItrObj);
                        }
                    }
                }

                // Non speculative income ITR3
                {
                    if (this.ITR_Type === 'ITR3') {
                        const TradingAc =
                            ItrJSON[this.ITR_Type]?.TradingAccount;
                        if (
                            TradingAc?.TotRevenueFrmOperations &&
                            TradingAc?.TotRevenueFrmOperations !== 0
                        ) {
                            // Function to create an expense object
                            function createExpenseObject(amount, natureOfIncome) {
                                return {
                                    hasExpense: false,
                                    expenseType: 'OTHER_EXPENSES',
                                    expenseAmount: amount,
                                    description: natureOfIncome,
                                };
                            }

                            // Function to filter and map OtherIncDtls to create expenses
                            function getExpenses(OtherIncDtls?, TotExciseCustomsVAT?) {
                                const expenses = [];

                                if (TotExciseCustomsVAT > 0) {
                                    expenses.push({
                                        hasExpense: false,
                                        expenseType: 'OTHER_EXPENSES',
                                        expenseAmount: TotExciseCustomsVAT,
                                        description: 'TotExciseCustomsVAT',
                                    });
                                }

                                if (OtherIncDtls) {
                                    const filteredExpenses = OtherIncDtls.filter(
                                        (element) => element.Amount > 0
                                    ).map((item) =>
                                        createExpenseObject(item.Amount, item.NatureOfIncome)
                                    );
                                    expenses.push(...filteredExpenses);
                                }

                                return expenses;
                            }

                            const nonSpecIncome = {
                                id: null,
                                businessType: 'NONSPECULATIVEINCOME',
                                totalgrossProfitFromNonSpeculativeIncome:
                                    TradingAc?.TotRevenueFrmOperations -
                                    (TradingAc?.OpngStckOfFinishedStcks +
                                        TradingAc?.Purchases -
                                        TradingAc?.ClsngStckOfFinishedStcks),
                                netProfitfromNonSpeculativeIncome:
                                    TradingAc?.TotRevenueFrmOperations -
                                    (TradingAc?.OpngStckOfFinishedStcks +
                                        TradingAc?.Purchases -
                                        TradingAc?.ClsngStckOfFinishedStcks),
                                incomes: [
                                    {
                                        id: null,
                                        incomeType: null,
                                        index: 0,
                                        hasEdit: false,
                                        brokerName: null,
                                        turnOver: TradingAc?.TotRevenueFrmOperations,
                                        grossProfit:
                                            TradingAc?.TotRevenueFrmOperations -
                                            (TradingAc?.OpngStckOfFinishedStcks +
                                                TradingAc?.Purchases -
                                                TradingAc?.ClsngStckOfFinishedStcks),
                                        finishedGoodsClosingStock:
                                            TradingAc?.ClsngStckOfFinishedStcks,
                                        finishedGoodsOpeningStock:
                                            TradingAc?.OpngStckOfFinishedStcks,
                                        purchase: TradingAc?.Purchases,
                                        netIncome:
                                            TradingAc?.TotRevenueFrmOperations -
                                            (TradingAc?.OpngStckOfFinishedStcks +
                                                TradingAc?.Purchases -
                                                TradingAc?.ClsngStckOfFinishedStcks),
                                        cogs:
                                            TradingAc?.OpngStckOfFinishedStcks +
                                            TradingAc?.Purchases -
                                            TradingAc?.ClsngStckOfFinishedStcks,
                                        tradingExpense: null,
                                    },
                                ],
                                expenses:
                                    TradingAc?.OtherIncDtls ||
                                        TradingAc?.DirectExpensesTotal > 0 ||
                                        TradingAc?.DutyTaxPay?.ExciseCustomsVAT
                                            ?.TotExciseCustomsVAT > 0
                                        ? getExpenses(
                                            TradingAc?.OtherIncDtls,
                                            TradingAc?.DutyTaxPay?.ExciseCustomsVAT
                                                ?.TotExciseCustomsVAT
                                        )
                                        : [],
                            };
                            ITR_Obj.business.profitLossACIncomes.push(nonSpecIncome);
                            ITR_Obj.systemFlags.hasFutureOptionsIncome = true;
                        }
                    }
                }

                // speculative income
                {
                    if (this.ITR_Type === 'ITR3') {
                        const profitAndLossAc =
                            ItrJSON[this.ITR_Type]?.PARTA_PL;
                        if (
                            profitAndLossAc?.NetIncomeFrmSpecActivity &&
                            profitAndLossAc?.NetIncomeFrmSpecActivity !== 0
                        ) {
                            const speculativeIncome = {
                                id: null,
                                incomeType: 'SPECULATIVEINCOME',
                                businessType: null,
                                incomes: [
                                    {
                                        id: null,
                                        brokerName: null,
                                        incomeType: null,
                                        hasEdit: false,
                                        index: 0,
                                        turnOver: profitAndLossAc?.TurnverFrmSpecActivity,
                                        grossProfit: profitAndLossAc?.GrossProfit,
                                        expenditure: profitAndLossAc?.Expenditure,
                                        netIncome: profitAndLossAc?.NetIncomeFrmSpecActivity,
                                    },
                                ],
                            };

                            ITR_Obj.business.profitLossACIncomes.push(
                                speculativeIncome
                            );
                            ITR_Obj.systemFlags.hasFutureOptionsIncome = true;
                        }
                    }
                }

                // setting relief
                {
                    {
                        //section89
                        if (
                            ItrJSON[this.ITR_Type]?.PartB_TTI?.ComputationOfTaxLiability
                                ?.TaxRelief?.Section89
                        ) {
                            ITR_Obj.section89 =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.PartB_TTI?.ComputationOfTaxLiability?.TaxRelief?.Section89;
                        }

                        if (
                            ItrJSON[this.ITR_Type]?.PartB_TTI?.ComputationOfTaxLiability
                                ?.TaxRelief?.Section90
                        ) {
                            ITR_Obj.section90 =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.PartB_TTI?.ComputationOfTaxLiability?.TaxRelief?.Section90;
                        }

                        if (
                            ItrJSON[this.ITR_Type]?.PartB_TTI?.ComputationOfTaxLiability
                                ?.TaxRelief?.Section91
                        ) {
                            ITR_Obj.section91 =
                                ItrJSON[
                                    this.ITR_Type
                                ]?.PartB_TTI?.ComputationOfTaxLiability?.TaxRelief?.Section91;
                        }

                    }
                }
            }
        }

        return ITR_Obj;
    }

    localDate: Date;
    utcDate: string;
    parseAndFormatDate(date: any): any {
        this.localDate = this.parseDate(date);
        this.utcDate = formatDate(
            this.localDate,
            'yyyy-MM-ddTHH:mm:ss.SSSZ',
            'en-US',
            '+0000'
        );
        return new Date(this.utcDate);
    }

    parseDate(dateStr: string) {
        const parts = dateStr?.split('-');
        return new Date(+parts?.[0], +parts[1] - 1, +parts[2]);
    }

    updateSalaryAllowances(ItrJSON: any, ITR_Obj: ITR_JSON, salaryAllowances, ITR_Type) {
        // create a mapping object to map the JSON names to the new names of ITR Object
        const mapping = {
            '10(5)': 'LTA',
            '10(6)': 'REMUNERATION_REC',
            '10(7)': 'US_10_7',
            '10(10)': 'GRATUITY',
            '10(10A)': 'COMMUTED_PENSION',
            '10(10AA)': 'LEAVE_ENCASHMENT',
            '10(10B)(i)': 'FIRST_PROVISO',
            '10(10B)(ii)': 'SECOND_PROVISO',
            '10(10C)': 'COMPENSATION_ON_VRS',
            '10(10CC)': 'NON_MONETARY_PERQUISITES',
            '10(13A)': 'HOUSE_RENT',
            '10(14)(i)': 'US_10_14I',
            '10(14)(ii)': 'US_10_14II',
            '10(14)(i)(115BAC)': 'ANY_OTHER',
            '10(14)(ii)(115BAC)': 'ANY_OTHER',
            EIC: 'ANY_OTHER',
            OTH: 'ANY_OTHER',
        };

        if (salaryAllowances) {
            let salaryAllowancesDetail;

            // finding and storing the object with the same NatureDesc (type) present in JSON Object
            for (let i = 0; i < salaryAllowances.length; i++) {
                const type = salaryAllowances[i];
                // use the mapping object to get the new name for the current type
                const newName = mapping[type];
                // For all the salaryAllowances mapping
                {
                    try {
                        //FOR ITR2
                        if (this.ITR_Type === 'ITR2') {
                            salaryAllowancesDetail = ItrJSON[
                                ITR_Type
                            ].ScheduleS?.AllwncExemptUs10?.AllwncExemptUs10Dtls.find(
                                (salaryAllowances) => salaryAllowances.SalNatureDesc === type
                            );
                        } else {
                            salaryAllowancesDetail = ItrJSON[this.ITR_Type][
                                this.ITR14_IncomeDeductions
                            ]?.AllwncExemptUs10?.AllwncExemptUs10Dtls.find(
                                (salaryAllowances) => salaryAllowances.SalNatureDesc === type
                            );
                        }

                        // finding and storing the object with the same NatureDesc (type) present in ITR Object
                        if (newName !== 'ANY_OTHER') {
                            const itrObjSalaryAllowancesDetail =
                                ITR_Obj.employers[0].allowance.find(
                                    (itrObjSalaryAllowances) =>
                                        itrObjSalaryAllowances.allowanceType === newName
                                );

                            // If same type is not found in the ITR Object then show an error message
                            if (!itrObjSalaryAllowancesDetail) {
                                console.log(
                                    `Salary Allowance - ${newName} Income was not found in the ITR Object`
                                );
                            }

                            itrObjSalaryAllowancesDetail.exemptAmount =
                                salaryAllowancesDetail.SalOthAmount;
                        }
                    } catch (error) {
                        console.log(`Error occurred for type ${type}: `, error);
                        // this.utilsService.showSnackBar(`Error occurred for type ${type}`);
                    }
                }
            }

            //FOR ANY OTHER
            {
                const itrObjSalaryAnyOthAllowance =
                    ITR_Obj.employers[0]?.allowance.find(
                        (itrObjSalaryOtherAllowances) =>
                            itrObjSalaryOtherAllowances.allowanceType === 'ANY_OTHER'
                    );
                console.log(itrObjSalaryAnyOthAllowance, 'itrObjSalaryAnyOthAllowance');

                const anyOtherFields = [
                    ...Object.values(ITR_Obj.employers[0]?.allowance)
                        .filter((allowance) => allowance.allowanceType !== 'ANY_OTHER')
                        .map((allowance) => allowance?.exemptAmount),
                ];
                console.log('anyOtherFields ==>>', anyOtherFields);

                // sum the values in the anyOtherFields array
                const totalAnyOtherAmount = anyOtherFields.reduce(
                    (acc, val) => acc + val,
                    0
                );
                console.log('totalAnyOtherAmount ==>>', totalAnyOtherAmount);

                if (
                    this.regime === 'OLD' &&
                    (this.ITR_Type === 'ITR1' || this.ITR_Type === 'ITR4')
                ) {
                    itrObjSalaryAnyOthAllowance.exemptAmount =
                        ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions]
                            ?.AllwncExemptUs10?.TotalAllwncExemptUs10 - totalAnyOtherAmount;
                }

                if (
                    this.regime === 'OLD' &&
                    (this.ITR_Type === 'ITR2' || this.ITR_Type === 'ITR3')
                ) {
                    itrObjSalaryAnyOthAllowance.exemptAmount =
                        ItrJSON[this.ITR_Type]?.ScheduleS?.AllwncExtentExemptUs10 -
                        totalAnyOtherAmount;
                }
            }

            const allAllowance = ITR_Obj.employers[0]?.allowance?.find(
                (itrObjSalaryOtherAllowances) =>
                    itrObjSalaryOtherAllowances.allowanceType === 'ALL_ALLOWANCES'
            );

            if (allAllowance) {
                allAllowance.exemptAmount =
                    ItrJSON[this.ITR_Type][
                        this.ITR14_IncomeDeductions
                    ]?.AllwncExemptUs10?.TotalAllwncExemptUs10;
            }
            // this.allowanceDetails23 = this.ITR_Obj.employers[0].allowance;
            // console.log(this.allowanceDetails23, 'allowanceDetails23');
            // return this.allowanceDetails23;
        }
    }

    // Looping over exemptIncome and checking all types at once
    updateExemptIncomes(ItrJSON: any, ITR_Obj: ITR_JSON, exemptIncomeTypes, ITR_Type) {
        for (let i = 0; i < exemptIncomeTypes.length; i++) {
            const type = exemptIncomeTypes[i];
            try {
                // finding and storing the object with the same NatureDesc (type) present in JSON Object
                let JsonDetail = null;
                if (this.ITR_Type === 'ITR1') {
                    JsonDetail = ItrJSON[
                        ITR_Type
                    ].ITR1_IncomeDeductions?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls?.find(
                        (jsonAllowance) => jsonAllowance.NatureDesc === type
                    );
                } else if (this.ITR_Type === 'ITR4') {
                    JsonDetail = ItrJSON[
                        ITR_Type
                    ]?.TaxExmpIntIncDtls?.OthersInc?.OthersIncDtls?.find(
                        (jsonAllowance) => jsonAllowance.NatureDesc === type
                    );
                } else if (this.ITR_Type === 'ITR2' || this.ITR_Type === 'ITR3') {
                    JsonDetail = ItrJSON[
                        ITR_Type
                    ]?.ScheduleEI?.OthersInc?.OthersIncDtls?.find(
                        (jsonAllowance) => jsonAllowance.NatureDesc === type
                    );
                }

                if (JsonDetail && JsonDetail.NatureDesc !== 'OTH') {
                    if (JsonDetail && JsonDetail.NatureDesc) {
                        ITR_Obj.exemptIncomes.push({
                            natureDesc: JsonDetail.NatureDesc,
                            amount: JsonDetail.OthAmount,
                            othNatOfInc: null,
                        });
                    }
                }
            } catch (error) {
                console.log(`Error occurred for type ${type}: `, error);
            }
        }

        //FOR EXEMPT INCOME - OTHERS
        {
            // getting all the exemptincome in itrObject
            const totalExemptIncomesExceptOTH = [
                ...Object.values(ITR_Obj.exemptIncomes)
                    .filter((other) => other.natureDesc !== 'OTH')
                    .map((other) => other.amount),
            ];

            // sum the values in the totalExemptIncomesExceptOTH
            const totalOtherExemptAmount = totalExemptIncomesExceptOTH.reduce(
                (acc, val) => acc + val,
                0
            );

            if (this.ITR_Type === 'ITR1') {
                const othExemptDiff1 =
                    ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions]
                        ?.AllwncExemptUs10?.TotalAllwncExemptUs10 - totalOtherExemptAmount;
                if (othExemptDiff1 > 0) {
                    ITR_Obj.exemptIncomes.push({
                        natureDesc: 'OTH',
                        amount: othExemptDiff1,
                        othNatOfInc: null,
                    });
                }
            } else if (this.ITR_Type === 'ITR4') {
                const othExemptDiff4 =
                    ItrJSON[this.ITR_Type].TaxExmpIntIncDtls?.OthersInc
                        ?.OthersTotalTaxExe - totalOtherExemptAmount;
                if (othExemptDiff4 > 0) {
                    ITR_Obj.exemptIncomes.push({
                        natureDesc: 'OTH',
                        amount: othExemptDiff4,
                        othNatOfInc: null,
                    });
                }
            } else if (this.ITR_Type === 'ITR2') {
                const othExemptDiff2 =
                    ItrJSON[this.ITR_Type].ScheduleEI?.TotalExemptInc -
                    totalOtherExemptAmount;
                if (othExemptDiff2 > 0) {
                    ITR_Obj.exemptIncomes.push({
                        natureDesc: 'OTH',
                        amount: othExemptDiff2,
                        othNatOfInc: null,
                    });
                }
            } else if (this.ITR_Type === 'ITR3') {
                const othExemptDiff3 =
                    ItrJSON[this.ITR_Type].ScheduleEI?.TotalExemptInc -
                    totalOtherExemptAmount;
                if (othExemptDiff3 > 0) {
                    ITR_Obj.exemptIncomes.push({
                        natureDesc: 'OTH',
                        amount: othExemptDiff3,
                        othNatOfInc: null,
                    });
                }
            }
        }
    }

    // Mapping other income from json to itr Object
    updateOtherIncomes(ItrJSON: any, ITR_Obj: ITR_JSON, otherIncomes, ITR_Type) {
        if (this.ITR_Type === 'ITR1' || this.ITR_Type === 'ITR4') {
            // Savings Interest Income
            {
                // finding and storing the object in utility with the name SAV
                const JsonDetailSAV = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === 'SAV'
                );

                // if SAV is present in the utility json then pushing the below object in incomes array
                if (JsonDetailSAV) {
                    // Pushing SAV amount from utility in our ITR object
                    ITR_Obj.incomes.push({
                        incomeType: 'SAVING_INTEREST',
                        details: null,
                        amount: JsonDetailSAV.OthSrcOthAmount,
                        expenses: null,
                    });
                }
            }

            // Income from Interest from deposits income
            {
                // finding and storing the object in utility with the name IFD
                const JsonDetailIFD = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome?.OthSrcNatureDesc === 'IFD'
                );

                // if IFD is present in the utility json then pushing the below object in incomes array
                if (JsonDetailIFD) {
                    // Pushing IFD amount from utility in our ITR object
                    ITR_Obj.incomes.push({
                        incomeType: 'FD_RD_INTEREST',
                        details: null,
                        amount: JsonDetailIFD.OthSrcOthAmount,
                        expenses: null,
                    });
                }
            }

            // Income from Family Pension Income
            {
                // finding and storing the object in utility with the name SAV
                const JsonDetailFAP = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === 'FAP'
                );

                // if SAV is present in the utility json then pushing the below object in incomes array
                if (JsonDetailFAP) {
                    // Pushing SAV from utility in our ITR object
                    ITR_Obj.incomes.push({
                        incomeType: 'FAMILY_PENSION',
                        details: null,
                        amount: JsonDetailFAP.OthSrcOthAmount,
                        expenses: null,
                    });
                }
            }

            // Income from income tax refund
            {
                // finding and storing the object in utility with the name TAX
                const JsonDetailTAX = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === 'TAX'
                );

                // if TAX is present in the utility json then pushing the below object in incomes array
                if (JsonDetailTAX) {
                    // Pushing TAX amount from utility in our ITR object
                    ITR_Obj.incomes.push({
                        incomeType: 'TAX_REFUND_INTEREST',
                        details: null,
                        amount: JsonDetailTAX.OthSrcOthAmount,
                        expenses: null,
                    });
                }
            }

            // Income from any other - For other income we are taking OTH key only. Anything apart from these keys will not be parsed in ITR 1&4
            {
                // finding and storing the object in utility with the name OTH
                const JsonDetailOTH = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === 'OTH'
                );

                // if TAX is present in the utility json then pushing the below object in incomes array
                if (JsonDetailOTH) {
                    // Pushing TAX amount from utility in our ITR object
                    ITR_Obj.incomes.push({
                        incomeType: 'ANY_OTHER',
                        details: null,
                        amount: JsonDetailOTH.OthSrcOthAmount,
                        expenses: null,
                    });
                }
            }

            // Finding Dividend Income in utility JSON
            {
                const DIV = ItrJSON[this.ITR_Type][
                    this.ITR14_IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (jsonOtherIncome) => jsonOtherIncome?.OthSrcNatureDesc === 'DIV'
                );

                // getting dividend Incomes quarter wise
                if (DIV) {
                    const jsonDividendObj = DIV.DividendInc?.DateRange;

                    if (jsonDividendObj?.Upto15Of6) {
                        ITR_Obj.dividendIncomes?.push({
                            income: jsonDividendObj?.Upto15Of6,
                            date: '2022-04-28T18:30:00.000Z',
                            quarter: 1,
                        });
                    }

                    if (jsonDividendObj?.Upto15Of9) {
                        ITR_Obj.dividendIncomes?.push({
                            income: jsonDividendObj?.Upto15Of9,
                            date: '2022-07-28T18:30:00.000Z',
                            quarter: 2,
                        });
                    }

                    if (jsonDividendObj?.Up16Of9To15Of12) {
                        ITR_Obj.dividendIncomes?.push({
                            income: jsonDividendObj?.Up16Of9To15Of12,
                            date: '2022-09-28T18:30:00.000Z',
                            quarter: 3,
                        });
                    }

                    if (jsonDividendObj?.Up16Of12To15Of3) {
                        ITR_Obj.dividendIncomes?.push({
                            income: jsonDividendObj.Up16Of12To15Of3,
                            date: '2022-12-28T18:30:00.000Z',
                            quarter: 4,
                        });
                    }

                    if (jsonDividendObj?.Up16Of3To31Of3) {
                        ITR_Obj.dividendIncomes?.push({
                            income: jsonDividendObj?.Up16Of3To31Of3,
                            date: '2023-03-20T18:30:00.000Z',
                            quarter: 5,
                        });
                    }
                }
            }
        }
    }

    updateInvestments(ItrJSON: any, ITR_Obj: ITR_JSON, investments, ITR_Type) {
        console.log('investments', investments);
        let investmentNames: any;
        if (this.regime === 'OLD') {
            {
                investmentNames = investments.map((arr) => arr[0]);
                console.log('All investment Names => investmentNames', investmentNames);
                // setting 80dd names with this logic
                let disabilities80U = '';
                {
                    const disabilities80UArray = investments.find(
                        (disabilities80U) => disabilities80U[0] === 'Section80U'
                    );
                    if (disabilities80UArray && disabilities80UArray[1] > 75000) {
                        disabilities80U = 'SELF_WITH_SEVERE_DISABILITY';
                    } else if (
                        disabilities80UArray?.[1] < 75000
                        // &&
                        // disabilities80UArray[1] !== 0 &&
                        // disabilities80UArray[1] !== null
                    ) {
                        disabilities80U = 'SELF_WITH_DISABILITY';
                    } else if (
                        disabilities80UArray &&
                        (disabilities80UArray[1] === 0 || disabilities80UArray[1] === null)
                    ) {
                        disabilities80U = null;
                        // need to implement this later where the whole object is deleted if amount is 0.
                        // this.ITR_Obj.disabilities.splice(0, 1);
                    }
                }

                // setting 80dd names with this logic
                let disabilities80dd = '';
                {
                    const disabilities80ddArray = investments.find(
                        (disabilities80dd) => disabilities80dd[0] === 'Section80DD'
                    );

                    if (disabilities80ddArray && disabilities80ddArray[1] > 75000) {
                        disabilities80dd = 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY';
                    } else if (
                        disabilities80ddArray?.[1] < 75000
                        // &&
                        // disabilities80ddArray[1] !== 0 &&
                        // disabilities80ddArray[1] !== null
                    ) {
                        disabilities80dd = 'DEPENDENT_PERSON_WITH_DISABILITY';
                    } else if (
                        disabilities80ddArray &&
                        (disabilities80ddArray[1] === 0 ||
                            disabilities80ddArray[1] === null)
                    ) {
                        disabilities80dd = null;
                        // need to implement this later where the whole object is deleted if amount is 0.
                        // this.ITR_Obj.disabilities.splice(0, 2);
                    }
                }

                // setting 80dd names with this logic
                let disabilities80DDB = '';
                {
                    const disabilities80DDBArray = investments.find(
                        (disabilities80DDB) => disabilities80DDB[0] === 'Section80DDB'
                    );

                    if (disabilities80DDBArray && disabilities80DDBArray[1] > 40000) {
                        disabilities80DDB = 'SELF_OR_DEPENDENT_SENIOR_CITIZEN';
                    } else if (
                        disabilities80DDBArray?.[1] < 40000
                        // &&  disabilities80DDBArray[1] !== 0 &&
                        // disabilities80DDBArray[1] !== null
                    ) {
                        disabilities80DDB = 'SELF_OR_DEPENDENT';
                    } else if (
                        disabilities80DDBArray &&
                        (disabilities80DDBArray[1] ===
                            0 || disabilities80DDBArray[1] === null)
                    ) {
                        disabilities80DDB = null;
                        // need to implement this later where the whole object is deleted if amount is 0.
                        // this.ITR_Obj.disabilities.splice(0, 3);
                    }
                }

                //setting 80G fields
                let donations80G = '';
                {
                    // 100% donation
                    {
                        const Don100Percent =
                            ItrJSON[this.ITR_Type].Schedule80G?.Don100Percent
                                ?.DoneeWithPan;

                        const mapJsonToITRObjDon100Percent = ({
                            DoneeWithPanName,
                            DoneePAN,
                            AddressDetail: {
                                AddrDetail,
                                CityOrTownOrDistrict,
                                StateCode,
                                PinCode,
                            },
                            DonationAmtCash,
                            DonationAmtOtherMode,
                            DonationAmt,
                            EligibleDonationAmt,
                        }) => {
                            return {
                                id: null,
                                donationType: 'OTHER',
                                amountInCash: DonationAmtCash,
                                amountOtherThanCash: DonationAmtOtherMode,
                                amount: null,
                                identifier: '',
                                schemeCode: 'NAT_DEF_FUND_CEN_GOVT',
                                name: DoneeWithPanName,
                                address: AddrDetail,
                                city: CityOrTownOrDistrict,
                                pinCode: PinCode,
                                state: StateCode,
                                panNumber: DoneePAN,
                            };
                        };

                        if (Don100Percent) {
                            ITR_Obj.donations = Don100Percent?.map(
                                mapJsonToITRObjDon100Percent
                            );
                        }
                    }

                    // 50% donation
                    {
                        const Don50PercentNoApprReqd =
                            ItrJSON[this.ITR_Type].Schedule80G
                                ?.Don50PercentNoApprReqd?.DoneeWithPan;

                        const mapJsonToITRObjDon50Percent = ({
                            DoneeWithPanName,
                            DoneePAN,
                            AddressDetail: {
                                AddrDetail,
                                CityOrTownOrDistrict,
                                StateCode,
                                PinCode,
                            },
                            DonationAmtCash,
                            DonationAmtOtherMode,
                            DonationAmt,
                            EligibleDonationAmt,
                        }) => {
                            return {
                                id: null,
                                donationType: 'OTHER',
                                amountInCash: DonationAmtCash,
                                amountOtherThanCash: DonationAmtOtherMode,
                                amount: null,
                                identifier: '',
                                schemeCode: 'PM_DROUGHT_RELF_FND',
                                name: DoneeWithPanName,
                                address: AddrDetail,
                                city: CityOrTownOrDistrict,
                                pinCode: PinCode,
                                state: StateCode,
                                panNumber: DoneePAN,
                            };
                        };

                        if (Don50PercentNoApprReqd) {
                            const Don50Percent = Don50PercentNoApprReqd?.map(
                                mapJsonToITRObjDon50Percent
                            );

                            ITR_Obj.donations = [
                                ...ITR_Obj.donations,
                                ...Don50Percent,
                            ];
                        }
                    }

                    // 100% donation AGTI
                    {
                        const Don100PercentApprReqd =
                            ItrJSON[this.ITR_Type].Schedule80G
                                ?.Don100PercentApprReqd?.DoneeWithPan;

                        const mapJsonToITRObjDon100PercentAGTI = ({
                            DoneeWithPanName,
                            DoneePAN,
                            AddressDetail: {
                                AddrDetail,
                                CityOrTownOrDistrict,
                                StateCode,
                                PinCode,
                            },
                            DonationAmtCash,
                            DonationAmtOtherMode,
                            DonationAmt,
                            EligibleDonationAmt,
                        }) => {
                            return {
                                id: null,
                                donationType: 'OTHER',
                                amountInCash: DonationAmtCash,
                                amountOtherThanCash: DonationAmtOtherMode,
                                amount: null,
                                identifier: '',
                                schemeCode: 'GOVT_APPRVD_FAMLY_PLNG',
                                name: DoneeWithPanName,
                                address: AddrDetail,
                                city: CityOrTownOrDistrict,
                                pinCode: PinCode,
                                state: StateCode,
                                panNumber: DoneePAN,
                            };
                        };

                        if (Don100PercentApprReqd) {
                            const Don100PercentAGTI = Don100PercentApprReqd?.map(
                                mapJsonToITRObjDon100PercentAGTI
                            );

                            ITR_Obj.donations = [
                                ...ITR_Obj.donations,
                                ...Don100PercentAGTI,
                            ];
                        }
                    }

                    // 50% donation AGTI
                    {
                        const Don50PercentApprReqd =
                            ItrJSON[this.ITR_Type].Schedule80G?.Don50PercentApprReqd
                                ?.DoneeWithPan;

                        const mapJsonToITRObjDon50PercentAGTI = ({
                            DoneeWithPanName,
                            DoneePAN,
                            AddressDetail: {
                                AddrDetail,
                                CityOrTownOrDistrict,
                                StateCode,
                                PinCode,
                            },
                            DonationAmtCash,
                            DonationAmtOtherMode,
                            DonationAmt,
                            EligibleDonationAmt,
                        }) => {
                            return {
                                id: null,
                                donationType: 'OTHER',
                                amountInCash: DonationAmtCash,
                                amountOtherThanCash: DonationAmtOtherMode,
                                amount: null,
                                identifier: '',
                                schemeCode: 'FND_SEC80G',
                                name: DoneeWithPanName,
                                address: AddrDetail,
                                city: CityOrTownOrDistrict,
                                pinCode: PinCode,
                                state: StateCode,
                                panNumber: DoneePAN,
                            };
                        };

                        if (Don50PercentApprReqd) {
                            const Don50PercentAGTI = Don50PercentApprReqd?.map(
                                mapJsonToITRObjDon50PercentAGTI
                            );

                            ITR_Obj.donations = [
                                ...ITR_Obj.donations,
                                ...Don50PercentAGTI,
                            ];
                        }
                    }

                }

                // create a mapping object to map the JSON names to the new names of ITR Object
                const mapping = {
                    Section80C: 'ELSS',
                    Section80CCC: 'PENSION_FUND',
                    Section80CCDEmployeeOrSE: 'PS_EMPLOYEE',
                    Section80CCD1B: 'PENSION_SCHEME',
                    Section80CCDEmployer: 'PS_EMPLOYER',
                    Section80D: 'Section80D',
                    Section80DD: disabilities80dd,
                    Section80DDB: disabilities80DDB,
                    Section80E: 'EDUCATION',
                    Section80EE: 0, // hp is not saving hence not able to do this as of now 20/04/2023
                    Section80EEA: 0, // hp is not saving hence not able to do this as of now 20/04/2023
                    Section80EEB: 'ELECTRIC_VEHICLE',
                    Section80G: 0,
                    Section80GG: 'HOUSE_RENT_PAID',
                    Section80GGA: 0, // We don't have this in our BO
                    Section80GGC: 'POLITICAL',
                    Section80U: disabilities80U,
                    Section80TTA: 0, // Did not find this in itrObject
                    Section80TTB: 0, // Did not find this in itrObject
                    Section80RRB: 'ROYALTY_US_80RRB',
                    Section80QQB: 'ROYALTY_US_80QQB',
                };

                let expenseIndex = 0;
                for (let i = 0; i < investments.length; i++) {
                    const type = investmentNames[i];
                    {
                        // use the mapping object to get the new name for the current type
                        const newName = mapping[type];
                        if (newName === 'EDUCATION') {
                            if (!ITR_Obj.loans) {
                                ITR_Obj.loans = [];
                            }
                            ITR_Obj.loans.push({
                                details: '',
                                interestPaidPerAnum: investments[i][1],
                                loanAmount: 0,
                                loanType: newName,
                                name: '',
                                principalPaidPerAnum: 0,
                            });
                        }

                        if (newName === 'HOUSE_RENT_PAID') {
                            if (!ITR_Obj.expenses) {
                                ITR_Obj.expenses = [];
                            }
                            ITR_Obj.expenses.push({
                                amount: investments[i][1],
                                details: '',
                                expenseFor: 0,
                                expenseType: newName,
                                noOfMonths: 0,
                            });
                        }

                        if (newName === 'ELECTRIC_VEHICLE') {
                            ITR_Obj.expenses.push({
                                amount: investments[i][1],
                                details: '',
                                expenseFor: 0,
                                expenseType: newName,
                                noOfMonths: 0,
                            });
                        }

                        // pushing rrb and qqb in other incomes if those deductions are present under deductions
                        if (newName === 'ROYALTY_US_80RRB') {
                            ITR_Obj.incomes.push({
                                incomeType: 'ROYALTY_US_80RRB',
                                details: null,
                                amount: investments[i][1],
                                expenses: null,
                            });
                        }

                        if (newName === 'ROYALTY_US_80QQB') {
                            ITR_Obj.incomes.push({
                                incomeType: 'ROYALTY_US_80QQB',
                                details: null,
                                amount: investments[i][1],
                                expenses: null,
                            });
                        }

                        if (newName === disabilities80U) {
                            // finding the 80U array
                            const disability80U = ITR_Obj.disabilities[0];

                            // setting the field name in ITR Obj as per the new name
                            if (disability80U) {
                                disability80U.typeOfDisability = disabilities80U;
                                // setting the amount in ITR object
                                const disabilities80UAmount = (disability80U.amount =
                                    investments[i][1]);
                            }
                        }

                        if (newName === disabilities80dd) {
                            // finding the 80DD array
                            const disability80DD = ITR_Obj.disabilities[1];

                            // setting the field name in ITR Obj as per the new name
                            if (disability80DD) {
                                disability80DD.typeOfDisability = disabilities80dd;
                                // setting the amount in ITR object
                                const disabilities80DDAmount = (disability80DD.amount =
                                    investments[i][1]);
                            }
                        }

                        if (newName === disabilities80DDB) {
                            // finding the 80DDB array
                            const disability80DDB = ITR_Obj.disabilities[2];

                            // setting the field name in ITR Obj as per the new name
                            if (disability80DDB) {
                                disability80DDB.typeOfDisability = disabilities80DDB;
                                // setting the amount in ITR object
                                const disabilities80DDBAmount = (disability80DDB.amount =
                                    investments[i][1]);
                            }
                        }

                        if (newName === 'Section80D') {
                            // finding the Section80D array for self in itr object
                            const itrObjSelf80D = ITR_Obj.insurances?.find(
                                (healthInsurance) => healthInsurance.policyFor === 'DEPENDANT'
                            );

                            // finding the Section80D array for parents in itr object
                            const itrObjParents80D = ITR_Obj.insurances.find(
                                (healthInsurance) => healthInsurance.policyFor === 'PARENTS'
                            );

                            // finding the Section80D array for self in json
                            const json80DSeniorCitizen =
                                ItrJSON[
                                    this.ITR_Type
                                ].Schedule80D?.Sec80DSelfFamSrCtznHealth.hasOwnProperty(
                                    'SeniorCitizenFlag'
                                );

                            if (json80DSeniorCitizen) {
                                const json80DSeniorCitizenFlag =
                                    ItrJSON[this.ITR_Type].Schedule80D
                                        .Sec80DSelfFamSrCtznHealth?.SeniorCitizenFlag;

                                if (json80DSeniorCitizenFlag === 'Y') {
                                    // SELF HEALTH INSURANCE PREMIUM
                                    itrObjSelf80D.premium =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth?.HlthInsPremSlfFamSrCtzn;
                                    // SELF PREVENTIVE HEALTH CHECK UP
                                    itrObjSelf80D.preventiveCheckUp =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth?.PrevHlthChckUpSlfFamSrCtzn;
                                    // SELF MEDICAL EXPENDITURE
                                    itrObjSelf80D.medicalExpenditure = ItrJSON[this.ITR_Type].Schedule80D.Sec80DSelfFamSrCtznHealth?.MedicalExpSlfFamSrCtzn ?
                                        ItrJSON[this.ITR_Type].Schedule80D.Sec80DSelfFamSrCtznHealth?.MedicalExpSlfFamSrCtzn : 0;
                                } else {
                                    // SELF HEALTH INSURANCE PREMIUM
                                    itrObjSelf80D.premium =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth?.HealthInsPremSlfFam;
                                    // SELF PREVENTIVE HEALTH CHECK UP
                                    itrObjSelf80D.preventiveCheckUp =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth?.PrevHlthChckUpSlfFam;
                                }
                            }

                            // finding the Section80D array for parents in itr object
                            const json80DParentsSeniorCitizen = ItrJSON[
                                this.ITR_Type
                            ].Schedule80D?.Sec80DSelfFamSrCtznHealth.hasOwnProperty(
                                'ParentsSeniorCitizenFlag'
                            );

                            if (json80DParentsSeniorCitizen) {
                                ITR_Obj.systemFlags.hasParentOverSixty = true;
                                const json80DParentsSeniorCitizenFlag =
                                    ItrJSON[this.ITR_Type].Schedule80D
                                        .Sec80DSelfFamSrCtznHealth.ParentsSeniorCitizenFlag;

                                if (json80DParentsSeniorCitizenFlag === 'Y') {
                                    // PARENTS HEALTH INSURANCE - not working for seniorCitizen. Need to check later
                                    itrObjParents80D.premium =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth.HlthInsPremParentsSrCtzn;

                                    // PARENTS PREVENTIVE HEALTH CHECK UP - not working for seniorCitizen. Need to check later
                                    itrObjParents80D.preventiveCheckUp =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParentsSrCtzn;

                                    // PARENTS MEDICAL EXPENDITURE
                                    itrObjParents80D.medicalExpenditure = ItrJSON[this.ITR_Type].Schedule80D.Sec80DSelfFamSrCtznHealth.MedicalExpParentsSrCtzn ?
                                        ItrJSON[this.ITR_Type].Schedule80D.Sec80DSelfFamSrCtznHealth.MedicalExpParentsSrCtzn : 0;
                                } else {
                                    // PARENTS HEALTH INSURANCE - not working for seniorCitizen. Need to check later
                                    itrObjParents80D.premium =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth.HlthInsPremParents;

                                    // PARENTS PREVENTIVE HEALTH CHECK UP - not working for seniorCitizen. Need to check later
                                    itrObjParents80D.preventiveCheckUp =
                                        ItrJSON[
                                            this.ITR_Type
                                        ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParents;
                                }
                            } else {
                                ITR_Obj.systemFlags.hasParentOverSixty = false;
                            }
                        }

                        // For 80GGC POLITICAL donations
                        if (newName === 'POLITICAL') {
                            ITR_Obj?.donations?.push({
                                details: '',
                                donationType: 'POLITICAL',
                                amountInCash: 0,
                                amountOtherThanCash: investments[i][1],
                                identifier: '',
                                schemeCode: '',
                                name: '',
                                address: '',
                                city: '',
                                pinCode: '',
                                state: '',
                                panNumber: '',
                            });
                        }

                        // All the other Deductions here
                        try {
                            if (
                                newName === 'ELSS' ||
                                newName === 'PENSION_FUND' ||
                                newName === 'PS_EMPLOYEE' ||
                                newName === 'PS_EMPLOYER' ||
                                newName === 'PENSION_SCHEME'
                            ) {
                                if (investments[i][1] > 0) {
                                    ITR_Obj.investments.push({
                                        investmentType: newName,
                                        amount: investments[i][1],
                                        details: newName,
                                    });
                                }
                            }
                        } catch (error) {
                            console.log(`Error occurred for type ${type}: `, error);
                        }
                    }
                }
            }
        } else if (this.regime === 'NEW') {
            const employerPension80ccd2Json = investments.find((name) =>
                name.includes('Section80CCDEmployer')
            );

            if (employerPension80ccd2Json) {
                if (employerPension80ccd2Json[1] > 0) {
                    ITR_Obj.investments.push({
                        investmentType: 'PS_EMPLOYER',
                        amount: employerPension80ccd2Json[1],
                        details: 'PS_EMPLOYER',
                    });
                }
            }
        }
    }

    getPreviousItrs(userId, assessmentYear, financialYear) {
        let userProfile;
        this.utilsService.getUserProfile(userId).then((result: any) => {
            userProfile = result;
        });
        const param = `/cloud/file-info?currentPath=${userId}/ITR/${financialYear}/Original/ITR%20Filing%20Docs`; //+ this.userObj.userId;
        this.itrMsService.getMethod(param).subscribe(
            (result: any) => {
                if (Array.isArray(result)) {
                    result.forEach(doc => {
                        if (doc.documentTag === 'FILED_ITR_JSON') {
                            let signedUrl = environment.url + '/itr/cloud/download?filePath=' + doc.filePath;
                            this.httpClient.get(signedUrl).subscribe(
                                (jsonObject: any) => {
                                    console.log(jsonObject);
                                    let itrJson = this.utilsService.createEmptyJson(userProfile, 'ITR', assessmentYear, financialYear);
                                    let convertedItrJson = this.convertJsonToObject(jsonObject.ITR, itrJson, userProfile);
                                    if (convertedItrJson) {
                                        sessionStorage.setItem('PREV_ITR_JSON', JSON.stringify(convertedItrJson));
                                    }
                                    return convertedItrJson;
                                },
                                err => {
                                    console.log('Failed to download document');
                                    return null;
                                }
                            );
                        }
                    });
                }
            });
    }
}
