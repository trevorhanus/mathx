import {ErrorType} from './ErrorType';

export interface IError {
   type: ErrorType;
   message: string;
   displayValue: string;
}
