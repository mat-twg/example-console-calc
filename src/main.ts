import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

export const rl = readline.createInterface({ input, output });

export enum CALC {
  QUESTION = 'Введите выражение: ',
  ERROR = 'В выражении допущены ошибки: ',
  ERROR_EMPTY = 'пустая строка',
  ERROR_CHARS = 'допускается использовать только символы 0-9,.+*/()',
  ERROR_DOUBLES = 'найдено недопустимое повторение символов',
  ERROR_BRACKETS = 'неверно указаны скобки',
  ERROR_MALFORMED = 'Неправильное выражение',
  DIVISION_BY_ZERO = 'Деление на ноль запрещено!',
  RESULT = 'Результат: ',
}

export enum OPERATOR {
  PLUS = '+',
  MINUS = '-',
  DIV = '/',
  MULT = '*',
}

export const checkChars = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const string = expr.replace(/\s/g, '').replace(/,/g, '.');

    if (string.length === 0) {
      return reject(CALC.ERROR + CALC.ERROR_EMPTY);
    }

    return /^([.+\-*\/()\d])+$/gs.test(string)
      ? resolve(string)
      : reject(CALC.ERROR + CALC.ERROR_CHARS);
  });
};

export const checkMalformed = (expr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    return /[+-\/*]$/g.test(expr) ||
      /\*\/|\/\*/g.test(expr) ||
      /^\/|^\*/g.test(expr)
      ? reject(CALC.ERROR + CALC.ERROR_MALFORMED)
      : resolve(expr);
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
  const sequenceCalc = (input: string): number => {
    input = input.replace(/--/g, '+');

    let result = 0;
    let temp = '';

    const process = (input: string) => {
      if (input.length === 0) {
        return;
      }

      if (!/^[+-\/*]/g.test(input)) {
        result = parseFloat(input);
        return;
      }

      const operator = input.charAt(0);
      input = input.slice(1);

      switch (operator) {
        case OPERATOR.PLUS:
          return (result += parseFloat(input));
        case OPERATOR.MINUS:
          return (result -= parseFloat(input));
        case OPERATOR.MULT:
          return (result *= parseFloat(input));
        case OPERATOR.DIV:
          const value = parseFloat(input);
          if (value === 0) {
            throw new Error(CALC.DIVISION_BY_ZERO);
          }
          result /= value;
      }
    };

    Array.from(input).forEach((char) => {
      if (Object.values(OPERATOR).includes(char as OPERATOR)) {
        process(temp);
        temp = '';
      }
      temp += char;
    });
    process(temp);

    return result;
  };

  const mergeResults = (
    input: string,
    results: Record<string, number>,
  ): string => {
    let output = input;
    Object.keys(results)?.forEach(
      (key) => (output = output.replace(key, results[key].toString())),
    );
    return output;
  };

  const collapseMultDiv = (input: string): string => {
    const results: Record<string, number> = {};

    input = input.replace(/--/g, '+');

    if (!/[+-]/g.test(input) && input.match(/[\/*]/g).length > 1) {
      results[input] = sequenceCalc(input);

      return mergeResults(input, results);
    }

    input.match(/[\d.]+[*\/][+\-]*[\d.]+/g)?.forEach((node) => {
      if (node.indexOf(OPERATOR.MULT) > 0) {
        const temp = node.split(OPERATOR.MULT);
        results[node] = parseFloat(temp[0]) * parseFloat(temp[1]);
      }
      if (node.indexOf(OPERATOR.DIV) > 0) {
        const temp = node.split(OPERATOR.DIV);
        if (parseFloat(temp[1]) === 0) {
          throw new Error(CALC.DIVISION_BY_ZERO);
        }
        results[node] = parseFloat(temp[0]) / parseFloat(temp[1]);
      }
    });
    const output = mergeResults(input, results);

    return /[\/*]/g.test(output) ? collapseMultDiv(output) : output;
  };

  const collapseAll = (input: string): string => {
    input = input.replace(/--/g, '+');

    const matches = input.match(/\([^()]*\)/g).map((result) => result);
    const results = {};

    for (const node of matches) {
      results[node] = [];
      const preparedNode = node.replace(/[()]/g, '');
      const resultMultDiv = collapseMultDiv(preparedNode);

      results[node] = sequenceCalc(resultMultDiv);
    }
    const output = mergeResults(input, results);

    return /[\/*]/g.test(output) ? collapseAll(output) : output;
  };

  return new Promise((resolve, reject) => {
    try {
      const result = collapseAll(`(${expr})`).replace(/[()]/g, '');

      return resolve(+result);
    } catch (e) {
      reject(e.message);
    }
  });
};

export const parse = async (expr: string): Promise<void> => {
  return Promise.resolve(checkChars(expr))
    .then(checkMalformed)
    .then(checkDoubles)
    .then(checkBrackets)
    .then(prepare)
    .then(calc)
    .then((result) => console.log(CALC.RESULT, result))
    .catch((error) => console.error(error))
    .finally(() => rl.close());
};

rl.question(CALC.QUESTION, parse);
