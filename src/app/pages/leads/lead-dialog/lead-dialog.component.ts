import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import moment = require('moment');

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
  selector: 'app-lead-dialog',
  templateUrl: './lead-dialog.component.html',
  styleUrls: ['./lead-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class LeadDialogComponent implements OnInit {
  
  loading: boolean = false;
  showTable: boolean;
  leadSourceInfo: any = [];
  leadStatusInfo: any = [];
  fillingStatus: any = [{key: 'Open', value: 'OPEN', disable: true},
                        {key: 'Interest/Follow up', value: 'FOLLOWUP', disable: false},
                        {key: 'Auto Follow Up', value: 'AUTO_FOLLOWUP', disable: false},
                        {key: 'Not Interseted', value: 'BACKED_OUT', disable: false},
                        {key: 'Converted', value: 'CONVERTED', disable: true}];
  sourceInfo: any = [{name: 'Partnership program'},
                     {name: 'Gst landing'}]
  minDate = (new Date()).toISOString();
  leadForm: FormGroup;
  leadStatusForm: FormGroup;
  agentIdForm: FormGroup;
  maxDate = new Date();

  intersetAreaArray = [{key: 'Income Tax', value: 'incomeTax'},
                        {key: 'Statutory Audit', value: 'statutoryAudit'},
                        {key: 'Accounting', value: 'accounting'},
                        {key: 'ROC Filing', value: 'rocFiling'},
                        {key: 'Tax Audit', value: 'taxAudit'},
                        {key: 'GST', value: 'gst'},
                        {key: 'TDS Filing', value: 'tdsFiling'},
                        {key: 'Business Set-Ups', value: 'businessSetUps'}];

  hearABoutUs = [{key: 'Google Search', value: 'googleSearch'}, {key: 'Social Media', value: 'socialMedia'}]

                indianCity = [
                                     {name:"Adilabad"},
                                          {name:"Adityapur"},
                                          {name:"Agartala"},
                                          {name:"Agra"},
                                          {name:"Ahmedabad"},
                                          {name:"Ahmednagar"},
                                          {name:"Aizwal"},
                                          {name:"Ajmer"},
                                          {name:"Akola"},
                                          {name:"Alappuzha"},
                                          {name:"Alighar"},
                                          {name:"Allahabad"},
                                          {name:"Alwar"},
                                          {name:"Ambala"},
                                          {name:"Ambattur"},
                                          {name:"Ambernath"},
                                          {name:"Amravati"},
                                          {name:"Amritsar"},
                                          {name:"Amroha"},
                                          {name:"Anand"},
                                          {name:"Anantapur"},
                                          {name:"Arrah"},
                                          {name:"Asansol"},
                                          {name:"Aurangabad"},
                                          {name:"Avadi"},
                                          {name:"Bally"},
                                          {name:"Bangalore"},
                                          {name:"Baranagar"},
                                          {name:"Barasat"},
                                          {name:"Bardhaman"},
                                          {name:"Bareilley"},
                                          {name:"Barmer"},
                                          {name:"Begusarai"},
                                          {name:"Behrampur"},
                                          {name:"Belgaum"},
                                          {name:"Bellary"},
                                          {name:"Bhagalpur"},
                                          {name:"Bhalswa"},
                                          {name:"Bharampur"},
                                          {name:"Bhatinda"},
                                          {name:"Bhatpara"},
                                          {name:"Bhavnagar"},
                                          {name:"Bhilai"},
                                          {name:"Bhilwara"},
                                          {name:"Bhind"},
                                          {name:"Bhiwandi"},
                                          {name:"Bhiwani"},
                                          {name:"Bhopal"},
                                          {name:"Bhubneshwar"},
                                          {name:"Bhuj"},
                                          {name:"Bhusawal"},
                                          {name:"Bidar"},
                                          {name:"Bidhan Nagar"},
                                          {name:"Bihar-Sharif"},
                                          {name:"Bijapur"},
                                          {name:"Bikaner"},
                                          {name:"Bilaspur"},
                                          {name:"Bokaro"},
                                          {name:"Bulandshahr"},
                                          {name:"Burhanpur"},
                                          {name:"Chandighar"},
                                          {name:"Chandpura"},
                                          {name:"Chapra"},
                                          {name:"Chennai"},
                                          {name:"Chittoor"},
                                          {name:"City"},
                                          {name:"Coimbatore"},
                                          {name:"Cuttak"},
                                          {name:"Danapur"},
                                          {name:"Darbhanga"},
                                          {name:"Dehradun"},
                                          {name:"Delhi"},
                                          {name:"Deoghar"},
                                          {name:"Devnagree"},
                                          {name:"Dewas"},
                                          {name:"Dhanbad"},
                                          {name:"Dhule"},
                                          {name:"Dindigul"},
                                          {name:"Durg"},
                                          {name:"Durgapur"},
                                          {name:"Eluru"},
                                          {name:"English Bazar"},
                                          {name:"Erode"},
                                          {name:"Etawah"},
                                          {name:"Faridabad"},
                                          {name:"Farrukhabad"},
                                          {name:"Fatehpur"},
                                          {name:"Gandhidham"},
                                          {name:"Gandhinagar"},
                                          {name:"Gaya"},
                                          {name:"Ghaziabad"},
                                          {name:"Godhra"},
                                          {name:"Gopalpur"},
                                          {name:"Gorakhpur"},
                                          {name:"Gulbarga"},
                                          {name:"Guna"},
                                          {name:"Guntur"},
                                          {name:"Gurgoan"},
                                          {name:"Guwahati"},
                                          {name:"Haldia"},
                                          {name:"Hapur"},
                                          {name:"Haridwar"},
                                          {name:"Hisar"},
                                          {name:"Hospet"},
                                          {name:"Howrah"},
                                          {name:"Hubballi-Dharwad"},
                                          {name:"Hugliand Chinsurah"},
                                          {name:"Hyderabad"},
                                          {name:"Ichalkaranji"},
                                          {name:"Imphal"},
                                          {name:"Indore"},
                                          {name:"Jabalpur"},
                                          {name:"Jaipur"},
                                          {name:"Jalgoan"},
                                          {name:"Jalna"},
                                          {name:"Jalpaiguri"},
                                          {name:"Jammu"},
                                          {name:"Jamnagar"},
                                          {name:"Jamshedpur"},
                                          {name:"Jaunpur"},
                                          {name:"Jhalandar"},
                                          {name:"Jhansi"},
                                          {name:"Jodhpur"},
                                          {name:"Junagadh"},
                                          {name:"Kadapa"},
                                          {name:"Kakinada"},
                                          {name:"Kalyan-Dombivali"},
                                          {name:"Kamarhati"},
                                          {name:"Kancheepuram"},
                                          {name:"Kanpur"},
                                          {name:"Karaikodi"},
                                          {name:"Karawal Nagar"},
                                          {name:"Karimnagar"},
                                          {name:"Karjat"},
                                          {name:"Karnal"},
                                          {name:"Katihar"},
                                          {name:"Khammam"},
                                          {name:"Khandwa"},
                                          {name:"Kharagpur"},
                                          {name:"Khora"},
                                          {name:"Kirari"},
                                          {name:"Kochi"},
                                          {name:"Kolar"},
                                          {name:"Kolhapur"},
                                          {name:"Kolkata"},
                                          {name:"Kollam"},
                                          {name:"Korba"},
                                          {name:"Kota"},
                                          {name:"Kozhikode"},
                                          {name:"Kulti"},
                                          {name:"Kurnool"},
                                          {name:"Latur"},
                                          {name:"Loni"},
                                          {name:"Lucknow"},
                                          {name:"Ludhiana"},
                                          {name:"Machilipatnam"},
                                          {name:"Madhyamgram"},
                                          {name:"Madurai"},
                                          {name:"Mahesana"},
                                          {name:"Mahesthala"},
                                          {name:"Malegoan"},
                                          {name:"Mangalore"},
                                          {name:"Mango"},
                                          {name:"Manmad"},
                                          {name:"Mau"},
                                          {name:"Meerut"},
                                          {name:"Mira-Bhayandar"},
                                          {name:"Miryalaguda"},
                                          {name:"Mirzapur"},
                                          {name:"Moradabad"},
                                          {name:"Morena"},
                                          {name:"Morvi"},
                                          {name:"Mumbai"},
                                          {name:"Munger"},
                                          {name:"Murwara"},
                                          {name:"Muzzafarnagar"},
                                          {name:"Muzzafarpur"},
                                          {name:"Mysore"},
                                          {name:"NAithali"},
                                          {name:"Nadiad"},
                                          {name:"Nagarcoil"},
                                          {name:"Nagpur"},
                                          {name:"Nanded"},
                                          {name:"Nandurbar"},
                                          {name:"Nandyal"},
                                          {name:"Nangoli Jat"},
                                          {name:"Nashik"},
                                          {name:"Navi Mumbai"},
                                          {name:"Navi MumbaiPanvel Raigad"},
                                          {name:"Navsari"},
                                          {name:"Nellore"},
                                          {name:"New delhi"},
                                          {name:"Nizamabad"},
                                          {name:"Noida"},
                                          {name:"North DumDum"},
                                          {name:"Ongole"},
                                          {name:"Orai"},
                                          {name:"Osmanabad"},
                                          {name:"Ozhukarai"},
                                          {name:"Palakkad"},
                                          {name:"Palghar"},
                                          {name:"Pali"},
                                          {name:"Pallavaram"},
                                          {name:"Panaji"},
                                          {name:"Panchkula"},
                                          {name:"Pandharpur"},
                                          {name:"Panihati"},
                                          {name:"Panipat"},
                                          {name:"Panvel"},
                                          {name:"Parbhani"},
                                          {name:"Parli"},
                                          {name:"Pathankot"},
                                          {name:"Patiala"},
                                          {name:"Patna"},
                                          {name:"Phusro"},
                                          {name:"Pimpri-Chinchwad"},
                                          {name:"Porbandar"},
                                          {name:"Puducherry"},
                                          {name:"Pune"},
                                          {name:"Puri"},
                                          {name:"Purnia"},
                                          {name:"Rae Bareily"},
                                          {name:"Raghunathganj"},
                                          {name:"Raichur"},
                                          {name:"Raiganj"},
                                          {name:"Raipur"},
                                          {name:"Rajahmundry"},
                                          {name:"Rajkot"},
                                          {name:"Rajpur Sonarpur"},
                                          {name:"Ramagundam"},
                                          {name:"Rampur"},
                                          {name:"Ranchi"},
                                          {name:"Ranipet"},
                                          {name:"Ratlam"},
                                          {name:"Ratnagiri"},
                                          {name:"Rewa"},
                                          {name:"Rohtak"},
                                          {name:"Rourkela"},
                                          {name:"Sagar"},
                                          {name:"Saharanpur"},
                                          {name:"Sahjahanpur"},
                                          {name:"Salem"},
                                          {name:"Sambalpur"},
                                          {name:"Sambhal"},
                                          {name:"Sangli-Miraj &amp; Kupwad"},
                                          {name:"Satara"},
                                          {name:"Satna"},
                                          {name:"Secunderabad"},
                                          {name:"Serampore"},
                                          {name:"Shahjahanpur"},
                                          {name:"Shillong"},
                                          {name:"Shimla"},
                                          {name:"Shirdi"},
                                          {name:"Shivamogga"},
                                          {name:"Shivpuri"},
                                          {name:"Sikar"},
                                          {name:"Silchar"},
                                          {name:"Siliguri"},
                                          {name:"Singrauli"},
                                          {name:"Sirsa"},
                                          {name:"Solapur"},
                                          {name:"Sonipat"},
                                          {name:"South DumDum"},
                                          {name:"Sri ganganagr"},
                                          {name:"Srinagar"},
                                          {name:"Sultan pur majra"},
                                          {name:"Surat"},
                                          {name:"Surendranagar Dudhrej"},
                                          {name:"Suryapet"},
                                          {name:"Thajavur"},
                                          {name:"Thane"},
                                          {name:"Thoothukudi"},
                                          {name:"Thriruvanantpuram"},
                                          {name:"Thrissur"},
                                          {name:"Tiruchirappalli"},
                                          {name:"Tirunelveli"},
                                          {name:"Tirupati"},
                                          {name:"Tiruppur"},
                                          {name:"Tiruvottiyur"},
                                          {name:"Tumkur"},
                                          {name:"Udaipur"},
                                          {name:"Udgir"},
                                          {name:"Udupi"},
                                          {name:"Ujjain"},
                                          {name:"Ullashnagar"},
                                          {name:"Uluberia"},
                                          {name:"Unnao"},
                                          {name:"Vadodra"},
                                          {name:"Vapi"},
                                          {name:"Varanasi"},
                                          {name:"Vasai-Virar"},
                                          {name:"Vellore"},
                                          {name:"Vijayanagaram"},
                                          {name:"Vijayawada"},
                                          {name:"Vishakapatnam"},
                                          {name:"Warangal"},
                                          {name:"Wardha"},
                                          {name:"Yamunanagar"},
                                          {name:"Yavatmal"},
                                          {name:"bahraich"},
                                          {name:"gwalior"},
                                          {name:"kottayam"}
  ]

  constructor(public dialogRef: MatDialogRef<LeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService,
    private utilService: UtilsService) { }

  ngOnInit() {
    console.log('Recived data -> ',this.data, this.data['leadData'].source);
    if(this.data.mode === "source" || this.data.mode === "status"){
      this.showTable = true; 
      if(this.data.mode === "source"){
        this.leadSourceInfo = this.data['leadData'].source;
        this.leadStatusInfo = [];
      }
      else if(this.data.mode === "status"){
        this.leadStatusInfo = this.data['leadData'].status;
        this.leadSourceInfo = [];
      }
    }else {
      this.showTable = false;
    }

    this.leadStatusForm = this.fb.group({
        leadStatus: ['', Validators.required],
        callSheduleDate: [''],
        source: ['']
    })

    this.agentIdForm = this.fb.group({
      agentId: ['', Validators.pattern(AppConstants.emailRegex)]
    })

    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.pattern(AppConstants.emailRegex)]],
      mobileNo: ['', [Validators.required,Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      city: [''],
      hearAboutUs: [''],
      website: [''],
      interestArea : new FormArray([]),
      otherInfo: [''],
      gstSubSurvice: [''],
      channel: [''],
      leadCreatedDate: ['']
    })
  }

  updateLeadStatus(){
    if(this.leadStatusForm.valid){
      console.log('this.leadStatusForm valid -> ',this.leadStatusForm.valid, this.leadStatusForm);
      console.log('selected lead -> ',this.data['leadData']);
      var selectedData;
      if(this.leadStatusForm['controls'].leadStatus.value === 'FOLLOWUP'){
        selectedData = (moment(this.leadStatusForm['controls'].callSheduleDate.value).add(330, 'm').toDate());   //.toISOString();
      }
      else{
        selectedData = '';
      }
     console.log('selectedData -> ',selectedData)
      this.loading = true;
      let param = '/update-lead-status';
      let body = {
        "status": this.leadStatusForm['controls'].leadStatus.value, 
        "mobileNumber": this.data['leadData'].mobileNumber,
        "followUpDate": selectedData,
        "source": this.leadStatusForm['controls'].source.value
      }
      this.userService.putMethod(param, body).subscribe(responce=>{
        this.loading = false;
        console.log('Lead status update responce -> ',responce);
        this._toastMessageService.alert("success", "Lead information update succesfully.");
        setTimeout(() => {
          this.dialogRef.close({ event: 'close'})
        }, 3000)
      },
      error=>{
        this.loading = false;
        console.log('Error during lead status updation: ', error)
        this._toastMessageService.alert("error", "There is some issue to Update Lead information.");
      })
    }
  }

  updateAgentId(){
    if(this.agentIdForm.valid){
      console.log('Agent Mob No: ',this.data['leadData'].mobileNumber, this.agentIdForm.controls['agentId'].value);
      this.loading = true;
      let mobNo = this.data['leadData'].mobileNumber;
      let param = '/update-lead-agentId?mobileNumber='+mobNo+'&agentId='+this.agentIdForm.controls['agentId'].value;
      this.userService.putMethod(param).subscribe((res: any)=>{
          console.log('Agent Id updated: ',res);
          this.loading = false;
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data: 'AgentIdUpdated'})
          }, 3000)
          this._toastMessageService.alert("success", "Agent id updated successfully.")
      },
      error=>{
        this.loading = false;
        this._toastMessageService.alert("error", "Unable to update Agent id, try after some time.");
      })

    }
  }

  onCheckboxChange(e) {
    const interestArray: FormArray = this.leadForm.get('interestArea') as FormArray;
  
    if (e.target.checked) {
      interestArray.push(new FormControl(e.target.value));
    } else {
       const index = interestArray.controls.findIndex(x => x.value === e.target.value);
       interestArray.removeAt(index);
    }

    console.log('Interest Array -> ',interestArray)
  }

  addLeadInfo(){
    this.checkExtraValidation(this.leadForm.value, this.data.mode);   //for gst 'I am here for validation'

    console.log('Lead form value: ',this.leadForm.value);
    if(this.leadForm.valid){
      if(this.checkExtraValidation(this.leadForm.value, this.data.mode)){
        console.log('Lead form value: ',this.leadForm.value);

        var passObj = {
          "name": this.leadForm.value.name,
          "channel": this.leadForm.value.channel,
          "emailAddress": this.leadForm.value.email,
          "mobileNumber": this.leadForm.value.mobileNo,
          "services":  this.data.mode === "partnerLead" ? ['Partnership Program'] : ['GST'],  //this.leadForm.value.interestArea
          "subServiceType": this.data.mode === "partnerLead" ? this.leadForm.value.interestArea : [this.leadForm.value.gstSubSurvice],
          "assignedTo":'',
          "otherData": {
              "data": this.data.mode === "partnerLead" ? this.leadForm.value.otherInfo : '',
              "hearAboutUs": this.data.mode === "partnerLead" ? this.leadForm.value.hearAboutUs : '',
              "urlData": null
            },
          "source": [{
            "name": "Admin",
          }],
          "status":[{
            "status": "OPEN",
            "followUpDate": ''
          }],
          "city": this.leadForm.value.city,
          "website": this.data.mode === "partnerLead" ? this.leadForm.value.website : "",
          "createdDate": (moment(this.leadForm.value.leadCreatedDate).add(330, 'm').toDate()).toISOString() 
        }
  
        console.log('passObj -> ',passObj);
        this.loading = true;
        let param = '/lead-user-details';
        this.userService.postMethod(param, passObj).subscribe((res: any)=>{
            console.log('responce after lead created -> ',res);
            this.loading = false;
            console.log('Responce hadle: ',res, res.hasOwnProperty('Message'))
            if(res.hasOwnProperty('Message')){
              this._toastMessageService.alert("success", res.Message)
            }
            else{
              this._toastMessageService.alert("success", "Lead data added successfully.")
            }

            setTimeout(() => {
              this.dialogRef.close({ event: 'close', data: 'leadAdded'})
            }, 6000)
           

        },error=>{
          this.loading = false;
          this._toastMessageService.alert("error", "There is issue to generate lead")
        })
  
  
      }
    }
  }

  checkExtraValidation(formValue, mode){
    console.log('formValue -> ',formValue,' mode -> ',mode);
      if(mode === "partnerLead"){
          if(formValue.interestArea.length > 0){
            return true;
          }
          else{
            this._toastMessageService.alert("error", "Select Interest area.");
            return false;
          }
      }
      else if(mode === "gstLead"){
        if(this.utilService.isNonEmpty(formValue.gstSubSurvice)){
          return true;
        }
        else{
          this._toastMessageService.alert("error", "Choose 'I am here for' .");
          return false;
        }
      }
  }
}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  // leadData: any;
  callerObj: any;
  mode: any
}