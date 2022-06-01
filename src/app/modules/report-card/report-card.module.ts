import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportCardRoutingModule } from './report-card.routing';
import { SmeComponent } from './pages/sme/sme.component';
import { ReportCardComponent } from './report-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ReportCardComponent,
    SmeComponent
  ],
  imports: [
    CommonModule,
    ReportCardRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ReportCardModule { }
