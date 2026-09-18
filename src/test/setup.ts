import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-magicui-theme-vt");
});

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

class IntersectionObserverMock {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

vi.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, className, ...rest }: any) =>
        React.createElement(
            "a",
            { href: typeof href === "string" ? href : "/", className, ...rest },
            children
        ),
}));

vi.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, fill, width, height, className, style, ...rest }: any) =>
        React.createElement("img", {
            src: typeof src === "string" ? src : "/mock-image",
            alt: alt ?? "",
            width: fill ? undefined : width,
            height: fill ? undefined : height,
            className,
            style,
            ...rest,
        }),
}));