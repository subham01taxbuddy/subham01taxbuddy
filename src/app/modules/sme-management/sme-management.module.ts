import { MatCardModule } from '@angular/material/card';
import { AssignmentComponent } from './pages/assignment/assignment.component';
import { SmeManagementComponent } from './sme-management.component';
import { CreateSmeComponent } from './pages/create-sme/create-sme.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { MaterialModule } from "src/app/modules/shared/material.module";
import { AgGridModule } from "ag-grid-angular";
import { NgxPaginationModule } from "ngx-pagination";
import { SmeManagementRoutingModule } from './sme-management.routing';
import { SmeListComponent } from './pages/sme-list/sme-list.component';
import { SmeLeftComponent } from './pages/sme-left/sme-left.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxLoadingModule.forRoot({}),
        SharedModule,
        AgGridModule,
        MaterialModule,
        NgxPaginationModule,
        SmeManagementRoutingModule,
        MatCardModule
    ],
    declarations: [
        SmeManagementComponent,
        SmeListComponent,
        CreateSmeComponent,
        AssignmentComponent,
        SmeLeftComponent
    ],
    entryComponents: []

})
export class SmeManagementModule { }
