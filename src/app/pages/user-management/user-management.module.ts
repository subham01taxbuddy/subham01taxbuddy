import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/shared/material.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { UserManagementRoutingModule } from "./user-management.routing";
import { UserListComponent } from './user-list/user-list.component';
import { UserManagementComponent } from "./user-management/user-management.component";
import { NgxPaginationModule } from "ngx-pagination";
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';

@NgModule({
    declarations: [UserManagementComponent , UserListComponent, UserProfileComponent, ProfileDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        UserManagementRoutingModule,
        NgxPaginationModule
    ],
    entryComponents: [ProfileDialogComponent]
})

export class UserManagementModule { }