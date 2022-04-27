import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-chats',
  templateUrl: './user-chats.component.html',
  styleUrls: ['./user-chats.component.css']
})
export class UserChatsComponent implements OnInit {
  userChatData : any = [];

  constructor(public dialogRef: MatDialogRef<UserChatsComponent>,@Inject(MAT_DIALOG_DATA) public data: ConfirmModel) { }

  ngOnInit() {
    console.log('data: ',this.data.userData);
    if(this.data.userData.chatInfoList instanceof Array && this.data.userData.chatInfoList.length > 0){
      this.userChatData = this.data.userData.chatInfoList;
    }
    else{
      this.userChatData = [];
    }
  }

  openChat(userChatInfo){
      console.log('userChatInfo: ',userChatInfo);
      let link = 'https://dashboard.kommunicate.io/conversations/'+userChatInfo.conversationId;
      window.open(link);
  }

  closeDialog(){
    this.dialogRef.close();
  }

}

export interface ConfirmModel {
  userData: any;
}
