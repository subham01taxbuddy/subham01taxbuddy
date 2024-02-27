import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ReAssignDialogComponent } from '../re-assign-dialog/re-assign-dialog.component';
declare function we_track(key: string, value: any);
import { ReviseReturnDialogComponent } from "../../../itr-filing/revise-return-dialog/revise-return-dialog.component";
import {
  UpdateManualFilingDialogComponent
} from "../../../shared/components/update-manual-filing-dialog/update-manual-filing-dialog.component";
import {
  UpdateNoJsonFilingDialogComponent
} from "../../../shared/components/update-no-json-filing-dialog/update-no-json-filing-dialog.component";
import { UpdateItrUFillingDialogComponent } from 'src/app/modules/shared/components/update-ItrU-filling-dialog/update-ItrU-filling-dialog.component';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';

@Component({
  selector: 'app-more-options-dialog',
  templateUrl: './more-options-dialog.component.html',
  styleUrls: ['./more-options-dialog.component.scss'],
})
export class MoreOptionsDialogComponent implements OnInit {
  showDetails = '';
  services = ['ITR', 'ITRU', 'TPA', 'NOTICE', 'GST'];
  selectedService = '';
  optedServicesData = [];
  loading = false;
  myItrsGridOptions: GridOptions;
  initialData = {};
  statusList = [];
  // isDisable = true;
  loggedInUserRoles: any;
  showInvoiceButton: boolean;
  navigateToInvoice: boolean
  partnerType: any;

