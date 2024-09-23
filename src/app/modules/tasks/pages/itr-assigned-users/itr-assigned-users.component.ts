import { ChatOptionsDialogComponent } from './../../components/chat-options/chat-options-dialog.component';
import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { MoreOptionsDialogComponent } from '../../components/more-options-dialog/more-options-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ReviseReturnDialogComponent } from 'src/app/modules/itr-filing/revise-return-dialog/revise-return-dialog.component';
import { ServiceDropDownComponent } from '../../../shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { UntypedFormControl } from '@angular/forms';
import { BulkReAssignDialogComponent } from '../../components/bulk-re-assign-dialog/bulk-re-assign-dialog.component';
import { RequestManager } from "../../../shared/services/request-manager";
import { Subscription } from "rxjs";
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ItrStatusDialogComponent } from '../../components/itr-status-dialog/itr-status-dialog.component';
import { AgTooltipComponent } from "../../../shared/components/ag-tooltip/ag-tooltip.component";
import { ReAssignActionDialogComponent } from '../../components/re-assign-action-dialog/re-assign-action-dialog.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import * as moment from 'moment';
import { DomSanitizer } from "@angular/platform-browser";
import {ChatManager} from "../../../chat/chat-manager";
import { ChatService } from 'src/app/modules/chat/chat.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';

