import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { WhatAppChatComponent } from "./what-app-chat/what-app-chat.component";

const routes: Routes= [
    {path: '', component: WhatAppChatComponent}
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChatCornerRoutingModule {}