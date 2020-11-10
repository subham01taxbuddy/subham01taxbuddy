import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-mail-user',
  templateUrl: './mail-user.component.html',
  styleUrls: ['./mail-user.component.css']
})
export class MailUserComponent implements OnInit {

  loading: boolean;
  showMailUser: boolean;
  agentList = environment.agentId;

  mailUser: any = [];

  constructor(private userService: UserMsService) { }

  ngOnInit() {
    this.getMailUserByAgentId();
  }

  getMailUserByAgentId(agentId?){
    this.showMailUser = true;
    this.loading = true;
    if(agentId){
      var param = '/email-channel?assigneeId='+agentId;
    }else{
      var param = '/email-channel?assigneeId=';
    }
    
    this.userService.getUserDetail(param).subscribe(responce=>{
      this.loading = false;
       console.log('Email user ==> ',responce);
       this.mailUser = responce;

    },error=>{
      this.loading = false;
      console.log('Error while getting email User data ==> ',error);
    })
  }

}
