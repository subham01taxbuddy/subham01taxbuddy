import { BoPartnersRoutes } from './bo-partners.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoPartnersComponent } from './bo-partners.component';
import { NgxLoadingModule } from 'ngx-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { UpdateStatusComponent } from './update-status/update-status.component';
import { ViewDocumentsComponent } from './view-documents/view-documents.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    BoPartnersRoutes,
    NgxLoadingModule.forRoot({}),
  ],
  declarations: [
    BoPartnersComponent,
    UpdateStatusComponent,
    ViewDocumentsComponent,
  ],
  entryComponents: [
    BoPartnersComponent,
    UpdateStatusComponent,
    ViewDocumentsComponent,
  ],
})
export class BoPartnersModule {}
