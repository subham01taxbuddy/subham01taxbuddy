import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-schedule-tr',
  templateUrl: './schedule-tr.component.html',
  styleUrls: ['./schedule-tr.component.scss'],
})
export class ScheduleTrComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  scheduleTrForm: FormGroup;
  selectedOption: string;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  constructor(private fb: FormBuilder, private location: Location) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.scheduleTrForm = this.initForm();

    if (this.ITR_JSON.taxReliefClaimed.length > 0) {
      this.ITR_JSON.taxReliefClaimed.forEach((trElement, trIndex) => {
        const headOfIncomeArray = trElement.headOfIncome.map(
          (element, index) => ({
            id: 0,
            incomeType: element.incomeType,
            outsideIncome: element.outsideIncome,
            outsideTaxPaid: element.outsideTaxPaid,
            taxPayable: element.taxPayable,
            taxRelief: element.taxRelief,
            claimedDTAA: trElement.claimedDTAA,
          })
        );

        const formGroup = {
          hasEdit: false,
          countryCode: trElement.countryCode,
          tinNumber: trElement.taxPayerID,
          totalTxsPaidOutInd: headOfIncomeArray[0].outsideTaxPaid,
          totalTxsRlfAvlbl: headOfIncomeArray[0].taxRelief,
          section: trElement.reliefClaimedUsSection,
          amtOfTaxRef: 0,
          assYr: 0,
        };

        console.log(formGroup, 'formGroup');
        this.add(formGroup);
      });
    } else {
      this.add();
    }

    this.selectedOption = 'no';
  }

  initForm() {
    return this.fb.group({
      trArray: this.fb.array([]),
    });
  }

  get getTrArray() {
    return <FormArray>this.scheduleTrForm.get('trArray');
  }

  add(item?) {
    const trArray = <FormArray>this.scheduleTrForm.get('trArray');
    trArray.push(this.createTrForm(item));
  }

  createTrForm(item?): FormGroup {
    const formGroup = this.fb.group({
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      totalTxsPaidOutInd: [item ? item.totalTxsPaidOutInd : null],
      totalTxsRlfAvlbl: [item ? item.totalTxsRlfAvlbl : null],
      section: [item ? item.section : null],
      selectedOption: new FormControl('no'),
      amtOfTaxRef: [item ? item.amtOfTaxRef : null],
      assYr: [item ? item.assYr : null],
    });

    return formGroup;
  }

  handleSelectionChange(event) {
    this.selectedOption = event;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    if (this.scheduleTrForm.valid) {
      console.log(this.scheduleTrForm);
    }
  }
}
