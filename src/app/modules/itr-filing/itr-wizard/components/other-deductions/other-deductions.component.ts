import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  loading: boolean = false;
  otherDeductionForm: FormGroup;
  ITR_JSON: ITR_JSON;
  summaryIncome: any;
  finalSummary: any;

  constructor(
    private fb: FormBuilder,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.calculations();
  }

  initForm() {
    this.otherDeductionForm = this.fb.group({
      us80ee: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eea: [null, Validators.pattern(AppConstants.numericRegex)],
      us80tta: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ttb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80qqb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80rrb: [null, Validators.pattern(AppConstants.numericRegex)],
    });
  }

  calculations() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const param = '/tax/old-regime';
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
      (result: any) => {
        // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
        console.log('result is=====', result);

        this.summaryIncome = result.summaryIncome;
        const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
        this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
          this.finalSummary = summary;
          console.log('SUMMARY Result=> ', summary);

          if (summary) {
            const deductionDetails =
              summary.assessment.summaryDeductions.filter(
                (deduction) =>
                  deduction.sectionType === '80QQB' ||
                  deduction.sectionType === '80RRB' ||
                  deduction.sectionType === '80TTA' ||
                  deduction.sectionType === '80TTB' ||
                  deduction.sectionType === '80EE' ||
                  deduction.sectionType === '80EEA'
              );
            console.log(deductionDetails, 'filteredDeductions');

            const deductionArray = [
              'us80ee',
              'us80eea',
              'us80tta',
              'us80ttb',
              'us80qqb',
              'us80rrb',
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
                key.setValue(value[0].eligibleAmount);
              } else if (element === 'us80ttb') {
                let value = deductionDetails?.filter(
                  (deduction) => deduction.sectionType === '80TTB'
                );
                key.setValue(value[0].eligibleAmount);
              } else if (element === 'us80qqb') {
                let value = deductionDetails?.filter(
                  (deduction) => deduction.sectionType === '80QQB'
                );
                key.setValue(value[0].eligibleAmount);
              } else if (element === 'us80rrb') {
                let value = deductionDetails?.filter(
                  (deduction) => deduction.sectionType === '80RRB'
                );
                key.setValue(value[0].eligibleAmount);
              }
            });
          }
        });
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
