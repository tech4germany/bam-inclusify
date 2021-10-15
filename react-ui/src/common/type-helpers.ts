export function isFunction(x: any): x is Function {
  return typeof x === "function";
}
export function isString(x: any): x is string {
  return typeof x === "string";
}
