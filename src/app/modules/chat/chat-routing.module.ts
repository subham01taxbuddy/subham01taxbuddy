import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatUIComponent } from './chat-ui/chat-ui.component';



const routes: Routes = [
  { path: '', component: ChatUIComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
