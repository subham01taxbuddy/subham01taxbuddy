import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calling-reports',
  templateUrl: './calling-reports.component.html',
  styleUrls: ['./calling-reports.component.scss']
})
export class CallingReportsComponent implements OnInit {
  roles:any;
  constructor(private UtilsService :UtilsService) { }

  ngOnInit() {
    this.roles =this.UtilsService.getUserRoles();
  }

}
