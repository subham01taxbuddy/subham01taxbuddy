import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'full-width-cell',
  template: `
      <div class="full-width-summary">
        <label>
          <b>{{ data.tdsType }}:</b>

        </label>
      </div>
  `,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TdsTypeCellRenderer implements ICellRendererAngularComp {
  public data: any;

  agInit(params: ICellRendererParams): void {
    this.data = params.node.data;
  }


  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
