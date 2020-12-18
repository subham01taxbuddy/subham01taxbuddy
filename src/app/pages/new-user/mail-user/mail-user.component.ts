import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserMsService } from 'app/services/user-ms.service';
import { environment } from 'environments/environment';
import { UserHistryComponent } from '../user-histry/user-histry.component';

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
  public displayedColumns = ['Name', 'Mobile Number', 'Email', 'Assign Id', 'Date'];
  constructor(private userService: UserMsService, private dialog: MatDialog) { }

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

  showUserHistry(mail){
    let disposable = this.dialog.open(UserHistryComponent, {
      width: '60%',
      height: 'auto',
      data: {
        email: mail
      }
    })
      
  }

}
