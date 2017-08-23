import {expect} from 'chai';
import * as sinon from 'sinon';
import {autorun, spy} from 'mobx';
import {Mathx} from '../../src';
import {symbolIdBiMap} from "../../src/utilities/SymbolIdBiMap";

describe('Update Symbol', () => {
    it('can update a symbol when other cells depend on it', () => {
        const remath = new Mathx();
        const a = remath.newEquation({
            symbol: 'a',
            formula: '= 10'
        });
        const b = remath.newEquation({
            symbol: 'b',
            formula: '= a + 10'
        });
        const renderSpy = sinon.spy(() => {
            b.value;
        });
        autorun(renderSpy);
        // change a's symbol
        expect(b.formula).to.equal('a + 10');
        a.updateSymbol('a2');
        expect(b.value).to.equal(20);
        expect(b.formula).to.equal('a2 + 10');
    });
});
