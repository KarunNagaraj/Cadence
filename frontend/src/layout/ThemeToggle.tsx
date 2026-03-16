import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GradientTheme = {
  id: string;
  name: string;
  bg: string; // full CSS gradient string
  accent: string; // HSL triple string, e.g. "222 84% 56%"
};

const GRADIENT_THEMES: GradientTheme[] = [
  {
    id: "aurora",
    name: "Aurora Nights",
    bg: "linear-gradient(135deg, #020617 0%, #0f172a 35%, #4f46e5 100%)",
    accent: "234 89% 64%",
  },
  {
    id: "sunset",
    name: "Sunset Drive",
    bg: "linear-gradient(135deg, #0f172a 0%, #ea580c 35%, #db2777 100%)",
    accent: "17 90% 59%",
  },
  {
    id: "forest",
    name: "Forest Glow",
    bg: "linear-gradient(135deg, #020617 0%, #166534 30%, #22c55e 100%)",
    accent: "142 72% 45%",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    bg: "linear-gradient(135deg, #020617 0%, #0ea5e9 35%, #1d4ed8 100%)",
    accent: "199 89% 48%",
  },
  {
    id: "neon",
    name: "Neon Lights",
    bg: "linear-gradient(135deg, #020617 0%, #7c3aed 35%, #ec4899 100%)",
    accent: "292 84% 61%",
  },
  {
    id: "midnight",
    name: "Midnight City",
    bg: "linear-gradient(135deg, #020617 0%, #111827 30%, #22d3ee 100%)",
    accent: "184 86% 53%",
  },
];

const STORAGE_KEY = "cadence-gradient-theme";

type ThemeContextValue = {
  themes: GradientTheme[];
  activeTheme: GradientTheme;
  setActiveThemeId: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): GradientTheme {
  if (typeof window === "undefined") {
    return GRADIENT_THEMES[0];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { id?: string };
      if (parsed?.id) {
        const found = GRADIENT_THEMES.find((t) => t.id === parsed.id);
        if (found) return found;
      }
    }
  } catch {
    // ignore
  }

  return GRADIENT_THEMES[0];
}

function applyThemeToDocument(theme: GradientTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--app-bg-gradient", theme.bg);
  root.style.setProperty("--primary", theme.accent);
  root.style.setProperty("--ring", theme.accent);
  root.setAttribute("data-gradient-theme", theme.id);
}
// expects childeren compoenet as it this function now works as a React Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<GradientTheme>(() => getInitialTheme());

  useEffect(() => {
    applyThemeToDocument(activeTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: activeTheme.id }));
    } catch {
      // ignore
    }
  }, [activeTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themes: GRADIENT_THEMES,
      activeTheme,
      setActiveThemeId: (id) => {
        const found = GRADIENT_THEMES.find((t) => t.id === id);
        if (found) setActiveTheme(found);
      },
    }),
    [activeTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
};

const ThemeToggle = () => {
  const { themes, activeTheme, setActiveThemeId } = useThemeContext();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    setActiveThemeId(id);
    setOpen(false);
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant="ghost"
        className="accent-border glass-panel rounded-full pr-3 pl-2 h-11 min-w-[44px] text-xs sm:text-sm flex items-center gap-2 bg-black/40 hover:bg-black/60 border-white/25"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className="h-5 w-5 rounded-full accent-glow flex-shrink-0"
          style={{ backgroundImage: activeTheme.bg }}
        />
        <span className="hidden sm:inline truncate max-w-[130px] text-xs sm:text-sm">
          {activeTheme.name}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 w-72 glass-panel rounded-xl p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-200">
            <span className="font-medium">Choose theme</span>
            <span className="text-[10px] text-zinc-400">Tap to preview</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme.id)}
                className={cn(
                  "group relative h-16 rounded-lg overflow-hidden border transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  theme.id === activeTheme.id ? "accent-border accent-glow scale-[1.02]" : "border-white/15 hover:scale-[1.02]"
                )}
                style={{ backgroundImage: theme.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-transparent" />
                <span className="relative z-10 block px-2 py-1 text-left text-[11px] font-medium text-white drop-shadow-sm">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
