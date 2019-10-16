/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 
import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.sass']
})
export class CalendarComponent implements OnInit {

  @Input('label') label: string;
  @Input('type') type: string;
  @Input('name') name: string;
  @Input('is_mandatory') is_mandatory: string = 'false';
  @Input('value') value: string;
  @Input('placeholder') placeholder: string;
  @Input('position') position: string;
  @Input('disabled') disabled: boolean = false;

  @Input('init_from_date') init_from_date: any = new Date();
  @Input('init_to_date') init_to_date: any = new Date();

  @Input('restrict_from_date') restrict_from_date: any = new Date();  

  @Input('isCompareDateShow') isCompareDateShow: boolean = false;
  @Input('format') format: string = 'All';

  @Output() sendBeginDate = new EventEmitter<Date>();
  @Output() sendEndDate = new EventEmitter<Date>();

  @Output() sendCompareInfo = new EventEmitter<any>();
  @Output() sendCompareFilter = new EventEmitter<string>();

	compare_dates: boolean = false;

	// compare
  compare_info = { type: 'Year', value: null};
  beginDate: Date = new Date('2017-01-01');
  endDate: Date = new Date('2017-01-04');
  selectedDates: any[] = [];
  getBeginYear: number;
  getEndYear: number;
  pipeFilter: string = 'no-year';
	compare_tabs: string[] = ['Year', 'Quarter', 'Month', 'Week', 'Day', 'Hour'];
	compare_tabs_active: boolean[] = [];
	title: string = 'years';
	last_val: number = null;
	last_from: string = '';
	from: boolean;
	years: number[] = [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022];
	months: number[] = [1,2,3,4,5,6,7,8,9,10,11,12];
  months_name: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	days: number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
		//hours
	include_hour: boolean;
	hours: string[] = ['1 am','2 am','3 am','4 am','5 am','6 am','7 am','8 am','9 am','10 am','11 am','12 am','1 am','2 pm','3 pm','4 pm','5 pm','6 pm','7 pm','8 pm','9 pm','10 pm','11 pm','12 pm'];
	from_hour: string = '1 am';
	to_hour: string = '1 am';
	showHourSelect: boolean[] = [];

	//range
  from_data: any = {
  	date: '2017-1-3',
  	month:  1,
    month_name: 'January',
    year: 2017,
    dateObject: []
  };
  to_data: any = {
    date: '2017-12-07',
    month: 12,
    month_name: 'December',
    year: 2017,
  	dateObject: []
  };

  showYearMonth: boolean[] = [];

	calendar_day_start: boolean[] = [];

  beginCalendar: any = { date: new Date(this.from_data.date) };
  endCalendar: any = { date: new Date(this.to_data.date) };

  showCalendar: boolean;

  constructor() { }

  ngOnInit() {    
    let fromDate = new Date();/*this.init_from_date*/
    let fmonth:any = (fromDate.getMonth() +1);
    let fdate:any = (fromDate.getDate());
    if(fmonth < 10){  fmonth = '0'+fmonth; }
    if(fdate < 10){ fdate = '0'+fdate; }
    
    this.from_data  = {
      date: fromDate.getFullYear() + "-" +fmonth + "-" + fdate,
      month:   (fromDate.getMonth() + 1),
      month_name: this.months_name[fromDate.getMonth()],
      year: (fromDate.getFullYear()),
      dateObject: []
    };

    let toDate = new Date();/*this.init_to_date*/
    let tmonth:any = (toDate.getMonth() +1);
    let tdate:any = (toDate.getDate());
    if(tmonth < 10){  tmonth = '0'+tmonth; }
    if(tdate < 10){ tdate = '0'+tdate; }
    this.to_data  = {
      date: toDate.getFullYear() + "-" +tmonth + "-" + tdate,
      month:   (toDate.getMonth() + 1),
      month_name: this.months_name[toDate.getMonth()],
      year: (toDate.getFullYear()),
      dateObject: []
    };
    
    /*this.endCalendar = JSON.parse(JSON.stringify(this.to_data));
    this.endCalendar.date = new Date(this.endCalendar.date)
    this.beginCalendar = JSON.parse(JSON.stringify(this.from_data));
    this.beginCalendar.date = new Date(this.beginCalendar.date)*/
    if(this.format == 'from') {      
      this.createDateObject(this.from_data.year, this.from_data.month, this.from_data);
      this.compare_dates = false;
    } else if(this.format == 'to') {
      this.createDateObject(this.to_data.year, this.to_data.month, this.to_data);
      this.compare_dates = false;
    } else {
      this.createDateObject(this.from_data.year, this.from_data.month, this.from_data);
      this.createDateObject(this.to_data.year, this.to_data.month, this.to_data);
    }
  }

