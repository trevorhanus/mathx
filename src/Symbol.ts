import {ErrorType, IError} from './errors';
import {isNullOrUndefined} from "util";
import {isValidSymbol} from "./utilities/regex";
import {Calculation} from './Mathx';
import {Node, INodeProps, INode} from './superclasses/Node';
import {observable, computed, action} from "mobx";
import {symbolIdBiMap} from './utilities/SymbolIdBiMap';

export interface ISymbol extends INode {
    symbol: string;
    updateSymbol: (symbol: string) => void; // throws when symbol is invalid
}

export interface ISymbolProps extends INodeProps {
    symbol: string;
}

export class Symbol extends Node implements ISymbol {
    @observable private _symbol: string;
    @observable private _tempInvalidSymbol: string;

    constructor(graph: Calculation, initialState: ISymbolProps) {
        super(graph, initialState);
        this._symbol = null;
        if (!initialState || isNullOrUndefined(initialState.symbol)) throw Error('must provide a symbol when creating a cell');
        this.updateSymbol(initialState.symbol);
        this._tempInvalidSymbol = null;
    }

    @computed
    get symbol(): string {
        return this._tempInvalidSymbol === null ? this._symbol : this._tempInvalidSymbol;
    }

    @action
    updateSymbol(symbol: string): void {
        // start fresh
        this._tempInvalidSymbol = null;
        this.__clearError(ErrorType.InvalidSymbol);

        symbol = symbol.trim();

        // make sure symbol is valid
        if (!isValidSymbol(symbol)) {
            this._tempInvalidSymbol = symbol;
            this.throwInvalidSymbolError(`[${symbol}] is an invalid symbol. Symbols must start with a letter and may only contain word characters`);
            return;
        }

        // make sure symbol does not already exist
        if (this.graph.symbolExists(symbol)) {
            this._tempInvalidSymbol = symbol;
            this.throwInvalidSymbolError(`${symbol} already exists. Can not have two variables with the same symbol.`);
            return;
        }

        // finally, set new symbol
        if (this._symbol === null) {
            // we are constructing the Symbol
            // get the id from the biMap
            const id = symbolIdBiMap.getId(symbol);
            this._setId(id);
            symbolIdBiMap.set(symbol, id);
        } else {
            symbolIdBiMap.swapSymbols(this._symbol, symbol);
        }

        this._symbol = symbol;
    }

    @action
    private throwInvalidSymbolError(message: string): void {
        const error: IError = {
            type: ErrorType.InvalidSymbol,
            message: message,
            displayValue: '#SYM!'
        };
        this.__addError(error);
    }
}