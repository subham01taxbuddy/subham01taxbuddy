import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/modules/shared/components/navbar/navbar.component';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent implements OnInit {
  helpForm!: FormGroup;
  isError: Boolean = false;
  btnDisabled: Boolean = false;
  errorMessage = '';
  fileName = '';
  // dialogRef: any;
  constructor(
    public dialogRef: MatDialogRef<NeedHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private userMsService: UserMsService,
  ) { }
  ngOnInit(): void {
    this.helpForm = this.fb.group({
      description: new FormControl('', Validators.required),
      details: new FormControl(''),
      filename: new FormControl(''),
    });
  }

  submitForm() {
    this.isError = false;
    if (this.helpForm.valid) {
      console.log('submitForm');
      const param = `/prod/ticket`;
      const request = {
        "code": "TAXBUDDY_TECHNICAL_ISSUE",
        "description": this.helpForm.controls['description'].value,
        "agentName": "Test Agent3",
        "email": "test@gmail.com",
        "mobile": "+919999999999",
        // "fileName": this.fileName, // optional, include if there is any attachment
        "environment": "UAT"
      };
      this.userMsService.postMethodAWSURL(param, request).subscribe(res => {
        console.log('file upload res:', res);
        this.btnDisabled = false;
      }, (error) => {
        this.btnDisabled = false;
      });

    }
  }

  onFileSelected(event: Event) {
    this.btnDisabled = true;
    const target = event.target as HTMLInputElement;
    if (target.files.length > 0) {
      console.log('target.files.item(0)', target.files.item(0));
      this.userMsService.uploadFile(target.files.item(0)).subscribe(res => {
        console.log('file upload res:', res);
        this.fileName = res && res.data && res.data.fileName ? res.data.fileName : '';
        this.btnDisabled = false;
      }, (error) => {
        this.btnDisabled = false;
      });
    }

  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
