import { Routes, RouterModule } from '@angular/router';
import { AcademyCoursesComponent } from './academy-courses.component';



const routes: Routes = [
  {
    path: '', component:AcademyCoursesComponent,
    children: [
      { path: '', redirectTo: '/academy-courses', pathMatch: 'full'}
    ]
},
];

export const AcademyCoursesRoutes = RouterModule.forChild(routes);
