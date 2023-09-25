import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-fsi',
  templateUrl: './schedule-fsi.component.html',
  styleUrls: ['./schedule-fsi.component.scss'],
})
export class ScheduleFsiComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  loading = false;
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

  constructor(private fb: FormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.scheduleFsiForm = this.initForm();

    if (this.ITR_JSON.taxReliefClaimed.length > 0) {
      this.ITR_JSON.taxReliefClaimed.forEach((trElement, trIndex) => {
        const headOfIncomeArray = trElement.headOfIncome.map(
          (element, index) => ({
            id: 0,
            incomeType: element.incomeType,
            outsideIncome: element.outsideIncome,
            outsideTaxPaid: element.outsideTaxPaid,
            taxPayable: element.taxPayable,
            taxRelief:
              element.outsideTaxPaid <= element.taxPayable
                ? element.outsideTaxPaid
                : element.taxPayable,
            claimedDTAA: element.claimedDTAA,
          })
        );

        const formGroup = {
          hasEdit: false,
          countryCode: trElement.countryCode,
          tinNumber: trElement.taxPayerID,
          headOfIncomes: headOfIncomeArray,
          reliefClaimedUsSection: trElement.reliefClaimedUsSection,
        };

        console.log(formGroup, 'formGroup');
        this.add(formGroup);
      });
    } else {
      this.add();
    }
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

    if (item && item.headOfIncomes) {
      item.headOfIncomes.forEach((element) => {
        (formGroup.get('headOfIncomes') as FormArray).push(
          this.createHeadOfIncomes(element, item)
        );
      });
    } else {
      this.headOfIncomess.forEach((element) => {
        (formGroup.get('headOfIncomes') as FormArray).push(
          this.createHeadOfIncome(element, item)
        );
      });
    }

    return formGroup;
  }

  createHeadOfIncomes(headOfIncome?, item?): FormGroup {
    return this.fb.group({
      headOfIncome: [headOfIncome.incomeType ? headOfIncome.incomeType : null],
      incFromOutInd: [
        headOfIncome.outsideIncome ? headOfIncome.outsideIncome : null,
      ],
      taxPaidOutInd: [
        headOfIncome.outsideTaxPaid ? headOfIncome.outsideTaxPaid : null,
      ],
      taxPayableNrmlProv: [
        headOfIncome.taxPayable ? headOfIncome.taxPayable : null,
      ],
      offeredForTaxInd: [headOfIncome.taxRelief ? headOfIncome.taxRelief : ''],
      relevantArticle: [headOfIncome ? headOfIncome.claimedDTAA : null],
    });
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
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');

    if (this.scheduleFsiForm.valid) {
      this.loading = true;

      fsiArray?.controls.forEach((fsiArrayElement, index) => {
        const headOfIncomesArray = (
          fsiArrayElement.get('headOfIncomes') as FormArray
        ).controls;

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
          // fsiArrayElement.get('countryCode').value &&
          fsiArrayElement.get('tinNumber').value &&
          fsiArrayElement.get('headOfIncomes').value.length > 0;

        if (checkIfValid) {
          if (!this.Copy_ITR_JSON.taxReliefClaimed) {
            this.Copy_ITR_JSON.taxReliefClaimed = [];
          }

          const headOfIncomeArray = headOfIncomesArray.map((element) => ({
            id: 0,
            incomeType: element.get('headOfIncome').value,
            outsideIncome: element.get('incFromOutInd').value,
            outsideTaxPaid: element.get('taxPaidOutInd').value,
            taxPayable: element.get('taxPayableNrmlProv').value,
            taxRelief:
              element.get('taxPaidOutInd').value <=
              element.get('taxPayableNrmlProv').value
                ? element.get('taxPaidOutInd').value
                : element.get('taxPayableNrmlProv').value,
            claimedDTAA: element.get('relevantArticle').value,
          }));
          console.log(headOfIncomeArray, 'Final headOfIncomeArray');

          // TO-DO need to fix for edit (similar to business)

          this.Copy_ITR_JSON.taxReliefClaimed.push({
            id: null,
            reliefClaimedUsSection: null,
            countryCode: fsiArrayElement.get('countryCode').value,
            countryName: fsiArrayElement.get('countryCode').value,
            taxPayerID: fsiArrayElement.get('tinNumber').value,
            claimedDTAA: headOfIncomeArray[index].claimedDTAA,
            headOfIncome: headOfIncomeArray,
          });

          console.log(this.Copy_ITR_JSON.taxReliefClaimed, 'taxreliefClaimed');

          this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
            (result: any) => {
              // have to set the ITR_JSON to result once it is fixed from backend
              this.ITR_JSON = this.Copy_ITR_JSON;
              sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
              this.loading = false;
              this.utilsService.showSnackBar(
                'Schedule FSI updated successfully'
              );
              console.log(
                'Schedule FSI (still needs to be fixed from backend)=',
                result
              );
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
          this.utilsService.showSnackBar(
            'Please make sure tin Number or head of incomes details and country code are correctly entered'
          );
        }
      });
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please make sure that you have updated all the details correctly'
      );
    }
  }

  deleteFsiArray() {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    fsiArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        fsiArray.removeAt(index);
      }
    });
    this.saveAll();
  }
}
