import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { ToastMessageService } from 'app/services/toast-message.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  userList = [];
  openStatusClientsGridOption: GridOptions;

  page = 0; // current page
  count = 0; // total pages
  pageSize = 20; // number of items in each page
  agentId = '';
  loading = false;
  openStatusdata: any = [];
  mobileNo: any;
  selectedAgent: any;
  pageCount: number = 0;
  agentList: any;
  itrList: any = [];

  constructor(private userMsService: UserMsService, public utilService: UtilsService,
    private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string, private toastMsgService: ToastMessageService) {

    this.openStatusClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    //this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
    // if (!environment.production) {
    //   this.agentList = [
    //     { value: 'ashish.hulwan@ssbainnovations.com', label: 'Ashish' },
    //     { value: 'vaibhav.gaikwad@ssbainnovations.com', label: 'Vaibhav' },
    //     { value: 'dev_kommunicate@ssbainnovations.com', label: 'Dev Komm' },
    //     { value: 'barakha@ssbainnovations.com', label: 'Barakha' },
    //     { value: 'karan@ssbainnovations.com', label: 'Karan' },
    //     { value: 'testkommunicate@ssbainnovations.com', label: 'Ajay' }
    //   ];
    // }
  }

  ngOnInit() {
    // console.log('selectedAgentId -> ',localStorage.getItem('selectedAgentId'));
    // let agentId = localStorage.getItem('selectedAgentId');
    // if(this.utilService.isNonEmpty(agentId)){
    //   this.agentId = agentId;
    //   this.retrieveNewUsers(0);
    // }
    // else{
    //   this.retrieveNewUsers(0);
    // }  

    this.getItrList()
  }

  getItrList() {
    let param = `/itr-status-master`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log("Itr info: ", res);
      if (res instanceof Array && res.length > 0) {
        this.itrList = res;
      }
      else {
        this.itrList = [];
      }
    },
      error => {
        console.log("Error occure during getting Itr info: ", error);
      })
  }

  advanceSearch(mobileNo) {
    if (this.utilService.isNonEmpty(mobileNo) && `${mobileNo}`.length === 10) {
      this.getSearchInfo(mobileNo);
    }
    else {
      this.toastMsgService.alert("error", "Enter valid mobile number.")
    }
  }

  usersCreateColoumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Client Mobile',
        field: 'clientMobile',
        width: 130,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Client Name',
        field: 'clientName',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email Id',
        field: 'emailId',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Source',
        field: 'source',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, {
        headerName: 'Platform',
        field: 'platform',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Service',
        field: 'service',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Utm Source',
        field: 'utmSource',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Company Id',
        field: 'companyId',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
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
        headerName: 'Notes',
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
        width: 80,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      // {
      //   headerName: 'Chat Link',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     return `<button type="button" class="action_icon add_button" title="Open Chat Link"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-comments-o" aria-hidden="true" data-action-type="startConversation"></i>
      //      </button>`;
      //   },
      //   width: 80,
      //   pinned: 'right',
      //   cellStyle: function (params) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
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
        width: 80,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        }
      }
    ]
  }

  getSearchInfo(mobileNo) {
    this.loading = true;
    let param = `/user-details-by-mobile-number-es?mobileNumber=${mobileNo}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('open status: ', result, result.length);
      this.loading = false;
      if (result instanceof Array && result.length > 0) {
        this.openStatusdata = result;
        this.openStatusClientsGridOption.api.setRowData(this.createRowData(this.openStatusdata));
      } else {
        this.utilService.showSnackBar('Data not available for searched number.');
      }
    },
      error => {
        this.loading = false;
        console.log('Error during get searched mob no: ', error);
        this.toastMsgService.alert("error", "Unable ot search, try after some time.")
      })
  }


  createRowData(openStatusInfo) {
    console.log('openStatusInfo -> ', openStatusInfo);
    var openStatusInfosArray = [];
    for (let i = 0; i < openStatusInfo.length; i++) {
      let openStatusInfosInfo = Object.assign({}, openStatusInfosArray[i], {
        userId: this.utilService.isNonEmpty(openStatusInfo[i]['userId']) ? openStatusInfo[i]['userId'] : '-',
        createdDate: this.utilService.isNonEmpty(openStatusInfo[i]['CreatedDate']) ? openStatusInfo[i]['CreatedDate'] : '-',
        clientMobile: this.utilService.isNonEmpty(openStatusInfo[i]['Phone']) ? openStatusInfo[i]['Phone'] : '-',
        clientName: (this.utilService.isNonEmpty(openStatusInfo[i]['FirstName']) ? openStatusInfo[i]['FirstName'] : '-') + ' ' + (this.utilService.isNonEmpty(openStatusInfo[i]['LastName']) ? openStatusInfo[i]['LastName'] : '-'),
        emailId: this.utilService.isNonEmpty(openStatusInfo[i]['Email']) ? openStatusInfo[i]['Email'] : '-',
        source: this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']['Source']) ? openStatusInfo[i]['InitialData']['Source'] : '-') : '-',
        platform: this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']['Platform']) ? openStatusInfo[i]['InitialData']['Platform'] : '-') : '-',
        service: this.utilService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']['ServiceType']) ? openStatusInfo[i]['itrStatusLatest']['ServiceType'] : '-') : '-',
        status: this.utilService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']['StatusID']) ? this.getItrStatus(openStatusInfo[i]['itrStatusLatest']['StatusID']) : '-') : '-',
        KommunicateAssigneeId: openStatusInfo[i]['KommunicateAssigneeId'],
        utmSource: this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']['UtmSource']) ? openStatusInfo[i]['InitialData']['UtmSource'] : '-') : '-',
        companId: this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilService.isNonEmpty(openStatusInfo[i]['InitialData']['CompanyID']) ? openStatusInfo[i]['InitialData']['CompanyID'] : '-') : '-',
      })
      openStatusInfosArray.push(openStatusInfosInfo);
    }
    console.log('openStatusInfosArray-> ', openStatusInfosArray)
    return openStatusInfosArray;
  }

  getItrStatus(itrId) {
    let itrLabel = this.itrList.filter(item => item.statusId === itrId)[0].statusName;
    return itrLabel;
  }

  onOpenStatusClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startConversation': {
          this.startConversation(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'updateStatus': {
          this.updaeStatus('Update Status', params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
      }
    }
  }

  startConversation(user) {
    console.log('user: ', user)
    if (this.utilService.isNonEmpty(user.KommunicateAssigneeId)) {
      this.loading = true;
      const param = `/create-km-groupid?userId=${user.userId}&agentId=${user.KommunicateAssigneeId}`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        console.log('Chat Created Result: ', result);
        this.loading = false;
        if (this.utilService.isNonEmpty(result) && this.utilService.isNonEmpty(result.clientGroupId)) {
          window.open(`https://dashboard.kommunicate.io/conversations/${result.clientGroupId}`, "_blank");
        } else {
          this.utilService.showSnackBar('Error while creating conversation, Please try again.');
        }
      }, error => {
        this.utilService.showSnackBar('Error while creating conversation, Please try again.');
        this.loading = false;
      })
    }
    else {
      this.utilService.showSnackBar('Kommuncate Id is ' + user.KommunicateAssigneeId);
    }

  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.clientName
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  updaeStatus(mode, client) {
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.clientName,
        serviceType: client.service,
        mode: mode,
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        if (result.data === "statusChanged") {
          // this.getOpenStatus(this.selectedAgent, 0);
        }
      }
    });
  }

  openChat(client) {
    console.log('client: ', client);
    this.loading = true;
    let sType = client.service;
    if (client.service === '-') {
      sType = 'ITR'
    }
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${sType}`;
    this.userMsService.getMethod(param).subscribe((responce: any) => {
      console.log('open chat link res: ', responce);
      this.loading = false;
      if (responce.success) {
        window.open(responce.data.chatLink)
      }
      else {
        this.toastMsgService.alert('error', responce.message)
      }
    },
      error => {
        console.log('Error during feching chat link: ', error);
        this.toastMsgService.alert('error', 'Error during feching chat, try after some time.')
        this.loading = false;
      })
  }
}