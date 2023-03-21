import { EditUpdateAssignedSmeComponent } from './components/assigned-sme/edit-update-assigned-sme/edit-update-assigned-sme.component';
import { EditUpdateUnassignedSmeComponent } from './components/unassigned-sme/edit-update-unassigned-sme/edit-update-unassigned-sme.component';
import { UnassignedSmeComponent } from './components/unassigned-sme/unassigned-sme.component';
import { ResignedSmeComponent } from './components/resigned-sme/resigned-sme.component';
import { AssignedSmeComponent } from './components/assigned-sme/assigned-sme.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmeManagementNewComponent } from './sme-management-new.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { SmeManagementNewRoutingModule } from './sme-management-new.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    // SharedModule,
    AgGridModule,
    MaterialModule,
    NgxPaginationModule,
    SmeManagementNewRoutingModule,
    MatCardModule
  ],
  declarations: [
    SmeManagementNewComponent,
    AssignedSmeComponent,
    ResignedSmeComponent,
    UnassignedSmeComponent,
    EditUpdateUnassignedSmeComponent,
    EditUpdateAssignedSmeComponent
  ]
})
export class SmeManagementNewModule { }
