import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {
  @Input() viewer: any;
  @Input() docUrl: any;

  constructor() { }

  ngOnInit() {
    console.log('viewer:', this.viewer, '........... Signed URL:', this.docUrl)
  }

}
