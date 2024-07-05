import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.css']
})
export class CustomButtonComponent {
  constructor(private changeDetectorRef: ChangeDetectorRef){}

  @Input() actions!: ((...args: any[]) => Promise<any>)[];
  @Output() actionComplete = new EventEmitter<void>();
  @Input() actionParams: any[][] = [];
  @Input() disabled: boolean = false;

  isLoading = false;

  async handleClick() {
    if (this.disabled || this.isLoading) return;
    this.isLoading = true;
    try {
      for (let i = 0; i < this.actions.length; i++) {
        if (this.actionParams && this.actionParams[i]) {
          await this.actions[i](...this.actionParams[i]);
        } else {
          await this.actions[i]();
        }
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
