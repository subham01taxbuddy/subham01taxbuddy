import { Component, OnInit, Input, SimpleChanges, ElementRef } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
declare let $: any;
@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss'],
})
export class DonationsComponent implements OnInit {
  @Input() isAddDonation: number;
  @Input() type: string;
  generalDonationForm: UntypedFormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;

  otherDonationToDropdown = [
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_DEF_FUND_CEN_GOVT',
      label: '100% deduction without qualifying limit',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'PM_DROUGHT_RELF_FND',
      label: '50% deduction without qualifying limit',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'GOVT_APPRVD_FAMLY_PLNG',
      label: '100% deduction subject to qualifying limit',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'FND_SEC80G',
      label: '50% deduction subject to qualifying limit',
      description: 'NA',
      active: true,
    },
  ];

  scientificDonationDropdown = [
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'SCIENTIFIC_RESEARCH',
      label:
        'Sum paid to research Association or University, college or other institution for scientific research',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'SOCIAL_SCIENCE_OR_STATISTICAL_RESEARCH',
      label:
        'Sum paid to research Association or University, college or other institution for social science or statistical research',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'RURAL_DEVELOPMENT',
      label: 'Sum paid to an association or institution for Rural Development',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'PSU_OR_LOCAL_AUTHORITY_FOR_CARRYING_OUT_ANY_ELIGIBLE_PROJECT',
      label:
        'Sum paid to PSU or local authority or an association institution approved by a national committee for carrying out any eligible project.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'CONSERVATION_OF_NATURAL_RESOURCES_OR_FOR_AFFORESTATION',
      label:
        'Sum paid to an association or institution for conservation of natural resources or for afforestation',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'AFFORESTATION_TO_CG_NOTIFIED_FUNDS',
      label:
        'Sum paid for afforestation, to the fund, which is notified by Central Govt.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'RURAL_DEVELOPMENT_TO_CG_NOTIFIED_FUNDS',
      label:
        'Sum paid for Rural Development to the funds, which are notified by the central Govt.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'NATIONAL_URBAN_POVERTY_ERADICATION_FUND',
      label:
        'Sum Paid to National Urban Poverty Eradication Fund as set up and notified by central govt',
      description: 'NA',
      active: true,
    },
  ];
  stateDropdown = AppConstants.stateDropdown;
  config80g: any;
  config80gga: any;
  config80ggc: any;
  minDate: Date;
  maxDate: Date;
  pg80g: number;
  pg80gga: number;
  pg80ggc: number;

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    private userMsService: UserMsService, private elementRef: ElementRef
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.pg80g = this.pg80gga = this.pg80ggc = 1;
    this.config80g = {
      itemsPerPage: 2,
      currentPage: this.pg80g,
    };
    this.config80gga = {
      itemsPerPage: 2,
      currentPage: this.pg80gga,
    };
    this.config80ggc = {
      itemsPerPage: 2,
      currentPage: this.pg80ggc,
    };

    this.generalDonationForm = this.inItForm();
    if (
      this.Copy_ITR_JSON.donations &&
      this.Copy_ITR_JSON.donations.length > 0
    ) {
      this.Copy_ITR_JSON.donations.forEach((item) => {
        if (this.type === '80g' && item.donationType === 'OTHER') {
          this.addMoreDonations(item);
        }
        if (this.type === '80gga' && item.donationType === 'SCIENTIFIC') {
          this.addMoreDonations(item);
        }
        if (this.type === '80ggc' && item.donationType === 'POLITICAL') {
          this.addMoreDonations(item);
        }
      });
      this.panValidation();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddDonation) {
        this.addDonations();
      }
    }, 1000);
  }

  addDonations() {
    const donationArray = <UntypedFormArray>(
      this.generalDonationForm.get('donationArray')
    );
    if (donationArray.valid) {
      this.addMoreDonations();
    } else {
      donationArray.controls.forEach((element) => {
        if ((element as UntypedFormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  inItForm() {
    return this.fb.group({
      donationArray: this.fb.array([]),
    });
  }

  createDonationForm(item?): UntypedFormGroup {
    let nameValidator = this.type != '80ggc' ?
      (this.type === '80g' ?
        [Validators.required, Validators.pattern(AppConstants.charAllSpecialRegex),]
        : [Validators.required, Validators.maxLength(25), Validators.pattern(AppConstants.charAllSpecialRegex),])
      : '';
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      identifier: [item ? item.identifier : '', this.type === '80ggc' ? [Validators.required, Validators.maxLength(25)] : Validators.maxLength(25)],
      donationType: this.type === '80gga' ? 'SCIENTIFIC' : this.type === '80g' ? 'OTHER' : 'POLITICAL',
      amountInCash: [item ? item.amountInCash : 0, this.type === '80ggc' ? '' : [Validators.required, Validators.max(2000)],],
      amountOtherThanCash: [item ? item.amountOtherThanCash : null, this.type === '80ggc' ? '' : Validators.required,],
      schemeCode: [item ? item.schemeCode : '', this.type != '80ggc' ? Validators.required : ''],
      details: [item ? item.details : ''],
      name: [item ? item.name : '', nameValidator],
      address: [item ? item.address : '', this.type != '80ggc' ? Validators.required : ''],
      city: [item ? item.city : '', this.type != '80ggc' ? Validators.required : ''],
      pinCode: [item ? item.pinCode : '', this.type != '80ggc' ? [Validators.required, Validators.pattern(AppConstants.PINCode)] : '',],
      state: [item ? item.state : '', this.type != '80ggc' ? Validators.required : ''],
      panNumber: [item ? item.panNumber : '', this.type != '80ggc' ? [Validators.required, Validators.pattern(AppConstants.panDoneeRegex)] : '',],
      dateOfDonation: [item ? item.dateOfDonation : '',],
      ifscBank: [item ? item.ifscBank : '', this.type === '80ggc' ? [Validators.required, Validators.pattern(AppConstants.IFSCRegex)] : Validators.pattern(AppConstants.IFSCRegex)],
    });
  }

  getData(i, pin) {
    const param = '/pincode/' + pin;
    this.userMsService.getMethod(param).subscribe(
      (result: any) => {
        (
          (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
            .controls[i] as UntypedFormGroup
        ).controls['city'].setValue(result.taluka);
        (
          (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
            .controls[i] as UntypedFormGroup
        ).controls['state'].setValue(result.stateCode);
      },
      (error) => {
        if (error.status === 404) {
          (
            (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
              .controls[i] as UntypedFormGroup
          ).controls['city'].setValue(null);
        }
      }
    );
  }

  displayTooltip(i) {
    if (this.type === '80g') {
      const donationLabel: any = this.otherDonationToDropdown.filter(
        (item: any) =>
          item.value ===
          (
            (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
              .controls[i] as UntypedFormGroup
          ).controls['schemeCode'].value
      );
      this.donationToolTip = donationLabel[0].label;
    } else if (this.type === '80gga') {
      const donationLabel: any = this.scientificDonationDropdown.filter(
        (item: any) =>
          item.value ===
          (
            (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
              .controls[i] as UntypedFormGroup
          ).controls['schemeCode'].value
      );
      this.donationToolTip = donationLabel[0].label;
    }
  }

  getEligibleAmount(i) {
    let formGroup = (
      this.generalDonationForm.controls['donationArray'] as UntypedFormGroup
    ).controls[i] as UntypedFormGroup;
    let amountInCash = parseInt(formGroup.controls['amountInCash'].value);
    let amountOtherThanCash = parseInt(
      formGroup.controls['amountOtherThanCash'].value
    );
    if (amountInCash > 2000) {
      return amountOtherThanCash;
    } else {
      return amountInCash + amountOtherThanCash;
    }
  }

  getTotalAmount(i) {
    let formGroup = (
      this.generalDonationForm.controls['donationArray'] as UntypedFormGroup
    ).controls[i] as UntypedFormGroup;
    let amountInCash = parseInt(formGroup.controls['amountInCash'].value);
    let amountOtherThanCash = parseInt(
      formGroup.controls['amountOtherThanCash'].value
    );
    return amountInCash + amountOtherThanCash;
  }

  editDonationForm(i) {
    (
      (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
        .controls[i] as UntypedFormGroup
    ).enable();
  }

  saveGeneralDonation() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;

    if ((this.type === '80g' || this.type === '80ggc') && this.panValidation()) {
      this.loading = false;
      return false;
    }
    if (this.generalDonationForm.valid) {
      if (this.type === '80ggc') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'POLITICAL'
        );
        if (!this.Copy_ITR_JSON.donations) {
          this.Copy_ITR_JSON.donations = [];
        }
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      } else if (this.type === '80gga') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'SCIENTIFIC'
        );
        if (!this.Copy_ITR_JSON.donations) {
          this.Copy_ITR_JSON.donations = [];
        }
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      } else if (this.type === '80g') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'OTHER'
        );
        if (!this.Copy_ITR_JSON.donations) {
          this.Copy_ITR_JSON.donations = [];
        }
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      }
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
    } else {
      this.loading = false;
      this.utilsService.highlightInvalidFormFields(this.generalDonationForm, 'accordBtn1', this.elementRef);
      $('input.ng-invalid').first().focus();
      return false;
    }
    this.loading = false;
    return true;
  }

  checkDoneePAN(i, donation) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.ITR_JSON['panNumber'] === donation.controls['panNumber'].value) {
      (
        (this.generalDonationForm.controls['donationArray'] as UntypedFormGroup)
          .controls[i] as UntypedFormGroup
      ).controls['panNumber'].setErrors({ incorrect: true });
    }
    this.panValidation();
  }

  panValidation() {
    const buyersDetails = <UntypedFormArray>(
      this.generalDonationForm.get('donationArray')
    );
    // This method is written in utils service for common usablity.
    let panRepeat: boolean;
    if(this.type === '80g'){
        panRepeat = this.utilsService.checkDuplicatePANWithDifferentScheme(
            buyersDetails.value
        );
    } else {
      panRepeat = this.utilsService.checkDuplicateInObject(
          'panNumber',
          buyersDetails.value
      );
    }
    let userPanExist = [];
    if (buyersDetails.value instanceof Array) {
      userPanExist = buyersDetails.value.filter(
        (item) => item.pan === this.ITR_JSON.panNumber
      );
    }

    if (panRepeat) {
      this.utilsService.showSnackBar(
        'Donee Details already present with this PAN.'
      );
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar(
        'Donee Details PAN can not be same with user PAN.'
      );
      panRepeat = true;
    } /*else if(failedCases.length > 0){
      panRepeat = true;
      this.utilsService.showSnackBar(
        'Please provide PAN or AADHAR for buyer details'
      );
    }*/
    return panRepeat;
  }

  get getDonationArray() {
    return <UntypedFormArray>this.generalDonationForm.get('donationArray');
  }

  addMoreDonations(item?) {
    const donationArray = <UntypedFormArray>(
      this.generalDonationForm.get('donationArray')
    );
    donationArray.push(this.createDonationForm(item));
    this.changed();
  }

  deleteDonationArray(index) {
    const donationArray = <UntypedFormArray>(
      this.generalDonationForm.get('donationArray')
    );
    // donationArray.controls.forEach((element, index) => {
    //   if ((element as UntypedFormGroup).controls['hasEdit'].value) {
    //     donationArray.removeAt(index);
    //     this.changed();
    //   }
    // });
    donationArray.removeAt(index);
    this.changed();
  }

  changed() {
    const donationArray = <UntypedFormArray>(
      this.generalDonationForm.get('donationArray')
    );
    this.otherDonationToDropdown.forEach((type) => {
      donationArray.controls.forEach((element: UntypedFormGroup) => {
        if (element.controls['schemeCode'].value == type.value) {
          type.active = false;
        }
      });
    });
  }

  pageChanged(event) {

    if (this.type === '80g') {
      this.pg80g = event;
      this.config80g = {
        id: 'd80g',
        itemsPerPage: 2,
        currentPage: this.pg80g,
      };
    }
    if (this.type === '80gga') {
      this.pg80gga = event;
      this.config80g = {
        id: 'd80gga',
        itemsPerPage: 2,
        currentPage: this.pg80gga,
      };
    }
    if (this.type === '80ggc') {
      this.pg80ggc = event;
      this.config80g = {
        id: 'd80ggc',
        itemsPerPage: 2,
        currentPage: this.pg80ggc,
      };
    }
  }

  fieldGlobalIndex(index) {
    if (this.type === '80g') {
      return this.config80g.itemsPerPage * (this.pg80g - 1) + index;
    }
    if (this.type === '80gga') {
      return this.config80gga.itemsPerPage * (this.pg80gga - 1) + index;
    }
    if (this.type === '80ggc') {
      return this.config80ggc.itemsPerPage * (this.pg80ggc - 1) + index;
    }
  }

  getPageConfig() {
    if (this.type === '80g') {
      this.config80g = {
        id: 'd80g',
        itemsPerPage: 2,
        currentPage: this.pg80g,
      };
      return this.config80g;
    }
    if (this.type === '80gga') {
      this.config80gga = {
        id: 'd80gga',
        itemsPerPage: 2,
        currentPage: this.pg80gga,
      };
      return this.config80gga
    }
    if (this.type === '80ggc') {
      this.config80ggc = {
        id: 'd80ggc',
        itemsPerPage: 2,
        currentPage: this.pg80ggc,
      };
      return this.config80ggc;
    }
  }
}
