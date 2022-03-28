
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable,Subject } from 'rxjs';
import {ToastMessage} from '../classes/toast';

@Injectable()
export class ToastMessageService {
    private subject = new Subject<ToastMessage>();
    private keepAfterRouteChange = false;
 
    constructor(private router: Router) {        
        /*router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterRouteChange) {                    
                    this.keepAfterRouteChange = false;
                } else {                    
                    this.clear();
                }
            }
        });*/
    }
 
    getAlert(): Observable<ToastMessage> {
        return this.subject.asObservable();
    }

    alert(type: string, message: string) { 
        this.subject.next(<ToastMessage>{ type: type, message: message });
    }
 
    clear() {        
        this.subject.next(null);
    }
}