import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeleteUserRoutingModule } from './delete-user-routing.module';
import { DeleteUserListComponent } from './delete-user-list/delete-user-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MaterialModule } from '../shared/material.module';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    DeleteUserListComponent
  ],
  imports: [
    CommonModule,
    DeleteUserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    AgGridModule,
    MaterialModule,
    NgxLoadingModule.forRoot({}),
    NgxPaginationModule
  ]
})
export class DeleteUserModule { }
