import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-add-call-log',
  templateUrl: './add-call-log.component.html',
  styleUrls: ['./add-call-log.component.css']
})
export class AddCallLogComponent implements OnInit {
  callLogForm: FormGroup;
  loading = false;
  statusMaster = [
    { value: 15, label: 'Not Intrested' },
    { value: 16, label: 'Intrested' },
    { value: 17, label: 'Call Later' },
  ];

  smeList = [
    { userId: 21354, name: 'Brijmohan Lavaniya', email: 'brij@ssbainnovations.com', teamLeadEmail: 'brij@ssbainnovations.com' },
    { userId: 1067, name: 'Divya Bhanushali', email: 'divya@ssbainnovations.com', teamLeadEmail: 'divya@ssbainnovations.com' },
    { userId: 1065, name: 'Urmila Warve', email: 'urmila@ssbainnovations.com', teamLeadEmail: 'urmila@ssbainnovations.com' },
    { userId: 1063, name: 'Amrita Thakur', email: 'amrita@ssbainnovations.com', teamLeadEmail: 'amrita@ssbainnovations.com' },
    { userId: 1064, name: 'Ankita Murkute', email: 'ankita@ssbainnovations.com', teamLeadEmail: 'ankita@ssbainnovations.com' },
    { userId: 1062, name: 'Damini Patil', email: 'damini@ssbainnovations.com', teamLeadEmail: 'damini@ssbainnovations.com' },
    { userId: 1707, name: 'Kavita Singh', email: 'kavita@ssbainnovations.com', teamLeadEmail: 'kavita@ssbainnovations.com' },
    { userId: 1706, name: 'Nimisha Panda', email: 'nimisha@ssbainnovations.com', teamLeadEmail: '' },
    { userId: 24346, name: 'Tushar Shilimkar', email: 'tushar@ssbainnovations.com', teamLeadEmail: 'brij@ssbainnovations.com' },
    { userId: 19529, name: 'Kirti Gorad', email: 'kirti@ssbainnovations.com', teamLeadEmail: 'damini@ssbainnovations.com' },
    { userId: 24348, name: 'Geetanjali Panchal', email: 'geetanjali@ssbainnovations.com', teamLeadEmail: 'damini@ssbainnovations.com' },
    { userId: 23553, name: 'Renuka Kalekar', email: 'renuka.kalekar@taxbuddy.com', teamLeadEmail: '' },
    { userId: 23550, name: 'Bhavana Patil', email: 'bhavana.patil@taxbuddy.com', teamLeadEmail: 'ankita@ssbainnovations.com' },
    { userId: 23567, name: 'Sneha Suresh Utekar', email: 'sneha.utekar@taxbuddy.com', teamLeadEmail: 'ankita@ssbainnovations.com' },
    { userId: 23552, name: 'Roshan Vilas Kakade', email: 'roshan.kakade@taxbuddy.com', teamLeadEmail: 'roshan.kakade@taxbuddy.com' },
    { userId: 23551, name: 'Pradnya Tambade', email: 'pradnya.tambade@taxbuddy.com', teamLeadEmail: 'amrita@ssbainnovations.com' },
    { userId: 983, name: 'Usha Chellani', email: 'usha.chellani@taxbuddy.com', teamLeadEmail: 'kavita@ssbainnovations.com' },
    { userId: 23670, name: 'Ashwini Kapale', email: 'ashwini.kapale@taxbuddy.com', teamLeadEmail: 'roshan.kakade@taxbuddy.com' },
    { userId: 23578, name: 'Aditi Ravindra Gujar', email: 'aditi.gujar@taxbuddy.com', teamLeadEmail: 'divya@ssbainnovations.com' },
    { userId: 23668, name: 'Chaitanya Prakash Masurkar', email: 'chaitanya.masurkar@taxbuddy.com', teamLeadEmail: 'brij@ssbainnovations.com' },
    { userId: 25942, name: 'Vaibhav M. Nilkanth', email: 'vaibhav.nilkanth@taxbuddy.com', teamLeadEmail: 'divya@ssbainnovations.com' },
    { userId: 26220, name: 'Pratiksha Shivaji Jagtap', email: 'pratiksha.jagtap@taxbuddy.com', teamLeadEmail: 'roshan.kakade@taxbuddy.com' },
    { userId: 177, name: 'Aditya U.Singh', email: 'aditya.singh@taxbuddy.com', teamLeadEmail: 'ankita@ssbainnovations.com' },
    { userId: 26195, name: 'Tejaswi Suraj Bodke', email: 'tejaswi.bodke@taxbuddy.com', teamLeadEmail: '' },
    { userId: 23505, name: 'Tejshri Hanumant Bansode', email: 'tejshri.bansode@taxbuddy.com', teamLeadEmail: 'urmila@ssbainnovations.com' },
    { userId: 26215, name: 'Deepali Nivrutti Pachangane', email: 'deepali.pachangane@taxbuddy.com', teamLeadEmail: 'divya@ssbainnovations.com' },
    { userId: 26236, name: 'Supriya Mahindrakar', email: 'supriya.mahindrakar@taxbuddy.com', teamLeadEmail: 'amrita@ssbainnovations.com' },
    { userId: 28033, name: 'Shrikanth Elegeti', email: 'shrikanth.elegeti@taxbuddy.com', teamLeadEmail: 'divya@ssbainnovations.com' },
    { userId: 28040, name: 'Namrata Shringarpure', email: 'namrata.shringarpure@taxbuddy.com', teamLeadEmail: 'urmila@ssbainnovations.com' },
    { userId: 28035, name: 'Rupali Onamshetty', email: 'rupali.onmshetty@taxbuddy.com', teamLeadEmail: 'brij@ssbainnovations.com' },
    { userId: 27474, name: 'Poonam Hase', email: 'poonam.hase@taxbuddy.com', teamLeadEmail: 'urmila@ssbainnovations.com' },
    { userId: 28044, name: 'Bhakti Khatavkar', email: 'bhakti.khatavkar@taxbuddy.com', teamLeadEmail: 'kavita@ssbainnovations.com' },
    { userId: 28034, name: 'Dipali Waghmode', email: 'depali.waghmode@taxbuddy.com', teamLeadEmail: 'amrita@ssbainnovations.com' },
    { userId: 28031, name: 'Harsha Kashyap', email: 'harsha.kashyap@taxbuddy.com', teamLeadEmail: 'kavita@ssbainnovations.com' },
    { userId: 42886, name: 'Gitanjali Kakade', email: 'gitanjali.kakade@taxbuddy.com', teamLeadEmail: 'damini@ssbainnovations.com' },
    { userId: 42885, name: 'Dhanashri wadekar', email: 'dhanashri.wadekar@taxbuddy.com', teamLeadEmail: 'ankita@ssbainnovations.com' },
    { userId: 42888, name: 'Baby Kumari Yadav', email: 'babykumari.yadav@taxbuddy.com', teamLeadEmail: 'roshan.kakade@taxbuddy.com' },
    { userId: 43406, name: 'Priyanka Shilimkar', email: 'priyanka.shilimkar@taxbuddy.com', teamLeadEmail: 'urmila@ssbainnovations.com' },
    { userId: 42878, name: 'Supriya Waghmare', email: 'supriya.waghmare@taxbuddy.com', teamLeadEmail: 'kavita@ssbainnovations.com' },
    { userId: 42931, name: 'Dhanashree Amarale', email: 'dhanashree.amarale@taxbuddy.com', teamLeadEmail: 'amrita@ssbainnovations.com' },


  ];
  constructor(public dialogRef: MatDialogRef<AddCallLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder,
    private itrMsService: ItrMsService,
    private utileService: UtilsService, private userMsService: UserMsService) { }

