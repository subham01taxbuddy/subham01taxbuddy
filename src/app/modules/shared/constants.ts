import { environment } from "src/environments/environment";

export class AppConstants {
    public static emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    public static panNumberRegex = /^[A-Z]{3}[P,H,C,F,A,B,L,J,G]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panDoneeRegex = /^[A-Z]{3}[P,H,C,F,A,B,L,J,G,T]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panIndividualRegex = /^[A-Z]{3}[P]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panIndHUFRegex = /^[A-Z]{3}[P,H]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static tanNumberRegex = /^[A-Z]{4}\d{5}[A-Z]{1}$/;
    public static mobileNumberRegex = /^[1-9]{1}[0-9]{9}$/;  // regex given by dinesh  //"[0-9]{10}"
    public static charRegex = '[a-zA-Z ]*';
    public static charAndNoRegex = '^[a-zA-Z0-9 _]*[a-zA-Z0-9][a-zA-Z0-9 _]*$';   //'[a-zA-Z0-9]*$';
    public static IFSCRegex = /^[A-Za-z]{4}[0][A-Za-z0-9]{6}$/;
    public static gstrReg = '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}';
    public static GSTNRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

    public static numericRegex = '[0-9]*';
    public static amountWithoutDecimal = /^[0-9]*$/;
    public static amountWithDecimal = /^\s*-?\d+(\.\d{1,2})?\s*$/;
    public static indianCurrencySymbol = '₹ ';
    public static PINCode = '[1-9]{1}[0-9]{5}';
    // public static ayYear = '2020-2021';
    // public static fyYear = '2019-2020';

    public static USER_OBJ = environment.production ? 'USER_OBJ' : 'USER_OBJ';
    public static TOKEN = environment.production ? 'TOKEN' : 'TOKEN';
    public static IS_USER_LOGGED_IN = environment.production ? 'IS_USER_LOGGED_IN' : 'IS_USER_LOGGED_IN';
    public static ITR_JSON = environment.production ? 'ITR_JSON' : 'ITR_JSON';
    public static TAX_SUM = environment.production ? 'TAX_SUM' : 'TAX_SUM';
    public static NAME = environment.production ? 'name' : 'name';
    public static ITR_DOCS = environment.production ? 'ITR_DOCS' : 'ITR_DOCS';
    public static SME_LIST = environment.production ? 'SME_LIST' : 'SME_LIST';
    public static MASTER_STATUS = environment.production ? 'MASTER_STATUS' : 'MASTER_STATUS';
    public static FY_LIST = environment.production ? 'FY_LIST' : 'FY_LIST';
    public static AGENT_LIST = environment.production ? 'AGENT_LIST' : 'AGENT_LIST';
    public static MY_AGENT_LIST = environment.production ? 'MY_AGENT_LIST' : 'MY_AGENT_LIST';
    public static SELECTED_AGENT = environment.production ? 'SELECTED_AGENT' : 'SELECTED_AGENT';
    public static LOGGED_IN_SME_INFO = environment.production ? 'LOGGED_IN_SME_INFO' : 'LOGGED_IN_SME_INFO';
    public static BANK_LIST = environment.production ? 'BANK_LIST' : 'BANK_LIST';
    public static gstFyList = [
        { financialYear: '2022-23' },
        { financialYear: '2021-22' },
        { financialYear: '2020-21' },
        { financialYear: '2019-20' },
        { financialYear: '2018-19' },
        // { financialYear: '2017-18' },
    ];
    public static subscriptionFyList = [
        { financialYear: '2022-2023' },
        { financialYear: '2021-2022' },
        { financialYear: '2020-2021' },
    ];

