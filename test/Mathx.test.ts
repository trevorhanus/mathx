import {expect} from 'chai';
import {ICalculationProps, Mathx} from '../src/Mathx';
import {autorun} from 'mobx';

describe('Mathx', () => {

    it('can instantiate', () => {
        const rm = new Mathx();
        expect(rm.cells.length).to.equal(0);
    });

    it('can add a cell', () => {
        const rm = new Mathx();
        rm.newEquation({symbol: 'a'});
        expect(rm.cells.length).to.equal(1);
    });

    it('can add multiple cells', () => {
        const rm = new Mathx();
        rm.newEquation({symbol: 'a'});
        rm.newEquation({symbol: 'b'});
        rm.newEquation({symbol: 'c'});
        expect(rm.cells.length).to.equal(3);
    });

    it('can find cells', () => {
        const rm = new Mathx();
        const a = rm.newEquation({symbol: 'a'});
        expect(rm.find('a')).to.equal(a);
        expect(rm.findById(a.id)).to.equal(a);
    });

    it('catches a simple circular reference', () => {
        const graph = new Mathx();
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        a.setFormula('= a');
        expect(a.errors.length).to.equal(1);
    });

    it('catches a complicated circular reference', () => {
        const graph = new Mathx();
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        const b = graph.newEquation({
            symbol: 'b',
            formula: '= a + 10'
        });
        const c = graph.newEquation({
            symbol: 'c',
            formula: '= b'
        });
        const d = graph.newEquation({
            symbol: 'd',
            formula: '= c'
        });
        a.setFormula('= d');
        expect(a.errors.length).to.equal(1);
    });

    it('re-renders `b = a + 10` when `a` is added to sheet', () => {
        const graph = new Mathx();
        // add b which depends on a, but a does not exist
        const b = graph.newEquation({
            symbol: 'derp',
            formula: '= a + 10'
        });

        let view: string;
        autorun(() => {
            view = `b:${b.value}`;
        });
        expect(view).to.equal('b:NaN');

        // add a
        const a = graph.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        expect(view).to.equal('b:20');
    });

    it('can populate from json', () => {
        const json: ICalculationProps = {
            cells: [
                {
                    type: 'Equation',
                    symbol: 'b',
                    formula: 'a + 10'
                },
                {
                    type: 'Equation',
                    symbol: 'a',
                    formula: '10'
                }
            ]
        };
        const calc = Mathx.fromJSON(json);
        expect(calc.cells.length).to.equal(2);
        const a = calc.find('a');
        const b = calc.find('b');
        expect(a.value).to.equal(10);
        expect(b.value).to.equal(20);
    });
});
