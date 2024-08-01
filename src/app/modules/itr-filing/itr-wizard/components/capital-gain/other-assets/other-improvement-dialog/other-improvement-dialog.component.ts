import { ItrMsService } from 'src/app/services/itr-ms.service';
import {
  Component,
  Inject,
  OnInit,
  SimpleChanges, Input
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-other-improvement-dialog',
  templateUrl: './other-improvement-dialog.component.html',
})
export class OtherImprovementDialogComponent implements OnInit {
  financialyears = [];
  improvementYears = [];
  improvementForm!: UntypedFormGroup;
  improvements: UntypedFormArray;
  isImprovement = new UntypedFormControl();

  @Input() isAddOtherAssetsImprovement: number;
  config: any;

  constructor(
    public fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<OtherImprovementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService
  ) {
    this.getImprovementYears();
  }

  ngOnInit() {
    console.log('On Inti');
    this.improvementForm = this.fb.group({
      isImprovement: ['', [Validators.required]],
      improvements: this.fb.array([]),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddOtherAssetsImprovement) {
        this.haveImprovement();
      }
    }, 1000);
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

  haveImprovement(item?) {
    console.log('improvement===', this.isImprovement.value);
    const improvements = <UntypedFormArray>this.improvementForm.get('improvements');
    if (improvements.valid || improvements === null) {
      improvements.push(this.createImprovementForm());
    }
  }

  createImprovementForm(
    obj: {
      isImprovement?: boolean;
      financialYearOfImprovement?: string;
      costOfImprovement?: number;
      indexCostOfImprovement?: number;
    } = {}
  ): UntypedFormGroup {
    return this.fb.group({
      isImprovement: [false, [Validators.required]],
      financialYearOfImprovement: [
        obj.financialYearOfImprovement || '',
        [Validators.required],
      ],
      costOfImprovement: [obj.costOfImprovement || 0, [Validators.required]],
      indexCostOfImprovement: [
        obj.indexCostOfImprovement || 0,
        [Validators.required],
      ],
    });
  }

  get getOtherAssetsImprovement() {
    return <UntypedFormArray>this.improvementForm.get('improvements');
  }
}
