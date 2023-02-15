import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
declare let $: any;
@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss']
})
export class DonationsComponent implements OnInit {
  @Input() isAddDonation = Number;
  generalDonationForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  otherDonationToDropdown = [{
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_DEF_FUND_CEN_GOVT",
    "label": "National Defence Fund set up by the Central Government",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "PM_NAT_REL_FUND",
    "label": "Prime Minister.s National Relief Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_FONDTN_COMM_HARMONY",
    "label": "National Foundation for Communal Harmony",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "APPR_UNIV_INSTI",
    "label": "An approved university/educational institution of National eminence",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "ZILA_SAK_SAMITI",
    "label": "Zila Saksharta Samiti constituted in any district under the chairmanship of the Collector of that district",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "MEDI_RELIF_STAT_GOVT",
    "label": "Fund set up by a State Government for the medical relief to the poor",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_ILLNESS_FND",
    "label": "National Illness Assistance Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_BLD_TRANFSN",
    "label": "National Blood Transfusion Council or to any State Blood Transfusion Council",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_TRST_FOR_AUTI",
    "label": "National Trust for Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_SPRTS_FND",
    "label": "National Sports Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_CLT_FND",
    "label": "National Cultural Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "TCH_DEV_FND",
    "label": "Fund for Technology Development and Application",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "NAT_CHLD_FND",
    "label": "National Children's Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "CM_RELF_FND",
    "label": "Chief Minister's Relief Fund or Lieutenant Governor.s Relief Fund with respect to any State or Union Territory",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "ARMY_CNTRL_FND",
    "label": "The Army Central Welfare Fund or the Indian Naval Benevolent Fund or the Air Force Central Welfare Fund, Andhra Pradesh Chief Minister's Cyclone Relief Fund, 1996",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "MAH_CM_RELF_FND",
    "label": "The Maharashtra Chief Minister's Relief Fund during October 1, 1993 and October 6, 1993",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "MAN_CM_ERTHQK_FND",
    "label": "Chief Minister's Earthquake Relief Fund, Maharashtra",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "GUJ_ST_GOV_CM_ERTHQK_FND",
    "label": "Any fund set up by the State Government of Gujarat exclusively for providing relief to the victims of earthquake in Gujarat",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "GUJ_CM_ERTHQK_FND",
    "label": "Any trust, institution or fund to which Section 80G(5C) applies for providing relief to the victims of earthquake in Gujarat (contribution made during January 26, 2001 and September 30, 2001) or",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "PM_ARM_RELF_FND",
    "label": "Prime Minister's Armenia Earthquake Relief Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "AFR_FND",
    "label": "Africa (Public Contributions - India) Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "SWACHH_BHARAT_KOSH",
    "label": "Swachh Bharat Kosh (applicable from FY 2014-15)",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "CLEAN_GANGA_FND",
    "label": "Clean Ganga Fund (applicable from FY 2014-15)",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "FND_DRG_ABUSE",
    "label": "National Fund for Control of Drug Abuse (applicable from FY 2015-16)",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "JN_MEM_FND",
    "label": "Jawaharlal Nehru Memorial Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "PM_DROUGHT_RELF_FND",
    "label": "Prime Minister's Drought Relief Fund",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "IG_MEM_TRST",
    "label": "Indira Gandhi Memorial Trust",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "RG_FNDTN",
    "label": "Rajiv Gandhi Foundation",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "GOVT_APPRVD_FAMLY_PLNG",
    "label": "Government or any approved local authority, institution or association to be utilised for the purpose of promoting family planning",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "DOTN_FOR_SPRTS",
    "label": "Donation by a Company to the Indian Olympic Association or to any other notified association or institution established in India for the development of infrastructure for sports and games in India or the sponsorship of sports and games in India.",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "FND_SEC80G",
    "label": "Any other fund or any institution which satisfies conditions mentioned in Section 80G(5)",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "DOTN_FOR_CHARITY_PURPOSE",
    "label": "Government or any local authority to be utilised for any charitable purpose other than the purpose of promoting family planning",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "DOTN_HSG_ACCOMODATION",
    "label": "Any authority constituted in India for the purpose of dealing with and satisfying the need for housing accommodation or for the purpose of planning, development or improvement of cities, towns, villages or both",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "DOTN_MIN_COMMUNITY",
    "label": "Any corporation referred in Section 10(26BB) for promoting interest of minority community",
    "description": "NA",
    "active": true
  }, {
    "id": null,
    "donationType": "OTHER",
    "value": "DOTN_REPAIRS_RELIG_PLACE",
    "label": "For repairs or renovation of any notified temple, mosque, gurudwara, church or other place",
    "description": "NA",
    "active": true
  }];
  stateDropdown = [{
    "id": "5b4599c9c15a76370a3424c2",
    "stateId": "1",
    "countryCode": "91",
    "stateName": "Andaman and Nicobar Islands",
    "stateCode": "01",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c3",
    "stateId": "2",
    "countryCode": "91",
    "stateName": "Andhra Pradesh",
    "stateCode": "02",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c4",
    "stateId": "3",
    "countryCode": "91",
    "stateName": "Arunachal Pradesh",
    "stateCode": "03",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c5",
    "stateId": "4",
    "countryCode": "91",
    "stateName": "Assam",
    "stateCode": "04",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c6",
    "stateId": "5",
    "countryCode": "91",
    "stateName": "Bihar",
    "stateCode": "05",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c7",
    "stateId": "6",
    "countryCode": "91",
    "stateName": "Chandigarh",
    "stateCode": "06",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c8",
    "stateId": "7",
    "countryCode": "91",
    "stateName": "Chattisgarh",
    "stateCode": "33",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c9",
    "stateId": "8",
    "countryCode": "91",
    "stateName": "Dadra Nagar and Haveli",
    "stateCode": "07",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ca",
    "stateId": "9",
    "countryCode": "91",
    "stateName": "Daman and Diu",
    "stateCode": "08",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cb",
    "stateId": "10",
    "countryCode": "91",
    "stateName": "Delhi",
    "stateCode": "09",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cc",
    "stateId": "11",
    "countryCode": "91",
    "stateName": "Goa",
    "stateCode": "10",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cd",
    "stateId": "12",
    "countryCode": "91",
    "stateName": "Gujarat",
    "stateCode": "11",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ce",
    "stateId": "13",
    "countryCode": "91",
    "stateName": "Haryana",
    "stateCode": "12",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cf",
    "stateId": "14",
    "countryCode": "91",
    "stateName": "Himachal Pradesh",
    "stateCode": "13",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d0",
    "stateId": "15",
    "countryCode": "91",
    "stateName": "Jammu and Kashmir",
    "stateCode": "14",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d1",
    "stateId": "16",
    "countryCode": "91",
    "stateName": "Jharkhand",
    "stateCode": "35",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d2",
    "stateId": "17",
    "countryCode": "91",
    "stateName": "Karnataka",
    "stateCode": "15",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d3",
    "stateId": "18",
    "countryCode": "91",
    "stateName": "Kerala",
    "stateCode": "16",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d4",
    "stateId": "19",
    "countryCode": "91",
    "stateName": "Lakshadweep",
    "stateCode": "17",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d5",
    "stateId": "20",
    "countryCode": "91",
    "stateName": "Madhya Pradesh",
    "stateCode": "18",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d6",
    "stateId": "21",
    "countryCode": "91",
    "stateName": "Maharashtra",
    "stateCode": "19",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d7",
    "stateId": "22",
    "countryCode": "91",
    "stateName": "Manipur",
    "stateCode": "20",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d8",
    "stateId": "23",
    "countryCode": "91",
    "stateName": "Meghalaya",
    "stateCode": "21",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d9",
    "stateId": "24",
    "countryCode": "91",
    "stateName": "Mizoram",
    "stateCode": "22",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424da",
    "stateId": "25",
    "countryCode": "91",
    "stateName": "Nagaland",
    "stateCode": "23",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424db",
    "stateId": "26",
    "countryCode": "91",
    "stateName": "Orissa",
    "stateCode": "24",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dc",
    "stateId": "27",
    "countryCode": "91",
    "stateName": "Pondicherry",
    "stateCode": "25",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dd",
    "stateId": "28",
    "countryCode": "91",
    "stateName": "Punjab",
    "stateCode": "26",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424de",
    "stateId": "29",
    "countryCode": "91",
    "stateName": "Rajasthan",
    "stateCode": "27",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424df",
    "stateId": "30",
    "countryCode": "91",
    "stateName": "Sikkim",
    "stateCode": "28",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e0",
    "stateId": "31",
    "countryCode": "91",
    "stateName": "Tamil Nadu",
    "stateCode": "29",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e1",
    "stateId": "32",
    "countryCode": "91",
    "stateName": "Telangana",
    "stateCode": "36",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e2",
    "stateId": "33",
    "countryCode": "91",
    "stateName": "Tripura",
    "stateCode": "30",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e3",
    "stateId": "34",
    "countryCode": "91",
    "stateName": "Uttar Pradesh",
    "stateCode": "31",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e4",
    "stateId": "35",
    "countryCode": "91",
    "stateName": "Uttarakhand",
    "stateCode": "34",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e5",
    "stateId": "36",
    "countryCode": "91",
    "stateName": "West Bengal",
    "stateCode": "32",
    "status": true
  }, {
    "id": "5dc24c9779332f0ddccb7aa4",
    "stateId": "37",
    "countryCode": "91",
    "stateName": "Ladakh",
    "stateCode": "37",
    "status": true
  }];
  config: any;
  selectedPageNo = 0;

