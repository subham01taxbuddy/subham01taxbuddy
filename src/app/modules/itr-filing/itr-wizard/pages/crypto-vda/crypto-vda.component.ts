import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-crypto-vda',
  templateUrl: './crypto-vda.component.html',
  styleUrls: ['./crypto-vda.component.scss'],
})
export class CryptoVdaComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  scheduleVda: UntypedFormGroup;
  headOfIncomes: any;
  capitalGainTotal: any;
  businessTotal: any;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading = false;
  minDate: Date;
  maxDate: Date;

  constructor(private fb: UntypedFormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.scheduleVda = this.initForm();
    this.headOfIncomes = ['Business or Profession', 'Capital Gain'];

    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    // setting the capital gain array to the filtered result that does not contain VDA
    this.Copy_ITR_JSON.capitalGain = this.Copy_ITR_JSON?.capitalGain?.filter(
      (item) => {
        return item?.assetType === 'VDA';
      }
    );

    //get financial year from ITR object
    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;

    if (this.Copy_ITR_JSON.capitalGain.length > 0) {
      const vdaCgArray = this.Copy_ITR_JSON?.capitalGain;
      const modifiedArray = vdaCgArray?.map((item) => {
        return item?.assetDetails?.map((assetDetail: any) => {
          return {
            hasEdit: false,
            dateOfAcquisition: assetDetail ? assetDetail?.purchaseDate : null,
            dateOfTransfer: assetDetail ? assetDetail?.sellDate : null,
            headOfIncome: assetDetail
              ? assetDetail?.headOfIncome === 'BI'
                ? 'Business or Profession'
                : 'Capital Gain'
              : null,
            costOfAcquisition: assetDetail ? assetDetail?.purchaseCost : '0',
            considerationReceived: assetDetail ? assetDetail?.sellValue : '0',
            income: assetDetail ? assetDetail?.capitalGain : '0',
          };
        });
      });

      console.log(modifiedArray);
      modifiedArray[0]?.forEach((array) => {
        this.add(array);
      });
      this.calcTotal();
    } else {
      this.add('addEmpty');
    }
  }

  initForm(state?) {
    return this.fb.group({
      vdaArray: this.fb.array([]),
    });
  }

  createVdaForm(item?): UntypedFormGroup {
    const formGroup = this.fb.group({
      hasEdit: [item ? item?.hasEdit : null],
      dateOfAcquisition: [item ? item?.dateOfAcquisition : null],
      dateOfTransfer: [item ? item?.dateOfTransfer : null],
      headOfIncome: [item ? item?.headOfIncome : null],
      costOfAcquisition: [item ? item?.costOfAcquisition : null],
      considerationReceived: [item ? item?.considerationReceived : null],
      income: [item ? item?.income : null],
    });
    return formGroup;
  }

  updateValidations(vda){
    this.minDate = (vda as UntypedFormGroup).controls['dateOfAcquisition'].value;
    (vda as UntypedFormGroup).controls['dateOfTransfer'].updateValueAndValidity();
  }

  add(item) {
    const vdaArray = <FormArray>this.scheduleVda.get('vdaArray');
    if (item === 'addEmpty') {
      const formGroup = this.fb.group({
        hasEdit: null,
        dateOfAcquisition: null,
        dateOfTransfer: null,
        headOfIncome: null,
        costOfAcquisition: null,
        considerationReceived: null,
        income: null,
      });
      vdaArray?.push(this.createVdaForm(formGroup));
    } else {
      if (this.scheduleVda.valid) {
        vdaArray?.push(this.createVdaForm(item));
      }
    }
  }

  deleteVdaArray() {
    const vdaArray = <FormArray>this.scheduleVda.get('vdaArray');
    let filteredVdaArrayToDelete = vdaArray?.controls?.filter(item => (item as UntypedFormGroup)?.controls['hasEdit']?.value);
    for (let i = filteredVdaArrayToDelete?.length - 1; i >= 0; i--) {
      vdaArray?.removeAt(vdaArray?.controls?.indexOf(filteredVdaArrayToDelete[i]));
    }
    this.calcTotal();
  }

  getInputValue(index: number, controlName: string) {
    let value = (this.scheduleVda.get('vdaArray') as FormArray)
      .at(index)
      .get(controlName).value;
    return value;
  }

  calcInc(index: number) {
    const saleValue = this.getInputValue(index, 'considerationReceived');
    const buyValue = this.getInputValue(index, 'costOfAcquisition');

    const income = saleValue - buyValue;
    const incomeInput = (this.scheduleVda.get('vdaArray') as FormArray)
      .at(index)
      .get('income');

    incomeInput.setValue(income > 0 ? income : 0);

    this.calcTotal();
  }

  calcTotal() {
    const allValues = this.scheduleVda?.getRawValue();

    // calculating the total of capital gain and setting it as 0 if it is less than 0
    if (allValues) {
      this.capitalGainTotal = allValues?.vdaArray
        .filter((item) => item?.headOfIncome === 'Capital Gain')
        .reduce((total, item) => total + item?.income, 0);

      if (this.capitalGainTotal < 0) {
        this.capitalGainTotal = 0;
      }

      // calculating the total of business and setting it as 0 if it is less than 0
      this.businessTotal = allValues?.vdaArray
        .filter((item) => item?.headOfIncome === 'Business or Profession')
        .reduce((total, item) => total + item?.income, 0);

      if (this.businessTotal < 0) {
        this.businessTotal = 0;
      }
    }
  }

  saveAll() {
    if (this.scheduleVda.valid) {
      this.loading = true;
      const savedDetails = this.scheduleVda.getRawValue();

      if (savedDetails?.vdaArray?.length > 0) {
        const toSave = {
          assessmentYear: '2023-2024',
          assesseeType: 'INDIVIDUAL',
          residentialStatus: 'RESIDENT',
          assetType: 'VDA',
          assetDetails: savedDetails?.vdaArray?.map((item, index) => ({
            srn: index ? index : 0,
            sellOrBuyQuantity: 1,
            sellValuePerUnit: item ? item?.considerationReceived : 0,
            sellValue: item ? item?.considerationReceived : 0,
            purchaseDate: item
              ? new Date(item?.dateOfAcquisition).toISOString()
              : null,
            sellDate: item
              ? new Date(item?.dateOfTransfer).toISOString()
              : null,
            algorithm: 'vdaCrypto',
            purchaseValuePerUnit: item ? item?.costOfAcquisition : 0,
            purchaseCost: item ? item?.costOfAcquisition : 0,
            headOfIncome: item
              ? item?.headOfIncome === 'Capital Gain'
                ? 'CG'
                : 'BI'
              : null,
            capitalGain: item ? (item?.income > 0 ? item?.income : 0) : 0,
            gainType: 'NA',
          })),
          improvement: [],
          buyersDetails: [],
        };

        console.log(toSave, 'tosave');

        this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

        // If capital gain is not present we assign it as empty
        if (!this.Copy_ITR_JSON?.capitalGain) {
          this.Copy_ITR_JSON.capitalGain = [];
        }

        // setting the capital gain array to the filtered result that does not contain VDA
        this.Copy_ITR_JSON.capitalGain =
          this.Copy_ITR_JSON?.capitalGain?.filter((item) => {
            return item?.assetType !== 'VDA';
          });

        // Pusing all the vda details in the capital gain array
        this.Copy_ITR_JSON?.capitalGain?.push(toSave);

        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.Copy_ITR_JSON));
        this.utilsService.showSnackBar('Schedule VDA saved successfully');
        this.saveAndNext.emit(false);
        this.loading = false;
      } else {
        this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

        this.loading = true;
        this.Copy_ITR_JSON.capitalGain =
          this.Copy_ITR_JSON?.capitalGain?.filter((item) => {
            return item?.assetType !== 'VDA';
          });
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.Copy_ITR_JSON));
        this.utilsService.showSnackBar('Schedule VDA saved successfully');
        this.saveAndNext.emit(false);
        this.loading = false;
      }
    } else {
      this.utilsService.showSnackBar(
        'Please make sure all the details are entered correctly'
      );
    }
  }

  get getVdaArray() {
    return this.scheduleVda.get('vdaArray') as FormArray;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
