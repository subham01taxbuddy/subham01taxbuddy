import { Component, ElementRef, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ConfirmModel } from '../../promo-codes/add-edit-promo-code/add-edit-promo-code.component';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import * as ɵngcc0 from '@angular/core';
import { ReviewService } from '../../review/services/review.service';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';

export const MY_FORMATS = {
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
  selector: 'app-add-new-course',
  templateUrl: './add-new-course.component.html',
  styleUrls: ['./add-new-course.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddNewCourseComponent implements OnInit {
  @ɵngcc0.ViewChild('timeInput') timeInput: ElementRef;
  loading!: boolean;
  courseForm!: UntypedFormGroup;
  today: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<AddNewCourseComponent>,
    private _toastMessageService: ToastMessageService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private fb: UntypedFormBuilder,
    private reviewService: ReviewService,
    public utilsService: UtilsService,
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  ngOnInit() {
    console.log('data from add button', this.data);
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required],
      topics: ['',Validators.required],
      whatsAppLink: ['',Validators.required],
      startDate: [new Date(), Validators.required],
      time: ['',Validators.required],
      zoomLink: ['',Validators.required],
      meetingId: ['',Validators.required],
      passCode: ['',Validators.required],
    });
  }

  add() {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/course-data'
    if (this.courseForm.valid) {
      this.loading = true;
      let param = `course-data`;
      let convertedTime = moment(this.courseForm.get('time').value, 'hh:mm A').format('HH:mm')
      const request = {
        courseName: this.courseForm.get('courseName').value,
        topics: this.courseForm.get('topics').value,
        whatsappLink: this.courseForm.get('whatsAppLink').value,
        startDate: this.courseForm.get('startDate').value,
        time: convertedTime,
        meetingId: this.courseForm.get('meetingId').value,
        passcode: this.courseForm.get('passCode').value,
        zoomLink: this.courseForm.get('zoomLink').value,
      };
      this.reviewService.postMethod(param, request).subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            console.log('response', response);
            this.utilsService.showSnackBar(response.message);
            setTimeout(() => {
              this.dialogRef.close({ event: 'close', data: 'courseAdded' });
            }, 1500);
          } else {
            this.utilsService.showSnackBar(response.message);
          }
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error in API of get course list', error);
          this.utilsService.showSnackBar('Error in API of get course list');
        }
      });
    }else {
      this._toastMessageService.alert("error", "Please add all required values")
    }
  }
}
