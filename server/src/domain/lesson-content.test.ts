import { describe, expect, it } from 'vitest';
import { normalizeLessonContent } from './lesson-content.js';

describe('normalizeLessonContent', () => {
  it('stores TipTap docs as JSON', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };
    expect(normalizeLessonContent(JSON.stringify(doc))).toBe(
      JSON.stringify(doc),
    );
  });

  it('keeps legacy plain text', () => {
    expect(normalizeLessonContent('  plain notes  ')).toBe('plain notes');
  });

  it('treats empty as null', () => {
    expect(normalizeLessonContent('   ')).toBeNull();
    expect(normalizeLessonContent(null)).toBeNull();
  });
});
