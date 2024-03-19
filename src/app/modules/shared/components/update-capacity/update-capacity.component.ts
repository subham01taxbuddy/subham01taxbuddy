import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
@Component({
  selector: 'app-update-capacity',
  templateUrl: './update-capacity.component.html',
  styleUrls: ['./update-capacity.component.scss']
})
export class UpdateCapacityComponent implements OnInit {
  loading!: boolean;
  caseLimitForm: UntypedFormGroup;
  caseLimit = [
    { key: "5 Cases", checked: false, value: 5 },
    { key: "10 Cases", checked: false, value: 10 },
    { key: "15 Cases", checked: false, value: 15 },
    { key: "20 Cases", checked: false, value: 20 },
    { key: "30 Cases", checked: false, value: 30 },
    { key: "50 Cases", checked: false, value: 50 }
  ];
  activeCaseMaxCapacity = new UntypedFormControl('')
  constructor(
    public dialogRef: MatDialogRef<UpdateCapacityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserMsService,
    private fb: UntypedFormBuilder,
    private toastMessage: ToastMessageService
  ) {
    console.log('data', this.data)
    this.activeCaseMaxCapacity.setValue(this.data.data.activeCaseMaxCapacity || '');
    this.caseLimitForm = this.fb.group({});
    this.caseLimit.forEach((limit) => {
      this.caseLimitForm.addControl(limit.key, new UntypedFormControl(false));
    });
  }

  ngOnInit(): void {

    if (this.data.data?.['activeCaseMaxCapacity']) {
      let allCases = [{ key: "5 Cases", value: 5 }, { key: "10 Cases", value: 10 }, { key: "15 Cases", value: 15 }, { key: "20 Cases", value: 20 }, { key: "30 Cases", value: 30 }, { key: "50 Cases", value: 50 },]
      allCases.forEach(item => {
        if (item.value === this.data.data?.['activeCaseMaxCapacity'])
          this.caseLimitForm.setControl(item.key, new UntypedFormControl(true));
      });
    }
  }

  getCaseLimitControl(limit: string): UntypedFormControl {
    return this.caseLimitForm.get(limit) as UntypedFormControl;
  }

  onCaseLimitCheckboxChange(event: any, selectedLimit: string) {
    if (event.checked) {
      this.caseLimit.forEach((limit) => {
        limit.checked = true;
        if (limit.key !== selectedLimit) {
          this.getCaseLimitControl(limit.key).setValue(false);
          limit.checked = false;
        }
      });
      this.caseLimit.forEach(element => {
        if (element.checked) {
          this.data.data['activeCaseMaxCapacity'] = element.value;
        }
      });
    } else {
      this.getCaseLimitControl(selectedLimit).setValue(true);
    }
  }

  updateCapacity(status) {
    //https://uat-api.taxbuddy.com/user/v2/update-max-capacity?filerUserId=14147&activeCaseMaxCapacity=55
    if (status) {
      const value = this.activeCaseMaxCapacity.value;
      if (value && value > 0){
        let param = '/v2/update-max-capacity?filerUserId=' + this.data.data.userId + '&activeCaseMaxCapacity=' + this.activeCaseMaxCapacity.value;
        this.loading = true;
        this.userService.putMethod(param, '').subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success) {
              this.toastMessage.alert('success', 'Active Capacity updated successfully');
              this.dialogRef.close(status);
            } else {
              this.dialogRef.close(status);
              this.toastMessage.alert('error', res.message);
            }
          },
          (error) => {
            this.dialogRef.close(status);
            this.toastMessage.alert('error', 'failed to update.');
            this.loading = false;
          }
        );
      }else{
        this.toastMessage.alert('error', 'please enter valid case limit value.');
      }
    } else {
      this.dialogRef.close(status);
    }
  }


}
