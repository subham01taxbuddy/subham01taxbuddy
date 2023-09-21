import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-scheduled-call-reassign-dialog',
  templateUrl: './scheduled-call-reassign-dialog.component.html',
  styleUrls: ['./scheduled-call-reassign-dialog.component.scss']
})
export class ScheduledCallReassignDialogComponent implements OnInit {
  agentId: number;
  loading: boolean;
  ownerId: number;
  filerId: number;
  disableReAssign :boolean =true;
  smeBookedSlots: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ScheduledCallReassignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) { }

  ngOnInit() {
    console.log('data from parent of call', this.data)
  }

  fromSme(event, isOwner) {
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
      if(this.ownerId){
        this.checkOwner(this.ownerId)
      }
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.ownerId) {
      this.agentId = this.ownerId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  checkOwner(ownerId){
    console.log("in check Owner selected owner id ", ownerId);
    if(ownerId === this.data.allData.ownerUserId){
      this.utilsService.showSnackBar('Scheduled call already assigned this owner ,please select different owner')
      // alert("You can't assign to yourself");
    }else{
      this.getSmeBookedSlot(ownerId)
    }
  }

  allSlots = [];

  getSmeBookedSlot(ownerUserId) {
    //https://uat-api.taxbuddy.com/report/sme-booked-slots?smeUserId=21234
    this.loading=true;
    let param = `/sme-booked-slots?smeUserId=${ownerUserId}`;

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
      if (response.success) {
        this.loading=false;
        this.smeBookedSlots = response.data.bookedSlots;
        if (this.smeBookedSlots?.length) {
          const timeSlotToCheck = new Date(this.data.allData.scheduleCallTime).toISOString();
          // const timeSlotExists = this.checkIfTimeSlotExists(timeSlotToCheck);
          const timeSlotIsBooked = this.smeBookedSlots.some(slot => {
            const startTime = new Date(slot.scheduleCallTimeStart).toISOString();
            const endTime = new Date(slot.scheduleCallTimeEnd).toISOString();
            return (
              timeSlotToCheck >= startTime &&
              timeSlotToCheck <= endTime
            );
          });

          if (timeSlotIsBooked) {
            this.utilsService.showSnackBar('Selected time slot is already booked for selected owner please select another owner.');
          }else{
            this.disableReAssign= false;
          }
        }else{
          this.disableReAssign= false;
        }
      } else {
        this.loading=false;
        this.utilsService.showSnackBar(response.message);
      }
    },
      error => {
        this.loading=false;
        this.utilsService.showSnackBar('Failed to get sme booked slots');
      });
  }

  checkIfTimeSlotExists(timeSlotToCheck: string): boolean {
    return this.smeBookedSlots.some(slot => {
      const startTime = new Date(slot.scheduleCallTimeStart).toISOString();
      const endTime = new Date(slot.scheduleCallTimeEnd).toISOString();
      return timeSlotToCheck >= startTime && timeSlotToCheck <= endTime;
    });
  }

  reAssign(){
    //PUT 'https://uat-api.taxbuddy.com/gateway/reassign-meeting?userId=1244
    // &newSmeUserId=5334&updateRequestId=dgfbhdzgfbdagbdagdafbdf' \
    this.loading=true;
    let param = `/gateway/reassign-meeting?userId=${this.data.allData.userId}&newSmeUserId=${this.ownerId}&updateRequestId=${this.data.allData.id}`;
    this.userMsService.spamPutMethod(param).subscribe((response: any) => {
      if (response.success) {
        this.loading=false;
        this.utilsService.showSnackBar(response.message);
        this.utilsService.showSnackBar("Call Reassigned Successfully");
        this.dialogRef.close();
      }else{
        this.loading=false;
        this.utilsService.showSnackBar(response.message);
      }
    },
    error => {
      this.loading=false;
      this.utilsService.showSnackBar('Failed to Reassign Call ');
    });

  }

}
