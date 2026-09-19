const ENGLISH = new Map([
    ['جعبه لایتنر | Leitner Box - مرور لغات انگلیسی', 'Leitner Box | Spaced repetition for English'],
    [
        'اپلیکیشن جعبه لایتنر برای یادگیری و مرور لغات انگلیسی با سیستم مرور فاصله‌دار',
        'A local Leitner box for learning English with spaced repetition',
    ],
    ['رفتن به کتابخانهٔ کارت‌ها', 'Skip to card library'],
    ['جعبه لایتنر', 'Leitner Box'],
    ['بخش‌های برنامه', 'App sections'],
    ['میز مطالعه', 'Study desk'],
    ['موضوع‌ها', 'Topics'],
    ['کتابخانه', 'Library'],
    ['تغییر تم', 'Toggle theme'],
    ['پشتیبان‌گیری و ورود داده‌ها', 'Backup and import'],
    ['آمار', 'Statistics'],
    ['کارت جدید', 'New card'],
    ['فضای شخصی یادگیری', 'Your personal learning space'],
    ['هر مرور،', 'Every review,'],
    ['یک قدم', 'one step'],
    ['ماندگار.', 'that lasts.'],
    ['کمی تمرین امروز، ماندگاری بیشتر فردا.', 'A little practice today, stronger recall tomorrow.'],
    ['آماده‌سازی مرور…', 'Preparing your review…'],
    ['رفتن به کتابخانه', 'Go to library'],
    ['مرور با همان زمان‌بندی شخصی شما', 'Review on your own schedule'],
    ['یاد بگیر. مرور کن. به خاطر بسپار.', 'Learn. Review. Remember.'],
    ['کارت در کتابخانه', 'cards in your library'],
    ['گنجینهٔ واژه‌های شما', 'Your growing collection'],
    ['کارت آمادهٔ مرور', 'cards ready to review'],
    ['فرصت یادگیری امروز', "Today's learning opportunity"],
    ['کارت در جعبهٔ تسلط', 'cards mastered'],
    ['حاصل استمرار شما', 'Built through consistency'],
    ['۰۱', '01'],
    ['۰۲', '02'],
    ['۰۳', '03'],
    ['مسیر یادگیری', 'Learning path'],
    ['کارت‌ها بر اساس پیشرفت شما بین جعبه‌ها جابجا می‌شوند', 'Cards move between boxes as you progress'],
    ['روش مرور', 'Review mode'],
    ['کارت', 'Flashcards'],
    ['تایپ انگلیسی', 'English typing'],
    ['ترکیبی', 'Combined'],
    [
        'تعداد کارت‌هایی که قبل از تمرین تایپی در مرور ترکیبی نمایش داده می‌شود',
        'Cards shown before the typing stage in combined review',
    ],
    ['بسته ترکیبی', 'Combined batch'],
    [
        'کارت را ببینید، پاسخ را به یاد بیاورید و خودتان ارزیابی کنید.',
        'See the card, recall the answer, and grade yourself.',
    ],
    ['معنی فارسی را ببینید و معادل انگلیسی را تایپ کنید.', 'See the Persian meaning and type the English answer.'],
    [
        'اول مرور کارت‌ها، بعد تمرین تایپ؛ تعداد کارت‌های هر بسته را انتخاب کنید.',
        'Review cards first, then practise typing. Choose the batch size.',
    ],
    ['۱', '1'],
    ['۲', '2'],
    ['۳', '3'],
    ['۴', '4'],
    ['۵', '5'],
    ['جعبه اول', 'Box one'],
    ['جعبه دوم', 'Box two'],
    ['جعبه سوم', 'Box three'],
    ['جعبه چهارم', 'Box four'],
    ['تسلط یافته', 'Mastered'],
    ['هر روز', 'Every day'],
    ['هر ۲ روز', 'Every 2 days'],
    ['هر ۵ روز', 'Every 5 days'],
    ['هر ۱۴ روز', 'Every 14 days'],
    ['هر ۳۰ روز', 'Every 30 days'],
    ['شروع مرور', 'Start review'],
    ['مرور', 'Review'],
    ['مرور موضوعی', 'Review by topic'],
    ['کارت‌های آماده مرور را بر اساس موضوع تمرین کنید', 'Practise due cards by topic'],
    ['پیدا کردن موضوع…', 'Find a topic…'],
    ['جستجوی موضوع‌های مرور', 'Search review topics'],
    ['موضوعی پیدا نشد؛ عبارت دیگری را امتحان کنید.', 'No topics found. Try another search.'],
    ['نمایش همهٔ موضوع‌ها', 'Show all topics'],
    ['نمایش کمتر ↑', 'Show less ↑'],
    ['کتابخانهٔ کارت‌ها', 'Card library'],
    ['واژه‌ها، عبارت‌ها و جمله‌های شما، یک‌جا.', 'All your words, phrases, and sentences in one place.'],
    ['جستجوی واژه، معنی یا دسته…', 'Search words, meanings, or categories…'],
    ['جستجوی کارت‌ها', 'Search cards'],
    ['فیلتر دسته‌بندی', 'Filter by category'],
    ['همه دسته‌ها', 'All categories'],
    ['نمایش فقط کارت‌های آماده مرور', 'Show due cards only'],
    ['آماده مرور', 'Due for review'],
    ['همه', 'All'],
    ['جعبه ۱', 'Box 1'],
    ['جعبه ۲', 'Box 2'],
    ['جعبه ۳', 'Box 3'],
    ['جعبه ۴', 'Box 4'],
    ['جعبه ۵', 'Box 5'],
    ['پاک‌کردن فیلترها ×', 'Clear filters ×'],
    ['هنوز کارتی اضافه نشده!', 'No cards yet!'],
    ['هنوز کارتی اضافه نشده', 'No cards yet'],
    ['با کلیک روی دکمه «کارت جدید» اولین لغت خود را اضافه کنید', 'Select “New card” to add your first word.'],
    ['اضافه کردن کارت', 'Add a card'],
    ['۰ کارت انتخاب شده', '0 cards selected'],
    ['لغو انتخاب', 'Clear selection'],
    ['جعبه قبلی', 'Previous box'],
    ['جعبه بعدی', 'Next box'],
    ['حذف انتخاب‌شده‌ها', 'Delete selected'],
    ['انتخاب کارت‌های این صفحه', 'Select cards on this page'],
    ['انتخاب همهٔ کارت‌های این صفحه', 'Select all cards on this page'],
    ['کلمه', 'Word'],
    ['تلفظ', 'Pronunciation'],
    ['معنی', 'Meaning'],
    ['دسته', 'Category'],
    ['جعبه', 'Box'],
    ['وضعیت', 'Status'],
    ['عملیات', 'Actions'],
    ['صفحه', 'Page'],
    ['از', 'of'],
    ['نوع کارت', 'Card type'],
    ['کلمه / عبارت', 'Word / phrase'],
    ['جمله', 'Sentence'],
    ['کلمه یا اصطلاح انگلیسی', 'English word or phrase'],
    [
        'تلفظ فونتیک به‌صورت خودکار از اینترنت دریافت می‌شود',
        'Phonetic pronunciation is fetched automatically from the internet.',
    ],
    ['جمله انگلیسی', 'English sentence'],
    ['معنی فارسی', 'Persian meaning'],
    ['مثلاً: خوش‌اقبالی', 'For example: good fortune'],
    ['معنی فارسی جمله', 'Persian sentence meaning'],
    ['ترجمه یا مفهوم فارسی جمله...', 'Persian translation or meaning…'],
    ['دسته موضوعی', 'Topic category'],
    ['انتخاب یا تایپ دسته جدید...', 'Choose or type a new category…'],
    ['دسته جدید ساخته خواهد شد', 'A new category will be created'],
    ['جمله نمونه (اختیاری)', 'Example sentence (optional)'],
    ['راهنمایی (اختیاری)', 'Hint (optional)'],
    [
        'مثلاً: با although شروع می‌شود، یا زمان جمله past perfect است...',
        'For example: starts with “although” or uses the past perfect…',
    ],
    ['یادداشت (اختیاری)', 'Notes (optional)'],
    ['یادداشت یا نکته‌ای برای حفظ بهتر...', 'A note or memory aid…'],
    ['انصراف', 'Cancel'],
    ['ذخیره کارت', 'Save card'],
    ['بروزرسانی', 'Update'],
    ['بازگشت', 'Back'],
    ['پخش تلفظ', 'Play pronunciation'],
    ['نمایش پاسخ', 'Show answer'],
    ['بررسی', 'Check'],
    ['بلد نیستم', "I don't know"],
    ['ویرایش این کارت', 'Edit this card'],
    ['ویرایش کارت', 'Edit card'],
    ['حذف این کارت', 'Delete this card'],
    ['حذف کارت', 'Delete card'],
    ['کارت بعدی', 'Next card'],
    ['معنی جمله', 'Sentence meaning'],
    ['پخش جمله', 'Play sentence'],
    ['راهنمایی', 'Hint'],
    ['بلد نبودم', 'I missed it'],
    ['برگشت به جعبه ۱', 'Return to Box 1'],
    ['بلد بودم', 'I knew it'],
    ['رفتن به جعبه بعدی', 'Move to the next box'],
    ['آفرین! مرور تمام شد', 'Well done! Review complete'],
    ['درست', 'Correct'],
    ['نادرست', 'Incorrect'],
    ['دقت', 'Accuracy'],
    ['بازگشت به داشبورد', 'Return to dashboard'],
    ['📊 آمار و پیشرفت', '📊 Statistics and progress'],
    ['کل کارت‌ها', 'Total cards'],
    ['کل مرورها', 'Total reviews'],
    ['دقت کل', 'Overall accuracy'],
    ['روز متوالی', 'Day streak'],
    ['توزیع کارت‌ها در جعبه‌ها', 'Card distribution by box'],
    ['تاریخچه مرورهای اخیر', 'Recent review history'],
    ['هنوز مروری انجام نشده', 'No reviews yet'],
    ['📦 خروجی / ورودی داده‌ها', '📦 Export / import data'],
    ['خروجی گرفتن', 'Export'],
    ['تمام کارت‌ها و تنظیمات خود را به صورت فایل JSON دانلود کنید', 'Download all cards and settings as a JSON file.'],
    ['دانلود فایل JSON', 'Download JSON file'],
    ['یا', 'or'],
    ['ورودی داده‌ها', 'Import data'],
    ['فایل JSON خود را بارگذاری کنید تا کارت‌ها اضافه شوند', 'Choose a JSON file to add its cards.'],
    ['انتخاب فایل JSON', 'Choose JSON file'],
    ['⚠️ حذف کارت', '⚠️ Delete card'],
    ['⚠️ حذف چند کارت', '⚠️ Delete multiple cards'],
    ['آیا مطمئن هستید که می‌خواهید این کارت را حذف کنید؟', 'Are you sure you want to delete this card?'],
    ['حذف', 'Delete'],
    ['حذف همه', 'Delete all'],
    ['انتخاب جعبه', 'Choose a box'],
    ['⌨️ میانبر:', '⌨️ Shortcuts:'],
    ['کارت جدید ·', 'New card ·'],
    ['تغییر تم ·', 'Theme ·'],
    ['نمایش پاسخ ·', 'Show answer ·'],
    ['نادرست ·', 'Incorrect ·'],
    ['درست ·', 'Correct ·'],
    ['نگه‌داری اطلاعات', 'Data storage'],
    ['در حال اتصال به اطلاعات…', 'Connecting to your data…'],
    ['نسخه‌های پشتیبان ↗', 'Backups ↗'],
    ['خانهٔ تازهٔ واژه‌هایت', 'A new home for your words'],
    ['یادگیری‌ات را همراه بیاور', 'Bring your learning with you'],
    [
        'اطلاعات در یک فایل پایگاه داده روی همین کامپیوتر نگه‌داری می‌شود. برای ادامه، فایل خروجی نسخهٔ قبلی را انتخاب کنید.',
        'Your data is stored in a database file on this computer. Choose an export from an earlier version to continue.',
    ],
    ['انتخاب فایل اطلاعات قبلی', 'Choose previous data file'],
    [
        'فایل index.html در پوشهٔ نسخهٔ جدید، ابزار انتقال است. اگر کتابخانه‌تان در نسخهٔ دیگری قرار دارد، از منوی خروجی همان برنامه فایل بگیرید؛ فایل خروجی قدیمی نیز پذیرفته می‌شود.',
        'The index.html file in the new folder is a migration tool. If your library is in another version, export it there and select the resulting file here.',
    ],
    ['انتقال اطلاعات و ادامه', 'Import data and continue'],
    ['دریافت نسخهٔ اصلی اطلاعات', 'Download original data'],
    ['ساخت کتابخانهٔ تازه', 'Create a new library'],
    ['اگر اطلاعات قبلی دارید، ابتدا آن‌ها را انتقال دهید.', 'If you have existing data, import it first.'],
    ['شروع با کتابخانهٔ خالی', 'Start with an empty library'],
    ['شروع با کارت‌های نمونه', 'Start with sample cards'],
    ['در حال ذخیره…', 'Saving…'],
    ['در حال ذخیره...', 'Saving…'],
    ['بررسی دوباره و ادامه', 'Retry and continue'],
    ['دریافت نسخهٔ اطلاعات در انتظار', 'Download pending data'],
    ['بارگذاری دوباره', 'Reload'],
    ['بستن', 'Close'],
    ['بستن پنجره', 'Close dialog'],
    [
        'کارت‌ها، پیشرفت مرور و تنظیمات روی همین کامپیوتر ذخیره می‌شوند. یک نسخهٔ خروجی روی حافظه‌ای دیگر هم نگه دارید.',
        'Cards, review progress, and settings stay on this computer. Keep an exported copy on another device too.',
    ],
    ['ساخت نسخهٔ پشتیبان', 'Create backup'],
    ['بازیابی از فایل', 'Restore from file'],
    ['محل نگه‌داری اطلاعات', 'Data location'],
    ['اولین کارت را بسازید', 'Create your first card'],
    ['مرورهای امروز انجام شده', "Today's reviews are complete"],
    ['یادگیری از یک واژه شروع می‌شود. اولین کارت را بسازید.', 'Learning starts with one word. Create your first card.'],
    [
        'در حال حاضر کارتی آمادهٔ مرور نیست. به‌موقع برگردید و ادامه دهید.',
        'No cards are due right now. Come back on schedule to continue.',
    ],
    [
        'کلمه، عبارت یا جمله؛ با مثال‌ها و یادداشت‌های خودتان.',
        'Words, phrases, or sentences with your own examples and notes.',
    ],
    ['می‌توانید کارت تازه اضافه کنید یا کتابخانه را ببینید.', 'Add a new card or browse your library.'],
    ['جلسهٔ مرور', 'Review session'],
    ['پنجرهٔ برنامه', 'Application dialog'],
    ['پاسخ انگلیسی', 'English answer'],
    ['جملهٔ انگلیسی', 'English sentence'],
    ['ذخیره در پایگاه داده', 'Saved in the database'],
    ['در پایگاه داده ذخیره شد', 'Saved in the database'],
    ['در حال بررسی و ذخیره…', 'Checking and saving…'],
    ['در حال انتقال اطلاعات…', 'Importing data…'],
    ['نسخهٔ پشتیبان دانلود شد', 'Backup downloaded'],
    ['فرمت فایل نامعتبر است', 'Invalid file format'],
    ['فایل باید شامل فهرست کارت‌ها باشد.', 'The file must include a list of cards.'],
    ['فایل JSON خوانا نیست.', 'The JSON file could not be read.'],
    ['اولین نسخهٔ پشتیبان را بسازید.', 'Create your first backup.'],
    ['این جمله در همین دسته قبلاً وجود دارد', 'This sentence already exists in this category.'],
    ['این کلمه یا عبارت در همین دسته قبلاً وجود دارد', 'This word or phrase already exists in this category.'],
    ['کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'The card was not saved. Please try again.'],
    ['کارت جمله با موفقیت اضافه شد ✅', 'Sentence card added ✅'],
    ['کارت با موفقیت اضافه شد ✅', 'Card added ✅'],
    ['یک کارت با همین جمله در همین دسته وجود دارد', 'A card with this sentence already exists in this category.'],
    [
        'یک کارت با همین کلمه یا عبارت در همین دسته وجود دارد',
        'A card with this word or phrase already exists in this category.',
    ],
    ['ویرایش کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'The card edit was not saved. Please try again.'],
    ['کارت ویرایش شد ✏️', 'Card updated ✏️'],
    ['کارت انتخاب‌شده‌ای پیدا نشد', 'No selected card was found.'],
    ['اول چند کارت را انتخاب کن', 'Select some cards first.'],
    ['کارت انتخاب‌شده‌ای برای انتقال به جعبه بعدی وجود ندارد', 'No selected card can move to the next box.'],
    ['کارت انتخاب‌شده‌ای برای انتقال به جعبه قبلی وجود ندارد', 'No selected card can move to the previous box.'],
    ['انتقال کارت‌ها ذخیره نشد', 'The card move was not saved.'],
    ['حذف کارت ذخیره نشد', 'The card deletion was not saved.'],
    ['کارت حذف شد 🗑️', 'Card deleted 🗑️'],
    ['همه واژگان نمونه قبلاً اضافه شده‌اند', 'All sample words have already been added.'],
    ['واژه پیشنهادی برای تمرین موضوعی تافل', 'Suggested word for TOEFL topic practice'],
    ['کارتی برای مرور در این دسته نیست', 'No cards are due in this category.'],
    ['همه جعبه‌ها', 'All boxes'],
    ['کارتی با این فیلتر پیدا نشد', 'No cards match these filters.'],
    ['🔔 آماده', '🔔 Due'],
    ['⏳ انتظار', '⏳ Waiting'],
    ['تمرین جمله', 'Sentence practice'],
    ['انتخاب این کارت', 'Select this card'],
    ['ویرایش', 'Edit'],
    ['کارتی برای مرور در این جعبه نیست', 'No cards are due in this box.'],
    ['نمایش راهنمایی', 'Show hint'],
    ['برای این جمله راهنمایی ثبت نشده', 'No hint was saved for this sentence.'],
    ['راهنمایی نمایش داده شد', 'Hint shown'],
    ['درست بود', 'Correct'],
    ['نادرست بود', 'Incorrect'],
    ['پاسخ نمایش داده شد', 'Answer shown'],
    ['اول جمله انگلیسی را تایپ کن', 'Type the English sentence first.'],
    ['غلط بود؛ آخرین تلاش را انجام بده', 'Not quite. Try one last time.'],
    ['اول جواب انگلیسی را تایپ کن', 'Type the English answer first.'],
    ['در حال دریافت اطلاعات...', 'Fetching information…'],
    ['اطلاعات یافت نشد', 'No information found'],
    ['ذخیره کارت انجام نشد', 'The card was not saved.'],
    ['ذخیره انجام نشد؛ دوباره تلاش کنید.', 'Save failed. Please try again.'],
    ['ارتباط با برنامه برقرار نشد.', 'Could not connect to the application.'],
    ['درخواست انجام نشد.', 'The request could not be completed.'],
    [
        'تأیید ذخیره دریافت نشد. اطلاعات در انتظار است؛ اتصال برنامه را دوباره بررسی کنید.',
        'Save confirmation was not received. Your pending data is preserved; check the app connection and try again.',
    ],
]);

const ATTRIBUTES = ['title', 'placeholder', 'aria-label', 'content'];
const USER_CONTENT_SELECTOR = [
    '[translate="no"]',
    '.word-text',
    'td.col-meaning',
    '.category-badge',
    '.cat-review-name',
    '.phonetic-text:not(.sentence-type-label)',
    '#reviewCategoryBadge',
    '#reviewCategoryBadgeBack',
    '#reviewWord',
    '#reviewWordBack',
    '#reviewPronunciation',
    '#reviewMeaning',
    '#reviewExampleText',
    '#reviewNotesText',
    '#typingCategoryBadge',
    '#typingMeaning',
    '#typingAnswerWord',
    '#typingAnswerPronunciation',
    '#typingExample',
    '#sentenceCategoryBadge',
    '#sentenceReviewMeaning',
    '#sentenceCorrectAnswer',
    '#sentenceNotesReview',
    '#deleteWordPreview',
    '#categoryBoxModalTitle',
].join(',');

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toLatinDigits(value) {
    return String(value)
        .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
        .replace(/٬/g, ',');
}

function normalize(value) {
    return String(value).replace(/\s+/g, ' ').trim();
}

function pluralCount(value, singular, plural = `${singular}s`) {
    const latin = toLatinDigits(value);
    const number = Number(latin.replace(/,/g, ''));
    return `${latin} ${number === 1 ? singular : plural}`;
}

const RULES = [
    [/^([۰-۹0-9٬,]+) کارت آماده مرور$/, ([, count]) => `${pluralCount(count, 'card')} due`],
    [
        /^([۰-۹0-9٬,]+) کارت آماده است؛ امروز هم فرصتی برای به خاطر سپردن.$/,
        ([, count]) => `${pluralCount(count, 'card')} ready. Make today count.`,
    ],
    [
        /^شروع از جعبهٔ ([۰-۹0-9]+) · روش مرور را پایین انتخاب کنید$/,
        ([, box]) => `Start with Box ${toLatinDigits(box)} · choose a review mode below`,
    ],
    [/^([۰-۹0-9٬,]+) موضوع$/, ([, count]) => pluralCount(count, 'topic')],
    [/^نمایش همهٔ ([۰-۹0-9٬,]+) موضوع ↓$/, ([, count]) => `Show all ${pluralCount(count, 'topic')} ↓`],
    [/^([۰-۹0-9٬,]+) کارت در این صفحه$/, ([, count]) => `${pluralCount(count, 'card')} on this page`],
    [/^([۰-۹0-9٬,]+) کارت انتخاب شده$/, ([, count]) => `${pluralCount(count, 'card')} selected`],
    [
        /^([۰-۹0-9٬,]+) کارت · ([۰-۹0-9٬,]+) آماده$/,
        ([, total, due]) => `${pluralCount(total, 'card')} · ${toLatinDigits(due)} due`,
    ],
    [
        /^([۰-۹0-9٬,]+) آماده از ([۰-۹0-9٬,]+)$/,
        ([, due, total]) => `${toLatinDigits(due)} due of ${toLatinDigits(total)}`,
    ],
    [/^جعبهٔ? ([۰-۹0-9]+)$/, ([, box]) => `Box ${toLatinDigits(box)}`],
    [/^مرور موضوع (.+)$/, ([, topic]) => `Review topic ${topic}`],
    [/^انتخاب (.+)$/, ([, value]) => `Select ${value}`],
    [/^ویرایش (.+)$/, ([, value]) => `Edit ${value}`],
    [/^حذف (.+)$/, ([, value]) => `Delete ${value}`],
    [/^([۰-۹0-9٬,]+) نسخهٔ پشتیبان موجود است.$/, ([, count]) => `${pluralCount(count, 'backup')} available.`],
    [
        /^([۰-۹0-9٬,]+) کارت به همراه سابقهٔ مرور آمادهٔ انتقال است. نسخهٔ قبلی پاک نمی‌شود.$/,
        ([, count]) =>
            `${pluralCount(count, 'card')} and review history are ready to import. The previous version will not be deleted.`,
    ],
    [
        /^([۰-۹0-9٬,]+) کارت جدید اضافه شد(?:، ([۰-۹0-9٬,]+) تکراری رد شد)? 📤$/,
        ([, added, skipped]) =>
            `${pluralCount(added, 'new card')} added${skipped ? `; ${pluralCount(skipped, 'duplicate')} skipped` : ''} 📤`,
    ],
    [/^([۰-۹0-9٬,]+) کارت حذف شد 🗑️$/, ([, count]) => `${pluralCount(count, 'card')} deleted 🗑️`],
    [/^([۰-۹0-9٬,]+) کارت نمونه تافل اضافه شد$/, ([, count]) => `${pluralCount(count, 'TOEFL sample card')} added`],
    [/^([۰-۹0-9٬,]+) عبارت ثابت اضافه شد$/, ([, count]) => `${pluralCount(count, 'fixed expression')} added`],
    [/^([۰-۹0-9٬,]+) عبارت موضوعی اضافه شد$/, ([, count]) => `${pluralCount(count, 'topic phrase')} added`],
    [
        /^غلط بود؛ ([۰-۹0-9٬,]+) فرصت دیگر داری$/,
        ([, count]) => `Not quite. You have ${pluralCount(count, 'attempt')} left.`,
    ],
    [/^برنامه به اطلاعات دسترسی پیدا نکرد: (.+)$/, ([, message]) => `The app could not access your data: ${message}`],
    [/^آیا از حذف کارت «(.+)» مطمئن هستید؟$/, ([, word]) => `Are you sure you want to delete “${word}”?`],
    [/^کارت «(.+)» حذف شد 🗑️$/, ([, word]) => `“${word}” was deleted 🗑️`],
];

export function translateToEnglish(value) {
    const key = normalize(value);
    if (!key) return null;
    if (ENGLISH.has(key)) return ENGLISH.get(key);
    for (const [pattern, render] of RULES) {
        const match = key.match(pattern);
        if (match) return render(match);
    }
    return null;
}

function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
}

function isUserContent(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element?.closest(USER_CONTENT_SELECTOR));
}

