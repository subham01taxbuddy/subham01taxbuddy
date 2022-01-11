import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { Router } from '@angular/router';
import { AppConstants } from 'app/shared/constants';
import { MatDialog } from '@angular/material';
import { FilingStatusDialogComponent } from '../filing-status-dialog/filing-status-dialog.component';
import { ReviseReturnDialogComponent } from '../revise-return-dialog/revise-return-dialog.component';
import moment = require('moment');
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { environment } from 'environments/environment';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
declare function matomo(title: any, url: any, event: any, scriptId: any);

@Component({
  selector: 'app-my-team-itrs',
  templateUrl: './my-team-itrs.component.html',
  styleUrls: ['./my-team-itrs.component.css']
})

export class MyTeamItrsComponent implements OnInit {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
  selectedFyYear = '';
  config: any;
  pageWiseItr: any = [];
  filingTeamMembers = [
  ];
  // myFilingTeamMembers = [];
  selectedMember: String = '';
  selectedMemberId: any;
  selectedPageNo = 0;
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private toastMsgService: ToastMessageService,
    private router: Router, private dialog: MatDialog,) {
    // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'))
    this.filingTeamMembers.sort((a, b) => a.label > b.label ? 1 : -1)
    // this.myFilingTeamMembers = this.filingTeamMembers;
    // var filingMemberId = loggedInUserData.USER_UNIQUE_ID;
    // if (filingMemberId !== 1065 && filingMemberId !== 1067 && filingMemberId !== 21354 && filingMemberId !== 12172) {
    //   if (filingMemberId === 1707) {
    //     filingMemberId = 1063;
    //   }
    //   this.myFilingTeamMembers = this.filingTeamMembers.filter(item => item.teamLeadId === filingMemberId);
    // } else {
    //   this.myFilingTeamMembers = this.filingTeamMembers;
    // }
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData([]),
      columnDefs: this.myItrsCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      floatingFilter: true
    };

    this.config = {
      itemsPerPage: 50,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getSmeList();
  }

  fromFy(event) {
    // this.searchParams = event;
    this.selectedFyYear = event;
    console.log(event);
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    if (this.selectedMemberId !== null)
      this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
  }

  fromSme(event) {
    // this.searchParams = event;
    // this.selectedFyYear = event;
    this.selectedMemberId = event;
    console.log(event);
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    if (this.selectedMemberId !== null)
      this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
  }

  getMembersItr(id, fy, pageNo) {
    this.loading = true;
    this.selectedMemberId = id;
    this.config.currentPage = pageNo + 1;
    if (this.utilsService.isNonEmpty(this.selectedMemberId)) {
      this.selectedMember = this.filingTeamMembers.filter(item => item.userId === id)[0].name;
      matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'Select SME', this.selectedMember], environment.matomoScriptId);
    }

    return new Promise((resolve, reject) => {

      let reqBody = {
        'financialYear': fy,
        'filingTeamMemberId': id
      }
      // const loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
      // const param = `/itr-by-filingTeamMemberId?filingTeamMemberId=${id}`;
      let param = `/itr-search?page=${pageNo}&size=50`;
      let param2 = reqBody;
      this.itrMsService.postMethod(param, param2).subscribe((res: any) => {
        if (res['content'] instanceof Array) {
          this.pageWiseItr = res['content'];
          this.itrDataList = this.pageWiseItr;
          this.config.totalItems = res.totalElements;
          this.myItrsGridOptions.api.setRowData(this.createOnSalaryRowData(res['content']));
        }

        // if (res && res.success) {
        //   this.itrDataList = res.data;
        //   this.myItrsGridOptions.api.setRowData(this.createOnSalaryRowData(res.data));
        // } else {
        //   this.itrDataList = [];
        //   this.myItrsGridOptions.api.setRowData(this.createOnSalaryRowData([]));
        // }
        this.loading = false;
        return resolve(true)
      }, error => {
        this.loading = false;
        return resolve(false)
      })
    });
  }
  getCount(val) {
    return this.itrDataList.filter(item => item.eFillingCompleted === val).length
  }
  createOnSalaryRowData(data) {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        userId: data[i].userId,
        fName: data[i].family !== null ? data[i].family[0].fName : '',
        lName: data[i].family !== null ? data[i].family[0].lName : '',
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        ackStatus: data[i].ackStatus,
        acknowledgementReceived: data[i].acknowledgementReceived,
        eFillingCompleted: data[i].eFillingCompleted,
        eFillingDate: data[i].eFillingDate,
        nextYearTpa: data[i].nextYearTpa,
        isReviewGiven: data[i].reviewGiven,
        isEverified: data[i].isEverified,
        isRevised: data[i].isRevised,
      });
    }
    return newData;
  }
  myItrsCreateColumnDef() {
    return [
      {
        headerName: 'ITR ID',
        field: 'itrId',
        sortable: true,
        width: 70,
        pinned: 'left',
      },
      {
        headerName: "Client Name",
        // field: "fName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.data.fName + ' ' + params.data.lName;
        },
      },
      /* {
        headerName: "Last Name",
        field: "lName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, */
      {
        headerName: "Mobile",
        field: "contactNumber",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "ITR Type",
        field: "itrType",
        width: 70,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Filing Date",
        field: "eFillingDate",
        sortable: true,
        width: 100,
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: "PAN Number",
        field: "panNumber",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Email Address",
        field: "email",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Return Type",
        field: "isRevised",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        },
        valueGetter: function (params) {
          if (params.data.isRevised === 'Y') {
            return 'Revised';
          }
          return 'Original'
        },
      },
      {
        headerName: 'Start',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.eFillingCompleted && params.data.ackStatus === 'SUCCESS') {
            return `<button type="button" class="action_icon add_button" title="Acknowledgement not received, Contact team lead" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: green">
            <i class="fa fa-check" title="ITR filed successfully / Click to start revise return" 
            aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
          } else if (params.data.ackStatus === 'DELAY') {
            return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
            background: transparent; font-size: 16px; color: red">
            <i class="fa fa-circle" title="Acknowledgement not received, Contact team lead" 
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-edit" aria-hidden="true" data-action-type="startFiling"></i>
           </button>`;
          }
        },
        cellStyle: function (params) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green'
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange'
            }
          }
        },
      },
      {
        headerName: 'Status',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Show Kommunicate/Whats app chat" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: blueviolet">
            <i class="fa fa-weixin" aria-hidden="true" data-action-type="filingStatus"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'blueviolet'

        },
      },
      // {
      //   headerName: "TPA",
      //   field: "nextYearTpa",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: params => {
      //     return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === "COMPLETED" ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },
      {
        headerName: 'E-Verify',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          if (params.data.isEverified) {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; color: green">
            <i class="fa fa-circle" title="E-Verification is done" 
            aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-check-circle" title="Click to update the E-verification status as done" 
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          }
        },
        cellStyle: function (params) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green'
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange'
            }
          }
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      /* ,
      {
        headerName: 'RR',
        width: 50,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Start Revise return" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: #0dbbc3">
            <i class="fa fa-exchange" aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: '#0dbbc3'

        },
      } */

      // {
      //   headerName: "Doc",
      //   field: "showDocument",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: params => {
      //     return `<button type="button" class="action_icon add_button" title="Show User Documents" style="border: none;
      //             background: transparent; font-size: 16px; color: yellow">
      //             <i class="fa fa-file" data-action-type="showDocs" title="Show User Documents" aria-hidden="true"></i>
      //              </button>`;
      //   },
      // },
      {
        headerName: 'Cloud',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: "Review",
        field: "isReviewGiven",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
    ];
  }
  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startFiling': {
          this.startFiling(params.data);
          break;
        }
        case 'filingStatus': {
          this.openFilingStatusDialog(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
        case 'ackDetails': {
          this.getAcknowledgeDetail(params.data);
          break;
        }
        // case 'isTpa': {
        //   this.interestedForNextYearTpa(params.data);
        //   break;
        // }
        case 'link-to-doc-cloud': {
          this.showUserDocuments(params.data);
          break;
        }
        case 'isReviewGiven': {
          this.updateReviewStatus(params.data);
          break;
        }
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
      }
    }
  }

  async startFiling(data) {
    matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'Actions', data.contactNumber], environment.matomoScriptId);
    var workingItr = this.itrDataList.filter(item => item.itrId === data.itrId)[0]
    console.log('data: ', workingItr);
    Object.entries(workingItr).forEach((key, value) => {
      console.log(key, value)
      if (key[1] === null) {
        delete workingItr[key[0]];
      }
    });
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter(item => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    let obj = this.utilsService.createEmptyJson(null, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear)
    Object.assign(obj, workingItr)
    console.log('obj:', obj)
    workingItr = JSON.parse(JSON.stringify(obj))
    sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
    this.router.navigate(['/pages/itr-filing/customer-profile'])
  }

  openFilingStatusDialog(data) {
    matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'Chat', data.contactNumber], environment.matomoScriptId);
    let disposable = this.dialog.open(FilingStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openReviseReturnDialog(data) {
    console.log('Data for revise return ', data);
    let disposable = this.dialog.open(ReviseReturnDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      if (result === 'reviseReturn') {
        this.router.navigate(['/pages/itr-filing/customer-profile'])
      }
      console.log('The dialog was closed', result);
    });
  }

  getAcknowledgeDetail(data) {
    matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'E-verification', data.contactNumber], environment.matomoScriptId);
    this.loading = true;
    var workingItr = this.itrDataList.filter(item => item.itrId === data.itrId)[0]
    workingItr['everifiedStatus'] = 'Successfully e-Verified';
    workingItr['isEverified'] = true;
    const param = '/itr/' + workingItr.userId + '/' + workingItr.itrId + '/' + workingItr.assessmentYear;
    this.itrMsService.putMethod(param, workingItr).subscribe((result: any) => {
      this.loading = false;
      this.utilsService.showSnackBar('E-Verification status updated successfully');
      this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to update E-Verification status');
    });
    return;
    // const param = `/itr-verify-status/${data.itrId}`;
    this.itrMsService.putMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(res.status)
      this.loading = false;
      setTimeout(() => {
        this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
      }, 5000);

    }, error => {
      this.loading = false;
    })
  }

  // interestedForNextYearTpa(data) {
  //   this.loading = true;
  //   var workingItr = this.itrDataList.filter(item => item.itrId === data.itrId)[0];
  //   workingItr['nextYearTpa'] = 'INTERESTED';
  //   console.log(workingItr);
  //   const param = '/itr/' + workingItr['userId'] + '/' + workingItr['itrId'] + '/' + workingItr['assessmentYear'];
  //   this.itrMsService.putMethod(param, workingItr).subscribe((result: ITR_JSON) => {
  //     this.getMembersItr(this.selectedMemberId);
  //   }, error => {
  //     this.getMembersItr(this.selectedMemberId);
  //   });
  // }

  showUserDocuments(data) {
    console.log(data);
    matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'Cloud', data.contactNumber], environment.matomoScriptId);
    this.router.navigate(['/pages/itr-filing/user-docs/' + data.userId]);
  }

  async getSmeList() {
    this.filingTeamMembers = await this.utilsService.getStoredSmeList();
  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.selectedPageNo = event - 1;
    this.getMembersItr(this.selectedMemberId, this.selectedFyYear, event - 1);
  }

  updateReviewStatus(data) {
    matomo('My Team Tab', '/pages/itr-filing/team-itrs', ['trackEvent', 'My Team', 'Review', data.contactNumber], environment.matomoScriptId);
    const param = `/update-itr-userProfile?itrId=${data.itrId}&userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe(result => {
      console.log(result);
      this.utilsService.showSnackBar('Marked as review given');
      this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
    }, error => {
      this.utilsService.showSnackBar('Please try again, failed to mark as review given');
      this.getMembersItr(this.selectedMemberId, this.selectedFyYear, this.selectedPageNo);
    })
  }

  async startCalling(user) {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    debugger
    if (!agentNumber) {
      this.toastMsgService.alert("error", 'You dont have calling role.')
      return;
    }
    console.log('user: ', user);
    // matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Call', callInfo], environment.matomoScriptId);
    this.loading = true;
    let customerNumber = user.contactNumber;
    const param = `/call-management/make-call`;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": customerNumber
    }
    console.log('reqBody:', reqBody)
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  updateStatus(mode, client) {
    console.log('Client', client);
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'TPA',
        mode: mode,
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log('result: ', result);
      if (result) {

      }
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
