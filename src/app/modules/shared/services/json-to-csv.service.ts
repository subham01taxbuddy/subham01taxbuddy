import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
declare let window
@Injectable({
  providedIn: 'root'
})

export class JsonToCsvService {
  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {

  }

  downloadFile(data, fields, filename = 'data') {
    let csvData = this.ConvertToCSV(data, fields);
    console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'Sr.No,';

    for (let index in headerList) {
      row += headerList[index].value + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index].key;
        if (head.includes('.')) {
          const data = head.split('.');
          if (data[0].includes('[')) {
            const arraySplit = data[0].split('[');
            let xIndex = parseInt(arraySplit[1][0]);
            if (Array.isArray(array[i][arraySplit[0]]) && array[i][arraySplit[0]].length) {
              line += ',' + array[i][arraySplit[0]][xIndex][data[1]];
            } else {
              line += ', ';
            }
          } else {
            if (array[i][data[0]]) {
              line += ',' + array[i][data[0]][data[1]];
            } else {
              line += ', ';
            }
          }
        } else {
          if ((array[i][head]) instanceof Array) {
            line += ',' + array[i][head].join('; ');
          } else {
            line += ',' + array[i][head];
          }
        }
      }
      str += line + '\r\n';
    }
    return str;
  }
}
