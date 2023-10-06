export interface ITR_JSON {
  id: any;
  fixedAssetsDetails?: FixedAssetsDetails[];
  zeroBonds?: any;
  bonds?: any;
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
  capitalGain: NewCapitalGain[];
  business: NewBusiness;
  pastYearLosses: PastYearLosses[];
  foreignIncome: foreignIncome;
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
  seventhProviso139: SeventhProviso139;
  depPayInvClmUndDednVIA: string;
  regime: string;
  previousYearRegime: string;
  dividendIncomes?: any[];
  exemptIncomes?: any[];
  jurisdictions?: Jurisdictions[];
  conditionsResStatus?: any;
  movableAsset?: MovableAsset[];
  immovableAsset?: Immovable[];
  bondsDeduction?: Deduction[];
  carryForwordLosses?: CarryForwardLosses[];
  currentYearLosses?: CurrentYearLosses;
  adjustmentofLossesInScheduleBFLA?: AdjustmentofLossesInScheduleBFLA;
  totalOfEarlierYearLosses?: TotalOfEarlierYearLosses;
  totalLossCarriedForwardedToFutureYears?: TotalLossCarriedForwardedToFutureYears;

  prefillDate: string;
  prefillData: any;
  prefillDataSource: string;
  everOptedNewRegime: OptedInNewRegime;
  everOptedOutOfNewRegime: OptedOutNewRegime;
  optionForCurrentAY: CurrentNewRegime;

  section89: any;
  acknowledgement89: any;
  acknowledgementDate89: any;

  section90: any;
  acknowledgement90: any;
  acknowledgementDate90: any;

  section91: any;
  acknowledgement91: any;
  acknowledgementDate91: any;

  itrSummaryJson: any;
  isItrSummaryJsonEdited: boolean;
}

export interface foreignIncome {
  id: any;
  taxPaidOutsideIndiaFlag: any;
  taxReliefAssessmentYear: any;
  taxAmountRefunded: any;
  taxReliefClaimed: taxReliefClaimed[];
  foreignAssets: foreignAssets;
}

export interface taxReliefClaimed {
  id: any;
  reliefClaimedUsSection: any;
  countryCode: any;
  countryName: any;
  taxPayerID: any;
  claimedDTAA: any;
  headOfIncome: headOfIncome[];
}

export interface headOfIncome {
  id: any;
  incomeType: any;
  outsideIncome: any;
  outsideTaxPaid: any;
  taxPayable: any;
  taxRelief: any;
  claimedDTAA: any;
}

export interface depositoryAccounts {
  countryCode: any;
  nameOfInstitution: any;
  addressOfInstitution: any;
  zipCode: any;
  countryName: any;
  accountNumber: any;
  status: any;
  accountOpeningDate: any;
  peakBalance: any;
  closingBalance: any;
  grossAmountNature: any;
  grossInterestPaid: any;
  dateOfContract: any;
  cashValue: any;
  totalGrossAmountPaid: any;
}

export interface custodialAccounts {
  countryCode: any;
  nameOfInstitution: any;
  addressOfInstitution: any;
  zipCode: any;
  countryName: any;
  accountNumber: any;
  status: any;
  accountOpeningDate: any;
  peakBalance: any;
  closingBalance: any;
  grossAmountNature: any;
  grossInterestPaid: any;
  dateOfContract: any;
  cashValue: any;
  totalGrossAmountPaid: any;
}

export interface equityAndDebtInterest {
  countryCode: any;
  zipCode: any;
  addressOfEntity: any;
  nameOfEntity: any;
  natureOfEntity: any;
  dateOfInterest: any;
  initialValue: any;
  peakValue: any;
  closingValue: any;
  totalGrossAmountPaid: any;
  totalGrossProceedsFromSale: any;
  countryName: any;
}

export interface cashValueInsurance {
  countryCode: any;
  nameOfInstitution: any;
  addressOfInstitution: any;
  zipCode: any;
  countryName: any;
  accountNumber: any;
  status: any;
  accountOpeningDate: any;
  peakBalance: any;
  closingBalance: any;
  grossAmountNature: any;
  grossInterestPaid: any;
  dateOfContract: any;
  cashValue: any;
  totalGrossAmountPaid: any;
}

