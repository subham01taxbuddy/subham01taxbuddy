import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { NgxPaginationModule } from "ngx-pagination";
import { TeamManagementRouingModule } from "./team-mgnt.routing";
import { TeamManagementComponent } from './team-management/team-management.component';
import { AddCallerComponent } from './caller-assign/add-caller/add-caller.component';
import { RemoveCallerComponent } from './caller-assign/remove-caller/remove-caller.component';
import { CallerAssignComponent } from './caller-assign/caller-assign.component';
import { NgxLoadingModule } from "ngx-loading";
import { SmeManagementComponent } from './sme-management/sme-management.component';
import { ChangeAgentDialogComponent } from './sme-management/change-agent-dialog/change-agent-dialog.component';

@NgModule({
    declarations: [TeamManagementComponent, AddCallerComponent, RemoveCallerComponent, CallerAssignComponent, SmeManagementComponent, ChangeAgentDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        SharedModule,
        TeamManagementRouingModule,
        NgxLoadingModule.forRoot({}),
    ],
    entryComponents: [ChangeAgentDialogComponent]
})

export class TeamManagementModule {}