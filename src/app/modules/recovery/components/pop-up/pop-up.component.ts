import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent {
  formattedData: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.formattedData = JSON.stringify(data, null, 2);
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getObjectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }
}
