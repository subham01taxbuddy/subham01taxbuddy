import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Form, Validators, FormArray } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-fa',
  templateUrl: './schedule-fa.component.html',
  styleUrls: ['./schedule-fa.component.scss'],
})
export class ScheduleFaComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  topicList = [
    {
      label:
        'A1. Details of Foreign Depository Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2023',
      code: 'A1',
    },
    {
      label:
        'A2. Details of Foreign Custodial Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2023',
      code: 'A2',
    },
    {
      label:
        'A3. Details of Foreign Equity and Debt Interest held (including any beneficial interest) in any entity at any time during the calendar year ending as on 31st December, 2023',
      code: 'A3',
    },
    {
      label:
        'A4. Details of Foreign Cash Value insurance Contract or Annuity Contract held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2023',
      code: 'A4',
    },
    {
      label:
        'B. Details of Financial Interest in any Entity held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2023',
      code: 'B',
    },
    {
      label:
        'C. Details of Immovable Property held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2023',
      code: 'C',
    },
    {
      label:
        'D. Details of any other Capital Asset held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2023',
      code: 'D',
    },
    {
      label:
        'E. Details of account(s) in which you have signing authority held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2023 and which has not been included in A to D above',
      code: 'E',
    },
    {
      label:
        'F. Details of trusts, created under the laws of a country outside India, in which you are a trustee, beneficiary or settlor',
      code: 'F',
    },
    {
      label:
        'G. Details of any other income derived from any source outside India which is not included in - (i) items A to F above, (ii) income under the head business or profession',
      code: 'G',
    },
  ];

  natureOfInterest = [
    'Direct',
    'Beneficial Owner',
    'Beneficiary'
  ]
  scheduleWhereOffered = [
    'Salary',
    'House Property',
    'Capital Gains',
    'Business',
    'Other Sources',
    'Exempt Income',
    'No Income during the year',
  ];
  natureOfIncome = [
    'Interest',
    'Dividend',
    'Proceeds from sale or redemption of financial assets',
    'Other income',
    'No Amount Paid/Credited',
  ];
  natureOfInterestOwnership = ['DIRECT', 'BENEFICIAL_OWNER', 'BENIFICIARY'];
  status = ['Select', 'OWNER', 'BENEFICIAL_OWNER', 'BENIFICIARY'];
  countryCodeList: any;
  scheduleFa: UntypedFormGroup;
  isPanelOpen: boolean = false;
  maxPurchaseDate: any;
  selectedIndexes: number[] = [];
  selectedAccountIndexes: number[] = [];
  countryNameCodeList: any;

  constructor(
    private fb: UntypedFormBuilder,
    private utilsService: UtilsService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.countryCodeList = [
      { "code": 93, "name": "AFGHANISTAN" },
      { "code": 1001, "name": "ÅLAND ISLANDS" },
      { "code": 355, "name": "ALBANIA" },
      { "code": 213, "name": "ALGERIA" },
      { "code": 684, "name": "AMERICAN SAMOA" },
      { "code": 376, "name": "ANDORRA" },
      { "code": 244, "name": "ANGOLA" },
      { "code": 1264, "name": "ANGUILLA" },
      { "code": 1010, "name": "ANTARCTICA" },
      { "code": 1268, "name": "ANTIGUA AND BARBUDA" },
      { "code": 54, "name": "ARGENTINA" },
      { "code": 374, "name": "ARMENIA" },
      { "code": 297, "name": "ARUBA" },
      { "code": 61, "name": "AUSTRALIA" },
      { "code": 43, "name": "AUSTRIA" },
      { "code": 994, "name": "AZERBAIJAN" },
      { "code": 1242, "name": "BAHAMAS" },
      { "code": 973, "name": "BAHRAIN" },
      { "code": 880, "name": "BANGLADESH" },
      { "code": 1246, "name": "BARBADOS" },
      { "code": 375, "name": "BELARUS" },
      { "code": 32, "name": "BELGIUM" },
      { "code": 501, "name": "BELIZE" },
      { "code": 229, "name": "BENIN" },
      { "code": 1441, "name": "BERMUDA" },
      { "code": 975, "name": "BHUTAN" },
      { "code": 591, "name": "BOLIVIA (PLURINATIONAL STATE OF)" },
      { "code": 1002, "name": "BONAIRE, SINT EUSTATIUS AND SABA" },
      { "code": 387, "name": "BOSNIA AND HERZEGOVINA" },
      { "code": 267, "name": "BOTSWANA" },
      { "code": 1003, "name": "BOUVET ISLAND" },
      { "code": 55, "name": "BRAZIL" },
      { "code": 1014, "name": "BRITISH INDIAN OCEAN TERRITORY" },
      { "code": 673, "name": "BRUNEI DARUSSALAM" },
      { "code": 359, "name": "BULGARIA" },
      { "code": 226, "name": "BURKINA FASO" },
      { "code": 257, "name": "BURUNDI" },
      { "code": 238, "name": "CABO VERDE" },
      { "code": 855, "name": "CAMBODIA" },
      { "code": 237, "name": "CAMEROON" },
      { "code": 1, "name": "CANADA" },
      { "code": 1345, "name": "CAYMAN ISLANDS" },
      { "code": 236, "name": "CENTRAL AFRICAN REPUBLIC" },
      { "code": 235, "name": "CHAD" },
      { "code": 56, "name": "CHILE" },
      { "code": 86, "name": "CHINA" },
      { "code": 9, "name": "CHRISTMAS ISLAND" },
      { "code": 672, "name": "COCOS (KEELING) ISLANDS" },
      { "code": 57, "name": "COLOMBIA" },
      { "code": 270, "name": "COMOROS" },
      { "code": 242, "name": "CONGO" },
      { "code": 243, "name": "CONGO (DEMOCRATIC REPUBLIC OF THE)" },
      { "code": 682, "name": "COOK ISLANDS" },
      { "code": 506, "name": "COSTA RICA" },
      { "code": 225, "name": "CÔTE D'IVOIRE" },
      { "code": 385, "name": "CROATIA" },
      { "code": 53, "name": "CUBA" },
      { "code": 1015, "name": "CURAÇAO" },
      { "code": 357, "name": "CYPRUS" },
      { "code": 420, "name": "CZECHIA" },
      { "code": 45, "name": "DENMARK" },
      { "code": 253, "name": "DJIBOUTI" },
      { "code": 1767, "name": "DOMINICA" },
      { "code": 1809, "name": "DOMINICAN REPUBLIC" },
      { "code": 593, "name": "ECUADOR" },
      { "code": 20, "name": "EGYPT" },
      { "code": 503, "name": "EL SALVADOR" },
      { "code": 240, "name": "EQUATORIAL GUINEA" },
      { "code": 291, "name": "ERITREA" },
      { "code": 372, "name": "ESTONIA" },
      { "code": 251, "name": "ETHIOPIA" },
      { "code": 500, "name": "FALKLAND ISLANDS (MALVINAS)" },
      { "code": 298, "name": "FAROE ISLANDS" },
      { "code": 679, "name": "FIJI" },
      { "code": 358, "name": "FINLAND" },
      { "code": 33, "name": "FRANCE" },
      { "code": 594, "name": "FRENCH GUIANA" },
      { "code": 689, "name": "FRENCH POLYNESIA" },
      { "code": 1004, "name": "FRENCH SOUTHERN TERRITORIES" },
      { "code": 241, "name": "GABON" },
      { "code": 220, "name": "GAMBIA" },
      { "code": 995, "name": "GEORGIA" },
      { "code": 49, "name": "GERMANY" },
      { "code": 233, "name": "GHANA" },
      { "code": 350, "name": "GIBRALTAR" },
      { "code": 30, "name": "GREECE" },
      { "code": 299, "name": "GREENLAND" },
      { "code": 1473, "name": "GRENADA" },
      { "code": 590, "name": "GUADELOUPE" },
      { "code": 1671, "name": "GUAM" },
      { "code": 502, "name": "GUATEMALA" },
      { "code": 1481, "name": "GUERNSEY" },
      { "code": 224, "name": "GUINEA" },
      { "code": 245, "name": "GUINEA-BISSAU" },
      { "code": 592, "name": "GUYANA" },
      { "code": 509, "name": "HAITI" },
      { "code": 1005, "name": "HEARD ISLAND AND MCDONALD ISLANDS" },
      { "code": 6, "name": "HOLY SEE" },
      { "code": 504, "name": "HONDURAS" },
      { "code": 852, "name": "HONG KONG" },
      { "code": 36, "name": "HUNGARY" },
      { "code": 354, "name": "ICELAND" },
      { "code": 62, "name": "INDONESIA" },
      { "code": 98, "name": "IRAN (ISLAMIC REPUBLIC OF)" },
      { "code": 964, "name": "IRAQ" },
      { "code": 353, "name": "IRELAND" },
      { "code": 1624, "name": "ISLE OF MAN" },
      { "code": 972, "name": "ISRAEL" },
      { "code": 5, "name": "ITALY" },
      { "code": 1876, "name": "JAMAICA" },
      { "code": 81, "name": "JAPAN" },
      { "code": 1534, "name": "JERSEY" },
      { "code": 962, "name": "JORDAN" },
      { "code": 7, "name": "KAZAKHSTAN" },
      { "code": 254, "name": "KENYA" },
      { "code": 686, "name": "KIRIBATI" },
      { "code": 850, "name": "KOREA (DEMOCRATIC PEOPLE'S REPUBLIC OF)" },
      { "code": 82, "name": "KOREA (REPUBLIC OF)" },
      { "code": 965, "name": "KUWAIT" },
      { "code": 996, "name": "KYRGYZSTAN" },
      { "code": 856, "name": "LAO PEOPLE'S DEMOCRATIC REPUBLIC" },
      { "code": 371, "name": "LATVIA" },
      { "code": 961, "name": "LEBANON" },
      { "code": 266, "name": "LESOTHO" },
      { "code": 231, "name": "LIBERIA" },
      { "code": 218, "name": "LIBYA" },
      { "code": 423, "name": "LIECHTENSTEIN" },
      { "code": 370, "name": "LITHUANIA" },
      { "code": 352, "name": "LUXEMBOURG" },
      { "code": 853, "name": "MACAO" },
      { "code": 389, "name": "MACEDONIA (THE FORMER YUGOSLAV REPUBLIC OF)" },
      { "code": 261, "name": "MADAGASCAR" },
      { "code": 256, "name": "MALAWI" },
      { "code": 60, "name": "MALAYSIA" },
      { "code": 960, "name": "MALDIVES" },
      { "code": 223, "name": "MALI" },
      { "code": 356, "name": "MALTA" },
      { "code": 692, "name": "MARSHALL ISLANDS" },
      { "code": 596, "name": "MARTINIQUE" },
      { "code": 222, "name": "MAURITANIA" },
      { "code": 230, "name": "MAURITIUS" },
      { "code": 269, "name": "MAYOTTE" },
      { "code": 52, "name": "MEXICO" },
      { "code": 691, "name": "MICRONESIA (FEDERATED STATES OF)" },
      { "code": 373, "name": "MOLDOVA (REPUBLIC OF)" },
      { "code": 377, "name": "MONACO" },
      { "code": 976, "name": "MONGOLIA" },
      { "code": 382, "name": "MONTENEGRO" },
      { "code": 1664, "name": "MONTSERRAT" },
      { "code": 212, "name": "MOROCCO" },
      { "code": 258, "name": "MOZAMBIQUE" },
      { "code": 95, "name": "MYANMAR" },
      { "code": 264, "name": "NAMIBIA" },
      { "code": 674, "name": "NAURU" },
      { "code": 977, "name": "NEPAL" },
      { "code": 31, "name": "NETHERLANDS" },
      { "code": 687, "name": "NEW CALEDONIA" },
      { "code": 64, "name": "NEW ZEALAND" },
      { "code": 505, "name": "NICARAGUA" },
      { "code": 227, "name": "NIGER" },
      { "code": 234, "name": "NIGERIA" },
      { "code": 683, "name": "NIUE" },
      { "code": 15, "name": "NORFOLK ISLAND" },
      { "code": 1670, "name": "NORTHERN MARIANA ISLANDS" },
      { "code": 47, "name": "NORWAY" },
      { "code": 968, "name": "OMAN" },
      { "code": 92, "name": "PAKISTAN" },
      { "code": 680, "name": "PALAU" },
      { "code": 970, "name": "PALESTINE, STATE OF" },
      { "code": 507, "name": "PANAMA" },
      { "code": 675, "name": "PAPUA NEW GUINEA" },
      { "code": 595, "name": "PARAGUAY" },
      { "code": 51, "name": "PERU" },
      { "code": 63, "name": "PHILIPPINES" },
      { "code": 1011, "name": "PITCAIRN" },
      { "code": 48, "name": "POLAND" },
      { "code": 14, "name": "PORTUGAL" },
      { "code": 1787, "name": "PUERTO RICO" },
      { "code": 974, "name": "QATAR" },
      { "code": 262, "name": "RÉUNION" },
      { "code": 40, "name": "ROMANIA" },
      { "code": 8, "name": "RUSSIAN FEDERATION" },
      { "code": 250, "name": "RWANDA" },
      { "code": 1006, "name": "SAINT BARTHÉLEMY" },
      { "code": 290, "name": "SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA" },
      { "code": 1869, "name": "SAINT KITTS AND NEVIS" },
      { "code": 1758, "name": "SAINT LUCIA" },
      { "code": 1007, "name": "SAINT MARTIN (FRENCH PART)" },
      { "code": 508, "name": "SAINT PIERRE AND MIQUELON" },
      { "code": 1784, "name": "SAINT VINCENT AND THE GRENADINES" },
      { "code": 685, "name": "SAMOA" },
      { "code": 378, "name": "SAN MARINO" },
      { "code": 239, "name": "SAO TOME AND PRINCIPE" },
      { "code": 966, "name": "SAUDI ARABIA" },
      { "code": 221, "name": "SENEGAL" },
      { "code": 381, "name": "SERBIA" },
      { "code": 248, "name": "SEYCHELLES" },
      { "code": 232, "name": "SIERRA LEONE" },
      { "code": 65, "name": "SINGAPORE" },
      { "code": 1721, "name": "SINT MAARTEN (DUTCH PART)" },
      { "code": 421, "name": "SLOVAKIA" },
      { "code": 386, "name": "SLOVENIA" },
      { "code": 677, "name": "SOLOMON ISLANDS" },
      { "code": 252, "name": "SOMALIA" },
      { "code": 28, "name": "SOUTH AFRICA" },
      { "code": 1008, "name": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS" },
      { "code": 211, "name": "SOUTH SUDAN" },
      { "code": 35, "name": "SPAIN" },
      { "code": 94, "name": "SRI LANKA" },
      { "code": 249, "name": "SUDAN" },
      { "code": 597, "name": "SURINAME" },
      { "code": 1012, "name": "SVALBARD AND JAN MAYEN" },
      { "code": 268, "name": "SWAZILAND" },
      { "code": 46, "name": "SWEDEN" },
      { "code": 41, "name": "SWITZERLAND" },
      { "code": 963, "name": "SYRIAN ARAB REPUBLIC" },
      { "code": 886, "name": "TAIWAN, PROVINCE OF CHINA[A]" },
      { "code": 992, "name": "TAJIKISTAN" },
      { "code": 255, "name": "TANZANIA, UNITED REPUBLIC OF" },
      { "code": 66, "name": "THAILAND" },
      { "code": 670, "name": "TIMOR-LESTE (EAST TIMOR)" },
      { "code": 228, "name": "TOGO" },
      { "code": 690, "name": "TOKELAU" },
      { "code": 676, "name": "TONGA" },
      { "code": 1868, "name": "TRINIDAD AND TOBAGO" },
      { "code": 216, "name": "TUNISIA" },
      { "code": 90, "name": "TURKEY" },
      { "code": 993, "name": "TURKMENISTAN" },
      { "code": 1649, "name": "TURKS AND CAICOS ISLANDS" },
      { "code": 688, "name": "TUVALU" },
      { "code": 256, "name": "UGANDA" },
      { "code": 380, "name": "UKRAINE" },
      { "code": 971, "name": "UNITED ARAB EMIRATES" },
      { "code": 44, "name": "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND" },
      { "code": 2, "name": "UNITED STATES OF AMERICA" },
      { "code": 1009, "name": "UNITED STATES MINOR OUTLYING ISLANDS" },
      { "code": 598, "name": "URUGUAY" },
      { "code": 998, "name": "UZBEKISTAN" },
      { "code": 678, "name": "VANUATU" },
      { "code": 58, "name": "VENEZUELA (BOLIVARIAN REPUBLIC OF)" },
      { "code": 84, "name": "VIET NAM" },
      { "code": 1284, "name": "VIRGIN ISLANDS (BRITISH)" },
      { "code": 1340, "name": "VIRGIN ISLANDS (U.S.)" },
      { "code": 681, "name": "WALLIS AND FUTUNA" },
      { "code": 2122, "name": "WESTERN SAHARA" },
      { "code": 967, "name": "YEMEN" },
      { "code": 260, "name": "ZAMBIA" },
      { "code": 263, "name": "ZIMBABWE" }
    ];

    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.scheduleFa = this.fb.group({});

    const assetTypes = [
      'depositoryAccounts',
      'equityAndDebtInterest',
      'cashValueInsurance',
      'financialInterestDetails',
      'immovablePropertryDetails',
      'capitalAssetsDetails',
      'trustsDetails',
      'otherIncomeDetails',
      'signingAuthorityDetails',
      'custodialAccounts',
    ];

    assetTypes.forEach((assetType) => {
      const asset = this.ITR_JSON?.foreignIncome?.foreignAssets?.[assetType];
      const formNotAdded: boolean = !this.scheduleFa.get(assetType);

      if (formNotAdded) {
        this.scheduleFa.addControl(assetType, this.initForms(assetType));
      }

      if (asset?.length > 0) {
        this.createForms(assetType, asset);
      }
    });

    this.maxPurchaseDate = new Date();
  }

  initForms(assetType) {
    switch (assetType) {
      case 'depositoryAccounts':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            nameOfInstitution: null,
            addressOfInstitution: null,
            zipCode: [null, [Validators.maxLength(8)]],
            account: this.fb.array([
              this.fb.group({
                hasEdit: null,
                accountNumber: null,
                status: null,
                accountOpeningDate: null,
                peakBalance: null,
                closingBalance: null,
                grossInterestPaid: null,
              }),
            ]),
          }),
        ]);
      case 'custodialAccounts':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            nameOfInstitution: null,
            addressOfInstitution: null,
            zipCode: [null, [Validators.maxLength(8)]],
            account: this.fb.array([
              this.fb.group({
                accountNumber: null,
                status: null,
                accountOpeningDate: null,
                peakBalance: null,
                closingBalance: null,
                grossAmountNature: null,
                grossInterestPaid: null,
                dateOfContract: null,
                cashValue: null,
                totalGrossAmountPaid: null,
              }),
            ]),
          }),
        ]);
      case 'equityAndDebtInterest':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            nameOfEntity: null,
            addressOfEntity: null,
            zipCode: [null, [Validators.maxLength(8)]],
            natureOfEntity: null,
            dateOfInterest: null,
            initialValue: null,
            peakValue: null,
            closingValue: null,
            totalGrossAmountPaid: null,
            totalGrossProceedsFromSale: null,
          }),
        ]);
      case 'cashValueInsurance':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            nameOfInstitution: null,
            addressOfInstitution: null,
            zipCode: [null, [Validators.maxLength(8)]],
            dateOfContract: null,
            cashValue: null,
            totalGrossAmountPaid: null,
          }),
        ]);
      case 'financialInterestDetails':
        return this.fb.array([
          this.fb.group({
            countryCode: null,
            countryName: null,
            natureOfEntity: null,
            nameOfEntity: null,
            address: null,
            zipCode: [null, [Validators.maxLength(8)]],
            natureOfInterest: null,
            date: null,
            totalInvestments: null,
            accruedIncome: null,
            natureOfIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          }),
        ]);
      case 'immovablePropertryDetails':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            address: null,
            zipCode: [null, [Validators.maxLength(8)]],
            ownerShip: null,
            date: null,
            totalInvestments: null,
            derivedIncome: null,
            natureOfIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          }),
        ]);
      case 'capitalAssetsDetails':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            zipCode: [null, [Validators.maxLength(8)]],
            natureOfAsstes: null,
            ownerShip: null,
            date: null,
            totalInvestments: null,
            derivedIncome: null,
            natureOfIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          }),
        ]);
      case 'signingAuthorityDetails':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            institutionName: null,
            address: null,
            zipCode: [null, [Validators.maxLength(8)]],
            account: this.fb.array([
              this.fb.group({
                accountHolderName: null,
                accountNumber: null,
                peakBalance: null,
                isTaxableinYourHand: null,
                accruedIncome: null,
                amount: null,
                scheduleOfferd: null,
                numberOfSchedule: null,
              }),
            ]),
          }),
        ]);
      case 'trustsDetails':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            zipCode: [null, [Validators.maxLength(8)]],
            trustName: null,
            trustAddress: null,
            trusteesName: null,
            trusteesAddress: null,
            settlorName: null,
            settlorAddress: null,
            beneficiariesName: null,
            beneficiariesAddress: null,
            date: null,
            isTaxableinYourHand: null,
            derivedIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          }),
        ]);
      case 'otherIncomeDetails':
        return this.fb.array([
          this.fb.group({
            countryName: null,
            countryCode: null,
            zipCode: [null, [Validators.maxLength(8)]],
            name: null,
            address: null,
            natureOfIncome: null,
            isTaxableinYourHand: null,
            derivedIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          }),
        ]);
      default:
        return this.fb.array([]);
    }
  }

  updateMultipleTypeForm(asset, assetType) {
    const formArray = this.scheduleFa?.controls[assetType] as FormArray;
    formArray.clear();

    const groupedAccounts = asset?.reduce((result, acc) => {
      const countryCode = acc?.countryCode;
      const nameOfInstitution = acc?.nameOfInstitution;
      const addressOfInstitution = acc?.addressOfInstitution;
      const address = acc?.address;
      const institutionName = acc?.institutionName;
      const zipCode = acc?.zipCode;

      if (!result[countryCode]) {
        result[countryCode] = {
          countryCode: countryCode,
          nameOfInstitution: nameOfInstitution,
          addressOfInstitution: addressOfInstitution,
          zipCode: zipCode,
          address: address,
          institutionName: institutionName,
          account: [],
        };
      }

      const accountDetails = { ...acc };
      delete accountDetails?.countryCode;
      delete accountDetails?.nameOfInstitution;
      delete accountDetails?.addressOfInstitution;
      delete accountDetails?.zipCode;
      delete accountDetails?.address;
      delete accountDetails?.institutionName;

      result[countryCode]?.account?.push(accountDetails);

      return result;
    }, {});

    // Assuming you have 'groupedAccounts' object
    for (const countryCode in groupedAccounts) {
      if (groupedAccounts?.hasOwnProperty(countryCode)) {
        const group = groupedAccounts[countryCode];
        const formGroup = this.fb.group({
          countryCode: [group?.countryCode],
          nameOfInstitution: [group?.nameOfInstitution],
          institutionName: [group?.institutionName],
          addressOfInstitution: [group?.addressOfInstitution],
          address: [group?.address],
          zipCode: [group?.zipCode, [Validators.maxLength(8)]],
          account: this.fb.array([]),
        });
        const accountFormArray = formGroup?.get('account') as FormArray;

        group.account.forEach((other) => {
          const accountFormGroup = this.fb.group({
            hasEdit: null,
            accountNumber: null,
            status: null,
            accountOpeningDate: null,
            peakBalance: null,
            closingBalance: null,
            grossInterestPaid: null,
            grossAmountNature: null,
            accountHolderName: null,
            isTaxableinYourHand: null,
            accruedIncome: null,
            amount: null,
            numberOfSchedule: null,
            scheduleOfferd: null,
          });

          accountFormGroup?.patchValue(other);
          accountFormGroup.updateValueAndValidity();
          accountFormArray?.push(accountFormGroup);
        });

        formGroup?.updateValueAndValidity();
        formArray?.push(formGroup);
        formArray?.updateValueAndValidity();
      }
    }
  }

  createForms(assetType: string, asset: any[]) {
    console.log('creatingForms:', asset, assetType);
    const formArray = this.scheduleFa?.controls[assetType] as FormArray;
    formArray.clear();
    if (assetType === 'depositoryAccounts') {
      this.updateMultipleTypeForm(asset, assetType);
    }

    if (assetType === 'custodialAccounts') {
      this.updateMultipleTypeForm(asset, assetType);
    }

    if (assetType === 'signingAuthorityDetails') {
      this.updateMultipleTypeForm(asset, assetType);
    }

    asset.forEach((item, index) => {
      if (assetType === 'equityAndDebtInterest') {
        const formGroup = this.fb.group({
          countryName: this.getCountryNameFromCode(item.countryCode),
          countryCode: item.countryCode,
          nameOfEntity: item.nameOfEntity,
          addressOfEntity: item.addressOfEntity,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          natureOfEntity: item.natureOfEntity,
          dateOfInterest: item.dateOfInterest,
          initialValue: item.initialValue,
          peakValue: item.peakValue,
          closingValue: item.closingValue,
          totalGrossAmountPaid: item.totalGrossAmountPaid,
          totalGrossProceedsFromSale: item.totalGrossProceedsFromSale,
        });
        formArray.push(formGroup);
      } else if (assetType === 'cashValueInsurance') {
        const formGroup = this.fb.group({
          countryCode: item.countryCode,
          countryName: this.getCountryNameFromCode(item.countryCode),
          nameOfInstitution: item.nameOfInstitution,
          addressOfInstitution: item.addressOfInstitution,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          dateOfContract: item.dateOfContract,
          cashValue: item.cashValue,
          totalGrossAmountPaid: item.totalGrossAmountPaid,
        });
        formArray.push(formGroup);
      } else if (assetType === 'financialInterestDetails') {
        const formGroup = this.fb.group({
          id: item.id,
          countryCode: item.countryCode,
          countryName: this.getCountryNameFromCode(item.countryCode),
          natureOfEntity: item.natureOfEntity,
          nameOfEntity: item.nameOfEntity,
          address: item.address,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          natureOfInterest: item.natureOfInterest,
          date: item.date,
          totalInvestments: item.totalInvestments,
          accruedIncome: item.accruedIncome,
          natureOfIncome: item.natureOfIncome,
          amount: item.amount,
          scheduleOfferd: item.scheduleOfferd,
          numberOfSchedule: item.numberOfSchedule,
        });
        formArray.push(formGroup);
      } else if (assetType === 'immovablePropertryDetails') {
        const formGroup = this.fb.group({
          countryName: this.getCountryNameFromCode(item.countryCode),
          countryCode: item.countryCode,
          address: item.address,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          ownerShip: item.ownerShip,
          date: item.date,
          totalInvestments: item.totalInvestments,
          derivedIncome: item.derivedIncome,
          natureOfIncome: item.natureOfIncome,
          amount: item.amount,
          scheduleOfferd: item.scheduleOfferd,
          numberOfSchedule: item.numberOfSchedule,
        });
        formArray.push(formGroup);
      } else if (assetType === 'capitalAssetsDetails') {
        const formGroup = this.fb.group({
          countryName: this.getCountryNameFromCode(item.countryCode),
          countryCode: item.countryCode,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          natureOfAsstes: item.natureOfAsstes,
          ownerShip: item.ownerShip,
          date: item.date,
          totalInvestments: item.totalInvestments,
          derivedIncome: item.derivedIncome,
          natureOfIncome: item.natureOfIncome,
          amount: item.amount,
          scheduleOfferd: item.scheduleOfferd,
          numberOfSchedule: item.numberOfSchedule,
        });
        formArray.push(formGroup);
      } else if (assetType === 'trustsDetails') {
        const formGroup = this.fb.group({
          countryName: this.getCountryNameFromCode(item.countryCode),
          countryCode: item.countryCode,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          trustName: item.trustName,
          trustAddress: item.trustAddress,
          trusteesName: item.trusteesName,
          trusteesAddress: item.trusteesAddress,
          settlorName: item.settlorName,
          settlorAddress: item.settlorAddress,
          beneficiariesName: item.beneficiariesName,
          beneficiariesAddress: item.beneficiariesAddress,
          date: item.date,
          isTaxableinYourHand: item.isTaxableinYourHand,
          derivedIncome: item.derivedIncome,
          amount: item.amount,
          scheduleOfferd: item.scheduleOfferd,
          numberOfSchedule: item.numberOfSchedule,
        });
        formArray.push(formGroup);
      } else if (assetType === 'otherIncomeDetails') {
        const formGroup = this.fb.group({
          countryName: this.getCountryNameFromCode(item.countryCode),
          countryCode: item.countryCode,
          zipCode: [item.zipCode, [Validators.maxLength(8)]],
          name: item.name,
          address: item.address,
          natureOfIncome: item.natureOfIncome,
          isTaxableinYourHand: item.isTaxableinYourHand,
          derivedIncome: item.derivedIncome,
          amount: item.amount,
          scheduleOfferd: item.scheduleOfferd,
          numberOfSchedule: item.numberOfSchedule,
        });
        formArray.push(formGroup);
      }
    });
    console.log(formArray);
  }

  // adding whole section
  addMore(section, i?) {
    const newFormGroup = this.initForms(section);

    if (newFormGroup) {
      const formArray = this.scheduleFa.get(section) as FormArray;
      if (formArray.valid) {
        formArray.push(newFormGroup.controls[0]);
      } else {
        this.utilsService.showSnackBar(
          'Please make sure that all the existing details are entered correctly'
        );
      }
    }
  }

  // adding nested form array
  add(section, i) {
    let accountControls: any;
    if (section === 'depositoryAccounts') {
      accountControls = this.getAccountControls(i);
    } else if (section === 'signingAuthorityDetails') {
      accountControls = this.getSigningAuthAccountControls(i);
    } else if (section === 'custodialAccounts') {
      accountControls = this.getCustodialAccountControls(i);
    }

    if (accountControls.valid) {
      if (section === 'depositoryAccounts') {
        accountControls.push(
          this.fb.group({
            hasEdit: null,
            accountNumber: null,
            status: null,
            accountOpeningDate: null,
            peakBalance: null,
            closingBalance: null,
            grossInterestPaid: null,
          })
        );
      } else if (section === 'signingAuthorityDetails') {
        accountControls.push(
          this.fb.group({
            accountHolderName: null,
            accountNumber: null,
            peakBalance: null,
            isTaxableinYourHand: null,
            accruedIncome: null,
            amount: null,
            scheduleOfferd: null,
            numberOfSchedule: null,
          })
        );
      } else if (section === 'custodialAccounts') {
        accountControls.push(
          this.fb.group({
            accountNumber: null,
            status: null,
            accountOpeningDate: null,
            peakBalance: null,
            closingBalance: null,
            grossAmountNature: null,
            grossInterestPaid: null,
            dateOfContract: null,
            cashValue: null,
            totalGrossAmountPaid: null,
          })
        );
      } else {
        this.utilsService.showSnackBar(
          'Please make sure you have filled all the details correctly to proceed ahead'
        );
      }
    }
  }

  saveAll(type?) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    // Define an array of form array names
    const formArrayNames = [
      'equityAndDebtInterest',
      'cashValueInsurance',
      'financialInterestDetails',
      'immovablePropertryDetails',
      'capitalAssetsDetails',
      'trustsDetails',
      'otherIncomeDetails',
      'depositoryAccounts',
      'signingAuthorityDetails',
      'custodialAccounts',
    ];

    formArrayNames.forEach((formArrayName) => {
      const formArray = this.scheduleFa.get(formArrayName) as FormArray;

      for (let i = formArray.length - 1; i >= 0; i--) {
        const control = formArray?.at(i) as UntypedFormGroup;
        const value = control?.get('countryCode');

        if (!value?.value) {
          formArray.removeAt(i);
        }
      }
    });

    if (this.scheduleFa.valid) {
      const foreignAssets = this.Copy_ITR_JSON.foreignIncome?.foreignAssets;
      // Iterate through the keys of the foreignAssets object
      for (let key in foreignAssets) {
        if (
          foreignAssets.hasOwnProperty(key) &&
          Array.isArray(foreignAssets[key])
        ) {
          foreignAssets[key] = []; // Set the array to an empty array
        }
      }

      const objToSave = [
        'equityAndDebtInterest',
        'cashValueInsurance',
        'financialInterestDetails',
        'immovablePropertryDetails',
        'capitalAssetsDetails',
        'trustsDetails',
        'otherIncomeDetails',
      ];

      objToSave.forEach((section) => {
        const formArray = this.scheduleFa.get(section) as FormArray;

        if (formArray.valid) {
          const formValueToSave = (
            this.scheduleFa.controls[section] as FormArray
          ).getRawValue();

          // have to implement later if required
          // console.log(formValueToSave);
          formValueToSave.forEach((element) => {
            element.countryName = this.getCountryNameFromCode(element.countryCode);
          });

          formValueToSave.forEach((element) => {
            this.Copy_ITR_JSON.foreignIncome?.foreignAssets[section].push(
              element
            );
          });
        }
      });

      const otherObjToSave = [
        'depositoryAccounts',
        'signingAuthorityDetails',
        'custodialAccounts',
      ];

      otherObjToSave.forEach((section) => {
        const accountsFormArray = (
          this.scheduleFa.controls[section] as FormArray
        ).getRawValue();
        console.log(accountsFormArray);

        // I can empty foreign assets before starting to push, this way only the new daat will be pushed from start
        if (!this.Copy_ITR_JSON.foreignIncome) {
          this.Copy_ITR_JSON.foreignIncome = {
            foreignAssets: null,
            id: null,
            taxAmountRefunded: 0,
            taxPaidOutsideIndiaFlag: null,
            taxReliefAssessmentYear: null,
            taxReliefClaimed: [],
          };
          this.Copy_ITR_JSON.foreignIncome.foreignAssets = {
            id: null,
            capitalAssetsDetails: [],
            cashValueInsurance: [],
            custodialAccounts: [],
            depositoryAccounts: [],
            equityAndDebtInterest: [],
            financialInterestDetails: [],
            immovablePropertryDetails: [],
            otherIncomeDetails: [],
            signingAuthorityDetails: [],
            trustsDetails: [],
          };
        }

        accountsFormArray.forEach((sectionForm) => {
          console.log(sectionForm);
          if (sectionForm.account && sectionForm.account.length > 0) {
            sectionForm.account.forEach((account) => {
              console.log(account);
              if (section === 'depositoryAccounts') {
                const formGroup = {
                  countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                  countryCode: sectionForm.countryCode,
                  nameOfInstitution: sectionForm.nameOfInstitution,
                  addressOfInstitution: sectionForm.addressOfInstitution,
                  zipCode: sectionForm.zipCode,
                  accountNumber: account.accountNumber,
                  status: account.status,
                  accountOpeningDate: account.accountOpeningDate,
                  peakBalance: account.peakBalance,
                  closingBalance: account.closingBalance,
                  grossInterestPaid: account.grossInterestPaid,
                  grossAmountNature: null,
                  dateOfContract: null,
                  cashValue: null,
                  totalGrossAmountPaid: null,
                };
                console.log(formGroup);
                this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                  formGroup
                );
              } else if (section === 'signingAuthorityDetails') {
                const formGroup = {
                  countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                  countryCode: sectionForm.countryCode,
                  institutionName: sectionForm.institutionName,
                  address: sectionForm.address,
                  zipCode: sectionForm.zipCode,
                  accountHolderName: account.accountHolderName,
                  accountNumber: account.accountNumber,
                  peakBalance: account.peakBalance,
                  accruedIncome: account.accruedIncome,
                  isTaxableinYourHand: account.isTaxableinYourHand,
                  amount: account.amount,
                  scheduleOfferd: account.scheduleOfferd,
                  numberOfSchedule: account.numberOfSchedule,
                  id: null,
                  status: account.status,
                };

                console.log(formGroup);
                // I can empty foreign assets before starting to push, this way only the new daat will be pushed from start
                this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                  formGroup
                );
              } else if (section === 'custodialAccounts') {
                const formGroup = {
                  countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                  countryCode: sectionForm.countryCode,
                  nameOfInstitution: sectionForm.nameOfInstitution,
                  addressOfInstitution: sectionForm.addressOfInstitution,
                  zipCode: sectionForm.zipCode,
                  accountNumber: account.accountNumber,
                  status: account.status,
                  accountOpeningDate: account.accountOpeningDate,
                  peakBalance: account.peakBalance,
                  closingBalance: account.closingBalance,
                  grossAmountNature: account.grossAmountNature,
                  grossInterestPaid: account.grossInterestPaid,
                  dateOfContract: null,
                  cashValue: null,
                  totalGrossAmountPaid: null,
                };

                this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                  formGroup
                );
              }
            });
          } else {
            if (section === 'depositoryAccounts') {
              const formGroup = {
                countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                countryCode: sectionForm.countryCode,
                nameOfInstitution: sectionForm.nameOfInstitution,
                addressOfInstitution: sectionForm.addressOfInstitution,
                zipCode: sectionForm.zipCode,
                accountNumber: null,
                status: null,
                accountOpeningDate: null,
                peakBalance: null,
                closingBalance: null,
                grossInterestPaid: null,
                grossAmountNature: null,
                dateOfContract: null,
                cashValue: null,
                totalGrossAmountPaid: null,
              };
              console.log(formGroup);
              this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                formGroup
              );
            } else if (section === 'signingAuthorityDetails') {
              const formGroup = {
                countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                countryCode: sectionForm.countryCode,
                institutionName: sectionForm.institutionName,
                address: sectionForm.address,
                zipCode: sectionForm.zipCode,
                accountHolderName: null,
                accountNumber: null,
                peakBalance: null,
                accruedIncome: null,
                isTaxableinYourHand: null,
                amount: null,
                scheduleOfferd: null,
                numberOfSchedule: null,
                id: null,
                status: null,
              };

              console.log(formGroup);
              // I can empty foreign assets before starting to push, this way only the new daat will be pushed from start
              this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                formGroup
              );
            } else if (section === 'custodialAccounts') {
              const formGroup = {
                countryName: this.getCountryNameFromCode(sectionForm.countryCode),
                countryCode: sectionForm.countryCode,
                nameOfInstitution: sectionForm.nameOfInstitution,
                addressOfInstitution: sectionForm.addressOfInstitution,
                zipCode: sectionForm.zipCode,
                accountNumber: null,
                status: null,
                accountOpeningDate: null,
                peakBalance: null,
                closingBalance: null,
                grossAmountNature: null,
                grossInterestPaid: null,
                dateOfContract: null,
                cashValue: null,
                totalGrossAmountPaid: null,
              };

              this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                formGroup
              );
            }
          }
        });
      });

      console.log(this.Copy_ITR_JSON.foreignIncome);

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          if (type === 'DELETE') {
            this.utilsService.showSnackBar('Deleted successfully');
          } else {
            this.utilsService.showSnackBar('Schedule FA saved successfully');
            this.saveAndNext.emit(false);
          }
          console.log(this.ITR_JSON, 'scheduleFaResult');
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          if (type === 'DELETE') {
            this.utilsService.showSnackBar(
              'Failed to delete details, please try again.'
            );
          } else {
            this.utilsService.showSnackBar(
              'Failed to add schedule FA, please try again.'
            );
            this.utilsService.smoothScrollToTop();
          }
        }
      );
    } else {
      if (type === 'DELETE') {
        this.utilsService.showSnackBar(
          'Failed to delete details, please try again.'
        );
      } else {
        this.utilsService.showSnackBar(
          'Failed to add schedule FA, please try again.'
        );
      }
    }
  }

  getCountryNameFromCode(code) {
    return this.countryCodeList.find(value => value.code == code)?.name;
  }
  // GET FUNCTIONS SECTION
  get getDepositoryAccounts() {
    return this.scheduleFa.get('depositoryAccounts') as FormArray;
  }

  // TO-DO =================pass index of edit, allow one edit only
  getAccountControls(i: number): FormArray {
    const depositoryAccounts = this.scheduleFa.get(
      'depositoryAccounts'
    ) as FormArray;

    if (depositoryAccounts.at(i) instanceof UntypedFormGroup) {
      return (depositoryAccounts.at(i) as UntypedFormGroup).get(
        'account'
      ) as FormArray;
    } else {
      return this.fb.array([]); // or return an empty FormArray if needed
    }
  }

  get getEquityAndDebtInterest() {
    return this.scheduleFa.get('equityAndDebtInterest') as FormArray;
  }

  get getCashValueInsurance() {
    return this.scheduleFa.get('cashValueInsurance') as FormArray;
  }

  get getFinancialInterestDetails() {
    return this.scheduleFa.get('financialInterestDetails') as FormArray;
  }

  get getImmovablePropertryDetails() {
    return this.scheduleFa.get('immovablePropertryDetails') as FormArray;
  }

  get getCapitalAssetsDetails() {
    return this.scheduleFa.get('capitalAssetsDetails') as FormArray;
  }

  get getTrustsDetails() {
    return this.scheduleFa.get('trustsDetails') as FormArray;
  }

  get getOtherIncomeDetails() {
    return this.scheduleFa.get('otherIncomeDetails') as FormArray;
  }

  get getSigningAuthorityDetails() {
    return this.scheduleFa.get('signingAuthorityDetails') as FormArray;
  }

  getSigningAuthAccountControls(i: number): FormArray {
    const signingAuthAccounts = this.scheduleFa.get(
      'signingAuthorityDetails'
    ) as FormArray;

    if (signingAuthAccounts.at(i) instanceof UntypedFormGroup) {
      return (signingAuthAccounts.at(i) as UntypedFormGroup).get(
        'account'
      ) as FormArray;
    } else {
      return this.fb.array([]); // or return an empty FormArray if needed
    }
  }

  get getCustodialAccounts() {
    return this.scheduleFa?.get('custodialAccounts') as FormArray;
  }

  getCustodialAccountControls(i: number): FormArray {
    const custodialAccounts = this.scheduleFa.get(
      'custodialAccounts'
    ) as FormArray;

    if (custodialAccounts.at(i) instanceof UntypedFormGroup) {
      return (custodialAccounts.at(i) as UntypedFormGroup).get('account') as FormArray;
    } else {
      return this.fb.array([]); // or return an empty FormArray if needed
    }
  }

  // OTHER SECTION
  onExpandedChange(event) {
    // console.log(event, 'expanded change');
    this.isPanelOpen = event;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  // Have to implement this, if yes then have to show questions else not
  handleSelectionChange(event) { }

  // Generate a unique identifier for each checkbox based on form array index and checkbox index
  getCheckboxId(formArrayIndex?: any, checkboxIndex?: any): any {
    return `${formArrayIndex}_${checkboxIndex}`;
  }

  // Generate a unique identifier for each checkbox based on form array index and checkbox index for accounts array
  getCheckboxIdAccount(formIndex?: any, formArrayIndex?: any, checkboxAccountIndex?: any): any {
    return `${formIndex}_${formArrayIndex}_${checkboxAccountIndex}`;
  }

  // Function to toggle selected index
  toggleSelectedIndex(formArrayIndex?: number, checkboxIndex?: number) {
    const checkboxId = this.getCheckboxId(formArrayIndex, checkboxIndex);
    const idx = this.selectedIndexes.indexOf(checkboxId);
    if (idx > -1) {
      this.selectedIndexes.splice(idx, 1);
    } else {
      this.selectedIndexes.push(checkboxId);
    }
  }

  // Function to toggle selected index
  toggleSelectedAccountIndex(formIndex, formArrayIndex, checkboxAccountIndex) {
    const checkboxIdAccount = this.getCheckboxIdAccount(formIndex, formArrayIndex, checkboxAccountIndex);
    const idx = this.selectedAccountIndexes.indexOf(checkboxIdAccount);
    if (idx > -1) {
      this.selectedAccountIndexes.splice(idx, 1);
    } else {
      this.selectedAccountIndexes.push(checkboxIdAccount);
    }
  }

  delete(formArrayName, type, formIndex, formArrayIndex?) {
    let formArrayOrAccountToDelete: any = '';
    if (type === 'account') {
      formArrayOrAccountToDelete = (
        this.scheduleFa.get(formArrayName) as FormArray
      ).controls[formIndex].get('account') as FormArray;
    } else {
      formArrayOrAccountToDelete = this.scheduleFa.get(
        formArrayName
      ) as FormArray;
    }

    const formAcctArrayToDltCntrls = formArrayOrAccountToDelete.controls;
    for (let i = formAcctArrayToDltCntrls.length - 1; i >= 0; i--) {
      let index;
      const checkboxId = this.getCheckboxId(formIndex, i);
      if (formArrayName === 'depositoryAccounts') {
        index = 0;
      } else if (formArrayName === 'custodialAccounts'
      ) {
        index = 1;
      } else if (formArrayName === 'signingAuthorityDetails') {
        index = 7;
      }
      const checkboxIdAccount = this.getCheckboxIdAccount(index, formArrayIndex, i);

      if (
        (type === 'account'
          ? this.selectedAccountIndexes
          : this.selectedIndexes
        ).includes(type === 'account' ? checkboxIdAccount : checkboxId)
      ) {
        if (type === 'account') {
          if (formAcctArrayToDltCntrls.length > 0) {
            formArrayOrAccountToDelete.removeAt(i);
            this.utilsService.showSnackBar(
              `Details deleted Successfully ${formArrayName}`
            );
          } else {
            this.utilsService.showSnackBar(
              `Atleast one account detail is required for ${formArrayName}`
            );
          }
        } else {
          formArrayOrAccountToDelete.removeAt(i);
          this.utilsService.showSnackBar(
            `Details deleted Successfully ${formArrayName}`
          );
        }
      }
    }
    this.scheduleFa.updateValueAndValidity();
    console.log(this.scheduleFa);
  }

  filter(event): void {
    if (event.target.value) {
      const filterValue = event.target.value.toLowerCase();
      this.countryNameCodeList = this.countryCodeList.filter(
        item => item.name.toLowerCase().includes(filterValue) || item.code.toString().includes(filterValue));
    } else {
      this.countryNameCodeList = this.countryCodeList;
    }
  }

  displayFn = (country: any): string => {
    if (country) {
      let b = this.countryCodeList?.filter(o => o.code.toString() === country.toString())[0];
      return b ? `${b?.code}:${b?.name}` : '';
    } else {
      return '';
    }
  }
}
