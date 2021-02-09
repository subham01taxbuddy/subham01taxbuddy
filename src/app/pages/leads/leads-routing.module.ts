import { Route } from "@angular/compiler/src/core";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LeadsHeadComponent } from "./leads-head/leads-head.component";
import { LeadsInfoComponent } from "./leads-info/leads-info.component";

const routes : Routes = [
    { path: '', component: LeadsHeadComponent,
        children: [
            {path: 'leads', component: LeadsInfoComponent},
            {path: '', component: LeadsInfoComponent}
        ]
    },
] 

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeadsRoutingModule {}