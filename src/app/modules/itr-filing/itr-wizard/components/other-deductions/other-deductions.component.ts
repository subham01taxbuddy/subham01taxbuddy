import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-other-deductions',
  templateUrl: './other-deductions.component.html',
  styleUrls: ['./other-deductions.component.scss'],
})
export class OtherDeductionsComponent implements OnInit {

  @Output() ded80TTA = new EventEmitter();
  @Output() ded80TTB = new EventEmitter();
  loading: boolean = false;
  otherDeductionForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  summaryIncome: any;
  finalSummary: any;

  constructor(
    private fb: UntypedFormBuilder,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.initForm();
    this.setValues();
    this.calculations();
  }

  setValues() {
    for (let i = 0; i < this.ITR_JSON.loans?.length; i++) {
      switch (this.ITR_JSON.loans[i].loanType) {
        case 'EDUCATION': {
          this.otherDeductionForm.controls['us80e'].setValue(
            this.ITR_JSON.loans[i].interestPaidPerAnum
          );
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.expenses?.length; j++) {
      switch (this.ITR_JSON.expenses[j].expenseType) {
        case 'HOUSE_RENT_PAID': {
          this.otherDeductionForm.controls['us80gg'].setValue(
            this.ITR_JSON.expenses[j].amount
          );
          break;
        }
        case 'ELECTRIC_VEHICLE': {
          this.otherDeductionForm.controls['us80eeb'].setValue(
            this.ITR_JSON.expenses[j].amount
          );
          break;
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.donations?.length; j++) {
      switch (this.ITR_JSON.donations[j].donationType) {
        case 'POLITICAL': {
          this.otherDeductionForm.controls['us80ggc'].setValue(
            this.ITR_JSON.donations[j].amountOtherThanCash
          );
          break;
        }
      }
    }
  }

  initForm() {
    this.otherDeductionForm = this.fb.group({
      us80ee: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eea: [null, Validators.pattern(AppConstants.numericRegex)],
      // us80qqb: [null, Validators.pattern(AppConstants.numericRegex)],
      // us80rrb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80e: [null, Validators.pattern(AppConstants.numericRegex)],
      us80gg: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ggc: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eeb: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(150000)],
      ],
    });
  }

  saveInvestmentDeductions() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.otherDeductionForm.valid) {
      Object.keys(this.otherDeductionForm.controls).forEach(
        (item: any) => {
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
                this.otherDeductionForm.controls['us80e'].value
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
                  this.otherDeductionForm.controls['us80gg'].value
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
            if (this.otherDeductionForm.controls['us80ggc'].value > 0) {
              this.ITR_JSON.donations?.push({
                details: '',
                identifier: '',
                panNumber: '',
                schemeCode: '',
                donationType: 'POLITICAL',
                name: '',
                amountInCash: 0,
                amountOtherThanCash: Number(
                  this.otherDeductionForm.controls['us80ggc'].value
                ),
                address: '',
                city: '',
                pinCode: '',
                state: '',
              });
            } else {
              this.ITR_JSON.donations = this.ITR_JSON.donations?.filter(
                (item: any) => item.donationType !== 'POLITICAL'
              );
            }
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
                this.otherDeductionForm.controls['us80eeb'].value
              ),
              noOfMonths: 0,
            });
          }
        }
      );

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  calculations() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const param = '/tax/old-regime';
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
      (result: any) => {
        // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
        console.log('result is=====', result);

        if (result) {
          const deductionDetails = result.summaryDeductions.filter(
            (deduction) =>
              deduction.sectionType === '80EE' ||
              deduction.sectionType === '80EEA' ||
              deduction.sectionType === '80TTA' ||
              deduction.sectionType === '80TTB'
          );
          console.log(deductionDetails, 'filteredDeductions');

          const deductionArray = [
            'us80ee',
            'us80eea',
            'us80tta',
            'us80ttb'
          ];

          deductionArray.forEach((element) => {
            const key = this.otherDeductionForm.get(element);

            if (element === 'us80ee') {
              let value = deductionDetails?.filter(
                (deduction) => deduction.sectionType === '80EE'
              );
              key.setValue(value[0].eligibleAmount);
            } else if (element === 'us80eea') {
              let value = deductionDetails?.filter(
                (deduction) => deduction.sectionType === '80EEA'
              );
              key.setValue(value[0].eligibleAmount);
            } else if (element === 'us80tta') {
              let value = deductionDetails?.filter(
                (deduction) => deduction.sectionType === '80TTA'
              );
              this.ded80TTA.emit(value[0]?.eligibleAmount);
            } else if (element === 'us80ttb') {
              let value = deductionDetails?.filter(
                (deduction) => deduction.sectionType === '80TTB'
              );
              this.ded80TTB.emit(value[0]?.eligibleAmount);
            }
          });
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;

        if (error) {
          this.utilsService.showSnackBar(
            'We are unable to display your result,Please try again later.'
          );
        }
      }
    );
  }
}
