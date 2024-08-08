import { formatDate } from '@angular/common';
import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { UtilsService } from 'src/app/services/utils.service';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-pay-processing',
  templateUrl: './pay-processing.component.html',
  styleUrls: ['./pay-processing.component.scss'],
})
export class PayProcessingComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  loading!: boolean;
  payProcessingGridOptions: GridOptions;
  config: any;
  PayOutInfo: any = [];
  isUploadTrue = true;
  payProcessList: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  downloadURL:any;
  hideDownload = true;
  showMessage ='';
  accountType = new UntypedFormControl('razorpayX')
  currentAccountNumber: string = '333005001704';
  razorpayXAccountNumber: string = '3434696314924813';
  loading1:boolean =false
  vendorType = new UntypedFormControl('Razorpay')

  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private reportService: ReportService,
    private vendorService : VendorService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.payProcessingGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.payOutCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},
      sortable: true,
      filter: true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0,
    };
  }

  ngOnInit() {
     this.isUploadAllowed();
     this.getListOfPayOuts();
  }

  isUploadAllowed() {
    this.loading1 = true;
    let param = '';
    this.itrMsService.getLambda(param).subscribe((response: any) => {
      if (response.success) {
        this.loading1 = false;
        console.log('response', response);
        if(response?.allowUpload){
          this.isUploadTrue = true;
        }else{
          this.isUploadTrue = false;
          this.hideDownload =true;
        }

      } else {
        this.loading1 = false;
        this.isUploadTrue = false;
        this.hideDownload = false;
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.loading1 = false;
      this.utilsService.showSnackBar('Error in API of check upload/download csv');
    });
  }

  getListOfPayOuts() {
    // http://localhost:9055/report/payout/csv-data?page=0&pageSize=10
    this.loading = true;

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/payout/csv-data?${data}`;

    this.reportService.getMethod(param).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          this.payProcessList = response?.data?.content;
          this.config.totalItems = response?.data?.totalElements;
          this.payProcessingGridOptions.api?.setRowData(
            this.createRowData(this.payProcessList)
          );
        } else {
          this.loading = false;
          this.config.totalItems = 0;
          this.payProcessingGridOptions.api?.setRowData(this.createRowData([]));
          this.utilsService.showSnackBar(response.message);
        }
      },
      (error) => {
        this.config.totalItems = 0;
        this.payProcessingGridOptions.api?.setRowData(this.createRowData([]));
        this.loading = false;
        this.utilsService.showSnackBar('Error While Getting Pay-Out List');
      }
    );
  }

  payOutCodeColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 50,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        },
      },
      {
        headerName: 'Input CSV File Name',
        field: 'inputCsv',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Input CSV Date',
        field: 'inputCsvDate',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (data: any) => {
          return data.value ? formatDate(data.value, 'dd/MM/yyyy  HH:mm:ss', this.locale) : '-';
        }
      },
      {
        headerName: 'Input CSV User Name',
        field: 'inputCsvUploadedBy',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Output CSV File Name',
        field: 'outputCsv',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Output CSV Date',
        field: 'outputCsvDate',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (data: any) => {
          return data.value ? formatDate(data.value, 'dd/MM/yyyy HH:mm:ss', this.locale) : '-';
        }
      },
      {
        headerName: 'Output CSV User Name',
        field: 'outputCsvUplaodedBy',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'vendor',
        field: 'vendor',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
    ];
  }

  createRowData(userData: any) {
    return userData;
  }

  upload() {
    this.loading = true;
    let userId = this.utilsService.getLoggedInUserID();
    const file: File = this.fileInput.nativeElement.files[0];

    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      let param = '';

      this.itrMsService.postLambda(param, formData).subscribe((res: any) => {
        this.loading = false;
        if (res.success) {
          this.loading = false;
          this.utilsService.showSnackBar('File uploaded successfully');
          this.isUploadTrue=false;

        }else {
          this.loading=false;
          this.utilsService.showSnackBar('Something went wrong while uploading file');
        }
      });
    } else {
      this.loading=false;
      this.utilsService.showSnackBar('Please select a valid csv');
    }
  }

  getTds(){
    //https://cihbintebntput6bydyqnksj2a0zykgg.lambda-url.ap-south-1.on.aws/
    this.showMessage = 'TDS Computation Started - Please Do Not Close the Screen or Move out'
    this.loading = true;
    let param = '';
    this.itrMsService.getTdsDetails(param).subscribe((response: any) => {
      if (response.success) {
        console.log('response', response);
        this.showMessage ='Adjustment Started Please Do Not Close the Screen or Move out'
        this.addAdjustment();
      } else {
        this.loading = false;
        this.showMessage =''
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.showMessage =''
      this.utilsService.showSnackBar('Error in API of TDS Computation');
    });

  }

  addAdjustment(){
    this.loading =true;
    let param = '';
    this.showMessage ='Adjustment Started Please Do Not Close the Screen or Move out'
    this.itrMsService.addAdjustment(param).subscribe((response: any) => {
      if (response.success) {
        console.log('response', response);
        this.showMessage ='CSV Generation Started - Please Do Not Close the Screen or Move out'
        this.download();
      } else {
        this.loading = false;
        this.showMessage =''
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.showMessage =''
      this.utilsService.showSnackBar('Error in API of Adjustment Computation');
    });
  }

  download() {
    // new endpoint given by kamaru(10-08-23) https://avamuzavbieadujrkme44yfetq0cxiou.lambda-url.ap-south-1.on.aws/partner/payout/generate-csv' \
    // https://avamuzavbieadujrkme44yfetq0cxiou.lambda-url.ap-south-1.on.aws/'
    this.loading = true;
    let userId = this.utilsService.getLoggedInUserID();
    let accountNumber=''
    if (this.accountType.value === 'current') {
      console.log('Generating CSV for Current account');
      console.log('Account Number:', this.currentAccountNumber);
      accountNumber = this.currentAccountNumber;
    } else if (this.accountType.value === 'razorpayX') {
      console.log('Generating CSV for RazorpayX account');
      console.log('Account Number:', this.razorpayXAccountNumber);
      accountNumber = this.razorpayXAccountNumber;
    }

    this.vendorService.setVendor(this.vendorType.value);
    this.accountType.value === 'current' ? this.vendorService.setPaymentMethod('Current Account') : this.vendorService.setPaymentMethod('Wallet')

    const request = {
      userId: userId,
      accountNumber:accountNumber
    };

    // this.showMessage ='CSV Generation Started - Please Do Not Close the Screen or Move out'

    let param = 'partner/payout/generate-csv';
    this.itrMsService.downloadLambda(param,request).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;
        console.log('response', response['data']);
        this.showMessage =''
        this.utilsService.showSnackBar(response.message);
        this.downloadURL = response?.downloadUrl
        window.open(this.downloadURL, '_blank');
        this.isUploadTrue=true;
        this.hideDownload =true;
      } else {
        this.loading = false;
        this.showMessage =''
        this.hideDownload =false;
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.showMessage =''
      this.utilsService.showSnackBar('Error in download/generate CSV ');
    });

  }

  isSurroundDynamic(): boolean {
    return this.isUploadTrue || this.hideDownload;
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getListOfPayOuts();
  }
}
