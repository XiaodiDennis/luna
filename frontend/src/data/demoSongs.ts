export type DemoWord = {
  order: number;
  text: string;
  ipa?: string;
  pos: string;
  ukrainian: string;
};

export type DemoLine = {
  id: string;
  order: number;
  startMs: number;
  endMs: number;
  english: string;
  ukrainian: string;
  words: DemoWord[];
};

export type DemoSong = {
  id: string;
  title: string;
  artistLabel: string;
  genre: string;
  genreUk: string;
  level: string;
  durationSec: number;
  audioUrl: string;
  descriptionUk: string;
  syncOffsetMs: number;
  lines: DemoLine[];
};

const wordMeta: Record<string, Omit<DemoWord, "order" | "text">> = {
  the: { ipa: "ðə", pos: "артикль", ukrainian: "означений артикль" },
  a: { ipa: "ə", pos: "артикль", ukrainian: "неозначений артикль" },
  an: { ipa: "ən", pos: "артикль", ukrainian: "неозначений артикль" },
  i: { ipa: "aɪ", pos: "займенник", ukrainian: "я" },
  my: { ipa: "maɪ", pos: "займенник", ukrainian: "мій / моя" },
  it: { ipa: "ɪt", pos: "займенник", ukrainian: "це / воно" },
  its: { ipa: "ɪts", pos: "займенник", ukrainian: "його / її" },
  this: { ipa: "ðɪs", pos: "займенник", ukrainian: "цей / ця / це" },
  and: { ipa: "ænd", pos: "сполучник", ukrainian: "і" },
  if: { ipa: "ɪf", pos: "сполучник", ukrainian: "якщо" },
  is: { ipa: "ɪz", pos: "дієслово", ukrainian: "є" },
  are: { ipa: "ɑːr", pos: "дієслово", ukrainian: "є / перебувають" },
  can: { ipa: "kæn", pos: "модальне дієслово", ukrainian: "можу / може" },
  would: { ipa: "wʊd", pos: "модальне дієслово", ukrainian: "би" },
  could: { ipa: "kʊd", pos: "модальне дієслово", ukrainian: "міг би" },
  to: { ipa: "tuː", pos: "прийменник", ukrainian: "до" },
  on: { ipa: "ɑːn", pos: "прийменник", ukrainian: "на" },
  in: { ipa: "ɪn", pos: "прийменник", ukrainian: "в / у" },
  from: { ipa: "frʌm", pos: "прийменник", ukrainian: "з / від" },
  with: { ipa: "wɪð", pos: "прийменник", ukrainian: "з" },
  under: { ipa: "ˈʌndər", pos: "прийменник", ukrainian: "під" },
  across: { ipa: "əˈkrɔːs", pos: "прийменник", ukrainian: "через / над" },
  beside: { ipa: "bɪˈsaɪd", pos: "прийменник", ukrainian: "біля" },
  of: { ipa: "əv", pos: "прийменник", ukrainian: "з / про" },

  sun: { ipa: "sʌn", pos: "іменник", ukrainian: "сонце" },
  comes: { ipa: "kʌmz", pos: "дієслово", ukrainian: "сходить / приходить" },
  up: { ipa: "ʌp", pos: "прислівник", ukrainian: "вгору" },
  morning: { ipa: "ˈmɔːrnɪŋ", pos: "іменник", ukrainian: "ранок" },
  cold: { ipa: "koʊld", pos: "прикметник", ukrainian: "холодний" },
  open: { ipa: "ˈoʊpən", pos: "дієслово", ukrainian: "відкривати" },
  eyes: { ipa: "aɪz", pos: "іменник", ukrainian: "очі" },
  see: { ipa: "siː", pos: "дієслово", ukrainian: "бачити" },
  road: { ipa: "roʊd", pos: "іменник", ukrainian: "дорога" },
  air: { ipa: "er", pos: "іменник", ukrainian: "повітря" },
  feels: { ipa: "fiːlz", pos: "дієслово", ukrainian: "відчувається" },
  fresh: { ipa: "freʃ", pos: "прикметник", ukrainian: "свіжий" },
  trees: { ipa: "triːz", pos: "іменник", ukrainian: "дерева" },
  stand: { ipa: "stænd", pos: "дієслово", ukrainian: "стояти" },
  tall: { ipa: "tɔːl", pos: "прикметник", ukrainian: "високий" },
  small: { ipa: "smɔːl", pos: "прикметник", ukrainian: "маленький / легкий" },
  bird: { ipa: "bɜːrd", pos: "іменник", ukrainian: "птах" },
  sings: { ipa: "sɪŋz", pos: "дієслово", ukrainian: "співає" },
  hear: { ipa: "hɪr", pos: "дієслово", ukrainian: "чути" },
  call: { ipa: "kɔːl", pos: "іменник", ukrainian: "поклик" },
  walk: { ipa: "wɔːk", pos: "дієслово", ukrainian: "йти пішки" },
  light: { ipa: "laɪt", pos: "іменник", ukrainian: "світло" },
  feel: { ipa: "fiːl", pos: "дієслово", ukrainian: "відчувати" },
  warm: { ipa: "wɔːrm", pos: "прикметник", ukrainian: "теплий" },
  inside: { ipa: "ɪnˈsaɪd", pos: "прислівник", ukrainian: "всередині" },
  mountain: { ipa: "ˈmaʊntən", pos: "іменник", ukrainian: "гора" },
  home: { ipa: "hoʊm", pos: "іменник", ukrainian: "дім" },
  day: { ipa: "deɪ", pos: "іменник", ukrainian: "день" },
  bright: { ipa: "braɪt", pos: "прикметник", ukrainian: "світлий" },
  high: { ipa: "haɪ", pos: "прикметник", ukrainian: "високий" },
  smile: { ipa: "smaɪl", pos: "дієслово", ukrainian: "усміхатися" },
  go: { ipa: "ɡoʊ", pos: "дієслово", ukrainian: "йти" },

  sit: { ipa: "sɪt", pos: "дієслово", ukrainian: "сидіти" },
  dnipro: { ipa: "ˈdniːproʊ", pos: "власна назва", ukrainian: "Дніпро" },
  evening: { ipa: "ˈiːvnɪŋ", pos: "іменник", ukrainian: "вечір" },
  sky: { ipa: "skaɪ", pos: "іменник", ukrainian: "небо" },
  gold: { ipa: "ɡoʊld", pos: "іменник / прикметник", ukrainian: "золото / золотий" },
  quiet: { ipa: "ˈkwaɪət", pos: "прикметник", ukrainian: "тихий" },
  river: { ipa: "ˈrɪvər", pos: "іменник", ukrainian: "річка" },
  moves: { ipa: "muːvz", pos: "дієслово", ukrainian: "рухається" },
  soft: { ipa: "sɔːft", pos: "прикметник", ukrainian: "м’який" },
  turns: { ipa: "tɜːrnz", pos: "дієслово", ukrainian: "стає / повертає" },
  city: { ipa: "ˈsɪti", pos: "іменник", ukrainian: "місто" },
  shines: { ipa: "ʃaɪnz", pos: "дієслово", ukrainian: "сяє" },
  blue: { ipa: "bluː", pos: "іменник / прикметник", ukrainian: "синій / синява" },
  sat: { ipa: "sæt", pos: "дієслово", ukrainian: "сидів" },
  here: { ipa: "hɪr", pos: "прислівник", ukrainian: "тут" },
  yesterday: { ipa: "ˈjestərdeɪ", pos: "прислівник", ukrainian: "учора" },
  thought: { ipa: "θɔːt", pos: "дієслово", ukrainian: "думав" },
  something: { ipa: "ˈsʌmθɪŋ", pos: "займенник", ukrainian: "щось" },
  true: { ipa: "truː", pos: "прикметник", ukrainian: "справжній / правдивий" },
  slow: { ipa: "sloʊ", pos: "прикметник", ukrainian: "повільний" },
  water: { ipa: "ˈwɔːtər", pos: "іменник", ukrainian: "вода" },
  carry: { ipa: "ˈkæri", pos: "дієслово", ukrainian: "нести" },
  dream: { ipa: "driːm", pos: "іменник", ukrainian: "мрія" },
  far: { ipa: "fɑːr", pos: "прислівник", ukrainian: "далеко" },
  breathe: { ipa: "briːð", pos: "дієслово", ukrainian: "дихати" },
  listen: { ipa: "ˈlɪsən", pos: "дієслово", ukrainian: "слухати" },
  stay: { ipa: "steɪ", pos: "дієслово", ukrainian: "залишатися" },
  keeps: { ipa: "kiːps", pos: "дієслово", ukrainian: "зберігає / береже" },
  night: { ipa: "naɪt", pos: "іменник", ukrainian: "ніч" },
  wind: { ipa: "wɪnd", pos: "іменник", ukrainian: "вітер" },
  touches: { ipa: "ˈtʌtʃɪz", pos: "дієслово", ukrainian: "торкається" },
  face: { ipa: "feɪs", pos: "іменник", ukrainian: "обличчя" },
  dark: { ipa: "dɑːrk", pos: "прикметник", ukrainian: "темний" },
  near: { ipa: "nɪr", pos: "прикметник / прислівник", ukrainian: "близько" },
  hold: { ipa: "hoʊld", pos: "дієслово", ukrainian: "тримати" },
  moment: { ipa: "ˈmoʊmənt", pos: "іменник", ukrainian: "мить" },
  let: { ipa: "let", pos: "дієслово", ukrainian: "дозволяти / давати" },

  rain: { ipa: "reɪn", pos: "іменник", ukrainian: "дощ" },
  falling: { ipa: "ˈfɔːlɪŋ", pos: "дієслово", ukrainian: "падає" },
  lviv: { ipa: "ləˈviːv", pos: "власна назва", ukrainian: "Львів" },
  streets: { ipa: "striːts", pos: "іменник", ukrainian: "вулиці" },
  watch: { ipa: "wɑːtʃ", pos: "дієслово", ukrainian: "дивитися" },
  chair: { ipa: "tʃer", pos: "іменник", ukrainian: "стілець" },
  umbrella: { ipa: "ʌmˈbrelə", pos: "іменник", ukrainian: "парасолька" },
  corner: { ipa: "ˈkɔːrnər", pos: "іменник", ukrainian: "ріг / кут" },
  people: { ipa: "ˈpiːpəl", pos: "іменник", ukrainian: "люди" },
  hurry: { ipa: "ˈhɜːri", pos: "дієслово", ukrainian: "поспішати" },
  there: { ipa: "ðer", pos: "прислівник", ukrainian: "там / туди" },
  steam: { ipa: "stiːm", pos: "іменник", ukrainian: "пара" },
  rising: { ipa: "ˈraɪzɪŋ", pos: "дієслово", ukrainian: "підіймається" },
  coffee: { ipa: "ˈkɔːfi", pos: "іменник", ukrainian: "кава" },
  cup: { ipa: "kʌp", pos: "іменник", ukrainian: "чашка" },
  warms: { ipa: "wɔːrmz", pos: "дієслово", ukrainian: "гріє" },
  hand: { ipa: "hænd", pos: "іменник", ukrainian: "рука" },
  window: { ipa: "ˈwɪndoʊ", pos: "іменник", ukrainian: "вікно" },
  holds: { ipa: "hoʊldz", pos: "дієслово", ukrainian: "тримає" },
  afternoon: { ipa: "ˌæftərˈnuːn", pos: "іменник", ukrainian: "післяобідній час" },
  like: { ipa: "laɪk", pos: "прийменник", ukrainian: "наче / як" },
  music: { ipa: "ˈmjuːzɪk", pos: "іменник", ukrainian: "музика" },
  band: { ipa: "bænd", pos: "іменник", ukrainian: "гурт" },
  street: { ipa: "striːt", pos: "іменник", ukrainian: "вулиця" },
  begins: { ipa: "bɪˈɡɪnz", pos: "дієслово", ukrainian: "починає" },
  whisper: { ipa: "ˈwɪspər", pos: "дієслово", ukrainian: "шепотіти" },
  footsteps: { ipa: "ˈfʊtsteps", pos: "іменник", ukrainian: "кроки" },
  write: { ipa: "raɪt", pos: "дієслово", ukrainian: "писати" },
  again: { ipa: "əˈɡen", pos: "прислівник", ukrainian: "знову" },
  glass: { ipa: "ɡlæs", pos: "іменник", ukrainian: "скло" },
  full: { ipa: "fʊl", pos: "прикметник", ukrainian: "повний" },
  silver: { ipa: "ˈsɪlvər", pos: "прикметник", ukrainian: "срібний" },
  lines: { ipa: "laɪnz", pos: "іменник", ukrainian: "лінії" },
  cafe: { ipa: "ˈkæfeɪ", pos: "іменник", ukrainian: "кафе / кав’ярня" },
  low: { ipa: "loʊ", pos: "прикметник", ukrainian: "низький / приглушений" },
  hours: { ipa: "ˈaʊərz", pos: "іменник", ukrainian: "години" },
};

