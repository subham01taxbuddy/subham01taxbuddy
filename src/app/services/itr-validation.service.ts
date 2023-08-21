import { Injectable } from '@angular/core';
import {
  ItrValidationObject,
  ItrValidations,
} from '../modules/shared/interfaces/itr-validation.interface';

@Injectable()
export class ItrValidationService {
  currentAssessmentYear: any;
  currentFinancialYear: any;
  constructor(private itrValidations: ItrValidations) {}

  getErrorMessages(errorCode: string) {
    const errorDetails: any = this.itrValidations.getErrorSchedule(errorCode);
    if (errorDetails) {
      const { message, relatedSchedule } = errorDetails;
      console.log('message', message);
      console.log('relatedSchedule', relatedSchedule);
      let object = {
        errorCode: errorCode,
        message: message,
        relatedSchedule: relatedSchedule,
      };
      return object;
    }
  }

  validateItrObj(obj) {
    // IF TOTAL INCOME IS MORE THAN 50 LAKHS THEN HAVE TO MARK MOVABLE AND IMMOVABLE ASSETS MANDATORY. NEED TO CALL TAX API HERE SO THAT WE GET THE TOTAL INCOME FOR THAT AND APPLY LOGIC ACCORDING TO THAT.
    let totalIncome = obj?.totalIncome;
    let itrType = obj?.itrType;

    const errorList: ItrValidationObject[] = [];

    if (!itrType) {
      const error = this.getErrorMessages('E1');
      errorList.push(error);
    }

    for (const key in obj) {
      // customer profile
      {
        // pan number
        if (key === 'panNumber') {
          if (!obj[key]) {
            const error = this.getErrorMessages('E5');
            errorList.push(error);
          }
        }

        // contactNumber
        if (key === 'contactNumber') {
          if (!obj[key]) {
            const error = this.getErrorMessages('E6');
            errorList.push(error);
          }
        }

        // email
        if (key === 'email') {
          if (!obj[key]) {
            const error = this.getErrorMessages('E7');
            errorList.push(error);
          }
        }

        // employerCategory
        if (key === 'employerCategory') {
          if (!obj[key]) {
            const error = this.getErrorMessages('E9');
            errorList.push(error);
          }
        }

        if (key === 'family') {
          // lName
          if (!obj[key][0]?.lName) {
            const error = this.getErrorMessages('E8');
            errorList.push(error);
          }

          // dateOfBirth
          if (!obj[key][0]?.dateOfBirth) {
            const error = this.getErrorMessages('E2');
            errorList.push(error);
          }

          // gender
          if (!obj[key][0]?.gender) {
            const error = this.getErrorMessages('E3');
            errorList.push(error);
          }

          // fatherName
          if (!obj[key][0]?.fatherName) {
            const error = this.getErrorMessages('E4');
            errorList.push(error);
          }
        }
      }

      // personalInformation
      {
        if (key === 'address') {
          // pincode
          if (!obj[key]?.pinCode) {
            const error = this.getErrorMessages('E10');
            errorList.push(error);
          }
          // country
          if (!obj[key]?.country) {
            const error = this.getErrorMessages('E11');
            errorList.push(error);
          }
          // state
          if (!obj[key]?.state) {
            const error = this.getErrorMessages('E12');
            errorList.push(error);
          }
          // city
          if (!obj[key]?.city) {
            const error = this.getErrorMessages('E13');
            errorList.push(error);
          }
        }

        // bank details
        if (key === 'bankDetails') {
          if (!obj[key] || obj[key]?.length === 0) {
            const error = this.getErrorMessages('E14');
            errorList.push(error);
          } else if (obj[key]?.length > 0) {
            const allValuesNotPresent: boolean = obj[key]?.every((element) => {
              !element.accountNumber ||
                !element.hasRefund ||
                !element.ifsCode ||
                !element.name;
            });

            if (allValuesNotPresent) {
              const error = this.getErrorMessages('E33');
              errorList.push(error);
            } else {
              const nominatedForRefund = obj[key]?.some(
                (element) => element?.hasRefund === true
              );

              if (!nominatedForRefund) {
                const error = this.getErrorMessages('E15');
                errorList.push(error);
              }
            }
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
              const error = this.getErrorMessages('E18');
              errorList.push(error);
            }

            // tenant
            if (missingTenantDetails?.length > 0) {
              const error = this.getErrorMessages('E19');
              errorList.push(error);
            }

            // tenant
            if (missingRentsForLOP?.length > 0) {
              const error = this.getErrorMessages('E20');
              errorList.push(error);
            }
          }
        }
      }

      // other income
      {
        // dividend incomes
        if (key === 'dividendIncomes') {
          if (obj[key] && obj[key]?.length > 0) {
            const dividendIncomesStat: boolean = obj[key]?.every(
              (element) =>
                element?.income === null ||
                (element?.income !== null && element?.income >= 0)
            );

            if (!dividendIncomesStat) {
              const error = this.getErrorMessages('E25');
              errorList.push(error);
            }
          }
        }

        // other incomes
        if (key === 'incomes') {
          if (obj[key] && obj[key]?.length > 0) {
            const incomesStat: boolean = obj[key]?.every(
              (element) =>
                element?.amount === null ||
                (element?.amount !== null && element?.amount >= 0)
            );

            if (!incomesStat) {
              const error = this.getErrorMessages('E26');
              errorList.push(error);
            }
          }
        }
      }

      // exempt income agri - needs to be tested
      {
        if (key === 'exemptIncomes') {
          if (obj[key]?.length > 0) {
            const agricultureExempt = obj[key]?.find(
              (element) => element?.natureDesc === 'AGRI'
            );

            if (agricultureExempt) {
              if (
                agricultureExempt?.amount > 5000 &&
                (itrType === '1' || itrType === '4')
              ) {
                const error = this.getErrorMessages('E27');
                errorList.push(error);
              }
            }
          }
        }
      }

      // tax paid
      {
        if (key === 'taxPaid') {
          // on salary
          if (obj[key]?.onSalary?.length > 0) {
            const onSalaryStat: boolean = obj[key]?.onSalary?.some(
              (element) =>
                !element?.deductorName ||
                !element?.deductorTAN ||
                !element?.totalAmountCredited ||
                !element?.totalTdsDeposited
            );

            if (onSalaryStat) {
              const error = this.getErrorMessages('E28');
              errorList.push(error);
            }
          }

          // other than salary
          if (obj[key]?.otherThanSalary16A?.length > 0) {
            const otherThanSalaryStat: boolean = obj[
              key
            ]?.otherThanSalary16A?.some(
              (element) =>
                !element?.deductorName ||
                !element?.deductorTAN ||
                !element?.totalAmountCredited ||
                !element?.totalTdsDeposited ||
                !element?.headOfIncome
            );

            if (otherThanSalaryStat) {
              const error = this.getErrorMessages('E29');
              errorList.push(error);
            }
          }

          // other than salary 26qb
          if (obj[key]?.otherThanSalary26QB?.length > 0) {
            const otherThanSalary26QbStat: boolean = obj[
              key
            ]?.otherThanSalary26QB?.some(
              (element) =>
                !element?.deductorName ||
                !element?.deductorPAN ||
                !element?.totalAmountCredited ||
                !element?.totalTdsDeposited ||
                !element?.headOfIncome
            );

            if (otherThanSalary26QbStat) {
              const error = this.getErrorMessages('E30');
              errorList.push(error);
            }
          }

          // TCS
          if (obj[key]?.tcs?.length > 0) {
            const tcsStat: boolean = obj[key]?.tcs?.some(
              (element) =>
                !element?.collectorName ||
                !element?.collectorTAN ||
                !element?.totalAmountPaid ||
                !element?.totalTcsDeposited
            );

            if (tcsStat) {
              const error = this.getErrorMessages('E31');
              errorList.push(error);
            }
          }

          // TAdvance or SAT
          if (obj[key]?.otherThanTDSTCS?.length > 0) {
            const otherThanTDSTCSStat: boolean = obj[
              key
            ]?.otherThanTDSTCS?.some(
              (element) =>
                !element?.bsrCode ||
                !element?.challanNumber ||
                !element?.dateOfDeposit ||
                !element?.totalTax
            );

            if (otherThanTDSTCSStat) {
              const error = this.getErrorMessages('E32');
              errorList.push(error);
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

                const error = this.getErrorMessages('E16');
                errorList.push(error);
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
                const error = this.getErrorMessages('E17');
                errorList.push(error);
              }
            }
          }
        }
      }

