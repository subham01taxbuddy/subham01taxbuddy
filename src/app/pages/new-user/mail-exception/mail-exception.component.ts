import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-mail-exception',
  templateUrl: './mail-exception.component.html',
  styleUrls: ['./mail-exception.component.css']
})
export class MailExceptionComponent implements OnInit {

  loading: boolean;
  showExceptionUser: boolean;
  mailExceptionUser: any =[];
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
  constructor(private userService: UserMsService, private route: Router, private utilService: ItrMsService) { }

  ngOnInit() {
    this.getMailExceptionUserByAgentId();
  }

  getMailExceptionUserByAgentId(){
    this.showExceptionUser = true;
    this.loading = true;
    let param = '/email-channel-exception';
    this.userService.getUserDetail(param).subscribe(responce=>{
      this.loading = false;
       console.log('responce ==> ',responce);
       this.mailExceptionUser = responce;

    },error=>{
      this.loading = false;
      console.log('Error while getting exception User data: ',error)
    })
  }

  createNewUser(userInfo){
      console.log('userInfo: ',userInfo);
      sessionStorage.setItem('exceptionalUser', JSON.stringify(userInfo));
      this.route.navigate(['/pages/newUser/createUser']);
  }

}
