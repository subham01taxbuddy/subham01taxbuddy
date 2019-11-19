/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */

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

import { NgxImageZoomModule } from 'ngx-image-zoom';
import { TokenInterceptor } from './services/token-interceptor';
import { HttpModule } from '@angular/http';

import { AmplifyAngularModule, AmplifyService, AmplifyModules } from 'aws-amplify-angular';
import Auth from '@aws-amplify/auth';

@NgModule({
  declarations: [
    AppComponent,
    ToastMessageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    PagesModule,
    NgxImageZoomModule.forRoot()
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
    {
      provide: AmplifyService,
      useFactory: () => {
        return AmplifyModules({
          Auth,
        });
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
