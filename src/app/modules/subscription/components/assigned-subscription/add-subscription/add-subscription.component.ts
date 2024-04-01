import { filter } from 'rxjs/operators';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmModel } from '../assigned-subscription.component';
import { ReportService } from 'src/app/services/report-service';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MyDialogComponent } from 'src/app/modules/shared/components/my-dialog/my-dialog.component';
declare function we_track(key: string, value: any);
@Component({
  selector: 'app-add-subscription',
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.scss']
})
export class AddSubscriptionComponent implements OnInit {
  allSubscriptions: any;
  service = '';
  disableItrSubPlan: boolean = false;
  serviceDetails: any;
  loading!: boolean;
  loggedInSme: any;
  allPlans: any = [];
  filteredPlans: any = [];
  selectedBtn: any = '';
  servicesType: any = [{ value: 'ITR' }, { value: 'ITR-U' }, { value: 'NOTICE' }, { value: 'GST' }, { value: 'TPA' }, { value: 'ALL' }];
  subscriptionPlan = new UntypedFormControl('', Validators.required);
  selectedPlanInfo: any;
  serviceTypeSelected: boolean;
  roles: any;
  isAllowed: boolean = true;
  smeDetails: any
  serviceEligibility: any;
  itrUServiceEligibility:any;
  showMessage = '';
  partnerType: any;
  searchAsPrinciple: boolean = false;
  cancelSubscriptionData: any;
  onlyServiceITR: boolean = false;
  tpaService: any;
  tpaServiceDetails: any;
  constructor(
    public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
    private router: Router,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private itrService: ItrMsService, private utilService: UtilsService,
    private toastMessage: ToastMessageService, private reportService: ReportService,
  ) {
    this.getAllPlanInfo();
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('data -> ', this.data)
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType;
    if (this.roles.includes('ROLE_FILER')) {
      this.isAllowed = false;
      this.getSmeDetail();
    } else if (this.data.filerId) {
      this.getSmeDetail();
    }
    if (this.data.mobileNo) {
      this.getUserInfoByMobileNum(this.data.mobileNo);
    } else {
      this.getUserInfoByMobileNum('', this.data.userId);
    }

  }

