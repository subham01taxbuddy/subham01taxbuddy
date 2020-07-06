import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { PagesModule } from './../pages.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItrFilingRoutingModule } from './itr-filing.routing';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { ItrFilingComponent } from './itr-filing.component';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ItrFilingRoutingModule,
        NgxLoadingModule.forRoot({}),
        NgxImageZoomModule.forRoot(),
        PdfViewerModule,
        SharedModule
    ],
    declarations: [ItrFilingComponent, UsersComponent, CustomerProfileComponent]
})
export class ItrFilingModule { }
