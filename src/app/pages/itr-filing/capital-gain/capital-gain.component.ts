import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
// import { IncomeTaxReturnStateService } from 'src/app/services/wizard.state.service';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';


@Component({
  selector: 'app-capital-gain',
  templateUrl: './capital-gain.component.html',
  styleUrls: ['./capital-gain.component.scss']
})
export class CapitalGainComponent implements OnInit {
  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private router: Router,
    public matDialog: MatDialog) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  assestTypesDropdown = [];

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    // this.getBothMenus();
    // this.utilsService.updateLastVisitedURL(this.ITR_JSON, 'incomes/income/capitalgain');
  }


  routeNext() {
    // TODO  Add routing here

    // const route = this.utilsService.routeNext(this.leftMenus, 'INCOME', 'CG', 'ROUTE');
    // this.router.navigate([route]);
  }

  /**
    * @function previousRoute()
    * @param none
    * @description This method is used to navigate back page
    * @author Ashish Hulwan
    */
  // previousRoute() {
  //   const route = this.utilsService.previousRoute(this.leftMenus, 'INCOME', 'CG', 'ROUTE');
  //   this.router.navigate([route]);
  // }

  canDeactivate() {
    return true;
  }

}