    public static gstMonthList = [
        { value: 'Jan', displayName: 'Jan' },
        { value: 'Feb', displayName: 'Feb' },
        { value: 'Mar', displayName: 'Mar' },
        { value: 'Apr', displayName: 'Apr' },
        { value: 'May', displayName: 'May' },
        { value: 'Jun', displayName: 'Jun' },
        { value: 'Jul', displayName: 'Jul' },
        { value: 'Aug', displayName: 'Aug' },
        { value: 'Sep', displayName: 'Sep' },
        { value: 'Oct', displayName: 'Oct' },
        { value: 'Nov', displayName: 'Nov' },
        { value: 'Dec', displayName: 'Dec' },
    ];
    public static gstTypesMaster = [{ label: 'Regular', value: 'REGULAR' },
    { label: 'Composite', value: 'COMPOSITE' },
    { label: 'Input Service Distributor (ISD)', value: 'Input Service Distributor (ISD)' }];
    public static frequencyTypesMaster = [{ label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Yearly', value: 'YEARLY' }];
    public static returnTypeMaster = [{ label: 'CMP08', value: 'CMP08' }, { label: 'GSTR-3B', value: 'GSTR-3B' }, { label: 'GSTR1', value: 'GSTR1' }, { label: 'Original', value: 'ORIGINAL' }, { label: 'Revised', value: 'REVISED' }];
    /* public static financialYearList = [{
        "id": 1,
        "fincialYear": "2019-2020",
        "assessmentYear": "2020-2021",
        "filingDueDate": "10-01-2021",
        "lateFilingDueDate": "31-05-2021",
        "isFilingActive": "false"
    }, {
        "id": 2,
        "fincialYear": "2018-2019",
        "assessmentYear": "2019-2020",
        "filingDueDate": "31-07-2021",
        "lateFilingDueDate": "31-12-2021",
        "isFilingActive": "false"
    }, {
        "id": 3,
        "fincialYear": "2017-2018",
        "assessmentYear": "2018-2019",
        "filingDueDate": "31-07-2021",
        "lateFilingDueDate": "31-12-2021",
        "isFilingActive": "false"
    }, {
        "id": 4,
        "fincialYear": "2020-2021",
        "assessmentYear": "2021-2022",
        "filingDueDate": "31-07-2021",
        "lateFilingDueDate": "31-12-2021",
        "isFilingActive": "true"
    }]; */

    public static sourceList: any = [{ label: 'Play store', value: 'PLAY_STORE' }, { label: 'Apple store', value: 'APPLE_STORE' }, { label: 'Google workspace', value: 'GOOGLE_WORKSPACE' }];
    public static reviewStatusList: any = [{ label: 'Yes', value: true }, { label: 'No', value: false }];
    public static productList: any = [{ label: 'Taxbuddy', value: 'TAXBUDDY' }, { label: 'Finbingo', value: 'FINBINGO' }];
    public static sentimentList: any = [{ label: 'Positive', value: 'POSITIVE' }, { label: 'Negative', value: 'NEGATIVE' }];
    public static stateDropdown: any = [{
        "id": "5b4599c9c15a76370a3424c2",
        "stateId": "1",
        "countryCode": "91",
        "stateName": "Andaman and Nicobar Islands",
        "stateCode": "01",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c3",
        "stateId": "2",
        "countryCode": "91",
        "stateName": "Andhra Pradesh",
        "stateCode": "02",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c4",
        "stateId": "3",
        "countryCode": "91",
        "stateName": "Arunachal Pradesh",
        "stateCode": "03",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c5",
        "stateId": "4",
        "countryCode": "91",
        "stateName": "Assam",
        "stateCode": "04",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c6",
        "stateId": "5",
        "countryCode": "91",
        "stateName": "Bihar",
        "stateCode": "05",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c7",
        "stateId": "6",
        "countryCode": "91",
        "stateName": "Chandigarh",
        "stateCode": "06",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c8",
        "stateId": "7",
        "countryCode": "91",
        "stateName": "Chattisgarh",
        "stateCode": "33",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424c9",
        "stateId": "8",
        "countryCode": "91",
        "stateName": "Dadra Nagar and Haveli",
        "stateCode": "07",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424ca",
        "stateId": "9",
        "countryCode": "91",
        "stateName": "Daman and Diu",
        "stateCode": "08",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424cb",
        "stateId": "10",
        "countryCode": "91",
        "stateName": "Delhi",
        "stateCode": "09",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424cc",
        "stateId": "11",
        "countryCode": "91",
        "stateName": "Goa",
        "stateCode": "10",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424cd",
        "stateId": "12",
        "countryCode": "91",
        "stateName": "Gujarat",
        "stateCode": "11",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424ce",
        "stateId": "13",
        "countryCode": "91",
        "stateName": "Haryana",
        "stateCode": "12",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424cf",
        "stateId": "14",
        "countryCode": "91",
        "stateName": "Himachal Pradesh",
        "stateCode": "13",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d0",
        "stateId": "15",
        "countryCode": "91",
        "stateName": "Jammu and Kashmir",
        "stateCode": "14",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d1",
        "stateId": "16",
        "countryCode": "91",
        "stateName": "Jharkhand",
        "stateCode": "35",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d2",
        "stateId": "17",
        "countryCode": "91",
        "stateName": "Karnataka",
        "stateCode": "15",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d3",
        "stateId": "18",
        "countryCode": "91",
        "stateName": "Kerala",
        "stateCode": "16",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d4",
        "stateId": "19",
        "countryCode": "91",
        "stateName": "Lakshadweep",
        "stateCode": "17",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d5",
        "stateId": "20",
        "countryCode": "91",
        "stateName": "Madhya Pradesh",
        "stateCode": "18",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d6",
        "stateId": "21",
        "countryCode": "91",
        "stateName": "Maharashtra",
        "stateCode": "19",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d7",
        "stateId": "22",
        "countryCode": "91",
        "stateName": "Manipur",
        "stateCode": "20",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d8",
        "stateId": "23",
        "countryCode": "91",
        "stateName": "Meghalaya",
        "stateCode": "21",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424d9",
        "stateId": "24",
        "countryCode": "91",
        "stateName": "Mizoram",
        "stateCode": "22",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424da",
        "stateId": "25",
        "countryCode": "91",
        "stateName": "Nagaland",
        "stateCode": "23",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424db",
        "stateId": "26",
        "countryCode": "91",
        "stateName": "Orissa",
        "stateCode": "24",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424dc",
        "stateId": "27",
        "countryCode": "91",
        "stateName": "Pondicherry",
        "stateCode": "25",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424dd",
        "stateId": "28",
        "countryCode": "91",
        "stateName": "Punjab",
        "stateCode": "26",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424de",
        "stateId": "29",
        "countryCode": "91",
        "stateName": "Rajasthan",
        "stateCode": "27",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424df",
        "stateId": "30",
        "countryCode": "91",
        "stateName": "Sikkim",
        "stateCode": "28",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e0",
        "stateId": "31",
        "countryCode": "91",
        "stateName": "Tamil Nadu",
        "stateCode": "29",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e1",
        "stateId": "32",
        "countryCode": "91",
        "stateName": "Telangana",
        "stateCode": "36",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e2",
        "stateId": "33",
        "countryCode": "91",
        "stateName": "Tripura",
        "stateCode": "30",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e3",
        "stateId": "34",
        "countryCode": "91",
        "stateName": "Uttar Pradesh",
        "stateCode": "31",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e4",
        "stateId": "35",
        "countryCode": "91",
        "stateName": "Uttarakhand",
        "stateCode": "34",
        "status": true
    }, {
        "id": "5b4599c9c15a76370a3424e5",
        "stateId": "36",
        "countryCode": "91",
        "stateName": "West Bengal",
        "stateCode": "32",
        "status": true
    }, {
        "id": "5dc24c9779332f0ddccb7aa4",
        "stateId": "37",
        "countryCode": "91",
        "stateName": "Ladakh",
        "stateCode": "37",
        "status": true
    }];


}
