import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { RemoteConfigService } from 'src/app/services/remote-config-service';
import { UtilsService } from 'src/app/services/utils.service';
import * as moment from 'moment-timezone';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-sch-call-calender',
  templateUrl: './sch-call-calender.component.html',
  styleUrls: ['./sch-call-calender.component.scss']
})
export class SchCallCalenderComponent implements OnInit {

  @ViewChild('timeInput') timeInput: ElementRef;
  uploadDoc: File;
  uploadedDocList = [];

  scheduleForm: UntypedFormGroup;
  loading: boolean;
  scheduleCallRemoteConfig: any;
  endTimeStr: any;
  startTimeStr: any;
  remoteConfigObj: any;
  smeBookedSlots: any[] = [];
  callSlots = [];
  userObj: any;
  allFilename = [];
  uploadedFileNames: string;
  time = '';
  date = '';
  reschedule: boolean = false;
  isValidTime: boolean = true;
  scheduleCallDetails: any;
  alreadyScheduleCallDetails: any;
  reScheduleCallId: string;
  uploadedDocumentList = [];
  viewer = 'DOC';
  docUrl = '';
  uploadDocs3URL: any;
  constructor(
    public dialogRef: MatDialogRef<SchCallCalenderComponent>,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilService: UtilsService,
    private utilsService: UtilsService,
    private remoteConfigService: RemoteConfigService,
    private userMsService: UserMsService,
    private reportService: ReportService
  ) {
    console.log('data', data)
    this.getRemoteConfigData();
    this.inItForm();
    this.userObj = JSON.parse(sessionStorage.getItem(AppConstants.USER_OBJ));
    const currentDay = moment().format('dddd').toLowerCase();
    this.endTimeStr = this.scheduleCallRemoteConfig?.scheduledCallAvailability[currentDay].endTime.split(":");
    this.startTimeStr = this.scheduleCallRemoteConfig?.scheduledCallAvailability[currentDay].startTime.split(":");
  }

  allSlots = [];
  getTimeSlots() {
    let addNextDate = 0;
    const startDate = moment().tz('Asia/Kolkata').startOf('day');
    let today = moment().tz('Asia/Kolkata').startOf('day').valueOf();
    for (let i = 0; i <= this.scheduleCallRemoteConfig?.callTimeInMins; i++) {
      const date = moment(startDate).tz('Asia/Kolkata').add(i, 'day').startOf('day');
      this.allSlots.push({
        date: date,
        slots: []
      });
      const currentDay = moment(startDate).tz('Asia/Kolkata').add(i, 'day').format('dddd').toLowerCase();
      let endTimeStr = this.scheduleCallRemoteConfig?.scheduledCallAvailability[currentDay].endTime.split(":");
      let startTimeStr = this.scheduleCallRemoteConfig?.scheduledCallAvailability[currentDay].startTime.split(":");
      let startTimeMin = Number(startTimeStr[0]) * 60 + Number(startTimeStr[1]);
      let endTimeMin = Number(endTimeStr[0]) * 60 + Number(endTimeStr[1]);
      const dayStartTime = Number(startTimeStr[0]) * 60 + Number(startTimeStr[1]);
      const dayEndTime = Number(endTimeStr[0]) * 60 + Number(endTimeStr[1]);
      let holiDayDate = this.scheduleCallRemoteConfig?.holidays.filter(item =>
        moment.tz(item, 'DD-MM-YYYY', "Asia/Kolkata").valueOf() === date.valueOf());
      if (this.scheduleCallRemoteConfig?.scheduledCallAvailability[currentDay].availability && holiDayDate.length === 0) {
        if (date.valueOf() == today) {
          let currentTimeInHour = moment().hours();
          let currentTimeInMin = moment().minute();
          let totalMins = (currentTimeInHour * 60) + currentTimeInMin;
          if (totalMins > dayStartTime) {
            totalMins += (this.scheduleCallRemoteConfig.callTimeInMins - (totalMins % this.scheduleCallRemoteConfig.callTimeInMins));
            startTimeMin = totalMins + this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins;
          }
          if (totalMins < dayStartTime) {
            startTimeMin = startTimeMin + this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins;
          }
          for (let j = startTimeMin; j < endTimeMin; j += this.scheduleCallRemoteConfig.callTimeInMins) {
            this.allSlots[i].slots.push({
              startDateTime: date.valueOf() + (j * 60 * 1000),
              endDateTime: date.valueOf() + ((j + this.scheduleCallRemoteConfig.callTimeInMins) * 60 * 1000),
              busy: false
            });
          }
          if (totalMins > dayEndTime) {
            addNextDate = this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins;
          }
          const diff = endTimeMin - totalMins;
          if (this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins > diff && diff > 0) {
            addNextDate = this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins - diff;
          } else if (diff <= 0) {
            addNextDate = this.scheduleCallRemoteConfig.scheduledCallWaitPeriodMins;
          }
        } else {
          startTimeMin = startTimeMin + addNextDate;
          for (let j = startTimeMin; j < endTimeMin; j += this.scheduleCallRemoteConfig.callTimeInMins) {
            this.allSlots[i].slots.push({
              startDateTime: date.valueOf() + (j * 60 * 1000),
              endDateTime: date.valueOf() + ((j + this.scheduleCallRemoteConfig.callTimeInMins) * 60 * 1000),
              busy: false,
              selected: false
            });
          }
          addNextDate = 0;
        }
      }
    }
  }

