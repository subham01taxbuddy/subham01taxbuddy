import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  selector: 'app-create-alert',
  templateUrl: './create-alert.component.html',
  styleUrls: ['./create-alert.component.scss']
})
export class CreateAlertComponent {

  alertForm: FormGroup;
  alertTypes = ['INFORMATION', 'UPDATES', 'CRITICAL'];
  channels = ['EMAIL', 'PUSHMESSAGE'];
  errorMessage: string | null = null;

  constructor(private userMsService: UserMsService, private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.alertForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      applicableFromDate: [new Date(), Validators.required],
      applicableFromTime: ['00:00', Validators.required],
      applicableToDate: [new Date(), Validators.required],
      applicableToTime: ['23:59', Validators.required]
    });
  }

  createAlert() {

    if (this.alertForm.valid) {
      const formValue = this.alertForm.value;
      const fromDateTime = this.combineDateTime(formValue.applicableFromDate, formValue.applicableFromTime);
      const toDateTime = this.combineDateTime(formValue.applicableToDate, formValue.applicableToTime);

      const formattedData = {
        type: formValue.type,
        title: formValue.title,
        message: formValue.message,
        applicableFrom: fromDateTime.toISOString(),
        applicableTo: toDateTime.toISOString()
      };

      this.userMsService.postMethodAlert(formattedData).subscribe(
        response => {
          console.log('Alert created successfully:', response);
          this.errorMessage = null;
          this.resetForm();
        },
        error => {
          console.error('Error creating alert:', error);
          this.errorMessage = 'Failed to create alert. Please try again later.';
        }
      );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  resetForm() {
    this.alertForm.reset({
      type: '',
      title: '',
      message: '',
      applicableFromDate: new Date(),
      applicableFromTime: '00:00',
      applicableToDate: new Date(),
      applicableToTime: '23:59'
    });
  }
  combineDateTime(date: Date, time: string): Date {
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    return combinedDate;
  }
}



