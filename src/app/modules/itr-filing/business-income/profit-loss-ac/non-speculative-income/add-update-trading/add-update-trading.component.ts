import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfitLossIncomes } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';

@Component({
  selector: 'app-add-update-trading',
  templateUrl: './add-update-trading.component.html',
})
export class AddUpdateTradingComponent implements OnInit {

  natureOfBusinessDropdownAll: any;
  natureOfProfessionDropdown: any;
  loading = false;
  tradingForm: UntypedFormGroup;
  constructor(
    public itrMsService: ItrMsService,
    public toastMsgService: ToastMessageService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUpdateTradingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initTradingForm(this.data.data);
  }

  initTradingForm(obj?: ProfitLossIncomes) {
    this.tradingForm = this.formBuilder.group({
      id: [obj?.id || null],
      incomeType: [obj?.incomeType || null],
      turnOver: [obj?.turnOver || null, Validators.required],
      finishedGoodsOpeningStock: [obj?.finishedGoodsOpeningStock || null],
      finishedGoodsClosingStock: [obj?.finishedGoodsClosingStock || null],
      purchase: [obj?.purchase || null, [Validators.required]],
      COGS: [obj?.COGS || null],
      grossProfit: [obj?.grossProfit || null],
    });
  }

  saveTradingDetails() {
    this.loading = true;
    let param = '/calculate/profitLossNonSpeculativeInCogsGP';
    let request = {
      "turnOver": this.tradingForm.controls['turnOver'].value,
      "openingStockOfFinishedGoods": this.tradingForm.controls['finishedGoodsOpeningStock'].value ? this.tradingForm.controls['finishedGoodsOpeningStock'].value : 0,
      "closingStockOfFinishedGoods": this.tradingForm.controls['finishedGoodsClosingStock'].value ? this.tradingForm.controls['finishedGoodsClosingStock'].value : 0,
      "purchase": this.tradingForm.controls['purchase'].value
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      if (result.success) {
        this.tradingForm.controls['COGS'].setValue(result.data.cogs);
        this.tradingForm.controls['grossProfit'].setValue(result.data.grossProfit);
        this.toastMsgService.alert("message", "COGS and Gross Profit calculated successfully.");
      } else {
        this.loading = false;
        this.toastMsgService.alert("error", "Failed to calculate COGS and Gross Profit.");
      }
      this.dialogRef.close(this.tradingForm.value);
      this.loading = false;
    },
      error => {
        this.loading = false;
        this.toastMsgService.alert("error", "Failed to calculate COGS and Gross Profit.");

      })

  }

  cancel() {
    this.dialogRef.close();
  }
}

