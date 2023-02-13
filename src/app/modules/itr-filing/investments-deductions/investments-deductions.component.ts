import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, OnInit, Output, EventEmitter, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, GridApi } from 'ag-grid-community';
declare let $: any;


@Component({
  selector: 'app-investments-deductions',
  templateUrl: './investments-deductions.component.html',
  styleUrls: ['./investments-deductions.component.css']
})
export class InvestmentsDeductionsComponent implements OnInit, DoCheck {
  @Output() saveAndNext = new EventEmitter<any>();
  step = 0;

  loading: boolean = false;
  investmentDeductionForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  DonationGridOptions: GridOptions;
  public columnDefs;
  public rowData;
  api: GridApi;
  userAge: number = 0;
  itrDocuments = [];
  deletedFileData: any = [];
  maxLimit80u = 75000
  selected80u = '';
  maxLimit80dd = 75000
  selected80dd = '';
  maxLimit80ddb = 40000
  selected80ddb = '';

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

  constructor(public utilsService: UtilsService, private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public matDialog: MatDialog,) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const self = this.ITR_JSON.family.filter((item: any) => item.relationShipCode === 'SELF')
    if (self instanceof Array && self.length > 0) {
      this.userAge = self[0].age
    }
    if (!this.ITR_JSON.systemFlags?.hasParentOverSixty) {
      if (this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.hasParentOverSixty = false;
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

  ngOnInit() {
    this.getItrDocuments();
    this.investmentDeductionForm = this.fb.group({
      ELSS: [null, Validators.pattern(AppConstants.numericRegex)],
      PENSION_FUND: [null, Validators.pattern(AppConstants.numericRegex)],
      PS_EMPLOYEE: [null, Validators.pattern(AppConstants.numericRegex)],
      PS_EMPLOYER: [null, Validators.pattern(AppConstants.numericRegex)],
      PENSION_SCHEME: [null, Validators.pattern(AppConstants.numericRegex)],
      us80e: [null, Validators.pattern(AppConstants.numericRegex)],
      us80gg: [null, Validators.pattern(AppConstants.numericRegex)],
      selfPremium: [null, Validators.pattern(AppConstants.numericRegex)],
      selfPreventiveCheckUp: [null, [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)]],
      selfMedicalExpenditure: [null, Validators.pattern(AppConstants.numericRegex)],
      premium: [null, Validators.pattern(AppConstants.numericRegex)],
      preventiveCheckUp: [null, [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)]],
      medicalExpenditure: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ggc: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eeb: [null, [Validators.pattern(AppConstants.numericRegex), Validators.max(150000)]],
      us80u: [null, Validators.pattern(AppConstants.numericRegex)],
      us80dd: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ddb: [null, Validators.pattern(AppConstants.numericRegex)],
      hasParentOverSixty: [null]
    });
    this.setInvestmentsDeductionsValues();
    this.donationCallInConstructor(this.otherDonationToDropdown, this.stateDropdown);

    // this.DonationGridOptions.api?.setRowData(this.createRowData('OTHER'));
    // this.DonationGridOptions.api.setColumnDefs(this.donationCreateColoumnDef(this.otherDonationToDropdown, this.stateDropdown));
    console.log('Investments-DEDUCTION deletedFileData LENGTH ---> ', this.deletedFileData.length)
  }
  max5000Limit(val) {
    if (val === 'SELF' && this.investmentDeductionForm.controls['selfPreventiveCheckUp'].valid &&
      this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value)) {
      const applicable = 5000 - Number(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value);
      this.investmentDeductionForm.controls['preventiveCheckUp'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.max(applicable)])
      this.investmentDeductionForm.controls['preventiveCheckUp'].updateValueAndValidity();
    } else if (val === 'PARENTS' && this.investmentDeductionForm.controls['preventiveCheckUp'].valid &&
      this.utilsService.isNonZero(this.investmentDeductionForm.controls['preventiveCheckUp'].value)) {
      const applicable = 5000 - Number(this.investmentDeductionForm.controls['preventiveCheckUp'].value);
      this.investmentDeductionForm.controls['selfPreventiveCheckUp'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.max(applicable)])
      this.investmentDeductionForm.controls['selfPreventiveCheckUp'].updateValueAndValidity();
    }

  }

  saveInvestmentDeductions() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.max5000Limit('SELF')
    if (this.investmentDeductionForm.valid) {
      Object.keys(this.investmentDeductionForm.controls).forEach((item: any) => {
        if (item === 'ELSS' || item === 'PENSION_FUND' || item === 'PS_EMPLOYEE' ||
          item === 'PS_EMPLOYER' || item === 'PENSION_SCHEME') {
          this.addAndUpdateInvestment(item);
        } else {
          if (item === 'us80e') {
            this.ITR_JSON.loans = this.ITR_JSON.loans?.filter((item: any) => item.loanType !== 'EDUCATION');
            if (!this.ITR_JSON.loans) {
              this.ITR_JSON.loans = [];
            }
            this.ITR_JSON.loans?.push({
              loanType: 'EDUCATION',
              name: null,
              interestPaidPerAnum: Number(this.investmentDeductionForm.controls['us80e'].value),
              principalPaidPerAnum: 0.00,
              loanAmount: null,
              details: null
            });
          } else if (item === 'us80gg') {
            this.ITR_JSON.expenses = this.ITR_JSON.expenses?.filter((item: any) => item.expenseType !== 'HOUSE_RENT_PAID');
            if (!this.ITR_JSON.expenses) {
              this.ITR_JSON.expenses = [];
            }
            if (!this.ITR_JSON.systemFlags.hraAvailed) {
              this.ITR_JSON.expenses?.push({
                expenseType: 'HOUSE_RENT_PAID',
                expenseFor: null,
                details: null,
                amount: Number(this.investmentDeductionForm.controls['us80gg'].value),
                noOfMonths: 0
              });
            }
          } else if (item === 'us80ggc') {
            this.ITR_JSON.donations = this.ITR_JSON.donations?.filter((item: any) => item.donationType !== 'POLITICAL');
            if (!this.ITR_JSON.donations) {
              this.ITR_JSON.donations = [];
            }
            this.ITR_JSON.donations?.push({
              details: '',
              identifier: '',
              panNumber: '',
              schemeCode: '',
              donationType: 'POLITICAL',
              name: '',
              amountInCash: 0,
              amountOtherThanCash: Number(this.investmentDeductionForm.controls['us80ggc'].value),
              address: '',
              city: '',
              pinCode: '',
              state: '',
            });
          } else if (item === 'us80eeb') {
            this.ITR_JSON.expenses = this.ITR_JSON.expenses?.filter((item: any) => item.expenseType !== 'ELECTRIC_VEHICLE');
            if (!this.ITR_JSON.expenses) {
              this.ITR_JSON.expenses = [];
            }
            this.ITR_JSON.expenses?.push({
              expenseType: 'ELECTRIC_VEHICLE',
              expenseFor: null,
              details: null,
              amount: Number(this.investmentDeductionForm.controls['us80eeb'].value),
              noOfMonths: 0
            });
          }
        }
      });
      this.ITR_JSON.insurances = this.ITR_JSON.insurances?.filter((item: any) => item.policyFor !== "DEPENDANT");
      if (!this.ITR_JSON.insurances) {
        this.ITR_JSON.insurances = [];
      }
      if (this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfPremium'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfMedicalExpenditure'].value)) {
        this.ITR_JSON.insurances?.push({
          insuranceType: 'HEALTH',
          typeOfPolicy: null,
          policyFor: 'DEPENDANT',
          premium: Number(this.investmentDeductionForm.controls['selfPremium'].value),
          medicalExpenditure: this.userAge >= 60 ? Number(this.investmentDeductionForm.controls['selfMedicalExpenditure'].value) : 0,
          preventiveCheckUp: Number(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value),
          sumAssured: null,
          healthCover: null
        });
      }
      this.ITR_JSON.insurances = this.ITR_JSON.insurances?.filter((item: any) => item.policyFor !== "PARENTS");
      if (!this.ITR_JSON.insurances) {
        this.ITR_JSON.insurances = [];
      }
      if (this.utilsService.isNonZero(this.investmentDeductionForm.controls['premium'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['preventiveCheckUp'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['medicalExpenditure'].value)) {
        this.ITR_JSON.systemFlags.hasParentOverSixty = true;
        this.ITR_JSON.insurances?.push({
          insuranceType: 'HEALTH',
          typeOfPolicy: null,
          policyFor: 'PARENTS',
          premium: Number(this.investmentDeductionForm.controls['premium'].value),
          medicalExpenditure: Number(this.investmentDeductionForm.controls['medicalExpenditure'].value),
          preventiveCheckUp: Number(this.investmentDeductionForm.controls['preventiveCheckUp'].value),
          sumAssured: null,
          healthCover: null
        });
      }
      this.ITR_JSON.disabilities = [];
      if (this.selected80u !== '' && this.utilsService.isNonZero(this.investmentDeductionForm.controls['us80u'].value)) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80u,
          amount: this.investmentDeductionForm.controls['us80u'].value
        })
      }
      if (this.selected80dd !== '' && this.utilsService.isNonZero(this.investmentDeductionForm.controls['us80dd'].value)) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80dd,
          amount: this.investmentDeductionForm.controls['us80dd'].value
        })
      }
      if (this.selected80ddb !== '' && this.utilsService.isNonZero(this.investmentDeductionForm.controls['us80ddb'].value)) {
        this.ITR_JSON.disabilities?.push({
          typeOfDisability: this.selected80ddb,
          amount: this.investmentDeductionForm.controls['us80ddb'].value
        })
      }
      this.serviceCall('NEXT', this.ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  setInvestmentsDeductionsValues() {
    this.ITR_JSON.investments?.forEach(investment => {
      if (investment.investmentType === 'ELSS' || investment.investmentType === 'PENSION_FUND' || investment.investmentType === 'PS_EMPLOYEE' ||
        investment.investmentType === 'PS_EMPLOYER' || investment.investmentType === 'PENSION_SCHEME')
        this.investmentDeductionForm.controls[investment.investmentType].setValue(investment.amount);
    });

    for (let i = 0; i < this.ITR_JSON.loans?.length; i++) {
      switch (this.ITR_JSON.loans[i].loanType) {
        case 'EDUCATION': {
          this.investmentDeductionForm.controls['us80e'].setValue(this.ITR_JSON.loans[i].interestPaidPerAnum);
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.expenses?.length; j++) {
      switch (this.ITR_JSON.expenses[j].expenseType) {
        case 'HOUSE_RENT_PAID': {
          this.investmentDeductionForm.controls['us80gg'].setValue(this.ITR_JSON.expenses[j].amount);
          break;
        }
        case 'ELECTRIC_VEHICLE': {
          this.investmentDeductionForm.controls['us80eeb'].setValue(this.ITR_JSON.expenses[j].amount);
          break;
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.donations?.length; j++) {
      switch (this.ITR_JSON.donations[j].donationType) {
        case 'POLITICAL': {
          this.investmentDeductionForm.controls['us80ggc'].setValue(this.ITR_JSON.donations[j].amountOtherThanCash);
          break;
        }
      }
    }
    for (let i = 0; i < this.ITR_JSON.insurances?.length; i++) {
      if (this.ITR_JSON.insurances[i].policyFor === 'DEPENDANT') {
        this.investmentDeductionForm.controls['selfPremium'].setValue(this.ITR_JSON.insurances[i].premium);
        this.investmentDeductionForm.controls['selfPreventiveCheckUp'].setValue(this.ITR_JSON.insurances[i].preventiveCheckUp);
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].setValue(this.ITR_JSON.insurances[i].medicalExpenditure);
      } else if (this.ITR_JSON.insurances[i].policyFor === 'PARENTS') {
        this.ITR_JSON.systemFlags.hasParentOverSixty = true;
        this.investmentDeductionForm.controls['hasParentOverSixty'].setValue(true);
        this.investmentDeductionForm.controls['premium'].setValue(this.ITR_JSON.insurances[i].premium);
        this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(this.ITR_JSON.insurances[i].preventiveCheckUp);
        this.investmentDeductionForm.controls['medicalExpenditure'].setValue(this.ITR_JSON.insurances[i].medicalExpenditure);
      }
    }
    let sec80u = this.ITR_JSON.disabilities?.filter(item => item.typeOfDisability === 'SELF_WITH_DISABILITY' || item.typeOfDisability === 'SELF_WITH_SEVERE_DISABILITY');
    if (sec80u?.length > 0) {
      this.selected80u = sec80u[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80u'].setValue(sec80u[0].amount);
      this.radioChange80u(false);
    }
    let sec80dd = this.ITR_JSON.disabilities?.filter(item => item.typeOfDisability === 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY' || item.typeOfDisability === 'DEPENDENT_PERSON_WITH_DISABILITY');
    if (sec80dd?.length > 0) {
      this.selected80dd = sec80dd[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80dd'].setValue(sec80dd[0].amount);
      this.radioChange80dd(false);
    }
    let sec80ddb = this.ITR_JSON.disabilities?.filter(item => item.typeOfDisability === 'SELF_OR_DEPENDENT' || item.typeOfDisability === 'SELF_OR_DEPENDENT_SENIOR_CITIZEN');
    if (sec80ddb?.length > 0) {
      this.selected80ddb = sec80ddb[0].typeOfDisability;
      this.investmentDeductionForm.controls['us80ddb'].setValue(sec80ddb[0].amount);
      this.radioChange80ddb(false);
    }
    this.max5000Limit('SELF');
  }

  addAndUpdateInvestment(controlName) {
    if (this.utilsService.isNonEmpty(this.investmentDeductionForm.controls[controlName].value)) {
      let i: number;
      let isAdded = false;
      for (i = 0; i < this.ITR_JSON.investments?.length; i++) {
        if (this.ITR_JSON.investments[i].investmentType === controlName) {
          isAdded = true;
          break;
        }
      }

      if (!isAdded) {
        if (!this.ITR_JSON.investments) {
          this.ITR_JSON.investments = [];
        }
        this.ITR_JSON.investments?.push({
          investmentType: controlName,
          amount: Number(this.investmentDeductionForm.controls[controlName].value),
          details: controlName
        });
      } else {
        this.ITR_JSON.investments.splice(i, 1, {
          investmentType: controlName,
          amount: Number(this.investmentDeductionForm.controls[controlName].value),
          details: controlName
        });
      }
    } else {
      this.ITR_JSON.investments = this.ITR_JSON.investments?.filter((item: any) => item.investmentType !== controlName);
    }
  }

  addDonation(title, mode, selectedData, donationType) {
    // const data = {
    //   title: title,
    //   mode: mode,
    //   selectedData: selectedData,
    //   ITR_JSON: this.ITR_JSON,
    //   donationType: donationType
    // };
    // const dialogRef = this.matDialog.open(AddDonationDialogComponent, {
    //   data: data,
    //   closeOnNavigation: true,
    //   width: '800px'
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('Result add past year=', result);
    //   if (result !== undefined && result !== '' && result !== null) {
    //     this.ITR_JSON = result;
    //     this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    //     sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    //     if (donationType === 'OTHER') {
    //       this.DonationGridOptions.api?.setRowData(this.createRowData('OTHER'));
    //     } 
    //   }
    // });
  }
  donationCallInConstructor(otherDonationToDropdown, stateDropdown) {
    this.DonationGridOptions = <GridOptions>{
      rowData: this.createRowData('OTHER'),
      columnDefs: this.donationCreateColoumnDef(otherDonationToDropdown, stateDropdown),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
      suppressMovable: true,
      cellFocused: true,
      enableCharts: true
    };
  }
  donationCreateColoumnDef(otherDonationToDropdown, stateDropdown) {
    return this.columnDefs = [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 50,
        suppressMovable: true,
        pinned: 'left',
      },
      {
        headerName: 'Donation Type',
        field: 'schemeCode',
        editable: false,
        suppressMovable: true,
        onCellFocused: true,
        valueGetter: function nameFromCode(params) {
          console.log('params === ', params);
          if (otherDonationToDropdown.length !== 0) {
            const nameArray = otherDonationToDropdown.filter((item: any) => (item.value === params.data.schemeCode));
            console.log('nameArray = ', nameArray);
            return nameArray[0].label;
          } else {
            return params.data.value;
          }
        }
      },
      {
        headerName: 'Amount in Cash',
        field: 'amountInCash',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Amount Other than Cash',
        field: 'amountOtherThanCash',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Name of Donee',
        field: 'name',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Address',
        field: 'address',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'City',
        field: 'city',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Pin Code',
        field: 'pinCode',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Pan Number',
        field: 'panNumber',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'State',
        field: 'state',
        editable: false,
        suppressMovable: true,
        valueGetter: function statenameFromCode(params) {
          console.log('stateDropdown === ', stateDropdown);
          if (stateDropdown.length !== 0) {
            const nameArray = stateDropdown.filter((item: any) => item.stateCode === params.data.state);
            console.log('stateDropdown = ', nameArray);
            return nameArray[0].stateName;
          } else {
            return params.data.state;
          }
        }
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        width: 50,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Delete" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        width: 50,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      }
    ];
  }

  public onDonationRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          //re-intialise the ITR objects
          this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

          this.Copy_ITR_JSON.donations = this.ITR_JSON.donations.filter((item: any) => item.identifier !== params.data.identifier);
          this.serviceCall('OTHER', this.Copy_ITR_JSON);
          break;
        }
        case 'edit': {
          console.log('edit params OTHER = ', params.data);
          this.addDonation('Edit Donation', 'EDIT', params.data, 'OTHER');
          break;
        }
      }
    }
  }

  createRowData(donationType) {
    const newData = [];
    const donations = this.ITR_JSON.donations?.filter((item: any) => item.donationType === donationType);
    for (let i = 0; i < donations?.length; i++) {
      newData.push({
        srNo: i + 1,
        identifier: donations[i].identifier,
        amountInCash: donations[i].amountInCash,
        amountOtherThanCash: donations[i].amountOtherThanCash,
        schemeCode: donations[i].schemeCode,
        details: donations[i].details,
        name: donations[i].name,
        address: donations[i].address,
        city: donations[i].city,
        pinCode: donations[i].pinCode,
        state: donations[i].state,
        panNumber: donations[i].panNumber
      });
    }

    return newData ? newData : [];
  }

  serviceCall(val, ITR_JSON) {

    this.loading = true;
    this.utilsService.saveItrObject(ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Donation updated successfully');
      this.DonationGridOptions.api?.setRowData(this.createRowData('OTHER'));
      if (val === 'NEXT') {
        this.saveAndNext.emit(true);
      }

    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to update data');
    });
  }

  isParentOverSixty() {
    if (!this.ITR_JSON?.systemFlags?.hasParentOverSixty) {
      console.log('clear parent related values');
      // this.investmentDeductionForm.controls['premium'].setValue(null);
      // this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(null);
      this.investmentDeductionForm.controls['medicalExpenditure'].setValue(null);
    }
  }

  getItrDocuments() {
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      this.itrDocuments = result;
    })
  }

  // afterUploadDocs(fileUpload) {
  //   if (fileUpload === 'File uploaded successfully') {
  //     this.getItrDocuments();


  deleteFile(fileName) {
    let adminId = JSON.parse(localStorage.getItem("UMD"));
    var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
    let filePath = `${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((responce: any) => {
      console.log('Doc delete responce: ', responce);
      this.utilsService.showSnackBar(responce.response);
      this.getItrDocuments();
    },
      error => {
        console.log('Doc delete ERROR responce: ', error.responce);
        this.utilsService.showSnackBar(error.response);
      })
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.deletedFileData = res;
      console.log('Deleted file detail info: ', this.deletedFileData);
    },
      error => {
        this.loading = false;
      })
  }

  closeDialog() {
    this.deletedFileData = [];
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getItrDocuments();
    }
  }

  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  docDetails = {
    docUrl: '',
    docType: ''
  };
  getDocsUrl(index) {
    if (this.itrDocuments.length > 0) {
      const docType = this.itrDocuments[index].fileName.split('.').pop();
      if (this.itrDocuments[index].isPasswordProtected) {
        this.docDetails.docUrl = this.itrDocuments[index].passwordProtectedFileUrl;
      } else {
        this.docDetails.docUrl = this.itrDocuments[index].signedUrl;
      }
      this.docDetails.docType = docType;
    } else {
      this.docDetails.docUrl = '';
      this.docDetails.docType = '';
    }

    console.log('Doc URL: ', this.docDetails.docUrl)
  }

  radioChange80u(setDefault) {
    if (this.selected80u === 'SELF_WITH_DISABILITY') {
      this.maxLimit80u = 75000;
    } else if (this.selected80u === 'SELF_WITH_SEVERE_DISABILITY') {
      this.maxLimit80u = 125000
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80u'].setValue(this.maxLimit80u)

  }
  radioChange80dd(setDefault) {
    if (this.selected80dd === 'DEPENDENT_PERSON_WITH_DISABILITY') {
      this.maxLimit80dd = 75000
    } else if (this.selected80dd === 'DEPENDENT_PERSON_WITH_SEVERE_DISABILITY') {
      this.maxLimit80dd = 125000
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80dd'].setValue(this.maxLimit80dd)
  }
  radioChange80ddb(setDefault) {
    if (this.selected80ddb === 'SELF_OR_DEPENDENT') {
      this.maxLimit80ddb = 40000
    } else if (this.selected80ddb === 'SELF_OR_DEPENDENT_SENIOR_CITIZEN') {
      this.maxLimit80ddb = 100000
    }
    if (setDefault)
      this.investmentDeductionForm.controls['us80ddb'].setValue(this.maxLimit80ddb)
  }

  ngDoCheck() {
    if (this.selected80u !== '') {
      this.investmentDeductionForm.controls['us80u'].enable();
      this.investmentDeductionForm.controls['us80u'].setValidators([Validators.max(this.maxLimit80u)]);
    } else {
      this.investmentDeductionForm.controls['us80u'].disable();
    }
    if (this.selected80dd !== '') {
      this.investmentDeductionForm.controls['us80dd'].enable();
      this.investmentDeductionForm.controls['us80dd'].setValidators([Validators.max(this.maxLimit80dd)]);
    } else {
      this.investmentDeductionForm.controls['us80dd'].disable();
    }
    if (this.selected80ddb !== '') {
      this.investmentDeductionForm.controls['us80ddb'].enable();
      this.investmentDeductionForm.controls['us80ddb'].setValidators([Validators.max(this.maxLimit80ddb)]);
    } else {
      this.investmentDeductionForm.controls['us80ddb'].disable();
    }

    if (this.investmentDeductionForm.controls['selfPremium'].value > 0) {
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].setValue(null)
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].disable();
    } else if (this.investmentDeductionForm.controls['selfMedicalExpenditure'].value > 0) {
      this.investmentDeductionForm.controls['selfPremium'].setValue(null)
      this.investmentDeductionForm.controls['selfPremium'].disable();
    }
    if (this.investmentDeductionForm.controls['premium'].value > 0) {
      this.investmentDeductionForm.controls['medicalExpenditure'].setValue(null)
      this.investmentDeductionForm.controls['medicalExpenditure'].disable();
    } else if (this.investmentDeductionForm.controls['medicalExpenditure'].value > 0) {
      this.investmentDeductionForm.controls['premium'].setValue(null)
      this.investmentDeductionForm.controls['premium'].disable();
    }
  }

  disableSelf(value) {
    if (value === 'HEALTH') {
      this.investmentDeductionForm.controls['selfMedicalExpenditure'].enable();
      if (this.investmentDeductionForm.controls['selfPremium'].value > 0) {
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].setValue(null)
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].disable();
      }
    } else if (value === 'MEDICAL') {
      this.investmentDeductionForm.controls['selfPremium'].enable();
      if (this.investmentDeductionForm.controls['selfMedicalExpenditure'].value > 0) {
        this.investmentDeductionForm.controls['selfPremium'].setValue(null)
        this.investmentDeductionForm.controls['selfPremium'].disable();
      }
    }
  }
  disableParent(value) {
    if (value === 'HEALTH') {
      this.investmentDeductionForm.controls['medicalExpenditure'].enable();
      if (this.investmentDeductionForm.controls['premium'].value > 0) {
        this.investmentDeductionForm.controls['medicalExpenditure'].setValue(null)
        this.investmentDeductionForm.controls['medicalExpenditure'].disable();
      }
    } else if (value === 'MEDICAL') {
      this.investmentDeductionForm.controls['premium'].enable();
      if (this.investmentDeductionForm.controls['medicalExpenditure'].value > 0) {
        this.investmentDeductionForm.controls['premium'].setValue(null)
        this.investmentDeductionForm.controls['premium'].disable();
      }
    }
  }

  addNotes() {

  }

  editForm() {

  }

  closed() {

  }

  setStep(index: number) {
    this.step = index;
  }
}
