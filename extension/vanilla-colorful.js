var c = (r, t = 0, e = 1) => (r > e ? e : r < t ? t : r),
    n = (r, t = 0, e = Math.pow(10, t)) => Math.round(e * r) / e;
var J = { grad: 360 / 400, turn: 360, rad: 360 / (Math.PI * 2) },
    k = (r) => X(m(r)),
    m = (r) => (
        r[0] === "#" && (r = r.substring(1)),
        r.length < 6
            ? {
                  r: parseInt(r[0] + r[0], 16),
                  g: parseInt(r[1] + r[1], 16),
                  b: parseInt(r[2] + r[2], 16),
                  a: r.length === 4 ? n(parseInt(r[3] + r[3], 16) / 255, 2) : 1,
              }
            : {
                  r: parseInt(r.substring(0, 2), 16),
                  g: parseInt(r.substring(2, 4), 16),
                  b: parseInt(r.substring(4, 6), 16),
                  a: r.length === 8 ? n(parseInt(r.substring(6, 8), 16) / 255, 2) : 1,
              }
    );
var E = (r) => V(P(r)),
    B = ({ h: r, s: t, v: e, a: s }) => {
        let o = ((200 - t) * e) / 100;
        return {
            h: n(r),
            s: n(o > 0 && o < 200 ? ((t * e) / 100 / (o <= 100 ? o : 200 - o)) * 100 : 0),
            l: n(o / 2),
            a: n(s, 2),
        };
    };
var d = (r) => {
    let { h: t, s: e, l: s } = B(r);
    return `hsl(${t}, ${e}%, ${s}%)`;
};
var P = ({ h: r, s: t, v: e, a: s }) => {
    ((r = (r / 360) * 6), (t = t / 100), (e = e / 100));
    let o = Math.floor(r),
        a = e * (1 - t),
        i = e * (1 - (r - o) * t),
        H = e * (1 - (1 - r + o) * t),
        T = o % 6;
    return {
        r: n([e, i, a, a, H, e][T] * 255),
        g: n([H, e, e, i, a, a][T] * 255),
        b: n([a, a, H, e, e, i][T] * 255),
        a: n(s, 2),
    };
};
var h = (r) => {
        let t = r.toString(16);
        return t.length < 2 ? "0" + t : t;
    },
    V = ({ r, g: t, b: e, a: s }) => {
        let o = s < 1 ? h(n(s * 255)) : "";
        return "#" + h(r) + h(t) + h(e) + o;
    },
    X = ({ r, g: t, b: e, a: s }) => {
        let o = Math.max(r, t, e),
            a = o - Math.min(r, t, e),
            i = a ? (o === r ? (t - e) / a : o === t ? 2 + (e - r) / a : 4 + (r - t) / a) : 0;
        return { h: n(60 * (i < 0 ? i + 6 : i)), s: n(o ? (a / o) * 100 : 0), v: n((o / 255) * 100), a: s };
    };
var y = (r, t) => {
    if (r === t) return !0;
    for (let e in r) if (r[e] !== t[e]) return !1;
    return !0;
};
var N = (r, t) => (r.toLowerCase() === t.toLowerCase() ? !0 : y(m(r), m(t)));
var L = {},
    f = (r) => {
        let t = L[r];
        return (t || ((t = document.createElement("template")), (t.innerHTML = r), (L[r] = t)), t);
    },
    p = (r, t, e) => {
        r.dispatchEvent(new CustomEvent(t, { bubbles: !0, detail: e }));
    };
var l = !1,
    S = (r) => "touches" in r,
    Y = (r) => (l && !S(r) ? !1 : (l || (l = S(r)), !0)),
    I = (r, t) => {
        let e = S(t) ? t.touches[0] : t,
            s = r.el.getBoundingClientRect();
        p(
            r.el,
            "move",
            r.getMove({
                x: c((e.pageX - (s.left + window.pageXOffset)) / s.width),
                y: c((e.pageY - (s.top + window.pageYOffset)) / s.height),
            }),
        );
    },
    _ = (r, t) => {
        let e = t.keyCode;
        e > 40 ||
            (r.xy && e < 37) ||
            e < 33 ||
            (t.preventDefault(),
            p(
                r.el,
                "move",
                r.getMove(
                    {
                        x:
                            e === 39
                                ? 0.01
                                : e === 37
                                  ? -0.01
                                  : e === 34
                                    ? 0.05
                                    : e === 33
                                      ? -0.05
                                      : e === 35
                                        ? 1
                                        : e === 36
                                          ? -1
                                          : 0,
                        y: e === 40 ? 0.01 : e === 38 ? -0.01 : 0,
                    },
                    !0,
                ),
            ));
    },
    u = class {
        constructor(t, e, s, o) {
            let a = f(`<div role="slider" tabindex="0" part="${e}" ${s}><div part="${e}-pointer"></div></div>`);
            t.appendChild(a.content.cloneNode(!0));
            let i = t.querySelector(`[part=${e}]`);
            (i.addEventListener("mousedown", this),
                i.addEventListener("touchstart", this),
                i.addEventListener("keydown", this),
                (this.el = i),
                (this.xy = o),
                (this.nodes = [i.firstChild, i]));
        }
        set dragging(t) {
            let e = t ? document.addEventListener : document.removeEventListener;
            (e(l ? "touchmove" : "mousemove", this), e(l ? "touchend" : "mouseup", this));
        }
        handleEvent(t) {
            switch (t.type) {
                case "mousedown":
                case "touchstart":
                    if ((t.preventDefault(), !Y(t) || (!l && t.button != 0))) return;
                    (this.el.focus(), I(this, t), (this.dragging = !0));
                    break;
                case "mousemove":
                case "touchmove":
                    (t.preventDefault(), I(this, t));
                    break;
                case "mouseup":
                case "touchend":
                    this.dragging = !1;
                    break;
                case "keydown":
                    _(this, t);
                    break;
            }
        }
        style(t) {
            t.forEach((e, s) => {
                for (let o in e) this.nodes[s].style.setProperty(o, e[o]);
            });
        }
    };
