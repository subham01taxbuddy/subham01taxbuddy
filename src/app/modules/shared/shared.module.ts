import {
  MatDialog,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { KommunicateDialogComponent } from '../itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  UpperCaseDirective,
  InputDataMaskDirective,
  CapitalizeFirstDirective,
} from './input-data-mask.directive';
import { AgGridModule } from 'ag-grid-angular';
import { CustomDateComponent } from './date.component';
import { MatSelectComponent } from './mat-select.component';
import { MaterialModule } from './material.module';
import { AgGridMaterialSelectEditorComponent } from './dropdown.component';
import { CommonModule } from '@angular/common';
import { MatInputComponent } from './mat-input.component';
import { UserNotesComponent } from './components/user-notes/user-notes.component';
import { AddCallLogComponent } from './components/add-call-log/add-call-log.component';
import { ItrActionsComponent } from './components/itr-actions/itr-actions.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { FyDropDownComponent } from './components/fy-drop-down/fy-drop-down.component';
import { ChangeStatusComponent } from './components/change-status/change-status.component';
import { SmeListDropDownComponent } from './components/sme-list-drop-down/sme-list-drop-down.component';
import { CallReassignmentComponent } from './components/call-reassignment/call-reassignment.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxLoadingModule } from 'ngx-loading';
import { StorageService } from './services/storage.service';
import { LayoutComponent } from './components/layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { DirectCallingComponent } from './components/direct-calling/direct-calling.component';
import { KnowlarityNotificationComponent } from './components/knowlarity-notification/knowlarity-notification.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { UpdateManualFilingDialogComponent } from './components/update-manual-filing-dialog/update-manual-filing-dialog.component';
import { CurrencyPipe } from 'src/app/pipes/currency.pipe';
import { ShimmerModule } from '@sreyaj/ng-shimmer';
import { DigitsOnlyDirective } from './directives/digits-only.directive';
import { AgTooltipComponent } from './components/ag-tooltip/ag-tooltip.component';
import { NumbersOnlyDirective } from './directives/numbers-only.directive';
import { WhatsAppDialogComponent } from '../itr-filing/whats-app-dialog/whats-app-dialog.component';
import { FilingStatusDialogComponent } from '../itr-filing/filing-status-dialog/filing-status-dialog.component';
import { UpdateStatusComponent } from '../itr-filing/update-status/update-status.component';
import { Schedules } from './interfaces/schedules';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ServiceDropDownComponent } from './components/service-drop-down/service-drop-down.component';
import { CoOwnerListDropDownComponent } from './components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { RequestManager } from "./services/request-manager";
import { LeaderListDropdownComponent } from './components/leader-list-dropdown/leader-list-dropdown.component';
@NgModule({
  declarations: [
    UpperCaseDirective,
    CapitalizeFirstDirective,
    InputDataMaskDirective,
    CustomDateComponent,
    MatSelectComponent,
    MatInputComponent,
    AgGridMaterialSelectEditorComponent,
    WhatsAppDialogComponent,
    UserNotesComponent,
    AddCallLogComponent,
    FilingStatusDialogComponent,
    UpdateStatusComponent,
    KommunicateDialogComponent,
    ItrActionsComponent,
    DocumentViewerComponent,
    FyDropDownComponent,
    ChangeStatusComponent,
    SmeListDropDownComponent,
    CallReassignmentComponent,
    LayoutComponent,
    SidebarComponent,
    NavbarComponent,
    DirectCallingComponent,
    KnowlarityNotificationComponent,
    UpdateManualFilingDialogComponent,
    CurrencyPipe,
    DigitsOnlyDirective,
    AgTooltipComponent,
    NumbersOnlyDirective,
    ConfirmDialogComponent,
    ServiceDropDownComponent,
    CoOwnerListDropDownComponent,
    LeaderListDropdownComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatBottomSheetModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AgGridModule.withComponents([
      CustomDateComponent,
      AgGridMaterialSelectEditorComponent,
      MatInputComponent,
      AgTooltipComponent,
      /* CheckboxRenderer */
    ]), //MatSelectComponent,
    NgxPaginationModule,
    NgxImageZoomModule,
    NgxDocViewerModule,
    NgxLoadingModule.forRoot({}),
    ShimmerModule,
    MatDialogModule,
  ],
  exports: [
    CommonModule,
    UpperCaseDirective,
    CapitalizeFirstDirective,
    InputDataMaskDirective,
    MaterialModule,
    CustomDateComponent,
    MatSelectComponent,
    AgGridModule,
    MatInputComponent,
    AgGridMaterialSelectEditorComponent,
    WhatsAppDialogComponent,
    UserNotesComponent,
    AddCallLogComponent,
    FilingStatusDialogComponent,
    UpdateStatusComponent,
    KommunicateDialogComponent,
    ItrActionsComponent,
    DocumentViewerComponent,
    FyDropDownComponent,
    ChangeStatusComponent,
    SmeListDropDownComponent,
    CallReassignmentComponent,
    NgxLoadingModule,
    LayoutComponent,
    KnowlarityNotificationComponent,
    UpdateManualFilingDialogComponent,
    CurrencyPipe,
    ShimmerModule,
    DigitsOnlyDirective,
    AgTooltipComponent,
    NumbersOnlyDirective,
    Schedules,
    ServiceDropDownComponent,
    CoOwnerListDropDownComponent,
    LeaderListDropdownComponent,
  ],
  providers: [StorageService, Schedules, RequestManager],
  entryComponents: [
    WhatsAppDialogComponent,
    UserNotesComponent,
    AddCallLogComponent,
    FilingStatusDialogComponent,
    KommunicateDialogComponent,
    ItrActionsComponent,
    ChangeStatusComponent,
    CallReassignmentComponent,
    UpdateManualFilingDialogComponent,
    AgTooltipComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
