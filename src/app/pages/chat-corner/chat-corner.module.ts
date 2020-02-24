import { NgModule } from "@angular/core";
import { WhatAppChatComponent } from './what-app-chat/what-app-chat.component';
import { ChatCornerRoutingModule } from "./chat-corner-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";

@NgModule({
     declarations:[
          WhatAppChatComponent
     ],
     imports:[
          ChatCornerRoutingModule,
          CommonModule,
          FormsModule,
          ReactiveFormsModule,
          HttpClientModule,
          SharedModule,
          NgxLoadingModule.forRoot({}),
     ]
})
export class ChatCornerModule {}