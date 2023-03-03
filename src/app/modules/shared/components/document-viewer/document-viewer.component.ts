import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {

  @ViewChild('lib-ngx-image-zoom') photoZoomWrapper;

  zoomContainerWidth = 400;
  zoomContainerHeight = 400;

  @Input() viewer: any;
  @Input() docUrl: any;

  constructor() { }

  ngOnInit() {
    console.log('viewer:', this.viewer, '........... Signed URL:', this.docUrl)
    this.zoomContainerWidth = this.photoZoomWrapper.parent.width;
    this.zoomContainerHeight = this.photoZoomWrapper.parent.height;
    this.calculateZoomContainerDimensions(this.photoZoomWrapper.image);
  }

  private calculateZoomContainerDimensions(image: HTMLImageElement): void {
    const imageAspectRatio = image.width / image.height;

    const maxAvailableWidth = this.photoZoomWrapper.nativeElement.scrollWidth;
    const maxAvailableHeight = this.photoZoomWrapper.nativeElement.scrollHeight;

    let zoomContainerWidth = maxAvailableWidth;
    let zoomContainerHeight = zoomContainerWidth / imageAspectRatio;

    if (zoomContainerHeight > maxAvailableHeight) {
      zoomContainerHeight = maxAvailableHeight;
      zoomContainerWidth = zoomContainerHeight * imageAspectRatio;
    }

    this.zoomContainerWidth = zoomContainerWidth;
    this.zoomContainerHeight = zoomContainerHeight;
  }
}