export interface financialInterestDetails {
  id: any;
  countryCode: any;
  zipCode: any;
  natureOfEntity: any;
  nameOfEntity: any;
  address: any;
  natureOfInterest: any;
  date: any;
  totalInvestments: any;
  accruedIncome: any;
  natureOfIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface immovablePropertryDetails {
  id: any;
  countryCode: any;
  address: any;
  ownerShip: any;
  zipCode: any;
  date: any;
  totalInvestments: any;
  derivedIncome: any;
  natureOfIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface capitalAssetsDetails {
  id: any;
  countryCode: any;
  zipCode: any;
  natureOfAsstes: any;
  ownerShip: any;
  date: any;
  totalInvestments: any;
  derivedIncome: any;
  natureOfIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface signingAuthorityDetails {
  id: any;
  institutionName: any;
  countryCode: any;
  zipCode: any;
  address: any;
  accountHolderName: any;
  accountNumber: any;
  peakBalance: any;
  isTaxableinYourHand: any;
  accruedIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface trustsDetails {
  id: any;
  countryCode: any;
  zipCode: any;
  trustName: any;
  trustAddress: any;
  trusteesName: any;
  trusteesAddress: any;
  settlorName: any;
  settlorAddress: any;
  beneficiariesName: any;
  beneficiariesAddress: any;
  date: any;
  isTaxableinYourHand: any;
  derivedIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface otherIncomeDetails {
  id: any;
  countryCode: any;
  zipCode: any;
  name: any;
  address: any;
  natureOfIncome: any;
  isTaxableinYourHand: any;
  derivedIncome: any;
  amount: any;
  scheduleOfferd: any;
  numberOfSchedule: any;
  countryName: any;
}

export interface foreignAssets {
  id: null;
  depositoryAccounts: depositoryAccounts[];
  custodialAccounts: custodialAccounts[];
  equityAndDebtInterest: equityAndDebtInterest[];
  cashValueInsurance: cashValueInsurance[];
  financialInterestDetails: financialInterestDetails[];
  immovablePropertryDetails: immovablePropertryDetails[];
  capitalAssetsDetails: capitalAssetsDetails[];
  signingAuthorityDetails: signingAuthorityDetails[];
  trustsDetails: trustsDetails[];
  otherIncomeDetails: otherIncomeDetails[];
}

export interface CurrentNewRegime {
  currentYearRegime: string;
  assessmentYear: string;
  date: string;
  acknowledgementNumber: string;
}
export interface OptedInNewRegime {
  everOptedNewRegime: boolean;
  assessmentYear: string;
  date: string;
  acknowledgementNumber: string;
}

export interface OptedOutNewRegime {
  everOptedOutOfNewRegime: boolean;
  assessmentYear: string;
  date: string;
  acknowledgementNumber: string;
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
  grossAnnualRentReceivedTotal: number;
  propertyTax: number;
  taxableIncome: number;
  exemptIncome: number;
  isEligibleFor80EE: boolean;
  isEligibleFor80EEA: boolean;
  tenant: Tenant[];
  coOwners: CoOwners[];
  ownerPercentage: number;
  loans: Loans[];
}

export interface PresumptiveIncomes {
  businessType: string;
  natureOfBusiness: string;
  description: string;
  tradeName: string;
  incomes: Incomes[];
  taxableIncome: number;
  exemptIncome: number;
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
export interface NewCapitalGain {
  assessmentYear: string;
  assesseeType: string;
  residentialStatus: string;
  assetType: string;
  assetDetails?: AssetDetails[];
  improvement: Improvement[];
  deduction?: Investments[];
  buyersDetails: BuyersDetails[];
}

export interface AssetDetails {
  brokerName: String;
  capitalGain: number;
  srn: number;
  id: string;
  description: string;
  gainType: string;
  grandFatheredValue: number;
  sellDate: string;
  sellValue: number;
  stampDutyValue: number;
  valueInConsideration: number;
  sellExpense: number;
  purchaseDate: string;
  purchaseCost: number;
  isinCode: string;
  nameOfTheUnits: string;
  sellOrBuyQuantity: number;
  sellValuePerUnit: number;
  purchaseValuePerUnit: number;
  isUploaded: boolean;
  hasIndexation: boolean;
  algorithm: string;
  fmvAsOn31Jan2018: string;
  indexCostOfAcquisition: number;
  totalFairMarketValueOfCapitalAsset: number;
}

export interface NewCapitalGain {
  assetType: string;
  assetDetails?: AssetDetails[];
  improvement: Improvement[];
  deduction?: Investments[];
  buyersDetails: BuyersDetails[];
}
export interface Improvement {
  id: number;
  srn: number;
  dateOfImprovement: string;
  costOfImprovement: number;
  indexCostOfImprovement: number;
  financialYearOfImprovement: string;
}
export interface Investments {
  srn: number;
  underSection: string;
  orgAssestTransferDate: string;
  costOfNewAssets: number;
  purchaseDate: string;
  investmentInCGAccount: number;
  totalDeductionClaimed: number;

  // "panOfEligibleCompany":"",
  // "purchaseDatePlantMachine":"",
  // "costOfPlantMachinary":0
}
export interface BuyersDetails {
  id: string;
  srn: number;
  name: string;
  pan: string;
  aadhaarNumber: string;
  share: number;
  amount: number;
  address: string;
  pin: string;
  city: string;
  state: string;
  country: string;
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

export interface businessIncome {
  id: number;
  natureOfBusiness: any;
  tradeName: any;
  receipts: any;
  presumptiveIncome: any;
  periodOfHolding: any;
  minimumPresumptiveIncome: any;
  incomes: any;
  businessType: any;
  label: any;
  salaryInterestAmount: any;
  taxableIncome: any;
  exemptIncome: any;
}

export interface professionalIncome {
  natureOfBusiness: any;
  tradeName: any;
  receipts: any;
  presumptiveIncome: any;
}

export interface Bonds {
  srn: Number;
  id: any;
  description: any;
  purchaseDate: any;
  stampDutyValue: any;
  valueInConsideration: any;
  indexCostOfAcquisition: Number;
  costOfImprovement: Number;
  sellDate: any;
  sellValue: Number;
  sellExpense: Number;
  gainType: any;
  capitalGain: Number;
  purchaseCost: any;
  isinCode: any;
  nameOfTheUnits: any;
  sellOrBuyQuantity: any;
  sellValuePerUnit: any;
  purchaseValuePerUnit: any;
  isUploaded: any;
  algorithm: any;
  hasIndexation: any;
  fmvAsOn31Jan2018: any;
}

export interface Deduction {
  srn: number;
  underSection: any;
  orgAssestTransferDate: any;
  panOfEligibleCompany: any;
  purchaseDatePlantMachine: any;
  purchaseDate: any;
  costOfNewAssets: Number;
  investmentInCGAccount: Number;
  totalDeductionClaimed: Number;
  costOfPlantMachinary: any;
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
  srNo: string;
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
  srNo: string;
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
  srNo: string;
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
  srNo: string;
  collectorName: string;
  collectorTAN: string;
  totalAmountPaid: number;
  // totalTaxCollected: number;
  totalTcsDeposited: number;
  taxDeduction: any;
}

export interface OtherThanTDSTCS {
  srNo: string;
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
  artWorkAmount: number;
  vehicleAmount: number;
  bankAmount: number;
  shareAmount: number;
  insuranceAmount: number;
  loanAmount: number;
  cashInHand: number;
  assetLiability: number;
}

export interface CarryForwardLosses {
  assessmentPastYear: string;
  dateofFilling: string;
  housePropertyLoss: number;
  STCGLoss: number;
  LTCGLoss: number;
  pastYear: number;
  totalLoss: number;
  speculativeBusinessLoss: number;
  broughtForwordBusinessLoss: number;
  setOffDuringTheYear: number;
  // adjustedAmount: number;
}

export interface NewBusiness {
  presumptiveIncomes: NewPresumptiveIncomes[];
  profitLossACIncomes: ProfitLossACIncomes[];
  financialParticulars: NewFinancialParticulars;
  fixedAssetsDetails: FixedAssetsDetails[];
  businessDescription: BusinessDescription[];
}
export interface NewPresumptiveIncomes {
  id: any;
  businessType: string;
  natureOfBusiness: string;
  label: any;
  tradeName: string;
  salaryInterestAmount: any;
  taxableIncome: any;
  exemptIncome: any;
  incomes: NewIncomes[];
  receipts: any;
  presumptiveIncome: any;
  minimumPresumptiveIncome: any;
  periodOfHolding: any;
}

export interface NewIncomes {
  id: any;
  incomeType: string;
  receipts: Number;
  presumptiveIncome: Number;
  periodOfHolding: Number;
  minimumPresumptiveIncome: Number;
  registrationNo: any;
  ownership: any;
  tonnageCapacity: any;
}

export interface ProfitLossACIncomes {
  id: Number;
  businessType: string;
  totalgrossProfitFromNonSpeculativeIncome?: Number;
  netProfitfromNonSpeculativeIncome?: Number;
  incomes: ProfitLossIncomes[];
  expenses?: NewExpenses[];
  totalgrossProfitFromSpeculativeIncome?: Number;
  netProfitfromSpeculativeIncome?: Number;
}

export interface ProfitLossIncomes {
  id: Number;

  brokerName: string;
  incomeType: string;
  turnOver: Number;
  finishedGoodsOpeningStock?: Number;
  finishedGoodsClosingStock?: Number;
  purchase?: Number;
  COGS?: Number;
  grossProfit: any;
  expenditure?: number;
  netIncomeFromSpeculativeIncome?: number;
}

export interface NewExpenses {
  expenseType: string;
  expenseAmount: Number;
  description: any;
}
export interface NewFinancialParticulars {
  id: Number;
  membersOwnCapital: any;
  securedLoans: any;
  unSecuredLoans: any;
  advances: any;
  sundryCreditorsAmount: Number;
  otherLiabilities: any;
  totalCapitalLiabilities: any;
  fixedAssets: any;
  inventories: Number;
  sundryDebtorsAmount: Number;
  balanceWithBank: any;
  cashInHand: Number;
  loanAndAdvances: any;
  investment: any;
  otherAssets: any;
  totalAssets: any;
  GSTRNumber: any;
  grossTurnOverAmount: any;
  difference: number;
}

export interface FixedAssetsDetails {
  hasEdit: boolean;
  id: Number;
  assetType: string;
  description: string;
  bookValue: Number;
  depreciationRate: string;
  depreciationAmount: Number;
  fixedAssetClosingAmount: Number;
}

export interface BusinessDescription {
  id: any;
  natureOfBusiness: any;
  tradeName: any;
  businessDescription: any;
}

export interface CurrentYearLosses {
  assessmentYear: string;
  housePropertyLoss: number;
  STCGLoss: number;
  LTCGLoss: number;
  totalLoss: number;
  speculativeLoss: number;
  businessLoss: number;
}
export interface PastYearLosses {
  hasEdit: boolean;
  dateofFilling: any;
  pastYear: number;
  assessmentPastYear: string;
  housePropertyLoss: number;
  LTCGLoss: number;
  STCGLoss: number;
  speculativeBusinessLoss: number;
  broughtForwordBusinessLoss: number;
  setOffWithCurrentYearSpeculativeBusinessIncome: number;
  setOffWithCurrentYearBroughtForwordBusinessIncome: number;
  setOffWithCurrentYearHPIncome: number;
  setOffWithCurrentYearSTCGIncome: number;
  setOffWithCurrentYearLTCGIncome: number;
  carryForwardAmountBusiness: number;
  carryForwardAmountSpeculative: number;
  carryForwardAmountHP: number;
  carryForwardAmountSTCGIncome: number;
  carryForwardAmountLTCGIncome: number;
  totalLoss: number;
}

export interface AdjustmentofLossesInScheduleBFLA {
  housePropertyLoss: number;
  STCGLoss: number;
  LTCGLoss: number;
  totalLoss: number;
  speculativeBusinessLoss: number;
  broughtForwordBusinessLoss: number;
}
export interface TotalOfEarlierYearLosses {
  housePropertyLoss: number;
  STCGLoss: number;
  LTCGLoss: number;
  totalLoss: number;
  speculativeBusinessLoss: number;
  broughtForwordBusinessLoss: number;
}
export interface TotalLossCarriedForwardedToFutureYears {
  housePropertyLoss: number;
  STCGLoss: number;
  LTCGLoss: number;
  totalLoss: number;
  speculativeBusinessLoss: number;
  broughtForwordBusinessLoss: number;
}
