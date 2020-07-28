import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-ack-delay',
  templateUrl: './ack-delay.component.html',
  styleUrls: ['./ack-delay.component.scss']
})
export class AckDelayComponent implements OnInit {

  constructor(public utilsService: UtilsService, private router: Router) { }

  ngOnInit() {
  }

  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }
}
