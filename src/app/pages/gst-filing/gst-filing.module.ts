import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagesModule } from './../pages.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { GstFilingRoutingModule } from './gst-filing.routing';
import { GstFilingComponent } from './gst-filing.component';
import { GstCloudComponent } from './gst-cloud/gst-cloud.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GstFilingRoutingModule,
        NgxLoadingModule.forRoot({}),
        // NgxImageZoomModule.forRoot(),
        PdfViewerModule,
        SharedModule,
        PagesModule,
        NgxDocViewerModule
    ],
    declarations: [
        GstFilingComponent,
        GstCloudComponent,

    ],
    entryComponents: []

})
export class GstFilingModule { }
