import { AppConstants } from 'app/shared/constants';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'app/services/utils.service';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'app/services/itr-ms.service';
import { AddDonationDialogComponent } from './add-donation-dialog/add-donation-dialog.component';
import { MatDialog } from '@angular/material';
import { GridOptions, GridApi } from 'ag-grid-community';
declare let $: any;


@Component({
  selector: 'app-investments-deductions',
  templateUrl: './investments-deductions.component.html',
  styleUrls: ['./investments-deductions.component.css']
})
export class InvestmentsDeductionsComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();

  loading: boolean = false;
  investmentDeductionForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  DonationGridOptions: GridOptions;
  public columnDefs;
  public rowData;
  api: GridApi;
  userAge: number = 0;
  ash = {
    "id": "5b62a2cd61f09d4d9837248a",
    "salaryType": [{
      "id": null,
      "donationType": null,
      "value": "BASIC_SALARY",
      "label": "Basic Salary",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "DA",
      "label": "Dearness Allowance",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CONVEYANCE",
      "label": "Conveyance allowance",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "HOUSE_RENT",
      "label": "House rent allowance",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "LTA",
      "label": "Leave Travel Allowances",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CHILDREN_EDUCATION",
      "label": "Children education allowance",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "ENTERTAINMENT",
      "label": "Entertainment Allowance",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CONTRI_80CCD",
      "label": "The contribution u/s 80CCD",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "PENSION",
      "label": "Annuity or Pension",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "COMMUTED_PENSION",
      "label": "Commuted Pension",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "GRATUITY",
      "label": "Gratuity",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "COMMISSION",
      "label": "Fees or Commission",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "ADVANCE_SALARY",
      "label": "Advance of salary",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "LEAVE_ENCASHMENT",
      "label": "Leave Encashment",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "ARREARS_OF_SALARY",
      "label": "Arrears of salary received",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "OTHER",
      "label": "Others",
      "description": "",
      "active": null
    }],
    "allowance": [{
      "id": null,
      "seqNum": 1,
      "value": "HOUSE_RENT",
      "label": "House Rent Allowance u/s 13(A)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 2,
      "value": "LTA",
      "label": "Leave Travel Allowances u/s 10(5)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 3,
      "value": "REMUNERATION_REC",
      "label": "Renumeration received u/s 10(6)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 4,
      "value": "CHILDREN_EDUCATION",
      "label": "Children education allowance",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 5,
      "value": "HOSTEL_EXPENDITURE",
      "label": "Hostel expenditure allowance",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 6,
      "value": "GRATUITY",
      "label": "Gratuity received u/s 10(10)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 7,
      "value": "COMMUTED_PENSION",
      "label": "Pension received u/s 10(10A)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 8,
      "value": "LEAVE_ENCASHMENT",
      "label": "Leave Encashment u/s 10(10AA)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 9,
      "value": "COMPENSATION_ON_VRS",
      "label": "Voluntary Retirement Scheme u/s 10(10C)",
      "detailed": false
    }, {
      "id": null,
      "seqNum": 10,
      "value": "ANY_OTHER",
      "label": "Any Other Allowance",
      "detailed": false
    }],
    "perquisites": [{
      "id": null,
      "donationType": null,
      "value": "RENT_FREE_ACCOMODATION",
      "label": "Rent Free Accomodation",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "MOTOR_CAR",
      "label": "Motor car",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "SERVICES_OF_GARDERNER",
      "label": "Services of Garderner/Personal Attendant/Sweeper/Watchman",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "GAS_ELEC_WATER",
      "label": "Gas, electricity, water",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "INTEREST_FREE_LOANS",
      "label": "Interest free loans and advances",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "HOLIDAY_EXP",
      "label": "Holiday expenses",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CONCESSIONAL_EDUCATONAL_FACILITIES",
      "label": "Free or concessional Travel",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "FREE_MEALS",
      "label": "Free meals",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "FREE_EDU",
      "label": "Free education",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "GIFT_VOUCHERS",
      "label": "Gift, vouchers etc.",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CREDIT_CARD_EXP",
      "label": "Credit card expenses",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "CLUB_EXP",
      "label": "Club expenses",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "IMMOVABLE_ASSET",
      "label": "Use of immovable assets by employees",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "TRANSFER_ASSET",
      "label": "Transfer of asset to employee",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "VAL_OTHER_BENEFIT",
      "label": "Value of any other benefit/amenity/service/previlege",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "STOCK_OPTIONS",
      "label": "Stock options (Not Qualified options)",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "NON_MONETARY_PERQUISITES",
      "label": "Tax paid by the employer on the non-monetary perquisites",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "OTH_BENEFITS_AMENITIES",
      "label": "Other benefits or amenities",
      "description": "",
      "active": null
    }],
    "natureOfBusiness": [{
      "id": null,
      "seqNum": 1,
      "code": "01001",
      "label": "Growing and manufacturing of tea",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 2,
      "code": "01002",
      "label": "Growing and manufacturing of coffee",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 3,
      "code": "01003",
      "label": "Growing and manufacturing of rubber",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 4,
      "code": "01004",
      "label": "Market gardening and horticulture specialties",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 5,
      "code": "01005",
      "label": "Raising of silk worms and production of silk",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 6,
      "code": "01006",
      "label": "Raising of bees and production of honey",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 7,
      "code": "01007",
      "label": "Raising of poultry and production of eggs",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 8,
      "code": "01008",
      "label": "Rearing of sheep and production of wool",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 9,
      "code": "01009",
      "label": "Rearing of animals and production of animal products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 10,
      "code": "01010",
      "label": "Agricultural and animal husbandry services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 11,
      "code": "01011",
      "label": "Soil conservation, soil testing and soil desalination services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 12,
      "code": "01012",
      "label": "Hunting, trapping and game propagation services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 13,
      "code": "01013",
      "label": "Growing of timber, plantation, operation of tree nurseries and conserving of forest",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 14,
      "code": "01014",
      "label": "Gathering of tendu leaves",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 15,
      "code": "01015",
      "label": "Gathering of other wild growing materials",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 16,
      "code": "01016",
      "label": "Forestry service activities, timber cruising, afforestation and reforestation",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 17,
      "code": "01017",
      "label": "Logging service activities, transport of logs within the forest",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 18,
      "code": "01018",
      "label": "Other agriculture, animal husbandry or forestry activity n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 19,
      "code": "02001",
      "label": "Fishing on commercial basis in inland waters",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 20,
      "code": "02002",
      "label": "Fishing on commercial basis in ocean and coastal areas",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 21,
      "code": "02003",
      "label": "Fish farming",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 22,
      "code": "02004",
      "label": "Gathering of marine materials such as natural pearls, sponges, coral etc.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 23,
      "code": "02005",
      "label": "Services related to marine and fresh water fisheries, fish hatcheries and fish farms",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 24,
      "code": "02006",
      "label": "Other Fish farming activity n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 25,
      "code": "03001",
      "label": "Mining and agglomeration of hard coal",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 26,
      "code": "03002",
      "label": "Mining and agglomeration of lignite",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 27,
      "code": "03003",
      "label": "Extraction and agglomeration of peat",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 28,
      "code": "03004",
      "label": "Extraction of crude petroleum and natural gas",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 29,
      "code": "03005",
      "label": "Service activities incidental to oil and gas extraction excluding surveying",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 30,
      "code": "03006",
      "label": "Mining of uranium and thorium ores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 31,
      "code": "03007",
      "label": "Mining of iron ores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 32,
      "code": "03008",
      "label": "Mining of non-ferrous metal ores, except uranium and thorium ores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 33,
      "code": "03009",
      "label": "Mining of gemstones",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 34,
      "code": "03010",
      "label": "Mining of chemical and fertilizer minerals",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 35,
      "code": "03011",
      "label": "Mining of quarrying of abrasive materials",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 36,
      "code": "03012",
      "label": "Mining of mica, graphite and asbestos",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 37,
      "code": "03013",
      "label": "Quarrying of stones (marble/granite/dolomite), sand and clay",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 38,
      "code": "03014",
      "label": "Other mining and quarrying",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 39,
      "code": "03015",
      "label": "Mining and production of salt",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 40,
      "code": "03016",
      "label": "Other mining and quarrying n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 41,
      "code": "04001",
      "label": "Production, processing and preservation of meat and meat products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 42,
      "code": "04002",
      "label": "Production, processing and preservation of fish and fish products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 43,
      "code": "04003",
      "label": "Manufacture of vegetable oil, animal oil and fats",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 44,
      "code": "04004",
      "label": "Processing of fruits, vegetables and edible nuts",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 45,
      "code": "04005",
      "label": "Manufacture of dairy products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 46,
      "code": "04006",
      "label": "Manufacture of sugar",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 47,
      "code": "04007",
      "label": "Manufacture of cocoa, chocolates and sugar confectionery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 48,
      "code": "04008",
      "label": "Flour milling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 49,
      "code": "04009",
      "label": "Rice milling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 50,
      "code": "04010",
      "label": "Dal milling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 51,
      "code": "04011",
      "label": "Manufacture of other grain mill products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 52,
      "code": "04012",
      "label": "Manufacture of bakery products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 53,
      "code": "04013",
      "label": "Manufacture of starch products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 54,
      "code": "04014",
      "label": "Manufacture of animal feeds",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 55,
      "code": "04015",
      "label": "Manufacture of other food products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 56,
      "code": "04016",
      "label": "Manufacturing of wines",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 57,
      "code": "04017",
      "label": "Manufacture of beer",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 58,
      "code": "04018",
      "label": "Manufacture of malt liquors",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 59,
      "code": "04019",
      "label": "Distilling and blending of spirits, production of ethyl alcohol",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 60,
      "code": "04020",
      "label": "Manufacture of mineral water",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 61,
      "code": "04021",
      "label": "Manufacture of soft drinks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 62,
      "code": "04022",
      "label": "Manufacture of other non-alcoholic beverages",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 63,
      "code": "04023",
      "label": "Manufacture of tobacco products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 64,
      "code": "04024",
      "label": "Manufacture of textiles (other than by handloom)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 65,
      "code": "04025",
      "label": "Manufacture of textiles using handlooms (khadi)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 66,
      "code": "04026",
      "label": "Manufacture of carpet, rugs, blankets, shawls etc. (other than by hand)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 67,
      "code": "04027",
      "label": "Manufacture of carpet, rugs, blankets, shawls etc. by hand",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 68,
      "code": "04028",
      "label": "Manufacture of wearing apparel",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 69,
      "code": "04029",
      "label": "Tanning and dressing of leather",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 70,
      "code": "04030",
      "label": "Manufacture of luggage, handbags and the like saddler and harness",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 71,
      "code": "04031",
      "label": "Manufacture of footwear",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 72,
      "code": "04032",
      "label": "Manufacture of wood and wood products, cork, straw and plaiting material",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 73,
      "code": "04033",
      "label": "Manufacture of paper and paper products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 74,
      "code": "04034",
      "label": "Publishing, printing and reproduction of recorded media",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 75,
      "code": "04035",
      "label": "Manufacture of coke oven products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 76,
      "code": "04036",
      "label": "Manufacture of refined petroleum products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 77,
      "code": "04037",
      "label": "Processing of nuclear fuel",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 78,
      "code": "04038",
      "label": "Manufacture of fertilizers and nitrogen compounds",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 79,
      "code": "04039",
      "label": "Manufacture of plastics in primary forms and of synthetic rubber",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 80,
      "code": "04040",
      "label": "Manufacture of paints, varnishes and similar coatings",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 81,
      "code": "04041",
      "label": "Manufacture of pharmaceuticals, medicinal chemicals and botanical products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 82,
      "code": "04042",
      "label": "Manufacture of soap and detergents",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 83,
      "code": "04043",
      "label": "Manufacture of other chemical products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 84,
      "code": "04044",
      "label": "Manufacture of man-made fibers",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 85,
      "code": "04045",
      "label": "Manufacture of rubber products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 86,
      "code": "04046",
      "label": "Manufacture of plastic products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 87,
      "code": "04047",
      "label": "Manufacture of glass and glass products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 88,
      "code": "04048",
      "label": "Manufacture of cement, lime and plaster",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 89,
      "code": "04049",
      "label": "Manufacture of articles of concrete, cement and plaster",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 90,
      "code": "04050",
      "label": "Manufacture of Bricks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 91,
      "code": "04051",
      "label": "Manufacture of other clay and ceramic products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 92,
      "code": "04052",
      "label": "Manufacture of other non-metallic mineral products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 93,
      "code": "04053",
      "label": "Manufacture of pig iron, sponge iron, Direct Reduced Iron etc.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 94,
      "code": "04054",
      "label": "Manufacture of Ferro alloys",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 95,
      "code": "04055",
      "label": "Manufacture of Ingots, billets, blooms and slabs etc.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 96,
      "code": "04056",
      "label": "Manufacture of steel products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 97,
      "code": "04057",
      "label": "Manufacture of basic precious and non-ferrous metals",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 98,
      "code": "04058",
      "label": "Manufacture of non-metallic mineral products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 99,
      "code": "04059",
      "label": "Casting of metals",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 100,
      "code": "04060",
      "label": "Manufacture of fabricated metal products",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 101,
      "code": "04061",
      "label": "Manufacture of engines and turbines",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 102,
      "code": "04062",
      "label": "Manufacture of pumps and compressors",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 103,
      "code": "04063",
      "label": "Manufacture of bearings and gears",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 104,
      "code": "04064",
      "label": "Manufacture of ovens and furnaces",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 105,
      "code": "04065",
      "label": "Manufacture of lifting and handling equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 106,
      "code": "04066",
      "label": "Manufacture of other general purpose machinery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 107,
      "code": "04067",
      "label": "Manufacture of agricultural and forestry machinery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 108,
      "code": "04068",
      "label": "Manufacture of Machine Tools",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 109,
      "code": "04069",
      "label": "Manufacture of machinery for metallurgy",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 110,
      "code": "04070",
      "label": "Manufacture of machinery for mining, quarrying and constructions",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 111,
      "code": "04071",
      "label": "Manufacture of machinery for processing of food and  beverages",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 112,
      "code": "04072",
      "label": "Manufacture of machinery for leather and textile",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 113,
      "code": "04073",
      "label": "Manufacture of weapons and ammunition",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 114,
      "code": "04074",
      "label": "Manufacture of other special purpose machinery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 115,
      "code": "04075",
      "label": "Manufacture of domestic appliances",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 116,
      "code": "04076",
      "label": "Manufacture of office, accounting and computing machinery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 117,
      "code": "04077",
      "label": "Manufacture of electrical machinery and apparatus",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 118,
      "code": "04078",
      "label": "Manufacture of Radio, Television, communication equipment and apparatus",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 119,
      "code": "04079",
      "label": "Manufacture of medical and surgical equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 120,
      "code": "04080",
      "label": "Manufacture of industrial process control equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 121,
      "code": "04081",
      "label": "Manufacture of instruments and appliances for measurements and navigation",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 122,
      "code": "04082",
      "label": "Manufacture of optical instruments",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 123,
      "code": "04083",
      "label": "Manufacture of watches and clocks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 124,
      "code": "04084",
      "label": "Manufacture of motor vehicles",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 125,
      "code": "04085",
      "label": "Manufacture of body of motor vehicles",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 126,
      "code": "04086",
      "label": "Manufacture of parts and accessories of motor vehicles and  engines",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 127,
      "code": "04087",
      "label": "Building and repair of ships and boats",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 128,
      "code": "04088",
      "label": "Manufacture of railway locomotive and rolling stocks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 129,
      "code": "04089",
      "label": "Manufacture of aircraft and spacecraft",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 130,
      "code": "04090",
      "label": "Manufacture of bicycles",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 131,
      "code": "04091",
      "label": "Manufacture of other transport equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 132,
      "code": "04092",
      "label": "Manufacture of furniture",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 133,
      "code": "04093",
      "label": "Manufacture of jewellery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 134,
      "code": "04094",
      "label": "Manufacture of sports goods",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 135,
      "code": "04095",
      "label": "Manufacture of musical instruments",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 136,
      "code": "04096",
      "label": "Manufacture of games and toys",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 137,
      "code": "04097",
      "label": "Other manufacturing n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 138,
      "code": "04098",
      "label": "Recycling of metal waste and scrap",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 139,
      "code": "04099",
      "label": "Recycling of non- metal waste and scrap",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 140,
      "code": "05001",
      "label": "Production, collection and distribution of electricity",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 141,
      "code": "05002",
      "label": "Manufacture and distribution of gas",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 142,
      "code": "05003",
      "label": "Collection, purification and distribution of water",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 143,
      "code": "05004",
      "label": "Other essential commodity service  n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 144,
      "code": "06001",
      "label": "Site preparation works",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 145,
      "code": "06002",
      "label": "Building of complete constructions or parts- civil contractors",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 146,
      "code": "06003",
      "label": "Building installation",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 147,
      "code": "06004",
      "label": "Building completion",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 148,
      "code": "06005",
      "label": "Construction and maintenance of roads, rails, bridges, tunnels, ports, harbour, runways etc.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 149,
      "code": "06006",
      "label": "Construction and maintenance of power plants",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 150,
      "code": "06007",
      "label": "Construction  and maintenance of industrial plants",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 151,
      "code": "06008",
      "label": "Construction  and maintenance of power transmission and telecommunication lines",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 152,
      "code": "06009",
      "label": "Construction of water ways and water reservoirs",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 153,
      "code": "06010",
      "label": "Other construction activity n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 154,
      "code": "07001",
      "label": "Purchase, sale and letting of leased buildings  (residential and non-residential)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 155,
      "code": "07002",
      "label": "Operating of real estate of self-owned buildings (residential and non-residential)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 156,
      "code": "07003",
      "label": "Developing and sub-dividing real estate into lots",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 157,
      "code": "07004",
      "label": "Real estate activities on a fee or contract basis",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 158,
      "code": "07005",
      "label": "Other real estate/renting services n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 159,
      "code": "08001",
      "label": "Renting of land transport equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 160,
      "code": "08002",
      "label": "Renting of water transport equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 161,
      "code": "08003",
      "label": "Renting of air transport equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 162,
      "code": "08004",
      "label": "Renting of agricultural machinery and equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 163,
      "code": "08005",
      "label": "Renting of construction and civil engineering machinery",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 164,
      "code": "08006",
      "label": "Renting of office machinery and equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 165,
      "code": "08007",
      "label": "Renting of other machinery and equipment n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 166,
      "code": "08008",
      "label": "Renting of personal and household goods n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 167,
      "code": "08009",
      "label": "Renting of other machinery n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 168,
      "code": "09001",
      "label": "Wholesale and retail sale of motor vehicles",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 169,
      "code": "09002",
      "label": "Repair and maintenance of motor vehicles",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 170,
      "code": "09003",
      "label": "Sale of motor parts and accessories- wholesale and retail",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 171,
      "code": "09004",
      "label": "Retail sale of automotive fuel",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 172,
      "code": "09006",
      "label": "Wholesale of agricultural raw material",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 173,
      "code": "09007",
      "label": "Wholesale of food and beverages and tobacco",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 174,
      "code": "09008",
      "label": "Wholesale of household goods",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 175,
      "code": "09009",
      "label": "Wholesale of metals and metal ores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 176,
      "code": "09010",
      "label": "Wholesale of household goods",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 177,
      "code": "09011",
      "label": "Wholesale of construction material",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 178,
      "code": "09012",
      "label": "Wholesale of hardware and sanitary fittings",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 179,
      "code": "09013",
      "label": "Wholesale of cotton and jute",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 180,
      "code": "09014",
      "label": "Wholesale of raw wool and raw silk",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 181,
      "code": "09015",
      "label": "Wholesale of other textile fibres",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 182,
      "code": "09016",
      "label": "Wholesale of industrial chemicals",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 183,
      "code": "09017",
      "label": "Wholesale of fertilizers and pesticides",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 184,
      "code": "09018",
      "label": "Wholesale of electronic parts and equipment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 185,
      "code": "09019",
      "label": "Wholesale of other machinery, equipment and supplies",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 186,
      "code": "09020",
      "label": "Wholesale of waste, scrap and materials for re-cycling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 187,
      "code": "09021",
      "label": "Retail sale of food, beverages and tobacco in specialized stores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 188,
      "code": "09022",
      "label": "Retail sale of other goods in specialized stores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 189,
      "code": "09023",
      "label": "Retail sale in non-specialized stores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 190,
      "code": "09024",
      "label": "Retail sale of textiles, apparel, footwear, leather goods",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 191,
      "code": "09025",
      "label": "Retail sale of other household appliances",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 192,
      "code": "09026",
      "label": "Retail sale of hardware, paint and glass",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 193,
      "code": "09027",
      "label": "Wholesale of other products n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 194,
      "code": "09028",
      "label": "Retail sale of other products n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 195,
      "code": "10001",
      "label": "Hotels – Star rated",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 196,
      "code": "10002",
      "label": "Hotels – Non-star rated",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 197,
      "code": "10003",
      "label": "Motels, Inns and Dharmshalas",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 198,
      "code": "10004",
      "label": "Guest houses and circuit houses",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 199,
      "code": "10005",
      "label": "Dormitories and hostels at educational institutions",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 200,
      "code": "10006",
      "label": "Short stay accommodations n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 201,
      "code": "10007",
      "label": "Restaurants – with bars",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 202,
      "code": "10008",
      "label": "Restaurants – without bars",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 203,
      "code": "10009",
      "label": "Canteens",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 204,
      "code": "10010",
      "label": "Independent caterers",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 205,
      "code": "10011",
      "label": "Casinos and other games of chance",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 206,
      "code": "10012",
      "label": "Other hospitality services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 207,
      "code": "11001",
      "label": "Travel agencies and tour operators",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 208,
      "code": "11002",
      "label": "Packers and movers",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 209,
      "code": "11003",
      "label": "Passenger land transport",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 210,
      "code": "11004",
      "label": "Air transport",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 211,
      "code": "11005",
      "label": "Transport by urban/sub-urban railways",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 212,
      "code": "11006",
      "label": "Inland water transport",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 213,
      "code": "11007",
      "label": "Sea and coastal water transport",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 214,
      "code": "11008",
      "label": "Freight transport by road",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 215,
      "code": "11009",
      "label": "Freight transport by railways",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 216,
      "code": "11010",
      "label": "Forwarding of freight",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 217,
      "code": "11011",
      "label": "Receiving and acceptance of freight",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 218,
      "code": "11012",
      "label": "Cargo handling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 219,
      "code": "11013",
      "label": "Storage and warehousing",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 220,
      "code": "11014",
      "label": "Transport via pipelines (transport of gases, liquids, slurry and other commodities)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 221,
      "code": "11015",
      "label": "Other Transport and Logistics services n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 222,
      "code": "12001",
      "label": "Post and courier activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 223,
      "code": "12002",
      "label": "Basic telecom services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 224,
      "code": "12003",
      "label": "Value added telecom services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 225,
      "code": "12004",
      "label": "Maintenance of telecom network",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 226,
      "code": "12005",
      "label": "Activities of the cable operators",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 227,
      "code": "12006",
      "label": "Other Post and Telecommunication services n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 228,
      "code": "13001",
      "label": "Commercial banks, saving banks and discount houses",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 229,
      "code": "13002",
      "label": "Specialised institutions granting credit",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 230,
      "code": "13003",
      "label": "Financial leasing",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 231,
      "code": "13004",
      "label": "Hire-purchase financing",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 232,
      "code": "13005",
      "label": "Housing finance activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 233,
      "code": "13006",
      "label": "Commercial loan activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 234,
      "code": "13007",
      "label": "Credit cards",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 235,
      "code": "13008",
      "label": "Mutual funds",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 236,
      "code": "13009",
      "label": "Chit fund",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 237,
      "code": "13010",
      "label": "Investment activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 238,
      "code": "13011",
      "label": "Life insurance",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 239,
      "code": "13012",
      "label": "Pension funding",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 240,
      "code": "13013",
      "label": "Non-life insurance",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 241,
      "code": "13014",
      "label": "Administration of financial markets",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 242,
      "code": "13015",
      "label": "Stock brokers, sub-brokers and related activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 243,
      "code": "13016",
      "label": "Financial advisers, mortgage advisers and brokers",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 244,
      "code": "13017",
      "label": "Foreign exchange services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 245,
      "code": "13018",
      "label": "Other financial intermediation services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 246,
      "code": "14007",
      "label": "Cyber café",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 247,
      "code": "14009",
      "label": "Computer training and educational institutes",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 248,
      "code": "14010",
      "label": "Other computation related services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 249,
      "code": "15001",
      "label": "Natural sciences and engineering",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 250,
      "code": "15002",
      "label": "Social sciences and humanities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 251,
      "code": "15003",
      "label": "Other Research and Development activities n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 252,
      "code": "16006",
      "label": "Advertising",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 253,
      "code": "16010",
      "label": "Auctioneers",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 254,
      "code": "16012",
      "label": "Market research and public opinion polling",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 255,
      "code": "16014",
      "label": "Labour recruitment and provision of personnel",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 256,
      "code": "16015",
      "label": "Investigation and security services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 257,
      "code": "16016",
      "label": "Building-cleaning and industrial cleaning activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 258,
      "code": "16017",
      "label": "Packaging activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 259,
      "code": "16019",
      "label": "Other professional services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 260,
      "code": "17001",
      "label": "Primary education",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 261,
      "code": "17002",
      "label": "Secondary/ senior secondary education",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 262,
      "code": "17003",
      "label": "Technical and vocational secondary/ senior secondary education",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 263,
      "code": "17004",
      "label": "Higher education",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 264,
      "code": "17005",
      "label": "Education by correspondence",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 265,
      "code": "17006",
      "label": "Coaching centres and tuitions",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 266,
      "code": "17007",
      "label": "Other education services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 267,
      "code": "18006",
      "label": "Independent blood banks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 268,
      "code": "18007",
      "label": "Medical transcription",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 269,
      "code": "18008",
      "label": "Independent ambulance services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 270,
      "code": "18009",
      "label": "Medical suppliers, agencies and stores",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 271,
      "code": "19001",
      "label": "Social work activities with accommodation (orphanages and old age homes)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 272,
      "code": "19002",
      "label": "Social work activities without accommodation (Creches)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 273,
      "code": "19003",
      "label": "Industry associations, chambers of commerce",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 274,
      "code": "19004",
      "label": "Professional organisations",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 275,
      "code": "19005",
      "label": "Trade unions",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 276,
      "code": "19006",
      "label": "Religious organizations",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 277,
      "code": "19007",
      "label": "Political organisations",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 278,
      "code": "19008",
      "label": "Other membership organisations n.e.c. (rotary clubs, book clubs and philatelic clubs)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 279,
      "code": "19009",
      "label": "Other Social or community service n.e.c",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 280,
      "code": "20001",
      "label": "Motion picture production",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 281,
      "code": "20002",
      "label": "Film distribution",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 282,
      "code": "20003",
      "label": "Film laboratories",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 283,
      "code": "20004",
      "label": "Television channel productions",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 284,
      "code": "20005",
      "label": "Television channels broadcast",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 285,
      "code": "20006",
      "label": "Video production and distribution",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 286,
      "code": "20007",
      "label": "Sound recording studios",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 287,
      "code": "20008",
      "label": "Radio - recording and distribution",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 288,
      "code": "20009",
      "label": "Stage production and related activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 289,
      "code": "20013",
      "label": "Circuses and race tracks",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 290,
      "code": "20014",
      "label": "Video Parlours",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 291,
      "code": "20015",
      "label": "News agency activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 292,
      "code": "20016",
      "label": "Library and archives activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 293,
      "code": "20017",
      "label": "Museum activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 294,
      "code": "20018",
      "label": "Preservation of historical sites and buildings",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 295,
      "code": "20019",
      "label": "Botanical and zoological gardens",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 296,
      "code": "20020",
      "label": "Operation and maintenance of sports facilities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 297,
      "code": "20021",
      "label": "Activities of sports and game schools",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 298,
      "code": "20022",
      "label": "Organisation and operation of indoor/outdoor sports and promotion and production of sporting events",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 299,
      "code": "20023",
      "label": "Other sporting activities n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 300,
      "code": "20024",
      "label": "Other recreational activities n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 301,
      "code": "21001",
      "label": "Hair dressing and other beauty treatment",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 302,
      "code": "21002",
      "label": "Funeral and related activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 303,
      "code": "21003",
      "label": "Marriage bureaus",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 304,
      "code": "21004",
      "label": "Pet care services",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 305,
      "code": "21005",
      "label": "Sauna and steam baths, massage salons etc.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 306,
      "code": "21006",
      "label": "Astrological and spiritualists’ activities",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 307,
      "code": "21007",
      "label": "Private households as employers of domestic staff",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 308,
      "code": "21008",
      "label": "Other services n.e.c.",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 309,
      "code": "22001",
      "label": "Extra territorial organisations and bodies (IMF, World Bank,European Commission etc.)",
      "type": "BUSINESS",
      "section": "44AD"
    }, {
      "id": null,
      "seqNum": 310,
      "code": "14001",
      "label": "Software development",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 311,
      "code": "14002",
      "label": "Other software consultancy",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 312,
      "code": "14003",
      "label": "Data processing",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 313,
      "code": "14004",
      "label": "Database activities and distribution of electronic content",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 314,
      "code": "14005",
      "label": "Other IT enabled services",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 315,
      "code": "14006",
      "label": "BPO services",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 316,
      "code": "14008",
      "label": "Maintenance and repair of office, accounting and computing machinery",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 317,
      "code": "16001",
      "label": "Legal profession",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 318,
      "code": "16002",
      "label": "Accounting, book-keeping and auditing profession",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 319,
      "code": "16003",
      "label": "Tax consultancy",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 320,
      "code": "16004",
      "label": "Architectural profession",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 321,
      "code": "16005",
      "label": "Engineering and technical consultancy",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 322,
      "code": "16007",
      "label": "Fashion designing",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 323,
      "code": "16008",
      "label": "Interior decoration",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 324,
      "code": "16009",
      "label": "Photography",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 325,
      "code": "16013",
      "label": "Business and management consultancy activities",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 326,
      "code": "16018",
      "label": "Secretarial activities",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 327,
      "code": "18001",
      "label": "General  hospitals",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 328,
      "code": "18002",
      "label": "Speciality and super speciality hospitals",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 329,
      "code": "18003",
      "label": "Nursing homes",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 330,
      "code": "18004",
      "label": "Diagnostic centres",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 331,
      "code": "18005",
      "label": "Pathological laboratories",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 332,
      "code": "18010",
      "label": "Medical clinics",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 333,
      "code": "18011",
      "label": "Dental practice",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 334,
      "code": "18012",
      "label": "Ayurveda practice",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 335,
      "code": "18013",
      "label": "Unani practice",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 336,
      "code": "18014",
      "label": "Homeopathy practice",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 337,
      "code": "18015",
      "label": "Nurses, physiotherapists or other para-medical practitioners",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 338,
      "code": "18016",
      "label": "Veterinary hospitals and practice",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 339,
      "code": "18017",
      "label": "Other healthcare services",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 340,
      "code": "20010",
      "label": "Individual artists excluding authors",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 341,
      "code": "20011",
      "label": "Literary activities",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 342,
      "code": "20012",
      "label": "Other cultural activities n.e.c.",
      "type": "PROFESSION",
      "section": "44ADA"
    }, {
      "id": null,
      "seqNum": 343,
      "code": "08001",
      "label": "Renting of land transport equipment",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 344,
      "code": "11002",
      "label": "Packers and movers",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 345,
      "code": "11008",
      "label": "Freight transport by road",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 346,
      "code": "11010",
      "label": "Forwarding of freight",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 347,
      "code": "11011",
      "label": "Receiving and acceptance of freight",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 348,
      "code": "11012",
      "label": "Cargo handling",
      "type": "TRANSPORT",
      "section": "44AE"
    }, {
      "id": null,
      "seqNum": 349,
      "code": "11015",
      "label": "Other Transport and Logistics services n.e.c",
      "type": "TRANSPORT",
      "section": "44AE"
    }],
    "investment": [{
      "id": null,
      "seqNum": 1,
      "value": "LIC",
      "label": "Life insurance premium",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 2,
      "value": "PPF_CONTRIBUTION",
      "label": "Contribution to PPF/SPF/RP/EPF",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 3,
      "value": "SA_FUND",
      "label": "Contribution to approved superannuation fund",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 5,
      "value": "TERM_DEPOSIT",
      "label": "Term deposit for fixed period of not less than 5 years with a scheduled ban",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 6,
      "value": "PO_TIME_DEPOSITS",
      "label": "Five year post office time deposit(FD)",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 7,
      "value": "SCSS",
      "label": "Senior Citizen's Savings Scheme Account,etc.",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 8,
      "value": "SSS",
      "label": "SSS",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 9,
      "value": "ELSS",
      "label": "ELSS",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 10,
      "value": "NSC",
      "label": "National Saving Certificate",
      "section": "80C",
      "eligibility": "Individual/HUF"
    }, {
      "id": null,
      "seqNum": 11,
      "value": "PENSION_FUND",
      "label": "Contribution to certain pension funds(Pension Fund setup by LIC/other Insurer)",
      "section": "80CCC",
      "eligibility": "Individual"
    }, {
      "id": null,
      "seqNum": 12,
      "value": "PENSION_SCHEME",
      "label": "Contribution to Pension Scheme od Central Govt.(NPS/Atal Pension Scheme)",
      "section": "80CCCD(1B)",
      "eligibility": "Individual"
    }, {
      "id": null,
      "seqNum": 13,
      "value": "PS_EMPLOYEE",
      "label": "Employees Cont. Pension Scheme",
      "section": "80CCCD(1)",
      "eligibility": "Individual"
    }, {
      "id": null,
      "seqNum": 14,
      "value": "PS_EMPLOYER",
      "label": "Employers Cont. Pension Scheme(This is over and above 150000",
      "section": "80CCCD(2)",
      "eligibility": "Individual"
    }],
    "donationTo": [{
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
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "SCIENTIFIC_RESEARCH",
      "label": "For Scientific Research",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "SOCIAL_SCIENCE_OR_STATISTICAL_RESEARCH",
      "label": "For Social science or Statistical Research",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "RURAL_DEVELOPMENT",
      "label": "For Rural Development",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "PSU_OR_LOCAL_AUTHORITY_FOR_CARRYING_OUT_ANY_ELIGIBLE_PROJECT",
      "label": "To PSU or Local Authority for carrying out any eligible project",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "CONSERVATION_OF_NATURAL_RESOURCES_OR_FOR_AFFORESTATION",
      "label": "Conservation of Natural Resources or for afforestation",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "AFFORESTATION_TO_CG_NOTIFIED_FUNDS",
      "label": "For Afforestation (to CG notified funds)",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "RURAL_DEVELOPMENT_TO_CG_NOTIFIED_FUNDS",
      "label": "For Rural Development (to CG notified funds)",
      "description": "NA",
      "active": true
    }, {
      "id": null,
      "donationType": "SCIENTIFIC",
      "value": "NATIONAL_URBAN_POVERTY_ERADICATION_FUND",
      "label": "To National Urban Poverty Eradication Fund",
      "description": "NA",
      "active": true
    }],
    "disabilityPercent": [{
      "id": null,
      "donationType": null,
      "value": "BELOW_40",
      "label": "Below 40%",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "40_TO_79",
      "label": "40%-79%",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "80_MORE",
      "label": "80% & more",
      "description": null,
      "active": null
    }],
    "dependent": [{
      "id": null,
      "donationType": null,
      "value": "Spouse",
      "label": "Spouse",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "Child",
      "label": "Child",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "Parents",
      "label": "Parents",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "Brother",
      "label": "Brother",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "Sister",
      "label": "Sister",
      "description": null,
      "active": null
    }],
    "profitsInLieuOfSalaryType": [{
      "id": null,
      "donationType": null,
      "value": "COMPENSATION_ON_VRS",
      "label": "Compensation on Voluntary Retirement Scheme",
      "description": "",
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "ANY_OTHER",
      "label": "Any other",
      "description": "",
      "active": null
    }],
    "planType": [{
      "id": null,
      "donationType": null,
      "value": "TAXQUERY",
      "label": "TaxQuery",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "ITR",
      "label": "ITR",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "TPA",
      "label": "TPA",
      "description": null,
      "active": null
    }, {
      "id": null,
      "donationType": null,
      "value": "COMBO",
      "label": "Combo",
      "description": null,
      "active": null
    }]
  }
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
    "stateCode": "CG",
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
    const self = this.ITR_JSON.family.filter(item => item.relationShipCode === 'SELF')
    if (self instanceof Array && self.length > 0) {
      this.userAge = self[0].age
    }
  }

  ngOnInit() {
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
    });
    this.setInvestmentsDeductionsValues();
    this.donationCallInConstructor(this.otherDonationToDropdown, this.stateDropdown);

    // this.DonationGridOptions.api.setRowData(this.createRowData('OTHER'));
    // this.DonationGridOptions.api.setColumnDefs(this.donationCreateColoumnDef(this.otherDonationToDropdown, this.stateDropdown));
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
    this.max5000Limit('SELF')
    if (this.investmentDeductionForm.valid) {
      Object.keys(this.investmentDeductionForm.controls).forEach(item => {
        if (item === 'ELSS' || item === 'PENSION_FUND' || item === 'PS_EMPLOYEE' ||
          item === 'PS_EMPLOYER' || item === 'PENSION_SCHEME') {
          this.addAndUpdateInvestment(item);
        } else {
          if (item === 'us80e') {
            this.ITR_JSON.loans = this.ITR_JSON.loans.filter(item => item.loanType !== 'EDUCATION')
            this.ITR_JSON.loans.push({
              loanType: 'EDUCATION',
              name: null,
              interestPaidPerAnum: Number(this.investmentDeductionForm.controls['us80e'].value),
              principalPaidPerAnum: 0.00,
              loanAmount: null,
              details: null
            });
          } else if (item === 'us80gg') {
            this.ITR_JSON.expenses = this.ITR_JSON.expenses.filter(item => item.expenseType !== 'HOUSE_RENT_PAID')
            this.ITR_JSON.expenses.push({
              expenseType: 'HOUSE_RENT_PAID',
              expenseFor: null,
              details: null,
              amount: Number(this.investmentDeductionForm.controls['us80gg'].value),
              noOfMonths: 0
            });
          }
        }
      });
      this.ITR_JSON.insurances = this.ITR_JSON.insurances.filter(item => item.policyFor !== "DEPENDANT");
      if (this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfPremium'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['selfMedicalExpenditure'].value)) {
        this.ITR_JSON.insurances.push({
          insuranceType: 'HEALTH',
          typeOfPolicy: null,
          policyFor: 'DEPENDANT',
          premium: Number(this.investmentDeductionForm.controls['selfPremium'].value),
          medicalExpenditure: this.userAge > 60 ? Number(this.investmentDeductionForm.controls['selfMedicalExpenditure'].value) : 0,
          preventiveCheckUp: Number(this.investmentDeductionForm.controls['selfPreventiveCheckUp'].value),
          sumAssured: null,
          healthCover: null
        });
      }
      this.ITR_JSON.insurances = this.ITR_JSON.insurances.filter(item => item.policyFor !== "PARENTS");
      if (this.utilsService.isNonZero(this.investmentDeductionForm.controls['premium'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['preventiveCheckUp'].value)
        || this.utilsService.isNonZero(this.investmentDeductionForm.controls['medicalExpenditure'].value)) {
        this.ITR_JSON.insurances.push({
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
      this.serviceCall('NEXT', this.ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  setInvestmentsDeductionsValues() {
    this.ITR_JSON.investments.forEach(investment => {
      if (investment.investmentType === 'ELSS' || investment.investmentType === 'PENSION_FUND' || investment.investmentType === 'PS_EMPLOYEE' ||
        investment.investmentType === 'PS_EMPLOYER' || investment.investmentType === 'PENSION_SCHEME')
        this.investmentDeductionForm.controls[investment.investmentType].setValue(investment.amount);
    });

    for (let i = 0; i < this.ITR_JSON.loans.length; i++) {
      switch (this.ITR_JSON.loans[i].loanType) {
        case 'EDUCATION': {
          this.investmentDeductionForm.controls['us80e'].setValue(this.ITR_JSON.loans[i].interestPaidPerAnum);
        }
      }
    }

    for (let j = 0; j < this.ITR_JSON.expenses.length; j++) {
      switch (this.ITR_JSON.expenses[j].expenseType) {
        case 'HOUSE_RENT_PAID': {
          this.investmentDeductionForm.controls['us80gg'].setValue(this.ITR_JSON.expenses[j].amount);
          break;
        }
      }
    }
    for (let i = 0; i < this.ITR_JSON.insurances.length; i++) {
      if (this.ITR_JSON.insurances[i].policyFor === 'DEPENDANT') {
        this.investmentDeductionForm.controls['selfPremium'].setValue(this.ITR_JSON.insurances[i].premium);
        this.investmentDeductionForm.controls['selfPreventiveCheckUp'].setValue(this.ITR_JSON.insurances[i].preventiveCheckUp);
        this.investmentDeductionForm.controls['selfMedicalExpenditure'].setValue(this.ITR_JSON.insurances[i].medicalExpenditure);
      } else if (this.ITR_JSON.insurances[i].policyFor === 'PARENTS') {
        this.investmentDeductionForm.controls['premium'].setValue(this.ITR_JSON.insurances[i].premium);
        this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(this.ITR_JSON.insurances[i].preventiveCheckUp);
        this.investmentDeductionForm.controls['medicalExpenditure'].setValue(this.ITR_JSON.insurances[i].medicalExpenditure);
      }
    }
    this.max5000Limit('SELF');
  }

  addAndUpdateInvestment(controlName) {
    if (this.utilsService.isNonEmpty(this.investmentDeductionForm.controls[controlName].value)) {
      let i: number;
      let isAdded = false;
      for (i = 0; i < this.ITR_JSON.investments.length; i++) {
        if (this.ITR_JSON.investments[i].investmentType === controlName) {
          isAdded = true;
          break;
        }
      }

      if (!isAdded) {
        this.ITR_JSON.investments.push({
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
      this.ITR_JSON.investments = this.ITR_JSON.investments.filter(item => item.investmentType !== controlName);
    }
  }

  addDonation(title, mode, selectedData, donationType) {
    const data = {
      title: title,
      mode: mode,
      selectedData: selectedData,
      ITR_JSON: this.ITR_JSON,
      donationType: donationType
    };
    const dialogRef = this.matDialog.open(AddDonationDialogComponent, {
      data: data,
      closeOnNavigation: true,
      width: '800px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add past year=', result);
      if (result !== undefined && result !== '' && result !== null) {
        this.ITR_JSON = result;
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        if (donationType === 'OTHER') {
          this.DonationGridOptions.api.setRowData(this.createRowData('OTHER'));
        } /* else if (donationType === 'SCIENTIFIC') {
          this.scientificDonationGridOptions.api.setRowData(this.createRowData('SCIENTIFIC'));
        } */
      }
    });
  }
  donationCallInConstructor(otherDonationToDropdown, stateDropdown) {
    this.DonationGridOptions = <GridOptions>{
      rowData: this.createRowData('OTHER'),
      columnDefs: this.donationCreateColoumnDef(otherDonationToDropdown, stateDropdown),
      enableCellChangeFlash: true,
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
          console.log('params == ', params);
          if (otherDonationToDropdown.length !== 0) {
            const nameArray = otherDonationToDropdown.filter(item => (item.value === params.data.schemeCode));
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
          console.log('stateDropdown == ', stateDropdown);
          if (stateDropdown.length !== 0) {
            const nameArray = stateDropdown.filter(item => item.stateCode === params.data.state);
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        width: 60,
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        width: 60,
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
          this.Copy_ITR_JSON.donations = this.ITR_JSON.donations.filter(item => item.identifier !== params.data.identifier);
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
    const donations = this.ITR_JSON.donations.filter(item => item.donationType === donationType);
    for (let i = 0; i < donations.length; i++) {
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

    return newData;
  }

  serviceCall(val, ITR_JSON) {
    this.loading = true;
    const param = '/itr/' + ITR_JSON.userId + '/' + ITR_JSON.itrId + '/' + ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Donation updated successfully');
      this.DonationGridOptions.api.setRowData(this.createRowData('OTHER'));
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
    if (!this.ITR_JSON.systemFlags.hasParentOverSixty) {
      console.log('clear parent related values');
      this.investmentDeductionForm.controls['premium'].setValue(null);
      this.investmentDeductionForm.controls['preventiveCheckUp'].setValue(null);
      this.investmentDeductionForm.controls['medicalExpenditure'].setValue(null);
    }
  }
}
