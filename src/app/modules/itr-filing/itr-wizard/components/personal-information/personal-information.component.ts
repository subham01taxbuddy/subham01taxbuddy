import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges, ElementRef,
} from '@angular/core';
import {
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormArray,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Router } from '@angular/router';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserMsService } from 'src/app/services/user-ms.service';
import * as moment from 'moment/moment';

declare let $: any;
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  providers: [
    TitleCasePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PersonalInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  @Input() isEditPersonal = false;
  @Output() personalInfoSaved = new EventEmitter<boolean>();

  customerProfileForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  bankList: any;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  );
  viewer = 'DOC';
  docUrl = '';
  deletedFileData: any = [];
  fillingMaxDate: any = new Date();
  config: any;
  selectedIndexes: number[] = [];
  selectionChangeValue: number = 0;

  countryDropdown = [
    {
      id: '5b602096cf9b376303b20b92',
      countryId: 1,
      countryName: 'INDIA',
      countryCode: '91',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b93',
      countryId: 2,
      countryName: 'LAND ISLANDS',
      countryCode: '1001',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b94',
      countryId: 3,
      countryName: 'ALBANIA',
      countryCode: '355',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b95',
      countryId: 4,
      countryName: 'ALGERIA',
      countryCode: '213',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b96',
      countryId: 5,
      countryName: 'AMERICAN SAMOA',
      countryCode: '684',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b97',
      countryId: 6,
      countryName: 'ANDORRA',
      countryCode: '376',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b98',
      countryId: 7,
      countryName: 'ANGOLA',
      countryCode: '244',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b99',
      countryId: 8,
      countryName: 'ANGUILLA',
      countryCode: '1264',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9a',
      countryId: 9,
      countryName: 'ANTARCTICA',
      countryCode: '1010',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9b',
      countryId: 10,
      countryName: 'ANTIGUA AND BARBUDA',
      countryCode: '1268',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9c',
      countryId: 11,
      countryName: 'ARGENTINA',
      countryCode: '54',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9d',
      countryId: 12,
      countryName: 'ARMENIA',
      countryCode: '374',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9e',
      countryId: 13,
      countryName: 'ARUBA',
      countryCode: '297',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20b9f',
      countryId: 14,
      countryName: 'AUSTRALIA',
      countryCode: '61',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba0',
      countryId: 15,
      countryName: 'AUSTRIA',
      countryCode: '43',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba1',
      countryId: 16,
      countryName: 'AZERBAIJAN',
      countryCode: '994',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba2',
      countryId: 17,
      countryName: 'BAHAMAS',
      countryCode: '1242',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba3',
      countryId: 18,
      countryName: 'BAHRAIN',
      countryCode: '973',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba4',
      countryId: 19,
      countryName: 'BANGLADESH',
      countryCode: '880',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba5',
      countryId: 20,
      countryName: 'BARBADOS',
      countryCode: '1246',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba6',
      countryId: 21,
      countryName: 'BELARUS',
      countryCode: '375',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba7',
      countryId: 22,
      countryName: 'BELGIUM',
      countryCode: '32',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba8',
      countryId: 23,
      countryName: 'BELIZE',
      countryCode: '501',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20ba9',
      countryId: 24,
      countryName: 'BENIN',
      countryCode: '229',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20baa',
      countryId: 25,
      countryName: 'BERMUDA',
      countryCode: '1441',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bab',
      countryId: 26,
      countryName: 'BHUTAN',
      countryCode: '975',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bac',
      countryId: 27,
      countryName: 'BOLIVIA (PLURINATIONAL STATE OF)',
      countryCode: '591',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bad',
      countryId: 28,
      countryName: 'BONAIRE, SINT EUSTATIUS AND SABA',
      countryCode: '1002',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bae',
      countryId: 29,
      countryName: 'BOSNIA AND HERZEGOVINA',
      countryCode: '387',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20baf',
      countryId: 30,
      countryName: 'BOTSWANA',
      countryCode: '267',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb0',
      countryId: 31,
      countryName: 'BOUVET ISLAND',
      countryCode: '1003',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb1',
      countryId: 32,
      countryName: 'BRAZIL',
      countryCode: '55',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb2',
      countryId: 33,
      countryName: 'BRITISH INDIAN OCEAN TERRITORY',
      countryCode: '1014',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb3',
      countryId: 34,
      countryName: 'BRUNEI DARUSSALAM',
      countryCode: '673',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb4',
      countryId: 35,
      countryName: 'BULGARIA',
      countryCode: '359',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb5',
      countryId: 36,
      countryName: ' BURKINA FASO',
      countryCode: '226',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb6',
      countryId: 37,
      countryName: 'BURUNDI',
      countryCode: '257',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb7',
      countryId: 38,
      countryName: 'CABO VERDE',
      countryCode: '238',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb8',
      countryId: 39,
      countryName: 'CAMBODIA',
      countryCode: '855',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bb9',
      countryId: 40,
      countryName: 'CAMEROON',
      countryCode: '237',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bba',
      countryId: 41,
      countryName: 'CANADA',
      countryCode: '1',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bbb',
      countryId: 42,
      countryName: 'CAYMAN ISLANDS',
      countryCode: '1345',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bbc',
      countryId: 43,
      countryName: 'CENTRAL AFRICAN REPUBLIC',
      countryCode: '236',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bbd',
      countryId: 44,
      countryName: 'CHAD',
      countryCode: '235',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bbe',
      countryId: 45,
      countryName: 'CHILE',
      countryCode: '56',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bbf',
      countryId: 46,
      countryName: 'CHINA',
      countryCode: '86',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc0',
      countryId: 47,
      countryName: 'CHRISTMAS ISLAND',
      countryCode: '9',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc1',
      countryId: 48,
      countryName: 'COCOS (KEELING) ISLANDS',
      countryCode: '672',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc2',
      countryId: 49,
      countryName: 'COLOMBIA',
      countryCode: '57',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc3',
      countryId: 50,
      countryName: 'COMOROS',
      countryCode: '270',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc4',
      countryId: 51,
      countryName: 'CONGO',
      countryCode: '242',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc5',
      countryId: 52,
      countryName: 'CONGO (DEMOCRATIC REPUBLIC OF THE)',
      countryCode: '243',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc6',
      countryId: 53,
      countryName: 'COOK ISLANDS',
      countryCode: '682',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc7',
      countryId: 54,
      countryName: 'COSTA RICA',
      countryCode: '506',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc8',
      countryId: 55,
      countryName: "CTE D'IVOIRE",
      countryCode: '225',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bc9',
      countryId: 56,
      countryName: 'CROATIA',
      countryCode: '385',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bca',
      countryId: 57,
      countryName: 'CUBA',
      countryCode: '53',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bcb',
      countryId: 58,
      countryName: 'CURAAO',
      countryCode: '1015',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bcc',
      countryId: 59,
      countryName: 'CYPRUS',
      countryCode: '357',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bcd',
      countryId: 60,
      countryName: 'CZECHIA',
      countryCode: '420',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bce',
      countryId: 61,
      countryName: 'DENMARK',
      countryCode: '45',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bcf',
      countryId: 62,
      countryName: 'DJIBOUTI',
      countryCode: '253',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd0',
      countryId: 63,
      countryName: 'DOMINICA',
      countryCode: '1767',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd1',
      countryId: 64,
      countryName: 'DOMINICAN REPUBLIC',
      countryCode: '1809',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd2',
      countryId: 65,
      countryName: 'ECUADOR',
      countryCode: '593',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd3',
      countryId: 66,
      countryName: 'EGYPT',
      countryCode: '20',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd4',
      countryId: 67,
      countryName: 'EL SALVADOR',
      countryCode: '503',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd5',
      countryId: 68,
      countryName: 'EQUATORIAL GUINEA',
      countryCode: '240',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd6',
      countryId: 69,
      countryName: 'ERITREA',
      countryCode: '291',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd7',
      countryId: 70,
      countryName: 'ESTONIA',
      countryCode: '372',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd8',
      countryId: 71,
      countryName: 'ETHIOPIA',
      countryCode: '251',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bd9',
      countryId: 72,
      countryName: 'FALKLAND ISLANDS (MALVINAS)',
      countryCode: '500',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bda',
      countryId: 73,
      countryName: 'FAROE ISLANDS',
      countryCode: '298',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bdb',
      countryId: 74,
      countryName: 'FIJI',
      countryCode: '679',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bdc',
      countryId: 75,
      countryName: 'FINLAND',
      countryCode: '358',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bdd',
      countryId: 76,
      countryName: 'FRANCE',
      countryCode: '33',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bde',
      countryId: 77,
      countryName: 'FRENCH GUIANA',
      countryCode: '594',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bdf',
      countryId: 78,
      countryName: 'FRENCH POLYNESIA',
      countryCode: '689',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be0',
      countryId: 79,
      countryName: 'FRENCH SOUTHERN TERRITORIES',
      countryCode: '1004',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be1',
      countryId: 80,
      countryName: 'GABON',
      countryCode: '241',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be2',
      countryId: 81,
      countryName: 'GAMBIA',
      countryCode: '220',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be3',
      countryId: 82,
      countryName: 'GEORGIA',
      countryCode: '995',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be4',
      countryId: 83,
      countryName: 'GERMANY',
      countryCode: '49',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be5',
      countryId: 84,
      countryName: 'GHANA',
      countryCode: '233',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be6',
      countryId: 85,
      countryName: 'GIBRALTAR',
      countryCode: '350',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be7',
      countryId: 86,
      countryName: 'GREECE',
      countryCode: '30',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be8',
      countryId: 87,
      countryName: 'GREENLAND',
      countryCode: '299',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20be9',
      countryId: 88,
      countryName: 'GRENADA',
      countryCode: '1473',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bea',
      countryId: 89,
      countryName: 'GUADELOUPE',
      countryCode: '590',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20beb',
      countryId: 90,
      countryName: 'GUAM',
      countryCode: '1671',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bec',
      countryId: 91,
      countryName: 'GUATEMALA',
      countryCode: '502',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bed',
      countryId: 92,
      countryName: 'GUERNSEY',
      countryCode: '1481',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bee',
      countryId: 93,
      countryName: 'GUINEA',
      countryCode: '224',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bef',
      countryId: 94,
      countryName: 'GUINEA-BISSAU',
      countryCode: '245',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf0',
      countryId: 95,
      countryName: 'GUYANA',
      countryCode: '592',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf1',
      countryId: 96,
      countryName: 'HAITI',
      countryCode: '509',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf2',
      countryId: 97,
      countryName: 'HEARD ISLAND AND MCDONALD ISLANDS',
      countryCode: '1005',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf3',
      countryId: 98,
      countryName: 'HOLY SEE',
      countryCode: '6',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf4',
      countryId: 99,
      countryName: 'HONDURAS',
      countryCode: '504',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf5',
      countryId: 100,
      countryName: 'HONG KONG',
      countryCode: '852',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf6',
      countryId: 101,
      countryName: 'HUNGARY',
      countryCode: '36',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf7',
      countryId: 102,
      countryName: 'ICELAND',
      countryCode: '354',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bf9',
      countryId: 104,
      countryName: 'INDONESIA',
      countryCode: '62',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bfa',
      countryId: 105,
      countryName: 'IRAN (ISLAMIC REPUBLIC OF)',
      countryCode: '98',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bfb',
      countryId: 106,
      countryName: 'IRAQ',
      countryCode: '964',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bfc',
      countryId: 107,
      countryName: 'IRELAND',
      countryCode: '353',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bfd',
      countryId: 108,
      countryName: 'ISLE OF MAN',
      countryCode: '1624',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bfe',
      countryId: 109,
      countryName: 'ISRAEL',
      countryCode: '972',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20bff',
      countryId: 110,
      countryName: 'ITALY',
      countryCode: '5',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c00',
      countryId: 111,
      countryName: 'JAMAICA',
      countryCode: '1876',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c01',
      countryId: 112,
      countryName: 'JAPAN',
      countryCode: '81',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c02',
      countryId: 113,
      countryName: 'JERSEY',
      countryCode: '1534',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c03',
      countryId: 114,
      countryName: 'JORDAN',
      countryCode: '962',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c04',
      countryId: 115,
      countryName: 'KAZAKHSTAN',
      countryCode: '7',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c05',
      countryId: 116,
      countryName: 'KENYA',
      countryCode: '254',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c06',
      countryId: 117,
      countryName: 'KIRIBATI',
      countryCode: '686',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c07',
      countryId: 118,
      countryName: "KOREA(DEMOCRATIC PEOPLE'S REPUBLIC OF)",
      countryCode: '850',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c08',
      countryId: 119,
      countryName: 'KOREA (REPUBLIC OF)',
      countryCode: '82',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c09',
      countryId: 120,
      countryName: 'KUWAIT',
      countryCode: '965',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0a',
      countryId: 121,
      countryName: 'KYRGYZSTAN',
      countryCode: '996',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0b',
      countryId: 122,
      countryName: "LAO PEOPLE'S DEMOCRATIC REPUBLIC",
      countryCode: '856',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0c',
      countryId: 123,
      countryName: 'LATVIA',
      countryCode: '371',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0d',
      countryId: 124,
      countryName: 'LEBANON',
      countryCode: '961',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0e',
      countryId: 125,
      countryName: 'LESOTHO',
      countryCode: '266',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c0f',
      countryId: 126,
      countryName: 'LIBERIA',
      countryCode: '231',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c10',
      countryId: 127,
      countryName: 'LIBYA',
      countryCode: '218',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c11',
      countryId: 128,
      countryName: 'LIECHTENSTEIN',
      countryCode: '423',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c12',
      countryId: 129,
      countryName: 'LITHUANIA',
      countryCode: '370',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c13',
      countryId: 130,
      countryName: 'LUXEMBOURG',
      countryCode: '352',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c14',
      countryId: 131,
      countryName: 'MACAO',
      countryCode: '853',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c15',
      countryId: 132,
      countryName: 'MACEDONIA(THE FORMER YUGOSLAV REPUBLIC OF)',
      countryCode: '389',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c16',
      countryId: 133,
      countryName: 'MADAGASCAR',
      countryCode: '261',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c17',
      countryId: 134,
      countryName: 'MALAWI',
      countryCode: '256',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c18',
      countryId: 135,
      countryName: 'MALAYSIA',
      countryCode: '60',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c19',
      countryId: 136,
      countryName: 'MALDIVES',
      countryCode: '960',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1a',
      countryId: 137,
      countryName: 'MALI',
      countryCode: '223',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1b',
      countryId: 138,
      countryName: 'MALTA',
      countryCode: '356',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1c',
      countryId: 139,
      countryName: 'MARSHALL ISLANDS',
      countryCode: '692',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1d',
      countryId: 140,
      countryName: 'MARTINIQUE',
      countryCode: '596',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1e',
      countryId: 141,
      countryName: 'MAURITANIA',
      countryCode: '222',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c1f',
      countryId: 142,
      countryName: 'MAURITIUS',
      countryCode: '230',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c20',
      countryId: 143,
      countryName: 'MAYOTTE',
      countryCode: '269',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c21',
      countryId: 144,
      countryName: 'MEXICO',
      countryCode: '52',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c22',
      countryId: 145,
      countryName: 'MICRONESIA (FEDERATED STATES OF)',
      countryCode: '691',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c23',
      countryId: 146,
      countryName: 'MOLDOVA (REPUBLIC OF)',
      countryCode: '373',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c24',
      countryId: 147,
      countryName: 'MONACO',
      countryCode: '377',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c25',
      countryId: 148,
      countryName: 'MONGOLIA',
      countryCode: '976',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c26',
      countryId: 149,
      countryName: 'MONTENEGRO',
      countryCode: '382',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c27',
      countryId: 150,
      countryName: 'MONTSERRAT',
      countryCode: '1664',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c28',
      countryId: 151,
      countryName: 'MOROCCO',
      countryCode: '212',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c29',
      countryId: 152,
      countryName: 'MOZAMBIQUE',
      countryCode: '258',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2a',
      countryId: 153,
      countryName: 'MYANMAR',
      countryCode: '95',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2b',
      countryId: 154,
      countryName: 'NAMIBIA',
      countryCode: '264',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2c',
      countryId: 155,
      countryName: 'NAURU',
      countryCode: '674',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2d',
      countryId: 156,
      countryName: 'NEPAL',
      countryCode: '977',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2e',
      countryId: 157,
      countryName: 'NETHERLANDS',
      countryCode: '31',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c2f',
      countryId: 158,
      countryName: 'NEW CALEDONIA',
      countryCode: '687',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c30',
      countryId: 159,
      countryName: 'NEW ZEALAND',
      countryCode: '64',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c31',
      countryId: 160,
      countryName: 'NICARAGUA',
      countryCode: '505',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c32',
      countryId: 161,
      countryName: 'NIGER',
      countryCode: '227',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c33',
      countryId: 162,
      countryName: 'NIGERIA',
      countryCode: '234',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c34',
      countryId: 163,
      countryName: 'NIUE',
      countryCode: '683',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c35',
      countryId: 164,
      countryName: 'NORFOLK ISLAND',
      countryCode: '15',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c36',
      countryId: 165,
      countryName: 'NORTHERN MARIANA ISLANDS',
      countryCode: '1670',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c37',
      countryId: 166,
      countryName: 'NORWAY',
      countryCode: '47',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c38',
      countryId: 167,
      countryName: 'OMAN',
      countryCode: '968',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c39',
      countryId: 168,
      countryName: 'PAKISTAN',
      countryCode: '92',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3a',
      countryId: 169,
      countryName: 'PALAU',
      countryCode: '680',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3b',
      countryId: 170,
      countryName: 'PALESTINE, STATE OF',
      countryCode: '970',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3c',
      countryId: 171,
      countryName: 'PANAMA',
      countryCode: '507',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3d',
      countryId: 172,
      countryName: 'PAPUA NEW GUINEA',
      countryCode: '675',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3e',
      countryId: 173,
      countryName: 'PARAGUAY',
      countryCode: '595',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c3f',
      countryId: 174,
      countryName: 'PERU',
      countryCode: '51',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c40',
      countryId: 175,
      countryName: 'PHILIPPINES',
      countryCode: '63',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c41',
      countryId: 176,
      countryName: 'PITCAIRN',
      countryCode: '1011',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c42',
      countryId: 177,
      countryName: 'POLAND',
      countryCode: '48',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c43',
      countryId: 178,
      countryName: 'PORTUGAL',
      countryCode: '14',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c44',
      countryId: 179,
      countryName: 'PUERTO RICO',
      countryCode: '1787',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c45',
      countryId: 180,
      countryName: 'QATAR',
      countryCode: '974',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c46',
      countryId: 181,
      countryName: 'RUNION',
      countryCode: '262',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c47',
      countryId: 182,
      countryName: 'ROMANIA',
      countryCode: '40',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c48',
      countryId: 183,
      countryName: 'RUSSIAN FEDERATION',
      countryCode: '8',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c49',
      countryId: 184,
      countryName: 'RWANDA',
      countryCode: '250',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4a',
      countryId: 185,
      countryName: 'SAINT BARTHLEMY',
      countryCode: '1006',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4b',
      countryId: 186,
      countryName: ' SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA',
      countryCode: '290',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4c',
      countryId: 187,
      countryName: 'SAINT KITTS AND NEVIS',
      countryCode: '1869',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4d',
      countryId: 188,
      countryName: 'SAINT LUCIA',
      countryCode: '1758',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4e',
      countryId: 189,
      countryName: 'SAINT MARTIN (FRENCH PART)',
      countryCode: '1007',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c4f',
      countryId: 190,
      countryName: 'SAINT PIERRE AND MIQUELON',
      countryCode: '508',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c50',
      countryId: 191,
      countryName: 'SAINT VINCENT AND THE GRENADINES',
      countryCode: '1784',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c51',
      countryId: 192,
      countryName: 'SAMOA',
      countryCode: '685',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c52',
      countryId: 193,
      countryName: 'SAN MARINO',
      countryCode: '378',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c53',
      countryId: 194,
      countryName: 'SAO TOME AND PRINCIPE',
      countryCode: '239',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c54',
      countryId: 195,
      countryName: 'SAUDI ARABIA',
      countryCode: '966',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c55',
      countryId: 196,
      countryName: 'SENEGAL',
      countryCode: '221',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c56',
      countryId: 197,
      countryName: 'SERBIA',
      countryCode: '381',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c57',
      countryId: 198,
      countryName: 'SEYCHELLES',
      countryCode: '248',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c58',
      countryId: 199,
      countryName: 'SIERRA LEONE',
      countryCode: '232',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c59',
      countryId: 200,
      countryName: 'SINGAPORE',
      countryCode: '65',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5a',
      countryId: 201,
      countryName: 'SINT MAARTEN (DUTCH PART)',
      countryCode: '1721',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5b',
      countryId: 202,
      countryName: 'SLOVAKIA',
      countryCode: '421',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5c',
      countryId: 203,
      countryName: 'SLOVENIA',
      countryCode: '386',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5d',
      countryId: 204,
      countryName: 'SOLOMON ISLANDS',
      countryCode: '677',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5e',
      countryId: 205,
      countryName: 'SOMALIA',
      countryCode: '252',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c5f',
      countryId: 206,
      countryName: 'SOUTH AFRICA',
      countryCode: '28',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c60',
      countryId: 207,
      countryName: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
      countryCode: '1008',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c61',
      countryId: 208,
      countryName: 'SOUTH SUDAN',
      countryCode: '211',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c62',
      countryId: 209,
      countryName: 'SPAIN',
      countryCode: '35',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c63',
      countryId: 210,
      countryName: 'SRI LANKA',
      countryCode: '94',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c64',
      countryId: 211,
      countryName: 'SUDAN',
      countryCode: '249',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c65',
      countryId: 212,
      countryName: 'SURINAME',
      countryCode: '597',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c66',
      countryId: 213,
      countryName: 'SVALBARD AND JAN MAYEN',
      countryCode: '1012',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c67',
      countryId: 214,
      countryName: 'SWAZILAND',
      countryCode: '268',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c68',
      countryId: 215,
      countryName: 'SWEDEN',
      countryCode: '46',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c69',
      countryId: 216,
      countryName: 'SWITZERLAND',
      countryCode: '41',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6a',
      countryId: 217,
      countryName: 'SYRIAN ARAB REPUBLIC',
      countryCode: '963',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6b',
      countryId: 218,
      countryName: 'TAIWAN, PROVINCE OF CHINA[A]',
      countryCode: '886',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6c',
      countryId: 219,
      countryName: 'TAJIKISTAN',
      countryCode: '992',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6d',
      countryId: 220,
      countryName: 'TANZANIA, UNITED REPUBLIC OF',
      countryCode: '255',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6e',
      countryId: 221,
      countryName: 'THAILAND',
      countryCode: '66',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c6f',
      countryId: 222,
      countryName: 'TIMOR-LESTE (EAST TIMOR)',
      countryCode: '670',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c70',
      countryId: 223,
      countryName: 'TOGO',
      countryCode: '228',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c71',
      countryId: 224,
      countryName: 'TOKELAU',
      countryCode: '690',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c72',
      countryId: 225,
      countryName: 'TONGA',
      countryCode: '676',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c73',
      countryId: 226,
      countryName: 'TRINIDAD AND TOBAGO',
      countryCode: '1868',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c74',
      countryId: 227,
      countryName: 'TUNISIA',
      countryCode: '216',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c75',
      countryId: 228,
      countryName: 'TURKEY',
      countryCode: '90',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c76',
      countryId: 229,
      countryName: 'TURKMENISTAN',
      countryCode: '993',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c77',
      countryId: 230,
      countryName: 'TURKS AND CAICOS ISLANDS',
      countryCode: '1649',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c78',
      countryId: 231,
      countryName: 'TUVALU',
      countryCode: '688',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c79',
      countryId: 232,
      countryName: 'UGANDA',
      countryCode: '256',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7a',
      countryId: 233,
      countryName: 'UKRAINE',
      countryCode: '380',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7b',
      countryId: 234,
      countryName: 'UNITED ARAB EMIRATES',
      countryCode: '971',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7c',
      countryId: 235,
      countryName: 'UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND',
      countryCode: '44',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7d',
      countryId: 236,
      countryName: 'UNITED STATES OF AMERICA',
      countryCode: '2',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7e',
      countryId: 237,
      countryName: 'UNITED STATES MINOR OUTLYING ISLANDS',
      countryCode: '1009',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c7f',
      countryId: 238,
      countryName: 'URUGUAY',
      countryCode: '598',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c80',
      countryId: 239,
      countryName: 'UZBEKISTAN',
      countryCode: '998',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c81',
      countryId: 240,
      countryName: 'VANUATU',
      countryCode: '678',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c82',
      countryId: 241,
      countryName: 'VENEZUELA (BOLIVARIAN REPUBLIC OF)',
      countryCode: '58',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c83',
      countryId: 242,
      countryName: 'VIET NAM',
      countryCode: '84',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c84',
      countryId: 243,
      countryName: 'VIRGIN ISLANDS (BRITISH)',
      countryCode: '1284',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c85',
      countryId: 244,
      countryName: 'VIRGIN ISLANDS (U.S.)',
      countryCode: '1340',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c86',
      countryId: 245,
      countryName: 'WALLIS AND FUTUNA',
      countryCode: '681',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c87',
      countryId: 246,
      countryName: 'WESTERN SAHARA',
      countryCode: '1013',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c88',
      countryId: 247,
      countryName: 'YEMEN',
      countryCode: '967',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c89',
      countryId: 248,
      countryName: 'ZAMBIA',
      countryCode: '260',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c8a',
      countryId: 249,
      countryName: 'ZIMBABWE',
      countryCode: '263',
      status: true,
    },
    {
      id: '5b602096cf9b376303b20c8b',
      countryId: 250,
      countryName: 'OTHERS',
      countryCode: '9999',
      status: true,
    },
  ];
  stateDropdown = [];
  stateDropdownMaster = [
    {
      id: '5b4599c9c15a76370a342cas',
      stateId: '1',
      countryCode: '99',
      stateName: 'foreign',
      stateCode: '99',
      status: true,
    },
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

  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
    { value: 'NON_ORDINARY', label: 'Non Ordinary Resident' },
  ];

  employersDropdown = [
    { value: 'CENTRAL_GOVT', label: 'Central Government' },
    { value: 'GOVERNMENT', label: 'State Government' },
    { value: 'PRIVATE', label: 'Public Sector Unit' },
    { value: 'PE', label: 'Pensioners - Central Government' },
    { value: 'PESG', label: 'Pensioners - State Government' },
    { value: 'PEPS', label: 'Pensioners - Public sector undertaking' },
    { value: 'PENSIONERS', label: 'Pensioners - Others' },
    { value: 'OTHER', label: 'Other-Private' },
    { value: 'NA', label: 'Not-Applicable' },
  ];

  genderMaster = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ];

  clauseiv7provisio139iDtlsList = [
    {
      nature:
        'If his total sales, turnover or gross receipts, as the case maybe, in the business exceeds sixty lakh rupees during the previous year; or',
      value: 0,
    },
    {
      nature:
        'If his total gross receipts in profession exceeds ten lakh rupees during the previous year; or',
      value: 1,
    },
    {
      nature:
        'If the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees (fifty-thousand for resident senior citizen) or more; or',
      value: 2,
    },
    {
      nature:
        'The deposits in one or more savings bank account of the person, in aggregate, is rupees fifty lakh or more, during the previous year.',
      value: 3,
    },
  ];
  accountTypeDropdown = [
    { label: 'Savings Account', value: 'SB' },
    { label: 'Current Account', value: 'CA' },
    { label: 'Cash Credit Account', value: 'CC' },
    { label: 'Over draft account', value: 'OD' },
    { label: 'Non Resident Account', value: 'NRO' },
    { label: 'Other', value: 'OTH' },
  ];

  constructor(
    public fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private router: Router,
    private userMsService: UserMsService, private elementRef: ElementRef
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }
  s3FilePath: any;
  fileType = 'pdf';
  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.customerProfileForm = this.createCustomerProfileForm();
    this.isEditable();
    this.setCustomerProfileValues();
    this.getAllBankByIfsc();
    this.stateDropdown = this.stateDropdownMaster;
    this.getDocuments();
    this.getUserDataByPan(this.customerProfileForm.controls['panNumber'].value);
    this.config = {
      id: 'clauseIvPagination',
      itemsPerPage: 3,
      currentPage: 1,
    };
    this.strDepAmtAggAmtExcd1CrPrYrFlg();
    this.clauseiv7provisio139i();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.isEditable();
    }, 1000);
  }

  isEditable() {
    if (this.isEditPersonal) {
      this.customerProfileForm.enable();
    } else {
      this.customerProfileForm.disable();
    }
  }

  tabChanged() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.setCustomerProfileValues();
  }

  charRegex = AppConstants.charRegex;

  createCustomerProfileForm(): UntypedFormGroup {
    let itrFilingDueDate = sessionStorage.getItem('itrFilingDueDate');
    if (Date() > itrFilingDueDate) {
      console.log('Due date is over');
    }

    return this.fb.group({
      firstName: [
        '' /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */,
      ],
      middleName: [
        '' /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */,
      ],
      lastName: [
        '',
        Validators.compose([
          Validators.required /* Validators.pattern(AppConstants.charRegex) */,
        ]),
      ],
      fatherName: [''],
      // gender: [''],
      // dateOfBirth: [''],
      panNumber: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.panNumberRegex),
        ]),
      ],
      // aadharNumber: ['', Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)])],
      // assesseeType: ['', Validators.required],
      // residentialStatus: ['RESIDENT'],
      address: this.fb.group({
        flatNo: ['', Validators.required],
        premisesName: [''],
        road: [''],
        area: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(AppConstants.charSpecialRegex),
          ]),
        ],
        state: ['91', Validators.required],
        country: ['91', Validators.required],
        city: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(AppConstants.charSpecialRegex),
          ]),
        ],
        pinCode: [''],
      }),
      seventhProviso139: this.fb.group({
        seventhProvisio139: 'N',
        strDepAmtAggAmtExcd1CrPrYrFlg: 'N',
        depAmtAggAmtExcd1CrPrYrFlg: [null],
        strIncrExpAggAmt2LkTrvFrgnCntryFlg: 'N',
        incrExpAggAmt2LkTrvFrgnCntryFlg: [null],
        strIncrExpAggAmt1LkElctrctyPrYrFlg: 'N',
        incrExpAggAmt1LkElctrctyPrYrFlg: [null],
        clauseiv7provisio139i: 'N',
        clauseiv7provisio139iDtls: this.fb.array([
          this.fb.group({
            hasEdit: false,
            nature: null,
            amount: null,
          }),
        ]),
      }),
      liableSection44AAflag: 'Y',
      incomeDeclaredUsFlag: 'N',
      totalSalesExceedOneCr: 'N',
      aggregateOfAllAmountsReceivedFlag: null,
      aggregateOfAllPaymentsMadeFlag: null,
      liableSection44ABFlag: 'N',

      bankDetails: this.fb.array([
        this.createBankDetailsForm({ hasRefund: true }),
      ]),
      form10IEAckNo: null,
      form10IEDate: null,
    });
  }

  get addressForm() {
    return this.customerProfileForm.controls['address'] as UntypedFormGroup;
  }

  createBankDetailsForm(
    obj: {
      ifsCode?: string;
      name?: string;
      accountNumber?: string;
      hasRefund?: boolean;
      hasEdit?: boolean;
      accountType?: boolean;
    } = {}
  ): UntypedFormGroup {
    return this.fb.group({
      ifsCode: [
        obj.ifsCode || '',
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.IFSCRegex),
        ]),
      ],
      countryName: ['91', Validators.required],
      name: [obj.name || '', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex),]),],
      accountNumber: [obj.accountNumber || '', Validators.compose([Validators.minLength(3), Validators.maxLength(20), Validators.required, Validators.pattern(AppConstants.numericRegex),]),],
      hasRefund: [obj.hasRefund || false],
      hasEdit: [obj.hasEdit || false],
      accountType: [obj.accountType || '', Validators.required],
    });
  }

  addMoreBanks(formGroupName) {
    const bankDetails = <UntypedFormArray>formGroupName.get('bankDetails');
    if (bankDetails.valid) {
      bankDetails.push(this.createBankDetailsForm());
    } else {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
      console.log('add above details first');
    }
  }

  get getBankDetailsArray() {
    return <UntypedFormArray>this.customerProfileForm.get('bankDetails');
  }

  deleteBank(index, formGroupName) {
    const bank = <UntypedFormArray>formGroupName.get('bankDetails');
    bank.removeAt(index);
  }

  deleteSelectedBanks(formGroupName) {
    const banks = <UntypedFormArray>formGroupName.get('bankDetails');
    banks.controls = banks.controls.filter((element: UntypedFormGroup) => !element.controls['hasEdit'].value);
    banks.updateValueAndValidity();
  }

  getAllBankByIfsc() {
    const param = '/bankCodeDetails';
    this.userMsService.getMethod(param).subscribe(
      (result) => {
        this.bankList = result;
      },
      (error) => { }
    );
  }

  getBankListByIfsc(ifsc, i) {
    if (ifsc.valid) {
      const bank = this.bankList.filter(
        (item: any) =>
          item.ifscCode.substring(0, 4) === ifsc.value.substring(0, 4)
      );
      if (bank.length !== 0) {
        (
          (this.customerProfileForm.controls['bankDetails'] as UntypedFormGroup)
            .controls[i] as UntypedFormGroup
        ).controls['name'].setValue(bank[0].bankName);
      } else {
        (
          (this.customerProfileForm.controls['bankDetails'] as UntypedFormGroup)
            .controls[i] as UntypedFormGroup
        ).controls['name'].setValue(null);
      }
    } else {
      (
        (this.customerProfileForm.controls['bankDetails'] as UntypedFormGroup)
          .controls[i] as UntypedFormGroup
      ).controls['name'].setValue(null);
    }
  }

  getUserDataByPan(pan) {
    if (this.customerProfileForm.controls['panNumber'].valid) {
      if (
        this.utilsService.isNonEmpty(
          this.customerProfileForm.controls['panNumber']
        )
      ) {
        this.utilsService
          .getPanDetails(pan, this.ITR_JSON.userId)
          .subscribe((result: any) => {
            console.log('user data by PAN = ', result);
            if (result.isValid && result.isValid === 'EXISTING AND VALID') {
              this.customerProfileForm.controls['firstName'].setValue(
                this.titlecasePipe.transform(
                  this.utilsService.isNonEmpty(result.firstName)
                    ? result.firstName
                    : ''
                )
              );
              this.customerProfileForm.controls['lastName'].setValue(
                this.titlecasePipe.transform(
                  this.utilsService.isNonEmpty(result.lastName)
                    ? result.lastName
                    : ''
                )
              );
              this.customerProfileForm.controls['middleName'].setValue(
                this.titlecasePipe.transform(
                  this.utilsService.isNonEmpty(result.middleName)
                    ? result.middleName
                    : ''
                )
              );
            } else {
              this.utilsService.showSnackBar(result.isValid);
            }
          });
      }
    }
  }

  // getCityData() {
  //   if (
  //     (this.customerProfileForm.controls['address'] as UntypedFormGroup)
  //       .controls['pinCode'].valid
  //   ) {
  //     // this.changeCountry('91');
  //     const param =
  //       '/pincode/' +
  //       (this.customerProfileForm.controls['address'] as UntypedFormGroup)
  //         .controls['pinCode'].value;
  //     this.userMsService.getMethod(param).subscribe(
  //       (result: any) => {
  //         (
  //           this.customerProfileForm.controls['address'] as UntypedFormGroup
  //         ).controls['country'].setValue('91');
  //         (
  //           this.customerProfileForm.controls['address'] as UntypedFormGroup
  //         ).controls['city'].setValue(result.taluka);
  //         (
  //           this.customerProfileForm.controls['address'] as UntypedFormGroup
  //         ).controls['state'].setValue(result.stateCode);
  //         console.log('Picode Details:', result);
  //       },
  //       (error) => {
  //         if (error.status === 404) {
  //           (
  //             this.customerProfileForm.controls['address'] as UntypedFormGroup
  //           ).controls['city'].setValue(null);
  //         }
  //       }
  //     );
  //   }
  // }



  // changeCountry(country: string) {
  //   const addressGroup = this.customerProfileForm.get(
  //     'address'
  //   ) as UntypedFormGroup;

  //   if (country !== '91') {
  //     // Update stateDropdown for foreign
      // this.stateDropdown = [
      //   {
      //     id: '5b4599c9c15a76370a3424e9',
      //     stateId: '1',
      //     countryCode: '355',
      //     stateName: 'Foreign',
      //     stateCode: '99',
      //     status: true,
      //   },
      // ];
      // addressGroup.controls['state'].setValue('99');

      changeCountry(country: string) {
        console.log('Selected country:', country);

        const addressFormGroup = this.customerProfileForm.controls['address'] as UntypedFormGroup;
        const zipCodeControl = addressFormGroup.controls['pinCode'];

        if (!zipCodeControl) {
          console.error('ZIP code control not found!');
          return;
          }

        // Clear existing validators before applying new ones
        zipCodeControl.clearValidators();

        if (country === '91') {
          // Set Indian ZIP code validation (6-digit number)
          zipCodeControl.setValidators([
            Validators.required,
            Validators.pattern('^[1-9][0-9]{5}$') // Validates 6-digit numeric code
          ]);

          // Ensure the state remains selectable for India
          addressFormGroup.controls['state'].setValue(this.ITR_JSON.address.state || '');

        } else {
          // Set foreign ZIP code validation (3-10 alphanumeric characters)
          zipCodeControl.setValidators([
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9]{3,10}$') // Alphanumeric validation for foreign ZIP codes
          ]);

        }

        // Apply and validate the changes to the ZIP code field
        const currentZipCodeValue = zipCodeControl.value;
        zipCodeControl.updateValueAndValidity();
        zipCodeControl.setValue(currentZipCodeValue); // Retain current value after validation

        // Fetch city data for India based on ZIP code
        if (country === '91' && zipCodeControl.valid) {
          this.getCityData();
        }
      }



      changeCountryClear(country: string) {
        console.log('Selected country:', country);

        const addressFormGroup = this.customerProfileForm.controls['address'] as UntypedFormGroup;
        const zipCodeControl = addressFormGroup.controls['pinCode'];

        if (!zipCodeControl) {
          console.error('ZIP code control not found!');
          return;
        }

        // Clear existing validators before applying new ones
        zipCodeControl.clearValidators();

        if (country === '91') {
          // Set Indian ZIP code validation (6-digit number)
          zipCodeControl.setValidators([
            Validators.required,
            Validators.pattern('^[1-9][0-9]{5}$') // Validates 6-digit numeric code
          ]);

          // Ensure the state remains selectable for India
          addressFormGroup.controls['state'].setValue(this.ITR_JSON.address.state || '');

        } else {
      this.stateDropdown = [
        {
          id: '5b4599c9c15a76370a3424e9',
          stateId: '1',
          countryCode: '355',
          stateName: 'Foreign',
          stateCode: '99',
          status: true,
        },
      ];
          addressFormGroup.controls['state'].setValue('99');
          // Set foreign ZIP code validation (3-10 alphanumeric characters)
          zipCodeControl.setValidators([
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9]{3,10}$') // Alphanumeric validation for foreign ZIP codes
          ])
    this.addressForm.controls['city'].setValue('');

        }

        // Apply and validate the changes to the ZIP code field
        const currentZipCodeValue = zipCodeControl.value;
        zipCodeControl.updateValueAndValidity();
        zipCodeControl.setValue(''); // Retain current value after validation


        // Fetch city data for India based on ZIP code
        if (country === '91' && zipCodeControl.valid) {
          this.getCityData();
    }
  }

  getCityData() {
    const addressFormGroup = this.customerProfileForm.controls['address'] as UntypedFormGroup;
    const pinCodeControl = addressFormGroup.controls['pinCode'];

    if (pinCodeControl.valid) {
      const param = '/pincode/' + pinCodeControl.value;
      this.userMsService.getMethod(param).subscribe(
        (result: any) => {
          addressFormGroup.controls['country'].setValue('91');
          addressFormGroup.controls['city'].setValue(result.taluka);
          addressFormGroup.controls['state'].setValue(result.stateCode);
          console.log('Pincode Details:', result);
        },
        (error) => {
          if (error.status === 404) {
            addressFormGroup.controls['city'].setValue(null);
          }
        }
      );
    }
  }

  // foreginchange(country) {
  //   if (country !== '91') {
  //     this.stateDropdown = [
  //       {
  //         id: '5b4599c9c15a76370a3424e9',
  //         stateId: '1',
  //         countryCode: '355',
  //         stateName: 'Foreign',
  //         stateCode: '99',
  //         status: true,
  //       },
  //     ];
  //     (
  //       this.customerProfileForm.controls['address'] as UntypedFormGroup
  //     ).controls['state'].setValue('99');
  //   } else {
  //     this.stateDropdown = this.stateDropdownMaster;
  //   }
  // }

  setCustomerProfileValues() {
    if (this.ITR_JSON.address === null || this.ITR_JSON.address === undefined) {
      this.ITR_JSON.address = {
        area: '',
        city: '',
        country: '',
        flatNo: '',
        pinCode: '',
        premisesName: '',
        road: '',
        state: '',
      };
    }
    if (
      this.ITR_JSON.bankDetails === null ||
      this.ITR_JSON.bankDetails === undefined
    ) {
      this.ITR_JSON.bankDetails = [];
    }
    this.customerProfileForm.patchValue(this.ITR_JSON);

    this.changeCountry(this.ITR_JSON.address.country);
    // this.changeCountry(this.ITR_JSON.address.state);


    if (
      this.ITR_JSON.bankDetails instanceof Array &&
      this.ITR_JSON.bankDetails.length > 0
    ) {
      this.customerProfileForm.controls['bankDetails'] = this.fb.array([]);
      let bank = <UntypedFormArray>this.customerProfileForm.get('bankDetails');
      this.ITR_JSON.bankDetails.forEach((obj) => {
        bank.push(this.createBankDetailsForm(obj));
      });
      console.log('Immovable Form===', this.customerProfileForm);
    }
    this.ITR_JSON.family.forEach((item: any) => {
      if (item.relationShipCode === 'SELF' || item.relationType === 'SELF') {
        this.customerProfileForm.patchValue({
          firstName: item.fName,
          middleName: item.mName,
          lastName: item.lName,
          fatherName: item.fatherName,
          dateOfBirth: this.utilsService.isNonEmpty(item.dateOfBirth)
            ? item.dateOfBirth
            : null,
          gender: item.gender,
        });
      }
    });

    if (
      this.ITR_JSON.seventhProviso139?.clauseiv7provisio139iDtls?.length > 0
    ) {
      this.addClauseIv(
        this.ITR_JSON.seventhProviso139.clauseiv7provisio139iDtls
      );
    }

    if (this.ITR_JSON.liableSection44AAflag) {
      this.customerProfileForm.controls['liableSection44AAflag'].setValue(
        this.ITR_JSON.liableSection44AAflag
      );
    } else {
      this.customerProfileForm.controls['liableSection44AAflag'].setValue('Y');
    }

    this.customerProfileForm.controls['incomeDeclaredUsFlag'].setValue(
      this.ITR_JSON.incomeDeclaredUsFlag);

    if (this.ITR_JSON.incomeDeclaredUsFlag === 'N') {
      this.customerProfileForm.get('totalSalesExceedOneCr').setValidators([Validators.required]);

      this.customerProfileForm.controls['totalSalesExceedOneCr'].setValue(
        this.ITR_JSON.totalSalesExceedOneCr ? this.ITR_JSON.totalSalesExceedOneCr : 'N');

      this.customerProfileForm.get('totalSalesExceedOneCr').updateValueAndValidity();

      if (this.ITR_JSON.totalSalesExceedOneCr === 'Y') {
        this.customerProfileForm.get('aggregateOfAllAmountsReceivedFlag').setValidators([Validators.required, auditAplicableNotAllowedValidator()]);

        this.customerProfileForm.controls['aggregateOfAllAmountsReceivedFlag'].setValue(
          this.ITR_JSON.aggregateOfAllAmountsReceivedFlag);

        this.customerProfileForm.get('aggregateOfAllAmountsReceivedFlag').updateValueAndValidity();

        this.customerProfileForm.get('aggregateOfAllPaymentsMadeFlag').setValidators([Validators.required, auditAplicableNotAllowedValidator()]);

        this.customerProfileForm.controls['aggregateOfAllPaymentsMadeFlag'].setValue(
          this.ITR_JSON.aggregateOfAllPaymentsMadeFlag);

        this.customerProfileForm.get('aggregateOfAllPaymentsMadeFlag').updateValueAndValidity();
      }
    }

    this.customerProfileForm.controls['liableSection44ABFlag'].setValue(
      this.ITR_JSON.liableSection44ABFlag);

    this.seventhProvisio139();
  }

  isFormValid() {
    //check if at least one account is selected for refund
    let isBankSelected = false;
    this.customerProfileForm.controls['bankDetails'].value.forEach((bank) => {
      if (bank['hasRefund']) {
        isBankSelected = true;
      }
    });

    if (!isBankSelected) {
      this.utilsService.showSnackBar(
        'Please select at least one bank account in which you prefer to get refund'
      );
      this.openAcc();
      return false;
    }

    return this.customerProfileForm.valid;
  }

  async saveProfile(ref) {
    console.log(this.customerProfileForm, 'customerProfile');
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.customerProfileForm.controls['panNumber'].setValue(
      this.ITR_JSON.panNumber
    );

    if (!this.ITR_JSON.declaration) {
      this.ITR_JSON.declaration = {
        capacity: '',
        childOf: '',
        name: '',
        panNumber: '',
        place: '',
      };
    }
    this.ITR_JSON.declaration.panNumber = this.ITR_JSON.panNumber;

    if (this.customerProfileForm.invalid) {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
      this.utilsService.highlightInvalidFormFields(this.customerProfileForm, 'perDetailsId', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.customerProfileForm, 'bankAccountsId', this.elementRef);
      this.openAcc();
      this.personalInfoSaved.emit(false);
      this.utilsService.showSnackBar('Please fill in all mandatory fields.');
      return;
    }

    const formArrayValid = this.getBankDetailsArray.controls.every(control => control.valid);
    const formArrayHasValues = this.getBankDetailsArray.controls.length > 0;

    if (!formArrayValid || !formArrayHasValues) {
      this.loading = false;
      this.personalInfoSaved.emit(false);
      this.utilsService.showSnackBar(
        'Please select at least one bank account in which you prefer to get refund'
      );
      this.openAcc();
      return;
    }

    Object.keys(this.customerProfileForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.customerProfileForm.get(key).errors;
      if (controlErrors != null) {
        console.log(this.customerProfileForm);
        Object.keys(controlErrors).forEach((keyError) => {
          console.log(
            'Key control: ' + key + ', keyError: ' + keyError + ', err value: ',
            controlErrors[keyError]
          );
        });
      }
    });

    const clauseIvArray = this.getClauseiv7provisio139iDtls;

    clauseIvArray?.controls.forEach((element, index) => {
      const value = element.get('nature')?.value;
      this.onSelectionChange(value);
    });

    if (this.customerProfileForm.valid) {
      this.loading = true;

      Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
      console.log(this.customerProfileForm, 'ITRFORM');
      console.log('this.ITR_JSON: ', this.ITR_JSON);

      this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
        (result) => {
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          this.personalInfoSaved.emit(true);

          if (!ref) {
            this.saveAndNext.emit({ subTab: true, tabName: 'OTHER' });
          }
        },
        (error) => {
          this.utilsService.showSnackBar('Failed to update customer profile.');
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
      this.utilsService.highlightInvalidFormFields(this.customerProfileForm, 'perDetailId', this.elementRef);
      this.personalInfoSaved.emit(false);
      this.utilsService.showSnackBar('Please fill in all mandatory fields.');
      this.openAcc();
    }
  }

  openAcc() {
    const accordionButton = document.getElementById('bankButtonId');
    if (accordionButton) {
      if (accordionButton.getAttribute('aria-expanded') === 'false') {
        accordionButton.click();
      }

    }
  }

  async verifyAllBanks() {
    for (let i = 0; i < this.ITR_JSON.bankDetails.length; i++) {
      const param = '/utility/validate-bankDetails';
      const request = {
        bankAccount: this.ITR_JSON.bankDetails[i].accountNumber,
        ifsc: this.ITR_JSON.bankDetails[i].ifsCode,
        accountType: this.ITR_JSON.bankDetails[i].accountType,
      };
      const t = await this.itrMsService.postMethod(param, request).toPromise();
      console.log('Bank Details verification response', t);
      if (t['accountExists']) {
        continue;
      } else {
        this.utilsService.showSnackBar(
          'Bank account is not valid with this ' +
          this.ITR_JSON.bankDetails[i].accountNumber +
          ' no.'
        );
        this.loading = false;
        return false;
      }
    }
    return true;
  }

  documents = [];
  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
    });
  }

  deleteFile(filePath) {
    let adminId = this.utilsService.getLoggedInUserID();
    let path = '/itr/cloud/files?actionBy=' + adminId;
    let reqBody = [filePath];
    console.log(
      'URL path: ',
      path,
      ' filePath: ',
      filePath,
      ' Request body: ',
      reqBody
    );
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe(
      (responce: any) => {
        console.log('Doc delete responce: ', responce);
        this.utilsService.showSnackBar(responce.response);
        this.getDocuments();
      },
      (error) => {
        console.log('Doc delete ERROR responce: ', error.responce);
        this.utilsService.showSnackBar(error.response);
      }
    );
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        this.deletedFileData = res;
        console.log('Deleted file detail info: ', this.deletedFileData);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  closeDialog() {
    this.deletedFileData = [];
  }

  getSignedUrl(document) {
    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (
      ext.toLowerCase() === 'pdf' ||
      ext.toLowerCase() === 'xls' ||
      ext.toLowerCase() === 'doc' ||
      ext.toLowerCase() === 'xlsx' ||
      ext.toLowerCase() === 'docx'
    ) {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        console.log(res);
        this.docUrl = res['signedUrl'];
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getDocuments();
    }
  }

  setFilingDate() {
    let id = this.customerProfileForm.controls['form10IEAckNo'].value;
    let lastSix = id.substr(id.length - 6);
    let day = lastSix.slice(0, 2);
    let month = lastSix.slice(2, 4);
    let year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    this.customerProfileForm.controls['form10IEDate'].setValue(
      moment(dateString).toDate()
    );
  }

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< FILING SECTION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  get seventhProviso139() {
    return this.customerProfileForm.controls['seventhProviso139'] as UntypedFormGroup;
  }

  get getClauseiv7provisio139iDtls() {
    return this.seventhProviso139.controls[
      'clauseiv7provisio139iDtls'
    ] as UntypedFormArray;
  }

  addClauseIv(classIvDtls) {
    const ClauseIv = this.getClauseiv7provisio139iDtls;
    const ClauseIvJson =
      this.ITR_JSON.seventhProviso139?.clauseiv7provisio139iDtls;

    if (classIvDtls === 'addEmpty') {
      if (ClauseIv?.valid) {
        const formGroup = this.fb.group({
          nature: null,
          amount: null,
        });
        ClauseIv?.push(formGroup);
      }
    } else if (ClauseIvJson && ClauseIvJson.length > 0) {
      // Clear existing form groups
      while (ClauseIv.length !== 0) {
        ClauseIv.removeAt(0);
      }

      classIvDtls?.forEach((element, i) => {
        const formGroup = this.fb.group({
          nature: parseFloat(element.nature),
          amount: element.amount,
        });
        ClauseIv?.push(formGroup);
        console.log(ClauseIv);

        // setting validators for each input added
        this.onSelectionChange(i);
      });
    }
  }

  // Create a variable to store the data
  seventhProvsioChangeSavedData: any;

  // Function to set a validator
  setValidator(controlName: string, validator: any) {
    this.seventhProviso139.get(controlName).setValidators(validator);
    this.seventhProviso139.get(controlName).updateValueAndValidity();
  }

  // Function to clear a validator
  clearValidator(controlName: string) {
    this.seventhProviso139.get(controlName).clearValidators();
    this.seventhProviso139.get(controlName).updateValueAndValidity();
  }

  // 0
  seventhProvisio139() {
    const seventhProvisio139 = this.seventhProviso139;
    const seventhProvisio139Flag =
      seventhProvisio139.controls['seventhProvisio139'];
    const seventhProvisio139Value = seventhProvisio139.value;

    if (seventhProvisio139Flag.value === 'N') {
      this.seventhProvsioChangeSavedData = seventhProvisio139Value;
      seventhProvisio139.reset();
      seventhProvisio139Flag.setValue('N');

      this.clearValidator('strDepAmtAggAmtExcd1CrPrYrFlg');
      this.clearValidator('strIncrExpAggAmt2LkTrvFrgnCntryFlg');
      this.clearValidator('strIncrExpAggAmt1LkElctrctyPrYrFlg');
      this.clearValidator('clauseiv7provisio139i');

      this.strIncrExpAggAmt2LkTrvFrgnCntryFlg();
      this.strIncrExpAggAmt1LkElctrctyPrYrFlg();
      this.clauseiv7provisio139i();
      this.strDepAmtAggAmtExcd1CrPrYrFlg();
    } else {
      // marking questions as not required if seventhProvisio is yes
      this.setValidator('strDepAmtAggAmtExcd1CrPrYrFlg', [Validators.required]);

      this.setValidator(
        'strIncrExpAggAmt2LkTrvFrgnCntryFlg',
        Validators.required
      );

      this.setValidator(
        'strIncrExpAggAmt1LkElctrctyPrYrFlg',
        Validators.required
      );
      this.setValidator('clauseiv7provisio139i', Validators.required);

      // Check if there is saved data and populate the form group
      if (this.seventhProvsioChangeSavedData) {
        seventhProvisio139.patchValue(this.seventhProvsioChangeSavedData);
        seventhProvisio139Flag.setValue('Y');
      }
    }
  }

  // 1
  incrExpAggAmt2LkTrvFrgnCntryFlgSaved: any;
  strIncrExpAggAmt2LkTrvFrgnCntryFlg() {
    const seventhProvisio139 = this.seventhProviso139;
    const seventhProvisio139Flag =
      seventhProvisio139.controls['seventhProvisio139'];
    const twoLakhsFlag =
      seventhProvisio139.controls['strIncrExpAggAmt2LkTrvFrgnCntryFlg'];
    const twoLakhsFlagKey = 'incrExpAggAmt2LkTrvFrgnCntryFlg';
    const twoLakhsValue =
      seventhProvisio139.controls['incrExpAggAmt2LkTrvFrgnCntryFlg'];

    if (twoLakhsFlag.value === 'N' || seventhProvisio139Flag.value === 'N') {
      // Save the data and clear the form group
      this.incrExpAggAmt2LkTrvFrgnCntryFlgSaved = twoLakhsValue.value;
      twoLakhsValue?.reset();
      twoLakhsFlag?.setValue('N');
      this.clearValidator(twoLakhsFlagKey);
    } else {
      this.setValidator(twoLakhsFlagKey, [
        Validators.required,
        Validators.min(200001),
      ]);

      // Check if there is saved data and populate the form group
      if (this.incrExpAggAmt2LkTrvFrgnCntryFlgSaved) {
        twoLakhsValue.patchValue(this.incrExpAggAmt2LkTrvFrgnCntryFlgSaved);
        twoLakhsFlag.setValue('Y');
      }
    }
  }

  // 2
  incrExpAggAmt1LkElctrctyPrYrFlgSaved: any;
  strIncrExpAggAmt1LkElctrctyPrYrFlg() {
    const seventhProvisio139 = this.seventhProviso139;
    const seventhProvisio139Flag =
      seventhProvisio139.controls['seventhProvisio139'];
    const oneLakhsFlag =
      seventhProvisio139.controls['strIncrExpAggAmt1LkElctrctyPrYrFlg'];
    const oneLakhsFlagKey = 'incrExpAggAmt1LkElctrctyPrYrFlg';
    const oneLakhsValue =
      seventhProvisio139.controls['incrExpAggAmt1LkElctrctyPrYrFlg'];

    if (oneLakhsFlag.value === 'N' || seventhProvisio139Flag.value === 'N') {
      // Save the data and clear the form group
      this.incrExpAggAmt1LkElctrctyPrYrFlgSaved = oneLakhsValue.value;
      oneLakhsValue?.reset();
      oneLakhsFlag?.setValue('N');
      this.clearValidator(oneLakhsFlagKey);
    } else {
      this.setValidator(oneLakhsFlagKey, [
        Validators.required,
        Validators.min(100001),
      ]);

      // Check if there is saved data and populate the form group
      if (this.incrExpAggAmt1LkElctrctyPrYrFlgSaved) {
        oneLakhsValue.patchValue(this.incrExpAggAmt1LkElctrctyPrYrFlgSaved);
        oneLakhsFlag.setValue('Y');
      }
    }
  }

  // 3
  clauseiv7provisio139iSaved: any;
  clauseiv7provisio139i() {
    const seventhProvisio139 = this.seventhProviso139;
    const seventhProvisio139Flag =
      seventhProvisio139.controls['seventhProvisio139'];
    const clauseIvArray = this.getClauseiv7provisio139iDtls;
    const clauseIvFlag = seventhProvisio139.controls['clauseiv7provisio139i'];

    // Iterate through the controls in the FormArray
    clauseIvArray.controls.forEach((control) => {
      const amount = control.get('amount');
      const nature = control.get('nature');

      if (
        !clauseIvFlag.value ||
        clauseIvFlag.value === 'N' ||
        seventhProvisio139Flag.value === 'N'
      ) {
        // Save the data and clear the form group
        this.clauseiv7provisio139iSaved = amount.value;
        clauseIvFlag.reset();
        clauseIvFlag.clearValidators();
        clauseIvFlag.setValue('N');

        amount.reset();
        amount.clearValidators();
        amount.updateValueAndValidity();

        nature.reset();
        nature.clearValidators();
        nature.updateValueAndValidity();
      } else {
        amount.setValidators(Validators.required);
        nature.setValidators(Validators.required);
        clauseIvFlag.setValidators(Validators.required);

        // Check if there is saved data and populate the form group
        if (this.clauseiv7provisio139iSaved) {
          amount.patchValue(this.clauseiv7provisio139iSaved);
          clauseIvFlag.setValue('Y');
        }
      }
    });
  }

  // 3 on selection change
  onSelectionChange(index?) {
    const clauseIvArray = this.getClauseiv7provisio139iDtls;
    const validatorMap = {
      0: [Validators.required, Validators.min(6000001)],
      1: [Validators.required, Validators.min(1000001)],
      2: [Validators.required, Validators.min(25001)],
      3: [Validators.required, Validators.min(5000001)],
    };

    let control = clauseIvArray?.controls[index];
    let selectionValue = (control as UntypedFormGroup)?.controls['nature'];
    let amountControl = (control as UntypedFormGroup)?.controls['amount'];

    amountControl?.setValidators(validatorMap[selectionValue.value] || []);
    amountControl?.updateValueAndValidity();
  }

  // 4
  depAmtAggAmtExcd1CrPrYrFlgSaved: any;
  strDepAmtAggAmtExcd1CrPrYrFlg() {
    const seventhProvisio139 = this.seventhProviso139;
    const seventhProvisio139Flag =
      seventhProvisio139.controls['seventhProvisio139'];
    const oneCroreFlag =
      seventhProvisio139.controls['strDepAmtAggAmtExcd1CrPrYrFlg'];
    const oneCroreFlagKey = 'depAmtAggAmtExcd1CrPrYrFlg';
    const oneCroreValue =
      seventhProvisio139.controls['depAmtAggAmtExcd1CrPrYrFlg'];

    if (oneCroreFlag.value === 'N' || seventhProvisio139Flag.value === 'N') {
      // Save the data and clear the form group
      this.depAmtAggAmtExcd1CrPrYrFlgSaved = oneCroreValue.value;
      oneCroreValue?.reset();
      oneCroreFlag?.setValue('N');
      this.clearValidator(oneCroreFlagKey);
    } else {
      this.setValidator(oneCroreFlagKey, [
        Validators.required,
        Validators.min(10000001),
      ]);

      // Check if there is saved data and populate the form group
      if (this.depAmtAggAmtExcd1CrPrYrFlgSaved) {
        oneCroreValue.patchValue(this.depAmtAggAmtExcd1CrPrYrFlgSaved);
        oneCroreFlag.setValue('Y');
      }
    }
  }

  fieldGlobalIndex(index) {
    return this.config?.itemsPerPage * (this.config?.currentPage - 1) + index;
  }

  //  TO DO AJAY HAS TO ADD HASEDIT KEY FOR THIS TO WORK
  deleteClauseIvArray() {
    const clauseIvArray = this.getClauseiv7provisio139iDtls;

    clauseIvArray?.controls.forEach((element, index) => {
      if (this.selectedIndexes.includes(index)) {
        clauseIvArray?.removeAt(index);
      }
    });
  }

  // Function to toggle selected index
  toggleSelectedIndex(index: number) {
    const idx = this.selectedIndexes.indexOf(index);
    if (idx > -1) {
      this.selectedIndexes.splice(idx, 1);
    } else {
      this.selectedIndexes.push(index);
    }
  }

  onChangeIncomeDeclaredUsFlag() {
    this.customerProfileForm.controls['totalSalesExceedOneCr'].setValue(null);
    this.customerProfileForm.controls['aggregateOfAllAmountsReceivedFlag'].setValue(null);
    this.customerProfileForm.controls['aggregateOfAllPaymentsMadeFlag'].setValue(null);

    if (this.customerProfileForm.controls['incomeDeclaredUsFlag'].value === 'N') {
      this.customerProfileForm.get('totalSalesExceedOneCr').setValidators([Validators.required]);
      this.customerProfileForm.get('totalSalesExceedOneCr').setValue('N');
      this.customerProfileForm.get('totalSalesExceedOneCr').updateValueAndValidity();
    } else
      this.customerProfileForm.get('totalSalesExceedOneCr').clearValidators();

    this.customerProfileForm.get('totalSalesExceedOneCr').updateValueAndValidity();
  }

  onChangeTotalSalesExceedOneCr() {
    if (this.customerProfileForm.controls['totalSalesExceedOneCr'].value === 'Y') {
      this.customerProfileForm.get('aggregateOfAllAmountsReceivedFlag').setValidators([Validators.required, auditAplicableNotAllowedValidator()]);
      this.customerProfileForm.get('aggregateOfAllPaymentsMadeFlag').setValidators([Validators.required, auditAplicableNotAllowedValidator()]);
    } else {
      this.customerProfileForm.controls['aggregateOfAllAmountsReceivedFlag'].setValue(null);
      this.customerProfileForm.controls['aggregateOfAllPaymentsMadeFlag'].setValue(null);
      this.customerProfileForm.get('aggregateOfAllAmountsReceivedFlag').clearValidators();
      this.customerProfileForm.get('aggregateOfAllPaymentsMadeFlag').clearValidators();
    }

    this.customerProfileForm.get('aggregateOfAllAmountsReceivedFlag').updateValueAndValidity();
    this.customerProfileForm.get('aggregateOfAllPaymentsMadeFlag').updateValueAndValidity();
  }

}

function auditAplicableNotAllowedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value as string;
    if (value && value === 'N')
      return { auditAplicableNotAllowed: true };
    else
      return null;
  };
}