  @HostListener('window:click') onClick() {
		for(var i = 0; i < this.showHourSelect.length; i++) {
			this.showHourSelect[i] = false;
		}
		for(var i = 0; i < this.showYearMonth.length; i++) {
			this.showYearMonth[i] = false;
		}
    // this.showCalendar = false;
  }

  openCalendar() {
    setTimeout(() => { this.showCalendar = true; }, 100);
  }

  changeLastVal(action) {
  	this.last_val = Number(this.last_val) + Number(action);
  	return this.last_val;
  }

  openSelect(value, count) {
  	setTimeout(() => {
  		switch(value) {
  			case 'from':
  				this.showYearMonth[count] = true;
  				break;
  			case 'hour':
  				if(this.include_hour) { this.showHourSelect[count] = true; }
  				break;
  		}
  	}, 100);
  }

  createDateObject(year, month, dateObject) {
  	let dateObj = new Date();
    let count_prev_month;
    let count_prev_year;
    let count_prev_days;
    let count_days;
    let count_next_year;
    let count_next_month;
    let count_next_days;
  	let findFirstDay = new Date();
  	let firstDay: number;
  	let days: any[] = [];
    let object = [];
  	
  	if(month - 1 < 1) { count_prev_days = this.returnDays(year-1, 12); count_prev_month = 12; count_prev_year = year - 1; }
  	else { count_prev_days = this.returnDays(year, month-1); count_prev_month = month - 1; count_prev_year = year; }
  	count_days = this.returnDays(year, month);
  	if(month + 1 > 12) { count_next_days = this.returnDays(year+1, 1); count_next_month = 1; count_next_year = year + 1; }
  	else { count_next_days = this.returnDays(year, month+1); count_next_month = month + 1; count_next_year = year; }

  	findFirstDay.setFullYear(year, month-1, 1);
  	firstDay = findFirstDay.getDay();

    if(firstDay == 0) { firstDay = 6; }
    else { firstDay = firstDay - 1; } 

  	object = object.concat(this.pushDays(count_prev_days, 'prev', count_prev_year, count_prev_month, count_prev_days - firstDay));
  	object = object.concat(this.pushDays(count_days, 'current', year, month, 0));
  	object = object.concat(this.pushDays(42 - object.length, 'next', count_next_year, count_next_month, 0));

  	object = this.returnWeeks(object);
    dateObject.dateObject = object;    
    this.calendarStartEnd(dateObject, this.beginCalendar, 'start');
    this.calendarStartEnd(dateObject, this.endCalendar, 'end');
  }

  pushDays(count: number, month: string, year: number, month_count: number, fCount: number) {
  	let days: any[] = [];
  	for(var d = fCount; d < count; d++) {
			days[d - fCount] = { 
				calendar_start: false, 
				calendar_end: false, 
        calendar_selected: false,
        day: d+1,
        month: month,
        year: year,
        month_count: month_count,
        date: new Date(year, month_count-1, d+1)
			}
  	}
  	return days;
  }

  returnWeeks(object) {
  	let weeks: any[] = [];
  	let count_weeks = -7;
  	for(var w = 0; w < 6; w++) {
  		weeks[w] = object.splice(count_weeks + 7, 7);
  	}
  	return weeks;
  }

  returnDays(year, month) {
  	return new Date(year, month, 0).getDate();
  }

  changeMonthUseArrow(value, object) {
      object.month = Number(object.month) + Number(value);
      object.month_name = this.months_name[object.month-1];
      if(object.month < 1) {
        object.month = 12;
        object.year = object.year - 1;
        object.month_name = this.months_name[object.month-1];
      } else if(object.month > 12) {
        object.month = 1;
        object.year = object.year + 1;
        object.month_name = this.months_name[object.month-1];
      }
      this.createDateObject(object.year, object.month, object);
  }

  calendarStartEnd(object, day, value) {
    for(var i = 0; i < object.dateObject.length; i++) {
      for(var d = 0; d < object.dateObject[i].length; d++) {
        object.dateObject[i][d].calendar_selected = false;
        if(this.beginCalendar.date < object.dateObject[i][d].date && object.dateObject[i][d].date < this.endCalendar.date) {
          object.dateObject[i][d].calendar_selected = true;
        }
        if(value == 'start') { 
          object.dateObject[i][d].calendar_start = false;
          if(this.beginCalendar.date.toDateString() == object.dateObject[i][d].date.toDateString()) { 
            object.dateObject[i][d].calendar_start = true;
          } 
        }
        else { 
          object.dateObject[i][d].calendar_end = false;
          if(this.endCalendar.date.toDateString() == object.dateObject[i][d].date.toDateString()) { 
            object.dateObject[i][d].calendar_end = true;
            object.dateObject[i][d].calendar_selected = false;
          } 
        }
      }
    }
  }

