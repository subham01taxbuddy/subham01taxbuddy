import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { map, Observable, startWith } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import {DatePipe, KeyValue, Location} from "@angular/common";


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
export interface User {
  name: string;
  userId:Number;
}

@Component({
  selector: 'app-edit-update-assigned-sme',
  templateUrl: './edit-update-assigned-sme.component.html',
  styleUrls: ['./edit-update-assigned-sme.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class EditUpdateAssignedSmeComponent implements OnInit {
  smeObj:SmeObj;
  loading = false;
  rolesList: any[] = [];
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() , new Date().getMonth(), new Date().getDate());
  stateDropdown = AppConstants.stateDropdown;
  ownerList: any;
  itrTypesData = [];
  ownerNames: User[];
  options: User[] = [];
  filteredOptions: Observable<User[]>;
  loggedInSme:any;
  smeRecords:any;
  smeServices:any;
  smeRoles:any;
  checkRoles:any;
  loggedInSmeRoles:any;
  coOwnerData:any;

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
    private  fb:FormBuilder,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private location: Location,
  ) { }

  ngOnInit() {
    this.loggedInSme =JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.loggedInSmeRoles = this.loggedInSme[0]?.roles;

    console.log("logged sme roles",this.loggedInSmeRoles)
    this.getOwner();
    this.filteredOptions = this.coOwner.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      })
    );
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    console.log('this.smeobject',this.smeObj)
    this.smeFormGroup.patchValue(this.smeObj); // all
    this.otherSmeInfo.patchValue(this.smeObj);
    // this.roles.patchValue(this.smeObj);
    // this.services.patchValue(this.smeObj);

    console.log('sme obj', this.smeObj);
     this.getSmeRecords();
     this.getCoOwnerHistory();
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

  setFormValues(data){
    // this.mobileNumber.setValue(data.mobileNumber)
    // this.parentName.setValue(data.parentName)
    // this.leaveStartDate.setValue(data.leaveStartDate)
    // this.referredBy.setValue(data.referredBy);
    // this.itrTypes.setValue(data.itrTypes);
    // this.itrTypesData = this.itrTypes.value;
    // this.admin.setValue(data.admin);
    // this.callingNumber.setValue(data.callingNumber);

    let coOwnerUserId= data.coOwnerUserId
          let ownerList = this.ownerNames;
          let coOwnerName = ownerList?.filter((item) => {
              return item.userId === coOwnerUserId;
            }).map((item) => {
              return item.name;
            });
      console.log('coOwnerName',coOwnerName)
    this.coOwner.setValue(coOwnerName);

    if(data.internal === true ){
      this.internal.setValue("internal")
    }else {
      this.internal.setValue("external")
    }

    if(data.leaveStartDate !== null){
      let leaveStartDate = data.leaveStartDate;
      this.leaveStartDate.setValue(moment(leaveStartDate, 'DD/MM/YYYY').toDate());
    }

    if(data.leaveEndDate !== null){
      let leaveEndDate = data.leaveEndDate;
      this.leaveEndDate.setValue(moment(leaveEndDate, 'DD/MM/YYYY').toDate())
    }

    if(data.joiningDate !== null){
      let joiningDate = data.joiningDate;
      this.joiningDate.setValue(moment(joiningDate, 'DD/MM/YYYY').toDate())
    }

    if(data.resigningDate !== null){
      let resigningDate = data.resigningDate;
      this.resigningDate.setValue(moment(resigningDate, 'DD/MM/YYYY').toDate())
    }

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

  services  : FormGroup =this.fb.group({
    itr: new FormControl(''),
    nri: new FormControl(''),
    tpa: new FormControl(''),
    gst: new FormControl(''),
    notice: new FormControl(''),
    wb: new FormControl(''),
    pd: new FormControl(''),
    mf: new FormControl(''),
    other: new FormControl(''),
    itrToggle :new FormControl(''),
    nriToggle:new FormControl(''),
    tpaToggle :new FormControl(''),
    gstToggle:new FormControl(''),
    noticeToggle:new FormControl(''),
    wbToggle:new FormControl(''),
    pdToggle:new FormControl(''),
    mfToggle :new FormControl(''),
    otherToggle:new FormControl(''),
  })

  get itr(){
    return this.services.controls['itr'] as FormControl
  }
  get nri(){
    return this.services.controls['nri'] as FormControl
  }
  get tpa(){
    return this.services.controls['tpa'] as FormControl
  }
  get gst(){
    return this.services.controls['gst'] as FormControl
  }
  get notice(){
    return this.services.controls['notice'] as FormControl
  }
  get wb(){
    return this.services.controls['wb'] as FormControl
  }
  get pd(){
    return this.services.controls['pd'] as FormControl
  }
  get mf(){
    return this.services.controls['mf'] as FormControl
  }
  get other(){
    return this.services.controls['other'] as FormControl
  }
  get itrToggle(){
    return this.services.controls['itrToggle'] as FormControl
  }
  get nriToggle(){
    return this.services.controls['nriToggle'] as FormControl
  }
  get tpaToggle(){
    return this.services.controls['tpaToggle'] as FormControl
  }
  get gstToggle(){
    return this.services.controls['gstToggle'] as FormControl
  }
  get noticeToggle(){
    return this.services.controls['noticeToggle'] as FormControl
  }
  get wbToggle(){
    return this.services.controls['wbToggle'] as FormControl
  }
  get pdToggle(){
    return this.services.controls['pdToggle'] as FormControl
  }
  get mfToggle(){
    return this.services.controls['mfToggle'] as FormControl
  }
  get otherToggle(){
    return this.services.controls['otherToggle'] as FormControl
  }


  smeFormGroup : FormGroup =this.fb.group({
    mobileNumber :new FormControl(''),
    name: new FormControl("",[Validators.required]),
    smeOriginalEmail: new FormControl(''),
    languages: new FormControl(''),
    referredBy: new FormControl(''),
    itrTypes: new FormControl(''),
    qualification: new FormControl(''),
    state: new FormControl(''),
    parentName: new FormControl(''),

  })

  get mobileNumber(){
    return this.smeFormGroup.controls['mobileNumber'] as FormControl
  }
  get name(){
    return this.smeFormGroup.controls['name'] as FormControl
  }
  get smeOriginalEmail(){
    return this.smeFormGroup.controls['smeOriginalEmail'] as FormControl
  }
  get languages(){
    return this.smeFormGroup.controls['languages'] as FormControl
  }
  get referredBy(){
    return this.smeFormGroup.controls['referredBy'] as FormControl
  }
  get itrTypes(){
    return this.smeFormGroup.controls['itrTypes'] as FormControl
  }
  get qualification(){
    return this.smeFormGroup.controls['qualification'] as FormControl
  }
  get state(){
    return this.smeFormGroup.controls['state'] as FormControl
  }
  get parentName(){
    return this.smeFormGroup.controls['parentName'] as FormControl
  }

  assignmentUpdated(serviceType, service: FormControl, assignment: FormControl) {
    let serviceRecord = this.serviceRecords.filter(element => element.serviceType === serviceType);
    serviceRecord[0].assignmentStart = assignment.value;
    console.log(this.serviceRecords);

  }

  // smeInfoUpdateServiceCall(serviceRecord, serviceCheckBox, assignmentToggle) {
  //   const userId = this.smeRoles.userId;
  //   const loggedInSmeUserId=this.loggedInSme[0].userId
  //   const param = `/sme-details-new/${loggedInSmeUserId}?smeUserId=${userId}`;
  //   const request = serviceRecord;
  //
  //   serviceCheckBox.disable();
  //   assignmentToggle?.disable();
  //
  //   console.log(request);
  //   // this.userMsService.putMethod(param, request).subscribe((result: any) => {
  //   //   console.log('sme record by service  -> ', result);
  //   //   if(result.success) {
  //   //     serviceCheckBox.enable();
  //   //     assignmentToggle?.enable();
  //   //     this.utilsService.showSnackBar('Assignment updated successfully for ' + serviceRecord.serviceType);
  //   //   } else {
  //   //     this.utilsService.showSnackBar(result.error);
  //   //     serviceCheckBox.enable();
  //   //     assignmentToggle?.enable();
  //   //   }
  //   // }, error => {
  //   //   this.utilsService.showSnackBar(error);
  //   //   serviceCheckBox.enable();
  //   //   assignmentToggle?.enable();
  //   // });
  // }

  nriServiceToggle = false;

  nriUpdated(event, itr: FormControl) {
    //for NRI capability check ITR service and add relevant roles
    this.nriServiceToggle = !this.nriServiceToggle;
  }

  serviceRecords: any[] = [];

  serviceUpdated(serviceType, service: FormControl, assignment: FormControl) {
    let serviceRecord = this.serviceRecords.filter(element => element.serviceType === serviceType);
    let assignmentStart = assignment.value ? assignment.value : false;
    let record = {
      serviceType: serviceType,
      assignmentStart: assignmentStart,
      role: serviceType === 'TPA' ? 'FILER_TPA_NPS' : 'FILER_' + serviceType
    }
    if(service.value) {
      //service added, check if existing and update accordingly
      if(serviceRecord && serviceRecord.length > 0){
        //existing record
        serviceRecord[0].serviceType = serviceType;
        serviceRecord[0].assignmentStart = assignmentStart;
      } else {
        this.serviceRecords.push(record);
      }
    } else {
      //service is already added, remove from list
      if(serviceRecord && serviceRecord.length > 0){
        //existing record
        this.serviceRecords.splice( this.serviceRecords.indexOf(serviceRecord[0]), 1);
      }
    }

    console.log(this.serviceRecords);
  }

  otherSmeInfo : FormGroup =this.fb.group({
    coOwner :new FormControl(''),
    callingNumber :new FormControl(''),
    smeOfficialEmail: new FormControl(''),
    email: new FormControl(''),
    displayName:new FormControl(''),
    internal:new FormControl(''),
    leaveStartDate:new FormControl(''),
    leaveEndDate:new FormControl(''),
    joiningDate:new FormControl(''),
    resigningDate:new FormControl(''),
  })

  get coOwner(){
    return this.otherSmeInfo.controls['coOwner'] as FormControl
  }
  get callingNumber(){
    return this.otherSmeInfo.controls['callingNumber'] as FormControl
  }
  get smeOfficialEmail(){
    return this.otherSmeInfo.controls['smeOfficialEmail'] as FormControl
  }

  get email(){
    return this.otherSmeInfo.controls['email'] as FormControl
  }
  get displayName(){
    return this.otherSmeInfo.controls['displayName'] as FormControl
  }
  get internal(){
    return this.otherSmeInfo.controls['internal'] as FormControl
  }
  get kommId(){
    return this.otherSmeInfo.controls['email'] as FormControl
  }
  get leaveStartDate(){
    return this.otherSmeInfo.controls['leaveStartDate'] as FormControl
  }
  get leaveEndDate(){
    return this.otherSmeInfo.controls['leaveEndDate'] as FormControl
  }
  get joiningDate(){
    return this.otherSmeInfo.controls['joiningDate'] as FormControl
  }
  get resigningDate(){
    return this.otherSmeInfo.controls['resigningDate'] as FormControl
  }


  getOwner() {
    const loggedInSmeUserId=this.loggedInSme[0].userId
    console.log(loggedInSmeUserId)
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

  getSmeRecords(){
    const userId = this.smeObj.userId;
    const loggedInSmeUserId=this.loggedInSme[0].userId
    const param = `/sme-details-new/${loggedInSmeUserId}?smeUserId=${userId}`;

    this.userMsService.getMethod(param).subscribe((result: any) => {
    console.log('sme record by service  -> ', result);
    this.smeRecords=result.data;
      this.smeRoles=this.smeRecords[0];
      console.log('sme Roles Patch values',this.smeRoles)
      this.checkRoles=this.smeRoles.roles
      this.smeFormGroup.patchValue(this.smeRoles); // all
      this.otherSmeInfo.patchValue(this.smeRoles);
      this.roles.patchValue(this.smeRoles);
       this.setFormValues(this.smeRoles);
    this.smeRecords = this.smeRecords?.filter(element => element.serviceType !== null);
    this.smeServices =this.smeRecords.map((item) => {
      return { serviceType: item.serviceType , assignmentStart :item.assignmentStart};
    });
    console.log("servicesList",this.smeServices)

   //Ashwini: We have temporarily disabled the assignment toggle buttons for owners.
   //Need to remove this after re-assignment is done
   this.serviceRecords = this.smeServices;
    this.smeServices.forEach((element) => {
      if (element.serviceType == "ITR") {
        this.itr.setValue(true);
        this.itr.disable();
        if(this.smeObj.roles.includes('OWNER_NRI') || this.smeObj.roles.includes('FILER_NRI')){
          this.nriServiceToggle = true;
        }
        if (element.assignmentStart == true) {
          this.itrToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.itrToggle.disable();
          }
        }
      }
      else if (element.serviceType == "TPA") {
        this.tpa.setValue(true);
        this.tpa.disable();
        if (element.assignmentStart == true) {
          this.tpaToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.tpaToggle.disable();
          }
        }
      }
      else if (element.serviceType == "GST") {
        this.gst.setValue(true);
        this.gst.disable();
        if (element.assignmentStart == true) {
          this.gstToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.gstToggle.disable();
          }
        }
      }
      else if (element.serviceType == "NOTICE") {
        this.notice.setValue(true);
        this.notice.disable();
        if (element.assignmentStart == true) {
          this.noticeToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.noticeToggle.disable();
          }
        }
      }
      else if (element.serviceType == "WB") {
        this.wb.setValue(true);
        this.wb.disable();
        if (element.assignmentStart == true) {
          this.wbToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.wbToggle.disable();
          }
        }
      }
      else if (element.serviceType == "PD") {
        this.pd.setValue(true);
        this.pd.disable();
        if (element.assignmentStart == true) {
          this.pdToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.pdToggle.disable();
          }
        }
      }
      else if (element.serviceType == "MF") {
        this.mf.setValue(true);
        this.mf.disable();
        if (element.assignmentStart == true) {
          this.mfToggle.setValue(true);
          if(this.roles.controls['owner'].value){
            this.mfToggle.disable();
          }
        }
      }
      });
    });
  }

  ownerDetails :any;
  getownerNameId(option){
    this.ownerDetails =option
    console.log(option)
  }

  async updateSmeDetails() {

   const JoiningDate = this.convertToDDMMYY(this.joiningDate.value);
   const LeaveStartDate = this.convertToDDMMYY(this.leaveStartDate.value);
   const LeaveEndDate = this.convertToDDMMYY(this.leaveEndDate.value);
   const  ResigningDate = this.convertToDDMMYY(this.resigningDate.value);

    if (this.smeFormGroup.valid && this.roles.valid) {

      let finalReq: any = {};
      if(this.smeRecords[0]) {
        finalReq = this.smeRecords[0];
      }else {
        finalReq = this.smeRoles;
      }

        finalReq.name =  this.name.value;
        finalReq.email = this.kommId.value;
        finalReq.smeOriginalEmail = this.smeFormGroup.controls['smeOriginalEmail'].value;
        finalReq.smeOfficialEmail = this.otherSmeInfo.controls['smeOfficialEmail'].value;
        finalReq.mobileNumber = this.mobileNumber.value;
        finalReq.referredBy =this.referredBy.value;
        finalReq.qualification =this.qualification.value;
        finalReq.state =this.state.value;
        finalReq.callingNumber = this.callingNumber.value;
        finalReq.languages =this.languages.value;
        finalReq.displayName = this.displayName.value;
        finalReq.leaveStartDate =LeaveStartDate;
        finalReq.leaveEndDate =LeaveEndDate;
        finalReq.joiningDate = JoiningDate;
        finalReq.resigningDate =ResigningDate;
        finalReq.internal = this.internal.value === 'internal'? true : false;
        finalReq.itrTypes = this.itrTypes.value;
        finalReq.parentName = this.parentName.value;
        finalReq.owner = this.owner.value;
        finalReq.leader = this.leader.value;
        finalReq.admin = this.admin.value;
        finalReq.filer = this.filer.value;
        finalReq.coOwnerUserId = this.ownerDetails?.userId || null;

        if(!finalReq.roles) {
          finalReq.roles = this.smeRoles.roles;
        }
        if(!finalReq.roles){
          finalReq.roles = [];
        }

      if(this.serviceRecords.findIndex(element => element.serviceType === 'ITR') > -1) {

        if (this.nriServiceToggle === true && this.smeObj.owner) {
          finalReq.roles.push('OWNER_NRI');
        } else if (this.nriServiceToggle === true && this.smeObj.filer) {
          finalReq.roles.push('FILER_NRI');
        } else if (this.nriServiceToggle === false && this.smeObj.owner){
          let index = finalReq.roles.findIndex(item => item === 'OWNER_NRI');
          if(index >= 0) {
            finalReq.roles.splice(index, 1);
          }
        } else if (this.nriServiceToggle === false && this.smeObj.filer) {
          let index = finalReq.roles.findIndex(item => item === 'OWNER_NRI');
          if(index >= 0) {
            finalReq.roles.splice(index, 1);
          }
        }

      }

      if (this.serviceRecords.length > 0) {
        for (let i = 0; i < this.serviceRecords.length; i++) {
          const service = this.serviceRecords[i];
          finalReq.serviceType = service.serviceType;
          finalReq.assignmentStart = service.assignmentStart;
          finalReq.roles.push(service.role);
          console.log(finalReq);

          if (i === 0) {
            await this.serviceApiCall(finalReq, false);
            // add a delay of 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            await this.serviceApiCall(finalReq);
          }
        }
      } else {
        console.log(finalReq);
        await this.serviceApiCall(finalReq);
      }

      // if(this.serviceRecords.length > 0) {
      //   this.serviceRecords.forEach(async (service,i) => {
      //     finalReq.serviceType = service.serviceType;
      //     finalReq.assignmentStart = service.assignmentStart;
      //     finalReq.roles.push(service.role);
      //     console.log(finalReq);
      //     if(i==0){
      //       setTimeout(() => {
      //         this.serviceApiCall(finalReq, false);
      //       }, 2000);
      //       // this.serviceApiCall(finalReq,false);
      //     }else{
      //         this.serviceApiCall(finalReq);
      //     }

      //   });
      // } else {
      //   //update with as is
      //   console.log(finalReq);
      //   this.serviceApiCall(finalReq);
      // }


      setTimeout(()=>{
        if(this.updateSuccessful) {
          this.location.back();
        }
      }, 500);

    }
  }

  updateSuccessful = false;
  initialCall = false;

  async serviceApiCall(requestData: any, initialCall = false): Promise<any> {
    const userId = this.smeObj.userId;
    console.log(userId);
    const param = `/sme-details-new/${userId}`;

    this.loading = true;
    this.updateSuccessful = true;
    this.initialCall = initialCall;

    try {
      let res:any
       res = await this.userMsService.putMethod(param, requestData).toPromise();
      console.log('SME assignment updated', res);
      this.loading = false;
      this.initialCall = true;

      if (res.success === false) {
        this._toastMessageService.alert(
          'false',
          res.error
        );
        this.updateSuccessful = false;
      } else {
        this._toastMessageService.alert(
          'success',
          'sme details updated successfully'
        );
        this.updateSuccessful = true;
      }

      return res; // return the response
    } catch (error) {
      this._toastMessageService.alert('error', 'failed to update.');
      this.loading = false;
      this.updateSuccessful = false;
      throw error; // re-throw the error so that the calling function can handle it
    }
  }



  // serviceApiCall(requestData: any, initialCall = false) {
  //   const userId = this.smeObj.userId;
  //   console.log(userId);
  //   const param = `/sme-details-new/${userId}`;

  //   this.loading = true;
  //   this.updateSuccessful = true;
  //   this.initialCall = initialCall;

  //   if(this.initialCall == false){
  //     this.userMsService.putMethod(param, requestData).subscribe(
  //       (res:any) => {
  //         console.log('SME assignment updated', res);
  //         this.loading = false;
  //         this.initialCall = true
  //         if(res.success ===false){
  //           this._toastMessageService.alert(
  //             'false',
  //             res.error
  //           );
  //           this.updateSuccessful = false;
  //         }else{
  //           this._toastMessageService.alert(
  //             'success',
  //             'sme details updated successfully'
  //           );
  //           this.updateSuccessful = true;
  //         }
  //       },
  //       (error) => {
  //         this._toastMessageService.alert('error', 'failed to update.');
  //         this.loading = false;
  //         this.updateSuccessful = false;
  //       }
  //     );

  //   }

  // }

  getCoOwnerHistory(){
    // 'https://uat-api.taxbuddy.com/user/coOwner-details/10341'
    const userId = this.smeObj.userId;
    const param = `/coOwner-details/${userId}`;
    this.loading = true;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('get Co-Owner history  -> ', result);
      this.loading = false;
      // this.coOwnerData = (result.data);
      let datePipe = new DatePipe('en-IN')

      this.coOwnerData={
        "Co-Owner-Name" : result?.data?.coOwnerName,
        "Start Date" : datePipe.transform(result?.data?.coOwnershipStartDateTime,'dd/MM/yyyy'),
        "End Date" : result?.data?.coOwnershipEndDateTime || 'NA',

      }

      console.log('co-owner data',this.coOwnerData)
    })
    this.loading=false
  }


  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }


  convertToDDMMYY(date) {
    if (this.utilsService.isNonEmpty(date)) {
      return moment(date).format('DD/MM/YYYY')
    } else {
      return date;
    }
  }
  convertToYYMMDD(date) {
    if (this.utilsService.isNonEmpty(date)) {
      return new Date(moment(date, 'DD/MM/YYYY').format('YYYY/MM/DD'));
    } else {
      return date;
    }
  }

  onDateChange(date){
  console.log(date)
  }

    // this.leaveStartDate = moment(new Date(this.form.controls.myDate.value)).format("YYYY/MM/DD").toString();

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
  leader: boolean
  admin: boolean
  filer: boolean
  coOwnerUserId: number
  createdDate: string
  id: string
  botName: any
  imageUrl: any
  leaveStartDate: string
  leaveEndDate: string
  resigningDate: string
  groupId: any
  callingNumberList: string[]
  filerCallingNumberHistory: any
  owner: boolean
  referredBy:string
  qualification:string
  state:string,
  smeOriginalEmail: string
  services:any
}
