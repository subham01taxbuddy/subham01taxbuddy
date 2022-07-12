import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddUpdateReviewComponent } from './components/add-update-review/add-update-review.component';
import { ReviewListComponent } from './pages/review-list/review-list.component';

const routes: Routes = [
  {
    path:'',
    children:[
    {  path:'', component:ReviewListComponent},
    {  path:'add', component:AddUpdateReviewComponent}
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewRoutingModule { }
