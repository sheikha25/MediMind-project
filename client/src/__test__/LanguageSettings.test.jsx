import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LanguageSettings from "../components/LanguageSettings";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("CAT B - Module 4: Multilingual Support (M4F1)", () => {
  it("displays English and left-to-right layout by default", () => {
    const { container } = render(<LanguageSettings />);

    expect(screen.getByRole("heading", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Select Language" })).toHaveValue("en");
    expect(container.querySelector(".language-settings-page")).toHaveAttribute("dir", "ltr");
  });

  it("switches to Arabic, saves the choice, dispatches the language event, and enables RTL", () => {
    const onLanguageChange = vi.fn();
    window.addEventListener("medimind-language-change", onLanguageChange, { once: true });
    const { container } = render(<LanguageSettings />);

    fireEvent.change(screen.getByRole("combobox", { name: "Select Language" }), {
      target: { value: "ar" },
    });

    expect(screen.getByRole("heading", { name: "اللغة" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "اختر اللغة" })).toHaveValue("ar");
    expect(container.querySelector(".language-settings-page")).toHaveAttribute("dir", "rtl");
    expect(localStorage.getItem("medimindLanguage")).toBe("ar");
    expect(onLanguageChange).toHaveBeenCalledTimes(1);
  });

  it("switches back to English and restores left-to-right layout", () => {
    const { container } = render(<LanguageSettings />);
    const dropdown = screen.getByRole("combobox");

    fireEvent.change(dropdown, { target: { value: "ar" } });
    fireEvent.change(dropdown, { target: { value: "en" } });

    expect(screen.getByRole("heading", { name: "Language" })).toBeInTheDocument();
    expect(dropdown).toHaveValue("en");
    expect(container.querySelector(".language-settings-page")).toHaveAttribute("dir", "ltr");
    expect(localStorage.getItem("medimindLanguage")).toBe("en");
  });

  it("loads the saved Arabic preference when the component opens", () => {
    localStorage.setItem("medimindLanguage", "ar");
    const { container } = render(<LanguageSettings />);

    expect(screen.getByRole("heading", { name: "اللغة" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "اختر اللغة" })).toHaveValue("ar");
    expect(container.querySelector(".language-settings-page")).toHaveAttribute("dir", "rtl");
  });
});
