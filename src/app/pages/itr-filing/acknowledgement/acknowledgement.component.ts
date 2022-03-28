import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
@Component({
    selector: 'app-acknowledgement',
    templateUrl: './acknowledgement.component.html',
    //   styleUrls: ['./acknowledgement.component.css']
})
export class AcknowledgementComponent {
    ITR_JSON: ITR_JSON
    status: string = '';
    constructor(private activatedRoute: ActivatedRoute) {
        this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON) || '');
    }

}
