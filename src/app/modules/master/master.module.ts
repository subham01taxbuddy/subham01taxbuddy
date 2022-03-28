import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { MasterRouingModule } from "./master.routing";
import { NgxLoadingModule } from "ngx-loading";
import { AddCouponComponent } from './pages/add-coupon/add-coupon.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MasterDataComponent } from "./pages/master-data/master-data.component";
import { CouponComponent } from "./pages/coupon/coupon.component";

@NgModule({
    declarations: [
        MasterDataComponent,
        CouponComponent,
        AddCouponComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MasterRouingModule,
        NgxLoadingModule.forRoot({}),
    ],
    entryComponents: [AddCouponComponent]
})

export class MasterModule {}