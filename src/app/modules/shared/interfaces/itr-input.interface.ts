export interface ITR_JSON {
    ackStatus: string;
    acknowledgementReceived: boolean;
    userId: number;
    itrId: any;
    pid: any;
    email: string;
    contactNumber: string;
    panNumber: string;
    aadharNumber: string;
    residentialStatus: string;
    maritalStatus: string;
    assesseeType: string;
    assessmentYear: string;
    currency: string;
    locale: string;
    financialYear: string;
    filingTeamMemberId: any;
    planIdSelectedByUser: any;
    planIdSelectedByTaxExpert: any;
    eFillingPortalPassword: string;
    isRevised: string;
    isDefective: string;
    noticeIdentificationNo: string;
    dateOfNotice: string;
    isLate: string;
    eFillingCompleted: boolean;
    eFillingDate: string;
    employerCategory: string;
    orgITRAckNum: any;
    ackNumber: string;
    orgITRDate: string;
    itrType: string;
    planName: string;
    family: Family[];
    address: Address;
    declaration: Declaration;
    disability: Disability;
    disabilities?: Disabilities[];
    upload: Upload[];
    employers: Employer[];
    houseProperties: HouseProperties[];
    capitalGain: CapitalGain[];
    business: Business;
    pastYearLosses: PastYearLosses[];
    foreignIncome: null;
    incomes: OtherIncome[];
    investments: OtherInvestment[];
    donations: Donations[];
    loans: OtherLoan[];
    expenses: Expenses[];
    insurances: Insurance[];
    assetsLiabilities: AssetsLiabilities;
    bankDetails: BankDetails[];
    taxPaid: TaxPaid;
    systemFlags: SystemFlags;
    agriculturalDetails: AgriculturalDetails;
    itrProgress: string[];
    directorInCompany: DirectorInCompany[];
    unlistedSharesDetails: UnlistedSharesDetails[];
    dateOfDividendIncome: string;
    lastVisitedURL: string;
    seventhProviso139: SeventhProviso139,
    depPayInvClmUndDednVIA: string;
    regime: string;
    previousYearRegime: string;
    dividendIncomes?: any[];
    exemptIncomes?: any[];
    jurisdictions?: Jurisdictions[],
    conditionsResStatus?: any,
    movableAsset?: MovableAsset[],
    immovableAsset?: Immovable[]
}
export interface DirectorInCompany {
    companyName: string;
    typeOfCompany: string;
    companyPAN: string;
    sharesType: string;
    din: string;
}
export interface UnlistedSharesDetails {
    companyName: string;
    typeOfCompany: string;
    companyPAN: string;
    openingShares: number;
    openingCOA: number;
    acquiredShares: number;
    purchaseDate: string;
    faceValuePerShare: number;
    issuePricePerShare: number;
    purchasePricePerShare: number;
    transferredShares: number;
    saleConsideration: number;
    closingShares: number;
    closingCOA: number;
}
export interface Family {
    pid: any;
    fName: string;
    mName: string;
    lName: string;
    fatherName: string;
    age: any;
    gender: string;
    relationShipCode: string;
    relationType: string;
    dateOfBirth: Date;
}

