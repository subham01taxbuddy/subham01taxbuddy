import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { UserMsService } from "app/services/user-ms.service";
import { UtilsService } from "app/services/utils.service";
@Component({
  selector: "app-create-user",
  templateUrl: "./create-user.component.html",
  styleUrls: ["./create-user.component.css"],
})
export class CreateUserComponent implements OnInit {
  loading: boolean;
  signUpForm: FormGroup;
  exceptionalUser: boolean = false;
  exceptionalInfo: any;
  services = [{value:'ITR'}, {value:'GST'}, {value:'TPA'}, {value:'NOTICE'}];

  constructor(
    private fb: FormBuilder,
    private utilSerive: UtilsService,
    private userService: UserMsService
  ) {}

  ngOnInit() {
    //console.log('user Info: ', this.activeRoute.snapshot.queryParamMap.get('user'))
    //console.log('user Info: ', this.activeRoute.snapshot.paramMap.get('user'))

    this.signUpForm = this.fb.group({
      first_name: new FormControl("", Validators.required),
      last_name: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      username: new FormControl("", Validators.required),
      serviceType: new FormControl("", Validators.required)
    });

    this.exceptionalInfo = JSON.parse(sessionStorage.getItem("exceptionalUser"));
    console.log("exceptionalInfo: ", this.exceptionalInfo);
    if (this.utilSerive.isNonEmpty(this.exceptionalInfo)) {
      this.signUpForm.controls["first_name"].setValue('');
      this.signUpForm.controls["last_name"].setValue('');
      this.signUpForm.controls["email"].setValue(this.exceptionalInfo.email);
      this.signUpForm.controls["username"].setValue('');
      this.signUpForm.controls["serviceType"].setValue('');
    }
  }

  userSignUp() {
    if (this.signUpForm.valid) {
      let data = {
        firstName: this.signUpForm.controls["first_name"].value,
        lastName: this.signUpForm.controls["last_name"].value,
        email: this.signUpForm.controls["email"].value,
        mobile: this.signUpForm.controls["username"].value,
        serviceType: this.signUpForm.controls["serviceType"].value,
        langKey: "en",
        authorities: ["ROLE_USER"],
        source: "BACK_OFFICE",
        initialData: "",
      };
      console.log("request body : ", data);
      this.loading = true;
      let param = "/user_account";
      this.userService.postMethod(param, data).subscribe(
        (responce) => {
          console.log("create user responce: ", responce);
          if(this.utilSerive.isNonEmpty(this.exceptionalInfo)) {
            this.exceptionalUser = true;
          }else{
            this.exceptionalUser = false;
            this.signUpForm.reset();
            this.signUpForm.controls["first_name"].clearValidators();
            this.signUpForm.controls["first_name"].updateValueAndValidity();
            this.signUpForm.controls["last_name"].clearValidators();
            this.signUpForm.controls["last_name"].updateValueAndValidity();
            this.signUpForm.controls["email"].clearValidators();
            this.signUpForm.controls["email"].updateValueAndValidity();
            this.signUpForm.controls["username"].clearValidators();
            this.signUpForm.controls["username"].updateValueAndValidity();
            this.signUpForm.controls["serviceType"].clearValidators();
            this.signUpForm.controls["serviceType"].updateValueAndValidity();
          }
          this.loading = false;
          this.utilSerive.showSnackBar("User create succesfully.");
          this.clearFromExceptionList(data.email);
        },
        (error) => {
          this.loading = false;
          console.log("Error when creating user: ", error);
          this.utilSerive.showSnackBar("Some issue to create user.");
        }
      );
    }
  }

  clearFromExceptionList(mail){
    console.log('Mail -> ',mail);
    //https://uat-api.taxbuddy.com/gateway/email-channel/exception/delete?email={email}
    let param = '/gateway/email-channel/exception/delete?email='+mail;
    this.userService.deleteMethod(param).subscribe(responce=>{
      console.log('Responce : ',responce);
      
    },error=>{
        console.log('Error while clear email from exmail exception list: ',error.error);
    })
  }

  uploadUserDocs(){
    //https://uat-api.taxbuddy.com/gateway/kommunicate/upload-files?email={email}
    this.loading = true;
    let param = '/kommunicate/upload-files?email='+this.exceptionalInfo.email;
    this.userService.getUserDetail(param).subscribe(responce=>{
      console.log('Document upload responce: ',responce);
      this.loading = false;
      this.utilSerive.showSnackBar("Document upload successfully.");
      this.exceptionalUser = false;
      this.signUpForm.reset();
      this.signUpForm.controls["first_name"].clearValidators();
      this.signUpForm.controls["first_name"].updateValueAndValidity();
      this.signUpForm.controls["last_name"].clearValidators();
      this.signUpForm.controls["last_name"].updateValueAndValidity();
      this.signUpForm.controls["email"].clearValidators();
      this.signUpForm.controls["email"].updateValueAndValidity();
      this.signUpForm.controls["username"].clearValidators();
      this.signUpForm.controls["username"].updateValueAndValidity();
      this.signUpForm.controls["serviceType"].clearValidators();
      this.signUpForm.controls["serviceType"].updateValueAndValidity();
    },
    error=>{
      console.log('Error :',error)
      this.loading = false;
      this.utilSerive.showSnackBar("Fail to upload document.");
    })
  }

  ngOnDestroy(): void {
    sessionStorage.setItem("exceptionalUser", null);
  }
}