  disabledChangeMonth(day, object) {
    if(day.month == 'prev') {
      this.changeMonthUseArrow(-1, object);
    } else if(day.month == 'next') { 
      this.changeMonthUseArrow(+1, object);
    }
  }

  equalDates(val, side) {
    if(side == 'start') {
      this.beginCalendar.date = new Date(val);
      this.from_data.year = this.beginCalendar.date.getFullYear();
      this.from_data.month = this.beginCalendar.date.getMonth() + 1;
      this.from_data.month_name = this.months_name[this.from_data.month - 1];
      this.createDateObject(this.from_data.year,  this.from_data.month,  this.from_data);
      this.calendarStartEnd(this.to_data, this.beginCalendar, 'start');
    } else if(side == 'end') {
      this.endCalendar.date = new Date(val);
      this.to_data.year = this.endCalendar.date.getFullYear();
      this.to_data.month = this.endCalendar.date.getMonth() + 1;
      this.to_data.month_name = this.months_name[this.to_data.month - 1];
      this.createDateObject( this.to_data.year,  this.to_data.month,  this.to_data);
      this.calendarStartEnd(this.from_data, this.endCalendar, 'end');
    }
  }

  equalClickDate(object, day) {
    if(day.month_count < 10 && day.day < 10) { 
      object.date = day.year+'-0'+day.month_count+'-0'+day.day; 
    } else if(day.month_count < 10) {
      object.date = day.year+'-0'+day.month_count+'-'+day.day;
    } else if(day.day < 10) {
      object.date = day.year+'-'+day.month_count+'-0'+day.day;      
    } else {
      object.date = day.year+'-'+day.month_count+'-'+day.day;
    }
    return object.date;
  }

