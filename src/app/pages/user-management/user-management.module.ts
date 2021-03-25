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

@NgModule({
    declarations: [UserManagementComponent , UserListComponent],
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
})

export class UserManagementModule { }