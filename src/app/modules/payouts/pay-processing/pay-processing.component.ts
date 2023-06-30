import { formatDate } from '@angular/common';
import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { UtilsService } from 'src/app/services/utils.service';

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
  isUploadTrue = false;
  payProcessList: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  downloadURL:any;

  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private reportService: ReportService,
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
    this.loading = true;
    let param = '';
    this.itrMsService.getLambda(param).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;
        console.log('response', response);
        if(response?.allowUpload){
          this.isUploadTrue = true;
        }else{
          this.isUploadTrue = false;;
        }

      } else {
        this.loading = false;
        this.isUploadTrue = false;
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.utilsService.showSnackBar('Error in check upload');
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

  download() {
    // https://avamuzavbieadujrkme44yfetq0cxiou.lambda-url.ap-south-1.on.aws/'
    this.loading = true;
    let userId = this.utilsService.getLoggedInUserID();
    const request = {
      userId: userId
    };
    let param = '';
    this.itrMsService.downloadLambda(param,request).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;
        console.log('response', response['data']);
        this.utilsService.showSnackBar(response.message);
        this.downloadURL = response?.downloadUrl
        window.open(this.downloadURL, '_blank');
        this.isUploadTrue=true;
        // this.isUploadAllowed();
      } else {
        this.loading = false;
        // this.isUploadTrue = false;
        this.utilsService.showSnackBar(response.message);
      }
    },
    (error) => {
      this.loading = false;
      this.utilsService.showSnackBar('Error in check download');
    });

  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getListOfPayOuts();
  }
}
