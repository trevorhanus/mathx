import {expect} from 'chai';
import * as sinon from 'sinon';
import {Equation} from "../src/Equation";
import {ErrorType} from "../src/errors";
import {autorun} from "mobx";
import {Mathx} from '../src/Mathx';

describe('Equation', () => {

    let graph: any;
    before(() => {
        graph = {
            find: sinon.stub(),
            findById: sinon.stub(),
            hasCell: sinon.stub(),
            symbolExists: sinon.stub()
        };
    });

    afterEach(() => {
        graph.find.resetBehavior();
        graph.symbolExists.resetBehavior();
    });

    it('can instantiate', () => {
        const foo = new Equation(graph, {symbol: 'foo'});
        expect(foo.formula).to.equal('');
        expect(foo.value).to.be.NaN;
    });

    it('can set and get the formula to a constant', () => {
        const foo = new Equation(graph, {
            symbol: 'foo',
            formula: '10'
        });
        expect(foo.formula).to.equal('10');
        expect(foo.value).to.equal(10);
        foo.setFormula('20 + 30');
        expect(foo.formula).to.equal('20 + 30');
        expect(foo.value).to.equal(50);
    });

    it('can use = sign in front of formula', () => {
        const foo = new Equation(graph, {
            symbol: 'foo',
            formula: '   = 10'
        });
        expect(foo.formula).to.equal('10');
        expect(foo.value).to.equal(10);
    });

    it('invalid formula', () => {
        const foo = new Equation(graph, {
            symbol: 'foo',
            formula: '10'
        });
        foo.setFormula('= %');
        expect(foo.errors[0].type).to.equal(ErrorType.InvalidFormula)
    });

    it('returns invalid formula', () => {
        const foo = new Equation(graph, {
            symbol: 'foo',
            formula: '10'
        });
        foo.setFormula('%');
        expect(foo.formula).to.equal('%');
    });

    it('resets formula after supplying valid formula', () => {
        const foo = new Equation(graph, {
            symbol: 'foo',
            formula: '10'
        });
        foo.setFormula('  %   ');
        expect(foo.formula).to.equal('%');
        foo.setFormula('10');
        expect(foo.formula).to.equal('10');
        expect(foo.errors.length).to.equal(0);
    });

    it('evaluates', () => {
        graph.symbolExists.returns(false);
        const a = new Equation(graph, {
            symbol: 'a',
            formula: '10'
        });
        graph.findById.returns(a);
        const b = new Equation(graph, {
            symbol: 'b',
            formula: 'a + 10'
        });
        expect(b.value).to.equal(20);
    });

    it('updates when dependent value changes', () => {
        graph.symbolExists.returns(false);
        const a = new Equation(graph, {
            symbol: 'a',
            formula: '10'
        });
        graph.findById.returns(a);
        const b = new Equation(graph, {
            symbol: 'b',
            formula: 'a + 10'
        });
        let v: string;
        const viewSpy = sinon.spy(() => {
            v = `a:${a.value},b:${b.value}`;
        });
        autorun(viewSpy);

        expect(v).to.equal('a:10,b:20');
        a.setFormula('20');
        expect(v).to.equal('a:20,b:30');
    });

    it('Can add `b = a + 10` when `a` does not exist', () => {
        graph.findById.returns(null);
        const b = new Equation(graph, {
            symbol: 'b',
            formula: 'a + 10'
        });
        expect(b.value).to.be.NaN;
        expect(b.errors.length).to.equal(1);
    });

    it('Returns modified formula when a dependent cell changes symbol', () => {
         const mathx = new Mathx();
         const a = mathx.newEquation({
             symbol: 'a',
             formula: '10'
         });
         const b = mathx.newEquation({
             symbol: 'b',
             formula: 'a + 10'
         });
         expect(b.formula).to.equal('a + 10');
         a.updateSymbol('newA');
         expect(a.symbol).to.equal('newA');
         expect(b.formula).to.equal('newA + 10');
    });

    it('formula with functions', () => {
        const mathx = new Mathx();
        const a = mathx.newEquation({
            symbol: 'a',
            formula: '16'
        });
        const b = mathx.newEquation({
            symbol: 'b',
            formula: '= sqrt(a)'
        });
        expect(b.formula).to.equal('sqrt(a)');
        b.setFormula('sin(a)');
        expect(b.formula).to.equal('sin(a)');
    });
});
