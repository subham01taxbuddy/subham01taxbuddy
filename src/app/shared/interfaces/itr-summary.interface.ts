export interface ITR_SUMMARY{
       _id: null,
      summaryId: number,
      itrId: number,
      userId: number,
      returnType: string,
      financialYear: string,
      assesse: Assesse,
      taxSummary: TaxSummary,
      capitalGainIncome: CapitalGain,
      lossesToBeCarriedForward: [],
      medium: 'BACK OFFICE',
      us80c: string,
      us80ccc: string,
      us80ccc1: string,
      us80ccd2: string,
      us80ccd1b: string,
      us80d: string,
      us80dd: string,
      us80ddb: string,
      us80e: string,
      us80ee: string,
      us80g: string,
      us80gg: string,
      us80gga: string,
      us80ggc: string,
      us80ttaTtb: string,
      us80u: string,
      us80jja: string,
      ppfInterest: string,
      giftFromRelative: string,
      anyOtherExcemptIncome: string,
      netTaxPayable: string,
      immovableAssetTotal: string,
      movableAssetTotal: string,
      totalHeadWiseIncome: string,
      lossesSetOffDuringTheYear: string,     
      carriedForwardToNextYear: string, 
      presumptiveBusinessIncomeUs44AD: string,
      presumptiveBusinessIncomeUs44ADA: string,
      speculativeBusinessIncome: string,
      incomeFromOtherThanSpeculativeAndPresumptive: string,		
      incomeFromOtherThanSpeculativeAndPresumptiveProfession:  string,
      futureAndOption: string
      freezed: false
}

export interface Assesse{
    passportNumber: string,
    email: string,
    contactNumber: string,
    panNumber: string,
    aadharNumber: string,
    itrType: string,
    residentialStatus: string,
    ackNumber: null,
    maritalStatus: null,
    assesseeType: null,
    assessmentYear: string,
    noOfDependents: number,
    currency: null,
    locale: null,
    eFillingCompleted: boolean,
    eFillingDate: string,    
    isRevised: null,
    isLate: null,
    employerCategory: null,
    dateOfNotice: null,
    noticeIdentificationNo: null,
    isDefective: null,

    family: Family[],
    address: Address,
 
    disability: null,
    itrProgress: [],
    employers: [],
    houseProperties: [],
    CGBreakup: null,
    foreignIncome: null,
    foreignAssets: null,
    incomes: [],
    expenses: null,
    loans: null,
    capitalAssets: null,
    investments: null,
    insurances: [],
    assetsLiabilities: AssetsLiabilities,
    bankDetails: [],
    donations: [],
    taxPaid: [],
    taxCalculator: null,
    declaration: null,
    directorInCompany: null,
    unlistedSharesDetails: null,
    agriculturalDetails: null,
    dateOfDividendIncome: null,
    systemFlags: SystemFlag,
    statusFlags: null,

    business: Business
}

export interface Family{
    fName: string,
    mName: string,
    lName: string,
    dateOfBirth: string,
    fathersName: string
}

export interface Address{
    flatNo: number,
    premisesName: string,
    road: null,
    area: null,
    city: string,
    state: string,
    country: string,
    pinCode: string
}

export interface SystemFlag{
    hasParentOverSixty: boolean;
}

export interface Business{
    presumptiveIncomes: [],
    financialParticulars: FinancilaParticulars
}

export interface FinancilaParticulars{
    id: null,
    grossTurnOverAmount: null,
    membersOwnCapital: [],
    securedLoans: [],
    unSecuredLoans: [],
    advances: [],
    sundryCreditorsAmount: [],
    otherLiabilities: [],
    totalCapitalLiabilities: null,
    fixedAssets: [],
    inventories: [],
    sundryDebtorsAmount: [],
    balanceWithBank: [],
    cashInHand: [],
    loanAndAdvances: [],
    otherAssets: [],
    totalAssets: []
}

export interface TaxSummary{
    salary: string,  
    housePropertyIncome: string,
    otherIncome: string,   

    totalDeduction: string,
    grossTotalIncome: string,
    totalIncomeAfterDeductionIncludeSR: string,
    forRebate87Tax: string,
    taxOnTotalIncome: string,
    totalIncomeForRebate87A: string,
    rebateUnderSection87A: string,
    taxAfterRebate: string,
    surcharge: string,
    cessAmount: string,
    grossTaxLiability: string,
    taxReliefUnder89: string,
    taxReliefUnder90_90A: string,
    taxReliefUnder91: string,
    totalTaxRelief: string,
    netTaxLiability: string,
    interestAndFeesPayable: string,    
    s234A: string,
    s234B: string,
    s234C: string,
    s234F: string,
    agrigateLiability: string,
    taxPaidAdvancedTax: string,
    taxPaidTDS: string,
    taxPaidTCS: string,
    selfassessmentTax: string,
    totalTaxesPaid: string,												
    taxpayable: string,			
    taxRefund: string,			
    totalTax: string,   
    advanceTaxSelfAssessmentTax: string,
    taxAtNormalRate: '',
    taxAtSpecialRate: '',
    rebateOnAgricultureIncome: '',
    sec112Tax: '',
    specialIncomeAfterAdjBaseLimit: '',
    aggregateIncome: '',
    agricultureIncome: '',
    carryForwardLoss: '',
    capitalGain: null,
    presumptiveIncome: ''
}

export interface AssetsLiabilities{
    cashInHand: null,
	loanAmount: null,
	shareAmount: null,
	bankAmount: null,
	assetLiability: null,
	insuranceAmount: null,
	artWorkAmount: null,
    jwelleryAmount: null,
    vehicleAmount: null,
    immovable: []
}

export interface CapitalGain{
    shortTermCapitalGain: [],
    shortTermCapitalGainAt15Percent: [],
    longTermCapitalGainAt10Percent: [],
    longTermCapitalGainAt20Percent: [],
    shortTermCapitalGainTotal: string,
	shortTermCapitalGainAt15PercentTotal: string,
	longTermCapitalGainAt10PercentTotal: string,
	longTermCapitalGainAt20PercentTotal: string
}