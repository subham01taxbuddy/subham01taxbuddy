import { UsersListComponent } from './users-list/users-list.component';
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserManagementComponent } from "./user-management.component";

const routes: Routes = [
    {
        path: '', component: UserManagementComponent,
        children: [
            { path: 'users', component: UsersListComponent },
            // { path: 'invoices', component: InvoicesStatusComponent },
            // { path: 'sub/:subscriptionId', component: AddNewPlanComponent },
            // { path: 'add-invoice', component: AddInvoiceComponent },
            { path: '', redirectTo: '/pages/user-management/users', pathMatch: 'full' }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserManagementRoutingModule { }