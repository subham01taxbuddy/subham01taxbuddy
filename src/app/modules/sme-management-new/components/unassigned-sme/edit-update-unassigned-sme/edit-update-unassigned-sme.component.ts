
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
  leaderList:any;
  leaderNames:User[];
  filteredOptions1 :Observable<User[]>;
  stateDropdown = AppConstants.stateDropdown;
  ownerNames: User[];
  options: User[] = [];
  options1:User[] = [];
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
    this.getLeader();
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    this.smeFormGroup.patchValue(this.smeObj); // all
    this.setFormValues(this.smeObj);
    console.log('sme obj', this.smeObj);
    const userId = this.smeObj.userId;

    this.filteredOptions = this.searchOwner.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      })
    );
    this.filteredOptions1 = this.searchLeader.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options1.slice();
      })
    );
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }
  displayFn1(user: User): string {
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
    searchOwner: new FormControl('',[Validators.required]),
    searchLeader: new FormControl('',[Validators.required]),
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
  get searchOwner() {
    return this.smeFormGroup.controls['searchOwner'] as FormControl;
  }
  get searchLeader() {
    return this.smeFormGroup.controls['searchLeader'] as FormControl;
  }

  roles : FormGroup =this.fb.group({
    admin: new FormControl(''),
    leader: new FormControl(''),
    owner: new FormControl(''),
    filer :new FormControl(''),
    leadEngagement:new FormControl(''),
  });

  get admin(){
    return this.roles.controls['admin'] as FormControl
  }
  get leader(){
    return this.roles.controls['leader'] as FormControl
  }
  get owner(){
    return this.roles.controls['owner'] as FormControl
  }
  get filer(){
    return this.roles.controls['filer'] as FormControl
  }
  get leadEngagement(){
    return this.roles.controls['leadEngagement'] as FormControl
  }

  getOwner() {
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let param = `/sme-details-new/${loggedInSmeUserId}?owner=true`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.ownerList = result.data;
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

  getLeader(){
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let param = `/sme-details-new/${loggedInSmeUserId}?leader=true`;
    this.userMsService.getMethod(param).subscribe((result: any) => {

      this.leaderList = result.data;
      console.log('leader list result -> ', result);
      this.leaderNames = this.leaderList.map((item) => {
        return { name: item.name, userId:item.userId  };
      });
      this.options1 = this.leaderNames;
      console.log('leader name list ',this.leaderNames)
    })

  }

  leaderDetails:any;
  getLeaderNameId(option1){
    this.leaderDetails=option1
    console.log(option1)
  }


  onCheckboxChange(checkboxNumber: number) {
    if(checkboxNumber === 1) {
      this.leader.setValue(false);
      this.owner.setValue(false);
      this.filer.setValue(false);
    }
    if(checkboxNumber === 2) {
      this.admin.setValue(false);
      this.owner.setValue(false);
      this.filer.setValue(false);
    }
    if(checkboxNumber === 3) {
      this.leader.setValue(false);
      this.admin.setValue(false);
      this.filer.setValue(false);
    }
    if(checkboxNumber === 4) {
      this.leader.setValue(false);
      this.owner.setValue(false);
      this.owner.setValue(false);
    }
  }

  // setParentNameId(){
  //   if (this.filer.value==='true'){
  //     parentId: this.ownerDetails?.userId;
  //     parentName: this.ownerDetails?.name,
  //   }
  //   else if (this.owner.value==='true'){
  //     parentId: this.leaderDetails?.userId;
  //     parentName: this.leaderDetails?.name,
  //   }
  // }

  updateSmeDetails() {
    let parentId :any
    let parentName:any
    if(this.filer.value ===true){
      parentId= this.ownerDetails?.userId;
      parentName= this.ownerDetails?.name;
    }
    if(this.owner.value ===true){
      parentId=this.leaderDetails?.userId;
      parentName= this.leaderDetails?.name;
    }

    // if( this.smeObj.roles=null){
    //   this.smeObj.roles=[];
    // }
    if(this.owner.value === true){
      this.smeObj.roles=[];
      this.smeObj.roles.push('ROLE_OWNER')
    }
    if(this.filer.value === true){
      this.smeObj.roles=[];
      this.smeObj.roles.push('ROLE_FILER');

    }
    if(this.leader.value === true){
      this.smeObj.roles=[];
      this.smeObj.roles.push('ROLE_LEADER')
    }
    if(this.admin.value === true){
      this.smeObj.roles=[];
      this.smeObj.roles.push('ROLE_ADMIN')
    }


    if(this.leader.value || this.utilsService.isNonEmpty(this.searchLeader.value) || (this.utilsService.isNonEmpty(this.searchOwner.value))){
    const userId = this.smeObj.userId;
    console.log(userId);
    const param = `/sme-details-new/${userId}`;
    // if (this.smeFormGroup.valid) {
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
        state:this.state.value,
        botId: this.smeObj.botId,
        displayName: this.smeObj.displayName,
        active: this.smeObj.active,
        joiningDate: this.smeObj.joiningDate,
        internal: this.smeObj.internal,
        assignmentStart: this.smeObj.assignmentStart,
        itrTypes: this.itrTypes.value,
        roundRobinCount: this.smeObj.roundRobinCount,
        assessmentYears: this.smeObj.assessmentYears,
        parentId:parentId ,
        parentName:parentName,
        roundRobinOwnerCount: this.smeObj.roundRobinOwnerCount,
        owner: this.owner.value,
        leader: this.leader.value,
        admin: this.admin.value,
        filer: this.filer.value,
        coOwnerUserId: this.smeObj.coOwnerUserId,
      };

      // let requestBody = this.smeFormGroup.getRawValue();
      // console.log('reqBody', requestBody);
      let requestData = JSON.parse(JSON.stringify(finalReq));
      console.log('requestData', requestData);
      this.userMsService.putMethod(param, requestData).subscribe(
        (res:any) => {
          console.log('SME assignment updated', res);
          this.loading = false;
          if(res.success ===false){
            this._toastMessageService.alert(
              'false',
              'failed to update sme details '
            );
          }else{
            this._toastMessageService.alert(
              'success',
              'sme details updated successfully'
            );
          }
        },
        (error) => {
          this._toastMessageService.alert('error', 'failed to update.');
          this.loading = false;
        }
      );
    }else {
      if(this.owner.value && !this.utilsService.isNonEmpty(this.searchLeader.value)) {
        this._toastMessageService.alert('error', 'Please select leader name.');
        this.loading = false;
      } else if (this.filer.value && !this.utilsService.isNonEmpty(this.searchOwner.value)) {
        this._toastMessageService.alert('error', 'Please select owner name.');
        this.loading = false;
      }
    }
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
