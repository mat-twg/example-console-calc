import * as main from './main';

describe('Check', () => {
  it(`Проверка допустимых символов: '.,+-*/0123456789( )'`, () => {
    expect(main.checkChars('.,+-*/0123456789( )')).resolves.toBe(
      '..+-*/0123456789()',
    );
  });
  it(`Проверка недопустимых символов: '1@2'`, () => {
    expect(main.checkChars('1@2')).rejects.toBe(
      main.CALC.ERROR + main.CALC.ERROR_CHARS,
    );
  });
  it(`Проверка пустой строки: ' '`, () => {
    expect(main.checkChars(' ')).rejects.toBe(
      main.CALC.ERROR + main.CALC.ERROR_EMPTY,
    );
  });
  it(`Проверка повторных символов: '1++1'`, () => {
    expect(main.checkDoubles('1++1')).rejects.toBe(
      main.CALC.ERROR + main.CALC.ERROR_DOUBLES,
    );
  });
  it(`Проверка скобок: '(())())'`, () => {
    expect(main.checkBrackets('(())())')).rejects.toBe(
      main.CALC.ERROR + main.CALC.ERROR_BRACKETS,
    );
  });
});

describe('Calc', () => {
  it(`Подготовка выражения: (1+2)(2-1)/3(3*3)'`, () => {
    expect(main.prepare('(1+2)(2-1)/3(3*3)')).resolves.toBe(
      '(1+2)*(2-1)/3*(3*3)',
    );
  });
  it(`Расчёт: '(1+2)*(2-1)/3*(3*3)'`, () => {
    expect(main.calc('(1+2)*(2-1)/3*(3*3)')).resolves.toBe(9);
  });
  it('Деление на ноль', () => {
    expect(main.calc('1/0')).rejects.toBe(main.CALC.DIVISION_BY_ZERO);
  });
});

describe('Output', () => {
  it('Проверка вывода результата', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    await main.parse('1+2-3');
    expect(logSpy).toHaveBeenCalledWith(main.CALC.RESULT, 0);
    logSpy.mockClear();
  });
  it('Проверка вывода ошибки', async () => {
    const logSpy = jest.spyOn(console, 'error').mockImplementation();
    await main.parse('()');
    expect(logSpy).toHaveBeenCalledWith(main.CALC.ERROR + main.CALC.ERROR_MATH);
    logSpy.mockClear();
  });
});

afterAll(() => {
  main.rl.close();
});
