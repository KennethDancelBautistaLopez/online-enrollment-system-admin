export function applyTheme(theme) {
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }
}

export function getSavedTheme() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "light";
  }
  return "light";
}
