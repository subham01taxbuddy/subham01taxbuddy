import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademyCoursesComponent } from './academy-courses.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { AcademyCoursesRoutes } from './academy-courses.routing';
import { AddNewCourseComponent } from './add-new-course/add-new-course.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        AcademyCoursesRoutes,
        NgxLoadingModule.forRoot({}),
        NgxMaterialTimepickerModule,
    ],
    declarations: [AcademyCoursesComponent, AddNewCourseComponent]
})
export class AcademyCoursesModule { }
