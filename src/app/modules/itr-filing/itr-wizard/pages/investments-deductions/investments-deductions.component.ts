import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, GridApi } from 'ag-grid-community';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { Router } from '@angular/router';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { MedicalExpensesComponent } from '../../components/medical-expenses/medical-expenses.component';
import { DonationsComponent } from '../../components/donations/donations.component';
import { OtherDeductionsComponent } from '../../components/other-deductions/other-deductions.component';
declare let $: any;

@Component({
  selector: 'app-investments-deductions',
  templateUrl: './investments-deductions.component.html',
  styleUrls: ['./investments-deductions.component.scss'],
})
export class InvestmentsDeductionsComponent
  extends WizardNavigation
  implements OnInit
{
  @ViewChild('medicalExpensesComponentRef', { static: false })
  MedicalExpensesComponent!: MedicalExpensesComponent;
  @ViewChild('donationsComponentRef', { static: false })
  sec80gDonationsComponent!: DonationsComponent;
  @ViewChild('donations80ggaComponentRef', { static: false })
  sec80ggaDonationsComponent!: DonationsComponent;
  @ViewChild('donations80ggcComponentRef', { static: false })
  sec80ggcDonationsComponent!: DonationsComponent;
  @ViewChild('otherDeductionsRef', { static: false })
  otherDeductionComponent!: OtherDeductionsComponent;

  step = 0;
  isAddDonation: number;
  loading: boolean = false;
  investmentDeductionForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  DonationGridOptions: GridOptions;
  public columnDefs;
  public rowData;
  api: GridApi;
  userAge: number = 0;
  itrDocuments = [];
  deletedFileData: any = [];
  maxLimit80u = 75000;
  selected80u = '';
  maxLimit80dd = 75000;
  selected80dd = '';
  maxLimit80ddb = 40000;
  selected80ddb = '';

  otherDonationToDropdown = [
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_DEF_FUND_CEN_GOVT',
      label: 'National Defence Fund set up by the Central Government',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'PM_NAT_REL_FUND',
      label: 'Prime Minister.s National Relief Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_FONDTN_COMM_HARMONY',
      label: 'National Foundation for Communal Harmony',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'APPR_UNIV_INSTI',
      label:
        'An approved university/educational institution of National eminence',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'ZILA_SAK_SAMITI',
      label:
        'Zila Saksharta Samiti constituted in any district under the chairmanship of the Collector of that district',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'MEDI_RELIF_STAT_GOVT',
      label:
        'Fund set up by a State Government for the medical relief to the poor',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_ILLNESS_FND',
      label: 'National Illness Assistance Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_BLD_TRANFSN',
      label:
        'National Blood Transfusion Council or to any State Blood Transfusion Council',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_TRST_FOR_AUTI',
      label:
        'National Trust for Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_SPRTS_FND',
      label: 'National Sports Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_CLT_FND',
      label: 'National Cultural Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'TCH_DEV_FND',
      label: 'Fund for Technology Development and Application',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'NAT_CHLD_FND',
      label: "National Children's Fund",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'CM_RELF_FND',
      label:
        "Chief Minister's Relief Fund or Lieutenant Governor.s Relief Fund with respect to any State or Union Territory",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'ARMY_CNTRL_FND',
      label:
        "The Army Central Welfare Fund or the Indian Naval Benevolent Fund or the Air Force Central Welfare Fund, Andhra Pradesh Chief Minister's Cyclone Relief Fund, 1996",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'MAH_CM_RELF_FND',
      label:
        "The Maharashtra Chief Minister's Relief Fund during October 1, 1993 and October 6, 1993",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'MAN_CM_ERTHQK_FND',
      label: "Chief Minister's Earthquake Relief Fund, Maharashtra",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'GUJ_ST_GOV_CM_ERTHQK_FND',
      label:
        'Any fund set up by the State Government of Gujarat exclusively for providing relief to the victims of earthquake in Gujarat',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'GUJ_CM_ERTHQK_FND',
      label:
        'Any trust, institution or fund to which Section 80G(5C) applies for providing relief to the victims of earthquake in Gujarat (contribution made during January 26, 2001 and September 30, 2001) or',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'PM_ARM_RELF_FND',
      label: "Prime Minister's Armenia Earthquake Relief Fund",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'AFR_FND',
      label: 'Africa (Public Contributions - India) Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'SWACHH_BHARAT_KOSH',
      label: 'Swachh Bharat Kosh (applicable from FY 2014-15)',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'CLEAN_GANGA_FND',
      label: 'Clean Ganga Fund (applicable from FY 2014-15)',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'FND_DRG_ABUSE',
      label:
        'National Fund for Control of Drug Abuse (applicable from FY 2015-16)',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'JN_MEM_FND',
      label: 'Jawaharlal Nehru Memorial Fund',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'PM_DROUGHT_RELF_FND',
      label: "Prime Minister's Drought Relief Fund",
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'IG_MEM_TRST',
      label: 'Indira Gandhi Memorial Trust',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'RG_FNDTN',
      label: 'Rajiv Gandhi Foundation',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'GOVT_APPRVD_FAMLY_PLNG',
      label:
        'Government or any approved local authority, institution or association to be utilised for the purpose of promoting family planning',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'DOTN_FOR_SPRTS',
      label:
        'Donation by a Company to the Indian Olympic Association or to any other notified association or institution established in India for the development of infrastructure for sports and games in India or the sponsorship of sports and games in India.',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'FND_SEC80G',
      label:
        'Any other fund or any institution which satisfies conditions mentioned in Section 80G(5)',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'DOTN_FOR_CHARITY_PURPOSE',
      label:
        'Government or any local authority to be utilised for any charitable purpose other than the purpose of promoting family planning',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'DOTN_HSG_ACCOMODATION',
      label:
        'Any authority constituted in India for the purpose of dealing with and satisfying the need for housing accommodation or for the purpose of planning, development or improvement of cities, towns, villages or both',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'DOTN_MIN_COMMUNITY',
      label:
        'Any corporation referred in Section 10(26BB) for promoting interest of minority community',
      description: 'NA',
      active: true,
    },
    {
      id: null,
      donationType: 'OTHER',
      value: 'DOTN_REPAIRS_RELIG_PLACE',
      label:
        'For repairs or renovation of any notified temple, mosque, gurudwara, church or other place',
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

  constructor(
    private router: Router,
    public utilsService: UtilsService,
    private fb: UntypedFormBuilder,
    private itrMsService: ItrMsService,
    public matDialog: MatDialog
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    const self = this.ITR_JSON.family.filter(
      (item: any) => item.relationShipCode === 'SELF'
    );
    if (self instanceof Array && self.length > 0) {
      this.userAge = self[0].age;
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
          haveUnlistedShares: false,
        };
      }
    }
  }

  ngOnInit() {
    this.investmentDeductionForm = this.fb.group({
      ELSS: [null, Validators.pattern(AppConstants.numericRegex)],
      PENSION_FUND: [null, Validators.pattern(AppConstants.numericRegex)],
      PS_EMPLOYEE: [null, Validators.pattern(AppConstants.numericRegex)],
      PS_EMPLOYER: [null, Validators.pattern(AppConstants.numericRegex)],
      PENSION_SCHEME: [null, Validators.pattern(AppConstants.numericRegex)],
      selfPremium: [null, Validators.pattern(AppConstants.numericRegex)],
      selfPreventiveCheckUp: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)],
      ],
      selfMedicalExpenditure: [
        null,
        Validators.pattern(AppConstants.numericRegex),
      ],
      premium: [null, Validators.pattern(AppConstants.numericRegex)],
      preventiveCheckUp: [
        null,
        [Validators.pattern(AppConstants.numericRegex), Validators.max(5000)],
      ],
      medicalExpenditure: [null, Validators.pattern(AppConstants.numericRegex)],
      us80tta: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ttb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80u: [null, Validators.pattern(AppConstants.numericRegex)],
      us80dd: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ddb: [null, Validators.pattern(AppConstants.numericRegex)],
      hasParentOverSixty: [null],
    });
    this.setInvestmentsDeductionsValues();
  }

  setValue(type, value){
    this.investmentDeductionForm.get(type).setValue(value);
  }
  saveInvestmentDeductions() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.investmentDeductionForm.valid) {
      Object.keys(this.investmentDeductionForm.controls).forEach(
        (item: any) => {
          if (
            item === 'ELSS' ||
            item === 'PENSION_FUND' ||
            item === 'PS_EMPLOYEE' ||
            item === 'PS_EMPLOYER' ||
            item === 'PENSION_SCHEME'
          ) {
            this.addAndUpdateInvestment(item);
          }
        }
      );

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  saveAll() {
    this.saveInvestmentDeductions();
    let g = this.sec80gDonationsComponent.saveGeneralDonation();
    let gga = this.sec80ggaDonationsComponent.saveGeneralDonation();
    let medicalExpenses =
      this.MedicalExpensesComponent.saveInvestmentDeductions();
    this.otherDeductionComponent.saveInvestmentDeductions();
    let ggc = this.sec80ggcDonationsComponent.saveGeneralDonation();
    let saved = g && gga && ggc;
    if (saved && medicalExpenses) {
      this.serviceCall();
    }
  }

  setInvestmentsDeductionsValues() {
    this.ITR_JSON.investments?.forEach((investment) => {
      if (
        investment.investmentType === 'ELSS' ||
        investment.investmentType === 'PENSION_FUND' ||
        investment.investmentType === 'PS_EMPLOYEE' ||
        investment.investmentType === 'PS_EMPLOYER' ||
        investment.investmentType === 'PENSION_SCHEME'
      )
        this.investmentDeductionForm.controls[
          investment.investmentType
        ].setValue(investment.amount);
    });

  }

  addAndUpdateInvestment(controlName) {
    if (
      this.utilsService.isNonEmpty(
        this.investmentDeductionForm.controls[controlName].value
      )
    ) {
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
          amount: Number(
            this.investmentDeductionForm.controls[controlName].value
          ),
          details: controlName,
        });
      } else {
        this.ITR_JSON.investments.splice(i, 1, {
          investmentType: controlName,
          amount: Number(
            this.investmentDeductionForm.controls[controlName].value
          ),
          details: controlName,
        });
      }
    } else {
      this.ITR_JSON.investments = this.ITR_JSON.investments?.filter(
        (item: any) => item.investmentType !== controlName
      );
    }
  }

  addDonation(type) {
    if (type === 'donation') {
      this.isAddDonation = Math.random();
    }
  }

  serviceCall() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.loading = false;
        this.utilsService.showSnackBar(
          'Investment / Deduction details saved successfully'
        );
        this.saveAndNext.emit(false);
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        console.log(error);
        this.utilsService.showSnackBar(
          'Error saving investment/deduction details'
        );
      }
    );
  }

  openNotesDialog(client) {
    let disposable = this.matDialog.open(UserNotesComponent, {
      width: '60vw',
      height: '90vh',
      data: {
        title: 'Add Notes',
        userId: this.ITR_JSON.userId,
        clientName:
          this.ITR_JSON.family[0].fName + ' ' + this.ITR_JSON.family[0].lName,
        serviceType: 'ITR',
        clientMobileNumber: this.ITR_JSON.contactNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => {});
  }

  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
