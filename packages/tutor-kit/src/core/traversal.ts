import type { Chapter, Section, Subsection, Textbook, TutorBlock } from "./types.js";

export function collectSectionBlocks(section: Section): TutorBlock[] {
  return [
    ...section.blocks,
    ...section.subsections.flatMap((subsection) => subsection.blocks)
  ];
}

export function collectChapterBlocks(chapter: Chapter): TutorBlock[] {
  return chapter.sections.flatMap(collectSectionBlocks);
}

export function collectTextbookBlocks(textbook: Textbook): TutorBlock[] {
  return textbook.chapters.flatMap(collectChapterBlocks);
}

export function summarizeSubsection(subsection: Subsection): { blocks: number } {
  return { blocks: subsection.blocks.length };
}

export function summarizeSection(section: Section): { subsections: number; blocks: number } {
  return {
    subsections: section.subsections.length,
    blocks: collectSectionBlocks(section).length
  };
}

export function summarizeChapter(chapter: Chapter): { sections: number; subsections: number; blocks: number } {
  return chapter.sections.reduce(
    (summary, section) => {
      const sectionSummary = summarizeSection(section);
      summary.subsections += sectionSummary.subsections;
      summary.blocks += sectionSummary.blocks;
      return summary;
    },
    { sections: chapter.sections.length, subsections: 0, blocks: 0 }
  );
}

export function summarizeTextbook(textbook: Textbook): {
  chapters: number;
  sections: number;
  subsections: number;
  blocks: number;
} {
  return textbook.chapters.reduce(
    (summary, chapter) => {
      const chapterSummary = summarizeChapter(chapter);
      summary.sections += chapterSummary.sections;
      summary.subsections += chapterSummary.subsections;
      summary.blocks += chapterSummary.blocks;
      return summary;
    },
    { chapters: textbook.chapters.length, sections: 0, subsections: 0, blocks: 0 }
  );
}
