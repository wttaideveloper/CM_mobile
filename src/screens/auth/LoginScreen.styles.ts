import { StyleSheet } from 'react-native';

import { authTheme, colors } from '@/constants/authTheme';
import { getButtonHeight, getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: getSpacing(2),
  },
  /** Starts at hero edge; clips heading + form so both scroll under the photo. */
  formViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  heading: {
    marginTop: isSmallDevice ? 0 : 4,
    marginBottom: getSpacing(8),
  },
  headingDark: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '800',
    color: '#164744',
    lineHeight: isSmallDevice ? 32 : 38,
    letterSpacing: -0.4,
  },
  headingAccent: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '800',
    color: '#2F7D32',
    lineHeight: isSmallDevice ? 32 : 38,
    letterSpacing: -0.4,
  },
  subtext: {
    ...authTheme.subtext,
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: getFontSize(24),
    color: '#164744',
    marginBottom: getSpacing(24),
  },
  label: {
    ...authTheme.label,
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#164744',
    marginBottom: isSmallDevice ? 4 : 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#98D1A9',
    borderRadius: 8,
    paddingHorizontal: getSpacing(16),
    height: getButtonHeight(56),
    fontSize: getFontSize(16),
    color: '#164744',
    marginBottom: 20,
  },
  readOnlyInput: {
    opacity: 0.85,
    backgroundColor: '#F5F5F5',
  },
  passwordHint: {
    fontSize: getFontSize(12),
    lineHeight: getFontSize(18),
    color: colors.brandGray,
    marginTop: -12,
    marginBottom: getSpacing(16),
  },
  otpInput: {
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: getSpacing(8),
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  resendPrompt: {
    fontSize: getFontSize(13),
    color: colors.brandGray,
  },
  resendLink: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: authTheme.link.color,
  },
  resendLinkDisabled: {
    opacity: 0.55,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(16),
    marginTop: isSmallDevice ? -14 : -14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(10),
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(10),
    marginBottom: getSpacing(8),
    marginTop: -4,
  },
  termsText: {
    flex: 1,
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#164744',
  },
  checkbox: {
    width: getSpacing(20),
    height: getSpacing(20),
    borderWidth: 1,
    borderColor: '#98D1A9',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: '#257D3F',
    borderColor: '#257D3F',
  },
  checkmark: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontWeight: '700',
  },
  optionText: {
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#164744',
  },
  optionLink: {
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#257D3F',
  },
  primaryButton: {
    backgroundColor: '#164744',
    height: isSmallDevice ? 44 : 48,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 8 : 10,
    marginBottom: getSpacing(20),
    shadowColor: '#8CFF94',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonWithSocial: {
    marginBottom: 0,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: authTheme.primaryButtonText.color,
    fontSize: getFontSize(authTheme.primaryButtonText.fontSize),
    fontWeight: authTheme.primaryButtonText.fontWeight,
  },
  socialSection: {
    marginTop: getSpacing(20),
    marginBottom: getSpacing(8),
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(12),
    marginBottom: getSpacing(20),
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
  },
  orText: {
    fontSize: getFontSize(13),
    fontWeight: '500',
    color: colors.brandGray,
    textTransform: 'lowercase',
    textAlign: 'center',
  },
});
