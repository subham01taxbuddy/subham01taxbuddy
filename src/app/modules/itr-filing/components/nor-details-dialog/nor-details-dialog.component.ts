import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants'
import { UtilsService } from 'src/app/services/utils.service'
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface'

@Component({
  selector: 'app-nri-details-dialog',
  templateUrl: './nor-details-dialog.component.html',
  styleUrls: ['./nor-details-dialog.component.scss']
})
export class NorDetailsDialogComponent implements OnInit {
  norDetailsForm: UntypedFormGroup

  ITR_JSON: ITR_JSON;

  conditionsList = [
    {
      key: 'NOR_6_6_A1',
      label: 'You have been a non-resident in India in 9 out of 10 preceding years [section 6(6)(a)]'
    },
    {
      key: 'NOR_6_6_A2',
      label: 'You have been in India for 729 days or less during the 7 preceding years [section 6(6)(a)]'
    },
    {
      key: 'NOR_6_6_C',
      label: 'You are a citizen of India or person of Indian origin, who comes on a visit to India, having total income, other than the income from foreign sources, exceeding Rs. 15 lakh and have been in India for 120 days or more but less than 182 days during the previous year [section 6(6)(c)]'
    },
    {
      key: 'NOR_6_6_D',
      label: 'You are a citizen of India having total income, other than the income from foreign sources, exceeding Rs. 15 lakh during the previous year and not liable to tax in any other country or territory by reason of your domicile or residence or any other criteria of similar nature [section 6(6)(d) rws 6(1A)]'
    }

];

  constructor(public dialogRef: MatDialogRef<NorDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.info('Data:', this.data)
    this.norDetailsForm = this.fb.group({
      conditionsNorStatus: [this.ITR_JSON.conditionsNorStatus],
    });

  }

  saveDetails() {
    let data = {
      data: this.norDetailsForm.getRawValue(),
      success: true
    }
    if (this.norDetailsForm.valid)
      this.dialogRef.close(data);
    console.log(data)
  }

}
