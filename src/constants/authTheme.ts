export const colors = {
  white: '#FFFFFF',
  brandDark: '#1B3D35',
  brandDarkGreen: '#1B3D35',
  brandAccentGreen: '#4A7C44',
  brandGray: '#5a7a70',
  brandLightGray: '#C8D5CE',
  background: '#FFFFFF',
  cardBackground: '#F4FAF4',
  badgeBackground: '#D4F8D4',
  inputBorder: '#C5DDD0',
  buttonPrimary: '#1B3D35',
  waveBorder: '#1B3D35',
  linkGreen: '#4A7C44',
};

export const authTheme = {
  badge: {
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.brandDarkGreen,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: colors.brandDark,
  },
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
    height: 54,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  headingDark: {
    fontWeight: '700' as const,
    color: colors.brandDark,
  },
  headingAccent: {
    fontWeight: '700' as const,
    color: colors.brandAccentGreen,
  },
  subtext: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.brandGray,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.brandGray,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.linkGreen,
  },
};
