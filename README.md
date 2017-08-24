# Remath

Mathx is a library that represents a mathematical equation as a graph of dependencies. It uses the Mobx library to make properties observable.

Read the [docs](www.trevorhanus.com/docs/mathx)

## Install

```bash
$ npm install --save mathx
```
or
```bash
$ yarn add mathx
```

## Basic Usage

```typescript
import {Mathx, autorun} from 'mathx';

const calc = Mathx.newCalculation();

// Add a cell to the sheet
const a = calc.addEquation({
    symbol: 'a',
    formula: '10'
});

// This function will run once, immediately, then any time the value of 'a' changes
autorun(() => {
  console.log('The value of a = ', a.value);
});

a.setFormula('5');
// => The value of a = 5

// Let's add another equation to the calc, this one will be dependent on the value of 'a'
calc.addEquation({
    symbol: 'b',
    formula: 'a + 5'
});

autorun(() => {
  console.log('The value of b = ', b.value);
});
// => The value of b = 10

a.setFormula('10');
// => The value of a = 5
// => The value of b = 15

// The autorun function is called again, because the value of b depends on the value of a.
```

You can learn more by reading the [documentation](www.trevorhanus.com/docs/mathx)

## Run the tests

clone the repo
```bash
$ git clone https://github.com/trevorhanus/mathx.git
```

install node modules
```bash
$ npm install
```
or
```bash
$ yarn install
```

run the all the tests
```bash
$ npm test
```

run one test individually
```bash
$ mocha --reporter spec --compilers ts:ts-node/register ./test/path/to/file.test.ts
```
