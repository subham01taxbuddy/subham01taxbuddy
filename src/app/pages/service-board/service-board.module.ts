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
import { PreparingItrComponent } from './preparing-itr/preparing-itr.component';
import { AwatingConfirmationComponent } from './awating-confirmation/awating-confirmation.component';
import { InvoiceToBeGenerateComponent } from './invoice-to-be-generate/invoice-to-be-generate.component';
import { FilingStatusTableComponent } from './filing-status-table/filing-status-table.component';
import { UnpaidInvoicesComponent } from './unpaid-invoices/unpaid-invoices.component';
import { ServiceGridTableComponent } from './service-grid-table/service-grid-table.component';

@NgModule({
    declarations: [
        ServiceBoardComponent,
        DocUploadedComponent,
        PreparingItrComponent,
        AwatingConfirmationComponent,
        InvoiceToBeGenerateComponent,
        FilingStatusTableComponent,
        UnpaidInvoicesComponent,
        ServiceGridTableComponent,
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
