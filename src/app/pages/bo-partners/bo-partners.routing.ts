import { Routes, RouterModule } from '@angular/router';
import { BoPartnersComponent } from './bo-partners.component';

const routes: Routes = [
  {
    path: '', component: BoPartnersComponent,
    children: [
      { path: '', redirectTo: '/pages/bo-partners', pathMatch: 'full'}
    ]
},
];

export const BoPartnersRoutes = RouterModule.forChild(routes);
