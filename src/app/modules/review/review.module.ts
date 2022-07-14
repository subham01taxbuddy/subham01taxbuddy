import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewRoutingModule } from './review-routing.module';
import { ReviewListComponent } from './pages/review-list/review-list.component';
import { AddUpdateReviewComponent } from './components/add-update-review/add-update-review.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { ViewReviewComponent } from './components/view-review/view-review.component';
import { UpdateSmeNotesComponent } from './components/update-sme-notes/update-sme-notes.component';


@NgModule({
  declarations: [
    ReviewListComponent,
    AddUpdateReviewComponent,
    ViewReviewComponent,
    UpdateSmeNotesComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxLoadingModule.forRoot({}),
  ]
})
export class ReviewModule { }
