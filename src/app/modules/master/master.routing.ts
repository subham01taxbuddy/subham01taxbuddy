import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CouponComponent } from "./pages/coupon/coupon.component";
import { MasterDataComponent } from "./pages/master-data/master-data.component";

const routes: Routes = [
    {
        path: '', component: MasterDataComponent,
        children: [
            { path: 'coupon', component: CouponComponent},
            { path: '', redirectTo: '/master/coupon', pathMatch: 'full'}
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MasterRouingModule {}