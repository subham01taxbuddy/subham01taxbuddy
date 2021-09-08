import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { ITR_SUMMARY } from 'app/shared/interfaces/itr-summary.interface';
import { Observable } from 'rxjs-compat/Observable';
import { map, startWith } from 'rxjs/operators';
import { SumaryDialogComponent } from '../../sumary-dialog/sumary-dialog.component';

@Component({
  selector: 'app-itr-one',
  templateUrl: './itr-one.component.html',
  styleUrls: ['./itr-one.component.css']
})
export class ItrOneComponent implements OnInit {

  newItrSumChanges: boolean = true;


  constructor() {
  }

  ngOnInit() {}


}