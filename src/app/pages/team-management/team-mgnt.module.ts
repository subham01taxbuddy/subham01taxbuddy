import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { TeamManagementRouingModule } from "./team-mgnt.routing";
import { TeamManagementComponent } from './team-management/team-management.component';
import { AddCallerComponent } from './caller-assign/add-caller/add-caller.component';
import { CallerAssignComponent } from './caller-assign/caller-assign.component';
import { NgxLoadingModule } from "ngx-loading";
import { SmeManagementComponent } from './sme-management/sme-management.component';
import { AddRemoveAgentDialogComponent } from './caller-assign/add-remove-agent-dialog/add-remove-agent-dialog.component';
import { AgentMgntComponent } from './agent-mgnt/agent-mgnt.component';
import { UpdateAgentDialogComponent } from './agent-mgnt/update-agent-dialog/update-agent-dialog.component';
import { SuperLeadDialogComponent } from "./agent-mgnt/super-lead-dialog/super-lead-dialog.component";
import { SharedModule } from "src/app/modules/shared/shared.module";

@NgModule({
    declarations: [TeamManagementComponent, AddCallerComponent, CallerAssignComponent, SmeManagementComponent, AddRemoveAgentDialogComponent, AgentMgntComponent, UpdateAgentDialogComponent,
        SuperLeadDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        SharedModule,
        TeamManagementRouingModule,
        NgxLoadingModule.forRoot({}),
    ],
    entryComponents: [AddRemoveAgentDialogComponent, UpdateAgentDialogComponent, SuperLeadDialogComponent]
})

export class TeamManagementModule { }