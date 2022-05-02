import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generate-summary',
  templateUrl: './generate-summary.component.html',
  styleUrls: ['./generate-summary.component.scss']
})
export class GenerateSummaryComponent implements OnInit {
  newItrSumChanges: boolean = true;

  constructor(private router: Router) { }

  ngOnInit() {
    // this.router.navigate(['/eri/direct-filing/itrFirst']);
  }

   tabClick(tab: any){
  //     console.log(tab);
  //     if(tab.index === 0){
  //       this.router.navigate(['/eri/direct-filing/itrFirst']);
  //     }
  //     else{
  //       this.router.navigate(['/eri/direct-filing/new-summary/itr-one']);
  //     }
   }

}
