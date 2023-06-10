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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { ToastMessageService } from 'src/app/services/toast-message.service';

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
  searchMobileNumber = new FormControl('');
  fromDateValue =new FormControl('2022-09-01', Validators.required);
  toDateValue = new FormControl(new Date(), Validators.required);
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
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
  ) {

    this.partnersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.boPartnersColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

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
      fromDate: ['2022-09-01', Validators.required],
      toDate: [new Date(), Validators.required],

    });
    this.getBoPartners();
  }

  setToDateValidation(fromDate) {
    this.minToDate = this.fromDateValue.value;
  }
  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getBoPartners();
  }

  boPartnersColumnDef() {
    return [
      {
        headerName: 'Type - Individual/ Consultant',
        field: 'partnerType',
        width: 170,
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
        headerName: 'Lead Type',
        field: 'leadType',
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
        width: 140,
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
        cellRenderer: function(params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
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
        headerName: 'PAN',
        field: 'pan',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'GSTN',
        field: 'gstin',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Bank Details',
        field: 'bankDetails',
        width: 150,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        valueGetter: (params) => {
          if (params?.data?.bankDetails == null) {
            return 'No'
          } else {
            return 'Yes'
          }
        }
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
        headerName: 'Referred person',
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
        headerName: 'No. of EMP in Org.',
        field: 'noOfEmployees',
        width: 155,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Area Of Expertise',
        field: 'areaOfExpertise',
        width: 150,
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
          <i class="fa-regular fa-file-arrow-up" style="color:#49a30a;" aria-hidden="true" data-action-type="viewDocuments"></i>
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
        <i class="fa-regular fa-user-check" data-action-type="updateStatus"></i>
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
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params: any) {
          //console.log(params);
          if (params.data.currentstatus == 'APPROVE' || params.data.currentstatus == 'PAID') {
            return `<button type="button" class="action_icon add_button" title="Send Email"
        style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa-regular fa-envelope-open-text" aria-hidden="true" data-action-type="sendEmail"></i>
         </button>`;
          } else {
            return '-'
          }
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

  getBoPartners(mobile?) {
    // 'https://uat-api.taxbuddy.com/user/partner-details?mobileNumber=8055521145'
    if (this.boPartnerDateForm.valid) {
      this.loading = true;

      const fromDateValue = this.fromDateValue.value;
      const toDateValue = this.toDateValue.value;

      let fromDate = this.datePipe.transform(fromDateValue,'yyyy-MM-dd');
      let toDate = this.datePipe.transform(toDateValue,'yyyy-MM-dd');

      this.loading = true;
      let param

      if (mobile && this.searchMobileNumber.value) {
        param = `/partner-detail?page=0&size=1&mobileNumber=${this.searchMobileNumber.value}`
      } else {
        param = `/partner-details?page=${this.config.currentPage - 1}&size=10&from=${fromDate}&to=${toDate}`;
      }

      this.userMsService.getMethod(param).subscribe(
        (response: any) => {
          this.loading = false;
          console.log('bo-partners list: ', response);
          if (Array.isArray(response.content) && response.content.length !== 0) {
            this.loading = false;
            this.boPartnersInfo = response.content;
            this.config.totalItems = response.totalElements;
            this.partnersGridOptions.api?.setRowData(
              this.createRowData(this.boPartnersInfo)
            );
          } else {
            this.loading = false;
            this.config.totalItems = 0;
            this.partnersGridOptions.api?.setRowData(this.createRowData([]));
            this._toastMessageService.alert("error",'No Data Found');
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
        leadType: data[i].leadType ? data[i].leadType : '-',
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
        bankDetails: data[i].bankDetails,
        gstin: data[i].gstin,
        pan: data[i].pan,
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
        case 'sendEmail': {
          this.sendEmail(params.data);
          break;
        }
      }
    }
  }

  sendEmail(partnerData) {
    if(this.utileService.isNonEmpty(partnerData.emailAddress)) {
      this.loading = true;
      let partnerName = partnerData.name;
      let mobile = partnerData.mobileNumber;
      var data = new FormData();
      data.append('from', 'support@taxbuddy.com');
      data.append('subject', 'Partner Onboarding in Taxbuddy BO');
      data.append('body', `<!DOCTYPE html>
<html>

<head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>

<body style="margin: 0 !important; padding: 0 !important; background: #ededed;">
    <table width="100%" cellpadding="0" style="margin-top: 40px" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table width="600" cellspacing="0" cellpadding="0" style="font-family:Arial, sans-serif;border: 1px solid #e0e0e0;background-color: #fff;">
                    <tr style="background: #fff;border-bottom: 1px solid #e0e0e0;">
                        <td>
                            <table cellpadding="0" cellspacing="0" style="width: 100%;border-bottom: 1px solid #e0e0e0;padding: 10px 0 10px 0;">
                                <tr style="background: #fff;border-bottom: 1px solid #e0e0e0;">
                                    <td style="background: #fff;padding-left: 15px;"> <a href="https://www.taxbuddy.com/" target="_blank" style="display: inline-block;"> <img alt="Logo" src="https://s3.ap-south-1.amazonaws.com/assets.taxbuddy.com/taxbuddy.png" width="150px" border="0"> </a> </td>
                                    <td align="right" valign="top" style="padding: 15px 15px 15px 0;" class="logo" width="70%"> </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0px 15px 0px 15px">
                            <table cellpadding="0" cellspacing="0" style="width: 100%;font-family:Arial, sans-serif;">
                                <tr>
                                    <td style="font-size: 14px;color: #333;"> <br> <br> <span style="font-weight: bold">Dear ${partnerName},</span><br /> <br>
                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Welcome to Taxbuddy! We are excited to invite you to begin the onboarding process as a partner in Taxbuddy's back office. This will give you access to Taxbuddy's platform and enable you to serve our clients more efficiently. </p> <br>
                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Please click on the link below to start the onboarding process: </p> <br>

                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> <a href="${environment.webportal_url}/log/userlogin?mobile=${mobile}&serviceType=ITR&partner=true" title="LINK" style="text-decoration: none;">Onboarding Link</a> </p> <br>

                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Thank you for choosing Taxbuddy as your partner. We look forward to a successful and mutually beneficial partnership. </p> <br>
                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Regards, </p>
                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Taxbuddy Partner Onboarding Team </p> <br>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #1c3550;padding: 20px 15px;">
                            <table cellpadding="0" cellspacing="0" style="font-size: 13px;color: #657985;font-family:Arial, sans-serif;width: 100%;"> </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`);
      data.append('cc', 'partnerleads@taxbuddy.com, divya@taxbuddy.com, amod@taxbuddy.com');
      data.append('isHtml', 'true');
      data.append('to', partnerData.emailAddress);

      let param = '/send-mail';
      this.userMsService.postMethod(param, data).subscribe((res: any) => {
        console.log(res);
        this.loading = false;
      }, error => {
        this.loading = false;
        this.utileService.showSnackBar(error.error.text);
      });
    } else {
      this.utileService.showSnackBar('Partner email address is not available. Please check with support team.');
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

    disposable.afterClosed().subscribe((result) => { });
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
        currentStatus: partner.currentstatus,
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

  resetFilters() {
    this.searchMobileNumber.setValue(null);
    this.fromDateValue.setValue('2022-09-01');
    this.toDateValue.setValue(new Date());
    this.getBoPartners();
  }
}
