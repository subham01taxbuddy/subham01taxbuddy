import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { User } from 'src/app/modules/subscription/components/performa-invoice/performa-invoice.component';
import { ReportService } from 'src/app/services/report-service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-leader-list-dropdown',
  templateUrl: './leader-list-dropdown.component.html',
  styleUrls: ['./leader-list-dropdown.component.scss']
})
export class LeaderListDropdownComponent implements OnInit,OnChanges {

  @Output() sendLeader = new EventEmitter<any>();
  @Output() sendOwner = new EventEmitter<any>();
  @Input() disabled: any;
  @Input() showOwnerList =false;
  @Input() fromSme =false;
  @Input() fromEditSme =false;
  @Input() forGstServiceType: boolean =false;

  smeList: any[] = [];
  searchOwner = new UntypedFormControl('');
  searchLeader = new UntypedFormControl('');
  filteredOptions!: Observable<any[]>;
  filteredLeaders: Observable<any[]>;
  filteredOwners: Observable<any[]>;

  leaderDetails: any;
  ownerDetails: any;

  allOwners: any;
  ownerList: any;
  ownerNames: User[];
  leaderNames: User[];
  options: User[] = [];
  options1: User[] = [];
  leaderList: any;
  loggedInSme: any;
  roles: any;

  constructor(
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private reportService:ReportService
  ) { }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
      this.roles = this.loggedInSme[0]?.roles;
      console.log('roles',this.roles)
      console.log('logged in sme user id ',this.loggedInSme[0].userId)

      this.getLeaders();
  }

  setLeader(leader: any){
    this.leaderDetails = leader;
    this.sendLeader.emit(this.leaderDetails);
    console.log('emitting value', this.leaderDetails);
  }

  setOwner(filer: any){
    this.ownerDetails = filer;
    this.sendOwner.emit(this.ownerDetails);
  }

  setFiletedOptions1() {
    this.loggedInSme = JSON?.parse(sessionStorage?.getItem('LOGGED_IN_SME_INFO'));
    this.filteredLeaders = this.searchLeader.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        const name = typeof value === 'string' ? value : value?.name;
        let result = name
          ? this._filter(name as string, this.options)
          : this.options.slice();
          if (!this.utilsService.isNonEmpty(value)) {
            this.setLeader({});
          }
        return result;
      })
    );
  }

  setFiletedOptions2(){
    this.filteredOwners = this.searchOwner.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (!this.utilsService.isNonEmpty(value)) {
          this.setOwner(null);
          if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
            this.ownerDetails = this.loggedInSme[0];
          }
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options1)
          : this.options1.slice();
      })
    );
  }

  getLeaderNameId(option) {
    this.setLeader(option);
    console.log(option);
  }

  getOwnerNameId(option) {
    this.setOwner(option);
    console.log(option);
  }

  getLeaders() {
    // 'https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000?leader=true' \
    //'https://api.taxbuddy.com/report/bo/sme-details-new/1067?leader=true&serviceType=GST
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    let param = `/bo/sme-details-new/${loggedInSmeUserId}?leader=true`;

    if (this.forGstServiceType) {
      param = param + '&serviceType=GST';
    }

    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('new leader list result -> ', result);
      this.leaderList = result.data;
      this.leaderNames = this.leaderList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.options = this.leaderNames
      this.setFiletedOptions1();
    }, error => {
      this.utilsService.showSnackBar('Error in API of get leader list');
    })

  }

  getOwners() {
    // API to get owners under leader-
    //'http://uat-api.taxbuddy.com/report/sme-details-new/9362?ownersByLeader=true'
    const loggedInSmeUserId = this.loggedInSme[0].userId;
    let param = '';
      param = `/bo/sme-details-new/${loggedInSmeUserId}?leader=true`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      this.options1 = [];
      console.log('filer list result -> ', result);
      this.ownerList = result.data;
      console.log('filerList', this.ownerList);
      this.options1 = this.ownerList;
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
    this.searchLeader.setValue(null);
    this.searchOwner.setValue(null);
    this.leaderDetails = null;
    this.ownerDetails = null;
  }

  ngOnChanges() {
    this.ngOnInit();
    if (this.disabled) {
      this.searchLeader.disable();
      this.searchLeader.setValue('');
      this.searchOwner.disable();
      this.searchOwner.setValue('');
      return;
    }
    this.searchLeader.enable();
    this.searchOwner.enable();
  }



}
