import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  loading: boolean;
  signUpForm: FormGroup;
  constructor(private fb: FormBuilder, private utilSerive: UtilsService, private userService: UserMsService) {

   }

  ngOnInit() {
    //console.log('user Info: ', this.activeRoute.snapshot.queryParamMap.get('user'))
    //console.log('user Info: ', this.activeRoute.snapshot.paramMap.get('user'))

    this.signUpForm = this.fb.group({
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required)
    })
    
    var exceptionalInfo = JSON.parse(sessionStorage.getItem('exceptionalUser'));
    console.log('exceptionalInfo: ',exceptionalInfo);
    if(this.utilSerive.isNonEmpty(exceptionalInfo)){
        this.signUpForm.controls['first_name'].setValue(exceptionalInfo.name);
        this.signUpForm.controls['last_name'].setValue('');
        this.signUpForm.controls['email'].setValue(exceptionalInfo.email);
        this.signUpForm.controls['username'].setValue(exceptionalInfo.mobileNumber);
    }
  }

  userSignUp(){

    let data = {
      firstName: this.signUpForm.controls['first_name'].value,
      lastName: this.signUpForm.controls['last_name'].value,
      email: this.signUpForm.controls['email'].value,
      mobile: this.signUpForm.controls['username'].value,
      langKey: 'en',
      authorities: ['ROLE_USER'],
      source: 'BACK_OFFICE',
      initialData: ''
    };
    console.log('request body : ',data)
    this.loading = true;
    let param = '/user_account'; 
    this.userService.postMethod(param, data).subscribe(responce=>{
      console.log('create user responce: ',responce);
      this.loading = false;

      this.utilSerive.showSnackBar('User create succesfully.')
    },
     error=> {
      this.loading = false;
        console.log('Error when creating user: ',error)
        this.utilSerive.showSnackBar('Some issue to create user.')
     })


  }

  ngOnDestroy(): void {
    sessionStorage.setItem('exceptionalUser', null);
  }

}