export function createI18n(initialLanguage = 'en') {
    let language = initialLanguage === 'en' ? 'en' : 'fa';
    let observer = null;
    const listeners = new Set();
    let originalText = new WeakMap();
    let originalAttributes = new WeakMap();

    function translateTextNode(node) {
        if (isUserContent(node)) return;
        if (language === 'fa') {
            if (originalText.has(node) && node.nodeValue !== originalText.get(node))
                node.nodeValue = originalText.get(node);
            return;
        }
        const translated = translateToEnglish(node.nodeValue);
        if (!translated) return;
        originalText.set(node, node.nodeValue);
        node.nodeValue = preserveWhitespace(node.nodeValue, translated);
    }

    function translateAttribute(element, attribute) {
        if (isUserContent(element) || !element.hasAttribute(attribute)) return;
        let originals = originalAttributes.get(element);
        if (language === 'fa') {
            if (originals?.has(attribute) && element.getAttribute(attribute) !== originals.get(attribute))
                element.setAttribute(attribute, originals.get(attribute));
            return;
        }
        const current = element.getAttribute(attribute);
        const translated = translateToEnglish(current);
        if (!translated) return;
        if (!originals) {
            originals = new Map();
            originalAttributes.set(element, originals);
        }
        originals.set(attribute, current);
        element.setAttribute(attribute, translated);
    }

    function applyNode(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            translateTextNode(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        if (root.nodeType === Node.ELEMENT_NODE) ATTRIBUTES.forEach((attribute) => translateAttribute(root, attribute));
        const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (textWalker.nextNode()) translateTextNode(textWalker.currentNode);
        const elements = root.querySelectorAll?.(ATTRIBUTES.map((attribute) => `[${attribute}]`).join(',')) || [];
        elements.forEach((element) => ATTRIBUTES.forEach((attribute) => translateAttribute(element, attribute)));
    }

    function updateToggleLabels() {
        document.querySelectorAll('[data-language-toggle-label]').forEach((label) => {
            const nextLabel = language === 'fa' ? 'EN' : 'FA';
            if (label.textContent !== nextLabel) label.textContent = nextLabel;
        });
        document.querySelectorAll('[data-language-toggle]').forEach((button) => {
            const nextTitle = language === 'fa' ? 'Switch to English' : 'تغییر زبان به فارسی';
            if (button.title !== nextTitle) button.title = nextTitle;
            if (button.getAttribute('aria-label') !== nextTitle) button.setAttribute('aria-label', nextTitle);
        });
    }

    function apply() {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.dataset.language = language;
        applyNode(document.documentElement);
        updateToggleLabels();
        if (language === 'fa') {
            originalText = new WeakMap();
            originalAttributes = new WeakMap();
        }
    }

    function setLanguage(nextLanguage, { emit = true } = {}) {
        const next = nextLanguage === 'en' ? 'en' : 'fa';
        const changed = next !== language;
        language = next;
        apply();
        if (changed && emit) {
            document.dispatchEvent(new CustomEvent('leitner-language-change', { detail: { language } }));
            listeners.forEach((listener) => Promise.resolve(listener(language)).catch(console.error));
        }
    }

    function start() {
        if (observer) return;
        document.addEventListener('click', (event) => {
            if (!event.target.closest('[data-language-toggle]')) return;
            setLanguage(language === 'fa' ? 'en' : 'fa');
        });
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') translateTextNode(mutation.target);
                if (mutation.type === 'attributes') translateAttribute(mutation.target, mutation.attributeName);
                mutation.addedNodes?.forEach(applyNode);
            });
            updateToggleLabels();
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRIBUTES,
        });
        apply();
    }

    return {
        get language() {
            return language;
        },
        apply,
        start,
        setLanguage,
        onChange(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
