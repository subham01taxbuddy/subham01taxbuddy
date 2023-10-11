import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  generalDonationForm: FormGroup;
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
    }
  ];

  scientificDonationDropdown = [
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_A',
      label: 'Sum paid to research Association or University, college or other institution for scientific research',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_AA',
      label: 'Sum paid to research Association or University, college or other institution for social science or statistical research',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_B',
      label: 'Sum paid to an association or institution for Rural Development',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_BB',
      label: 'Sum paid to PSU or local authority or an association institution approved by a national committee for carrying out any eligible project.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_C',
      label: 'Sum paid to an association or institution for conservation of natural resources or for afforestation',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_CC',
      label: 'Sum paid for afforestation, to the fund, which is notified by Central Govt.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_D',
      label: 'Sum paid for Rural Development to the funds, which are notified by the central Govt.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'SCIENTIFIC',
      value: 'FND_SEC80GGA_E',
      label: 'Sum Paid to National Urban Poverty Eradication Fund as set up and notified by central govt',
      description: 'NA',
      active: true,
    }
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

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private userMsService: UserMsService
  ) {}

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
        if(this.type === '80g' && item.donationType === 'OTHER') {
          this.addMoreDonations(item);
        }
        if(this.type === '80gga' && item.donationType === 'SCIENTIFIC') {
          this.addMoreDonations(item);
        }
      });
      this.panValidation();
    } else {
      this.addMoreDonations();
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
    const donationArray = <FormArray>(
      this.generalDonationForm.get('donationArray')
    );
    if (donationArray.valid) {
      this.addMoreDonations();
    } else {
      donationArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
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

  createDonationForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      identifier: [item ? item.identifier : ''],
      donationType: this.type === '80gga' ? 'SCIENTIFIC' : 'OTHER',
      amountInCash: [
        item ? item.amountInCash : 0,
        [Validators.required],
      ],
      amountOtherThanCash: [
        item ? item.amountOtherThanCash : null,
        Validators.required,
      ],
      schemeCode: [item ? item.schemeCode : '', Validators.required],
      details: [item ? item.details : ''],
      name: [
        item ? item.name : '',
        [Validators.required, Validators.pattern(AppConstants.charRegex)],
      ],
      address: [item ? item.address : '', Validators.required],
      city: [item ? item.city : '', Validators.required],
      pinCode: [
        item ? item.pinCode : '',
        [Validators.required, Validators.pattern(AppConstants.PINCode)],
      ],
      state: [item ? item.state : '', Validators.required],
      panNumber: [
        item ? item.panNumber : '',
        [Validators.required, Validators.pattern(AppConstants.panDoneeRegex)],
      ],
    });
  }

  getData(i, pin) {
    const param = '/pincode/' + pin;
    this.userMsService.getMethod(param).subscribe(
      (result: any) => {
        (
          (this.generalDonationForm.controls['donationArray'] as FormGroup)
            .controls[i] as FormGroup
        ).controls['city'].setValue(result.taluka);
        (
          (this.generalDonationForm.controls['donationArray'] as FormGroup)
            .controls[i] as FormGroup
        ).controls['state'].setValue(result.stateCode);
      },
      (error) => {
        if (error.status === 404) {
          (
            (this.generalDonationForm.controls['donationArray'] as FormGroup)
              .controls[i] as FormGroup
          ).controls['city'].setValue(null);
        }
      }
    );
  }

  displayTooltip(i) {
    if(this.type === '80g') {
      const donationLabel: any = this.otherDonationToDropdown.filter(
        (item: any) =>
          item.value ===
          (
            (this.generalDonationForm.controls['donationArray'] as FormGroup)
              .controls[i] as FormGroup
          ).controls['schemeCode'].value
      );
      this.donationToolTip = donationLabel[0].label;
    } else if(this.type === '80gga') {
      const donationLabel: any = this.scientificDonationDropdown.filter(
        (item: any) =>
          item.value ===
          (
            (this.generalDonationForm.controls['donationArray'] as FormGroup)
              .controls[i] as FormGroup
          ).controls['schemeCode'].value
      );
      this.donationToolTip = donationLabel[0].label;
    }
  }

  getEligibleAmount(i) {
    let formGroup = (this.generalDonationForm.controls['donationArray'] as FormGroup)
      .controls[i] as FormGroup;
    let amountInCash = parseInt(formGroup.controls['amountInCash'].value);
    let amountOtherThanCash = parseInt(formGroup.controls['amountOtherThanCash'].value);
    if(amountInCash > 2000){
      return amountOtherThanCash;
    } else {
      return amountInCash + amountOtherThanCash;
    }
  }

  getTotalAmount(i) {
    let formGroup = (this.generalDonationForm.controls['donationArray'] as FormGroup)
      .controls[i] as FormGroup;
    let amountInCash = parseInt(formGroup.controls['amountInCash'].value);
    let amountOtherThanCash = parseInt(formGroup.controls['amountOtherThanCash'].value);
    return amountInCash + amountOtherThanCash;
  }

  editDonationForm(i) {
    (
      (this.generalDonationForm.controls['donationArray'] as FormGroup)
        .controls[i] as FormGroup
    ).enable();
  }

  saveGeneralDonation() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loading = true;

    if(this.type === '80g' && this.panValidation()){
      this.loading = false;
      return false;
    }
    if (this.generalDonationForm.valid) {
      if (this.type === '80gga') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.filter(item => item.donationType !== 'SCIENTIFIC');
        if(this.generalDonationForm.value.donationArray.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(this.generalDonationForm.value.donationArray);
        }
      } else if (this.type === '80g') {
        this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.filter(item => item.donationType !== 'OTHER');
        if(this.generalDonationForm.value.donationArray.length > 0) {
          this.Copy_ITR_JSON.donations = this.Copy_ITR_JSON.donations.concat(this.generalDonationForm.value.donationArray);
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
        (this.generalDonationForm.controls['donationArray'] as FormGroup)
          .controls[i] as FormGroup
      ).controls['panNumber'].setErrors({ incorrect: true });
    }
    this.panValidation();
  }

  panValidation() {
    const buyersDetails = <FormArray>this.generalDonationForm.get('donationArray');
    // This method is written in utils service for common usablity.
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'pan',
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
    return <FormArray>this.generalDonationForm.get('donationArray');
  }

  addMoreDonations(item?) {
    const donationArray = <FormArray>(
      this.generalDonationForm.get('donationArray')
    );
    donationArray.push(this.createDonationForm(item));
    this.changed();
  }

  deleteDonationArray() {
    const donationArray = <FormArray>(
      this.generalDonationForm.get('donationArray')
    );
    donationArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        donationArray.removeAt(index);
        this.changed();
      }
    });
  }

  changed() {
    const donationArray = <FormArray>(
      this.generalDonationForm.get('donationArray')
    );
    this.otherDonationToDropdown.forEach((type) => {
      donationArray.controls.forEach((element: FormGroup) => {
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
