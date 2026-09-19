/* ============================================
   LEITNER BOX - Application Logic v3
   Categories + Manual Examples + American English
   ============================================ */

(function () {
    'use strict';

    // ---- Constants ----
    const STORAGE_KEY = 'leitner_data';
    const THEME_KEY = 'leitner_theme';
    const REVIEW_MODE_KEY = 'leitner_review_mode';
    const STORAGE_BACKUP_PREFIX = 'leitner_data_backup_';
    const MANUAL_SHADOW_BACKUP_KEY = 'leitner_manual_cards_shadow_backup_v1';
    const OBSOLETE_AUTO_RECOVERY_KEYS = ['leitner_review_progress_shadow_backup_v1'];
    const RETURNED_MANUAL_CARDS_CLEANUP_KEY = 'leitner_returned_manual_cards_cleanup_20260804_v1';
    const RETURNED_MANUAL_CARDS_FROM_BAD_RESTORE = [
        ['Abstract Concepts', 'algorithm'],
        ['Abstract Concepts', 'close enough'],
        ['Abstract Concepts', 'complex problems'],
        ['Academic Phrases', 'a remarkable engineering feat'],
        ['Academic Phrases', 'does not necessarily indicate that'],
        ['Academic Phrases', 'once the process is complete'],
        ['Academic Phrases', 'One hypothesis is that'],
        ['Academic Phrases', 'ongoing environmental changes'],
        ['Academic Phrases', 'quality of life'],
        ['Academic Phrases', 'reveal complex aspects of'],
        ['Academic Phrases', 'suggest a broader hypothesis'],
        ['Academic Phrases', 'the growing awareness of'],
        ['Academic Phrases', 'the importance of hygiene'],
        ['Academic Phrases', 'the introduction of sanitation practices'],
        ['Academic Phrases', 'the long-term success of these techniques'],
        ['Academic Phrases', 'the urgency of finding effective solutions'],
        ['Academic Phrases', 'to protect these vital ecosystems'],
        ['Academic Phrases', 'Various theories have been proposed'],
        ['Animals & Environment', 'vegetation'],
        ['Anthropology', 'art form'],
        ['Anthropology', 'colder climates'],
        ['Anthropology', 'contribute'],
        ['Anthropology', 'tubers'],
        ['Art History & Fine Arts', 'civic building'],
        ['Art History & Fine Arts', 'confines'],
        ['Art History & Fine Arts', 'devotional image'],
        ['Business & Economics', 'logical analysis'],
        ['Business & Economics', 'merge'],
        ['Business & Economics', 'milestone'],
        ['Business & Economics', 'social factor'],
        ['Course Content & Assignments', 'credit'],
        ['Course Content & Assignments', 'paper'],
        ['Drama & Theater', 'clear artistic purpose'],
        ['Drama & Theater', 'emotional immersion'],
        ['Drama & Theater', 'illusion'],
        ['Environmental Science', 'boost'],
        ['Environmental Science', 'devise'],
        ['Environmental Science', 'rising sea temperatures'],
        ['Environmental Science', 'solar radiation management'],
        ['Environmental Science', 'stratosphere'],
        ['Events & Activities', 'do justice to'],
        ['Events & Activities', 'fostering inclusive collaboration'],
        ['Events & Activities', 'navigating group dynamics'],
        ['Events & Activities', 'pottery'],
        ['Events & Activities', 'soak'],
        ['Events & Activities', 'the ins and outs'],
        ['Events & Activities', 'what’s in store'],
        ['Geology', 'infrasonic tone'],
        ['Geology', 'label'],
        ['Geology', 'seismic'],
        ['History', 'infectious diseases'],
        ['Information & Advising', 'streamline'],
        ['Job & Career', 'application'],
        ['Job & Career', 'due to'],
        ['Lifestyle & Experience', 'maintain'],
        ['Lifestyle & Experience', 'wouldn\'t miss it for the world'],
        ['Marine Biology', 'underwater ecosystem'],
        ['Painting & Visual Arts', 'create paints'],
        ['Painting & Visual Arts', 'pigment'],
        ['Painting & Visual Arts', 'Surrealist'],
        ['Philosophy', 'address questions about'],
        ['Philosophy', 'an approach to'],
        ['Philosophy', 'intersect with'],
        ['Philosophy', 'perceive something as...'],
        ['Psychology', 'child development milestones'],
        ['Psychology', 'social influence'],
        ['Study Skills', 'academic success'],
        ['Study Skills', 'social skills'],
        ['Technology', 'patient confidentiality']
    ];
    const DAILY_BACKUP_KEY = 'leitner_last_daily_backup_at';
    const MAX_STORAGE_BACKUPS = 3;
    const DAILY_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
    const REVIEW_AUTO_PRONUNCIATION_DELAY_MS = 0;
    const GOOGLE_TRANSLATE_TTS_BASE_URL = 'https://translate.google.com/translate_tts';
    const GOOGLE_TRANSLATE_TTS_LANG = 'en-US';
    const GOOGLE_TRANSLATE_TTS_MAX_CHARS = 180;
    const COMBINED_REVIEW_BATCH_SIZE_KEY = 'leitner_combined_review_batch_size';
    const TELEGRAM_VOCAB_REMOVED_KEY = 'leitner_telegram_vocab_removed_v1';
    const VOCABHUB_CATEGORY = 'VocabHub Daily';
    const FIXED_EXPRESSIONS_CATEGORY = 'Fixed Expressions';
    const ACADEMIC_PHRASES_CATEGORY = 'Academic Phrases';
    const COLLOCATION_INTERMEDIATE_CATEGORY = 'Collocation Intermediate';
    const FIXED_EXPRESSIONS_MD_URL = 'fixed.md';
    const TOPIC_MARKDOWN_SOURCES = [
        { file: 'Technology.md', category: 'Technology' },
        { file: 'Meteorology.md', category: 'Meteorology' },
        { file: 'History.md', category: 'History' },
        { file: 'Geology.md', category: 'Geology' },
        { file: 'Business & Economy.md', category: 'Business & Economics' },
        { file: 'Animals Behavior.md', category: 'Animal Behavior' },
        { file: 'Accommodation & Food Service.md', category: 'Accommodation & Food Service' }
    ];
    const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    const ITEMS_PER_PAGE = 12;
    const BOX_INTERVALS = { 1: 1, 2: 2, 3: 5, 4: 14, 5: 30 };
    const PERSIAN_BOX_NAMES = ['', 'جعبه ۱', 'جعبه ۲', 'جعبه ۳', 'جعبه ۴', 'جعبه ۵'];
    const MAX_TYPING_HINTS = 2;
    const DEFAULT_COMBINED_REVIEW_BATCH_SIZE = 10;
    const MIN_COMBINED_REVIEW_BATCH_SIZE = 1;
    const MAX_COMBINED_REVIEW_BATCH_SIZE = 50;
    const REVIEW_MODES = ['flashcard', 'typing', 'combined'];
    const CARD_TYPE_VOCABULARY = 'vocabulary';
    const CARD_TYPE_SENTENCE = 'sentence';
    const FEMALE_ENGLISH_VOICE_KEYWORDS = [
        'zira', 'samantha', 'jenny', 'aria', 'susan', 'karen', 'victoria',
        'allison', 'ava', 'joanna', 'salli', 'kendra', 'kimberly', 'ivy',
        'emma', 'olivia', 'moira', 'tessa', 'fiona', 'serena', 'female', 'woman'
    ];
    const MALE_ENGLISH_VOICE_KEYWORDS = [
        'david', 'mark', 'alex', 'daniel', 'george', 'fred', 'tom', 'male', 'man'
    ];

    // ---- TOEFL Categories (cleaned & deduplicated) ----
    const CATEGORIES = [
        'General',
        FIXED_EXPRESSIONS_CATEGORY,
        ACADEMIC_PHRASES_CATEGORY,
        COLLOCATION_INTERMEDIATE_CATEGORY,
        'Abstract Concepts',
        'Accommodation & Food Service',
        'Agriculture',
        'Animal Behavior',
        'Animals & Environment',
        'Anthropology',
        'Archaeology',
        'Architecture & Interior Design',
        'Art History & Fine Arts',
        'Astronomy',
        'Botany',
        'Business & Economics',
        'Chemistry',
        'Clubs & Campus Activities',
        'Course Content & Assignments',
        'Drama & Theater',
        'Education & Teaching',
        'Environment & Ecology',
        'Environmental Science',
        'Events & Activities',
        'Geography',
        'Geology',
        'History',
        'Humanities',
        'Information & Advising',
        'Infrastructure & Projects',
        'Job & Career',
        'Library & Bookstore',
        'Lifestyle & Experience',
        'Literature',
        'Logistics & Scheduling',
        'Marine Biology',
        'Media & Communication',
        'Meteorology',
        'Music',
        'Objects & Features',
        'Painting & Visual Arts',
        'People & Society',
        'Philosophy',
        'Psychology',
        'Situations & Change',
        'Sociology',
        'Spare Time & Hobbies',
        'Study Skills',
        'Technology',
        'Zoology',
        'Others'
    ];

    const CATEGORY_ALIASES = {
        'abstract': 'Abstract Concepts',
        'accommodation': 'Accommodation & Food Service',
        'accommodation & food service': 'Accommodation & Food Service',
        'food service & accommodation': 'Accommodation & Food Service',
        'animal & environment': 'Animals & Environment',
        'animals behavior': 'Animal Behavior',
        'animal behavior': 'Animal Behavior',
        'approach': 'Abstract Concepts',
        'architecture': 'Architecture & Interior Design',
        'interior design': 'Architecture & Interior Design',
        'art history': 'Art History & Fine Arts',
        'fine arts': 'Art History & Fine Arts',
        'assignment & paper': 'Course Content & Assignments',
        'assignment deadline extension': 'Course Content & Assignments',
        'association activity': 'Clubs & Campus Activities',
        'business & economy': 'Business & Economics',
        'business & economics': 'Business & Economics',
        'club & activity': 'Clubs & Campus Activities',
        'course & study': 'Course Content & Assignments',
        'course content': 'Course Content & Assignments',
        'development': 'Situations & Change',
        'drama': 'Drama & Theater',
        'education': 'Education & Teaching',
        'teaching activities': 'Education & Teaching',
        'teaching & instruction': 'Education & Teaching',
        'environmental & ecology': 'Environment & Ecology',
        'event & activity': 'Events & Activities',
        'experience': 'Lifestyle & Experience',
        'feature': 'Objects & Features',
        'infrastructure': 'Infrastructure & Projects',
        'infrastructure projects': 'Infrastructure & Projects',
        'job': 'Job & Career',
        'lifestyle': 'Lifestyle & Experience',
        'logistics': 'Logistics & Scheduling',
        'logistics service': 'Logistics & Scheduling',
        'media': 'Media & Communication',
        'object': 'Objects & Features',
        'painting': 'Painting & Visual Arts',
        'person': 'People & Society',
        'project': 'Infrastructure & Projects',
        'schedule & planning': 'Logistics & Scheduling',
        'schedule conflicts': 'Logistics & Scheduling',
        'situation': 'Situations & Change',
        'change': 'Situations & Change',
        'spare time activity': 'Spare Time & Hobbies',
        'study': 'Study Skills',
        'general': 'General',
        'vocabhub': VOCABHUB_CATEGORY,
        'vocabhub daily': VOCABHUB_CATEGORY,
        'vocabulary hub': VOCABHUB_CATEGORY,
        'fixed expressions': FIXED_EXPRESSIONS_CATEGORY,
        'fixed expression': FIXED_EXPRESSIONS_CATEGORY,
        'expressions': FIXED_EXPRESSIONS_CATEGORY,
        'academic phrases': ACADEMIC_PHRASES_CATEGORY,
        'academic phrase': ACADEMIC_PHRASES_CATEGORY,
        'collocation intermediate': COLLOCATION_INTERMEDIATE_CATEGORY,
        'collocations intermediate': COLLOCATION_INTERMEDIATE_CATEGORY,
        'intermediate collocations': COLLOCATION_INTERMEDIATE_CATEGORY,
        'others': 'Others'
    };

    const CATEGORY_EXAMPLE_CONTEXTS = {
        'General': 'an academic passage',
        [VOCABHUB_CATEGORY]: 'a daily TOEFL vocabulary lesson',
        [FIXED_EXPRESSIONS_CATEGORY]: 'a TOEFL reading passage',
        [ACADEMIC_PHRASES_CATEGORY]: 'a TOEFL academic passage',
        [COLLOCATION_INTERMEDIATE_CATEGORY]: 'an intermediate English collocations lesson',
        'Abstract Concepts': 'an abstract idea',
        'Accommodation & Food Service': 'campus housing and dining',
        'Agriculture': 'modern farming',
        'Animal Behavior': 'how animals respond to their environment',
        'Animals & Environment': 'wildlife and natural habitats',
        'Anthropology': 'human culture',
        'Archaeology': 'an ancient settlement',
        'Architecture & Interior Design': 'the design of a public building',
        'Art History & Fine Arts': 'a museum exhibition',
        'Astronomy': 'the formation of planets',
        'Botany': 'plant growth',
        'Business & Economics': 'market behavior',
        'Chemistry': 'a laboratory experiment',
        'Clubs & Campus Activities': 'a student organization',
        'Course Content & Assignments': 'a class assignment',
        'Drama & Theater': 'a stage performance',
        'Education & Teaching': 'classroom learning',
        'Environment & Ecology': 'an ecosystem',
        'Environmental Science': 'climate research',
        'Events & Activities': 'a campus event',
        'Geography': 'regional landscapes',
        'Geology': 'rock formation',
        'History': 'a historical change',
        'Humanities': 'a humanities discussion',
        'Information & Advising': 'academic advising',
        'Infrastructure & Projects': 'a construction project',
        'Job & Career': 'career planning',
        'Library & Bookstore': 'library research',
        'Lifestyle & Experience': 'daily life',
        'Literature': 'a literary passage',
        'Logistics & Scheduling': 'a schedule change',
        'Marine Biology': 'ocean life',
        'Media & Communication': 'public communication',
        'Meteorology': 'weather patterns',
        'Music': 'a musical performance',
        'Objects & Features': 'the features of an object',
        'Painting & Visual Arts': 'a visual artwork',
        'People & Society': 'social behavior',
        'Philosophy': 'an ethical question',
        'Psychology': 'human behavior',
        'Situations & Change': 'a changing situation',
        'Sociology': 'a social group',
        'Spare Time & Hobbies': 'free-time activities',
        'Study Skills': 'effective studying',
        'Technology': 'new technology',
        'Zoology': 'animal classification',
        'Others': 'a TOEFL-style lecture'
    };

    const TOEFL_SAMPLE_WORDS_BY_CATEGORY = {
        'General': [
            ['analyze', 'تحلیل کردن', 'verb'],
            ['context', 'زمینه / بافت', 'noun']
        ],
        'Abstract Concepts': [
            ['hypothesis', 'فرضیه', 'noun'],
            ['ambiguity', 'ابهام', 'noun']
        ],
        'Accommodation & Food Service': [
            ['dormitory', 'خوابگاه', 'noun'],
            ['reservation', 'رزرو', 'noun']
        ],
        'Agriculture': [
            ['irrigation', 'آبیاری', 'noun'],
            ['crop', 'محصول کشاورزی', 'noun']
        ],
        'Animal Behavior': [
            ['instinct', 'غریزه', 'noun'],
            ['forage', 'دنبال غذا گشتن', 'verb']
        ],
        'Animals & Environment': [
            ['habitat', 'زیستگاه', 'noun'],
            ['predator', 'شکارچی', 'noun']
        ],
        'Anthropology': [
            ['kinship', 'خویشاوندی', 'noun'],
            ['ritual', 'آیین / مراسم', 'noun']
        ],
        'Archaeology': [
            ['artifact', 'شیء باستانی', 'noun'],
            ['excavation', 'حفاری', 'noun']
        ],
        'Architecture & Interior Design': [
            ['facade', 'نمای ساختمان', 'noun'],
            ['layout', 'چیدمان / طرح', 'noun']
        ],
        'Art History & Fine Arts': [
            ['Renaissance', 'رنسانس', 'noun'],
            ['aesthetic', 'زیباشناختی', 'adjective']
        ],
        'Astronomy': [
            ['orbit', 'مدار', 'noun'],
            ['galaxy', 'کهکشان', 'noun']
        ],
        'Botany': [
            ['germinate', 'جوانه زدن', 'verb'],
            ['photosynthesis', 'فتوسنتز', 'noun']
        ],
        'Business & Economics': [
            ['revenue', 'درآمد', 'noun'],
            ['inflation', 'تورم', 'noun']
        ],
        'Chemistry': [
            ['compound', 'ترکیب شیمیایی', 'noun'],
            ['catalyst', 'کاتالیزور', 'noun']
        ],
        'Clubs & Campus Activities': [
            ['membership', 'عضویت', 'noun'],
            ['volunteer', 'داوطلب شدن', 'verb']
        ],
        'Course Content & Assignments': [
            ['thesis', 'تز / نظر اصلی', 'noun'],
            ['draft', 'پیش‌نویس', 'noun']
        ],
        'Drama & Theater': [
            ['rehearsal', 'تمرین نمایش', 'noun'],
            ['dialogue', 'گفت‌وگو', 'noun']
        ],
        'Education & Teaching': [
            ['curriculum', 'برنامه درسی', 'noun'],
            ['assessment', 'ارزیابی', 'noun']
        ],
        'Environment & Ecology': [
            ['biodiversity', 'تنوع زیستی', 'noun'],
            ['conservation', 'حفاظت', 'noun']
        ],
        'Environmental Science': [
            ['pollutant', 'آلاینده', 'noun'],
            ['sustainable', 'پایدار', 'adjective']
        ],
        'Events & Activities': [
            ['venue', 'محل برگزاری', 'noun'],
            ['workshop', 'کارگاه آموزشی', 'noun']
        ],
        'Geography': [
            ['terrain', 'ناهمواری / زمین', 'noun'],
            ['peninsula', 'شبه‌جزیره', 'noun']
        ],
        'Geology': [
            ['sediment', 'رسوب', 'noun'],
            ['erosion', 'فرسایش', 'noun']
        ],
        'History': [
            ['dynasty', 'دودمان', 'noun'],
            ['revolution', 'انقلاب', 'noun']
        ],
        'Humanities': [
            ['ethics', 'اخلاقیات', 'noun'],
            ['interpretation', 'تفسیر', 'noun']
        ],
        'Information & Advising': [
            ['appointment', 'قرار ملاقات', 'noun'],
            ['requirement', 'الزام / شرط', 'noun']
        ],
        'Infrastructure & Projects': [
            ['blueprint', 'نقشه فنی', 'noun'],
            ['renovate', 'بازسازی کردن', 'verb']
        ],
        'Job & Career': [
            ['internship', 'کارآموزی', 'noun'],
            ['resume', 'رزومه', 'noun']
        ],
        'Library & Bookstore': [
            ['catalogue', 'فهرست', 'noun'],
            ['reference', 'مرجع', 'noun']
        ],
        'Lifestyle & Experience': [
            ['routine', 'روال روزمره', 'noun'],
            ['adapt', 'سازگار شدن', 'verb']
        ],
        'Literature': [
            ['narrative', 'روایت', 'noun'],
            ['metaphor', 'استعاره', 'noun']
        ],
        'Logistics & Scheduling': [
            ['postpone', 'به تعویق انداختن', 'verb'],
            ['itinerary', 'برنامه سفر', 'noun']
        ],
        'Marine Biology': [
            ['plankton', 'پلانکتون', 'noun'],
            ['coral', 'مرجان', 'noun']
        ],
        'Media & Communication': [
            ['broadcast', 'پخش کردن', 'verb'],
            ['persuade', 'متقاعد کردن', 'verb']
        ],
        'Meteorology': [
            ['forecast', 'پیش‌بینی هوا', 'noun'],
            ['humidity', 'رطوبت', 'noun']
        ],
        'Music': [
            ['melody', 'ملودی', 'noun'],
            ['rhythm', 'ریتم', 'noun']
        ],
        'Objects & Features': [
            ['attribute', 'ویژگی', 'noun'],
            ['mechanism', 'سازوکار', 'noun']
        ],
        'Painting & Visual Arts': [
            ['portrait', 'پرتره', 'noun'],
            ['texture', 'بافت', 'noun']
        ],
        'People & Society': [
            ['community', 'جامعه / اجتماع', 'noun'],
            ['identity', 'هویت', 'noun']
        ],
        'Philosophy': [
            ['logic', 'منطق', 'noun'],
            ['virtue', 'فضیلت', 'noun']
        ],
        'Psychology': [
            ['cognition', 'شناخت', 'noun'],
            ['motivation', 'انگیزه', 'noun']
        ],
        'Situations & Change': [
            ['transition', 'گذار / تغییر مرحله', 'noun'],
            ['consequence', 'پیامد', 'noun']
        ],
        'Sociology': [
            ['hierarchy', 'سلسله‌مراتب', 'noun'],
            ['norm', 'هنجار', 'noun']
        ],
        'Spare Time & Hobbies': [
            ['leisure', 'اوقات فراغت', 'noun'],
            ['recreation', 'تفریح', 'noun']
        ],
        'Study Skills': [
            ['summarize', 'خلاصه کردن', 'verb'],
            ['review', 'مرور کردن', 'verb']
        ],
        'Technology': [
            ['innovation', 'نوآوری', 'noun'],
            ['device', 'دستگاه', 'noun']
        ],
        'Zoology': [
            ['mammal', 'پستاندار', 'noun'],
            ['species', 'گونه', 'noun']
        ],
        'Others': [
            ['relevant', 'مرتبط', 'adjective'],
            ['unfamiliar', 'ناآشنا', 'adjective']
        ]
    };

    // ---- State ----
    let appData = {
        cards: [],
        stats: { totalReviews: 0, correctAnswers: 0, wrongAnswers: 0, streak: 0, lastReviewDate: null, history: [] },
        customCategories: [],
        deletedImportedSourceIds: []
    };
    let reviewState = { boxNumber: null, category: null, mode: 'flashcard', cards: [], steps: [], combinedResults: {}, currentIndex: 0, correct: 0, wrong: 0, isFlipped: false, typedAnswered: false, typedCorrect: false, typedMistakes: 0, sentenceAnswered: false, sentenceCorrect: false };
    let currentReviewMode = 'flashcard';
    let combinedReviewBatchSize = DEFAULT_COMBINED_REVIEW_BATCH_SIZE;
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentSearch = '';
    let currentDueOnly = false;
    let currentPage = 1;
    let deleteCardId = null;
    let pendingDeleteCardIds = [];
    const selectedCardIds = new Set();
    let fetchAbort = null;
    let lastFetchResult = null; // cache latest API result for pronunciation
    let lastAddCardCategory = 'General';
    let reviewAutoSpeakTimer = null;
    let lastPersistedDataUpdatedAt = '';
    let pendingReturnedManualCardsCleanup = null;
    let activeCardFormType = CARD_TYPE_VOCABULARY;
    let activePronunciationAudio = null;
    let customExampleLookup = null;

    // ---- Helpers ----
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function toPersianNumber(num) {
        const pd = '۰۱۲۳۴۵۶۷۸۹';
        return num.toString().replace(/\d/g, d => pd[d]);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try { return new Date(dateStr).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch { return new Date(dateStr).toLocaleDateString(); }
    }

    function normalizeBoxNumber(box) {
        return Math.min(5, Math.max(1, Number(box) || 1));
    }

    function isDue(card) {
        if (!card.lastReviewed) return true;
        const days = Math.floor((new Date() - new Date(card.lastReviewed)) / 86400000);
        return days >= BOX_INTERVALS[normalizeBoxNumber(card.box)];
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function normalizeTypedAnswer(value) {
        return (value || '')
            .trim()
            .toLowerCase()
            .replace(/[’`]/g, "'")
            .replace(/[-–—]/g, ' ')
            .replace(/[^a-z0-9'\s]/g, '')
            .replace(/\s+/g, ' ');
    }

    function normalizeSentenceAnswer(value) {
        return (value || '')
            .trim()
            .toLowerCase()
            .replace(/[“”]/g, '"')
            .replace(/[’`]/g, "'")
            .replace(/[-–—]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\s+([,.;:!?])/g, '$1')
            .replace(/([,.;:!?])([a-z0-9])/g, '$1 $2')
            .replace(/[.!?]+$/g, '')
            .trim();
    }

    function getCardType(card) {
        return card && card.cardType === CARD_TYPE_SENTENCE ? CARD_TYPE_SENTENCE : CARD_TYPE_VOCABULARY;
    }

    function isSentenceCard(card) {
        return getCardType(card) === CARD_TYPE_SENTENCE;
    }

    function createSpellingHint(word, revealedLetters) {
        let remaining = revealedLetters;
        return Array.from(word).map(char => {
            if (!/[a-zA-Z]/.test(char)) return char;
            if (remaining > 0) {
                remaining--;
                return char;
            }
            return '_';
        }).join(' ');
    }

    function findKnownCategory(category) {
        const raw = (category || '').trim();
        if (!raw) return '';
        const key = raw.toLowerCase();
        const alias = CATEGORY_ALIASES[key];
        if (alias) return alias;
        const exact = CATEGORIES.find(cat => cat.toLowerCase() === key);
        if (exact) return exact;
        const custom = (appData.customCategories || []).find(cat => String(cat || '').trim().toLowerCase() === key);
        return custom ? String(custom).trim() : '';
    }

    function isBuiltInCategory(category) {
        const raw = (category || '').trim();
        if (!raw) return false;
        return CATEGORIES.some(cat => cat.toLowerCase() === raw.toLowerCase());
    }

    function hasCustomCategory(category) {
        const raw = (category || '').trim().toLowerCase();
        if (!raw) return false;
        return (appData.customCategories || []).some(cat => String(cat || '').trim().toLowerCase() === raw);
    }

    function normalizeCategory(category) {
        const raw = (category || '').trim();
        if (!raw) return 'General';
        return findKnownCategory(raw) || raw;
    }

    function ensureCustomCategory(category) {
        const normalized = normalizeCategory(category);
        if (!normalized || isBuiltInCategory(normalized) || hasCustomCategory(normalized)) return normalized || 'General';
        if (!appData.customCategories) appData.customCategories = [];
        appData.customCategories.push(normalized);
        return normalized;
    }

    function syncCustomCategoriesFromCards() {
        if (!appData.customCategories) appData.customCategories = [];
        const before = appData.customCategories.length;
        appData.cards.forEach(card => {
            if (!card || !card.category) return;
            ensureCustomCategory(card.category);
        });
        return appData.customCategories.length !== before;
    }

    function getExampleContext(category) {
        return CATEGORY_EXAMPLE_CONTEXTS[normalizeCategory(category)] || CATEGORY_EXAMPLE_CONTEXTS.General;
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    const POLISHED_EXAMPLE_OVERRIDES = {
        'academic phrases::various theories have been proposed': 'Various theories have been proposed, but the new evidence supports a gradual change rather than a sudden event.',
        'academic phrases::one hypothesis is that': 'One hypothesis is that early exposure to music improves a child\'s ability to recognize patterns.',
        'academic phrases::does not necessarily indicate that': 'A high test score does not necessarily indicate that a student can apply the concept in real situations.',
        'academic phrases::the urgency of finding effective solutions': 'The report emphasizes the urgency of finding effective solutions before the reef loses more of its coral cover.',
        'academic phrases::to protect these vital ecosystems': 'Researchers are testing new restoration methods to protect these vital ecosystems from rising ocean temperatures.',
        'academic phrases::the long-term success of these techniques': 'The long-term success of these techniques depends on careful monitoring after the initial trial ends.',
        'academic phrases::ongoing environmental changes': 'Ongoing environmental changes have forced scientists to revise their earlier predictions.',
        'academic phrases::the introduction of sanitation practices': 'The introduction of sanitation practices reduced the spread of disease in crowded urban neighborhoods.',
        'academic phrases::the growing awareness of': 'The growing awareness of air pollution led city officials to redesign the transport system.',
        'academic phrases::the importance of hygiene': 'Public campaigns stressed the importance of hygiene in preventing outbreaks of infectious disease.',
        'academic phrases::quality of life': 'Access to clean water can greatly improve the quality of life in rural communities.',
        'academic phrases::a remarkable engineering feat': 'Building a canal through the mountain was considered a remarkable engineering feat at the time.',
        'academic phrases::suggest a broader hypothesis': 'These small differences suggest a broader hypothesis about how the species adapted to colder climates.',
        'academic phrases::reveal complex aspects of': 'The diaries reveal complex aspects of daily life that official records often ignore.',
        'academic phrases::once the process is complete': 'Once the process is complete, the samples are stored in sealed containers for later analysis.',
        'fixed expressions::effective immediately': 'The new safety rule is effective immediately, so everyone entering the lab must wear protective glasses today.',
        'fixed expressions::no longer': 'The old bridge is no longer safe for heavy trucks after the recent flooding.',
        'fixed expressions::continue to be available': 'Digital copies of the article will continue to be available through the university library.',
        'fixed expressions::speak with someone': 'Students should speak with an adviser before they drop a required course.',
        'fixed expressions::provide feedback': 'The instructor asked the class to provide feedback on the draft before Friday.',
        'fixed expressions::be known for': 'The coastal town is known for its narrow streets and brightly painted houses.',
        'fixed expressions::establish control over': 'The new government struggled to establish control over the remote northern provinces.',
        'fixed expressions::look for': 'Archaeologists look for changes in soil color when they search for buried walls.',
        'fixed expressions::be known to do something': 'This species is known to migrate hundreds of miles during the dry season.',
        'fixed expressions::when necessary': 'The nurse adjusts the dosage when necessary to keep the patient comfortable.',
        "fixed expressions::use something to one's advantage": 'The researcher used the limited data to her advantage by focusing on one carefully defined question.',
        'fixed expressions::be designed to do something': 'The online form is designed to help students report housing problems quickly.',
        'fixed expressions::be equipped with': 'Each weather station is equipped with sensors that record wind speed and humidity.',
        "fixed expressions::be tailored to someone's needs": 'The training program is tailored to each student\'s needs rather than following a single fixed schedule.',
        'fixed expressions::hold a certification': 'Applicants must hold a certification in first aid before they can work at the summer camp.',
        'fixed expressions::underscore a commitment to': 'The museum\'s free lecture series underscores its commitment to public education.',
        'fixed expressions::commitment to doing something': 'Her commitment to preserving local history made the archive a valuable community resource.',
        'fixed expressions::for more information': 'For more information, students can visit the advising office after the presentation.',
        'fixed expressions::whether... or...': 'Whether the samples came from the coast or the forest, they showed the same chemical pattern.',
        'fixed expressions::be fundamental in doing something': 'Accurate measurement is fundamental in testing whether the treatment actually works.',
        'fixed expressions::fit together': 'The fragments fit together like pieces of a larger ceremonial bowl.',
        'fixed expressions::much like': 'The young birds learn the route much like human children learn familiar paths through a city.',
        'fixed expressions::over time': 'Over time, the river cut a deep channel through the softer layers of rock.',
        'fixed expressions::prepare for': 'The city built emergency shelters to prepare for severe winter storms.',
        'fixed expressions::as well as': 'The course covers Roman architecture as well as the social history behind the buildings.',
        'fixed expressions::mitigate the impacts of something': 'Planting mangroves can help mitigate the impacts of coastal flooding.',
        'fixed expressions::form through': 'These caves form through the slow dissolution of limestone by acidic water.',
        'fixed expressions::be known as': 'The thin layer of fertile soil is known as topsoil.',
        'fixed expressions::be classified into': 'The artifacts can be classified into tools, ornaments, and household objects.',
        'fixed expressions::be composed of': 'Granite is composed of several minerals, including quartz and feldspar.',
        'fixed expressions::form from': 'Sedimentary rock can form from layers of sand, shells, and mud.',
        'fixed expressions::offer insights into': 'The letters offer insights into how ordinary families experienced the war.',
        'fixed expressions::such as': 'Marine animals such as sea turtles are especially vulnerable to plastic waste.',
        'fixed expressions::refer to': 'In this article, "urban heat island" refers to the higher temperatures found in dense city centers.',
        'fixed expressions::be subject to': 'The open-air paintings are subject to damage from sunlight and moisture.',
        'fixed expressions::be made of': 'The early shelters were made of branches, animal skins, and packed earth.',
        'fixed expressions::be made up of': 'The committee is made up of faculty members, students, and local residents.',
        'fixed expressions::lead to': 'A lack of sleep can lead to poor concentration during long lectures.',
        'fixed expressions::be likely to have been': 'The stone circle is likely to have been used for seasonal ceremonies.',
        'fixed expressions::wash away': 'Heavy rain can wash away the top layer of soil before new plants take root.',
        'fixed expressions::contribute to': 'Better nutrition can contribute to improved learning outcomes in young children.',
        'fixed expressions::be a matter of': 'In this experiment, success was a matter of timing rather than expensive equipment.',
        'fixed expressions::combine with': 'Warm air can combine with moisture to produce powerful thunderstorms.',
        'fixed expressions::account for': 'Seasonal demand may account for the sudden rise in hotel prices.',
        'fixed expressions::in turn': 'The new road brought more visitors, which in turn created jobs for local residents.',
        'fixed expressions::play an important role in': 'Pollinators play an important role in maintaining healthy plant communities.',
        'fixed expressions::be involved in': 'Several local groups were involved in planning the restoration project.',
        'fixed expressions::fall off': 'Small pieces of plaster began to fall off the old theater ceiling.',
        'fixed expressions::in between': 'The oldest bones were found near the cave wall, with newer tools scattered in between.',
        'fixed expressions::at one extreme ... at the other': 'At one extreme, some birds travel alone; at the other, they migrate in huge flocks.',
        'fixed expressions::be familiar with': 'Researchers must be familiar with local customs before conducting interviews.',
        'fixed expressions::this is not so': 'Many people assume the desert is lifeless, but this is not so after seasonal rain.',
        'fixed expressions::take some time to do something': 'It may take some time to identify the mineral without special equipment.',
        'fixed expressions::over the last fifty years or so': 'Over the last fifty years or so, satellite data has transformed weather forecasting.',
        'fixed expressions::arrive at a measurement': 'Scientists repeated the test several times before they could arrive at a reliable measurement.',
        'fixed expressions::take up a position': 'The bird took up a position near the nest and watched for intruders.',
        'fixed expressions::be based on': 'The model is based on temperature records collected over several decades.',
        'fixed expressions::extend back from the present': 'The tree-ring record extends back from the present to the early medieval period.',
        'fixed expressions::act upon': 'Natural selection can act upon small differences within a population.',
        'fixed expressions::focus on': 'The lecture will focus on the causes of rapid urban growth.',
        'fixed expressions::be marked by': 'The period was marked by frequent droughts and a decline in crop production.',
        'fixed expressions::following something': 'Following the earthquake, engineers inspected every bridge in the region.',
        'fixed expressions::allow for': 'The schedule allows for a short discussion after each presentation.',
        'fixed expressions::the effects of something on something': 'The study examined the effects of noise on children\'s ability to concentrate.',
        'fixed expressions::address an issue': 'The new policy tries to address an issue that students have raised for years.',
        'fixed expressions::due to': 'The outdoor concert was canceled due to heavy rain.',
        'fixed expressions::arise from': 'Most of the conflict arose from a misunderstanding about land ownership.',
        'fixed expressions::play a key role in': 'Bacteria play a key role in breaking down organic matter in soil.',
        'fixed expressions::be caused by': 'The cracks were caused by repeated freezing and thawing of water in the stone.',
        'fixed expressions::be crucial for': 'Reliable transportation is crucial for students who live far from campus.',
        'fixed expressions::emerge as': 'The port emerged as a major trading center in the late nineteenth century.',
        'fixed expressions::in the field of': 'In the field of marine biology, small changes in water temperature can be extremely important.',
        'fixed expressions::for example': 'Some animals, for example bats, rely heavily on sound to navigate at night.',
        'fixed expressions::interact with': 'Young children learn language as they interact with adults around them.',
        'fixed expressions::as if': 'The actor paused as if he had suddenly remembered something important.',
        'fixed expressions::be associated with': 'Low rainfall is often associated with smaller harvests in this region.',
        'fixed expressions::be suitable for': 'The room is suitable for small seminars but not for large public lectures.',
        'fixed expressions::integrate something into something': 'The teacher integrated short videos into the lesson to clarify abstract ideas.',
        'fixed expressions::despite these hurdles': 'Despite these hurdles, the research team completed the survey on time.',
        'fixed expressions::continue to evolve': 'The city\'s public transport system continues to evolve as new neighborhoods are built.',
        'fixed expressions::a bunch of': 'A bunch of students stayed after class to ask about the field trip.',
        'fixed expressions::be comfortable enough for': 'The chairs were comfortable enough for a three-hour workshop.',
        'fixed expressions::be ok doing something': 'Most students were OK working in pairs for the speaking activity.',
        'fixed expressions::give up': 'The hikers refused to give up even after the trail became steep and muddy.',
        'lifestyle & experience::lodging': 'The tour package includes two nights of lodging near the harbor.',
        'lifestyle & experience::attraction': 'The old lighthouse became the town\'s most popular tourist attraction.',
        'lifestyle & experience::package': 'The travel agency offered a package that included meals, lodging, and local transportation.',
        'events & activities::fair': 'The spring fair filled the main square with food stalls, music, and student artwork.',
        'events & activities::proceeds': 'All proceeds from the concert will support the community garden.',
        'events & activities::clean-up': 'Volunteers joined the beach clean-up before the summer tourist season began.',
        'course content & assignments::reach out': 'The professor told students to reach out if they needed help with the video project.',
        'course content & assignments::credit': 'Students must credit every image they use in the presentation.',
        'course content & assignments::narrate': 'Each student will narrate a short scene from the documentary.',
        'drama & theater::fragment': 'The playwright fragments the story so the audience discovers the truth gradually.',
        'drama & theater::enlighten': 'The final scene is meant to enlighten the audience about the character\'s hidden motive.',
        'drama & theater::exemplify': 'The opening monologue exemplifies the play\'s focus on memory and loss.',
        'marine biology::bleach': 'When ocean temperatures rise, corals may bleach and lose the algae that give them color.',
        'marine biology::combat': 'Marine biologists are testing new methods to combat the spread of coral disease.',
        'marine biology::transplant': 'Divers transplant healthy coral fragments onto damaged sections of the reef.',
        'marine biology::overfishing': 'Overfishing can remove key species and disturb the balance of a reef ecosystem.',
        'marine biology::colony': 'A coral colony is made up of many tiny animals living together on a shared skeleton.',
        'marine biology::fragment': 'Scientists attached each coral fragment to a frame where it could grow safely.',
        'marine biology::seawater': 'The tanks were filled with filtered seawater to protect the young coral.',
        'marine biology::resilience': 'A reef\'s resilience depends on biodiversity, water quality, and the speed of recovery after stress.',
        'zoology::scales': 'The lizard\'s scales reduce water loss and protect its skin from rough surfaces.',
        'zoology::evolve': 'Feathers may evolve for insulation before they become useful for flight.',
        'zoology::overturn': 'Recent fossil evidence could overturn the old theory about how the species moved.',
        'anthropology::spears': 'Early hunters used wooden spears to reach prey from a safer distance.',
        'anthropology::warmth': 'Controlled fire provided warmth and allowed groups to survive in colder climates.',
        'anthropology::tubers': 'Cooked tubers gave early humans a reliable source of calories.',
        'anthropology::cook': 'Learning to cook food may have made some nutrients easier to digest.',
        'anthropology::digest': 'Cooking can help people digest tough plant foods more easily.',
        'anthropology::harden': 'Heating wood over a fire can harden the tip of a simple hunting tool.',
        'botany::appear': 'Mushrooms often appear after several days of cool, wet weather.',
        'botany::reproduction': 'Spores play an important role in the reproduction of many fungi.',
        'painting & visual arts::take off': 'The new painting style began to take off after several galleries featured young artists.',
        'painting & visual arts::pottery': 'The pottery on display shows how artists shaped clay for both beauty and daily use.',
        'painting & visual arts::originate': 'The technique appears to originate in workshops along the Mediterranean coast.',
        'psychology::encompass': 'The study of child development encompasses language, movement, emotion, and social behavior.',
        'psychology::caretaker': 'A consistent caretaker can help a child feel secure during early development.',
        'psychology::overlook': 'Busy observers may overlook small changes in behavior during a crowded experiment.',
        'psychology::trace': 'Psychologists tried to trace the child\'s fear back to an earlier experience.',
        'literature::resonate': 'The novel\'s final image continues to resonate with readers long after they finish the book.',
        'literature::belonging': 'The poem explores belonging through the speaker\'s memories of a lost hometown.',
        'study skills::approach': 'Students need a clear approach when they begin a long research assignment.',
        'study skills::communicate': 'A good presentation should communicate the main idea before adding details.',
        'technology::augmented reality': 'Augmented reality can place digital labels over real machines so trainees know which part to repair.',
        'technology::training environments': 'Safe training environments let students practice difficult procedures before they work with real equipment.',
        'technology::overlay digital information': 'The headset can overlay digital information on a live view of the engine.',
        'technology::enhance learning': 'Interactive diagrams can enhance learning by making hidden processes visible.',
        'technology::simulate operations': 'The software can simulate operations that would be too dangerous to practice on real machines.',
        'technology::virtual components': 'Students can rotate virtual components on the screen before assembling the actual device.',
        'technology::hands-on approach': 'A hands-on approach helped trainees remember the procedure after the workshop ended.',
        'technology::intricate processes': 'Animation made the intricate processes inside the machine easier to understand.',
        'technology::emergency protocols': 'The simulation tested whether workers remembered the emergency protocols under pressure.',
        'technology::realistic training environment': 'A realistic training environment helps pilots practice rare problems without risking safety.',
        'technology::retention rates': 'Retention rates improved when students practiced with interactive tools instead of static diagrams.',
        'technology::responsive content': 'Responsive content changed the difficulty of each task as the learner improved.',
        'meteorology::warmer air rises': 'When warmer air rises, cooler air moves in to replace it near the surface.',
        'meteorology::cooler air sinks': 'Cooler air sinks at night, which can trap fog in low valleys.',
        'meteorology::influence temperature': 'Prevailing winds can influence temperature by carrying warm or cool air into a region.',
        'meteorology::weather patterns': 'Weather patterns often shift when ocean temperatures change.',
        'meteorology::wind direction': 'A sudden change in wind direction warned meteorologists that the storm was moving inland.',
        'meteorology::prevailing winds': 'Prevailing winds carry moist air from the ocean toward the mountains.',
        'meteorology::regional climates': 'Mountain ranges can shape regional climates by blocking wet air from the coast.',
        'meteorology::storm systems': 'Storm systems grow stronger when warm air and moisture combine.',
        'meteorology::accurate forecasting': 'Accurate forecasting gives coastal communities more time to prepare for hurricanes.',
        'meteorology::wind current': 'A high-altitude wind current pushed the ash cloud across the continent.',
        'meteorology::pressure differential': 'A pressure differential between two regions can create strong winds.',
        'meteorology::moisture': 'Warm air can hold more moisture than cool air.',
        'meteorology::coriolis effect': 'The Coriolis effect helps explain why large storm systems rotate.',
        'meteorology::rotation': 'Earth\'s rotation causes moving air to curve rather than travel in a straight line.',
        'animal behavior::maintain dominance': 'The strongest male tried to maintain dominance by controlling access to food.',
        'animal behavior::fiercely defend': 'Some birds fiercely defend their nests when intruders come too close.',
        'animal behavior::hunt at night': 'Owls hunt at night because their hearing helps them locate prey in darkness.',
        'animal behavior::use stealth': 'A leopard can use stealth to approach prey without being noticed.',
        'business & economics::student entrepreneurship': 'Student entrepreneurship can turn a classroom idea into a small company with real customers.',
        'business & economics::co-working spaces': 'Co-working spaces give young founders a place to share equipment and advice.',
        'business & economics::collaboration hubs': 'Collaboration hubs bring students, mentors, and investors into the same workspace.',
        'business & economics::student-led start-ups': 'Student-led start-ups often begin with a problem noticed on campus.',
        'business & economics::value-added tax': 'Value-added tax is added at each stage of production before the product reaches the buyer.',
        'business & economics::receipt': 'Customers need a receipt if they want to return an item later.',
        'study skills::critical thinking': 'Critical thinking helps students question an argument instead of accepting it too quickly.',
        'study skills::time management': 'Good time management keeps long assignments from turning into last-minute work.',
        'study skills::social skills': 'Strong social skills make group projects easier to organize and complete.',
        'accommodation & food service::dining hall': 'The dining hall stays open late during exam week so students can eat after evening study sessions.',
        'accommodation & food service::campus café': 'The Campus Cafe added more breakfast options after students requested lighter meals.',
        'accommodation & food service::vegetarian options': 'The menu lists vegetarian options separately so students can choose meals quickly.',
        'accommodation & food service::vegan options': 'Vegan options do not include meat, eggs, or dairy products.',
        'accommodation & food service::gluten-free options': 'Gluten-free options are stored on a separate shelf to avoid contamination.',
        'accommodation & food service::dietary needs': 'Students with specific dietary needs can speak with the cafe staff before ordering.',
        'animal behavior::solitary animals': 'Solitary animals often avoid direct contact except during mating season.',
        'animal behavior::territorial behavior': 'Territorial behavior helps animals protect food, mates, and safe nesting areas.',
        'geology::outer shell': 'Earth\'s outer shell is broken into plates that move slowly over time.',
        'marine biology::marine biology': 'Marine biology examines how organisms survive and interact in ocean environments.',
        'marine biology::underwater ecosystem': 'An underwater ecosystem can be damaged when pollution reduces the amount of light and oxygen.',
        'lifestyle & experience::sell out': 'Tickets for the harbor tour often sell out during the summer.',
        'lifestyle & experience::city landmarks': 'The guide pointed out several city landmarks during the walking tour.',
        'lifestyle & experience::admission fees': 'Admission fees were lower for students who booked the museum tour in advance.',
        'history::diverse cultures': 'Trade routes brought diverse cultures into contact with one another.',
        'history::significant events': 'Timelines help students connect significant events to broader social changes.',
        'history::develop societies': 'Agriculture helped small communities develop societies with more complex social structures.',
        'zoology::zoology': 'Zoology studies animals, including their bodies, behavior, and evolution.',
        'zoology::camouflage': 'Camouflage helps animals blend into their surroundings and avoid predators.',
        'zoology::quill knobs': 'Quill knobs on the fossil bone suggest that the animal once had strong feathers.'
    };

    const VERB_STARTERS = new Set([
        'absorb', 'accelerate', 'act', 'address', 'alter', 'appear', 'arise', 'arrive', 'back', 'bleach',
        'block', 'boost', 'bring', 'challenge', 'click', 'combine', 'combat', 'communicate', 'continue',
        'contribute', 'cook', 'copy', 'create', 'decide', 'deduct', 'defend', 'define', 'delve',
        'derive', 'develop', 'digest', 'download', 'drive', 'emerge', 'encompass', 'enhance', 'ensure',
        'establish', 'evaluate', 'evolve', 'excavate', 'exemplify', 'explore', 'focus', 'form', 'give',
        'hack', 'harden', 'hold', 'hunt', 'illustrate', 'impact', 'indicate', 'influence', 'integrate',
        'interact', 'introduce', 'launch', 'lead', 'look', 'maintain', 'mark', 'mitigate', 'narrate',
        'open', 'originate', 'overlay', 'overlook', 'overturn', 'patrol', 'play', 'prepare', 'provide',
        'recharge', 'refer', 'reflect', 'reserve', 'restore', 'rise', 'roast', 'scale', 'search',
        'serve', 'shape', 'showcase', 'simulate', 'sink', 'slow', 'speak', 'span', 'spread', 'strike',
        'submerge', 'subscribe', 'tailor', 'take', 'tap', 'trace', 'transplant', 'transport', 'update',
        'upload', 'use', 'volunteer', 'wash', 'work'
    ]);

    const INTRANSITIVE_TERMS = new Set([
        'appear', 'arise', 'continue to evolve', 'evolve', 'fall off', 'form', 'originate', 'rise',
        'sink', 'slow down', 'submerge', 'take off', 'thrive'
    ]);

    const ADJECTIVE_TERMS = new Set([
        'accurate', 'annual', 'eco-friendly', 'gluten-free', 'intense', 'interactive', 'local',
        'ongoing', 'premium', 'properly credited', 'refreshing', 'serene', 'severe', 'stunning',
        'surrealist', 'tasty', 'ultra-fast', 'vegan', 'vegetarian', 'vibrant'
    ]);

    const CATEGORY_EXAMPLE_FRAMES = {
        'Accommodation & Food Service': {
            actor: 'The dining manager',
            setting: 'the campus cafe',
            object: 'meal planning',
            result: 'students with different dietary needs'
        },
        'Animal Behavior': {
            actor: 'Biologists',
            setting: 'a protected reserve',
            object: 'territorial behavior',
            result: 'how animals compete for space and food'
        },
        'Anthropology': {
            actor: 'Anthropologists',
            setting: 'early human communities',
            object: 'tool use and diet',
            result: 'how culture changed over time'
        },
        'Archaeology': {
            actor: 'Archaeologists',
            setting: 'an ancient settlement',
            object: 'buried evidence',
            result: 'the daily lives of the people who lived there'
        },
        'Botany': {
            actor: 'Botanists',
            setting: 'a damp forest floor',
            object: 'plant reproduction',
            result: 'how plants survive in changing conditions'
        },
        'Business & Economics': {
            actor: 'The business incubator',
            setting: 'a student start-up hub',
            object: 'new ventures',
            result: 'whether young companies can grow sustainably'
        },
        'Clubs & Campus Activities': {
            actor: 'The student club',
            setting: 'the campus center',
            object: 'the weekend event',
            result: 'more students to take part'
        },
        'Course Content & Assignments': {
            actor: 'The instructor',
            setting: 'the media assignment',
            object: 'student presentations',
            result: 'clearer and more original work'
        },
        'Drama & Theater': {
            actor: 'The director',
            setting: 'a small experimental theater',
            object: 'the performance',
            result: 'a stronger emotional response from the audience'
        },
        'Environmental Science': {
            actor: 'Environmental researchers',
            setting: 'a migration corridor',
            object: 'climate data',
            result: 'how development affects fragile habitats'
        },
        'Events & Activities': {
            actor: 'Organizers',
            setting: 'the campus festival',
            object: 'the event schedule',
            result: 'visitors to move easily between activities'
        },
        'Geology': {
            actor: 'Geologists',
            setting: 'a rocky valley',
            object: 'layers of stone',
            result: 'how the landscape formed'
        },
        'History': {
            actor: 'Historians',
            setting: 'a rapidly growing nineteenth-century city',
            object: 'public records',
            result: 'why health reforms became necessary'
        },
        'Information & Advising': {
            actor: 'The adviser',
            setting: 'a meeting with first-year students',
            object: 'course options',
            result: 'students to make realistic academic plans'
        },
        'Infrastructure & Projects': {
            actor: 'Engineers',
            setting: 'a large public-works project',
            object: 'construction plans',
            result: 'the project to stay on schedule'
        },
        'Job & Career': {
            actor: 'The career counselor',
            setting: 'a campus workshop',
            object: 'job applications',
            result: 'students to present their experience clearly'
        },
        'Lifestyle & Experience': {
            actor: 'The travel guide',
            setting: 'a coastal weekend trip',
            object: 'the itinerary',
            result: 'visitors to balance activity with rest'
        },
        'Literature': {
            actor: 'The critic',
            setting: 'a discussion of the novel',
            object: 'recurring images',
            result: 'how the story creates meaning'
        },
        'Marine Biology': {
            actor: 'Marine biologists',
            setting: 'a coral reef',
            object: 'reef health',
            result: 'which restoration methods are most effective'
        },
        'Meteorology': {
            actor: 'Meteorologists',
            setting: 'a coastal weather station',
            object: 'wind and pressure data',
            result: 'more accurate storm forecasts'
        },
        'Painting & Visual Arts': {
            actor: 'Art historians',
            setting: 'a museum exhibition',
            object: 'the artist\'s materials',
            result: 'how technique shapes visual meaning'
        },
        'Psychology': {
            actor: 'Psychologists',
            setting: 'a child-development study',
            object: 'behavioral patterns',
            result: 'how children learn from their surroundings'
        },
        'Study Skills': {
            actor: 'Successful students',
            setting: 'a demanding semester',
            object: 'their study routines',
            result: 'better long-term learning'
        },
        'Technology': {
            actor: 'Engineers',
            setting: 'a training simulation',
            object: 'digital tools',
            result: 'safer practice before real equipment is used'
        },
        'Zoology': {
            actor: 'Zoologists',
            setting: 'a fossil collection',
            object: 'physical adaptations',
            result: 'how animals changed over time'
        }
    };

    function getPolishedLookupKey(category, term) {
        return `${normalizeCategory(category).toLowerCase()}::${normalizeFixedExpression(term)}`;
    }

    function cleanExampleTerm(word) {
        return compactText(word).replace(/^\*+/, '').replace(/[“”]/g, '"');
    }

    function getCustomExampleEntries() {
        return Array.isArray(globalThis.LEITNER_CUSTOM_EXAMPLE_ENTRIES)
            ? globalThis.LEITNER_CUSTOM_EXAMPLE_ENTRIES
            : [];
    }

    function getCustomExampleLookup() {
        if (customExampleLookup) return customExampleLookup;

        const byId = new Map();
        const byKey = new Map();

        getCustomExampleEntries().forEach(entry => {
            const example = compactText(entry.example || '');
            const category = normalizeCategory(entry.category);
            const word = cleanExampleTerm(entry.word || '');
            if (!example) return;

            if (entry.id) byId.set(String(entry.id), example);
            if (category && word) {
                const key = getPolishedLookupKey(category, word);
                if (!byKey.has(key)) byKey.set(key, example);
            }
        });

        customExampleLookup = { byId, byKey };
        return customExampleLookup;
    }

    function getCustomCardExample(card) {
        if (!card) return '';
        const lookup = getCustomExampleLookup();
        const byId = card.id ? lookup.byId.get(String(card.id)) : '';
        if (byId) return byId;

        const term = cleanExampleTerm(card.word || '');
        if (!term) return '';

        const key = getPolishedLookupKey(card.category, term);
        return lookup.byKey.get(key) || '';
    }

    function capitalizeSentence(text) {
        const clean = compactText(text);
        return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : clean;
    }

    function termNeedsArticle(term) {
        const lower = term.toLowerCase();
        return !/^(a|an|the|this|that|these|those|some|many|much|several|various|one|each)\b/.test(lower)
            && !/(?:s|es)$/i.test(lower)
            && !/(?:ss|us)$/i.test(lower)
            && !lower.includes(' and ')
            && !/^[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*$/.test(term);
    }

    function nounTerm(term) {
        if (!termNeedsArticle(term)) return term;
        return /^[aeiou]/i.test(term) ? `an ${term}` : `a ${term}`;
    }

    function isVerbMeaning(meaning) {
        return /(کردن|شدن|دادن|گرفتن|یافتن|رفتن|آمدن|ساختن|پرداختن|داشتن|بودن|جستجو|جست‌وجو|افزایش|کاهش|حفظ|بهبود|مقابله|ارزیابی|حذف|بارگذاری|دانلود)/.test(meaning || '');
    }

    function isVerbTerm(term, meaning, partOfSpeech = '') {
        const lower = normalizeFixedExpression(cleanExampleTerm(term));
        if ((partOfSpeech || '').toLowerCase() === 'verb') return true;
        if (/^(be|to)\b/.test(lower)) return true;
        const words = lower.split(/\s+/);
        if (VERB_STARTERS.has(words[0])) return true;
        if (words.length > 1 && /ly$/.test(words[0]) && VERB_STARTERS.has(words[1])) return true;
        return words.length === 1 && isVerbMeaning(meaning);
    }

    function isAdjectiveTerm(term, partOfSpeech = '') {
        const lower = normalizeFixedExpression(cleanExampleTerm(term));
        return (partOfSpeech || '').toLowerCase() === 'adjective' || ADJECTIVE_TERMS.has(lower);
    }

    function isClauseTerm(term) {
        return /\b(rises|sinks|forms|changes|occurs|increases|decreases|migrates|rotates|crashes)\b/i.test(term);
    }

    function isPluralTerm(term) {
        const lower = normalizeFixedExpression(term);
        const lastWord = lower.split(/\s+/).pop() || '';
        return lower.includes(' and ')
            || /(?:s|es)$/.test(lastWord) && !/(?:ss|us)$/.test(lastWord);
    }

    function hasUsefulExactExample(card) {
        const example = compactText(card.example || '');
        if (!example) return false;
        const term = cleanExampleTerm(card.word || '');
        if (!term) return false;
        return example.toLowerCase().includes(term.toLowerCase())
            && !isWeakGeneratedExample(example);
    }

    function isWeakGeneratedExample(example) {
        const clean = compactText(example);
        return !clean
            || /The phrase ".+" appeared in/i.test(clean)
            || /The professor explained the term/i.test(clean)
            || /Researchers can \w+ the evidence/i.test(clean)
            || /Researchers \w+ various factors when conducting studies/i.test(clean)
            || /played a pivotal role in the outcome/i.test(clean)
            || /Understanding ".+" helps students navigate/i.test(clean)
            || /appears frequently in scholarly articles/i.test(clean)
            || /was widely discussed in the seminar/i.test(clean)
            || /In academic writing, ".+" is commonly used/i.test(clean)
            || /relationship between .+ and social dynamics/i.test(clean)
            || /Experts have debated the impact of/i.test(clean)
            || /Students should familiarize themselves with/i.test(clean)
            || /The concept of ".+" was explored/i.test(clean)
            || /Many scholars consider ".+" a key term/i.test(clean)
            || /The word ".+" has significant implications/i.test(clean);
    }

    function createExpressionExample(term) {
        const lower = normalizeFixedExpression(term);
        const natural = term
            .replace(/^be\s+/i, '')
            .replace(/^to\s+/i, '')
            .replace(/\bsomething\b/gi, 'the plan')
            .replace(/\bsomeone\b/gi, 'the student')
            .replace(/\bsomeone's\b/gi, 'the student\'s')
            .replace(/\bone's\b/gi, 'her');

        if (/^be /.test(lower)) return `The proposal was ${natural} after the committee reviewed the evidence.`;
        if (/^to /.test(lower)) return `The team revised the schedule ${term} before the final deadline.`;
        return '';
    }

    function createCategoryExample(card, term) {
        const category = normalizeCategory(card.category);
        const frame = CATEGORY_EXAMPLE_FRAMES[category] || {
            actor: 'The article',
            setting: getExampleContext(category),
            object: 'the main topic',
            result: 'the reader to understand the larger issue'
        };
        const meaning = compactText(card.meaning || '');
        const pos = card.partOfSpeech || '';
        const lower = normalizeFixedExpression(term);
        const h = simpleHash(`${category}::${term}`);
        const isPhrase = /\s/.test(term);

        if (isClauseTerm(term)) {
            const templates = [
                `When ${term}, it can change the conditions described in the passage.`,
                `${capitalizeSentence(term)} when the surrounding conditions shift.`,
                `Scientists studied why ${term} under specific environmental conditions.`
            ];
            return templates[h % templates.length];
        }

        if (isAdjectiveTerm(term, pos)) {
            const templates = [
                `${frame.actor} described a ${term} feature that changed how people responded in ${frame.setting}.`,
                `A ${term} design made the project more useful in ${frame.setting}.`,
                `The report called the result ${term} because it clearly affected ${frame.object}.`
            ];
            return templates[h % templates.length];
        }

        if (isVerbTerm(term, meaning, pos)) {
            if (INTRANSITIVE_TERMS.has(lower)) {
                const templates = [
                    `In ${frame.setting}, the pattern began to ${term} as conditions changed.`,
                    `${frame.actor} observed the system ${term} after several weeks of careful monitoring.`,
                    `The change did not ${term} until outside pressure increased.`
                ];
                return templates[h % templates.length];
            }

            const verbPhraseTemplates = [
                `${frame.actor} tried to ${term} during work in ${frame.setting}.`,
                `The project shows how experts can ${term} while studying ${frame.object}.`,
                `During the project, students learned to ${term} without losing sight of the main goal.`,
                `In ${frame.setting}, the team needed to ${term} before the next stage could begin.`
            ];
            return verbPhraseTemplates[h % verbPhraseTemplates.length];
        }

        if (isPhrase) {
            const explainVerb = isPluralTerm(term) ? 'help' : 'helps';
            const templates = [
                `The passage links ${term} to a larger issue in ${frame.setting}.`,
                `In ${frame.setting}, ${term} can affect how people interpret ${frame.object}.`,
                `${capitalizeSentence(term)} ${explainVerb} explain ${frame.object}.`,
                `${frame.actor} discussed ${term} while analyzing ${frame.object}.`
            ];
            return templates[h % templates.length];
        }

        const nounTemplates = [
            `The article explains ${term} in the context of ${frame.setting}.`,
            `${capitalizeSentence(term)} became an important clue in the discussion of ${frame.object}.`,
            `${frame.actor} measured ${term} to understand changes in ${frame.object}.`,
            `A careful discussion of ${term} helps readers follow the argument in the passage.`
        ];
        return nounTemplates[h % nounTemplates.length];
    }

    function createPolishedExample(wordOrCard, category = 'General', partOfSpeech = '') {
        const card = typeof wordOrCard === 'object'
            ? wordOrCard
            : { word: wordOrCard, category, partOfSpeech, meaning: '' };
        const term = cleanExampleTerm(card.word || '');
        if (!term) return '';

        const normalizedCategory = normalizeCategory(card.category);
        const customExample = getCustomCardExample({ ...card, word: term, category: normalizedCategory });
        if (customExample) return customExample;

        const categoryKey = getPolishedLookupKey(normalizedCategory, term);
        const termKey = normalizeFixedExpression(term);
        if (POLISHED_EXAMPLE_OVERRIDES[categoryKey]) return POLISHED_EXAMPLE_OVERRIDES[categoryKey];
        if (POLISHED_EXAMPLE_OVERRIDES[termKey]) return POLISHED_EXAMPLE_OVERRIDES[termKey];

        if (normalizedCategory === FIXED_EXPRESSIONS_CATEGORY) {
            const expressionExample = createExpressionExample(term);
            if (expressionExample) return expressionExample;
        }

        return createCategoryExample({ ...card, category: normalizedCategory }, term);
    }

    function compactText(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function getToeflSampleWords() {
        return Object.entries(TOEFL_SAMPLE_WORDS_BY_CATEGORY).flatMap(([category, words]) =>
            words.map(([word, meaning, partOfSpeech]) => ({
                word,
                meaning,
                category: normalizeCategory(category),
                partOfSpeech
            }))
        );
    }

    // ---- Storage ----
    function parseStoredData(raw) {
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    }

    function isManualCard(card) {
        return card && (!card.source || card.source === 'manual');
    }

    function countManualCards(data) {
        return Array.isArray(data && data.cards) ? data.cards.filter(isManualCard).length : 0;
    }

    function countCards(data) {
        return Array.isArray(data && data.cards) ? data.cards.length : 0;
    }

    function getCardMergeKey(card) {
        const category = normalizeCategory(card && card.category);
        const phrase = normalizeFixedExpression(card && card.word);
        return card && card.sourceId ? `source:${card.sourceId}` : `card:${category}::${phrase}`;
    }

    function normalizeDeletedImportedSourceIds(data = appData) {
        const ids = Array.isArray(data.deletedImportedSourceIds) ? data.deletedImportedSourceIds : [];
        data.deletedImportedSourceIds = Array.from(new Set(ids.map(id => String(id || '').trim()).filter(Boolean)));
        return data.deletedImportedSourceIds;
    }

    function getDeletedImportedSourceIdSet() {
        return new Set(normalizeDeletedImportedSourceIds(appData));
    }

    function isDeletedImportedSourceId(sourceId) {
        return Boolean(sourceId) && getDeletedImportedSourceIdSet().has(String(sourceId));
    }

    function getCategoryTermDeletionKey(category, word) {
        const normalizedCategory = normalizeCategory(category);
        const normalizedWord = normalizeFixedExpression(word);
        return normalizedCategory && normalizedWord ? `category-term::${normalizedCategory}::${normalizedWord}` : '';
    }

    function isDeletedImportedCard(candidate) {
        return getImportedDeletionKeys(candidate).some(key => isDeletedImportedSourceId(key));
    }

    function getImportedDeletionKeys(card) {
        if (!card) return [];

        const keys = [];
        const source = card.source || '';
        const category = normalizeCategory(card.category);
        const wordKey = normalizeFixedExpression(card.word || '');

        if (card.sourceId) keys.push(String(card.sourceId));
        const categoryTermKey = getCategoryTermDeletionKey(category, wordKey);
        if (categoryTermKey) keys.push(categoryTermKey);
        if (category === FIXED_EXPRESSIONS_CATEGORY || source === 'fixed-expressions' || /^fixed-expression::/i.test(card.sourceId || '')) {
            if (wordKey) keys.push(`fixed-expression::${wordKey}`);
        }
        if (source === 'topic-md' || /^topic-md::/i.test(card.sourceId || '')) {
            if (category && wordKey) keys.push(`topic-md::${category}::${wordKey}`);
        }
        if (source === 'telegram' || category === VOCABHUB_CATEGORY || /^telegram[:]/i.test(card.sourceId || '')) {
            const telegramWord = compactText(card.word || '').toLowerCase();
            if (telegramWord) keys.push(`${VOCABHUB_CATEGORY}::${telegramWord}`);
        }

        return Array.from(new Set(keys.filter(Boolean)));
    }

    function markImportedCardDeleted(card) {
        const keys = getImportedDeletionKeys(card);
        if (keys.length === 0) return false;

        const deletedIds = normalizeDeletedImportedSourceIds(appData);
        const existing = new Set(deletedIds);
        let changed = false;

        keys.forEach(key => {
            if (existing.has(key)) return;
            deletedIds.push(key);
            existing.add(key);
            changed = true;
        });

        return changed;
    }

    function pruneStorageBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_BACKUP_PREFIX)) backups.push(key);
        }
        backups.sort();
        while (backups.length > MAX_STORAGE_BACKUPS) {
            localStorage.removeItem(backups.shift());
        }
    }

    function createStorageBackup(raw, reason) {
        if (!raw) return;
        try {
            const key = `${STORAGE_BACKUP_PREFIX}${Date.now()}_${reason || 'snapshot'}`;
            localStorage.setItem(key, raw);
            pruneStorageBackups();
        } catch (e) {
            console.error('Backup failed:', e);
        }
    }

    function createDailyBackupIfNeeded(raw) {
        if (!raw) return;
        const last = Number(localStorage.getItem(DAILY_BACKUP_KEY) || 0);
        if (Date.now() - last < DAILY_BACKUP_INTERVAL_MS) return;
        createStorageBackup(raw, 'daily');
        localStorage.setItem(DAILY_BACKUP_KEY, String(Date.now()));
    }

    function createManualShadowBackup(data) {
        try {
            const manualCards = Array.isArray(data && data.cards) ? data.cards.filter(isManualCard) : [];
            if (manualCards.length < 10) return;
            localStorage.setItem(MANUAL_SHADOW_BACKUP_KEY, JSON.stringify({
                cards: manualCards,
                customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
                deletedImportedSourceIds: Array.isArray(data.deletedImportedSourceIds) ? data.deletedImportedSourceIds : [],
                stats: data.stats || emptyStats(),
                backedUpAt: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Manual shadow backup skipped:', e);
        }
    }

    function removeObsoleteAutomaticRecoveryKeys() {
        try {
            OBSOLETE_AUTO_RECOVERY_KEYS.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('Obsolete recovery cleanup skipped:', e);
        }
    }

    function restoreAppDataFromRaw(raw) {
        const parsed = parseStoredData(raw);
        if (!parsed) return;
        appData = { ...appData, ...parsed };
        if (!appData.customCategories) appData.customCategories = [];
        normalizeDeletedImportedSourceIds(appData);
    }

    function clearLocalStorageBackupsForSpace() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith(STORAGE_BACKUP_PREFIX) || key === MANUAL_SHADOW_BACKUP_KEY || OBSOLETE_AUTO_RECOVERY_KEYS.includes(key))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    }

    function writePrimaryStorage(raw) {
        try {
            localStorage.setItem(STORAGE_KEY, raw);
            return true;
        } catch (firstError) {
            console.warn('Primary save failed, clearing local backups and retrying:', firstError);
            clearLocalStorageBackupsForSpace();
            try {
                localStorage.setItem(STORAGE_KEY, raw);
                return true;
            } catch (secondError) {
                console.error('Primary save failed after retry:', secondError);
                return false;
            }
        }
    }

    function saveData(options = {}) {
        try {
            const currentRaw = localStorage.getItem(STORAGE_KEY);
            const currentData = parseStoredData(currentRaw);

            if (currentData && currentData.updatedAt && currentData.updatedAt !== lastPersistedDataUpdatedAt && !options.allowExternalOverwrite) {
                console.warn('Blocked stale save over newer data:', {
                    currentUpdatedAt: currentData.updatedAt,
                    loadedUpdatedAt: lastPersistedDataUpdatedAt
                });
                if (typeof showToast === 'function') {
                    showToast('داده‌ها در یک پنجره‌ی دیگر تغییر کرده‌اند؛ برای جلوگیری از overwrite، صفحه را رفرش کن', 'error');
                }
                return false;
            }

            appData.updatedAt = new Date().toISOString();
            const nextRaw = JSON.stringify(appData);

            if (currentData && !options.allowDestructive && !options.allowCardRemoval) {
                const currentManual = countManualCards(currentData);
                const nextManual = countManualCards(appData);
                const currentTotal = countCards(currentData);
                const nextTotal = countCards(appData);
                const manualDrop = currentManual - nextManual;
                const totalDrop = currentTotal - nextTotal;
                const riskyManualDrop = currentManual >= 10 && manualDrop >= 10;
                const riskyTotalDrop = currentTotal >= 50 && totalDrop >= 50 && manualDrop > 0;

                if (riskyManualDrop || riskyTotalDrop) {
                    createStorageBackup(currentRaw, 'blocked_destructive_save');
                    restoreAppDataFromRaw(currentRaw);
                    console.error('Blocked destructive save:', { currentManual, nextManual, currentTotal, nextTotal });
                    if (typeof showToast === 'function') {
                        showToast('ذخیره خطرناک متوقف شد؛ کارت‌های دستی محافظت شدند', 'error');
                    }
                    return false;
                }
            }

            try {
                pruneStorageBackups();
                createDailyBackupIfNeeded(currentRaw);
            } catch (backupError) {
                console.warn('Pre-save backup skipped:', backupError);
            }

            if (!writePrimaryStorage(nextRaw)) {
                if (typeof showToast === 'function') {
                    showToast('ذخیره انجام نشد؛ فضای ذخیره‌سازی مرورگر کافی نیست', 'error');
                }
                return false;
            }

            lastPersistedDataUpdatedAt = appData.updatedAt || '';
            createManualShadowBackup(appData);
            return true;
        } catch (e) {
            console.error(e);
            if (typeof showToast === 'function') {
                showToast('ذخیره انجام نشد؛ خطای ذخیره‌سازی رخ داد', 'error');
            }
            return false;
        }
    }

    function emptyStats() {
        return { totalReviews: 0, correctAnswers: 0, wrongAnswers: 0, streak: 0, lastReviewDate: null, history: [] };
    }

    function recordReviewActivityDate() {
        if (!appData.stats) appData.stats = emptyStats();
        const today = new Date().toDateString();
        if (appData.stats.lastReviewDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            appData.stats.streak = appData.stats.lastReviewDate === yesterday.toDateString() ? appData.stats.streak + 1 : 1;
            appData.stats.lastReviewDate = today;
        }
    }

    function getEmbeddedFixedExpressionEntries() {
        return Array.isArray(globalThis.FIXED_EXPRESSIONS_EMBEDDED_CARDS) ? globalThis.FIXED_EXPRESSIONS_EMBEDDED_CARDS : [];
    }

    function getEmbeddedTopicPhraseEntries() {
        return Array.isArray(globalThis.TOPIC_PHRASES_EMBEDDED_CARDS) ? globalThis.TOPIC_PHRASES_EMBEDDED_CARDS : [];
    }

    function getRemovedTopicPhraseSourceIds() {
        return Array.isArray(globalThis.TOPIC_PHRASES_REMOVED_SOURCE_IDS) ? globalThis.TOPIC_PHRASES_REMOVED_SOURCE_IDS : [];
    }

    function normalizeFixedExpression(value) {
        return compactText(value)
            .replace(/^\*+/, '')
            .replace(/[’`]/g, "'")
            .toLowerCase();
    }

    function getCategoryTermKey(category, word) {
        const normalizedCategory = normalizeCategory(category);
        const normalizedWord = normalizeFixedExpression(word);
        return normalizedCategory && normalizedWord ? `${normalizedCategory}::${normalizedWord}` : '';
    }

    function getCardCategoryTermKey(card) {
        return getCategoryTermKey(card && card.category, card && card.word);
    }

    function getReturnedManualCardsCleanupKeys() {
        return new Set(RETURNED_MANUAL_CARDS_FROM_BAD_RESTORE
            .map(([category, word]) => getCategoryTermKey(category, word))
            .filter(Boolean));
    }

    function cleanupReturnedManualCardsFromBadRestore() {
        if (localStorage.getItem(RETURNED_MANUAL_CARDS_CLEANUP_KEY)) return false;

        const cleanupKeys = getReturnedManualCardsCleanupKeys();
        const cardsToRemove = appData.cards.filter(card =>
            isManualCard(card) && cleanupKeys.has(getCardCategoryTermKey(card))
        );
        if (cardsToRemove.length === 0) {
            try {
                localStorage.setItem(RETURNED_MANUAL_CARDS_CLEANUP_KEY, JSON.stringify({
                    removedCards: 0,
                    removedAt: new Date().toISOString()
                }));
            } catch (e) {
                console.warn('Could not mark empty returned manual cards cleanup as completed:', e);
            }
            return false;
        }

        createStorageBackup(localStorage.getItem(STORAGE_KEY), 'before_returned_manual_cards_cleanup');
        cardsToRemove.forEach(markImportedCardDeleted);
        appData.cards = appData.cards.filter(card =>
            !(isManualCard(card) && cleanupKeys.has(getCardCategoryTermKey(card)))
        );
        pendingReturnedManualCardsCleanup = {
            removedCards: cardsToRemove.length,
            removedAt: new Date().toISOString(),
            terms: cardsToRemove.map(card => ({
                category: normalizeCategory(card.category),
                word: card.word || ''
            }))
        };
        console.info('Returned manual cards removed after bad restore:', pendingReturnedManualCardsCleanup);
        return true;
    }

    function finalizeReturnedManualCardsCleanup() {
        if (!pendingReturnedManualCardsCleanup) return;
        const cleanupInfo = pendingReturnedManualCardsCleanup;
        try {
            localStorage.setItem(RETURNED_MANUAL_CARDS_CLEANUP_KEY, JSON.stringify(cleanupInfo));
        } catch (e) {
            console.warn('Could not mark returned manual cards cleanup as completed:', e);
        }
        pendingReturnedManualCardsCleanup = null;
        if (cleanupInfo.removedCards > 0 && typeof showToast === 'function') {
            setTimeout(() => {
                showToast(`${toPersianNumber(cleanupInfo.removedCards)} کارت برگشته از restore قدیمی حذف شد`, 'success');
            }, 0);
        }
    }

    function findDuplicateCardInCategory(category, word, ignoredCardId = '') {
        const key = getCategoryTermKey(category, word);
        if (!key) return null;
        return appData.cards.find(card =>
            card
            && card.id !== ignoredCardId
            && getCardCategoryTermKey(card) === key
        ) || null;
    }

    function hasDuplicateCardInCategory(category, word, ignoredCardId = '') {
        return Boolean(findDuplicateCardInCategory(category, word, ignoredCardId));
    }

    function normalizeMarkdownSectionName(text) {
        return compactText(text)
            .replace(/^\d+\.\s*/, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }

    function isAcademicPhrasesSection(section) {
        return /^academic phrases?$/.test(normalizeMarkdownSectionName(section));
    }

    function parseMarkdownPhraseEntries(text, meta = {}, options = {}) {
        const entries = [];
        const seen = new Set();
        let currentSection = '';

        String(text || '').split(/\r?\n/).forEach((rawLine, index) => {
            const trimmedLine = rawLine.trim();
            const heading = trimmedLine.match(/^#{1,6}\s*(.+?)\s*$/);
            if (heading) {
                currentSection = normalizeMarkdownSectionName(heading[1]);
                return;
            }

            const line = rawLine.trim().replace(/^[-*+]\s*/, '').trim();
            if (!line) return;
            if (options.excludeAcademicPhrases && isAcademicPhrasesSection(currentSection)) return;

            const match = line.match(/^\*\*(.+?)\*\*\s*[:：]\s*(.+)$/)
                || line.match(/^(.+?)\s*[:：]\s*(.+)$/);
            if (!match) return;

            const phrase = compactText(match[1].replace(/\*\*/g, ''));
            const meaning = compactText(match[2]);
            const key = normalizeFixedExpression(phrase);
            if (!phrase || !meaning || seen.has(key)) return;

            seen.add(key);
            entries.push({ ...meta, phrase, meaning, sourceLine: index + 1, sourceSection: currentSection });
        });

        return entries;
    }

    function parseFixedExpressionsMarkdown(text) {
        return parseMarkdownPhraseEntries(text);
    }

    function upsertFixedExpressionEntries(entries) {
        const seen = new Set();
        let added = 0;
        let updated = 0;
        const now = Date.now();

        entries.forEach((entry, index) => {
            const phrase = compactText(entry.phrase || entry.word || '');
            const meaning = compactText(entry.meaning || entry.persianMeaning || '');
            const incomingExample = compactText(entry.example || entry.englishExample || '');
            const key = normalizeFixedExpression(phrase);
            if (!phrase || !meaning || seen.has(key)) return;

            seen.add(key);
            const sourceId = `fixed-expression::${key}`;
            if (isDeletedImportedCard({
                word: phrase,
                category: FIXED_EXPRESSIONS_CATEGORY,
                source: 'fixed-expressions',
                sourceId
            })) return;

            const existing = appData.cards.find(card =>
                card.sourceId === sourceId
                || (normalizeCategory(card.category) === FIXED_EXPRESSIONS_CATEGORY && normalizeFixedExpression(card.word) === key)
            );

            if (existing) {
                if (existing.sourceId !== sourceId && isManualCard(existing)) return;

                const before = JSON.stringify({
                    meaning: existing.meaning,
                    example: existing.example,
                    notes: existing.notes,
                    source: existing.source,
                    sourceId: existing.sourceId,
                    sourceLine: existing.sourceLine
                });

                if (!existing.meaning) existing.meaning = meaning;
                if (!existing.example && incomingExample) existing.example = incomingExample;
                if (!existing.source) existing.source = 'fixed-expressions';
                if (!existing.sourceId) existing.sourceId = sourceId;
                if (!existing.sourceLine && entry.sourceLine) existing.sourceLine = entry.sourceLine;

                const after = JSON.stringify({
                    meaning: existing.meaning,
                    example: existing.example,
                    notes: existing.notes,
                    source: existing.source,
                    sourceId: existing.sourceId,
                    sourceLine: existing.sourceLine
                });
                if (before !== after) updated++;
                return;
            }

            appData.cards.push({
                id: generateId(),
                word: phrase,
                pronunciation: '',
                audioUrl: '',
                meaning,
                example: incomingExample,
                notes: '',
                category: FIXED_EXPRESSIONS_CATEGORY,
                box: 1,
                lastReviewed: null,
                createdAt: new Date(now + index).toISOString(),
                reviewCount: 0,
                source: 'fixed-expressions',
                sourceId,
                sourceLine: entry.sourceLine || ''
            });
            added++;
        });

        if (added || updated) {
            currentPage = 1;
            saveData();
            populateCategoryFilter();
            updateDashboard();
            renderCards();
        }

        return { added, updated };
    }

    async function syncFixedExpressions(silent = true) {
        let entries = getEmbeddedFixedExpressionEntries();

        if (location.protocol !== 'file:') {
            try {
                const res = await fetch(`${FIXED_EXPRESSIONS_MD_URL}?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    entries = parseFixedExpressionsMarkdown(await res.text());
                }
            } catch (e) {
                console.error(e);
            }
        }

        const result = upsertFixedExpressionEntries(entries);
        if (!silent && result.added > 0) {
            showToast(`${toPersianNumber(result.added)} عبارت ثابت اضافه شد`, 'success');
        }
        return result;
    }

    function upsertTopicPhraseEntries(entries) {
        const seen = new Set();
        let added = 0;
        let updated = 0;
        let skippedDuplicates = 0;
        const now = Date.now();

        entries.forEach((entry, index) => {
            const phrase = compactText(entry.phrase || entry.word || '');
            const meaning = compactText(entry.meaning || entry.persianMeaning || '');
            const notes = compactText(entry.notes || entry.description || '');
            const category = normalizeCategory(entry.category);
            const incomingExample = compactText(entry.example || entry.englishExample || '');
            const key = normalizeFixedExpression(phrase);
            const scopedKey = `${category}::${key}`;
            if (!phrase || !meaning || seen.has(scopedKey)) return;

            seen.add(scopedKey);
            const sourceId = `topic-md::${category}::${key}`;
            if (isDeletedImportedCard({
                word: phrase,
                category,
                source: 'topic-md',
                sourceId
            })) return;

            const existing = appData.cards.find(card =>
                card.sourceId === sourceId
                || (normalizeCategory(card.category) === category && normalizeFixedExpression(card.word) === key)
            );

            if (existing) {
                if (existing.sourceId !== sourceId && isManualCard(existing)) {
                    skippedDuplicates++;
                    return;
                }

                const before = JSON.stringify({
                    meaning: existing.meaning,
                    example: existing.example,
                    notes: existing.notes,
                    source: existing.source,
                    sourceId: existing.sourceId,
                    sourceFile: existing.sourceFile,
                    sourceLine: existing.sourceLine,
                    sourceSection: existing.sourceSection
                });

                if (!existing.meaning) existing.meaning = meaning;
                if (!existing.example && incomingExample) existing.example = incomingExample;
                if (!existing.notes && notes) existing.notes = notes;
                if (!existing.source) existing.source = 'topic-md';
                if (!existing.sourceId) existing.sourceId = sourceId;
                if (!existing.sourceFile && entry.sourceFile) existing.sourceFile = entry.sourceFile;
                if (!existing.sourceLine && entry.sourceLine) existing.sourceLine = entry.sourceLine;
                if (!existing.sourceSection && entry.sourceSection) existing.sourceSection = entry.sourceSection;

                const after = JSON.stringify({
                    meaning: existing.meaning,
                    example: existing.example,
                    notes: existing.notes,
                    source: existing.source,
                    sourceId: existing.sourceId,
                    sourceFile: existing.sourceFile,
                    sourceLine: existing.sourceLine,
                    sourceSection: existing.sourceSection
                });
                if (before !== after) updated++;
                return;
            }

            appData.cards.push({
                id: generateId(),
                word: phrase,
                pronunciation: '',
                audioUrl: '',
                meaning,
                example: incomingExample,
                notes,
                category,
                box: 1,
                lastReviewed: null,
                createdAt: new Date(now + index).toISOString(),
                reviewCount: 0,
                source: 'topic-md',
                sourceId,
                sourceFile: entry.sourceFile || '',
                sourceLine: entry.sourceLine || '',
                sourceSection: entry.sourceSection || ''
            });
            added++;
        });

        if (added || updated) {
            currentPage = 1;
            saveData();
            populateCategoryFilter();
            updateDashboard();
            renderCards();
        }

        return { added, updated, skippedDuplicates };
    }

    async function syncTopicMarkdownPhrases(silent = true) {
        const embeddedEntries = getEmbeddedTopicPhraseEntries();
        let entries = embeddedEntries;

        if (location.protocol !== 'file:') {
            const fetched = [];
            await Promise.all(TOPIC_MARKDOWN_SOURCES.map(async source => {
                try {
                    const res = await fetch(`${encodeURI(source.file)}?t=${Date.now()}`, { cache: 'no-store' });
                    if (!res.ok) return;
                    const text = await res.text();
                    fetched.push(...parseMarkdownPhraseEntries(text, {
                        category: source.category,
                        sourceFile: source.file
                    }, { excludeAcademicPhrases: true }));
                } catch (e) {
                    console.error(e);
                }
            }));
            if (fetched.length > 0) entries = [...fetched, ...embeddedEntries];
        }

        const result = upsertTopicPhraseEntries(entries);
        if (!silent && result.added > 0) {
            showToast(`${toPersianNumber(result.added)} عبارت موضوعی اضافه شد`, 'success');
        }
        return result;
    }

    function removeDeprecatedAcademicPhraseCards() {
        const removedSourceIds = new Set(getRemovedTopicPhraseSourceIds());
        if (removedSourceIds.size === 0) return false;
        const includedSourceIds = new Set(getEmbeddedTopicPhraseEntries().map(entry =>
            `topic-md::${normalizeCategory(entry.category)}::${normalizeFixedExpression(entry.phrase)}`
        ));

        const before = appData.cards.length;
        appData.cards = appData.cards.filter(card => !(
            card.source === 'topic-md'
            && card.sourceId
            && removedSourceIds.has(card.sourceId)
            && (isAcademicPhrasesSection(card.sourceSection || '') || (!card.sourceSection && !includedSourceIds.has(card.sourceId)))
        ));

        return appData.cards.length !== before;
    }

    function removeDeprecatedCollocationIntermediateCards() {
        const includedSourceIds = new Set(getEmbeddedTopicPhraseEntries()
            .filter(entry => normalizeCategory(entry.category) === COLLOCATION_INTERMEDIATE_CATEGORY)
            .map(entry => `topic-md::${COLLOCATION_INTERMEDIATE_CATEGORY}::${normalizeFixedExpression(entry.phrase)}`));
        if (includedSourceIds.size === 0) return false;

        const before = appData.cards.length;
        appData.cards = appData.cards.filter(card => !(
            card.source === 'topic-md'
            && normalizeCategory(card.category) === COLLOCATION_INTERMEDIATE_CATEGORY
            && card.sourceId
            && !includedSourceIds.has(card.sourceId)
        ));

        return appData.cards.length !== before;
    }

    function getDuplicateCardSortScore(card) {
        return [
            Number(card.reviewCount) || 0,
            Number(card.box) || 1,
            card.lastReviewed ? new Date(card.lastReviewed).getTime() || 0 : 0,
            card.createdAt ? new Date(card.createdAt).getTime() || 0 : 0
        ];
    }

    function compareDuplicateCardQuality(a, b) {
        const aScore = getDuplicateCardSortScore(a);
        const bScore = getDuplicateCardSortScore(b);
        for (let i = 0; i < aScore.length; i++) {
            if (aScore[i] !== bScore[i]) return bScore[i] - aScore[i];
        }
        return 0;
    }

    function cleanupDuplicateImportedCards() {
        const groups = new Map();
        appData.cards.forEach(card => {
            const key = getCardCategoryTermKey(card);
            if (!key) return;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(card);
        });

        const removeIds = new Set();
        groups.forEach(cards => {
            if (cards.length <= 1) return;

            const manualCards = cards.filter(isManualCard);
            if (manualCards.length > 0) {
                cards.filter(card => !isManualCard(card)).forEach(card => removeIds.add(card.id));
                return;
            }

            const [keeper, ...duplicates] = [...cards].sort(compareDuplicateCardQuality);
            duplicates.forEach(card => {
                if (card.id !== keeper.id) removeIds.add(card.id);
            });
        });

        if (removeIds.size === 0) return false;

        createStorageBackup(localStorage.getItem(STORAGE_KEY), 'before_duplicate_import_cleanup');
        appData.cards
            .filter(card => removeIds.has(card.id))
            .forEach(markImportedCardDeleted);
        appData.cards = appData.cards.filter(card => !removeIds.has(card.id));
        console.info('Duplicate imported cards removed:', removeIds.size);
        return true;
    }

    function isImportedPhraseCard(card) {
        return card && (
            card.source === 'fixed-expressions'
            || card.source === 'topic-md'
            || normalizeCategory(card.category) === FIXED_EXPRESSIONS_CATEGORY
        );
    }

    function isTelegramVocabularyCard(card) {
        return card && (
            card.source === 'telegram'
            || /^telegram:/i.test(card.sourceId || '')
            || normalizeCategory(card.category) === VOCABHUB_CATEGORY
        );
    }

    function removeTelegramVocabularyCards() {
        const beforeCount = appData.cards.length;
        const beforeCustomCount = Array.isArray(appData.customCategories) ? appData.customCategories.length : 0;

        appData.cards = appData.cards.filter(card => !isTelegramVocabularyCard(card));
        appData.customCategories = (appData.customCategories || []).filter(cat => normalizeCategory(cat) !== VOCABHUB_CATEGORY);

        const removedCards = beforeCount - appData.cards.length;
        const removedCategories = beforeCustomCount - appData.customCategories.length;
        if (removedCards <= 0 && removedCategories <= 0) return false;

        createStorageBackup(localStorage.getItem(STORAGE_KEY), 'before_remove_telegram_vocab');
        try {
            localStorage.setItem(TELEGRAM_VOCAB_REMOVED_KEY, JSON.stringify({
                removedCards,
                removedCategories,
                removedAt: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Could not record Telegram/VocabHub removal:', e);
        }
        return true;
    }

    function shouldPreserveExistingExample(card) {
        return normalizeCategory(card.category) === COLLOCATION_INTERMEDIATE_CATEGORY
            && compactText(card.example || '')
            && !isWeakGeneratedExample(card.example);
    }

    function loadData() {
        try {
            const s = localStorage.getItem(STORAGE_KEY);
            if (s) {
                const p = JSON.parse(s);
                appData = { ...appData, ...p };
            }
            lastPersistedDataUpdatedAt = appData.updatedAt || '';
            removeObsoleteAutomaticRecoveryKeys();
            appData.cards = Array.isArray(appData.cards) ? appData.cards : [];
            appData.stats = { totalReviews: 0, correctAnswers: 0, wrongAnswers: 0, streak: 0, lastReviewDate: null, history: [], ...appData.stats };
            if (!appData.customCategories) appData.customCategories = [];
            normalizeDeletedImportedSourceIds(appData);

            let migrated = false;
            let allowDestructiveSave = false;
            let allowCardRemovalSave = false;
            appData.cards.forEach(c => {
                const normalized = normalizeCategory(c.category);
                if (c.category !== normalized) migrated = true;
                c.category = normalized;
            });
            if (syncCustomCategoriesFromCards()) migrated = true;
            if (cleanupReturnedManualCardsFromBadRestore()) {
                migrated = true;
                allowDestructiveSave = true;
                allowCardRemovalSave = true;
            }
            if (removeTelegramVocabularyCards()) {
                migrated = true;
                allowDestructiveSave = true;
                allowCardRemovalSave = true;
            }
            if (removeDeprecatedAcademicPhraseCards()) {
                migrated = true;
                allowCardRemovalSave = true;
            }
            if (removeDeprecatedCollocationIntermediateCards()) {
                migrated = true;
                allowCardRemovalSave = true;
            }
            if (cleanupDuplicateImportedCards()) {
                migrated = true;
                allowCardRemovalSave = true;
            }
            if (migrated) {
                if (saveData({ allowDestructive: allowDestructiveSave, allowCardRemoval: allowCardRemovalSave })) {
                    finalizeReturnedManualCardsCleanup();
                }
            } else {
                createManualShadowBackup(appData);
            }
        } catch (e) { console.error(e); }
    }

    function loadReviewMode() {
        const saved = localStorage.getItem(REVIEW_MODE_KEY);
        currentReviewMode = REVIEW_MODES.includes(saved) ? saved : 'flashcard';
    }

    function setReviewMode(mode) {
        currentReviewMode = REVIEW_MODES.includes(mode) ? mode : 'flashcard';
        try { localStorage.setItem(REVIEW_MODE_KEY, currentReviewMode); } catch (e) { console.error(e); }
        updateReviewModeUI();
    }

    function updateReviewModeUI() {
        document.querySelectorAll('.mode-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.reviewMode === currentReviewMode);
        });
    }

    function normalizeCombinedReviewBatchSize(value) {
        const parsed = parseInt(value, 10);
        if (!Number.isFinite(parsed)) return DEFAULT_COMBINED_REVIEW_BATCH_SIZE;
        return Math.min(MAX_COMBINED_REVIEW_BATCH_SIZE, Math.max(MIN_COMBINED_REVIEW_BATCH_SIZE, parsed));
    }

    function loadCombinedReviewBatchSize() {
        combinedReviewBatchSize = normalizeCombinedReviewBatchSize(localStorage.getItem(COMBINED_REVIEW_BATCH_SIZE_KEY));
    }

    function setCombinedReviewBatchSize(value) {
        combinedReviewBatchSize = normalizeCombinedReviewBatchSize(value);
        try { localStorage.setItem(COMBINED_REVIEW_BATCH_SIZE_KEY, String(combinedReviewBatchSize)); } catch (e) { console.error(e); }
        updateCombinedReviewBatchSizeUI();
    }

    function updateCombinedReviewBatchSizeUI() {
        const input = document.getElementById('combinedBatchSizeInput');
        if (!input) return;
        input.value = String(combinedReviewBatchSize);
    }

    // ---- Dictionary API (American English priority) ----
    async function fetchPhonetic(word, options = {}) {
        const cleanWord = word.trim().toLowerCase();
        if (!cleanWord) return null;

        const abortPrevious = options.abortPrevious !== false;
        const updateCache = options.updateCache !== false;
        const fetchOptions = {};
        if (abortPrevious) {
            if (fetchAbort) fetchAbort.abort();
            fetchAbort = new AbortController();
            fetchOptions.signal = fetchAbort.signal;
        }

        try {
            const res = await fetch(DICT_API + encodeURIComponent(cleanWord), fetchOptions);
            if (!res.ok) return null;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return null;

            const entry = data[0];
            let phonetic = '';
            let audioUrl = '';

            // --- Find American phonetic & audio ---
            if (entry.phonetics && entry.phonetics.length > 0) {
                // 1st: US entries
                for (const ph of entry.phonetics) {
                    const isUS = ph.audio && (ph.audio.includes('-us') || ph.audio.includes('/us/'));
                    if (isUS) { if (ph.text) phonetic = ph.text; audioUrl = ph.audio; break; }
                }
                // 2nd: non-UK audio
                if (!audioUrl) {
                    for (const ph of entry.phonetics) {
                        const isUK = ph.audio && (ph.audio.includes('-uk') || ph.audio.includes('/uk/'));
                        if (!isUK && ph.audio) { audioUrl = ph.audio; if (ph.text) phonetic = ph.text; break; }
                    }
                }
                // 3rd: any audio
                if (!audioUrl) {
                    for (const ph of entry.phonetics) { if (ph.audio) { audioUrl = ph.audio; break; } }
                }
                // Phonetic text fallback
                if (!phonetic) {
                    for (const ph of entry.phonetics) {
                        if (ph.text && ph.audio && (ph.audio.includes('-us') || ph.audio.includes('/us/'))) { phonetic = ph.text; break; }
                    }
                }
                if (!phonetic) {
                    for (const ph of entry.phonetics) {
                        const isUK = ph.audio && (ph.audio.includes('-uk') || ph.audio.includes('/uk/'));
                        if (ph.text && !isUK) { phonetic = ph.text; break; }
                    }
                }
                if (!phonetic) {
                    for (const ph of entry.phonetics) { if (ph.text) { phonetic = ph.text; break; } }
                }
                if (!phonetic) phonetic = entry.phonetic || '';
            } else {
                phonetic = entry.phonetic || '';
            }

            const result = { word: cleanWord, phonetic, audioUrl };
            if (updateCache) lastFetchResult = result;
            return result;
        } catch (e) {
            if (e.name === 'AbortError') return null;
            console.error('Dict API error:', e);
            return null;
        }
    }

    // ---- Pronunciation Playback (Google Translate online voice first) ----
    function getGoogleTranslateTtsUrl(word) {
        const text = compactText(word).slice(0, GOOGLE_TRANSLATE_TTS_MAX_CHARS);
        if (!text) return '';
        const params = new URLSearchParams({
            ie: 'UTF-8',
            client: 'tw-ob',
            tl: GOOGLE_TRANSLATE_TTS_LANG,
            q: text
        });
        return `${GOOGLE_TRANSLATE_TTS_BASE_URL}?${params.toString()}`;
    }

    function stopActivePronunciationAudio() {
        if (!activePronunciationAudio) return;
        try {
            activePronunciationAudio.pause();
            activePronunciationAudio.currentTime = 0;
        } catch (e) {
            console.warn('Could not stop active pronunciation audio:', e);
        }
        activePronunciationAudio = null;
    }

    function playAudioSource(src) {
        if (!src) return Promise.reject(new Error('Missing audio source'));
        stopActivePronunciationAudio();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        const audio = new Audio(src);
        activePronunciationAudio = audio;
        audio.addEventListener('ended', () => {
            if (activePronunciationAudio === audio) activePronunciationAudio = null;
        }, { once: true });
        audio.addEventListener('error', () => {
            if (activePronunciationAudio === audio) activePronunciationAudio = null;
        }, { once: true });
        return audio.play();
    }

    function speakWord(word, audioUrl) {
        const googleAudioUrl = getGoogleTranslateTtsUrl(word);
        playAudioSource(googleAudioUrl).catch(() => {
            if (audioUrl) {
                playAudioSource(audioUrl).catch(() => speakWithSpeechAPI(word));
                return;
            }
            speakWithSpeechAPI(word);
        });
    }

    function getPreferredFemaleEnglishVoice(voices) {
        const englishVoices = (voices || []).filter(v => /^en([-_]|$)/i.test(v.lang || ''));
        if (englishVoices.length === 0) return null;

        const hasVoiceKeyword = (name, keyword) => {
            if (/^(female|woman|male|man)$/.test(keyword)) {
                return new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`).test(name);
            }
            return name.includes(keyword);
        };

        const scored = englishVoices.map(voice => {
            const lang = (voice.lang || '').toLowerCase();
            const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
            const hasFemaleName = FEMALE_ENGLISH_VOICE_KEYWORDS.some(keyword => hasVoiceKeyword(name, keyword));
            const hasMaleName = MALE_ENGLISH_VOICE_KEYWORDS.some(keyword => hasVoiceKeyword(name, keyword));
            let score = 0;

            if (lang === 'en-us') score += 60;
            else if (lang.startsWith('en-us')) score += 50;
            else if (lang.startsWith('en-')) score += 20;
            if (hasFemaleName) score += 100;
            if (hasMaleName) score -= 100;
            if (voice.localService) score += 5;
            if (/natural|online|premium/.test(name)) score += 4;

            return { voice, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored[0].voice;
    }

    function speakWithSpeechAPI(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = getPreferredFemaleEnglishVoice(voices);
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                utterance.lang = preferredVoice.lang || 'en-US';
            }
            window.speechSynthesis.speak(utterance);
        }
    }

    // ---- UI Updates ----
    function updateDashboard() {
        const total = appData.cards.length;
        const mastered = appData.cards.filter(c => c.box === 5).length;
        let totalDue = 0;

        document.getElementById('totalCards').textContent = total;
        document.getElementById('masteredCards').textContent = mastered;

        for (let box = 1; box <= 5; box++) {
            const bc = appData.cards.filter(c => c.box === box);
            const dc = bc.filter(isDue);
            totalDue += dc.length;
            document.getElementById(`box${box}Count`).textContent = bc.length;
            const pct = total > 0 ? (bc.length / total) * 100 : 0;
            document.getElementById(`box${box}Progress`).style.width = `${pct}%`;
            document.getElementById(`box${box}Due`).innerHTML = `<span class="due-badge">${toPersianNumber(dc.length)} کارت آماده مرور</span>`;
            document.getElementById(`reviewBox${box}`).disabled = dc.length === 0;
        }

        document.getElementById('dueCards').textContent = totalDue;

        // Update category review section
        updateCategoryReview();
    }

    // ---- Category Review Section ----
    function updateCategoryReview() {
        const container = document.getElementById('categoryReviewList');
        if (!container) return;
        container.innerHTML = '';

        // Get categories that have due cards
        const catMap = {};
        appData.cards.forEach(c => {
            const cat = normalizeCategory(c.category);
            if (!catMap[cat]) catMap[cat] = { total: 0, due: 0 };
            catMap[cat].total++;
            if (isDue(c)) catMap[cat].due++;
        });

        const cats = Object.entries(catMap).sort((a, b) => (b[1].due - a[1].due) || a[0].localeCompare(b[0]));

        if (cats.length === 0) {
            container.innerHTML = '<div class="cat-empty">هنوز کارتی اضافه نشده</div>';
            return;
        }

        cats.forEach(([cat, info]) => {
            const div = document.createElement('div');
            div.className = 'cat-review-item';
            if (info.due === 0) div.classList.add('no-due');
            div.innerHTML = `
                <div class="cat-review-info">
                    <span class="cat-review-name">${escapeHtml(cat)}</span>
                    <span class="cat-review-count">${toPersianNumber(info.total)} کارت · ${toPersianNumber(info.due)} آماده</span>
                </div>
                <button class="cat-review-btn" data-category="${escapeHtml(cat)}" ${info.due === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    مرور
                </button>
            `;
            container.appendChild(div);
        });

        // Bind review buttons
        container.querySelectorAll('.cat-review-btn').forEach(btn => {
            btn.addEventListener('click', () => openCategoryBoxPicker(btn.dataset.category));
        });
    }

    function getDueCardsForCategory(category, boxNumber = null) {
        const normalizedCategory = normalizeCategory(category);
        return appData.cards.filter(card => {
            if (normalizeCategory(card.category) !== normalizedCategory) return false;
            if (boxNumber !== null && Number(card.box) !== Number(boxNumber)) return false;
            return isDue(card);
        });
    }

    function getCategoryBoxStats(category) {
        const normalizedCategory = normalizeCategory(category);
        const stats = {};
        for (let box = 1; box <= 5; box++) stats[box] = { total: 0, due: 0 };

        appData.cards.forEach(card => {
            if (normalizeCategory(card.category) !== normalizedCategory) return;
            const box = Math.min(5, Math.max(1, Number(card.box) || 1));
            stats[box].total++;
            if (isDue(card)) stats[box].due++;
        });

        return stats;
    }

    function renderCategoryBoxPicker(category) {
        const picker = document.getElementById('categoryBoxPicker');
        if (!picker) return;
        const normalizedCategory = normalizeCategory(category);
        const stats = getCategoryBoxStats(normalizedCategory);
        const allDue = Object.values(stats).reduce((sum, info) => sum + info.due, 0);
        const allTotal = Object.values(stats).reduce((sum, info) => sum + info.total, 0);

        document.getElementById('categoryBoxModalTitle').textContent = normalizedCategory;
        picker.innerHTML = `
            <button class="category-box-option category-box-option-all" type="button" data-category="${escapeHtml(normalizedCategory)}" data-box="all" ${allDue === 0 ? 'disabled' : ''}>
                <span class="category-box-option-title">همه جعبه‌ها</span>
                <span class="category-box-option-count">${toPersianNumber(allDue)} آماده از ${toPersianNumber(allTotal)}</span>
            </button>
            ${[1, 2, 3, 4, 5].map(box => `
                <button class="category-box-option" type="button" data-category="${escapeHtml(normalizedCategory)}" data-box="${box}" ${stats[box].due === 0 ? 'disabled' : ''}>
                    <span class="category-box-option-title">${PERSIAN_BOX_NAMES[box]}</span>
                    <span class="category-box-option-count">${toPersianNumber(stats[box].due)} آماده از ${toPersianNumber(stats[box].total)}</span>
                </button>
            `).join('')}
        `;

        picker.querySelectorAll('.category-box-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedBox = btn.dataset.box === 'all' ? null : Number(btn.dataset.box);
                closeModal('categoryBoxModal');
                startCategoryReview(btn.dataset.category, selectedBox);
            });
        });
    }

    function openCategoryBoxPicker(category) {
        const normalizedCategory = normalizeCategory(category);
        if (getDueCardsForCategory(normalizedCategory).length === 0) {
            showToast('کارتی برای مرور در این دسته نیست', 'info');
            return;
        }
        renderCategoryBoxPicker(normalizedCategory);
        openModal('categoryBoxModal');
    }

    function buildCombinedReviewSteps(cards) {
        const steps = [];
        const batchSize = normalizeCombinedReviewBatchSize(combinedReviewBatchSize);
        for (let i = 0; i < cards.length; i += batchSize) {
            const chunk = cards.slice(i, i + batchSize);
            chunk.forEach(card => steps.push({ cardId: card.id, phase: isSentenceCard(card) ? 'sentence' : 'flashcard' }));
            chunk.forEach(card => {
                if (!isSentenceCard(card)) steps.push({ cardId: card.id, phase: 'typing' });
            });
        }
        return steps;
    }

    function createReviewSteps(cards, mode) {
        if (mode === 'combined') return buildCombinedReviewSteps(cards);
        const phase = mode === 'typing' ? 'typing' : 'flashcard';
        return cards.map(card => ({ cardId: card.id, phase: isSentenceCard(card) ? 'sentence' : phase }));
    }

    function startReviewSession(cards, boxNumber = null, category = null) {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        const steps = createReviewSteps(shuffled, currentReviewMode);
        reviewState = { boxNumber, category, mode: currentReviewMode, cards: shuffled, steps, combinedResults: {}, currentIndex: 0, correct: 0, wrong: 0, isFlipped: false, typedAnswered: false, typedCorrect: false, typedMistakes: 0, sentenceAnswered: false, sentenceCorrect: false };

        const flashcardContainer = document.getElementById('reviewCard').parentElement;
        const typingContainer = document.getElementById('typingReviewContainer');
        const sentenceContainer = document.getElementById('sentenceReviewContainer');
        document.getElementById('reviewComplete').style.display = 'none';
        flashcardContainer.style.display = 'none';
        typingContainer.style.display = 'none';
        if (sentenceContainer) sentenceContainer.style.display = 'none';
        document.getElementById('reviewActions').style.display = 'none';

        updateReviewCard();
        document.getElementById('reviewOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function startCategoryReview(category, boxNumber = null) {
        const normalizedCategory = normalizeCategory(category);
        const dueCards = getDueCardsForCategory(normalizedCategory, boxNumber);
        if (dueCards.length === 0) {
            showToast('کارتی برای مرور در این جعبه نیست', 'info');
            return;
        }

        startReviewSession(dueCards, boxNumber, normalizedCategory);
    }

    // ---- Card List (Table with Pagination) ----
    function updateDueOnlyToggleUI() {
        const toggle = document.getElementById('dueOnlyToggle');
        if (!toggle) return;
        toggle.classList.toggle('active', currentDueOnly);
        toggle.setAttribute('aria-pressed', currentDueOnly ? 'true' : 'false');
    }

    function getFilteredCards() {
        let filtered = [...appData.cards];
        if (currentFilter !== 'all') filtered = filtered.filter(c => c.box === parseInt(currentFilter));
        if (currentCategory !== 'all') filtered = filtered.filter(c => normalizeCategory(c.category) === currentCategory);
        if (currentDueOnly) filtered = filtered.filter(isDue);
        if (currentSearch.trim()) {
            const q = currentSearch.trim().toLowerCase();
            filtered = filtered.filter(c =>
                c.word.toLowerCase().includes(q) ||
                c.meaning.toLowerCase().includes(q) ||
                (c.pronunciation && c.pronunciation.toLowerCase().includes(q)) ||
                normalizeCategory(c.category).toLowerCase().includes(q)
            );
        }
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return filtered;
    }

    function syncSelectedCardIds() {
        const existingIds = new Set(appData.cards.map(card => card.id));
        Array.from(selectedCardIds).forEach(id => {
            if (!existingIds.has(id)) selectedCardIds.delete(id);
        });
    }

    function getSelectedCardIds() {
        syncSelectedCardIds();
        return Array.from(selectedCardIds);
    }

    function getSelectedCards() {
        return getCardsByIds(getSelectedCardIds());
    }

    function updateBulkSelectionUI() {
        syncSelectedCardIds();

        const selectedIds = getSelectedCardIds();
        const selectedCards = getSelectedCards();
        const bar = document.getElementById('bulkActionsBar');
        const count = document.getElementById('selectedCardsCount');
        const deleteBtn = document.getElementById('btnDeleteSelected');
        const movePrevBtn = document.getElementById('btnMoveSelectedPrev');
        const moveNextBtn = document.getElementById('btnMoveSelectedNext');
        const selectPage = document.getElementById('selectPageCards');
        const pageCheckboxes = Array.from(document.querySelectorAll('.card-select-checkbox'));
        const canMovePrev = selectedCards.some(card => normalizeBoxNumber(card.box) > 1);
        const canMoveNext = selectedCards.some(card => normalizeBoxNumber(card.box) < 5);

        if (bar) bar.style.display = selectedIds.length > 0 ? 'flex' : 'none';
        if (count) count.textContent = `${toPersianNumber(selectedIds.length)} کارت انتخاب شده`;
        if (deleteBtn) deleteBtn.disabled = selectedIds.length === 0;
        if (movePrevBtn) movePrevBtn.disabled = selectedIds.length === 0 || !canMovePrev;
        if (moveNextBtn) moveNextBtn.disabled = selectedIds.length === 0 || !canMoveNext;

        document.querySelectorAll('.card-row').forEach(row => {
            row.classList.toggle('selected', selectedCardIds.has(row.dataset.id));
        });

        if (selectPage) {
            const pageIds = pageCheckboxes.map(input => input.dataset.id);
            const selectedOnPage = pageIds.filter(id => selectedCardIds.has(id)).length;
            selectPage.disabled = pageIds.length === 0;
            selectPage.checked = pageIds.length > 0 && selectedOnPage === pageIds.length;
            selectPage.indeterminate = selectedOnPage > 0 && selectedOnPage < pageIds.length;
        }
    }

    function setVisibleCardsSelection(selected) {
        document.querySelectorAll('.card-select-checkbox').forEach(input => {
            if (selected) selectedCardIds.add(input.dataset.id);
            else selectedCardIds.delete(input.dataset.id);
            input.checked = selected;
        });
        updateBulkSelectionUI();
    }

    function clearCardSelection() {
        selectedCardIds.clear();
        document.querySelectorAll('.card-select-checkbox').forEach(input => { input.checked = false; });
        updateBulkSelectionUI();
    }

    function renderCards() {
        const emptyState = document.getElementById('emptyState');
        const tableWrapper = document.getElementById('cardsTableWrapper');
        const tbody = document.getElementById('cardsTableBody');
        syncSelectedCardIds();
        updateDueOnlyToggleUI();

        if (appData.cards.length === 0) {
            emptyState.style.display = '';
            tableWrapper.style.display = 'none';
            updateBulkSelectionUI();
            return;
        }

        emptyState.style.display = 'none';
        tableWrapper.style.display = '';

        const filtered = getFilteredCards();
        const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted);">کارتی با این فیلتر پیدا نشد</td></tr>`;
        } else {
            pageItems.forEach((card, i) => {
                const tr = document.createElement('tr');
                tr.className = `card-row ${selectedCardIds.has(card.id) ? 'selected' : ''}`;
                tr.dataset.id = card.id;
                tr.dataset.box = card.box;
                tr.style.animationDelay = `${i * 0.03}s`;
                const dueLabel = isDue(card) ? '<span class="status-due">🔔 آماده</span>' : '<span class="status-wait">⏳ انتظار</span>';
                const cat = normalizeCategory(card.category);
                const sentence = isSentenceCard(card);
                const leadControl = sentence
                    ? '<span class="card-type-chip">جمله</span>'
                    : `<button class="btn-speak-mini" data-word="${escapeHtml(card.word)}" data-audio="${escapeHtml(card.audioUrl || '')}" title="پخش تلفظ">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
                            </button>`;
                const phoneticCell = sentence ? '<span class="phonetic-text sentence-type-label">تمرین جمله</span>' : `<span class="phonetic-text">${escapeHtml(card.pronunciation || '—')}</span>`;

                tr.innerHTML = `
                    <td class="col-select">
                        <label class="table-checkbox" title="انتخاب این کارت">
                            <input type="checkbox" class="card-select-checkbox" data-id="${escapeHtml(card.id)}" ${selectedCardIds.has(card.id) ? 'checked' : ''}>
                            <span></span>
                        </label>
                    </td>
                    <td class="col-word">
                        <div class="cell-word-group">
                            ${leadControl}
                            <span class="word-text ${sentence ? 'sentence-word-text' : ''}">${escapeHtml(card.word)}</span>
                        </div>
                    </td>
                    <td class="col-phonetic">${phoneticCell}</td>
                    <td class="col-meaning">${escapeHtml(card.meaning)}</td>
                    <td class="col-category"><span class="category-badge">${escapeHtml(cat)}</span></td>
                    <td class="col-box"><span class="box-badge box-badge-${card.box}">${PERSIAN_BOX_NAMES[card.box]}</span></td>
                    <td class="col-status">${dueLabel}</td>
                    <td class="col-actions">
                        <div class="row-actions">
                            <button class="card-action-btn edit" data-id="${card.id}" title="ویرایش">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="card-action-btn delete" data-id="${card.id}" title="حذف">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Pagination
        document.getElementById('currentPage').textContent = toPersianNumber(currentPage);
        document.getElementById('totalPages').textContent = toPersianNumber(totalPages);
        document.getElementById('btnPrevPage').disabled = currentPage <= 1;
        document.getElementById('btnNextPage').disabled = currentPage >= totalPages;
        document.getElementById('pagination').style.display = totalPages <= 1 ? 'none' : 'flex';

        // Bind actions
        tbody.querySelectorAll('.card-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => openEditCard(btn.dataset.id));
        });
        tbody.querySelectorAll('.card-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id));
        });
        tbody.querySelectorAll('.card-select-checkbox').forEach(input => {
            input.addEventListener('change', () => {
                if (input.checked) selectedCardIds.add(input.dataset.id);
                else selectedCardIds.delete(input.dataset.id);
                updateBulkSelectionUI();
            });
        });
        tbody.querySelectorAll('.btn-speak-mini').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); speakWord(btn.dataset.word, btn.dataset.audio || ''); });
        });
        updateBulkSelectionUI();
    }

    // ---- Card CRUD ----
    function applyPhoneticToCard(card, phData) {
        if (!card || !phData) return false;
        const nextPronunciation = phData.phonetic || '';
        const nextAudioUrl = phData.audioUrl || '';
        if ((card.pronunciation || '') === nextPronunciation && (card.audioUrl || '') === nextAudioUrl) return false;
        card.pronunciation = nextPronunciation;
        card.audioUrl = nextAudioUrl;
        return true;
    }

    function fetchAndApplyCardPhonetic(cardId, word) {
        const cleanWord = (word || '').trim().toLowerCase();
        if (!cardId || !cleanWord) return;

        const cached = lastFetchResult && lastFetchResult.word === cleanWord ? lastFetchResult : null;
        if (cached) {
            const card = appData.cards.find(c => c.id === cardId);
            if (card && !isSentenceCard(card) && normalizeFixedExpression(card.word) === normalizeFixedExpression(word) && applyPhoneticToCard(card, cached)) {
                if (saveData()) {
                    renderCards();
                    refreshReviewCardIfVisible(cardId);
                }
            }
            return;
        }

        fetchPhonetic(word, { abortPrevious: false, updateCache: false }).then(phData => {
            if (!phData) return;
            const card = appData.cards.find(c => c.id === cardId);
            if (!card || isSentenceCard(card) || normalizeFixedExpression(card.word) !== normalizeFixedExpression(word)) return;
            if (!applyPhoneticToCard(card, phData)) return;
            if (saveData()) {
                renderCards();
                refreshReviewCardIfVisible(cardId);
            }
        }).catch(e => {
            if (e && e.name !== 'AbortError') console.error(e);
        });
    }

    async function addCard(data) {
        const category = ensureCustomCategory(data.category);
        const cardType = normalizeCardFormType(data.cardType);
        const word = data.word.trim();
        if (hasDuplicateCardInCategory(category, word)) {
            showToast(cardType === CARD_TYPE_SENTENCE ? 'این جمله در همین دسته قبلاً وجود دارد' : 'این کلمه یا عبارت در همین دسته قبلاً وجود دارد', 'error');
            return false;
        }

        const card = {
            id: generateId(),
            cardType,
            word,
            pronunciation: '',
            audioUrl: '',
            meaning: data.meaning.trim(),
            example: cardType === CARD_TYPE_SENTENCE ? '' : (data.example ? data.example.trim() : ''),
            hint: cardType === CARD_TYPE_SENTENCE ? (data.hint ? data.hint.trim() : '') : '',
            notes: data.notes ? data.notes.trim() : '',
            category,
            box: 1,
            lastReviewed: null,
            createdAt: new Date().toISOString(),
            reviewCount: 0
        };

        const cleanWord = card.word.toLowerCase();
        const cachedPhData = cardType === CARD_TYPE_VOCABULARY && lastFetchResult && lastFetchResult.word === cleanWord ? lastFetchResult : null;
        if (cachedPhData) applyPhoneticToCard(card, cachedPhData);

        appData.cards.push(card);
        if (!saveData()) {
            appData.cards = appData.cards.filter(c => c.id !== card.id);
            showToast('کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'error');
            return false;
        }
        lastFetchResult = null;
        updateDashboard();
        renderCards();
        showToast(cardType === CARD_TYPE_SENTENCE ? 'کارت جمله با موفقیت اضافه شد ✅' : 'کارت با موفقیت اضافه شد ✅', 'success');
        if (cardType === CARD_TYPE_VOCABULARY && !cachedPhData) fetchAndApplyCardPhonetic(card.id, card.word);
        return true;
    }

    async function updateCard(id, data) {
        const card = appData.cards.find(c => c.id === id);
        if (!card) return false;

        const nextCardType = normalizeCardFormType(data.cardType);
        const nextWord = data.word.trim();
        const nextCategory = ensureCustomCategory(data.category);
        if (hasDuplicateCardInCategory(nextCategory, nextWord, id)) {
            showToast(nextCardType === CARD_TYPE_SENTENCE ? 'یک کارت با همین جمله در همین دسته وجود دارد' : 'یک کارت با همین کلمه یا عبارت در همین دسته وجود دارد', 'error');
            return false;
        }

        const wordChanged = normalizeFixedExpression(card.word) !== normalizeFixedExpression(nextWord);
        const typeChanged = getCardType(card) !== nextCardType;
        card.cardType = nextCardType;
        card.word = nextWord;
        card.meaning = data.meaning.trim();
        card.example = nextCardType === CARD_TYPE_SENTENCE ? '' : (data.example ? data.example.trim() : '');
        card.hint = nextCardType === CARD_TYPE_SENTENCE ? (data.hint ? data.hint.trim() : '') : '';
        card.notes = data.notes ? data.notes.trim() : '';
        card.category = nextCategory;

        if (nextCardType === CARD_TYPE_SENTENCE) {
            card.pronunciation = '';
            card.audioUrl = '';
        } else if (wordChanged || typeChanged) {
            const cachedPhData = lastFetchResult && lastFetchResult.word === nextWord.toLowerCase() ? lastFetchResult : null;
            if (cachedPhData) {
                applyPhoneticToCard(card, cachedPhData);
            } else {
                card.pronunciation = '';
                card.audioUrl = '';
            }
        }

        if (!saveData()) {
            showToast('ویرایش کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'error');
            return false;
        }
        lastFetchResult = null;
        updateDashboard();
        renderCards();
        refreshReviewCardIfVisible(id);
        showToast('کارت ویرایش شد ✏️', 'success');
        if (nextCardType === CARD_TYPE_VOCABULARY && (wordChanged || typeChanged) && !card.pronunciation && !card.audioUrl) fetchAndApplyCardPhonetic(id, card.word);
        return true;
    }

    function getCardsByIds(ids) {
        const wanted = new Set(ids.map(id => String(id || '')));
        return appData.cards.filter(card => wanted.has(card.id));
    }

    function moveCardsToAdjacentBox(ids, direction) {
        const step = direction > 0 ? 1 : -1;
        const uniqueIds = Array.from(new Set(ids.map(id => String(id || '')).filter(Boolean)));
        if (uniqueIds.length === 0) return false;

        const cardsToMove = getCardsByIds(uniqueIds);
        if (cardsToMove.length === 0) {
            clearCardSelection();
            showToast('کارت انتخاب‌شده‌ای پیدا نشد', 'info');
            return false;
        }

        const now = new Date().toISOString();
        let movedCount = 0;
        let skippedCount = 0;

        cardsToMove.forEach(card => {
            const currentBox = normalizeBoxNumber(card.box);
            const nextBox = normalizeBoxNumber(currentBox + step);

            if (nextBox === currentBox) {
                skippedCount++;
                return;
            }

            card.box = nextBox;
            card.lastReviewed = step > 0 ? now : null;
            card.reviewCount = (Number(card.reviewCount) || 0) + 1;
            movedCount++;
        });

        if (movedCount === 0) {
            const boundaryMessage = step > 0
                ? 'کارت انتخاب‌شده‌ای برای انتقال به جعبه بعدی وجود ندارد'
                : 'کارت انتخاب‌شده‌ای برای انتقال به جعبه قبلی وجود ندارد';
            updateBulkSelectionUI();
            showToast(boundaryMessage, 'info');
            return false;
        }

        if (!appData.stats) appData.stats = emptyStats();
        appData.stats.totalReviews = (Number(appData.stats.totalReviews) || 0) + movedCount;
        if (step > 0) {
            appData.stats.correctAnswers = (Number(appData.stats.correctAnswers) || 0) + movedCount;
        } else {
            appData.stats.wrongAnswers = (Number(appData.stats.wrongAnswers) || 0) + movedCount;
        }
        recordReviewActivityDate();

        if (!saveData()) {
            restoreAppDataFromRaw(localStorage.getItem(STORAGE_KEY));
            updateDashboard();
            renderCards();
            showToast('انتقال کارت‌ها ذخیره نشد', 'error');
            return false;
        }

        uniqueIds.forEach(id => selectedCardIds.delete(id));
        updateDashboard();
        populateCategoryFilter();
        renderCards();

        const targetLabel = step > 0 ? 'جعبه بعدی' : 'جعبه قبلی';
        const skippedMessage = skippedCount > 0 ? `، ${toPersianNumber(skippedCount)} کارت در مرز جعبه بود` : '';
        showToast(`${toPersianNumber(movedCount)} کارت به ${targetLabel} منتقل شد${skippedMessage}`, 'success');
        return true;
    }

    function moveSelectedCardsToAdjacentBox(direction) {
        return moveCardsToAdjacentBox(getSelectedCardIds(), direction);
    }

    function deleteCards(ids) {
        const uniqueIds = Array.from(new Set(ids.map(id => String(id || '')).filter(Boolean)));
        if (uniqueIds.length === 0) return false;

        const cardsToDelete = getCardsByIds(uniqueIds);
        if (cardsToDelete.length === 0) return false;

        const deleteIds = new Set(cardsToDelete.map(card => card.id));
        cardsToDelete.forEach(markImportedCardDeleted);
        appData.cards = appData.cards.filter(card => !deleteIds.has(card.id));

        if (!saveData({ allowCardRemoval: true })) {
            restoreAppDataFromRaw(localStorage.getItem(STORAGE_KEY));
            updateDashboard();
            renderCards();
            showToast('حذف کارت ذخیره نشد', 'error');
            return false;
        }

        cardsToDelete.forEach(card => selectedCardIds.delete(card.id));
        updateDashboard();
        populateCategoryFilter();
        renderCards();
        const message = cardsToDelete.length === 1
            ? 'کارت حذف شد 🗑️'
            : `${toPersianNumber(cardsToDelete.length)} کارت حذف شد 🗑️`;
        showToast(message, 'info');
        return true;
    }

    function deleteCard(id) {
        return deleteCards([id]);
    }

    function addToeflSampleCards() {
        const existingKeys = new Set(appData.cards.map(getCardCategoryTermKey).filter(Boolean));
        const samples = getToeflSampleWords();
        const now = Date.now();
        const cardsToAdd = [];

        samples.forEach((item, index) => {
            const key = getCategoryTermKey(item.category, item.word);
            if (existingKeys.has(key)) return;
            existingKeys.add(key);
            cardsToAdd.push({
                id: generateId(),
                word: item.word,
                pronunciation: '',
                audioUrl: '',
                meaning: item.meaning,
                example: '',
                notes: 'واژه پیشنهادی برای تمرین موضوعی تافل',
                category: item.category,
                box: 1,
                lastReviewed: null,
                createdAt: new Date(now + index).toISOString(),
                reviewCount: 0,
                source: 'toefl-sample-pack'
            });
        });

        if (cardsToAdd.length === 0) {
            showToast('همه واژگان نمونه قبلاً اضافه شده‌اند', 'info');
            return;
        }

        appData.cards.push(...cardsToAdd);
        currentPage = 1;
        currentCategory = 'all';
        saveData();
        populateCategoryFilter();
        updateDashboard();
        renderCards();
        showToast(`${toPersianNumber(cardsToAdd.length)} کارت نمونه تافل اضافه شد`, 'success');
    }

    // ---- Modals ----
    function openModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function isReviewActive() {
        const reviewOverlay = document.getElementById('reviewOverlay');
        return reviewOverlay && reviewOverlay.classList.contains('active');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = (document.querySelector('.modal-overlay.active') || isReviewActive()) ? 'hidden' : '';
    }

    function populateCategorySelect(inputEl) {
        if (!inputEl) return;
        const datalist = document.getElementById('categoryList');
        if (!datalist) return;
        datalist.innerHTML = '';
        const allCategories = [...CATEGORIES, ...(appData.customCategories || [])];
        const seen = new Set();
        allCategories.forEach(cat => {
            const key = String(cat || '').trim().toLowerCase();
            if (!key || seen.has(key)) return;
            seen.add(key);
            const opt = document.createElement('option');
            opt.value = cat;
            datalist.appendChild(opt);
        });
    }

    function normalizeCardFormType(type) {
        return type === CARD_TYPE_SENTENCE ? CARD_TYPE_SENTENCE : CARD_TYPE_VOCABULARY;
    }

    function setCardFormType(type, options = {}) {
        const cardType = normalizeCardFormType(type);
        activeCardFormType = cardType;
        const isSentence = cardType === CARD_TYPE_SENTENCE;

        const inputCardType = document.getElementById('inputCardType');
        if (inputCardType) inputCardType.value = cardType;

        document.querySelectorAll('.card-type-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cardType === cardType);
        });

        const vocabularyWordGroup = document.getElementById('vocabularyWordGroup');
        const sentenceTextGroup = document.getElementById('sentenceTextGroup');
        const vocabularyMeaningGroup = document.getElementById('vocabularyMeaningGroup');
        const sentenceMeaningGroup = document.getElementById('sentenceMeaningGroup');
        const vocabularyExampleGroup = document.getElementById('vocabularyExampleGroup');
        const sentenceHintGroup = document.getElementById('sentenceHintGroup');
        const phoneticHint = document.getElementById('phoneticHint');

        if (vocabularyWordGroup) vocabularyWordGroup.style.display = isSentence ? 'none' : '';
        if (sentenceTextGroup) sentenceTextGroup.style.display = isSentence ? '' : 'none';
        if (vocabularyMeaningGroup) vocabularyMeaningGroup.style.display = isSentence ? 'none' : '';
        if (sentenceMeaningGroup) sentenceMeaningGroup.style.display = isSentence ? '' : 'none';
        if (vocabularyExampleGroup) vocabularyExampleGroup.style.display = isSentence ? 'none' : '';
        if (sentenceHintGroup) sentenceHintGroup.style.display = isSentence ? '' : 'none';
        if (phoneticHint) phoneticHint.style.display = isSentence ? 'none' : '';

        const inputWord = document.getElementById('inputWord');
        const inputSentence = document.getElementById('inputSentence');
        const inputMeaning = document.getElementById('inputMeaning');
        const inputSentenceMeaning = document.getElementById('inputSentenceMeaning');
        const inputExample = document.getElementById('inputExample');
        const inputSentenceHint = document.getElementById('inputSentenceHint');

        if (inputWord) { inputWord.required = !isSentence; inputWord.disabled = isSentence; }
        if (inputSentence) { inputSentence.required = isSentence; inputSentence.disabled = !isSentence; }
        if (inputMeaning) { inputMeaning.required = !isSentence; inputMeaning.disabled = isSentence; }
        if (inputSentenceMeaning) { inputSentenceMeaning.required = isSentence; inputSentenceMeaning.disabled = !isSentence; }
        if (inputExample) inputExample.disabled = isSentence;
        if (inputSentenceHint) inputSentenceHint.disabled = !isSentence;

        if (isSentence) {
            clearWordStatus();
            lastFetchResult = null;
        }

        if (options.focus) {
            const target = isSentence ? inputSentence : inputWord;
            setTimeout(() => target && target.focus(), 50);
        }
    }

    function getCardFormData() {
        const cardType = normalizeCardFormType(document.getElementById('inputCardType').value);
        const isSentence = cardType === CARD_TYPE_SENTENCE;
        return {
            cardType,
            word: isSentence ? document.getElementById('inputSentence').value : document.getElementById('inputWord').value,
            meaning: isSentence ? document.getElementById('inputSentenceMeaning').value : document.getElementById('inputMeaning').value,
            example: isSentence ? '' : document.getElementById('inputExample').value,
            hint: isSentence ? document.getElementById('inputSentenceHint').value : '',
            notes: document.getElementById('inputNotes').value,
            category: document.getElementById('inputCategory').value
        };
    }

    function openAddCard() {
        document.getElementById('modalTitle').textContent = 'کارت جدید';
        document.getElementById('cardForm').reset();
        document.getElementById('editCardId').value = '';
        setCardFormType(CARD_TYPE_VOCABULARY);
        document.getElementById('inputExample').dataset.autoExample = 'false';
        document.getElementById('btnSaveCard').querySelector('span').textContent = 'ذخیره کارت';
        const catInput = document.getElementById('inputCategory');
        populateCategorySelect(catInput);
        if (catInput) {
            const preferredCategory = lastAddCardCategory || (currentCategory !== 'all' ? currentCategory : 'General');
            catInput.value = preferredCategory || 'General';
        }
        const hint = document.getElementById('categoryNewHint');
        if (hint) hint.style.display = 'none';
        clearWordStatus();
        lastFetchResult = null;
        openModal('cardModal');
        setTimeout(() => document.getElementById('inputWord').focus(), 300);
    }

    function resetAddCardFormForNextEntry(category) {
        clearTimeout(wordDebounce);
        wordDebounce = null;
        document.getElementById('inputWord').value = '';
        document.getElementById('inputSentence').value = '';
        document.getElementById('inputMeaning').value = '';
        document.getElementById('inputSentenceMeaning').value = '';
        document.getElementById('inputExample').value = '';
        document.getElementById('inputExample').dataset.autoExample = 'false';
        document.getElementById('inputSentenceHint').value = '';
        document.getElementById('inputNotes').value = '';
        document.getElementById('editCardId').value = '';
        document.getElementById('modalTitle').textContent = 'کارت جدید';
        setCardFormType(activeCardFormType);
        document.getElementById('btnSaveCard').querySelector('span').textContent = 'ذخیره کارت';
        const catInput = document.getElementById('inputCategory');
        if (catInput) catInput.value = category;
        const hint = document.getElementById('categoryNewHint');
        if (hint) hint.style.display = 'none';
        clearWordStatus();
        lastFetchResult = null;
        setTimeout(() => document.getElementById(activeCardFormType === CARD_TYPE_SENTENCE ? 'inputSentence' : 'inputWord').focus(), 50);
    }

    function openEditCard(id) {
        const card = appData.cards.find(c => c.id === id);
        if (!card) return;
        const cardType = getCardType(card);
        document.getElementById('modalTitle').textContent = 'ویرایش کارت';
        setCardFormType(cardType);
        document.getElementById('inputWord').value = cardType === CARD_TYPE_VOCABULARY ? card.word : '';
        document.getElementById('inputSentence').value = cardType === CARD_TYPE_SENTENCE ? card.word : '';
        document.getElementById('inputMeaning').value = cardType === CARD_TYPE_VOCABULARY ? card.meaning : '';
        document.getElementById('inputSentenceMeaning').value = cardType === CARD_TYPE_SENTENCE ? card.meaning : '';
        document.getElementById('inputExample').value = cardType === CARD_TYPE_VOCABULARY ? (card.example || '') : '';
        document.getElementById('inputExample').dataset.autoExample = 'false';
        document.getElementById('inputSentenceHint').value = cardType === CARD_TYPE_SENTENCE ? (card.hint || '') : '';
        document.getElementById('inputNotes').value = card.notes || '';
        document.getElementById('editCardId').value = card.id;
        document.getElementById('btnSaveCard').querySelector('span').textContent = 'بروزرسانی';
        const catInput = document.getElementById('inputCategory');
        populateCategorySelect(catInput);
        if (catInput) catInput.value = normalizeCategory(card.category);
        const hint = document.getElementById('categoryNewHint');
        if (hint) hint.style.display = 'none';
        clearWordStatus();
        if (cardType === CARD_TYPE_VOCABULARY && card.pronunciation) showWordStatus('success', card.pronunciation);
        lastFetchResult = null;
        openModal('cardModal');
        setTimeout(() => document.getElementById(cardType === CARD_TYPE_SENTENCE ? 'inputSentence' : 'inputWord').focus(), 300);
    }

    function openDeleteConfirm(id) {
        const card = appData.cards.find(c => c.id === id);
        if (!card) return;
        deleteCardId = id;
        pendingDeleteCardIds = [id];
        document.getElementById('deleteModalTitle').textContent = '⚠️ حذف کارت';
        document.getElementById('deleteMessage').textContent = 'آیا مطمئن هستید که می‌خواهید این کارت را حذف کنید؟';
        document.getElementById('deleteWordPreview').textContent = card.word + ' → ' + card.meaning;
        document.getElementById('btnConfirmDelete').textContent = 'حذف';
        openModal('deleteModal');
    }

    function openBulkDeleteConfirm() {
        const ids = getSelectedCardIds();
        if (ids.length === 0) {
            showToast('اول چند کارت را انتخاب کن', 'info');
            return;
        }

        const cards = getCardsByIds(ids);
        if (cards.length === 0) {
            clearCardSelection();
            showToast('کارت انتخاب‌شده‌ای پیدا نشد', 'info');
            return;
        }

        deleteCardId = null;
        pendingDeleteCardIds = cards.map(card => card.id);
        const preview = cards
            .slice(0, 4)
            .map(card => `${card.word} → ${card.meaning}`)
            .join('\n');
        const more = cards.length > 4 ? `\n… و ${toPersianNumber(cards.length - 4)} کارت دیگر` : '';

        document.getElementById('deleteModalTitle').textContent = '⚠️ حذف چند کارت';
        document.getElementById('deleteMessage').textContent = `آیا مطمئن هستید که می‌خواهید ${toPersianNumber(cards.length)} کارت انتخاب‌شده را حذف کنید؟`;
        document.getElementById('deleteWordPreview').textContent = preview + more;
        document.getElementById('btnConfirmDelete').textContent = 'حذف همه';
        openModal('deleteModal');
    }

    // ---- Word Status (phonetic preview) ----
    function showWordStatus(type, text) {
        const el = document.getElementById('wordStatus');
        el.className = 'input-status ' + type;
        if (type === 'loading') {
            el.innerHTML = '<div class="spinner-small"></div> در حال دریافت اطلاعات...';
        } else if (type === 'success') {
            el.innerHTML = `<span class="status-phonetic">${escapeHtml(text)}</span>`;
        } else if (type === 'error') {
            el.innerHTML = '<span class="status-notfound">اطلاعات یافت نشد</span>';
        }
    }

    function clearWordStatus() {
        document.getElementById('wordStatus').className = 'input-status';
        document.getElementById('wordStatus').innerHTML = '';
    }

    let wordDebounce = null;
    function handleWordInput() {
        const word = document.getElementById('inputWord').value.trim();
        if (!word || word.length < 2) { clearWordStatus(); lastFetchResult = null; return; }

        clearTimeout(wordDebounce);
        wordDebounce = setTimeout(async () => {
            showWordStatus('loading', '');
            const result = await fetchPhonetic(word);
            if (document.getElementById('inputWord').value.trim() !== word) return;
            if (result) {
                if (result.phonetic) showWordStatus('success', result.phonetic);
                else showWordStatus('error', '');
            } else {
                showWordStatus('error', '');
                lastFetchResult = null;
            }
        }, 600);
    }

    // ---- Review Mode ----
    function startReview(boxNumber) {
        const dueCards = appData.cards.filter(c => c.box === boxNumber && isDue(c));
        if (dueCards.length === 0) {
            showToast('کارتی برای مرور در این جعبه نیست', 'info');
            return;
        }

        startReviewSession(dueCards, boxNumber, null);
    }

    function hasPendingCombinedReviewResult() {
        if (reviewState.mode !== 'combined') return false;
        return Object.values(reviewState.combinedResults || {}).some(result =>
            result.flashcardCorrect !== null && result.typingCorrect === null
        );
    }

    function isReviewCompleteVisible() {
        const complete = document.getElementById('reviewComplete');
        return complete && complete.style.display !== 'none';
    }

    function shouldConfirmReviewExit() {
        if (!isReviewActive() || isReviewCompleteVisible()) return false;
        const typingInput = document.getElementById('typingAnswerInput');
        const sentenceInput = document.getElementById('sentenceAnswerInput');
        return reviewState.currentIndex > 0
            || reviewState.typedAnswered
            || reviewState.sentenceAnswered
            || hasPendingCombinedReviewResult()
            || Boolean(typingInput && typingInput.value.trim())
            || Boolean(sentenceInput && sentenceInput.value.trim());
    }

    function closeReview(options = {}) {
        if (!options.force && shouldConfirmReviewExit()) {
            const message = reviewState.mode === 'combined'
                ? 'از مرور ترکیبی خارج می‌شوی؟ کارت‌هایی که هر دو مرحله‌شان کامل شده ذخیره شده‌اند، اما جواب‌های مرحله‌ی ناقص ذخیره نمی‌شود.'
                : 'از مرور خارج می‌شوی؟ پاسخ‌های ثبت‌شده ذخیره شده‌اند، اما ادامه‌ی جلسه متوقف می‌شود.';
            if (!confirm(message)) return;
        }

        document.getElementById('reviewOverlay').classList.remove('active');
        clearReviewAutoPronunciation();
        clearReviewCardVisualState();
        document.body.style.overflow = document.querySelector('.modal-overlay.active') ? 'hidden' : '';
        updateDashboard();
        renderCards();
    }

    function getCurrentReviewStep() {
        const step = reviewState.steps[reviewState.currentIndex];
        if (!step) return null;

        const card = appData.cards.find(c => c.id === step.cardId)
            || reviewState.cards.find(c => c.id === step.cardId)
            || null;
        if (!card) return null;

        return { ...step, card };
    }

    function getCurrentReviewCard() {
        const step = getCurrentReviewStep();
        return step ? step.card : null;
    }

    function getCurrentReviewPhase() {
        const step = getCurrentReviewStep();
        if (step) return step.phase;
        return reviewState.mode === 'typing' ? 'typing' : 'flashcard';
    }

    function isCurrentTypingReview() {
        return getCurrentReviewPhase() === 'typing';
    }

    function isCurrentSentenceReview() {
        return getCurrentReviewPhase() === 'sentence';
    }

    function editCardDuringReview() {
        const card = getCurrentReviewCard();
        if (!card) return;
        openEditCard(card.id);
    }

    function clearReviewAutoPronunciation() {
        if (reviewAutoSpeakTimer) {
            clearTimeout(reviewAutoSpeakTimer);
            reviewAutoSpeakTimer = null;
        }
        stopActivePronunciationAudio();
    }

    function clearReviewCardVisualState() {
        const cardInner = document.getElementById('reviewCardInner');
        if (cardInner) cardInner.classList.remove('flipped', 'no-transition');
        reviewState.isFlipped = false;
        const actions = document.getElementById('reviewActions');
        if (actions) actions.style.display = 'none';
    }

    function resetReviewCardToFrontInstantly(cardInner) {
        if (!cardInner) return false;
        const hadBackVisible = reviewState.isFlipped || cardInner.classList.contains('flipped');
        if (!hadBackVisible) {
            cardInner.classList.remove('no-transition');
            return false;
        }
        cardInner.classList.add('no-transition');
        cardInner.classList.remove('flipped');
        void cardInner.offsetHeight;
        reviewState.isFlipped = false;
        return hadBackVisible;
    }

    function restoreReviewCardFlipAnimation(cardInner) {
        if (!cardInner) return;
        cardInner.classList.remove('no-transition');
    }

    function scheduleReviewAutoPronunciation(card, options = {}) {
        clearReviewAutoPronunciation();
        if (isSentenceCard(card)) return;
        if (!card || !card.word) return;

        const cardId = card.id;
        const allowTyping = options.allowTyping === true;
        reviewAutoSpeakTimer = setTimeout(() => {
            reviewAutoSpeakTimer = null;
            const currentCard = getCurrentReviewCard();
            if (!isReviewActive() || !currentCard || currentCard.id !== cardId) return;
            if (isCurrentTypingReview() && !allowTyping) return;
            speakWord(currentCard.word, currentCard.audioUrl || '');
        }, REVIEW_AUTO_PRONUNCIATION_DELAY_MS);
    }

    function refreshReviewCardIfVisible(cardId) {
        if (!isReviewActive()) return;
        const sessionIndex = reviewState.cards.findIndex(card => card.id === cardId);
        const stepIndex = reviewState.steps.findIndex(step => step.cardId === cardId);
        if (sessionIndex === -1 && stepIndex === -1) return;

        const updatedCard = appData.cards.find(card => card.id === cardId);
        if (!updatedCard) return;
        if (sessionIndex !== -1) reviewState.cards[sessionIndex] = updatedCard;

        const currentStep = reviewState.steps[reviewState.currentIndex];
        if (currentStep && currentStep.cardId === cardId) {
            if (isSentenceCard(updatedCard)) {
                currentStep.phase = 'sentence';
                reviewState.steps = reviewState.steps.filter((step, index) =>
                    index <= reviewState.currentIndex || step.cardId !== cardId || step.phase !== 'typing'
                );
                delete reviewState.combinedResults[cardId];
            } else if (currentStep.phase === 'sentence') {
                currentStep.phase = reviewState.mode === 'typing' ? 'typing' : 'flashcard';
                if (reviewState.mode === 'combined') {
                    currentStep.phase = 'flashcard';
                    const nextStep = reviewState.steps[reviewState.currentIndex + 1];
                    if (!nextStep || nextStep.cardId !== cardId || nextStep.phase !== 'typing') {
                        reviewState.steps.splice(reviewState.currentIndex + 1, 0, { cardId, phase: 'typing' });
                    }
                }
            }
            updateReviewCard();
        }
    }

    function updateReviewCard() {
        const card = getCurrentReviewCard();
        if (!card) return;

        const phase = getCurrentReviewPhase();
        const total = reviewState.steps.length || reviewState.cards.length;
        const current = reviewState.currentIndex + 1;

        document.getElementById('reviewCurrent').textContent = current;
        document.getElementById('reviewTotal').textContent = total;
        document.getElementById('reviewProgressFill').style.width = `${(current / total) * 100}%`;

        if (phase === 'typing') {
            document.getElementById('reviewCard').parentElement.style.display = 'none';
            document.getElementById('typingReviewContainer').style.display = 'flex';
            const sentenceContainer = document.getElementById('sentenceReviewContainer');
            if (sentenceContainer) sentenceContainer.style.display = 'none';
            updateTypingReviewCard(card);
            return;
        }

        if (phase === 'sentence') {
            document.getElementById('reviewCard').parentElement.style.display = 'none';
            document.getElementById('typingReviewContainer').style.display = 'none';
            const sentenceContainer = document.getElementById('sentenceReviewContainer');
            if (sentenceContainer) sentenceContainer.style.display = 'flex';
            updateSentenceReviewCard(card);
            return;
        }

        document.getElementById('reviewCard').parentElement.style.display = 'flex';
        document.getElementById('typingReviewContainer').style.display = 'none';
        const sentenceContainer = document.getElementById('sentenceReviewContainer');
        if (sentenceContainer) sentenceContainer.style.display = 'none';

        const cardInner = document.getElementById('reviewCardInner');
        const wasFlipped = resetReviewCardToFrontInstantly(cardInner);

        // Now safely update content; the front face is showing and the back is hidden.
        document.getElementById('reviewWord').textContent = card.word;
        document.getElementById('reviewPronunciation').textContent = card.pronunciation || '';
        document.getElementById('reviewBoxBadge').textContent = PERSIAN_BOX_NAMES[card.box];

        document.getElementById('reviewWordBack').textContent = card.word;
        document.getElementById('reviewMeaning').textContent = card.meaning;
        document.getElementById('reviewBoxBadgeBack').textContent = PERSIAN_BOX_NAMES[card.box];

        // Show category badge
        const reviewCategory = normalizeCategory(card.category);
        const catBadge = document.getElementById('reviewCategoryBadge');
        if (catBadge) catBadge.textContent = reviewCategory;
        const catBadgeBack = document.getElementById('reviewCategoryBadgeBack');
        if (catBadgeBack) catBadgeBack.textContent = reviewCategory;

        const exSec = document.getElementById('reviewExample');
        if (card.example) { exSec.style.display = 'flex'; document.getElementById('reviewExampleText').textContent = card.example; }
        else { exSec.style.display = 'none'; }

        const noteSec = document.getElementById('reviewNotes');
        if (card.notes) { noteSec.style.display = 'block'; document.getElementById('reviewNotesText').textContent = card.notes; }
        else { noteSec.style.display = 'none'; }

        reviewState.isFlipped = false;
        document.getElementById('reviewActions').style.display = 'none';

        // Restore transition and play entrance animation in the next frame
        if (wasFlipped) {
            requestAnimationFrame(() => {
                restoreReviewCardFlipAnimation(cardInner);
                // Entrance animation for the new card
                const reviewCard = document.getElementById('reviewCard');
                reviewCard.classList.remove('card-entrance');
                void reviewCard.offsetHeight;
                reviewCard.classList.add('card-entrance');
            });
        } else {
            restoreReviewCardFlipAnimation(cardInner);
        }

        scheduleReviewAutoPronunciation(card);
    }

    function updateTypingReviewCard(card) {
        const category = normalizeCategory(card.category);
        reviewState.typedAnswered = false;
        reviewState.typedCorrect = false;
        reviewState.typedMistakes = 0;

        document.getElementById('typingBoxBadge').textContent = PERSIAN_BOX_NAMES[card.box];
        document.getElementById('typingCategoryBadge').textContent = category;
        document.getElementById('typingMeaning').textContent = card.meaning;

        const input = document.getElementById('typingAnswerInput');
        input.value = '';
        input.disabled = false;
        input.classList.remove('correct', 'wrong');
        document.getElementById('btnCheckTypedAnswer').disabled = false;
        document.getElementById('btnGiveUpTyping').disabled = false;
        document.getElementById('btnNextTypedCard').style.display = 'none';
        document.getElementById('typingFeedback').className = 'typing-feedback';
        document.getElementById('typingFeedback').textContent = '';
        document.getElementById('typingHint').textContent = '';
        document.getElementById('typingReveal').style.display = 'none';
        document.getElementById('typingExample').style.display = 'none';
        document.getElementById('reviewActions').style.display = 'none';
        setTimeout(() => input.focus(), 100);
    }

    function updateSentenceReviewCard(card) {
        const category = normalizeCategory(card.category);
        reviewState.sentenceAnswered = false;
        reviewState.sentenceCorrect = false;

        const sentenceCard = document.querySelector('.sentence-review-card');
        if (sentenceCard) sentenceCard.classList.remove('sentence-answered');

        document.getElementById('sentenceBoxBadge').textContent = PERSIAN_BOX_NAMES[card.box];
        document.getElementById('sentenceCategoryBadge').textContent = category;
        document.getElementById('sentenceReviewMeaning').textContent = card.meaning;

        const input = document.getElementById('sentenceAnswerInput');
        input.value = '';
        input.disabled = false;
        input.classList.remove('correct', 'wrong');
        document.getElementById('btnCheckSentenceAnswer').disabled = false;
        document.getElementById('btnGiveUpSentence').disabled = false;
        document.getElementById('btnNextSentenceCard').style.display = 'none';
        document.getElementById('btnCheckSentenceAnswer').style.display = 'flex';
        document.getElementById('btnGiveUpSentence').style.display = 'flex';

        const hintButton = document.getElementById('btnShowSentenceHint');
        const hasHint = Boolean((card.hint || '').trim());
        hintButton.disabled = !hasHint;
        hintButton.title = hasHint ? 'نمایش راهنمایی' : 'برای این جمله راهنمایی ثبت نشده';
        hintButton.style.display = 'flex';

        const feedback = document.getElementById('sentenceFeedback');
        feedback.className = 'sentence-feedback';
        feedback.textContent = '';

        const hintPanel = document.getElementById('sentenceHintPanel');
        hintPanel.textContent = '';
        hintPanel.style.display = 'none';

        document.getElementById('sentenceCorrectAnswer').textContent = card.word;
        document.getElementById('sentenceReveal').style.display = 'none';
        document.getElementById('sentenceNotesReview').style.display = 'none';
        document.getElementById('reviewActions').style.display = 'none';
        clearReviewAutoPronunciation();
        setTimeout(() => input.focus(), 100);
    }

    function showSentenceHint(card) {
        if (!card || reviewState.sentenceAnswered) return;
        const feedback = document.getElementById('sentenceFeedback');
        const hintPanel = document.getElementById('sentenceHintPanel');
        const hintText = (card.hint || '').trim();
        if (!hintText) {
            feedback.className = 'sentence-feedback info';
            feedback.textContent = 'برای این جمله راهنمایی ثبت نشده';
            return;
        }
        hintPanel.textContent = hintText;
        hintPanel.style.display = 'block';
        feedback.className = 'sentence-feedback info';
        feedback.textContent = 'راهنمایی نمایش داده شد';
        document.getElementById('sentenceAnswerInput').focus();
    }

    function revealSentenceAnswer(card, correct, userAnswer = '') {
        reviewState.sentenceAnswered = true;
        reviewState.sentenceCorrect = correct;

        const input = document.getElementById('sentenceAnswerInput');
        input.disabled = true;
        input.classList.toggle('correct', correct);
        input.classList.toggle('wrong', !correct);

        const feedback = document.getElementById('sentenceFeedback');
        feedback.className = `sentence-feedback ${correct ? 'correct' : 'wrong'}`;
        feedback.textContent = correct ? 'درست بود' : userAnswer ? 'نادرست بود' : 'پاسخ نمایش داده شد';

        const sentenceCard = document.querySelector('.sentence-review-card');
        if (sentenceCard) sentenceCard.classList.add('sentence-answered');
        const hintPanel = document.getElementById('sentenceHintPanel');
        hintPanel.textContent = '';
        hintPanel.style.display = 'none';

        document.getElementById('sentenceCorrectAnswer').textContent = card.word;
        document.getElementById('sentenceReveal').style.display = 'flex';

        const notes = document.getElementById('sentenceNotesReview');
        const noteText = (card.notes || '').trim();
        if (noteText) {
            notes.textContent = noteText;
            notes.style.display = 'block';
        } else {
            notes.style.display = 'none';
        }

        document.getElementById('btnCheckSentenceAnswer').disabled = true;
        document.getElementById('btnGiveUpSentence').disabled = true;
        document.getElementById('btnShowSentenceHint').disabled = true;
        document.getElementById('btnCheckSentenceAnswer').style.display = 'none';
        document.getElementById('btnGiveUpSentence').style.display = 'none';
        document.getElementById('btnShowSentenceHint').style.display = 'none';
        document.getElementById('btnNextSentenceCard').style.display = 'flex';
        document.getElementById('btnNextSentenceCard').focus();
    }

    function checkSentenceAnswer() {
        const card = getCurrentReviewCard();
        if (!card || reviewState.sentenceAnswered) return;

        const input = document.getElementById('sentenceAnswerInput');
        const userAnswer = input.value.trim();
        if (!userAnswer) {
            const feedback = document.getElementById('sentenceFeedback');
            feedback.className = 'sentence-feedback info';
            feedback.textContent = 'اول جمله انگلیسی را تایپ کن';
            input.focus();
            return;
        }

        const correct = normalizeSentenceAnswer(userAnswer) === normalizeSentenceAnswer(card.word);
        revealSentenceAnswer(card, correct, userAnswer);
    }

    function giveUpSentenceAnswer() {
        const card = getCurrentReviewCard();
        if (!card || reviewState.sentenceAnswered) return;
        revealSentenceAnswer(card, false, '');
    }

    function advanceSentenceCard() {
        if (!reviewState.sentenceAnswered) {
            checkSentenceAnswer();
            return;
        }
        answerCard(reviewState.sentenceCorrect);
    }

    function revealTypedAnswer(card, correct, userAnswer = '') {
        reviewState.typedAnswered = true;
        reviewState.typedCorrect = correct;

        const input = document.getElementById('typingAnswerInput');
        input.disabled = true;
        input.classList.toggle('correct', correct);
        input.classList.toggle('wrong', !correct);

        const feedback = document.getElementById('typingFeedback');
        feedback.className = `typing-feedback ${correct ? 'correct' : 'wrong'}`;
        feedback.textContent = correct ? 'درست بود' : userAnswer ? 'نادرست بود' : 'پاسخ نمایش داده شد';
        document.getElementById('typingHint').textContent = '';

        document.getElementById('typingAnswerWord').textContent = card.word;
        document.getElementById('typingAnswerPronunciation').textContent = card.pronunciation || '';
        document.getElementById('typingReveal').style.display = 'flex';

        const example = document.getElementById('typingExample');
        if (card.example) {
            example.textContent = card.example;
            example.style.display = 'block';
        } else {
            example.style.display = 'none';
        }

        document.getElementById('btnCheckTypedAnswer').disabled = true;
        document.getElementById('btnGiveUpTyping').disabled = true;
        document.getElementById('btnNextTypedCard').style.display = 'flex';
        document.getElementById('btnNextTypedCard').focus();
        scheduleReviewAutoPronunciation(card, { allowTyping: true });
    }

    function showTypingHint(card) {
        const feedback = document.getElementById('typingFeedback');
        const hint = document.getElementById('typingHint');
        const input = document.getElementById('typingAnswerInput');
        const remaining = MAX_TYPING_HINTS - reviewState.typedMistakes;

        feedback.className = 'typing-feedback wrong';
        feedback.textContent = remaining > 0
            ? `غلط بود؛ ${toPersianNumber(remaining)} فرصت دیگر داری`
            : 'غلط بود؛ آخرین تلاش را انجام بده';
        hint.textContent = `Hint: ${createSpellingHint(card.word, reviewState.typedMistakes)}`;
        input.value = '';
        input.classList.remove('correct');
        input.classList.add('wrong');
        setTimeout(() => {
            input.classList.remove('wrong');
            input.focus();
        }, 250);
    }

    function checkTypedAnswer() {
        const card = getCurrentReviewCard();
        if (!card || reviewState.typedAnswered) return;

        const input = document.getElementById('typingAnswerInput');
        const userAnswer = input.value.trim();
        if (!userAnswer) {
            const feedback = document.getElementById('typingFeedback');
            feedback.className = 'typing-feedback info';
            feedback.textContent = 'اول جواب انگلیسی را تایپ کن';
            input.focus();
            return;
        }

        const correct = normalizeTypedAnswer(userAnswer) === normalizeTypedAnswer(card.word);
        if (correct) {
            revealTypedAnswer(card, true, userAnswer);
            return;
        }

        if (reviewState.typedMistakes < MAX_TYPING_HINTS) {
            reviewState.typedMistakes++;
            showTypingHint(card);
            return;
        }

        revealTypedAnswer(card, false, userAnswer);
    }

    function giveUpTypedAnswer() {
        const card = getCurrentReviewCard();
        if (!card || reviewState.typedAnswered) return;
        revealTypedAnswer(card, false, '');
    }

    function advanceTypedCard() {
        if (!reviewState.typedAnswered) {
            checkTypedAnswer();
            return;
        }
        answerCard(reviewState.typedCorrect);
    }

    function flipCard() {
        if (reviewState.isFlipped) return;
        reviewState.isFlipped = true;
        document.getElementById('reviewCardInner').classList.add('flipped');
        document.getElementById('reviewActions').style.display = 'flex';
    }

    function speakCurrentReviewCard() {
        const card = getCurrentReviewCard();
        if (card) {
            if (isSentenceCard(card) && isCurrentSentenceReview() && !reviewState.sentenceAnswered) return;
            clearReviewAutoPronunciation();
            speakWord(card.word, card.audioUrl || '');
        }
    }

    function getCombinedResult(cardId) {
        if (!reviewState.combinedResults[cardId]) {
            reviewState.combinedResults[cardId] = { flashcardCorrect: null, typingCorrect: null };
        }
        return reviewState.combinedResults[cardId];
    }

    function advanceReviewStep() {
        reviewState.currentIndex++;
        const total = reviewState.steps.length || reviewState.cards.length;

        if (reviewState.currentIndex >= total) finishReview();
        else updateReviewCard();
    }

    function answerCombinedStep(original, phase, correct) {
        const result = getCombinedResult(original.id);

        if (phase === 'flashcard') {
            result.flashcardCorrect = correct === true;
            advanceReviewStep();
            return;
        }

        result.typingCorrect = correct === true;
        const finalCorrect = result.flashcardCorrect === true && result.typingCorrect === true;
        const currentBox = Number(original.box) || 1;

        if (finalCorrect) {
            reviewState.correct++;
            original.box = Math.min(currentBox + 1, 5);
        } else {
            reviewState.wrong++;
            original.box = Math.max(currentBox - 1, 1);
        }

        original.lastReviewed = new Date().toISOString();
        original.reviewCount = (original.reviewCount || 0) + 1;
        appData.stats.totalReviews++;
        if (finalCorrect) appData.stats.correctAnswers++;
        else appData.stats.wrongAnswers++;

        saveData();
        advanceReviewStep();
    }

    function answerCard(correct) {
        const step = getCurrentReviewStep();
        const card = step ? step.card : null;
        if (!card) return;
        const original = appData.cards.find(c => c.id === card.id);
        if (!original) return;

        if (reviewState.mode === 'combined' && step.phase !== 'sentence') {
            answerCombinedStep(original, step.phase, correct);
            return;
        }

        const currentBox = Number(original.box) || 1;
        if (correct) {
            reviewState.correct++;
            original.box = Math.min(currentBox + 1, 5);
        } else {
            reviewState.wrong++;
            original.box = reviewState.mode === 'combined' ? Math.max(currentBox - 1, 1) : 1;
        }

        original.lastReviewed = new Date().toISOString();
        original.reviewCount = (original.reviewCount || 0) + 1;
        appData.stats.totalReviews++;
        if (correct) appData.stats.correctAnswers++;
        else appData.stats.wrongAnswers++;

        saveData();
        advanceReviewStep();
    }

    function deleteCardDuringReview() {
        const card = getCurrentReviewCard();
        if (!card) return;

        if (!confirm(`آیا از حذف کارت «${card.word}» مطمئن هستید؟`)) return;

        markImportedCardDeleted(card);
        // Remove from main data
        appData.cards = appData.cards.filter(c => c.id !== card.id);

        if (!saveData({ allowCardRemoval: true })) {
            showToast('حذف کارت ذخیره نشد', 'error');
            return;
        }

        // Remove from review session
        reviewState.cards = reviewState.cards.filter(c => c.id !== card.id);
        reviewState.steps = reviewState.steps.filter(step => step.cardId !== card.id);
        delete reviewState.combinedResults[card.id];

        showToast(`کارت «${card.word}» حذف شد 🗑️`, 'info');

        // If no more cards, finish review
        if (reviewState.steps.length === 0 || reviewState.cards.length === 0) {
            finishReview();
            return;
        }

        // If we were at the end, go back one
        if (reviewState.currentIndex >= reviewState.steps.length) {
            reviewState.currentIndex = reviewState.steps.length - 1;
        }

        updateReviewCard();
    }

    function finishReview() {
        clearReviewAutoPronunciation();
        recordReviewActivityDate();

        appData.stats.history.unshift({ date: new Date().toISOString(), box: reviewState.boxNumber, category: reviewState.category, correct: reviewState.correct, wrong: reviewState.wrong, total: reviewState.cards.length });
        if (appData.stats.history.length > 50) appData.stats.history = appData.stats.history.slice(0, 50);
        saveData();
        clearReviewCardVisualState();

        document.getElementById('reviewCard').parentElement.style.display = 'none';
        document.getElementById('typingReviewContainer').style.display = 'none';
        const sentenceContainer = document.getElementById('sentenceReviewContainer');
        if (sentenceContainer) sentenceContainer.style.display = 'none';
        document.getElementById('reviewActions').style.display = 'none';
        document.getElementById('reviewComplete').style.display = 'flex';

        const total = reviewState.correct + reviewState.wrong;
        document.getElementById('completeCorrect').textContent = reviewState.correct;
        document.getElementById('completeWrong').textContent = reviewState.wrong;
        document.getElementById('completeAccuracy').textContent = `${total > 0 ? Math.round((reviewState.correct / total) * 100) : 0}%`;
        setTimeout(() => {
            const finishButton = document.getElementById('btnFinishReview');
            if (finishButton) finishButton.focus();
        }, 50);
    }

    // ---- Stats ----
    function updateStatsModal() {
        document.getElementById('statTotalCards').textContent = appData.cards.length;
        document.getElementById('statTotalReviews').textContent = appData.stats.totalReviews;
        const ta = appData.stats.correctAnswers + appData.stats.wrongAnswers;
        document.getElementById('statAccuracy').textContent = `${ta > 0 ? Math.round((appData.stats.correctAnswers / ta) * 100) : 0}%`;
        document.getElementById('statStreak').textContent = appData.stats.streak;

        const maxC = Math.max(1, ...([1, 2, 3, 4, 5].map(b => appData.cards.filter(c => c.box === b).length)));
        for (let b = 1; b <= 5; b++) {
            const count = appData.cards.filter(c => c.box === b).length;
            document.getElementById(`chartBar${b}`).style.height = `${Math.max(3, maxC > 0 ? (count / maxC) * 100 : 0)}%`;
            document.getElementById(`chartValue${b}`).textContent = count;
        }

        const hc = document.getElementById('historyList');
        hc.innerHTML = '';
        if (appData.stats.history.length === 0) {
            hc.innerHTML = '<div class="history-empty">هنوز مروری انجام نشده</div>';
        } else {
            appData.stats.history.slice(0, 20).forEach(e => {
                const d = document.createElement('div');
                d.className = 'history-item';
                const label = e.category ? e.category : (e.box ? PERSIAN_BOX_NAMES[e.box] : '');
                d.innerHTML = `<span class="history-date">${formatDate(e.date)} · ${label}</span><div class="history-result"><span class="history-correct">✅ ${e.correct}</span><span class="history-wrong">❌ ${e.wrong}</span></div>`;
                hc.appendChild(d);
            });
        }
    }

    // ---- Export / Import ----
    function exportData() {
        const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leitner_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('فایل خروجی دانلود شد 📥', 'success');
    }

    function importData(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.cards && Array.isArray(imported.cards)) {
                    const existingIds = new Set(appData.cards.map(c => c.id));
                    const existingCategoryTermKeys = new Set(appData.cards.map(getCardCategoryTermKey).filter(Boolean));
                    const importedDeletedIds = Array.isArray(imported.deletedImportedSourceIds)
                        ? imported.deletedImportedSourceIds
                        : [];
                    const deletedIds = new Set([...normalizeDeletedImportedSourceIds(appData), ...importedDeletedIds.map(id => String(id || '').trim()).filter(Boolean)]);
                    appData.deletedImportedSourceIds = Array.from(deletedIds);

                    let addedCount = 0;
                    let skippedDuplicates = 0;
                    imported.cards.forEach(card => {
                        if (existingIds.has(card.id)) return;

                        card.category = normalizeCategory(card.category);
                        const categoryTermKey = getCardCategoryTermKey(card);
                        if (categoryTermKey && existingCategoryTermKeys.has(categoryTermKey)) {
                            skippedDuplicates++;
                            return;
                        }

                        appData.cards.push(card);
                        existingIds.add(card.id);
                        if (categoryTermKey) existingCategoryTermKeys.add(categoryTermKey);
                        addedCount++;
                    });
                    saveData();
                    updateDashboard();
                    renderCards();
                    const duplicateNote = skippedDuplicates > 0
                        ? `، ${toPersianNumber(skippedDuplicates)} تکراری رد شد`
                        : '';
                    showToast(`${toPersianNumber(addedCount)} کارت جدید اضافه شد${duplicateNote} 📤`, 'success');
                    closeModal('exportModal');
                } else { showToast('فرمت فایل نامعتبر است', 'error'); }
            } catch { showToast('خطا در خواندن فایل', 'error'); }
        };
        reader.readAsText(file);
    }

    // ---- Toast ----
    function showToast(message, type = 'info') {
        const c = document.getElementById('toastContainer');
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = message;
        c.appendChild(t);
        setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 3000);
    }

    // ---- Theme ----
    function loadTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
    }

    function toggleTheme() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem(THEME_KEY, 'dark');
            showToast('تم تاریک فعال شد 🌙', 'info');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem(THEME_KEY, 'light');
            showToast('تم روشن فعال شد ☀️', 'info');
        }
    }

    // ---- Particles ----
    function createParticles() {
        const c = document.getElementById('bgParticles');
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const s = Math.random() * 3 + 1;
            p.style.width = `${s}px`;
            p.style.height = `${s}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.animationDuration = `${Math.random() * 20 + 15}s`;
            p.style.animationDelay = `${Math.random() * 20}s`;
            c.appendChild(p);
        }
    }

    // ---- Populate Category Filter ----
    function populateCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        if (!select) return;
        const current = currentCategory || select.value || 'all';
        select.innerHTML = '<option value="all">همه دسته‌ها</option>';
        // Get categories that actually have cards
        const usedCats = new Set(appData.cards.map(c => normalizeCategory(c.category)));
        const allCats = [...CATEGORIES, ...(appData.customCategories || [])];
        const seenCats = new Set();
        allCats.forEach(cat => {
            const key = String(cat || '').trim().toLowerCase();
            if (!key || seenCats.has(key)) return;
            seenCats.add(key);
            const normalizedCat = normalizeCategory(cat);
            if (usedCats.has(normalizedCat)) {
                const count = appData.cards.filter(c => normalizeCategory(c.category) === normalizedCat).length;
                const opt = document.createElement('option');
                opt.value = normalizedCat;
                opt.textContent = `${normalizedCat} (${count})`;
                select.appendChild(opt);
            }
        });
        const hasCurrent = Array.from(select.options).some(opt => opt.value === current);
        select.value = hasCurrent ? current : 'all';
        currentCategory = select.value;
    }

    // ---- Event Bindings ----
    function bindEvents() {
        document.getElementById('btnAddCard').addEventListener('click', openAddCard);
        document.getElementById('btnAddCardEmpty').addEventListener('click', openAddCard);
        document.querySelectorAll('.mode-option').forEach(btn => {
            btn.addEventListener('click', () => setReviewMode(btn.dataset.reviewMode));
        });
        const combinedBatchInput = document.getElementById('combinedBatchSizeInput');
        if (combinedBatchInput) {
            combinedBatchInput.addEventListener('change', () => setCombinedReviewBatchSize(combinedBatchInput.value));
            combinedBatchInput.addEventListener('blur', updateCombinedReviewBatchSizeUI);
            combinedBatchInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                setCombinedReviewBatchSize(combinedBatchInput.value);
                combinedBatchInput.blur();
            });
        }

        document.getElementById('btnCloseModal').addEventListener('click', () => closeModal('cardModal'));
        document.getElementById('btnCancelModal').addEventListener('click', () => closeModal('cardModal'));
        document.getElementById('btnCloseCategoryBoxModal').addEventListener('click', () => closeModal('categoryBoxModal'));
        document.getElementById('btnCancelCategoryBoxModal').addEventListener('click', () => closeModal('categoryBoxModal'));

        ['cardModal', 'statsModal', 'exportModal', 'deleteModal', 'categoryBoxModal'].forEach(id => {
            document.getElementById(id).addEventListener('click', (e) => {
                if (e.target === e.currentTarget) closeModal(id);
            });
        });

        document.querySelectorAll('.card-type-option').forEach(btn => {
            btn.addEventListener('click', () => setCardFormType(btn.dataset.cardType, { focus: true }));
        });
        document.getElementById('inputWord').addEventListener('input', handleWordInput);
        document.getElementById('inputExample').addEventListener('input', (e) => {
            e.target.dataset.autoExample = 'false';
        });
        document.getElementById('inputCategory').addEventListener('input', () => {
            const val = document.getElementById('inputCategory').value.trim();
            const allCats = [...CATEGORIES, ...(appData.customCategories || [])];
            const isNew = val && !allCats.some(cat => String(cat || '').trim().toLowerCase() === val.toLowerCase());
            const hint = document.getElementById('categoryNewHint');
            if (hint) hint.style.display = isNew ? 'flex' : 'none';
        });

        // Card form submit
        document.getElementById('cardForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSaveCard');
            btn.disabled = true;
            btn.querySelector('span').textContent = 'در حال ذخیره...';

            const data = getCardFormData();

            data.category = ensureCustomCategory(data.category);

            const editId = document.getElementById('editCardId').value;
            const savedCategory = normalizeCategory(data.category);
            let saved = false;
            const idleLabel = editId ? 'بروزرسانی' : 'ذخیره کارت';
            try {
                if (editId) {
                    saved = await updateCard(editId, data);
                    if (saved) closeModal('cardModal');
                } else {
                    saved = await addCard(data);
                    if (saved) {
                        lastAddCardCategory = savedCategory;
                        resetAddCardFormForNextEntry(savedCategory);
                    }
                }
            } catch (err) {
                console.error(err);
                showToast('ذخیره کارت انجام نشد', 'error');
            } finally {
                btn.disabled = false;
                btn.querySelector('span').textContent = idleLabel;
            }

            if (!saved) return;
            populateCategoryFilter();
            renderCards();
        });

        // Delete
        document.getElementById('btnConfirmDelete').addEventListener('click', () => {
            if (pendingDeleteCardIds.length > 0) {
                const deleted = deleteCards(pendingDeleteCardIds);
                if (!deleted) return;
                closeModal('deleteModal');
                deleteCardId = null;
                pendingDeleteCardIds = [];
            }
        });
        document.getElementById('btnCancelDelete').addEventListener('click', () => { deleteCardId = null; pendingDeleteCardIds = []; closeModal('deleteModal'); });
        document.getElementById('selectPageCards').addEventListener('change', (e) => setVisibleCardsSelection(e.target.checked));
        document.getElementById('btnClearSelection').addEventListener('click', clearCardSelection);
        document.getElementById('btnMoveSelectedPrev').addEventListener('click', () => moveSelectedCardsToAdjacentBox(-1));
        document.getElementById('btnMoveSelectedNext').addEventListener('click', () => moveSelectedCardsToAdjacentBox(1));
        document.getElementById('btnDeleteSelected').addEventListener('click', openBulkDeleteConfirm);

        // Stats
        document.getElementById('btnStats').addEventListener('click', () => { updateStatsModal(); openModal('statsModal'); });
        document.getElementById('btnCloseStats').addEventListener('click', () => closeModal('statsModal'));

        // Export/Import
        document.getElementById('btnExport').addEventListener('click', () => openModal('exportModal'));
        document.getElementById('btnCloseExport').addEventListener('click', () => closeModal('exportModal'));
        document.getElementById('btnDoExport').addEventListener('click', exportData);
        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
        });

        // Review buttons (per box)
        for (let box = 1; box <= 5; box++) {
            document.getElementById(`reviewBox${box}`).addEventListener('click', () => startReview(box));
        }

        // Review interactions
        document.getElementById('reviewCard').addEventListener('click', (e) => {
            if (e.target.closest('.btn-speak')) return;
            flipCard();
        });
        document.getElementById('btnCorrect').addEventListener('click', () => answerCard(true));
        document.getElementById('btnWrong').addEventListener('click', () => answerCard(false));
        document.getElementById('btnEditDuringReview').addEventListener('click', editCardDuringReview);
        document.getElementById('btnEditDuringTyping').addEventListener('click', editCardDuringReview);
        document.getElementById('btnEditDuringSentence').addEventListener('click', editCardDuringReview);
        document.getElementById('btnDeleteDuringReview').addEventListener('click', deleteCardDuringReview);
        document.getElementById('btnDeleteDuringTyping').addEventListener('click', deleteCardDuringReview);
        document.getElementById('btnDeleteDuringSentence').addEventListener('click', deleteCardDuringReview);
        document.getElementById('btnExitReview').addEventListener('click', closeReview);
        document.getElementById('btnFinishReview').addEventListener('click', closeReview);

        document.getElementById('btnSpeakFront').addEventListener('click', (e) => { e.stopPropagation(); speakCurrentReviewCard(); });
        document.getElementById('btnSpeakBack').addEventListener('click', (e) => { e.stopPropagation(); speakCurrentReviewCard(); });
        document.getElementById('btnSpeakTyping').addEventListener('click', (e) => { e.stopPropagation(); speakCurrentReviewCard(); });
        document.getElementById('btnSpeakSentence').addEventListener('click', (e) => { e.stopPropagation(); speakCurrentReviewCard(); });
        document.getElementById('typingAnswerForm').addEventListener('submit', (e) => { e.preventDefault(); checkTypedAnswer(); });
        document.getElementById('btnGiveUpTyping').addEventListener('click', giveUpTypedAnswer);
        document.getElementById('btnNextTypedCard').addEventListener('click', advanceTypedCard);
        document.getElementById('sentenceAnswerForm').addEventListener('submit', (e) => { e.preventDefault(); checkSentenceAnswer(); });
        document.getElementById('btnShowSentenceHint').addEventListener('click', () => showSentenceHint(getCurrentReviewCard()));
        document.getElementById('btnGiveUpSentence').addEventListener('click', giveUpSentenceAnswer);
        document.getElementById('btnNextSentenceCard').addEventListener('click', advanceSentenceCard);

        document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);

        window.addEventListener('beforeunload', (e) => {
            if (!shouldConfirmReviewExit()) return;
            e.preventDefault();
            e.returnValue = '';
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            currentSearch = e.target.value; currentPage = 1; renderCards();
        });
        document.getElementById('dueOnlyToggle').addEventListener('click', () => {
            currentDueOnly = !currentDueOnly;
            currentPage = 1;
            renderCards();
        });

        // Box filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                currentPage = 1;
                renderCards();
            });
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            renderCards();
        });

        // Pagination
        document.getElementById('btnPrevPage').addEventListener('click', () => { currentPage--; renderCards(); });
        document.getElementById('btnNextPage').addEventListener('click', () => { currentPage++; renderCards(); });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            const reviewActive = document.getElementById('reviewOverlay').classList.contains('active');
            if (reviewActive) {
                if (isReviewCompleteVisible()) {
                    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
                        e.preventDefault();
                        closeReview({ force: true });
                    }
                    return;
                }
                if (isCurrentTypingReview()) {
                    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); advanceTypedCard(); }
                    if (e.code === 'KeyS') { e.preventDefault(); speakCurrentReviewCard(); }
                    if (e.code === 'Escape') { e.preventDefault(); closeReview(); }
                    return;
                }
                if (isCurrentSentenceReview()) {
                    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); advanceSentenceCard(); }
                    if (e.code === 'KeyS') { e.preventDefault(); speakCurrentReviewCard(); }
                    if (e.code === 'Escape') { e.preventDefault(); closeReview(); }
                    return;
                }
                if ((e.code === 'Space' || e.code === 'Enter') && !reviewState.isFlipped) { e.preventDefault(); flipCard(); }
                if (e.code === 'ArrowRight' && reviewState.isFlipped) { e.preventDefault(); answerCard(true); }
                if (e.code === 'ArrowLeft' && reviewState.isFlipped) { e.preventDefault(); answerCard(false); }
                if (e.code === 'KeyS') { e.preventDefault(); speakCurrentReviewCard(); }
                if (e.code === 'Escape') { e.preventDefault(); closeReview(); }
            } else {
                const anyModal = document.querySelector('.modal-overlay.active');
                if (anyModal) { if (e.code === 'Escape') { e.preventDefault(); anyModal.classList.remove('active'); document.body.style.overflow = ''; } return; }
                if (e.code === 'KeyN') { e.preventDefault(); openAddCard(); }
                if (e.code === 'KeyT') { e.preventDefault(); toggleTheme(); }
            }
        });

        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }

    // ---- Initialize ----
    async function init() {
        loadTheme();
        loadData();
        loadReviewMode();
        loadCombinedReviewBatchSize();
        createParticles();
        bindEvents();
        updateReviewModeUI();
        updateCombinedReviewBatchSizeUI();
        await syncFixedExpressions(true);
        await syncTopicMarkdownPhrases(true);
        populateCategoryFilter();
        updateDashboard();
        renderCards();

        const today = new Date().toDateString();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (appData.stats.lastReviewDate && appData.stats.lastReviewDate !== today && appData.stats.lastReviewDate !== yesterday.toDateString()) {
            appData.stats.streak = 0;
            saveData();
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
