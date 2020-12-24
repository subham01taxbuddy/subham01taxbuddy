import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagesModule } from '../pages.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from 'app/services/token-interceptor';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'app/shared/shared.module';
import { ServiceBoardComponent } from './service-board.component';
import { ServiceBoardRoutingModule } from './service-board.routing';
import { DocUploadedComponent } from './doc-uploaded/doc-uploaded.component';

@NgModule({
    declarations: [
        ServiceBoardComponent,
        DocUploadedComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ServiceBoardRoutingModule,
        PagesModule,
        NgxPaginationModule,
        SharedModule
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true,
    }],
})
export class ServiceBoardModule { }
