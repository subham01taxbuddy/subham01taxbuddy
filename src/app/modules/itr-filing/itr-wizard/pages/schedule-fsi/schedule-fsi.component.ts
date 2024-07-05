import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-schedule-fsi',
  templateUrl: './schedule-fsi.component.html',
  styleUrls: ['./schedule-fsi.component.scss'],
})
export class ScheduleFsiComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  scheduleFsiForm: UntypedFormGroup;
  countryCodeList: any;
  headOfIncomess = [
    'SALARY',
    'HOUSE',
    'CAPITAL_GAIN',
    'BUSINESS_OR_PROFESSION',
    'OTHER',
  ];
  offeredForTaxIndValue: number;
  countryNameCodeList: any;

  constructor(private fb: UntypedFormBuilder, private utilsService: UtilsService) { }

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

    this.scheduleFsiForm = this.initForm();

    if (this.ITR_JSON.foreignIncome?.taxReliefClaimed.length > 0) {
      this.ITR_JSON.foreignIncome?.taxReliefClaimed.forEach((trElement) => {
        const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
          id: 0,
          incomeType: element.incomeType,
          outsideIncome: element.outsideIncome,
          outsideTaxPaid: element.outsideTaxPaid,
          taxPayable: element.taxPayable,
          taxRelief:
            element.outsideTaxPaid <= element.taxPayable
              ? element.outsideTaxPaid
              : element.taxPayable,
          claimedDTAA: element.claimedDTAA,
        }));

        const formGroup = {
          hasEdit: false,
          countryCode: trElement.countryCode + ':' + trElement.countryName,
          tinNumber: trElement.taxPayerID,
          headOfIncomes: headOfIncomeArray,
          reliefClaimedUsSection: trElement.reliefClaimedUsSection,
        };

        this.add(formGroup);
      });
    } else {
      this.add();
    }
  }

  initForm() {
    return this.fb.group({
      fsiArray: this.fb.array([]),
    });
  }

  get getFsiArray() {
    return <FormArray>this.scheduleFsiForm.get('fsiArray');
  }

  add(item?) {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    if (this.scheduleFsiForm.valid) {
      fsiArray.push(this.createFsiForm(item));
    }
  }

  createFsiForm(item?): UntypedFormGroup {
    const formGroup = this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      headOfIncomes: this.fb.array([]),
    });

    if (item && item.headOfIncomes) {
      item.headOfIncomes.forEach((element) => {
        (formGroup.get('headOfIncomes') as FormArray).push(
          this.createHeadOfIncomes(element, item)
        );
      });
    } else {
      this.headOfIncomess.forEach((element) => {
        (formGroup.get('headOfIncomes') as FormArray).push(
          this.createHeadOfIncome(element, item)
        );
      });
    }

    return formGroup;
  }

  createHeadOfIncomes(headOfIncome?, item?): UntypedFormGroup {
    return this.fb.group({
      headOfIncome: [headOfIncome.incomeType ? headOfIncome.incomeType : null],
      incFromOutInd: [
        headOfIncome.outsideIncome ? headOfIncome.outsideIncome : null,
      ],
      taxPaidOutInd: [
        headOfIncome.outsideTaxPaid ? headOfIncome.outsideTaxPaid : null,
      ],
      taxPayableNrmlProv: [
        headOfIncome.taxPayable ? headOfIncome.taxPayable : null,
      ],
      offeredForTaxInd: [headOfIncome.taxRelief ? headOfIncome.taxRelief : ''],
      relevantArticle: [headOfIncome ? headOfIncome.claimedDTAA : null],
    });
  }

  createHeadOfIncome(headOfIncome?, item?): UntypedFormGroup {
    return this.fb.group({
      headOfIncome: [headOfIncome ? headOfIncome : null],
      incFromOutInd: [item ? item.incFromOutInd : null],
      taxPaidOutInd: [item ? item.taxPaidOutInd : null],
      taxPayableNrmlProv: [item ? item.taxPayableNrmlProv : null],
      offeredForTaxInd: [item ? item.offeredForTaxInd : ''],
      relevantArticle: [item ? item.relevantArticle : null],
    });
  }

  get headOfIncomesArray() {
    return (this.getFsiArray.controls[0] as UntypedFormGroup).controls[
      'headOfIncomes'
    ] as FormArray;
  }

  getLowerOfCds() {
    const fsiArray = this?.getFsiArray;

    fsiArray?.controls.forEach((fsiArrayEl) => {
      const headOfIncomes = fsiArrayEl?.get('headOfIncomes') as FormArray;

      // extracting the lower value for each headOfIncome under fsiArray
      headOfIncomes?.controls?.forEach((head) => {
        const taxPaidOutInd = parseFloat(head?.value?.taxPaidOutInd);
        const taxPayableNrmlProv = parseFloat(head?.value?.taxPayableNrmlProv);

        const lower =
          taxPaidOutInd < taxPayableNrmlProv
            ? taxPaidOutInd
            : taxPayableNrmlProv;

        // setting the lower value
        if (lower) {
          head?.get('offeredForTaxInd')?.setValue(lower);
        } else {
          head?.get('offeredForTaxInd')?.setValue(0);
        }
      });
    });
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    const fsiArray = <FormArray>this.scheduleFsiForm?.get('fsiArray');
    console.log(fsiArray);

    if (this.scheduleFsiForm.valid) {
      this.loading = true;

      if (!this.Copy_ITR_JSON.foreignIncome) {
        this.Copy_ITR_JSON.foreignIncome = {
          id: 1,
          taxPaidOutsideIndiaFlag: null,
          taxReliefAssessmentYear: null,
          taxAmountRefunded: null,
          taxReliefClaimed: [],
          foreignAssets: {
            id: null,
            depositoryAccounts: [],
            custodialAccounts: [],
            equityAndDebtInterest: [],
            cashValueInsurance: [],
            financialInterestDetails: [],
            immovablePropertryDetails: [],
            capitalAssetsDetails: [],
            signingAuthorityDetails: [],
            trustsDetails: [],
            otherIncomeDetails: [],
          },
        };
      }

      if (this.Copy_ITR_JSON.foreignIncome?.taxReliefClaimed) {
        this.Copy_ITR_JSON.foreignIncome.taxReliefClaimed = [];
      }

      if (fsiArray.length > 0) {
        fsiArray?.controls?.forEach((fsiArrayElement, index) => {
          const headOfIncomesArray = (
            fsiArrayElement?.get('headOfIncomes') as FormArray
          ).controls;

          // setting the taxPaidOutsideIndiaFlag if it exists
          const hastaxPaidOutIndValue = headOfIncomesArray?.some(
            (hastaxPaidOutIndValueElement) =>
              hastaxPaidOutIndValueElement?.get('taxPaidOutInd')?.value
          );

          // if (hastaxPaidOutIndValue) {
          //   this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'YES';
          // } else{
          //   this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'NO';
          // }

          // pushing fsi income in taxReliefClaimed
          const checkIfValid: boolean =
            fsiArrayElement.get('countryCode')?.value &&
            fsiArrayElement.get('tinNumber')?.value &&
            fsiArrayElement.get('headOfIncomes')?.value.length > 0;

          if (checkIfValid) {
            if (!this.Copy_ITR_JSON.foreignIncome?.taxReliefClaimed) {
              this.Copy_ITR_JSON.foreignIncome.taxReliefClaimed = [];
            }

            const headOfIncomeArray = headOfIncomesArray?.map((element) => ({
              id: 0,
              incomeType: element?.get('headOfIncome')?.value,
              outsideIncome: element?.get('incFromOutInd')?.value,
              outsideTaxPaid: element?.get('taxPaidOutInd')?.value,
              taxPayable: element?.get('taxPayableNrmlProv')?.value,
              taxRelief:
                element?.get('taxPaidOutInd')?.value <=
                  element?.get('taxPayableNrmlProv')?.value
                  ? element?.get('taxPaidOutInd')?.value
                  : element?.get('taxPayableNrmlProv')?.value,
              claimedDTAA: element?.get('relevantArticle')?.value,
            }));
            console.log(headOfIncomeArray, 'Final headOfIncomeArray');

            // TO-DO need to fix for edit (similar to business)
            const split = fsiArrayElement
              ?.get('countryCode')
              ?.value?.split(':');
            this.Copy_ITR_JSON.foreignIncome?.taxReliefClaimed?.push({
              id: null,
              reliefClaimedUsSection: null,
              countryCode: split[0],
              countryName: split[1],
              taxPayerID: fsiArrayElement?.get('tinNumber')?.value,
              claimedDTAA: headOfIncomeArray[index]?.claimedDTAA,
              headOfIncome: headOfIncomeArray,
            });

            this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
              (result: any) => {
                this.ITR_JSON = result;
                sessionStorage.setItem(
                  'ITR_JSON',
                  JSON.stringify(this.ITR_JSON)
                );
                this.loading = false;
                this.utilsService.showSnackBar(
                  'Schedule FSI updated successfully'
                );
                this.saveAndNext.emit(false);
              },
              (error) => {
                this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
                this.loading = false;
                this.utilsService.showSnackBar(
                  'Failed to add schedule FSI, please try again.'
                );
                this.utilsService.smoothScrollToTop();
              }
            );
          } else {
            this.utilsService.showSnackBar(
              'Please make sure tin Number or head of incomes details or country code is entered correctly'
            );
          }
        });
      } else {
        this.Copy_ITR_JSON.foreignIncome.taxReliefClaimed = [];
        this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
          (result: any) => {
            this.ITR_JSON = result;
            sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
            this.loading = false;
            this.utilsService.showSnackBar('Schedule FSI updated successfully');
            this.saveAndNext.emit(false);
          },
          (error) => {
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
            this.loading = false;
            this.utilsService.showSnackBar(
              'Failed to add schedule FSI, please try again.'
            );
            this.utilsService.smoothScrollToTop();
          }
        );
      }
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please make sure that you have updated all the details correctly'
      );
    }
  }

  deleteFsiArray() {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    fsiArray.controls.forEach((element, index) => {
      if ((element as UntypedFormGroup).controls['hasEdit'].value) {
        fsiArray.removeAt(index);
      }
    });
  }


  filter(event): void {
    if (event.target.value) {
      const filterValue = event.target.value.toLowerCase();
      this.countryNameCodeList = this.countryCodeList.filter(
        item => item.toLowerCase().includes(filterValue));
    } else {
      this.countryNameCodeList = this.countryCodeList;
    }
  }


}
