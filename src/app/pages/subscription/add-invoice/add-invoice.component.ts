import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { environment } from 'src/environments/environment';

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
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddInvoiceComponent implements OnInit {
  countryDropdown = [{ "id": "5b602096cf9b376303b20b92", "countryId": 1, "countryName": "INDIA", "countryCode": "91", "status": true }, { "id": "5b602096cf9b376303b20b93", "countryId": 2, "countryName": "LAND ISLANDS", "countryCode": "1001", "status": true }, { "id": "5b602096cf9b376303b20b94", "countryId": 3, "countryName": "ALBANIA", "countryCode": "355", "status": true }, { "id": "5b602096cf9b376303b20b95", "countryId": 4, "countryName": "ALGERIA", "countryCode": "213", "status": true }, { "id": "5b602096cf9b376303b20b96", "countryId": 5, "countryName": "AMERICAN SAMOA", "countryCode": "684", "status": true }, { "id": "5b602096cf9b376303b20b97", "countryId": 6, "countryName": "ANDORRA", "countryCode": "376", "status": true }, { "id": "5b602096cf9b376303b20b98", "countryId": 7, "countryName": "ANGOLA", "countryCode": "244", "status": true }, { "id": "5b602096cf9b376303b20b99", "countryId": 8, "countryName": "ANGUILLA", "countryCode": "1264", "status": true }, { "id": "5b602096cf9b376303b20b9a", "countryId": 9, "countryName": "ANTARCTICA", "countryCode": "1010", "status": true }, { "id": "5b602096cf9b376303b20b9b", "countryId": 10, "countryName": "ANTIGUA AND BARBUDA", "countryCode": "1268", "status": true }, { "id": "5b602096cf9b376303b20b9c", "countryId": 11, "countryName": "ARGENTINA", "countryCode": "54", "status": true }, { "id": "5b602096cf9b376303b20b9d", "countryId": 12, "countryName": "ARMENIA", "countryCode": "374", "status": true }, { "id": "5b602096cf9b376303b20b9e", "countryId": 13, "countryName": "ARUBA", "countryCode": "297", "status": true }, { "id": "5b602096cf9b376303b20b9f", "countryId": 14, "countryName": "AUSTRALIA", "countryCode": "61", "status": true }, { "id": "5b602096cf9b376303b20ba0", "countryId": 15, "countryName": "AUSTRIA", "countryCode": "43", "status": true }, { "id": "5b602096cf9b376303b20ba1", "countryId": 16, "countryName": "AZERBAIJAN", "countryCode": "994", "status": true }, { "id": "5b602096cf9b376303b20ba2", "countryId": 17, "countryName": "BAHAMAS", "countryCode": "1242", "status": true }, { "id": "5b602096cf9b376303b20ba3", "countryId": 18, "countryName": "BAHRAIN", "countryCode": "973", "status": true }, { "id": "5b602096cf9b376303b20ba4", "countryId": 19, "countryName": "BANGLADESH", "countryCode": "880", "status": true }, { "id": "5b602096cf9b376303b20ba5", "countryId": 20, "countryName": "BARBADOS", "countryCode": "1246", "status": true }, { "id": "5b602096cf9b376303b20ba6", "countryId": 21, "countryName": "BELARUS", "countryCode": "375", "status": true }, { "id": "5b602096cf9b376303b20ba7", "countryId": 22, "countryName": "BELGIUM", "countryCode": "32", "status": true }, { "id": "5b602096cf9b376303b20ba8", "countryId": 23, "countryName": "BELIZE", "countryCode": "501", "status": true }, { "id": "5b602096cf9b376303b20ba9", "countryId": 24, "countryName": "BENIN", "countryCode": "229", "status": true }, { "id": "5b602096cf9b376303b20baa", "countryId": 25, "countryName": "BERMUDA", "countryCode": "1441", "status": true }, { "id": "5b602096cf9b376303b20bab", "countryId": 26, "countryName": "BHUTAN", "countryCode": "975", "status": true }, { "id": "5b602096cf9b376303b20bac", "countryId": 27, "countryName": "BOLIVIA (PLURINATIONAL STATE OF)", "countryCode": "591", "status": true }, { "id": "5b602096cf9b376303b20bad", "countryId": 28, "countryName": "BONAIRE, SINT EUSTATIUS AND SABA", "countryCode": "1002", "status": true }, { "id": "5b602096cf9b376303b20bae", "countryId": 29, "countryName": "BOSNIA AND HERZEGOVINA", "countryCode": "387", "status": true }, { "id": "5b602096cf9b376303b20baf", "countryId": 30, "countryName": "BOTSWANA", "countryCode": "267", "status": true }, { "id": "5b602096cf9b376303b20bb0", "countryId": 31, "countryName": "BOUVET ISLAND", "countryCode": "1003", "status": true }, { "id": "5b602096cf9b376303b20bb1", "countryId": 32, "countryName": "BRAZIL", "countryCode": "55", "status": true }, { "id": "5b602096cf9b376303b20bb2", "countryId": 33, "countryName": "BRITISH INDIAN OCEAN TERRITORY", "countryCode": "1014", "status": true }, { "id": "5b602096cf9b376303b20bb3", "countryId": 34, "countryName": "BRUNEI DARUSSALAM", "countryCode": "673", "status": true }, { "id": "5b602096cf9b376303b20bb4", "countryId": 35, "countryName": "BULGARIA", "countryCode": "359", "status": true }, { "id": "5b602096cf9b376303b20bb5", "countryId": 36, "countryName": " BURKINA FASO", "countryCode": "226", "status": true }, { "id": "5b602096cf9b376303b20bb6", "countryId": 37, "countryName": "BURUNDI", "countryCode": "257", "status": true }, { "id": "5b602096cf9b376303b20bb7", "countryId": 38, "countryName": "CABO VERDE", "countryCode": "238", "status": true }, { "id": "5b602096cf9b376303b20bb8", "countryId": 39, "countryName": "CAMBODIA", "countryCode": "855", "status": true }, { "id": "5b602096cf9b376303b20bb9", "countryId": 40, "countryName": "CAMEROON", "countryCode": "237", "status": true }, { "id": "5b602096cf9b376303b20bba", "countryId": 41, "countryName": "CANADA", "countryCode": "1", "status": true }, { "id": "5b602096cf9b376303b20bbb", "countryId": 42, "countryName": "CAYMAN ISLANDS", "countryCode": "1345", "status": true }, { "id": "5b602096cf9b376303b20bbc", "countryId": 43, "countryName": "CENTRAL AFRICAN REPUBLIC", "countryCode": "236", "status": true }, { "id": "5b602096cf9b376303b20bbd", "countryId": 44, "countryName": "CHAD", "countryCode": "235", "status": true }, { "id": "5b602096cf9b376303b20bbe", "countryId": 45, "countryName": "CHILE", "countryCode": "56", "status": true }, { "id": "5b602096cf9b376303b20bbf", "countryId": 46, "countryName": "CHINA", "countryCode": "86", "status": true }, { "id": "5b602096cf9b376303b20bc0", "countryId": 47, "countryName": "CHRISTMAS ISLAND", "countryCode": "9", "status": true }, { "id": "5b602096cf9b376303b20bc1", "countryId": 48, "countryName": "COCOS (KEELING) ISLANDS", "countryCode": "672", "status": true }, { "id": "5b602096cf9b376303b20bc2", "countryId": 49, "countryName": "COLOMBIA", "countryCode": "57", "status": true }, { "id": "5b602096cf9b376303b20bc3", "countryId": 50, "countryName": "COMOROS", "countryCode": "270", "status": true }, { "id": "5b602096cf9b376303b20bc4", "countryId": 51, "countryName": "CONGO", "countryCode": "242", "status": true }, { "id": "5b602096cf9b376303b20bc5", "countryId": 52, "countryName": "CONGO (DEMOCRATIC REPUBLIC OF THE)", "countryCode": "243", "status": true }, { "id": "5b602096cf9b376303b20bc6", "countryId": 53, "countryName": "COOK ISLANDS", "countryCode": "682", "status": true }, { "id": "5b602096cf9b376303b20bc7", "countryId": 54, "countryName": "COSTA RICA", "countryCode": "506", "status": true }, { "id": "5b602096cf9b376303b20bc8", "countryId": 55, "countryName": "CTE D'IVOIRE", "countryCode": "225", "status": true }, { "id": "5b602096cf9b376303b20bc9", "countryId": 56, "countryName": "CROATIA", "countryCode": "385", "status": true }, { "id": "5b602096cf9b376303b20bca", "countryId": 57, "countryName": "CUBA", "countryCode": "53", "status": true }, { "id": "5b602096cf9b376303b20bcb", "countryId": 58, "countryName": "CURAAO", "countryCode": "1015", "status": true }, { "id": "5b602096cf9b376303b20bcc", "countryId": 59, "countryName": "CYPRUS", "countryCode": "357", "status": true }, { "id": "5b602096cf9b376303b20bcd", "countryId": 60, "countryName": "CZECHIA", "countryCode": "420", "status": true }, { "id": "5b602096cf9b376303b20bce", "countryId": 61, "countryName": "DENMARK", "countryCode": "45", "status": true }, { "id": "5b602096cf9b376303b20bcf", "countryId": 62, "countryName": "DJIBOUTI", "countryCode": "253", "status": true }, { "id": "5b602096cf9b376303b20bd0", "countryId": 63, "countryName": "DOMINICA", "countryCode": "1767", "status": true }, { "id": "5b602096cf9b376303b20bd1", "countryId": 64, "countryName": "DOMINICAN REPUBLIC", "countryCode": "1809", "status": true }, { "id": "5b602096cf9b376303b20bd2", "countryId": 65, "countryName": "ECUADOR", "countryCode": "593", "status": true }, { "id": "5b602096cf9b376303b20bd3", "countryId": 66, "countryName": "EGYPT", "countryCode": "20", "status": true }, { "id": "5b602096cf9b376303b20bd4", "countryId": 67, "countryName": "EL SALVADOR", "countryCode": "503", "status": true }, { "id": "5b602096cf9b376303b20bd5", "countryId": 68, "countryName": "EQUATORIAL GUINEA", "countryCode": "240", "status": true }, { "id": "5b602096cf9b376303b20bd6", "countryId": 69, "countryName": "ERITREA", "countryCode": "291", "status": true }, { "id": "5b602096cf9b376303b20bd7", "countryId": 70, "countryName": "ESTONIA", "countryCode": "372", "status": true }, { "id": "5b602096cf9b376303b20bd8", "countryId": 71, "countryName": "ETHIOPIA", "countryCode": "251", "status": true }, { "id": "5b602096cf9b376303b20bd9", "countryId": 72, "countryName": "FALKLAND ISLANDS (MALVINAS)", "countryCode": "500", "status": true }, { "id": "5b602096cf9b376303b20bda", "countryId": 73, "countryName": "FAROE ISLANDS", "countryCode": "298", "status": true }, { "id": "5b602096cf9b376303b20bdb", "countryId": 74, "countryName": "FIJI", "countryCode": "679", "status": true }, { "id": "5b602096cf9b376303b20bdc", "countryId": 75, "countryName": "FINLAND", "countryCode": "358", "status": true }, { "id": "5b602096cf9b376303b20bdd", "countryId": 76, "countryName": "FRANCE", "countryCode": "33", "status": true }, { "id": "5b602096cf9b376303b20bde", "countryId": 77, "countryName": "FRENCH GUIANA", "countryCode": "594", "status": true }, { "id": "5b602096cf9b376303b20bdf", "countryId": 78, "countryName": "FRENCH POLYNESIA", "countryCode": "689", "status": true }, { "id": "5b602096cf9b376303b20be0", "countryId": 79, "countryName": "FRENCH SOUTHERN TERRITORIES", "countryCode": "1004", "status": true }, { "id": "5b602096cf9b376303b20be1", "countryId": 80, "countryName": "GABON", "countryCode": "241", "status": true }, { "id": "5b602096cf9b376303b20be2", "countryId": 81, "countryName": "GAMBIA", "countryCode": "220", "status": true }, { "id": "5b602096cf9b376303b20be3", "countryId": 82, "countryName": "GEORGIA", "countryCode": "995", "status": true }, { "id": "5b602096cf9b376303b20be4", "countryId": 83, "countryName": "GERMANY", "countryCode": "49", "status": true }, { "id": "5b602096cf9b376303b20be5", "countryId": 84, "countryName": "GHANA", "countryCode": "233", "status": true }, { "id": "5b602096cf9b376303b20be6", "countryId": 85, "countryName": "GIBRALTAR", "countryCode": "350", "status": true }, { "id": "5b602096cf9b376303b20be7", "countryId": 86, "countryName": "GREECE", "countryCode": "30", "status": true }, { "id": "5b602096cf9b376303b20be8", "countryId": 87, "countryName": "GREENLAND", "countryCode": "299", "status": true }, { "id": "5b602096cf9b376303b20be9", "countryId": 88, "countryName": "GRENADA", "countryCode": "1473", "status": true }, { "id": "5b602096cf9b376303b20bea", "countryId": 89, "countryName": "GUADELOUPE", "countryCode": "590", "status": true }, { "id": "5b602096cf9b376303b20beb", "countryId": 90, "countryName": "GUAM", "countryCode": "1671", "status": true }, { "id": "5b602096cf9b376303b20bec", "countryId": 91, "countryName": "GUATEMALA", "countryCode": "502", "status": true }, { "id": "5b602096cf9b376303b20bed", "countryId": 92, "countryName": "GUERNSEY", "countryCode": "1481", "status": true }, { "id": "5b602096cf9b376303b20bee", "countryId": 93, "countryName": "GUINEA", "countryCode": "224", "status": true }, { "id": "5b602096cf9b376303b20bef", "countryId": 94, "countryName": "GUINEA-BISSAU", "countryCode": "245", "status": true }, { "id": "5b602096cf9b376303b20bf0", "countryId": 95, "countryName": "GUYANA", "countryCode": "592", "status": true }, { "id": "5b602096cf9b376303b20bf1", "countryId": 96, "countryName": "HAITI", "countryCode": "509", "status": true }, { "id": "5b602096cf9b376303b20bf2", "countryId": 97, "countryName": "HEARD ISLAND AND MCDONALD ISLANDS", "countryCode": "1005", "status": true }, { "id": "5b602096cf9b376303b20bf3", "countryId": 98, "countryName": "HOLY SEE", "countryCode": "6", "status": true }, { "id": "5b602096cf9b376303b20bf4", "countryId": 99, "countryName": "HONDURAS", "countryCode": "504", "status": true }, { "id": "5b602096cf9b376303b20bf5", "countryId": 100, "countryName": "HONG KONG", "countryCode": "852", "status": true }, { "id": "5b602096cf9b376303b20bf6", "countryId": 101, "countryName": "HUNGARY", "countryCode": "36", "status": true }, { "id": "5b602096cf9b376303b20bf7", "countryId": 102, "countryName": "ICELAND", "countryCode": "354", "status": true }, { "id": "5b602096cf9b376303b20bf9", "countryId": 104, "countryName": "INDONESIA", "countryCode": "62", "status": true }, { "id": "5b602096cf9b376303b20bfa", "countryId": 105, "countryName": "IRAN (ISLAMIC REPUBLIC OF)", "countryCode": "98", "status": true }, { "id": "5b602096cf9b376303b20bfb", "countryId": 106, "countryName": "IRAQ", "countryCode": "964", "status": true }, { "id": "5b602096cf9b376303b20bfc", "countryId": 107, "countryName": "IRELAND", "countryCode": "353", "status": true }, { "id": "5b602096cf9b376303b20bfd", "countryId": 108, "countryName": "ISLE OF MAN", "countryCode": "1624", "status": true }, { "id": "5b602096cf9b376303b20bfe", "countryId": 109, "countryName": "ISRAEL", "countryCode": "972", "status": true }, { "id": "5b602096cf9b376303b20bff", "countryId": 110, "countryName": "ITALY", "countryCode": "5", "status": true }, { "id": "5b602096cf9b376303b20c00", "countryId": 111, "countryName": "JAMAICA", "countryCode": "1876", "status": true }, { "id": "5b602096cf9b376303b20c01", "countryId": 112, "countryName": "JAPAN", "countryCode": "81", "status": true }, { "id": "5b602096cf9b376303b20c02", "countryId": 113, "countryName": "JERSEY", "countryCode": "1534", "status": true }, { "id": "5b602096cf9b376303b20c03", "countryId": 114, "countryName": "JORDAN", "countryCode": "962", "status": true }, { "id": "5b602096cf9b376303b20c04", "countryId": 115, "countryName": "KAZAKHSTAN", "countryCode": "7", "status": true }, { "id": "5b602096cf9b376303b20c05", "countryId": 116, "countryName": "KENYA", "countryCode": "254", "status": true }, { "id": "5b602096cf9b376303b20c06", "countryId": 117, "countryName": "KIRIBATI", "countryCode": "686", "status": true }, { "id": "5b602096cf9b376303b20c07", "countryId": 118, "countryName": "KOREA(DEMOCRATIC PEOPLE'S REPUBLIC OF)", "countryCode": "850", "status": true }, { "id": "5b602096cf9b376303b20c08", "countryId": 119, "countryName": "KOREA (REPUBLIC OF)", "countryCode": "82", "status": true }, { "id": "5b602096cf9b376303b20c09", "countryId": 120, "countryName": "KUWAIT", "countryCode": "965", "status": true }, { "id": "5b602096cf9b376303b20c0a", "countryId": 121, "countryName": "KYRGYZSTAN", "countryCode": "996", "status": true }, { "id": "5b602096cf9b376303b20c0b", "countryId": 122, "countryName": "LAO PEOPLE'S DEMOCRATIC REPUBLIC", "countryCode": "856", "status": true }, { "id": "5b602096cf9b376303b20c0c", "countryId": 123, "countryName": "LATVIA", "countryCode": "371", "status": true }, { "id": "5b602096cf9b376303b20c0d", "countryId": 124, "countryName": "LEBANON", "countryCode": "961", "status": true }, { "id": "5b602096cf9b376303b20c0e", "countryId": 125, "countryName": "LESOTHO", "countryCode": "266", "status": true }, { "id": "5b602096cf9b376303b20c0f", "countryId": 126, "countryName": "LIBERIA", "countryCode": "231", "status": true }, { "id": "5b602096cf9b376303b20c10", "countryId": 127, "countryName": "LIBYA", "countryCode": "218", "status": true }, { "id": "5b602096cf9b376303b20c11", "countryId": 128, "countryName": "LIECHTENSTEIN", "countryCode": "423", "status": true }, { "id": "5b602096cf9b376303b20c12", "countryId": 129, "countryName": "LITHUANIA", "countryCode": "370", "status": true }, { "id": "5b602096cf9b376303b20c13", "countryId": 130, "countryName": "LUXEMBOURG", "countryCode": "352", "status": true }, { "id": "5b602096cf9b376303b20c14", "countryId": 131, "countryName": "MACAO", "countryCode": "853", "status": true }, { "id": "5b602096cf9b376303b20c15", "countryId": 132, "countryName": "MACEDONIA(THE FORMER YUGOSLAV REPUBLIC OF)", "countryCode": "389", "status": true }, { "id": "5b602096cf9b376303b20c16", "countryId": 133, "countryName": "MADAGASCAR", "countryCode": "261", "status": true }, { "id": "5b602096cf9b376303b20c17", "countryId": 134, "countryName": "MALAWI", "countryCode": "256", "status": true }, { "id": "5b602096cf9b376303b20c18", "countryId": 135, "countryName": "MALAYSIA", "countryCode": "60", "status": true }, { "id": "5b602096cf9b376303b20c19", "countryId": 136, "countryName": "MALDIVES", "countryCode": "960", "status": true }, { "id": "5b602096cf9b376303b20c1a", "countryId": 137, "countryName": "MALI", "countryCode": "223", "status": true }, { "id": "5b602096cf9b376303b20c1b", "countryId": 138, "countryName": "MALTA", "countryCode": "356", "status": true }, { "id": "5b602096cf9b376303b20c1c", "countryId": 139, "countryName": "MARSHALL ISLANDS", "countryCode": "692", "status": true }, { "id": "5b602096cf9b376303b20c1d", "countryId": 140, "countryName": "MARTINIQUE", "countryCode": "596", "status": true }, { "id": "5b602096cf9b376303b20c1e", "countryId": 141, "countryName": "MAURITANIA", "countryCode": "222", "status": true }, { "id": "5b602096cf9b376303b20c1f", "countryId": 142, "countryName": "MAURITIUS", "countryCode": "230", "status": true }, { "id": "5b602096cf9b376303b20c20", "countryId": 143, "countryName": "MAYOTTE", "countryCode": "269", "status": true }, { "id": "5b602096cf9b376303b20c21", "countryId": 144, "countryName": "MEXICO", "countryCode": "52", "status": true }, { "id": "5b602096cf9b376303b20c22", "countryId": 145, "countryName": "MICRONESIA (FEDERATED STATES OF)", "countryCode": "691", "status": true }, { "id": "5b602096cf9b376303b20c23", "countryId": 146, "countryName": "MOLDOVA (REPUBLIC OF)", "countryCode": "373", "status": true }, { "id": "5b602096cf9b376303b20c24", "countryId": 147, "countryName": "MONACO", "countryCode": "377", "status": true }, { "id": "5b602096cf9b376303b20c25", "countryId": 148, "countryName": "MONGOLIA", "countryCode": "976", "status": true }, { "id": "5b602096cf9b376303b20c26", "countryId": 149, "countryName": "MONTENEGRO", "countryCode": "382", "status": true }, { "id": "5b602096cf9b376303b20c27", "countryId": 150, "countryName": "MONTSERRAT", "countryCode": "1664", "status": true }, { "id": "5b602096cf9b376303b20c28", "countryId": 151, "countryName": "MOROCCO", "countryCode": "212", "status": true }, { "id": "5b602096cf9b376303b20c29", "countryId": 152, "countryName": "MOZAMBIQUE", "countryCode": "258", "status": true }, { "id": "5b602096cf9b376303b20c2a", "countryId": 153, "countryName": "MYANMAR", "countryCode": "95", "status": true }, { "id": "5b602096cf9b376303b20c2b", "countryId": 154, "countryName": "NAMIBIA", "countryCode": "264", "status": true }, { "id": "5b602096cf9b376303b20c2c", "countryId": 155, "countryName": "NAURU", "countryCode": "674", "status": true }, { "id": "5b602096cf9b376303b20c2d", "countryId": 156, "countryName": "NEPAL", "countryCode": "977", "status": true }, { "id": "5b602096cf9b376303b20c2e", "countryId": 157, "countryName": "NETHERLANDS", "countryCode": "31", "status": true }, { "id": "5b602096cf9b376303b20c2f", "countryId": 158, "countryName": "NEW CALEDONIA", "countryCode": "687", "status": true }, { "id": "5b602096cf9b376303b20c30", "countryId": 159, "countryName": "NEW ZEALAND", "countryCode": "64", "status": true }, { "id": "5b602096cf9b376303b20c31", "countryId": 160, "countryName": "NICARAGUA", "countryCode": "505", "status": true }, { "id": "5b602096cf9b376303b20c32", "countryId": 161, "countryName": "NIGER", "countryCode": "227", "status": true }, { "id": "5b602096cf9b376303b20c33", "countryId": 162, "countryName": "NIGERIA", "countryCode": "234", "status": true }, { "id": "5b602096cf9b376303b20c34", "countryId": 163, "countryName": "NIUE", "countryCode": "683", "status": true }, { "id": "5b602096cf9b376303b20c35", "countryId": 164, "countryName": "NORFOLK ISLAND", "countryCode": "15", "status": true }, { "id": "5b602096cf9b376303b20c36", "countryId": 165, "countryName": "NORTHERN MARIANA ISLANDS", "countryCode": "1670", "status": true }, { "id": "5b602096cf9b376303b20c37", "countryId": 166, "countryName": "NORWAY", "countryCode": "47", "status": true }, { "id": "5b602096cf9b376303b20c38", "countryId": 167, "countryName": "OMAN", "countryCode": "968", "status": true }, { "id": "5b602096cf9b376303b20c39", "countryId": 168, "countryName": "PAKISTAN", "countryCode": "92", "status": true }, { "id": "5b602096cf9b376303b20c3a", "countryId": 169, "countryName": "PALAU", "countryCode": "680", "status": true }, { "id": "5b602096cf9b376303b20c3b", "countryId": 170, "countryName": "PALESTINE, STATE OF", "countryCode": "970", "status": true }, { "id": "5b602096cf9b376303b20c3c", "countryId": 171, "countryName": "PANAMA", "countryCode": "507", "status": true }, { "id": "5b602096cf9b376303b20c3d", "countryId": 172, "countryName": "PAPUA NEW GUINEA", "countryCode": "675", "status": true }, { "id": "5b602096cf9b376303b20c3e", "countryId": 173, "countryName": "PARAGUAY", "countryCode": "595", "status": true }, { "id": "5b602096cf9b376303b20c3f", "countryId": 174, "countryName": "PERU", "countryCode": "51", "status": true }, { "id": "5b602096cf9b376303b20c40", "countryId": 175, "countryName": "PHILIPPINES", "countryCode": "63", "status": true }, { "id": "5b602096cf9b376303b20c41", "countryId": 176, "countryName": "PITCAIRN", "countryCode": "1011", "status": true }, { "id": "5b602096cf9b376303b20c42", "countryId": 177, "countryName": "POLAND", "countryCode": "48", "status": true }, { "id": "5b602096cf9b376303b20c43", "countryId": 178, "countryName": "PORTUGAL", "countryCode": "14", "status": true }, { "id": "5b602096cf9b376303b20c44", "countryId": 179, "countryName": "PUERTO RICO", "countryCode": "1787", "status": true }, { "id": "5b602096cf9b376303b20c45", "countryId": 180, "countryName": "QATAR", "countryCode": "974", "status": true }, { "id": "5b602096cf9b376303b20c46", "countryId": 181, "countryName": "RUNION", "countryCode": "262", "status": true }, { "id": "5b602096cf9b376303b20c47", "countryId": 182, "countryName": "ROMANIA", "countryCode": "40", "status": true }, { "id": "5b602096cf9b376303b20c48", "countryId": 183, "countryName": "RUSSIAN FEDERATION", "countryCode": "8", "status": true }, { "id": "5b602096cf9b376303b20c49", "countryId": 184, "countryName": "RWANDA", "countryCode": "250", "status": true }, { "id": "5b602096cf9b376303b20c4a", "countryId": 185, "countryName": "SAINT BARTHLEMY", "countryCode": "1006", "status": true }, { "id": "5b602096cf9b376303b20c4b", "countryId": 186, "countryName": " SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA", "countryCode": "290", "status": true }, { "id": "5b602096cf9b376303b20c4c", "countryId": 187, "countryName": "SAINT KITTS AND NEVIS", "countryCode": "1869", "status": true }, { "id": "5b602096cf9b376303b20c4d", "countryId": 188, "countryName": "SAINT LUCIA", "countryCode": "1758", "status": true }, { "id": "5b602096cf9b376303b20c4e", "countryId": 189, "countryName": "SAINT MARTIN (FRENCH PART)", "countryCode": "1007", "status": true }, { "id": "5b602096cf9b376303b20c4f", "countryId": 190, "countryName": "SAINT PIERRE AND MIQUELON", "countryCode": "508", "status": true }, { "id": "5b602096cf9b376303b20c50", "countryId": 191, "countryName": "SAINT VINCENT AND THE GRENADINES", "countryCode": "1784", "status": true }, { "id": "5b602096cf9b376303b20c51", "countryId": 192, "countryName": "SAMOA", "countryCode": "685", "status": true }, { "id": "5b602096cf9b376303b20c52", "countryId": 193, "countryName": "SAN MARINO", "countryCode": "378", "status": true }, { "id": "5b602096cf9b376303b20c53", "countryId": 194, "countryName": "SAO TOME AND PRINCIPE", "countryCode": "239", "status": true }, { "id": "5b602096cf9b376303b20c54", "countryId": 195, "countryName": "SAUDI ARABIA", "countryCode": "966", "status": true }, { "id": "5b602096cf9b376303b20c55", "countryId": 196, "countryName": "SENEGAL", "countryCode": "221", "status": true }, { "id": "5b602096cf9b376303b20c56", "countryId": 197, "countryName": "SERBIA", "countryCode": "381", "status": true }, { "id": "5b602096cf9b376303b20c57", "countryId": 198, "countryName": "SEYCHELLES", "countryCode": "248", "status": true }, { "id": "5b602096cf9b376303b20c58", "countryId": 199, "countryName": "SIERRA LEONE", "countryCode": "232", "status": true }, { "id": "5b602096cf9b376303b20c59", "countryId": 200, "countryName": "SINGAPORE", "countryCode": "65", "status": true }, { "id": "5b602096cf9b376303b20c5a", "countryId": 201, "countryName": "SINT MAARTEN (DUTCH PART)", "countryCode": "1721", "status": true }, { "id": "5b602096cf9b376303b20c5b", "countryId": 202, "countryName": "SLOVAKIA", "countryCode": "421", "status": true }, { "id": "5b602096cf9b376303b20c5c", "countryId": 203, "countryName": "SLOVENIA", "countryCode": "386", "status": true }, { "id": "5b602096cf9b376303b20c5d", "countryId": 204, "countryName": "SOLOMON ISLANDS", "countryCode": "677", "status": true }, { "id": "5b602096cf9b376303b20c5e", "countryId": 205, "countryName": "SOMALIA", "countryCode": "252", "status": true }, { "id": "5b602096cf9b376303b20c5f", "countryId": 206, "countryName": "SOUTH AFRICA", "countryCode": "28", "status": true }, { "id": "5b602096cf9b376303b20c60", "countryId": 207, "countryName": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS", "countryCode": "1008", "status": true }, { "id": "5b602096cf9b376303b20c61", "countryId": 208, "countryName": "SOUTH SUDAN", "countryCode": "211", "status": true }, { "id": "5b602096cf9b376303b20c62", "countryId": 209, "countryName": "SPAIN", "countryCode": "35", "status": true }, { "id": "5b602096cf9b376303b20c63", "countryId": 210, "countryName": "SRI LANKA", "countryCode": "94", "status": true }, { "id": "5b602096cf9b376303b20c64", "countryId": 211, "countryName": "SUDAN", "countryCode": "249", "status": true }, { "id": "5b602096cf9b376303b20c65", "countryId": 212, "countryName": "SURINAME", "countryCode": "597", "status": true }, { "id": "5b602096cf9b376303b20c66", "countryId": 213, "countryName": "SVALBARD AND JAN MAYEN", "countryCode": "1012", "status": true }, { "id": "5b602096cf9b376303b20c67", "countryId": 214, "countryName": "SWAZILAND", "countryCode": "268", "status": true }, { "id": "5b602096cf9b376303b20c68", "countryId": 215, "countryName": "SWEDEN", "countryCode": "46", "status": true }, { "id": "5b602096cf9b376303b20c69", "countryId": 216, "countryName": "SWITZERLAND", "countryCode": "41", "status": true }, { "id": "5b602096cf9b376303b20c6a", "countryId": 217, "countryName": "SYRIAN ARAB REPUBLIC", "countryCode": "963", "status": true }, { "id": "5b602096cf9b376303b20c6b", "countryId": 218, "countryName": "TAIWAN, PROVINCE OF CHINA[A]", "countryCode": "886", "status": true }, { "id": "5b602096cf9b376303b20c6c", "countryId": 219, "countryName": "TAJIKISTAN", "countryCode": "992", "status": true }, { "id": "5b602096cf9b376303b20c6d", "countryId": 220, "countryName": "TANZANIA, UNITED REPUBLIC OF", "countryCode": "255", "status": true }, { "id": "5b602096cf9b376303b20c6e", "countryId": 221, "countryName": "THAILAND", "countryCode": "66", "status": true }, { "id": "5b602096cf9b376303b20c6f", "countryId": 222, "countryName": "TIMOR-LESTE (EAST TIMOR)", "countryCode": "670", "status": true }, { "id": "5b602096cf9b376303b20c70", "countryId": 223, "countryName": "TOGO", "countryCode": "228", "status": true }, { "id": "5b602096cf9b376303b20c71", "countryId": 224, "countryName": "TOKELAU", "countryCode": "690", "status": true }, { "id": "5b602096cf9b376303b20c72", "countryId": 225, "countryName": "TONGA", "countryCode": "676", "status": true }, { "id": "5b602096cf9b376303b20c73", "countryId": 226, "countryName": "TRINIDAD AND TOBAGO", "countryCode": "1868", "status": true }, { "id": "5b602096cf9b376303b20c74", "countryId": 227, "countryName": "TUNISIA", "countryCode": "216", "status": true }, { "id": "5b602096cf9b376303b20c75", "countryId": 228, "countryName": "TURKEY", "countryCode": "90", "status": true }, { "id": "5b602096cf9b376303b20c76", "countryId": 229, "countryName": "TURKMENISTAN", "countryCode": "993", "status": true }, { "id": "5b602096cf9b376303b20c77", "countryId": 230, "countryName": "TURKS AND CAICOS ISLANDS", "countryCode": "1649", "status": true }, { "id": "5b602096cf9b376303b20c78", "countryId": 231, "countryName": "TUVALU", "countryCode": "688", "status": true }, { "id": "5b602096cf9b376303b20c79", "countryId": 232, "countryName": "UGANDA", "countryCode": "256", "status": true }, { "id": "5b602096cf9b376303b20c7a", "countryId": 233, "countryName": "UKRAINE", "countryCode": "380", "status": true }, { "id": "5b602096cf9b376303b20c7b", "countryId": 234, "countryName": "UNITED ARAB EMIRATES", "countryCode": "971", "status": true }, { "id": "5b602096cf9b376303b20c7c", "countryId": 235, "countryName": "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND", "countryCode": "44", "status": true }, { "id": "5b602096cf9b376303b20c7d", "countryId": 236, "countryName": "UNITED STATES OF AMERICA", "countryCode": "2", "status": true }, { "id": "5b602096cf9b376303b20c7e", "countryId": 237, "countryName": "UNITED STATES MINOR OUTLYING ISLANDS", "countryCode": "1009", "status": true }, { "id": "5b602096cf9b376303b20c7f", "countryId": 238, "countryName": "URUGUAY", "countryCode": "598", "status": true }, { "id": "5b602096cf9b376303b20c80", "countryId": 239, "countryName": "UZBEKISTAN", "countryCode": "998", "status": true }, { "id": "5b602096cf9b376303b20c81", "countryId": 240, "countryName": "VANUATU", "countryCode": "678", "status": true }, { "id": "5b602096cf9b376303b20c82", "countryId": 241, "countryName": "VENEZUELA (BOLIVARIAN REPUBLIC OF)", "countryCode": "58", "status": true }, { "id": "5b602096cf9b376303b20c83", "countryId": 242, "countryName": "VIET NAM", "countryCode": "84", "status": true }, { "id": "5b602096cf9b376303b20c84", "countryId": 243, "countryName": "VIRGIN ISLANDS (BRITISH)", "countryCode": "1284", "status": true }, { "id": "5b602096cf9b376303b20c85", "countryId": 244, "countryName": "VIRGIN ISLANDS (U.S.)", "countryCode": "1340", "status": true }, { "id": "5b602096cf9b376303b20c86", "countryId": 245, "countryName": "WALLIS AND FUTUNA", "countryCode": "681", "status": true }, { "id": "5b602096cf9b376303b20c87", "countryId": 246, "countryName": "WESTERN SAHARA", "countryCode": "1013", "status": true }, { "id": "5b602096cf9b376303b20c88", "countryId": 247, "countryName": "YEMEN", "countryCode": "967", "status": true }, { "id": "5b602096cf9b376303b20c89", "countryId": 248, "countryName": "ZAMBIA", "countryCode": "260", "status": true }, { "id": "5b602096cf9b376303b20c8a", "countryId": 249, "countryName": "ZIMBABWE", "countryCode": "263", "status": true }, { "id": "5b602096cf9b376303b20c8b", "countryId": 250, "countryName": "OTHERS", "countryCode": "9999", "status": true }]
  loading!: boolean;
  invoiceForm: FormGroup;
  stateDropdown: any;
  isMaharashtraState: boolean = true;
  maxDate = new Date();
  initialData: any;
  userSubscription: any;
  invoiceDetails: any;
  itrTypes = [
    { value: '1', label: 'ITR-1' },
    { value: '4', label: 'ITR-4' },
    { value: '2', label: 'ITR-2' },
    { value: '3', label: 'ITR-3' },
    { value: '5', label: 'ITR-5' },
    { value: '6', label: 'ITR-6' },
    { value: '7', label: 'ITR-7' },
  ];

  serviceDetails = [];
  service: string;
  serviceDetail: string = '';
  description: string = '';
  itemList = [];
  userInvoices: any;
  userProfile: any;
  showInvoiceForm: boolean = false;
  dueDays: any;
  sacCode: any;
  isUpdateInvoice = false;
  withinMonth = false;
  constructor(public utilsService: UtilsService, private _toastMessageService: ToastMessageService,
    private fb: FormBuilder, private userMsService: UserMsService, public http: HttpClient,
    private itrMsService: ItrMsService, private activeRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.invoiceForm = this.createInvoiceForm(false);
    this.changeCountry('INDIA');
    this.activeRoute.queryParams.subscribe(params => {
      console.log("Subscription user info:", params)
      if (this.utilsService.isNonEmpty(params['subscriptionId'])) {
        this.getSubscriptionDetails(params['subscriptionId']);
      } else if (this.utilsService.isNonEmpty(params['txbdyInvoiceId'])) {
        this.withinMonth = params['withinMonth'] == 'false' ? true : false
        this.invoiceForm = this.createInvoiceForm(true, this.withinMonth);
        this.getInvoiceDetails(params['txbdyInvoiceId']);
        this.isUpdateInvoice = true;
      }
    });
  }
  getInvoiceDetails(id) {
    const param = `/invoice?txbdyInvoiceId=${id}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log(result);
      this.invoiceDetails = result;

      this.invoiceForm.patchValue(result);
      this.itemList = result['itemList'];
      this.sacCode = this.itemList[0].sacCode
      this.loading = false;
    })
  }
  getSubscriptionDetails(id) {
    this.loading = true;
    const param = `/subscription/${id}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('Subscription by Id: ', res);
      this.userSubscription = res;
      let applicableService;
      if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
        this.dueDays = this.userSubscription.smeSelectedPlan.dueDays;
        applicableService = this.userSubscription.smeSelectedPlan.servicesType;
        this.getSacCode(this.userSubscription.smeSelectedPlan.planId)
      } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
        this.dueDays = this.userSubscription.userSelectedPlan.dueDays;
        applicableService = this.userSubscription.userSelectedPlan.servicesType;
        this.getSacCode(this.userSubscription.userSelectedPlan.planId)
      }

      this.updateDueDate(new Date());
      switch (applicableService) {
        case 'ITR': {
          this.service = 'ITR Filing';
          this.changeService();
          break;
        }
        case 'GST': {
          this.service = 'GST Filing';
          this.changeService();
          break;
        }
        case 'NOTICE': {
          this.service = 'Notice response';
          this.changeService();
          break;
        }
      }
      this.invoiceForm.controls['subscriptionId'].setValue(id);
      this.invoiceForm.controls['serviceType'].setValue(applicableService);
      this.setItemList(this.userSubscription);
      this.getUserDetails(res.userId);
    }, error => {
      this.loading = false;
      console.log('Subscription by Id error: ', error);
    })
  }
  updateDueDate(date1) {
    console.log(date1);
    if (this.dueDays) {
      let date = new Date(date1);
      date.setDate(date.getDate() + this.dueDays);
      this.invoiceForm.controls['dueDate'].setValue(date);
    }
  }
  setItemList(userSubscription) {
    this.itemList = [{
      itemDescription: '',
      sacCode: '',
      quantity: 1,
      rate: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.totalAmount : this.userSubscription.userSelectedPlan.totalAmount,   // this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.basePrice : this.userSubscription.userSelectedPlan.basePrice,
      cgstPercent: 9,
      cgstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.cgst : this.userSubscription.userSelectedPlan.cgst,
      sgstPercent: 9,
      sgstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.sgst : this.userSubscription.userSelectedPlan.sgst,
      igstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.igst : this.userSubscription.userSelectedPlan.igst,
      igstPercent: 18,
      amount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.totalAmount : this.userSubscription.userSelectedPlan.totalAmount
    }]

    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      this.invoiceForm.controls['cgstTotal'].setValue(this.userSubscription.promoApplied.cgst);
      this.invoiceForm.controls['sgstTotal'].setValue(this.userSubscription.promoApplied.sgst);
      this.invoiceForm.controls['igstTotal'].setValue(this.userSubscription.promoApplied.igst);
      this.invoiceForm.controls['total'].setValue(this.userSubscription.promoApplied.totalAmount);
      this.invoiceForm.controls['balanceDue'].setValue(this.userSubscription.promoApplied.totalAmount);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      this.invoiceForm.controls['cgstTotal'].setValue(this.userSubscription.smeSelectedPlan.cgst);
      this.invoiceForm.controls['sgstTotal'].setValue(this.userSubscription.smeSelectedPlan.sgst);
      this.invoiceForm.controls['igstTotal'].setValue(this.userSubscription.smeSelectedPlan.igst);
      this.invoiceForm.controls['total'].setValue(this.userSubscription.smeSelectedPlan.totalAmount);
      this.invoiceForm.controls['balanceDue'].setValue(this.userSubscription.smeSelectedPlan.totalAmount);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      this.invoiceForm.controls['cgstTotal'].setValue(this.userSubscription.userSelectedPlan.cgst);
      this.invoiceForm.controls['sgstTotal'].setValue(this.userSubscription.userSelectedPlan.sgst);
      this.invoiceForm.controls['igstTotal'].setValue(this.userSubscription.userSelectedPlan.igst);
      this.invoiceForm.controls['total'].setValue(this.userSubscription.userSelectedPlan.totalAmount);
      this.invoiceForm.controls['balanceDue'].setValue(this.userSubscription.userSelectedPlan.totalAmount);
    }

    // if (this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan))
    //   this.invoiceForm.controls['subTotal'].setValue(this.userSubscription.smeSelectedPlan.basePrice);
    // else
    //   this.invoiceForm.controls['subTotal'].setValue(this.userSubscription.userSelectedPlan.basePrice);

    if (this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      this.invoiceForm.controls['subTotal'].setValue(this.userSubscription.promoApplied.basePrice)
    } else {
      this.invoiceForm.controls['subTotal'].setValue(this.getTaxableValue());
    }

    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      // this.invoiceForm.controls['discountTotal'].setValue(this.invoiceForm.controls['subTotal.value - this.userSubscription.promoApplied.basePrice)
      this.invoiceForm.controls['discountTotal'].setValue(this.getExactPromoDiscount());
    }
  }

  createInvoiceForm(updateInvoice, withinMonth?) {
    return this.fb.group({
      _id: [null],
      userId: [null],
      invoiceDate: [{ value: new Date(), disabled: updateInvoice }, Validators.required],
      terms: ['Due on Receipt', Validators.required],
      dueDate: [{ value: new Date(), disabled: true }, Validators.required],
      // sacCode: ['998232', Validators.required],
      cin: ['U74999MH2017PT298565', Validators.required],
      billTo: ['', [Validators.required, Validators.pattern(AppConstants.charAndNoRegex)]],
      paymentStatus: ['Unpaid'],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      pincode: ['', [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      zipCode: ['', [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      gstin: [{ value: '', disabled: withinMonth }, [Validators.pattern(AppConstants.GSTNRegex)]],
      countryCode: ['91', [Validators.required]],  //Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex),
      phone: ['', [Validators.required]],  //Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex),
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      subTotal: ['', Validators.required], // taxable value (-gst karun)
      cgstTotal: [''], // add as tax values
      sgstTotal: [''],
      igstTotal: [''],
      discountTotal: [''], // direct discount 
      total: ['', Validators.required], // final pricing on invoice pdf & invoice value as well
      balanceDue: ['', Validators.required],
      itemList: ['', Validators.required],
      inovicePreparedBy: '',
      ifaLeadClient: 'Lead',
      estimatedDateTime: [''],
      itrType: [''],
      comment: [''],
      subscriptionId: ['', Validators.required],
      serviceType: [''],
      paymentDate: [null]
    })
  }

  async getUserDetails(userId) {
    this.getInitialData(userId);
    this.userInvoices = await this.getUsersInvoices(userId);
    console.log('userInvoices:', this.userInvoices);
    // if (this.userInvoices.length > 0) {
    //   this.itemList[0].sacCode = this.userInvoices[0].itemList[0].sacCode;
    //   this.sacCode = this.itemList[0].sacCode;
    // }
    // else {
    //   this.itemList[0].sacCode = '';
    //   this.sacCode = this.itemList[0].sacCode;
    // }

    this.userProfile = await this.getUserProfile(userId).catch(error => {
      this.loading = false;
      console.log(error);
      this.utilsService.showSnackBar(error.error.detail);
      if (error.error.status === 404)
        this.router.navigate(['/pages/subscription/sub']);

      return;
    });
    this.loading = false;
    console.log('userProfile:', this.userProfile);
    if (this.utilsService.isNonEmpty(this.userProfile)) {
      this.invoiceForm.controls['userId'].setValue(this.userProfile.userId);
      this.invoiceForm.controls['email'].setValue(this.userProfile.emailAddress);
      this.invoiceForm.controls['phone'].setValue(this.userProfile.mobileNumber);
      this.invoiceForm.controls['billTo'].setValue(this.userProfile.fName + ' ' + this.userProfile.lName);
      if (this.utilsService.isNonEmpty(this.userProfile.address) && this.userProfile.address instanceof Array && this.userProfile.address.length > 0) {
        let addressLine1 = this.userProfile.address[0].flatNo + ', ' + this.userProfile.address[0].premisesName;
        this.invoiceForm.controls['addressLine1'].setValue(addressLine1);
        this.invoiceForm.controls['addressLine2'].setValue(this.userProfile.address[0].area);
        this.invoiceForm.controls['pincode'].setValue(this.userProfile.address[0].pinCode);
        this.invoiceForm.controls['zipCode'].setValue(this.userProfile.address[0].zipCode);
        this.invoiceForm.controls['countryCode'].setValue(this.userProfile.address[0].country);
        this.invoiceForm.controls['country'].setValue(this.userProfile.address[0].country === "91" ? "INDIA" : "");
        this.invoiceForm.controls['city'].setValue(this.userProfile.address[0].city);
        let stateName = this.stateDropdown.filter((item: any) => item.stateCode === this.userProfile.address[0].state)[0].stateName;
        if (this.userProfile.address[0].state === "19") {
          this.isMaharashtraState = true;
        }
        this.invoiceForm.controls['state'].setValue(stateName);
      }
      if (this.utilsService.isNonEmpty(this.userProfile.gstDetails)) {
        this.invoiceForm.controls['gstin'].setValue(this.userProfile.gstDetails['gstinNumber']);
      }

    }
  }

  getInitialData(userId) {
    const param = `/user/initial-data?userId=${userId}`;
    this.userMsService.getMethodInfo(param).subscribe((result: any) => {
      console.log('Initiated data: ', result)
      if (result) {
        this.initialData = result;
      }
    }, error => {
      console.log('There is some issue to fetch initiated data.')
    })
  }

  async getUsersInvoices(userId) {
    const param = `/invoice/${userId}`;
    return await this.itrMsService.getMethod(param).toPromise();
  }

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  changeCountry(country) {
    if (country === 'INDIA') {
      let country = '91';
      const param = '/fnbmaster/statebycountrycode?countryCode=' + country;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        this.stateDropdown = result;
      }, error => {
      });
    } else if (country !== 'INDIA') {
      this.invoiceForm.controls['state'].setValue('Foreign');   //99
      this.stateDropdown = [{ stateName: 'Foreign' }]
    }
  }

  changeCountryCode(countryCode) {
    if (countryCode === '91') {
      this.invoiceForm.controls['pincode'].setValidators(Validators.required);
      this.invoiceForm.controls['pincode'].updateValueAndValidity();

      this.invoiceForm.controls['zipCode'].setValidators(null);
      this.invoiceForm.controls['zipCode'].setValue(null);
      this.invoiceForm.controls['zipCode'].updateValueAndValidity();
    } else {
      this.invoiceForm.controls['pincode'].setValidators(null);
      this.invoiceForm.controls['pincode'].setValue(null);
      this.invoiceForm.controls['pincode'].updateValueAndValidity();

      this.invoiceForm.controls['zipCode'].setValidators(Validators.required);
      this.invoiceForm.controls['zipCode'].updateValueAndValidity();
    }
  }

  getCityData(pinCode) {
    console.log(pinCode)
    if (pinCode.valid) {
      this.changeCountry('INDIA');   //91
      const param = '/pincode/' + pinCode.value;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        this.invoiceForm.controls['country'].setValue('INDIA');   //91
        this.invoiceForm.controls['city'].setValue(result.taluka);
        this.invoiceForm.controls['state'].setValue(result.stateName);  //stateCode
        this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
      }, error => {
        if (error.status === 404) {
          this.invoiceForm.controls['city'].setValue(null);
        }
      });
    }
    console.log('invoiceForm control value: ', this.invoiceForm.value)
  }

  saveInvoice() {
    let smeInfo = JSON.parse(localStorage.getItem('UMD'));
    this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID);
    if (!this.utilsService.isNonEmpty(this.serviceDetail)) {
      return;
    }
    this.itemList[0].itemDescription = this.serviceDetail + ' ' + this.description;
    this.invoiceForm.controls['itemList'].setValue(this.itemList);
    console.log('Invoice Form: ', this.invoiceForm)
    if (this.invoiceForm.valid && this.checkSacCode()) {
      console.log('Invoice Form: ', this.invoiceForm)
      // if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
      //   this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
      //   this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
      //   var filingEstimateObj = {
      //     "userId": this.invoiceForm.controls['userId'].value,
      //     "clientName": this.invoiceForm.controls['billTo'].value,
      //     "clientEmail": this.invoiceForm.controls['email'].value,
      //     "clientMobile": this.invoiceForm.controls['phone'].value,
      //     "smeEmail": smeInfo.USER_EMAIL,
      //     "smeName": smeInfo.USER_F_NAME,
      //     "smeMobile": smeInfo.USER_MOBILE,
      //     "estimatedDateTime": this.invoiceForm.controls['estimatedDateTime'].value,
      //     "itrType": this.invoiceForm.controls['itrType'].value,
      //     "comment": this.invoiceForm.controls['comment'].value,
      //     "isMarkAsDone": false,
      //   }
      // }
      // console.log('filingEstimateObj info -> ', filingEstimateObj)
      this.loading = true;
      const param = '/invoice';
      const request = this.invoiceForm.getRawValue();
      console.log('Invoice values:', request);
      this.itrMsService.postMethod(param, request).subscribe(async (result: any) => {
        this.showInvoiceForm = false;
        console.log("result: ", result);
        this.utilsService.matomoCall('Create Subscription', '/pages/subscription/sub', ['trackEvent', 'Create Invoice', 'Add', this.invoiceForm.controls['phone'].value], environment.matomoScriptId)
        this.utilsService.smoothScrollToTop();
        this.updateAddressInProfile();
        // if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
        //   this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
        //   this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
        //   this.saveFillingEstimate(filingEstimateObj)
        // } else {
        //   this.loading = false;
        // }
        this.loading = false;
        this._toastMessageService.alert("success", "Invoice saved successfully.");
        this.router.navigate(['/pages/subscription/sub']);
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Error while creating invoice, please try again.");
      });

    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  updateAddressInProfile() {
    let address = [];
    const param = `/profile/${this.userProfile.userId}/address`;

    if (this.invoiceForm.controls['addressLine1'].dirty || this.invoiceForm.controls['addressLine2'].dirty ||
      this.invoiceForm.controls['pincode'].dirty || this.invoiceForm.controls['state'].dirty ||
      this.invoiceForm.controls['city'].dirty) {
      if (this.utilsService.isNonEmpty(this.userProfile.address) && this.userProfile.address instanceof Array && this.userProfile.address.length > 0) {
        console.log('this.userProfile.address :', this.userProfile.address);
        address = JSON.parse(JSON.stringify(this.userProfile.address))
        address[0].flatNo = this.invoiceForm.controls['addressLine1'].dirty ? this.invoiceForm.value.addressLine1 : address[0].flatNo;
        address[0].area = this.invoiceForm.controls['addressLine2'].dirty ? this.invoiceForm.value.addressLine2 : address[0].area;
        address[0].pinCode = this.invoiceForm.controls['pincode'].dirty ? this.invoiceForm.value.pincode : address[0].pinCode;
        address[0].state = this.invoiceForm.controls['state'].dirty ? this.stateDropdown.filter((item: any) => item.stateName === this.invoiceForm.value.state)[0].stateCode : address[0].state;
        address[0].city = this.invoiceForm.controls['city'].dirty ? this.invoiceForm.value.city : address[0].city;
        console.log('this.userProfile.address updated:', address)
        console.log('this.invoiceForm', this.invoiceForm);
      } else {
        address.push({
          id: Math.random().toString(36).substring(6),
          flatNo: this.invoiceForm.value.addressLine1,
          premisesName: "",
          road: "",
          area: this.invoiceForm.value.addressLine2,
          city: this.invoiceForm.value.city,
          state: this.stateDropdown.filter((item: any) => item.stateName === this.invoiceForm.value.state)[0].stateCode,
          country: "91",
          pinCode: this.invoiceForm.value.pincode
        })
      }
      console.log('Address updated:', address)
      this.userMsService.putMethod(param, address).toPromise();
    }

  }

  saveFillingEstimate(estimateInfo) {
    console.log('estimateInfo: ', estimateInfo);
    let param = '/sme-task'
    this.itrMsService.postMethod(param, estimateInfo).subscribe(() => {
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  downloadInvoice(invoiceInfo) {
    this.loading = true;
    const param = `/invoice/download?invoiceNo=${invoiceInfo.invoiceNo}`;
    this.itrMsService.invoiceDownload(param).subscribe((result: any) => {
      this.loading = false;
      var fileURL = new Blob([result.blob()], { type: 'application/pdf' })
      window.open(URL.createObjectURL(fileURL))
      this._toastMessageService.alert("success", "Invoice download successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to download Invoice.");
    });
  }

  sendMail(invoiceInfo) {
    this.loading = true;
    const param = `/invoice/send-invoice?invoiceNo=${invoiceInfo.invoiceNo}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice sent on entered email successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send invoice on email.");
    });
  }

  updateInvoice(invoiceInfo) {
    this.showInvoiceForm = true;
    this.invoiceForm = this.createInvoiceForm(false);
    this.invoiceForm.patchValue(invoiceInfo)
    console.log('Grid data for edit', invoiceInfo.itemList);
    this.getCityData(this.invoiceForm.controls['pincode'])
  }

  sendMailNotification(invoiceInfo) {
    this.loading = true;
    const param = '/invoice/send-reminder';
    this.itrMsService.postMethod(param, invoiceInfo).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent response: ', result)
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Mail Reminder.");
    });
  }

  sendWhatAppNotification(invoice) {
    console.log('Whatsapp reminder: ', invoice)
    this.loading = true;
    const param = `/invoice/send-invoice-whatsapp?invoiceNo=${invoice.invoiceNo}`;
    let body = this.invoiceForm.value;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this._toastMessageService.alert("success", "Whatsapp reminder send successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Whatsapp reminder.");
    });

  }

  showTaxRelatedState(state) {
    if (state === 'Maharashtra') {
      this.isMaharashtraState = true;
    } else {
      this.isMaharashtraState = false;
    }
  }

  changeService() {
    const serviceArray = [{ service: 'ITR Filing', details: 'ITR-1 filing (FY 21-22)/ (AY 2022-23)' },
    { service: 'ITR Filing', details: 'ITR-2 filing (FY 21-22)/ (AY 2022-23)' },
    { service: 'ITR Filing', details: 'ITR-3 filing (FY 21-22)/ (AY 2022-22)' },
    { service: 'ITR Filing', details: 'ITR-4 filing (FY 21-22)/ (AY 2022-22)' },
    { service: 'ITR Filing', details: 'ITR-5 filing (FY 21-22)/ (AY 2022-22)' },
    { service: 'ITR Filing', details: 'ITR Filing' },
    { service: 'GST Filing', details: 'GST Registration' },
    { service: 'GST Filing', details: 'GST Annual Subscription' },
    { service: 'GST Filing', details: 'GSTR Annual return' },
    { service: 'GST Filing', details: 'GSTR Filing' },
    { service: 'GST Filing', details: 'GST Notice' },
    { service: 'GST Filing', details: 'Any other services' },
    { service: 'Notice response', details: 'Defective Notice response u/s 139 (9)' },
    { service: 'Notice response', details: 'Notice response and rectification  u/s 143 (1)' },
    { service: 'Notice response', details: 'Notice response u/s 142 (1)' },
    { service: 'Notice response', details: 'Notice response u/s 148' },
    { service: 'Notice response', details: 'Notice e-proceeding response' },
    { service: 'Notice response', details: 'Notice response u/s 143 (3)' },
    { service: 'Notice response', details: 'Notice response to outstanding demand u/s 245' },
    { service: 'Notice response', details: 'Any Other Notice' },
    { service: 'TDS filing', details: 'TDS (26Q ) filing' },
    { service: 'TDS filing', details: 'TDS (24Q ) filing' },
    { service: 'TDS filing', details: 'TDS (27Q ) filing' },
    { service: 'TDS filing', details: 'TDS Notice' },
    { service: 'TDS filing', details: 'Any other services' },
    { service: 'Other Services', details: 'TPA' },
    { service: 'Other Services', details: 'Advance tax' },
    { service: 'Other Services', details: 'ROC filing' },
    { service: 'Other Services', details: 'Tax Audit' },
    { service: 'Other Services', details: 'Statutory Audit' },
    { service: 'Other Services', details: 'Shop Act/Gumasta/Trade License' },
    { service: 'Other Services', details: 'MSME Registration' },
    { service: 'Other Services', details: 'IEC Registration' },
    { service: 'Other Services', details: 'Trademark Registration' },
    { service: 'Other Services', details: 'Food License' },
    { service: 'Other Services', details: 'Digital signature' },
    { service: 'Other Services', details: 'ESIC Registration' },
    { service: 'Other Services', details: 'Udyog Aadhar' },
    { service: 'Other Services', details: 'PT Registration' },
    { service: 'Other Services', details: 'PT filing' },
    { service: 'Other Services', details: 'PF Registration' },
    { service: 'Other Services', details: 'TAN Registration' }];
    this.serviceDetails = serviceArray.filter((item: any) => item.service === this.service);
  }

  getExactPromoDiscount() {
    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      return this.userSubscription.smeSelectedPlan.totalAmount - this.invoiceForm.controls['total'].value;
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      return this.userSubscription.userSelectedPlan.totalAmount - this.invoiceForm.controls['total'].value;
    } else {
      return 'NA'
    }
  }

  getTaxableValue() {
    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      return this.userSubscription.smeSelectedPlan.basePrice;
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      return this.userSubscription.userSelectedPlan.basePrice;
    } else {
      return 'NA'
    }
  }

  getSacCode(planId) {
    const param = `/plans-master/${planId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('Plan detail of plan -> ', res);
      if (this.utilsService.isNonEmpty(res.sacCode)) {
        this.setSacCode(res.sacCode)
      }
    }, error => {
      console.log('Error occurred during getting SacCode by userId -> ', error)
    })
  }

  setSacCode(code) {
    this.itemList[0].sacCode = code;
    this.sacCode = this.itemList[0].sacCode;
    console.log('sacCode: ', this.sacCode)
  }

  checkSacCode() {
    debugger
    if (this.utilsService.isNonEmpty(this.sacCode)) {
      return true;
    }
    else {
      this._toastMessageService.alert("error", "Enter SAC code.");
      return false;
    }
  }

  setFinalAmount(amount) {
    console.info(amount);
    let calGst = amount - ((amount / 118) * 100);
    this.invoiceForm.controls['subTotal'].setValue(Number((amount - calGst).toFixed(2)));
    this.invoiceForm.controls['cgstTotal'].setValue(Number((calGst / 2).toFixed(2)))
    this.invoiceForm.controls['sgstTotal'].setValue(Number((calGst / 2).toFixed(2)))
    this.invoiceForm.controls['igstTotal'].setValue(Number((calGst).toFixed(2)));
    this.invoiceForm.controls['discountTotal'].setValue(Number(this.invoiceDetails.itemList[0].amount - amount));
    this.invoiceForm.controls['balanceDue'].setValue(Number(amount));
    this.invoiceForm.controls['total'].setValue(Number(amount));
  }

  updateAndSendInvoice() {
    let smeInfo = JSON.parse(localStorage.getItem('UMD'));
    this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID);
    if (!this.utilsService.isNonEmpty(this.serviceDetail)) {
      return;
    }
    this.itemList[0].itemDescription = this.serviceDetail + ' ' + this.description;
    this.invoiceForm.controls['itemList'].setValue(this.itemList);

    if (this.invoiceForm.valid && this.checkSacCode()) {
      console.log('Invoice Form: ', this.invoiceForm)
      // if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
      //   this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
      //   this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
      //   var filingEstimateObj = {
      //     "userId": this.invoiceForm.controls['userId'].value,
      //     "clientName": this.invoiceForm.controls['billTo'].value,
      //     "clientEmail": this.invoiceForm.controls['email'].value,
      //     "clientMobile": this.invoiceForm.controls['phone'].value,
      //     "smeEmail": smeInfo.USER_EMAIL,
      //     "smeName": smeInfo.USER_F_NAME,
      //     "smeMobile": smeInfo.USER_MOBILE,
      //     "estimatedDateTime": this.invoiceForm.controls['estimatedDateTime'].value,
      //     "itrType": this.invoiceForm.controls['itrType'].value,
      //     "comment": this.invoiceForm.controls['comment'].value,
      //     "isMarkAsDone": false,
      //   }
      // }
      // console.log('filingEstimateObj info -> ', filingEstimateObj)
      this.loading = true;
      const param = '/invoice';
      // const request = this.invoiceForm.getRawValue();
      Object.assign(this.invoiceDetails, this.invoiceForm.getRawValue());
      console.log('Invoice values:', this.invoiceDetails);
      this.itrMsService.putMethod(param, this.invoiceDetails).subscribe(async (result: any) => {
        this.showInvoiceForm = false;
        console.log("result: ", result);
        // this.utilsService.matomoCall('Create Subscription', '/pages/subscription/sub', ['trackEvent', 'Create Invoice', 'Add', this.invoiceForm.controls['phone'].value], environment.matomoScriptId)
        this.utilsService.smoothScrollToTop();
        // this.updateAddressInProfile();
        // if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
        //   this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
        //   this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
        //   this.saveFillingEstimate(filingEstimateObj)
        // } else {
        //   this.loading = false;
        // }
        this.loading = false;
        this._toastMessageService.alert("success", "Invoice updated successfully.");
        this.router.navigate(['/pages/subscription/sub']);
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Error while creating invoice, please try again.");
      });

    } else {
      $('input.ng-invalid').first().focus();
    }
  }

}
