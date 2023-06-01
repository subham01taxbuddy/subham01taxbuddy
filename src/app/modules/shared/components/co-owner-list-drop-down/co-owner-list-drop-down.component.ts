import { UserMsService } from './../../../../services/user-ms.service';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';
import {User} from "../../../subscription/components/performa-invoice/performa-invoice.component";
import {AppConstants} from "../../constants";

@Component({
  selector: 'app-co-owner-list-drop-down',
  templateUrl: './co-owner-list-drop-down.component.html',
  styleUrls: ['./co-owner-list-drop-down.component.scss']
})
export class CoOwnerListDropDownComponent implements OnInit, OnChanges {
  @Output() sendCoOwner = new EventEmitter<any>();
  @Output() sendCoFiler = new EventEmitter<any>();
  @Input() disabled: any;

  smeList: any[] = [];
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
    private userMsService: UserMsService) { }

    ngOnInit() {
      this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
      this.roles = this.loggedInSme[0]?.roles;
      console.log('roles',this.roles)
      console.log('logged in sme user id ',this.loggedInSme[0].userId)

      this.getOwners();

      // this.setFiletedOptions2();
      // if(this.roles?.includes('ROLE_OWNER')){
      //   this.ownerDetails.userId = this.loggedInSme[0]?.userId;
      //   this.getFilers();}

      // if (this.roles?.includes('ROLE_OWNER')) {
      //   this.setOwner(this.loggedInSme[0]);
      // } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      //   this.setFiler(this.loggedInSme[0]);
      // }

      }


    setOwner(owner: any){
      this.ownerDetails = owner;
      this.sendCoOwner.emit(this.ownerDetails);
      console.log('emitting value', this.ownerDetails);
    }

    setFiler(filer: any){
      this.filerDetails = filer;
      this.sendCoFiler.emit(this.filerDetails);
    }

    setFiletedOptions1() {
      this.loggedInSme = JSON?.parse(sessionStorage?.getItem('LOGGED_IN_SME_INFO'));
      this.filteredOwners = this.searchOwner.valueChanges.pipe(
        startWith(''),
        map((value) => {
          console.log('change', value);
          const name = typeof value === 'string' ? value : value?.name;
          let result = name
            ? this._filter(name as string, this.options)
            : this.options.slice();
            if (!this.utilsService.isNonEmpty(value)) {
              this.setOwner({});
              if (this.roles?.includes('ROLE_OWNER')) {
                this.ownerDetails.userId = this.loggedInSme[0]?.userId;
                this.getFilers();
              }
            }
          return result;
        })
      );
    }

    setFiletedOptions2(){
      this.filteredFilers = this.searchFiler.valueChanges.pipe(
        startWith(''),
        map((value) => {
          if (!this.utilsService.isNonEmpty(value)) {
            this.setFiler(null);
            if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
              this.filerDetails = this.loggedInSme[0];
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
      this.setOwner(option);
      console.log(option);
      this.getFilers();
    }

    getFilerNameId(option) {
      this.setFiler(option);
      console.log(option);
    }


    getOwners() {
      // 'https://uat-api.taxbuddy.com/user/sme-details-new/7522?page=0&pageSize=30&coOwner=true'
      const loggedInSmeUserId = this.loggedInSme[0].userId;
      let param = `/sme-details-new/${loggedInSmeUserId}?coOwner=true`;
      this.userMsService.getMethodNew(param).subscribe((result: any) => {
        console.log('owner list result -> ', result);
        this.ownerList = result.data;
        console.log('ownerlist', this.ownerList);
        this.ownerNames = this.ownerList.map((item) => {
          return { name: item.name, userId: item.userId };
        });
        this.options = this.ownerNames;
        console.log(' ownerName -> ', this.ownerNames);
        this.setFiletedOptions1();
      });
    }

    getFilers() {
      // API to get filers under co-owner-
      // 'https://uat-api.taxbuddy.com/user/sme-details-new/7522?page=0&pageSize=30&filer=true&coOwner=true'
      // this.options1=this.allFilers;
      const loggedInSmeUserId = this.loggedInSme[0].userId;
      let param = '';
      if (this.ownerDetails?.userId) {
        param = `/sme-details-new/${this.ownerDetails?.userId}?filer=true&coOwner=true`;
      } else {
        param = `/sme-details-new/${loggedInSmeUserId}?owner=true&assigned=true`;
      }

      this.userMsService.getMethodNew(param).subscribe((result: any) => {
        this.options1 = [];
        console.log('filer list result -> ', result);
        this.filerList = result.data;
        console.log('filerList', this.filerList);
        this.options1 = this.filerList;//this.filerNames;
        this.setFiletedOptions2();
        console.log(' filerNames -> ', this.options1);
      });
    }

    private _filter(name: string, options): User[] {
      const filterValue = name.toLowerCase();

      return options.filter((option) =>
        option.name.toLowerCase().includes(filterValue)
      );
    }

    resetDropdown(){
      this.searchOwner.setValue(null);
      this.searchFiler.setValue(null);
      this.ownerDetails = null;
      this.filerDetails = null;
    }

    ngOnChanges() {
      this.ngOnInit();
      if (this.disabled) {
        this.searchOwner.disable();
        this.searchOwner.setValue('');
        this.searchFiler.disable();
        this.searchFiler.setValue('');
        return;
      }
      this.searchOwner.enable();
      this.searchFiler.enable();
    }


}
