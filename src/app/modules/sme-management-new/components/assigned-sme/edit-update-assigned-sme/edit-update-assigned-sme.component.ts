import { data } from 'jquery';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';


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

@Component({
  selector: 'app-edit-update-assigned-sme',
  templateUrl: './edit-update-assigned-sme.component.html',
  styleUrls: ['./edit-update-assigned-sme.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class EditUpdateAssignedSmeComponent implements OnInit {
  smeObj:any;
  rolesList: any[] = [];
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() , new Date().getMonth(), new Date().getDate());

  stateDropdown = AppConstants.stateDropdown;

   itrTypesData = [{ value: "1", label: 'ITR-1' },{ value: "2", label: 'ITR-2' },{ value: "3", label: 'ITR-3' },{ value: "4", label: 'ITR-4' }];

    setItrData(value:any,label:any){
    if(this.smeObj.data.itrTypes.value === "1"){
    return label = "ITR-1"
    }
    }

  constructor(
    private  fb:FormBuilder,
    private utilsService: UtilsService,
  ) { }

  ngOnInit() {
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'));
    this.smeFormGroup.patchValue(this.smeObj.data); // all
    this.otherSmeInfo.patchValue(this.smeObj.data);
    this.roles.patchValue(this.smeObj.data);
    this.services.patchValue(this.smeObj.data);
    this.setFormValues(this.smeObj.data);
    console.log('sme obj', this.smeObj);

    //  this.leaveStartDate.setValue((this.smeObj.data.leaveStartDate))
    //  console.log(this.leaveStartDate)
    // this.leaveEndDate.setValue(this.smeObj.data.leaveEndDate)
    // console.log(this.leaveStartDate)

    let leaveStartDate = this.smeObj.data.leaveStartDate;
    let lDate = leaveStartDate?.split('IST');
    this.leaveStartDate.setValue(new Date((lDate[0])+(lDate[1])))


    let leaveEndDate = this.smeObj.data.leaveEndDate;
    let lEndDate = leaveEndDate?.split('IST');
    this.leaveEndDate.setValue(new Date(lEndDate[0]+lEndDate[1]))

    let joiningDate = this.smeObj.data.joiningDate;
    let joinDate = joiningDate?.split('IST');
    this.joiningDate.setValue(new Date(joinDate[0]+joinDate[1]))

    let resigningDate = this.smeObj.data.resigningDate;
    let resignDate = resigningDate?.split('IST');
    this.resigningDate.setValue(new Date(resignDate[0]+resignDate[1]))

    this.roles.valueChanges.subscribe((item) => {
      console.log(item, this.roles);
    });

    if (this.smeObj.data.serviceType === 'ITR') {
    this.itrToggle.setValue(true);
    } else if (this.smeObj.data.serviceType === 'TPA') {
    this.tpaToggle.setValue(true);
    } else if (this.smeObj.data.serviceType === 'PD') {
    this.pdToggle.setValue(true);
    }

    this.smeObj.data.roles.forEach((element) => {
    if (element == 'FILER_ITR') {
    this.itr.setValue(true);
    }
    else if (element == 'FILER_NRI') {
    this.nri.setValue(true);
    }
    else if (element == 'FILER_NOTICE') {
      this.notice.setValue(true);
    }
    else if (element == 'FILER_WB') {
      this.wb.setValue(true);
    }
    else if (element == ' FILER_PD') {
      this.pd.setValue(true);
    }
    else if (element == ' FILER_GST') {
      this.gst.setValue(true);
    }
    else if (element == '  ROLE_LE') {
      this.leader.setValue(true);
    }
    });
  }


  setFormValues(data){
    this.mobileNumber.setValue(data.mobileNumber)
    this.parentName.setValue(data.parentName)
    this.leaveStartDate.setValue(data.leaveStartDate)

    // this.itrTypes.setValue(data.setItrData)

    // this.admin.seValue(data.admin)
    // this.callingNumber.setValue(data.callingNumber)

  }

  roles : FormGroup =this.fb.group({
    admin: new FormControl("",[Validators.required]),
    leader: new FormControl("",[Validators.required]),
    owner: new FormControl("",[Validators.required]),
    filer :new FormControl("",[Validators.required]),
    leadEngagement:new FormControl("",[Validators.required]),
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
    itr: new FormControl("",[Validators.required]),
    nri: new FormControl("",[Validators.required]),
    tpa: new FormControl("",[Validators.required]),
    gst: new FormControl("",[Validators.required]),
    notice: new FormControl("",[Validators.required]),
    wb: new FormControl("",[Validators.required]),
    pd: new FormControl("",[Validators.required]),
    mf: new FormControl("",[Validators.required]),
    other: new FormControl("",[Validators.required]),
    itrToggle :new FormControl(false,[Validators.required]),
    tpaToggle :new FormControl(false,[Validators.required]),
    pdToggle :new FormControl(false,[Validators.required]),
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
  get tpaToggle(){
    return this.services.controls['tpaToggle'] as FormControl
  }
  get pdToggle(){
    return this.services.controls['pdToggle'] as FormControl
  }


  smeFormGroup : FormGroup =this.fb.group({
    mobileNumber :new FormControl("",[Validators.required]),
    name: new FormControl("",[Validators.required]),
    email: new FormControl("",[Validators.required]),
    languages: new FormControl("",[Validators.required]),
    referredPerson: new FormControl("",[Validators.required]),
    itrTypes: new FormControl("",[Validators.required]),
    qualification: new FormControl("",[Validators.required]),
    state: new FormControl("",[Validators.required]),
    parentName: new FormControl("",[Validators.required]),

  })

  get mobileNumber(){
    return this.smeFormGroup.controls['mobileNumber'] as FormControl
  }
  get name(){
    return this.smeFormGroup.controls['name'] as FormControl
  }
  get email(){
    return this.smeFormGroup.controls['email'] as FormControl
  }
  get languages(){
    return this.smeFormGroup.controls['languages'] as FormControl
  }
  get referredPerson(){
    return this.smeFormGroup.controls['referredPerson'] as FormControl
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

  otherSmeInfo : FormGroup =this.fb.group({
    coOwner :new FormControl("",[Validators.required]),
    callingNumber :new FormControl("",[Validators.required]),
    officialEmail: new FormControl("",[Validators.required]),
    kommId: new FormControl("",[Validators.required]),
    displayName:new FormControl("",[Validators.required]),
    internal:new FormControl("",[Validators.required]),
    leaveStartDate:new FormControl(null),
    leaveEndDate:new FormControl(null),
    joiningDate:new FormControl(null),
    resigningDate:new FormControl(null),
  })

  get coOwner(){
    return this.otherSmeInfo.controls['coOwner'] as FormControl
  }
  get callingNumber(){
    return this.otherSmeInfo.controls['callingNumber'] as FormControl
  }
  get officialEmail(){
    return this.otherSmeInfo.controls['officialEmail'] as FormControl
  }
  get displayName(){
    return this.otherSmeInfo.controls['displayName'] as FormControl
  }
  get internal(){
    return this.otherSmeInfo.controls['internal'] as FormControl
  }
  get kommId(){
    return this.otherSmeInfo.controls['kommId'] as FormControl
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

  onContinue(){
    const param = `/sme-details-new/{userId}`;
    // if (this.smeFormGroup.valid && this.roles.valid && this.services.valid && this.otherSmeInfo.valid) {

      let requestBody = this.smeFormGroup.getRawValue();

      console.log(requestBody)
    // }
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
