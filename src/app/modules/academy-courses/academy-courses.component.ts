import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AddNewCourseComponent } from './add-new-course/add-new-course.component';
import { UtilsService } from 'src/app/services/utils.service';
import { ReviewService } from '../review/services/review.service';
import { AgTooltipComponent } from '../shared/components/ag-tooltip/ag-tooltip.component';
import { CacheManager } from '../shared/interfaces/cache-manager.interface';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-academy-courses',
  templateUrl: './academy-courses.component.html',
  styleUrls: ['./academy-courses.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AcademyCoursesComponent implements OnInit {
  config: any;
  loading!: boolean;
  academyCoursesGridOptions: GridOptions;
  courseInfo: any;
  totalCount = 0
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };

  constructor(
    private cacheManager: CacheManager,
    private reviewService:ReviewService,
    public utilsService: UtilsService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.academyCoursesGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.courseColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
   }

   formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  ngOnInit() {
    this.getCourseList();
  }

  getCourseList(pageChange?){
    if (!pageChange) {
      this.cacheManager.clearCache();
    }
    this.loading =true ;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `course-data?${data}`;
    this.reviewService.getMethod(param).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          console.log('response', response);
          this.courseInfo = response.body.content;
          this.totalCount = response.body.totalElements;
          this.config.totalItems = response.body.totalElements;
          this.academyCoursesGridOptions.api?.setRowData(this.createRowData(response.body.content));
          this.cacheManager.initializeCache(response.body.content);

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, response.body.content);
          this.config.currentPage = currentPageNumber;
        } else {
          this.utilsService.showSnackBar(response.message);
          this.academyCoursesGridOptions.api?.setRowData(this.createRowData([]));
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error in API of get course list', error);
        this.utilsService.showSnackBar('Error in API of get course list');
      },
    });
  }

  addCourse(){
    let disposable = this.dialog.open(AddNewCourseComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: "Add New Course",
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "courseAdded") {
          this.getCourseList();
        }
      }
    })
  }

  createRowData(courseListData) {
    console.log('courseListData -> ', courseListData);
    let courseListArray = [];
    for (let i = 0; i < courseListData.length; i++) {
      let courseListInfo = Object.assign({}, courseListArray[i], {
        courseName: courseListData[i].courseName,
        topics: courseListData[i].topics,
        whatsAppLink: this.utilsService.isNonEmpty(courseListData[i].whatsappLink) ? courseListData[i].whatsappLink : '-',
        startDate: this.utilsService.isNonEmpty(courseListData[i].date) ? courseListData[i].date : '-',
        time: this.utilsService.isNonEmpty(courseListData[i].time) ? courseListData[i].time : '-',
        zoomLink: this.utilsService.isNonEmpty(courseListData[i].zoomLink) ? courseListData[i].zoomLink : '-',
        meetingId: this.utilsService.isNonEmpty(courseListData[i].meetingId) ? courseListData[i].meetingId : '-',
        passCode: this.utilsService.isNonEmpty(courseListData[i].passcode) ? courseListData[i].passcode : '-',

      })
      courseListArray.push(courseListInfo);
    }
    console.log('courseListArray-> ', courseListArray)
    return courseListArray;
  }

  courseColumnDef(){
    return [
      {
        headerName: 'Course Name',
        field: 'courseName',
        width: 280,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Topics',
        field: 'topics',
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
      },
      {
        headerName: 'WhatsApp Link',
        field: 'whatsAppLink',
        width: 350,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: function (params) {
          const whatsappLink = params.value;
          if (whatsappLink) {
            return `<a href="${whatsappLink}" target="_blank">${whatsappLink}</a>`;
          } else {
            return '';
          }
        }
      },
      {
          headerName: 'Start Date',
          field: 'startDate',
          width: 120,
          suppressMovable: true,
          cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          cellRenderer: (data) => {
            if (data?.value != '-') {
              return formatDate(data?.value, 'dd MMM yyyy', this?.locale);
            } else {
              return '-';
            }

          },
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },
      {
        headerName: 'Time',
        field: 'time',
        width: 100,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'Zoom Link',
        field: 'zoomLink',
        sortable: true,
        width: 350,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: function (params) {
          const zoomLink = params.value;
          if (zoomLink) {
            return `<a href="${zoomLink}" target="_blank">${zoomLink}</a>`;
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Meeting ID',
        field: 'meetingId',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'PassCode',
        field: 'passCode',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },

    ]
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.academyCoursesGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getCourseList(event);
    }
  }
}
