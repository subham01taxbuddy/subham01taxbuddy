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

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { path: 'new-user', component: NewUserComponent },
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
                    { path: '', redirectTo: 'todays-call', pathMatch: 'full' }
                ]
            },
            { path: 'interested-clients', component: InterestedClientsComponent },
            { path: '', redirectTo: 'new-user', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
