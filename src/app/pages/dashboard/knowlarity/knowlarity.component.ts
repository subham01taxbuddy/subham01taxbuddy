import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-knowlarity',
  templateUrl: './knowlarity.component.html',
  styleUrls: ['./knowlarity.component.css']
})
export class KnowlarityComponent implements OnInit {

  loading: boolean;
  inbondKnowlarityGridOption: GridOptions;
  knowlarityData: any= [];

  constructor(private utilService: UtilsService,  @Inject(LOCALE_ID) private locale: string, private route: Router) {

   }

  ngOnInit() {
    this.getKnowlarityInfo();

    setInterval(()=>{
      this.getKnowlarityInfo();
    }, 1000);
  }

  getKnowlarityInfo(){
    let knowlarityInfo = JSON.parse(localStorage.getItem('INBOND_KNOWLARITY'));
    this.knowlarityData = [];
    var knowlarityArray = [];
    if(knowlarityInfo instanceof Array && knowlarityInfo.length > 0){
      knowlarityArray = knowlarityInfo.reverse();
      if(knowlarityArray.length >= 50){
        for(let i=0; i< 50; i++){
          this.knowlarityData.splice(i, 0, knowlarityArray[i]);
        }
      }
      else{
        this.knowlarityData = knowlarityArray;
      }
      
      //console.log('knowlarity Array -> ',this.knowlarityData)
      // this.config.totalItems = this.knowlarityData.length;
    }
  }

  showCustomerInfo(mobNo){
    console.log(typeof mobNo, mobNo.substring(3, mobNo.length));
    let mobileNo = mobNo.substring(3, mobNo.length);
    this.route.navigate(['/pages/dashboard/quick-search'], {queryParams: {mobileNo: mobileNo}});
  }


}
