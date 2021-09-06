import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AgentMgntComponent } from "./agent-mgnt/agent-mgnt.component";
import { AddCallerComponent } from "./caller-assign/add-caller/add-caller.component";
import { CallerAssignComponent } from "./caller-assign/caller-assign.component";
import { SmeManagementComponent } from "./sme-management/sme-management.component";
import { TeamManagementComponent } from "./team-management/team-management.component";

const routes :Routes = [
    {path: '', component: TeamManagementComponent,
      children: [
          {path: 'caller-assign', component: CallerAssignComponent,
             children: [
               {path: 'add-caller', component: AddCallerComponent},
               {path: '', redirectTo: 'add-caller', pathMatch:''}
             ]
          },
       {path: 'agent-management', component: AgentMgntComponent},
       {path: '', redirectTo: 'caller-assign', pathMatch:''}
      ]
    }
] 

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class TeamManagementRouingModule {}