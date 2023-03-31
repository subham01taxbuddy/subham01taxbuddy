import {FormArray, FormControl} from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Location } from '@angular/common';
import {WizardNavigation} from "../../itr-shared/WizardNavigation";

@Component({
  selector: 'app-other-income',
  templateUrl: './other-income.component.html',
  styleUrls: ['./other-income.component.css']
})
export class OtherIncomeComponent extends WizardNavigation implements OnInit {

  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  otherIncomeDropdown = [{
    "value": "SAVING_INTEREST",
    "label": "Interest from Saving Account",
  }, {
    "value": "FD_RD_INTEREST",
    "label": "Interest from Deposits(Bank/ Post-Office/ Co-operative Society)",
  }, {
    "value": "TAX_REFUND_INTEREST",
    "label": "Interest from Income tax refund",
  }, {
    "value": "ANY_OTHER",
    "label": "Any Other Income",
  }, /* {
    "value": "FAMILY_PENSION",
    "label": "Any Other Income",
  } */];

  exemptIncomesDropdown = [{
    id: null,
    seqNum: 1,
    value: "AGRI",
    label: "Agriculture Income (less than or equal to RS. 5 Lakhs)",
    detailed: false
  }, {
    id: null,
    seqNum: 2,
    value: "10(10D)",
    label: "Sec 10 (10D) - Any sum received under a life insurance policy, including the sum allocated by way of bonus on such policy except sum as mentioned in sub-clause (a) to (d) of Sec.10 (10D)",
    detailed: false
  }, {
    "id": null,
    "seqNum": 3,
    "value": "10(11)",
    "label": "Sec 10(11) - Statutory Provident Fund received ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 4,
    "value": "10(12)",
    "label": "Sec 10(12) - Recognized Provident Fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 5,
    "value": "10(13)",
    "label": "Sec 10(13) - Approved superannuation fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 6,
    "value": "10(16)",
    "label": "Sec 10(16) - Scholarships granted to meet the cost of education",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 7,
    "value": "DMDP",
    "label": "Defense Medical disability pension",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 8,
    "value": "10(17)",
    "label": "Sec 10(17) - Allowance MP/MLA/MLC ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 9,
    "value": "10(17A)",
    "label": "Sec 10(17A) - Award instituted by government",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "10(18)",
    "label": "Sec 10(18) - Pension received by winner of Param Vir Chakra or Maha-Vir Chakra or such other gallantry award",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 11,
    "value": "10(10BC)",
    "label": "Sec 10(10BC) - Any amount from the Central/State Govt/Local authority by way of compensation on account of any disaster ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 12,
    "value": "10(19)",
    "label": "Sec 10(19) - Armed Forces Family Pension in case of death during operational duty ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 13,
    "value": "10(26)",
    "label": "Sec 10 (26) - Any Income as referred to in section 10(26)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 14,
    "value": "10(26AAA)",
    "label": "Sec 10(26AAA) - Any income as referred to in section 10(26AAA)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "OTH",
    "label": "Any other ",
    "detailed": false
  }]