@Component({
  selector: 'app-itr-assigned-users',
  templateUrl: './itr-assigned-users.component.html',
  styleUrls: ['./itr-assigned-users.component.scss']
})
export class ItrAssignedUsersComponent implements OnInit {
  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  itrStatus: any = [];
  filerUserId: any;
  ogStatusList: any = [];
  searchVal: any;
  searchStatusId: any;
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
    itrObjectStatus: null,
  };
  agentId = null;
  loggedInUserRoles: any;
  showReassignmentBtn: any;
  sortBy: any = {};
  sortMenus = [
    { value: 'name', name: 'Name' },
    { value: 'createdDate', name: 'Creation Date' },
    { value: 'statusUpdatedDate', name: 'Status Updated Date' },
    { value: 'userId', name: 'User Id ' }
  ];
  searchBy: any = {};
  searchMenus = [];
  clearUserFilter: number;
  partnerType: any;
  unAssignedUsersView = new UntypedFormControl(false);
  disableCheckboxes = false;
  showMessage: boolean = false;
  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'ITR-U',
      value: 'ITRU',
    },
  ]
  fillingStatus = [
    {
      label: 'Yet to Start',
      value: 'CREATE',
    },
    {
      label: 'Resume Filing',
      value: 'PREPARING_ITR',
    },
  ];
  taxDropdown = [
    { label: 'Both', value: '' },
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  taxPayable: any = '';
  loggedInUserId: any;
  showReassignButton: boolean = false;
  showCsvMessage: boolean;

  chatBuddyDetails: any;

  constructor(
    private reviewService: ReviewService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    private activatedRoute: ActivatedRoute,
    private requestManager: RequestManager,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    private userService: UserMsService,
    private sanitizer: DomSanitizer,
    private chatManager: ChatManager,
    private chatService: ChatService,
    private genericCsvService: GenericCsvService,
    @Inject(LOCALE_ID) private locale: string) {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    if (environment.allowReassignToPreviousLeader.includes(this.loggedInUserId)) {
      this.showReassignButton = true;
    }
    this.showReassignmentBtn = this.loggedInUserRoles.filter((item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER'));
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef([]),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      isRowSelectable: (rowNode) => {
        return this.isSelectionAllowed(rowNode.data);
        // return rowNode.data ? (this.showReassignButton || (this.showReassignmentBtn.length && rowNode.data.statusId != 11 && rowNode.data.statusId != 35)) : false;
      },
      onGridReady: params => {
      },

      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };

    this.requestManager.init();
    this.requestManagerSubscription = this.requestManager.requestCompleted.subscribe((value: any) => {
      this.requestCompleted(value, this);
    });
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  requestManagerSubscription: Subscription;
  dataOnLoad = true;
  ngOnInit() {
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'emailId', name: 'Email' },
        { value: 'userId', name: 'User Id' },
        { value: 'panNumber', name: 'PAN' }
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'emailId', name: 'Email' },
        { value: 'mobileNumber', name: 'Mobile No' },
        { value: 'userId', name: 'User Id' },
        { value: 'panNumber', name: 'PAN' }
      ]
    }
    const userId = this.utilsService.getLoggedInUserID();
    this.agentId = userId;
    this.getStatus();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      if (this.searchVal) {
        this.searchParam.mobileNumber = this.searchVal;
        this.search('mobile');
      }
      else if (this.searchStatusId) {
        this.searchParam.statusId = this.searchStatusId;
        this.search('status');
      }
      else {
        if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
          this.filerId = this.agentId;
          this.partnerType = this.utilsService.getPartnerType();
          this.search();
        } else {
          this.dataOnLoad = false;
        }

      }

    })
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.requestManagerSubscription.unsubscribe();
    this.cacheManager.clearCache();
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
  }

  LIFECYCLE = 'LIFECYCLE';
  async requestCompleted(res: any, self: ItrAssignedUsersComponent) {
    console.log(res);
    this.loading = false;
    switch (res.api) {
      case this.LIFECYCLE: {
        const fyList = await this.utilsService.getStoredFyList();
        const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

        if (self.rowData.openItrId === 0) {
          this.loading = true;
          let profile = await this.getUserProfile(self.rowData.userId).catch(error => {
            this.loading = false;
            console.log(error);
            this.utilsService.showSnackBar(error.error.detail);
            return;
          });

          let objITR
          if (this.rowData.serviceType === 'ITRU') {
            objITR = this.utilsService.createEmptyJson(profile, 'ITRU', "2023-2024", "2022-2023");
            objITR.isITRU = true;
          } else {
            objITR = this.utilsService.createEmptyJson(profile, 'ITR', currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
          }
          objITR.filingTeamMemberId = this.rowData.callerAgentUserId;//loggedInId;
          console.log('obj:', objITR);

          const param = '/itr';
          this.itrMsService.postMethod(param, objITR).subscribe((result: any) => {
            console.log('My iTR Json successfully created-==', result);
            this.loading = false;
            objITR = result;
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(objITR));
            this.router.navigate(['/itr-filing/itr'], {
              state: {
                userId: self.rowData.userId,
                panNumber: self.rowData.panNumber,
                eriClientValidUpto: self.rowData.eriClientValidUpto,
                name: this.rowData.name
              }
            });
          }, error => {
            this.loading = false;
          });
          this.loading = false;
          console.log('end');
        } else {
          let itrFilter = self.rowData.itrObjectStatus !== 'MULTIPLE_ITR' ? `&itrId=${self.rowData.openItrId}` : '';
          let assessmentYear = self.rowData.serviceType === 'ITRU' ? '2023-2024' : self.rowData.assessmentYear;
          const param = `/itr?userId=${self.rowData.userId}&assessmentYear=${assessmentYear}` + itrFilter;
          this.itrMsService.getMethod(param).subscribe(async (result: any) => {
            console.log(`My ITR by ${param}`, result);
            if (result == null || result.length == 0) {
              this.utilsService.showErrorMsg('Something went wrong. Please try again');
            } else if (result.length == 1) {
              let workingItr = result[0];

              workingItr.filingTeamMemberId = this.rowData.callerAgentUserId;//loggedInId;
              let serviceType = workingItr.isITRU ? 'ITRU' : 'ITR';
              let obj = this.utilsService.createEmptyJson(null, serviceType, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
              Object.assign(obj, workingItr);
              console.log('obj:', obj);
              workingItr = JSON.parse(JSON.stringify(obj));
              try {
                sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
              } catch (e) {
                this.utilsService.showSnackBar('Please try with manual filling');
                this.sendEmail(JSON.stringify(workingItr));
                workingItr.capitalGain = null;
                this.utilsService.saveItrObject(workingItr).subscribe((result: any) => {
                  console.log('itr cg cleared');
                });
                console.log("Local Storage is full, Please empty data");
                return;
              }
              this.router.navigate(['/itr-filing/itr'], {
                state: {
                  userId: this.rowData.userId,
                  panNumber: this.rowData.panNumber,
                  eriClientValidUpto: this.rowData.eriClientValidUpto,
                  name: this.rowData.name
                }
              });
            } else {
              this.router.navigateByUrl('/tasks/filings',
                { state: { 'mobileNumber': this.rowData.mobileNumber } });
            }
          }, async (error: any) => {
            console.log('Error:', error);
            this.utilsService.showErrorMsg('Something went wrong. Please try again');
          });

        }
        break;
      }
    }
  }

  sendEmail(ITR_JSON) {
    this.loading = true;
    let data = new FormData();
    data.append('from', 'ashwini@taxbuddy.com');
    data.append('subject', 'Large ITR object case');
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
                                    <td style="font-size: 14px;color: #333;"> <br> <br> <span style="font-weight: bold">Dear Team,</span><br /> <br>
                                        <p style="margin: 0;line-height: 24px;font-size: 14px;"> Please Check the below attached json that is too large </p> <br>


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
    data.append('isHtml', 'true');
    data.append('to', 'ashwini@taxbuddy.com');
    const dto_object = new Blob([ITR_JSON], {
      type: 'application/json'
    })

    data.append('file', dto_object, "itr.json");
    let param = '/send-mail';
    this.userMsService.postMethod(param, data).subscribe((res: any) => {
      console.log(res);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar(error.error.text);
    });
  }

  checkFilerAssignment(data: any) {
    this.loading = true;
    if ('ITR' === data.serviceType) {
      const notAllowedStatuses = [18, 15, 16, 32, 45, 33];
      if (notAllowedStatuses.includes(data.statusId)) {
        this.loading = false;
        this.utilsService.showSnackBar('Your status should be either Doc Incomplete or Doc Uploaded to start preparing on ITR');
        return;
      }
    }

    // https://uat-api.taxbuddy.com/user/check-filer-assignment?userId=16387&assessmentYear=2023-2024&serviceType=ITR
    let serviceType = '';
    if (data.serviceType === 'ITRU') {
      serviceType = `&serviceType=ITRU`
    }
    let param = `/check-filer-assignment?userId=${data.userId}${serviceType}`;
    this.userMsService.getMethod(param).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          if (response.data.filerAssignmentStatus === 'FILER_ASSIGNED') {
            this.checkSubscription(data);
          } else {
            this.utilsService.showSnackBar(
              'Please make sure that filer assignment should be done before ITR filing.'
            );
          }
        } else {
          this.utilsService.showSnackBar(
            'Please make sure that filer assignment should be done before ITR filing.'
          );
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Please make sure that filer assignment should be done before ITR filing.'
        );
      }
    );

  }

  checkSubscription(data: any) {
    const loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));

    let itrSubscriptionFound = false;
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.loading = true;
    let param;
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      if (loggedInSme[0].partnerType === 'PRINCIPAL') {
        param = `/bo/subscription-dashboard-new?filerUserId=${loggedInSmeUserId}&searchAsPrincipal=true&userId=${data?.userId}&page=0&pageSize=100`;
      } else {
        param = `/bo/subscription-dashboard-new?filerUserId=${loggedInSmeUserId}&userId=${data?.userId}&page=0&pageSize=100`;
      }
    } else if (this.loggedInUserRoles.includes('ROLE_LEADER')) {
      param = `/bo/subscription-dashboard-new?leaderUserId=${loggedInSmeUserId}&mobileNumber=${data?.mobileNumber}&page=0&pageSize=100`;
    } else {
      param = `/bo/subscription-dashboard-new?mobileNumber=${data?.mobileNumber}&page=0&pageSize=100`;
    }
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.data.content instanceof Array && response.data.content.length > 0) {
        console.log(response);
        response.data.content.forEach((item: any) => {
          let smeSelectedPlan = item?.smeSelectedPlan;
          let userSelectedPlan = item?.userSelectedPlan;
          let item1 = item?.item;
          console.log(data.serviceType)
          if (data.serviceType === 'ITR') {
            if (smeSelectedPlan && (smeSelectedPlan.servicesType === 'ITR')) {
              itrSubscriptionFound = true;
              return;
            } else if (userSelectedPlan && (userSelectedPlan.servicesType === 'ITR')) {
              itrSubscriptionFound = true;
              return;
            }
          }

          if (data.serviceType === 'ITRU') {
            if (smeSelectedPlan && (smeSelectedPlan.servicesType === 'ITRU' && ((item1.financialYear === "2021-2022" || item1.financialYear === "2022-23" || item1.financialYear === "2022-2023")))) {
              itrSubscriptionFound = true;
              return;
            } else if (userSelectedPlan && (userSelectedPlan.servicesType === 'ITRU' && ((item1.financialYear === "2021-2022" || item1.financialYear === "2022-23" || item1.financialYear === "2022-2023")))) {
              itrSubscriptionFound = true;
              return;
            }
          }


        });
        if (itrSubscriptionFound) {
          this.startFiling(data);
        } else {
          this.utilsService.showSnackBar('Please make sure the subscription is created for user before start filing.');
        }
      } else {
        this.utilsService.showSnackBar('Please make sure the subscription is created for user before start filing.');
      }
    });
  }

  getStatus(serviceType?) {
    // 'https://dev-api.taxbuddy.com/user/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&serviceType=ITR'
    let param;
    if (serviceType) {
      param = '/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&serviceType=' + serviceType;
    } else {
      // https://uat-api.taxbuddy.com/user/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&allItrServiceType=true
      param = '/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&allItrServiceType=true';
    }
    this.userService.getMethod(param).subscribe(
      (response) => {
        if (response instanceof Array && response.length > 0) {
          this.searchParam.statusId = null;
          this.itrStatus = response;
          this.itrStatus.sort((a, b) => a.sequence - b.sequence);
        } else {
          this.itrStatus = [];
        }
      },
      (error) => {
        console.log('Error during fetching status info.');
      }
    );




  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.search('', '', event);
    }
  }

  leaderId: number;
  filerId: number;
  fromSme(event, item) {
    if (item === 1) {
      this.leaderId = event ? event.userId : null;
    } else if (item === 2) {
      this.partnerType = event.partnerType;
      this.filerId = event ? event.userId : null;
    } else if (item === 3) {
      this.partnerType = event.partnerType;
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

    if (this.loggedInUserRoles.includes('ROLE_ADMIN')) {
      if (this.leaderId && !this.filerId) {
        this.disableCheckboxes = false;
      } else {
        this.disableCheckboxes = true;
      }
    } else if (this.loggedInUserRoles?.includes('ROLE_LEADER')) {
      if (this.filerId) {
        this.disableCheckboxes = true;
      } else {
        this.disableCheckboxes = false;
      }
    }
  }


  onCheckBoxChange() {
    if (this.unAssignedUsersView.value) {
      if (this.loggedInUserRoles.includes('ROLE_ADMIN')) {
        if (this.leaderId && !this.filerId) {
          this.disableCheckboxes = false;
        } else {
          this.disableCheckboxes = true;
          this.utilsService.showSnackBar("Please select a leader  before ticking the checkbox and search");
          this.unAssignedUsersView.setValue(false);
          return;
        }
      }
      this.clearUserFilter = moment.now().valueOf();
      this.cacheManager.clearCache();
      this.searchParam.serviceType = null;
      this.searchParam.statusId = null;
      this.searchParam.page = 0;
      this.searchParam.pageSize = 20;
      this.searchParam.mobileNumber = null;
      this.searchParam.emailId = null;
      if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
        this.agentId = this.utilsService.getLoggedInUserID();
        this.filerId = this.filerId = this.agentId;
        this.partnerType = this.utilsService.getPartnerType();
      }
      this?.serviceDropDown?.resetService();
      this.usersGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  isColumnExpanded: boolean = false;

  toggleColumnExpansion(): void {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
  }


  isSelectionAllowed(data) {
    // console.log(data);
    // console.log(Math.abs(moment(data.statusUpdatedDate).diff(moment.now()))/1000/60);
    let filteredPlans = ["Salary & House Property Plan", "Capital Gain Plan"]
    return !(data.serviceType === 'ITR' && !data.filerUserId && (!data.subscriptionPlan || filteredPlans.includes(data.subscriptionPlan))
      && Math.abs(moment(data.statusUpdatedDate).diff(moment.now())) / 1000 / 60 <= AppConstants.DISABLITY_TIME_MINS);
  }

  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    let statusSequence = 0;
    let hideTaxPayble
    if (this.utilsService.isNonEmpty(this.taxPayable)) {
      hideTaxPayble = true;
    } else {
      hideTaxPayble = false;
    }
    let columnDefs: ColDef[] = [
      {
        field: 'Re Assign',
        headerCheckboxSelection: true,
        width: 110,
        hide: !(this.showReassignButton || this.showReassignmentBtn.length),
        pinned: 'left',
        lockPosition: true,
        suppressMovable: true,
        checkboxSelection: (params) => {
          return this.isSelectionAllowed(params.data);
          // return this.showReassignButton || (this.showReassignmentBtn.length && params.data.statusId != 11);
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };
        },
      },
      {
        headerName: 'Client Name',
        field: 'name',
        width: 160,
        suppressMovable: true,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email Address',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // code to masking mobile no
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
              const maskedMobile = this.maskMobileNumber(mobileNumber);
              return maskedMobile;
            } else {
              return mobileNumber;
            }
          } else {
            return '-'
          }
        },
      },
      {
        headerName: 'leader Name',
        field: 'leaderName',
        width: 110,
        suppressMovable: true,
        // hide: !showOwnerCols,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        suppressMovable: true,
        // hide: !showOwnerCols,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Tax Payable',
        field: 'taxPayable',
        width: 150,
        suppressMovable: true,
        hide: !hideTaxPayble,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (params) => {
          const value = params.value;
          if (value === null || value === undefined || value === '') {
            return '-';
          } else if (value < 0 || !this.taxPayable) {
            return `(${Math.abs(value)})`;
          }
          return value;
        },
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language',
        field: 'language',
        width: 115,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Subscription Plan',
        field: 'subscriptionPlan',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'PAN Number',
        field: 'panNumber',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Payment Status',
        field: 'paymentStatus',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          if (params?.data?.paymentStatus) {
            return params?.data?.paymentStatus;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'AIS Password Status',
        field: 'aisProvided',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          if (params?.data?.aisProvided) {
            return 'Yes';
          } else {
            return 'No';
          }
        }
      },
      {
        headerName: 'ERI Client',
        field: 'eriClientValidUpto',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value !== null)
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          else return '-';
        },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Status Updated',
        field: 'statusUpdatedDate',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data !== null)
            return formatDate(data.value, 'dd/MM/yyyy HH:mm', this.locale);
          else
            return '-';
        },
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Other Options',
        headerClass: 'single-column-header',
        suppressMenu: true,
        suppressMovable: true,
        cellRenderer: (params: any) => {
          return `<button type="button" class="action_icon add_button" title="More Options"
            style="border: none; background: transparent; font-size: 12px; cursor:pointer;" data-action-type="others"
            (click)="toggleColumnExpansion()">
            <i class="fas ${this.isColumnExpanded ? 'fa-chevron-right' : 'fa-chevron-left'}" aria-hidden="true" data-action-type="others"></i>
          </button>`;
        },
        width: 85,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
      {
        headerName: 'Start Filing',
        width: 90,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (params.data.serviceType === 'ITR' || params.data.serviceType === 'ITRU') {
            const isITRU = params.data.serviceType === 'ITRU';
            console.log(params.data.itrObjectStatus, params.data.openItrId, params.data.lastFiledItrId);
            if (!params.data.itrObjectStatus || params.data.itrObjectStatus === null) { // From open till Document uploaded)
              return `<button type="button" class="action_icon add_button" data-action-type="yetToStart" style="padding: 0px 10px;  border-radius: 40px;
              cursor:pointer; background-color:#FBEED3; color:#A36543;" >
              <i class="fas fa-flag-checkered" title="No action taken yet" aria-hidden="true" data-action-type="yetToStart"></i> Yet to Start
              </button>`;
            } else if (params.data.statusId === 14) { //backed out
              return `<button type="button" class="action_icon add_button" data-action-type="startFiling" style="border: none;
              background: transparent; font-size: 16px; cursor:pointer;color: red" >
              <i class="fa fa-circle" title="User Backed out" aria-hidden="true" data-action-type="startFiling"></i>
              </button>`;
            } else if (params.data.itrObjectStatus === 'ITR_FILED') { // ITR filed
              return `<button type="button" class="action_icon add_button" data-action-type="startRevise" title="ITR filed successfully / Click to start revise return" style="padding: 0px 18px;  border-radius: 40px;
              cursor:pointer; background-color:#D3FBDA; color:#43A352;" ${isITRU ? 'disabled' : ''} >
              <i class="fa fa-check" aria-hidden="true" data-action-type="startRevise"></i>
            </button>`;
            } else {
              return `<button type="button" class="action_icon add_button" data-action-type="startFiling" title="Start ITR Filing" style="padding: 0px 10px;  border-radius: 40px;
              cursor:pointer; background-color:#DDEDFF; color:#2D629B;">
              <i class="fa-regular fa-money-check-pen" data-action-type="startFiling"></i> Resume Filing
            </button>`;
            }
          } else {
            return 'NA';
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
      {
        headerName: 'More',
        editable: false,
        suppressMenu: true,
        sortable: false,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="More Options" style="border: none;
            background: transparent; font-size: 12px; cursor:pointer;">
            <i class="fas fa-chevron-right" aria-hidden="true" data-action-type="more-options"></i>
           </button>`;
        },
        width: 65,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
          };
        },
      }
    ];

    let additionalColumns = [];
    if (this.isColumnExpanded) {
      additionalColumns = [
        {
          headerName: 'ITR Form Base Status',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params: any) {
            if (params.data.serviceType === 'ITR') {
              return `<button type="button" class="action_icon add_button" title="see ITR Journey of user"
              style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
              <i class="fa fa-sort-alpha-asc" aria-hidden="true" data-action-type="getItrStatus"></i>
               </button>`;
            } else {
              return '-'
            }
          },
          width: 120,
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
          headerName: 'Call',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params: any) {
            return `<button type="button" class="action_icon add_button" title="Call to user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
            <i class="fa-solid fa-phone" data-action-type="call"></i>
             </button>`;
          },
          width: 60,
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
          headerName: 'Update Status',
          // field: 'statusName',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params: any) {
            const statusName = params.data.statusName;
            const statusColors = {
              'Open': { background: '#D3FBDA', color: '#43A352' }, //green
              'Chat Initiated': { background: '#D3FBDA', color: '#43A352' },
              'Documents Incomplete': { background: '#D3FBDA', color: '#43A352' },
              'Documents Uploaded': { background: '#D3FBDA', color: '#43A352' },
              'Plan Confirmed': { background: '#D3FBDA', color: '#43A352' },
              'Waiting for Confirmation': { background: '#D3FBDA', color: '#43A352' },
              'ITR Confirmation Received': { background: '#D3FBDA', color: '#43A352' },
              'Interested': { background: '#D3FBDA', color: '#43A352' },

              'Backed Out': { background: '#DCDCDC', color: '#808080' },//gray
              'Not Interested': { background: '#DCDCDC', color: '#808080' },
              'Chat Resolved': { background: '#DCDCDC;', color: '#808080' },
              'Back Out - With Refund': { background: '#DCDCDC', color: '#808080' },
              'ITR Filed - E Verification Completed': { background: '#DCDCDC;', color: '#808080' },
              'ITR Filed - E Verification Pending': { background: '#DCDCDC', color: '#808080' },

              // 'Payment Received': { background: '#D3FBDA', color: '#43A352' },
              // 'Proforma Invoice Sent': { background: '#D3FBDA', color: '#43A352' },
              // 'Upgraded Invoice Sent': { background: '#D3FBDA', color: '#43A352' },
              // 'Follow Up': { background: '#DCDCDC', color: '#808080' },
              // 'Preparing ITR': { background: '#D3FBDA', color: '#43A352' },
              // 'Back Out - Without Refund': { background: '#DCDCDC;', color: '#808080' },
              // 'Pay Later': { background: '#DCDCDC', color: '#808080' },
            };
            const statusStyle = statusColors[statusName] || { background: '#DCDCDC', color: '#808080' };

            return `<button class="status-chip" title="Update Status" data-action-type="updateStatus" style="padding: 0px 10px;  border-radius: 40px;
            cursor:pointer; background-color: ${statusStyle.background}; color: ${statusStyle.color};">
            <i class="fa-sharp fa-regular fa-triangle-exclamation" data-action-type="updateStatus"></i> ${params.data.statusName}
            </button>`;
          },

          width: 180,
          pinned: 'right',
          cellStyle: function (params: any) {
            return {
              textAlign: 'left',
              display: 'flex',
              'align-items': 'left',
              'justify-content': 'left',
            };
          },
        },
        {
          headerName: 'Chat',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params: any) {
            return `<button type="button" class="action_icon add_button" title="Open Chat"
              style="border: none; background: transparent; font-size: 16px; color: #3E82CD; cursor:pointer;">
                <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
               </button>`;
          },
          width: 65,
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
          headerName: 'Notes',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params: any) {
            return `<button type="button" class="action_icon add_button" title="Click see/add notes"
            style="border: none; background: transparent; font-size: 17px; cursor:pointer;">
            <i class="far fa-file-alt" style="color:#3E82CD;" aria-hidden="true" data-action-type="addNotes"></i>
             </button>`;
          },
          width: 70,
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
      ];
    }
    columnDefs.splice(columnDefs.length - 2, 0, ...additionalColumns);
    return columnDefs;
  }

  taxPayableRenderer(params: any) {
    const value = params.value;
    if (value === null || value === undefined || value === '') {
      return '-';
    } else if (value < 0) {
      return `(${Math.abs(value)})`;
    }
    return value;
  }

  reassign() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }
    if (selectedRows.length > 1) {
      this.utilsService.showSnackBar('Please select only one entry from table to Re-Assign');
      return;
    }

    let userId = selectedRows.map(row => row.userId);
    const param = '/lanretni/filer-assignment/' + userId[0];
    this.itrMsService.putMethod(param, '').subscribe((result: any) => {
      if (result?.success) {
        this.search();
      } else {
        this.utilsService.showSnackBar(result.message);

      }
    }, (error: any) => {
      this.utilsService.showSnackBar(error.message);
    });
  }

  reassignmentForLeader() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    if (uniqueLeaderUserIds.size !== 1) {
      this.utilsService.showSnackBar('Please select entries with the same Leader, Please Filter further for leader ');
      return;
    }

    let userIdList = selectedRows.map(row => row.userId).join(',');

    this.utilsService.getUserCurrentStatus(userIdList).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let disposable = this.dialog.open(ReAssignActionDialogComponent, {
            width: '65%',
            height: 'auto',
            data: {
              data: selectedRows,
              mode: 'leaderAssignment',
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('result of reassign user ', result);
            if (result?.data === 'success') {
              this.search();
            }
          });
        }
      },
      (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      }
    );

  }

  reassignmentForFiler() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    if (uniqueLeaderUserIds.size !== 1) {
      this.utilsService.showSnackBar('Please select entries with the same Leader, Please Filter further for leader ');
      return;
    }
    let userIdList = selectedRows.map(row => row.userId).join(',');
    this.utilsService.getUserCurrentStatus(userIdList).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let disposable = this.dialog.open(ReAssignActionDialogComponent, {
          width: '65%',
          height: 'auto',
          data: {
            data: selectedRows,
          },
        });
        disposable.afterClosed().subscribe((result) => {
          console.log('result of reassign user ', result);
          if (result?.data === 'success') {
            this.search();
          }
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }

  createRowData(userData: any) {
    let userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        id: userData[i].id,
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : null,
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        serviceType: userData[i].serviceType,
        assessmentYear: userData[i].assessmentYear,
        callerAgentName: userData[i].filerName,
        leaderName: userData[i].leaderName,
        filerName: userData[i].filerName,
        callerAgentNumber: userData[i].filerMobile,
        callerAgentUserId: userData[i].filerUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        statusName: userData[i].statusName,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        eriClientValidUpto: userData[i].eriClientValidUpto,
        language: userData[i].language,
        subscriptionPlan: userData[i].subscriptionPlan,
        itrObjectStatus: userData[i].itrObjectStatus,
        openItrId: userData[i].openItrId,
        lastFiledItrId: userData[i].lastFiledItrId,
        conversationWithFiler: userData[i].conversationWithFiler,
        ownerUserId: userData[i].ownerUserId,
        filerUserId: userData[i].filerUserId,
        leaderUserId: userData[i].leaderUserId,
        paymentStatus: userData[i].paymentStatus,
        aisProvided: userData[i].aisProvided,
        everified: userData[i].everified,
        taxPayable: userData[i].taxPayable,
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          this.redirectTowardSubscription(params.data);
          break;
        }
        case 'profile': {
          this.router.navigate([
            'pages/user-management/profile/' + params.data.userId,
          ]);
          break;
        }
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'link-to-doc-cloud': {
          this.linkToDocumentCloud(params.data.userId);
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
          break;
        }
        case 'call': {
          this.call(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'more-options': {
          this.moreOptions(params.data);
          break;
        }
        case 'yetToStart': {
          this.checkFilerAssignment(params.data);
          break;
        }
        case 'startFiling': {
          this.checkSubscription(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
        case 'getItrStatus': {
          this.getItrStatus(params.data);
          break;
        }
        case 'others': {
          this.toggleColumnExpansion();
          break;
        }
      }
    }
  }

  getItrStatus(data) {
    let disposable = this.dialog.open(ItrStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: data.userId,
        clientName: data.name,
        serviceType: data.serviceType,
        userInfo: data
      }
    })

    disposable.afterClosed().subscribe(result => {
    });

  }

  rowData: any;

  async startFiling(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(async (res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        console.log(data);

        if (data.id && data.id !== null && (!data.itrObjectStatus || data.itrObjectStatus === null)) {
          this.userMsService.patchMethod("/customer/" + data.id, { itrObjectStatus: 'PREPARING_ITR' }).subscribe(res => {
            console.log("update itr object status", res);
          });
        }

        const fyList = await this.utilsService.getStoredFyList();
        const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

        //update ITR lifecycle api for filing started state
        let reqData = {
          userId: data.userId,
          assessmentYear: currentFyDetails[0].assessmentYear,
          taskKeyName: 'itrFilingComences',
          taskStatus: 'Completed',
          serviceType: data.serviceType
        };
        const userData = JSON.parse(localStorage.getItem('UMD') || '');
        const TOKEN = userData ? userData.id_token : null;
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('environment', environment.lifecycleEnv);
        headers = headers.append('Authorization', 'Bearer ' + TOKEN);
        this.rowData = data;
        this.loading = true;
        this.requestManager.addRequest(this.LIFECYCLE,
          this.http.post(environment.lifecycleUrl, reqData, { headers: headers }));
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  openReviseReturnDialog(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        console.log('Data for revise return ', data);
        if (data.everified === false) {
          this.utilsService.showSnackBar(
            'Please complete e-verification before starting with revised return'
          );
        } else if (data.statusId == 11 || data.statusId == 8 || data.statusId == 47) {
          let disposable = this.dialog.open(ReviseReturnDialogComponent, {
            width: '50%',
            height: 'auto',
            data: data
          })
          disposable.afterClosed().subscribe(result => {
            if (result === 'reviseReturn') {
              this.router.navigate(['/itr-filing/itr'], {
                state: {
                  userId: data.userId,
                  panNumber: data.panNumber,
                  eriClientValidUpto: data.eriClientValidUpto,
                  name: data.name
                }
              });
            }
            console.log('The dialog was closed', result);
          });
        }
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });

  }


  redirectTowardInvoice(userInfo: any) {
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo: any) {
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId: any) {
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userMsService.postMethod(param, request).subscribe((res: any) => {
      this.loading = false;
      if (res.success) {
        if (res.data.isFnbVirtualUser) {
          this.utilsService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utilsService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utilsService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
      } else {
        this.utilsService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
    })
  }

  linkToDocumentCloud(userId: any) {
    this.router.navigate(['/pages/itr-filing/user-docs/' + userId]);
  }

  async call(data) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    this.utilsService
      .getUserCurrentStatus(data.userId)
      .subscribe(async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let agent_number;
          this.loading = true;
          const param = `tts/outbound-call`;
          const agentNumber = await this.utilsService.getMyCallingNumber();
          console.log('agent number', agentNumber);
          if (!agentNumber) {
            this._toastMessageService.alert(
              'error',
              "You don't have calling role."
            );
            return;
          }

          agent_number = agentNumber;
          const reqBody = {
            agent_number: agent_number,
            userId: data.userId,
          };

          this.reviewService.postMethod(param, reqBody).subscribe(
            (result: any) => {
              this.loading = false;
              if (result.success) {
                this._toastMessageService.alert('success', result.message);
              } else {
                this.utilsService.showSnackBar(
                  'Error while making call, Please try again.'
                );
              }
            },
            (error) => {
              this.utilsService.showSnackBar(
                'Error while making call, Please try again.'
              );
              this.loading = false;
            }
          );
        }
      }, error => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      });
  }

  updateStatus(mode, client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let disposable = this.dialog.open(ChangeStatusComponent, {
          width: '60%',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.serviceType,
            mode: mode,
            userInfo: client,
            itrChatInitiated: true
          }
        })

        disposable.afterClosed().subscribe(result => {
          if (result) {
            if (result.data === "statusChanged") {
              this.search();
            }
          }
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });

  }
  showNotes(client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let disposable = this.dialog.open(UserNotesComponent, {
          width: '75vw',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.serviceType,
            clientMobileNumber: client.mobileNumber
          }
        })

        disposable.afterClosed().subscribe(result => {
          this.search();
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });

  }

  isChatOpen = false;
  kommChatLink = null;

  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        requestId: client.requestId
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result.id) {
        this.isChatOpen = true;
        this.chatManager.openConversation(result.id)
        this.kommChatLink = this.sanitizer.bypassSecurityTrustUrl(result.kommChatLink);
      }
      else if(result?.request_id){
        this.chatBuddyDetails = result;
        localStorage.setItem("SELECTED_CHAT", JSON.stringify(this.chatBuddyDetails));
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);
     }

    });

  }



  moreOptions(client) {
    console.log('client', client)
    client.hideReassign = !this.isSelectionAllowed(client);
    let disposable = this.dialog.open(MoreOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: client
    })
    disposable.afterClosed().subscribe(result => {
      console.log('result after more option closed', result)
      if (result?.data === 'success') {
        this.search();
      }
    });
  }

  openBulkReAssignment() {
    let disposable = this.dialog.open(BulkReAssignDialogComponent, {
      width: '100%',
      height: 'auto',
    })
  }


  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.getStatus();
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.taxPayable = null;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.searchParam.itrObjectStatus = null;
    this.unAssignedUsersView.setValue(false);
    if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.agentId = this.utilsService.getLoggedInUserID();
      this.filerId = this.filerId = this.agentId;
      this.partnerType = this.utilsService.getPartnerType();
    }
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    if (this.dataOnLoad) {
      this.search();
    } else {
      //clear grid for loaded data
      this.usersGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  search = (form?, isAgent?, pageChange?): Promise<any> => {

    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }

    let loggedInId = this.utilsService.getLoggedInUserID();
    if (form == 'mobile') {
      this.searchParam.page = 0;
      if (this.searchParam.mobileNumber == null || this.searchParam.mobileNumber == '') {
        this.searchParam.mobileNumber = null;
      } else {
        this.searchParam.emailId = null;
      }
      if (this.searchParam.emailId == null || this.searchParam.emailId == '') {
        this.searchParam.emailId = null;
      } else {
        this.searchParam.mobileNumber = null;
      }

    } else if (form == 'status') {
      this.searchParam.page = 0;
      this.searchParam.mobileNumber = null
      this.searchParam.emailId = null

    } else if (form == 'serviceType') {
      this.searchParam.page = 0;
      this.searchParam.status = null;
      this.searchParam.mobileNumber = null
      this.searchParam.emailId = null
    } else if (form == 'agent') {
      this.searchParam.page = 0;
    }
    if (this.searchParam.emailId) {
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    // 'https://dev-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&serviceType=ITR'
    //'https://dev-api.taxbuddy.com/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&serviceType=ITR&filerUserId=779519'
    // 'https://dev-api.taxbuddy.com/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&leaderUserId=1064&serviceType=ITR'
    let param = `/bo/user-list-new?${data}&itrChatInitiated=true`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach(key => {
        param = param + '&' + key + '=' + this.searchBy[key];
      });
    }


    if (this.filerId === this.agentId) {
      param = param + `&filerUserId=${this.filerId}`;
    }

    if (this.partnerType === 'PRINCIPAL') {
      param = param + '&searchAsPrincipal=true';
    };
    if (this.leaderId === this.agentId) {
      param = param + `&leaderUserId=${this.leaderId}`;
    }

    if (this.agentId === loggedInId && this.loggedInUserRoles.includes('ROLE_LEADER')) {
      param = param + `&leaderUserId=${this.agentId}`;
    }

    if (this.utilsService.isNonEmpty(this.taxPayable)) {
      param = param + `&taxPayable=${this.taxPayable}`;
    }

    if (this.unAssignedUsersView.value) {
      // https://uat-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&itrChatInitiated=true&serviceType=ITR&leaderUserId=14163&assigned=false
      param = param + '&assigned=false'
    }
    return this.reportService.getMethod(param).toPromise().then((result: any) => {
      this.loading = false;
      if (result.success) {
        if (result.data && result.data['content'] instanceof Array) {
          this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
          this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
          this.userInfo = result.data['content'];
          this.config.totalItems = result.data.totalElements;
          this.cacheManager.initializeCache(result.data['content']);

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, result.data['content']);
          this.config.currentPage = currentPageNumber;

        } else {
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert('error', result.message)
        }
      } else {
        this._toastMessageService.alert("error", result.message);
        this.usersGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
    }).catch(() => {
      this.loading = false;
      this.config.totalItems = 0;
      this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
    });
  }

  closeChat() {
    this.chatBuddyDetails = null;
  }

  async downloadReport() {
    let loggedInId = this.utilsService.getLoggedInUserID();
    if (this.utilsService.isNonEmpty(this.searchParam.emailId)) {
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }
    let serviceType = ''
    if (this.utilsService.isNonEmpty(this.searchParam.serviceType)) {
      serviceType += `&serviceType=${this.searchParam.serviceType}`;
    }

    let status = ''
    if (this.utilsService.isNonEmpty(this.searchParam.statusId)) {
      status += `&statusId=${this.searchParam.statusId}`;
    }

    let itrObjectStatus = ''
    if (this.utilsService.isNonEmpty(this.searchParam.itrObjectStatus)) {
      itrObjectStatus += `&itrObjectStatus=${this.searchParam.itrObjectStatus}`;
    }
    let param = `/bo/user-list-new?itrChatInitiated=true${status}${serviceType}${itrObjectStatus}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach(key => {
        param = param + '&' + key + '=' + this.searchBy[key];
      });
    }

    let filerId;
    if (this.filerId === this.agentId) {
      filerId = this.filerId;
      param = param + `&filerUserId=${this.filerId}`;
    }

    if (this.partnerType === 'PRINCIPAL') {
      param = param + '&searchAsPrincipal=true';
    };
    let leaderId;
    if (this.leaderId === this.agentId) {
      leaderId = this.leaderId;
      param = param + `&leaderUserId=${this.leaderId}`;
    }

    if (this.agentId === loggedInId && this.loggedInUserRoles.includes('ROLE_LEADER')) {
      leaderId = this.agentId;
      param = param + `&leaderUserId=${this.agentId}`;
    }
    if (!leaderId && !filerId) {
      this.utilsService.showSnackBar('Please select leader Name to download csv');
      return;
    }

    this.loading = true;
    this.showCsvMessage = true;


    if (this.utilsService.isNonEmpty(this.taxPayable)) {
      param = param + `&taxPayable=${this.taxPayable}`;
    }

    if (this.unAssignedUsersView.value) {
      // https://uat-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&itrChatInitiated=true&serviceType=ITR&leaderUserId=14163&assigned=false
      param = param + '&assigned=false'
    }

    let fieldName = [];
    let taxPayableArray = [];
    if (this.utilsService.isNonEmpty(this.taxPayable)) {
      taxPayableArray = [
        { key: 'taxPayable', value: 'Tax Payable' }
      ]
    }
    if (this.loggedInUserRoles.includes('ROLE_ADMIN') || this.loggedInUserRoles.includes('ROLE_LEADER')) {
      fieldName = [
        { key: 'name', value: 'Client Name' },
        { key: 'email', value: 'Email Address' },
        { key: 'customerNumber', value: 'Mobile No' },
        { key: 'leaderName', value: 'leader Name' },
        { key: 'filerName', value: 'Filer Name' },
        { key: 'serviceType', value: 'Service Type' },
        { key: 'language', value: 'Language' },
        { key: 'subscriptionPlan', value: 'Subscription Plan' },
        { key: 'panNumber', value: 'PAN Number' },
        { key: 'paymentStatus', value: 'Payment Status' },
        { key: 'aisProvided', value: 'AIS Password Status' },
        { key: 'eriClientValidUpto', value: 'ERI Client' },
        { key: 'createdDate', value: 'Created Date' },
        { key: 'statusUpdatedDate', value: 'Status Updated' },
        { key: 'userId', value: 'User Id' },
      ];
    } else {
      fieldName = [
        { key: 'name', value: 'Client Name' },
        { key: 'email', value: 'Email Address' },
        { key: 'leaderName', value: 'leader Name' },
        { key: 'filerName', value: 'Filer Name' },
        { key: 'serviceType', value: 'Service Type' },
        { key: 'language', value: 'Language' },
        { key: 'subscriptionPlan', value: 'Subscription Plan' },
        { key: 'panNumber', value: 'PAN Number' },
        { key: 'paymentStatus', value: 'Payment Status' },
        { key: 'aisProvided', value: 'AIS Password Status' },
        { key: 'eriClientValidUpto', value: 'ERI Client' },
        { key: 'createdDate', value: 'Created Date' },
        { key: 'statusUpdatedDate', value: 'Status Updated' },
        { key: 'userId', value: 'User Id' },
      ];
    }
    if (taxPayableArray.length) {
      fieldName = fieldName.concat(taxPayableArray);
    }
    await this.genericCsvService.downloadReport(
      environment.url + '/report', param, 0, 'ITR-Assigned Users', fieldName, {}, this.taxPayable);
    this.loading = false;
    this.showCsvMessage = false;
  }

}
