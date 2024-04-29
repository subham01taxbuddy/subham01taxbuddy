import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChatComponent } from './user-chat/user-chat.component';
import { ChatUIComponent } from './chat-ui/chat-ui.component';
import { FloatingWidgetComponent } from './floating-widget/floating-widget.component';
import { FormsModule } from '@angular/forms';
   
@NgModule({
  declarations: [
     UserChatComponent,
     ChatUIComponent,
      FloatingWidgetComponent
   ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [UserChatComponent,ChatUIComponent, FloatingWidgetComponent]
})
export class ChatModule { }
