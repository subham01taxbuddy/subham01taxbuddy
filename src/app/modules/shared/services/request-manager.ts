import {EventEmitter, Injectable, Output} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class RequestManager {

  @Output() requestCompleted = new EventEmitter<any>();
  requestQueue;
  processing = false;
  initialised = false;
  constructor() {
    this.requestQueue = [];
  }

  addRequest(param, method: Observable<unknown>){
    console.log('observed', this.requestCompleted.observed);
    this.requestQueue.push({
      api: param,
      observable:method
    });
    console.log('added request');
    if(!this.initialised){
      this.startProcessing();
      this.initialised = true;

    }
  }

  init(){
    this.initialised = false;
  }


  private startProcessing() {
    if(this.requestQueue.length > 0) {
      if (!this.processing) {
        this.processing = true;
        let req = this.requestQueue.pop();
        req.observable.subscribe((res: any) => {
          console.log('request complete.. sending event');
          this.processing = false;
          this.requestCompleted.emit({
            api:req.api,
            result:res
          });
        });
      }
    }
    if(this.requestCompleted.observed) {
      setTimeout(() => {
        this.startProcessing();
      }, 100);
    }
  }
}
