import {Cell, CellState} from './Cell';
import {Equation, IEquationProps} from './Equation';
import {matchesIdFormat} from './utilities/regex';
import {symbolIdBiMap} from './utilities/SymbolIdBiMap';
import {observable, ObservableMap, computed, action} from "mobx";

export interface IMathx {
    cells: Cell[];
    newEquation: (props: IEquationProps) => Equation;
    find: (symbolOrId: string) => Cell;
    findById: (Id: string) => Cell;
    symbolExists: (symbol: string) => boolean;
    removeCell: (symbolOrId: string) => Cell;
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

    // find(symbolOrId: string): Cell {
    //     let cell: Cell;
    //     const probablyAnId = matchesIdFormat(symbolOrId);
    //     if (probablyAnId) {
    //         cell = this._cells.get(symbolOrId);
    //     }
    //     if (cell === undefined) { // maybe it is a symbol
    //         const hash = symbolIdBiMap.getId(symbolOrId);
    //         cell = this._cells.get(hash) || null;
    //     }
    //     return cell;
    // }

    find(symbol: string): Cell {
        const id = symbolIdBiMap.getId(symbol);
        return this.findById(id);
    }

    findById(id: string): Cell {
        return this._cells.get(id) || null;
    }

    symbolExists(symbol: string): boolean {
        return this._cells.values().some(cell => {
            return cell.symbol === symbol;
        });
    }

    hasCell(id: string): boolean {
        return this._cells.has(id);
    }

    @action
    newEquation(props: IEquationProps): Equation {
        // const e = Equation.build(props);
        const newCell = new Cell(this, props);
        this._cells.set(newCell.id, newCell);
        return newCell;
    }

    @action
    removeCell(symbolOrId: string): Cell {
        const cell = this.find(symbolOrId);
        if (!cell) return;

        // remove reference to this node in all dependent nodes
        cell.dependents.forEach(node => {
            node.removeProvider(cell);
        });

        // delete node from graph
        this._cells.delete(cell.id);
        return cell;
    }
}
