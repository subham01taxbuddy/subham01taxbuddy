import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-tr',
  templateUrl: './schedule-tr.component.html',
  styleUrls: ['./schedule-tr.component.scss'],
})
export class ScheduleTrComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  scheduleTrForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  totalOutsideTaxPaid = 0;
  totalTaxRelief = 0;
  sectionValue = '';
  loading = false;
  countryCodeList: any;
  section: any;

  constructor(private fb: UntypedFormBuilder, private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

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

    this.section = ['90', '90A', '91'];

    this.scheduleTrForm = this.initForm();

    if (this.ITR_JSON.foreignIncome?.taxReliefClaimed?.length > 0) {
      this.ITR_JSON.foreignIncome?.taxReliefClaimed.forEach(
        (trElement, trIndex) => {
          const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
            id: 0,
            incomeType: element.incomeType,
            outsideIncome: element.outsideIncome,
            outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0),
            taxPayable: parseFloat(element.taxPayable || 0),
            taxRelief: parseFloat(element.taxRelief || 0),
            claimedDTAA: trElement.claimedDTAA,
          }));

          let outsideTaxPaid = 0;
          let taxRelief = 0;

          const formGroup = {
            hasEdit: false,
            countryCode: trElement.countryCode + ':' + trElement.countryName,
            tinNumber: trElement.taxPayerID,
            totalTxsPaidOutInd: 0,
            totalTxsRlfAvlbl: 0,
            section: trElement.reliefClaimedUsSection
              ? trElement.reliefClaimedUsSection
              : '',
          };

          this.sectionValue = trElement.reliefClaimedUsSection
            ? trElement.reliefClaimedUsSection
            : '';

          console.log(formGroup, 'formGroup');
          this.add(formGroup);

          headOfIncomeArray.forEach((element, i) => {
            outsideTaxPaid += element.outsideTaxPaid;
            this.getTrArray.controls[trIndex]
              .get('totalTxsPaidOutInd')
              .setValue(outsideTaxPaid);

            taxRelief += element.taxRelief;
            this.getTrArray.controls[trIndex]
              .get('totalTxsRlfAvlbl')
              .setValue(taxRelief);
          });

          if (
            this.ITR_JSON.foreignIncome?.taxAmountRefunded ||
            this.ITR_JSON.foreignIncome?.taxReliefAssessmentYear
          ) {
            this.getTrArray.controls[trIndex]
              .get('selectedOption')
              .setValue('yes');

            this.getTrArray.controls[trIndex]
              .get('assYr')
              .setValue(this.ITR_JSON.foreignIncome?.taxReliefAssessmentYear);

            this.getTrArray.controls[trIndex]
              .get('amtOfTaxRef')
              .setValue(this.ITR_JSON.foreignIncome?.taxAmountRefunded);
          } else {
            this.getTrArray.controls[trIndex]
              .get('selectedOption')
              .setValue('no');
          }

          // Update individual totals
          this.getTrArray.controls[trIndex]
            .get('totalTxsPaidOutInd')
            .setValue(outsideTaxPaid);
          this.getTrArray.controls[trIndex]
            .get('totalTxsRlfAvlbl')
            .setValue(taxRelief);
        }
      );

      // Calculate cumulative totals
      this.totalOutsideTaxPaid =
        this.ITR_JSON.foreignIncome?.taxReliefClaimed.reduce(
          (acc, trElement) => {
            const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
              outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0),
              taxRelief: parseFloat(element.taxRelief || 0),
            }));

            const totalOutsideTaxPaid = headOfIncomeArray.reduce(
              (sum, element) => sum + element.outsideTaxPaid,
              0
            );

            return acc + totalOutsideTaxPaid;
          },
          0
        );

      this.totalTaxRelief =
        this.ITR_JSON.foreignIncome?.taxReliefClaimed.reduce(
          (acc, trElement) => {
            const headOfIncomeArray = trElement.headOfIncome.map((element) => ({
              outsideTaxPaid: parseFloat(element.outsideTaxPaid || 0),
              taxRelief: parseFloat(element.taxRelief || 0),
            }));

            const totalTaxRelief = headOfIncomeArray.reduce(
              (sum, element) => sum + element.taxRelief,
              0
            );

            return acc + totalTaxRelief;
          },
          0
        );
    } else {
      this.add();
    }

    const trArray = this.getTrArray;
    const trFlag = trArray.controls[0].get('selectedOption');
    if (this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag === 'YES') {
      trFlag.setValue('yes');
    } else{
      trFlag.setValue('no');
    }
  }

  initForm() {
    return this.fb.group({
      trArray: this.fb.array([]),
    });
  }

  get getTrArray() {
    return <FormArray>this.scheduleTrForm.get('trArray');
  }

  add(item?) {
    const trArray = <FormArray>this.scheduleTrForm.get('trArray');
    trArray.push(this.createTrForm(item));
  }

  createTrForm(item?): UntypedFormGroup {
    const formGroup = this.fb.group({
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      totalTxsPaidOutInd: [item ? item.totalTxsPaidOutInd : null],
      totalTxsRlfAvlbl: [item ? item.totalTxsRlfAvlbl : null],
      section: [item ? item.section : null],
      selectedOption: [item ? item.selectedOption : 'no'],
      amtOfTaxRef: [item ? item.amtOfTaxRef : null],
      assYr: [item ? item.assYr : null],
    });

    return formGroup;
  }

  amtOfTaxRefSaved: any;
  assYrSaved: any;
  amtOfTaxRef() {
    const trArray = this.getTrArray;
    const trFlag = trArray.controls[0].get('selectedOption');

    // Iterate through the controls in the FormArray
    trArray.controls.forEach((control) => {
      const amount = control.get('amtOfTaxRef');
      const assYr = control.get('assYr');

      if (trFlag.value === 'no') {
        // Save the data and clear the form group
        this.amtOfTaxRefSaved = amount.value;
        this.assYrSaved = assYr.value;

        amount.reset();
        assYr.reset();
        trFlag.setValue('no');
        amount.clearValidators();
        assYr.clearValidators();
        amount.updateValueAndValidity();
        assYr.updateValueAndValidity();
        trFlag.updateValueAndValidity();
        console.log(amount, assYr);
      } else {
        amount.setValidators(Validators.required);
        assYr.setValidators(Validators.required);

        // Check if there is saved data and populate the form group
        if (this.amtOfTaxRefSaved && this.assYrSaved) {
          amount.patchValue(this.amtOfTaxRefSaved);
          assYr.patchValue(this.assYrSaved);
          trFlag.setValue('yes');
          amount.updateValueAndValidity();
          assYr.updateValueAndValidity();
          trFlag.updateValueAndValidity();
        }
      }
    });

    if (trFlag.value === 'yes') {
      this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'YES';
    } else{
      this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'NO';
    }
  }

  // handleSelectionChange(event) {
  //   this.getTrArray.controls[0].get('selectedOption').setValue(event);
  // }

  handleSectionChange(event) {
    this.sectionValue = (event.target as HTMLInputElement).value;
    console.log(this.sectionValue);
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    console.log(this.scheduleTrForm);
    if (this.scheduleTrForm.valid) {
      this.loading = true;

      this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.Copy_ITR_JSON.foreignIncome?.taxReliefClaimed.forEach(
        (element, index) => {
          element.reliefClaimedUsSection =
            this.getTrArray.controls[index].get('section').value;
        }
      );

      this.Copy_ITR_JSON.foreignIncome.taxReliefAssessmentYear =
        this.getTrArray.controls[0].get('assYr').value;
      this.Copy_ITR_JSON.foreignIncome.taxAmountRefunded =
        this.getTrArray.controls[0].get('amtOfTaxRef').value;

      if (this.getTrArray.controls[0].get('selectedOption').value === 'yes') {
        this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'YES';
      } else{
        this.Copy_ITR_JSON.foreignIncome.taxPaidOutsideIndiaFlag = 'NO';
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          // have to set the ITR_JSON to result once it is fixed from backend
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar('Schedule TR updated successfully');
          console.log('Schedule TR', result);
          this.saveAndNext.emit(false);
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to add schedule TR, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    }
  }
}