  getSmeDetail() {
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000'
    let loggedInSmeUserId = this.loggedInSme[0]?.userId;
    let userId;
    if (this.data.filerId) {
      userId = this.data.filerId
    } else {
      userId = loggedInSmeUserId;
    }
    let param = `/bo/sme-details-new/${userId}`
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.smeDetails = response.data[0];
        console.log('new sme', this.smeDetails);
        this.serviceEligibility = this.smeDetails.serviceEligibility_ITR;
        this.itrUServiceEligibility = this.smeDetails.serviceEligibility_ITR
        if (this.data.filerId) {
          this.showMessage = 'Filer is not eligible for the disabled plans. Please give plan capability and then try or reassign the user.'
        } else {
          this.showMessage = 'Disabled plans are not available in your eligibility please contact with your leader'
        }
      }
    })
  }

  isPlanEnabled(plan: any): boolean {
    if (this.roles.includes('ROLE_FILER') || (this.data.filerId && (plan.servicesType === 'ITR' || plan.servicesType ==='ITRU'))) {
      if (this.smeDetails?.skillSetPlanIdList) {
        const planId = plan.planId;
        this.onlyServiceITR = true;
        return this.smeDetails?.skillSetPlanIdList.includes(planId);
      }
      return false;
    } else {
      this.onlyServiceITR = false;
      return true;
    }
  }

  getAllPlanInfo() {
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe((plans: any) => {
      console.log('Plans -> ', plans);
      this.allPlans = [];

      this.allPlans = plans;
      console.log('all plans -> ', this.allPlans, this.allPlans.length)
      this.allPlans = this.allPlans.filter(item => item.isActive === true);
      console.log('appPlans --> ', this.allPlans);
      // }
    },
      error => {
        console.log('Error during getting all plans: ', error)
      })
  }

  selectPlan(plan) {
    this.selectedPlanInfo = plan;
    console.log('selectedPlanInfo -> ', this.selectedPlanInfo);
  }

  getUserInfoByMobileNum(number, userId?) {
    // https://dev-api.taxbuddy.com/report/bo/subscription-dashboard-new?page=0&pageSize=20
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId
    let filter = '';
    if (number) {
      filter = '&mobileNumber=' + number
    } else {
      filter = '&userId=' + userId
    }
    let userFilter = ''
    if (this.roles.includes('ROLE_LEADER')) {
      userFilter += `&leaderUserId=${loggedInSmeUserId}`;

    }
    if (this.roles.includes('ROLE_FILER') && this.partnerType != "PRINCIPAL") {
      userFilter += `&filerUserId=${loggedInSmeUserId}`;
    }

    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL") {
      userFilter += `&searchAsPrincipal=true&filerUserId=${loggedInSmeUserId}`;
    }
    
    this.loading = true;
    this.reportService.getMethod('/bo/future-year-subscription-exists?mobileNumber='+number).subscribe((response: any) => {
      this.disableItrSubPlan = response.data.itrSubscriptionExists;
      this.loading = false;
    });

    this.loading = true;
    let futureParam
    if (this.roles.includes('ROLE_FILER')) {
      futureParam = `/bo/future-year-subscription-exists?userId=${userId}`
    }else{
      futureParam = `/bo/future-year-subscription-exists?mobileNumber=${number}`
    }
    this.reportService.getMethod(futureParam).subscribe((response: any) => {
      this.disableItrSubPlan = response.data.itrSubscriptionExists;
      this.loading = false;
    });

    this.loading = true;
    let param = `/bo/subscription-dashboard-new?page=0&pageSize=20&assessmentYear=${this.data.assessmentYear}${userFilter}${filter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.allSubscriptions = response.data.content
      if (this.allSubscriptions && this.allSubscriptions.length) {
        let smeSelectedPlan = [];
        smeSelectedPlan = [...smeSelectedPlan, ... this.allSubscriptions?.map((item: any) => item?.smeSelectedPlan).filter(data => {
          if (data) return data;
        })];
        smeSelectedPlan = [...smeSelectedPlan, ...this.allSubscriptions?.map((item: any) => item?.userSelectedPlan).filter(data => {
          if (data) return data;
        })];
        if (smeSelectedPlan.length) {
          let itrPlanDetails = smeSelectedPlan.filter(element => element.servicesType === 'ITR')
          this.disableItrSubPlan = itrPlanDetails.length > 0;
          this.service = itrPlanDetails[0]?.servicesType;
          this.serviceDetails = itrPlanDetails[0]?.name;
          let TpaPlanDetails = smeSelectedPlan.filter(element => element.servicesType === 'TPA')
          this.tpaService = TpaPlanDetails[0]?.servicesType;
          this.tpaServiceDetails = TpaPlanDetails[0]?.name;
        }
      }
    })
  }

  // disable(){
  //   if(this.serviceDetails.includes('Schedule call')){
  //     this.allPlans.filter((item: any) => item.servicesType === 'OTHER')
  //   //  return disable(plan.name === 'Schedule call')
  //   }
  // }

  createSubscription() {
    if (this.utilService.isNonEmpty(this.selectedPlanInfo)) {
      let param1
      if (this.roles.includes('ROLE_FILER')) {
        param1 = '/bo/subscription/coupon-code-exists?userId='+this.data.userId+'&serviceType='+this.selectedPlanInfo.servicesType+'&planId='+this.selectedPlanInfo.planId;
      }else{
        param1 = '/bo/subscription/coupon-code-exists?mobileNumber='+this.data.mobileNo+'&serviceType='+this.selectedPlanInfo.servicesType+'&planId='+this.selectedPlanInfo.planId;
      }

      this.loading = true;
      this.reportService.getMethod(param1).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.success) {
            if (response?.data?.couponCodeExists) {
                let dialogRef;
                dialogRef = this.dialog.open(MyDialogComponent, {
                  data: {
                    title: 'Confirmation',
                    message: 'This user has an ITR subscription in coupon codes. if you want to use the subscription please go to Subscription Adjustment Tab and revert the coupon code.',
                    buttonValue: 'OK',
                    buttonName: 'Ok'
                  },
                });
                dialogRef.afterClosed().subscribe(() => {
                    this.dialogRef.close();
                    this.router.navigate(['subscription/assigned-subscription']);
                });
            } else {
              if (this.selectedPlanInfo.servicesType === 'ITR') {
                // https://dev-api.taxbuddy.com/report/bo/subscription/cancel/requests?page=0&pageSize=5&mobileNumber=1348972580
                const loggedInSmeUserId = this?.loggedInSme[0]?.userId
                let userFilter = ''
                if (this.roles.includes('ROLE_LEADER')) {
                  userFilter += `&leaderUserId=${loggedInSmeUserId}`;

                }
                if (this.roles.includes('ROLE_FILER') && this.partnerType != "PRINCIPAL") {
                  userFilter += `&filerUserId=${loggedInSmeUserId}`;
                }

                if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL") {
                  userFilter += `&searchAsPrincipal=true&filerUserId=${loggedInSmeUserId}`;
                }

                let param
                if (this.roles.includes('ROLE_FILER')){
                  param = `/bo/subscription/cancel/requests?page=0&pageSize=5&serviceType=ITR&userId=${this.data.userId}${userFilter}`
                }else{
                  param = `/bo/subscription/cancel/requests?page=0&pageSize=5&serviceType=ITR&mobileNumber=${this.data.mobileNo}${userFilter}`
                }

                this.loading = true;
                this.reportService.getMethod(param).subscribe(
                  (response: any) => {
                    this.loading = false;
                    if (response.success) {
                      if (response?.data?.content instanceof Array && response?.data?.content?.length > 0) {
                        this.cancelSubscriptionData = response.data.content[0];
                        if (this.cancelSubscriptionData?.cancellationStatus === 'PENDING') {
                          let dialogRef;
                          dialogRef = this.dialog.open(ConfirmDialogComponent, {
                            data: {
                              title: 'Confirmation',
                              message: 'This user has an ITR subscription in deletion process pending approval from leader. Creating another subscription for ITR service will RECOVER the earlier subscription and remove it from leaders  deletion approval process. Do you want to continue?',
                            },
                          }); dialogRef.afterClosed().subscribe(result => {
                            if (result === 'YES') {
                              this.removeCancelSubscription();
                            } else {
                              this.dialogRef.close();
                              this.router.navigate(['subscription/assigned-subscription']);
                            }
                          });
                        } else {
                          this.updateSubscription();
                        }
                      } else {
                        this.updateSubscription();
                        if (response.message !== null) { this._toastMessageService.alert('error', response.message); }
                        // else { this._toastMessageService.alert('error', 'No Data Found'); }
                      }
                    } else {
                      this._toastMessageService.alert("error", response.message);
                    }
                  },
                  (error) => {
                    this.loading = false;
                    this._toastMessageService.alert("error", "Error while fetching subscription cancellation requests: Not_found: data not found");
                  }
                );

              } else {
                this.updateSubscription();
              }
            }
          }
        }
      );
    } else {
      this.loading = false
      this.toastMessage.alert("error", "Select Plan.")
    }
  }

  updateSubscription() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          return;
        } else {
          this.loading = true;
          let param = '/subscription/recalculate';
          let reqBody = {
            userId: this.data.userId,
            planId: this.selectedPlanInfo.planId,
            selectedBy: 'SME',
            smeUserId: this?.loggedInSme[0]?.userId,
          };
          this.itrService.postMethod(param, reqBody).subscribe(
            (res: any) => {
              this.loading = false;
              we_track('Create Subscription', {
                'User Number': this.data.mobileNo,
                Service:
                  this.selectedPlanInfo?.servicesType +
                  ' : ' +
                  this.selectedPlanInfo?.name,
              });
              this.dialogRef.close({ event: 'close', data: res });
              this.toastMessage.alert(
                'success',
                'Subscription created successfully.'
              );
              // this.toastMessage.alert(
              //   'success',
              //   'Subscription created successfully.'
              // );
              let subInfo = this.selectedBtn + ' userId: ' + this.data.userId;
            },
            (error) => {
              this.loading = false;
              this.toastMessage.alert(
                'error',
                this.utilService.showErrorMsg(error.error.status)
              );
              this.dialogRef.close({ event: 'close', data: res });
            }
          );
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
          this.dialogRef.close();
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );

  }

  removeCancelSubscription() {
    // https://dev-api.taxbuddy.com/itr/subscription/cancellation?subscriptionId=2427
    const param = '/subscription/cancellation?subscriptionId=' + this.cancelSubscriptionData?.subscriptionId
    this.loading = true;
    this.itrMsService.patchMethod(param, '').subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        this.updateSubscription();
        this.utilsService.showSnackBar(result.message)
      } else {
        this.utilsService.showSnackBar(result.message)
      }
    }, err => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to delete previous subscription.')
    });
  }

  showSelectedServicePlans(serviceType) {
    this.serviceTypeSelected = true;
    console.log('allPlans : ', this.allPlans)
    this.selectedBtn = serviceType;
    if (serviceType === 'ITR') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'ITR');
    }
    else if (serviceType === 'ITRU') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'ITRU');
    }
    else if (serviceType === 'GST') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'GST');
    }
    else if (serviceType === 'TPA') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'TPA');
    }
    else if (serviceType === 'NOTICE') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'NOTICE');
    }
    else if (serviceType === 'OTHER') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'OTHER');
    }
    else if (serviceType === 'ALL') {
      this.filteredPlans = this.allPlans;
    }

    console.log('LAST filteredPlans : ', this.filteredPlans)
  }

  close() {
    this.dialogRef.close();
  }
}
