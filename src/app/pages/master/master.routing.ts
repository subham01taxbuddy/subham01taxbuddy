import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CouponComponent } from "./coupon/coupon.component";
import { MasterDataComponent } from "./master-data/master-data.component";

const routes: Routes = [
    {
        path: '', component: MasterDataComponent,
        children: [
            { path: 'coupon', component: CouponComponent},
            { path: '', redirectTo: '/pages/master/coupon', pathMatch: 'full'}
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MasterRouingModule {}