export interface Address {
    flatNo: string;
    premisesName: string;
    road: string;
    area: string;
    state: string;
    country: string;
    city: string;
    pinCode: string;
}
export interface Declaration {
    name: string;
    childOf: string;
    capacity: string;
    panNumber: string;
    place: string;
}
export interface Disability {
    percentSelf: string;
    dependentDisabilityPercent: string;
    dependentRelation: string;
}
export interface Disabilities {
    typeOfDisability: string;
    amount: number;
}
export interface HouseProperties {
    propertyType: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    grossAnnualRentReceived: number;
    propertyTax: number;
    taxableIncome: number;
    exemptIncome: number;
    isEligibleFor80EE: boolean;
    isEligibleFor80EEA: boolean;
    tenant: Tenant[];
    coOwners: CoOwners[];
    loans: Loans[];
}
export interface Business {
    presumptiveIncomes: PresumptiveIncomes[];
    financialParticulars: FinancialParticulars;
}
export interface PresumptiveIncomes {
    businessType: string;
    natureOfBusiness: string;
    tradeName: string;
    incomes: Incomes[];
    taxableIncome: number;
    exemptIncome: number;
}
export interface FinancialParticulars {
    GSTRNumber: string;
    grossTurnOverAmount: number;
    membersOwnCapital: number;
    securedLoans: number;
    unSecuredLoans: number;
    advances: number;
    sundryCreditorsAmount: number;
    otherLiabilities: number;
    totalCapitalLiabilities: number;
    fixedAssets: number;
    inventories: number;
    sundryDebtorsAmount: number;
    balanceWithBank: number;
    cashInHand: number;
    loanAndAdvances: number;
    otherAssets: number;
    totalAssets: number;
}
export interface Incomes {
    incomeType: string;
    receipts: number;
    presumptiveIncome: number;
    periodOfHolding: number;
    minimumPresumptiveIncome: number;
}
export interface Tenant {
    name: string;
    panNumber: string;
}
export interface CoOwners {
    name: string;
    isSelf: boolean;
    panNumber: string;
    percentage: number;
}
export interface Loans {
    loanType: string;
    principalAmount: number;
    interestAmount: number;
}
export interface CapitalGain {
    assetType: string;
    description: string;
    gainType: string;
    sellDate: string;
    sellValue: number;
    stampDutyValue: number;
    valueInConsideration: number;
    sellExpense: number;
    purchaseDate: string;
    purchaseCost: number;
    improvement: Improvement[];
    isUploaded: boolean;
    hasIndexation: boolean;
    algorithm: string;
    fmvAsOn31Jan2018: number;
    cgOutput: any[];
    investments: Investments[];
    buyersDetails: BuyersDetails[];
}
export interface Improvement {
    id: number;
    dateOfImprovement: string;
    costOfImprovement: number;
    indexCostOfImprovement: number;
}
export interface Investments {
    underSection: string;
    orgAssestTransferDate: string;
    costOfNewAssets: number;
    purchaseDate: string;
    investmentInCGAccount: number;
    totalDeductionClaimed: number;
}
export interface BuyersDetails {
    name: string;
    pan: string;
    share: number;
    amount: number;
    address: string;
    pin: string;
}

export interface Employer {
    id: string;
    employerName: string;
    address: string;
    city: string;
    pinCode: string;
    state: string;
    employerPAN: string;
    employerTAN: string;
    taxableIncome: number;
    exemptIncome: number;
    standardDeduction: number;

    // AYAsPerForm16: string;
    periodFrom: string;
    periodTo: string;
    // amountPaidAsPerForm16: number;
    taxDeducted: number;
    taxRelief: number;
    employerCategory: string;
    salary: Salary[];
    allowance: Allowance[];
    perquisites: Perquisites[];
    profitsInLieuOfSalaryType: ProfitsInLieuOfSalary[];
    deductions: Deductions[];
    upload: Upload[];
    calculators: null;
}

export interface Salary {
    salaryType: string;
    taxableAmount: number;
    exemptAmount: number;
}
export interface Allowance {
    allowanceType: string;
    taxableAmount: number;
    exemptAmount: number;
}
export interface Perquisites {
    perquisiteType: string;
    taxableAmount: number;
    exemptAmount: number;
}
export interface ProfitsInLieuOfSalary {
    salaryType: string;
    taxableAmount: number;
    exemptAmount: number;
}
export interface Deductions {
    deductionType: string;
    taxableAmount: number;
    exemptAmount: number;
}
export interface Upload {
    docType: string;
    name: string;
    uniqueName: number;
    date: string;
}
export interface PastYearLosses {
    LTCGLoss: number;
    STCGLoss: number;
    assessmentPastYear: string;
    dateofFilling: any;
    housePropertyLoss: number;
    pastYear: number;
}


export interface OtherIncome {
    incomeType: string;
    details: string;
    amount: number;
    expenses: number;
}

export interface Insurance {
    insuranceType: string;
    typeOfPolicy: string;
    policyFor: string;
    premium: number;
    medicalExpenditure: number;
    preventiveCheckUp: number;
    sumAssured: number;
    healthCover: number;
}

export interface Donations {
    identifier: string;
    donationType: string;
    amountInCash: number;
    amountOtherThanCash: number;
    schemeCode: string;
    details: string;
    name: string;
    address: string;
    city: string;
    pinCode: string;
    state: string;
    panNumber: string;
}

// Assets and Liability
export interface AssetsLiabilities {
    jwelleryAmount: number;
    artWorkAmount: number;
    vehicleAmount: number;
    bankAmount: number;
    shareAmount: number;
    insuranceAmount: number;
    loanAmount: number;
    cashInHand: number;
    assetLiability: number;
    immovable: Immovable[];
}

