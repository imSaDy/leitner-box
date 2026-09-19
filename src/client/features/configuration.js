/** configuration: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    ctx.REVIEW_AUTO_PRONUNCIATION_DELAY_MS = 0;
    ctx.GOOGLE_TRANSLATE_TTS_BASE_URL = 'https://translate.google.com/translate_tts';
    ctx.GOOGLE_TRANSLATE_TTS_LANG = 'en-US';
    ctx.GOOGLE_TRANSLATE_TTS_MAX_CHARS = 180;
    ctx.VOCABHUB_CATEGORY = 'VocabHub Daily';
    ctx.FIXED_EXPRESSIONS_CATEGORY = 'Fixed Expressions';
    ctx.ACADEMIC_PHRASES_CATEGORY = 'Academic Phrases';
    ctx.COLLOCATION_INTERMEDIATE_CATEGORY = 'Collocation Intermediate';
    ctx.FIXED_EXPRESSIONS_MD_URL = 'fixed.md';
    ctx.TOPIC_MARKDOWN_SOURCES = [
        { file: 'Technology.md', category: 'Technology' },
        { file: 'Meteorology.md', category: 'Meteorology' },
        { file: 'History.md', category: 'History' },
        { file: 'Geology.md', category: 'Geology' },
        { file: 'Business & Economy.md', category: 'Business & Economics' },
        { file: 'Animals Behavior.md', category: 'Animal Behavior' },
        { file: 'Accommodation & Food Service.md', category: 'Accommodation & Food Service' },
    ];
    ctx.DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    ctx.ITEMS_PER_PAGE = 12;
    ctx.BOX_INTERVALS = { 1: 1, 2: 2, 3: 5, 4: 14, 5: 30 };
    ctx.PERSIAN_BOX_NAMES = ['', 'جعبه ۱', 'جعبه ۲', 'جعبه ۳', 'جعبه ۴', 'جعبه ۵'];
    ctx.MAX_TYPING_HINTS = 2;
    ctx.DEFAULT_COMBINED_REVIEW_BATCH_SIZE = 10;
    ctx.MIN_COMBINED_REVIEW_BATCH_SIZE = 1;
    ctx.MAX_COMBINED_REVIEW_BATCH_SIZE = 50;
    ctx.REVIEW_MODES = ['flashcard', 'typing', 'combined'];
    ctx.CARD_TYPE_VOCABULARY = 'vocabulary';
    ctx.CARD_TYPE_SENTENCE = 'sentence';
    ctx.FEMALE_ENGLISH_VOICE_KEYWORDS = [
        'zira',
        'samantha',
        'jenny',
        'aria',
        'susan',
        'karen',
        'victoria',
        'allison',
        'ava',
        'joanna',
        'salli',
        'kendra',
        'kimberly',
        'ivy',
        'emma',
        'olivia',
        'moira',
        'tessa',
        'fiona',
        'serena',
        'female',
        'woman',
    ];
    ctx.MALE_ENGLISH_VOICE_KEYWORDS = ['david', 'mark', 'alex', 'daniel', 'george', 'fred', 'tom', 'male', 'man'];
    ctx.CATEGORIES = [
        'General',
        ctx.FIXED_EXPRESSIONS_CATEGORY,
        ctx.ACADEMIC_PHRASES_CATEGORY,
        ctx.COLLOCATION_INTERMEDIATE_CATEGORY,
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
        'Others',
    ];
    ctx.CATEGORY_ALIASES = {
        abstract: 'Abstract Concepts',
        accommodation: 'Accommodation & Food Service',
        'accommodation & food service': 'Accommodation & Food Service',
        'food service & accommodation': 'Accommodation & Food Service',
        'animal & environment': 'Animals & Environment',
        'animals behavior': 'Animal Behavior',
        'animal behavior': 'Animal Behavior',
        approach: 'Abstract Concepts',
        architecture: 'Architecture & Interior Design',
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
        development: 'Situations & Change',
        drama: 'Drama & Theater',
        education: 'Education & Teaching',
        'teaching activities': 'Education & Teaching',
        'teaching & instruction': 'Education & Teaching',
        'environmental & ecology': 'Environment & Ecology',
        'event & activity': 'Events & Activities',
        experience: 'Lifestyle & Experience',
        feature: 'Objects & Features',
        infrastructure: 'Infrastructure & Projects',
        'infrastructure projects': 'Infrastructure & Projects',
        job: 'Job & Career',
        lifestyle: 'Lifestyle & Experience',
        logistics: 'Logistics & Scheduling',
        'logistics service': 'Logistics & Scheduling',
        media: 'Media & Communication',
        object: 'Objects & Features',
        painting: 'Painting & Visual Arts',
        person: 'People & Society',
        project: 'Infrastructure & Projects',
        'schedule & planning': 'Logistics & Scheduling',
        'schedule conflicts': 'Logistics & Scheduling',
        situation: 'Situations & Change',
        change: 'Situations & Change',
        'spare time activity': 'Spare Time & Hobbies',
        study: 'Study Skills',
        general: 'General',
        vocabhub: ctx.VOCABHUB_CATEGORY,
        'vocabhub daily': ctx.VOCABHUB_CATEGORY,
        'vocabulary hub': ctx.VOCABHUB_CATEGORY,
        'fixed expressions': ctx.FIXED_EXPRESSIONS_CATEGORY,
        'fixed expression': ctx.FIXED_EXPRESSIONS_CATEGORY,
        expressions: ctx.FIXED_EXPRESSIONS_CATEGORY,
        'academic phrases': ctx.ACADEMIC_PHRASES_CATEGORY,
        'academic phrase': ctx.ACADEMIC_PHRASES_CATEGORY,
        'collocation intermediate': ctx.COLLOCATION_INTERMEDIATE_CATEGORY,
        'collocations intermediate': ctx.COLLOCATION_INTERMEDIATE_CATEGORY,
        'intermediate collocations': ctx.COLLOCATION_INTERMEDIATE_CATEGORY,
        others: 'Others',
    };
    ctx.CATEGORY_EXAMPLE_CONTEXTS = {
        General: 'an academic passage',
        [ctx.VOCABHUB_CATEGORY]: 'a daily TOEFL vocabulary lesson',
        [ctx.FIXED_EXPRESSIONS_CATEGORY]: 'a TOEFL reading passage',
        [ctx.ACADEMIC_PHRASES_CATEGORY]: 'a TOEFL academic passage',
        [ctx.COLLOCATION_INTERMEDIATE_CATEGORY]: 'an intermediate English collocations lesson',
        'Abstract Concepts': 'an abstract idea',
        'Accommodation & Food Service': 'campus housing and dining',
        Agriculture: 'modern farming',
        'Animal Behavior': 'how animals respond to their environment',
        'Animals & Environment': 'wildlife and natural habitats',
        Anthropology: 'human culture',
        Archaeology: 'an ancient settlement',
        'Architecture & Interior Design': 'the design of a public building',
        'Art History & Fine Arts': 'a museum exhibition',
        Astronomy: 'the formation of planets',
        Botany: 'plant growth',
        'Business & Economics': 'market behavior',
        Chemistry: 'a laboratory experiment',
        'Clubs & Campus Activities': 'a student organization',
        'Course Content & Assignments': 'a class assignment',
        'Drama & Theater': 'a stage performance',
        'Education & Teaching': 'classroom learning',
        'Environment & Ecology': 'an ecosystem',
        'Environmental Science': 'climate research',
        'Events & Activities': 'a campus event',
        Geography: 'regional landscapes',
        Geology: 'rock formation',
        History: 'a historical change',
        Humanities: 'a humanities discussion',
        'Information & Advising': 'academic advising',
        'Infrastructure & Projects': 'a construction project',
        'Job & Career': 'career planning',
        'Library & Bookstore': 'library research',
        'Lifestyle & Experience': 'daily life',
        Literature: 'a literary passage',
        'Logistics & Scheduling': 'a schedule change',
        'Marine Biology': 'ocean life',
        'Media & Communication': 'public communication',
        Meteorology: 'weather patterns',
        Music: 'a musical performance',
        'Objects & Features': 'the features of an object',
        'Painting & Visual Arts': 'a visual artwork',
        'People & Society': 'social behavior',
        Philosophy: 'an ethical question',
        Psychology: 'human behavior',
        'Situations & Change': 'a changing situation',
        Sociology: 'a social group',
        'Spare Time & Hobbies': 'free-time activities',
        'Study Skills': 'effective studying',
        Technology: 'new technology',
        Zoology: 'animal classification',
        Others: 'a TOEFL-style lecture',
    };
    ctx.TOEFL_SAMPLE_WORDS_BY_CATEGORY = {
        General: [
            ['analyze', 'تحلیل کردن', 'verb'],
            ['context', 'زمینه / بافت', 'noun'],
        ],
        'Abstract Concepts': [
            ['hypothesis', 'فرضیه', 'noun'],
            ['ambiguity', 'ابهام', 'noun'],
        ],
        'Accommodation & Food Service': [
            ['dormitory', 'خوابگاه', 'noun'],
            ['reservation', 'رزرو', 'noun'],
        ],
        Agriculture: [
            ['irrigation', 'آبیاری', 'noun'],
            ['crop', 'محصول کشاورزی', 'noun'],
        ],
        'Animal Behavior': [
            ['instinct', 'غریزه', 'noun'],
            ['forage', 'دنبال غذا گشتن', 'verb'],
        ],
        'Animals & Environment': [
            ['habitat', 'زیستگاه', 'noun'],
            ['predator', 'شکارچی', 'noun'],
        ],
        Anthropology: [
            ['kinship', 'خویشاوندی', 'noun'],
            ['ritual', 'آیین / مراسم', 'noun'],
        ],
        Archaeology: [
            ['artifact', 'شیء باستانی', 'noun'],
            ['excavation', 'حفاری', 'noun'],
        ],
        'Architecture & Interior Design': [
            ['facade', 'نمای ساختمان', 'noun'],
            ['layout', 'چیدمان / طرح', 'noun'],
        ],
        'Art History & Fine Arts': [
            ['Renaissance', 'رنسانس', 'noun'],
            ['aesthetic', 'زیباشناختی', 'adjective'],
        ],
        Astronomy: [
            ['orbit', 'مدار', 'noun'],
            ['galaxy', 'کهکشان', 'noun'],
        ],
        Botany: [
            ['germinate', 'جوانه زدن', 'verb'],
            ['photosynthesis', 'فتوسنتز', 'noun'],
        ],
        'Business & Economics': [
            ['revenue', 'درآمد', 'noun'],
            ['inflation', 'تورم', 'noun'],
        ],
        Chemistry: [
            ['compound', 'ترکیب شیمیایی', 'noun'],
            ['catalyst', 'کاتالیزور', 'noun'],
        ],
        'Clubs & Campus Activities': [
            ['membership', 'عضویت', 'noun'],
            ['volunteer', 'داوطلب شدن', 'verb'],
        ],
        'Course Content & Assignments': [
            ['thesis', 'تز / نظر اصلی', 'noun'],
            ['draft', 'پیش‌نویس', 'noun'],
        ],
        'Drama & Theater': [
            ['rehearsal', 'تمرین نمایش', 'noun'],
            ['dialogue', 'گفت‌وگو', 'noun'],
        ],
        'Education & Teaching': [
            ['curriculum', 'برنامه درسی', 'noun'],
            ['assessment', 'ارزیابی', 'noun'],
        ],
        'Environment & Ecology': [
            ['biodiversity', 'تنوع زیستی', 'noun'],
            ['conservation', 'حفاظت', 'noun'],
        ],
        'Environmental Science': [
            ['pollutant', 'آلاینده', 'noun'],
            ['sustainable', 'پایدار', 'adjective'],
        ],
        'Events & Activities': [
            ['venue', 'محل برگزاری', 'noun'],
            ['workshop', 'کارگاه آموزشی', 'noun'],
        ],
        Geography: [
            ['terrain', 'ناهمواری / زمین', 'noun'],
            ['peninsula', 'شبه‌جزیره', 'noun'],
        ],
        Geology: [
            ['sediment', 'رسوب', 'noun'],
            ['erosion', 'فرسایش', 'noun'],
        ],
        History: [
            ['dynasty', 'دودمان', 'noun'],
            ['revolution', 'انقلاب', 'noun'],
        ],
        Humanities: [
            ['ethics', 'اخلاقیات', 'noun'],
            ['interpretation', 'تفسیر', 'noun'],
        ],
        'Information & Advising': [
            ['appointment', 'قرار ملاقات', 'noun'],
            ['requirement', 'الزام / شرط', 'noun'],
        ],
        'Infrastructure & Projects': [
            ['blueprint', 'نقشه فنی', 'noun'],
            ['renovate', 'بازسازی کردن', 'verb'],
        ],
        'Job & Career': [
            ['internship', 'کارآموزی', 'noun'],
            ['resume', 'رزومه', 'noun'],
        ],
        'Library & Bookstore': [
            ['catalogue', 'فهرست', 'noun'],
            ['reference', 'مرجع', 'noun'],
        ],
        'Lifestyle & Experience': [
            ['routine', 'روال روزمره', 'noun'],
            ['adapt', 'سازگار شدن', 'verb'],
        ],
        Literature: [
            ['narrative', 'روایت', 'noun'],
            ['metaphor', 'استعاره', 'noun'],
        ],
        'Logistics & Scheduling': [
            ['postpone', 'به تعویق انداختن', 'verb'],
            ['itinerary', 'برنامه سفر', 'noun'],
        ],
        'Marine Biology': [
            ['plankton', 'پلانکتون', 'noun'],
            ['coral', 'مرجان', 'noun'],
        ],
        'Media & Communication': [
            ['broadcast', 'پخش کردن', 'verb'],
            ['persuade', 'متقاعد کردن', 'verb'],
        ],
        Meteorology: [
            ['forecast', 'پیش‌بینی هوا', 'noun'],
            ['humidity', 'رطوبت', 'noun'],
        ],
        Music: [
            ['melody', 'ملودی', 'noun'],
            ['rhythm', 'ریتم', 'noun'],
        ],
        'Objects & Features': [
            ['attribute', 'ویژگی', 'noun'],
            ['mechanism', 'سازوکار', 'noun'],
        ],
        'Painting & Visual Arts': [
            ['portrait', 'پرتره', 'noun'],
            ['texture', 'بافت', 'noun'],
        ],
        'People & Society': [
            ['community', 'جامعه / اجتماع', 'noun'],
            ['identity', 'هویت', 'noun'],
        ],
        Philosophy: [
            ['logic', 'منطق', 'noun'],
            ['virtue', 'فضیلت', 'noun'],
        ],
        Psychology: [
            ['cognition', 'شناخت', 'noun'],
            ['motivation', 'انگیزه', 'noun'],
        ],
        'Situations & Change': [
            ['transition', 'گذار / تغییر مرحله', 'noun'],
            ['consequence', 'پیامد', 'noun'],
        ],
        Sociology: [
            ['hierarchy', 'سلسله‌مراتب', 'noun'],
            ['norm', 'هنجار', 'noun'],
        ],
        'Spare Time & Hobbies': [
            ['leisure', 'اوقات فراغت', 'noun'],
            ['recreation', 'تفریح', 'noun'],
        ],
        'Study Skills': [
            ['summarize', 'خلاصه کردن', 'verb'],
            ['review', 'مرور کردن', 'verb'],
        ],
        Technology: [
            ['innovation', 'نوآوری', 'noun'],
            ['device', 'دستگاه', 'noun'],
        ],
        Zoology: [
            ['mammal', 'پستاندار', 'noun'],
            ['species', 'گونه', 'noun'],
        ],
        Others: [
            ['relevant', 'مرتبط', 'adjective'],
            ['unfamiliar', 'ناآشنا', 'adjective'],
        ],
    };
    Object.assign(ctx, {});
}
