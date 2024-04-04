import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-calculator-modal',
  templateUrl: './calculator-modal.component.html',
  styleUrls: ['./calculator-modal.component.scss']
})
export class CalculatorModalComponent implements OnInit {
  urlSafe: SafeResourceUrl = '';
  constructor( public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    console.log('data from cal',this.data)
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
  }

}
