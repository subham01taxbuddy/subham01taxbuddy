import { StatusWiseClientsComponent } from './status-wise-clients/status-wise-clients.component';
import { TodaysCallsComponent } from './calling-board/todays-calls/todays-calls.component';
import { CallingBoardComponent } from './calling-board/calling-board.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NewUserComponent } from './new-user/new-user.component';
import { EngagementComponent } from './engagement/engagement.component';
import { KommunicateComponent } from './engagement/kommunicate/kommunicate.component';
import { WhatsappComponent } from './engagement/whatsapp/whatsapp.component';
import { InterestedClientsComponent } from './interested-clients/interested-clients.component';
import { OpenStatusComponent } from './open-status/open-status.component';
import { KnowlarityComponent } from './knowlarity/knowlarity.component';
import { Calling2dot0Component } from './calling-board/calling2dot0/calling2dot0.component';
import { ScheduledCallComponent } from './calling-board/scheduled-call/scheduled-call.component';
import { SignupExceptionComponent } from './calling-board/signup-exception/signup-exception.component';
import { EngagementStatusComponent } from './status-wise-clients/engagement-status/engagement-status.component';
import { FilingStatusComponent } from './status-wise-clients/filing-status/filing-status.component';
import { PaymentStatusComponent } from './status-wise-clients/payment-status/payment-status.component';

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { path: 'quick-search', component: NewUserComponent }, //new-user  
            { path: 'quick-search/:mobileNo', component: NewUserComponent },
            {
                path: 'engagement', component: EngagementComponent,
                children: [
                    { path: 'kommunicate', component: KommunicateComponent },
                    { path: 'whatsapp', component: WhatsappComponent },
                    { path: '', redirectTo: 'kommunicate', pathMatch: 'full' }
                ]
            },
            {
                path: 'calling', component: CallingBoardComponent,
                children: [
                    { path: 'todays-call', component: TodaysCallsComponent },
                    { path: 'calling2', component: Calling2dot0Component },
                    { path: 'scheduled-call', component: ScheduledCallComponent },
                    { path: 'signup-exception', component: SignupExceptionComponent },
                    { path: '', redirectTo: 'calling2', pathMatch: 'full' }
                ]
            },
            {
                path: 'status-wise', component: StatusWiseClientsComponent,
                children: [
                    { path: 'all', component: InterestedClientsComponent },
                    { path: 'engagement', component: EngagementStatusComponent },
                    { path: 'filing', component: FilingStatusComponent },
                    { path: 'payment', component: PaymentStatusComponent },
                    { path: '', redirectTo: 'all', pathMatch: 'full' }
                ]
            },
            // { path: 'interested-clients', component: InterestedClientsComponent },
            { path: 'open-status', component: OpenStatusComponent },
            { path: 'knowlarity', component: KnowlarityComponent },
            { path: '', redirectTo: 'quick-search', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
