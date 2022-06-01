import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "currencyPipe"
})
export class CurrencyPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value) {
            // var currencySymbol = "₹";
            return Number(value).toLocaleString("en-IN")/* (
                // (args == false ? '' : currencySymbol) +
                Number(value).toLocaleString("en-IN")
            ); */
        } else {
            return "0";
        }
    }
}