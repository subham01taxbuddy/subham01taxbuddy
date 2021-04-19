import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {
  @Input('viewer') viewer: any;
  @Input('docUrl') docUrl: any;

  constructor() { }

  ngOnInit() {
  }

}