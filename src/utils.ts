const camelCase = require("lodash/camelCase");
const snakeCase = require("lodash/snakeCase");
const isArray = require("lodash/isArray");
const isDate = require("lodash/isDate");
const isObject = require("lodash/isObject");
const isRegExp = require("lodash/isRegExp");
const isString = require("lodash/isString");
const keys = require("lodash/keys");
const map = require("lodash/map");
const reduce = require("lodash/reduce");

export function getDuration(later: string, earlier: string): string {
  const t1 = new Date(later).getTime();
  const t2 = new Date(earlier).getTime();

  const diff = t1 - t2;

  const s = Math.floor(diff / 1000);
  let tmp = s % 60;
  const seconds = tmp < 10 ? "0" + tmp.toString() : tmp.toString();

  const m = Math.floor(s / 60);
  tmp = m % 60;
  const minutes = tmp < 10 ? "0" + tmp.toString() : tmp.toString();

  const h = Math.floor(m / 60);
  tmp = h % 60;
  const hours = tmp < 10 ? "0" + tmp.toString() : tmp.toString();

  const days = Math.floor(h / 24);

  if (days > 0) {
    return `${days}:${hours}:${minutes}:${seconds}`;
  } else {
    return `${hours}:${minutes}:${seconds}`;
  }
}

export function camelize(data: any) {
  if (isString(data)) {
    return camelCase(data);
  } else {
    return pleaseTry(data, camelCase);
  }
}

export function decamelize(data: any) {
  if (isString(data)) {
    return snakeCase(data);
  } else {
    return pleaseTry(data, snakeCase);
  }
}

function pleaseTry(data: any, useFunction: any) {
  if (!data || !isObject(data)) {
    return data;
  } else if (isDate(data) || isRegExp(data)) {
    return data;
  } else if (isArray(data)) {
    return map(data, (item: any) => pleaseTry(item, useFunction));
  } else {
    return reduce(
      keys(data),
      (acc: any, key: any) => {
        const camel = useFunction(key);

        acc[camel] = pleaseTry(data[key], useFunction);
        return acc;
      },
      {}
    );
  }
}
