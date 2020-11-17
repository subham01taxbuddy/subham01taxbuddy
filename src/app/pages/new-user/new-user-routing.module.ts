import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateUserComponent } from "./create-user/create-user.component";
import { MailExceptionComponent } from "./mail-exception/mail-exception.component";
import { MailUserComponent } from "./mail-user/mail-user.component";
import { NewUserWizardComponent } from "./new-user-wizard/new-user-wizard.component";

const routes: Routes= [
    {path: '', component: NewUserWizardComponent, 
    children:[
        {path: 'createUser', component: CreateUserComponent},
        {path: 'mail-user', component: MailUserComponent},
        {path: 'mail-exception', component: MailExceptionComponent},
        {path: '', redirectTo: '/pages/newUser/mail-user', pathMatch: 'full' },
     ]
  },
   
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NewUserRoutingModule {}