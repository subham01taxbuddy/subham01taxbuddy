import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastMessageService } from "src/app/services/toast-message.service";
import { UserMsService } from "src/app/services/user-ms.service";
import { UtilsService } from "src/app/services/utils.service";


@Component({
  selector: 'app-call-reassignment',
  templateUrl: './call-reassignment.component.html',
  styleUrls: ['./call-reassignment.component.css']
})
export class CallReassignmentComponent implements OnInit {
  loading = false;
  callReassignForm!: UntypedFormGroup;
  agentList: any = [];
  smeList: any = [];
  agentsCall = true;
  callerMessage = 'Your self calls will be reassigned to below callers, if you just want to divide your calls please select your name as well from callers list'
  agentMessage = 'All calls of selected agent id will be re assigned equally to newly selected callers from list irrespective of current assignment.'
  // itrStatus: any = [];
  constructor(public dialogRef: MatDialogRef<CallReassignmentComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService, private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    private toastMsgService: ToastMessageService) { }

  ngOnInit() {
    console.log(this.data);
    this.getAgentList();
    this.getAllCallerUser();
    // https://uat-api.taxbuddy.com/user/call-management/caller-agent?agentId={agentId}&callerAgentUserId={callerAgentUserId}&statusId={statusId}&callerAgentUserIds={callerAgentUserIds}
    this.callReassignForm = this.fb.group({
      agentId: [this.data.agentId || ''],
      callerAgentUserId: [''],
      statusId: [this.data.statusId || ''],
      callerAgentUserIds: ['']
    })
  }

  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }

  callReassign() {
    console.log(this.callReassignForm.getRawValue(), this.agentsCall);
    if (this.callReassignForm.valid) {
      let param = ''
      if (this.utilsService.isNonEmpty(this.callReassignForm.controls['agentId'].value)) {
        param = `/call-management/caller-agent?agentId=${this.callReassignForm.controls['agentId'].value}&statusId=${this.callReassignForm.controls['statusId'].value}&callerAgentUserIds=${this.callReassignForm.controls['callerAgentUserIds'].value}`
      } else {
        param = `/call-management/caller-agent?callerAgentUserId=${this.callReassignForm.controls['callerAgentUserId'].value}&statusId=${this.callReassignForm.controls['statusId'].value}&callerAgentUserIds=${this.callReassignForm.controls['callerAgentUserIds'].value}`
      }
      console.log('Params', param)
      this.userMsService.putMethod(param, {}).subscribe(res => {
        console.log(res);
        setTimeout(() => {
          let body = {
            from: this.agentList.filter((item:any) => item.agentId === this.callReassignForm.controls['agentId'].value)[0].name+'-'+this.agentList.filter((item:any) => item.agentId === this.callReassignForm.controls['agentId'].value)[0].serviceType,
            to: this.smeList.filter((item:any) => item.callerAgentUserId === this.callReassignForm.controls['callerAgentUserIds'].value)[0].name
          }
          this.dialogRef.close({ event: 'close', requestBody: body })
        }, 4000)
        this.toastMsgService.alert('success', 'Calls reassigned successfully.')
      })
    }

  }

  getAllCallerUser() {
    this.loading = true;
    let param = `/call-management/caller-agents`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log('caller users: ', res);
      this.loading = false;
      if (res instanceof Array && res.length > 0) {
        this.smeList = res;
        this.smeList.sort((a:any, b:any) => a.name > b.name ? 1 : -1)
      } else {
        this.smeList = [];
        // this.toastMsgService.alert('error', 'Data no found.')
      }
    }, error => {
      console.log('Error during getting caller users daa: ', error);
      // this.toastMsgService.alert('error', 'Error during getting all caller users data.')
      this.loading = false;
    })
  }
  setValue(e:any) {
    if (e.checked) {
      this.agentsCall = true;
      this.callReassignForm.controls['callerAgentUserId'].setValue(null);
      this.callReassignForm.controls['callerAgentUserId'].updateValueAndValidity();
    } else {
      this.agentsCall = false;
      const userId = this.utilsService.getLoggedInUserID();
      this.callReassignForm.controls['callerAgentUserId'].setValue(userId);
      this.callReassignForm.controls['agentId'].setValue(null);
      this.callReassignForm.controls['agentId'].setValidators(null);
      this.callReassignForm.controls['agentId'].updateValueAndValidity();
    }
  }
}
