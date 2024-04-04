import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})
export class UserChatComponent implements OnInit {


  @Input() filetype: string;
  @Input() user: string;
  @Input() image: any; // Property to receive user image URL from parent
  @Input() username: string; // Property to receive username from parent
  @Input() requestId: string;

  fileToUpload: File | null = null;
  
  userInput: string = '';

  constructor(private chatService: ChatService) { }


  goBack(){

  }

  sendMessage(){
   }

   onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
    if (this.fileToUpload) {
     
      this.chatService.uploadFile(this.fileToUpload, this.requestId).subscribe((response: any) => {
        console.log('file upload response', response);
      })
     }
  }

  isPDFFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  isDOCFile(file: File): boolean {
    return file.type === 'application/msword';
  }

  ngOnInit(): void {
    
  }

}
