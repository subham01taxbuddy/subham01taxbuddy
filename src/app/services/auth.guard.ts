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
import { Injectable } from '@angular/core';
import { CanActivate,ActivatedRoute,Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
	publicUrl:any  = ["/",'/login'];
    startWithUrl: any = [];
    constructor(private router: Router) {}

    canActivate(route) {     
	    let queryParamas = route.queryParams || {};
        let userData:any = JSON.parse(localStorage.getItem("UMD")) || {};
        var x_aut_token = (userData && userData.id_token) ? userData.id_token : null

        let startWithUrlFound = 0;
        for(var i=0,stwLen=this.startWithUrl.length;i<stwLen;i++) {
            if(route['_routerState'].url.startsWith(this.startWithUrl[i])) {
                startWithUrlFound = 1;
                break;
            }
        }
	    if(x_aut_token && (this.publicUrl.indexOf(route['_routerState'].url) != -1)) {
	        this.router.navigate(['/home']);
	        return false;
        }

        if((this.publicUrl.indexOf(route['_routerState'].url) != -1 || startWithUrlFound) || (x_aut_token)) {
            return true;
        }
        
        this.router.navigate(['/']);
        return false;
    }
}
