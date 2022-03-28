
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagesModule } from '../../pages/pages.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from 'src/app/services/token-interceptor';
import { DashboardRoutingModule } from './dashboard.routing';
import { NewUserComponent } from './pages/new-user/new-user.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { EngagementComponent } from './pages/engagement/engagement.component';
import { KommunicateComponent } from './pages/engagement/kommunicate/kommunicate.component';
import { WhatsappComponent } from './pages/engagement/whatsapp/whatsapp.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { CallingBoardComponent } from './pages/calling-board/calling-board.component';
import { TodaysCallsComponent } from './pages/calling-board/todays-calls/todays-calls.component';
import { InterestedClientsComponent } from './pages/interested-clients/interested-clients.component';
import { OpenStatusComponent } from './pages/open-status/open-status.component';
import { KnowlarityComponent } from './pages/knowlarity/knowlarity.component';
import { Calling2dot0Component } from './pages/calling-board/calling2dot0/calling2dot0.component';
import { ScheduledCallComponent } from './pages/calling-board/scheduled-call/scheduled-call.component';
import { DownloadDialogComponent } from './pages/interested-clients/download-dialog/download-dialog.component';
import { SignupExceptionComponent } from './pages/calling-board/signup-exception/signup-exception.component';
import { StatusWiseClientsComponent } from './pages/status-wise-clients/status-wise-clients.component';
import { EngagementStatusComponent } from './pages/status-wise-clients/engagement-status/engagement-status.component';
import { StatusWiseGirdDataComponent } from './pages/status-wise-clients/status-wise-gird-data/status-wise-gird-data.component';
import { FilingStatusComponent } from './pages/status-wise-clients/filing-status/filing-status.component';
import { PaymentStatusComponent } from './pages/status-wise-clients/payment-status/payment-status.component';
import { TpaClientsComponent } from './pages/status-wise-clients/tpa-clients/tpa-clients.component';
import { MainKnowlarityComponent } from './pages/knowlarity/main-knowlarity/main-knowlarity.component';
import { SmeWiseInfoComponent } from './pages/knowlarity/sme-wise-info/sme-wise-info.component';
import { CallWiseInfoComponent } from './pages/knowlarity/call-wise-info/call-wise-info.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

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
