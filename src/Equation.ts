import {observable, action, computed} from 'mobx';
import * as mathjs from 'mathjs';
import {symbolIdBiMap} from './utilities/SymbolIdBiMap';
import {ErrorType, InvalidFormulaError, MathxError, ReferenceNotFoundError, CircularReferenceError, ReferenceValueError} from './errors';
import {cleanFormula} from "./utilities/regex";
import {ICell, ICellProps, Cell} from './Cell';
import {Mathx} from './Mathx';

export interface IEquation extends ICell {
    setFormula: (formula: string) => void; // throws when formula is invalid
    formula: string;
    value: number;
}

export interface IEquationProps extends ICellProps {
    formula?: string;
}

export class Equation extends Cell implements IEquation {
    @observable.ref private _rootNode: ISymbolNode;
    @observable private _tempInvalidFormula: string;

    constructor(graph: Mathx, initialState: IEquationProps) {
        super(graph, initialState);
        this._rootNode = null;
        this._tempInvalidFormula = null;
        const formula = initialState.formula || '';
        this.setFormula(formula);
    }

    @computed
    get formula(): string {
        if (this._tempInvalidFormula !== null) {
            return this._tempInvalidFormula;
        }
        if (this._rootNode === null) {
            return '';
        }
        return this._rootNode.toString({
            handler: (node: ISymbolNode) => {
                if (node.isSymbolNode) {
                    const id = node.mathxId;
                    return symbolIdBiMap.getSymbol(id);
                    // const cell = this.graph.findById(id);
                    // return cell ? cell.symbol : node.name;
                } else {
                    return node.value;
                }
            }
        });
    }

    @action
    setFormula(formula: string): void {
        // start fresh
        this._tempInvalidFormula = null;
        this._clearErrors();

        if (formula === '') {
            this._rootNode = null;
            return;
        }

        const newFormula = cleanFormula(formula);

        // use the mathjs library to parse the formula and make sure it is valid
        const rootNode = this.createNodeTree(newFormula);
        if (rootNode === null) {
            this._tempInvalidFormula = newFormula;
            this._rootNode = null;
            return;
        }
        this._rootNode = rootNode;
        // update the dependencies
        this.updateDependencies(rootNode);
    }

    @action
    private createNodeTree(formula: string): ISymbolNode {
        let rootNode: mathjs.MathNode = null;
        try {
            rootNode = mathjs.parse(formula);
            return rootNode as ISymbolNode;
        } catch (e) {
            const err = new InvalidFormulaError(e.message);
            this.__addError(err);
            return rootNode as ISymbolNode;
        }
    }

    @action
    private updateDependencies(rootNode: mathjs.MathNode): void {
        // remove all previous dependencies
        this.clearDependencies();

        // find the referenced cell for each symbol node
        rootNode.filter(node => node.isSymbolNode).forEach((symbolNode: ISymbolNode) => {
            if (this.symbol === symbolNode.name) {
                const e = new CircularReferenceError(`[${this.symbol}]'s formula references itself.`);
                this.__addError(e);
                return;
            }

            // find the id for the given symbol
            const id = symbolIdBiMap.getId(symbolNode.name);
            // set the id on the node
            symbolNode.mathxId = id;
            symbolNode.name = id;
            // check to see if it is in the graph yet
            const provider = this.graph.findById(id) as IEquation;

            if (provider === null || provider === undefined) {
                // we couldn't find a cell with the given symbol
                // need to throw a reference error
                const e =  new ReferenceNotFoundError(`${this.symbol}'s formula references ${symbolNode.name} which does not exist.`);
                this.__addError(e);
                return;
            }

            symbolNode.cell = provider;
            // attempt to add dependency
            this.addDependency(provider);
        });
    }

    @computed
    get value(): number {
        if (this._rootNode === null) {
            return NaN;
        }

        try {
            return this._rootNode.eval(this.scope as any);
        } catch (e) {
            // console.log(e);
            return NaN;
        }
    }

    // TODO: implement numeraljs for the display value. should be able to set a mask
    // and then pass the value through the mask
    @computed
    get displayValue(): string {
        if (!this.valid) {
            return this.errors[0].displayValue;
        }
        return this.value.toString();
    }

    @computed
    private get scope(): IScope {
        this._clearErrors([ErrorType.ReferenceNotFound, ErrorType.ReferenceValueError]);
        const scope: IScope = {};
        this.symbolNodes.forEach((node: ISymbolNode) => {
            if (!node.mathxId) {
                throw new MathxError('An unknown error occurred');
            }

            // see if we can find the cell
            const cell = this.graph.findById(node.mathxId) as IEquation;

            if (cell === null) {
                const symbol = symbolIdBiMap.getSymbol(node.mathxId);
                this.__addError(new ReferenceNotFoundError(`no cell with symbol ${symbol}`));
                return;
            }

            if (isNaN(cell.value)) {
                this.__addError(new ReferenceValueError(`${cell.symbol}'s value is invalid.`));
                return;
            }

            scope[node.name] = cell.value;
        });
        return scope;
    }

    @computed
    private get symbolNodes(): ISymbolNode[] {
        if (this._rootNode === null) return [];

        return this._rootNode.filter((node: mathjs.MathNode) => {
            return node.isSymbolNode;
        }) as ISymbolNode[];
    }

    @action
    private _clearErrors(types?: ErrorType[]): void {
        if (types) {
            types.forEach(type => this.__clearError(type));
        } else {
            // clear all
            this.__clearAllErrors();
        }
    }
}

export interface ISymbolNode extends mathjs.MathNode {
    name: string;
    mathxId: string;
    cell?: IEquation;
    toString: (options: any) => string;
}

interface IScope {
    [symbol: string]: number;
}
