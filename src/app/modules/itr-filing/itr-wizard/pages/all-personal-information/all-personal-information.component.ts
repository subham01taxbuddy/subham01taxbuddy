import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CustomerProfileComponent } from '../../components/customer-profile/customer-profile.component';
import { PersonalInformationComponent } from '../../components/personal-information/personal-information.component';
import { OtherInformationComponent } from '../../components/other-information/other-information.component';
import { UtilsService } from '../../../../../services/utils.service';

@Component({
  selector: 'app-all-personal-information',
  templateUrl: './all-personal-information.component.html',
  styleUrls: ['./all-personal-information.component.scss'],
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
  customerProfileSaved: boolean;
  personalInfoSaved: boolean;
  otherInfoSaved: boolean;
  loading: boolean = false;

  constructor(private utilService: UtilsService) {
    this.navigationData = history.state;
  }

  ngOnInit(): void {
    this.isEditCustomer = true;
    this.isEditPersonal = true;
    this.isEditOther = true;
  }
  setStep(index: number) {
    if (this.step != index) {
      this.step = index;
    }
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  checkSuccess(count) {
    this.saveCount = count;
    if (this.saveCount == 0) {
      console.log('checking customer');
      this.saveCount += 1;
      if (this.isEditPersonal) {
        this.personalInfoComponent.saveProfile();
      }
    } else if (this.saveCount == 1) {
      console.log('checking personal');
      this.saveCount += 1;
      if (this.isEditOther) {
        this.otherInfoComponent.saveAndContinue();
      }
    } else if (this.saveCount == 2) {
      console.log('checking other');
      this.utilService.showSnackBar(
        'Personal information updated successfully.'
      );
    }
  }

  saveCount = 0;

  saveAllInfo() {
    //check validations
    if (!this.customerProfileComponent.customerProfileForm.valid) {
      this.setStep(0);
      this.utilService.showSnackBar(
        'Please fill all required fields in Customer Profile'
      );
      this.loading = false;
      return;
    } else if (!this.personalInfoComponent.isFormValid()) {
      this.setStep(1);
      this.utilService.showSnackBar(
        'Please fill all required fields in Personal Details'
      );
      this.loading = false;
      return;
    } else if (
      !this.otherInfoComponent.isFormValid()
    ) {
      this.setStep(3);
      this.loading = false;
      this.utilService.showSnackBar(
        'Please fill all required fields in Other Information'
      );
      return;
    } else {

    }
  }

  // saveAll() {
  //   this.saveCount = 0;
  //   this.customerProfileComponent.saveProfile('CONTINUE');
  //   // this.saveAllInfo();
  // }

  saveAll = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.saveCount = 0;
      this.customerProfileComponent.saveProfile('CONTINUE').then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  onCustomerProfileSaved(event) {
    this.customerProfileSaved = event;
    if (this.customerProfileSaved) {
      this.personalInfoComponent.saveProfile('NEXT');
      // this.saveAllInfo();
    } else {
      this.setStep(0);
    }
  }

  onPersonalInfoSaved(event) {
    this.personalInfoSaved = event;
    if (this.personalInfoSaved) {
      // this.saveAndNext.emit(false);
      this.otherInfoComponent.saveAndContinue();
      // this.saveAllInfo();
    } else {
      this.setStep(1);
    }
  }

  onotherInfoSaved(event) {
    this.otherInfoSaved = event;
    if (this.otherInfoSaved) {
      this.saveAndNext.emit(false);
      this.saveAllInfo();
      this.utilService.showSnackBar(
        'Personal information updated successfully.'
      );
    } else {
      this.setStep(2);
    }
  }
}
