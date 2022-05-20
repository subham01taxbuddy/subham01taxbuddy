import { Component, Input, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { result } from 'lodash';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-generate-summary',
  templateUrl: './generate-summary.component.html',
  styleUrls: ['./generate-summary.component.scss']
})
export class GenerateSummaryComponent implements OnInit {

  @Input() userDetails: any;
  @Output() getItrData = new EventEmitter<any>();

  newItrSumChanges: boolean = true;
  itrData: any;
  loading = false;
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    // this.router.navigate(['/eri/direct-filing/itrFirst']);

  }
  async getSummaryDetails() {
    this.loading = true;
    this.itrData = await this.utilsService.getCurrentItr(this.userDetails.userId, this.userDetails.assessmentYear, this.userDetails.callerAgentUserId);
    this.loading = false;
    this.getItrData.emit(this.itrData);
    console.log('getSummaryDetails - getCurrentItr:', this.itrData);
  }


}
