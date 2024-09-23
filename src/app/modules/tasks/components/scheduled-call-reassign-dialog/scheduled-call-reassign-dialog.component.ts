import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { User } from 'src/app/modules/subscription/components/assigned-subscription/assigned-subscription.component';
import { ReportService } from 'src/app/services/report-service';
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
  leaderId: number;
  filerId: number;
  disableReAssign :boolean =true;
  smeBookedSlots: any[] = [];
  searchLeader =new UntypedFormControl('');
  filteredLeaders : Observable<any[]>;
  leaderList :any;
  leaderNames : User[];
  leaderOptions :User[] =[];

  constructor(
    public dialogRef: MatDialogRef<ScheduledCallReassignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private reportService:ReportService
  ) { }

  ngOnInit() {
    console.log('data from parent of call', this.data)
    this.getLeaderListDropDown();
  }

  getLeaderNameId(option){
    console.log('scheduled call,selected leader ',option);
    this.leaderId = option?.userId;
    this.checkOwner(option.userId);
  }

  getLeaderListDropDown(){
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000?leader=true&serviceType=ITR
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    let param = `/bo/sme-details-new/${loggedInSmeUserId}?leader=true&serviceType=${this.data.allData.serviceType}`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('new leader list result -> ', result);
      this.leaderList = result.data;
      this.leaderNames = this.leaderList.map((item) => {
        return {name: item.name, userId: item.userId};
      });
     this.leaderOptions = this.leaderNames;
     this.setFilteredLeaders();
    },error=>{
      this.utilsService.showSnackBar('Error in API of get leader list');
    })
  }

  setFilteredLeaders() {
    this.filteredLeaders = this.searchLeader.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.leaderOptions)
          : this.leaderOptions.slice();
      })
    );
  }

  displayFn(label: any) {
    return label ? label : undefined;
  }

  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  checkOwner(leaderId){
    console.log("in check leader selected leader id ", leaderId);
    if(leaderId === this.data.allData.leaderUserId){
      this.utilsService.showSnackBar('Scheduled call already assigned this leader ,please select different leader')
    }else{
      this.getSmeBookedSlot(leaderId)
    }
  }

  allSlots = [];

  getSmeBookedSlot(leaderId) {
    //https://uat-api.taxbuddy.com/report/sme-booked-slots?smeUserId=21234
    this.loading=true;
    let param = `/sme-booked-slots?smeUserId=${leaderId}`;

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
      if (response.success) {
        this.loading=false;
        this.smeBookedSlots = response.data.bookedSlots;
        if (this.smeBookedSlots?.length) {
          const timeSlotToCheck = new Date(this.data.allData.scheduleCallTime).toISOString();
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

  reAssign = (): Promise<any> => {
    //PUT 'https://uat-api.taxbuddy.com/gateway/reassign-meeting?userId=1244
    // &newSmeUserId=5334&updateRequestId=dgfbhdzgfbdagbdagdafbdf' \
    return new Promise((resolve, reject) => {
      this.utilsService.getUserCurrentStatus(this.data.allData.userId).subscribe(
        (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.dialogRef.close();
            return reject(res.error);
          } else {
            this.loading = true;
            let param = `/gateway/reassign-meeting?userId=${this.data.allData.userId}&newSmeUserId=${this.leaderId}&updateRequestId=${this.data.allData.id}`;
            this.userMsService.spamPutMethod(param).toPromise().then(
              (response: any) => {
                this.loading = false;
                if (response.success) {
                  this.utilsService.showSnackBar(response.message);
                  this.utilsService.showSnackBar("Call Reassigned Successfully");
                  this.dialogRef.close();
                  resolve(response);
                } else {
                  this.utilsService.showSnackBar(response.message);
                  this.dialogRef.close();
                  reject(response.message);
                }
              },
              (error) => {
                this.loading = false;
                this.utilsService.showSnackBar('Failed to Reassign Call');
                this.dialogRef.close();
                reject(error);
              }
            ).catch((error) => {
              this.loading = false;
              reject(error);
            });
          }
        },
        (error) => {
          this.loading = false;
          if (error.error && error.error.error) {
            this.utilsService.showSnackBar(error.error.error);
            this.dialogRef.close();
          } else {
            this.utilsService.showSnackBar("An unexpected error occurred.");
          }
          reject(error);
        }
      );
    });
  }

}
