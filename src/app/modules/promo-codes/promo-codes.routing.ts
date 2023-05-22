import { Routes, RouterModule } from '@angular/router';
import { PromoCodesComponent } from './promo-codes.component';


const routes: Routes = [
  {
    path: '', component: PromoCodesComponent,
    children: [
      { path: '', redirectTo: '/promo-code', pathMatch: 'full'}
    ]
},
];

export const PromoCodeRoutes = RouterModule.forChild(routes);
