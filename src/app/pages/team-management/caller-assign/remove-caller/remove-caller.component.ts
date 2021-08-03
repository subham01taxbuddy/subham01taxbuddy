import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-remove-caller',
  templateUrl: './remove-caller.component.html',
  styleUrls: ['./remove-caller.component.css']
})
export class RemoveCallerComponent implements OnInit {

  loading: boolean;
  callerData: any = [];
  selectedCallerList: any = [];

  constructor() { }

  ngOnInit() {
  }
}