function cleanWord(word: string) {
  return word.toLowerCase().replace(/[.,!?;:"“”‘’]/g, "");
}

function makeWords(english: string): DemoWord[] {
  const tokens = english.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];

  return tokens.map((token, index) => {
    const key = cleanWord(token);
    const meta = wordMeta[key] ?? {
      ipa: "",
      pos: "слово",
      ukrainian: "—",
    };

    return {
      order: index + 1,
      text: token,
      ...meta,
    };
  });
}

function timeToMs(time: string): number {
  const [hours, minutes, rest] = time.split(":");
  const [seconds, milliseconds = "0"] = rest.split(".");

  return (
    Number(hours) * 60 * 60 * 1000 +
    Number(minutes) * 60 * 1000 +
    Number(seconds) * 1000 +
    Number(milliseconds.padEnd(3, "0"))
  );
}

function makeTimedLines(
  trackId: string,
  items: Array<{
    start: string;
    end: string;
    english: string;
    ukrainian: string;
  }>
): DemoLine[] {
  return items.map((item, index) => ({
    id: `${trackId}_line_${String(index + 1).padStart(3, "0")}`,
    order: index + 1,
    startMs: timeToMs(item.start),
    endMs: timeToMs(item.end),
    english: item.english,
    ukrainian: item.ukrainian,
    words: makeWords(item.english),
  }));
}

export const demoSongs: DemoSong[] = [
  {
    id: "track_001",
    title: "Carpathian Morning",
    artistLabel: "Luna Original",
    genre: "Country",
    genreUk: "Кантрі",
    level: "A1",
    durationSec: 150,
    audioUrl: "/audio/track_001.mp3",
    descriptionUk: "Проста англомовна пісня про ранок у Карпатах.",
    syncOffsetMs: 0,
    lines: makeTimedLines("track_001", [
      { start: "00:00:03.000", end: "00:00:12.681", english: "The sun comes up", ukrainian: "Сонце сходить" },
      { start: "00:00:13.181", end: "00:00:22.862", english: "The morning is cold", ukrainian: "Ранок холодний" },
      { start: "00:00:23.362", end: "00:00:33.043", english: "I open my eyes", ukrainian: "Я відкриваю очі" },
      { start: "00:00:33.543", end: "00:00:43.224", english: "I see the road", ukrainian: "Я бачу дорогу" },
      { start: "00:00:43.724", end: "00:00:53.405", english: "The air feels fresh", ukrainian: "Повітря здається свіжим" },
      { start: "00:00:53.905", end: "00:01:03.586", english: "The trees stand tall", ukrainian: "Дерева стоять високі" },
      { start: "00:01:04.086", end: "00:01:13.767", english: "A small bird sings", ukrainian: "Маленький птах співає" },
      { start: "00:01:14.267", end: "00:01:23.948", english: "I hear its call", ukrainian: "Я чую його поклик" },
      { start: "00:01:24.448", end: "00:01:35.618", english: "I walk to the light", ukrainian: "Я йду до світла" },
      { start: "00:01:36.118", end: "00:01:45.799", english: "I feel warm inside", ukrainian: "Мені тепло всередині" },
      { start: "00:01:46.299", end: "00:01:55.980", english: "The mountain is home", ukrainian: "Гора — це дім" },
      { start: "00:01:56.480", end: "00:02:06.161", english: "The day is bright", ukrainian: "День світлий" },
      { start: "00:02:06.661", end: "00:02:16.342", english: "The sun is high", ukrainian: "Сонце високо" },
      { start: "00:02:16.842", end: "00:02:26.523", english: "I smile and go", ukrainian: "Я усміхаюся й іду" },
    ]),
  },
  {
    id: "track_002",
    title: "Dnipro Evening",
    artistLabel: "Luna Original",
    genre: "Pop Ballad",
    genreUk: "Поп-балада",
    level: "A2",
    durationSec: 135,
    audioUrl: "/audio/track_002.mp3",
    descriptionUk: "Спокійна англомовна пісня про вечір біля Дніпра.",
    syncOffsetMs: 0,
    lines: makeTimedLines("track_002", [
      { start: "00:00:03.000", end: "00:00:10.501", english: "I sit beside the Dnipro", ukrainian: "Я сиджу біля Дніпра" },
      { start: "00:00:11.001", end: "00:00:18.502", english: "The evening sky is gold", ukrainian: "Вечірнє небо золоте" },
      { start: "00:00:19.002", end: "00:00:25.503", english: "The quiet river moves", ukrainian: "Тиха річка рухається" },
      { start: "00:00:26.003", end: "00:00:33.504", english: "The soft light turns cold", ukrainian: "М’яке світло стає холодним" },
      { start: "00:00:34.004", end: "00:00:41.505", english: "I can see the city", ukrainian: "Я бачу місто" },
      { start: "00:00:42.005", end: "00:00:49.506", english: "It shines across the blue", ukrainian: "Воно сяє над синявою" },
      { start: "00:00:50.006", end: "00:00:56.507", english: "I sat here yesterday", ukrainian: "Я сидів тут учора" },
      { start: "00:00:57.007", end: "00:01:04.508", english: "And thought of something true", ukrainian: "І думав про щось справжнє" },
      { start: "00:01:05.008", end: "00:01:12.509", english: "Slow water, carry my dream", ukrainian: "Повільна водо, неси мою мрію" },
      { start: "00:01:13.009", end: "00:01:20.510", english: "Far under the evening light", ukrainian: "Далеко під вечірнім світлом" },
      { start: "00:01:21.010", end: "00:01:29.512", english: "I breathe, I listen, I stay", ukrainian: "Я дихаю, слухаю і залишаюся" },
      { start: "00:01:30.012", end: "00:01:37.513", english: "The river keeps the night", ukrainian: "Річка береже ніч" },
      { start: "00:01:38.013", end: "00:01:46.515", english: "A small wind touches my face", ukrainian: "Легкий вітер торкається мого обличчя" },
      { start: "00:01:47.015", end: "00:01:55.517", english: "The dark blue sky is near", ukrainian: "Темно-синє небо близько" },
      { start: "00:01:56.017", end: "00:02:03.518", english: "I hold this quiet moment", ukrainian: "Я тримаю цю тиху мить" },
      { start: "00:02:04.018", end: "00:02:11.519", english: "And let the evening hear", ukrainian: "І даю вечору почути" },
    ]),
  },
  {
    id: "track_003",
    title: "Lviv Coffee Rain",
    artistLabel: "Luna Original",
    genre: "Indie",
    genreUk: "Інді",
    level: "A2",
    durationSec: 153,
    audioUrl: "/audio/track_003.mp3",
    descriptionUk: "М’яка англомовна пісня про дощ, каву і вулиці Львова.",
    syncOffsetMs: 0,
    lines: makeTimedLines("track_003", [
      { start: "00:00:03.000", end: "00:00:12.145", english: "Rain is falling on Lviv streets", ukrainian: "Дощ падає на львівські вулиці" },
      { start: "00:00:12.645", end: "00:00:21.790", english: "I watch it from this chair", ukrainian: "Я дивлюся на нього з цього стільця" },
      { start: "00:00:22.290", end: "00:00:30.359", english: "An umbrella turns the corner", ukrainian: "Парасолька завертає за ріг" },
      { start: "00:00:30.859", end: "00:00:37.852", english: "And people hurry there", ukrainian: "І люди поспішають туди" },
      { start: "00:00:38.352", end: "00:00:47.497", english: "Steam is rising from my coffee", ukrainian: "Пара піднімається від моєї кави" },
      { start: "00:00:47.997", end: "00:00:57.142", english: "A small cup warms my hand", ukrainian: "Маленька чашка гріє мою руку" },
      { start: "00:00:57.642", end: "00:01:05.711", english: "The window holds the afternoon", ukrainian: "Вікно тримає післяобідній час" },
      { start: "00:01:06.211", end: "00:01:15.356", english: "Like music from a quiet band", ukrainian: "Наче музику тихого гурту" },
      { start: "00:01:15.856", end: "00:01:23.925", english: "The street begins to whisper", ukrainian: "Вулиця починає шепотіти" },
      { start: "00:01:24.425", end: "00:01:32.494", english: "With footsteps in the rain", ukrainian: "Кроками під дощем" },
      { start: "00:01:32.994", end: "00:01:43.215", english: "I would stay here if I could", ukrainian: "Я залишився б тут, якби міг" },
      { start: "00:01:43.715", end: "00:01:51.784", english: "And write this day again", ukrainian: "І написав би цей день знову" },
      { start: "00:01:52.284", end: "00:02:02.505", english: "The glass is full of silver lines", ukrainian: "Скло повне срібних ліній" },
      { start: "00:02:03.005", end: "00:02:11.074", english: "The cafe light is low", ukrainian: "Світло в кав’ярні приглушене" },
      { start: "00:02:11.574", end: "00:02:19.643", english: "I listen to the city", ukrainian: "Я слухаю місто" },
      { start: "00:02:20.143", end: "00:02:29.284", english: "And let the slow hours go", ukrainian: "І відпускаю повільні години" },
    ]),
  },
];
