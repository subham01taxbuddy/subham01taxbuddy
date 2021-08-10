import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { ChangeAgentDialogComponent } from './change-agent-dialog/change-agent-dialog.component';

@Component({
  selector: 'app-sme-management',
  templateUrl: './sme-management.component.html',
  styleUrls: ['./sme-management.component.css']
})
export class SmeManagementComponent implements OnInit {

  loading: boolean;
  smeList: any = [];
  agentList: any = [];
  selectedAgent: any;
  searchMobNo: any;

  constructor(private userMsService: UserMsService, private dialog: MatDialog, private utileService: UtilsService, private toastMsgService: ToastMessageService ) { }

  ngOnInit() {
    this.agentList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
     this.getCallerUser('');
  }

  searchByAgent(selectedAgent){
    if(this.utileService.isNonEmpty(selectedAgent)){
      this.selectedAgent = selectedAgent;
      this.getCallerUser(selectedAgent);
    }
    else{
      this.toastMsgService.alert("error","Select Agent")
    }
  }

  getCallerUser(id, mobNo?){
    this.loading = true;
    var param;
    if(this.utileService.isNonEmpty(id)){
      param = `/sme-details?agentId=${id}`;
    }
    else{
      if(this.utileService.isNonEmpty(mobNo)){
        param = `/custom-sme-details?mobileNumber=${mobNo}`;
      }
      else{
        param = `/custom-sme-details`;
      }
    }
    this.userMsService.getMethod(param).subscribe(res=>{
        console.log('sme users: ',res);
        this.loading = false;
        if(Array.isArray(res) && res.length > 0){
          this.smeList = res;
        }
        else{
          this.smeList = [];
          this.toastMsgService.alert('error','Data not found.')
        }
    },
    error=>{
         console.log('Error during getting caller users daa: ',error);
         this.toastMsgService.alert('error','Error during getting sme data.')
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
      if(result){
        if(result.data === "statusChanged"){
          this.getCallerUser(this.selectedAgent);
        }
      }
    });
  }

  userRole(roles){
    var role;
    // console.log(roles);
    if(roles instanceof Array){
      if(roles.length === 1){
        role = roles[0] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filler Agent'; 
      }
      else if(roles.length > 1){
        for(let i=0; i<roles.length; i++){
            if(i === 0){
              role = roles[i] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filler Agent'; 
            }
            else{
              role = role+', '+(roles[i] === "ROLE_CALLING_TEAM" ? 'Caller Agent' : 'Filler Agent'); 
            }
        }
        // console.log('main role -> ',role)
        
      }
      return role;
    }
  }

  serchByMobNo(){
    if(this.utileService.isNonEmpty(this.searchMobNo) && this.searchMobNo.length === 10){
      this.getCallerUser('', this.searchMobNo);
    }
    else{
      this.toastMsgService.alert("error","Enter valid mobile number.")
    }
  }

}
