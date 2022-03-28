import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-user-histry',
  templateUrl: './user-histry.component.html',
  styleUrls: ['./user-histry.component.css']
})
export class UserHistryComponent implements OnInit {

  userHistryInfo: any;
  constructor(public dialogRef: MatDialogRef<UserHistryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private utilService: UtilsService, private userService: UserMsService) { }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo(){
    if(this.utilService.isNonEmpty(this.data.email)){
       //https://uat-api.taxbuddy.com/gateway/kommunicate?email=singhsimmi637@gmail.com
        let param = '/kommunicate?email='+this.data.email;
        this.userService.getUserDetail(param).subscribe(responce=>{
            console.log('responce: ',responce);
            this.userHistryInfo = responce;
        },
        error=>{  
            console.log('error -> ', error)
        })
    }
    else{

    }
  }

}

export interface ConfirmModel {
  email: any
}
