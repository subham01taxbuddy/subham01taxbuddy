import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

@Component({
  selector: 'app-more-options-dialog',
  templateUrl: './more-options-dialog.component.html',
  styleUrls: ['./more-options-dialog.component.scss'],
})
export class MoreOptionsDialogComponent implements OnInit {
  showDetails = '';
  services = ['ITR', 'TPA', 'NOTICE', 'GST'];
  selectedService = '';
  optedServicesData = [];
  loading = false;
  myItrsGridOptions: GridOptions;
  initialData = {};
  statusList = [];
  // isDisable = true;
  loggedInUserRoles: any;

  constructor(
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    public dialogRef: MatDialogRef<MoreOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createRowData([]),
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},
      sortable: true,
      filter: true,
      floatingFilter: true,
    };
  }

  ngOnInit() {
    // this.getStatus();
    this.loggedInUserRoles = this.utilsService.getUserRoles();

  }

  isApplicable(permissionRoles: any) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, permissionRoles);
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
    const param =
      `/user/account/delete/` + this.data.mobileNumber + `?reason=Test`;
    this.userMsService.deleteMethod(param).subscribe(
      (res: any) => {
        if (res.success) {
          this.utilsService.showSnackBar(`User deleted successfully!`);
          // this.isDisable = true;
          this.dialogRef.close(true);
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

  goToInvoice() {
    this.router.navigate(['/subscription/performa-invoice'], {
      queryParams: { userId: this.data.userId },
    });
    this.dialogRef.close();
  }

  goToSubscription() {
    this.router.navigate(['/subscription/assigned-subscription'], {
      queryParams: { userMobNo: this.data.mobileNumber },
    });
    this.dialogRef.close();
  }
  goToCloud() {
    this.router.navigate(['/pages/itr-filing/user-docs/' + this.data.userId]);
    this.dialogRef.close();
  }
  goToProfile() {
    this.router.navigate(['pages/user-management/profile/' + this.data.userId]);
    this.dialogRef.close();
  }

  optedServices() {
    this.loading = false;
    this.showDetails = 'OPT_SERVICE';
    const param = `/sme/assignee-details?userId=${this.data.userId}`;
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
    if (this.utilsService.isNonEmpty(this.selectedService)) {
      this.loading = true;
      const param = `/sme/agent-assignment?userId=${this.data.userId}&assessmentYear=2022-2023&serviceType=${this.selectedService}`;
      this.userMsService.getMethod(param).subscribe(
        (res) => {
          this.optedServices();
          this.utilsService.showSnackBar(
            'Successfully opted the service type ' + this.selectedService
          );
        },
        () => {
          this.loading = false;
        }
      );
    }
  }

  giveInsurance() {
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
      },
      () => {}
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
}
