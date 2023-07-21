import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewDocumentsComponent } from '../view-documents/view-documents.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
declare function we_track(key: string, value: any);

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss'],
})
export class UpdateStatusComponent implements OnInit {
  loading = false;
  selectedStatus: '';
  boStatus = [
    { key: 'Approve', value: 'APPROVE' },
    { key: 'Follow up', value: 'FOLLOWUP' },
    { key: 'Drop Off', value: 'DROP_OFF' },
    { key: 'Document Pending', value: 'DOCUMENT_PENDING' },
    { key: 'Paid', value: 'PAID' },
  ];
  myForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ViewDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _toastMessageService: ToastMessageService,
    private gstreportService: GstDailyReportService,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
  ) { }

  ngOnInit() {
    console.log(this.data);

    if(this.data.mode === 'Update Information'){
      this.getPartnerDetails();
    }

    this.myForm = new FormGroup({
      name: new FormControl(this.data.partnerName),
      mobileNo: new FormControl(this.data.mobileNumber),
      contactId: new FormControl('',[Validators.minLength(17),Validators.maxLength(19)]),
      fundId: new FormControl('',[Validators.minLength(17),Validators.maxLength(17)])
    });
  }

  getPartnerDetails(){
  // https://api.taxbuddy.com/user/partner-details?mobileNumber=9023056993
  this.loading=true;
  let param =`/partner-details?mobileNumber=${this.data.mobileNumber}`
  this.userMsService.getMethodNew(param).subscribe(
    (response: any) => {
      this.loading = false;
      if (response){
        this.loading = false;
        this.myForm.get('contactId')?.setValue(response.contactId);
        this.myForm.get('fundId')?.setValue(response.fundId);
      } else {
        this.loading = false;
        this._toastMessageService.alert("error",'No Data Found');
      }
    },
    (error) => {
      this.loading = false;
      this._toastMessageService.alert("error",'No Data Found');
    }
  );
  }

  updateDetails(){
    //'https://7nlo6vqc673gcqlt7dx5byvgo40qcfeg.lambda-url.ap-south-1.on.aws/?mobileNumber=4570459025' \
    const contactIdValue = this.myForm.get('contactId').value;
    const fundIdValue = this.myForm.get('fundId').value;

    if (contactIdValue !== null || fundIdValue !== null) {
       this.loading = true;

       const request = {
        contactId: contactIdValue,
        fundId : fundIdValue,
      };
      let param =`?mobileNumber=${this.data.mobileNumber}`;
      this.itrMsService.putLambdaForUpdateId(param,request).subscribe((response: any) => {
        this.loading = false;
        if (response.success) {
          this.loading = false;
          console.log('response', response['data']);
          this._toastMessageService.alert('success',response.message);
        }else{
          this.loading = false;
          this._toastMessageService.alert('error','There is some issue to Update information.');
        }
        setTimeout(() => {
          this.dialogRef.close({ event: 'close' })
        }, 2500)
      },(error) => {
        this.loading = false;
        this._toastMessageService.alert('error','There is some issue to Update information.');
      });

    } else {
      this._toastMessageService.alert("error",'please provide fund Id or contact Id');
    }

  }

  addStatus() {
    if (this.data.mode === 'Update Status') {
      this.loading = true;
      let param = '/partner-status';
      let param2 = {
        mobileNumber: this.data.mobileNumber,
        status: {
          status: this.selectedStatus,
        },
      };
      this.gstreportService.putMethod(param, param2).subscribe(
        (res) => {
          console.log('Status update response: ', res);
          this.loading = false;
          this._toastMessageService.alert(
            'success',
            'Status update successfully.'
          );
          we_track('Update status', {
            'User Name': this.data?.partnerName,
            'User Number': this.data?.mobileNumber,
            'From status': this.data?.currentStatus,
            'To status': this.selectedStatus,
          });
          this.dialogRef.close({
            event: 'close',
            data: 'statusChanged',
            responce: res,
          });
        },
        (error) => {
          this.loading = false;
          this._toastMessageService.alert(
            'error',
            'There is some issue to Update Status information.'
          );
        }
      );
    }
  }
}
