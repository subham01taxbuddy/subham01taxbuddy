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
import { update } from 'lodash';
import { formatDate } from '@angular/common';

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
  localDate: Date;
  utcDate: string;
  uploadedJson: any;
  ITR14_IncomeDeductions: string;
  regime: string;
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

  parseDate(dateStr: string) {
    const parts = dateStr.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  // setting correct format dates
  parseAndFormatDate(date: string): string {
    this.localDate = this.parseDate(date);
    this.utcDate = formatDate(
      this.localDate,
      'yyyy-MM-ddTHH:mm:ss.SSSZ',
      'en-US',
      '+0000'
    );

    return this.utcDate;
  }

  // getting all the allowances from json and assigning their amounts to the respective allowances field in our ITR Object
  updateSalaryAllowances(salaryAllowances, ITR_Type) {
    // console.log('salaryAllowances List =>', salaryAllowances, ITR_Type);

    // create a mapping object to map the JSON names to the new names of ITR Object
    const mapping = {
      '10(5)': 'LTA',
      '10(6)': 'ANY_OTHER',
      '10(7)': 'ANY_OTHER',
      '10(10)': 'GRATUITY',
      '10(10A)': 'COMMUTED_PENSION',
      '10(10AA)': 'LEAVE_ENCASHMENT',
      '10(10B)(i)': 'ANY_OTHER',
      '10(10B)(ii)': 'ANY_OTHER',
      '10(10C)': 'ANY_OTHER',
      '10(10CC)': 'ANY_OTHER',
      '10(13A)': 'HOUSE_RENT',
      '10(14)(i)': 'ANY_OTHER',
      '10(14)(ii)': 'ANY_OTHER',
      '10(14)(i)(115BAC)': 'ANY_OTHER',
      '10(14)(ii)(115BAC)': 'ANY_OTHER',
      EIC: 'ANY_OTHER',
      OTH: 'ANY_OTHER',
    };

    for (let i = 0; i < salaryAllowances.length; i++) {
      // console.log('i ==>>>>', i);
      const type = salaryAllowances[i];

      // For all the salaryAllowances mapping
      {
        // use the mapping object to get the new name for the current type
        const newName = mapping[type];

        try {
          // finding and storing the object with the same NatureDesc (type) present in JSON Object
          const salaryAllowancesDetail = this.uploadedJson[ITR_Type][
            this.ITR14_IncomeDeductions
          ].AllwncExemptUs10.AllwncExemptUs10Dtls.find(
            (salaryAllowances) => salaryAllowances.SalNatureDesc === type
          );
          // console.log('salaryAllowancesDetail====>>>>', salaryAllowancesDetail);

          if (salaryAllowancesDetail) {
            // TO DO (There are some issues in this) - create an array to store the values of the fields with the existing ANY_OTHER field and then add them and store them in others in itrObject
            if (newName === 'ANY_OTHER') {
              const anyOtherFields = [
                salaryAllowancesDetail.SalOthAmount,
                ...Object.values(this.ITR_Obj.employers[0].allowance)
                  .filter(
                    (allowance) => allowance.allowanceType === 'ANY_OTHER'
                  )
                  .map((allowance) => allowance.exemptAmount),
              ];
              // console.log('anyOtherFields ==>>', anyOtherFields);

              // sum the values in the anyOtherFields array
              const totalAnyOtherAmount = anyOtherFields.reduce(
                (acc, val) => acc + val,
                0
              );
              // console.log('totalAnyOtherAmount ==>>', totalAnyOtherAmount);

              // update the existing ANY_OTHER field in the ITR object with the total amount
              const itrObjSalaryAllowancesDetail =
                this.ITR_Obj.employers[0].allowance.find(
                  (itrObjSalaryAllowances) =>
                    itrObjSalaryAllowances.allowanceType === 'ANY_OTHER'
                );
              itrObjSalaryAllowancesDetail.exemptAmount = totalAnyOtherAmount;
            }

            // finding and storing the object with the same NatureDesc (type) present in ITR Object
            const itrObjSalaryAllowancesDetail =
              this.ITR_Obj.employers[0].allowance.find(
                (itrObjSalaryAllowances) =>
                  itrObjSalaryAllowances.allowanceType === newName
              );
            // console.log(
            //   'itrObjSalaryAllowancesDetail====>>>>',
            //   itrObjSalaryAllowancesDetail
            // );

            // If same type is not found in the ITR Object then show an error message
            if (!itrObjSalaryAllowancesDetail) {
              this.utilsService.showSnackBar(
                `Salary Allowance - ${newName} Income was not found in the ITR Object`
              );
            }

            itrObjSalaryAllowancesDetail.exemptAmount =
              salaryAllowancesDetail.SalOthAmount;
          }
        } catch (error) {
          console.log(`Error occurred for type ${type}: `, error);
          this.utilsService.showSnackBar(`Error occurred for type ${type}`);
        }
      }
    }
  }

  // Looping over exemptIncome and checking all types at once
  updateExemptIncomes(exemptIncomeTypes, ITR_Type) {
    for (let i = 0; i < exemptIncomeTypes.length; i++) {
      // console.log('exemptIncome i ==>>>>', i);
      const type = exemptIncomeTypes[i];

      try {
        // finding and storing the object with the same NatureDesc (type) present in JSON Object

        let JsonDetail = null;
        if (this.ITR_Type === 'ITR1') {
          JsonDetail = this.uploadedJson[
            ITR_Type
          ].ITR1_IncomeDeductions.ExemptIncAgriOthUs10.ExemptIncAgriOthUs10Dtls.find(
            (jsonAllowance) => jsonAllowance.NatureDesc === type
          );
          // console.log('JSONALLOWANCEDETAILS====>>>>', JsonDetail);
        } else if (this.ITR_Type === 'ITR4') {
          JsonDetail = this.uploadedJson[
            ITR_Type
          ].TaxExmpIntIncDtls.OthersInc.OthersIncDtls.find(
            (jsonAllowance) => jsonAllowance.NatureDesc === type
          );
          // console.log('JSONALLOWANCEDETAILS====>>>>', JsonDetail);
        }

        if (JsonDetail) {
          // finding and storing the object with the same NatureDesc (type) present in ITR Object
          const itrObjAllowance = this.ITR_Obj.exemptIncomes.find(
            (itrObjAllowance) => itrObjAllowance.natureDesc === type
          );
          // console.log('ITROBJALLOWANCEDETAILS====>>>>', itrObjAllowance);

          // If same type is not found in the ITR Object then show an error message
          if (!itrObjAllowance) {
            console.log(
              `Exempt Income - ${type} Income was not found in the ITR Object`
            );
          }

          if (
            JsonDetail &&
            itrObjAllowance &&
            JsonDetail.NatureDesc === itrObjAllowance.natureDesc
          ) {
            itrObjAllowance.amount = JsonDetail.OthAmount;
          } else {
            console.log(`Exempt Income - ${type} not found`);
          }
        }
      } catch (error) {
        console.log(`Error occurred for type ${type}: `, error);
        this.utilsService.showSnackBar(`Error occurred for type ${type}`);
      }
    }
  }

  // Taking the other income name from json and checking for those income in our itr object. If it exists then mapping jsons amount to itr object amount
  updateOtherIncomes(otherIncomes, ITR_Type) {
    // console.log('otherIncomes List =>', otherIncomes);
    // create a mapping object to map the JSON names to the new names of ITR Object
    const mapping = {
      SAV: 'SAVING_INTEREST',
      IFD: 'FD_RD_INTEREST',
      DIV: '', // we have a different object of dividend Income.It is taken care of below
      FAP: 'FAMILY_PENSION',
      TAX: 'TAX_REFUND_INTEREST',
      OTH: 'ANY_OTHER',
    };

    for (let i = 0; i < otherIncomes.length; i++) {
      // console.log('i ==>>>>', i);
      const type = otherIncomes[i];
      // For dividend Income mapping
      {
        const typeDiv = this.uploadedJson[ITR_Type][
          this.ITR14_IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === 'DIV'
        );
        if (typeDiv) {
          const itrObjectDividendQuarterList = this.ITR_Obj.dividendIncomes.map(
            (key) => key
          );
          const jsonDividendObj = typeDiv.DividendInc.DateRange;
          // console.log(
          //   'Dividend Income =>>>',
          //   typeDiv,
          //   itrObjectDividendQuarterList,
          //   jsonDividendObj
          // );

          if (jsonDividendObj.Upto15Of6) {
            const individualDividendIncomes = itrObjectDividendQuarterList.find(
              (dividendIncomes) => dividendIncomes.quarter === 1
            );
            individualDividendIncomes.income = jsonDividendObj.Upto15Of6;
          }

          if (jsonDividendObj.Upto15Of9) {
            const individualDividendIncomes = itrObjectDividendQuarterList.find(
              (dividendIncomes) => dividendIncomes.quarter === 2
            );
            individualDividendIncomes.income = jsonDividendObj.Upto15Of9;
          }

          if (jsonDividendObj.Up16Of9To15Of12) {
            const individualDividendIncomes = itrObjectDividendQuarterList.find(
              (dividendIncomes) => dividendIncomes.quarter === 3
            );
            individualDividendIncomes.income = jsonDividendObj.Up16Of9To15Of12;
          }
          if (jsonDividendObj.Up16Of12To15Of3) {
            const individualDividendIncomes = itrObjectDividendQuarterList.find(
              (dividendIncomes) => dividendIncomes.quarter === 4
            );
            individualDividendIncomes.income = jsonDividendObj.Up16Of12To15Of3;
          }
          if (jsonDividendObj.Up16Of3To31Of3) {
            const individualDividendIncomes = itrObjectDividendQuarterList.find(
              (dividendIncomes) => dividendIncomes.quarter === 5
            );
            individualDividendIncomes.income = jsonDividendObj.Up16Of3To31Of3;
          }
        }
      }

      // For all the other incomes mapping
      {
        // use the mapping object to get the new name for the current type
        const newName = mapping[type];

        try {
          // finding and storing the object with the same NatureDesc (type) present in JSON Object
          const JsonDetail = this.uploadedJson[ITR_Type][
            this.ITR14_IncomeDeductions
          ].OthersInc.OthersIncDtlsOthSrc.find(
            (jsonOtherIncome) => jsonOtherIncome.OthSrcNatureDesc === type
          );
          // console.log('JSONOTHERINCOME====>>>>', JsonDetail);

          if (JsonDetail) {
            // finding and storing the object with the same NatureDesc (type) present in ITR Object
            const itrObjOtherIncome = this.ITR_Obj.incomes.find(
              (itrObjOtherIncome) => itrObjOtherIncome.incomeType === newName
            );
            // console.log('ITROBJOTHERINCOME====>>>>', itrObjOtherIncome);

            // If same type is not found in the ITR Object then show an error message
            if (!itrObjOtherIncome) {
              console.log(
                `Exempt Income - ${type} Income was not found in the ITR Object`
              );
            }

            itrObjOtherIncome.amount = JsonDetail.OthSrcOthAmount;
          }
        } catch (error) {
          console.log(`Error occurred for type ${type}: `, error);
          this.utilsService.showSnackBar(`Error occurred for type ${type}`);
        }
      }
    }
  }

  updateInvestments(investments, ITR_Type) {
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
          // console.log('IndividualDisabilities80UArray=>', disabilities80UArray);

          if (disabilities80UArray[1] > 75000) {
            disabilities80U = 'SELF_WITH_SEVERE_DISABILITY';
          } else if (disabilities80UArray[1] < 75000) {
            disabilities80U = 'SELF_WITH_DISABILITY';
          } else if ((disabilities80UArray[1] = 0 || null)) {
            disabilities80U = null;
          }
          // console.log('IndividualDisabilities80UName', disabilities80U);
        }

        // setting 80dd names with this logic
        let disabilities80dd = '';
        {
          const disabilities80ddArray = investments.find(
            (disabilities80dd) => disabilities80dd[0] === 'Section80DD'
          );
          // console.log('IndividualDisabilities80ddArray=>', disabilities80ddArray);

          if (disabilities80ddArray[1] > 75000) {
            disabilities80dd = 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY';
          } else if (disabilities80ddArray[1] < 75000) {
            disabilities80dd = 'DEPENDENT_PERSON_WITH_DISABILITY';
          } else if ((disabilities80ddArray[1] = 0 || null)) {
            disabilities80dd = null;
          }
          // console.log('IndividualDisabilities80ddName', disabilities80dd);
        }

        // setting 80dd names with this logic
        let disabilities80DDB = '';
        {
          const disabilities80DDBArray = investments.find(
            (disabilities80DDB) => disabilities80DDB[0] === 'Section80DDB'
          );
          // console.log('IndividualDisabilities80DDBArray=>', disabilities80DDBArray);

          if (disabilities80DDBArray[1] > 40000) {
            disabilities80DDB = 'SELF_OR_DEPENDENT_SENIOR_CITIZEN';
          } else if (disabilities80DDBArray[1] < 40000) {
            disabilities80DDB = 'SELF_OR_DEPENDENT';
          } else if ((disabilities80DDBArray[1] = 0 || null)) {
            disabilities80DDB = null;
          }
          // console.log('IndividualDisabilities80DDBName', disabilities80DDB);
        }

        // create a mapping object to map the JSON names to the new names of ITR Object
        const mapping = {
          Section80C: 'ELSS', // done
          Section80CCC: 'PENSION_FUND', // done
          Section80CCDEmployeeOrSE: 'PS_EMPLOYEE', // done
          Section80CCD1B: 'PENSION_SCHEME', // done
          Section80CCDEmployer: 'PS_EMPLOYER', // done
          Section80D: 'Section80D',
          Section80DD: disabilities80dd, // done
          Section80DDB: disabilities80DDB, // done
          Section80E: 'EDUCATION', // done
          Section80EE: 0, // hp is not saving hence not able to do this as of now 20/04/2023
          Section80EEA: 0, // hp is not saving hence not able to do this as of now 20/04/2023
          Section80EEB: 'ELECTRIC_VEHICLE', // done
          Section80G: 0,
          Section80GG: 'HOUSE_RENT_PAID', // done
          Section80GGA: 0, // We don't have this in our BO
          Section80GGC: 'POLITICAL', // done
          Section80U: disabilities80U, // done
          Section80TTA: 0, // Did not find this in itrObject
          Section80TTB: 0, // Did not find this in itrObject
        };
        // console.log('updateInvestmentsMapping==>>', mapping);

        for (let i = 0; i < investments.length; i++) {
          // console.log('i ==>>>>', i);
          const type = investmentNames[i];
          {
            // use the mapping object to get the new name for the current type
            const newName = mapping[type];
            if (newName === 'EDUCATION') {
              const educationLoanDeduction =
                (this.ITR_Obj.loans[0].interestPaidPerAnum = investments[i][1]);
              // console.log('educationLoanDeduction', educationLoanDeduction);
            }

            if (newName === 'HOUSE_RENT_PAID') {
              const HouseRentDeduction80gg = (this.ITR_Obj.expenses[0].amount =
                investments[i][1]);
              // console.log('HOUSE_RENT_PAID', HouseRentDeduction80gg);
            }

            if (newName === 'ELECTRIC_VEHICLE') {
              const electricVehicleDeduction =
                (this.ITR_Obj.expenses[1].amount = investments[i][1]);
              // console.log('ELECTRIC_VEHICLE', electricVehicleDeduction);
            }

            if (newName === disabilities80U) {
              // console.log('disabilities80uName', disabilities80U);

              // finding the 80U array
              const disability80U = this.ITR_Obj.disabilities[0];
              // console.log('disability80UObjFound', disability80U);

              // setting the field name in ITR Obj as per the new name
              disability80U.typeOfDisability = disabilities80U;

              // setting the amount in ITR object
              const disabilities80UAmount = (disability80U.amount =
                investments[i][1]);
              // console.log('disabilities80UAmount', disabilities80UAmount);
            }

            if (newName === disabilities80dd) {
              // console.log('disabilities80ddName', disabilities80dd);

              // finding the 80DD array
              const disability80DD = this.ITR_Obj.disabilities[1];
              // console.log('disability80DDObjFound', disability80DD);

              // setting the field name in ITR Obj as per the new name
              disability80DD.typeOfDisability = disabilities80dd;

              // setting the amount in ITR object
              const disabilities80DDAmount = (disability80DD.amount =
                investments[i][1]);
              // console.log('disabilities80DDAmount', disabilities80DDAmount);
            }

            if (newName === disabilities80DDB) {
              // console.log('disabilities80DDBName', disabilities80DDB);

              // finding the 80DDB array
              const disability80DDB = this.ITR_Obj.disabilities[2];
              // console.log('disability80DDBObjFound', disability80DDB);

              // setting the field name in ITR Obj as per the new name
              disability80DDB.typeOfDisability = disabilities80DDB;

              // setting the amount in ITR object
              const disabilities80DDBAmount = (disability80DDB.amount =
                investments[i][1]);
              // console.log('disabilities80DDBAmount', disabilities80DDBAmount);
            }

            if (newName === 'Section80D') {
              // finding the Section80D array for self in itr object
              const itrObjSelf80D = this.ITR_Obj.insurances.find(
                (healthInsurance) => healthInsurance.policyFor === 'DEPENDANT'
              );
              // console.log('self80DObjFound', itrObjSelf80D);

              // finding the Section80D array for parents in itr object
              const itrObjParents80D = this.ITR_Obj.insurances.find(
                (healthInsurance) => healthInsurance.policyFor === 'PARENTS'
              );
              // console.log('itrObjParents80D', itrObjParents80D);

              // finding the Section80D array for self in json
              const json80DSeniorCitizen =
                this.uploadedJson[
                  this.ITR_Type
                ].Schedule80D.Sec80DSelfFamSrCtznHealth.hasOwnProperty(
                  'SeniorCitizenFlag'
                );

              if (json80DSeniorCitizen) {
                const json80DSeniorCitizenFlag =
                  this.uploadedJson[this.ITR_Type].Schedule80D
                    .Sec80DSelfFamSrCtznHealth.SeniorCitizenFlag;

                // console.log('json80DSeniorCitizenFlag', json80DSeniorCitizenFlag);

                if (json80DSeniorCitizenFlag === 'Y') {
                  // SELF HEALTH INSURANCE PREMIUM
                  itrObjSelf80D.premium =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.HlthInsPremSlfFamSrCtzn;
                  // SELF PREVENTIVE HEALTH CHECK UP
                  itrObjSelf80D.preventiveCheckUp =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpSlfFamSrCtzn;
                  // SELF MEDICAL EXPENDITURE
                  itrObjSelf80D.medicalExpenditure =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.MedicalExpSlfFamSrCtzn;
                } else {
                  // SELF HEALTH INSURANCE PREMIUM
                  itrObjSelf80D.premium =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.HealthInsPremSlfFam;
                  // SELF PREVENTIVE HEALTH CHECK UP
                  itrObjSelf80D.preventiveCheckUp =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpSlfFam;
                }
              }

              // finding the Section80D array for parents in itr object
              const json80DParentsSeniorCitizen = this.uploadedJson[
                this.ITR_Type
              ].Schedule80D.Sec80DSelfFamSrCtznHealth.hasOwnProperty(
                'ParentsSeniorCitizenFlag'
              );

              if (json80DParentsSeniorCitizen) {
                const json80DParentsSeniorCitizenFlag =
                  this.uploadedJson[this.ITR_Type].Schedule80D
                    .Sec80DSelfFamSrCtznHealth.ParentsSeniorCitizenFlag;

                // console.log(
                //   'json80DSeniorCitizenFlag',
                //   json80DParentsSeniorCitizenFlag
                // );

                if (json80DParentsSeniorCitizenFlag === 'Y') {
                  // PARENTS HEALTH INSURANCE - not working for seniorCitizen. Need to check later
                  itrObjParents80D.premium =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.HlthInsPremParentsSrCtzn;

                  // PARENTS PREVENTIVE HEALTH CHECK UP - not working for seniorCitizen. Need to check later
                  itrObjParents80D.preventiveCheckUp =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParentsSrCtzn;

                  // PARENTS MEDICAL EXPENDITURE
                  itrObjParents80D.medicalExpenditure =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.MedicalExpParentsSrCtzn;
                } else {
                  // PARENTS HEALTH INSURANCE - not working for seniorCitizen. Need to check later
                  itrObjParents80D.premium =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.HlthInsPremParents;

                  // PARENTS PREVENTIVE HEALTH CHECK UP - not working for seniorCitizen. Need to check later
                  itrObjParents80D.preventiveCheckUp =
                    this.uploadedJson[
                      this.ITR_Type
                    ].Schedule80D.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParents;
                }
              }
            }

            // There is some issue in this, need to fix later
            // if (newName === 'POLITICAL') {
            //   const donation80ggc = this.ITR_Obj.donations.find(
            //     (donation) => donation.donationType === 'POLITICAL'
            //   );

            //   const donation80ggcAmount = (donation80ggc.amountOtherThanCash =
            //     investments[i][1]);
            //   console.log('POLITICAL80GGC', donation80ggcAmount);
            // }

            // All the other Deductions here
            try {
              // finding and storing the object with the same NatureDesc (type) present in JSON Object
              const jsonInvestmentDetails = investmentNames.find(
                (investmentDetail) => investmentDetail === type
              );
              // console.log('jsonInvestmentDetails====>>>>', jsonInvestmentDetails);

              if (jsonInvestmentDetails) {
                {
                  // finding and storing the object with the same NatureDesc (type) present in ITR Object
                  const jsonItrObjInvestments = this.ITR_Obj.investments.find(
                    (jsonItrObjInvestment) =>
                      jsonItrObjInvestment.investmentType === newName
                  );
                  // console.log(
                  //   'jsonItrObjInvestments====>>>>',
                  //   jsonItrObjInvestments
                  // );

                  // If same type is not found in the ITR Object then show an error message
                  if (!jsonItrObjInvestments) {
                    console.log(
                      `Exempt Income - ${newName} Income was not found in the ITR Object`
                    );
                  }

                  jsonItrObjInvestments.amount = investments[i][1];
                  // console.log('setting amounts===>', investments[i][1]);
                }
              }
            } catch (error) {
              console.log(`Error occurred for type ${type}: `, error);
              if (
                error.message.includes(`Error handling ${mapping[newName]}`)
              ) {
              } else {
                this.utilsService.showSnackBar(
                  `Error occurred for type ${type}`
                );
              }
            }
          }
        }
      }
    } else if (this.regime === 'NEW') {
      console.log(investments, 'something');
      const employerPension80ccd2 = this.ITR_Obj.investments.find(
        (jsonItrObjInvestment) =>
          jsonItrObjInvestment.investmentType === 'PS_EMPLOYER'
      );
      console.log('employerPension80ccd2', employerPension80ccd2);

      const employerPension80ccd2Json = investments.find((name) =>
        name.includes('Section80CCDEmployer')
      );

      console.log('employerPension80ccd2Json', employerPension80ccd2Json);

      employerPension80ccd2.amount = employerPension80ccd2Json[1];
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

        this.uploadedJson = JSONData.ITR;
        this.mapItrJson(this.uploadedJson);
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

    // Setting the ITR Type in ITR Object and updating the ITR_Type and incomeDeductions key
    {
      if (ItrJSON.hasOwnProperty('ITR1')) {
        this.ITR_Obj.itrType = '1';
        this.ITR_Type = 'ITR1';
        this.ITR14_IncomeDeductions = 'ITR1_IncomeDeductions';
      } else if (ItrJSON.hasOwnProperty('ITR2')) {
        this.ITR_Obj.itrType = '2';
        this.ITR_Type = 'ITR2';
      } else if (ItrJSON.hasOwnProperty('ITR3')) {
        this.ITR_Obj.itrType = '3';
        this.ITR_Type = 'ITR3';
      } else if (ItrJSON.hasOwnProperty('ITR4')) {
        this.ITR_Obj.itrType = '4';
        this.ITR_Type = 'ITR4';
        this.ITR14_IncomeDeductions = 'IncomeDeductions';
      }
    }

    // Setting the assessmentYear
    {
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
    }

    //Finding the way
    // console.log(
    //   'Checking the JSON',
    //   ItrJSON[this.ITR_Type].PersonalInfo.AadhaarCardNo
    // );

    // SOME DEDUCTION FIELDS, HP CODE UPDATE
    if (this.ITR_Type === 'ITR1' || this.ITR_Type === 'ITR4') {
      // PERSONAL INFORMATION
      {
        // CUSTOMER PROFILE
        {
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

          if (ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegime === 'N') {
            this.regime = 'OLD';
            this.ITR_Obj.regime = this.regime;
          } else if (ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegime === 'Y') {
            this.regime = 'NEW';
            this.ITR_Obj.regime = this.regime;
          } else {
            this.utilsService.showSnackBar(
              'Type of regime is not present in the uploaded JSON'
            );
          }

          if (this.ITR_Type === 'ITR4') {
            // everOptedNewRegime
            {
              //Setting 1st question as yes / no
              if (ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegime === 'Y') {
                this.ITR_Obj.everOptedNewRegime.everOptedNewRegime = true;
              } else {
                this.ITR_Obj.everOptedNewRegime.everOptedNewRegime = false;
              }

              // setting first question details
              {
                ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegimeDtls
                  .AssessmentYear
                  ? (this.ITR_Obj.everOptedNewRegime.assessmentYear =
                      ItrJSON[
                        this.ITR_Type
                      ].FilingStatus.NewTaxRegimeDtls.AssessmentYear)
                  : null;

                ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegimeDtls
                  .Form10IEDtls.Form10IEDate
                  ? (this.ITR_Obj.everOptedNewRegime.date =
                      this.parseAndFormatDate(
                        ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegimeDtls
                          .Form10IEDtls.Form10IEDate
                      ))
                  : null;

                ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegimeDtls
                  .Form10IEDtls.Form10IEAckNo
                  ? (this.ITR_Obj.everOptedNewRegime.acknowledgementNumber =
                      ItrJSON[
                        this.ITR_Type
                      ].FilingStatus.NewTaxRegimeDtls.Form10IEDtls.Form10IEAckNo)
                  : null;
              }

              // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
              sessionStorage.setItem(
                AppConstants.ITR_JSON,
                JSON.stringify(this.ITR_Obj)
              );
            }

            //  everOptedOutOfNewRegime
            {
              //Setting 1st question as yes / no
              if (
                ItrJSON[this.ITR_Type].FilingStatus.OptedOutNewTaxRegime === 'Y'
              ) {
                this.ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime =
                  true;
              } else {
                this.ITR_Obj.everOptedOutOfNewRegime.everOptedOutOfNewRegime =
                  false;
              }

              // setting second question details
              {
                ItrJSON[this.ITR_Type].FilingStatus.OptedOutNewTaxRegimeDtls
                  .AssessmentYear
                  ? (this.ITR_Obj.everOptedOutOfNewRegime.assessmentYear =
                      ItrJSON[
                        this.ITR_Type
                      ].FilingStatus.OptedOutNewTaxRegimeDtls.AssessmentYear)
                  : null;

                ItrJSON[this.ITR_Type].FilingStatus.OptedOutNewTaxRegimeDtls
                  .Form10IEDtls.Form10IEDate
                  ? (this.ITR_Obj.everOptedOutOfNewRegime.date =
                      this.parseAndFormatDate(
                        ItrJSON[this.ITR_Type].FilingStatus
                          .OptedOutNewTaxRegimeDtls.Form10IEDtls.Form10IEDate
                      ))
                  : null;

                ItrJSON[this.ITR_Type].FilingStatus.OptedOutNewTaxRegimeDtls
                  .Form10IEDtls.Form10IEAckNo
                  ? (this.ITR_Obj.everOptedOutOfNewRegime.acknowledgementNumber =
                      ItrJSON[
                        this.ITR_Type
                      ].FilingStatus.OptedOutNewTaxRegimeDtls.Form10IEDtls.Form10IEAckNo)
                  : null;
              }

              // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
              sessionStorage.setItem(
                AppConstants.ITR_JSON,
                JSON.stringify(this.ITR_Obj)
              );
            }

            // optionForCurrentAY
            this.ITR_Obj.optionForCurrentAY.currentYearRegime =
              ItrJSON[this.ITR_Type].FilingStatus.NewTaxRegime;

            ItrJSON[this.ITR_Type].FilingStatus.Form10IEDate
              ? (this.ITR_Obj.optionForCurrentAY.date = this.parseAndFormatDate(
                  ItrJSON[this.ITR_Type].FilingStatus.Form10IEDate
                ))
              : null;
            ItrJSON[this.ITR_Type].FilingStatus.Form10IEAckNo
              ? (this.ITR_Obj.optionForCurrentAY.acknowledgementNumber =
                  ItrJSON[this.ITR_Type].FilingStatus.Form10IEAckNo)
              : null;

            // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_Obj)
            );
          }

          // HAVE TO SET THE RES STATUS MANUALLY AS THIS KEY IS NOT AVAILABLE IN JSON AS OF 14/04/23 AND ONLY "RESIDENT" ARE ALLOWED UNDER ITR1 & ITR4
          this.ITR_Obj.residentialStatus = 'RESIDENT';

          // Updating employer categaory based on the key that we get from json in our itr obj employer category
          {
            let jsonEmployerCategory =
              ItrJSON[this.ITR_Type].PersonalInfo?.EmployerCategory;

            // console.log('Employe Category in JSON ==>>', jsonEmployerCategory);

            if (jsonEmployerCategory === 'CGOV') {
              this.ITR_Obj.employerCategory = 'CENTRAL_GOVT';
            } else if (jsonEmployerCategory === 'SGOV') {
              this.ITR_Obj.employerCategory = 'GOVERNMENT';
            } else if (jsonEmployerCategory === 'PSU') {
              this.ITR_Obj.employerCategory = 'PRIVATE';
            } else if (jsonEmployerCategory === 'PE') {
              this.ITR_Obj.employerCategory = 'PE';
            } else if (jsonEmployerCategory === 'PESG') {
              this.ITR_Obj.employerCategory = 'PESG';
            } else if (jsonEmployerCategory === 'PEPS') {
              this.ITR_Obj.employerCategory = 'PEPS';
            } else if (jsonEmployerCategory === 'PEO') {
              this.ITR_Obj.employerCategory = 'PENSIONERS';
            } else if (jsonEmployerCategory === 'OTH') {
              this.ITR_Obj.employerCategory = 'OTHER';
            } else if (jsonEmployerCategory === 'NA') {
              this.ITR_Obj.employerCategory = 'NA';
            }
          }

          this.ITR_Obj.aadharNumber =
            ItrJSON[this.ITR_Type].PersonalInfo.AadhaarCardNo;

          // Date is converted in the required format by BO which is utc we get normat date 29/01/2000 from JSON
          this.parseAndFormatDate(ItrJSON[this.ITR_Type].PersonalInfo.DOB);
          this.ITR_Obj.family[0].dateOfBirth = new Date(this.utcDate);
        }

        // PERSONAL DETAILS
        {
          // ADDRESS DETAILS -
          {
            this.ITR_Obj.address.pinCode =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.PinCode;
            this.ITR_Obj.address.country =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.CountryCode;
            this.ITR_Obj.address.state =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.StateCode;
            this.ITR_Obj.address.city =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.CityOrTownOrDistrict;
            this.ITR_Obj.address.flatNo =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.ResidenceNo;
            this.ITR_Obj.address.premisesName =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.ResidenceName;
            this.ITR_Obj.address.area =
              ItrJSON[this.ITR_Type].PersonalInfo.Address.RoadOrStreet +
              ItrJSON[this.ITR_Type].PersonalInfo.Address.LocalityOrArea;
          }
          //BANK DETAILS
          {
            const UtilityBankDetails =
              ItrJSON[this.ITR_Type].Refund.BankAccountDtls.AddtnlBankDetails;

            if (!UtilityBankDetails || UtilityBankDetails.length === 0) {
              this.ITR_Obj.bankDetails = [];
              this.utilsService.showSnackBar(
                'There are no bank details in the JSON that you have provided'
              );
            } else {
              this.ITR_Obj.bankDetails = UtilityBankDetails.map(
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
        }
      }

      // SALARY
      {
        if (ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].GrossSalary) {
          // Net salary Income
          this.ITR_Obj.employers[0].taxableIncome =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].IncomeFromSal;

          // Standard deduction of 50k
          this.ITR_Obj.employers[0].standardDeduction =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].DeductionUs16ia;

          //Total of exempt income (Salary allowances total)
          if (this.regime === 'OLD') {
            this.ITR_Obj.employers[0].exemptIncome =
              ItrJSON[this.ITR_Type][
                this.ITR14_IncomeDeductions
              ]?.AllwncExemptUs10.TotalAllwncExemptUs10;
          }

          // Salary 17(1)
          this.ITR_Obj.employers[0].salary[0].taxableAmount =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].Salary;

          // Salary 17(2)
          this.ITR_Obj.employers[0].perquisites[0].taxableAmount =
            ItrJSON[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].PerquisitesValue;

          // Salary 17(3)
          this.ITR_Obj.employers[0].profitsInLieuOfSalaryType[0].taxableAmount =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].ProfitsInSalary;

          // ALLOWANCES - getting all the available salary allowances keys from the uploaded Json and passing it to the updateSalaryAllowances function
          if (this.regime === 'OLD') {
            const availableSalaryAllowances = this.uploadedJson[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].AllwncExemptUs10.AllwncExemptUs10Dtls.map(
              (value) => value.SalNatureDesc
            );
            // console.log(
            //   'Available salary allowances in JSON => ',
            //   availableSalaryAllowances
            // );
            this.updateSalaryAllowances(
              availableSalaryAllowances,
              this.ITR_Type
            );
          }
          // DEDUCTIONS - PROFESSIONAL TAX
          this.ITR_Obj.employers[0].deductions[0].exemptAmount =
            ItrJSON[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].ProfessionalTaxUs16iii;

          // DEDUCTIONS - ENTERTAINMENT ALLOWANCE - PENDING
        } else {
          console.log(
            'SALARY INCOME',
            `ItrJSON[this.ITR_Type]${[
              this.ITR14_IncomeDeductions,
            ]}.GrossSalary does not exist`
          );
        }

        // {
        //More optimized code for future
        // const {
        //   IncomeFromSal,
        //   DeductionUs16ia,
        //   AllwncExemptUs10,
        //   Salary,
        //   PerquisitesValue,
        //   ProfitsInSalary,
        //   ProfessionalTaxUs16iii,
        // } = ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions];
        // this.ITR_Obj.employers[0].taxableIncome = IncomeFromSal;
        // this.ITR_Obj.employers[0].standardDeduction = DeductionUs16ia;
        // this.ITR_Obj.employers[0].exemptIncome =
        //   AllwncExemptUs10.TotalAllwncExemptUs10;
        // this.ITR_Obj.employers[0].salary[0].taxableAmount = Salary;
        // this.ITR_Obj.employers[0].perquisites[0].taxableAmount = PerquisitesValue;
        // this.ITR_Obj.employers[0].profitsInLieuOfSalaryType[0].taxableAmount =
        //   ProfitsInSalary;
        // this.ITR_Obj.employers[0].deductions[0].exemptAmount =
        //   ProfessionalTaxUs16iii;
        // }
      }

      // HOUSE PROPERTY
      {
        if (
          ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TotalIncomeOfHP
        ) {
          // House Property Type
          this.ITR_Obj.houseProperties[0].propertyType =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TypeOfHP === 'S'
              ? 'SOP'
              : ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TypeOfHP ===
                'L'
              ? 'LOP'
              : ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TypeOfHP ===
                'D'
              ? 'DLOP'
              : ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TypeOfHP;

          // There is no principal amount for itr1&4 in json. Hence, did not map it
          this.ITR_Obj.houseProperties[0].grossAnnualRentReceived =
            ItrJSON[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].GrossRentReceived;

          // Property Tax
          this.ITR_Obj.houseProperties[0].propertyTax =
            ItrJSON[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].TaxPaidlocalAuth;

          // Not able to map annualValue as we are not storing it in the ITRobject. Anyways, the annual value is being displayed properly on UI after parsing

          // Annual Value 30% / Exempt Income (in itr4 object)
          this.ITR_Obj.houseProperties[0].exemptIncome =
            ItrJSON[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].AnnualValue30Percent;

          // Interest on HP loan
          this.ITR_Obj.houseProperties[0].loans[0].interestAmount =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].InterestPayable;

          // Total Hp income
          this.ITR_Obj.houseProperties[0].taxableIncome =
            ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].TotalIncomeOfHP;

          //80EE AND 80EEA values need to be set as true if interest is above 2l. However, this has to be done from the sme's end. PENDING
        } else {
          console.log(
            'ITRJSON => ITR4 => HOUSE PROPERTY',
            `ItrJSON[this.ITR_Type]${[
              this.ITR14_IncomeDeductions,
            ]}.TotalIncomeOfHP`
          );
        }
      }

      // OTHER INCOMES
      {
        if (
          ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].OthersInc
            .OthersIncDtlsOthSrc
        ) {
          // All other incomes
          if (this.ITR_Obj.incomes) {
            //getting all the exempt income keys from the JSON and passing it to the updateOtherIncomes function
            const availableOtherIncomes = this.uploadedJson[this.ITR_Type][
              this.ITR14_IncomeDeductions
            ].OthersInc.OthersIncDtlsOthSrc.map(
              (value) => value.OthSrcNatureDesc
            );
            // console.log('OtherIncomes => ', availableOtherIncomes);
            this.updateOtherIncomes(availableOtherIncomes, this.ITR_Type);
          } else {
            console.log(
              'ITROBJECT => OTHERINCOMES',
              'this.ITR_Obj.incomes is empty'
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

        // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_Obj)
        );
        // console.log(this.ITR_Obj);
      }

      // EXEMPT INCOME
      {
        // console.log(
        //   'ExemptIncomeDebugging',
        //   this.ITR_Type,
        //   this.ITR14_IncomeDeductions
        // );
        if (this.ITR_Type === 'ITR1') {
          if (
            this.uploadedJson[this.ITR_Type].ITR1_IncomeDeductions
              .ExemptIncAgriOthUs10.ExemptIncAgriOthUs10Dtls
          ) {
            if (this.ITR_Obj.exemptIncomes) {
              //getting all the exempt income keys from the JSON and passing it to the updateExemptIncomes function
              const availableExemptIncomes = this.uploadedJson[
                this.ITR_Type
              ].ITR1_IncomeDeductions.ExemptIncAgriOthUs10.ExemptIncAgriOthUs10Dtls.map(
                (value) => value.NatureDesc
              );
              // console.log(`availableExemptIncomes`, availableExemptIncomes);

              this.updateExemptIncomes(availableExemptIncomes, this.ITR_Type);
            } else {
              console.log(
                'ITROBJECT => Exempt Incomes => ITR1 => Exempt Incomes There are no details under exemptIncomes in the ITR Obj'
              );
            }
          } else {
            console.log(
              'ITRJSON => EXEMPT INCOME DETAILS => ITR1',
              `ItrJSON[this.ITR_Type]${[
                this.ITR14_IncomeDeductions,
              ]}.ExemptIncAgriOthUs10.ExemptIncAgriOthUs10Dtls does not exist in JSON`
            );
          }
        }

        if (this.ITR_Type === 'ITR4') {
          if (
            this.uploadedJson[this.ITR_Type].TaxExmpIntIncDtls.OthersInc
              .OthersIncDtls
          ) {
            if (this.ITR_Obj.exemptIncomes) {
              //getting all the exempt income keys from the JSON and passing it to the updateExemptIncomes function
              const availableExemptIncomes = this.uploadedJson[
                this.ITR_Type
              ].TaxExmpIntIncDtls.OthersInc.OthersIncDtls.map(
                (value) => value.NatureDesc
              );
              // console.log(`availableExemptIncomes`, availableExemptIncomes);

              this.updateExemptIncomes(availableExemptIncomes, this.ITR_Type);
            } else {
              console.log(
                'ITROBJECT => Exempt Incomes => ITR4 => There are no details under exemptIncomes in the ITR Obj'
              );
            }
          } else {
            console.log(
              'ITRJSON => Exempt Incomes => ITR4 =>',
              `ItrJSON[this.ITR_Type]${[
                this.ITR14_IncomeDeductions,
              ]}.ExemptIncAgriOthUs10.ExemptIncAgriOthUs10Dtls does not exist in JSON`
            );
          }
        }

        // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_Obj)
        );
        // console.log('asdfghj', this.ITR_Obj, this.ITR_Obj.exemptIncomes);
      }

      // INVESTMENT AND DEDUCTIONS - 80GG, 80EE, 80EEA PENDING
      {
        if (
          ItrJSON[this.ITR_Type][this.ITR14_IncomeDeductions].DeductUndChapVIA
        ) {
          if (this.ITR_Obj.investments) {
            //getting all the exempt income keys from the JSON and passing it to the updateInvestments function
            const availableInvestments = Object.entries(
              this.uploadedJson[this.ITR_Type][this.ITR14_IncomeDeductions]
                .DeductUndChapVIA
            ).filter(([key, value]) => key !== 'TotalChapVIADeductions');

            // console.log('availableInvestments==>>', availableInvestments);

            this.updateInvestments(availableInvestments, this.ITR_Type);
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
        // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_Obj)
        );
        // console.log('asdfghj', this.ITR_Obj, this.ITR_Obj.exemptIncomes);
      }

      // TAXES PAID
      {
        //SALARY TDS
        {
          const jsonSalaryTDS =
            ItrJSON[this.ITR_Type].TDSonSalaries.TDSonSalary;
          // console.log('jsonSalaryTDS', jsonSalaryTDS);

          if (!jsonSalaryTDS || jsonSalaryTDS.length === 0) {
            this.ITR_Obj.taxPaid.onSalary = [];
            console.log(
              'There are no tax paid salary details in the JSON that you have provided'
            );
          } else {
            this.ITR_Obj.taxPaid.onSalary = jsonSalaryTDS.map(
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

          // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_Obj)
          );
          // console.log(this.ITR_Obj);
        }

        // OTHER THAN SALARY 16A - have to add two more options of CG, NA for headOfIncome option - not working for new itr4 json
        {
          const otherThanSalary16A =
            this.ITR_Type === 'ITR1'
              ? 'TDSonOthThanSal'
              : 'TDSonOthThanSalDtls';
          // console.log('otherThanSalary16A', otherThanSalary16A);

          const jsonOtherThanSalaryTDS =
            ItrJSON[this.ITR_Type].TDSonOthThanSals[otherThanSalary16A];
          // console.log('jsonOtherThanSalaryTDS', jsonOtherThanSalaryTDS);

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
              headOfIncome: this.ITR_Type === 'ITR4' ? HeadOfIncome : null,
            };
          };

          this.ITR_Obj.taxPaid.otherThanSalary16A =
            jsonOtherThanSalaryTDS.map(mapJsonToITRObj16A);

          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_Obj)
          );
          // console.log(this.ITR_Obj);
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

          this.ITR_Obj.taxPaid.otherThanSalary26QB =
            jsonOtherThanSalary26QBTDS3.map(mapJsonToITRObj);

          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_Obj)
          );
          // console.log(this.ITR_Obj);
        }

        // TCS - TAX COLLECTED AT SOURCE
        {
          const jsonTCS = ItrJSON[this.ITR_Type].ScheduleTCS.TCS;

          if (!jsonTCS || jsonTCS.length === 0) {
            this.ITR_Obj.taxPaid.otherThanSalary16A = [];
            console.log(
              'There are no TCS tax paid other than salary details in the JSON that you have provided'
            );
          } else {
            this.ITR_Obj.taxPaid.tcs = jsonTCS.map(
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
                    this.ITR_Type === 'ITR1' ? AmtTaxCollected : Amtfrom26AS,
                  totalTaxCollected: 0,
                  totalTcsDeposited: AmtTCSClaimedThisYear,
                  taxDeduction: null,
                };
              }
            );
          }

          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_Obj)
          );
          // console.log(this.ITR_Obj);
        }

        // Advance and self assessment tax
        {
          const taxPayment =
            this.ITR_Type === 'ITR1' ? 'TaxPayments' : 'ScheduleIT';
          // console.log('taxPayment', taxPayment);
          const jsonAdvSAT = ItrJSON[this.ITR_Type][taxPayment].TaxPayment;
          // console.log('jsonAdvSAT', jsonAdvSAT);

          if (!jsonAdvSAT || jsonAdvSAT.length === 0) {
            this.ITR_Obj.taxPaid.otherThanTDSTCS = [];
            console.log(
              'There are no advance taxes or self assessment taxes paid details in the JSON that you have provided'
            );
          } else {
            this.ITR_Obj.taxPaid.otherThanTDSTCS = jsonAdvSAT.map(
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

        // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_Obj)
        );
        // console.log(this.ITR_Obj);
      }

      // BUSINESS AND PROFESSION - PRESUMPTIVE INCOME
      {
        if (this.ITR_Type === 'ITR4') {
          // Business44AD - If json is uploaded more than once than this will keep on pushing the new objects. Need to write a code where it updates the existing one if the CODEAD/CODEADA is same
          {
            const NatOfBus44AD = ItrJSON[this.ITR_Type].ScheduleBP.NatOfBus44AD;
            const NatOfBus44ADLength = NatOfBus44AD.length;
            // console.log('NatOfBus44AD', NatOfBus44AD);

            const PersumptiveInc44AD =
              ItrJSON[this.ITR_Type].ScheduleBP.PersumptiveInc44AD;
            // console.log('PersumptiveInc44AD', PersumptiveInc44AD);

            NatOfBus44AD.forEach((obj) => {
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
                      PersumptiveInc44AD.GrsTrnOverBank / NatOfBus44ADLength,
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

              console.log('newObject', newObject);
              this.ITR_Obj.business.presumptiveIncomes.push(newObject);

              console.log(
                'businessDescriptionObject',
                businessDescriptionObject
              );
              this.ITR_Obj.business.businessDescription.push(
                businessDescriptionObject
              );
            });

            // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_Obj)
            );
          }

          // Profession44ADA - If json is uploaded more than once than this will keep on pushing new objects. Need to write a code where it updates the existing one if the CODEAD/CODEADA is same
          {
            const NatOfBus44ADA =
              ItrJSON[this.ITR_Type].ScheduleBP.NatOfBus44ADA;
            const NatOfBus44ADALength = NatOfBus44ADA.length;
            // console.log('NatOfBus44ADA', NatOfBus44ADA);

            const PersumptiveInc44ADA =
              ItrJSON[this.ITR_Type].ScheduleBP.PersumptiveInc44ADA;
            // console.log('PersumptiveInc44ADA', PersumptiveInc44ADA);

            NatOfBus44ADA.forEach((obj) => {
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
                      PersumptiveInc44ADA.GrsReceipt / NatOfBus44ADALength,
                    presumptiveIncome:
                      PersumptiveInc44ADA.TotPersumptiveInc44ADA /
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

              this.ITR_Obj.business.presumptiveIncomes.push(newObject);
              this.ITR_Obj.business.businessDescription.push(
                professionDescriptionObject
              );

              // console.log('newObjectProfession', newObject);
              // console.log(
              //   'businessDescriptionObject',
              //   professionDescriptionObject
              // );
            });

            // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_Obj)
            );
          }

          // Financial Particulars - Balance Sheet
          {
            this.ITR_Obj.business.financialParticulars.id = null;
            this.ITR_Obj.business.financialParticulars.grossTurnOverAmount =
              null;
            this.ITR_Obj.business.financialParticulars.membersOwnCapital =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.PartnerMemberOwnCapital;
            this.ITR_Obj.business.financialParticulars.securedLoans =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.SecuredLoans;
            this.ITR_Obj.business.financialParticulars.unSecuredLoans =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.UnSecuredLoans;
            this.ITR_Obj.business.financialParticulars.advances =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.Advances;
            this.ITR_Obj.business.financialParticulars.sundryCreditorsAmount =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.SundryCreditors;
            this.ITR_Obj.business.financialParticulars.otherLiabilities =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.OthrCurrLiab;
            this.ITR_Obj.business.financialParticulars.totalCapitalLiabilities =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.TotCapLiabilities;
            this.ITR_Obj.business.financialParticulars.fixedAssets =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.FixedAssets;
            this.ITR_Obj.business.financialParticulars.inventories =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.Inventories;
            this.ITR_Obj.business.financialParticulars.sundryDebtorsAmount =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.SundryDebtors;
            this.ITR_Obj.business.financialParticulars.balanceWithBank =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.BalWithBanks;
            this.ITR_Obj.business.financialParticulars.cashInHand =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.CashInHand;
            this.ITR_Obj.business.financialParticulars.loanAndAdvances =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.LoansAndAdvances;
            this.ITR_Obj.business.financialParticulars.otherAssets =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.OtherAssets;
            this.ITR_Obj.business.financialParticulars.totalAssets =
              ItrJSON[
                this.ITR_Type
              ].ScheduleBP.FinanclPartclrOfBusiness.TotalAssets;
            this.ITR_Obj.business.financialParticulars.investment = null;
            this.ITR_Obj.business.financialParticulars.GSTRNumber = null;
            this.ITR_Obj.business.financialParticulars.difference = null;

            // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_Obj)
            );
          }
        }
      }

      // DECLARATION
      {
        let capacity = '';
        if (ItrJSON[this.ITR_Type].Verification.Capacity === 'S') {
          capacity = 'Self';
        } else {
          this.utilsService.showErrorMsg(
            'Declaration => Verification => Capacity other than self is not allowed'
          );
        }
        {
          this.ITR_Obj.declaration.name =
            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerName;
          this.ITR_Obj.declaration.panNumber =
            ItrJSON[this.ITR_Type].Verification.Declaration.AssesseeVerPAN;
          this.ITR_Obj.declaration.place = '';
          this.ITR_Obj.declaration.capacity = capacity;
          this.ITR_Obj.declaration.childOf =
            ItrJSON[this.ITR_Type].Verification.Declaration.FatherName;
          this.ITR_Obj.declaration.place =
            ItrJSON[this.ITR_Type].Verification.Place;
        }

        // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_Obj)
        );
        // console.log(this.ITR_Obj);
      }

      // Have to remove this later and keep only one function that sets the whole JSON in the ITR object
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_Obj)
      );
      console.log(this.ITR_Obj);
    }

    if (this.ITR_Type === 'ITR2' || this.ITR_Type === 'ITR3') {
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
