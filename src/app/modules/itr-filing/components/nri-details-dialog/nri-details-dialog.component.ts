import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants'
import { UtilsService } from 'src/app/services/utils.service'
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface'

@Component({
  selector: 'app-nri-details-dialog',
  templateUrl: './nri-details-dialog.component.html',
  styleUrls: ['./nri-details-dialog.component.scss']
})
export class NriDetailsDialogComponent implements OnInit {
  nriDetailsForm: UntypedFormGroup

  countryList = [{ value: '93', label: 'AFGHANISTAN' },
  { value: '1001', label: 'ÅLAND ISLANDS' },
  { value: '355', label: 'ALBANIA' },
  { value: '213', label: 'ALGERIA' },
  { value: '684', label: 'AMERICAN SAMOA' },
  { value: '376', label: 'ANDORRA' },
  { value: '244', label: 'ANGOLA' },
  { value: '1264', label: 'ANGUILLA' },
  { value: '1010', label: 'ANTARCTICA' },
  { value: '1268', label: 'ANTIGUA AND BARBUDA' },
  { value: '54', label: 'ARGENTINA' },
  { value: '374', label: 'ARMENIA' },
  { value: '297', label: 'ARUBA' },
  { value: '61', label: 'AUSTRALIA' },
  { value: '43', label: 'AUSTRIA' },
  { value: '994', label: 'AZERBAIJAN' },
  { value: '1242', label: 'BAHAMAS' },
  { value: '973', label: 'BAHRAIN' },
  { value: '880', label: 'BANGLADESH' },
  { value: '1246', label: 'BARBADOS' },
  { value: '375', label: 'BELARUS' },
  { value: '32', label: 'BELGIUM' },
  { value: '501', label: 'BELIZE' },
  { value: '229', label: 'BENIN' },
  { value: '1441', label: 'BERMUDA' },
  { value: '975', label: 'BHUTAN' },
  { value: '591', label: 'BOLIVIA (PLURINATIONAL STATE OF)' },
  { value: '1002', label: 'BONAIRE, SINT EUSTATIUS AND SABA' },
  { value: '387', label: 'BOSNIA AND HERZEGOVINA' },
  { value: '267', label: 'BOTSWANA' },
  { value: '1003', label: 'BOUVET ISLAND' },
  { value: '55', label: 'BRAZIL' },
  { value: '1014', label: 'BRITISH INDIAN OCEAN TERRITORY' },
  { value: '673', label: 'BRUNEI DARUSSALAM' },
  { value: '359', label: 'BULGARIA' },
  { value: '226', label: 'BURKINA FASO' },
  { value: '257', label: 'BURUNDI' },
  { value: '238', label: 'CABO VERDE' },
  { value: '855', label: 'CAMBODIA' },
  { value: '237', label: 'CAMEROON' },
  { value: '1', label: 'CANADA' },
  { value: '1345', label: 'CAYMAN ISLANDS' },
  { value: '236', label: 'CENTRAL AFRICAN REPUBLIC' },
  { value: '235', label: 'CHAD' },
  { value: '56', label: 'CHILE' },
  { value: '86', label: 'CHINA' },
  { value: '9', label: 'CHRISTMAS ISLAND' },
  { value: '672', label: 'COCOS (KEELING) ISLANDS' },
  { value: '57', label: 'COLOMBIA' },
  { value: '270', label: 'COMOROS' },
  { value: '242', label: 'CONGO' },
  { value: '243', label: 'CONGO (DEMOCRATIC REPUBLIC OF THE)' },
  { value: '682', label: 'COOK ISLANDS' },
  { value: '506', label: 'COSTA RICA' },
  { value: '225', label: 'CÔTE D IVOIRE' },
  { value: '385', label: 'CROATIA' },
  { value: '53', label: 'CUBA' },
  { value: '1015', label: 'CURAÇAO' },
  { value: '357', label: 'CYPRUS' },
  { value: '420', label: 'CZECHIA' },
  { value: '45', label: 'DENMARK' },
  { value: '253', label: 'DJIBOUTI' },
  { value: '1767', label: 'DOMINICA' },
  { value: '1809', label: 'DOMINICAN REPUBLIC' },
  { value: '593', label: 'ECUADOR' },
  { value: '20', label: 'EGYPT' },
  { value: '503', label: 'EL SALVADOR' },
  { value: '240', label: 'EQUATORIAL GUINEA' },
  { value: '291', label: 'ERITREA' },
  { value: '372', label: 'ESTONIA' },
  { value: '251', label: 'ETHIOPIA' },
  { value: '500', label: 'FALKLAND ISLANDS(MALVINAS)' },
  { value: '298', label: 'FAROE ISLANDS' },
  { value: '679', label: 'FIJI' },
  { value: '358', label: 'FINLAND' },
  { value: '33', label: 'FRANCE' },
  { value: '594', label: 'FRENCH GUIANA' },
  { value: '689', label: 'FRENCH POLYNESIA' },
  { value: '1004', label: 'FRENCH SOUTHERN TERRITORIES' },
  { value: '241', label: 'GABON' },
  { value: '220', label: 'GAMBIA' },
  { value: '995', label: 'GEORGIA' },
  { value: '49', label: 'GERMANY' },
  { value: '233', label: 'GHANA' },
  { value: '350', label: 'GIBRALTAR' },
  { value: '30', label: 'GREECE' },
  { value: '299', label: 'GREENLAND' },
  { value: '1473', label: 'GRENADA' },
  { value: '590', label: 'GUADELOUPE' },
  { value: '1671', label: 'GUAM' },
  { value: '502', label: 'GUATEMALA' },
  { value: '1481', label: 'GUERNSEY' },
  { value: '224', label: 'GUINEA' },
  { value: '245', label: 'GUINEA-BISSAU' },
  { value: '592', label: 'GUYANA' },
  { value: '509', label: 'HAITI' },
  { value: '1005', label: 'HEARD ISLAND AND MCDONALD ISLANDS' },
  { value: '6', label: 'HOLY SEE' },
  { value: '504', label: 'HONDURAS' },
  { value: '852', label: 'HONG KONG' },
  { value: '36', label: 'HUNGARY' },
  { value: '354', label: 'ICELAND' },
  { value: '62', label: 'INDONESIA' },
  { value: '98', label: 'IRAN(ISLAMIC REPUBLIC OF)' },
  { value: '964', label: 'IRAQ' },
  { value: '353', label: 'IRELAND' },
  { value: '1624', label: 'ISLE OF MAN' },
  { value: '972', label: 'ISRAEL' },
  { value: '5', label: 'ITALY' },
  { value: '1876', label: 'JAMAICA' },
  { value: '81', label: 'JAPAN' },
  { value: '1534', label: 'JERSEY' },
  { value: '962', label: 'JORDAN' },
  { value: '7', label: 'KAZAKHSTAN' },
  { value: '254', label: 'KENYA' },
  { value: '686', label: 'KIRIBATI' },
  { value: '850', label: 'KOREA(DEMOCRATIC PEOPLE S REPUBLIC OF)' },
  { value: '82', label: 'KOREA(REPUBLIC OF)' },
  { value: '965', label: 'KUWAIT' },
  { value: '996', label: 'KYRGYZSTAN' },
  { value: '856', label: 'LAO PEOPLE S DEMOCRATIC REPUBLIC' },
  { value: '371', label: 'LATVIA' },
  { value: '961', label: 'LEBANON' },
  { value: '266', label: 'LESOTHO' },
  { value: '231', label: 'LIBERIA' },
  { value: '218', label: 'LIBYA' },
  { value: '423', label: 'LIECHTENSTEIN' },
  { value: '370', label: 'LITHUANIA' },
  { value: '352', label: 'LUXEMBOURG' },
  { value: '853', label: 'MACAO' },
  { value: '389', label: 'MACEDONIA(THE FORMER YUGOSLAV REPUBLIC OF)' },
  { value: '261', label: 'MADAGASCAR' },
  { value: '256', label: 'MALAWI' },
  { value: '60', label: 'MALAYSIA' },
  { value: '960', label: 'MALDIVES' },
  { value: '223', label: 'MALI' },
  { value: '356', label: 'MALTA' },
  { value: '692', label: 'MARSHALL ISLANDS' },
  { value: '596', label: 'MARTINIQUE' },
  { value: '222', label: 'MAURITANIA' },
  { value: '230', label: 'MAURITIUS' },
  { value: '269', label: 'MAYOTTE' },
  { value: '52', label: 'MEXICO' },
  { value: '691', label: 'MICRONESIA(FEDERATED STATES OF)' },
  { value: '373', label: 'MOLDOVA(REPUBLIC OF)' },
  { value: '377', label: 'MONACO' },
  { value: '976', label: 'MONGOLIA' },
  { value: '382', label: 'MONTENEGRO' },
  { value: '1664', label: 'MONTSERRAT' },
  { value: '212', label: 'MOROCCO' },
  { value: '258', label: 'MOZAMBIQUE' },
  { value: '95', label: 'MYANMAR' },
  { value: '264', label: 'NAMIBIA' },
  { value: '674', label: 'NAURU' },
  { value: '977', label: 'NEPAL' },
  { value: '31', label: 'NETHERLANDS' },
  { value: '687', label: 'NEW CALEDONIA' },
  { value: '64', label: 'NEW ZEALAND' },
  { value: '505', label: 'NICARAGUA' },
  { value: '227', label: 'NIGER' },
  { value: '234', label: 'NIGERIA' },
  { value: '683', label: 'NIUE' },
  { value: '15', label: 'NORFOLK ISLAND' },
  { value: '1670', label: 'NORTHERN MARIANA ISLANDS' },
  { value: '47', label: 'NORWAY' },
  { value: '968', label: 'OMAN' },
  { value: '92', label: 'PAKISTAN' },
  { value: '680', label: 'PALAU' },
  { value: '970', label: 'PALESTINE, STATE OF' },
  { value: '507', label: 'PANAMA' },
  { value: '675', label: 'PAPUA NEW GUINEA' },
  { value: '595', label: 'PARAGUAY' },
  { value: '51', label: 'PERU' },
  { value: '63', label: 'PHILIPPINES' },
  { value: '1011', label: 'PITCAIRN' },
  { value: '48', label: 'POLAND' },
  { value: '14', label: 'PORTUGAL' },
  { value: '1787', label: 'PUERTO RICO' },
  { value: '974', label: 'QATAR' },
  { value: '262', label: 'RÉUNION' },
  { value: '40', label: 'ROMANIA' },
  { value: '8', label: 'RUSSIAN FEDERATION' },
  { value: '250', label: 'RWANDA' },
  { value: '1006', label: 'SAINT BARTHÉLEMY' },
  { value: '290', label: 'SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA' },
  { value: '1869', label: 'SAINT KITTS AND NEVIS' },
  { value: '1758', label: 'SAINT LUCIA' },
  { value: '1007', label: 'SAINT MARTIN(FRENCH PART)' },
  { value: '508', label: 'SAINT PIERRE AND MIQUELON' },
  { value: '1784', label: 'SAINT VINCENT AND THE GRENADINES' },
  { value: '685', label: 'SAMOA' },
  { value: '378', label: 'SAN MARINO' },
  { value: '239', label: 'SAO TOME AND PRINCIPE' },
  { value: '966', label: 'SAUDI ARABIA' },
  { value: '221', label: 'SENEGAL' },
  { value: '381', label: 'SERBIA' },
  { value: '248', label: 'SEYCHELLES' },
  { value: '232', label: 'SIERRA LEONE' },
  { value: '65', label: 'SINGAPORE' },
  { value: '1721', label: 'SINT MAARTEN(DUTCH PART)' },
  { value: '421', label: 'SLOVAKIA' },
  { value: '386', label: 'SLOVENIA' },
  { value: '677', label: 'SOLOMON ISLANDS' },
  { value: '252', label: 'SOMALIA' },
  { value: '28', label: 'SOUTH AFRICA' },
  { value: '1008', label: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS' },
  { value: '211', label: 'SOUTH SUDAN' },
  { value: '35', label: 'SPAIN' },
  { value: '94', label: 'SRI LANKA' },
  { value: '249', label: 'SUDAN' },
  { value: '597', label: 'SURINAME' },
  { value: '1012', label: 'SVALBARD AND JAN MAYEN' },
  { value: '268', label: 'SWAZILAND' },
  { value: '46', label: 'SWEDEN' },
  { value: '41', label: 'SWITZERLAND' },
  { value: '963', label: 'SYRIAN ARAB REPUBLIC' },
  { value: '886', label: 'TAIWAN, PROVINCE OF CHINA[A]' },
  { value: '992', label: 'TAJIKISTAN' },
  { value: '255', label: 'TANZANIA, UNITED REPUBLIC OF' },
  { value: '66', label: 'THAILAND' },
  { value: '670', label: 'TIMOR - LESTE(EAST TIMOR)' },
  { value: '228', label: 'TOGO' },
  { value: '690', label: 'TOKELAU' },
  { value: '676', label: 'TONGA' },
  { value: '1868', label: 'TRINIDAD AND TOBAGO' },
  { value: '216', label: 'TUNISIA' },
  { value: '90', label: 'TURKEY' },
  { value: '993', label: 'TURKMENISTAN' },
  { value: '1649', label: 'TURKS AND CAICOS ISLANDS' },
  { value: '688', label: 'TUVALU' },
  { value: '256', label: 'UGANDA' },
  { value: '380', label: 'UKRAINE' },
  { value: '971', label: 'UNITED ARAB EMIRATES' },
  { value: '44', label: 'UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND' },
  { value: '2', label: 'UNITED STATES OF AMERICA' },
  { value: '1009', label: 'UNITED STATES MINOR OUTLYING ISLANDS' },
  { value: '598', label: 'URUGUAY' },
  { value: '998', label: 'UZBEKISTAN' },
  { value: '678', label: 'VANUATU' },
  { value: '58', label: 'VENEZUELA(BOLIVARIAN REPUBLIC OF)' },
  { value: '84', label: 'VIET NAM' },
  { value: '1284', label: 'VIRGIN ISLANDS(BRITISH)' },
  { value: '1340', label: 'VIRGIN ISLANDS(U.S.)' },
  { value: '681', label: 'WALLIS AND FUTUNA' },
  { value: '1013', label: 'WESTERN SAHARA' },
  { value: '967', label: 'YEMEN' },
  { value: '260', label: 'ZAMBIA' },
  { value: '263', label: 'ZIMBABWE' },
  { value: '9999', label: 'OTHERS' },
  { value: '9998', label: 'Not Applicable(Not Resident in any Country)' },]

  ITR_JSON: ITR_JSON;

  constructor(public dialogRef: MatDialogRef<NriDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.info('Data:', this.data)
    this.nriDetailsForm = this.fb.group({
      conditionsResStatus: [this.ITR_JSON.conditionsResStatus],
      jurisdictions: this.fb.array([]),
    });

    if (!this.ITR_JSON.jurisdictions || this.ITR_JSON.jurisdictions.length === 0) {
      this.addMore();
    } else {
      this.ITR_JSON.jurisdictions.forEach(jur => {
        this.addMore(jur);
      });
    }
  }
  createJurisdictionsForm(obj: { jurisdictionResidence?: string, tin?: string } = {}): UntypedFormGroup {
    return this.fb.group({
      jurisdictionResidence: [obj.jurisdictionResidence || '', [Validators.required]],
      tin: [obj.tin || '', [Validators.required]],
    })

  }

  get geJurisdictionsArray() {
    return <UntypedFormArray>this.nriDetailsForm.get('jurisdictions')

  }

  addMore(jur?) {
    const jurisdictions = <UntypedFormArray>this.nriDetailsForm.get('jurisdictions')

    if (jurisdictions.valid) {
      jurisdictions.push(this.createJurisdictionsForm(jur))

    } else {
      console.log('add above details first')

    }
  }

  removeData(index) {
    console.log('Remove Index', index)

    const jurisdictions = <UntypedFormArray>this.nriDetailsForm.get('jurisdictions')

    if (jurisdictions.length > 1) {
      jurisdictions.removeAt(index)

    } else {
      this.utilsService.showSnackBar('At least one jurisdictions details is mandatory.')
    }
  }

  saveJurisdictions() {
    let data = {
      data: this.nriDetailsForm.getRawValue(),
      success: true
    }
    if (this.nriDetailsForm.valid)
      this.dialogRef.close(data);
    console.log(data)
  }

}
