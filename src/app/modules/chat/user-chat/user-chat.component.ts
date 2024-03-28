import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css']
})
export class UserChatComponent implements OnInit {

  @Input() user: any;
  @Input() filetype: string;
  @Output() back = new EventEmitter<void>()

  userInput: string = '';

  goBack(){
    this.back.emit();
  }

  sendMessage(){
    const message = this.userInput;
  }


  constructor() { }

  ngOnInit(): void {
  }

}
