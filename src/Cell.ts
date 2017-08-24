import {ISymbolProps, ISymbol, Symbol} from "./Symbol";
import {Mathx} from './Mathx';
import {observable, computed, action} from 'mobx';

export interface ICell extends ISymbol {
    value: number | string;
    displayValue: string;
    setFormula?: (formula: string) => void;
}

export interface ICellProps extends ISymbolProps {
    type: 'Equation';
    formula?: string;
    value?: number | string;
    displayFormat?: string;
}

export class Cell extends Symbol implements ICell {
    @observable private _value: number | string;

    constructor(graph: Mathx, props: ICellProps) {
        super(graph, props);
        this._value = props.value || null;
    }

    @action
    setValue(val: string | number): void {
        this._value = val;
    }

    @computed
    get value(): number | string {
        return this._value;
    }

    @computed
    get displayValue(): string {
        return this._value.toString();
    }
}
