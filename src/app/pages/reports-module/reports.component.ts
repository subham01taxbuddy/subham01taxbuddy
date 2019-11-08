import { Router } from '@angular/router';
import { Component } from '@angular/core';


@Component({
    selector: 'app-report',
    templateUrl: './reports.component.html',
    // styleUrls: ['./app.component.scss'],
})
export class ReportsComponent {

    constructor(private router: Router) {

    }

    gotoStatusReport() {
        this.router.navigate(['/pages/reports/user-gst-status-report'])
    }











}
