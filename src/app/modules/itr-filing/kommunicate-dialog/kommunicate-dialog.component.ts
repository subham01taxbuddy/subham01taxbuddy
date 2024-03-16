import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-kommunicate-dialog',
  templateUrl: './kommunicate-dialog.component.html',
  styleUrls: ['./kommunicate-dialog.component.css']
})
export class KommunicateDialogComponent implements OnInit {

  chatData: any;
  botIds: any = [];
  constructor(public dialogRef: MatDialogRef<KommunicateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private userService: UserMsService, public utilService: UtilsService) {
    // this.botIds = environment.botIds;
  }

  ngOnInit() {
    this.chatData = this.data.chatData;
    console.log('this.chatData ===>', this.chatData)
  }

  isSender(from) {
    return this.botIds.includes(from);
    /* for (let i = 0; i <= this.botIds.length; i++) {
      console.log('botIds: ', this.botIds[i])
      if (from === this.botIds[i]) {
        return true;
      }
      else {
        return false;
      }
    } */
  }

}
export interface ConfirmModel {
  chatData: any;
  kommunicateGroupId: any;
  title:any;
}
