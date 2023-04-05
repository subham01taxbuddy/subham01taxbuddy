import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';

@Component({
  selector: 'app-more-information',
  templateUrl: './more-information.component.html',
  styleUrls: ['./more-information.component.scss']
})
export class MoreInformationComponent extends WizardNavigation implements OnInit {
  loading = false;
  showList = true;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  isEditLand: boolean;
  isEditListed: boolean;
  isEditUnlisted: boolean;
  isEditBonds: boolean;
  isEditZeroCouponBonds: boolean;
  isEditOtherAssets: boolean;
  topicList = [];

  constructor(
    private router: Router,
    public utilsService: UtilsService,
    public matDialog: MatDialog) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.initList();
  }

  initList() {
    this.showList = true;
    this.topicList = [
      {
        label: 'Schedule Assets & Liability (AL)',
        path: 'schedule-al',
        type: 'scheduleAl'
      },
      {
        label: 'Losses to be carried forward (Schedule CFL)',
        path: 'schedule-cfl',
        type: 'scheduleCfl'
      },
    ];
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
  }

  gotoSection(topic) {
    this.showList = false;
    let basePath = '/itr-filing/itr/more-info/';
    this.router.navigate([basePath + topic.path], { queryParams: { type: topic.type } });
    this.nextBreadcrumb.emit(topic.label);
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {

  }

  subscription: Subscription

  subscribeToEmitter(componentRef) {
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
      this.showList = true;
      this.initList();
      this.nextBreadcrumb.emit(null);
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
