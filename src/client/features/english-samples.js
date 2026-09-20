/** Optional starter cards, independent of every user's library. */
export function englishSamples() {
    const entries = [
        [
            'resilient',
            'Able to recover after difficulty.',
            'Personal growth',
            'She remained resilient after the setback.',
        ],
        [
            'sustainable',
            'Able to continue without exhausting resources.',
            'Environment',
            'The team developed a sustainable energy plan.',
        ],
        ['hypothesis', 'An explanation that can be tested.', 'Science', 'The experiment supported the hypothesis.'],
        [
            'make progress',
            'To move closer to a goal.',
            'Everyday expressions',
            'A little practice helps you make progress.',
        ],
        [
            'perspective',
            'A particular way of viewing a situation.',
            'Personal growth',
            'Travel gave her a new perspective.',
        ],
        [
            'innovation',
            'A useful new idea, method, or product.',
            'Technology',
            'Innovation can solve everyday problems.',
        ],
    ];
    const cards = entries.map(([word, meaning, category, example]) => ({
        id: crypto.randomUUID(),
        word,
        meaning,
        category,
        example,
        box: 1,
        cardType: 'vocabulary',
        createdAt: new Date().toISOString(),
        lastReviewed: null,
        reviewCount: 0,
    }));
    cards.push({
        id: crypto.randomUUID(),
        word: 'Small steps lead to lasting progress.',
        meaning: 'Regular, manageable actions produce improvement that lasts.',
        category: 'Personal growth',
        hint: 'Start with “Small steps”.',
        notes: 'Use the simple present tense.',
        cardType: 'sentence',
        box: 1,
        createdAt: new Date().toISOString(),
        lastReviewed: null,
        reviewCount: 0,
    });
    return cards;
}
