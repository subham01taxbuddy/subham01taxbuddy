import { KommunicateDialogComponent } from './../pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpperCaseDirective, InputDataMaskDirective, /* converToLowerCaseDirective */ } from './input-data-mask.directive';
import { AgGridModule } from 'ag-grid-angular';
import { NumericEditor } from './numeric-editor.component';
import { CustomDateComponent } from './date.component';
import { MatSelectComponent } from './mat-select.component';
import { MaterialModule } from './material.module';
import { AgGridMaterialSelectEditorComponent } from './dropdown.component';
import { CommonModule } from '@angular/common';
import { MatInputComponent } from './mat-input.component';
import { WhatsAppDialogComponent } from 'app/pages/itr-filing/whats-app-dialog/whats-app-dialog.component';
import { UserNotesComponent } from './components/user-notes/user-notes.component';
import { AddCallLogComponent } from './components/add-call-log/add-call-log.component';
import { OwlDateTimeModule } from 'ng-pick-datetime/date-time/date-time.module';
import { OwlNativeDateTimeModule } from 'ng-pick-datetime/date-time/adapter/native-date-time.module';
import { FilingStatusDialogComponent } from 'app/pages/itr-filing/filing-status-dialog/filing-status-dialog.component';
import { UpdateStatusComponent } from 'app/pages/itr-filing/update-status/update-status.component';
import { ItrActionsComponent } from './components/itr-actions/itr-actions.component';
// import { CheckboxRenderer } from './checkbox-renderer.component';


@NgModule({
    declarations: [
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor,
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
        ItrActionsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AgGridModule.withComponents([NumericEditor, CustomDateComponent, AgGridMaterialSelectEditorComponent, MatInputComponent,
            /* CheckboxRenderer */]),  //MatSelectComponent,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
    ],
    exports: [
        CommonModule,
        UpperCaseDirective,
        InputDataMaskDirective,
        NumericEditor,
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
        ItrActionsComponent
    ],
    providers: [],
    entryComponents: [WhatsAppDialogComponent, UserNotesComponent, AddCallLogComponent, FilingStatusDialogComponent,
        KommunicateDialogComponent, ItrActionsComponent]
})
export class SharedModule { }
