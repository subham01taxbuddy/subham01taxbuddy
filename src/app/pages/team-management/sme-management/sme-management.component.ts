import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserMsService } from 'app/services/user-ms.service';
import { ChangeAgentDialogComponent } from './change-agent-dialog/change-agent-dialog.component';

@Component({
  selector: 'app-sme-management',
  templateUrl: './sme-management.component.html',
  styleUrls: ['./sme-management.component.css']
})
export class SmeManagementComponent implements OnInit {

  loading: boolean;
  smeList: any = [];

  constructor(private userMsService: UserMsService, private dialog: MatDialog) { }

  ngOnInit() {
    this.getCallerUser();
  }

  getCallerUser(){
    this.loading = true;
    const userData = JSON.parse(localStorage.getItem('UMD'));
    let param = `/custom-sme-details`;
    this.userMsService.getMethod(param).subscribe(res=>{
        console.log('sme users: ',res);
        this.loading = false;
        if(Array.isArray(res) && res.length > 0){
          this.smeList = res;
        }
    },
    error=>{
         console.log('Error during getting caller users daa: ',error);
         this.loading = false;
    })
  }

  updateStatus(userInfo){
    let disposable = this.dialog.open(ChangeAgentDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userInfo: userInfo
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // if(result){
      //   if(result.data === "statusChanged"){
      //     this.getOpenStatus(this.selectedAgent, 0);
      //   }
      // }
    });
  }

}
