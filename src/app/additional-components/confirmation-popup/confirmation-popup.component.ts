import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";


@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.css']
})
export class ConfirmationModalComponent  {
  isProceed!: boolean;
  confirmation_text = "NA";
  confirmation_popup_type = "";

  constructor(public modalRef: BsModalRef) { }  

  
  onClosePopup(isProceed
    :any){
    this.isProceed=isProceed;    
    this.modalRef.hide();    
  }
}

