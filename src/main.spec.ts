import * as main from './main';

describe('Check', () => {
  it(`valid chars: '. , +-0123456789()'`, () => {
    expect(main.check('. , +-0123456789()')).resolves.toBe('..+-0123456789()');
  });
});

describe('Calc', () => {
  it(`valid expr: '(1+2)(2-1)/3(3*3)'`, () => {
    expect(main.calc('(1+2)(2-1)/3(3*3)')).resolves.toBe(9);
  });
  it(`invalid expr`, () => {
    expect(main.calc('')).rejects.toBe(main.CALC.ERROR);
  });
  it('division by zero', () => {
    expect(main.calc('1/0')).rejects.toBe(main.CALC.DIVISION_BY_ZERO);
  });
});

describe('Output', () => {
  it('output results', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    await main.parse('1+2-3');
    expect(logSpy).toHaveBeenCalledWith(0);
    logSpy.mockClear();
  });
  it('output errors', async () => {
    const logSpy = jest.spyOn(console, 'error').mockImplementation();
    await main.parse('er');
    expect(logSpy).toHaveBeenCalledWith(main.CALC.ERROR);
    logSpy.mockClear();
  });
});

afterAll(async () => {
  await main.parse('q');
});
