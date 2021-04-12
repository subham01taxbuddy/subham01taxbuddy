import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AddSubscriptionComponent } from '../add-subscription/add-subscription.component';

@Component({
  selector: 'app-subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.css']
})
export class SubscriptionDetailComponent implements OnInit {

  loading: boolean;
  searchVal: any;
  selectedUserName: any = '';
  userId: any;
  queryParam: string = "";

  constructor(private _toastMessageService: ToastMessageService, public utilsService: UtilsService, private itrService: ItrMsService, @Inject(LOCALE_ID) private locale: string,
    private userService: UserMsService, private router: Router, private dialog: MatDialog, private activatedRoute: ActivatedRoute) {
    // this.subscriptionListGridOptions = <GridOptions>{
    //   rowData: [],
    //   columnDefs: this.subscriptionColoumnDef(),
    //   enableCellChangeFlash: true,
    //   onGridReady: params => {
    //   },
    //   sortable: true,
    // };
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("99999999999999999:", params)
      if (this.utilsService.isNonEmpty(params['userMobNo']) && params['userMobNo'] !== '-') {
        this.userId = params['userMobNo'];
        this.selectedUserName = this.userId
        this.searchVal = params['userMobNo'];
        this.queryParam = `?userId=${this.userId}`;
        this.advanceSearch();
        // console.log('this.queryParam --> ',this.queryParam)
      }
    });
  }

  advanceSearch() {
    console.log('this.searchVal -> ', this.searchVal)
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      if (this.searchVal.toString().length === 10) {
        this.getUserIdByMobileNum(this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }
    else {
      this.selectedUserName = '';
      this.queryParam = '';
      this.utilsService.sendMessage(this.queryParam);
      this.utilsService.showSnackBar('You are fetching all records.')
    }
  }

  getUserIdByMobileNum(mobileNumber) {
    this.loading = true;
    let param = '/search/userprofile/query?mobileNumber=' + mobileNumber;
    this.userService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Get user id by mobile number responce: ', res);
      if (res && res.records instanceof Array) {
        this.selectedUserName = res.records[0].fName + ' ' + res.records[0].lName;
        this.userId = res.records[0].userId;
        this.queryParam = `?userId=${this.userId}`;
        // if(from === 'anotherPage'){
        //   this.utilsService.sendMessage(this.queryParam)
        // }
         this.utilsService.sendMessage(this.queryParam);
      }
    },
      error => {
        this.loading = false;
        this.selectedUserName = '';
        console.log('Error -> ', error);
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(error.error.status));
      })
  }

  addSubscriptionPlan() {
    let disposable = this.dialog.open(AddSubscriptionComponent, {
      width: '65%',
      height: 'auto',
      data: {
        userId: this.userId
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result && result.data) {
        console.log('Afetr dialog close -> ', result);
        this.router.navigate(['/pages/subscription/sub/' + result.data['subscriptionId']]);
      }
    })
  }
}
