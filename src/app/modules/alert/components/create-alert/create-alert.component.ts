import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup,ValidationErrors, Validators } from '@angular/forms';
import { MatDatepicker} from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlertService } from 'src/app/services/alert.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-create-alert',
  templateUrl: './create-alert.component.html',
  styleUrls: ['./create-alert.component.scss'],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class CreateAlertComponent {
  loading : boolean = false;
  alertForm: FormGroup;
  alertTypes = ['INFORMATION', 'UPDATES', 'CRITICAL'];
  channels = ['EMAIL', 'PUSHMESSAGE'];
  errorMessage: string | null = null;

  @ViewChild('pickerFrom') pickerFrom: MatDatepicker<Date>;
  @ViewChild('pickerTo') pickerTo: MatDatepicker<Date>;
  
  minDate: Date = new Date(); 
  minDateTo: Date;
 
  constructor(private alertService: AlertService,
              private fb: FormBuilder, 
              private snackbar : MatSnackBar,
              private changeDetectorRef: ChangeDetectorRef,
              ) {} 

  ngOnInit() {
    this.initForm();
   this.setMinDateTo();
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

    this.alertForm.get('applicableFromDate').setValidators([Validators.required, this.dateFromValidator.bind(this)]);
    this.alertForm.get('applicableToDate').setValidators([Validators.required, this.dateToValidator.bind(this)]);

    this.alertForm.get('applicableFromDate').valueChanges.subscribe(value => {
    this.setMinDateTo();
    this.alertForm.get('applicableToDate').updateValueAndValidity();
    });
  }

  setMinDateTo() {
    const fromDate = this.alertForm.get('applicableFromDate').value;
    this.minDateTo = fromDate ? new Date(fromDate) : new Date();
  }
  createAlert() {
    this.loading = true;

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

      this.alertService.postMethodAlert(formattedData).subscribe(
        response => {
          console.log('Alert created successfully:', response);
          this.loading = false;
         this.snackbar.open('Alert created successfully', 'Close', {
          duration: 3000,
        });
          this.resetForm();
          
        },
        error => {
          this.loading = false;
          console.error('Error creating alert:', error);
          this.errorMessage = 'Failed to create alert. Please try again later.';
          this.snackbar.open('Failed to create alert. Please try again later.', 'Close', {
            duration: 3000,
          });
        }
      );
    } else {
      this.loading = false;
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
  
  Object.keys(this.alertForm.controls).forEach(key => {
    const control = this.alertForm.get(key);
    control.setErrors(null);
    control.markAsPristine();
    control.markAsUntouched();
  });

  this.alertForm.setErrors(null);
  this.alertForm.markAsPristine();
  this.alertForm.markAsUntouched();
  
  this.changeDetectorRef.detectChanges();
}

 dateFromValidator(control: AbstractControl): ValidationErrors | null {
  const selectedDate = new Date(control.value);
  if (selectedDate < this.minDate) {
    return { 'dateFromInvalid': true };
  }
  return null;
}

dateToValidator(control: AbstractControl): ValidationErrors | null {
  if (!this.alertForm) {
    return null; 
  }
  const toDate = new Date(control.value);
  const fromDateControl = this.alertForm.get('applicableFromDate');
  if (!fromDateControl) {
    return null; 
  }
  const fromDate = fromDateControl.value;
  if (fromDate && toDate < fromDate) {
    return { 'dateToInvalid': true };
  }
  return null;
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

  dateFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return d >= this.minDate;
  }
  openDatePicker(picker: 'from' | 'to') {
    if (picker === 'from') {
      this.pickerFrom.open();
    } else {
      this.pickerTo.open();
    }
  }
}



