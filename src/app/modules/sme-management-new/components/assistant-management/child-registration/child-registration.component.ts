import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-child-registration',
  templateUrl: './child-registration.component.html',
})
export class ChildRegistrationComponent implements OnInit {
  loading = false;
  mobileNumber = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<ChildRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
    private http: HttpClient,
    private utilsService: UtilsService,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.mobileNumber.setValue(this.data.mobileNumber);
  }

  signIn(){
    if(this.mobileNumber.value){
      //https://cognito-idp.ap-south-1.amazonaws.com/
      let data = {

      }
      this.http.post(environment.cognito_Url, data).subscribe(
        (res:any) => {
          this.utilsService.showSnackBar('OTP has been sent to your registered number');
        },
        (err: any) => {
          this.utilsService.showSnackBar('Error');
        }
      );

    }else{
      this._toastMessageService.alert('error',
        'please enter mobile Number.'
      );
    }
  }
}
