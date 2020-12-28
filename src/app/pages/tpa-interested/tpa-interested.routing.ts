import { CompletedListComponent } from './completed-list/completed-list.component';
import { InterestedListComponent } from './interested-list/interested-list.component';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TpaClientListComponent } from "./tpa-client-list/tpa-client-list.component";
import { TpaInterestedComponent } from "./tpa-interested.component";
import { UserDocumentsComponent } from "./user-documents/user-documents.component";

/* const routes: Routes = [
    { path: '', component: TpaClientListComponent },
    { path: 'list', component: TpaClientListComponent },
    { path: 'list/:userId', component: UserDocumentsComponent }

] */
const routes: Routes = [
    {
        path: '', component: TpaInterestedComponent,
        children: [
            { path: 'interested', component: InterestedListComponent },
            { path: 'completed', component: CompletedListComponent },
            { path: '', redirectTo: 'interested', pathMatch: 'full' }
        ]
    },
    { path: 'list/:userId', component: UserDocumentsComponent }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class TpaInterestedRoutingModule { }