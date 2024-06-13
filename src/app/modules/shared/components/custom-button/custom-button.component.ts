import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.css']
})
export class CustomButtonComponent {
  // @Input() action: (...args: any[]) => Promise<void> | Subscription;
  // @Input() actionParams: any[] = [];
  // isProcessing = false;
  // private subscription: Subscription | null = null;

  // handleClick() {
  //   if (this.isProcessing) return;

  //   this.isProcessing = true;

  //   const result = this.action(...this.actionParams);
  //   if (result instanceof Promise) {
  //     result.finally(() => {
  //       this.isProcessing = false;
  //     });
  //   } else if (result instanceof Subscription) {
  //     this.subscription = result;
  //     this.subscription.add(() => {
  //       this.isProcessing = false;
  //     });
  //   }
  // }

  // ngOnDestroy() {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  // }
  constructor(private changeDetectorRef: ChangeDetectorRef){

  }

  @Input() actions!: (() => Promise<any>)[];
  @Output() actionComplete = new EventEmitter<void>();

  isLoading = false;

  async handleClick() {
    this.isLoading = true;
    try {
      for (const action of this.actions) {
        await action();
      }
    } catch (error) {
      console.error('Error during API call', error);
    } finally {
      this.isLoading = false;
      this.actionComplete.emit();
      this.changeDetectorRef.detectChanges()
    }
  }
}
