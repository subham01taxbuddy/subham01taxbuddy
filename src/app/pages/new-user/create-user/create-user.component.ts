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
    });

    this.exceptionalInfo = JSON.parse(sessionStorage.getItem("exceptionalUser"));
    console.log("exceptionalInfo: ", this.exceptionalInfo);
    if (this.utilSerive.isNonEmpty(this.exceptionalInfo)) {
      this.signUpForm.controls["first_name"].setValue('');
      this.signUpForm.controls["last_name"].setValue('');
      this.signUpForm.controls["email"].setValue(this.exceptionalInfo.email);
      this.signUpForm.controls["username"].setValue('');

    }
  }

  userSignUp() {
    if (this.signUpForm.valid) {
      let data = {
        firstName: this.signUpForm.controls["first_name"].value,
        lastName: this.signUpForm.controls["last_name"].value,
        email: this.signUpForm.controls["email"].value,
        mobile: this.signUpForm.controls["username"].value,
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
          }
          this.loading = false;
          this.utilSerive.showSnackBar("User create succesfully.");
        },
        (error) => {
          this.loading = false;
          console.log("Error when creating user: ", error);
          this.utilSerive.showSnackBar("Some issue to create user.");
        }
      );
    }
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
