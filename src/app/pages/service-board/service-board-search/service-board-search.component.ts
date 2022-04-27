import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-service-board-search',
  templateUrl: './service-board-search.component.html',
  styleUrls: ['./service-board-search.component.css']
})
export class ServiceBoardSearchComponent implements OnInit {
  searchForm: FormGroup;
  financialYear = [];
  agentList = [];
  @Output() sendSearchParams = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      selectedAgentId: ['', Validators.required],
      selectedFyYear: ['', Validators.required]
    })
    let agentId = localStorage.getItem(AppConstants.SELECTED_AGENT);
    if (this.utilsService.isNonEmpty(agentId)) {
      this.searchForm.controls['selectedAgentId'].setValue(agentId)
      // this.retrieveData(0)
    } else {
      // this.retrieveData(0)
    }
    this.setFyDropDown();
    // this.setAgentsDropDown();
  }

  setFyDropDown() {
    const fyList = JSON.parse(sessionStorage.getItem(AppConstants.FY_LIST));
    console.log('fyList', fyList);
    if (this.utilsService.isNonEmpty(fyList) && fyList instanceof Array) {
      this.financialYear = fyList;
      const currentFy = this.financialYear.filter((item:any) => item.isFilingActive);
      this.searchForm.controls['selectedFyYear'].setValue(currentFy.length > 0 ? currentFy[0].financialYear : null);
      this.searchParams();
    } else {
      let param = '/filing-dates';
      this.itrMsService.getMethod(param).subscribe((res: any) => {
        if (res && res.success && res.data instanceof Array) {
          sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
          this.financialYear = res.data;
        }
      }, error => {
        console.log('Error during getting all PromoCodes: ', error)
      })
    }
  }

  setAgentsDropDown() {
    const agents = JSON.parse(sessionStorage.getItem(AppConstants.SME_LIST));
    console.log('agents', agents);
    if (this.utilsService.isNonEmpty(agents) && agents instanceof Array) {
      this.agentList = agents;
    } else {
      let param = '/sme-details';
      this.userMsService.getMethod(param).subscribe((res: any) => {
        if (res && res instanceof Array)
          res.sort((a, b) => a.name > b.name ? 1 : -1)
        sessionStorage.setItem(AppConstants.SME_LIST, JSON.stringify(res));
      }, error => {
        console.log('Error during getting all PromoCodes: ', error)
      })
    }
  }

  searchParams() {
    if (this.searchForm.valid) {
      this.sendSearchParams.emit(this.searchForm.getRawValue());
    }
  }
}
