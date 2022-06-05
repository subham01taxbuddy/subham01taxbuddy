import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-statuswise-report',
  templateUrl: './statuswise-report.component.html',
  styleUrls: ['./statuswise-report.component.scss']
})
export class StatuswiseReportComponent implements OnInit, OnChanges {
  @Input() selectedAgent: any
  statusLoading = false;
  statusWiseReport: any;

  constructor(private userMsService: UserMsService,) { }

  ngOnInit() {
    this.getKnowlarityReport();
  }

  getKnowlarityReport() {
    this.statusLoading = true;
    const param = `/itrStatus-wise-report?agentUserId=${this.selectedAgent}`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res)
      this.statusWiseReport = res;
      this.statusLoading = false;
    }, () => {
      this.statusLoading = false;
    })
  }

  ngOnChanges() {
    this.getKnowlarityReport();
  }

}
