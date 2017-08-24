import {Cell} from './Cell';
import {Equation, IEquationProps} from './Equation';
import {symbolIdBiMap} from './utilities/SymbolIdBiMap';
import {observable, ObservableMap, computed, action} from "mobx";

export interface IMathx {
    cells: Cell[];
    find: (symbolOrId: string) => Cell;
    findById: (id: string) => Cell;
    idExists: (id: string) => boolean;
    getCellsContaining: (substring: string) => Cell[];
    newEquation: (props: IEquationProps) => Equation;
    removeCell: (symbol: string) => Cell;
    removeCellById: (id: string) => Cell;
    symbolExists: (symbol: string) => boolean;
}

export class Mathx implements IMathx {
    @observable private _cells: ObservableMap<Cell>;

    constructor() {
        this._cells = observable.map<Cell>();
    }

    @computed
    get cells(): Cell[] {
        return this._cells.values();
    }

    find(symbol: string): Cell {
        const id = symbolIdBiMap.getId(symbol);
        return this.findById(id);
    }

    findById(id: string): Cell {
        return this._cells.get(id) || null;
    }

    idExists(id: string): boolean {
        return this._cells.has(id);
    }

    getCellsContaining(substring: string): Cell[] {
        return this.cells.filter(cell => {
            return cell.symbol.indexOf(substring) > -1;
        });
    }

    @action
    newEquation(props: IEquationProps): Equation {
        // const e = Equation.build(props);
        const newCell = new Cell(this, props);
        this._cells.set(newCell.id, newCell);
        return newCell;
    }

    @action
    removeCell(symbol: string): Cell {
        if (!this.symbolExists(symbol)) {
            return null;
        }
        const id = symbolIdBiMap.getId(symbol);
        return this.removeCellById(id);
    }

    @action
    removeCellById(id: string): Cell {
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
}
