import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.css']
})
export class CustomButtonComponent implements OnInit {
  @Input() action: () => Promise<void>;
  isProcessing = false;

  constructor() { }

  ngOnInit() {
  }

  async handleClick() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      await this.action();
    } catch (error) {
      console.log('Action failed', error);
    } finally {
      this.isProcessing = false;
    }
  }

}
