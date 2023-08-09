import { Injectable } from '@angular/core';
import { ItrValidation } from '../modules/shared/interfaces/itr-validation.interface';

@Injectable({
  providedIn: 'root',
})
export class ItrValidationService {
  constructor() {}

  validateItrObj(obj) {
    let itrType = obj?.itrType;
    console.log(itrType);

    const error: ItrValidation[] = [];

    if (!itrType) {
      error?.push({
        errorCode: 'E1',
        message: 'itr type error',
        errorMsgToBeDisplayed: 'The ITR type is not present',
        relatedSchedule: 'other',
        itrType: itrType ? itrType : 'ITR Type is missing',
      });
    }

    for (const key in obj) {
      // customer profile
      {
        // pan number
        if (key === 'panNumber') {
          error?.push({
            errorCode: 'E5',
            message: 'missing pan number',
            errorMsgToBeDisplayed: 'PAN number is not present',
            relatedSchedule: 'customerProfile',
            itrType: itrType ? itrType : 'ITR Type is missing',
          });
        }

        // contactNumber
        if (key === 'contactNumber') {
          error?.push({
            errorCode: 'E6',
            message: 'missing contact number',
            errorMsgToBeDisplayed: 'Mobile number of the user is not present',
            relatedSchedule: 'customerProfile',
            itrType: itrType ? itrType : 'ITR Type is missing',
          });
        }

        // email
        if (key === 'email') {
          error?.push({
            errorCode: 'E7',
            message: 'missing email address',
            errorMsgToBeDisplayed: 'Email address of the user is not present',
            relatedSchedule: 'customerProfile',
            itrType: itrType ? itrType : 'ITR Type is missing',
          });
        }

        // employerCategory
        if (key === 'employerCategory') {
          error?.push({
            errorCode: 'E9',
            message: 'missing employer category',
            errorMsgToBeDisplayed:
              'Employer category of the user is not present',
            relatedSchedule: 'customerProfile',
            itrType: itrType ? itrType : 'ITR Type is missing',
          });
        }

        if (key === 'family') {
          // lName
          if (!obj[key][0]?.lName) {
            error?.push({
              errorCode: 'E8',
              message: 'missing last name',
              errorMsgToBeDisplayed:
                'Atleast last name is required to file ITR',
              relatedSchedule: 'customerProfile',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }

          // dateOfBirth
          if (!obj[key][0]?.dateOfBirth) {
            error?.push({
              errorCode: 'E2',
              message: 'missing date of Birth',
              errorMsgToBeDisplayed: 'Date of birth is not present',
              relatedSchedule: 'customerProfile',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }

          // gender
          if (!obj[key][0]?.gender) {
            error?.push({
              errorCode: 'E3',
              message: 'missing gender',
              errorMsgToBeDisplayed: 'Gender is not present',
              relatedSchedule: 'customerProfile',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }

          // fatherName
          if (!obj[key][0]?.fatherName) {
            error?.push({
              errorCode: 'E4',
              message: 'missing father name',
              errorMsgToBeDisplayed: 'Father name is not present',
              relatedSchedule: 'customerProfile',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }
        }
      }

      // personalInformation
      {
        if (key === 'address') {
          // pincode
          if (!obj[key]?.pinCode) {
            error?.push({
              errorCode: 'E10',
              message: 'missing pincode',
              errorMsgToBeDisplayed:
                'Pincode is missing from the address provided',
              relatedSchedule: 'personalInformation',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }
          // country
          if (!obj[key]?.country) {
            error?.push({
              errorCode: 'E11',
              message: 'missing country',
              errorMsgToBeDisplayed:
                'Country is missing from the address provided',
              relatedSchedule: 'personalInformation',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }
          // state
          if (!obj[key]?.state) {
            error?.push({
              errorCode: 'E12',
              message: 'missing state',
              errorMsgToBeDisplayed:
                'State is missing from the address provided',
              relatedSchedule: 'personalInformation',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }
          // city
          if (!obj[key]?.city) {
            error?.push({
              errorCode: 'E13',
              message: 'missing city',
              errorMsgToBeDisplayed:
                'City is missing from the address provided',
              relatedSchedule: 'personalInformation',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          }
        }

        // bank details
        if (key === 'bankDetails') {
          if (!obj[key] || obj[key]?.length === 0) {
            error?.push({
              errorCode: 'E14',
              message: 'missing bank details',
              errorMsgToBeDisplayed:
                'Atlease one bank detail is required to file ITR',
              relatedSchedule: 'personalInformation',
              itrType: itrType ? itrType : 'ITR Type is missing',
            });
          } else if (key?.length > 0) {
            obj[key]?.forEach((element) => {
              const allValuesPresent = this.checkAllValuesPresent(element);
              if (!allValuesPresent) {
                error?.push({
                  errorCode: 'E14',
                  message: 'missing bank details',
                  errorMsgToBeDisplayed:
                    'Bank account number or bank name or bank account number is missing',
                  relatedSchedule: 'personalInformation',
                  itrType: itrType ? itrType : 'ITR Type is missing',
                });
              } else {
                const nominatedForRefund = obj[key]?.some(
                  (element) => element?.hasRefund
                );

                if (!nominatedForRefund) {
                  error?.push({
                    errorCode: 'E15',
                    message: 'not nominated for refund',
                    errorMsgToBeDisplayed:
                      'Atleast one bank account has to be nominated for refund',
                    relatedSchedule: 'personalInformation',
                    itrType: itrType ? itrType : 'ITR Type is missing',
                  });
                }
              }
            });
          }
        }
      }

      // houseProperty
      {
        if (key === 'houseProperties') {
          if (obj[key] && obj[key]?.length > 0) {
            const missingCoOwnerDetails = [];
            const missingTenantDetails = [];
            const missingRentsForLOP = [];
            obj[key]?.forEach((element, index) => {
              // coOwner name and percentage
              if (element?.coOwners && element?.coOwners.length > 0) {
                element?.coOwners?.forEach((element, index) => {
                  let missingCoOwnerDetail: boolean =
                    !element?.name || !element?.percentage;

                  if (missingCoOwnerDetail) {
                    missingCoOwnerDetails?.push(index + 1);
                  }
                });
              }

              let propType = element?.propertyType;
              if (propType === 'LOP' || propType === 'DLOP') {
                // tenantName
                if (element?.tenant && element?.tenant.length > 0) {
                  element?.tenant?.forEach((element, index) => {
                    let missingTenantDetail: boolean = !element?.name;
                    if (missingTenantDetail) {
                      missingTenantDetails?.push(index + 1);
                    }
                  });
                }

                // grossRent
                let missingRentForLOP =
                  !element?.grossAnnualRentReceived ||
                  !element?.grossAnnualRentReceivedTotal;

                if (missingRentForLOP) {
                  missingRentsForLOP?.push(index + 1);
                }
              }
            });

            // coOwner
            if (missingCoOwnerDetails?.length > 0) {
              error?.push({
                errorCode: 'E18',
                message: 'co-owner details are missing',
                errorMsgToBeDisplayed: `Provide the co-owner name & percentage for the house property - ${missingCoOwnerDetails?.join(
                  ', '
                )}`,
                relatedSchedule: 'houseProperty',
                itrType: itrType ? itrType : 'ITR Type is missing',
              });
            }

            // tenant
            if (missingTenantDetails?.length > 0) {
              error?.push({
                errorCode: 'E19',
                message: 'tenant details are missing',
                errorMsgToBeDisplayed: `Provide atleast the tenant name for the house property - ${missingTenantDetails?.join(
                  ', '
                )}`,
                relatedSchedule: 'houseProperty',
                itrType: itrType ? itrType : 'ITR Type is missing',
              });
            }

            // tenant
            if (missingRentsForLOP?.length > 0) {
              error?.push({
                errorCode: 'E20',
                message: 'gross rent required if LOP or DLOP',
                errorMsgToBeDisplayed: `Gross rent / letable value is required if House property is LOP or DLOP - ${missingRentsForLOP?.join(
                  ', '
                )}`,
                relatedSchedule: 'houseProperty',
                itrType: itrType ? itrType : 'ITR Type is missing',
              });
            }
          }
        }
      }

      if (itrType === '2' || itrType === '3') {
        // salary
        {
          if (key === 'employers') {
            if (obj[key] && obj[key]?.length > 0) {
              const missingDetails: { [employerName: string]: String[] } = {};
              const employerDetails = obj[key]?.forEach((element, index) => {
                const missingProps: string[] = [];

                if (!element?.address) missingProps?.push('address');
                if (!element?.city) missingProps?.push('city');
                if (!element?.employerName) missingProps?.push('employerName');
                if (!element?.pinCode) missingProps?.push('pinCode');
                if (!element?.state) missingProps?.push('state');

                if (missingProps?.length > 0) {
                  missingDetails[
                    element?.employerName ? element?.employerName : index
                  ] = missingProps;
                }
              });

              if (Object?.keys(missingDetails)?.length === 0) {
                console.log('all employer details are present');
              } else {
                const employerNamesWithMissingDetails =
                  Object.keys(missingDetails);

                error?.push({
                  errorCode: 'E16',
                  message: 'employer details are missing',
                  errorMsgToBeDisplayed: `Employer details are missing for ${employerNamesWithMissingDetails.join(
                    ', '
                  )}`,
                  relatedSchedule: 'salary',
                  itrType: itrType ? itrType : 'ITR Type is missing',
                });
                console.log('missing employer details');
              }
            }
          }
        }

        // house property
        {
          if (key === 'houseProperties') {
            if (obj[key] && obj[key]?.length > 0) {
              const hpDetailsMissing = [];
              obj[key]?.forEach((element, index) => {
                // address
                let missingHpDetails: boolean =
                  !element?.address ||
                  !element?.city ||
                  !element?.state ||
                  !element?.country ||
                  !element?.pinCode;
                console.log(missingHpDetails, 'missingHpDetails');

                if (missingHpDetails) {
                  hpDetailsMissing?.push(index + 1);
                }
              });

              if (hpDetailsMissing?.length > 0) {
                error?.push({
                  errorCode: 'E17',
                  message: 'house property address details are missing',
                  errorMsgToBeDisplayed: `Provide the address for the house property - ${hpDetailsMissing?.join(
                    ', '
                  )}`,
                  relatedSchedule: 'houseProperty',
                  itrType: itrType ? itrType : 'ITR Type is missing',
                });
              }
            }
          }
        }
      }
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

  // Function to check if all values are present within an object
  checkAllValuesPresent(obj: any): boolean {
    return Object?.values(obj).every(
      (value) => value !== undefined && value !== null && value !== ''
    );
  }
}
