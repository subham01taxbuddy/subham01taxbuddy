import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  DoCheck,
  SimpleChanges,
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
  @Output() saveAndNext = new EventEmitter<any>();
  @Output() medicalExpensesSaved = new EventEmitter<boolean>();

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
    this.initForm();
    this.setInvestmentsDeductionsValues();
  }

  initForm() {
    // let maxPremium = this.userAge >= 60 ? 50000 : 25000;
    this.investmentDeductionForm = this.fb.group({
      selfPremium: [null, [Validators.pattern(AppConstants.numericRegex)]],
      selfPreventiveCheckUp: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)],
      ],
      selfMedicalExpenditure: [
        null,
        Validators.pattern(AppConstants.numericRegex),
      ],
      premium: [null, [Validators.pattern(AppConstants.numericRegex)]],
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

  setInvestmentsDeductionsValues() {
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
    } else {
      this.selected80u = '';
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
    } else {
      this.selected80dd = '';
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
    } else {
      this.selected80ddb = '';
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
    if (!this.Copy_ITR_JSON?.systemFlags?.hasParentOverSixty) {
      console.log('clear parent related values');
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
    } else {
      this.maxLimit80u = 0;
    }
    // if (setDefault)
    this.investmentDeductionForm.controls['us80u'].setValue(this.maxLimit80u);
  }
  radioChange80dd(setDefault) {
    if (this.selected80dd === 'DEPENDENT_PERSON_WITH_DISABILITY') {
      this.maxLimit80dd = 75000;
    } else if (
      this.selected80dd === 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY'
    ) {
      this.maxLimit80dd = 125000;
    } else {
      this.maxLimit80dd = 0;
    }
    // if (setDefault)
    this.investmentDeductionForm.controls['us80dd'].setValue(this.maxLimit80dd);
  }
  radioChange80ddb(setDefault) {
    if (this.selected80ddb === 'SELF_OR_DEPENDENT') {
      this.maxLimit80ddb = 40000;
    } else if (this.selected80ddb === 'SELF_OR_DEPENDENT_SENIOR_CITIZEN') {
      this.maxLimit80ddb = 100000;
    } else {
      this.maxLimit80ddb = 0;
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
  }

  saveInvestmentDeductions() {
    let isParentOverSixty = this.Copy_ITR_JSON.systemFlags.hasParentOverSixty;

    if (isParentOverSixty) {
      let totalExpenses =
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['premium'].value
        ) +
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['preventiveCheckUp'].value
        ) +
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['medicalExpenditure'].value
        );
      if (totalExpenses > 50000) {
        this.utilsService.showSnackBar(
          'Medical expenses for parents cannot exceed 50000'
        );
        this.medicalExpensesSaved.emit(false);
        return;
      }
    } else {
      let totalExpenses =
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['premium'].value
        ) +
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['preventiveCheckUp'].value
        ) +
        this.utilsService.getInt(
          this.investmentDeductionForm.controls['medicalExpenditure'].value
        );
      if (totalExpenses > 25000) {
        this.utilsService.showSnackBar(
          'Medical expenses for parents cannot exceed 25000'
        );
        this.medicalExpensesSaved.emit(false);
        return;
      }
    }
    let maxExpenseLimit = this.userAge >= 60 ? 50000 : 25000;
    let totalExpenses =
      this.utilsService.getInt(
        this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value
      ) +
      this.utilsService.getInt(
        this.investmentDeductionForm.controls['selfPremium'].value
      ) +
      this.utilsService.getInt(
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].value
      );
    if (totalExpenses > maxExpenseLimit) {
      this.utilsService.showSnackBar(
        'Medical expenses for self cannot exceed 25000'
      );
      this.medicalExpensesSaved.emit(false);
      return;
    }

    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.Copy_ITR_JSON.systemFlags.hasParentOverSixty = isParentOverSixty;

    this.max5000Limit('SELF');
    if (this.investmentDeductionForm.valid) {
      this.loading = true;
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
          }
        }
      );
      this.Copy_ITR_JSON.insurances = this.Copy_ITR_JSON.insurances?.filter(
        (item: any) => item.policyFor !== 'DEPENDANT'
      );
      if (!this.Copy_ITR_JSON.insurances) {
        this.Copy_ITR_JSON.insurances = [];
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
        this.Copy_ITR_JSON.insurances?.push({
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
      this.Copy_ITR_JSON.insurances = this.Copy_ITR_JSON.insurances?.filter(
        (item: any) => item.policyFor !== 'PARENTS'
      );
      if (!this.Copy_ITR_JSON.insurances) {
        this.Copy_ITR_JSON.insurances = [];
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
        // this.Copy_ITR_JSON.systemFlags.hasParentOverSixty = true;
        this.Copy_ITR_JSON.insurances?.push({
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
      this.Copy_ITR_JSON.disabilities = [];
      if (
        this.selected80u !== '' &&
        this.utilsService.isNonZero(
          this.investmentDeductionForm.controls['us80u'].value
        )
      ) {
        this.Copy_ITR_JSON.disabilities?.push({
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
        this.Copy_ITR_JSON.disabilities?.push({
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
        this.Copy_ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80ddb,
          amount: this.investmentDeductionForm.controls['us80ddb'].value,
        });
      }

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: ITR_JSON) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );

          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.medicalExpensesSaved.emit(true);
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.medicalExpensesSaved.emit(false);
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
}
