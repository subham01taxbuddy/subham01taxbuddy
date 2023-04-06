import { data } from 'jquery';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ViewDocumentsComponent } from './view-documents/view-documents.component';
import { UpdateStatusComponent } from './update-status/update-status.component';
import { DatePipe } from '@angular/common';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../pages.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bo-partners',
  templateUrl: './bo-partners.component.html',
  styleUrls: ['./bo-partners.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class BoPartnersComponent implements OnInit {
  config: any;
  loading!: boolean;
  partnersGridOptions: GridOptions;
  totalCount = 0;
  boPartnersInfo: any;
  boPartnerDateForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
    fromDate: this.maxDate,
  };
  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private utileService: UtilsService,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog
  ) {
    this.partnersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.boPartnersColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };
  }
  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }
  ngOnInit() {
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: null,
    };
    this.boPartnerDateForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
    });
    this.getBoPartners();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }
  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getBoPartners();
    // this.searchParam.page = event - 1;
  }

  boPartnersColumnDef() {
    return [
      {
        headerName: 'Type - Individual/ Consultant',
        field: 'partnerType',
        width: 150,
        pinned: 'left',
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name/name of Organization',
        field: 'name',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email ID',
        field: 'emailAddress',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'City',
        field: 'city',
        width: 120,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'State',
        field: 'state',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile number',
        field: 'mobileNumber',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Status',
        field: 'currentstatus',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Work Experience',
        field: 'workExperience',
        width: 120,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language Proficiency',
        field: 'languageProficiency',
        width: 120,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'referred person',
        field: 'referredBy',
        width: 120,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'No. of employee working in organization',
        field: 'noOfEmployees',
        width: 100,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Your Interest area of work',
        field: 'areaOfExpertise',
        width: 200,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: (params) => {
          console.log(params.data);
          var q1 = params.data.areaOfExpertise?.incomeTaxBasic;
          var q2 = params.data.areaOfExpertise?.incomeTaxSpecial;
          var q3 = params.data.areaOfExpertise?.tdsFiling;
          var q4 = params.data.areaOfExpertise?.additional;
          return q1 + ',' + q2 + ',' + q3 + ',' + q4;
        },
      },

      {
        headerName: 'Document Uploaded',
        sortable: true,
        suppressMenu: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to view documents"
        style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa fa-book" aria-hidden="true" data-action-type="viewDocuments"></i>
         </button>`;
        },
        width: 100,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
        style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
         </button>`;
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  getBoPartners() {
    if (this.boPartnerDateForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(
        this.boPartnerDateForm.value.fromDate,
        'yyyy-MM-dd'
      );
      let toDate = this.datePipe.transform(
        this.boPartnerDateForm.value.toDate,
        'yyyy-MM-dd'
      );
      this.loading = true;

      let param = `/partner-details?page=${
        this.config.currentPage - 1
      }&size=10&from=${fromDate}&to=${toDate}`;
      this.userMsService.getMethod(param).subscribe(
        (response: any) => {
          console.log('bo-partners list: ', response);
          if (Array.isArray(response.content)) {
            this.loading = false;
            this.boPartnersInfo = response.content;
            this.config.totalItems = response.content.length;
            this.partnersGridOptions.api?.setRowData(
              this.createRowData(this.boPartnersInfo)
            );
          } else {
            this.loading = false;
            this.config.totalItems = 0;
            this.partnersGridOptions.api?.setRowData(this.createRowData([]));
          }
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }
  createRowData(data: any) {
    var partnersArray = [];
    for (let i = 0; i < data.length; i++) {
      let boPartnersInfo: any = Object.assign({}, partnersArray[i], {
        partnerType: data[i].partnerType,
        id: data[i].id,
        name: data[i].name,
        emailAddress: data[i].emailAddress,
        city: data[i].city,
        state: data[i].state,
        mobileNumber: data[i].mobileNumber,
        workExperience: data[i].workExperience,
        languageProficiency: data[i].languageProficiency,
        referredBy: data[i].referredBy,
        noOfEmployees: data[i].noOfEmployees,
        areaOfExpertise: data[i].areaOfExpertise,
        status: data[i].status,
        currentstatus: data[i].currentstatus.status,
        aadhaarUrl: data[i].aadhaarUrl,
        panUrl: data[i].panUrl,
        signedNDAUrl: data[i].signedNDAUrl,
        certificateOfPracticeUrl: data[i].certificateOfPracticeUrl,
        passbookOrCancelledChequeUrl: data[i].passbookOrCancelledChequeUrl,
        cvUrl: data[i].cvUrl,
      });
      partnersArray.push(boPartnersInfo);
    }
    return partnersArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'viewDocuments': {
          this.viewDocuments(params.data);
          break;
        }
        case 'updateStatus': {
          this.updateStatus(params.data);
          break;
        }
      }
    }
  }
  viewDocuments(partner) {
    this.loading = false;
    let disposable = this.dialog.open(ViewDocumentsComponent, {
      width: '50%',
      height: 'auto',
      data: {
        id: partner.id,
        partnerName: partner.name,
        emailAddress: partner.emailAddress,
        aadhar: partner.aadhaarUrl,
        panCard: partner.panUrl,
        signedNDA: partner.signedNDAUrl,
        certificateOfPractice: partner.certificateOfPracticeUrl,
        passbookOrCancelledCheque: partner.passbookOrCancelledChequeUrl,
        cvUrl: partner.cvUrl,
      },
    });

    disposable.afterClosed().subscribe((result) => {});
  }
  updateStatus(partner) {
    let disposable = this.dialog.open(UpdateStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        id: partner.id,
        partnerName: partner.name,
        emailAddress: partner.emailAddress,
        status: partner.status,
        currentstatus: partner.currentstatus,
        mode: 'Update Status',
        mobileNumber: partner.mobileNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('statusData:', result);
      if (result) {
        if (result.data === 'statusChanged') {
          // this.getBoPartners();
          this.getBoPartners();
        }
      }
    });
  }
}
