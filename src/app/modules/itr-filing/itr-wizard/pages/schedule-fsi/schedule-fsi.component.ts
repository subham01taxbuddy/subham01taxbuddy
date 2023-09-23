import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-fsi',
  templateUrl: './schedule-fsi.component.html',
  styleUrls: ['./schedule-fsi.component.scss'],
})
export class ScheduleFsiComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  scheduleFsiForm: FormGroup;
  headOfIncomess = [
    'Salary',
    'House Property',
    'Business or Professsion',
    'Capital Gains',
    'Other Sources',
  ];
  loading = false;

  constructor(private fb: FormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.scheduleFsiForm = this.initForm();
    this.add();
  }

  initForm() {
    return this.fb.group({
      fsiArray: this.fb.array([]),
    });
  }

  get getFsiArray() {
    return <FormArray>this.scheduleFsiForm.get('fsiArray');
  }

  add(item?) {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    fsiArray.push(this.createFsiForm(item));
  }

  createFsiForm(item?): FormGroup {
    const formGroup = this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      headOfIncomes: this.fb.array([]),
    });
    this.headOfIncomess.forEach((element) => {
      (formGroup.get('headOfIncomes') as FormArray).push(
        this.createHeadOfIncome(element, item)
      );
    });

    return formGroup;
  }

  createHeadOfIncome(headOfIncome?, item?): FormGroup {
    return this.fb.group({
      headOfIncome: [headOfIncome ? headOfIncome : null],
      incFromOutInd: [item ? item.incFromOutInd : null],
      taxPaidOutInd: [item ? item.taxPaidOutInd : null],
      taxPayableNrmlProv: [item ? item.taxPayableNrmlProv : null],
      offeredForTaxInd: [item ? item.offeredForTaxInd : ''],
      relevantArticle: [item ? item.relevantArticle : null],
    });
  }

  get headOfIncomesArray() {
    return (this.getFsiArray.controls[0] as FormGroup).controls[
      'headOfIncomes'
    ] as FormArray;
  }

  goBack() {
    // this.saveAndNext.emit(false);
  }

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    console.log(fsiArray, 'fsiArray');

    // const headOfIncomes = (this.getFsiArray.controls[0] as FormGroup).controls[
    //   'headOfIncomes'
    // ] as FormArray;
    // console.log(headOfIncomes, 'headOfIncomes');

    if (this.scheduleFsiForm.valid) {
      this.loading = true;

      fsiArray?.controls.forEach((fsiArrayElement) => {
        const headOfIncomesArray = (
          fsiArrayElement.get('headOfIncomes') as FormArray
        ).controls;
        console.log(headOfIncomesArray, 'headOfIncomesArray');

        // setting the taxPaidOutsideIndiaFlag if it exists
        const hastaxPaidOutIndValue = headOfIncomesArray.some(
          (hastaxPaidOutIndValueElement) =>
            hastaxPaidOutIndValueElement.get('taxPaidOutInd').value
        );

        if (hastaxPaidOutIndValue) {
          this.Copy_ITR_JSON.taxPaidOutsideIndiaFlag = 'Y';
        }

        // pushing fsi income in taxReliefClaimed
        const checkIfValid: boolean =
          fsiArrayElement.get('tinNumber').value &&
          fsiArrayElement.get('headOfIncomes').value.length > 0;

        if (checkIfValid) {
          if (!this.Copy_ITR_JSON.taxReliefClaimed) {
            this.Copy_ITR_JSON.taxReliefClaimed = [];
          }
          headOfIncomesArray.forEach((element) => {
            this.Copy_ITR_JSON.taxReliefClaimed.push({
              id: null,
              reliefClaimedUsSection: element.get('relevantArticle').value,
              countryCode: fsiArrayElement.get('countryCode').value,
              countryName: fsiArrayElement.get('countryCode').value,
              taxPayerID: fsiArrayElement.get('tinNumber').value,
              claimedDTAA: element.get('offeredForTaxInd').value,
              headOfIncome: [
                {
                  id: 0,
                  incomeType: element.get('headOfIncome').value,
                  outsideIncome: element.get('incFromOutInd').value,
                  outsideTaxPaid: element.get('taxPaidOutInd').value,
                  taxPayable: element.get('taxPayableNrmlProv').value,
                  taxRelief: 0,
                  claimedDTAA: element.get('offeredForTaxInd').value,
                },
              ],
            });
          });
        } else {
          this.utilsService.showSnackBar(
            'Please make sure tin Number or head of incomes details and country code are correctly entered'
          );
        }

        console.log(this.Copy_ITR_JSON.taxReliefClaimed);
        console.log(headOfIncomesArray, 'headOfIncomesArray for saving');
        console.log(hastaxPaidOutIndValue, 'hasIncFromOutIndValue for saving');
      });

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = this.Copy_ITR_JSON;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar('Schedule FSI updated successfully');
          console.log('Schedule FSI=', result);
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to add schedule FSI, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please make sure that you have updated all the details correctly'
      );
    }
  }

  deleteFsiArray() {}
}
