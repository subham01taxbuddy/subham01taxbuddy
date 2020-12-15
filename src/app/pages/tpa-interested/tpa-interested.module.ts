import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "app/shared/shared.module";
import { NgxLoadingModule } from "ngx-loading";
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TpaInterestedRoutingModule } from "./tpa-interested.routing";
import { TpaClientListComponent } from './tpa-client-list/tpa-client-list.component';
import { UserDocumentsComponent } from './user-documents/user-documents.component';

// import { WhatAppChatComponent } from "../chat-corner/what-app-chat/what-app-chat.component";

@NgModule({
    declarations: [TpaClientListComponent, UserDocumentsComponent],
    imports: [
        TpaInterestedRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedModule,
        NgxLoadingModule.forRoot({}),
        NgxImageZoomModule,
        PdfViewerModule

    ],
    entryComponents: []
})

export class TpaInterestedModule { }