
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastMessage } from '../classes/toast';

@Injectable()
export class ToastMessageService {
    private subject = new Subject<ToastMessage>();

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
