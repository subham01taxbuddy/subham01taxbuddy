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

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getMessaging, provideMessaging} from '@angular/fire/messaging';
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../environments/environment";
import {AngularFireMessagingModule, SERVICE_WORKER} from "@angular/fire/compat/messaging";
import {ServiceWorkerModule} from "@angular/service-worker";

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
    AngularFireModule,
    AngularFireMessagingModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true, registrationStrategy: 'registerImmediately' }),
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
    { provide: SERVICE_WORKER, useFactory: () => typeof navigator !== 'undefined' && navigator.serviceWorker?.register('firebase-messaging-sw.js', { scope: '__' }) || undefined },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
