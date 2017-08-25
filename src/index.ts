import {autorun} from 'mobx';
import {Mathx} from './Mathx';
import {ICell, ICellProps} from './Cell';
import {IEquation, IEquationProps} from './Equation';

export {
    Mathx,
    autorun,
    ICell, ICellProps,
    IEquation, IEquationProps
}

// TODO: Weird hack to get ts-loader to load files other than ts files
// How can I get rid of this?
declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};