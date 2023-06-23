import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as json2csv from 'json2csv';

declare var window
@Injectable({
  providedIn: 'root'
})

export class JsonToCsvService {
  Json2csvParser = json2csv.Parser;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {

  }

  public downloadFile(data: any, filename: any, fields: any) {
    let csvData = this.convertToCSV(data, fields);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
  }

  public convertToCSV(objArray: any, fields) {
    let json2csvParser = new this.Json2csvParser({ opts: fields });
    let csv = json2csvParser.parse(objArray);
    return csv;
  }
}
