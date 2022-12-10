import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-other-improvement-dialog',
  templateUrl: './other-improvement-dialog.component.html',
  styleUrls: ['./other-improvement-dialog.component.scss']
})
export class OtherImprovementDialogComponent implements OnInit {
  improvementYears = [];
  improvementForm!: FormGroup;

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<OtherImprovementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService) {
    this.getImprovementYears();
  }

  ngOnInit() {
    console.log('On Inti');
    this.improvementForm = this.fb.group({
      srn: ['', [Validators.required]],
      financialYearOfImprovement: ['', [Validators.required]],
      costOfImprovement: ['', [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      indexCostOfImprovement: [''],
    });
    if (this.data.mode === 'EDIT') {
      this.improvementForm.patchValue(this.data.improvement);
    }
  }
  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success)
        console.log('FY : ', res);
      this.improvementYears = res.data;
      // sessionStorage.setItem('improvementYears', res.data)
    })
  }

  saveDetails() {
    this.dialogRef.close(this.improvementForm.value)
  }

  cancel() {
    this.dialogRef.close()
  }

  calculateIndexCost() {
    let req = {
      "cost": this.improvementForm.controls['costOfImprovement'].value,
      "purchaseOrImprovementFinancialYear": this.improvementForm.controls['financialYearOfImprovement'].value,
      "assetType": "GOLD",
      // "buyDate": this.immovableForm.controls['purchaseDate'].value,
      // "sellDate": this.immovableForm.controls['sellDate'].value
    }
    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('INDEX COST : ', res);
      this.improvementForm.controls['indexCostOfImprovement'].setValue(res.data.costOfAcquisitionOrImprovement);
    })
  }

}
