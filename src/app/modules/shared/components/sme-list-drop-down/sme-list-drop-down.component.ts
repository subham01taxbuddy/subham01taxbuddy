import { UserMsService } from './../../../../services/user-ms.service';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';
import {User} from "../../../subscription/components/performa-invoice/performa-invoice.component";
import {AppConstants} from "../../constants";

@Component({
  selector: 'app-sme-list-drop-down',
  templateUrl: './sme-list-drop-down.component.html',
  styleUrls: ['./sme-list-drop-down.component.scss']
})
export class SmeListDropDownComponent implements OnInit, OnChanges {
  @Output() sendSme = new EventEmitter<any>();
  @Input() serviceType: any;
  @Input() listType: any;
  @Input() disabled: any;
  @Input() addSelfAll: any;
  @Input() showSme: any;


  smeList: any[] = [];
  selectedSme = new FormControl('');
  searchFiler = new FormControl('');
  searchOwner = new FormControl('');
  filteredOptions!: Observable<any[]>;
  filteredFilers: Observable<any[]>;
  filteredOwners: Observable<any[]>;

  ownerDetails: any;
  filerDetails: any;

  allFilers: any;
  filerList: any;
  filerNames: User[];
  ownerNames: User[];
  options: User[] = [];
  options1: User[] = [];
  ownerList: any;
  loggedInSme: any;
  roles: any;
  constructor(public utilsService: UtilsService,
    private userMsService: UserMsService) {
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;

    this.getOwners();
    if(this.roles?.includes('ROLE_ADMIN') || this.roles?.includes('ROLE_LEADER')) {
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
      console.log('all filers', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return {name: item.name, userId: item.userId};
      });
      this.options1 = this.allFilers;
    } else if(this.roles?.includes('ROLE_OWNER')){
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.MY_AGENT_LIST));
      console.log('my agents', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return {name: item.name, userId: item.userId};
      });
      this.options1 = this.allFilers;
    }
    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerDetails = this.loggedInSme[0];
    } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerDetails = this.loggedInSme[0];
    }

  }

  setFiletedOptions1() {
    this.filteredOwners = this.searchOwner.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        if (!this.utilsService.isNonEmpty(value)) {
          this.ownerDetails = null;
          if (this.roles?.includes('ROLE_OWNER')) {
            this.ownerDetails.userId = this.loggedInSme.userId;
            this.getFilers();
          }
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options)
          : this.options.slice();
      })
    );
  }

  setFiletedOptions2(){
    this.filteredFilers = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (!this.utilsService.isNonEmpty(value)) {
          this.filerDetails = null;
          if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
            this.filerDetails.userId = this.loggedInSme.userId;
          }
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options1)
          : this.options1.slice();
      })
    );
  }

  getOwnerNameId(option) {
    this.ownerDetails = option;
    console.log(option);
    this.getFilers();
  }

  getFilerNameId(option) {
    this.filerDetails = option;
    console.log(option);
  }
  setList() {
    if (this.searchOwner.value == '') {
      this.options1 = this.allFilers;
      this.setFiletedOptions2();
    }
  }

  getFilers() {
    // API to get filers under owner-
    // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true
    // this.options1=this.allFilers;
    const loggedInSmeUserId = this.loggedInSme[0].userId;
    let param = '';
    if (this.ownerDetails?.userId) {
      param = `/sme-details-new/${this.ownerDetails?.userId}?filer=true`;
    } else {
      param = `/sme-details-new/${loggedInSmeUserId}?owner=true&assigned=true`;
    }

    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.options1 = [];
      console.log('filer list result -> ', result);
      this.filerList = result.data;
      console.log('filerList', this.filerList);
      this.filerNames = this.ownerList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.options1 = this.filerList;//this.filerNames;
      this.setFiletedOptions2();
      console.log(' filerNames -> ', this.options1);
    });
  }

  getOwners() {
    const loggedInSmeUserId = this.loggedInSme[0].userId;
    let param = `/sme-details-new/${loggedInSmeUserId}?owner=true`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.ownerList = result.data;
      console.log('ownerlist', this.ownerList);
      this.ownerNames = this.ownerList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.options = this.ownerNames;
      console.log(' ownerName -> ', this.ownerNames);
    });
  }
  /////Ashwini Code Ends here

  displayFn(label: any) {
    return label ? label : undefined;
  }

  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
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
        if (this.showSme) {
          let data = this.smeList.find(item =>
            item.userId === this.showSme
          );
          this.selectedSme.setValue(data?.name);
        }
        return;
      }
      return [];
    }
    this.smeList = await this.utilsService.getStoredMyAgentList() || [];
    if (this.showSme) {
      let data = this.smeList.find(item =>
        item.userId === this.showSme
      );
      this.selectedSme.setValue(data?.name);
    }
  }

  async getMyAgentList(serviceType) {
    if (serviceType === 'TPA' || serviceType === 'OTHER') {
      serviceType = 'ITR';
    }
    const param = `/sme/${serviceType}?isActive=true`;//&isAssignmentStart=true`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  ngOnChanges() {
    this.ngOnInit();
    if (this.disabled) {
      this.selectedSme.disable();
      this.selectedSme.setValue('');
      return;
    }
    this.selectedSme.enable();
  }

  selectSme(sme){
    this.selectedSme.setValue(sme.name);
    this.smeCode = sme.userId;
    this.sendSme.emit(this.smeCode);
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
        if (this.selectedSme.value === 'ALL' || this.selectedSme.value === 'SELF') {
          this.sendSme.emit(this.selectedSme.value);
          return;
        }
        this.selectedSme.setErrors({ invalid: true });
        console.log('smeCode on blur = ', this.smeCode);
      }
    } else {
      this.sendSme.emit('');
    }
  }
}