      if (itrType === '3') {
        if (key === 'business') {
          const nonSpecIncome = obj[key]?.profitLossACIncomes?.find(
            (key) => key?.businessType === 'NONSPECULATIVEINCOME'
          );

          const specIncome = obj[key]?.profitLossACIncomes?.find(
            (key) => key?.businessType === 'SPECULATIVEINCOME'
          );

          const natOfBusiness = obj[key]?.businessDescription;

          // Business decription - nature of business required if some business income is present and itr type is 3
          if (
            obj[key]?.profitLossACIncomes?.length > 0 ||
            obj[key]?.presumptiveIncomes?.length > 0
          ) {
            if (natOfBusiness?.length === 0) {
              // if there is nothing present then below error will be pushed
              const error = this.getErrorMessages('E23');
              errorList.push(error);
            } else {
              const natOfBusinessDetails: boolean = natOfBusiness?.some(
                (element) => {
                  return !element?.tradeName || !element?.natureOfBusiness;
                }
              );

              // if any one of the array has error then below error will be pushed
              if (natOfBusinessDetails) {
                const error = this.getErrorMessages('E24');
                errorList.push(error);
              }
            }
          }

          // speculative and non-speculative errors
          if (
            obj[key]?.profitLossACIncomes &&
            obj[key]?.profitLossACIncomes.length > 0
          ) {
            // non-speculative income
            if (nonSpecIncome && nonSpecIncome?.incomes?.length > 0) {
              const netAndGrossNonSpec: boolean =
                !nonSpecIncome?.netProfitfromNonSpeculativeIncome ||
                !nonSpecIncome?.totalgrossProfitFromNonSpeculativeIncome;

              if (netAndGrossNonSpec) {
                const error = this.getErrorMessages('E21');
                errorList.push(error);
              }
            }

            // speculative income
            if (specIncome && specIncome?.incomes?.length > 0) {
              const netAndGrossSpec: boolean =
                !specIncome?.netProfitfromSpeculativeIncome ||
                !specIncome?.totalgrossProfitFromSpeculativeIncome;

              if (netAndGrossSpec) {
                const error = this.getErrorMessages('E22');
                errorList.push(error);
              }
            }
          }
        }
      }

