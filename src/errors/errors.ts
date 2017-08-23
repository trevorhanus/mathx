import {IError} from "./IError";
import {ErrorType} from "./ErrorType";

export class MathxError extends Error implements IError {
    type: ErrorType = ErrorType.Generic;
    displayValue: string = '#ERR!';

    constructor(message: string) {
        super(`[mathx] ${message}`);
    }
}

export class InvalidFormulaError extends MathxError {
    type: ErrorType = ErrorType.InvalidFormula;
    displayValue: string = '#FORM!';

    constructor(message: string) {
        super(message);
    }
}

export class CircularReferenceError extends MathxError {
    type: ErrorType = ErrorType.CircularReference;
    displayValue: string = '#CIR!';

    constructor(message: string) {
        super(message);
    }
}

export class ReferenceNotFoundError extends MathxError {
    type: ErrorType = ErrorType.ReferenceNotFound;
    displayValue: string = '#REF?';

    constructor(message: string) {
        super(message);
    }
}

export class ReferenceValueError extends MathxError {
    type: ErrorType = ErrorType.ReferenceValueError;
    displayValue: string = '#REF!';

    constructor(message: string) {
        super(message);
    }
}