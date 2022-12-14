import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';

@Component({
  selector: 'app-professional-dialog',
  templateUrl: './professional-dialog.component.html',
  styleUrls: ['./professional-dialog.component.scss']
})
export class ProfessionalDialogComponent implements OnInit {

  natureOfBusinessDropdownAll: any;
  natureOfProfessionDropdown: any;
  loading = false;
  professionForm: FormGroup;
  constructor(
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ProfessionalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getMastersData();
    this.initProfessionForm(this.data.data);
  }

  initProfessionForm(obj?: professionalIncome) {
    this.professionForm = this.formBuilder.group({
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      receipts: [obj?.receipts || null, Validators.required],
      presumptiveIncome: [obj?.presumptiveIncome || null, Validators.required],
    });
  }

  getMastersData() {
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.natureOfProfessionDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44ADA');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
    });
  }



  saveBusinessDetails() {
    this.dialogRef.close(this.professionForm.value)
  }

  cancel() {
    this.dialogRef.close();
  }
}
