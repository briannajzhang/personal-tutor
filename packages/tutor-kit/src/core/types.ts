export type WidgetKind = "blurb" | (string & {});

export interface TutorConfig {
  title?: string;
  textbooksDir?: string;
  dataDir?: string;
}

export interface BaseWidget<K extends WidgetKind = WidgetKind, Props = unknown> {
  kind: K;
  id: string;
  title: string;
  props: Props;
}

export interface BlurbProps {
  body: string;
}

export type BlurbWidget = BaseWidget<"blurb", BlurbProps>;

export type TutorWidget = BlurbWidget | BaseWidget;

export interface Subsection {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  widgets: TutorWidget[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  widgets: TutorWidget[];
  subsections: Subsection[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  sections: Section[];
}

export interface Textbook {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  chapters: Chapter[];
}

export interface TextbookModule {
  default?: Textbook;
}

export interface ValidationIssue {
  file?: string;
  path?: string;
  message: string;
}

export interface LoadedChapter {
  file: string;
  textbookId: string;
  textbookTitle: string;
  chapter: Chapter;
}

export interface LoadedTextbook {
  file: string;
  textbook: Textbook;
}
