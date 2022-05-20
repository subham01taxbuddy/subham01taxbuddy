import { UserMsService } from './../../../../services/user-ms.service';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sme-list-drop-down',
  templateUrl: './sme-list-drop-down.component.html',
  styleUrls: ['./sme-list-drop-down.component.scss']
})
export class SmeListDropDownComponent implements OnInit, OnChanges {
  @Output() sendSme = new EventEmitter<any>();
  @Input() serviceType: any;
  @Input() listType: any;

  smeList: any[] = [];
  selectedSme = new FormControl('', Validators.required);
  filteredOptions!: Observable<any[]>;

  constructor(public utilsService: UtilsService,
    private userMsService: UserMsService) {
  }

  ngOnInit() {
    console.log('listType in SME Drop down', this.listType);
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

  displayFn(label: any) {
    return label ? label : undefined;
  }

  _filter(name: any) {
    const filterValue = name.toLowerCase();
    return this.smeList.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  async getSmeList() {
    if (this.listType === 'ALL' && this.utilsService.isNonEmpty(this.serviceType)) {
      let res: any = await this.getMyAgentList(this.serviceType).catch(error => {
        console.log(error);
        this.utilsService.showSnackBar('Error While getting My Agent list.');
        this.smeList = []
        return;
      });
      if (res.success && res.data instanceof Array) {
        res.data.sort((a, b) => a.name > b.name ? 1 : -1)
        this.smeList = res.data;
        return;
      }
      return [];
    }
    this.smeList = await this.utilsService.getStoredMyAgentList() || [];
  }

  async getMyAgentList(serviceType) {
    if (serviceType === 'TPA') {
      serviceType = 'ITR';
    }
    const param = `/sme/${serviceType}?isActive=true&isAssignmentStart=true`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  // setFyDropDown() {
  //   const smeListTemp = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
  //   console.log('smeListTemp', smeListTemp);
  //   if (this.utilsService.isNonEmpty(smeListTemp) && smeListTemp instanceof Array) {
  //     this.smeList = smeListTemp;
  //     const currentFy = this.smeList.filter((item:any) => item.isFilingActive);
  //     // this.selectedSme'].setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
  //     // this.sendSme.emit(this.selectedSme.value);
  //   } else {
  //     const param = `${ApiEndpoints.itrMs.filingDates}`;
  //     this.itrMsService.getMethod(param).subscribe((res: any) => {
  //       if (res && res.success && res.data instanceof Array) {
  //         sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
  //         this.smeList = res.data;
  //         // const currentFy = this.smeList.filter((item:any) => item.isFilingActive);
  //         // this.selectedSme'].setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
  //         // this.sendSme.emit(this.selectedSme.value);
  //       }
  //     }, error => {
  //       console.log('Error during getting all PromoCodes: ', error)
  //     })
  //   }
  // }

  ngOnChanges() {
    this.getSmeList();
  }


  changeSme(sme: String) {
    console.log('SME in change:', sme, this.selectedSme)
    this.sendSme.emit(this.selectedSme.value);
  }
  smeCode: any;
  getCodeFromLabelOnBlur() {
    if (this.utilsService.isNonEmpty(this.selectedSme.value) && this.utilsService.isNonEmpty(this.selectedSme.value)) {
      this.smeCode = this.smeList.filter((item: any) => item.name.toLowerCase() === this.selectedSme.value.toLowerCase());
      if (this.smeCode.length !== 0) {
        this.smeCode = this.smeCode[0].userId;
        console.log('smeCode on blur = ', this.smeCode);
        this.sendSme.emit(this.smeCode);
      } else {
        this.selectedSme.setErrors({ invalid: true });
        console.log('smeCode on blur = ', this.smeCode);
      }
    } else {
      this.sendSme.emit('');
    }
  }
}
