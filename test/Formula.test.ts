import {expect} from 'chai';
import * as sinon from 'sinon';
import {Equation} from "../src/Equation";
import {ErrorType} from "../src/IError";
import {autorun} from "mobx";

describe('Equation', () => {

    let graph: any;
    before(() => {
        graph = {
            find: sinon.stub(),
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
        graph.find.returns(a);
        graph.hasCell.returns(true);
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
        graph.find.returns(a);
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
        graph.find.returns(null);
        const b = new Equation(graph, {
            symbol: 'b',
            formula: 'a + 10'
        });
        expect(b.value).to.be.NaN;
        expect(b.errors.length).to.equal(1);
    });
});