var g = class extends u {
    constructor(t) {
        super(t, "hue", 'aria-label="Hue" aria-valuemin="0" aria-valuemax="360"', !1);
    }
    update({ h: t }) {
        ((this.h = t),
            this.style([{ left: `${(t / 360) * 100}%`, color: d({ h: t, s: 100, v: 100, a: 1 }) }]),
            this.el.setAttribute("aria-valuenow", `${n(t)}`));
    }
    getMove(t, e) {
        return { h: e ? c(this.h + t.x * 360, 0, 360) : 360 * t.x };
    }
};
var x = class extends u {
    constructor(t) {
        super(t, "saturation", 'aria-label="Color"', !0);
    }
    update(t) {
        ((this.hsva = t),
            this.style([
                { top: `${100 - t.v}%`, left: `${t.s}%`, color: d(t) },
                { "background-color": d({ h: t.h, s: 100, v: 100, a: 1 }) },
            ]),
            this.el.setAttribute("aria-valuetext", `Saturation ${n(t.s)}%, Brightness ${n(t.v)}%`));
    }
    getMove(t, e) {
        return {
            s: e ? c(this.hsva.s + t.x * 100, 0, 100) : t.x * 100,
            v: e ? c(this.hsva.v - t.y * 100, 0, 100) : Math.round(100 - t.y * 100),
        };
    }
};
var q =
    ':host{display:flex;flex-direction:column;position:relative;width:200px;height:200px;user-select:none;-webkit-user-select:none;cursor:default}:host([hidden]){display:none!important}[role=slider]{position:relative;touch-action:none;user-select:none;-webkit-user-select:none;outline:0}[role=slider]:last-child{border-radius:0 0 8px 8px}[part$=pointer]{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;display:flex;place-content:center center;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}[part$=pointer]::after{content:"";width:100%;height:100%;border-radius:inherit;background-color:currentColor}[role=slider]:focus [part$=pointer]{transform:translate(-50%,-50%) scale(1.1)}';
var R =
    "[part=hue]{flex:0 0 24px;background:linear-gradient(to right,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red 100%)}[part=hue-pointer]{top:50%;z-index:2}";
var A =
    "[part=saturation]{flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,rgba(255,255,255,0));box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}[part=saturation-pointer]{z-index:3}";
var b = Symbol("same"),
    w = Symbol("color"),
    O = Symbol("hsva"),
    M = Symbol("update"),
    z = Symbol("parts"),
    j = Symbol("css"),
    D = Symbol("sliders"),
    v = class extends HTMLElement {
        static get observedAttributes() {
            return ["color"];
        }
        get [j]() {
            return [q, R, A];
        }
        get [D]() {
            return [x, g];
        }
        get color() {
            return this[w];
        }
        set color(t) {
            if (!this[b](t)) {
                let e = this.colorModel.toHsva(t);
                (this[M](e), (this[w] = t));
            }
        }
        constructor() {
            super();
            let t = f(`<style>${this[j].join("")}</style>`),
                e = this.attachShadow({ mode: "open" });
            (e.appendChild(t.content.cloneNode(!0)),
                e.addEventListener("move", this),
                (this[z] = this[D].map((s) => new s(e))));
        }
        connectedCallback() {
            if (this.hasOwnProperty("color")) {
                let t = this.color;
                (delete this.color, (this.color = t));
            } else this.color || (this.color = this.colorModel.defaultColor);
        }
        attributeChangedCallback(t, e, s) {
            let o = this.colorModel.fromAttr(s);
            this[b](o) || (this.color = o);
        }
        handleEvent(t) {
            let e = this[O],
                s = { ...e, ...t.detail };
            this[M](s);
            let o;
            !y(s, e) &&
                !this[b]((o = this.colorModel.fromHsva(s))) &&
                ((this[w] = o), p(this, "color-changed", { value: o }));
        }
        [b](t) {
            return this.color && this.colorModel.equal(t, this.color);
        }
        [M](t) {
            ((this[O] = t), this[z].forEach((e) => e.update(t)));
        }
    };
var U = {
        defaultColor: "#000",
        toHsva: k,
        fromHsva: ({ h: r, s: t, v: e }) => E({ h: r, s: t, v: e, a: 1 }),
        equal: N,
        fromAttr: (r) => r,
    },
    $ = class extends v {
        get colorModel() {
            return U;
        }
    };
var C = class extends $ {};
customElements.define("hex-color-picker", C);
export { C as HexColorPicker };
