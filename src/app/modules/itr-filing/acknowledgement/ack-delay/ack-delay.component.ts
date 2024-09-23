import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-ack-delay',
  templateUrl: './ack-delay.component.html',
  styleUrls: ['./ack-delay.component.scss']
})
export class AckDelayComponent {

  constructor(public utilsService: UtilsService, private router: Router) { }

  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }
}
