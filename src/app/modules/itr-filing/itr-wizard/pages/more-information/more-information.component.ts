import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';

@Component({
  selector: 'app-more-information',
  templateUrl: './more-information.component.html',
  styleUrls: ['./more-information.component.scss'],
})
export class MoreInformationComponent
  extends WizardNavigation
  implements OnInit
{
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
  show :boolean = false

  constructor(
    private router: Router,
    public utilsService: UtilsService,
    public matDialog: MatDialog
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.show = (this.ITR_JSON.partnerInFirmFlag === 'Y' ? true : false) || (this.Copy_ITR_JSON.partnerInFirmFlag === 'Y' ? true : false)

    this.initList();
  }

  initList() {
    this.showList = true;
    this.topicList = [
      {
        label: 'Schedule Assets & Liability (AL)',
        path: 'schedule-al',
        type: 'scheduleAl',
        showOnUi :true
      },
      {
        label: 'Losses to be carried forward (Schedule CFL)',
        path: 'schedule-cfl',
        type: 'scheduleCfl',
        showOnUi :true
      },
      {
        label:
          'Income From Firms in which you are Partner',
        path: 'partner-in-firms',
        type: 'partner',
        showOnUi :this.show
      },
      //Ashwini: Commented schedule FSI/TR/FA
      // {
      //   label:
      //     'Details of income from outside India and tax relief (Schedule FSI)',
      //   path: 'schedule-fsi',
      //   type: 'scheduleFsi',
      // },
      // {
      //   label:
      //     'Details Summary of tax relief claimed for taxes paid outside India (Schedule TR)',
      //   path: 'schedule-tr',
      //   type: 'scheduleTr',
      // },
      // {
      //   label:
      //     'Details of foreign assets and income from any source outside India (Schedule FA)',
      //   path: 'schedule-fa',
      //   type: 'scheduleFa',
      // },
    ];
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
  }

  gotoSection(topic) {
    this.showList = false;
    let basePath = '/itr-filing/itr/more-info/';
    this.router.navigate([basePath + topic.path], {
      queryParams: { type: topic.type },
    });
    this.nextBreadcrumb.emit(topic.label);
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {}

  subscription: Subscription;

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