export interface Immovable {
    description: string;
    flatNo: string;
    premisesName: string;
    road: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    amount: number;
}
export interface BankDetails {
    bankType: string;
    ifsCode: string;
    name: string;
    accountNumber: string;
    hasRefund: boolean;
    swiftcode: string;
    countryName: string;
}

// flags
export interface SystemFlags {
    hasSalary: boolean;
    hasHouseProperty: boolean;
    hasMultipleProperties: boolean;
    hasForeignAssets: boolean;
    hasCapitalGain: boolean;
    hasBroughtForwardLosses: boolean;
    hasAgricultureIncome: boolean;
    hasOtherIncome: boolean;
    hasParentOverSixty: boolean;
    // hasPresumptiveIncome: boolean;
    hasBusinessProfessionIncome: boolean;
    hasFutureOptionsIncome: boolean;
    hasNRIIncome: boolean;
    hraAvailed: boolean;

    // Mobile Use
    // hasDisabilitySelf: boolean;
    // hasEducationalLoan: boolean;
    // hasHRA: boolean;
    // hasAnyOtherDonations: boolean;
    // hasMedicalExpense: boolean;
    // hasExtendedEndDate: boolean;
    // hasForeignBank: boolean;
    directorInCompany: boolean;
    haveUnlistedShares: boolean;
}

// agriculture income
export interface AgriculturalDetails {
    nameOfDistrict: string;
    landInAcre: number;
    owner: string;
    typeOfLand: string;
    pinCode: string;
}

export interface OtherInvestment {
    investmentType: string;
    amount: number;
    details: string;
}

export interface OtherLoan {
    loanType: string;
    name: string;
    interestPaidPerAnum: number;
    principalPaidPerAnum: number;
    loanAmount: number;
    details: string;
}
export interface Expenses {
    expenseType: string;
    expenseFor: number;
    details: string;
    amount: number;
    noOfMonths: number;
}
export interface TaxPaid {
    onSalary: OnSalary[];
    otherThanSalary16A: OtherThanSalary16A[];
    otherThanSalary26QB: OtherThanSalary26QB[];
    tcs: TCS[];
    otherThanTDSTCS: OtherThanTDSTCS[];
    paidRefund: PaidRefund[];
}


export interface OnSalary {
    srNo: number;
    deductorName: string;
    deductorTAN: string;
    totalAmountCredited: number;
    totalTdsDeposited: number;
    /* ackNumber: number;
    deductorPAN: string;
    transactionDate: string;
    transactionAmount: number; */
    taxDeduction: any;
}

export interface OtherThanSalary16A {
    srNo: number;
    deductorName: string;
    deductorTAN: string;
    totalAmountCredited: number;
    totalTdsDeposited: number;
    /* ackNumber: number;
    deductorPAN: string;
    transactionDate: string;
    transactionAmount: number; */
    uniqueTDSCerNo: string;
    taxDeduction: any;
    headOfIncome: string;

}

export interface OtherThanSalary26QB {
    srNo: number;
    deductorName: string;
    deductorPAN: string;
    totalAmountCredited: number;
    totalTdsDeposited: number;
    /* ackNumber: number;
    deductorTAN: string;
    transactionDate: string;
    transactionAmount: number; */
    uniqueTDSCerNo: string;
    taxDeduction: any;
    headOfIncome: string;
}

export interface TCS {
    srNo: number;
    collectorName: string;
    collectorTAN: string;
    totalAmountPaid: number;
    // totalTaxCollected: number;
    totalTcsDeposited: number;
    taxDeduction: any;
}

export interface OtherThanTDSTCS {
    srNo: number;
    totalTax: number;
    bsrCode: string;
    dateOfDeposit: string; // date
    challanNumber: string;
}

export interface PaidRefund {
    srNo: number;
    assessmentYear: string;
    mode: string;
    amountOfRefund: number;
    intrest: number;
    dateOfPayment: any;
    taxDeduction: any;
}

export interface SeventhProviso139 {
    depAmtAggAmtExcd1CrPrYrFlg: number;
    incrExpAggAmt2LkTrvFrgnCntryFlg: number;
    incrExpAggAmt1LkElctrctyPrYrFlg: number;
}
export interface Jurisdictions {
    jurisdictionResidence: any;
    Tin: any;
}

export interface MovableAsset {
    jwelleryAmount: number;
    artWorkAmount:number;
    vehicleAmount:number;
    bankAmount:number;
    shareAmount:number;
    insuranceAmount:number;
    loanAmount:number;
    cashInHand:number;
    assetLiability:number;
}