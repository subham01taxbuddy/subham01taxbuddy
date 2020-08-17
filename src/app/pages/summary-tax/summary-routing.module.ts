import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TaxSummaryComponent } from "./tax-summary/tax-summary.component";
import { Itr2mainComponent } from "./itr2main/itr2main.component";
import { WhatAppChatComponent } from "../chat-corner/what-app-chat/what-app-chat.component";

const routes: Routes = [
    { path: '', component: TaxSummaryComponent},
    { path: 'itrSecond', component: Itr2mainComponent }
   
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SummaryRoutingModule {}