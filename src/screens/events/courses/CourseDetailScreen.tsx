import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { getCourseById } from '@/constants/courses';
import { useDetailBack } from '@/hooks/useDetailBack';
import {
  CourseDetailContent,
  CourseDetailFooter,
  CourseDetailHero,
  getCourseFooterLabel,
} from '@/screens/events/courses/CourseDetailScreenParts';
import { styles } from '@/screens/events/courses/CourseDetailScreen.styles';

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const course = id ? getCourseById(id) : undefined;

  if (!course) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="course"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const footerLabel = getCourseFooterLabel(course);

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
        >
          <CourseDetailHero course={course} onBack={goBack} />
          <CourseDetailContent course={course} />
        </ScrollView>

        <CourseDetailFooter
          footerLabel={footerLabel}
          paddingBottom={insets.bottom + 10}
          onEnroll={() => router.replace('/(main)/(tabs)/events/appointments')}
        />
      </View>
    </View>
  );
}
