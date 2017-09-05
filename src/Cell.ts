import {ISymbolProps, ISymbol, Symbol} from "./Symbol";
import {Calculation} from './Mathx';
import {observable, computed, action} from 'mobx';

export interface ICell extends ISymbol {
    displayValue: string;
    formula?: string;
    remove: () => ICell;
    setFormula?: (formula: string) => void;
    value: number | string;
}

export interface ICellProps extends ISymbolProps {
    type?: 'Equation';
    formula?: string;
    value?: number | string;
    displayFormat?: string;
}

export class Cell extends Symbol implements ICell {
    @observable private _value: number | string;

    constructor(graph: Calculation, props: ICellProps) {
        super(graph, props);
        this._value = props.value || null;
    }

    @computed
    get displayValue(): string {
        return this._value.toString();
    }

    @action
    remove(): ICell {
        return this.graph.removeCellById(this.id);
    }

    @action
    setValue(val: string | number): void {
        this._value = val;
    }

    @computed
    get value(): number | string {
        return this._value;
    }

    
}
