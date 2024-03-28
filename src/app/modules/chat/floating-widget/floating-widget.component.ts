import { Component, OnInit} from '@angular/core';
import { widgetVisibility } from './animation';
 

@Component({
  selector: 'app-floating-widget',
  templateUrl: './floating-widget.component.html',
  styleUrls: ['./floating-widget.component.scss'],
  animations: [widgetVisibility],
})
export class FloatingWidgetComponent implements OnInit {

  constructor(){}

  showWidget = 'visible';
  selectedUser: any = null;

  // openUserChat(user: any){
  //   this.selectedUser = user;
  //   this.router.navigate(['/user-chat']);
  // }

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

  getCurrentTime(): string{
      const now = new Date()
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      return formattedTime;
  }



  ngOnInit(): void {

  }

}
