import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TpaClientListComponent } from "./tpa-client-list/tpa-client-list.component";
import { UserDocumentsComponent } from "./user-documents/user-documents.component";

const routes: Routes = [
    { path: '', component: TpaClientListComponent },
    { path: 'list', component: TpaClientListComponent },
    { path: 'list/:userId', component: UserDocumentsComponent }

]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class TpaInterestedRoutingModule { }