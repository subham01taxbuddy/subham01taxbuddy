import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';


@Component({
  selector: 'app-capital-gain',
  templateUrl: './capital-gain.component.html',
  styleUrls: ['./capital-gain.component.scss']
})
export class CapitalGainComponent implements OnInit {
  step = 4;
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  @Output() saveAndNext = new EventEmitter<any>();
  isEditLand: boolean;
  isEditListed: boolean;
  isEditUnlisted: boolean;
  isEditBonds: boolean;
  isEditZeroCouponBonds: boolean;
  isEditOtherAssets: boolean;
  isAddBonds: number;
  isAddZeroCouponBonds: number;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
  }

  setStep(index: number) {
    this.step = index;
  }

  addMore(type) {
    if (type === 'bonds') {
      this.isAddBonds = Math.random();
    } else if (type === 'zeroCouponBonds') {
      this.isAddZeroCouponBonds = Math.random();
    }
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

  editForm(type) {
    if (type === 'land') {
      this.isEditLand = true;
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
