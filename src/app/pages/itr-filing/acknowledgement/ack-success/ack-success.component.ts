import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-ack-success',
  templateUrl: './ack-success.component.html',
  styleUrls: ['./ack-success.component.scss']
})
export class AckSuccessComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  emailString: String = '';
  constructor(public utilsService: UtilsService, private router: Router) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.emailString = 'mailto:' + this.ITR_JSON.email;
  }

  previousRoute() {
    // TODO
    this.router.navigate(['/pages/itr-filing/users']);
  }
}
