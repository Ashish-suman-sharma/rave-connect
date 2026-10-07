// ============================================================
// Rave Connect — Design System (Warm Cream Canvas & Lime Spark)
// Luxury Cream Canvas (#F7F6F1), Obsidian Black (#101112), Electric Lime Spark (#C8FF3D)
// ============================================================

export const theme = {
  colors: {
    // Core palette
    background: '#F7F6F1',        // Warm off-white / luxury cream canvas
    backgroundAlt: '#EDEAE1',     // Slightly deeper cream for secondary surfaces
    surface: '#FFFFFF',           // Crisp white cards
    surfaceElevated: '#FFFFFF',
    surfaceDark: '#101112',       // Deep near-black obsidian
    surfaceDarkHover: '#1C1D1F',

    // Accent (Lime Spark)
    accent: '#C8FF3D',           // Electric Lime / Lime Spark
    accentDark: '#A6E615',
    accentMuted: 'rgba(200, 255, 61, 0.25)', // Soft lime glow

    // Text
    textPrimary: '#101112',       // Deep near-black obsidian
    textSecondary: '#60646C',     // Refined graphite
    textTertiary: '#9DA2A9',      // Muted warm gray
    textOnDark: '#F7F6F1',
    textOnDarkMuted: '#A0A5AA',
    textOnAccent: '#101112',      // Deep near-black on Lime Spark for ultra crisp contrast!

    // Category Tints (Refined tints on cream canvas — strictly no blue)
    tintOrange: '#FFF7ED',
    tintOrangeDark: '#C2410C',
    tintSlate: '#F1F5F9',
    tintSlateDark: '#334155',
    tintBlue: '#F1F5F9',         // Neutral slate alias (zero blue tint)
    tintBlueDark: '#334155',
    tintPurple: '#FAF5FF',
    tintPurpleDark: '#7E22CE',
    tintGreen: '#F0FDF4',
    tintGreenDark: '#15803D',
    tintRose: '#FFF1F2',
    tintRoseDark: '#BE123C',
    tintYellow: '#FEFCE8',
    tintYellowDark: '#A16207',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    live: '#EF4444',

    // Borders
    border: '#E6E3DB',
    borderLight: '#EFECE5',
    borderDark: 'rgba(255, 255, 255, 0.12)',

    // Compatibility aliases
    secondary: '#101112',

    // Overlays
    overlay: 'rgba(16, 17, 18, 0.4)',
    overlayHeavy: 'rgba(16, 17, 18, 0.7)',
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
    massive: 64,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
  },

  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
      black: 'Inter_900Black',
    },
    sizes: {
      micro: 11,
      caption: 13,
      body: 15,
      bodyLarge: 17,
      h3: 20,
      h2: 24,
      h1: 30,
      display: 36,
    },
    lineHeights: {
      body: 22,
      bodyLarge: 26,
      h3: 28,
      h2: 32,
      h1: 38,
      display: 44,
    },
  },
};

// ---- Category Style Mapping ----
type CategoryStyle = { bg: string; text: string };

const categoryStyles: Record<string, CategoryStyle> = {
  coffee: { bg: theme.colors.tintOrange, text: theme.colors.tintOrangeDark },
  food: { bg: theme.colors.tintRose, text: theme.colors.tintRoseDark },
  gaming: { bg: theme.colors.tintPurple, text: theme.colors.tintPurpleDark },
  movie: { bg: theme.colors.tintSlate, text: theme.colors.tintSlateDark },
  walk: { bg: theme.colors.tintGreen, text: theme.colors.tintGreenDark },
  gym: { bg: theme.colors.tintYellow, text: theme.colors.tintYellowDark },
  football: { bg: theme.colors.tintGreen, text: theme.colors.tintGreenDark },
  study: { bg: theme.colors.tintSlate, text: theme.colors.tintSlateDark },
  explore: { bg: theme.colors.tintPurple, text: theme.colors.tintPurpleDark },
  'going-out': { bg: theme.colors.tintRose, text: theme.colors.tintRoseDark },
  talk: { bg: theme.colors.tintOrange, text: theme.colors.tintOrangeDark },
};

export const getCategoryStyle = (categoryId: string): CategoryStyle => {
  return categoryStyles[categoryId] || { bg: theme.colors.backgroundAlt, text: theme.colors.textSecondary };
};

// Legacy support for older components
export const getCategoryColor = (categoryId: string): string => {
  return getCategoryStyle(categoryId).bg;
};

export default theme;
