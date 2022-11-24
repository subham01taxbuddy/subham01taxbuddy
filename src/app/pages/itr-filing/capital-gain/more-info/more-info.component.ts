import { ItrMsService } from './../../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
// import { IncomeTaxReturnStateService } from 'src/app/services/wizard.state.service';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog'
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';


@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit {
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
  }

  canDeactivate() {
    return true;
  }

}
