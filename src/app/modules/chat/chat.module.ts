import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChatComponent } from './user-chat/user-chat.component';
import { ChatUIComponent } from './chat-ui/chat-ui.component';


@NgModule({
  declarations: [
     UserChatComponent,
     ChatUIComponent
   ],
  imports: [
    CommonModule
  ],
  exports: [UserChatComponent,ChatUIComponent]
})
export class ChatModule { }