      // capital gain
      {
        if (key === 'capitalGain') {
          let capitalGainDetails = obj[key];
          // for basic details that are required in cg object
          if (capitalGainDetails && capitalGainDetails?.length > 0) {
            this.getCurrentFinancialYear();
            capitalGainDetails?.forEach((element, index) => {
              const capitalGainBasicDetails: boolean =
                element?.assessmentYear !== this.currentAssessmentYear ||
                element?.assesseeType !== 'INDIVIDUAL' ||
                element?.residentialStatus !== 'RESIDENT' ||
                !element?.assetType;

              if (capitalGainBasicDetails) {
                const error = this.getErrorMessages('E34');
                errorList?.push(error);
              }

              // for deduction array
              const deductionArray = element?.deduction;
              if (deductionArray && deductionArray?.length > 0) {
                const deductionDetails: boolean = deductionArray?.some(
                  (deduction) =>
                    !deduction?.costOfNewAssets ||
                    !deduction?.purchaseDate ||
                    !deduction?.underSection ||
                    !deduction?.totalDeductionClaimed ||
                    deduction?.srn === null ||
                    deduction?.srn === undefined
                );

                if (deductionDetails) {
                  const error = this.getErrorMessages('E35');
                  errorList?.push(error);
                }
              }

              // for improvement array
              const improvementArray = element?.improvement;
              if (improvementArray && improvementArray?.length > 0) {
                const improvementArrayDetails: boolean = improvementArray?.some(
                  (improvement) =>
                    !improvement?.dateOfImprovement ||
                    !improvement?.costOfImprovement ||
                    !improvement?.indexCostOfImprovement ||
                    improvement?.srn === null ||
                    improvement?.srn === undefined
                );

                if (improvementArrayDetails) {
                  const error = this.getErrorMessages('E36');
                  errorList?.push(error);
                }
              }

              // for buyerDetails array
              const buyersDetailsArray = element?.buyersDetails;
              if (buyersDetailsArray && buyersDetailsArray?.length > 0) {
                const buyersDetailsArrayStat: boolean =
                  buyersDetailsArray?.some(
                    (buyerDetails) =>
                      !buyerDetails?.name ||
                      !buyerDetails?.pan ||
                      !buyerDetails?.share ||
                      !buyerDetails?.country ||
                      !buyerDetails?.state ||
                      !buyerDetails?.aadhaarNumber ||
                      !buyerDetails?.pin ||
                      !buyerDetails?.address ||
                      !buyerDetails?.amount ||
                      buyerDetails?.srn === null ||
                      buyerDetails?.srn === undefined
                  );

                if (buyersDetailsArrayStat) {
                  const error = this.getErrorMessages('E37');
                  errorList?.push(error);
                }
              }

              // const assetDetails for different type gains
              let assetType = element?.assetType;

              // for land and building
              if (assetType === 'PLOT_OF_LAND') {
                const assetDetailsArray = element?.assetDetails;
                if (assetDetailsArray && assetDetailsArray?.length > 0) {
                  const landAndBuildingStat: boolean = assetDetailsArray?.some(
                    (lb) =>
                      !lb?.gainType ||
                      lb?.algorithm === 'cgProperty' ||
                      !lb?.sellDate ||
                      !lb?.valueInConsideration ||
                      !lb?.purchaseDate ||
                      !lb?.purchaseCost ||
                      !lb?.indexCostOfAcquisition ||
                      !lb?.capitalGain
                  );

                  if (landAndBuildingStat) {
                    const error = this.getErrorMessages('E38');
                    errorList?.push(error);
                  }
                }
              }

              // for equity and shares listed
              if (assetType === 'EQUITY_SHARES_LISTED') {
                const assetDetailsArray = element?.assetDetails;
                if (assetDetailsArray && assetDetailsArray?.length > 0) {
                  // const hasMissingProperties = (equity) => {
                  //   const commonConditions = [
                  //     !equity.gainType,
                  //     equity.algorithm === 'cgSharesMF',
                  //     !equity.sellDate,
                  //     !equity.sellOrBuyQuantity,
                  //     !equity.sellValuePerUnit,
                  //     !equity.sellValue,
                  //     !equity.purchaseDate,
                  //     !equity.purchaseValuePerUnit,
                  //     !equity.purchaseCost,
                  //   ];

                  //   if (equity?.gainType === 'LONG') {
                  //     commonConditions.push(
                  //       !equity.isinCode,
                  //       !equity.fmvAsOn31Jan2018,
                  //       !equity.grandFatheredValue,
                  //       !equity.totalFairMarketValueOfCapitalAsset,
                  //       !equity.capitalGain
                  //     );
                  //   }

                  //   return commonConditions.some((condition) => condition);
                  // };

                  // const equityStatus: boolean =
                  //   assetDetailsArray.some(hasMissingProperties);

                  const equityStat: boolean = assetDetailsArray?.some(
                    (equity) =>
                      equity?.gainType === 'LONG'
                        ? !equity?.gainType ||
                          equity?.algorithm !== 'cgSharesMF' ||
                          !equity?.sellDate ||
                          !equity?.sellOrBuyQuantity ||
                          !equity?.sellValuePerUnit ||
                          !equity?.sellValue ||
                          !equity?.purchaseDate ||
                          !equity?.purchaseValuePerUnit ||
                          !equity?.purchaseCost ||
                          !equity?.isinCode ||
                          !equity?.fmvAsOn31Jan2018 ||
                          !equity?.grandFatheredValue ||
                          !equity?.totalFairMarketValueOfCapitalAsset ||
                          !equity?.capitalGain
                        : !equity?.gainType ||
                          equity?.algorithm !== 'cgSharesMF' ||
                          !equity?.sellDate ||
                          !equity?.sellOrBuyQuantity ||
                          !equity?.sellValuePerUnit ||
                          !equity?.sellValue ||
                          !equity?.purchaseDate ||
                          !equity?.purchaseValuePerUnit ||
                          !equity?.purchaseCost
                  );

                  if (equityStat) {
                    const error = this.getErrorMessages('E39');
                    errorList?.push(error);
                  }
                }
              }

              // for equity and shares unlisted
              if (assetType === 'EQUITY_SHARES_UNLISTED') {
                const assetDetailsArray = element?.assetDetails;
                if (assetDetailsArray && assetDetailsArray?.length > 0) {
                  const equityUnlistedStat: boolean = assetDetailsArray?.some(
                    (equity) =>
                      !equity?.gainType ||
                      equity?.algorithm !== 'cgSharesMF' ||
                      !equity?.sellDate ||
                      !equity?.sellOrBuyQuantity ||
                      !equity?.sellValuePerUnit ||
                      !equity?.sellValue ||
                      !equity?.purchaseDate ||
                      !equity?.purchaseValuePerUnit ||
                      !equity?.purchaseCost
                  );

                  if (equityUnlistedStat) {
                    const error = this.getErrorMessages('E40');
                    errorList?.push(error);
                  }
                }
              }

              // for bonds
              if (assetType === 'BONDS') {
                const assetDetailsArray = element?.assetDetails;
                if (assetDetailsArray && assetDetailsArray?.length > 0) {
                  const bondsStat: boolean = assetDetailsArray?.some(
                    (bonds) =>
                      !bonds?.gainType ||
                      bonds?.algorithm !== 'cgProperty' ||
                      !bonds?.sellDate ||
                      !bonds?.valueInConsideration ||
                      !bonds?.purchaseDate ||
                      !bonds?.purchaseCost
                  );

                  if (bondsStat) {
                    const error = this.getErrorMessages('E41');
                    errorList?.push(error);
                  }
                }
              }

              // for debentures
              if (assetType === 'ZERO_COUPON_BONDS') {
                const assetDetailsArray = element?.assetDetails;
                if (assetDetailsArray && assetDetailsArray?.length > 0) {
                  const ZCBStat: boolean = assetDetailsArray?.some(
                    (zcb) =>
                      !zcb?.gainType ||
                      zcb?.algorithm !== 'cgProperty' ||
                      !zcb?.sellDate ||
                      !zcb?.valueInConsideration ||
                      !zcb?.purchaseDate ||
                      !zcb?.purchaseCost
                  );

                  if (ZCBStat) {
                    const error = this.getErrorMessages('E42');
                    errorList?.push(error);
                  }
                }
              }
            });
          }
        }
      }
    }

    console.log(errorList, 'List of validation errors');
    return errorList;
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

  getCurrentFinancialYear(): string {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const financialYearStartMonth = 4; // April
    const financialYear =
      currentMonth < financialYearStartMonth ? currentYear - 1 : currentYear;

    this.currentFinancialYear = financialYear - 1 + '-' + financialYear;
    this.getCurrentAssessmentYear(this.currentFinancialYear);
    return financialYear - 1 + '-' + financialYear; // Format: 2022-2023 for FY 2022-23
  }

  getCurrentAssessmentYear(financialYear: string): string {
    const startYear = parseInt(financialYear.split('-')[0]);
    const endYear = parseInt(financialYear.split('-')[1]);
    const assessmentYearStart = endYear; // Assessment year starts from the end of the financial year. Its basically +1 of financial year
    this.currentAssessmentYear =
      assessmentYearStart + '-' + (assessmentYearStart + 1);
    return assessmentYearStart + '-' + (assessmentYearStart + 1); // Format: 2023-2024 for AY 2023-24
  }
}
