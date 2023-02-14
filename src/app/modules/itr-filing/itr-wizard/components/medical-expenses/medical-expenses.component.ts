import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  DoCheck,
} from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { MatDialog } from '@angular/material/dialog';
declare let $: any;

@Component({
  selector: 'app-medical-expenses',
  templateUrl: './medical-expenses.component.html',
  styleUrls: ['./medical-expenses.component.scss'],
})
export class MedicalExpensesComponent implements OnInit, DoCheck {
  @Input() isEditMedicalExpenses = false;
  @Output() saveAndNext = new EventEmitter<any>();

  loading: boolean = false;
  investmentDeductionForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  userAge: number = 0;
  maxLimit80u = 75000;
  selected80u = '';
  maxLimit80dd = 75000;
  selected80dd = '';
  maxLimit80ddb = 40000;
  selected80ddb = '';

  constructor(
    public utilsService: UtilsService,
    private fb: FormBuilder,
    public matDialog: MatDialog
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    const self = this.ITR_JSON.family.filter(
      (item: any) => item.relationShipCode === 'SELF'
    );
    if (self instanceof Array && self.length > 0) {
      this.userAge = self[0].age;
    }
    if (!this.ITR_JSON.systemFlags?.hasParentOverSixty) {
      if (this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.hasParentOverSixty = false;
      } else {
        this.ITR_JSON.systemFlags = {
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
        };
      }
    }
  }

