import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxLoadingModule } from "ngx-loading";
import { UserManagementRoutingModule } from "./user-management.routing";
import { UserListComponent } from './user-list/user-list.component';
import { UserManagementComponent } from "./user-management/user-management.component";
import { NgxPaginationModule } from "ngx-pagination";
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { CreateNewUserComponent } from './create-new-user/create-new-user.component';
import { OtherUsersComponent } from './other-users/other-users.component';
import { SmeUpdateComponent } from './other-users/sme-update/sme-update.component';
import { ChangeAgentDialogComponent } from "./other-users/agent-update/change-agent-dialog/change-agent-dialog.component";
import { AgentUpdateComponent } from "./other-users/agent-update/agent-update.component";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { MaterialModule } from "src/app/modules/shared/material.module";
import { AgGridModule } from "ag-grid-angular";

@NgModule({
    declarations: [UserManagementComponent , UserListComponent, UserProfileComponent, ProfileDialogComponent,ChangeAgentDialogComponent, CreateNewUserComponent, OtherUsersComponent, AgentUpdateComponent, SmeUpdateComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        AgGridModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        UserManagementRoutingModule,
        NgxPaginationModule
    ],
    entryComponents: [ProfileDialogComponent, ChangeAgentDialogComponent]
})

export class UserManagementModule { }