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
 
import { Injectable } from '@angular/core';
declare var tableToExcel: any;

@Injectable()
export class ExportTableService {

  constructor() { }

  downloadExcel(report_id,report_name) {
      tableToExcel(report_id,this.createFileName(report_name))
  }

  downloadcsv(fields:any,data: any, exportFileName: string) {
        var csvData = "";
        if(typeof data == "string") {
          csvData = data;
        } else {
          csvData = this.convertToCSV(fields,data);
        }

        var blob = new Blob([csvData], { type: "text/csv" });
        try {
          if (navigator.msSaveBlob) { // IE 10+
              navigator.msSaveBlob(blob, this.createFileName(exportFileName))
          } else {
              var link = document.createElement("a");
              //if (link.download !== undefined) { // feature detection
              // Browsers that support HTML5 download attribute
              var url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              let file_name = this.createFileName(exportFileName);
              link.setAttribute("download",file_name );
              link.setAttribute("name", file_name);
              link.setAttribute("title", file_name);
              //link.style = "visibility:hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
        }catch(e) {
          //alert("e"+e);
        }
    }

  convertToCSV(fields: any,objarray: any) {
      var array = typeof objarray != 'object' ? JSON.parse(objarray) : objarray;
      fields = (fields) ? fields : objarray[0];
      
      var str = '';
      var row = "";

      for (var index in fields) {
          //Now convert each value to string and comma-separated
          row += fields[index].name + ',';
      }
      row = row.slice(0, -1);
      //append Label row with line break
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
