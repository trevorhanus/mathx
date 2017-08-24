import {ICell, ICellProps} from './Cell';
import {Equation, IEquationProps} from './Equation';
import {symbolIdBiMap} from './utilities/SymbolIdBiMap';
import {observable, ObservableMap, computed, action} from "mobx";

export interface IMathx {
    cells: ICell[];
    find: (symbolOrId: string) => ICell;
    findById: (id: string) => ICell;
    idExists: (id: string) => boolean;
    getCellsContaining: (substring: string) => ICell[];
    newEquation: (props: IEquationProps) => Equation;
    removeCell: (symbol: string) => ICell;
    removeCellById: (id: string) => ICell;
    symbolExists: (symbol: string) => boolean;
}

export interface ICalculationProps {
    cells: ICellProps[];
}

export class Mathx implements IMathx {
    @observable private _cells: ObservableMap<ICell>;

    constructor() {
        this._cells = observable.map<ICell>();
    }

    @computed
    get cells(): ICell[] {
        return this._cells.values();
    }

    find(symbol: string): ICell {
        const id = symbolIdBiMap.getId(symbol);
        return this.findById(id);
    }

    findById(id: string): ICell {
        return this._cells.get(id) || null;
    }

    idExists(id: string): boolean {
        return this._cells.has(id);
    }

    getCellsContaining(substring: string): ICell[] {
        return this.cells.filter(cell => {
            return cell.symbol.indexOf(substring) > -1;
        });
    }

    @action
    newCell(props: ICellProps): ICell {
        switch (props.type) {

            case 'Equation':
                return this.newEquation(props);

            default:
                return null;
        }
    }

    @action
    newEquation(props: IEquationProps): Equation {
        const e = new Equation(this, props);
        this._cells.set(e.id, e);
        return e;
    }

    @action
    removeCell(symbol: string): ICell {
        if (!this.symbolExists(symbol)) {
            return null;
        }
        const id = symbolIdBiMap.getId(symbol);
        return this.removeCellById(id);
    }

    @action
    removeCellById(id: string): ICell {
        if (!this.idExists(id)) {
            return null;
        }

        const cell = this.findById(id);

        // remove reference to this node in all dependent nodes
        cell.dependents.forEach(node => {
            node.removeProvider(cell);
        });

        // delete node from graph
        this._cells.delete(id);
        return cell;
    }

    symbolExists(symbol: string): boolean {
        const id = symbolIdBiMap.getId(symbol);
        return this._cells.has(id);
    }

    // Static

    static newCalculation(): Mathx {
        return new Mathx();
    }

    static fromJSON(props: ICalculationProps): Mathx {
        const c = new Mathx();
        props.cells.forEach(cellProps => {
            c.newCell(cellProps);
        });
        return c;
    }
}
