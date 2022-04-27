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
 
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'backTipsDate'})
export class BacktipsDatePipe implements PipeTransform {
	transform(item: any, filter: string): any {
		if(!item) { return ""; }
		let day, month, month_names, year,hours,minutes,seconds;
		month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		if(filter != 'string') {
			item = new Date(item);
			day = item.getDate();
			month = item.getMonth();
			year = item.getFullYear().toString();
			hours = item.getHours()
			hours = (hours<10) ? "0"+hours : hours;
			minutes = item.getMinutes()
			minutes = (minutes<10) ? "0"+minutes : minutes;
			seconds = item.getSeconds()
			seconds = (seconds<10) ? "0"+seconds : seconds;
		}

		if(!(item instanceof Date) || isNaN(day)) { return "" }

		if(filter === 'short') {
			return day + ' ' + month_names[month] + ' ' + '`' + year.slice(year.length - 2, year.length);
		} else if(filter === 'no-year') {
			return day + ' ' + month_names[month];
		} else if(filter === 'on-month') {
			return ' ' + month_names[month] + ' ';
		} else if(filter === 'on-year') {
			return ' ' + year + ' ';
		} else if(filter === 'string') {
			return item;
		} else if( filter === 'full datetime') {
			return day + '/' + (month+1) + '/' + year + ' '+ hours+':'+minutes+':'+seconds;
		} else {
			return day + ' ' + month_names[month] + ' ' + year ;
		}
	}
}