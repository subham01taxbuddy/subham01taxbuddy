import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-itr-filing',
    templateUrl: './itr-filing.component.html',
})
export class ItrFilingComponent implements OnInit, AfterContentChecked {
    currentUrl: string;
    constructor(private router: Router) { }
    ngOnInit() {

    }
    ngAfterContentChecked() {
        this.currentUrl = this.router.url;
    }
}
