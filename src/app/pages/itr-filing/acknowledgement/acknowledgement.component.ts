import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'app/shared/constants';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
    selector: 'app-acknowledgement',
    templateUrl: './acknowledgement.component.html',
    //   styleUrls: ['./acknowledgement.component.css']
})
export class AcknowledgementComponent implements OnInit {
    ITR_JSON: ITR_JSON
    status: string = '';
    constructor(private activatedRoute: ActivatedRoute) {
        this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    }

    ngOnInit() {
        this.activatedRoute.queryParams
            .filter(params => params.status)
            .subscribe(params => {
                console.log(params); // { order: "popular" }
                this.status = params.status;
                console.log(this.status); // popular
            });
    }
}
