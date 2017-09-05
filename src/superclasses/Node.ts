import {observable, computed, action, ObservableMap} from 'mobx';
import {genId} from '../utilities/genId';
import {Calculation} from '../Mathx';
import {CircularReferenceError} from '../errors';
import {Lockable, ILockableProps, ILockable} from "./Lockable";
import {symbolIdBiMap} from "../utilities/SymbolIdBiMap";

export interface INode extends ILockable {
    readonly id: string;
    readonly graph: Calculation;
    providers: INode[];
    dependents: INode[];
    dependsOn: (node: INode) => boolean;
    providesFor: (node: INode) => boolean;
    addDependency: (node: INode) => void;
    addDependent: (node: INode) => void;
    addProvider: (node: INode) => void;
    removeDependency: (node: INode) => void;
    clearDependencies: () => void;
    removeProvider: (node: INode) => void;
    removeDependent: (node: INode) => void;
}

export interface INodeProps extends ILockableProps {
    id?: string;
}

export class Node extends Lockable implements INode {
    private _id: string;
    private _graph: Calculation;
    @observable private _providers: ObservableMap<INode>;
    @observable private _dependents: ObservableMap<INode>;

    constructor(graph: Calculation, initialState?: INodeProps) {
        super(initialState);
        this._graph = graph;
        this._id = (initialState && initialState.id) || genId();
        this._providers = observable.map<INode>();
        this._dependents = observable.map<INode>();
    }

    get graph(): Calculation {
        return this._graph;
    }

    get id(): string {
        return this._id;
    }

    protected _setId(id: string): void {
        this._id = id;
    }

    @computed
    get providers(): INode[] {
        return this._providers.values().reduce((list: INode[], node: INode) => {
            return list.concat(node, node.providers);
        }, []);
    }

    @computed
    get dependents(): INode[] {
        return this._dependents.values().reduce((list: INode[], node: INode) => {
            return list.concat(node, node.dependents);
        }, []);
    }

    @action
    addDependency(provider: INode): void {
        this.addProvider(provider);
        provider.addDependent(this);
    }

    @action
    removeDependency(provider: INode): void {
        this.removeProvider(provider);
        provider.removeDependent(this)
    }

    @action
    clearDependencies(): void {
        this.providers.forEach(provider => {
            this.removeDependency(provider);
        });
    }

    @action
    addProvider(provider: INode): void {
        if (this.providesFor(provider)) {
            const symbol = symbolIdBiMap.getSymbol(this.id);
            const providerSymbol = symbolIdBiMap.getSymbol(provider.id);
            const err = new CircularReferenceError(`${symbol}'s formula references ${providerSymbol}, but ${providerSymbol} depends on ${symbol}`);
            this.__addError(err);
            return;
        }
        this._providers.set(provider.id, provider);
    }

    @action
    removeProvider(provider: INode): void {
        this._providers.delete(provider.id);
    }

    @action
    addDependent(dependent: INode): void {
        if (this.dependsOn(dependent)) {
            const symbol = symbolIdBiMap.getSymbol(this.id);
            const dependentSymbol = symbolIdBiMap.getSymbol(dependent.id);
            const err = new CircularReferenceError(`${dependentSymbol}'s formula references ${symbol}, but ${symbol} depends on ${dependentSymbol}`);
            this.__addError(err);
            return;
        }
        this._dependents.set(dependent.id, dependent);
    }

    @action
    removeDependent(dependent: INode): void {
        this._dependents.delete(dependent.id);
    }

    providesFor(node: INode): boolean {
        return this.dependents.indexOf(node) > -1;
    }

    dependsOn(node: INode): boolean {
        return this.providers.indexOf(node) > -1;
    }
}
