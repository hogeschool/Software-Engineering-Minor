import React from "react";

export type Widget<o> = {
  run: (onOutput: (_: o) => void) => JSX.Element;
  map: <o2>(f: (_: o) => o2) => Widget<o2>;
  wrapHTML: (f: (_: JSX.Element) => JSX.Element) => Widget<o>;
};

export const Widget = {
  Default: <o,>(actual: (onOutput: (_: o) => void) => JSX.Element): Widget<o> => ({
    run: actual,
    map: function <o2>(this: Widget<o>, f: (_: o) => o2): Widget<o2> {
            return Widget.Default(onOutput => this.run(o => onOutput(f(o)))
      );
        },
      wrapHTML: function (this: Widget<o>, f: (_: JSX.Element) => JSX.Element): Widget<o> {
            return Widget.Default(onOutput => f(this.run(onOutput))
        );
        }
    }),
  any: <o,>(ws: Array<Widget<o>>): Widget<o> => Widget.Default<o>(onOutput => <>{ws.map(w => w.run(onOutput))}</>)
};
