import {expect} from 'chai';
import {Node} from '../../src/superclasses/Node';
import {Mathx} from '../../src/Mathx';

describe('Node', () => {

    it('instantiates with no id', () => {
        const node = new Node({} as Mathx, {});
        expect(node.id).to.match(/id\w{32}/);
        expect(node.providers.length).to.equal(0);
        expect(node.dependents.length).to.equal(0);
    });

    it('instantiates with id', () => {
        const node = new Node({} as Mathx, {id: '1'});
        expect(node.id).to.equal('1');
        expect(node.providers.length).to.equal(0);
        expect(node.dependents.length).to.equal(0);
    });

    it('can add a provider', () => {
        const node1 = new Node({} as Mathx, {});
        const node2 = new Node({} as Mathx, {});
        node1.addProvider(node2);
        expect(node1.providers).to.deep.equal([node2]);
    });

    it('can add a dependent', () => {
        const node1 = new Node({} as Mathx, {});
        const node2 = new Node({} as Mathx, {});
        node1.addDependent(node2);
        expect(node1.dependents).to.deep.equal([node2]);
    });

    it('recursively find dependents', () => {
        const node1 = new Node({} as Mathx, {});
        const node2 = new Node({} as Mathx, {});
        const node3 = new Node({} as Mathx, {});
        node1.addDependent(node2);
        node2.addDependent(node3);
        expect(node1.dependents).to.deep.equal([node2, node3]);
    });

    it('recursively find providers', () => {
        const node1 = new Node({} as Mathx, {});
        const node2 = new Node({} as Mathx, {});
        const node3 = new Node({} as Mathx, {});
        node1.addProvider(node2);
        node2.addProvider(node3);
        expect(node1.providers).to.deep.equal([node2, node3]);
    });

    it('can add dependency', () => {
        const a = new Node({} as Mathx);
        const b = new Node({} as Mathx);
        b.addDependency(a);
        expect(b.dependsOn(a)).to.equal(true);
        expect(a.providesFor(b)).to.equal(true);
    });

    it('deep dependency', () => {
        const a = new Node({} as Mathx);
        const b = new Node({} as Mathx);
        const c = new Node({} as Mathx);
        b.addDependency(a);
        c.addDependency(b);
        expect(b.dependsOn(a)).to.equal(true);
        expect(a.providesFor(b)).to.equal(true);
        expect(c.dependsOn(a)).to.equal(true);
    });

    it('recursively find provides for', () => {
        const node1 = new Node({} as Mathx, {});
        const node2 = new Node({} as Mathx, {});
        const node3 = new Node({} as Mathx, {});
        node3.addDependency(node2);
        node2.addDependency(node1);
        expect(node1.providesFor(node3)).to.equal(true);
        expect(node2.providesFor(node3)).to.equal(true);
        expect(node3.dependsOn(node1)).to.equal(true);
    });

    it('circular reference', () => {
        const a = new Node({} as Mathx);
        const b = new Node({} as Mathx);
        const c = new Node({} as Mathx);
        b.addDependency(a);
        c.addDependency(b);
        expect(() => {
            a.addDependency(c);
        }).to.throw();
    });

    it('can remove a dependency', () => {
        const node2 = new Node({} as Mathx, {});
        const node3 = new Node({} as Mathx, {});
        node3.addDependency(node2);
        expect(node3.dependsOn(node2)).to.equal(true);
        expect(node2.providesFor(node3)).to.equal(true);
        node3.removeDependency(node2);
        expect(node3.dependsOn(node2)).to.equal(false);
        expect(node2.providesFor(node3)).to.equal(false);
    });
});
