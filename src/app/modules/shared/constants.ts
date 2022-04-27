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
    public static SELECTED_AGENT = environment.production ? 'SELECTED_AGENT' : 'SELECTED_AGENT';
    public static gstFyList = [
        { financialYear: '2021-22' },
        { financialYear: '2020-21' },
        { financialYear: '2019-20' },
        { financialYear: '2018-19' },
        // { financialYear: '2017-18' },
    ];
    public static subscriptionFyList = [
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

}
