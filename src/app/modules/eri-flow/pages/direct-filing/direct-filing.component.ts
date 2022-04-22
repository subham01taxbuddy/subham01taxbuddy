import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-direct-filing',
  templateUrl: './direct-filing.component.html',
  styleUrls: ['./direct-filing.component.scss']
})
export class DirectFilingComponent implements OnInit {
  tabIndex = 0;
  addClient: any
  constructor(private router: Router) {
    this.addClient = this.router.getCurrentNavigation().extras.state;
    console.log('ssssss', this.addClient)
  }

  ngOnInit() {
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
  }

}
