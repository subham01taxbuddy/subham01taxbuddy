import { AppConstants } from 'app/shared/constants';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  templateUrl: './filing-calendar.component.html',
  styleUrls: ['./filing-calendar.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class FilingCalendarComponent implements OnInit {
  loading: boolean = false;
  filingCalenderForm: FormGroup;
  financialYear = AppConstants.subscriptionFyList;
  gstTypesMaster = AppConstants.gstTypesMaster;
  frequencyTypesMaster = AppConstants.frequencyTypesMaster;
  returnTypeMaster = AppConstants.returnTypeMaster;

  monthsMaster: any = [{ label: 'Jan', value: 'JAN' },
  { label: 'Feb', value: 'FEB' },
  { label: 'Mar', value: 'MAR' },
  { label: 'Apr', value: 'APR' },
  { label: 'May', value: 'MAY' },
  { label: 'Jun', value: 'JUN' },
  { label: 'Jul', value: 'JUL' },
  { label: 'Aug', value: 'AUG' },
  { label: 'Sep', value: 'SEP' },
  { label: 'Oct', value: 'OCT' },
  { label: 'Nov', value: 'NOV' },
  { label: 'Dec', value: 'DEC' }
  ];
  maxFilingDate = new Date();
  constructor(public dialogRef: MatDialogRef<FilingCalendarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder,
    public utilsService: UtilsService, private itrMsService: ItrMsService) { }

  ngOnInit() {
    console.log(this.data);
    this.filingCalenderForm = this.fb.group({
      userId: [this.data.userId],
      subscriptionId: [this.data.subscriptionId],
      serviceType: [this.data.serviceType],
      filingCalendar: this.fb.array([]),
    });
    this.setMasterDropdownValues(this.data.serviceType);
    if (this.data.mode === 'CREATE') {
      if (this.data.serviceType === 'GST') {
        this.createGstFilingCalendar();
      } else if (this.data.serviceType === 'ITR') {
        const fCalender = <FormArray>this.filingCalenderForm.get('filingCalendar');
        let obj = {
          financialYear: '',
          month: '',
          year: '',
          returnType: 'ORIGINAL',
          frequency: 'YEARLY',
          dueDate: '',
          filingDate: '',
          smeAssigneeId: this.data.smeAssigneeId,
        }
        fCalender.push(this.createFilingCalendarForm(obj));
      }
    } else {
      if (this.utilsService.isNonEmpty(this.data.filingCalendar)) {
        this.filingCalenderForm.patchValue(this.data);
        const filingCalendar = <FormArray>this.filingCalenderForm.get('filingCalendar');
        this.data.filingCalendar.forEach(obj => {
          filingCalendar.push(this.createFilingCalendarForm(obj));
        });
        console.log('Filing calender form patch value:', this.filingCalenderForm.value);
      } else {
        this.utilsService.showSnackBar('Calendar Data missing please try again')
      }
    }
    console.log(this.filingCalenderForm.value);

  }

  setMasterDropdownValues(serviceType) {
    if (serviceType === 'GST') {
      if (this.data.gstType === 'COMPOSITE') {
        this.returnTypeMaster = [{ label: 'CMP08', value: 'CMP08' }];
        this.frequencyTypesMaster = [{ label: 'Quarterly', value: 'QUARTERLY' }];
      } else if (this.data.gstType === 'REGULAR') {
        this.returnTypeMaster = [{ label: 'GSTR-3B', value: 'GSTR-3B' }, { label: 'GSTR1', value: 'GSTR1' }];
        this.frequencyTypesMaster = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Quarterly', value: 'QUARTERLY' }];
      }
    } else if (serviceType === 'ITR') {
      this.returnTypeMaster = [{ label: 'Original', value: 'ORIGINAL' }, { label: 'Revised', value: 'REVISED' }];
      this.frequencyTypesMaster = [{ label: 'Yearly', value: 'YEARLY' }];
    }
  }
  createFilingCalendarForm(obj: {
    financialYear?: any, month?: any, year?: any, returnType?: string, frequency?: string, dueDate?: any,
    filingDate?: any, smeAssigneeId?: any
  } = {}): FormGroup {
    return this.fb.group({
      financialYear: [obj.financialYear || ''],
      month: [obj.month || ''],
      year: [obj.year || ''],
      returnType: [obj.returnType || ''],
      frequency: [obj.frequency || ''],
      dueDate: [obj.dueDate || ''],
      filingDate: [obj.filingDate || ''],
      smeAssigneeId: [obj.smeAssigneeId || ''],
    });
  }

  createGstFilingCalendar() {
    const fCalender = <FormArray>this.filingCalenderForm.get('filingCalendar');
    for (let i = 0; i < this.data.noOfMonths; i++) {
      let month = this.data.startMonth + i <= 11 ? this.data.startMonth + i : this.data.startMonth + i - 12;
      let year = this.data.startMonth + i <= 11 ? this.data.startYear : this.data.startYear + 1;
      if (this.data.gstType === 'COMPOSITE') {
        if (month === 2 || month === 5 || month === 8 || month === 11) {
          let obj = {
            financialYear: '',
            month: this.monthsMaster[month].value,
            year: year.toString(),
            returnType: 'CMP08',
            frequency: 'QUARTERLY',
            dueDate: '',
            filingDate: '',
            smeAssigneeId: this.data.smeAssigneeId,
          }
          fCalender.push(this.createFilingCalendarForm(obj));
        }
      } else if (this.data.gstType === 'REGULAR') {
        let obj = {
          financialYear: '',
          month: this.monthsMaster[month].value,
          year: year.toString(),
          returnType: 'GSTR-3B',
          frequency: 'MONTHLY',
          dueDate: '',
          filingDate: '',
          smeAssigneeId: this.data.smeAssigneeId,
        };
        console.log('objobjobjobj:', obj);
        fCalender.push(this.createFilingCalendarForm(obj));
        if (this.data.frequency === 'QUARTERLY') {
          if (month === 2 || month === 5 || month === 8 || month === 11) {
            let obj = {
              financialYear: '',
              month: this.monthsMaster[month].value,
              year: year.toString(),
              returnType: 'GSTR1',
              frequency: 'QUARTERLY',
              dueDate: '',
              filingDate: '',
              smeAssigneeId: this.data.smeAssigneeId,
            }
            fCalender.push(this.createFilingCalendarForm(obj));
          }
        } else if (this.data.frequency === 'MONTHLY') {
          let obj = {
            financialYear: '',
            month: this.monthsMaster[month].value,
            year: year.toString(),
            returnType: 'GSTR1',
            frequency: 'MONTHLY',
            dueDate: '',
            filingDate: '',
            smeAssigneeId: this.data.smeAssigneeId,
          }
          fCalender.push(this.createFilingCalendarForm(obj));
        }
      }
    }
  }

  saveFilingCalendar() {
    const param = `/subscription/filings-calender`;
    console.log(this.filingCalenderForm.getRawValue());
    this.loading = true;
    this.itrMsService.postMethod(param, this.filingCalenderForm.getRawValue()).subscribe(res => {
      this.loading = false;
      console.log(res)
      this.dialogRef.close({ data: this.filingCalenderForm.getRawValue(), result: 'SUCCESS' })
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Error while creating filing calendar, please try again');
    })
  }

  get getFilingCalendarArray() {
    return <FormArray>this.filingCalenderForm.get('filingCalendar');
  }
}
