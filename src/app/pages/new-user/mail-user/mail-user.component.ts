import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-mail-user',
  templateUrl: './mail-user.component.html',
  styleUrls: ['./mail-user.component.css']
})
export class MailUserComponent implements OnInit {

  loading: boolean;
  showMailUser: boolean;
  agentList = [
    { value: 'brij@ssbainnovations.com', label: 'Brij' },
    { value: 'divya@ssbainnovations.com', label: 'Divya' },
    { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
    { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
    { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
    { value: 'ankita@ssbainnovations.com', label: 'Ankita' },
    { value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
    { value: 'damini@ssbainnovations.com', label: 'Damini' }
  ];
  mailUser: any = [];

  constructor(private userService: UserMsService) { }

  ngOnInit() {
    //this.getMailUserByAgentId();
  }

  getMailUserByAgentId(agentId){
    this.showMailUser = true;
    this.loading = true;
    let param = '/email-channel?assigneeId='+agentId;
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
