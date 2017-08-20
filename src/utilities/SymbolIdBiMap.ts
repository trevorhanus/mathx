import {genId} from './genId'

export class SymbolIdBiMap {
    private _symbolToIdMap: Map<string>;
    private _idToSymbolMap: Map<string>;

    constructor() {
        this._symbolToIdMap = new Map<string>();
        this._idToSymbolMap = new Map<string>();
    }

    public getId(symbol: string): string {
        const hash = this._symbolToIdMap.get(symbol);
        if (hash !== null) {
            return hash;
        } else {
            const newHash = genId();
            this.set(symbol, newHash);
            return newHash;
        }
    }

    public getSymbol(id: string): string {
        // just return null if we can't find a key
        return this._idToSymbolMap.get(id);
    }

    public swapSymbols(oldSymbol: string, newSymbol: string): void {
        const id = this._symbolToIdMap.get(oldSymbol);
        if (!id) throw new Error(`attempted to swap keys oldKey: '${oldSymbol}' with newKey: '${newSymbol}', but could not find hash for '${oldSymbol}'`);
        this.remove(oldSymbol, id);
        this.set(newSymbol, id);
    }

    public set(symbol: string, id: string): void {
        this._symbolToIdMap.set(symbol, id);
        this._idToSymbolMap.set(id, symbol);
    }

    private remove(symbol: string, id: string): void {
        this._symbolToIdMap.delete(symbol);
        this._idToSymbolMap.delete(id);
    }
}

class Map<T> {
    private _map: { [key: string]: T };

    constructor() {
        this._map = {};
    }

    public get(key: string): T {
        const value = this._map[key];
        if (value) {
            return value;
        } else {
            return null;
        }
    }

    public set(key: string, value: T): void {
        this._map[key] = value;
    }

    public delete(key: string): void {
        delete this._map[key];
    }
}

const symbolIdBiMap = new SymbolIdBiMap();

export {
    symbolIdBiMap
}
