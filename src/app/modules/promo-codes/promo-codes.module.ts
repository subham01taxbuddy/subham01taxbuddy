import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoCodesComponent } from './promo-codes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { PromoCodeRoutes } from './promo-codes.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    PromoCodeRoutes,
    NgxLoadingModule.forRoot({}),
  ],
  declarations: [
    PromoCodesComponent
  ],
  entryComponents: [
    PromoCodesComponent,
  ],
})
export class PromoCodesModule { }
