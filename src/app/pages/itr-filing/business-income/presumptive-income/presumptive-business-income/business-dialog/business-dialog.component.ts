import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { businessIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';

@Component({
  selector: 'app-business-dialog',
  templateUrl: './business-dialog.component.html',
  styleUrls: ['./business-dialog.component.scss']
})
export class BusinessDialogComponent implements OnInit {
  natureOfBusinessDropdownAll: any;
  natureOfBusinessDropdown: any;
  loading = false;
  businessForm: FormGroup;
  constructor(
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BusinessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getMastersData();
    this.initBusinessForm(this.data.data);
  }

  initBusinessForm(obj?: businessIncome) {
    this.businessForm = this.formBuilder.group({
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeOfBusiness: [obj?.tradeOfBusiness || null, [Validators.required,Validators.pattern(AppConstants.charRegex)]],
      receiptBank: [obj?.receiptBank || null, Validators.required],
      income6: [obj?.income6 || null, Validators.required],
      receiptMode: [obj?.receiptMode || null, Validators.required],
      income8: [obj?.income8 || null, Validators.required],
    });
  }

  getMastersData() {
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44ADA');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
    });
  }



  saveBusinessDetails() {
    this.dialogRef.close(this.businessForm.value)
  }

  cancel() {
    this.dialogRef.close();
  }
}
