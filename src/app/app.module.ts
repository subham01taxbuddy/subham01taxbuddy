import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ToastMessageComponent } from './additional-components/toast-message/toast-message.component';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';

// Services
import { NavbarService } from './services/navbar.service';
import { UploadService } from './services/upload.service';
import { ExportTableService } from './services/export-table.service';
import { ToastMessageService } from './services/toast-message.service';
import { AuthGuard } from './services/auth.guard';

import { appRoutes } from './app-routing.module';
import { UtilsService } from './services/utils.service';

import { TokenInterceptor } from './services/token-interceptor';

import Auth from '@aws-amplify/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    ToastMessageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    PagesModule,
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [
    NavbarService,
    UploadService,
    ExportTableService,
    ToastMessageService,
    AuthGuard,
    UtilsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    // {
    //   provide: AmplifyService,
    //   useFactory: () => {
    //     return AmplifyModules({
    //       Auth,
    //     });
    //   }
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
