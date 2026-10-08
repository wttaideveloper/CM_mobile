import { Pressable, Text, View } from 'react-native';

import {
  LessonTypeIcon,
} from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.parts';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';
import type { MyTrainingProgressModel } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen';
import {
  downloadTrainingToLibrary,
  openTrainingFile,
} from '@/utils/downloadTrainingFile';
import {
  asPlainText,
  clampDisplayText,
} from '@/utils/trainingLessonMedia';

export function MyTrainingProgressNotes({
  m,
}: {
  m: MyTrainingProgressModel;
}) {
  const {
    path,
    trainingId,
    noteSizeById,
    openingNoteId,
    downloadingNoteId,
    setOpeningNoteId,
    setDownloadingNoteId,
  } = m as any;

  if (!path.courseNotes?.length) return null;

  return (
    <View style={styles.notesSection}>
      <Text style={styles.notesLabel}>Notes</Text>
      <Text style={styles.notesHelp}>
        Course notes and documents · preview or download
      </Text>
      <View style={styles.notesCard}>
        {path.courseNotes.map((note: any, index: number) => {
          const sizeLabel = note.sizeLabel || noteSizeById[note.id] || '';
          const kindLabel =
            note.kind === 'notes_pdf'
              ? 'Course notes · PDF'
              : note.kind === 'note'
                ? 'Note · PDF'
                : 'Document · PDF';
          const meta = sizeLabel ? `${kindLabel} · ${sizeLabel}` : kindLabel;
          const busy =
            openingNoteId === note.id || downloadingNoteId === note.id;

          return (
            <View
              key={note.id}
              style={[
                styles.notesRow,
                index < path.courseNotes.length - 1 && styles.notesRowBorder,
              ]}
            >
              <View style={styles.notesIconWrap}>
                <LessonTypeIcon kind="document" color="#b42318" />
              </View>
              <View style={styles.notesCopy}>
                <Text style={styles.notesTitle} numberOfLines={2}>
                  {clampDisplayText(asPlainText(note.title, 'Note'), 120)}
                </Text>
                <Text style={styles.notesMeta}>{meta}</Text>
              </View>
              <View style={styles.notesActions}>
                <Pressable
                  disabled={busy}
                  onPress={() => {
                    setOpeningNoteId(note.id);
                    void openTrainingFile({
                      url: asPlainText(note.url),
                      suggestedName: `${asPlainText(note.title, 'note')}.pdf`,
                    }).finally(() => setOpeningNoteId(null));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Preview ${asPlainText(note.title, 'note')}`}
                >
                  <Text
                    style={[
                      styles.notesActionText,
                      busy && styles.notesActionTextDisabled,
                    ]}
                  >
                    {openingNoteId === note.id ? 'Opening…' : 'Preview'}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={() => {
                    if (downloadingNoteId) return;
                    setDownloadingNoteId(note.id);
                    void downloadTrainingToLibrary({
                      trainingId,
                      trainingTitle: path.title,
                      lessonId: note.id,
                      lessonTitle: asPlainText(note.title, 'Note'),
                      kind: 'document',
                      url: asPlainText(note.url),
                      suggestedName: `${asPlainText(note.title, 'note')}.pdf`,
                    }).finally(() => setDownloadingNoteId(null));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${asPlainText(note.title, 'note')}`}
                >
                  <Text
                    style={[
                      styles.notesActionText,
                      styles.notesDownloadText,
                      busy && styles.notesActionTextDisabled,
                    ]}
                  >
                    {downloadingNoteId === note.id ? 'Saving…' : 'Download'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
