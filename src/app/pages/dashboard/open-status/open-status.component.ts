import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-open-status',
  templateUrl: './open-status.component.html',
  styleUrls: ['./open-status.component.css']
})
export class OpenStatusComponent implements OnInit {

  loading: boolean;
  openStatusClientsGridOption: GridOptions;
  openStatusdata: any = [];
  agent = new FormControl('', Validators.required);
  selectedAgent: any;
  pageCount: number = 0;
  agentList: any;

  constructor(public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string, public utilService: UtilsService, private userMsService: UserMsService,
              private dialog: MatDialog, private toastMsgService: ToastMessageService) { 
    this.openStatusClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };

  }

  ngOnInit() {
    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if(userInfo.USER_ROLE.includes("ROLE_ADMIN")){
      // let loggedAgentId = this.agentList.filter(item => item.userId === userInfo.USER_UNIQUE_ID)[0].agentId;
      // this.selectedAgent = loggedAgentId;
      this.getOpenStatus(0, '');
    }
  }

  searchByAgent(selectedAgent){
    if(this.utilsService.isNonEmpty(selectedAgent)){
      this.selectedAgent = selectedAgent;
      this.pageCount = 0;
      this.getOpenStatus(0, selectedAgent);
    }
    else{
      this.toastMsgService.alert("error","Select Agent")
    }
  }

  createColoumnDef(){
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
      },{
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
        },
      }
    ]
  }

  getOpenStatus(pageNo, agent?){
    this.loading = true;
    var startPage;
    var param;
    if(this.utilService.isNonEmpty(agent)){
      startPage = pageNo === 0 ? 0 : (pageNo * 10) + 1;
      param = `/lead-details-by-status-es?agentId=${agent}&statusId=${18}&from=${startPage}&to=10`;
    }
    else{
      startPage = pageNo === 0 ? 0 : (pageNo * 10) + 1;
      param = `/lead-details-by-status-es?statusId=${18}&from=${startPage}&to=10`;
    }
   
    this.userMsService.getMethod(param).subscribe((result: any)=>{
      console.log('open status: ',result, result.length);
      this.loading = false;
      if (result instanceof Array && result.length > 0) {
        this.openStatusdata = result;
        this.openStatusClientsGridOption.api.setRowData(this.createRowData(this.openStatusdata));
      } else {
        this.utilsService.showSnackBar('You dont have any calls today');
      }
    },
    error =>{
      this.loading = false;
      this.pageCount--;
      console.log('Error during get open status: ',error);
    })
  }

  createRowData(openStatusInfo) {
    console.log('openStatusInfo -> ', openStatusInfo);
    var openStatusInfosArray = [];
    for (let i = 0; i < openStatusInfo.length; i++) {  
      let openStatusInfosInfo = Object.assign({}, openStatusInfosArray[i], {
        userId: this.utilsService.isNonEmpty(openStatusInfo[i]['userId']) ? openStatusInfo[i]['userId'] : '-',
        createdDate: this.utilsService.isNonEmpty(openStatusInfo[i]['CreatedDate']) ? openStatusInfo[i]['CreatedDate'] : '-',
        clientMobile: this.utilsService.isNonEmpty(openStatusInfo[i]['Phone']) ? openStatusInfo[i]['Phone'] : '-',
        clientName: (this.utilsService.isNonEmpty(openStatusInfo[i]['FirstName']) ? openStatusInfo[i]['FirstName'] : '-')+' '+(this.utilsService.isNonEmpty(openStatusInfo[i]['LastName']) ? openStatusInfo[i]['LastName'] : '-'),
        emailId: this.utilsService.isNonEmpty(openStatusInfo[i]['Email']) ? openStatusInfo[i]['Email'] : '-',
        source: this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']['Source']) ? openStatusInfo[i]['InitialData']['Source'] : '-') : '-',
        platform: this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']['Platform']) ? openStatusInfo[i]['InitialData']['Platform'] : '-') : '-',
        service: this.utilsService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']['ServiceType']) ? openStatusInfo[i]['itrStatusLatest']['ServiceType'] : '-') : '-',
        status: this.utilsService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['itrStatusLatest']['StatusID']) ? (openStatusInfo[i]['itrStatusLatest']['StatusID'] === 18 ? 'Open' : '-') : '-') : '-',
        KommunicateAssigneeId: openStatusInfo[i]['KommunicateAssigneeId'],
        utmSource: this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']['UtmSource']) ? openStatusInfo[i]['InitialData']['UtmSource'] : '-') : '-',
        companId: this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']) ? (this.utilsService.isNonEmpty(openStatusInfo[i]['InitialData']['CompanyID']) ? openStatusInfo[i]['InitialData']['CompanyID'] : '-') : '-',
      })
      openStatusInfosArray.push(openStatusInfosInfo);
    }
    console.log('openStatusInfosArray-> ', openStatusInfosArray)
     return openStatusInfosArray;
  }

  onOpenStatusClicked(params){
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
          this.updaeStatus(params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
      }
    }
  }

  startConversation(user){
    console.log('user: ',user)
    if(this.utilsService.isNonEmpty(user.KommunicateAssigneeId)){
      this.loading = true;
      const param = `/create-km-groupid?userId=${user.userId}&agentId=${user.KommunicateAssigneeId}`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        console.log('Chat Created Result: ', result);
        this.loading = false;
        if (this.utilsService.isNonEmpty(result) && this.utilsService.isNonEmpty(result.clientGroupId)) {
          window.open(`https://dashboard.kommunicate.io/conversations/${result.clientGroupId}`, "_blank");
        } else {
          this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
        }
      }, error => {
        this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
        this.loading = false;
      })
    }
    else{
      this.utilsService.showSnackBar('Kommuncate Id is '+user.KommunicateAssigneeId);
    }
   
  }

  showNotes(client){
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

  updaeStatus(client){
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.clientName 
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        if(result.data === "statusChanged"){
          this.getOpenStatus(0, this.selectedAgent);
        }
      }
    });
  }

  previousab(){
    this.pageCount++;
    this.getOpenStatus(Math.abs(this.pageCount),this.selectedAgent);
  }

  nextTab(){
    this.pageCount--;
    this.getOpenStatus( Math.abs(this.pageCount), this.selectedAgent);
  }

  openChat(client){
    console.log('client: ',client);
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.service}`;
    this.userMsService.getMethod(param).subscribe((responce: any)=>{
        console.log('open chat link res: ',responce);
        this.loading = false;
        if(responce.success){
          window.open(responce.data.chatLink)
        }
        else{
          this.toastMsgService.alert('error',responce.message)
        }
    },
    error=>{
      console.log('Error during feching chat link: ',error);
      this.toastMsgService.alert('error','Error during feching chat, try after some time.')
      this.loading = false;
    })
  }

}
