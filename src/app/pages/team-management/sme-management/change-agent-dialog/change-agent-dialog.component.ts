import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-change-agent-dialog',
  templateUrl: './change-agent-dialog.component.html',
  styleUrls: ['./change-agent-dialog.component.css']
})
export class ChangeAgentDialogComponent implements OnInit {

  changeAgent: FormGroup;
  loading: boolean;
  allAgents: any = [];

  constructor(public dialogRef: MatDialogRef<ChangeAgentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
              private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.changeAgent = this.fb.group({
      agent: ['' ,Validators.required]
    })
  }


  changeStatus(){
    
  }

}

export interface ConfirmModel {
  userInfo: any;
}
