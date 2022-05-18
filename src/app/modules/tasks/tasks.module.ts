import { AssignedUsersComponent } from './pages/assigned-users/assigned-users.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { TasksRoutingModule } from './tasks.routing';
import { TasksComponent } from './tasks.component';
import { MaterialModule } from "src/app/modules/shared/material.module";
import { AgGridModule } from "ag-grid-angular";
import { NgxPaginationModule } from "ngx-pagination";
import { ScheduledCallComponent } from './pages/scheduled-call/scheduled-call.component';
import { ReAssignDialogComponent } from './components/re-assign-dialog/re-assign-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TasksRoutingModule,
        NgxLoadingModule.forRoot({}),
        SharedModule,
        AgGridModule,
        MaterialModule,
        NgxPaginationModule
    ],
    declarations: [
        TasksComponent,
        AssignedUsersComponent,
        ScheduledCallComponent,
        ReAssignDialogComponent
    ],
    entryComponents: [ReAssignDialogComponent]

})
export class TasksModule { }
