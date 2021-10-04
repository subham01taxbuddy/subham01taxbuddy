import { UtilsService } from 'app/services/utils.service';
import { ItrMsService } from 'app/services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
// import * as  Highcharts from 'highcharts';
import * as moment from 'moment';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-filing-dashboard',
  templateUrl: './filing-dashboard.component.html',
  styleUrls: ['./filing-dashboard.component.css']
})
export class FilingDashboardComponent implements OnInit {
  loading = false;
  todaysBarChartContainer: Chart;
  todaysYesterdayBarChartContainer: Chart;
  currentWeekBarChartContainer: Chart;
  weekBarChartContainer: Chart;
  currentMonthBarChartContainer: Chart;
  monthBarChartContainer: Chart;
  totalPieChartContainer: Chart;
  completeReportGridOption: GridOptions;

  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService) {
    this.completeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColoumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getFilingReport();
  }

  data = {
    "today": {
      "from": "2021-09-23",
      "to": "2021-09-23",
      "itr1": 52,
      "itr2": 8,
      "itr3": 16,
      "itr4": 2,
      "itr5": 0,
      "itr6": 0,
      "itr7": 0,
      "total": 78
    },
    "yesterday": {
      "from": "2021-09-22",
      "to": "2021-09-22",
      "itr1": 98,
      "itr2": 6,
      "itr3": 72,
      "itr4": 2,
      "itr5": 0,
      "itr6": 0,
      "itr7": 0,
      "total": 178
    },
    "currentWeek": {
      "from": "2021-09-20",
      "to": "2021-09-23",
      "itr1": 276,
      "itr2": 24,
      "itr3": 146,
      "itr4": 16,
      "itr5": 0,
      "itr6": 0,
      "itr7": 0,
      "total": 462
    },
    "lastWeek": {
      "from": "2021-09-13",
      "to": "2021-09-19",
      "itr1": 337,
      "itr2": 45,
      "itr3": 42,
      "itr4": 29,
      "itr5": 0,
      "itr6": 0,
      "itr7": 0,
      "total": 453
    },
    "currentMonth": {
      "from": "2021-09-01",
      "to": "2021-09-23",
      "itr1": 1256,
      "itr2": 144,
      "itr3": 226,
      "itr4": 82,
      "itr5": 1,
      "itr6": 0,
      "itr7": 0,
      "total": 1709
    },
    "lastMonth": {
      "from": "2021-08-01",
      "to": "2021-08-31",
      "itr1": 985,
      "itr2": 134,
      "itr3": 37,
      "itr4": 77,
      "itr5": 0,
      "itr6": 0,
      "itr7": 0,
      "total": 1233
    },
    "total": {
      "itr1": 2479,
      "itr2": 280,
      "itr3": 263,
      "itr4": 196,
      "itr5": 1,
      "itr6": 0,
      "itr7": 0,
      "total": 3219
    }
  }
  getFilingReport() {
    this.loading = true;
    const param = `/api/itr-filing-count?assessmentYear=2021-2022`;
    this.itrMsService.getMethod(param).subscribe(res => {
      console.log(res);
      this.setTodaysChart(res['today']);
      this.todaysYesterdayChart(res['today'], res['yesterday']);
      this.setCurrentWeekChart(res['currentWeek']);
      this.weekChart(res['currentWeek'], res['lastWeek']);
      this.setCurrentMonthChart(res['currentMonth']);
      this.monthChart(res['currentMonth'], res['lastMonth']);
      this.totalPieChart(res['total']);
      this.completeReportGridOption.api.setRowData(this.createSmeRowData(res));
      this.loading = false;
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed To generate Filing Dashboard data, Please try again.')
    })

  }

  setTodaysChart(todaysCount) {
    this.todaysBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'todaysBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },

      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: 'Todays Filing Count - ' + todaysCount['total'],
        data: [todaysCount['itr1'], todaysCount['itr2'], todaysCount['itr3'], todaysCount['itr4'], todaysCount['itr5'], todaysCount['itr6'], todaysCount['itr7']],
        color: '#04a3bc'
      },
        // {
        //   name: 'Ideal Portfolio',
        //   data: [100, 300],
        //   color: '#2B2D42'
        // }
      ]
    });
  }
  todaysYesterdayChart(today, yesterday) {
    this.todaysYesterdayBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'todaysYesterdayBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },

      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: 'Todays Filing Count - ' + today['total'],
        data: [today['itr1'], today['itr2'], today['itr3'], today['itr4'], today['itr5'], today['itr6'], today['itr7']],
        color: '#04a3bc'
      },
      {
        name: 'Yesterdays Filing Count - ' + yesterday['total'],
        data: [yesterday['itr1'], yesterday['itr2'], yesterday['itr3'], yesterday['itr4'], yesterday['itr5'], yesterday['itr6'], yesterday['itr7']],
        color: '#22374e'
      }
      ]
    });
  }
  setCurrentWeekChart(currentWeek) {
    this.currentWeekBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'currentWeekBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },

      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: `Current Week (${moment(currentWeek['from']).format('DD MMM')} - ${moment(currentWeek['to']).format('DD MMM')}) - ${currentWeek['total']}`,
        data: [currentWeek['itr1'], currentWeek['itr2'], currentWeek['itr3'], currentWeek['itr4'], currentWeek['itr5'], currentWeek['itr6'], currentWeek['itr7']],
        color: '#04a3bc'
      },
      ]
    });
  }
  weekChart(currentWeek, lastWeek) {
    this.weekBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'weekBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },
      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: `Current Week (${moment(currentWeek['from']).format('DD MMM')} - ${moment(currentWeek['to']).format('DD MMM')}) - ${currentWeek['total']}`,
        data: [currentWeek['itr1'], currentWeek['itr2'], currentWeek['itr3'], currentWeek['itr4'], currentWeek['itr5'], currentWeek['itr6'], currentWeek['itr7']],
        color: '#04a3bc'
      },
      {
        name: `Last Week (${moment(lastWeek['from']).format('DD MMM')} - ${moment(lastWeek['to']).format('DD MMM')}) - ${lastWeek['total']}`,
        data: [lastWeek['itr1'], lastWeek['itr2'], lastWeek['itr3'], lastWeek['itr4'], lastWeek['itr5'], lastWeek['itr6'], lastWeek['itr7']],
        color: '#22374e'
      }
      ]
    });
  }
  setCurrentMonthChart(currentMonth) {
    this.currentMonthBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'currentMonthBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },

      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: `Current Month (${moment(currentMonth['from']).format('DD MMM')} - ${moment(currentMonth['to']).format('DD MMM')}) - ${currentMonth['total']}`,
        data: [currentMonth['itr1'], currentMonth['itr2'], currentMonth['itr3'], currentMonth['itr4'], currentMonth['itr5'], currentMonth['itr6'], currentMonth['itr7']],
        color: '#04a3bc'
      },
      ]
    });
  }
  monthChart(currentMonth, lastMonth) {
    this.monthBarChartContainer = new Chart(<any>{
      chart: {
        height: 250,
        marginTop: 10,
        marginBottom: 50,
        marginLeft: 50,
        marginRight: 10,
        type: 'column',
        renderTo: 'monthBarChartContainer'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      credits: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 20,
        layout: 'horizontal',
      },

      tooltip: {
        formatter: function () {
          return this.y;
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
        }
      },
      yAxis: {
        type: 'logarithmic',
        labels: {
          formatter: function () {
            return Math.round(this.value).toLocaleString('en-IN');
          }
        },
        title: {
          text: ""
        }
      },
      xAxis: {
        categories: ['ITR 1', 'ITR 2', 'ITR 3', 'ITR 4', 'ITR 5', 'ITR 6', 'ITR 7']
      },
      series: [{
        name: `Current Month (${moment(currentMonth['from']).format('MMMM YYYY')}) - ${currentMonth['total']}`,
        data: [currentMonth['itr1'], currentMonth['itr2'], currentMonth['itr3'], currentMonth['itr4'], currentMonth['itr5'], currentMonth['itr6'], currentMonth['itr7']],
        color: '#04a3bc'
      },
      {
        name: `Last Month (${moment(lastMonth['from']).format('MMMM YYYY')}) - ${lastMonth['total']}`,
        data: [lastMonth['itr1'], lastMonth['itr2'], lastMonth['itr3'], lastMonth['itr4'], lastMonth['itr5'], lastMonth['itr6'], lastMonth['itr7']],
        color: '#22374e'
      }
      ]
    });
  }
  totalPieChart(total) {
    let data = [];
    for (let i = 1; i <= 7; i++) {
      data.push({
        name: 'ITR ' + i,
        y: total[`itr${i}`],
        z: total[`itr${i}`]
      })
    }
    console.log('Data for pie chart', data)
    this.totalPieChartContainer = new Chart(<any>{
      credits: {
        enabled: false
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 370,
        marginTop: 0,
        // options3d: {
        //   enabled: true,
        //   alpha: 60,
        //   beta: 0
        // }
      },
      colors: ['#04a3bc', '#22374e', '#e77818', '#84c124', '#5553b7', '#ff0000', '#f8ea2f'],
      title: {
        text: 'Total Filling - ' + total['total'],
        margin: 0,
        style: {
          fontSize: '1rem',
          fontWeight: 'bold'
        }
      },

      tooltip: {
        pointFormat: '{point.y:.0f}</b>'
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },

      plotOptions: {
        pie: {
          size: 170,
          depth: 30,
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            distance: 10,
            format: "{point.percentage:.0f}%",
            color: "black",
            allowOverlap: false,
          },
          showInLegend: true,

        }
      },

      legend: {
        layout: 'horizontal',
        padding: 0,
        y: 0,
        labelFormatter: function () {
          return this.name + ' | ' + Math.round(this.z).toLocaleString('en-IN') + (' (' + this.percentage.toFixed() + '%)');
        },
        symbolRadius: 1,
        floating: false,
        itemStyle: {
          fontWeight: 'bold',
          fontSize: '.75rem',
          fontFamily: 'Open Sans'
        }
      },

      series: [{
        id: 'pie',
        name: '',
        data: data,
        showInLegend: true
      }]
    })

  }

  createSmeRowData(smeReport) {
    let temp = [{
      value: 'today',
      label: 'Today',
      dateFormat: 'DD MMM'
    }, {
      value: 'yesterday',
      label: 'Yesterday',
      dateFormat: 'DD MMM'
    }, {
      value: 'currentWeek',
      label: 'This Week',
      dateFormat: 'DD MMM'
    }, {
      value: 'lastWeek',
      label: 'Last Week',
      dateFormat: 'DD MMM'
    }, {
      value: 'currentMonth',
      label: 'This Month',
      dateFormat: 'MMMM YY'
    }, {
      value: 'lastMonth',
      label: 'Last Month',
      dateFormat: 'MMMM YY'
    }, {
      value: 'total',
      label: 'This Season (F.Y. 20-21)',
    }]
    var data = [];
    for (let i = 0; i < temp.length; i++) {
      let smeData = {
        srNo: i + 1,
        name: temp[i].label + (temp[i].value !== 'total' ? ' (' + moment(smeReport[`${temp[i].value}`]['from']).format(temp[i].dateFormat) + ')' : ''),
        itr1: smeReport[`${temp[i].value}`]['itr1'],
        itr2: smeReport[`${temp[i].value}`]['itr2'],
        itr3: smeReport[`${temp[i].value}`]['itr3'],
        itr4: smeReport[`${temp[i].value}`]['itr4'],
        itr5: smeReport[`${temp[i].value}`]['itr5'],
        itr6: smeReport[`${temp[i].value}`]['itr6'],
        itr7: smeReport[`${temp[i].value}`]['itr7'],
        total: smeReport[`${temp[i].value}`]['total'],
      }
      data.push(smeData);
    }
    return data;
  }
  smeCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        pinned: 'left',
        width: 60,
        suppressMovable: true,
      },
      {
        headerName: 'Filing Dates',
        field: 'name',
        pinned: 'left',
      },
      {
        headerName: 'ITR 1',
        field: 'itr1',
        width: 70,
      },
      {
        headerName: 'ITR 2',
        field: 'itr2',
        width: 70,
      },
      {
        headerName: 'ITR 3',
        field: 'itr3',
        width: 70,
      },
      {
        headerName: 'ITR 4',
        field: 'itr4',
        width: 70,
      },
      {
        headerName: 'ITR 5',
        field: 'itr5',
        width: 70,
      },
      {
        headerName: 'ITR 6',
        field: 'itr6',
        width: 70,
      },
      {
        headerName: 'ITR 7',
        field: 'itr7',
        width: 70,
      },
      {
        headerName: 'Total',
        field: 'total',
        width: 70,
      },
    ]
  }
}
