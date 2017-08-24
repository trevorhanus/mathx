# Mathx

Mathx is a library that represents a mathematical equation as a graph of dependencies. It uses the Mobx library to make properties observable.

## Getting Started

##### Adding an equation

```
  const calc = mathx.newCalculation();
  const a = calc.addEquation({
    symbol: 'a',
    formula: '= 10'
  });
```

##### Adding an equation that references the value of another equation

```
  const b = calc.addEquation({
    symbol: 'b',
    formula: '= a + 10'
  });
```
since the given formula references the symbol `a` the equation is dependent on the value of `a` and will update whenever the value of `a` changes

##### Update a cell's symbol 

```
  const b = calc.addEquation({
    symbol: 'b',
    formula: '= a + 10'
  });
  b.updateSymbol('foo');
  console.log(b.symbol) // 'foo'
```

##### Add a boolean cell (future)

```
  const note = remath.addCell({
    symbol: 'switch',
    value: '= true'
  });
```

##### Add a pick list (future)

```
  const fruit = remath.addPickList({
    symbol: 'fruit',
    options: ['apple', 'banana', 'grape']
    value: 'apple'
  });
```
