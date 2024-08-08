import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RecoveryRoutingModule } from './recovery-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MaterialModule } from '../shared/material.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SmeManagementNewRoutingModule } from '../sme-management-new/sme-management-new.routing';
import { MatCardModule } from '@angular/material/card';
import { RecoveryDataComponent } from './components/recovery-data/recovery-data.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [ RecoveryDataComponent, PopUpComponent],
  imports: [

    RecoveryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    SharedModule,
    AgGridModule,
    MaterialModule,
    NgxPaginationModule,
    SmeManagementNewRoutingModule,
    MatCardModule,
  ]
})
export class RecoveryModule { }
