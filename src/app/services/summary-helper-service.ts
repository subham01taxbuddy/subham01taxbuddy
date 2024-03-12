import { Injectable } from '@angular/core';
import { ItrMsService } from "./itr-ms.service";
import { AppConstants } from "../modules/shared/constants";

@Injectable({
    providedIn: 'root',
})
export class SummaryHelperService {

    summary: any;
    pySummary: any;
    constructor(private itrMsService: ItrMsService) {
    }

    async getSummary() {
        let ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
        const param = '/tax/old-regime';
        return new Promise((resolve, reject) => {
            this.itrMsService.postMethod(param, ITR_JSON).subscribe((result: any) => {
                // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
                console.log('result is=====', result);

                if (result) {
                    this.summary = result;
                    resolve(this.summary)
                }
                resolve(null);
            });
        });
    }

    async getPreviousYearSummary() {
        let PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
        const param = '/tax/old-regime';
        return new Promise((resolve, reject) => {
            this.itrMsService.postMethod(param, PREV_ITR_JSON).subscribe((result: any) => {
                // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
                console.log('result is=====', result);

                if (result) {
                    this.pySummary = result;
                    resolve(this.pySummary)
                }
                resolve(null);
            });
        });
    }
}
