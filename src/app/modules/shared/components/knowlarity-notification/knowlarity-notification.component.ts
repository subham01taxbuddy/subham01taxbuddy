import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-knowlarity-notification',
  templateUrl: './knowlarity-notification.component.html',
  styleUrls: ['./knowlarity-notification.component.scss']
})
export class KnowlarityNotificationComponent {

  phoneNumber = '';
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private matBottomSheet: MatBottomSheet
  ) {
    this.phoneNumber = data.customer_number;
    setTimeout(() => {
      this.close();
    }, 10000)
  }



  close() {
    this.matBottomSheet.dismiss();
  }
}
