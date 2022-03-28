import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-add-remove-agent-dialog',
  templateUrl: './add-remove-agent-dialog.component.html',
  styleUrls: ['./add-remove-agent-dialog.component.css']
})
export class AddRemoveAgentDialogComponent {

  loading!: boolean;

  constructor(public dialogRef: MatDialogRef<AddRemoveAgentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
             private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }


}

export interface ConfirmModel {
  userInfo: any;
}
