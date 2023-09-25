import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-tr',
  templateUrl: './schedule-tr.component.html',
  styleUrls: ['./schedule-tr.component.scss'],
})
export class ScheduleTrComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  scheduleTrForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  totalOutsideTaxPaid = 0;
  totalTaxRelief = 0;
  sectionValue = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.scheduleTrForm = this.initForm();

    if (this.ITR_JSON.taxReliefClaimed.length > 0) {
      this.ITR_JSON.taxReliefClaimed.forEach((trElement, trIndex) => {
        const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
          id: 0,
          incomeType: element.incomeType,
          outsideIncome: element.outsideIncome,
          outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0), // Convert to number, default to 0 if undefined
          taxPayable: parseFloat(element.taxPayable || 0), // Convert to number, default to 0 if undefined
          taxRelief: parseFloat(element.taxRelief || 0), // Convert to number, default to 0 if undefined
          claimedDTAA: trElement.claimedDTAA,
        }));

        let outsideTaxPaid = 0;
        let taxRelief = 0;

        const formGroup = {
          hasEdit: false,
          countryCode: trElement.countryCode,
          tinNumber: trElement.taxPayerID,
          totalTxsPaidOutInd: 0, // Initialize to 0
          totalTxsRlfAvlbl: 0, // Initialize to 0
          section: trElement.reliefClaimedUsSection,
        };

        console.log(formGroup, 'formGroup');
        this.add(formGroup);

        headOfIncomeArray.forEach((element, i) => {
          outsideTaxPaid += element.outsideTaxPaid;
          console.log(outsideTaxPaid, i, 'outsideTaxPaid');
          this.getTrArray.controls[trIndex]
            .get('totalTxsPaidOutInd')
            .setValue(outsideTaxPaid);

          taxRelief += element.taxRelief;
          console.log(taxRelief, i, 'taxRelief');
          this.getTrArray.controls[trIndex]
            .get('totalTxsRlfAvlbl')
            .setValue(taxRelief);
        });

        if (
          this.ITR_JSON.taxAmountRefunded ||
          this.ITR_JSON.taxReliefAssessmentYear
        ) {
          this.getTrArray.controls[trIndex]
            .get('selectedOption')
            .setValue('yes');
        }

        // Update individual totals
        this.getTrArray.controls[trIndex]
          .get('totalTxsPaidOutInd')
          .setValue(outsideTaxPaid);
        this.getTrArray.controls[trIndex]
          .get('totalTxsRlfAvlbl')
          .setValue(taxRelief);
      });

      // Calculate cumulative totals
      this.totalOutsideTaxPaid = this.ITR_JSON.taxReliefClaimed.reduce(
        (acc, trElement) => {
          const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
            outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0),
            taxRelief: parseFloat(element.taxRelief || 0),
          }));

          const totalOutsideTaxPaid = headOfIncomeArray.reduce(
            (sum, element) => sum + element.outsideTaxPaid,
            0
          );

          return acc + totalOutsideTaxPaid;
        },
        0
      );

      this.totalTaxRelief = this.ITR_JSON.taxReliefClaimed.reduce(
        (acc, trElement) => {
          const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
            outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0),
            taxRelief: parseFloat(element.taxRelief || 0),
          }));

          const totalTaxRelief = headOfIncomeArray.reduce(
            (sum, element) => sum + element.taxRelief,
            0
          );

          return acc + totalTaxRelief;
        },
        0
      );
    } else {
      this.add();
    }
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
      selectedOption: [item ? item.selectedOption : 'no'],
      amtOfTaxRef: [item ? item.amtOfTaxRef : null],
      assYr: [item ? item.assYr : null],
    });

    return formGroup;
  }

  handleSelectionChange(event) {
    this.getTrArray.controls[0].get('selectedOption').setValue(event);
    console.log(
      'selectedOption:',
      this.getTrArray.controls[0].get('selectedOption')
    );
  }

  handleSectionChange(event, index) {
    this.sectionValue = (event.target as HTMLInputElement).value;
    console.log(this.sectionValue);
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    if (this.scheduleTrForm.valid) {
      this.loading = true;
      console.log(this.scheduleTrForm);

      this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.Copy_ITR_JSON.taxReliefClaimed.forEach((element, index) => {
        element.reliefClaimedUsSection =
          this.getTrArray.controls[index].get('section').value;
      });

      this.Copy_ITR_JSON.taxReliefAssessmentYear =
        this.getTrArray.controls[0].get('assYr').value;
      this.Copy_ITR_JSON.taxAmountRefunded =
        this.getTrArray.controls[0].get('amtOfTaxRef').value;

      console.log(this.Copy_ITR_JSON.taxReliefClaimed, 'taxreliefClaimed');

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          // have to set the ITR_JSON to result once it is fixed from backend
          this.ITR_JSON = this.Copy_ITR_JSON;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar('Schedule FSI updated successfully');
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
    }
  }
}
