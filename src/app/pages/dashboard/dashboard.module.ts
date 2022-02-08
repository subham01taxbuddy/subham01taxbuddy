import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagesModule } from '../pages.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from 'app/services/token-interceptor';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard.routing';
import { NewUserComponent } from './new-user/new-user.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { EngagementComponent } from './engagement/engagement.component';
import { KommunicateComponent } from './engagement/kommunicate/kommunicate.component';
import { WhatsappComponent } from './engagement/whatsapp/whatsapp.component';
import { SharedModule } from 'app/shared/shared.module';
import { CallingBoardComponent } from './calling-board/calling-board.component';
import { TodaysCallsComponent } from './calling-board/todays-calls/todays-calls.component';
import { InterestedClientsComponent } from './interested-clients/interested-clients.component';
import { OpenStatusComponent } from './open-status/open-status.component';
import { KnowlarityComponent } from './knowlarity/knowlarity.component';
import { Calling2dot0Component } from './calling-board/calling2dot0/calling2dot0.component';
import { ScheduledCallComponent } from './calling-board/scheduled-call/scheduled-call.component';
import { DownloadDialogComponent } from './interested-clients/download-dialog/download-dialog.component';
import { SignupExceptionComponent } from './calling-board/signup-exception/signup-exception.component';
import { StatusWiseClientsComponent } from './status-wise-clients/status-wise-clients.component';
import { EngagementStatusComponent } from './status-wise-clients/engagement-status/engagement-status.component';
import { StatusWiseGirdDataComponent } from './status-wise-clients/status-wise-gird-data/status-wise-gird-data.component';
import { FilingStatusComponent } from './status-wise-clients/filing-status/filing-status.component';
import { PaymentStatusComponent } from './status-wise-clients/payment-status/payment-status.component';
import { TpaClientsComponent } from './status-wise-clients/tpa-clients/tpa-clients.component';
import { MainKnowlarityComponent } from './knowlarity/main-knowlarity/main-knowlarity.component';
import { SmeWiseInfoComponent } from './knowlarity/sme-wise-info/sme-wise-info.component';
import { CallWiseInfoComponent } from './knowlarity/call-wise-info/call-wise-info.component';

@NgModule({
    declarations: [DashboardComponent,
        NewUserComponent,
        EngagementComponent,
        KommunicateComponent,
        WhatsappComponent,
        CallingBoardComponent,
        TodaysCallsComponent,
        InterestedClientsComponent,
        OpenStatusComponent,
        KnowlarityComponent,
        Calling2dot0Component,
        ScheduledCallComponent,
        DownloadDialogComponent,
        SignupExceptionComponent,
        StatusWiseClientsComponent,
        EngagementStatusComponent,
        StatusWiseGirdDataComponent,
        FilingStatusComponent,
        PaymentStatusComponent,
        TpaClientsComponent,
        MainKnowlarityComponent,
        SmeWiseInfoComponent,
        CallWiseInfoComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardRoutingModule,
        PagesModule,
        NgxPaginationModule,
        SharedModule
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true,
    }],
    entryComponents: [DownloadDialogComponent]
})
export class DashboardModule { }
