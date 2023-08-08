import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ItrValidationService {
  constructor() {}

  validateItrObj(obj) {
    let itrType = obj.itrType;
    console.log(itrType);

    const error = [];

    if (!itrType) {
      error.push({
        errorCode: 1,
        message: 'The ITR type is missing',
        errorMsgToBeDisplayed: 'The ITR type is missing',
        relatedSchedule: 'CustomerProfile',
      });
    }

    console.log(error, 'List of validation errors');
    return error;
  }

  removeNullProperties(obj) {
    for (const key in obj) {
      // pastYear Losses
      if (key === 'pastYearLosses') {
        if (obj[key] === null || obj[key].length === 0) {
          obj[key] = [
            {
              id: null,
              assessmentPastYear: '2015-16',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2016-17',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2017-18',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2018-19',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2019-20',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2020-21',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2021-22',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
            {
              id: null,
              assessmentPastYear: '2022-23',
              dateofFilling: null,
              housePropertyLoss: 0,
              pastYear: 0,
              speculativeBusinessLoss: 0,
              broughtForwordBusinessLoss: 0,
              LTCGLoss: 0,
              STCGLoss: 0,
            },
          ];
        }
      }
      //movableAsset
      if (
        key === 'movableAsset' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        obj[key] = obj[key]?.map((item) => {
          // Filter out null or undefined keys from each object
          return Object.entries(item).reduce((acc, [k, v]) => {
            if (v !== null && v !== undefined) {
              acc[k] = v;
            }
            return acc;
          }, {});
        });
        obj[key] = Object.keys(obj[key][0]).length === 0 ? [] : obj[key];
        console.log(obj[key]);
      }
      //profitLossAC
      if (
        key === 'profitLossACIncomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          const profitLossACIncomes = obj[key][i]?.incomes;
          if (
            (obj[key][i]?.netProfitfromNonSpeculativeIncome === 0 ||
              obj[key][i]?.netProfitfromNonSpeculativeIncome === null) &&
            obj[key][i]?.incomes.length === 0
          ) {
            delete obj[key][i];
          }
        }
      }

      //Employers - allowances & deductions
      if (
        key === 'employers' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        //allowances
        for (let i = 0; i < obj[key]?.length; i++) {
          const salaryAllowance = obj[key][i]?.allowance;
          if (
            salaryAllowance &&
            Array.isArray(salaryAllowance) &&
            salaryAllowance.length > 0
          ) {
            for (let j = salaryAllowance.length - 1; j >= 0; j--) {
              if (
                salaryAllowance[j] &&
                (salaryAllowance[j]?.exemptAmount === 0 ||
                  salaryAllowance[j]?.exemptAmount === null)
              ) {
                salaryAllowance.splice(j, 1);
              }
            }
          }
        }

        //deductions
        for (let i = 0; i < obj[key]?.length; i++) {
          const salaryDeductions = obj[key][i]?.deductions;
          if (
            salaryDeductions &&
            Array.isArray(salaryDeductions) &&
            salaryDeductions?.length > 0
          ) {
            for (let j = salaryDeductions?.length - 1; j >= 0; j--) {
              if (
                salaryDeductions[j] &&
                (salaryDeductions[j]?.exemptAmount === 0 ||
                  salaryDeductions[j]?.exemptAmount === null)
              ) {
                salaryDeductions.splice(j, 1);
              }
            }
          }
        }
      }

      //LOANS
      if (key === 'loans' && Array.isArray(obj[key]) && obj[key]?.length > 0) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.interestPaidPerAnum === 0 ||
              obj[key][i]?.interestPaidPerAnum === null) &&
            (obj[key][i]?.principalPaidPerAnum === 0 ||
              obj[key][i]?.principalPaidPerAnum === null) &&
            (obj[key][i]?.loanAmount === 0 || obj[key][i]?.loanAmount === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //EXPENSES
      if (
        key === 'expenses' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //INSURANCES
      if (
        key === 'insurances' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.medicalExpenditure === 0 ||
              obj[key][i]?.medicalExpenditure === null) &&
            (obj[key][i]?.premium === 0 || obj[key][i]?.premium === null) &&
            (obj[key][i]?.preventiveCheckUp === 0 ||
              obj[key][i]?.preventiveCheckUp === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //INCOMES
      if (
        key === 'incomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //DONATIONS
      if (
        key === 'donations' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (
            (obj[key][i]?.schemeCode === '' ||
              obj[key][i]?.schemeCode === null) &&
            (obj[key][i]?.amountOtherThanCash === 0 ||
              obj[key][i]?.amountOtherThanCash === null) &&
            (obj[key][i]?.amountInCash === 0 ||
              obj[key][i]?.amountInCash === null)
          ) {
            delete obj[key][i];
          }
        }
      }

      //DIVIDENDINCOMES
      if (
        key === 'dividendIncomes' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key].length; i++) {
          if (obj[key][i]?.income === 0 || obj[key][i]?.income === null) {
            delete obj[key][i];
          }
        }
      }

      //INVESTMENTS
      if (
        key === 'investments' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //DISABILITIES
      if (
        key === 'disabilities' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          if (obj[key][i]?.amount === 0 || obj[key][i]?.amount === null) {
            delete obj[key][i];
          }
        }
      }

      //HOUSEPROPERTIESLOAN
      if (
        key === 'houseProperties' &&
        Array.isArray(obj[key]) &&
        obj[key]?.length > 0
      ) {
        for (let i = 0; i < obj[key]?.length; i++) {
          const HPloans = obj[key][i]?.loans;
          if (HPloans && Array.isArray(HPloans) && HPloans?.length > 0) {
            for (let j = HPloans?.length - 1; j >= 0; j--) {
              if (
                HPloans[j] &&
                (HPloans[j]?.interestAmount === 0 ||
                  HPloans[j]?.interestAmount === null) &&
                (HPloans[j]?.principalAmount === 0 ||
                  HPloans[j]?.principalAmount === null)
              ) {
                HPloans.splice(j, 1);
              }
            }
          }
        }
      }

      //for All Others
      if (obj[key] === null) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          obj[key] = obj[key]?.filter((item) => item !== null);
        } else {
          this.removeNullProperties(obj[key]);
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }
    }

    return obj;
  }
}
