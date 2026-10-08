import { MyTrainingProgressContent } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.content';
import { renderMyTrainingProgressStates } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.states';
import { useMyTrainingProgressScreen } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen';

export function MyTrainingProgressScreen() {
  const m = useMyTrainingProgressScreen();
  const early = renderMyTrainingProgressStates(m);
  if (early) return early;
  return <MyTrainingProgressContent m={m} />;
}
