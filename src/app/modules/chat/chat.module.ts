import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatUIComponent } from './chat-ui/chat-ui.component';
import { FloatingWidgetComponent } from './floating-widget/floating-widget.component';
import { UserChatComponent } from './user-chat/user-chat.component';



@NgModule({
  declarations: [
    ChatUIComponent,
    UserChatComponent
  ],
  imports: [
    CommonModule
  ],
})
export class ChatModule { }
