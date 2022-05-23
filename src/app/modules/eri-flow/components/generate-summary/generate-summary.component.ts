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
  itrOneAnd4Data: any;
  itrTwoAnd3Data: any;
  loading = false;
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    // this.router.navigate(['/eri/direct-filing/itrFirst']);

  }
  async getSummaryDetails(type) {
    this.loading = true;
    let itrData = await this.utilsService.getCurrentItr(this.userDetails.userId, this.userDetails.assessmentYear, this.userDetails.callerAgentUserId);
    this.loading = false;
    if (type === 'ONE-4') {
      this.itrOneAnd4Data = itrData;
      this.itrTwoAnd3Data = null;
      this.getItrData.emit(this.itrOneAnd4Data);
    } else if (type === 'TOW-3') {
      this.itrTwoAnd3Data = itrData;
      this.itrOneAnd4Data = null;
      this.getItrData.emit(this.itrTwoAnd3Data);
    }
  }


}
