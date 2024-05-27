import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { FilingsComponent } from './pages/filings/filings.component';
import { MoreOptionsDialogComponent } from './components/more-options-dialog/more-options-dialog.component';
import { SignUpExceptionsComponent } from './pages/sign-up-exceptions/sign-up-exceptions.component';
import { ExceptionsComponent } from './pages/exceptions/exceptions.component';
import { EriExceptionsComponent } from './pages/exceptions/eri-exceptions/eri-exceptions.component';
import { EVerificationDialogComponent } from './components/e-verification-dialog/e-verification-dialog.component';
import { ItrLifecycleDialogComponent } from './components/itr-lifecycle-dialog/itr-lifecycle-dialog.component';
import { AssignedNewUsersComponent } from "./pages/assigned-new-users/assigned-new-users.component";
import { PotentialUserComponent } from './pages/potential-user/potential-user.component';
import { BulkReAssignDialogComponent } from './components/bulk-re-assign-dialog/bulk-re-assign-dialog.component';
import { ItrStatusDialogComponent } from './components/itr-status-dialog/itr-status-dialog.component';
import { ReAssignActionDialogComponent } from './components/re-assign-action-dialog/re-assign-action-dialog.component';
import { ChatOptionsDialogComponent } from './components/chat-options/chat-options-dialog.component';
import { ScheduledCallReassignDialogComponent } from './components/scheduled-call-reassign-dialog/scheduled-call-reassign-dialog.component';
import { ItrAssignedUsersComponent } from './pages/itr-assigned-users/itr-assigned-users.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { SchCallCalenderComponent } from './pages/scheduled-call/sch-call-calender/sch-call-calender.component';
import { UserChatComponent } from '../chat/user-chat/user-chat.component';

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
        NgxPaginationModule,
        OverlayModule
    ],
    declarations: [
        TasksComponent,
        AssignedNewUsersComponent,
        ScheduledCallComponent,
        ReAssignDialogComponent,
        FilingsComponent,
        MoreOptionsDialogComponent,
        SignUpExceptionsComponent,
        ExceptionsComponent,
        EriExceptionsComponent,
        EVerificationDialogComponent,
        ItrLifecycleDialogComponent,
        PotentialUserComponent,
        BulkReAssignDialogComponent,
        ItrStatusDialogComponent,
        ChatOptionsDialogComponent,
        ReAssignActionDialogComponent,
        ScheduledCallReassignDialogComponent,
        ItrAssignedUsersComponent,
        SchCallCalenderComponent
     ],
    exports: [
        MoreOptionsDialogComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class TasksModule { }
