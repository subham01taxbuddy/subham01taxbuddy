
import { map, Observable, startWith } from 'rxjs';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ActivatedRoute } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

export interface User {
  name: string;
  userId:Number;
}

@Component({
  selector: 'app-edit-update-unassigned-sme',
  templateUrl: './edit-update-unassigned-sme.component.html',
  styleUrls: ['./edit-update-unassigned-sme.component.scss'],
})
export class EditUpdateUnassignedSmeComponent implements OnInit {
  smeObj: SmeObj;
  loading = false;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  ownerList: any;
  stateDropdown = AppConstants.stateDropdown;
  ownerNames: User[];
  options: User[] = [];
  filteredOptions: Observable<User[]>;
  itrTypesData = [];
  ownerUserId:any;
  loggedInSme:any;
  langList = ['English', 'Assamese', 'Bangla', 'Bodo', 'Dogri', 'Gujarati', 'Hindi', 'Kashmiri', 'Kannada',
  'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Oriya', 'Punjabi', 'Tamil', 'Telugu',
  'Santali', 'Sindhi', 'Urdu']
  itrTypeList = [
    { value: 1, display: 'ITR 1' },
    { value: 2, display: 'ITR 2' },
    { value: 3, display: 'ITR 3' },
    { value: 4, display: 'ITR 4' },

  ];

  constructor(
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private activatedRoute: ActivatedRoute,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService
  ) {}

  ngOnInit() {
    this.loggedInSme =JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.getOwner();
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    this.smeFormGroup.patchValue(this.smeObj); // all
    this.setFormValues(this.smeObj);
    console.log('sme obj', this.smeObj);
    const userId = this.smeObj.userId;

    this.filteredOptions = this.teamLead.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      })
    );
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  setFormValues(data) {
    this.mobileNumber.setValue(data.mobileNumber);
    this.itrTypes.setValue(data.itrTypes);
    this.itrTypesData = this.itrTypes.value;
  }

  smeFormGroup: FormGroup = this.fb.group({
    mobileNumber: new FormControl(''),
    name: new FormControl(''),
    email: new FormControl(''),
    languages: new FormControl(''),
    referredBy: new FormControl(''),
    itrTypes: new FormControl(''),
    qualification: new FormControl(''),
    state: new FormControl(''),
    teamLead: new FormControl('',[Validators.required]),
  });

  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as FormControl;
  }
  get name() {
    return this.smeFormGroup.controls['name'] as FormControl;
  }
  get email() {
    return this.smeFormGroup.controls['email'] as FormControl;
  }
  get languages() {
    return this.smeFormGroup.controls['languages'] as FormControl;
  }
  get referredBy() {
    return this.smeFormGroup.controls['referredBy'] as FormControl;
  }
  get itrTypes() {
    return this.smeFormGroup.controls['itrTypes'] as FormControl;
  }
  get qualification() {
    return this.smeFormGroup.controls['qualification'] as FormControl;
  }
  get state() {
    return this.smeFormGroup.controls['state'] as FormControl;
  }
  get teamLead() {
    return this.smeFormGroup.controls['teamLead'] as FormControl;
  }

  getOwner() {
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let param = `/sme-details-new/${loggedInSmeUserId}?owner=true`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.ownerList = result.data.content;
      console.log("ownerlist",this.ownerList)
      this.ownerNames = this.ownerList.map((item) => {
        return { name: item.name, userId:item.userId  };
      });
      this.options = this.ownerNames;
      console.log(' ownerName -> ', this.ownerNames);
    });
  }

  ownerDetails :any;
  getownerNameId(option){
    this.ownerDetails =option
    console.log(option)
  }

  updateSmeDetails() {
    const userId = this.smeObj.userId;
    console.log(userId);
    const param = `/sme-details-new/${userId}`;
    if (this.smeFormGroup.valid) {
      this.loading = true;
      let finalReq = {
        userId: this.smeObj.userId,
        name: this.name.value,
        email: this.email.value,
        mobileNumber: this.mobileNumber.value,
        callingNumber: this.smeObj.callingNumber,
        serviceType: this.smeObj.serviceType,
        roles: this.smeObj.roles,
        languages:this.languages.value,
        qualification:this.qualification.value,
        referredBy:this.referredBy.value,
        parentId: this.ownerDetails?.userId,
        botId: this.smeObj.botId,
        displayName: this.smeObj.displayName,
        active: this.smeObj.active,
        joiningDate: this.smeObj.joiningDate,
        internal: this.smeObj.internal,
        assignmentStart: this.smeObj.assignmentStart,
        itrTypes: this.itrTypes.value,
        roundRobinCount: this.smeObj.roundRobinCount,
        assessmentYears: this.smeObj.assessmentYears,
        parentName: this.ownerDetails?.name,
        roundRobinOwnerCount: this.smeObj.roundRobinOwnerCount,
        owner: this.smeObj.owner,
        leader: this.smeObj.leader,
        admin: this.smeObj.admin,
        filer: this.smeObj.filer,
        coOwnerUserId: this.smeObj.coOwnerUserId,
      };

      // let requestBody = this.smeFormGroup.getRawValue();
      // console.log('reqBody', requestBody);
      let requestData = JSON.parse(JSON.stringify(finalReq));
      console.log('requestData', requestData);
      this.userMsService.putMethod(param, requestData).subscribe(
        (res) => {
          console.log('SME assignment updated', res);
          this.loading = false;
          this._toastMessageService.alert(
            'success',
            'sme details updated successfully'
          );
        },
        (error) => {
          this._toastMessageService.alert('error', 'failed to update.');
          this.loading = false;
        }
      );
    }else {
      this._toastMessageService.alert('error', 'failed to update plz select owner name.');
      this.loading = false;}
  }
}

export interface SmeObj {
  userId: number
  name: string
  email: string
  mobileNumber: string
  callingNumber: string
  serviceType: string
  roles: string[]
  languages: string[]
  qualification:string
  referredBy:string
  parentId: number
  botId: string
  displayName: string
  active: boolean
  joiningDate: string
  internal: boolean
  assignmentStart: boolean
  itrTypes: number[]
  roundRobinCount: number
  assessmentYears: string[]
  parentName: string
  roundRobinOwnerCount: number
  owner: boolean
  leader: boolean
  admin: boolean
  filer: boolean
  coOwnerUserId: number
}

