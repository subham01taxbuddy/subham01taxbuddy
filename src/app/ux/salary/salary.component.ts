import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  openSidebar = false;
  constructor() { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.openSidebar = !this.openSidebar;
  }

}
