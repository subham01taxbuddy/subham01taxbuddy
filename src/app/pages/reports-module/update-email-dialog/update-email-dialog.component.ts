import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { UserMsService } from 'app/services/user-ms.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-email-dialog',
  templateUrl: './update-email-dialog.component.html',
  styleUrls: ['./update-email-dialog.component.css'],
  providers: [UserMsService]
})
export class UpdateEmailDialogComponent extends SimpleModalComponent<ConfirmModel, boolean> implements ConfirmModel, OnInit {
  title: string;
  message: string;
  userData: any;
  emailAddress: string = '';
  busy: Boolean = false;
  constructor(private http: HttpClient, private userMsService: UserMsService, ) {
    super();
  }

  ngOnInit() {
  }
  updateEmail() {
    this.busy = false;
    const userParam = `/profile/${this.userData.userId}`;
    if (this.emailAddress) {
      this.busy = true;
      this.userData.emailAddress = this.emailAddress
      this.userMsService.putMethod(userParam, this.userData).subscribe((res: any) => {
        this.busy = false;
        this.result = true;
        this.close();
        console.log('Email update success:', res);
      }, error => {
        this.busy = false;
        console.log('Email update failure:', error);
      })
    }
  }
}
export interface ConfirmModel {
  title: string;
  message: string;
  userData: any;
}