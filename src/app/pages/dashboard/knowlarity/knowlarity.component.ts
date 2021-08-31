import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, NgZone, OnInit } from '@angular/core';
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

  constructor(private utilService: UtilsService,  @Inject(LOCALE_ID) private locale: string, private route: Router, private ngZone: NgZone) {
    // const knowlarityScript = document.createElement('script');
    // knowlarityScript.innerHTML = `var URL = "https://konnectprodstream3.knowlarity.com:8200/update-stream/560397a2-d875-478b-8003-cc4675e9a0eb/konnect"
    //                               var knowlarityData = [];
    //                               var aa = 0;
    //                               source = new EventSource(URL);
    //                               source.onmessage = function (event) {
    //                               var data = JSON.parse(event.data)
    //                               console.log('Received an event .......');
    //                               console.log(data);
    //                               knowlarityData.push(data)
    //                               window.angularComponentReference.zone.run(() => { window.angularComponentReference.loadKnowlarityData(data); });  
                                
    //                          }`
    // knowlarityScript.id = '_webengage_script_tag';
    // knowlarityScript.type = 'text/javascript';
    // document.head.appendChild(knowlarityScript);
   }

  ngOnInit() {
    //  window['angularComponentReference'] = { component: this, zone: this.ngZone, loadKnowlarityData: (res) => {
    //    console.log('res: ',res)
    //    this.storeData(res)
    //   } };  

    this.getKnowlarityInfo();

    setInterval(()=>{
      this.getKnowlarityInfo();
    }, 1000);
  }

  storeData(knowData){
    this.knowlarityData.push(knowData);
    this.knowlarityData = this.knowlarityData.reverse();
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
    }
  }

  showCustomerInfo(mobNo){
    console.log(typeof mobNo, mobNo.substring(3, mobNo.length));
    let mobileNo = mobNo.substring(3, mobNo.length);
    this.route.navigate(['/pages/dashboard/quick-search'], {queryParams: {mobileNo: mobileNo}});
  }


}
