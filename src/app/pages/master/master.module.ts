import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { MasterDataComponent } from "./master-data/master-data.component";
import { MasterRouingModule } from "./master.routing";
import { CouponComponent } from './coupon/coupon.component';
import { NgxLoadingModule } from "ngx-loading";
import { AddCouponComponent } from './add-coupon/add-coupon.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

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