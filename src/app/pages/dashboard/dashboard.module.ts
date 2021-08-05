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

@NgModule({
    declarations: [DashboardComponent, NewUserComponent, EngagementComponent, KommunicateComponent, WhatsappComponent, CallingBoardComponent, TodaysCallsComponent, InterestedClientsComponent, OpenStatusComponent],
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
})
export class DashboardModule { }
