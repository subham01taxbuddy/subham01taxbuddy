import { Component, OnInit, ViewChild } from '@angular/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payout-adjustment',
  templateUrl: './payout-adjustment.component.html',
  styleUrls: ['./payout-adjustment.component.scss'],
})
export class PayoutAdjustmentComponent implements OnInit {
  loading = false;
  adjustmentDetails: any;
  amtPending = new FormControl('');
  reason = new FormControl('');
  dialogRef: any;
  name: any;
  showAdd = false;
  downloadURL:any;
  showMessage ='';

  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  search() {
    //https://k42t7a34l7qzlxodv3c6hbj5om0cbvac.lambda-url.ap-south-1.on.aws/?userId=10488'
    this.loading = true;
    let userId = this.agentId;

    if (userId) {
      let param = `?userId=${userId}`;
      this.itrMsService.getAdjustmentDetails(param).subscribe(
        (response: any) => {
          this.showAdd =true;
          this.loading = false;
          if (response.success) {
            this.loading = false;
            this.adjustmentDetails = response.data;
            this.name = this.adjustmentDetails?.name;
            console.log('data for adjustment', this.adjustmentDetails);
          } else {
            this.loading = false;
            this.adjustmentDetails = null;
            this.utilsService.showSnackBar(response.message);
          }
        },
        (error) => {
          this.loading = false;
          this.adjustmentDetails = null;
          this.utilsService.showSnackBar(
            'There is some issue while getting partner information.'
          );
        }
      );
    } else {
      this.loading = false;
      this.adjustmentDetails = null;
      this.utilsService.showSnackBar(
        'please select partner/filer name and then search.'
      );
    }
  }

  ownerId: number;
  filerId: number;
  agentId: number;
  partnerName: any;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
      this.partnerName = event ? event.name : null;
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

  addAdjustment(templateRef) {
    if (this.filerId && this.showAdd == true) {
      this.dialogRef = this.dialog.open(templateRef, {
        width: 'auto',
        data: {
          name: this.name,
        },
      });

      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.data === 'added') {
            this.reason.setValue(null);
            this.amtPending.setValue(null);
            this.search();
          }
        }
      });
    } else {
      this.utilsService.showSnackBar(
        'Please select filer name and search to Add Adjustment'
      );
    }
  }

  saveAdjustment(amount, reason) {
    // https://2hifgwy53ui62fbhnucv77mjdq0rcslo.lambda-url.ap-south-1.on.aws/'
    console.log('values from save ', amount, reason);
    let userId = this.agentId;
    this.loading = true;
    const request = {
      userId: userId,
      amtPending: amount,
      reason: reason,
    };

    let param = '';
    this.itrMsService.postAdjustmentDetails(param, request).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          this.loading = false;
          console.log('response', response['data']);
          this.utilsService.showSnackBar(response.message);
        } else {
          this.loading = false;
          this.utilsService.showSnackBar(
            'There is some issue to Add Adjustment'
          );
        }
        setTimeout(() => {
          this.dialogRef.close({ event: 'close', data: 'added' });
        }, 2000);
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'There is some issue to Add Adjustment.'
        );
      }
    );
  }

  calculateTotal(): number {
    let total = 0;
    if (this.adjustmentDetails?.adjustmentHistory) {
      for (const item of this.adjustmentDetails?.adjustmentHistory) {
        total += item.commisionAdjusted;
      }
      return total;
    }
  }
  calculateAdditionTotal(): number {
    let total = 0;
    for (const item of this.adjustmentDetails?.adjustmentAdditions) {
      total += item.adjustmentadditionAmount;
    }
    return total;
  }

  generateFile(){
    //https://oejtteophnvpnunmyzoioyksgi0kixmh.lambda-url.ap-south-1.on.aws/'
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Generate CSV!!!!!',
        message: 'Please Ensure you process this in razorpay after CSV is generated as system will not allow to create CSV again',
      },
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        this.showMessage ='CSV Generation Started - Please Do Not Close the Screen or Move out'
        this.loading = true;
        let param = ``;
        this.itrMsService.getAdjustmentCSV(param).subscribe((response: any) => {
          if (response.success) {
            this.loading = false;
            console.log('response', response['data']);
            this.showMessage =''
            this.utilsService.showSnackBar(response.message);
            this.downloadURL = response?.downloadUrl
            window.open(this.downloadURL, '_blank');

          } else {
            this.loading = false;
            this.showMessage =''
            this.utilsService.showSnackBar(response.message);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage =''
          this.utilsService.showSnackBar('Error in download/generate CSV ');
        });
      }
    });
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.filerId = null;
    this.ownerId = null;
    this?.smeDropDown?.resetDropdown();
    this.adjustmentDetails = null;
    this.reason.setValue(null);
    this.amtPending.setValue(null);
    this.showAdd = false;
  }
}
