import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChatComponent } from './user-chat/user-chat.component';


@NgModule({
  declarations: [
     UserChatComponent,
   ],
  imports: [
    CommonModule
  ],
  exports: [UserChatComponent]
})
export class ChatModule { }