  otherIncomeFormGroup: FormGroup;
  otherIncomesFormArray: FormArray;
  exemptIncomeFormGroup: FormGroup;
  exemptIncomesFormArray: FormArray;
  private isEditOtherIncome: boolean = false;
  private isEditExemptIncome: boolean = false;
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService, public fb: FormBuilder,
              private location: Location) {
    super();
  }

  ngOnInit() {

    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.otherIncomesFormArray = this.createOtherIncomeForm();
    this.otherIncomeFormGroup = this.fb.group({
      otherIncomes: this.otherIncomesFormArray,
      dividendIncomes: this.fb.group({
        quarter1: [null],
        quarter2: [null],
        quarter3: [null],
        quarter4: [null],
        quarter5: [null],
      }),
      familyPension: new FormControl(null),
      famPenDeduction: [],
      totalFamPenDeduction: []
    });
    this.otherIncomeFormGroup.disable();

    this.exemptIncomesFormArray = this.createExemptIncomeForm();
    this.exemptIncomeFormGroup = this.fb.group({
      exemptIncomes: this.exemptIncomesFormArray,
    });
    this.exemptIncomeFormGroup.disable();
    this.setOtherIncomeValues();
    this.setExemptIncomeValues();
  }

  private createOtherIncomeForm() {
    const data = [];
    for (let i = 0; i < this.otherIncomeDropdown.length; i++) {
      data.push(this.fb.group({
        label: this.otherIncomeDropdown[i].label,
        incomeType: this.otherIncomeDropdown[i].value,
        incomeValue: []
      }));
    }
    return this.fb.array(
      data
    );
  }
  private createExemptIncomeForm() {
    const data = [];
    for (let i = 0; i < this.exemptIncomesDropdown.length; i++) {
      data.push(this.fb.group({
        label: this.exemptIncomesDropdown[i].label,
        incomeType: this.exemptIncomesDropdown[i].value,
        incomeValue: []
      }));
    }
    return this.fb.array(
      data
    );
  }

  get getIncomeArray() {
    return <FormArray>this.otherIncomeFormGroup.get('otherIncomes');
  }

  get getExemptIncomeArray() {
    return <FormArray>this.exemptIncomeFormGroup.get('exemptIncomes');
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {
    this.saveOtherIncome();
    this.saveExemptIncomes();
  }

  saveOtherIncome() {
    console.log('Dividend Income,', this.otherIncomeFormGroup.controls['dividendIncomes'].value);

    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let dividendIncomes = this.otherIncomeFormGroup.controls['dividendIncomes'] as FormGroup;
    this.Copy_ITR_JSON.dividendIncomes = [
      {
        "income": dividendIncomes.controls['quarter1'].value,
        "date": "2022-04-28T18:30:00.000Z",
        quarter: 1
      },
      {
        "income": dividendIncomes.controls['quarter2'].value,
        "date": "2022-07-28T18:30:00.000Z",
        quarter: 2
      },
      {
        "income": dividendIncomes.controls['quarter3'].value,
        "date": "2022-09-28T18:30:00.000Z",
        quarter: 3
      },
      {
        "income": dividendIncomes.controls['quarter4'].value,
        "date": "2022-12-28T18:30:00.000Z",
        quarter: 4
      },
      {
        "income": dividendIncomes.controls['quarter5'].value,
        "date": "2023-03-20T18:30:00.000Z",
        quarter: 5
      }
    ]
    console.log('Copy ITR JSON', this.Copy_ITR_JSON)
    this.loading = true;
    this.Copy_ITR_JSON.incomes = this.Copy_ITR_JSON.incomes?.filter((item: any) => item.incomeType !== 'SAVING_INTEREST' &&
      item.incomeType !== 'FD_RD_INTEREST' && item.incomeType !== 'TAX_REFUND_INTEREST' &&
      item.incomeType !== 'ANY_OTHER' && item.incomeType !== 'FAMILY_PENSION');
    if (!this.Copy_ITR_JSON.incomes) {
      this.Copy_ITR_JSON.incomes = [];
    }
    let otherIncomes = this.otherIncomeFormGroup.controls['otherIncomes'] as FormArray;
    for (let i = 0; i < otherIncomes.controls.length; i++) {
      console.log(otherIncomes.controls[i]);
      let otherIncome = otherIncomes.controls[i] as FormGroup;
      if (this.utilsService.isNonEmpty(otherIncome.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.incomes.push({
          expenses: 0,
          amount: otherIncome.controls['incomeValue'].value,
          incomeType: otherIncome.controls['incomeType'].value,
          details: null
        });
      }
    }
    if (this.utilsService.isNonZero(this.otherIncomeFormGroup.controls['familyPension'].value)) {
      this.Copy_ITR_JSON.incomes.push({
        "amount": this.otherIncomeFormGroup.controls['familyPension'].value,
        "incomeType": "FAMILY_PENSION",
        "details": "FAMILY_PENSION",
        "expenses": 0
      })
    }

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Other Income updated successfully.');
      // this.saveAndNext.emit({ subTab: true, tabName: 'CAPITAL' });
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update other income.');
      this.loading = false;
    });

  }

  saveExemptIncomes() {
    this.Copy_ITR_JSON.exemptIncomes = [];
    let exemptIncomes = this.exemptIncomeFormGroup.controls['exemptIncomes'] as FormArray;
    for (let i = 0; i < this.exemptIncomesDropdown.length; i++) {
      let exempt = exemptIncomes.controls[i] as FormGroup;
      console.log(exempt.controls['incomeValue'].value);
      if (this.utilsService.isNonZero(exempt.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.exemptIncomes.push({
          natureDesc: exempt.controls['incomeType'].value,
          OthNatOfInc: '',
          amount: exempt.controls['incomeValue'].value
        });
        // totalAllowExempt = totalAllowExempt + Number(this.exemptIncomesGridOptions.rowData[i].amount);
      }
    }

    console.log(this.Copy_ITR_JSON.exemptIncomes);
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Other Income updated successfully.');
      // this.saveAndNext.emit({ subTab: true, tabName: 'CAPITAL' });
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update other income.');
      this.loading = false;
    });
  }

  setOtherIncomeValues() {
    if (this.ITR_JSON.incomes instanceof Array) {
      let otherIncomes = this.ITR_JSON.incomes.filter(item => item.incomeType === 'SAVING_INTEREST' || item.incomeType === 'FD_RD_INTEREST' || item.incomeType === 'TAX_REFUND_INTEREST' || item.incomeType === 'ANY_OTHER');
      let otherIncomesFormArray = this.otherIncomeFormGroup.controls['otherIncomes'] as FormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        console.log(otherIncomes[i].incomeType);
        const control = otherIncomesFormArray.controls.filter((item: any) => item.controls['incomeType'].value === otherIncomes[i].incomeType)[0] as FormGroup;
        control.controls['incomeValue'].setValue(otherIncomes[i].amount);
      }

      let famPension = this.ITR_JSON.incomes.filter(item => item.incomeType === 'FAMILY_PENSION');
      if (famPension.length > 0) {
        this.otherIncomeFormGroup.controls['familyPension'].setValue(famPension[0].amount);
        this.calFamPension();
      }
      // const sec17_1 = this.ITR_JSON.incomes.filter((item:any) => item.incomeType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].OthNatOfInc);
      // }
    }


    if (this.ITR_JSON.dividendIncomes instanceof Array) {
      let dividendIncomes = this.otherIncomeFormGroup.controls['dividendIncomes'] as FormGroup;
      for (let i = 0; i < this.ITR_JSON.dividendIncomes.length; i++) {
        switch (this.ITR_JSON.dividendIncomes[i].quarter) {
          case 1: {
            dividendIncomes.controls['quarter1'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 2: {
            dividendIncomes.controls['quarter2'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 3: {
            dividendIncomes.controls['quarter3'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 4: {
            dividendIncomes.controls['quarter4'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
          case 5: {
            dividendIncomes.controls['quarter5'].setValue(this.ITR_JSON.dividendIncomes[i].income);
            break;
          }
        }
      }
    }

  }

  setExemptIncomeValues() {
    let exemptIncomesFormArray = this.exemptIncomeFormGroup.controls['exemptIncomes'] as FormArray;
    if (this.ITR_JSON.exemptIncomes instanceof Array) {
      // const allowance = this.localEmployer.allowance.filter((item: any) => item.natureDesc !== 'ALL_ALLOWANCES');

      for (let i = 0; i < this.ITR_JSON.exemptIncomes.length; i++) {
        const formGroup = exemptIncomesFormArray.controls.filter((item: any) => item.controls['incomeType'].value === this.ITR_JSON.exemptIncomes[i].natureDesc)[0] as FormGroup;
        formGroup.controls['incomeValue'].setValue(this.ITR_JSON.exemptIncomes[i].amount);
      }
    }
  }

  getTotal() {
    let dividendIncomes = this.otherIncomeFormGroup.controls['dividendIncomes'] as FormGroup;
    let q1 = dividendIncomes.controls['quarter1'].value ? dividendIncomes.controls['quarter1'].value : '0';
    let q2 = dividendIncomes.controls['quarter1'].value ? dividendIncomes.controls['quarter2'].value : '0';
    let q3 = dividendIncomes.controls['quarter1'].value ? dividendIncomes.controls['quarter3'].value : '0';
    let q4 = dividendIncomes.controls['quarter1'].value ? dividendIncomes.controls['quarter4'].value : '0';
    let q5 = dividendIncomes.controls['quarter1'].value ? dividendIncomes.controls['quarter5'].value : '0';
    return parseInt(q1) + parseInt(q2) + parseInt(q3) + parseInt(q4) + parseInt(q5);
  }
  calFamPension() {
    let famPenDeduction = 0;
    let familyPension = this.otherIncomeFormGroup.controls['familyPension'];
    let totalFamPenDeduction = familyPension.value;
    if ((familyPension.valid || familyPension.disabled)) {
      famPenDeduction = familyPension.value / 3 > 15000 ? 15000 : familyPension.value / 3;
      this.otherIncomeFormGroup.controls['famPenDeduction'].setValue(famPenDeduction.toFixed());
      this.otherIncomeFormGroup.controls['totalFamPenDeduction'].setValue((familyPension.value - famPenDeduction).toFixed());
    }
  }

  formatToolTip(params: any) {
    const nameArray = this.exemptIncomesDropdown.filter((item: any) => item.value === params.natureDesc);
    let temp = nameArray[0].label;
    const lineBreak = false;
    return { temp, lineBreak }
  }

  getTotalExemptIncome() {
    let total = 0;
    for (let i = 0; i < this.exemptIncomesFormArray.controls.length; i++) {
      if (this.utilsService.isNonZero(this.exemptIncomesFormArray.controls[i].value.incomeValue)) {
        total = total + Number(this.exemptIncomesFormArray.controls[i].value.incomeValue);
      }
    }
    return total;
  }

  editForm(type) {
    if (type === 'otherIncome') {
      this.isEditOtherIncome = true;
      this.otherIncomeFormGroup.enable();
    } else if (type === 'exemptIncome') {
      this.isEditExemptIncome = true;
      this.exemptIncomeFormGroup.enable();
    }
  }
}
