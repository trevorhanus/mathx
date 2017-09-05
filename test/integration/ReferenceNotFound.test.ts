import {expect} from 'chai';
import {autorun, runInAction} from 'mobx';
import * as sinon from 'sinon';
import {Calculation} from "../../src/Mathx";

describe('Reference Not Found', () => {

    it('simple reference does not exist', () => {
        const graph = new Calculation();
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        a.setFormula('= b + 10');
        expect(a.errors.length).to.equal(1);
        expect(a.value).to.be.NaN;
    });

    it('reference is removed', () => {
        const graph = new Calculation();
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        const b = graph.newEquation({
            symbol: 'b',
            formula: '= a + 10'
        });
        expect(b.value).to.equal(20);
        expect(b.errors.length).to.equal(0);
        // remove a from sheet
        runInAction(() => {
            graph.removeCell('a');
        });

        expect(b.value).to.be.NaN;
    });

    it('rerenders when reference is removed', () => {
        const graph = new Calculation();
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        const b = graph.newEquation({
            symbol: 'b',
            formula: '= a + 10'
        });
        const renderSpy = sinon.spy(() => {
            b.value
        });
        autorun(renderSpy);
        graph.removeCell('a');
        const expectedCallCount = 2;
        // 1) when autorun is executed for the first time
        // 2) when value changes to NaN because `b` can't find the value of `a`
        expect(renderSpy.callCount).to.equal(expectedCallCount);
    });
});
