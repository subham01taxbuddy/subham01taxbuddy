import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {UtilsService} from "../../../../services/utils.service";
import {ItrMsService} from "../../../../services/itr-ms.service";
import {AppConstants} from "../../constants";

@Component({
  selector: 'app-service-drop-down',
  templateUrl: './service-drop-down.component.html',
  styleUrls: ['./service-drop-down.component.scss']
})
export class ServiceDropDownComponent implements OnInit {

  @Output() sendService = new EventEmitter<any>();

  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'GST',
      value: 'GST',
    },
    {
      label: 'NOTICE',
      value: 'NOTICE',
    },
    {
      label: 'TPA',
      value: 'TPA',
    },
  ];
  selectedService = new FormControl('', []);
  constructor(public utilsService: UtilsService,
              private itrMsService: ItrMsService) { }

  ngOnInit() {
    this.setDropDown();
  }

  setDropDown() {

  }

  changeService(fy: String) {
    this.sendService.emit(this.selectedService.value);
  }

}
