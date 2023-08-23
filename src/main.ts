import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

export const rl = readline.createInterface({ input, output });

export enum CALC {
  QUESTION = 'Введите выражение: ',
  ERROR = 'В выражении допущены ошибки: ',
  ERROR_CHARS = 'допускается использовать только символы ,.+-*/()',
  ERROR_DOUBLES = 'найдено недопустимое повторение символов',
  ERROR_BRACKETS = 'неверно указаны скобки',
  ERROR_MATH = 'невозможно рассчитать',
  DIVISION_BY_ZERO = 'Деление на ноль запрещено!',
  RESULT = 'Результат: ',
}

export const checkChars = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const string = expr.replace(/\s/g, '').replace(/,/g, '.');

    return /^([.+\-*\/()\d])+$/gs.test(string)
      ? resolve(string)
      : reject(CALC.ERROR + CALC.ERROR_CHARS);
  });
};

export const checkDoubles = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    return /,{2}|\.{2}|\+{2}|-{2}|\/{2}|\*{2}/gs.test(expr)
      ? reject(CALC.ERROR + CALC.ERROR_DOUBLES)
      : resolve(expr);
  });
};

export const checkBrackets = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const verify = (brackets: string[] | null) => {
      if (!brackets) {
        return true;
      }
      const stack = [];
      const result = brackets.every((char) => {
        if (char === '(') {
          stack.push(char);
          return true;
        }
        if (stack[stack.length - 1] === '(' && char === ')') {
          stack.pop();
          return true;
        }
        return false;
      });

      return result && !(stack.length > 0);
    };

    return verify(expr.match(/[()]/g))
      ? resolve(expr)
      : reject(CALC.ERROR + CALC.ERROR_BRACKETS);
  });
};

export const prepare = (expr: string): Promise<string> => {
  return new Promise((resolve) => {
    const prepared = expr
      .replace(/\d\(/g, (p) => p.replace(/\(/g, '*('))
      .replace(/\)\(/g, ')*(');

    return resolve(prepared);
  });
};

export const calc = (expr: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const result = eval(`(${expr})`);

      return isFinite(result) ? resolve(result) : reject(CALC.DIVISION_BY_ZERO);
    } catch (e) {
      reject(CALC.ERROR + CALC.ERROR_MATH);
    }
  });
};

export const parse = async (expr: string): Promise<void> => {
  return Promise.resolve(checkChars(expr))
    .then(checkDoubles)
    .then(checkBrackets)
    .then(prepare)
    .then(calc)
    .then((result) => console.log(CALC.RESULT, result))
    .catch((error) => console.error(error))
    .finally(() => rl.close());
};

rl.question(CALC.QUESTION, parse);
