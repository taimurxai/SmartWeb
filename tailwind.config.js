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
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
          tertiary: "var(--text-tertiary)",
        },
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
        },
        border: {
          subtle: "var(--border-subtle)",
          faint: "var(--border-faint)",
          DEFAULT: "var(--border-subtle)",
        },
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        
        // Backward compat
        primary: {
          DEFAULT: "var(--color-accent)",
          600: "var(--color-accent)",
        }
      },
      fontSize: {
        'hero': ['var(--text-hero)', { lineHeight: '1', fontWeight: '500', letterSpacing: '-0.6px' }],
        'h2': ['var(--text-h2)', { lineHeight: '40px', fontWeight: '500', letterSpacing: '-0.36px' }],
        'h3': ['var(--text-h3)', { lineHeight: '36px', fontWeight: '500', letterSpacing: '-0.3px' }],
        'body': ['var(--text-body)', { lineHeight: '26px', fontWeight: '400' }],
        'small': ['var(--text-small)', { lineHeight: '19.5px', fontWeight: '400' }],
      },
      fontFamily: {
        sans: ["var(--font-family-primary)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-family-primary)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        pill: 'var(--radius-pill)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        default: 'var(--transition-default)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-default) var(--ease-standard) forwards',
        'fade-in-up': 'fadeInUp var(--transition-default) var(--ease-standard) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [],
};
