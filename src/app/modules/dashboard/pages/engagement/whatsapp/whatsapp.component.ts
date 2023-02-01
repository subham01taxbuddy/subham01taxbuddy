import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { WhatsAppDialogComponent } from 'src/app/pages/itr-filing/whats-app-dialog/whats-app-dialog.component';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddCallLogComponent } from 'src/app/modules/shared/components/add-call-log/add-call-log.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css']
})
export class WhatsappComponent implements OnInit {
  kmChats = [];
  page = 1; // current page
  count = 0; // total elements
  pageSize = 20; // number of items in each page
  agentId = '';
  // agentList = [
  //   { value: 'brij@ssbainnovations.com', label: 'Brij' },
  //   { value: 'divya@ssbainnovations.com', label: 'Divya' },
  //   { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
  //   { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
  //   { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
  //   { value: 'ankita@ssbainnovations.com', label: 'Ankita' },
  //   { value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
  //   { value: 'damini@ssbainnovations.com', label: 'Damini' },
  //   { value: 'supriya.mahindrakar@taxbuddy.com', label: 'Supriya' },
  // 	{ value: 'aditya.singh@taxbuddy.com', label: 'Aditya' }
  // ];
  agentList: any = [];
  loading = false;
  config: any;
  whatsAppGridOptions: GridOptions;

  constructor(private userMsService: UserMsService, public utilsService: UtilsService, private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string) {
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 80
    };

