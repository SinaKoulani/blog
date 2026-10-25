import { AxiosError, isAxiosError } from "axios";


/**
 * this file wraps any error thrown during an API call into one consistent shape.
 * 
 * pages and service never inspect raw axios errors. they read "statusCode" 
 * and "displayMessage" from this class instead
 * 
 * @example
 * const err = new appHttpErr(caughtError);
 * setError(err.displayMEssage);
 */

export class appHttpErr extends Error {
    /**the original thrown value ,kept for debugging and status extraction */
    private readonly _originalError : unknown;

    /**
     * 
     * @param error anything catch in a 'catch' block (always 'unknown' in ts)
     */
    constructor(error : unknown) {
        super(error instanceof Error ? error.message : "unknown error, we coocked");
        this._originalError= error;

    }

    /**true when the original error came from axios */
    get isAxiosError(): boolean {
        return isAxiosError(this._originalError);

    }

    /**
     * a real HTTP status (400, 401, 404, ...) when the server responsed
     * 0 when no response arrived (server down, network lost, CORS)
     * -1 when the error did not come from axios at all (a bug in our code)
     */
    get statusCode(): number{
        if (this.isAxiosError){
            return (this._originalError as AxiosError).response?.status ?? 0;
        }
        return -1;
    }

    /**and we show message for the current statusCode */
    get displayMessage(): string{
        switch(this.statusCode){
        case 0:
            return "we lost our conection with server check your conection";
        case 400:
            return "Invalid request";
        case 401:
            return "Invalid credentials or session expired.";
        case 403:
            return "You do not have permission to do this.";
        case 404:
            return "Not found.";
        case 409:
            return "This item already exists.";
        case 500:
            return "Server error. Please try again later.";
        case 502:
            return "Network error between services.";
        default:
            return "we coocked up, unknown err";
        }
    }

    /**
     * and finally sends the user to /<statusCode>?source=<current url>
     * client-only it uses window , so never call it in a server component
     * use it for data pages (e.g. a missing post), not for form errors.
     */
    redirect(){
        const source = encodeURIComponent(window.location.href);
        window.location.href = `/${this.statusCode}?source=${source}`;
    }
}

