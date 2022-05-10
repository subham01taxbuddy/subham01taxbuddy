import { KommunicateDialogComponent } from '../../pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpperCaseDirective, InputDataMaskDirective, } from './input-data-mask.directive';
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
import { WhatsAppDialogComponent } from '../../pages/itr-filing/whats-app-dialog/whats-app-dialog.component';
import { FilingStatusDialogComponent } from '../../pages/itr-filing/filing-status-dialog/filing-status-dialog.component';
import { UpdateStatusComponent } from '../../pages/itr-filing/update-status/update-status.component';
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
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';


@NgModule({
    declarations: [
        UpperCaseDirective,
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
        KnowlarityNotificationComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        MatBottomSheetModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AgGridModule.withComponents([CustomDateComponent, AgGridMaterialSelectEditorComponent, MatInputComponent,
            /* CheckboxRenderer */]),  //MatSelectComponent,
        NgxPaginationModule,
        // NgxImageZoomModule.forRoot(),
        NgxDocViewerModule,
        NgxLoadingModule.forRoot({}),
    ],
    exports: [
        CommonModule,
        UpperCaseDirective,
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
        KnowlarityNotificationComponent
    ],
    providers: [StorageService],
    entryComponents: [WhatsAppDialogComponent, UserNotesComponent, AddCallLogComponent, FilingStatusDialogComponent,
        KommunicateDialogComponent, ItrActionsComponent, ChangeStatusComponent, CallReassignmentComponent]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: [

            ]
        };
    }
}
