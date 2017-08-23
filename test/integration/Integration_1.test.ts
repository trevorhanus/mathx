import {expect} from 'chai';
import {observable, ObservableMap, autorun, runInAction} from 'mobx';
import {Mathx, Cell} from '../../src';
import * as sinon from 'sinon';

function renderCells(remath: Mathx, view: any): any {
    remath.cells.forEach(cell => {
        view.set(cell.symbol, renderCell(cell));
    });
}

function renderCell(cell: Cell): string {
    return `sym:${cell.symbol},formula:${cell.formula},val:${cell.value},disp:${cell.displayValue}`;
}

describe('Sessions', () => {

    it('mobx reacts when a previously not set key is set', () => {
        const map: ObservableMap<string> = observable.map<string>();
        map.set('b', 'value b');

        let view;
        const renderA = sinon.spy(() => {
            view = map.get('a');
        });
        autorun(renderA);
        expect(view).to.be.undefined;
        expect(renderA.callCount).to.equal(1);

        map.set('c', 'value c');
        expect(renderA.callCount).to.equal(1);

        map.set('a', 'value a');
        expect(view).to.equal('value a');
        expect(renderA.callCount).to.equal(2);
    });

    it('reacts to changing values', () => {
        const remath = new Mathx();
        let view: ObservableMap<string> = observable.map<string>();
        autorun(() => {
            renderCells(remath, view);
        });

        // add a
        runInAction(() => {
            const a = remath.newEquation({
                symbol: 'a',
                formula: '= 10'
            });
        });
        expect(view.get('a')).to.equal('sym:a,formula:10,val:10,disp:10');

        // add b
        runInAction(() => {
            const b = remath.newEquation({
                symbol: 'b',
                formula: '= a + 10'
            });
        });
        expect(view.get('a')).to.equal('sym:a,formula:10,val:10,disp:10');
        expect(view.get('b')).to.equal('sym:b,formula:a + 10,val:20,disp:20');

        // change a
        runInAction(() => {
            remath.find('a').setFormula('= 20');
        });
        expect(view.get('a')).to.equal('sym:a,formula:20,val:20,disp:20');
        expect(view.get('b')).to.equal('sym:b,formula:a + 10,val:30,disp:30');
    });

    it('adding variable whose formula references a non-existent symbol', () => {
        const mathx = new Mathx();
        let view: string = '';
        const render = sinon.spy(() => {
            view = '';
            mathx.cells.forEach(cell => {
                if (view.length > 0) view += ';';
                view += `sym:${cell.symbol},val:${cell.value}`
            });
        });
        autorun(render);

        // add a
        const a = mathx.newEquation({
            symbol: 'a',
            formula: '= b + 10'
        });
        expect(render.callCount).to.equal(2);
        expect(view).to.equal('sym:a,val:NaN');

        // add b = 30
        runInAction(() => {
            const b = mathx.newEquation({
                symbol: 'b',
                formula: '=30'
            });
        });
        expect(view).to.equal('sym:a,val:40;sym:b,val:30');
        // expect(view.get('a')).to.equal('sym:a,formula:b + 10,val:40,disp:40');
    });
});
