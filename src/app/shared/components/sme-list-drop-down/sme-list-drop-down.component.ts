import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-sme-list-drop-down',
  templateUrl: './sme-list-drop-down.component.html',
  styleUrls: ['./sme-list-drop-down.component.scss']
})
export class SmeListDropDownComponent implements OnInit {
  @Output() sendSme = new EventEmitter<any>();
  @Input() serviceType;

  smeList = [];
  selectedSme = new FormControl('', Validators.required);

  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService) { }

  ngOnInit() {
    this.getSmeList();
  }

  async getSmeList() {
    this.smeList = await this.utilsService.getStoredSmeList();
  }

  // setFyDropDown() {
  //   const smeListTemp = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
  //   console.log('smeListTemp', smeListTemp);
  //   if (this.utilsService.isNonEmpty(smeListTemp) && smeListTemp instanceof Array) {
  //     this.smeList = smeListTemp;
  //     const currentFy = this.smeList.filter(item => item.isFilingActive);
  //     // this.selectedSme.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
  //     // this.sendSme.emit(this.selectedSme.value);
  //   } else {
  //     const param = `${ApiEndpoints.itrMs.filingDates}`;
  //     this.itrMsService.getMethod(param).subscribe((res: any) => {
  //       if (res && res.success && res.data instanceof Array) {
  //         sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
  //         this.smeList = res.data;
  //         // const currentFy = this.smeList.filter(item => item.isFilingActive);
  //         // this.selectedSme.setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
  //         // this.sendSme.emit(this.selectedSme.value);
  //       }
  //     }, error => {
  //       console.log('Error during getting all PromoCodes: ', error)
  //     })
  //   }
  // }

  changeSme(sme: String) {
    console.log('SME in change:', sme, this.selectedSme)
    this.sendSme.emit(this.selectedSme.value);
  }
}
