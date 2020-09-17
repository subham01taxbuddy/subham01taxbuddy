import { MaterialModule } from 'app/shared/material.module';
import { NgModule } from "@angular/core";
import { WhatAppChatComponent } from './what-app-chat/what-app-chat.component';
import { ChatCornerRoutingModule } from "./chat-corner-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { RecentChatListComponent } from './recent-chat-list/recent-chat-list.component';

@NgModule({
     declarations: [
          WhatAppChatComponent,
          RecentChatListComponent
     ],
     imports: [
          ChatCornerRoutingModule,
          CommonModule,
          FormsModule,
          ReactiveFormsModule,
          HttpClientModule,
          SharedModule,
          MaterialModule,
          NgxLoadingModule.forRoot({}),
     ]
})
export class ChatCornerModule { }