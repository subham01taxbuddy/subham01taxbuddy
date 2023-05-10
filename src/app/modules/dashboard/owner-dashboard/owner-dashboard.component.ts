import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  loggedInSmeUserId:any;
  roles:any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  searchFiler = new FormControl('');
  options1: User[] = [];
  filerList: any;
  filerNames: User[];
  filteredFilers: Observable<any[]>;
  constructor(
    private utilsService: UtilsService,
    private userMsService: UserMsService,
  ) { }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
  }


  getFilers() {
    // API to get filers under owner-
    // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true

    let param = `/sme-details-new/${this.loggedInSmeUserId}?filer=true`;

    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.options1 = [];
      console.log('filer list result -> ', result);
      this.filerList = result.data;
      this.options1 = this.filerList;//this.filerNames;
      this.setFiletedOptions2();
    });
  }

  setFiletedOptions2(){
    this.filteredFilers = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options1)
          : this.options1.slice();
      })
    );
  }
  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
}
