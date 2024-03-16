import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DialogData } from 'src/app/modules/shared/components/navbar/navbar.component';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from "../../modules/shared/constants";

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent implements OnInit {
  helpForm!: UntypedFormGroup;
  isError: Boolean = false;
  apiSuccess: Boolean = false;
  btnDisabled: Boolean = false;
  hasSubmit = true;
  errorMessage = '';
  fileName = '';
  loading: Boolean = false;
  ticket_number = '';
  userData: any;
  selectedFileName: string;
  constructor(
    public dialogRef: MatDialogRef<NeedHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder,
    private userMsService: UserMsService
  ) { }
  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) ?? "")[0];
    this.helpForm = this.fb.group({
      description: new UntypedFormControl('', Validators.required),
      details: new UntypedFormControl(''),
      filename: new UntypedFormControl(''),
      mobileNo: new UntypedFormControl(this.userData.email, Validators.required)
    });
  }
  getURL() {
    return window.location.href;
  }

  submitForm() {
    this.loading = true;
    this.isError = false;
    if (this.helpForm.valid) {
      console.log('submitForm');
      const param = `/prod/ticket`;
      const request = {
        "code": "TAXBUDDY_TECHNICAL_ISSUE",
        "description": this.helpForm.controls['description'].value + ' ~ screen url:' + window.location.href,
        "agentName": this.userData.name,
        "email": this.userData.email,
        "mobile": this.helpForm.controls['mobileNo'].value,
        "environment": "UAT"
      };
      if (this.fileName) {
        request["fileName"] = this.fileName;
        // optional, include if there is any attachment
      }
      this.userMsService.postMethodAWSURL(param, request).subscribe(res => {
        this.ticket_number = res.data.ticket_number;
        console.log('success:', this.ticket_number);

        this.btnDisabled = false;
        this.apiSuccess = true;
      }, (error) => {
        this.btnDisabled = false;
      });

    }
  }

  onFileSelected(event: Event) {

    this.btnDisabled = true;
    const target = event.target as HTMLInputElement;
    if (target.files.length > 0) {
      this.selectedFileName = target.files[0].name;
      this.userMsService.uploadFile(target.files.item(0)).subscribe(res => {
        console.log('file upload res:', res);
        this.fileName = res && res.data && res.data.fileName ? res.data.fileName : '';
        this.btnDisabled = false;
      }, (error) => {
        this.btnDisabled = false;
      });
    }

  }

}
