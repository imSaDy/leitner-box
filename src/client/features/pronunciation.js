/** pronunciation: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        fetchPhonetic: async function fetchPhonetic(word, options = {}) {
            const cleanWord = word.trim().toLowerCase();
            if (!cleanWord) return null;

            const abortPrevious = options.abortPrevious !== false;
            const updateCache = options.updateCache !== false;
            const fetchOptions = {};
            if (abortPrevious) {
                if (ctx.fetchAbort) ctx.fetchAbort.abort();
                ctx.fetchAbort = new AbortController();
                fetchOptions.signal = ctx.fetchAbort.signal;
            }

            try {
                const res = await fetch(ctx.DICT_API + encodeURIComponent(cleanWord), fetchOptions);
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
                        if (isUS) {
                            if (ph.text) phonetic = ph.text;
                            audioUrl = ph.audio;
                            break;
                        }
                    }
                    // 2nd: non-UK audio
                    if (!audioUrl) {
                        for (const ph of entry.phonetics) {
                            const isUK = ph.audio && (ph.audio.includes('-uk') || ph.audio.includes('/uk/'));
                            if (!isUK && ph.audio) {
                                audioUrl = ph.audio;
                                if (ph.text) phonetic = ph.text;
                                break;
                            }
                        }
                    }
                    // 3rd: any audio
                    if (!audioUrl) {
                        for (const ph of entry.phonetics) {
                            if (ph.audio) {
                                audioUrl = ph.audio;
                                break;
                            }
                        }
                    }
                    // Phonetic text fallback
                    if (!phonetic) {
                        for (const ph of entry.phonetics) {
                            if (ph.text && ph.audio && (ph.audio.includes('-us') || ph.audio.includes('/us/'))) {
                                phonetic = ph.text;
                                break;
                            }
                        }
                    }
                    if (!phonetic) {
                        for (const ph of entry.phonetics) {
                            const isUK = ph.audio && (ph.audio.includes('-uk') || ph.audio.includes('/uk/'));
                            if (ph.text && !isUK) {
                                phonetic = ph.text;
                                break;
                            }
                        }
                    }
                    if (!phonetic) {
                        for (const ph of entry.phonetics) {
                            if (ph.text) {
                                phonetic = ph.text;
                                break;
                            }
                        }
                    }
                    if (!phonetic) phonetic = entry.phonetic || '';
                } else {
                    phonetic = entry.phonetic || '';
                }

                const result = { word: cleanWord, phonetic, audioUrl };
                if (updateCache) ctx.lastFetchResult = result;
                return result;
            } catch (e) {
                if (e.name === 'AbortError') return null;
                console.error('Dict API error:', e);
                return null;
            }
        },
        getGoogleTranslateTtsUrl: function getGoogleTranslateTtsUrl(word) {
            const text = ctx.compactText(word).slice(0, ctx.GOOGLE_TRANSLATE_TTS_MAX_CHARS);
            if (!text) return '';
            const params = new URLSearchParams({
                ie: 'UTF-8',
                client: 'tw-ob',
                tl: ctx.GOOGLE_TRANSLATE_TTS_LANG,
                q: text,
            });
            return `${ctx.GOOGLE_TRANSLATE_TTS_BASE_URL}?${params.toString()}`;
        },
        stopActivePronunciationAudio: function stopActivePronunciationAudio() {
            if (!ctx.activePronunciationAudio) return;
            try {
                ctx.activePronunciationAudio.pause();
                ctx.activePronunciationAudio.currentTime = 0;
            } catch (e) {
                console.warn('Could not stop active pronunciation audio:', e);
            }
            ctx.activePronunciationAudio = null;
        },
        playAudioSource: function playAudioSource(src) {
            if (!src) return Promise.reject(new Error('Missing audio source'));
            ctx.stopActivePronunciationAudio();
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();

            const audio = new Audio(src);
            ctx.activePronunciationAudio = audio;
            audio.addEventListener(
                'ended',
                () => {
                    if (ctx.activePronunciationAudio === audio) ctx.activePronunciationAudio = null;
                },
                { once: true }
            );
            audio.addEventListener(
                'error',
                () => {
                    if (ctx.activePronunciationAudio === audio) ctx.activePronunciationAudio = null;
                },
                { once: true }
            );
            return audio.play();
        },
        speakWord: function speakWord(word, audioUrl) {
            const googleAudioUrl = ctx.getGoogleTranslateTtsUrl(word);
            ctx.playAudioSource(googleAudioUrl).catch(() => {
                if (audioUrl) {
                    ctx.playAudioSource(audioUrl).catch(() => ctx.speakWithSpeechAPI(word));
                    return;
                }
                ctx.speakWithSpeechAPI(word);
            });
        },
        getPreferredFemaleEnglishVoice: function getPreferredFemaleEnglishVoice(voices) {
            const englishVoices = (voices || []).filter((v) => /^en([-_]|$)/i.test(v.lang || ''));
            if (englishVoices.length === 0) return null;

            const hasVoiceKeyword = (name, keyword) => {
                if (/^(female|woman|male|man)$/.test(keyword)) {
                    return new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`).test(name);
                }
                return name.includes(keyword);
            };

            const scored = englishVoices.map((voice) => {
                const lang = (voice.lang || '').toLowerCase();
                const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
                const hasFemaleName = ctx.FEMALE_ENGLISH_VOICE_KEYWORDS.some((keyword) =>
                    hasVoiceKeyword(name, keyword)
                );
                const hasMaleName = ctx.MALE_ENGLISH_VOICE_KEYWORDS.some((keyword) => hasVoiceKeyword(name, keyword));
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
        },
        speakWithSpeechAPI: function speakWithSpeechAPI(word) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                utterance.rate = 0.85;
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = ctx.getPreferredFemaleEnglishVoice(voices);
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                    utterance.lang = preferredVoice.lang || 'en-US';
                }
                window.speechSynthesis.speak(utterance);
            }
        },
    });
}
