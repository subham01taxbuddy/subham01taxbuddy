import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormControl} from "@angular/forms";
import {UtilsService} from "../../../../services/utils.service";

@Component({
  selector: 'app-service-drop-down',
  templateUrl: './service-drop-down.component.html',
  styleUrls: ['./service-drop-down.component.scss']
})
export class ServiceDropDownComponent implements OnInit {
  @Output() sendService = new EventEmitter<any>();
  loggedInUserRoles:any;

  serviceTypes = [];
  selectedService = new UntypedFormControl('', []);
  @Input() fromInvoices : boolean =false;
  constructor(public utilsService: UtilsService) { }

  ngOnInit() {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      this.serviceTypes = [
        {
          label: 'ITR',
          value: 'ITR',
        },
        {
          label: 'ITR-U',
          value: 'ITRU',
        },
      ];
    }else if(this.fromInvoices){
      this.serviceTypes =[
        {
          label: 'ITR',
          value: 'ITR',
        },
        {
          label: 'ITR-U',
          value: 'ITRU',
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
        {
          label: 'ACADEMY',
          value: 'ACADEMY',
        },
        {
          label: 'OTHER',
          value: 'OTHER',
        },
      ]
    }else{
      this.serviceTypes =[
        {
          label: 'ITR',
          value: 'ITR',
        },
        {
          label: 'ITR-U',
          value: 'ITRU',
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
      ]
    }
  }

  resetService(){
    this.selectedService.setValue(null);
  }

  changeService(fy: string) {
    this.sendService.emit(this.selectedService.value);
  }

}
