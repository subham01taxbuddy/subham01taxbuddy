import { Injectable } from "@angular/core";
import { fromEvent, Subject } from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class IdleService {

  public idle$: Subject<boolean> = new Subject();
  public wake$: Subject<boolean> = new Subject();

  isIdle = false;
  private idleAfterSeconds = environment.idleTimeMins * 60;
  private countDown;

  constructor() {
    // Setup events
    fromEvent(document, 'mousemove').subscribe(() => this.onInteraction());
    fromEvent(document, 'touchstart').subscribe(() => this.onInteraction());
    fromEvent(document, 'keydown').subscribe(() => this.onInteraction());
    fromEvent(document, 'beforeunload').subscribe(() => this.onPageEvent());
  }

  onPageEvent(){
    console.log('on page event');
  }

  onInteraction() {
    // Is idle and interacting, emit Wake
    if (this.isIdle) {
      this.isIdle = false;
      this.wake$.next(true);
    }

    // User interaction, reset start-idle-timer
    clearTimeout(this.countDown);
    this.countDown = setTimeout(() => {
      // Countdown done without interaction - emit Idle
      this.isIdle = true;
      this.idle$.next(true);
    }, this.idleAfterSeconds * 1_000)
  }
}
