import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import { NgxPaginationModule } from "ngx-pagination";
import { PagesModule } from "../pages.module";
import { CreateUserComponent } from './create-user/create-user.component';
import { NewUserRoutingModule } from "./new-user-routing.module";
import { NewUserWizardComponent } from './new-user-wizard/new-user-wizard.component';
import { MailUserComponent } from './mail-user/mail-user.component';
import { MailExceptionComponent } from './mail-exception/mail-exception.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserHistryComponent } from "./user-histry/user-histry.component";

@NgModule({
    declarations: [CreateUserComponent, NewUserWizardComponent, MailUserComponent, MailExceptionComponent, EditUserComponent, UserHistryComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NewUserRoutingModule,
        PagesModule,
        NgxPaginationModule,
        SharedModule
    ],
    entryComponents: [UserHistryComponent]
})
export class NewUserModule {}