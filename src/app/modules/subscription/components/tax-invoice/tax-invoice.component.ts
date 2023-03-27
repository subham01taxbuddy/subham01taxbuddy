import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
  selector: 'app-tax-invoice',
  templateUrl: './tax-invoice.component.html',
  styleUrls: ['./tax-invoice.component.scss'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class TaxInvoiceComponent implements OnInit {

  loading!: boolean;
  loggedInSme:any;
  maxDate: any = new Date();
  toDateMin: any;
  Status: any = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' }
  ]
  fyDropDown: any = [
    { label: '2022-2023', value: '2022-2023', startDate: new Date('2022-04-01'), endDate: new Date() },
    { label: '2021-2022', value: '2021-2022', startDate: new Date('2021-04-01'), endDate: new Date('2022-03-31') },
    { label: '2020-2021', value: '2020-2021', startDate: new Date('2020-04-01'), endDate: new Date('2021-03-31') }
  ]
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.getInvoice();
  }

  filerFormGroup :FormGroup = this.fb.group({
    assessmentYear: new FormControl(''),
    startDate :new FormControl(''),
    endDate :new FormControl(''),
    status:new FormControl(''),
  });
  get assessmentYear() {
    return this.filerFormGroup.controls['assessmentYear'] as FormControl;
  }
  get startDate() {
    return this.filerFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.filerFormGroup.controls['endDate'] as FormControl;
  }
  get status() {
    return this.filerFormGroup.controls['status'] as FormControl;
  }


  getInvoice(){

  }
  setDates() {
    let data = this.fyDropDown.filter((item: any) => item.value === this.assessmentYear.value);
    if (data.length > 0) {
      this.startDate.setValue(data[0].startDate);
      this.endDate.setValue(data[0].endDate);
    }
    console.log(data)
  }
  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    this.toDateMin = FromDate;
  }

}
