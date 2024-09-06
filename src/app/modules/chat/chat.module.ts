import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { HighlightSearch, UserChatComponent } from './user-chat/user-chat.component';
import { ChatUIComponent } from './chat-ui/chat-ui.component';
import { FloatingWidgetComponent } from './floating-widget/floating-widget.component';
import { FormsModule } from '@angular/forms';
import { PushNotificationComponent } from './push-notification/push-notification.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ChatRoutingModule } from './chat-routing.module';

@NgModule({
  declarations: [
     UserChatComponent,
     ChatUIComponent,
      FloatingWidgetComponent,
      PushNotificationComponent,
      HighlightSearch
   ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    MaterialModule,
    InfiniteScrollModule
  ],
  exports: [UserChatComponent,ChatUIComponent, FloatingWidgetComponent]
})
export class ChatModule { }
