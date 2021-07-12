import { AddCallLogComponent } from './../../../shared/components/add-call-log/add-call-log.component';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  userList = [];
  newUsersGridOptions: GridOptions;

  page = 0; // current page
  count = 0; // total pages
  pageSize = 20; // number of items in each page
  agentId = '';
  agentList = [
    { value: 'brij@ssbainnovations.com', label: 'Brij' },
    { value: 'divya@ssbainnovations.com', label: 'Divya' },
    { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
    { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
    { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
    { value: 'ankita@ssbainnovations.com', label: 'Ankita' },
    { value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
    { value: 'damini@ssbainnovations.com', label: 'Damini' },
    { value: 'supriya.mahindrakar@taxbuddy.com', label: 'Supriya' },
    { value: 'aditya.singh@taxbuddy.com', label: 'Aditya' }
  ];
  loading = false;
  config: any;

  constructor(private userMsService: UserMsService, public utilsService: UtilsService,
    private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string) {
      this.config = {
        itemsPerPage: 20,
        currentPage: 1,
        totalItems: 80
      };

      this.newUsersGridOptions = <GridOptions>{
        rowData: [],
        columnDefs: this.usersCreateColoumnDef(),
        enableCellChangeFlash: true,
        onGridReady: params => {
        },
        sortable: true,
      };

    this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
    if (!environment.production) {
      this.agentList = [
        { value: 'ashish.hulwan@ssbainnovations.com', label: 'Ashish' },
        { value: 'vaibhav.gaikwad@ssbainnovations.com', label: 'Vaibhav' },
        { value: 'dev_kommunicate@ssbainnovations.com', label: 'Dev Komm' },
        { value: 'barakha@ssbainnovations.com', label: 'Barakha' },
        { value: 'karan@ssbainnovations.com', label: 'Karan' },
        { value: 'testkommunicate@ssbainnovations.com', label: 'Ajay' }
      ];
    }
  }

  ngOnInit() {
    console.log('selectedAgentId -> ',localStorage.getItem('selectedAgentId'));
    let agentId = localStorage.getItem('selectedAgentId');
    if(this.utilsService.isNonEmpty(agentId)){
      this.agentId = agentId;
      this.retrieveNewUsers(0);
    }
    else{
      this.retrieveNewUsers(0);
    }
  }

  usersCreateColoumnDef(){
    return [
      {
        headerName:'User Id',
        field: 'userId',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
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
        headerName: 'Created Date',
        field: 'createdDate',
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
        headerName: 'Start Conversation',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click to start conversation"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="startConversation"></i>
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
      {
        headerName: 'Add Call Logs',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Add call logs"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="addCallLogs"></i>
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

  onNewUserRowClicked(params){
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
        case 'addCallLogs': {
          this.addCallLogs(params.data)
          break;
        }
      }
    }
  }

  retrieveNewUsers(page) {
    this.loading = true;
    const param = `/user-allocation-es?from=${page}&to=${this.pageSize}&agentId=${this.agentId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('New User data', result);
      this.userList = result;
      this.loading = false;
      this.newUsersGridOptions.api.setRowData(this.createRowData(this.userList));
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  createRowData(userDate) {
    console.log('userDate -> ', userDate);
    var userArray = [];
    for (let i = 0; i < userDate.length; i++) {
      let userInfo = Object.assign({}, userArray[i], {
        userId:  userDate[i].sourceAsMap['userId'],
        name:   userDate[i].sourceAsMap['FirstName']+' '+userDate[i].sourceAsMap['LastName'],
        Phone: userDate[i].sourceAsMap['Phone'],
        createdDate: userDate[i].sourceAsMap['CreatedDate'],
        platform: userDate[i].sourceAsMap['InitialData'] ? userDate[i].sourceAsMap['InitialData']['Platform'] : '',
        KommunicateAssigneeId: userDate[i].sourceAsMap['KommunicateAssigneeId'],
        FirstName: userDate[i].sourceAsMap['FirstName'],
        LastName: userDate[i].sourceAsMap['LastName'],
        Email: userDate[i].sourceAsMap['Email']
      })
      userArray.push(userInfo);
    }
    console.log('userArray-> ', userArray)
     return userArray;
  }

  handlePageChange(event) {
    console.log('handlePageChange: event:', event);
    this.page = event;
    this.retrieveNewUsers(event);
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    localStorage.setItem('selectedAgentId', this.agentId);
    this.page = 0;
    this.retrieveNewUsers(0);
  }
  previous() {
    this.page = this.page - this.pageSize;
    this.retrieveNewUsers(this.page);
  }
  next() {
    this.page = this.page + this.pageSize;
    console.log('clicked on next:', this.page)
    this.retrieveNewUsers(this.page);
  }
  startConversation(user) {
    console.log('user: ',user)
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

  startPush(user) {
    this.loading = true;
    const param = `/campaign/generic`;
    const request = {
      "userIdList": [user.userId],
      "channelId": 1,
      "message": "Filing I-T Return through TaxBuddy includes Free tax saving advice and tax notice management. Start filing Now.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/assets.taxbuddy.com/push_Notification_100K_1024+x+512.png",
      "deepLink": "itrAssisted"
    }
    this.userMsService.postMethod(param, request).subscribe((result: any) => {
      console.log('Push send: ', result);
      this.loading = false;
      this.utilsService.showSnackBar('Push notification send successfully.');
    }, error => {
      this.utilsService.showSnackBar('Error while sending push notification.');
      this.loading = false;
    })
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

  pageChanged(event) {
    this.config.currentPage = event;
    this.retrieveNewUsers(event - 1);
  }

  addCallLogs(client) {
    let disposable = this.dialog.open(AddCallLogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        userName: client.FirstName + ' ' + client.LastName,
        userMobile: client.Phone,
        userEmail: client['Email'],
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }
}

// import { AddCallLogComponent } from './../../../shared/components/add-call-log/add-call-log.component';
// import { environment } from 'environments/environment';
// import { UtilsService } from 'app/services/utils.service';
// import { UserMsService } from 'app/services/user-ms.service';
// import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material';
// import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

// @Component({
//   selector: 'app-new-user',
//   templateUrl: './new-user.component.html',
//   styleUrls: ['./new-user.component.css']
// })
// export class NewUserComponent implements OnInit {
//   userList = [];

//   page = 1; // current page
//   count = 0; // total pages
//   pageSize = 10; // number of items in each page
//   // pageSizes = [3, 6, 9];
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

//   constructor(private userMsService: UserMsService, public utilsService: UtilsService,
//     private dialog: MatDialog) {
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
//     this.retrieveNewUsers(0);
//   }

//   retrieveNewUsers(page) {
//     this.loading = true;
//     const param = `/user-allocation?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
//     this.userMsService.getMethod(param).subscribe((result: any) => {
//       console.log('New User data', result);
//       this.userList = result.userAllocationDetails;
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
//     this.retrieveNewUsers(event);
//   }
//   selectAgent(agentName) {
//     this.agentId = agentName;
//     this.retrieveNewUsers(0);
//   }

//   startConversation(user) {
//     this.loading = true;
//     const param = `/create-km-groupid?userId=${user.userId}&agentId=${user.kmAssigneeId}`;
//     this.userMsService.getMethod(param).subscribe((result: any) => {
//       console.log('Chat Created Result: ', result);
//       this.loading = false;
//       if (this.utilsService.isNonEmpty(result) && this.utilsService.isNonEmpty(result.clientGroupId)) {
//         window.open(`https://dashboard.kommunicate.io/conversations/${result.clientGroupId}`, "_blank");
//       } else {
//         this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
//       }
//     }, error => {
//       this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
//       this.loading = false;
//     })
//   }

//   startPush(user) {
//     this.loading = true;
//     const param = `/campaign/generic`;
//     const request = {
//       "userIdList": [user.userId],
//       "channelId": 1,
//       "message": "Filing I-T Return through TaxBuddy includes Free tax saving advice and tax notice management. Start filing Now.",
//       "imageUrl": "https://s3.ap-south-1.amazonaws.com/assets.taxbuddy.com/push_Notification_100K_1024+x+512.png",
//       "deepLink": "itrAssisted"
//     }
//     this.userMsService.postMethod(param, request).subscribe((result: any) => {
//       console.log('Push send: ', result);
//       this.loading = false;
//       this.utilsService.showSnackBar('Push notification send successfully.');
//     }, error => {
//       this.utilsService.showSnackBar('Error while sending push notification.');
//       this.loading = false;
//     })
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

