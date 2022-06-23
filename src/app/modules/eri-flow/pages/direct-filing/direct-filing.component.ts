import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-direct-filing',
  templateUrl: './direct-filing.component.html',
  styleUrls: ['./direct-filing.component.scss']
})
export class DirectFilingComponent implements OnInit, OnChanges {
  tabIndex = 0;
  addClient: any;
  itrData: any
  constructor(private router: Router) {
    this.addClient = this.router.getCurrentNavigation().extras.state;
    console.log('ssssss', this.addClient);
    // this.addClient = {
    //   userId: 116, panNumber: 'AUEPP2987M'
    // }
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('PARENT ON CHANGES', changes);
  }

  ngOnInit() {
    console.log('PARENT ON INIT');
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
  }

  getItrDataFromSummary(event) {
    console.log('get itr data from summary', event);
    this.itrData = event;
  }

}