  constructor(
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MoreOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
  ) {
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createRowData([]),
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
      floatingFilter: true,
    };
  }

  ngOnInit() {
    // this.getStatus();
    this.partnerType = this.utilsService.getPartnerType();
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.log('data from assigned users', this.data);
    this.checkSubscriptionForInvoice();
  }

  checkSubscriptionForInvoice() {
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.loading = true;
    //https://dev-api.taxbuddy.com/report/subscription-dashboard-new/3000?userId=8369&serviceType=TPA'
    let param = '/subscription-dashboard-new/' + loggedInSmeUserId + '?userId=' + this.data?.userId + '&serviceType=' + this.data.serviceType;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.showInvoiceButton = true;
        if (response?.data[0]?.invoiceDetail[0]?.paymentStatus === "Paid") {
          this.navigateToInvoice = true;
        } else {
          this.navigateToInvoice = false;
        }

      } else {
        this.showInvoiceButton = false;
      }
    });
  }

  isApplicable(permissionRoles: any) {
    return this.roleBaseAuthGuardService.checkHasPermission(
      this.loggedInUserRoles,
      permissionRoles
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // getStatus() {
  //   const param = `/user-status?userId=` + this.data.userId + `&currentStatus=OPEN`;
  //   this.userMsService.getMethod(param).subscribe((res: any) => {
  //     if (res.success) {
  //       this.isDisable = false;
  //     } else {
  //       this.isDisable = true;
  //     }
  //   }, error => {
  //     this.utilsService.showSnackBar(error.message);
  //   })
  // }

  deleteUser() {
    // this.isDisable = true;
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        const param =
        `/user/account/delete/` + this.data.mobileNumber + `?reason=Test`;
      this.userMsService.deleteMethod(param).subscribe(
        (res: any) => {
          if (res.success) {
            this.utilsService.showSnackBar(`User deleted successfully!`);
            // this.isDisable = true;
            this.dialogRef.close(true);
            we_track('Delete User', {
              'User Number': this.data?.mobileNumber,
            });
          } else {
            this.utilsService.showSnackBar(res.message);
            // this.isDisable = false;
          }
        },
        (error) => {
          // this.isDisable = false;
          this.utilsService.showSnackBar(error.message);
        }
      );
      }
    },error => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });

  }

  goToInvoice() {
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      if (this.navigateToInvoice) {
        this.router.navigate(['/subscription/tax-invoice'], {
          queryParams: { name: this.data.name },
        });
      } else {
        this.router.navigate(['/subscription/proforma-invoice'], {
          queryParams: { name: this.data.name },
        });
      }
    } else {
      if (this.navigateToInvoice) {
        this.router.navigate(['/subscription/tax-invoice'], {
          queryParams: { mobile: this.data.mobileNumber },
        });
      } else {
        this.router.navigate(['/subscription/proforma-invoice'], {
          queryParams: { mobile: this.data.mobileNumber },
        });
      }
    }

    this.dialogRef.close();
  }

  goToSubscription() {
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      this.router.navigate(['/subscription/assigned-subscription'], {
        queryParams: {
          userId: this.data.userId,
        },
      });
    } else {
      this.router.navigate(['/subscription/assigned-subscription'], {
        queryParams: {
          userMobNo: this.data.mobileNumber,
          userId: this.data.userId,
        },
      });
    }
    // ([`${link.split('?')[0]}`, { queryParams: {id: 37, username: 'jimmy'}}]);
    this.dialogRef.close();
  }
  goToCloud() {
    console.log('data to send to doc', this.data);
    // const url=`https://uat-api.taxbuddy.com/itr-filing/docs/user-docs/${this.data.userId}`
    // window.open(url,'_blank');
    const url = this.router
      .createUrlTree(['itr-filing/docs/user-docs/'], {
        queryParams: {
          userId: this.data.userId,
          serviceType: this.data.serviceType,
          // mobileNumber: this.data.mobileNumber
        },
      })
      .toString();
    window.open(url, '_blank');
    // this.router.navigate(['itr-filing/docs/user-docs/' + this.data.userId]);
    // this.dialogRef.close();
  }

  goToProfile() {
    this.router.navigate([`pages/user-management/profile/` + this.data.userId], { queryParams: { 'serviceType': this.data.serviceType, }, queryParamsHandling: 'merge' });
    this.dialogRef.close();
  }

  optedServices() {
    this.loading = false;
    this.showDetails = 'OPT_SERVICE';
    //https://uat-api.taxbuddy.com/user/customer?userId=10156
    const param = `/customer?userId=${this.data.userId}`;
    this.userMsService.getMethod(param).subscribe(
      (res: any) => {
        console.log(res);
        if (res.success) {
          this.optedServicesData = res.data;
        } else {
          this.utilsService.showSnackBar('Failed to fetch opted service data');
        }
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }
  isDisabled(service) {
    return this.optedServicesData.filter((item) => item.serviceType === service)
      .length > 0
      ? true
      : false;
  }

  optService() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        if (this.utilsService.isNonEmpty(this.selectedService)) {
          this.loading = true;
          const param = `/leader-assignment?userId=${this.data.userId}&serviceType=${this.selectedService}`;
          this.userMsService.getMethod(param).subscribe(
            (res: any) => {
              this.optedServices();
              if (res.success) {
                this.utilsService.showSnackBar(
                  'Successfully opted the service type ' + this.selectedService
                );
                we_track('Other Service', {
                  'User Name': this.data?.name,
                  'User Number': this.data?.mobileNumber,
                  'Opt for which service ': this.selectedService,
                });
              } else {
                this.utilsService.showSnackBar(res.message);
              }
            },
            () => {
              this.loading = false;
            }
          );
        }
      }
    },error => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });


  }

  giveInsurance() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        this.loading = true;
        const param = `/user-reward/insurance/purchase?userId=${this.data.userId}&source=BACKOFFICE`;
        this.itrMsService.postMethod(param, {}).subscribe(
          (res: any) => {
            console.log(res);
            this.loading = false;
            if (!res.success) {
              this.utilsService.showSnackBar(res.message);
              return;
            }
            this.utilsService.showSnackBar('Insurance given successfully');
          },
          () => {
            this.loading = false;
            this.utilsService.showSnackBar(
              'Failed to give insurance, please try again'
            );
          }
        );
      }
    },error => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

  checkSubscription(action: string) {
    let itrSubscriptionFound = false;
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.loading = true;
    let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + this.data?.mobileNumber;
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.data instanceof Array && response.data.length > 0) {
        console.log(response);
        response.data.forEach((item: any) => {
          let smeSelectedPlan = item?.smeSelectedPlan;
          let userSelectedPlan = item?.userSelectedPlan;
          if (smeSelectedPlan && (smeSelectedPlan.servicesType === 'ITR' || smeSelectedPlan.servicesType === 'ITRU')) {
            itrSubscriptionFound = true;
            return;
          } else if (userSelectedPlan && (userSelectedPlan.servicesType === 'ITR' || userSelectedPlan.servicesType === 'ITRU')) {
            itrSubscriptionFound = true;
            return;
          }
        });
        if (itrSubscriptionFound) {
          this.checkFilerAssignment(action);
        } else {
          this.utilsService.showSnackBar('Please make sure the subscription is created for user.');
        }
      } else {
        this.utilsService.showSnackBar('Please make sure the subscription is created for user.');
      }
    });
  }

  checkFilerAssignment(action) {
    // https://uat-api.taxbuddy.com/user/check-filer-assignment?userId=16387&assessmentYear=2023-2024&serviceType=ITR
    let hasFilerAssignment = false;
    let serviceType = '';
    if (this.data.serviceType === 'ITRU') {
      serviceType = `&serviceType=ITRU`
    }
    let param = `/check-filer-assignment?userId=${this.data.userId}${serviceType}`
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (response.data.filerAssignmentStatus === 'FILER_ASSIGNED') {
          hasFilerAssignment = true;
          if (hasFilerAssignment) {
            switch (action) {
              case 'add-client':
                this.addClient();
                break;
              case 'update-filing':
                this.updateFilingNoJson();
                break;
              case 'itr-u-update':
                this.itruUpdate();
                break;
            }
          }
        } else {
          this.utilsService.showSnackBar('Please make sure that filer assignment should be done before ITR filing.');
        }
      } else {
        this.utilsService.showSnackBar('Please make sure that filer assignment should be done before ITR filing.');
      }
    }, (error) => {
      this.loading = false;
      this.utilsService.showSnackBar('Please make sure that filer assignment should be done before ITR filing.');
    })

  }

  itruUpdate() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        let disposable = this.dialog.open(UpdateItrUFillingDialogComponent, {
          width: '60%',
          height: 'auto',
          data: this.data,
        });

        disposable.afterClosed().subscribe((result) => {
          if (result) {
            this.dialogRef.close({ event: 'close', data: 'success' });
          }
        });
      }
    },error => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

  addClient() {
    this.dialogRef.close();
    if (this.data.itrObjectStatus !== 'ITR_FILED') {
      this.navigateAddClientFlow();
    } else {
      //show the dialog for revised return and on confirmation start flow for revised
      this.openReviseReturnDialog(this.data);
    }
  }

  openReviseReturnDialog(data) {
    console.log('Data for revise return ', data);
    let disposable = this.dialog.open(ReviseReturnDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      if (result === 'reviseReturn') {
        this.navigateAddClientFlow();
      }
      console.log('The dialog was closed', result);
    });
  }

  getUserJourney() {
    const params = `/status-info/${this.data.mobileNumber}`;
    this.userMsService.getMethod(params).subscribe(
      (res: any) => {
        console.log(res);
        this.showDetails = 'JOURNEY';
        this.initialData = res.data.initialData;
        this.statusList = res.data.statusList;
        this.myItrsGridOptions.api?.setRowData(
          this.createRowData(res.data.statusList)
        );
        console.log(this.initialData);
        we_track('ITR Status Journey', {
          'User Number': this.data?.mobileNumber,
        });
      },
      () => { }
    );
  }

  reAssignUser() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          return;
        } else {
          let disposable = this.dialog.open(ReAssignDialogComponent, {
            width: '50%',
            height: 'auto',
            data: {
              userId: this.data.userId,
              clientName: this.data.name,
              serviceType: this.data.serviceType,
              ownerName: this.data.ownerName,
              filerName: this.data.filerName,
              filerUserId: this.data.filerUserId,
              userInfo: this.data
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('result of reassign user ', result);
            if (result?.data === 'success') {
              return this.dialogRef.close({ event: 'close', data: 'success' });
            }
          });
        }
      },(error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
        }
      );
  }

  createRowData(data) {
    return data;
  }

  columnDef() {
    return [
      {
        headerName: 'Service Type',
        field: 'serviceType',
        sortable: true,
        width: 100,
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Status Name',
        field: 'statusName',
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Assessment Year',
        field: 'assessmentYear',
        width: 100,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Date',
        field: 'createdDate',
        sortable: true,
        width: 100,
        valueFormatter: (data) =>
          data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
    ];
  }

  private navigateAddClientFlow() {
    const reqParam = `/profile-data?filedNames=panNumber,dateOfBirth&userId=${this.data.userId}`;
    this.userMsService.getMethod(reqParam).subscribe((res: any) => {
      const addClientData = {
        userId: this.data.userId,
        panNumber: this.data.panNumber
          ? this.data.panNumber
          : res.data.panNumber,
        eriClientValidUpto: this.data.eriClientValidUpto,
        callerAgentUserId: this.data.callerAgentUserId,
        assessmentYear: this.data.assessmentYear,
        name: this.data.name,
        dateOfBirth: res.data.dateOfBirth,
        mobileNumber: this.data.mobileNumber,
        itrId: this.data.itrId,
        itrObjectStatus: this.data.itrObjectStatus,
        openItrId: this.data.openItrId
      };

      // Store stateData in session storage
      sessionStorage.setItem('addClientData', JSON.stringify(addClientData));

      console.log('Result DOB:', res);

      this.router.navigate(['/eri'], {
        state: {
          userId: this.data.userId,
          panNumber: this.data.panNumber
            ? this.data.panNumber
            : res.data.panNumber,
          eriClientValidUpto: this.data.eriClientValidUpto,
          callerAgentUserId: this.data.callerAgentUserId,
          assessmentYear: this.data.assessmentYear,
          name: this.data.name,
          dateOfBirth: res.data.dateOfBirth,
          mobileNumber: this.data.mobileNumber,
        },
      });
    });
  }

  updateFilingNoJson() {
    const param = `/subscription-payment-status?userId=${this.data.userId}&serviceType=ITR`;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
          if (this.data.statusId != 11) {
            let disposable = this.dialog.open(UpdateNoJsonFilingDialogComponent, {
              width: '50%',
              height: 'auto',
              data: this.data,
            });

            disposable.afterClosed().subscribe((result) => {
            });
          } else {
            this.utilsService.showSnackBar(
              'Please complete e-verification before starting with revised return'
            );
          }

        } else if (res?.data?.itrInvoicepaymentStatus === 'SubscriptionDeletionPending') {
          this.utilsService.showSnackBar(
            'ITR Subscription is deleted which is pending for Approval / Reject, please ask Leader to reject so that we can proceed further'
          );
        } else {
          this.utilsService.showSnackBar(
            'Please make sure that the payment has been made by the user to proceed ahead'
          );
        }
      },
      (error) => {
        this.utilsService.showSnackBar(error);
      }
    );
  }

  linkToFinbingo() {
    this.utilsService.getUserCurrentStatus(this.data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        return;
      } else {
        const userId = this.data.userId;
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userMsService.postMethod(param, request).subscribe((res: any) => {
      console.log('Link To Finbingo Response: ', res);
      this.loading = false;
      if (res.success) {
        if (res.data.isFnbVirtualUser) {
          this.utilsService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utilsService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utilsService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
        this.dialogRef.close({ event: 'close', data: 'success' });
      } else {
        this.utilsService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('There is some problem while linking user to Finbingo')
    })
      }
    },error => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });

  }
}
