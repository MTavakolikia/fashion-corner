import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

type RGB = { r: number; g: number; b: number };

// WCAG 2.x AA threshold for normal-size text.
const AA_NORMAL = 4.5;

const FOOTER_BG = "#030712"; // tailwind gray-950 (footer is always dark)
const PANEL_DARK_BG = "#111827"; // tailwind gray-900 (dark dropdown panel)
const WHITE = "#ffffff";
const RED_700 = "#b91c1c"; // light-mode Sale / destructive
const RED_500 = "#ef4444"; // dark-mode Sale

// Estimated alpha-blended white on the given background (same sRGB math Tailwind uses).
function alphaWhite(alpha: number, bg: RGB): RGB {
  return blendOver(hexToRgb(WHITE), bg, alpha);
}

function parseThemeCss() {
  const css = fs.readFileSync(
    path.join(process.cwd(), "src/app/globals.css"),
    "utf8"
  );
  const rootBody = css.match(/:root\s*\{([^}]*)\}/);
  const darkBody = css.match(/\.dark\s*\{([^}]*)\}/);
  const parseVars = (block: string | undefined): Record<string, string> => {
    const vars: Record<string, string> = {};
    const re = /--([\w-]+)\s*:\s*([^;]+);/g;
    for (let m = re.exec(block ?? ""); m; m = re.exec(block ?? "")) {
      vars[m[1]] = m[2].trim();
    }
    return vars;
  };
  return { light: parseVars(rootBody?.[1]), dark: parseVars(darkBody?.[1]) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: r + m, g: g + m, b: b + m };
}

function hslToken(token: string): RGB {
  const parts = token.split(/\s+/).map((p) => p.replace("%", ""));
  const h = parseFloat(parts[0]);
  const s = parts.length > 2 ? parseFloat(parts[1]) / 100 : 1;
  const l = parseFloat(parts.length > 2 ? parts[2] : parts[1]) / 100;
  return hslToRgb(h, s, l);
}

function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function linearize(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function assertPair(label: string, fg: RGB, bg: RGB) {
  const ratio = contrastRatio(fg, bg);
  expect(
    ratio,
    `${label}: expected contrast >= ${AA_NORMAL}, got ${ratio.toFixed(2)}`
  ).toBeGreaterThanOrEqual(AA_NORMAL);
  return ratio;
}

// Simulates Tailwind's `color-mix(in srgb, <color> <alpha>%, transparent)`
// composited over the background (same sRGB math).
function blendOver(fg: RGB, bg: RGB, alpha: number): RGB {
  return {
    r: alpha * fg.r + (1 - alpha) * bg.r,
    g: alpha * fg.g + (1 - alpha) * bg.g,
    b: alpha * fg.b + (1 - alpha) * bg.b,
  };
}

const { light, dark } = parseThemeCss();

const scenarios: Array<[string, Record<string, string>, Record<string, string>]> = [
  ["light mode", light, dark],
  ["dark mode", dark, light],
];

describe("theme color contrast (WCAG AA >= 4.5)", () => {
  describe("global tokens", () => {
    it.each(scenarios)("%s: body base text is readable", (_label, fgTheme, _bgTheme) => {
      assertPair("body text on background", hslToken(fgTheme.foreground), hslToken(fgTheme.background));
      assertPair("muted text on background", hslToken(fgTheme["muted-foreground"]), hslToken(fgTheme.background));
    });

    it.each(scenarios)("%s: primary button label is readable", (_label, fgTheme, _bgTheme) => {
      assertPair("primary button label", hslToken(fgTheme["primary-foreground"]), hslToken(fgTheme.primary));
    });
  });

  describe("header (theme-aware)", () => {
    it.each(scenarios)("%s: nav items on the header are readable", (_label, fgTheme, _bgTheme) => {
      const headerBg = hslToken(fgTheme.background);
      assertPair("brand (foreground) on header", hslToken(fgTheme.foreground), headerBg);
      assertPair("nav buttons (muted-foreground) on header", hslToken(fgTheme["muted-foreground"]), headerBg);
      assertPair("icons (muted-foreground) on header", hslToken(fgTheme["muted-foreground"]), headerBg);
      assertPair("quick links (foreground) on header", hslToken(fgTheme.foreground), headerBg);
    });

    it.each(scenarios)("%s: Sale link on the header is readable", (_label, fgTheme, _bgTheme) => {
      const headerBg = hslToken(fgTheme.background);
      const sale = fgTheme === light ? hexToRgb(RED_700) : hexToRgb(RED_500);
      assertPair("Sale link on header", sale, headerBg);
    });

    it.each(scenarios)("%s: utility bar text on muted is readable", (_label, fgTheme, _bgTheme) => {
      const barBg = hslToken(fgTheme.muted);
      assertPair("utility bar text (foreground) on muted", hslToken(fgTheme.foreground), barBg);
    });
  });

  describe("dropdown panels", () => {
    it("light panel (bg-white) is readable", () => {
      assertPair("panel item on white", hslToken(light["popover-foreground"]), hexToRgb(WHITE));
      assertPair("panel title on white", hslToken(light["muted-foreground"]), hexToRgb(WHITE));
      assertPair("panel accent link on white", hslToken(light.primary), hexToRgb(WHITE));
    });

    it("dark panel (bg-gray-900) is readable", () => {
      const panelBg = hexToRgb(PANEL_DARK_BG);
      assertPair("panel item on gray-900", hslToken(dark["popover-foreground"]), panelBg);
      assertPair("panel title on gray-900", hslToken(dark["muted-foreground"]), panelBg);
      assertPair("panel accent link on gray-900", hslToken(dark.primary), panelBg);
    });
  });

  describe("footer (always dark)", () => {
    const gray950 = hexToRgb(FOOTER_BG);

    it("white-based texts on gray-950 are readable", () => {
      assertPair("brand (white)", hexToRgb(WHITE), gray950);
      assertPair("links/headings (white/60)", alphaWhite(0.6, gray950), gray950);
      assertPair("sub-labels/pay-with (white/50)", alphaWhite(0.5, gray950), gray950);
      assertPair("social icons (white/70)", alphaWhite(0.7, gray950), gray950);
      assertPair("copyright (white/60)", alphaWhite(0.6, gray950), gray950);
    });
  });
});