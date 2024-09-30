import { CommonModule } from "@angular/common";
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
import { SharedModule } from "src/app/modules/shared/shared.module";
import { MaterialModule } from "src/app/modules/shared/material.module";
import { AgGridModule } from "ag-grid-angular";
import { RoleUpdateComponent } from './role-update/role-update.component';
import { TasksModule } from "src/app/modules/tasks/tasks.module";
import {PagesModule} from "../pages.module";
import { BulkStatusUpdateComponent } from "./bulk-status-update/bulk-status-update.component";
import { PanExceptionComponent } from "./pan-exception/pan-exception.component";
import { TaxCalculationComponent } from './tax-calculation/tax-calculation.component';
import { TaxCalculationDetailsComponent } from './tax-calculation-details/tax-calculation-details.component';

@NgModule({
    declarations: [UserManagementComponent, UserListComponent, UserProfileComponent, ProfileDialogComponent, CreateNewUserComponent,
        RoleUpdateComponent, BulkStatusUpdateComponent,PanExceptionComponent, TaxCalculationComponent, TaxCalculationDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AgGridModule,
        MaterialModule,
        NgxLoadingModule.forRoot({}),
        UserManagementRoutingModule,
        NgxPaginationModule,
        TasksModule,
        PagesModule
    ]
})

export class UserManagementModule { }
