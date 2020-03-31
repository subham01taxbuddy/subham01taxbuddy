import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserMsService } from 'app/services/user-ms.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { UtilsService } from 'app/services/utils.service';
import { ToastMessageService } from 'app/services/toast-message.service';

@Component({
  selector: 'app-fcm-detail',
  templateUrl: './fcm-detail.component.html',
  styleUrls: ['./fcm-detail.component.css'],
  providers: [DatePipe]
})
export class FcmDetailComponent implements OnInit {

  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  active_subscriptions: any = [];
  loading: boolean;
  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, 
  // {
  //   value: 'emailAddress', name: 'Email Id'
  // },
   {
    value: 'mobileNumber', name: 'Mobile Number'
  }, 
  // {
  //   value: 'panNumber', name: 'PAN Number'
  // }, 
  {
    value: 'userId', name: 'User Id'
  }];

  constructor(private userService: UserMsService, public utilService: UtilsService, private toastMsg: ToastMessageService) { }

  ngOnInit() {
    this.getUserFcmInfo();
  }

  getUserFcmInfo(){
    this.loading = true;
    let param = '/fcm/report';
    this.userService.getMethod(param).subscribe(result=>{
      this.loading = false;
      console.log('FCM User: ',result)
     // this.user_data = result;
      sessionStorage.setItem('userFcmInfo', JSON.stringify(result))
      console.log('user_data: ',this.user_data)
      
    },error=>{

      this.loading = false;
    })
  }

  clearValue() {
    console.log('User Data: ', this.user_data)
    this.searchVal = "";
    //this.currentUserId = 0;
    this.filteredData = [];
    console.log('User Data: ', this.user_data)
  }

  advanceSearch(key) {
    this.user_data = [];
    console.log('key: ',key, ' searchVal: ',this.searchVal, 'user_data: ',this.user_data)
    if (this.searchVal !== "") {
      this.getFcmSearchList(key, this.searchVal);
    }
  }

  filteredData: any = [];
  getFcmSearchList(key, searchValue){
    console.log('key: ',key,' search val: ',searchValue)
    this.user_data = JSON.parse(sessionStorage.getItem('userFcmInfo'))
    console.log('User Data: ', this.user_data)
    if(key === 'fName' || key === 'lName'){

      //item.name.toLowerCase().trim()).includes(this.searchNumber.value)
    this.filteredData = this.user_data.filter(item=> item.name.toLowerCase().trim().includes(searchValue.toLowerCase().trim()) )
    console.log('name search: ',this.filteredData)
    }
    else if(key === 'mobileNumber'){
      this.filteredData = this.user_data.filter(item=> item.mobileNumber.includes(searchValue.trim()))
      console.log('mobile num search: ',this.filteredData)
    }
    else if(key === 'userId'){
      // this.filteredData = this.user_data.filter(item=> item.userId === searchValue )
      console.log('Check: ', this.user_data[0].userId, this.user_data[0].userId.toString(), this.user_data[0].userId.toString().includes(searchValue))
      this.filteredData = this.user_data.filter(item=> item.userId.toString().includes(searchValue.trim()))
    }

    // if(this.filteredData.length === 0){
    //     this.toastMsg.alert("error",'')
    // }

  }
}
