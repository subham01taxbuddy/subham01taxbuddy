import { UtilsService } from 'app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { MatDialog } from '@angular/material';
import { environment } from 'environments/environment';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';

@Component({
  selector: 'app-kommunicate',
  templateUrl: './kommunicate.component.html',
  styleUrls: ['./kommunicate.component.css']
})
export class KommunicateComponent implements OnInit {
  kmChats = [];
  page = 0; // current page
  count = 0; // total elements
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
    { value: 'damini@ssbainnovations.com', label: 'Damini' }
  ];
  loading = false;
  constructor(private userMsService: UserMsService, public utilsService: UtilsService,
    private dialog: MatDialog,) {
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
    this.retrieveKommunicateChat(0);
  }
  retrieveKommunicateChat(page) {
    this.loading = true;
    // const param = `/user-engagment-km?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
    const param = `/user-engagment-km-es?from=${page}&to=${this.pageSize}&agentId=${this.agentId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('KM Engagement data', result);
      this.kmChats = result;
      // this.count = result.totalElements;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  handlePageChange(event) {
    console.log('handlePageChange: event:', event);
    this.page = event;
    this.retrieveKommunicateChat(event);
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    this.page = 0;
    this.retrieveKommunicateChat(0);
  }

  startChat(chatLink) {
    if (this.utilsService.isNonEmpty(chatLink)) {
      window.open(`${chatLink}`, "_blank");
    } else {
      this.utilsService.showSnackBar('Kommunicate Chat link is not available');
    }
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

  previous() {
    this.page = this.page - this.pageSize;
    this.retrieveKommunicateChat(this.page);
  }
  next() {
    this.page = this.page + this.pageSize;
    this.retrieveKommunicateChat(this.page);
  }

}

// import { UtilsService } from 'app/services/utils.service';
// import { Component, OnInit } from '@angular/core';
// import { UserMsService } from 'app/services/user-ms.service';
// import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
// import { MatDialog } from '@angular/material';
// import { environment } from 'environments/environment';
// import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';

// @Component({
//   selector: 'app-kommunicate',
//   templateUrl: './kommunicate.component.html',
//   styleUrls: ['./kommunicate.component.css']
// })
// export class KommunicateComponent implements OnInit {
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
//   constructor(private userMsService: UserMsService, public utilsService: UtilsService,
//     private dialog: MatDialog,) {
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
//     const param = `/user-engagment-km?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
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

//   startChat(chatLink) {
//     if (this.utilsService.isNonEmpty(chatLink)) {
//       window.open(`${chatLink}`, "_blank");
//     } else {
//       this.utilsService.showSnackBar('Kommunicate Chat link is not available');
//     }
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