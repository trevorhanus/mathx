import {Mathx, autorun} from '../src';

const calc = Mathx.newCalculation();

// Add an equation to the calc
const a = calc.newEquation({
    symbol: 'a',
    formula: '10'
});

// This function will run once, immediately, then any time the value of `a` changes
autorun(() => {
    console.log('The value of a = ', a.value);
});
// => The value of a = 10

a.setFormula('5');
// => The value of a = 5

// Let's add another equation to the calc, this one will be dependent on the value of `a`
const b = calc.newEquation({
    symbol: 'b',
    formula: 'a + 5'
});

// setup another autorun function that observes `b`
autorun(() => {
    console.log('The value of b = ', b.value);
});
// => The value of b = 10

a.setFormula('10');
// => The value of b = 15
// => The value of a = 10

// The autorun function is called again, because the value of `b` depends on the value of `a`.
