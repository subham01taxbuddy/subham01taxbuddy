import { environment } from "environments/environment";

export class AppConstants {
    public static emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    public static panNumberRegex = /^[A-Z]{3}[P,H,C,F,A,B,L,J,G]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panDoneeRegex = /^[A-Z]{3}[P,H,C,F,A,B,L,J,G,T]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panIndividualRegex = /^[A-Z]{3}[P]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static panIndHUFRegex = /^[A-Z]{3}[P,H]{1}[A-Z]{1}\d{4}[A-Z]{1}$/;
    public static tanNumberRegex = /^[A-Z]{4}\d{5}[A-Z]{1}$/;
    public static mobileNumberRegex = /^[1-9]{1}[0-9]{9}$/;  // regex given by dinesh  //"[0-9]{10}"
    public static charRegex = '[a-zA-Z ]*';
    public static IFSCRegex = /^[A-Za-z]{4}[0][A-Za-z0-9]{6}$/;
    // public static gstrReg = '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}';
    public static GSTNRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

    public static numericRegex = '[0-9]*';
    public static amountWithoutDecimal = /^[0-9]*$/;
    public static amountWithDecimal = /^\s*-?\d+(\.\d{1,2})?\s*$/;
    public static indianCurrencySymbol = '₹ ';
    public static PINCode = '[1-9]{1}[0-9]{5}';
    public static ayYear = '2020-2021';
    public static fyYear = '2019-2020';

    public static USER_OBJ = environment.production ? 'USER_OBJ' : 'USER_OBJ';
    public static TOKEN = environment.production ? 'TOKEN' : 'TOKEN';
    public static IS_USER_LOGGED_IN = environment.production ? 'IS_USER_LOGGED_IN' : 'IS_USER_LOGGED_IN';
    public static ITR_JSON = environment.production ? 'ITR_JSON' : 'ITR_JSON';
    public static TAX_SUM = environment.production ? 'TAX_SUM' : 'TAX_SUM';
    public static NAME = environment.production ? 'name' : 'name';
    public static ITR_DOCS = environment.production ? 'ITR_DOCS' : 'ITR_DOCS';
}