  ngOnInit(): void {
    // this.getItrDocuments();
    this.investmentDeductionForm = this.fb.group({
      selfPremium: [null, Validators.pattern(AppConstants.numericRegex)],
      selfPreventiveCheckUp: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)],
      ],
      selfMedicalExpenditure: [
        null,
        Validators.pattern(AppConstants.numericRegex),
      ],
      premium: [null, Validators.pattern(AppConstants.numericRegex)],
      preventiveCheckUp: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)],
      ],
      medicalExpenditure: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ggc: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eeb: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(150000)],
      ],
      us80u: [null, Validators.pattern(AppConstants.numericRegex)],
      us80dd: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ddb: [null, Validators.pattern(AppConstants.numericRegex)],
      hasParentOverSixty: [null],
    });
    this.setInvestmentsDeductionsValues();

    this.isEditable();
  }

  isEditable() {
    if (this.isEditMedicalExpenses) {
      this.investmentDeductionForm.enable();
    } else {
      this.investmentDeductionForm.disable();
    }
  }

  max5000Limit(val) {
    if (
      val === 'SELF' &&
      this.investmentDeductionForm.controls['selfPreventiveCheckUp'].valid &&
      this.utilsService.isNonZero(
        this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value
      )
    ) {
      const applicable =
        5000 -
        Number(
          this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value
        );
      this.investmentDeductionForm.controls['preventiveCheckUp'].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.max(applicable),
      ]);
      this.investmentDeductionForm.controls[
        'preventiveCheckUp'
      ].updateValueAndValidity();
    } else if (
      val === 'PARENTS' &&
      this.investmentDeductionForm.controls['preventiveCheckUp'].valid &&
      this.utilsService.isNonZero(
        this.investmentDeductionForm.controls['preventiveCheckUp'].value
      )
    ) {
      const applicable =
        5000 -
        Number(
          this.investmentDeductionForm.controls['preventiveCheckUp'].value
        );
      this.investmentDeductionForm.controls[
        'selfPreventiveCheckUp'
      ].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.max(applicable),
      ]);
      this.investmentDeductionForm.controls[
        'selfPreventiveCheckUp'
      ].updateValueAndValidity();
    }
  }

  saveInvestmentDeductions() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.max5000Limit('SELF');
    if (this.investmentDeductionForm.valid) {
      Object.keys(this.investmentDeductionForm.controls).forEach(
        (item: any) => {
          if (
            item === 'ELSS' ||
            item === 'PENSION_FUND' ||
            item === 'PS_EMPLOYEE' ||
            item === 'PS_EMPLOYER' ||
            item === 'PENSION_SCHEME'
          ) {
            this.addAndUpdateInvestment(item);
          } else {
            if (item === 'us80e') {
              this.ITR_JSON.loans = this.ITR_JSON.loans?.filter(
                (item: any) => item.loanType !== 'EDUCATION'
              );
              if (!this.ITR_JSON.loans) {
                this.ITR_JSON.loans = [];
              }
              this.ITR_JSON.loans?.push({
                loanType: 'EDUCATION',
                name: null,
                interestPaidPerAnum: Number(
                  this.investmentDeductionForm.controls['us80e'].value
                ),
                principalPaidPerAnum: 0.0,
                loanAmount: null,
                details: null,
              });
            } else if (item === 'us80gg') {
              this.ITR_JSON.expenses = this.ITR_JSON.expenses?.filter(
                (item: any) => item.expenseType !== 'HOUSE_RENT_PAID'
              );
              if (!this.ITR_JSON.expenses) {
                this.ITR_JSON.expenses = [];
              }
              if (!this.ITR_JSON.systemFlags.hraAvailed) {
                this.ITR_JSON.expenses?.push({
                  expenseType: 'HOUSE_RENT_PAID',
                  expenseFor: null,
                  details: null,
                  amount: Number(
                    this.investmentDeductionForm.controls['us80gg'].value
                  ),
                  noOfMonths: 0,
                });
              }
            } else if (item === 'us80ggc') {
              this.ITR_JSON.donations = this.ITR_JSON.donations?.filter(
                (item: any) => item.donationType !== 'POLITICAL'
              );
              if (!this.ITR_JSON.donations) {
                this.ITR_JSON.donations = [];
              }
              this.ITR_JSON.donations?.push({
                details: '',
                identifier: '',
                panNumber: '',
                schemeCode: '',
                donationType: 'POLITICAL',
                name: '',
                amountInCash: 0,
                amountOtherThanCash: Number(
                  this.investmentDeductionForm.controls['us80ggc'].value
                ),
                address: '',
                city: '',
                pinCode: '',
                state: '',
              });
            } else if (item === 'us80eeb') {
              this.ITR_JSON.expenses = this.ITR_JSON.expenses?.filter(
                (item: any) => item.expenseType !== 'ELECTRIC_VEHICLE'
              );
              if (!this.ITR_JSON.expenses) {
                this.ITR_JSON.expenses = [];
              }
              this.ITR_JSON.expenses?.push({
                expenseType: 'ELECTRIC_VEHICLE',
                expenseFor: null,
                details: null,
                amount: Number(
                  this.investmentDeductionForm.controls['us80eeb'].value
                ),
                noOfMonths: 0,
              });
            }
          }
        }
      );
      this.ITR_JSON.insurances = this.ITR_JSON.insurances?.filter(
        (item: any) => item.policyFor !== 'DEPENDANT'
      );
      if (!this.ITR_JSON.insurances) {
        this.ITR_JSON.insurances = [];
      }
      if (
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['selfPremium'].value
        ) ||
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value
        ) ||
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['selfMedicalExpenditure'].value
        )
      ) {
        this.ITR_JSON.insurances?.push({
          insuranceType: 'HEALTH',
          typeOfPolicy: null,
          policyFor: 'DEPENDANT',
          premium: Number(
            this.investmentDeductionForm.controls['selfPremium'].value
          ),
          medicalExpenditure:
            this.userAge >= 60
              ? Number(
                  this.investmentDeductionForm.controls[
                    'selfMedicalExpenditure'
                  ].value
                )
              : 0,
          preventiveCheckUp: Number(
            this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value
          ),
          sumAssured: null,
          healthCover: null,
        });
      }
      this.ITR_JSON.insurances = this.ITR_JSON.insurances?.filter(
        (item: any) => item.policyFor !== 'PARENTS'
      );
      if (!this.ITR_JSON.insurances) {
        this.ITR_JSON.insurances = [];
      }
      if (
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['premium'].value
        ) ||
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['preventiveCheckUp'].value
        ) ||
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['medicalExpenditure'].value
        )
      ) {
        this.ITR_JSON.systemFlags.hasParentOverSixty = true;
        this.ITR_JSON.insurances?.push({
          insuranceType: 'HEALTH',
          typeOfPolicy: null,
          policyFor: 'PARENTS',
          premium: Number(
            this.investmentDeductionForm.controls['premium'].value
          ),
          medicalExpenditure: Number(
            this.investmentDeductionForm.controls['medicalExpenditure'].value
          ),
          preventiveCheckUp: Number(
            this.investmentDeductionForm.controls['preventiveCheckUp'].value
          ),
          sumAssured: null,
          healthCover: null,
        });
      }
      this.ITR_JSON.disabilities = [];
      if (
        this.selected80u !== '' &&
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['us80u'].value
        )
      ) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80u,
          amount: this.investmentDeductionForm.controls['us80u'].value,
        });
      }
      if (
        this.selected80dd !== '' &&
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['us80dd'].value
        )
      ) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80dd,
          amount: this.investmentDeductionForm.controls['us80dd'].value,
        });
      }
      if (
        this.selected80ddb !== '' &&
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['us80ddb'].value
        )
      ) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80ddb,
          amount: this.investmentDeductionForm.controls['us80ddb'].value,
        });
      }
      // this.serviceCall('NEXT', this.ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  setInvestmentsDeductionsValues() {
    this.ITR_JSON.investments?.forEach((investment) => {
      if (
        investment.investmentType === 'ELSS' ||
        investment.investmentType === 'PENSION_FUND' ||
        investment.investmentType === 'PS_EMPLOYEE' ||
        investment.investmentType === 'PS_EMPLOYER' ||
        investment.investmentType === 'PENSION_SCHEME'
      )
        this.investmentDeductionForm.controls[
          investment.investmentType
        ].setValue(investment.amount);
    });

    for (let i = 0; i < this.ITR_JSON.loans?.length; i++) {
      switch (this.ITR_JSON.loans[i].loanType) {
        case 'EDUCATION': {
          this.investmentDeductionForm.controls['us80e'].setValue(
            this.ITR_JSON.loans[i].interestPaidPerAnum
          );
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.expenses?.length; j++) {
      switch (this.ITR_JSON.expenses[j].expenseType) {
        case 'HOUSE_RENT_PAID': {
          this.investmentDeductionForm.controls['us80gg'].setValue(
            this.ITR_JSON.expenses[j].amount
          );
          break;
        }
        case 'ELECTRIC_VEHICLE': {
          this.investmentDeductionForm.controls['us80eeb'].setValue(
            this.ITR_JSON.expenses[j].amount
          );
          break;
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.donations?.length; j++) {
      switch (this.ITR_JSON.donations[j].donationType) {
        case 'POLITICAL': {
          this.investmentDeductionForm.controls['us80ggc'].setValue(
            this.ITR_JSON.donations[j].amountOtherThanCash
          );
          break;
        }
      }
    }
    for (let i = 0; i < this.ITR_JSON.insurances?.length; i++) {
      if (this.ITR_JSON.insurances[i].policyFor === 'DEPENDANT') {
        this.investmentDeductionForm.controls['selfPremium'].setValue(
          this.ITR_JSON.insurances[i].premium
        );
        this.investmentDeductionForm.controls['selfPreventiveCheckUp'].setValue(
          this.ITR_JSON.insurances[i].preventiveCheckUp
        );
        this.investmentDeductionForm.controls[
          'selfMedicalExpenditure'
        ].setValue(this.ITR_JSON.insurances[i].medicalExpenditure);
      } else if (this.ITR_JSON.insurances[i].policyFor === 'PARENTS') {
        this.ITR_JSON.systemFlags.hasParentOverSixty = true;
        this.investmentDeductionForm.controls['hasParentOverSixty'].setValue(
          true
        );
        this.investmentDeductionForm.controls['premium'].setValue(
          this.ITR_JSON.insurances[i].premium
        );
        this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(
          this.ITR_JSON.insurances[i].preventiveCheckUp
        );
        this.investmentDeductionForm.controls['medicalExpenditure'].setValue(
          this.ITR_JSON.insurances[i].medicalExpenditure
        );
      }
    }
    let sec80u = this.ITR_JSON.disabilities?.filter(
      (item) =>
        item.typeOfDisability === 'SELF_WITH_DISABILITY' ||
        item.typeOfDisability === 'SELF_WITH_SEVERE_DISABILITY'
    );
    if (sec80u?.length > 0) {
      this.selected80u = sec80u[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80u'].setValue(sec80u[0].amount);
      this.radioChange80u(false);
    }
    let sec80dd = this.ITR_JSON.disabilities?.filter(
      (item) =>
        item.typeOfDisability === 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY' ||
        item.typeOfDisability === 'DEPENDENT_PERSON_WITH_DISABILITY'
    );
    if (sec80dd?.length > 0) {
      this.selected80dd = sec80dd[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80dd'].setValue(
        sec80dd[0].amount
      );
      this.radioChange80dd(false);
    }
    let sec80ddb = this.ITR_JSON.disabilities?.filter(
      (item) =>
        item.typeOfDisability === 'SELF_OR_DEPENDENT' ||
        item.typeOfDisability === 'SELF_OR_DEPENDENT_SENIOR_CITIZEN'
    );
    if (sec80ddb?.length > 0) {
      this.selected80ddb = sec80ddb[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80ddb'].setValue(
        sec80ddb[0].amount
      );
      this.radioChange80ddb(false);
    }
    this.max5000Limit('SELF');
  }

  addAndUpdateInvestment(controlName) {
    if (
      this.utilsService.isNonEmpty(
        this.investmentDeductionForm.controls[controlName].value
      )
    ) {
      let i: number;
      let isAdded = false;
      for (i = 0; i < this.ITR_JSON.investments?.length; i++) {
        if (this.ITR_JSON.investments[i].investmentType === controlName) {
          isAdded = true;
          break;
        }
      }

      if (!isAdded) {
        if (!this.ITR_JSON.investments) {
          this.ITR_JSON.investments = [];
        }
        this.ITR_JSON.investments?.push({
          investmentType: controlName,
          amount: Number(
            this.investmentDeductionForm.controls[controlName].value
          ),
          details: controlName,
        });
      } else {
        this.ITR_JSON.investments.splice(i, 1, {
          investmentType: controlName,
          amount: Number(
            this.investmentDeductionForm.controls[controlName].value
          ),
          details: controlName,
        });
      }
    } else {
      this.ITR_JSON.investments = this.ITR_JSON.investments?.filter(
        (item: any) => item.investmentType !== controlName
      );
    }
  }

  isParentOverSixty() {
    if (!this.ITR_JSON?.systemFlags?.hasParentOverSixty) {
      console.log('clear parent related values');
      // this.investmentDeductionForm.controls['premium'].setValue(null);
      // this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(null);
      this.investmentDeductionForm.controls['medicalExpenditure'].setValue(
        null
      );
    }
  }

  radioChange80u(setDefault) {
    if (this.selected80u === 'SELF_WITH_DISABILITY') {
      this.maxLimit80u = 75000;
    } else if (this.selected80u === 'SELF_WITH_SEVERE_DISABILITY') {
      this.maxLimit80u = 125000;
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80u'].setValue(this.maxLimit80u);
  }
  radioChange80dd(setDefault) {
    if (this.selected80dd === 'DEPENDENT_PERSON_WITH_DISABILITY') {
      this.maxLimit80dd = 75000;
    } else if (
      this.selected80dd === 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY'
    ) {
      this.maxLimit80dd = 125000;
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80dd'].setValue(
        this.maxLimit80dd
      );
  }
  radioChange80ddb(setDefault) {
    if (this.selected80ddb === 'SELF_OR_DEPENDENT') {
      this.maxLimit80ddb = 40000;
    } else if (this.selected80ddb === 'SELF_OR_DEPENDENT_SENIOR_CITIZEN') {
      this.maxLimit80ddb = 100000;
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80ddb'].setValue(
        this.maxLimit80ddb
      );
  }

  disableSelf(value) {
    if (value === 'HEALTH') {
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].enable();
      if (this.investmentDeductionForm.controls['selfPremium'].value > 0) {
        this.investmentDeductionForm.controls[
          'selfMedicalExpenditure'
        ].setValue(null);
        this.investmentDeductionForm.controls[
          'selfMedicalExpenditure'
        ].disable();
      }
    } else if (value === 'MEDICAL') {
      this.investmentDeductionForm.controls['selfPremium'].enable();
      if (
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].value >
        0
      ) {
        this.investmentDeductionForm.controls['selfPremium'].setValue(null);
        this.investmentDeductionForm.controls['selfPremium'].disable();
      }
    }
  }
  disableParent(value) {
    if (value === 'HEALTH') {
      this.investmentDeductionForm.controls['medicalExpenditure'].enable();
      if (this.investmentDeductionForm.controls['premium'].value > 0) {
        this.investmentDeductionForm.controls['medicalExpenditure'].setValue(
          null
        );
        this.investmentDeductionForm.controls['medicalExpenditure'].disable();
      }
    } else if (value === 'MEDICAL') {
      this.investmentDeductionForm.controls['premium'].enable();
      if (
        this.investmentDeductionForm.controls['medicalExpenditure'].value > 0
      ) {
        this.investmentDeductionForm.controls['premium'].setValue(null);
        this.investmentDeductionForm.controls['premium'].disable();
      }
    }
  }

  saveAndContinue() {
    this.saveAndNext.emit(true);
  }

  ngDoCheck() {
    if (this.selected80u !== '') {
      this.investmentDeductionForm.controls['us80u'].enable();
      this.investmentDeductionForm.controls['us80u'].setValidators([
        Validators.max(this.maxLimit80u),
      ]);
    } else {
      this.investmentDeductionForm.controls['us80u'].disable();
    }
    if (this.selected80dd !== '') {
      this.investmentDeductionForm.controls['us80dd'].enable();
      this.investmentDeductionForm.controls['us80dd'].setValidators([
        Validators.max(this.maxLimit80dd),
      ]);
    } else {
      this.investmentDeductionForm.controls['us80dd'].disable();
    }
    if (this.selected80ddb !== '') {
      this.investmentDeductionForm.controls['us80ddb'].enable();
      this.investmentDeductionForm.controls['us80ddb'].setValidators([
        Validators.max(this.maxLimit80ddb),
      ]);
    } else {
      this.investmentDeductionForm.controls['us80ddb'].disable();
    }

    if (this.investmentDeductionForm.controls['selfPremium'].value > 0) {
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].setValue(
        null
      );
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].disable();
    } else if (
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].value > 0
    ) {
      this.investmentDeductionForm.controls['selfPremium'].setValue(null);
      this.investmentDeductionForm.controls['selfPremium'].disable();
    }
    if (this.investmentDeductionForm.controls['premium'].value > 0) {
      this.investmentDeductionForm.controls['medicalExpenditure'].setValue(
        null
      );
      this.investmentDeductionForm.controls['medicalExpenditure'].disable();
    } else if (
      this.investmentDeductionForm.controls['medicalExpenditure'].value > 0
    ) {
      this.investmentDeductionForm.controls['premium'].setValue(null);
      this.investmentDeductionForm.controls['premium'].disable();
    }
  }
}
