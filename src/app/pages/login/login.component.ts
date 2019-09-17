/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 
import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';

import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  component_link: string = 'login';
  public form: FormGroup;
  public user: AbstractControl;
  public passphrase: AbstractControl;
  public loading: boolean = false;
  constructor(private fb: FormBuilder,private navbarService: NavbarService,public http: HttpClient,
    public router: Router,private _toastMessageService:ToastMessageService) {
    NavbarService.getInstance(null).component_link = this.component_link;
  }

  ngOnInit() {
    this.form = this.fb.group({
      'user': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'passphrase': ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });

    this.user = this.form.controls['user'];
    this.passphrase = this.form.controls['passphrase'];
  }  
  

  public onSubmit(values: any): void {
    let loginData:any = {
      username:  values.user,
      password: values.passphrase,
      accessToken:"",
      outhProvider:""
    }

    this.loading = true;
    NavbarService.getInstance(this.http).login(loginData).subscribe(res => {
      /*if(res && res.role.indexOf("ROLE_ADMIN") == -1) {
        this._toastMessageService.alert("error", "Access Denied.");        
      } else*/ if (res && res.id_token) {                
        NavbarService.getInstance(null).setUserData(res);        
        this.router.navigate(['pages/home']);       
      } else {
        this._toastMessageService.alert("error", "The Mobile/Email address or Password entered, is not correct. Please check and try again");        
      }
      this.loading = false;
    }, err => {
      let errorMessage = "Internal server error."
      if([400,401].indexOf(err.status) != -1) {
        errorMessage = "User name or Password is wrong."
      }
      this._toastMessageService.alert("error", errorMessage );
      this.loading = false;      
    });
  }
}
