/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 60% - Background & Surface
        background: "#0F1117",
        surface: "#171923",
        surfaceLight: "#1F2937",
        
        // 30% - Text, Borders & Secondary
        textPrimary: "#F9FAFB",
        textSecondary: "#9CA3AF",
        border: "#2D3748",

        // 10% - Accent / Primary Color
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Main Accent
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Semantic Colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",

        // Keeping previous colors for backward compatibility
        slate: {
          950: "#0a0a0f",
          900: "#12121a",
          850: "#161722",
          800: "#1e1f2e",
          700: "#2a2b3d",
          600: "#475569",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontSize: {
        // Enterprise Typography Scale (Base 14px)
        'ent-caption': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
        'ent-sub': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'ent-body': ['14px', { lineHeight: '1.5', fontWeight: '400' }], // Standard Base
        'ent-h3': ['16px', { lineHeight: '1.3', fontWeight: '500' }],
        'ent-h2': ['18px', { lineHeight: '1.2', fontWeight: '500' }],
        'ent-h1': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        elevated: "0 12px 36px -4px rgba(0, 0, 0, 0.6)",
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.25)", // Updated to primary blue
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [],
};
