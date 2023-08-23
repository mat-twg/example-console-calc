import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

export enum CALC {
  QUESTION = 'Введите выражение: ',
  ERROR = 'В выражении допущены ошибки!',
  DIVISION_BY_ZERO = 'Деление на ноль запрещено!',
  QUIT = 'q',
}

export const check = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const string = expr.replace(/\s/g, '').replace(/,/g, '.');

    return /^([.,+\-*\/()\d])+$/gs.test(string)
      ? resolve(string)
      : reject(CALC.ERROR);
  });
};

export const calc = (expr: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const string = expr
        .replace(/\d\(/g, (p) => p.replace(/\(/g, '*('))
        .replace(/\)\(/g, ')*(');

      const result = eval(`(${string})`);

      return isFinite(result) ? resolve(result) : reject(CALC.DIVISION_BY_ZERO);
    } catch (e) {
      reject(CALC.ERROR);
    }
  });
};

export const parse = async (expr: string): Promise<void> => {
  if (expr === CALC.QUIT) {
    return rl.close();
  }

  return Promise.resolve(check(expr))
    .then(calc)
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => rl.question(CALC.QUESTION, parse));
};

rl.question(CALC.QUESTION, parse);
