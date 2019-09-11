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
 
import { RouterModule, Routes } from '@angular/router';

//page component
import { PagesComponent } from './pages.component';
import { ListComponent } from './list/list.component';
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';

//dashboard | home  component
import { HomeComponent } from './home/home.component';

// Login component
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
	{ 	path: 'login', component: LoginComponent },

	{ 	
		path : 'pages' , component: PagesComponent,
		children: [
			{ path: 'home', component: HomeComponent },
			{ path: 'list', component: ListComponent },
			{
				path: 'business', component: BusinessComponent,
				children: [
					{ path: 'business-profile', component: BusinessProfileComponent },
					{ path: 'gst-cloud', component: GSTCloudComponent },
					{ path: 'business-documents', component: BusinessDocumentsComponent },
					{ path: '', redirectTo: '/pages/business/business-profile', pathMatch: 'full' }
				]
			},
			{ path: '**', redirectTo: '/pages/home' , pathMatch: 'full' }
		]
	},

	{ 	path: '', redirectTo: 'login', pathMatch: 'full' },
	{ 	path: '**', redirectTo: '/pages/home' }
];
