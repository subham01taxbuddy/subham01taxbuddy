import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { FormGroup} from '@angular/forms';

@Component({
  selector: 'app-other-income',
  templateUrl: './other-income.component.html',
  styleUrls: ['./other-income.component.scss'],
  providers: [RoleBaseAuthGuardService, UserMsService],
})

export class OtherIncomeComponent implements OnInit {
  component_link: string = 'other-income';
  public form!: FormGroup;
  public loading: boolean = false;
  public showPassword: boolean;
  userId: any;
  serviceType: any;
  requestManagerSubscription = null;

  constructor() {}

  ngOnInit(): void {
  }

}
