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

@Pipe({name: 'selectFilter'})
export class SelectFilterPipe implements PipeTransform {
	transform(items: any[], criteria: string): any {
		if(criteria === 'all' || !criteria || Array.isArray(criteria)) {
			return items;
		} else {
			return items.filter(item => {
				if(item && item.toLowerCase().search(criteria.toLowerCase()) != -1) {
					return item;
				}
			});
		}
	}	
}

@Pipe({name: 'selectObjFilter'})
export class SelectObjFilterPipe implements PipeTransform {
	transform(items: any[], criteria: string, key: string): any {
		if(criteria === 'all') {
			return items;
		} else if(Array.isArray(items)){
			return items.filter(item => {
				if(item[key].toLowerCase().indexOf(criteria.toLowerCase()) == 0) {
					return item;
				}
			});
		} else {
			return items;
		}
	}	
}
