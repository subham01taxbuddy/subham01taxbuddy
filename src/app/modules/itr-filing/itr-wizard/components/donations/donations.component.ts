import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
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
  @Input() isAddDonation: Number;
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
  stateDropdown = [
    {
      id: '5b4599c9c15a76370a3424c2',
      stateId: '1',
      countryCode: '91',
      stateName: 'Andaman and Nicobar Islands',
      stateCode: '01',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c3',
      stateId: '2',
      countryCode: '91',
      stateName: 'Andhra Pradesh',
      stateCode: '02',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c4',
      stateId: '3',
      countryCode: '91',
      stateName: 'Arunachal Pradesh',
      stateCode: '03',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c5',
      stateId: '4',
      countryCode: '91',
      stateName: 'Assam',
      stateCode: '04',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c6',
      stateId: '5',
      countryCode: '91',
      stateName: 'Bihar',
      stateCode: '05',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c7',
      stateId: '6',
      countryCode: '91',
      stateName: 'Chandigarh',
      stateCode: '06',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c8',
      stateId: '7',
      countryCode: '91',
      stateName: 'Chattisgarh',
      stateCode: '33',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424c9',
      stateId: '8',
      countryCode: '91',
      stateName: 'Dadra Nagar and Haveli',
      stateCode: '07',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424ca',
      stateId: '9',
      countryCode: '91',
      stateName: 'Daman and Diu',
      stateCode: '08',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424cb',
      stateId: '10',
      countryCode: '91',
      stateName: 'Delhi',
      stateCode: '09',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424cc',
      stateId: '11',
      countryCode: '91',
      stateName: 'Goa',
      stateCode: '10',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424cd',
      stateId: '12',
      countryCode: '91',
      stateName: 'Gujarat',
      stateCode: '11',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424ce',
      stateId: '13',
      countryCode: '91',
      stateName: 'Haryana',
      stateCode: '12',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424cf',
      stateId: '14',
      countryCode: '91',
      stateName: 'Himachal Pradesh',
      stateCode: '13',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d0',
      stateId: '15',
      countryCode: '91',
      stateName: 'Jammu and Kashmir',
      stateCode: '14',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d1',
      stateId: '16',
      countryCode: '91',
      stateName: 'Jharkhand',
      stateCode: '35',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d2',
      stateId: '17',
      countryCode: '91',
      stateName: 'Karnataka',
      stateCode: '15',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d3',
      stateId: '18',
      countryCode: '91',
      stateName: 'Kerala',
      stateCode: '16',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d4',
      stateId: '19',
      countryCode: '91',
      stateName: 'Lakshadweep',
      stateCode: '17',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d5',
      stateId: '20',
      countryCode: '91',
      stateName: 'Madhya Pradesh',
      stateCode: '18',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d6',
      stateId: '21',
      countryCode: '91',
      stateName: 'Maharashtra',
      stateCode: '19',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d7',
      stateId: '22',
      countryCode: '91',
      stateName: 'Manipur',
      stateCode: '20',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d8',
      stateId: '23',
      countryCode: '91',
      stateName: 'Meghalaya',
      stateCode: '21',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424d9',
      stateId: '24',
      countryCode: '91',
      stateName: 'Mizoram',
      stateCode: '22',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424da',
      stateId: '25',
      countryCode: '91',
      stateName: 'Nagaland',
      stateCode: '23',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424db',
      stateId: '26',
      countryCode: '91',
      stateName: 'Orissa',
      stateCode: '24',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424dc',
      stateId: '27',
      countryCode: '91',
      stateName: 'Pondicherry',
      stateCode: '25',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424dd',
      stateId: '28',
      countryCode: '91',
      stateName: 'Punjab',
      stateCode: '26',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424de',
      stateId: '29',
      countryCode: '91',
      stateName: 'Rajasthan',
      stateCode: '27',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424df',
      stateId: '30',
      countryCode: '91',
      stateName: 'Sikkim',
      stateCode: '28',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e0',
      stateId: '31',
      countryCode: '91',
      stateName: 'Tamil Nadu',
      stateCode: '29',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e1',
      stateId: '32',
      countryCode: '91',
      stateName: 'Telangana',
      stateCode: '36',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e2',
      stateId: '33',
      countryCode: '91',
      stateName: 'Tripura',
      stateCode: '30',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e3',
      stateId: '34',
      countryCode: '91',
      stateName: 'Uttar Pradesh',
      stateCode: '31',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e4',
      stateId: '35',
      countryCode: '91',
      stateName: 'Uttarakhand',
      stateCode: '34',
      status: true,
    },
    {
      id: '5b4599c9c15a76370a3424e5',
      stateId: '36',
      countryCode: '91',
      stateName: 'West Bengal',
      stateCode: '32',
      status: true,
    },
    {
      id: '5dc24c9779332f0ddccb7aa4',
      stateId: '37',
      countryCode: '91',
      stateName: 'Ladakh',
      stateCode: '37',
      status: true,
    },
  ];
  config: any;
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    private userMsService: UserMsService
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

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
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
        } if (this.type === '80ggc' && item.donationType === 'POLITICAL') {
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
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      identifier: [item ? item.identifier : '', Validators.maxLength(25)],
      donationType: this.type === '80gga' ? 'SCIENTIFIC' : this.type === '80g' ? 'OTHER' : 'POLITICAL',
      amountInCash: [item ? item.amountInCash : 0, this.type === '80ggc' ? '' : [Validators.required, Validators.max(2000)],],
      amountOtherThanCash: [item ? item.amountOtherThanCash : null, this.type === '80ggc' ? '' : Validators.required,],
      schemeCode: [item ? item.schemeCode : '', this.type != '80ggc' ? Validators.required : ''],
      details: [item ? item.details : ''],
      name: [item ? item.name : '', this.type != '80ggc' ? [Validators.required, Validators.maxLength(25), Validators.pattern(AppConstants.charAllSpecialRegex),] : '',],
      address: [item ? item.address : '', this.type != '80ggc' ? Validators.required : ''],
      city: [item ? item.city : '', this.type != '80ggc' ? Validators.required : ''],
      pinCode: [item ? item.pinCode : '', this.type != '80ggc' ? [Validators.required, Validators.pattern(AppConstants.PINCode)] : '',],
      state: [item ? item.state : '', this.type != '80ggc' ? Validators.required : ''],
      panNumber: [item ? item.panNumber : '', this.type != '80ggc' ? [Validators.required, Validators.pattern(AppConstants.panDoneeRegex)] : '',],
      dateOfDonation: [item ? item.dateOfDonation : '',],
      ifscBank: [item ? item.ifscBank : '', Validators.pattern(AppConstants.IFSCRegex)],
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

    if (this.type === '80g' && this.panValidation()) {
      this.loading = false;
      return false;
    }
    if (this.generalDonationForm.valid) {
      if (this.type === '80ggc') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'POLITICAL'
        );
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      } else if (this.type === '80gga') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'SCIENTIFIC'
        );
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      } else if (this.type === '80g') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations?.filter(
          (item) => item.donationType !== 'OTHER'
        );
        if (this.generalDonationForm.value.donationArray?.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(
            this.generalDonationForm.value.donationArray
          );
        }
      }
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
    } else {
      this.loading = false;
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
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'panNumber',
      buyersDetails.value
    );
    let userPanExist = [];
    // let failedCases = [];
    if (buyersDetails.value instanceof Array) {
      // failedCases = buyersDetails.value.filter(item =>
      //   !this.utilsService.isNonEmpty(item.pan) && !this.utilsService.isNonEmpty(item.aadhaarNumber));
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
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