  ngOnInit() {
    this.callLogForm = this.createCallLogForm(this.data);
  }

  createCallLogForm(data: ConfirmModel) {
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'))
    const teamLead = this.smeList.filter(item => item.email === loggedInSme['USER_EMAIL'])[0].teamLeadEmail;
    return this.fb.group({
      userName: [data.userName || ''],
      userId: [data.userId || ''],
      userMobile: [data.userMobile || ''],
      userEmail: [data.userEmail || '', Validators.pattern(AppConstants.emailRegex)],
      smeEmailId: [(loggedInSme && loggedInSme['USER_EMAIL']) || ''],
      smeUserId: [(loggedInSme && loggedInSme['USER_UNIQUE_ID'])],
      teamLeadEmail: [teamLead || ''],
      statusId: [null, Validators.required],
      statusName: ['', Validators.required],
      scheduleCallTime: [''],
      scheduleCallEmail: [(loggedInSme && loggedInSme['USER_EMAIL']) || ''],
      description: ['', Validators.compose([Validators.required])],
      reason: [''],
      createdByName: [(loggedInSme && (loggedInSme['USER_F_NAME'] + ' ' + loggedInSme['USER_L_NAME'])) || '']
    });
  }

  addCallLog() {
    this.callLogForm.controls['statusName'].setValue(this.statusMaster.filter(item => item.value === this.callLogForm.controls['statusId'].value)[0].label);
    if (this.callLogForm.controls['statusId'].value !== 17) {
      this.callLogForm.controls['scheduleCallEmail'].setValue('');
    }
    console.log(this.callLogForm.value);
    if (this.callLogForm.valid) {
      this.loading = true;
      const param = "/call-status";
      this.userMsService.postMethod(param, this.callLogForm.value).subscribe((res: any) => {
        console.log(res);
        this.utileService.showSnackBar('Call logs added successfully');
        this.dialogRef.close();
        this.loading = false;
      }, err => {
        this.loading = false;
        this.utileService.showSnackBar('Please try again, unable to add call log.');
      });
    }
  }
}
export interface ConfirmModel {
  userId: any;
  userName: string;
  userMobile: string;
  userEmail: string;
}