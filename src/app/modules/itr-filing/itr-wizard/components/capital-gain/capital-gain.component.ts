import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { Router } from "@angular/router";


@Component({
  selector: 'app-capital-gain',
  templateUrl: './capital-gain.component.html',
  styleUrls: ['./capital-gain.component.scss']
})
export class CapitalGainComponent implements OnInit {
  step = 4;
  loading = false;
  showList = true;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  @Output() saveAndNext = new EventEmitter<any>();
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
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.topicList = [
      {
        label: 'Land & Building',
        path: 'lab',
        type: 'land'
      },
      {
        label: 'Listed Securities (Equity Shares / Equity Mutual Funds)',
        path: 'listed',
        type: 'listed'
      },
      {
        label: 'Unlisted Securities (Shares not listed)',
        path: 'unlisted',
        type: 'unlisted'
      },
      {
        label: 'Bonds & Debentures',
        path: 'bonds',
        type: 'bonds'
      },
      {
        label: 'Zero Coupon Bonds',
        path: 'bonds',
        type: 'zeroCouponBonds'
      },
      {
        label: 'Any Other Assets (Eg. Gold, Debt, Mutual Funds, Etc)',
        path: 'other',
        type: 'other'
      }
    ];
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
  }

  setStep(index: number) {
    this.step = index;
  }

  addMore(type) {
    // if (type === 'bonds') {
    //   this.isAddBonds = Math.random();
    // } else if (type === 'zeroCouponBonds') {
    //   this.isAddZeroCouponBonds = Math.random();
    // }
  }

  closed(type) {
    if (type === 'land') {
      this.isEditLand = false;
    } else if (type === 'listed') {
      this.isEditListed = false;
    } else if (type === 'unlisted') {
      this.isEditUnlisted = false;
    } else if (type === 'bonds') {
      this.isEditBonds = false;
    } else if (type === 'zeroCouponBonds') {
      this.isEditZeroCouponBonds = false;
    } else if (type === 'otherAssets') {
      this.isEditOtherAssets = false;
    }
  }

  gotoSection(path, type) {
    this.showList = false;
    let basePath = '/itr-filing/itr/capital-gain/';
    this.router.navigate([basePath + path], { queryParams: { bondType: type } });
  }

  editForm(type) {
    if (type === 'land') {
      this.isEditLand = true;
      this.router.navigate(['/itr-filing/itr/capital-gain/lab']);
    } else if (type === 'listed') {
      this.isEditListed = true;
    } else if (type === 'unlisted') {
      this.isEditUnlisted = true;
    } else if (type === 'otherAssets') {
      this.isEditOtherAssets = true;
    }
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {

  }

}
