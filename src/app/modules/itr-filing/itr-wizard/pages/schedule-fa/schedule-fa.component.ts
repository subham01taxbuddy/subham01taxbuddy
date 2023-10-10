import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Form } from '@angular/forms';
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
        'A1. Details of Foreign Depository Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2022',
      code: 'A1',
    },
    {
      label:
        'A2. Details of Foreign Custodial Accounts held (including any beneficial interest) at any time during the calendar year ending as on 31st December, 2022',
      code: 'A2',
    },
    {
      label:
        'A3. Details of Foreign Equity and Debt Interest held (including any beneficial interest) in any entity at any time during the calendar year ending as on 31st December, 2022',
      code: 'A3',
    },
    {
      label:
        'A4. Details of Foreign Cash Value insurance Contract or Annuity Contract held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'A4',
    },
    {
      label:
        'B. Details of Financial Interest in any Entity held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'B',
    },
    {
      label:
        'C. Details of Immovable Property held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'C',
    },
    {
      label:
        'D. Details of any other Capital Asset held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022',
      code: 'D',
    },
    {
      label:
        'E. Details of account(s) in which you have signing authority held (including any beneficial interest)at any time during the calendar year ending as on 31st December, 2022 and which has not been included in A to D above',
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
  natureOfInterestOwnership = ['Direct', 'Beneficial Owner', 'Beneficiary'];
  status = ['Select', 'Owner', 'Beneficial Owner', 'Beneficiary'];
  countryCodeList: any;
  scheduleFa: FormGroup;
  isPanelOpen: boolean = false;

  constructor(private fb: FormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.countryCodeList = [
      '93:AFGHANISTAN',
      '1001:ÅLAND ISLANDS',
      '355:ALBANIA',
      '213:ALGERIA',
      '684:AMERICAN SAMOA',
      '376:ANDORRA',
      '244:ANGOLA',
      '1264:ANGUILLA',
      '1010:ANTARCTICA',
      '1268:ANTIGUA AND BARBUDA',
      '54:ARGENTINA',
      '374:ARMENIA',
      '297:ARUBA',
      '61:AUSTRALIA',
      '43:AUSTRIA',
      '994:AZERBAIJAN',
      '1242:BAHAMAS',
      '973:BAHRAIN',
      '880:BANGLADESH',
      '1246:BARBADOS',
      '375:BELARUS',
      '32:BELGIUM',
      '501:BELIZE',
      '229:BENIN',
      '1441:BERMUDA',
      '975:BHUTAN',
      '591:BOLIVIA (PLURINATIONAL STATE OF)',
      '1002:BONAIRE, SINT EUSTATIUS AND SABA',
      '387:BOSNIA AND HERZEGOVINA',
      '267:BOTSWANA',
      '1003:BOUVET ISLAND',
      '55:BRAZIL',
      '1014:BRITISH INDIAN OCEAN TERRITORY',
      '673:BRUNEI DARUSSALAM',
      '359:BULGARIA',
      '226:BURKINA FASO',
      '257:BURUNDI',
      '238:CABO VERDE',
      '855:CAMBODIA',
      '237:CAMEROON',
      '1:CANADA',
      '1345:CAYMAN ISLANDS',
      '236:CENTRAL AFRICAN REPUBLIC',
      '235:CHAD',
      '56:CHILE',
      '86:CHINA',
      '9:CHRISTMAS ISLAND',
      '672:COCOS (KEELING) ISLANDS',
      '57:COLOMBIA',
      '270:COMOROS',
      '242:CONGO',
      '243:CONGO (DEMOCRATIC REPUBLIC OF THE)',
      '682:COOK ISLANDS',
      '506:COSTA RICA',
      "225:CÔTE D'IVOIRE",
      '385:CROATIA',
      '53:CUBA',
      '1015:CURAÇAO',
      '357:CYPRUS',
      '420:CZECHIA',
      '45:DENMARK',
      '253:DJIBOUTI',
      '1767:DOMINICA',
      '1809:DOMINICAN REPUBLIC',
      '593:ECUADOR',
      '20:EGYPT',
      '503:EL SALVADOR',
      '240:EQUATORIAL GUINEA',
      '291:ERITREA',
      '372:ESTONIA',
      '251:ETHIOPIA',
      '500:FALKLAND ISLANDS (MALVINAS)',
      '298:FAROE ISLANDS',
      '679:FIJI',
      '358:FINLAND',
      '33:FRANCE',
      '594:FRENCH GUIANA',
      '689:FRENCH POLYNESIA',
      '1004:FRENCH SOUTHERN TERRITORIES',
      '241:GABON',
      '220:GAMBIA',
      '995:GEORGIA',
      '49:GERMANY',
      '233:GHANA',
      '350:GIBRALTAR',
      '30:GREECE',
      '299:GREENLAND',
      '1473:GRENADA',
      '590:GUADELOUPE',
      '1671:GUAM',
      '502:GUATEMALA',
      '1481:GUERNSEY',
      '224:GUINEA',
      '245:GUINEA-BISSAU',
      '592:GUYANA',
      '509:HAITI',
      '1005:HEARD ISLAND AND MCDONALD ISLANDS',
      '6:HOLY SEE',
      '504:HONDURAS',
      '852:HONG KONG',
      '36:HUNGARY',
      '354:ICELAND',
      '62:INDONESIA',
      '98:IRAN (ISLAMIC REPUBLIC OF)',
      '964:IRAQ',
      '353:IRELAND',
      '1624:ISLE OF MAN',
      '972:ISRAEL',
      '5:ITALY',
      '1876:JAMAICA',
      '81:JAPAN',
      '1534:JERSEY',
      '962:JORDAN',
      '7:KAZAKHSTAN',
      '254:KENYA',
      '686:KIRIBATI',
      "850:KOREA(DEMOCRATIC PEOPLE'S REPUBLIC OF)",
      '82:KOREA (REPUBLIC OF)',
      '965:KUWAIT',
      '996:KYRGYZSTAN',
      "856:LAO PEOPLE'S DEMOCRATIC REPUBLIC",
      '371:LATVIA',
      '961:LEBANON',
      '266:LESOTHO',
      '231:LIBERIA',
      '218:LIBYA',
      '423:LIECHTENSTEIN',
      '370:LITHUANIA',
      '352:LUXEMBOURG',
      '853:MACAO',
      '389:MACEDONIA(THE FORMER YUGOSLAV REPUBLIC OF)',
      '261:MADAGASCAR',
      '256:MALAWI',
      '60:MALAYSIA',
      '960:MALDIVES',
      '223:MALI',
      '356:MALTA',
      '692:MARSHALL ISLANDS',
      '596:MARTINIQUE',
      '222:MAURITANIA',
      '230:MAURITIUS',
      '269:MAYOTTE',
      '52:MEXICO',
      '691:MICRONESIA (FEDERATED STATES OF)',
      '373:MOLDOVA (REPUBLIC OF)',
      '377:MONACO',
      '976:MONGOLIA',
      '382:MONTENEGRO',
      '1664:MONTSERRAT',
      '212:MOROCCO',
      '258:MOZAMBIQUE',
      '95:MYANMAR',
      '264:NAMIBIA',
      '674:NAURU',
      '977:NEPAL',
      '31:NETHERLANDS',
      '687:NEW CALEDONIA',
      '64:NEW ZEALAND',
      '505:NICARAGUA',
      '227:NIGER',
      '234:NIGERIA',
      '683:NIUE',
      '15:NORFOLK ISLAND',
      '1670:NORTHERN MARIANA ISLANDS',
      '47:NORWAY',
      '968:OMAN',
      '92:PAKISTAN',
      '680:PALAU',
      '970:PALESTINE, STATE OF',
      '507:PANAMA',
      '675:PAPUA NEW GUINEA',
      '595:PARAGUAY',
      '51:PERU',
      '63:PHILIPPINES',
      '1011:PITCAIRN',
      '48:POLAND',
      '14:PORTUGAL',
      '1787:PUERTO RICO',
      '974:QATAR',
      '262:RÉUNION',
      '40:ROMANIA',
      '8:RUSSIAN FEDERATION',
      '250:RWANDA',
      '1006:SAINT BARTHÉLEMY',
      '290: SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA',
      '1869:SAINT KITTS AND NEVIS',
      '1758:SAINT LUCIA',
      '1007:SAINT MARTIN (FRENCH PART)',
      '508:SAINT PIERRE AND MIQUELON',
      '1784:SAINT VINCENT AND THE GRENADINES',
      '685:SAMOA',
      '378:SAN MARINO',
      '239:SAO TOME AND PRINCIPE',
      '966:SAUDI ARABIA',
      '221:SENEGAL',
      '381:SERBIA',
      '248:SEYCHELLES',
      '232:SIERRA LEONE',
      '65:SINGAPORE',
      '1721:SINT MAARTEN (DUTCH PART)',
      '421:SLOVAKIA',
      '386:SLOVENIA',
      '677:SOLOMON ISLANDS',
      '252:SOMALIA',
      '28:SOUTH AFRICA',
      '1008:SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
      '211:SOUTH SUDAN',
      '35:SPAIN',
      '94:SRI LANKA',
      '249:SUDAN',
      '597:SURINAME',
      '1012:SVALBARD AND JAN MAYEN',
      '268:SWAZILAND',
      '46:SWEDEN',
      '41:SWITZERLAND',
      '963:SYRIAN ARAB REPUBLIC',
      '886:TAIWAN, PROVINCE OF CHINA[A]',
      '992:TAJIKISTAN',
      '255:TANZANIA, UNITED REPUBLIC OF',
      '66:THAILAND',
      '670:TIMOR-LESTE (EAST TIMOR)',
      '228:TOGO',
      '690:TOKELAU',
      '676:TONGA',
      '1868:TRINIDAD AND TOBAGO',
      '216:TUNISIA',
      '90:TURKEY',
      '993:TURKMENISTAN',
      '1649:TURKS AND CAICOS ISLANDS',
      '688:TUVALU',
      '256:UGANDA',
      '380:UKRAINE',
      '971:UNITED ARAB EMIRATES',
      '44:UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND',
      '2:UNITED STATES OF AMERICA',
      '1009:UNITED STATES MINOR OUTLYING ISLANDS',
      '598:URUGUAY',
      '998:UZBEKISTAN',
      '678:VANUATU',
      '58:VENEZUELA (BOLIVARIAN REPUBLIC OF)',
      '84:VIET NAM',
      '1284:VIRGIN ISLANDS (BRITISH)',
      '1340:VIRGIN ISLANDS (U.S.)',
      '681:WALLIS AND FUTUNA',
      '1013:WESTERN SAHARA',
      '967:YEMEN',
      '260:ZAMBIA',
      '263:ZIMBABWE',
      '9999:OTHERS',
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

      const check: boolean =
        (!asset || asset.length === 0) && !this.scheduleFa.get(assetType);

      // console.log(check);
      //  TODO =========> Only add a control if asset is empty
      // if ((!asset || asset.length === 0) && !this.scheduleFa.get(assetType)) {
      //   this.scheduleFa.addControl(assetType, this.initForms(assetType));
      // }

      if (check) {
        this.scheduleFa.addControl(assetType, this.initForms(assetType));
      }

      // remove this once create forms starts working for everything
      this.scheduleFa.addControl(assetType, this.initForms(assetType));

      if (asset?.length > 0) {
        this.createForms(assetType, asset);
      }
    });
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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
            zipCode: null,
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

  createForms(assetType: string, asset: any[]) {
    const formArray = this.scheduleFa.controls[assetType] as FormArray;
    // console.log(asset, assetType);
    asset.forEach((item, index) => {
      if (assetType === 'depositoryAccounts') {
        // console.log(asset);
        // const key: boolean =
        //   asset[index].countryCode === item.countryCode &&
        //   asset[index].nameOfInstitution === item.nameOfInstitution;
        // if (!key) {
        //   const formGroup = this.fb.group({
        //     countryName: item.countryCode,
        //     countryCode: item.countryCode,
        //     nameOfInstitution: item.nameOfInstitution,
        //     addressOfInstitution: item.addressOfInstitution,
        //     zipCode: item.zipCode,
        //     account: item.account.forEach((account) => {
        //       account.push({
        //         hasEdit: false,
        //         accountNumber: account.accountNumber,
        //         status: account.status,
        //         accountOpeningDate: account.accountOpeningDate,
        //         peakBalance: account.peakBalance,
        //         closingBalance: account.closingBalance,
        //         grossInterestPaid: account.grossInterestPaid,
        //       });
        //     }),
        //   });
        //   formArray.push(formGroup);
        // } else {
        //   formArray[index].account.forEach((account) => {
        //     account.push({
        //       hasEdit: false,
        //       accountNumber: account.accountNumber,
        //       status: account.status,
        //       accountOpeningDate: account.accountOpeningDate,
        //       peakBalance: account.peakBalance,
        //       closingBalance: account.closingBalance,
        //       grossInterestPaid: account.grossInterestPaid,
        //     });
        //   });
        // }
      } else if (assetType === 'equityAndDebtInterest') {
        const formGroup = this.fb.group({
          countryName: item.countryName ? item.countryName : item.countryCode,
          countryCode: item.countryCode,
          nameOfEntity: item.nameOfEntity,
          addressOfEntity: item.addressOfEntity,
          zipCode: item.zipCode,
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
          countryName: item.countryName,
          nameOfInstitution: item.nameOfInstitution,
          addressOfInstitution: item.addressOfInstitution,
          zipCode: item.zipCode,
          dateOfContract: item.dateOfContract,
          cashValue: item.cashValue,
          totalGrossAmountPaid: item.totalGrossAmountPaid,
        });
        formArray.push(formGroup);
      } else if (assetType === 'financialInterestDetails') {
        const formGroup = this.fb.group({
          id: item.id,
          countryCode: item.countryCode,
          countryName: item.countryName,
          natureOfEntity: item.natureOfEntity,
          nameOfEntity: item.nameOfEntity,
          address: item.address,
          zipCode: item.zipCode,
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
          countryName: item.countryName,
          countryCode: item.countryCode,
          address: item.address,
          zipCode: item.zipCode,
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
          countryName: item.countryName,
          countryCode: item.countryCode,
          zipCode: item.zipCode,
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
          countryName: item.countryName,
          countryCode: item.countryCode,
          zipCode: item.zipCode,
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
          countryName: item.countryName,
          countryCode: item.countryCode,
          zipCode: item.zipCode,
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
      } else if (assetType === 'signingAuthorityDetails') {
        // const formGroup = this.fb.group({
        //   countryName: item.countryName,
        //   countryCode: item.countryCode,
        //   institutionName: item.institutionName,
        //   address: item.address,
        //   zipCode: item.zipCode,
        //   account: this.fb.array([
        //     this.fb.group({
        //       accountHolderName: item.accountHolderName,
        //       accountNumber: item.accountNumber,
        //       peakBalance: item.peakBalance,
        //       isTaxableinYourHand: item.isTaxableinYourHand,
        //       accruedIncome: item.accruedIncome,
        //       amount: item.amount,
        //       scheduleOfferd: item.scheduleOfferd,
        //       numberOfSchedule: item.numberOfSchedule,
        //     }),
        //   ]),
        // });
        // formArray.push(formGroup);
      } else if (assetType === 'custodialAccounts') {
        // const formGroup = this.fb.group({
        //   countryName: item.countryName,
        //   countryCode: item.countryCode,
        //   nameOfInstitution: item.nameOfInstitution,
        //   addressOfInstitution: item.addressOfInstitution,
        //   zipCode: item.zipCode,
        //   account: this.fb.array([
        //     this.fb.group({
        //       accountNumber: item.accountNumber,
        //       status: item.status,
        //       accountOpeningDate: item.accountOpeningDate,
        //       peakBalance: item.peakBalance,
        //       closingBalance: item.closingBalance,
        //       grossAmountNature: item.grossAmountNature,
        //       grossInterestPaid: item.grossInterestPaid,
        //       dateOfContract: null,
        //       cashValue: null,
        //       totalGrossAmountPaid: null,
        //     }),
        //   ]),
        // });
        // formArray.push(formGroup);
      }
    });
  }

  // adding whole section
  addMore(section) {
    const newFormGroup = this.initForms(section);

    if (newFormGroup) {
      const formArray = this.scheduleFa.get(section) as FormArray;
      if (formArray.valid) {
        formArray.push(newFormGroup);
      } else {
        this.utilsService.showSnackBar(
          'Please make sure that all the existing details are entered correctly'
        );
      }
    }
  }

  // adding nested form array
  add(section) {
    const accountControls = (this.scheduleFa.get(section) as FormArray)
      .at(0)
      .get('account') as FormArray;

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

  saveAll() {
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
        const control = formArray.at(i) as FormGroup;
        const value = control.get('countryCode');

        if (!value.value) {
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
          // formValueToSave.forEach((element) => {
          //   (element.countryCode = element.countryCode.split(':')[0]),
          //     (element.countryName = element.countryCode.split(':')[0]);
          // });

          formValueToSave.forEach((element) => {
            this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
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

        accountsFormArray.forEach((sectionForm) => {
          console.log(sectionForm);
          sectionForm.account.forEach((account) => {
            console.log(account);
            if (section === 'depositoryAccounts') {
              const formGroup = {
                countryName: sectionForm.countryName,
                countryCode: sectionForm.countryCode,
                nameOfInstitution: sectionForm.countryName,
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
                  capitalAssetsDetails: [],
                  cashValueInsurance: [],
                  custodialAccounts: [],
                  depositoryAccounts: [],
                  equityAndDebtInterest: [],
                  financialInterestDetails: [],
                  id: null,
                  immovablePropertryDetails: [],
                  otherIncomeDetails: [],
                  signingAuthorityDetails: [],
                  trustsDetails: [],
                };
              }
              this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                formGroup
              );
            } else if (section === 'signingAuthorityDetails') {
              const formGroup = {
                countryName: sectionForm.countryName,
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
              };

              console.log(formGroup);
              // I can empty foreign assets before starting to push, this way only the new daat will be pushed from start
              this.Copy_ITR_JSON.foreignIncome.foreignAssets[section].push(
                formGroup
              );
            } else if (section === 'custodialAccounts') {
              const formGroup = {
                countryName: sectionForm.countryName,
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
        });
      });

      console.log(this.Copy_ITR_JSON.foreignIncome);

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar('Schedule FA saved successfully');
          this.saveAndNext.emit(false);
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to add schedule FA, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.utilsService.showSnackBar(
        'Failed to add schedule FA, please try again.'
      );
    }
  }

  // GET FUNCTIONS SECTION
  get getDepositoryAccounts() {
    return this.scheduleFa.get('depositoryAccounts') as FormArray;
  }

  // TO-DO =================pass index of edit, allow one edit only
  get getAccountControls() {
    return (this.scheduleFa.get('depositoryAccounts') as FormArray)
      .at(0)
      .get('account') as FormArray;
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

  // TO-DO =================pass index of edit, allow one edit only
  get getSigningAuthAccountControls() {
    return (this.scheduleFa.get('signingAuthorityDetails') as FormArray)
      .at(0)
      .get('account') as FormArray;
  }

  get getCustodialAccounts() {
    return this.scheduleFa?.get('custodialAccounts') as FormArray;
  }

  // TO-DO =================pass index of edit, allow one edit only
  get getCustodialAccountControls() {
    return (this.scheduleFa.get('custodialAccounts') as FormArray)
      .at(0)
      .get('account') as FormArray;
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
  handleSelectionChange(event) {}
}

// TO-DO
// 1. PROVIDE CHECKBOS AND DELETE OPTION FOR EACH NON NESTED - AJAY HAS TO ADD hasEdit key
// 2. clear form check while auto-populating on init. maybe i can clear itrObj array and then push new ones so this will automatically work
