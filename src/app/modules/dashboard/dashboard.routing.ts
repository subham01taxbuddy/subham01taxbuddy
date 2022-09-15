import { CallingBoardComponent } from './pages/calling-board/calling-board.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupExceptionComponent } from './pages/calling-board/signup-exception/signup-exception.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NewUserComponent } from './pages/new-user/new-user.component';
import { OpenStatusComponent } from './pages/open-status/open-status.component';
import { MainKnowlarityComponent } from './pages/knowlarity/main-knowlarity/main-knowlarity.component';
import { KnowlarityComponent } from './pages/knowlarity/knowlarity.component';
import { SmeWiseInfoComponent } from './pages/knowlarity/sme-wise-info/sme-wise-info.component';
import { CallWiseInfoComponent } from './pages/knowlarity/call-wise-info/call-wise-info.component';

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { path: 'quick-search', component: NewUserComponent }, //new-user  
            { path: 'quick-search/:mobileNo', component: NewUserComponent },
            // {
            //     path: 'engagement', component: EngagementComponent,
            //     children: [
            //         { path: 'kommunicate', component: KommunicateComponent },
            //         { path: 'whatsapp', component: WhatsappComponent },
            //         { path: '', redirectTo: 'kommunicate', pathMatch: 'full' }
            //     ]
            // },
            {
                path: 'calling', component: CallingBoardComponent,
                children: [
                    // { path: 'todays-call', component: TodaysCallsComponent },
                    // { path: 'calling2', component: Calling2dot0Component },
                    // { path: 'scheduled-call', component: ScheduledCallComponent },
                    { path: 'signup-exception', component: SignupExceptionComponent },
                    { path: '', redirectTo: 'signup-exception', pathMatch: 'full' }
                ]
            },
            // {
            //     path: 'status-wise', component: StatusWiseClientsComponent,
            //     children: [
            //         { path: 'all', component: InterestedClientsComponent },
            //         { path: 'engagement', component: EngagementStatusComponent },
            //         { path: 'filing', component: FilingStatusComponent },
            //         { path: 'payment', component: PaymentStatusComponent },
            //         { path: 'tpa-clients', component: TpaClientsComponent },
            //         { path: '', redirectTo: 'all', pathMatch: 'full' }
            //     ]
            // },
            // { path: 'interested-clients', component: InterestedClientsComponent },
            { path: 'open-status', component: OpenStatusComponent },
            {
                path: 'knowlarity', component: KnowlarityComponent,
                children: [
                    { path: 'all', component: MainKnowlarityComponent },
                    { path: 'sme-wise', component: SmeWiseInfoComponent },
                    { path: 'call-wise', component: CallWiseInfoComponent },
                    { path: '', redirectTo: 'all', pathMatch: 'full' }
                ]
            },
            { path: '', redirectTo: 'quick-search', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