  yearCalendar() {
    this.to_data.year = this.from_data.year;
    this.from_data.month = 1;
    this.to_data.month = 12;
    this.from_data.month_name = this.months_name[0];
    this.to_data.month_name = this.months_name[11];
    this.beginCalendar = { date: new Date(this.from_data.year+'-01-01'), year: this.from_data.year, month_count: 1, month: 'current', day: 1 };
    this.endCalendar = { date: new Date(this.from_data.year+'-12-31'), year: this.from_data.year, month_count: 12, month: 'current', day: 31 };
    this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);
  }

  quarterCalendar() {    
    if(this.from_data.month <= 3) { this.from_data.month = 1; this.to_data.month = 3; }
    else if(this.from_data.month >= 4 && this.from_data.month <= 6) { this.from_data.month = 4; this.to_data.month = 6; }
    else if(this.from_data.month >= 7 && this.from_data.month <= 9) { this.from_data.month = 7; this.to_data.month = 9; }
    else if(this.from_data.month >= 10 && this.from_data.month <= 12) { this.from_data.month = 10; this.to_data.month = 12; }
    this.from_data.month_name = this.months_name[this.from_data.month - 1];
    this.to_data.month_name = this.months_name[this.to_data.month - 1];
    this.beginCalendar = { date: new Date(this.from_data.year+'-'+this.from_data.month+'-01'), year: this.from_data.year, month_count: this.from_data.month, month: 'current', day: 1 };
    this.endCalendar = { date: new Date(this.from_data.year+'-'+this.to_data.month+'-'+this.returnDays(this.from_data.year, this.to_data.month)), year: this.from_data.year, month_count: this.to_data.month, month: 'current', day: this.returnDays(this.from_data.year, this.to_data.month) };
    this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);
  }

  monthCalendar() {
    this.to_data.month = this.from_data.month;
    this.to_data.year = this.from_data.year;
    this.from_data.month_name = this.months_name[this.from_data.month - 1];
    this.to_data.month_name = this.months_name[this.from_data.month - 1];
    this.beginCalendar = { date: new Date(this.from_data.year+'-'+this.from_data.month+'-01'), year: this.from_data.year, month_count: this.from_data.month, month: 'current', day: 1 };
    this.endCalendar = { date: new Date(this.from_data.year+'-'+this.to_data.month+'-'+this.returnDays(this.from_data.year, this.to_data.month)), year: this.from_data.year, month_count: this.to_data.month, month: 'current', day: this.returnDays(this.from_data.year, this.to_data.month) };
    this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);
  }

  weekCalendar() {
    let beginDays, endDays;
    this.to_data.month = this.from_data.month;
    this.to_data.year = this.from_data.year;
    this.from_data.month_name = this.months_name[this.from_data.month - 1];
    this.to_data.month_name = this.months_name[this.from_data.month - 1];    
    var dateDiff = this.beginCalendar.date.getDate() - this.beginCalendar.date.getDay();    
    
    if(dateDiff < 0) {            
      beginDays = { day: this.returnDays(this.from_data.year,this.from_data.month-1)+dateDiff, month: this.from_data.month-1 };    
    } else if(dateDiff == 0) {            
      beginDays = { day: 1, month: this.from_data.month };    
    } else {
      beginDays = { day: dateDiff, month: this.from_data.month };    
    }
    
    this.beginCalendar = { date: new Date()};
    this.beginCalendar.date.setYear(this.from_data.year);
    this.beginCalendar.date.setMonth(beginDays.month-1);
    this.beginCalendar.date.setDate(beginDays.day);
    this.beginCalendar.day = this.beginCalendar.date.getDate();
    this.beginCalendar.month = this.beginCalendar.date.getMonth()+1;
    this.beginCalendar.year = this.beginCalendar.date.getFullYear();
    this.beginCalendar.month_count = this.beginCalendar.date.getMonth()+1;
    this.endCalendar = { date: new Date()};    

    this.endCalendar.date.setYear(JSON.parse(JSON.stringify(this.beginCalendar.date.getFullYear())));
    this.endCalendar.date.setMonth(JSON.parse(JSON.stringify(this.beginCalendar.date.getMonth())));    
    this.endCalendar.date.setDate(JSON.parse(JSON.stringify(this.beginCalendar.date.getDate() + 6)));
    this.endCalendar.day = this.endCalendar.date.getDate();
    this.endCalendar.month_count = this.endCalendar.date.getMonth()+1;
    this.endCalendar.month = this.endCalendar.date.getMonth()+1;
    this.endCalendar.year = this.endCalendar.date.getFullYear();
    this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);    
  }

  dayCalendar() {
    this.beginCalendar.date = new Date();
    this.from_data.year = this.beginCalendar.date.getFullYear();
    this.to_data.year = this.from_data.year;
    this.from_data.month = this.beginCalendar.date.getMonth() + 1;
    this.to_data.month = this.from_data.month;
    this.from_data.month_name = this.months_name[this.from_data.month - 1];
    this.to_data.month_name = this.months_name[this.from_data.month - 1];
    this.beginCalendar = { date: new Date(this.beginCalendar.date), year: this.from_data.year, month_count: this.from_data.month, month: 'current', day: this.beginCalendar.date.getDate() };
    this.endCalendar = this.beginCalendar;
    this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);
  }

  tabs(object1, object2, day1, day2) {
    this.createDateObject( object1.year,  object1.month,  object1);
    this.createDateObject( object1.year,  object2.month,  object2);
    this.equalClickDate(object1, day1);
    this.equalClickDate(object2, day2);
  }

  dateRange() {
    this.pipeFilter = 'no-year';
    this.selectedDates = [];
    this.getBeginYear = this.beginDate.getFullYear();
    this.getEndYear = this.endDate.getFullYear();
    let dateLength = Math.abs((this.beginDate.getTime() - this.endDate.getTime()) / 86400000) + 1;
    for(var i = 0; i < dateLength; i++) {
      this.selectedDates[i] = new Date(this.beginDate.getTime() + i * 86400000);
    }
  }

  compareRangeType() {
    for(var i = 0; i < this.compare_tabs_active.length; i++) {
      this.compare_info.type = this.compare_tabs[i];
    }
  }

  compareRange() {
    if(this.compare_info.type == 'Day') {
      this.endDate = new Date();
      this.beginDate = new Date(this.endDate.getTime() - Number(this.compare_info.value - 1) * 86400000);
      this.dateRange();
    } else if(this.compare_info.type == 'Month') {
      this.pipeFilter = 'on-month';
      this.selectedDates = [];
      for(var i = 0; i < Number(this.compare_info.value); i++) {
        this.endDate = new Date();
        this.beginDate = new Date();
        this.beginDate = new Date(this.beginDate.setMonth(this.beginDate.getMonth() - Number(this.compare_info.value - 1)));
        this.selectedDates[i] = new Date(this.beginDate.setMonth(this.beginDate.getMonth() + i));
      }
      this.beginDate = new Date(this.beginDate.setMonth(this.beginDate.getMonth() - Number(this.compare_info.value - 1)));
    } else if(this.compare_info.type == 'Year') {
      this.pipeFilter = 'on-year';
      this.selectedDates = [];
      for(var i = 0; i < Number(this.compare_info.value); i++) {
        this.endDate = new Date();
        this.beginDate = new Date();
        this.beginDate = new Date(this.beginDate.setFullYear(this.beginDate.getFullYear() - Number(this.compare_info.value - 1)));
        this.selectedDates[i] = new Date(this.beginDate.setFullYear(this.beginDate.getFullYear() + i));
      } 
      this.beginDate = new Date(this.beginDate.setFullYear(this.beginDate.getFullYear() - Number(this.compare_info.value - 1)));
      this.getBeginYear = this.beginDate.getFullYear();
      this.getEndYear = this.endDate.getFullYear();
    } else if(this.compare_info.type == 'Quarter') {
      let q_count = 1;
      this.pipeFilter = 'string';
      this.selectedDates = [];
      this.endDate = new Date();
      this.beginDate = new Date();
      this.beginDate = new Date(this.beginDate.getFullYear() + '-' + this.beginDate.getMonth() + '-' + '01');
      if(this.endDate.getMonth() <= 2) { this.endDate = new Date(this.endDate.setMonth(2)); }
      else if(this.endDate.getMonth() >= 3 && this.endDate.getMonth() <= 5) { this.endDate = new Date(this.endDate.setMonth(5)); }
      else if(this.endDate.getMonth() >= 6 && this.endDate.getMonth() <= 8) { this.endDate = new Date(this.endDate.setMonth(8)); }
      else if(this.endDate.getMonth() >= 9 && this.endDate.getMonth() <= 11) { this.endDate = new Date(this.endDate.setMonth(11)); }
      this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 0).getDate());
      this.beginDate = new Date(this.beginDate.setMonth((this.endDate.getMonth() + 1) - 3 * Number(this.compare_info.value)));
      this.getBeginYear = this.beginDate.getFullYear();
      this.getEndYear = this.endDate.getFullYear();
      for(var i = 0; i < Number(this.compare_info.value); i++) {
        if(q_count > 4) { q_count = 1; }
        this.selectedDates[i] = 'Q' + q_count++;
      }
    } else if(this.compare_info.type == 'Week') { 
      let w_count = 1;
      this.pipeFilter = 'string';
      this.selectedDates = [];
      this.endDate = new Date();
      if(this.endDate.getDay() == 0) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 6)); }
      else if(this.endDate.getDay() == 1) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 5)); }
      else if(this.endDate.getDay() == 2) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 4)); }
      else if(this.endDate.getDay() == 3) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 3)); }
      else if(this.endDate.getDay() == 4) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 2)); }
      else if(this.endDate.getDay() == 5) { this.endDate = new Date(this.endDate.setDate(this.endDate.getDate() + 1)); }
      this.beginDate = new Date();
      this.beginDate = new Date(this.beginDate.setDate(this.beginDate.getDate() - 7 * Number(this.compare_info.value)));
      for(var i = 0; i < Number(this.compare_info.value); i++) {
        this.selectedDates[i] = 'Week ' + w_count++;
      }
      this.getBeginYear = this.beginDate.getFullYear();
      this.getEndYear = this.endDate.getFullYear();
    } else if(this.compare_info.type == 'Hour') {
      this.pipeFilter = 'string';
      this.selectedDates = [];
      this.endDate = new Date();
      this.beginDate = new Date(this.beginDate.setHours(this.endDate.getHours() - Number(this.compare_info.value)));
      for(var i = 0; i < Number(this.compare_info.value); i++) {
        this.selectedDates[i] = this.beginDate.getHours() + i;
      }
      this.getBeginYear = this.beginDate.getFullYear();
      this.getEndYear = this.endDate.getFullYear();
    }
  }

  sendData() {
    if(this.compare_dates) {
      this.compareRange();
      this.beginCalendar.date = this.beginDate;
       this.endCalendar.date = this.endDate;
    } else {
      if(this.beginCalendar.date > this.endCalendar.date) {
        this.endCalendar.date = new Date(this.beginCalendar.date.getFullYear(), this.beginCalendar.date.getMonth(), this.returnDays(this.beginCalendar.date.getFullYear(), this.beginCalendar.date.getMonth()));
        this.tabs(this.from_data, this.to_data, this.beginCalendar, this.endCalendar);
      }
      this.beginDate = this.beginCalendar.date;
      this.endDate = this.endCalendar.date;
      this.dateRange();
    }
    this.sendBeginDate.emit(this.beginCalendar.date);
    this.sendEndDate.emit(this.endCalendar.date);
    this.sendCompareFilter.emit(this.pipeFilter);
    this.sendCompareInfo.emit(this.selectedDates);
  }

}
