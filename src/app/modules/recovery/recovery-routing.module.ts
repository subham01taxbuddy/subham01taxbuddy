import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecoveryDataComponent } from './components/recovery-data/recovery-data.component';

const routes: Routes = [
  {path:'data', component: RecoveryDataComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecoveryRoutingModule { }
