import { Component, OnInit} from '@angular/core';
import { widgetVisibility } from './animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';

@Component({
  selector: 'app-floating-widget',
  templateUrl: './floating-widget.component.html',
  styleUrls: ['./floating-widget.component.scss'],
  animations: [widgetVisibility],
})
export class FloatingWidgetComponent implements OnInit {

 
  constructor(private chatManager: ChatManager,
              private localStorage: LocalStorageService){}

  showWidget = 'visible';
  selectedUser: any = null;
  conversationList: any[] = []

  openUserChat(user: any){
    this.selectedUser = user;
   }

  closeWidget(){
    this.showWidget = 'hidden';
  }

  // goBack(){
  //   this.router.navigate(['']);
  // }
  


  users = [
    {id: 1,name: 'Saurabh',snippet: 'Hi Vishal, How are you...',image: 'assets/img/bill.png',showTime: true,notificationCount: 2},
    {id: 2,name: 'Shaibal',snippet: 'Hi Saurabh, Kya kar rahe ho...',image: 'assets/img/zukya.jpg',showTime: true,notificationCount: 0},
    {id: 3,name: 'Akash',snippet: "can't talk now. Will message you later...",image: 'assets/img/warren.webp',showTime: true,notificationCount: 1}
  ];

  getCurrentTime(timestamp: any): string{
      const now = new Date(timestamp)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      return formattedTime;
  }

  ngOnInit(): void {
   const convdata = this.localStorage.getItem('conversationList',true);
   console.log('conv data',convdata);
   if(convdata){
      const conversations = JSON.parse(convdata);
      this.conversationList = conversations.map((conversation: any) => {
        const user = this.users.find(u => u.name === conversation.name);
        if(user){
          return {
            image: user.image,
            name: conversation.name,
            text: conversation.text,
            timestamp: conversation.timestamp
          }
        }else{
          return {
            image: 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
            name: conversation.name,
            text: conversation.text,
            timestamp: conversation.timestamp
          }
        }
      })
      
    }
    }

   }

