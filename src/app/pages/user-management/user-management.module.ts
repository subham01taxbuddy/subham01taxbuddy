import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/shared/material.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { UserManagementComponent } from "./user-management.component";
import { UserManagementRoutingModule } from "./user-management.routing";
import { UsersListComponent } from "./users-list/users-list.component";

@NgModule({
    declarations: [UserManagementComponent, UsersListComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        UserManagementRoutingModule
    ],
})

export class UserManagementModule { }