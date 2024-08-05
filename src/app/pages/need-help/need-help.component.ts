import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  isError: boolean = false;
  apiSuccess: boolean = false;
  btnDisabled: boolean = false;
  hasSubmit = true;
  errorMessage = '';
  fileName = '';
  loading: boolean = false;
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
      this.userMsService.postMethodAWSURL(param, request).subscribe({
        next: (res: any) => {
          this.ticket_number = res.data.ticket_number;
          console.log('success:', this.ticket_number);
          this.btnDisabled = false;
          this.apiSuccess = true;
        },
        error: (error: any) => {
          console.error('Error during form submission:', error);
          this.btnDisabled = false;
          this.isError = true;
        }
      });

    }
  }

  onFileSelected(event: Event) {
    this.btnDisabled = true;
    const target = event.target as HTMLInputElement;
    if (target.files.length > 0) {
      this.selectedFileName = target.files[0].name;
      const file = target.files.item(0);

      this.userMsService.uploadFile(file).subscribe({
        next: (res: any) => {
          console.log('file upload res:', res);
          this.fileName = res?.data?.fileName || '';
          this.btnDisabled = false;
        },
        error: (error: any) => {
          console.error('Error during file upload:', error);
          this.btnDisabled = false;
        },
        complete: () => {
          console.log('File upload completed');
          this.btnDisabled = false;
        }
      });
    }
  }

}
