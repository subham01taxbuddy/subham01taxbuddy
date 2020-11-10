import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

@Component({
  selector: 'app-interested-clients',
  templateUrl: './interested-clients.component.html',
  styleUrls: ['./interested-clients.component.css']
})
export class InterestedClientsComponent implements OnInit {
  interestedClients = [];
  loading = false;
  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService) { }

  ngOnInit() {
    this.getInterestedClients();
  }

  getInterestedClients() {
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    const param = `/call-status?statusId=16`;
    console.log(new Date().toISOString())
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('Call details', result);
      if (result instanceof Array && result.length > 0) {
        this.interestedClients = result;
      } else {
        this.utilsService.showSnackBar('You dont have any calls today');
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  addCallLogs(client) {
    let disposable = this.dialog.open(AddCallLogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        userName: client.userName,
        userMobile: client.userMobile,
        userEmail: client.userEmail,
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
        clientName: client.userName
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }
}