    this.whatsAppGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
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

    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST))
  }

  ngOnInit() {
    console.log('selectedAgentId -> ', localStorage.getItem('selectedAgentId'));
    let agentId = localStorage.getItem('selectedAgentId');
    if (this.utilsService.isNonEmpty(agentId)) {
      this.agentId = agentId;
      this.retrieveKommunicateChat(0);
    }
    else {
      this.retrieveKommunicateChat(0);
    }
  }

  createColumnDef() {
    return [
      {
        headerName: 'Name',
        field: 'name',
        width: 220,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile',
        field: 'Phone',
        width: 150,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Last Message',
        field: 'lastMessage',
        width: 280,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Time Date',
        field: 'timeDate',
        width: 150,
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
        headerName: 'Start Conversation',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Click to start conversation"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="startConversation"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params:any) {
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
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Add Call Logs',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Add call logs"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="addCallLogs"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }

  retrieveKommunicateChat(page) {
    this.loading = true;
    // const param = `/user-engagment-wa?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
    const param = `/user-engagment-wa-es?from=${page}&to=${this.pageSize}&agentId=${this.agentId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('KM Engagement data', result);
      this.kmChats = result;
      this.whatsAppGridOptions.api?.setRowData(this.createRowData(this.kmChats));
      // this.count = result.totalElements;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  createRowData(whatAppData) {
    console.log('whatAppData -> ', whatAppData);
    var whatsAppArray = [];
    for (let i = 0; i < whatAppData.length; i++) {
      let whatsAppInfo = Object.assign({}, whatsAppArray[i], {
        userId: whatAppData[i].sourceAsMap['userId'],
        name: whatAppData[i].sourceAsMap['FirstName'] + ' ' + whatAppData[i].sourceAsMap['LastName'],
        Phone: whatAppData[i].sourceAsMap['Phone'],
        lastMessage: whatAppData[i].sourceAsMap.WhatsAppChat ? whatAppData[i].sourceAsMap.WhatsAppChat.textMessage : '',
        timeDate: whatAppData[i].sourceAsMap.WhatsAppChat ? whatAppData[i].sourceAsMap.WhatsAppChat.dateLong : '',
        KommunicateURL: whatAppData[i].sourceAsMap['KommunicateURL'],
        FirstName: whatAppData[i].sourceAsMap['FirstName'],
        LastName: whatAppData[i].sourceAsMap['LastName'],
        Email: whatAppData[i].sourceAsMap['Email']
      })
      whatsAppArray.push(whatsAppInfo);
    }
    console.log('whatsAppArray-> ', whatsAppArray)
    return whatsAppArray;
  }

  onWhatsAppChatClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startConversation': {
          this.startChat(params.data.Phone);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'addCallLogs': {
          this.addCallLogs(params.data)
          break;
        }
      }
    }
  }

  handlePageChange(event) {
    console.log('handlePageChange: event:', event);
    this.page = event;
    this.retrieveKommunicateChat(event);
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    localStorage.setItem('selectedAgentId', this.agentId);
    this.page = 0;
    this.retrieveKommunicateChat(0);
  }

  startChat(mobileNo) {
    let disposable = this.dialog.open(WhatsAppDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        mobileNum: mobileNo
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.FirstName + ' ' + client.LastName
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }
  addCallLogs(client) {
    let disposable = this.dialog.open(AddCallLogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.FirstName + ' ' + client.LastName,
        userMobile: client.Phone,
        userEmail: client['Email'],
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.retrieveKommunicateChat(event - 1);
  }

  previous() {
    this.page = this.page - this.pageSize;
    this.retrieveKommunicateChat(this.page);
  }
  next() {
    this.page = this.page + this.pageSize;
    this.retrieveKommunicateChat(this.page);
  }
}


// import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { WhatsAppDialogComponent } from 'app/pages/itr-filing/whats-app-dialog/whats-app-dialog.component';
// import { UserMsService } from 'src/app/services/user-ms.service';
// import { UtilsService } from 'src/app/services/utils.service';
// import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
// import { UserNotesComponent } from 'src/app/shared/components/user-notes/user-notes.component';
// import { environment } from 'src/environments/environment';

// @Component({
//   selector: 'app-whatsapp',
//   templateUrl: './whatsapp.component.html',
//   styleUrls: ['./whatsapp.component.css']
// })
// export class WhatsappComponent implements OnInit {
//   kmChats = [];
//   page = 1; // current page
//   count = 0; // total elements
//   pageSize = 10; // number of items in each page
//   agentId = '';
//   agentList = [
//     { value: 'brij@ssbainnovations.com', label: 'Brij' },
//     { value: 'divya@ssbainnovations.com', label: 'Divya' },
//     { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
//     { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
//     { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
//     { value: 'ankita@ssbainnovations.com', label: 'Ankita' },
//     { value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
//     { value: 'damini@ssbainnovations.com', label: 'Damini' }
//   ];
//   loading = false;
//   constructor(private userMsService: UserMsService, public utilsService: UtilsService, private dialog: MatDialog,) {
//     this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
//     if (!environment.production) {
//       this.agentList = [
//         { value: 'ashish.hulwan@ssbainnovations.com', label: 'Ashish' },
//         { value: 'vaibhav.gaikwad@ssbainnovations.com', label: 'Vaibhav' },
//         { value: 'dev_kommunicate@ssbainnovations.com', label: 'Dev Komm' },
//         { value: 'barakha@ssbainnovations.com', label: 'Barakha' },
//         { value: 'karan@ssbainnovations.com', label: 'Karan' },
//         { value: 'testkommunicate@ssbainnovations.com', label: 'Ajay' }
//       ];
//     }
//   }

//   ngOnInit() {
//     this.retrieveKommunicateChat(0);
//   }
//   retrieveKommunicateChat(page) {
//     this.loading = true;
//     const param = `/user-engagment-wa?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
//     this.userMsService.getMethod(param).subscribe((result: any) => {
//       console.log('KM Engagement data', result);
//       this.kmChats = result.content;
//       this.count = result.totalElements;
//       this.loading = false;
//     }, error => {
//       this.loading = false;
//       console.log(error);
//     })
//   }

//   handlePageChange(event) {
//     console.log('handlePageChange: event:', event);
//     this.page = event;
//     this.retrieveKommunicateChat(event);
//   }
//   selectAgent(agentName) {
//     this.agentId = agentName;
//     this.retrieveKommunicateChat(0);
//   }

//   startChat(mobileNo) {
//     let disposable = this.dialog.open(WhatsAppDialogComponent, {
//       width: '50%',
//       height: 'auto',
//       data: {
//         mobileNum: mobileNo
//       }
//     })
//     disposable.afterClosed().subscribe(result => {
//       console.log('The dialog was closed');
//     });
//   }

//   showNotes(client) {
//     let disposable = this.dialog.open(UserNotesComponent, {
//       width: '50%',
//       height: 'auto',
//       data: {
//         userId: client.userId,
//         clientName: client.name
//       }
//     })

//     disposable.afterClosed().subscribe(result => {
//       console.log('The dialog was closed');
//     });

//   }
//   addCallLogs(client) {
//     let disposable = this.dialog.open(AddCallLogComponent, {
//       width: '50%',
//       height: 'auto',
//       data: {
//         userId: client.userId,
//         userName: client.name,
//         userMobile: client.mobileNumber,
//         userEmail: client['email'],
//       }
//     })
//     disposable.afterClosed().subscribe(result => {
//       console.log('The dialog was closed');
//     });
//   }
// }
