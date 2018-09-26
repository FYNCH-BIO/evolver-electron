/* @flow */

export const input = `
  declare module Demo {
    declare var foo: string;
  }
`;

export const expected = `
  import t from "flow-runtime";

  t.declare(t.module("Demo", t => {
    t.declare(t.var("foo", t.string()));
  }));
`;