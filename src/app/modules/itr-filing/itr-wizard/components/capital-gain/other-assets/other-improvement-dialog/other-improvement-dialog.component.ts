import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { FormControl } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Input } from '@angular/core';
import {
  Improvement,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';

@Component({
  selector: 'app-other-improvement-dialog',
  templateUrl: './other-improvement-dialog.component.html',
  styleUrls: ['./other-improvement-dialog.component.scss'],
})
export class OtherImprovementDialogComponent implements OnInit {
  financialyears = [];
  improvementYears = [];
  improvementForm!: FormGroup;
  isImprovement = new FormControl(false);

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<OtherImprovementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService
  ) {
    this.getImprovementYears();
  }

  ngOnInit() {
    console.log('On Inti');
    this.improvementForm = this.fb.group({
      // srn: ['', [Validators.required]],
      financialYearOfImprovement: ['', [Validators.required]],
      costOfImprovement: [
        '',
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],
      indexCostOfImprovement: [''],
    });
    if (this.data.mode === 'EDIT') {
      this.improvementForm.patchValue(this.data.improvement);
      this.assetSelected();
    }
  }

  assetSelected() {
    let selectedAsset = this.improvementForm.controls['srn'].value;
    let assetDetails = this.data.assetDetails.filter(
      (item) => item.srn === selectedAsset
    )[0];
    if (assetDetails.gainType === 'LONG') {
      this.improvementForm.controls['indexCostOfImprovement'].enable();
    } else {
      this.improvementForm.controls['indexCostOfImprovement'].disable();
    }
    let purchaseDate = assetDetails.purchaseDate;
    let purchaseYear = new Date(purchaseDate).getFullYear();
    console.log(
      this.financialyears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
    );
    console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
    this.improvementYears = this.financialyears.splice(
      this.financialyears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
    );
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) console.log('FY : ', res);
      this.financialyears = res.data;
      this.improvementYears = this.financialyears;
      // sessionStorage.setItem('improvementYears', res.data)
    });
  }

  calculateIndexCost() {
    let selectedAsset = this.improvementForm.controls['srn'].value;
    let assetDetails = this.data.assetDetails.filter(
      (item) => item.srn === selectedAsset
    )[0];
    if (assetDetails.gainType === 'LONG') {
      let req = {
        cost: this.improvementForm.controls['costOfImprovement'].value,
        purchaseOrImprovementFinancialYear:
          this.improvementForm.controls['financialYearOfImprovement'].value,
        assetType: 'GOLD',
        // "buyDate": this.immovableForm.controls['purchaseDate'].value,
        // "sellDate": this.immovableForm.controls['sellDate'].value
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        this.improvementForm.controls['indexCostOfImprovement'].setValue(
          res.data.costOfAcquisitionOrImprovement
        );
      });
    } else {
      this.improvementForm.controls['indexCostOfImprovement'].setValue(null);
    }
  }

  haveImprovement() {
    console.log('improvement===', this.isImprovement.value);
    const improvements = <FormArray>this.improvementForm.get('isImprovement');
    if (this.isImprovement.value) {
      improvements.push(this.createImprovementForm());
    } else {
      console.log('isImprovement==', this.isImprovement);
      // TODO
      // if (coOwner.length > 0 && (this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].name.value) || this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].panNumber.value) ||
      // this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].percentage.value))) {
      // this.confirmationDialog('CONFIRM_COOWNER_DELETE');
      // } else {
      this.isImprovement.setValue(false);
      this.improvementForm.controls['isImprovement'] = this.fb.array([]);
      // }
    }
  }

  createImprovementForm(
    obj: {
      financialYearOfImprovement?: string;
      costOfImprovement?: number;
      indexCostOfImprovement?: number;
    } = {}
  ): FormGroup {
    return this.fb.group({
      financialYearOfImprovement: [
        obj.financialYearOfImprovement || '',
        [Validators.required],
      ],
      costOfImprovement: [obj.costOfImprovement || '', [Validators.required]],
      indexCostOfImprovement: [
        obj.indexCostOfImprovement || 0,
        [Validators.required],
      ],
    });
  }

  addMoreImprovement() {
    const coOwner = <FormArray>this.improvementForm.get('isImprovement');
    if (coOwner.valid) {
      coOwner.push(this.createImprovementForm());
    } else {
      console.log('add above details first');
    }
  }
}
