import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-view-call-details',
  templateUrl: './view-call-details.component.html',
  styleUrls: ['./view-call-details.component.css']
})
export class ViewCallDetailsComponent implements OnInit {
  loading!: boolean;
  constructor(
    public dialogRef: MatDialogRef<ViewCallDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserMsService,
    private fb: UntypedFormBuilder,
    private toastMessage: ToastMessageService
  ) {
    console.log('data', this.data)
  }

  ngOnInit() {
  }


  close(){
    this.dialogRef.close();
  }


}
