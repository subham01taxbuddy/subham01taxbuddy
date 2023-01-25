import { result } from 'lodash';
import { concatMap, Observable } from 'rxjs';
import { UtilsService } from './../../../services/utils.service';
import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { TitleCasePipe } from '@angular/common';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.css'],
  providers: [TitleCasePipe]
})
export class DeclarationComponent implements OnInit {
    @Output() saveAndNext = new EventEmitter<any>();
    
  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  declarationsForm: FormGroup;
  constructor(private titleCasePipe: TitleCasePipe,
    private fb: FormBuilder,
    private itrMsService: ItrMsService,
    private router: Router,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

  }

  ngOnInit() {
    this.declarationsForm = this.fb.group({
      name: ['', /* Validators.pattern(AppConstants.charRegex) */],
      childOf: ['', Validators.compose([Validators.required, /* Validators.pattern(AppConstants.charRegex) */])],
      capacity: '',
      panNumber: ['', [Validators.required, Validators.pattern(AppConstants.panIndividualRegex)]],
      place: ['', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
    });

    if (this.ITR_JSON.declaration !== null) {
      this.declarationsForm.controls['panNumber'].setValue(this.ITR_JSON.declaration.panNumber);
      this.declarationsForm.controls['capacity'].setValue(this.ITR_JSON.declaration.capacity);
      this.declarationsForm.patchValue(this.ITR_JSON.declaration);
    }

    if (this.ITR_JSON.assesseeType === 'INDIVIDUAL') {
      if (this.ITR_JSON.family.length > 0) {
        for (let i = 0; i <= this.ITR_JSON.family.length; i++) {
          if (this.ITR_JSON.family[i].relationShipCode === 'SELF') {
            this.declarationsForm.controls['name'].setValue(this.setName(this.ITR_JSON.family[i]));
            if (this.utilsService.isNonEmpty(this.ITR_JSON.declaration) ? (this.ITR_JSON.declaration.childOf !== null && this.ITR_JSON.declaration.childOf !== '') : false) {
              this.declarationsForm.controls['childOf'].setValue(this.titleCasePipe.transform(this.ITR_JSON.declaration.childOf));
            } else {
              this.declarationsForm.controls['childOf'].setValue(this.setChildOf(this.ITR_JSON.family[i], 'INDIVIDUAL'));
            }
            break;
          }
        }
      }

      this.declarationsForm.controls['name'].disable();
      this.declarationsForm.controls['childOf'].setValidators([Validators.required/* , Validators.pattern(AppConstants.charRegex) */]);
      this.declarationsForm.controls['capacity'].patchValue('Self');
      this.declarationsForm.controls['panNumber'].disable();
      this.declarationsForm.controls['panNumber'].setValue(this.ITR_JSON.panNumber);
    } else {
      if (this.ITR_JSON.family.length > 0) {
        for (let i = 0; i <= this.ITR_JSON.family.length; i++) {
          if (this.ITR_JSON.family[i].relationShipCode === 'SELF') {
            this.declarationsForm.controls['name'].setValue(this.ITR_JSON.family[i].fName);
            this.declarationsForm.controls['childOf'].setValue(this.setChildOf(this.ITR_JSON.family[i], 'HUF'));
            break;
          }
        }
      }
      this.declarationsForm.controls['name'].setValidators([Validators.required/* , Validators.pattern(AppConstants.charRegex) */]);
      this.declarationsForm.controls['childOf'].setValidators([Validators.required]);
      this.declarationsForm.controls['capacity'].patchValue('Karta');
      this.declarationsForm.controls['panNumber'].setValidators([Validators.required, Validators.pattern(AppConstants.panIndividualRegex)]);
    }
  }
  setName(family) {
    const name = this.utilsService.isNonEmpty(family.fName) ? family.fName : '';
    const mName = this.utilsService.isNonEmpty(family.mName) ? family.mName : '';
    const lName = this.utilsService.isNonEmpty(family.lName) ? family.lName : '';
    return name + ' ' + mName + ' ' + lName;
  }
  setChildOf(family, type) {
    if (type === 'INDIVIDUAL') {
      if (this.utilsService.isNonEmpty(family.fatherName)) {
        return this.titleCasePipe.transform(family.fatherName); // + " " + family.lName
      } else {
        return '';
      }
    } else {
      return this.utilsService.isNonEmpty(family.mName) ? this.titleCasePipe.transform(family.mName) : '';
    }
  }
  initCap(control) {
    control.setValue(this.titleCasePipe.transform(control.value));
  }

  saveAndContinue() {
    if (this.declarationsForm.valid) {
      this.loading = true;

      this.checkITRTypeChanged();
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  getITRType() {
  
    this.loading = true;
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe((ITR_RESULT: ITR_JSON) => {
      this.ITR_JSON = ITR_RESULT;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.loading = false;
      //if(this.ITR_JSON.itrType === '3') {
      //  alert('This is ITR 3 and can not be filed from backoffice');
      //  return;
      //}
      this.saveAndNext.emit(true);
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to update details, Please try again.');
    });
  }

  checkITRTypeChanged() {
    // if (this.ITR_JSON.systemFlags.hasSalary && this.ITR_JSON.employers.length > 0) {
    //   this.ITR_JSON.employerCategory = this.ITR_JSON.employers[0].employerCategory;
    // }
    
    const param = '/tax';
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
      console.log('result is=====', result);
      sessionStorage.setItem(AppConstants.TAX_SUM, JSON.stringify(result));
      if (result.taxSummary.automated) {
        if (result.taxSummary.changeItr) {
          //reinitialise the objects so as to get the data updated in other tabs
          this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    
          this.ITR_JSON.itrType = result.taxSummary.itrType;
          this.ITR_JSON.declaration = this.declarationsForm.getRawValue();
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.checkITRTypeChanged();
          console.log('Call again this service here');
        } else {
          //reinitialise the objects so as to get the data updated in other tabs
          this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
          this.ITR_JSON.declaration = this.declarationsForm.getRawValue();

          this.getITRType();
        }
      } else {
        this.loading = false;
        alert('Manual Flow')
      }

    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to calculate tax, Please try again.');
    });
  }
}
