import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-foreign-income-component',
  templateUrl: './foreign-income.component.html',
  styleUrls: ['./foreign-income.component.scss'],
})
export class ForeignIncomeComponent extends WizardNavigation implements OnInit {
  topicList = [];
  showList = true;
  loading = false;

  constructor(private router: Router) {
    super();
    this.initList();
  }

  initList() {
    this.showList = true;
    this.topicList = [
      {
        label:
          'Details of income from outside India and tax relief (Schedule FSI)',
        path: 'schedule-fsi',
        type: 'scheduleFsi',
      },
      {
        label:
          'Details Summary of tax relief claimed for taxes paid outside India (Schedule TR)',
        path: 'schedule-tr',
        type: 'scheduleTr',
      },
      {
        label:
          'Details of foreign assets and income from any source outside India (Schedule FA)',
        path: 'schedule-fa',
        type: 'scheduleFa',
      },
    ];
  }

  ngOnInit(): void {
    ('');
  }

  gotoSection(topic) {
    this.showList = false;
    let basePath = '/itr-filing/itr/nri/';
    this.router.navigate([basePath + topic.path], {
      queryParams: { type: topic.type },
    });
    this.nextBreadcrumb.emit(topic.label);
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  subscription: Subscription;

  subscribeToEmitter(componentRef) {
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
      this.showList = true;
      this.initList();
      this.nextBreadcrumb.emit(null);
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
