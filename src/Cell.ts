import {INode} from './superclasses/Node';
import {IErrorContainer} from "./superclasses/ErrorContainer";
import {ISymbol} from "./Symbol";
import {IEquation, Equation, IEquationProps} from "./Equation";
import {ILockable} from "./superclasses/Lockable";

export class Cell extends Equation {}

namespace Cell {

   export interface Cell extends
      IErrorContainer,
      ILockable,
      INode,
      ISymbol,
      IEquation {}

}

export interface CellState extends IEquationProps {}
