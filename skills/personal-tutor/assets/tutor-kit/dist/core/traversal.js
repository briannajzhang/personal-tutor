export function collectSectionBlocks(section) {
    return [
        ...section.blocks,
        ...section.subsections.flatMap((subsection) => subsection.blocks)
    ];
}
export function collectChapterBlocks(chapter) {
    return chapter.sections.flatMap(collectSectionBlocks);
}
export function collectTextbookBlocks(textbook) {
    return textbook.chapters.flatMap(collectChapterBlocks);
}
export function summarizeSubsection(subsection) {
    return { blocks: subsection.blocks.length };
}
export function summarizeSection(section) {
    return {
        subsections: section.subsections.length,
        blocks: collectSectionBlocks(section).length
    };
}
export function summarizeChapter(chapter) {
    return chapter.sections.reduce((summary, section) => {
        const sectionSummary = summarizeSection(section);
        summary.subsections += sectionSummary.subsections;
        summary.blocks += sectionSummary.blocks;
        return summary;
    }, { sections: chapter.sections.length, subsections: 0, blocks: 0 });
}
export function summarizeTextbook(textbook) {
    return textbook.chapters.reduce((summary, chapter) => {
        const chapterSummary = summarizeChapter(chapter);
        summary.sections += chapterSummary.sections;
        summary.subsections += chapterSummary.subsections;
        summary.blocks += chapterSummary.blocks;
        return summary;
    }, { chapters: textbook.chapters.length, sections: 0, subsections: 0, blocks: 0 });
}
