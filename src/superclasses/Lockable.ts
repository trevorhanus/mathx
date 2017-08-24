import {observable, computed, action} from "mobx";
import {ErrorContainer, IErrorContainer} from '../errors/ErrorContainer';

export interface ILockable extends IErrorContainer {
   lock: () => void;
   unlock: () => void;
   toggleLocked: () => void;
   locked: boolean;
}

export interface ILockableProps {
   locked?: boolean;
}

export class Lockable extends ErrorContainer implements ILockable {
   @observable _locked: boolean;

   constructor(initialState?: ILockableProps) {
      super();
      this._locked = initialState && initialState.locked || false;
   }

   @computed
   get locked(): boolean {
      return this._locked;
   }

   @action
   unlock(): void {
      this._locked = false;
   }

   @action
   lock(): void {
      this._locked = true;
   }

   @action
   toggleLocked(): void {
      this._locked = !this._locked;
   }
}