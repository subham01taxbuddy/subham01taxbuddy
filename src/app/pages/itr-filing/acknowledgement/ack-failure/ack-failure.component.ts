import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-ack-failure',
  templateUrl: './ack-failure.component.html',
  styleUrls: ['./ack-failure.component.scss']
})
export class AckFailureComponent implements OnInit {

  constructor(public utilsService: UtilsService, private router: Router) { }

  ngOnInit() {
  }

  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }

}
