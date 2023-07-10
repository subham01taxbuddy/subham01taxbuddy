import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  ITR_JSON,
} from '../../../../shared/interfaces/itr-input.interface';
import { AppConstants } from '../../../../shared/constants';
import { ItrMsService } from '../../../../../services/itr-ms.service';
import { UtilsService } from '../../../../../services/utils.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocumentsDialogComponent } from 'src/app/modules/shared/components/view-documents-dialog/view-documents-dialog.component';

@Component({
  selector: 'app-file-parser',
  templateUrl: './file-parser.component.html',
  styleUrls: ['./file-parser.component.scss'],
})
export class FileParserComponent implements OnInit {
  @Output() newDataAvailable = new EventEmitter<any>();
  ITR_JSON: ITR_JSON;
  brokerName: string;
  uploadDoc: any;
  loading = false;
  brokerData;
  selectedFileId:any;

  constructor(
    private itrService: ItrMsService,
    private utilService: UtilsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.initBrokerData();
  }

  initBrokerData() {
    this.brokerData = [
      {
        name: '5Paisa',
        label: '5 Paisa',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'IIFL',
        label: 'IIFL',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Angel',
        label: 'Angel One',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Paytm',
        label: 'PayTm',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Axis',
        label: 'Axis Broker',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Upstox',
        label: 'Upstox',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Groww',
        label: 'Groww',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Zerodha',
        label: 'Zerodha',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'ICICI',
        label: 'ICICI Bank',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Jainam',
        label: 'Jainam',
        loading: false,
        filesUploaded: [],
      },
      {
        name: 'Taxbuddy',
        label: 'TaxBuddy',
        loading: false,
        filesUploaded: [],
      },
    ];
  }

  downloadTemplate(){
    window.open('./assets/files/TaxBuddy Cg Template.xlsx');
  }

  uploadFile(event: Event) {
    let file = (event.target as HTMLInputElement).files;
    console.log('File', file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
      this.uploadDocument(this.uploadDoc);
    }
  }

  cloudUpload(brokerName){
    this.brokerName = brokerName;
    this.openDialog();
  }

  upload(brokerName) {
    //check if there is data of capital gains
    let data = this.ITR_JSON.capitalGain.filter(
      (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
    );
    if(data && data.length > 0) {
      this.utilService.showSnackBar('Uploading a new statement will erase the updates made to saved shares data.');
    }

    this.brokerName = brokerName;
    document.getElementById('input-file-id').click();
  }

  openDialog(){
    const dialogRef = this.dialog.open(ViewDocumentsDialogComponent, {
      data: {
        userId: this.ITR_JSON.userId.toString(),
        serviceType: 'ITR',
      },
      width: '95%',
    });

    dialogRef.afterClosed().subscribe((selectedFileId: any) => {
      if (selectedFileId) {
        console.log(selectedFileId);
        this.uploadDocument('',selectedFileId)
      }
    });
  }

  uploadDocument(document,id?) {
    // 'https://uat-api.taxbuddy.com/itr/upload-excel'
    this.loading = true;
    let brokerIndex = (this.brokerData as []).findIndex(
      (item: any) => item.name === this.brokerName
    );
    this.brokerData[brokerIndex].loading = true;
    const formData = new FormData();
    if(document){
      formData.append('file', document);
    }else{
      formData.append('cloudFileId',id)
    }

    let annualYear = this.ITR_JSON.assessmentYear;
    // console.log('annualYear: ', annualYear);
    // //let cloudFileMetaData = '{"formCode":"' + this.ITR_JSON.itrType + ',"ay":' + this.ITR_JSON.assessmentYear + ',"filingTypeCd":"O","userId ":' + this.ITR_JSON.userId + ',"filingTeamMemberId":' + this.ITR_JSON.filingTeamMemberId + '"}';
    // formData.append("formCode", this.ITR_JSON.itrType);
    // formData.append("ay", annualYear);
    // formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    formData.append('brokerName', this.brokerName);
    formData.append('userId', this.ITR_JSON.userId.toString());
    let param = '/upload-excel';
    this.itrService.postMethod(param, formData).subscribe(
      (res: any) => {
        this.loading = false;
        //   this.isValidateJson = true;
        console.log('uploadDocument response =>', res);
        if (this.utilService.isNonEmpty(res)) {
          if (res.success) {
            //update UI for uploaded file name
            let selectedBroker = this.brokerData.filter(
              (broker) => broker.name === this.brokerName
            )[0];
            if(this.uploadDoc){
              selectedBroker.filesUploaded.push(this.uploadDoc.name);
            }else{
              selectedBroker.filesUploaded.push(res.data.documentName);
            }

            //fetch uploaded files data converted to ITR compatible
            //TODO:Ashwini: adding dummy data till the time api is ready
            this.utilService
              .getCgSummary(this.ITR_JSON.userId.toString(), annualYear)
              .subscribe(
                (result: any) => {
                  this.brokerData[brokerIndex].loading = false;
                  if (result.success) {
                    if (!this.ITR_JSON.capitalGain) {
                      this.ITR_JSON.capitalGain = [];
                    }
                    //filter out all other cg data except the one we get from cg statement
                    let otherCgData = this.ITR_JSON.capitalGain.filter(
                      (item: any) =>
                        item.assetType === 'EQUITY_SHARES_LISTED' &&
                        item.assetType === 'GOLD'
                    );
                    if (result.data.capitalGain) {
                      result.data.capitalGain.forEach((cgObject) => {
                        otherCgData.push(cgObject);
                      });
                    }
                    this.ITR_JSON.capitalGain = otherCgData;

                    //check for future options income
                    if (!this.ITR_JSON.business) {
                      this.ITR_JSON.business = {
                        businessDescription: [],
                        financialParticulars: null,
                        fixedAssetsDetails: [],
                        presumptiveIncomes: [],
                        profitLossACIncomes: [],
                      };
                    }
                    this.ITR_JSON.business.profitLossACIncomes =
                      result.data.profitLossACIncomes;

                    //dividend income updated
                    this.ITR_JSON.dividendIncomes = result.data.dividendIncomes;

                    sessionStorage.setItem(
                      AppConstants.ITR_JSON,
                      JSON.stringify(this.ITR_JSON)
                    );
                    this.newDataAvailable.emit(true);
                  } else {
                    this.brokerData[brokerIndex].loading = false;
                    this.loading = false;
                    //   this.isValidateJson = false;
                    this.utilService.showSnackBar(
                      'Something went wrong, try after some time.'
                    );
                  }
                },
                (error) => {
                  this.brokerData[brokerIndex].loading = false;
                  this.loading = false;
                  //   this.isValidateJson = false;
                  this.utilService.showSnackBar(
                    'Something went wrong, try after some time.'
                  );
                }
              );
          } else {
            this.brokerData[brokerIndex].loading = false;
            this.utilService.showSnackBar(
              res.message
            );
          }
        }
      },
      (error) => {
        this.loading = false;
        //   this.isValidateJson = false;
        this.utilService.showSnackBar(
          'Something went wrong, try after some time.'
        );
      }
    );
  }
}
