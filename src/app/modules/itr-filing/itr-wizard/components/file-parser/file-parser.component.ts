import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  AssetDetails,
  ITR_JSON,
  NewCapitalGain,
  ProfitLossACIncomes
} from "../../../../shared/interfaces/itr-input.interface";
import {AppConstants} from "../../../../shared/constants";
import {ItrMsService} from "../../../../../services/itr-ms.service";
import {UtilsService} from "../../../../../services/utils.service";

@Component({
  selector: 'app-file-parser',
  templateUrl: './file-parser.component.html',
  styleUrls: ['./file-parser.component.scss']
})
export class FileParserComponent implements OnInit {

  @Output() newDataAvailable = new EventEmitter<any>();
  ITR_JSON: ITR_JSON;
  brokerName: string;
  uploadDoc: any;
  loading = false;
  brokerData: any;

  constructor(private itrService: ItrMsService,
              private utilService: UtilsService) { }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.initBrokerData();
  }

  initBrokerData() {
    this.brokerData = [
      {
        name: '5 Paisa',
        label: '5 Paisa',
        filesUploaded: []
      },
      {
        name: 'IIFL',
        label: 'IIFL',
        filesUploaded: []
      },
      {
        name: 'AngleOne',
        label: 'AngleOne',
        filesUploaded: []
      },
      {
        name: 'PayTm',
        label: 'PayTm',
        filesUploaded: []
      },
      {
        name: 'Axis',
        label: 'Axis Broker',
        filesUploaded: []
      },
      {
        name: 'Upstocks',
        label: 'Upstocks',
        filesUploaded: []
      },
      {
        name: 'Grow',
        label: 'Grow (Both version)',
        filesUploaded: []
      },
      {
        name: 'Zerodha',
        label: 'Zerodha',
        filesUploaded: []
      },
      {
        name: 'ICICI',
        label: 'ICICI Bank',
        filesUploaded: []
      }
    ];
  }

  uploadFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
      this.uploadDocument(this.uploadDoc);
    }
  }

  upload(brokerName) {
    this.brokerName = brokerName;
    document.getElementById("input-file-id").click();
  }

  uploadDocument(document) {
    this.loading = true;
    const formData = new FormData();
    formData.append("file", document);
    // let annualYear = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
    // console.log('annualYear: ', annualYear);
    // //let cloudFileMetaData = '{"formCode":"' + this.ITR_JSON.itrType + ',"ay":' + this.ITR_JSON.assessmentYear + ',"filingTypeCd":"O","userId ":' + this.ITR_JSON.userId + ',"filingTeamMemberId":' + this.ITR_JSON.filingTeamMemberId + '"}';
    // formData.append("formCode", this.ITR_JSON.itrType);
    // formData.append("ay", annualYear);
    // formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    formData.append("brokerName",this.brokerName);
    formData.append("userId",this.ITR_JSON.userId.toString());
    let param = '/upload-excel';
    this.itrService.postMethod(param, formData).subscribe((res: any) => {
      this.loading = false;
    //   this.isValidateJson = true;
      console.log('uploadDocument response =>', res);
      if (this.utilService.isNonEmpty(res)) {
        if (res.success) {
          //update UI for uploaded file name
          let selectedBroker = this.brokerData.filter(broker => broker.name===this.brokerName)[0];
          selectedBroker.filesUploaded.push(this.uploadDoc.name);
          //fetch uploaded files data converted to ITR compatible
          //TODO:Ashwini: adding dummy data till the time api is ready
          let dummyEquity: NewCapitalGain = {
              assessmentYear: '2022-2023',
              assetType: 'EQUITY_SHARES_LISTED',
              assesseeType: 'INDIVIDUAL',
              improvement: null,
              buyersDetails: null,
              residentialStatus: 'RESIDENT',
              assetDetails: []};
          dummyEquity.assetDetails.push(
                {
                  brokerName: 'Zerodha',
                  srn: 0,
                  gainType: 'LONG',
                  sellDate: '2023-02-07T18:30:00.000Z',
                  sellValue: 12000,
                  stampDutyValue: 0,
                  valueInConsideration: 0,
                  sellExpense: 0,
                  purchaseDate: '2017-10-26T18:30:00.000Z',
                  purchaseCost: 1500,
                  isinCode: 'INE009A01021',
                  nameOfTheUnits: 'INFOSYS LTD',
                  sellOrBuyQuantity: 5,
                  sellValuePerUnit: 2400,
                  purchaseValuePerUnit: 300,
                  algorithm: 'cgSharesMF',
                  fmvAsOn31Jan2018: '1166',
                  capitalGain: 6170,
                  indexCostOfAcquisition: 0,
                  grandFatheredValue: 5830,
                  id: '0',
                  description:'',
                  isUploaded: true,
                  hasIndexation: false
                });
          let dummyOther: NewCapitalGain = {
              assessmentYear: '2022-2023',
              assetType: 'GOLD',
              assesseeType: 'INDIVIDUAL',
              improvement: null,
              buyersDetails: null,
              residentialStatus: 'RESIDENT',
              assetDetails: []
          };
          dummyOther.assetDetails.push(
                {
                  brokerName: 'Zerodha',
                  srn: 0,
                  gainType: 'SHORT',
                  sellDate: '2023-02-21T18:30:00.000Z',
                  sellValue: 25000,
                  stampDutyValue: 0,
                  valueInConsideration: 0,
                  sellExpense: 500,
                  purchaseDate: '2022-06-13T18:30:00.000Z',
                  purchaseCost: 1500,
                  algorithm: 'cgProperty',
                  capitalGain: 23000,
                  indexCostOfAcquisition: 0,
                  id: '0',
                  description:'',
                  isUploaded: true,
                  hasIndexation: false,
                  grandFatheredValue: 0,
                  isinCode: '',
                  nameOfTheUnits: '',
                  sellOrBuyQuantity: 0,
                  sellValuePerUnit: 0,
                  purchaseValuePerUnit: 0,
                  fmvAsOn31Jan2018: '0'
                });
          this.ITR_JSON.capitalGain.push(dummyEquity);
          this.ITR_JSON.capitalGain.push(dummyOther);

          //future options data
          let profitLossIncome = [];
          profitLossIncome.push(
            {
              id: 0,
              businessType: "SPECULATIVEINCOME",
              incomes: [
                {
                  id: 0,
                  incomeType: "SPECULATIVEINCOME",
                  periodOfHolding: 0,
                  presumptiveIncome: 0,
                  receipts: 0,
                  minimumPresumptiveIncome: 0,
                  tonnageCapacity: 0,
                  turnOver: 35000,
                  grossProfit: 8000,
                  expenditure: 2000,
                  netIncomeFromSpeculativeIncome: 6000
                }
              ]
            });
          profitLossIncome.push(
            {
              id: 0,
              businessType: "NONSPECULATIVEINCOME",
              totalgrossProfitFromNonSpeculativeIncome: 27850,
              netProfitfromNonSpeculativeIncome: 27850,
              incomes: [
                {
                  _id: 0,
                  incomeType: "NONSPECULATIVEINCOME",
                  periodOfHolding: 0.00,
                  presumptiveIncome: 0.00,
                  receipts: 0.00,
                  minimumPresumptiveIncome: 0.00,
                  tonnageCapacity: 0,
                  turnOver: 40000,
                  finishedGoodsOpeningStock: 250,
                  finishedGoodsClosingStock: 100,
                  purchase: 12000,
                  grossProfit: 27850
                }
              ],
              expenses: []
            });
          this.ITR_JSON.business.profitLossACIncomes = profitLossIncome;
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.newDataAvailable.emit(true);
        } else {
          this.utilService.showSnackBar('Response is null, try after some time.');
        }
      }
    }, error => {
      this.loading = false;
    //   this.isValidateJson = false;
      this.utilService.showSnackBar('Something went wrong, try after some time.');
    })
  }
}
