import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-fy-drop-down',
  templateUrl: './fy-drop-down.component.html',
  styleUrls: ['./fy-drop-down.component.scss']
})
export class FyDropDownComponent implements OnInit {
  @Output() sendFy = new EventEmitter<any>();
  @Input() serviceType;

  financialYear = [];
  selectedFyYear = new FormControl('', Validators.required);
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService) { }

  ngOnInit() {
    console.log(this.serviceType);
    if (this.serviceType === 'GST') {
      this.financialYear = AppConstants.gstFyList;
      this.selectedFyYear.setValue(this.financialYear[0].financialYear);
      this.sendFy.emit(this.selectedFyYear.value);
      return;
    }
    this.setFyDropDown();
  }

  setFyDropDown() {
    const fyList = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
    console.log('fyList', fyList);
    if (this.utilsService.isNonEmpty(fyList) && fyList instanceof Array) {
      this.financialYear = fyList;
      const currentFy = this.financialYear.filter(item => item.isFilingActive);
      this.selectedFyYear.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
      this.sendFy.emit(this.selectedFyYear.value);
    } else {
      const param = `${ApiEndpoints.itrMs.filingDates}`;
      this.itrMsService.getMethod(param).subscribe((res: any) => {
        if (res && res.success && res.data instanceof Array) {
          sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
          this.financialYear = res.data;
          const currentFy = this.financialYear.filter(item => item.isFilingActive);
          this.selectedFyYear.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
          this.sendFy.emit(this.selectedFyYear.value);
        }
      }, error => {
        console.log('Error during getting all PromoCodes: ', error)
      })
    }
  }

  changeFy(fy: String) {
    this.sendFy.emit(this.selectedFyYear.value);
  }
}
