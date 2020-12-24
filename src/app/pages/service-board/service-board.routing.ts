import { PreparingItrComponent } from './preparing-itr/preparing-itr.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocUploadedComponent } from './doc-uploaded/doc-uploaded.component';
import { ServiceBoardComponent } from './service-board.component';
import { AwatingConfirmationComponent } from './awating-confirmation/awating-confirmation.component';

const routes: Routes = [
    {
        path: '', component: ServiceBoardComponent,
        children: [
            { path: 'doc-uploaded', component: DocUploadedComponent },
            { path: 'preparing-itr', component: PreparingItrComponent },
            { path: 'awating-confirmation', component: AwatingConfirmationComponent },
            { path: '', redirectTo: 'doc-uploaded', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiceBoardRoutingModule { }
