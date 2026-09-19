/** examples: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    ctx.POLISHED_EXAMPLE_OVERRIDES = {
        'academic phrases::various theories have been proposed':
            'Various theories have been proposed, but the new evidence supports a gradual change rather than a sudden event.',
        'academic phrases::one hypothesis is that':
            "One hypothesis is that early exposure to music improves a child's ability to recognize patterns.",
        'academic phrases::does not necessarily indicate that':
            'A high test score does not necessarily indicate that a student can apply the concept in real situations.',
        'academic phrases::the urgency of finding effective solutions':
            'The report emphasizes the urgency of finding effective solutions before the reef loses more of its coral cover.',
        'academic phrases::to protect these vital ecosystems':
            'Researchers are testing new restoration methods to protect these vital ecosystems from rising ocean temperatures.',
        'academic phrases::the long-term success of these techniques':
            'The long-term success of these techniques depends on careful monitoring after the initial trial ends.',
        'academic phrases::ongoing environmental changes':
            'Ongoing environmental changes have forced scientists to revise their earlier predictions.',
        'academic phrases::the introduction of sanitation practices':
            'The introduction of sanitation practices reduced the spread of disease in crowded urban neighborhoods.',
        'academic phrases::the growing awareness of':
            'The growing awareness of air pollution led city officials to redesign the transport system.',
        'academic phrases::the importance of hygiene':
            'Public campaigns stressed the importance of hygiene in preventing outbreaks of infectious disease.',
        'academic phrases::quality of life':
            'Access to clean water can greatly improve the quality of life in rural communities.',
        'academic phrases::a remarkable engineering feat':
            'Building a canal through the mountain was considered a remarkable engineering feat at the time.',
        'academic phrases::suggest a broader hypothesis':
            'These small differences suggest a broader hypothesis about how the species adapted to colder climates.',
        'academic phrases::reveal complex aspects of':
            'The diaries reveal complex aspects of daily life that official records often ignore.',
        'academic phrases::once the process is complete':
            'Once the process is complete, the samples are stored in sealed containers for later analysis.',
        'fixed expressions::effective immediately':
            'The new safety rule is effective immediately, so everyone entering the lab must wear protective glasses today.',
        'fixed expressions::no longer': 'The old bridge is no longer safe for heavy trucks after the recent flooding.',
        'fixed expressions::continue to be available':
            'Digital copies of the article will continue to be available through the university library.',
        'fixed expressions::speak with someone':
            'Students should speak with an adviser before they drop a required course.',
        'fixed expressions::provide feedback':
            'The instructor asked the class to provide feedback on the draft before Friday.',
        'fixed expressions::be known for':
            'The coastal town is known for its narrow streets and brightly painted houses.',
        'fixed expressions::establish control over':
            'The new government struggled to establish control over the remote northern provinces.',
        'fixed expressions::look for':
            'Archaeologists look for changes in soil color when they search for buried walls.',
        'fixed expressions::be known to do something':
            'This species is known to migrate hundreds of miles during the dry season.',
        'fixed expressions::when necessary':
            'The nurse adjusts the dosage when necessary to keep the patient comfortable.',
        "fixed expressions::use something to one's advantage":
            'The researcher used the limited data to her advantage by focusing on one carefully defined question.',
        'fixed expressions::be designed to do something':
            'The online form is designed to help students report housing problems quickly.',
        'fixed expressions::be equipped with':
            'Each weather station is equipped with sensors that record wind speed and humidity.',
        "fixed expressions::be tailored to someone's needs":
            "The training program is tailored to each student's needs rather than following a single fixed schedule.",
        'fixed expressions::hold a certification':
            'Applicants must hold a certification in first aid before they can work at the summer camp.',
        'fixed expressions::underscore a commitment to':
            "The museum's free lecture series underscores its commitment to public education.",
        'fixed expressions::commitment to doing something':
            'Her commitment to preserving local history made the archive a valuable community resource.',
        'fixed expressions::for more information':
            'For more information, students can visit the advising office after the presentation.',
        'fixed expressions::whether... or...':
            'Whether the samples came from the coast or the forest, they showed the same chemical pattern.',
        'fixed expressions::be fundamental in doing something':
            'Accurate measurement is fundamental in testing whether the treatment actually works.',
        'fixed expressions::fit together': 'The fragments fit together like pieces of a larger ceremonial bowl.',
        'fixed expressions::much like':
            'The young birds learn the route much like human children learn familiar paths through a city.',
        'fixed expressions::over time': 'Over time, the river cut a deep channel through the softer layers of rock.',
        'fixed expressions::prepare for': 'The city built emergency shelters to prepare for severe winter storms.',
        'fixed expressions::as well as':
            'The course covers Roman architecture as well as the social history behind the buildings.',
        'fixed expressions::mitigate the impacts of something':
            'Planting mangroves can help mitigate the impacts of coastal flooding.',
        'fixed expressions::form through':
            'These caves form through the slow dissolution of limestone by acidic water.',
        'fixed expressions::be known as': 'The thin layer of fertile soil is known as topsoil.',
        'fixed expressions::be classified into':
            'The artifacts can be classified into tools, ornaments, and household objects.',
        'fixed expressions::be composed of': 'Granite is composed of several minerals, including quartz and feldspar.',
        'fixed expressions::form from': 'Sedimentary rock can form from layers of sand, shells, and mud.',
        'fixed expressions::offer insights into':
            'The letters offer insights into how ordinary families experienced the war.',
        'fixed expressions::such as': 'Marine animals such as sea turtles are especially vulnerable to plastic waste.',
        'fixed expressions::refer to':
            'In this article, "urban heat island" refers to the higher temperatures found in dense city centers.',
        'fixed expressions::be subject to': 'The open-air paintings are subject to damage from sunlight and moisture.',
        'fixed expressions::be made of': 'The early shelters were made of branches, animal skins, and packed earth.',
        'fixed expressions::be made up of':
            'The committee is made up of faculty members, students, and local residents.',
        'fixed expressions::lead to': 'A lack of sleep can lead to poor concentration during long lectures.',
        'fixed expressions::be likely to have been':
            'The stone circle is likely to have been used for seasonal ceremonies.',
        'fixed expressions::wash away': 'Heavy rain can wash away the top layer of soil before new plants take root.',
        'fixed expressions::contribute to':
            'Better nutrition can contribute to improved learning outcomes in young children.',
        'fixed expressions::be a matter of':
            'In this experiment, success was a matter of timing rather than expensive equipment.',
        'fixed expressions::combine with': 'Warm air can combine with moisture to produce powerful thunderstorms.',
        'fixed expressions::account for': 'Seasonal demand may account for the sudden rise in hotel prices.',
        'fixed expressions::in turn':
            'The new road brought more visitors, which in turn created jobs for local residents.',
        'fixed expressions::play an important role in':
            'Pollinators play an important role in maintaining healthy plant communities.',
        'fixed expressions::be involved in': 'Several local groups were involved in planning the restoration project.',
        'fixed expressions::fall off': 'Small pieces of plaster began to fall off the old theater ceiling.',
        'fixed expressions::in between':
            'The oldest bones were found near the cave wall, with newer tools scattered in between.',
        'fixed expressions::at one extreme ... at the other':
            'At one extreme, some birds travel alone; at the other, they migrate in huge flocks.',
        'fixed expressions::be familiar with':
            'Researchers must be familiar with local customs before conducting interviews.',
        'fixed expressions::this is not so':
            'Many people assume the desert is lifeless, but this is not so after seasonal rain.',
        'fixed expressions::take some time to do something':
            'It may take some time to identify the mineral without special equipment.',
        'fixed expressions::over the last fifty years or so':
            'Over the last fifty years or so, satellite data has transformed weather forecasting.',
        'fixed expressions::arrive at a measurement':
            'Scientists repeated the test several times before they could arrive at a reliable measurement.',
        'fixed expressions::take up a position': 'The bird took up a position near the nest and watched for intruders.',
        'fixed expressions::be based on': 'The model is based on temperature records collected over several decades.',
        'fixed expressions::extend back from the present':
            'The tree-ring record extends back from the present to the early medieval period.',
        'fixed expressions::act upon': 'Natural selection can act upon small differences within a population.',
        'fixed expressions::focus on': 'The lecture will focus on the causes of rapid urban growth.',
        'fixed expressions::be marked by':
            'The period was marked by frequent droughts and a decline in crop production.',
        'fixed expressions::following something':
            'Following the earthquake, engineers inspected every bridge in the region.',
        'fixed expressions::allow for': 'The schedule allows for a short discussion after each presentation.',
        'fixed expressions::the effects of something on something':
            "The study examined the effects of noise on children's ability to concentrate.",
        'fixed expressions::address an issue':
            'The new policy tries to address an issue that students have raised for years.',
        'fixed expressions::due to': 'The outdoor concert was canceled due to heavy rain.',
        'fixed expressions::arise from': 'Most of the conflict arose from a misunderstanding about land ownership.',
        'fixed expressions::play a key role in': 'Bacteria play a key role in breaking down organic matter in soil.',
        'fixed expressions::be caused by':
            'The cracks were caused by repeated freezing and thawing of water in the stone.',
        'fixed expressions::be crucial for':
            'Reliable transportation is crucial for students who live far from campus.',
        'fixed expressions::emerge as': 'The port emerged as a major trading center in the late nineteenth century.',
        'fixed expressions::in the field of':
            'In the field of marine biology, small changes in water temperature can be extremely important.',
        'fixed expressions::for example': 'Some animals, for example bats, rely heavily on sound to navigate at night.',
        'fixed expressions::interact with': 'Young children learn language as they interact with adults around them.',
        'fixed expressions::as if': 'The actor paused as if he had suddenly remembered something important.',
        'fixed expressions::be associated with':
            'Low rainfall is often associated with smaller harvests in this region.',
        'fixed expressions::be suitable for':
            'The room is suitable for small seminars but not for large public lectures.',
        'fixed expressions::integrate something into something':
            'The teacher integrated short videos into the lesson to clarify abstract ideas.',
        'fixed expressions::despite these hurdles':
            'Despite these hurdles, the research team completed the survey on time.',
        'fixed expressions::continue to evolve':
            "The city's public transport system continues to evolve as new neighborhoods are built.",
        'fixed expressions::a bunch of': 'A bunch of students stayed after class to ask about the field trip.',
        'fixed expressions::be comfortable enough for': 'The chairs were comfortable enough for a three-hour workshop.',
        'fixed expressions::be ok doing something': 'Most students were OK working in pairs for the speaking activity.',
        'fixed expressions::give up': 'The hikers refused to give up even after the trail became steep and muddy.',
        'lifestyle & experience::lodging': 'The tour package includes two nights of lodging near the harbor.',
        'lifestyle & experience::attraction': "The old lighthouse became the town's most popular tourist attraction.",
        'lifestyle & experience::package':
            'The travel agency offered a package that included meals, lodging, and local transportation.',
        'events & activities::fair':
            'The spring fair filled the main square with food stalls, music, and student artwork.',
        'events & activities::proceeds': 'All proceeds from the concert will support the community garden.',
        'events & activities::clean-up': 'Volunteers joined the beach clean-up before the summer tourist season began.',
        'course content & assignments::reach out':
            'The professor told students to reach out if they needed help with the video project.',
        'course content & assignments::credit': 'Students must credit every image they use in the presentation.',
        'course content & assignments::narrate': 'Each student will narrate a short scene from the documentary.',
        'drama & theater::fragment':
            'The playwright fragments the story so the audience discovers the truth gradually.',
        'drama & theater::enlighten':
            "The final scene is meant to enlighten the audience about the character's hidden motive.",
        'drama & theater::exemplify': "The opening monologue exemplifies the play's focus on memory and loss.",
        'marine biology::bleach':
            'When ocean temperatures rise, corals may bleach and lose the algae that give them color.',
        'marine biology::combat': 'Marine biologists are testing new methods to combat the spread of coral disease.',
        'marine biology::transplant': 'Divers transplant healthy coral fragments onto damaged sections of the reef.',
        'marine biology::overfishing':
            'Overfishing can remove key species and disturb the balance of a reef ecosystem.',
        'marine biology::colony':
            'A coral colony is made up of many tiny animals living together on a shared skeleton.',
        'marine biology::fragment': 'Scientists attached each coral fragment to a frame where it could grow safely.',
        'marine biology::seawater': 'The tanks were filled with filtered seawater to protect the young coral.',
        'marine biology::resilience':
            "A reef's resilience depends on biodiversity, water quality, and the speed of recovery after stress.",
        'zoology::scales': "The lizard's scales reduce water loss and protect its skin from rough surfaces.",
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
        'painting & visual arts::take off':
            'The new painting style began to take off after several galleries featured young artists.',
        'painting & visual arts::pottery':
            'The pottery on display shows how artists shaped clay for both beauty and daily use.',
        'painting & visual arts::originate':
            'The technique appears to originate in workshops along the Mediterranean coast.',
        'psychology::encompass':
            'The study of child development encompasses language, movement, emotion, and social behavior.',
        'psychology::caretaker': 'A consistent caretaker can help a child feel secure during early development.',
        'psychology::overlook': 'Busy observers may overlook small changes in behavior during a crowded experiment.',
        'psychology::trace': "Psychologists tried to trace the child's fear back to an earlier experience.",
        'literature::resonate':
            "The novel's final image continues to resonate with readers long after they finish the book.",
        'literature::belonging': "The poem explores belonging through the speaker's memories of a lost hometown.",
        'study skills::approach': 'Students need a clear approach when they begin a long research assignment.',
        'study skills::communicate': 'A good presentation should communicate the main idea before adding details.',
        'technology::augmented reality':
            'Augmented reality can place digital labels over real machines so trainees know which part to repair.',
        'technology::training environments':
            'Safe training environments let students practice difficult procedures before they work with real equipment.',
        'technology::overlay digital information':
            'The headset can overlay digital information on a live view of the engine.',
        'technology::enhance learning': 'Interactive diagrams can enhance learning by making hidden processes visible.',
        'technology::simulate operations':
            'The software can simulate operations that would be too dangerous to practice on real machines.',
        'technology::virtual components':
            'Students can rotate virtual components on the screen before assembling the actual device.',
        'technology::hands-on approach':
            'A hands-on approach helped trainees remember the procedure after the workshop ended.',
        'technology::intricate processes':
            'Animation made the intricate processes inside the machine easier to understand.',
        'technology::emergency protocols':
            'The simulation tested whether workers remembered the emergency protocols under pressure.',
        'technology::realistic training environment':
            'A realistic training environment helps pilots practice rare problems without risking safety.',
        'technology::retention rates':
            'Retention rates improved when students practiced with interactive tools instead of static diagrams.',
        'technology::responsive content':
            'Responsive content changed the difficulty of each task as the learner improved.',
        'meteorology::warmer air rises': 'When warmer air rises, cooler air moves in to replace it near the surface.',
        'meteorology::cooler air sinks': 'Cooler air sinks at night, which can trap fog in low valleys.',
        'meteorology::influence temperature':
            'Prevailing winds can influence temperature by carrying warm or cool air into a region.',
        'meteorology::weather patterns': 'Weather patterns often shift when ocean temperatures change.',
        'meteorology::wind direction':
            'A sudden change in wind direction warned meteorologists that the storm was moving inland.',
        'meteorology::prevailing winds': 'Prevailing winds carry moist air from the ocean toward the mountains.',
        'meteorology::regional climates':
            'Mountain ranges can shape regional climates by blocking wet air from the coast.',
        'meteorology::storm systems': 'Storm systems grow stronger when warm air and moisture combine.',
        'meteorology::accurate forecasting':
            'Accurate forecasting gives coastal communities more time to prepare for hurricanes.',
        'meteorology::wind current': 'A high-altitude wind current pushed the ash cloud across the continent.',
        'meteorology::pressure differential': 'A pressure differential between two regions can create strong winds.',
        'meteorology::moisture': 'Warm air can hold more moisture than cool air.',
        'meteorology::coriolis effect': 'The Coriolis effect helps explain why large storm systems rotate.',
        'meteorology::rotation': "Earth's rotation causes moving air to curve rather than travel in a straight line.",
        'animal behavior::maintain dominance':
            'The strongest male tried to maintain dominance by controlling access to food.',
        'animal behavior::fiercely defend': 'Some birds fiercely defend their nests when intruders come too close.',
        'animal behavior::hunt at night':
            'Owls hunt at night because their hearing helps them locate prey in darkness.',
        'animal behavior::use stealth': 'A leopard can use stealth to approach prey without being noticed.',
        'business & economics::student entrepreneurship':
            'Student entrepreneurship can turn a classroom idea into a small company with real customers.',
        'business & economics::co-working spaces':
            'Co-working spaces give young founders a place to share equipment and advice.',
        'business & economics::collaboration hubs':
            'Collaboration hubs bring students, mentors, and investors into the same workspace.',
        'business & economics::student-led start-ups':
            'Student-led start-ups often begin with a problem noticed on campus.',
        'business & economics::value-added tax':
            'Value-added tax is added at each stage of production before the product reaches the buyer.',
        'business & economics::receipt': 'Customers need a receipt if they want to return an item later.',
        'study skills::critical thinking':
            'Critical thinking helps students question an argument instead of accepting it too quickly.',
        'study skills::time management':
            'Good time management keeps long assignments from turning into last-minute work.',
        'study skills::social skills': 'Strong social skills make group projects easier to organize and complete.',
        'accommodation & food service::dining hall':
            'The dining hall stays open late during exam week so students can eat after evening study sessions.',
        'accommodation & food service::campus café':
            'The Campus Cafe added more breakfast options after students requested lighter meals.',
        'accommodation & food service::vegetarian options':
            'The menu lists vegetarian options separately so students can choose meals quickly.',
        'accommodation & food service::vegan options': 'Vegan options do not include meat, eggs, or dairy products.',
        'accommodation & food service::gluten-free options':
            'Gluten-free options are stored on a separate shelf to avoid contamination.',
        'accommodation & food service::dietary needs':
            'Students with specific dietary needs can speak with the cafe staff before ordering.',
        'animal behavior::solitary animals': 'Solitary animals often avoid direct contact except during mating season.',
        'animal behavior::territorial behavior':
            'Territorial behavior helps animals protect food, mates, and safe nesting areas.',
        'geology::outer shell': "Earth's outer shell is broken into plates that move slowly over time.",
        'marine biology::marine biology':
            'Marine biology examines how organisms survive and interact in ocean environments.',
        'marine biology::underwater ecosystem':
            'An underwater ecosystem can be damaged when pollution reduces the amount of light and oxygen.',
        'lifestyle & experience::sell out': 'Tickets for the harbor tour often sell out during the summer.',
        'lifestyle & experience::city landmarks':
            'The guide pointed out several city landmarks during the walking tour.',
        'lifestyle & experience::admission fees':
            'Admission fees were lower for students who booked the museum tour in advance.',
        'history::diverse cultures': 'Trade routes brought diverse cultures into contact with one another.',
        'history::significant events': 'Timelines help students connect significant events to broader social changes.',
        'history::develop societies':
            'Agriculture helped small communities develop societies with more complex social structures.',
        'zoology::zoology': 'Zoology studies animals, including their bodies, behavior, and evolution.',
        'zoology::camouflage': 'Camouflage helps animals blend into their surroundings and avoid predators.',
        'zoology::quill knobs': 'Quill knobs on the fossil bone suggest that the animal once had strong feathers.',
    };
    ctx.VERB_STARTERS = new Set([
        'absorb',
        'accelerate',
        'act',
        'address',
        'alter',
        'appear',
        'arise',
        'arrive',
        'back',
        'bleach',
        'block',
        'boost',
        'bring',
        'challenge',
        'click',
        'combine',
        'combat',
        'communicate',
        'continue',
        'contribute',
        'cook',
        'copy',
        'create',
        'decide',
        'deduct',
        'defend',
        'define',
        'delve',
        'derive',
        'develop',
        'digest',
        'download',
        'drive',
        'emerge',
        'encompass',
        'enhance',
        'ensure',
        'establish',
        'evaluate',
        'evolve',
        'excavate',
        'exemplify',
        'explore',
        'focus',
        'form',
        'give',
        'hack',
        'harden',
        'hold',
        'hunt',
        'illustrate',
        'impact',
        'indicate',
        'influence',
        'integrate',
        'interact',
        'introduce',
        'launch',
        'lead',
        'look',
        'maintain',
        'mark',
        'mitigate',
        'narrate',
        'open',
        'originate',
        'overlay',
        'overlook',
        'overturn',
        'patrol',
        'play',
        'prepare',
        'provide',
        'recharge',
        'refer',
        'reflect',
        'reserve',
        'restore',
        'rise',
        'roast',
        'scale',
        'search',
        'serve',
        'shape',
        'showcase',
        'simulate',
        'sink',
        'slow',
        'speak',
        'span',
        'spread',
        'strike',
        'submerge',
        'subscribe',
        'tailor',
        'take',
        'tap',
        'trace',
        'transplant',
        'transport',
        'update',
        'upload',
        'use',
        'volunteer',
        'wash',
        'work',
    ]);
    ctx.INTRANSITIVE_TERMS = new Set([
        'appear',
        'arise',
        'continue to evolve',
        'evolve',
        'fall off',
        'form',
        'originate',
        'rise',
        'sink',
        'slow down',
        'submerge',
        'take off',
        'thrive',
    ]);
    ctx.ADJECTIVE_TERMS = new Set([
        'accurate',
        'annual',
        'eco-friendly',
        'gluten-free',
        'intense',
        'interactive',
        'local',
        'ongoing',
        'premium',
        'properly credited',
        'refreshing',
        'serene',
        'severe',
        'stunning',
        'surrealist',
        'tasty',
        'ultra-fast',
        'vegan',
        'vegetarian',
        'vibrant',
    ]);
    ctx.CATEGORY_EXAMPLE_FRAMES = {
        'Accommodation & Food Service': {
            actor: 'The dining manager',
            setting: 'the campus cafe',
            object: 'meal planning',
            result: 'students with different dietary needs',
        },
        'Animal Behavior': {
            actor: 'Biologists',
            setting: 'a protected reserve',
            object: 'territorial behavior',
            result: 'how animals compete for space and food',
        },
        Anthropology: {
            actor: 'Anthropologists',
            setting: 'early human communities',
            object: 'tool use and diet',
            result: 'how culture changed over time',
        },
        Archaeology: {
            actor: 'Archaeologists',
            setting: 'an ancient settlement',
            object: 'buried evidence',
            result: 'the daily lives of the people who lived there',
        },
        Botany: {
            actor: 'Botanists',
            setting: 'a damp forest floor',
            object: 'plant reproduction',
            result: 'how plants survive in changing conditions',
        },
        'Business & Economics': {
            actor: 'The business incubator',
            setting: 'a student start-up hub',
            object: 'new ventures',
            result: 'whether young companies can grow sustainably',
        },
        'Clubs & Campus Activities': {
            actor: 'The student club',
            setting: 'the campus center',
            object: 'the weekend event',
            result: 'more students to take part',
        },
        'Course Content & Assignments': {
            actor: 'The instructor',
            setting: 'the media assignment',
            object: 'student presentations',
            result: 'clearer and more original work',
        },
        'Drama & Theater': {
            actor: 'The director',
            setting: 'a small experimental theater',
            object: 'the performance',
            result: 'a stronger emotional response from the audience',
        },
        'Environmental Science': {
            actor: 'Environmental researchers',
            setting: 'a migration corridor',
            object: 'climate data',
            result: 'how development affects fragile habitats',
        },
        'Events & Activities': {
            actor: 'Organizers',
            setting: 'the campus festival',
            object: 'the event schedule',
            result: 'visitors to move easily between activities',
        },
        Geology: {
            actor: 'Geologists',
            setting: 'a rocky valley',
            object: 'layers of stone',
            result: 'how the landscape formed',
        },
        History: {
            actor: 'Historians',
            setting: 'a rapidly growing nineteenth-century city',
            object: 'public records',
            result: 'why health reforms became necessary',
        },
        'Information & Advising': {
            actor: 'The adviser',
            setting: 'a meeting with first-year students',
            object: 'course options',
            result: 'students to make realistic academic plans',
        },
        'Infrastructure & Projects': {
            actor: 'Engineers',
            setting: 'a large public-works project',
            object: 'construction plans',
            result: 'the project to stay on schedule',
        },
        'Job & Career': {
            actor: 'The career counselor',
            setting: 'a campus workshop',
            object: 'job applications',
            result: 'students to present their experience clearly',
        },
        'Lifestyle & Experience': {
            actor: 'The travel guide',
            setting: 'a coastal weekend trip',
            object: 'the itinerary',
            result: 'visitors to balance activity with rest',
        },
        Literature: {
            actor: 'The critic',
            setting: 'a discussion of the novel',
            object: 'recurring images',
            result: 'how the story creates meaning',
        },
        'Marine Biology': {
            actor: 'Marine biologists',
            setting: 'a coral reef',
            object: 'reef health',
            result: 'which restoration methods are most effective',
        },
        Meteorology: {
            actor: 'Meteorologists',
            setting: 'a coastal weather station',
            object: 'wind and pressure data',
            result: 'more accurate storm forecasts',
        },
        'Painting & Visual Arts': {
            actor: 'Art historians',
            setting: 'a museum exhibition',
            object: "the artist's materials",
            result: 'how technique shapes visual meaning',
        },
        Psychology: {
            actor: 'Psychologists',
            setting: 'a child-development study',
            object: 'behavioral patterns',
            result: 'how children learn from their surroundings',
        },
        'Study Skills': {
            actor: 'Successful students',
            setting: 'a demanding semester',
            object: 'their study routines',
            result: 'better long-term learning',
        },
        Technology: {
            actor: 'Engineers',
            setting: 'a training simulation',
            object: 'digital tools',
            result: 'safer practice before real equipment is used',
        },
        Zoology: {
            actor: 'Zoologists',
            setting: 'a fossil collection',
            object: 'physical adaptations',
            result: 'how animals changed over time',
        },
    };
    Object.assign(ctx, {
        getExampleContext: function getExampleContext(category) {
            return (
                ctx.CATEGORY_EXAMPLE_CONTEXTS[ctx.normalizeCategory(category)] || ctx.CATEGORY_EXAMPLE_CONTEXTS.General
            );
        },
        simpleHash: function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        },
        getPolishedLookupKey: function getPolishedLookupKey(category, term) {
            return `${ctx.normalizeCategory(category).toLowerCase()}::${ctx.normalizeFixedExpression(term)}`;
        },
        cleanExampleTerm: function cleanExampleTerm(word) {
            return ctx.compactText(word).replace(/^\*+/, '').replace(/[“”]/g, '"');
        },
        getCustomExampleEntries: function getCustomExampleEntries() {
            return Array.isArray(globalThis.LEITNER_CUSTOM_EXAMPLE_ENTRIES)
                ? globalThis.LEITNER_CUSTOM_EXAMPLE_ENTRIES
                : [];
        },
        getCustomExampleLookup: function getCustomExampleLookup() {
            if (ctx.customExampleLookup) return ctx.customExampleLookup;

            const byId = new Map();
            const byKey = new Map();

            ctx.getCustomExampleEntries().forEach((entry) => {
                const example = ctx.compactText(entry.example || '');
                const category = ctx.normalizeCategory(entry.category);
                const word = ctx.cleanExampleTerm(entry.word || '');
                if (!example) return;

                if (entry.id) byId.set(String(entry.id), example);
                if (category && word) {
                    const key = ctx.getPolishedLookupKey(category, word);
                    if (!byKey.has(key)) byKey.set(key, example);
                }
            });

            ctx.customExampleLookup = { byId, byKey };
            return ctx.customExampleLookup;
        },
        getCustomCardExample: function getCustomCardExample(card) {
            if (!card) return '';
            const lookup = ctx.getCustomExampleLookup();
            const byId = card.id ? lookup.byId.get(String(card.id)) : '';
            if (byId) return byId;

            const term = ctx.cleanExampleTerm(card.word || '');
            if (!term) return '';

            const key = ctx.getPolishedLookupKey(card.category, term);
            return lookup.byKey.get(key) || '';
        },
        capitalizeSentence: function capitalizeSentence(text) {
            const clean = ctx.compactText(text);
            return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : clean;
        },
        termNeedsArticle: function termNeedsArticle(term) {
            const lower = term.toLowerCase();
            return (
                !/^(a|an|the|this|that|these|those|some|many|much|several|various|one|each)\b/.test(lower) &&
                !/(?:s|es)$/i.test(lower) &&
                !/(?:ss|us)$/i.test(lower) &&
                !lower.includes(' and ') &&
                !/^[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*$/.test(term)
            );
        },
        nounTerm: function nounTerm(term) {
            if (!ctx.termNeedsArticle(term)) return term;
            return /^[aeiou]/i.test(term) ? `an ${term}` : `a ${term}`;
        },
        isVerbMeaning: function isVerbMeaning(meaning) {
            return /(کردن|شدن|دادن|گرفتن|یافتن|رفتن|آمدن|ساختن|پرداختن|داشتن|بودن|جستجو|جست‌وجو|افزایش|کاهش|حفظ|بهبود|مقابله|ارزیابی|حذف|بارگذاری|دانلود)/.test(
                meaning || ''
            );
        },
        isVerbTerm: function isVerbTerm(term, meaning, partOfSpeech = '') {
            const lower = ctx.normalizeFixedExpression(ctx.cleanExampleTerm(term));
            if ((partOfSpeech || '').toLowerCase() === 'verb') return true;
            if (/^(be|to)\b/.test(lower)) return true;
            const words = lower.split(/\s+/);
            if (ctx.VERB_STARTERS.has(words[0])) return true;
            if (words.length > 1 && /ly$/.test(words[0]) && ctx.VERB_STARTERS.has(words[1])) return true;
            return words.length === 1 && ctx.isVerbMeaning(meaning);
        },
        isAdjectiveTerm: function isAdjectiveTerm(term, partOfSpeech = '') {
            const lower = ctx.normalizeFixedExpression(ctx.cleanExampleTerm(term));
            return (partOfSpeech || '').toLowerCase() === 'adjective' || ctx.ADJECTIVE_TERMS.has(lower);
        },
        isClauseTerm: function isClauseTerm(term) {
            return /\b(rises|sinks|forms|changes|occurs|increases|decreases|migrates|rotates|crashes)\b/i.test(term);
        },
        isPluralTerm: function isPluralTerm(term) {
            const lower = ctx.normalizeFixedExpression(term);
            const lastWord = lower.split(/\s+/).pop() || '';
            return lower.includes(' and ') || (/(?:s|es)$/.test(lastWord) && !/(?:ss|us)$/.test(lastWord));
        },
        hasUsefulExactExample: function hasUsefulExactExample(card) {
            const example = ctx.compactText(card.example || '');
            if (!example) return false;
            const term = ctx.cleanExampleTerm(card.word || '');
            if (!term) return false;
            return example.toLowerCase().includes(term.toLowerCase()) && !ctx.isWeakGeneratedExample(example);
        },
        isWeakGeneratedExample: function isWeakGeneratedExample(example) {
            const clean = ctx.compactText(example);
            return (
                !clean ||
                /The phrase ".+" appeared in/i.test(clean) ||
                /The professor explained the term/i.test(clean) ||
                /Researchers can \w+ the evidence/i.test(clean) ||
                /Researchers \w+ various factors when conducting studies/i.test(clean) ||
                /played a pivotal role in the outcome/i.test(clean) ||
                /Understanding ".+" helps students navigate/i.test(clean) ||
                /appears frequently in scholarly articles/i.test(clean) ||
                /was widely discussed in the seminar/i.test(clean) ||
                /In academic writing, ".+" is commonly used/i.test(clean) ||
                /relationship between .+ and social dynamics/i.test(clean) ||
                /Experts have debated the impact of/i.test(clean) ||
                /Students should familiarize themselves with/i.test(clean) ||
                /The concept of ".+" was explored/i.test(clean) ||
                /Many scholars consider ".+" a key term/i.test(clean) ||
                /The word ".+" has significant implications/i.test(clean)
            );
        },
        createExpressionExample: function createExpressionExample(term) {
            const lower = ctx.normalizeFixedExpression(term);
            const natural = term
                .replace(/^be\s+/i, '')
                .replace(/^to\s+/i, '')
                .replace(/\bsomething\b/gi, 'the plan')
                .replace(/\bsomeone\b/gi, 'the student')
                .replace(/\bsomeone's\b/gi, "the student's")
                .replace(/\bone's\b/gi, 'her');

            if (/^be /.test(lower)) return `The proposal was ${natural} after the committee reviewed the evidence.`;
            if (/^to /.test(lower)) return `The team revised the schedule ${term} before the final deadline.`;
            return '';
        },
        createCategoryExample: function createCategoryExample(card, term) {
            const category = ctx.normalizeCategory(card.category);
            const frame = ctx.CATEGORY_EXAMPLE_FRAMES[category] || {
                actor: 'The article',
                setting: ctx.getExampleContext(category),
                object: 'the main topic',
                result: 'the reader to understand the larger issue',
            };
            const meaning = ctx.compactText(card.meaning || '');
            const pos = card.partOfSpeech || '';
            const lower = ctx.normalizeFixedExpression(term);
            const h = ctx.simpleHash(`${category}::${term}`);
            const isPhrase = /\s/.test(term);

            if (ctx.isClauseTerm(term)) {
                const templates = [
                    `When ${term}, it can change the conditions described in the passage.`,
                    `${ctx.capitalizeSentence(term)} when the surrounding conditions shift.`,
                    `Scientists studied why ${term} under specific environmental conditions.`,
                ];
                return templates[h % templates.length];
            }

            if (ctx.isAdjectiveTerm(term, pos)) {
                const templates = [
                    `${frame.actor} described a ${term} feature that changed how people responded in ${frame.setting}.`,
                    `A ${term} design made the project more useful in ${frame.setting}.`,
                    `The report called the result ${term} because it clearly affected ${frame.object}.`,
                ];
                return templates[h % templates.length];
            }

            if (ctx.isVerbTerm(term, meaning, pos)) {
                if (ctx.INTRANSITIVE_TERMS.has(lower)) {
                    const templates = [
                        `In ${frame.setting}, the pattern began to ${term} as conditions changed.`,
                        `${frame.actor} observed the system ${term} after several weeks of careful monitoring.`,
                        `The change did not ${term} until outside pressure increased.`,
                    ];
                    return templates[h % templates.length];
                }

                const verbPhraseTemplates = [
                    `${frame.actor} tried to ${term} during work in ${frame.setting}.`,
                    `The project shows how experts can ${term} while studying ${frame.object}.`,
                    `During the project, students learned to ${term} without losing sight of the main goal.`,
                    `In ${frame.setting}, the team needed to ${term} before the next stage could begin.`,
                ];
                return verbPhraseTemplates[h % verbPhraseTemplates.length];
            }

            if (isPhrase) {
                const explainVerb = ctx.isPluralTerm(term) ? 'help' : 'helps';
                const templates = [
                    `The passage links ${term} to a larger issue in ${frame.setting}.`,
                    `In ${frame.setting}, ${term} can affect how people interpret ${frame.object}.`,
                    `${ctx.capitalizeSentence(term)} ${explainVerb} explain ${frame.object}.`,
                    `${frame.actor} discussed ${term} while analyzing ${frame.object}.`,
                ];
                return templates[h % templates.length];
            }

            const nounTemplates = [
                `The article explains ${term} in the context of ${frame.setting}.`,
                `${ctx.capitalizeSentence(term)} became an important clue in the discussion of ${frame.object}.`,
                `${frame.actor} measured ${term} to understand changes in ${frame.object}.`,
                `A careful discussion of ${term} helps readers follow the argument in the passage.`,
            ];
            return nounTemplates[h % nounTemplates.length];
        },
        createPolishedExample: function createPolishedExample(wordOrCard, category = 'General', partOfSpeech = '') {
            const card =
                typeof wordOrCard === 'object' ? wordOrCard : { word: wordOrCard, category, partOfSpeech, meaning: '' };
            const term = ctx.cleanExampleTerm(card.word || '');
            if (!term) return '';

            const normalizedCategory = ctx.normalizeCategory(card.category);
            const customExample = ctx.getCustomCardExample({ ...card, word: term, category: normalizedCategory });
            if (customExample) return customExample;

            const categoryKey = ctx.getPolishedLookupKey(normalizedCategory, term);
            const termKey = ctx.normalizeFixedExpression(term);
            if (ctx.POLISHED_EXAMPLE_OVERRIDES[categoryKey]) return ctx.POLISHED_EXAMPLE_OVERRIDES[categoryKey];
            if (ctx.POLISHED_EXAMPLE_OVERRIDES[termKey]) return ctx.POLISHED_EXAMPLE_OVERRIDES[termKey];

            if (normalizedCategory === ctx.FIXED_EXPRESSIONS_CATEGORY) {
                const expressionExample = ctx.createExpressionExample(term);
                if (expressionExample) return expressionExample;
            }

            return ctx.createCategoryExample({ ...card, category: normalizedCategory }, term);
        },
        compactText: function compactText(text) {
            return (text || '').replace(/\s+/g, ' ').trim();
        },
        getToeflSampleWords: function getToeflSampleWords() {
            return Object.entries(ctx.TOEFL_SAMPLE_WORDS_BY_CATEGORY).flatMap(([category, words]) =>
                words.map(([word, meaning, partOfSpeech]) => ({
                    word,
                    meaning,
                    category: ctx.normalizeCategory(category),
                    partOfSpeech,
                }))
            );
        },
    });
}
