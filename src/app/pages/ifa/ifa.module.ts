import { PagesModule } from './../pages.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IfaComponent } from './ifa.component';
import { IfaRoutingModule } from './ifa-routing.module';
import { ClientListComponent } from './client-list/client-list.component';
import { ClaimClientComponent } from './claim-client/claim-client.component';
import { UnClaimClientComponent } from './un-claim-client/un-claim-client.component';

@NgModule({
  imports: [
    CommonModule,
    IfaRoutingModule,
    PagesModule
  ],
  declarations: [IfaComponent, ClientListComponent, ClaimClientComponent, UnClaimClientComponent]
})
export class IfaModule { }
