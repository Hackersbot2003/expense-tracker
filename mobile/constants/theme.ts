// Central design tokens so every screen stays visually consistent.
export const colors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#293548',
  border: '#334155',
  primary: '#6366F1',
  primaryMuted: '#4338CA',
  income: '#22C55E',
  expense: '#F87171',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
