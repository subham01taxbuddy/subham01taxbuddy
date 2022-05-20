import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-direct-filing',
  templateUrl: './direct-filing.component.html',
  styleUrls: ['./direct-filing.component.scss']
})
export class DirectFilingComponent implements OnInit {
  tabIndex = 0;
  addClient: any;
  itrData: any
  constructor(private router: Router,
    public location: Location) {
    this.addClient = this.router.getCurrentNavigation().extras.state;
    console.log('ssssss', this.addClient);
    // this.addClient = {
    //   userId: 116, panNumber: 'AUEPP2987M'
    // }
  }

  ngOnInit() {
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
  }

  getItrDataFromSummary(event) {
    console.log('get itr data from summary', event);
    this.itrData = event;
  }

}
