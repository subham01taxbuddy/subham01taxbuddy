import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { UntypedFormControl} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from "../../../subscription/components/performa-invoice/performa-invoice.component";
import { AppConstants } from "../../constants";
import { ReportService } from 'src/app/services/report-service';

@Component({
  selector: 'app-sme-list-drop-down',
  templateUrl: './sme-list-drop-down.component.html',
  styleUrls: ['./sme-list-drop-down.component.scss']
})
export class SmeListDropDownComponent implements OnInit, OnChanges {
  @Output() sendLeader = new EventEmitter<any>();
  @Output() sendPrincipleIndividual = new EventEmitter<any>();
  @Output() sendFiler = new EventEmitter<any>();
  @Input() disabled: any;
  @Input() checkboxSelection = false;
  @Output() sendFilerList = new EventEmitter<any>();
  @Input() showOwnerList = false;
  @Input() showOnlyOwnerList = false;
  @Input() skipChild = true;
  @Input() listType = 'ALL';
  @Input() isInternal: boolean;
  @Input() disableLeader : boolean =false;
  @Input() selectedLeader :any;
  @Input() showAllToLeader:boolean =false;
  @Input() parentId :any;

  smeList: any[] = [];
  searchChild = new UntypedFormControl('');
  searchPrincipleIndividual = new UntypedFormControl('');
  searchLeader = new UntypedFormControl('');
  filteredOptions!: Observable<any[]>;
  filteredChild: Observable<any[]>;
  filteredPrincipleIndividuals: Observable<any[]>;
  filteredLeaders: Observable<any[]>;
  leaderDetails: any;
  principleIndividualDetails: any;
  childDetails: any;
  allFilers: any;
  childList: any;
  childNames: User[];
  principleIndividualNames: User[];
  leaderNames: User[];
  principleIndividualOptions: User[] = [];
  childOptions: User[] = [];
  leaderOptions: User[] = [];
  principleIndividualList: any;
  leaderList: any;
  loggedInSme: any;
  roles: any;
  showChildFilter: boolean = false;
  partnerType: any;

  constructor(public utilsService: UtilsService,
    private reportService: ReportService,
  ) {
  }

