import { Injectable } from '@angular/core';

@Injectable()

export class UtilsService {
    constructor() { }
    /**
    * @function isNonEmpty()
    * @param param
    * @description This function is used for checking the expected parameter is empty undefined or null, this function will be used for objects as well as strings
    * @author Ashish Hulwan
    * @returns this will return boolean value
    */
    isNonEmpty(param): boolean {
        if (param !== null && param !== undefined && param !== "")
            return true
        else
            return false
    }

    isNonZero(param): boolean {
        if (Number(param) !== 0 && param !== null && param !== undefined && param !== "")
            return true
        else
            return false
    }

    smoothScrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    currencyFormatter(val) {
        if (this.isNonEmpty(val)) {
            return val.toLocaleString('en-IN')
        } else {
            return 0
        }
    }
    gstinValidator = new RegExp(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/);
    isGSTINValid(gstin) {
        let result = this.gstinValidator.test(gstin);
        console.log("GSTIN check result", result)
        return result
    }

    //scroll to specific div
    smoothScrollToDiv(divId) {
        console.log(divId)
        return document.getElementById(divId).scrollIntoView({ behavior: "smooth" });
    }

}