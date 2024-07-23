import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-business-income',
  templateUrl: './business-income.component.html',
})
export class BusinessIncomeComponent implements OnInit {
  loading = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog
    ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit(): void {
    this.utilsService.smoothScrollToTop();
  }

  tabChanged() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    
  }
  canDeactivate() {
    return true;
  }


}
