import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ITR_JSON } from '../../../../shared/interfaces/itr-input.interface';
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
  selectedFileId: any;
  filesUploaded: any;

  constructor(
    private itrService: ItrMsService,
    private utilService: UtilsService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.filesUploaded = [];
    this.initBrokerData();
  }

  initBrokerData() {
    this.brokerData = [
      {
        name: '5Paisa',
        label: '5 Paisa',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download 5 Paisa.pdf',
        note: 'Equity/Intraday/F&O'
      },
      // {
      //   name: 'IIFL',
      //   label: 'IIFL',
      //   loading: false,
      //   filesUploaded: [],
      //   steps: '',
      // },
      {
        name: 'Angel',
        label: 'Angel One',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download Angel One.pdf',
        note:''
      },
      {
        name: 'Paytm',
        label: 'PayTm',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download PayTM.pdf',
        note:'Equity/F&O'
      },
      {
        name: 'Axis',
        label: 'Axis Broker',
        loading: false,
        filesUploaded: [],
        steps: '',
        note:''
      },
      {
        name: 'Upstox',
        label: 'Upstox',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download upstox statement.pdf',
        note:''
      },
      {
        name: 'Groww',
        label: 'Groww',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download Groww statement.pdf',
        note:'Equity/Intraday/MF'
      },
      {
        name: 'Zerodha',
        label: 'Zerodha',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download Zerodha statement.pdf',
        note: 'MF/Equity/Intraday/F&O'
      },
      {
        name: 'ICICI',
        label: 'ICICI Bank',
        loading: false,
        filesUploaded: [],
        steps: './assets/files/Steps to download ICICI Statement.pdf',
        note:''
      },
      // {
      //   name: 'Jainam',
      //   label: 'Jainam',
      //   loading: false,
      //   filesUploaded: [],
      //   steps: '',
      // },
      {
        name: 'Taxbuddy',
        label: 'TaxBuddy',
        loading: false,
        filesUploaded: [],
        steps: '',
        note: 'Equity (intraday)/MF/F&O'
      },
    ];
  }

  downloadTemplate() {
    window.open('./assets/files/TaxBuddy Cg Template.xlsx');
  }

  steps(file) {
    window.open(file);
  }

  uploadFile(event: Event) {
    let file = (event.target as HTMLInputElement).files;
    console.log('File', file);
    if (file.length > 0) {
      let allowedFormats = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      let selectedFormat = file.item(0)?.type;
      console.log('file extension after selectedFormat', selectedFormat)
      if (allowedFormats.includes(selectedFormat)) {
        this.uploadDoc = file.item(0);
        this.uploadDocument(this.uploadDoc);
      } else {
        this.utilService.showSnackBar('Invalid file format. Only XLS and XLSX files are allowed.');
      }
    }
  }

  cloudUpload() {
    this.openDialog();
  }

  upload() {
    //check if there is data of capital gains
    let data = this.ITR_JSON.capitalGain.filter(
      (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
    );
    if (data && data.length > 0) {
      this.utilService.showSnackBar(
        'Uploading a new statement will erase the updates made to saved shares data.'
      );
    }

    document.getElementById('input-file-id').click();
  }

  openDialog() {
    const dialogRef = this.dialog.open(ViewDocumentsDialogComponent, {
      data: {
        userId: this.ITR_JSON.userId.toString(),
        serviceType: 'ITR',
      },
      width: '95%',
    });

    dialogRef.afterClosed().subscribe((selectedFileId: any) => {
      if (selectedFileId) {
        console.log('File Id for upload', selectedFileId);
        this.uploadDocument('', selectedFileId);
      } else {
        this.utilService.showSnackBar('Invalid file, No File Id found');
      }
    });
  }

  uploadDocument(document, id?) {
    // 'https://uat-api.taxbuddy.com/itr/upload-excel'
    this.loading = true;
    const formData = new FormData();
    if (document) {
      formData.append('file', document);
    } else {
      formData.append('cloudFileId', id);
    }

    let annualYear = this.ITR_JSON.assessmentYear;
    formData.append('userId', this.ITR_JSON.userId.toString());
    let param = '/upload-excel';
    this.itrService.postMethod(param, formData).subscribe(
      (res: any) => {
        if (this.utilService.isNonEmpty(res)) {
          if (res.success) {
            if (this.uploadDoc) {
              this.filesUploaded.push(this.uploadDoc.name);
            } else {
              this.filesUploaded.push(res.data.documentName);
            }

            //fetch uploaded files data converted to ITR compatible
            //TODO:Ashwini: adding dummy data till the time api is ready
            this.utilService
              .getCgSummary(this.ITR_JSON.userId.toString(), annualYear)
              .subscribe(
                (result: any) => {
                  if (result.success) {
                    this.loading = false;
                    if (!this.ITR_JSON.capitalGain) {
                      this.ITR_JSON.capitalGain = [];
                    }
                    //filter out all other cg data except the one we get from cg statement
                    let otherCgData = this.ITR_JSON.capitalGain.filter(
                      (item: any) =>
                        item.assetType !== 'EQUITY_SHARES_LISTED' &&
                        item.assetType !== 'GOLD'
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
                    this.loading = false;
                    this.utilService.showSnackBar(
                      'Something went wrong, try after some time.'
                    );
                  }
                },
                (error) => {
                  this.loading = false;
                  this.utilService.showSnackBar(
                    'Something went wrong, try after some time.'
                  );
                }
              );
          } else {
            this.loading = false;
            this.utilService.showSnackBar(
              res.message
            );
          }
        }
      },
      (error) => {
        this.loading = false;
        this.utilService.showSnackBar(
          'Something went wrong, try after some time.'
        );
      }
    );
  }
}
