import {MatDialogModule} from '@angular/material/dialog';
import { KommunicateDialogComponent } from '../itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  UpperCaseDirective,
  InputDataMaskDirective,
  CapitalizeFirstDirective,
  TwoDigitDecimaNumberDirective,
} from './input-data-mask.directive';
import { AgGridModule } from 'ag-grid-angular';
import { CustomDateComponent } from './date.component';
import { MatSelectComponent } from './mat-select.component';
import { MaterialModule } from './material.module';
import { AgGridMaterialSelectEditorComponent } from './dropdown.component';
import { CommonModule } from '@angular/common';
import { MatInputComponent } from './mat-input.component';
import { UserNotesComponent } from './components/user-notes/user-notes.component';
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
import { DigitsOnlyDirective } from './directives/digits-only.directive';
import { AgTooltipComponent } from './components/ag-tooltip/ag-tooltip.component';
import { NumbersOnlyDirective } from './directives/numbers-only.directive';
import { Schedules } from './interfaces/schedules';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ServiceDropDownComponent } from './components/service-drop-down/service-drop-down.component';
import { RequestManager } from './services/request-manager';
import { LeaderListDropdownComponent } from './components/leader-list-dropdown/leader-list-dropdown.component';
import { AddAffiliateIdComponent } from './components/add-affiliate-id/add-affiliate-id.component';
import { ViewDocumentsDialogComponent } from './components/view-documents-dialog/view-documents-dialog.component';
import { UpdateNoJsonFilingDialogComponent } from './components/update-no-json-filing-dialog/update-no-json-filing-dialog.component';
import { UpdateItrUFillingDialogComponent } from './components/update-ItrU-filling-dialog/update-ItrU-filling-dialog.component';
import { ValidationErrorScreenComponent } from './components/validation-error-screen/validation-error-screen.component';
import { GenericSortingComponent } from './components/generic-sorting/generic-sorting.component';
import { GenericUserFilterComponent } from './components/generic-user-filter/generic-user-filter.component';
import { UpdateCapacityComponent } from './components/update-capacity/update-capacity.component';
import { MyDialogComponent } from './components/my-dialog/my-dialog.component';
import { ChatModule } from '../chat/chat.module';
import { FloatingWidgetComponent } from '../chat/floating-widget/floating-widget.component';
import { CalculatorModalComponent } from './components/calculator-modal/calculator-modal.component';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { IncomeSourceDialogComponent } from './components/income-source-dialog/income-source-dialog.component';
import { ZipcodeDirective } from "./directives/zipcode.directive";
import { AddManualUpdateReasonComponent } from './components/add-manual-update-reason/add-manual-update-reason.component';
import { WholeNumberPipe } from "./directives/wholeNumber.directive";
import {DateInputDirective } from './directives/auto-slash-date.directive';
@NgModule({
    declarations: [
        UpperCaseDirective,
        CapitalizeFirstDirective,
        InputDataMaskDirective,
        CustomDateComponent,
        MatSelectComponent,
        MatInputComponent,
        AgGridMaterialSelectEditorComponent,
        UserNotesComponent,
        KommunicateDialogComponent,
        ItrActionsComponent,
        DocumentViewerComponent,
        FyDropDownComponent,
        ChangeStatusComponent,
        UpdateCapacityComponent,
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
        WholeNumberPipe,
        ZipcodeDirective,
        AgTooltipComponent,
        NumbersOnlyDirective,
        ConfirmDialogComponent,
        MyDialogComponent,
        ServiceDropDownComponent,
        LeaderListDropdownComponent,
        AddAffiliateIdComponent,
        TwoDigitDecimaNumberDirective,
        ViewDocumentsDialogComponent,
        UpdateNoJsonFilingDialogComponent,
        UpdateItrUFillingDialogComponent,
        ValidationErrorScreenComponent,
        GenericSortingComponent,
        GenericUserFilterComponent,
        CalculatorModalComponent,
        CustomButtonComponent,
        IncomeSourceDialogComponent,
        AddManualUpdateReasonComponent,
        DateInputDirective
    ],
    imports: [
        CommonModule,
        MatBottomSheetModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AgGridModule,
        // AgGridModule.withComponents([
        //     CustomDateComponent,
        //     AgGridMaterialSelectEditorComponent,
        //     MatInputComponent,
        //     AgTooltipComponent,
        //     /* CheckboxRenderer */
        // ]),
        NgxPaginationModule,
        NgxImageZoomModule,
        NgxDocViewerModule,
        NgxLoadingModule.forRoot({}),
        MatDialogModule,
    ChatModule
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
        UserNotesComponent,
        KommunicateDialogComponent,
        ItrActionsComponent,
        DocumentViewerComponent,
        FyDropDownComponent,
        ChangeStatusComponent,
        UpdateCapacityComponent,
        SmeListDropDownComponent,
        CallReassignmentComponent,
        NgxLoadingModule,
        LayoutComponent,
        KnowlarityNotificationComponent,
        UpdateManualFilingDialogComponent,
        CurrencyPipe,
        DigitsOnlyDirective,
        WholeNumberPipe,
        ZipcodeDirective,
        AgTooltipComponent,
        NumbersOnlyDirective,
        ServiceDropDownComponent,
        LeaderListDropdownComponent,
        TwoDigitDecimaNumberDirective,
        ViewDocumentsDialogComponent,
        GenericSortingComponent,
        GenericUserFilterComponent,
        UpdateNoJsonFilingDialogComponent,
        CalculatorModalComponent,
        CustomButtonComponent,
        IncomeSourceDialogComponent,
    AddManualUpdateReasonComponent,
    ChatModule,
        AddManualUpdateReasonComponent,
        DateInputDirective
    ],
    providers: [StorageService, Schedules, RequestManager]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
