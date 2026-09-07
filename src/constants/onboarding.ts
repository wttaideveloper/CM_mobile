export type OnboardingIconName = 'building' | 'package' | 'users';

export type OnboardingSlideData = {
  id: string;
  imageUri: string;
  icon: OnboardingIconName;
  title: string;
  body: string;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: '1',
    imageUri:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=375&h=320&fit=crop',
    icon: 'building',
    title: 'Manage Your Enterprise',
    body:
      'Complete tools to manage your wellness business — products, services, events, and training programs in one place.',
  },
  {
    id: '2',
    imageUri:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=375&h=320&fit=crop',
    icon: 'package',
    title: 'Showcase Products & Services',
    body:
      'List your offerings to a growing community of health-conscious customers ready to discover what you provide.',
  },
  {
    id: '3',
    imageUri:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=375&h=320&fit=crop',
    icon: 'users',
    title: 'Connect With Your Community',
    body:
      'Host events, run training programs, and build meaningful relationships with your wellness community.',
  },
];

export const ONBOARDING_IMAGE_HEIGHT = 320;
