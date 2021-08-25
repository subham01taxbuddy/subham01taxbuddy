import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ApiEndpoints } from 'app/shared/api-endpoint';
import { AppConstants } from 'app/shared/constants';
import { invalid } from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
  filteredOptions: Observable<any[]>;

  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService) { }

  ngOnInit() {
    this.getSmeList();

    this.filteredOptions = this.selectedSme.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          return value;
        }),
        map(name => {
          return name ? this._filter(name) : this.smeList.slice();
        })
      );

  }

  displayFn(label) {
    return label ? label : undefined;
  }

  _filter(name) {
    const filterValue = name.toLowerCase();
    return this.smeList.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
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
  smeCode: any;
  getCodeFromLabelOnBlur() {
    if (this.utilsService.isNonEmpty(this.selectedSme.value) && this.utilsService.isNonEmpty(this.selectedSme.value)) {
      this.smeCode = this.smeList.filter(item => item.name.toLowerCase() === this.selectedSme.value.toLowerCase());
      if (this.smeCode.length !== 0) {
        this.smeCode = this.smeCode[0].userId;
        console.log('smeCode on blur = ', this.smeCode);
        this.sendSme.emit(this.smeCode);
      } else {
        this.selectedSme.setErrors(invalid);
        console.log('smeCode on blur = ', this.smeCode);
      }
    }
  }
}
