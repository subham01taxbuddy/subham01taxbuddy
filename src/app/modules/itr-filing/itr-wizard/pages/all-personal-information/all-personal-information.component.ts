import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {CustomerProfileComponent} from "../../components/customer-profile/customer-profile.component";
import {PersonalInformationComponent} from "../../components/personal-information/personal-information.component";
import {OtherInformationComponent} from "../../components/other-information/other-information.component";

@Component({
  selector: 'app-all-personal-information',
  templateUrl: './all-personal-information.component.html',
  styleUrls: ['./all-personal-information.component.scss']
})
export class AllPersonalInformationComponent implements OnInit {

  @Output() saveAndNext = new EventEmitter<any>();

  @ViewChild(CustomerProfileComponent) private customerProfileComponent;
  @ViewChild(PersonalInformationComponent) private personalInfoComponent;
  @ViewChild(OtherInformationComponent) private otherInfoComponent;

  step = 0;
  hide: boolean = true;
  isEditCustomer: boolean;
  isEditOther: boolean;
  isEditPersonal: boolean;
  navigationData: any;

  constructor() {
    this.navigationData = history.state;
  }

  ngOnInit(): void {
  }
  setStep(index: number) {
    this.step = index;
  }

  closed(type) {
    if (type === 'customer') {
      this.isEditCustomer = false;
    } else if (type === 'personal') {
      this.isEditPersonal = false;
    } else if (type === 'other') {
      this.isEditOther = false;
    }
  }

  editForm(type) {
    if (type === 'customer') {
      this.isEditCustomer = true;
    } else if (type === 'personal') {
      this.isEditPersonal = true;
    } else if (type === 'other') {
      this.isEditOther = true;
    }
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {
    this.customerProfileComponent.saveProfile();
    this.personalInfoComponent.saveProfile();
    this.otherInfoComponent.saveAndContinue();
  }

}