  constructor(private fb: FormBuilder,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.Copy_ITR_JSON.donations) {
      this.Copy_ITR_JSON.donations.forEach(item => {
        this.addMoreDonations(item);
      })
    }
  }

  ngOnInit() {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.generalDonationForm = this.inItForm();
    this.generalDonationForm.disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddDonation) {
        this.addMoreDonations();
      }
    }, 1000);
  }

  inItForm() {
    return this.fb.group({
      donationArray: this.fb.array([this.createDonationForm()]),
    })
  }

  createDonationForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      identifier: [item ? item.identifier : ''],
      donationType: [item ? item.donationType : 'OTHER'],
      amountInCash: [item ? item.amountInCash : null, Validators.required],
      amountOtherThanCash: [item ? item.amountOtherThanCash : null, Validators.required],
      schemeCode: [item ? item.schemeCode : '', Validators.required],
      details: [item ? item.details : ''],
      name: [item ? item.name : '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      address: [item ? item.address : '', Validators.required],
      city: [item ? item.city : '', Validators.required],
      pinCode: [item ? item.pinCode : '', [Validators.required, Validators.pattern(AppConstants.PINCode)]],
      state: [item ? item.state : '', Validators.required],
      panNumber: [item ? item.panNumber : '', [Validators.required, Validators.pattern(AppConstants.panDoneeRegex)]]
    });
  }

  getData(i, pin) {
    const param = '/pincode/' + pin;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      ((this.generalDonationForm.controls['donationArray'] as FormGroup).controls[i] as FormGroup).controls['city'].setValue(result.taluka);
      ((this.generalDonationForm.controls['donationArray'] as FormGroup).controls[i] as FormGroup).controls['state'].setValue(result.stateCode);
    }, error => {
      if (error.status === 404) {
        ((this.generalDonationForm.controls['donationArray'] as FormGroup).controls[i] as FormGroup).controls['city'].setValue(null);
      }
    });
  }


  displayTooltip(i) {
    const donationLabel: any = this.otherDonationToDropdown.filter((item: any) => item.value === ((this.generalDonationForm.controls['donationArray'] as FormGroup).controls[i] as FormGroup).controls['schemeCode'].value);
    this.donationToolTip = donationLabel[0].label;
  }

  editDonationForm(i) {
    ((this.generalDonationForm.controls['donationArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  saveGeneralDonation() {
    if (this.generalDonationForm.valid) {
      this.Copy_ITR_JSON.donations = this.generalDonationForm.value.donationArray;
    }
  }

  get getDonationArray() {
    return <FormArray>this.generalDonationForm.get('donationArray');
  }


  addMoreDonations(item?) {
    const donationArray = <FormArray>this.generalDonationForm.get('donationArray');
    if (donationArray.valid) {
      donationArray.push(this.createDonationForm(item));
      this.changed();
    } else {
      donationArray.controls.forEach(element => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  deleteDonationArray() {
    const donationArray = <FormArray>this.generalDonationForm.get('donationArray');
    donationArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        donationArray.removeAt(index);
        this.changed();
      }
    })
  }

  changed() {
    const donationArray = <FormArray>this.generalDonationForm.get('donationArray');
    this.otherDonationToDropdown.forEach((type) => {
      donationArray.controls.forEach((element: FormGroup) => {
        if (element.controls['schemeCode'].value == (type.value)) {
          type.active = false;
        }
      })
    })
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

}