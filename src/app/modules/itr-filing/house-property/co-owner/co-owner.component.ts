import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-co-owner',
  templateUrl: './co-owner.component.html',
  styleUrls: ['./co-owner.component.scss']
})
export class CoOwnerComponent implements OnInit {
  coOwnerForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<CoOwnerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder) { }

  ngOnInit() {
    console.log(this.data)
    this.coOwnerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      // isSelf: [obj.isSelf || false],
      panNumber: ['', Validators.pattern(AppConstants.panNumberRegex)],
      percentage: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.max(99), Validators.min(1), Validators.pattern(AppConstants.numericRegex)])],
    })
  }

  addCoOwner() {
    if (!this.isDuplicatePAN() && !this.calPercentage()) {
      console.info(this.coOwnerForm.getRawValue())
    }
  }

  isDuplicatePAN() {
    const dup = this.data.coOwners.filter(item => item.panNumber === (this.coOwnerForm.controls['panNumber'].value));
    if (dup.length > 1) {
      return true;
    } else {
      return false;
    }
  }
  calPercentage() {
    // const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    let sum = 0;
    this.data.coOwners.forEach(controlName => {
      sum = sum + controlName.percentage;
    });

    if (sum > 99) {
      // this.snackBar.open('Percentage should not be greater than 99.', 'OK', {
      //   verticalPosition: 'top',
      //   duration: 3000
      // });
      return true;
    } else {
      return false;
    }
  }

  coOwnerPanValidation() {
    // const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    // // This method is written in utils service for common usablity.
    // let panRepeat: boolean = this.utilsService.checkDuplicateInObject('panNumber', coOwner.value);
    // let userPanExist = [];
    // if (coOwner.value instanceof Array) {
    //   userPanExist = coOwner.value.filter(item => item.panNumber === this.ITR_JSON.panNumber);
    // }

    // if (panRepeat) {
    //   this.utilsService.showSnackBar('Co-Owner already present with this PAN.');
    // } else if (userPanExist.length > 0) {
    //   this.utilsService.showSnackBar('Co-Owners PAN can not be same with user PAN.');
    //   panRepeat = true;
    // }
    // console.log('Form + coowner=', this.housePropertyForm.valid);
    // return panRepeat;
  }

}
