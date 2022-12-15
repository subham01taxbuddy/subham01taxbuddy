import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
declare let $: any;

@Component({
  selector: 'app-director-in-company',
  templateUrl: './director-in-company.component.html',
  styleUrls: ['./director-in-company.component.scss']
})
export class DirectorInCompanyComponent implements OnInit {
  loading = false;
  directorForm: FormGroup;
  bankList: any;
  countryDropdown: any;
  bankTooltip: string;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  sharesTypes = [
    { value: 'LISTED', label: 'Listed' },
    { value: 'UN_LISTED', label: 'Unlisted' }
  ];
  typeOfCompanies = [
    { value: 'D', label: 'Domestic' },
    { value: 'F', label: 'Foreign' }
  ];
  constructor(private fb: FormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<DirectorInCompanyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.Copy_ITR_JSON.directorInCompany === null || this.Copy_ITR_JSON.directorInCompany === undefined) {
      this.Copy_ITR_JSON.directorInCompany = [];
    }
    this.directorForm = this.createDirectorForm();
    if (this.data.mode === 'EDIT') {
      this.directorForm.patchValue(this.ITR_JSON.directorInCompany[this.data.index]);
    }
  }

  createDirectorForm() {
    return this.fb.group({
      companyName: ['', Validators.required],
      typeOfCompany: ['', Validators.required],
      companyPAN: ['', Validators.compose([Validators.pattern(AppConstants.panNumberRegex)])],
      sharesType: [null, Validators.required],
      din: ['', Validators.compose([Validators.pattern(AppConstants.numericRegex), /* Validators.maxLength(8), Validators.minLength(8) */])],
    });
  }


  saveDirectorDetials() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.directorForm.valid) {
      this.Copy_ITR_JSON.systemFlags.directorInCompany = true;
      console.log('Save form here', this.directorForm.getRawValue());
      if (this.data.mode === 'ADD') {
        this.Copy_ITR_JSON.directorInCompany.push(this.directorForm.getRawValue());
      } else {
        this.Copy_ITR_JSON.directorInCompany.splice(this.data.index, 1, this.directorForm.getRawValue());
      }

      this.serviceCall();
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  serviceCall() {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(result => {
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
      this.loading = false;
      this.utilsService.showSnackBar('Director in company details added successfully');
      // this.saveAndNext.emit(true);
      this.dialogRef.close(result);
      this.directorForm.reset();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
    });
  }
}