  ngOnInit() {
    if(this.disableLeader && this.selectedLeader){
      let userId = this.selectedLeader.leaderUserId;
      let name = this.selectedLeader.leaderName;
      this.leaderDetails = this.leaderDetails || [];
      this.leaderDetails.push({ name, userId });
    }
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType;

    if (this.roles.includes('ROLE_ADMIN') || this.showAllToLeader) {
      this.getLeaders();
      this.getPrincipleIndividuals();
      this.setFilteredPrincipleIndividuals();
      this.setFilteredChild();

      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
      this.allFilers = this?.smeList?.map((item) => {
        return { name: item.name, userId: item.userId, partnerType: item.partnerType };
      });
      this.childOptions = this.allFilers;

    } else if (this.roles.includes('ROLE_LEADER')) {
      this.getPrincipleIndividuals();
      this.setFilteredPrincipleIndividuals();
      this.setFilteredChild();


    } else if (this.partnerType === 'PRINCIPAL') {
      this.principleIndividualDetails = this.loggedInSme[0];
      this.getChild();
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.MY_AGENT_LIST));
      console.log('my agents', this.smeList);
      this.allFilers = this?.smeList?.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.childOptions = this.allFilers;
      this.setFilteredChild();
    }

    if (this.partnerType == 'PRINCIPAL') {
      this.setPrinciple(this.loggedInSme[0]);
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.setChild(this.loggedInSme[0]);
    }
  }

  setLeader(leader: any) {
    this.leaderDetails = leader;
    this.sendLeader.emit(this.leaderDetails);
    console.log('emitting value leader details', this.leaderDetails);
  }

  setPrinciple(owner: any) {
    this.principleIndividualDetails = owner;
    this.sendPrincipleIndividual.emit(this.principleIndividualDetails);
  }

  setChild(child: any) {
    this.childDetails = child;
    this.sendFiler.emit(this.childDetails);
  }

  setFilteredPrincipleIndividuals() {
    this.filteredPrincipleIndividuals = this.searchPrincipleIndividual.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        if (!this.utilsService.isNonEmpty(value)) {
          this.setPrinciple({});
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.principleIndividualOptions)
          : this.principleIndividualOptions.slice();
      })
    );
  }

  setFilteredChild() {
    this.filteredChild = this.searchChild.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (!this.utilsService.isNonEmpty(value)) {
          this.setChild(null);
          if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
            this.childDetails = this.loggedInSme[0];
          }
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.childOptions)
          : this.childOptions?.slice();
      })
    );
  }

  setFilteredLeaders() {
    this.filteredLeaders = this.searchLeader.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        if (!this.utilsService.isNonEmpty(value)) {
          this.setLeader({});
        }
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.leaderOptions)
          : this.leaderOptions.slice();
      })
    );
  }


  getLeaderNameId(option) {
    this.leaderDetails = option;
    this.setLeader(option)
    this.getPrincipleIndividuals();
  }

  getPrincipleNameId(option) {
    this.setPrinciple(option);
    console.log(option);
    if (option?.partnerType === 'PRINCIPAL') {
      this.showChildFilter = true;
      this.getChild();
    } else {
      this.showChildFilter = false;
    }
  }

  getChildNameId(option) {
    this.setChild(option);
    console.log(option);
  }

  getLeaders() {
    // 'https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000?leader=true' \
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    let param = `/bo/sme-details-new/${loggedInSmeUserId}?leader=true`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('new leader list result -> ', result);
      this.leaderList = result.data;
      this.leaderNames = this.leaderList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.leaderOptions = this.leaderNames
      this.setFilteredLeaders();
    }, error => {
      this.utilsService.showSnackBar('Error in API of get leader list');
    })

  }

  getPrincipleIndividuals() {
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000?partnerType=Individual%2CPrincipal'
    // if(this.listType === 'ALL') {
    const loggedInSmeUserId = this.loggedInSme[0].userId;
    let param = '';
    let selectedLeader
    if (this.leaderDetails && this.leaderDetails.length > 0){
       selectedLeader = this.leaderDetails[0]?.userId
    }
    if(this.parentId){
      selectedLeader = this.parentId
    }
    let leaderUserId = this.leaderDetails?.userId || selectedLeader ;

    if (leaderUserId) {
      param = `/bo/sme-details-new/${leaderUserId}?partnerType=INDIVIDUAL,PRINCIPAL`;
    } else {
      param = `/bo/sme-details-new/${loggedInSmeUserId}?partnerType=INDIVIDUAL,PRINCIPAL`;
    }
    if (this.isInternal) {
      param = param + '&internal=false';
    }

    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('principle/individual list result -> ', result);
      this.principleIndividualList = result.data;
      console.log('principleIndividualList', this.principleIndividualList);
      this.principleIndividualNames = this.principleIndividualList.map((item) => {
        return { name: item.name, userId: item.userId, partnerType: item.partnerType };
      });
      this.principleIndividualOptions = this.principleIndividualNames;
      this.setFilteredPrincipleIndividuals();
      console.log(' principleIndividualNames -> ', this.principleIndividualNames);
    });
    // } else if(this.listType === 'ASSIGNED') {
    //   const loggedInSmeUserId = this.loggedInSme[0].userId;
    //   let param = `/sme-details-new/${loggedInSmeUserId}?ownersByLeader=true`;
    //   this.userMsService.getMethodNew(param).subscribe((result: any) => {
    //     console.log('owner list result -> ', result);
    //     this.principleIndividualList = result.data;
    //     console.log('principleIndividualList', this.principleIndividualList);
    //     this.principleIndividualNames = this.principleIndividualList.map((item) => {
    //       return {name: item.name, userId: item.userId};
    //     });
    //     this.principleIndividualOptions = this.principleIndividualNames;
    //     console.log(' ownerName -> ', this.principleIndividualNames);
    //   });
    // }

  }

  getChild() {
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/8117?partnerType=Child'
    const loggedInSmeUserId = this.loggedInSme[0].userId;
    let param = '';
    if (this.principleIndividualDetails?.userId) {
      param = `/bo/sme-details-new/${this.principleIndividualDetails?.userId}?partnerType=CHILD`;
    } else {
      param = `/bo/sme-details-new/${loggedInSmeUserId}?partnerType=CHILD`;
    }

    this.reportService.getMethod(param).subscribe((result: any) => {
      this.childOptions = [];
      console.log('filer list result -> ', result);
      this.childList = result.data;
      console.log('childList', this.childList);
      this.childNames = this?.principleIndividualList?.map((item) => {
        return { name: item.name, userId: item.userId, partnerType: item.partnerType };
      });
      this.childOptions = this.childList;
      this.setFilteredChild();
      console.log(' childNames -> ', this.childOptions);
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

  resetDropdown() {
    this.searchLeader.setValue(null);
    this.searchPrincipleIndividual.setValue(null);
    this.searchChild.setValue(null);
    this.leaderDetails = null;
    this.principleIndividualDetails = null;
    this.childDetails = null;
    this.showChildFilter = false;
  }

  ngOnChanges() {
    this.ngOnInit();
    if (this.disabled) {
      this.searchPrincipleIndividual.disable();
      this.searchPrincipleIndividual.setValue('');
      this.searchChild.disable();
      this.searchChild.setValue('');
      return;
    }
    this.searchPrincipleIndividual.enable();
    this.searchChild.enable();
  }

  isSelected(user: User): boolean {
    return this.childOptions.indexOf(user) > 1;
  }


  getFilerList(searchChild) {
    let filerIds = []
    this.filteredChild.subscribe(filteredChild => {
      filteredChild.forEach(filer => {
        if (searchChild.value.includes(filer.name)) {
          filerIds.push(filer.userId);
        }
      })
    })
    console.log("filer ids", filerIds)
    this.sendFilerList.emit(filerIds);
  }

}
