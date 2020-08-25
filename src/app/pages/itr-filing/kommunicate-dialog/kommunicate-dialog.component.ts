import { Component, OnInit, Inject } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';

@Component({
  selector: 'app-kommunicate-dialog',
  templateUrl: './kommunicate-dialog.component.html',
  styleUrls: ['./kommunicate-dialog.component.css']
})
export class KommunicateDialogComponent implements OnInit {

  chatData: any;
  constructor(public dialogRef: MatDialogRef<KommunicateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
  private userService: UserMsService, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.chatData = this.data.chatData;
    console.log('this.chatData ===>',this.chatData)
  }

}
export interface ConfirmModel {
  chatData: any
}
