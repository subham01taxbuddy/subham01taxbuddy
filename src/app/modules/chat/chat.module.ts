import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { UserChatComponent } from './user-chat/user-chat.component';
import { ChatUIComponent } from './chat-ui/chat-ui.component';
import { FloatingWidgetComponent } from './floating-widget/floating-widget.component';
import { FormsModule } from '@angular/forms';
import { PushNotificationComponent } from './push-notification/push-notification.component';
   
@NgModule({
  declarations: [
     UserChatComponent,
     ChatUIComponent,
      FloatingWidgetComponent,
      PushNotificationComponent
   ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
    
  ],
  exports: [UserChatComponent,ChatUIComponent, FloatingWidgetComponent]
})
export class ChatModule { }
