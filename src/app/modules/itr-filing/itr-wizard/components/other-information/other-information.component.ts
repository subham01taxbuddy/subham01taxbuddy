import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { DirectorInCompanyComponent } from './director-in-company/director-in-company.component';
import { UnlistedSharesComponent } from './unlisted-shares/unlisted-shares.component';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-other-information',
  templateUrl: './other-information.component.html',
  styleUrls: ['./other-information.component.scss']
})
export class OtherInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  @Input() isEditOther = false;

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading = false;
  directorForm: FormGroup;
  config: any;
  sharesTypes = [
    { value: 'LISTED', label: 'Listed' },
    { value: 'UN_LISTED', label: 'Unlisted' }
  ];
  typeOfCompanies = [
    { value: 'D', label: 'Domestic' },
    { value: 'F', label: 'Foreign' }
  ];

  sharesForm: FormGroup;

  constructor(public matDialog: MatDialog,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
              private fb: FormBuilder) {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.ITR_JSON.unlistedSharesDetails === null || this.ITR_JSON.unlistedSharesDetails === undefined) {
      this.ITR_JSON.unlistedSharesDetails = [];
    }
    if (this.ITR_JSON?.directorInCompany === null || this.ITR_JSON?.directorInCompany === undefined) {
      this.ITR_JSON.directorInCompany = [];
    }
    if (!this.ITR_JSON.systemFlags?.directorInCompany) {
      if (this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.directorInCompany = false;
      } else {
        this.ITR_JSON.systemFlags = {
          hasSalary: false,
          hasHouseProperty: false,
          hasMultipleProperties: false,
          hasForeignAssets: false,
          hasCapitalGain: false,
          hasBroughtForwardLosses: false,
          hasAgricultureIncome: false,
          hasOtherIncome: false,
          hasParentOverSixty: false,
          hasBusinessProfessionIncome: false,
          hasFutureOptionsIncome: false,
          hasNRIIncome: false,
          hraAvailed: false,
          directorInCompany: false,
          haveUnlistedShares: false
        }
      }
    }
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON))
    this.sharesCallInConstructor();
    this.directorCallInConstructor();
  }

  ngOnInit() {
    this.isEditable();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isEditable();
  }

  isEditable() {
    return this.isEditOther;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  get getDirectorsArray() {
    return <FormArray>this.directorForm.get('directorsArray');
  }
  get getSharesArray() {
    return <FormArray>this.sharesForm.get('sharesArray');
  }

  initDirectorForm() {
    return this.fb.group({
      directorsArray: this.fb.array([]),
    })
  }

  initSharesForm() {
    return this.fb.group({
      sharesArray: this.fb.array([]),
    })
  }

  createDirectorForm(director?: any) {
    return this.fb.group({
      hasEdit:[false],
      companyName: [director?.companyName, Validators.required],
      typeOfCompany: [director?.typeOfCompany, Validators.required],
      companyPAN: [director?.companyPAN, Validators.compose([Validators.pattern(AppConstants.panNumberRegex)])],
      sharesType: [director?.sharesType, Validators.required],
      din: [director?.din, Validators.compose([Validators.pattern(AppConstants.numericRegex), /* Validators.maxLength(8), Validators.minLength(8) */])],
    });
  }

  createSharesForm(share?:any) {
    return this.fb.group({
      hasEdit:[false],
      companyName: [share?.companyName, Validators.required],
      typeOfCompany: [share?.typeOfCompany, Validators.required],
      companyPAN: [share?.companyPAN, Validators.compose([Validators.pattern(AppConstants.panNumberRegex)])],
      openingShares: [share?.openingShares, Validators.compose([Validators.pattern(AppConstants.amountWithoutDecimal)])],
      openingCOA: [share?.openingCOA, Validators.compose([Validators.pattern(AppConstants.amountWithDecimal)])],
      acquiredShares: [share?.acquiredShares, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      purchaseDate: [share?.purchaseDate, Validators.required],
      faceValuePerShare: [share?.faceValuePerShare, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])],
      issuePricePerShare: [share?.issuePricePerShare, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      purchasePricePerShare: [share?.purchasePricePerShare, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])],
      transferredShares: [share?.transferredShares, Validators.compose([Validators.pattern(AppConstants.amountWithoutDecimal)])],
      saleConsideration: [share?.saleConsideration, Validators.compose([Validators.pattern(AppConstants.amountWithDecimal)])],
      closingShares: [share?.closingShares, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      closingCOA: [share?.closingCOA, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])]
    });
  }

  saveDirectorDetials() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.directorForm.valid) {
      console.log('Save form here', this.directorForm.getRawValue());
      const directorsArray = <FormArray>this.directorForm.get('directorsArray');
      this.Copy_ITR_JSON.directorInCompany = directorsArray.getRawValue();
      this.Copy_ITR_JSON.systemFlags.directorInCompany = this.Copy_ITR_JSON.directorInCompany.length > 0;
      // if (this.data.mode === 'ADD') {
      //   this.Copy_ITR_JSON.directorInCompany.push(this.directorForm.getRawValue());
      // } else {
      //   this.Copy_ITR_JSON.directorInCompany.splice(this.data.index, 1, this.directorForm.getRawValue());
      // }

      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(result => {
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
        this.loading = false;
        this.utilsService.showSnackBar('Director in company details added successfully');
        // this.saveAndNext.emit(true);
        // this.directorForm.reset();
      }, error => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }


  tabChanged() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.ITR_JSON.unlistedSharesDetails === null || this.ITR_JSON.unlistedSharesDetails === undefined) {
      this.ITR_JSON.unlistedSharesDetails = [];
    }
    if (this.ITR_JSON?.directorInCompany === null || this.ITR_JSON?.directorInCompany === undefined) {
      this.ITR_JSON.directorInCompany = [];
    }
    if (!this.ITR_JSON.systemFlags?.directorInCompany) {
      if (this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.directorInCompany = false;
      } else {
        this.ITR_JSON.systemFlags = {
          hasSalary: false,
          hasHouseProperty: false,
          hasMultipleProperties: false,
          hasForeignAssets: false,
          hasCapitalGain: false,
          hasBroughtForwardLosses: false,
          hasAgricultureIncome: false,
          hasOtherIncome: false,
          hasParentOverSixty: false,
          hasBusinessProfessionIncome: false,
          hasFutureOptionsIncome: false,
          hasNRIIncome: false,
          hraAvailed: false,
          directorInCompany: false,
          haveUnlistedShares: false
        }
      }
    }
  }

  ChangeSharesStatus() {

    if (this.ITR_JSON.systemFlags.haveUnlistedShares) {
      this.addSharesDetails('Add unlisted shares details', 'ADD', null);
    } else {
      if (this.ITR_JSON.unlistedSharesDetails.length > 0) {
        this.Copy_ITR_JSON.unlistedSharesDetails = [];
        (this.sharesForm.controls['sharesArray'] as FormArray).clear();
        this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = false;
        this.serviceCall('Unlisted shares')
      }
    }
  }

  addSharesDetails(title, mode, i) {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    formArray.insert(0, this.createSharesForm());
  }

  sharesCallInConstructor() {
    this.sharesForm = this.initSharesForm();
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    for (let i = 0; i < this.ITR_JSON?.unlistedSharesDetails.length; i++) {
      const val = this.ITR_JSON.unlistedSharesDetails[i];
      const temp = {
        id: i + 1,
        companyName: val.companyName,
        typeOfCompany: val.typeOfCompany,
        companyPAN: val.companyPAN,
        openingShares: val.openingShares,
        openingCOA: val.openingCOA,
        acquiredShares: val.acquiredShares,
        purchaseDate: val.purchaseDate,
        faceValuePerShare: val.faceValuePerShare,
        issuePricePerShare: val.issuePricePerShare,
        purchasePricePerShare: val.purchasePricePerShare,
        transferredShares: val.transferredShares,
        saleConsideration: val.saleConsideration,
        closingShares: val.closingShares,
        closingCOA: val.closingCOA
      };
      formArray.push(this.createSharesForm(temp));
    }
  }

  editSharesForm(index) {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    formArray.controls[index].enable();
  }

  editDirectorForm(index) {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    formArray.controls[index].enable();
  }

  //
  ChangeDirectorStatus() {

    if (this.Copy_ITR_JSON.systemFlags?.directorInCompany) {
      this.addDirectorDetails('Add director details', 'ADD', null);
    } else {
      if (this.Copy_ITR_JSON?.directorInCompany.length > 0) {
        this.Copy_ITR_JSON.directorInCompany = [];
        // this.directorForm.reset();
        (this.directorForm.controls['directorsArray'] as FormArray).clear();
        this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
        this.serviceCall('Director in company')
      }
    }
    console.log('Remove shares data here');
  }

  addDirectorDetails(title, mode, i) {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    formArray.insert(0, this.createDirectorForm());
  }

  directorCallInConstructor() {
    this.directorForm = this.initDirectorForm();
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    for (let i = 0; i < this.ITR_JSON?.directorInCompany.length; i++) {
      const val = this.ITR_JSON.directorInCompany[i];
      const temp = {
        id: i + 1,
        companyName: val?.companyName,
        typeOfCompany: val?.typeOfCompany,
        companyPAN: val?.companyPAN,
        sharesType: val?.sharesType,
        din: val?.din,
      };
      formArray.push(this.createDirectorForm(temp));
    }
  }

  deleteDirectors() {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: FormGroup) => {
      if(form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  deleteShares() {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: FormGroup) => {
      if(form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }



  serviceCall(msg) {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(result => {
      console.log('result of save itr object',result)
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
      this.ITR_JSON = JSON.parse(JSON.stringify(result));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(result));
      console.log('copy of itr json',this.Copy_ITR_JSON )
      this.loading = false;
      this.utilsService.showSnackBar(msg + ' details removed successfully');

      if (this.ITR_JSON.systemFlags?.directorInCompany){
        this.ITR_JSON.directorInCompany = [];

      }
      if (this.ITR_JSON.systemFlags.haveUnlistedShares){
        this.ITR_JSON.unlistedSharesDetails = [];
      }

    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      console.log('in error of srvice call')
      this.loading = false;
    });
  }

  saveUnlistedShares() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.sharesForm.valid) {

      console.log('Save form here', this.sharesForm.getRawValue());
      const sharesArray = <FormArray>this.sharesForm.get('sharesArray');
      this.Copy_ITR_JSON.unlistedSharesDetails = sharesArray.getRawValue();
      this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = this.Copy_ITR_JSON.unlistedSharesDetails.length > 0;
      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(result => {
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
        this.loading = false;
        this.utilsService.showSnackBar('Other information updated successfully.');

      }, error => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
  saveAndContinue() {
    this.saveDirectorDetials();
    this.saveUnlistedShares();
    this.saveAndNext.emit(true);
  }

}
