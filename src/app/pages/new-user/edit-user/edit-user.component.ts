import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  searchVal: string = "";
  currentUserId: number = 0;
  loading: boolean;
  signUpForm: FormGroup;
  userData: any;
  searchMenus = [{
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];
  constructor(private fb: FormBuilder, private http: HttpClient, NavbarService: NavbarService, private _toastMessageService: ToastMessageService,
              private utilService: UtilsService, private userService: UserMsService) { }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      first_name: new FormControl("", Validators.required),
      last_name: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      username: new FormControl("", Validators.required),
    });

  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
    //this.user_data = [];
    if (this.searchVal !== "") {
      this.getUserDetail(key, this.searchVal);
    }
  }

  getUserDetail(key, searchValue){
    this.userData = {};
    this.loading = true;
    NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
       this.userData = res;
       this.loading = false;
      if(this.utilService.isNonEmpty(this.userData)){
        console.log("Search result userData :", this.userData)
        this.signUpForm['controls'].first_name.setValue(this.userData.records[0].fName);
        this.signUpForm['controls'].last_name.setValue(this.userData.records[0].lName);
        this.signUpForm['controls'].email.setValue(this.userData.records[0].emailAddress);
        this.signUpForm['controls'].username.setValue(this.userData.records[0].mobileNumber);
      }
    }, err => {
      console.log('Error: ',err)
      this.loading = false;
      if(err.error.status === 404){
        this._toastMessageService.alert("error", "Searched info not found.");
      }
      // let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      // this._toastMessageService.alert("error", "admin list - " + errorMessage);
    });
  }


  editUser(){
    if(this.signUpForm.valid){
      this.loading = true;
      this.userData.records[0].emailAddress = this.signUpForm['controls'].email.value;
      let path = '/profile';
      this.userService.putMethod(path, this.userData.records[0]).subscribe(responce => {
          console.log('responce: ',responce);
          this._toastMessageService.alert("success", "User information update successfully.");
          this.signUpForm.reset();
          this.signUpForm['controls'].first_name.clearValidators(); 
          this.signUpForm['controls'].first_name.updateValueAndValidity()
          this.signUpForm['controls'].last_name.clearValidators();
          this.signUpForm['controls'].last_name.updateValueAndValidity()
          this.signUpForm['controls'].email.clearValidators();
          this.signUpForm['controls'].email.updateValueAndValidity()
          this.signUpForm['controls'].username.clearValidators();
          this.signUpForm['controls'].username.updateValueAndValidity()
          this.loading = false;
      },
      error=>{
        this.loading = false;
        if(error.error.status === 404){
          this._toastMessageService.alert("error", "Searched info not found.");
        }
        else{
          this._toastMessageService.alert("error", error.error.title);
        }
      })
    }
  }

}