  inItForm() {
    this.scheduleForm = this.fb.group({
      description: ['', [Validators.required]],
      title: ['Your appointment has been scheduled with TaxBuddy' + '' + 's Tax Expert']
    });
  }
  ngOnInit() {
    this.getScheduleCallDetails();
    this.reScheduleCallId = sessionStorage.getItem('reScheduleCallId');
    this.getSmeBookedSlot();
    this.getTimeSlots();
  }

  getScheduleCallDetails() {
    this.loading = true;
    // https://uat-api.taxbuddy.com/user/schedule-call-details/3000?page=0&size=30&mobileNumber=4564313878&statusId=17
    let param = '/schedule-call-details/' + this.data?.allData.userId + '?page=0&size=30&mobileNumber=' + this.data?.allData.userMobile;
    this.userMsService.getMethod(param).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success && response?.data?.content?.length > 0) {
          this.scheduleCallDetails = response?.data?.content[0];
          this.alreadyScheduleCallDetails = response?.data?.content;
        } else {
          this.scheduleCallDetails = null;
          this.alreadyScheduleCallDetails = [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.log('error ==> ', err);
        this.utilsService.showSnackBar('Failed to get Schedule call details');
      }
    });
  }


  getSmeBookedSlot() {
    if (this.data.allData.leaderUserId) {
      let param = '/sme-booked-slots?smeUserId=' + this.data.allData.leaderUserId;
      this.reportService.getMethod(param).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.smeBookedSlots = response.data.bookedSlots;
            if (this.smeBookedSlots?.length) {
              this.markBookedSlotBusy();
            }
          } else {
            this.utilsService.showSnackBar(response.message);
          }
        },
        error: (error: any) => {
          this.utilsService.showSnackBar('Failed to get sme booked slots');
        }
      });
    }
  }

  markBookedSlotBusy() {
    let usersBookedSlot = [];
    if (this.alreadyScheduleCallDetails.length) {
      this.alreadyScheduleCallDetails.forEach(element => {
        let UserScheduleCallTimeStart = element.scheduleCallTime;
        const UserScheduleCallTimeEnd = moment(moment.utc(element.scheduleCallTime).format('YYYY-MM-DD HH:mm:ss')).add(30, 'm').format('YYYY-MM-DDTHH:mm:ss.SS') + "Z";
        usersBookedSlot.push(
          {
            'scheduleCallTimeStart': UserScheduleCallTimeStart,
            'scheduleCallTimeEnd': UserScheduleCallTimeEnd
          }
        );
      });
    }
    let allBookedSlots = [...usersBookedSlot, ...this.smeBookedSlots];
    console.log('allBookedSlots', allBookedSlots)
    allBookedSlots.forEach(element => {
      const bookDate = moment(element.scheduleCallTimeStart).startOf('day').valueOf();
      const slotStartTime = moment(moment.utc(element.scheduleCallTimeStart).format('YYYY-MM-DD HH:mm:ss')).valueOf();
      const slotEndTime = moment(moment.utc(element.scheduleCallTimeEnd).format('YYYY-MM-DD HH:mm:ss')).valueOf();
      this.allSlots.forEach(data => {
        if (moment(data.date).startOf('day').valueOf() == bookDate) {
          data.slots.forEach(slot => {
            if (slotStartTime >= slot.startDateTime && slotStartTime < slot.endDateTime) {
              slot.busy = true;
            }
            if (slotEndTime > slot.startDateTime && slotEndTime < slot.endDateTime) {
              slot.busy = true;
            }
          })
        }
      })
    });
  }

  selectSlot(date, time, selected) {
    if (!selected) {
      this.date = date;
      this.time = time;
    } else {
      this.date = '';
      this.time = '';
    }
    this.allSlots.forEach(element => {
      element.slots.forEach(data => {
        if (!selected && time == data.startDateTime) {
          data.selected = true;
        } else {
          data.selected = false;
        }
      });
    });
  }

  async getRemoteConfigData() {
    this.scheduleCallRemoteConfig = await this.remoteConfigService.getRemoteConfigData(AppConstants.SCHEDULE_CALL_REMOTE_CONFIG);
  }

  scheduleCall = (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      if (this.date && this.time && this.scheduleForm.valid) {
        const mainScheduleData = moment(this.time).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
        this.loading = true;
        let param = '/gateway/setup-meeting?title=' + encodeURIComponent(this.scheduleForm['controls']['title'].value) +
                    '&description=' + encodeURIComponent(this.scheduleForm['controls']['description'].value) +
                    '&scheduleDate=' + encodeURIComponent(mainScheduleData) +
                    '&userId=' + encodeURIComponent(this.data.allData.userId) +
                    '&serviceType=' + encodeURIComponent(this.data.allData.serviceType) +
                    '&smeUserId=' + encodeURIComponent(this.data.allData.leaderUserId);

        const showScheduleTime = moment(mainScheduleData).utc().format('hh:mm:ss a');
        console.log('showScheduleTime', showScheduleTime);

        if (this.data.allData.scheduleCallType) {
          param = param + '&scheduleCallType=' + encodeURIComponent(this.data.allData.scheduleCallType);
        }

        try {
          const response: any = await lastValueFrom(this.userMsService.getMethodInfo(param));

          if (response['data']) {
            if (response['data']['response'] && response['success']) {
              if (response['data']['response'].toLocaleLowerCase() === 'sent') {
                this.utilService.showSnackBar('Your appointment with tax expert has been scheduled for ' +
                  (new Date(mainScheduleData)).toLocaleDateString() + ' date and ' + showScheduleTime + ' time');

                setTimeout(() => {
                  this.dialogRef.close(true);
                  this.loading = false;
                }, 4000);

                resolve(response);
              } else {
                this.utilService.showSnackBar(response['data']['response'].toString());
                this.loading = false;
                reject(response['data']['response'].toString());
              }
            } else {
              this.utilService.showSnackBar(response['error']);
              this.loading = false;
              reject(response['error']);
            }
          }
        } catch (error) {
          this.utilService.showSnackBar('Failed to set up meeting with tax expert');
          this.loading = false;
          reject(error);
        }
      } else {
        reject('Invalid form data');
      }
    });
  };

}

