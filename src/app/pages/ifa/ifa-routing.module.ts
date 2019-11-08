import { IfaComponent } from './ifa.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { ClaimClientComponent } from './claim-client/claim-client.component';

const routes: Routes = [
    {
        path: '', component: IfaComponent,
        children: [
            { path: 'client-list', component: ClientListComponent },
            { path: 'claim-client', component: ClaimClientComponent },
            { path: '', redirectTo: '/pages/ifa/client-list', pathMatch: 'full' }
        ]
    },

    // { path: 'client-list', component: ClientListComponent },
    // { path: 'gst-cloud', component: GSTCloudComponent },
    // { path: 'business-documents', component: BusinessDocumentsComponent },
    // { path: 'party-list', component: PartyListComponent },
    // { path: 'import-party-list', component: ImportPartyListComponent },
    // { path: '', redirectTo: '/pages/ifa/client-list', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IfaRoutingModule { }
