import { Injectable } from '@angular/core';
declare var tableToExcel: any;
declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
}
@Injectable()
export class ExportTableService {

  constructor() { }

  downloadExcel(report_id, report_name) {
    tableToExcel(report_id, this.createFileName(report_name))
  }

  downloadcsv(fields: any, data: any, exportFileName: string) {
    var csvData = "";
    if (typeof data === "string") {
      csvData = data;
    } else {
      csvData = this.convertToCSV(fields, data);
    }

    var blob = new Blob([csvData], { type: "text/csv" });
    try {
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, this.createFileName(exportFileName))
      } else {
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        let file_name = this.createFileName(exportFileName);
        link.setAttribute("download", file_name);
        link.setAttribute("name", file_name);
        link.setAttribute("title", file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
    }
  }

  convertToCSV(fields: any, objarray: any) {
    var array = typeof objarray != 'object' ? JSON.parse(objarray) : objarray;
    fields = (fields) ? fields : objarray[0];

    var str = '';
    var row = "";

    for (var index in fields) {
      row += fields[index].name + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in fields) {
        if (line != '') line += ','
        line += JSON.stringify(array[i][fields[index].field]);
      }
      str += line + '\r\n';
    }
    return str;
  }

  createFileName(exportFileName: string): string {
    var date = new Date();
    return (exportFileName +
      date.toLocaleDateString() + "_" +
      date.toLocaleTimeString()
      + '.csv')
  }

}
