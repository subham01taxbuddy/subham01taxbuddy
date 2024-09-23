import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from '../../constants';

@Component({
  selector: 'app-fy-drop-down',
  templateUrl: './fy-drop-down.component.html',
  styleUrls: ['./fy-drop-down.component.scss']
})
export class FyDropDownComponent implements OnInit {
  @Output() sendFy = new EventEmitter<any>();
  @Input() serviceType: any;
roles: any;
  currentFy: any;
  financialYear: any[] = [];
  selectedFyYear = new UntypedFormControl('', Validators.required);
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService) {
    let loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = loggedInSme[0]?.roles;
    }

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
      const currentFy = this.financialYear.filter((item: any) => item.isFilingActive);
      this.selectedFyYear.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
      this.currentFy =currentFy.length > 0 ? currentFy[0].financialYear : null
      this.sendFy.emit(this.selectedFyYear.value);
    }
  }

  changeFy(fy: string) {
    this.sendFy.emit(this.selectedFyYear.value);
  }
}
