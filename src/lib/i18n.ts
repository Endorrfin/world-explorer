import { createContext, useContext } from "react";
import type { Continent, Country } from "../types";

export type Lang = "en" | "uk";

/** All UI strings. Keep `en` and `uk` in sync — keys are type-checked. */
const en = {
  "tab.map": "Map",
  "tab.explore": "Explore",
  "tab.quiz": "Quiz",
  "tab.ukraine": "Ukraine",
  "tab.about": "About",
  "search.placeholder": "Search country or capital…",
  "main.all": "All countries",
  "unit.countries": "countries",
  "empty.noMatch": "No countries match",
  "sidebar.continents": "Continents",
  "sidebar.all": "All countries",

  "cont.Africa": "Africa",
  "cont.Asia": "Asia",
  "cont.Europe": "Europe",
  "cont.North America": "North America",
  "cont.South America": "South America",
  "cont.Oceania": "Oceania",

  "detail.placeholder": "Pick a country to see its capital, flag, facts and figures.",
  "detail.capital": "Capital",
  "detail.knownFor": "⭐ Known for",
  "detail.people": "👫 People",
  "detail.economy": "💰 Economy",
  "detail.land": "🗺️ Land",
  "detail.neighbours": "🧭 Neighbours",
  "detail.goodToKnow": "ℹ️ Good to know",
  "detail.locate": "🔍 Locate on map",
  "detail.island": "Island nation — no land borders.",

  "stat.population": "Population",
  "stat.worldShare": "World share",
  "stat.ofPeople": "of people",
  "stat.density": "Density",
  "stat.medianAge": "Median age",
  "stat.fertility": "Births per family",
  "stat.fertilityHint": "(fertility)",
  "stat.urban": "City dwellers",
  "stat.urbanHint": "(urban)",
  "stat.birthsPerDay": "Births per day",
  "stat.gdpTotal": "GDP (total)",
  "stat.income": "Per-person income",
  "stat.incomeHint": "(GDP per capita)",
  "stat.gdpShare": "Share of world GDP",
  "stat.landArea": "Land area",
  "stat.territory": "Territory (total)",
  "stat.territoryHint": "land + water",
  "stat.landShare": "Share of world land",
  "stat.iso": "ISO code",
  "stat.phone": "Phone code",
  "stat.peace": "Peace index",
  "peace.very": "very peaceful",
  "peace.peaceful": "peaceful",
  "peace.medium": "medium",
  "peace.less": "less peaceful",

  "map.world": "🌍 World",
  "map.hint": "Drag to pan · scroll or pinch to zoom · double-click to zoom in",

  "quiz.title": "Quiz time! 🎯",
  "quiz.lead": "Pick a game and a region, then play a round.",
  "quiz.game": "Game",
  "quiz.region": "Region",
  "quiz.start": "Start quiz →",
  "quiz.scope.all": "All",
  "quiz.progress": "Question {i} / {n}",
  "quiz.score": "Score: {s}",
  "quiz.tap": "Tap an answer",
  "quiz.next": "Next →",
  "quiz.results": "See results →",
  "quiz.playAgain": "Play again",
  "quiz.changeGame": "Change game",
  "quiz.askCapital": "What is the capital of {x}?",
  "quiz.askFlag": "Which country has this flag?",
  "quiz.askShape": "Which country has this shape?",
  "quiz.askPopulation": "About how many people live in {x}?",
  "quiz.askContinent": "Which continent is {x} in?",
  "mode.capital": "Guess the capital",
  "mode.capital.b": "See a country → pick its capital city",
  "mode.flag": "Guess the country",
  "mode.flag.b": "See a flag → pick the country",
  "mode.shape": "Guess the shape",
  "mode.shape.b": "See an outline → pick the country",
  "mode.population": "Guess the population",
  "mode.population.b": "See a country → pick how many people",
  "mode.continent": "Guess the continent",
  "mode.continent.b": "See a country → pick its continent",
  "mode.where": "Where in the world?",
  "mode.where.b": "Read a name → click the country on the map",
  "mode.match": "Match the flags", // CHANGED
  "mode.match.b": "4 flags, 4 countries — connect each pair", // CHANGED

  "match.group": "Set {i} / {n}", // CHANGED
  "match.prompt": "Click a flag, then its country", // CHANGED
  "match.hintFlag": "Pick a flag to start", // CHANGED
  "match.hintName": "Now pick the matching country", // CHANGED
  "match.next": "Next set →", // CHANGED

  "quiz.ukraine": "Ukraine 🇺🇦", // CHANGED
  "quiz.ukraine.label": "Ukraine Quiz 🇺🇦", // CHANGED
  "quiz.ukraine.blurb": "Oblasts, capitals, fun facts — 3 games", // CHANGED

  "cheer.perfect": "Perfect! 🏆",
  "cheer.great": "Great job! 🎉",
  "cheer.nice": "Nice try! 👍",
  "cheer.keep": "Keep practising! 💪",

  "find.label": "Find on the map:",
  "find.correct": "Correct! 🎉",
  "find.wrong": "Not quite — you picked {x}. {t} is in green.",
  "find.sea": "the sea",
  "find.hint": "Tap {x} on the map. Zoom in if it's tiny.",
};

const uk: Record<keyof typeof en, string> = {
  "tab.map": "Карта",
  "tab.explore": "Огляд",
  "tab.quiz": "Квіз",
  "tab.ukraine": "Україна",
  "tab.about": "Опис",
  "search.placeholder": "Пошук країни або столиці…",
  "main.all": "Усі країни",
  "unit.countries": "країн",
  "empty.noMatch": "Немає збігів за запитом",
  "sidebar.continents": "Континенти",
  "sidebar.all": "Усі країни",

  "cont.Africa": "Африка",
  "cont.Asia": "Азія",
  "cont.Europe": "Європа",
  "cont.North America": "Північна Америка",
  "cont.South America": "Південна Америка",
  "cont.Oceania": "Океанія",

  "detail.placeholder": "Обери країну, щоб побачити її столицю, прапор, факти та цифри.",
  "detail.capital": "Столиця",
  "detail.knownFor": "⭐ Відома чим",
  "detail.people": "👫 Люди",
  "detail.economy": "💰 Економіка",
  "detail.land": "🗺️ Територія",
  "detail.neighbours": "🧭 Сусіди",
  "detail.goodToKnow": "ℹ️ Корисно знати",
  "detail.locate": "🔍 Знайти на карті",
  "detail.island": "Острівна держава — без сухопутних кордонів.",

  "stat.population": "Населення",
  "stat.worldShare": "Частка у світі",
  "stat.ofPeople": "населення",
  "stat.density": "Густота",
  "stat.medianAge": "Медіанний вік",
  "stat.fertility": "Дітей на сім'ю",
  "stat.fertilityHint": "(народжуваність)",
  "stat.urban": "Міське населення",
  "stat.urbanHint": "(у містах)",
  "stat.birthsPerDay": "Народжень на день",
  "stat.gdpTotal": "ВВП (усього)",
  "stat.income": "Дохід на людину",
  "stat.incomeHint": "(ВВП на особу)",
  "stat.gdpShare": "Частка світового ВВП",
  "stat.landArea": "Площа суші",
  "stat.territory": "Територія (усього)",
  "stat.territoryHint": "суша + вода",
  "stat.landShare": "Частка світової суші",
  "stat.iso": "Код ISO",
  "stat.phone": "Телефонний код",
  "stat.peace": "Індекс миру",
  "peace.very": "дуже мирно",
  "peace.peaceful": "мирно",
  "peace.medium": "середньо",
  "peace.less": "менш мирно",

  "map.world": "🌍 Світ",
  "map.hint": "Тягни · колесо/щипок — зум · подвійний клік — наблизити",

  "quiz.title": "Час квізу! 🎯",
  "quiz.lead": "Обери гру й регіон, тоді зіграй раунд.",
  "quiz.game": "Гра",
  "quiz.region": "Регіон",
  "quiz.start": "Почати квіз →",
  "quiz.scope.all": "Усі",
  "quiz.progress": "Питання {i} / {n}",
  "quiz.score": "Рахунок: {s}",
  "quiz.tap": "Обери відповідь",
  "quiz.next": "Далі →",
  "quiz.results": "Результати →",
  "quiz.playAgain": "Грати ще",
  "quiz.changeGame": "Інша гра",
  "quiz.askCapital": "Яка столиця країни {x}?",
  "quiz.askFlag": "Яка це країна за прапором?",
  "quiz.askShape": "Яка це країна за контуром?",
  "quiz.askPopulation": "Скільки приблизно людей живе в країні {x}?",
  "quiz.askContinent": "На якому континенті розташована {x}?",
  "mode.capital": "Вгадай столицю",
  "mode.capital.b": "Бачиш країну → обери її столицю",
  "mode.flag": "Вгадай країну",
  "mode.flag.b": "Бачиш прапор → обери країну",
  "mode.shape": "Вгадай за контуром",
  "mode.shape.b": "Бачиш контур → обери країну",
  "mode.population": "Вгадай населення",
  "mode.population.b": "Бачиш країну → обери кількість людей",
  "mode.continent": "Вгадай континент",
  "mode.continent.b": "Бачиш країну → обери її континент",
  "mode.where": "Де у світі?",
  "mode.where.b": "Читай назву → клікни країну на карті",
  "mode.match": "Підбери прапори", // CHANGED
  "mode.match.b": "4 прапори, 4 країни — з'єднай кожну пару", // CHANGED

  "match.group": "Набір {i} / {n}", // CHANGED
  "match.prompt": "Клікни прапор, потім країну", // CHANGED
  "match.hintFlag": "Обери прапор, щоб почати", // CHANGED
  "match.hintName": "Тепер обери відповідну країну", // CHANGED
  "match.next": "Наступний набір →", // CHANGED

  "quiz.ukraine": "Україна 🇺🇦", // CHANGED
  "quiz.ukraine.label": "Квіз про Україну 🇺🇦", // CHANGED
  "quiz.ukraine.blurb": "Області, центри, цікаві факти — 3 гри", // CHANGED

  "cheer.perfect": "Ідеально! 🏆",
  "cheer.great": "Чудово! 🎉",
  "cheer.nice": "Непогано! 👍",
  "cheer.keep": "Тренуйся ще! 💪",

  "find.label": "Знайди на карті:",
  "find.correct": "Правильно! 🎉",
  "find.wrong": "Майже — ти обрав {x}. {t} підсвічена зеленим.",
  "find.sea": "море",
  "find.hint": "Натисни {x} на карті. Наблизь, якщо вона дрібна.",
};

export type StringKey = keyof typeof en;
const STRINGS: Record<Lang, Record<StringKey, string>> = { en, uk };

export function translate(lang: Lang, key: StringKey, params?: Record<string, string | number>): string {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export function continentLabel(lang: Lang, c: Continent): string {
  return translate(lang, `cont.${c}` as StringKey);
}

/** Country name / capital in the current language (data: Phase 2). */
export const displayName = (lang: Lang, c: Country): string => (lang === "uk" ? c.nameUk : c.name);
export const displayCapital = (lang: Lang, c: Country): string =>
  lang === "uk" ? c.capitalUk : c.capital;

export const localeOf = (lang: Lang) => (lang === "uk" ? "uk-UA" : "en-US");

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "uk") return saved;
  } catch {
    /* ignore */
  }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("uk")
    ? "uk"
    : "en";
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

/** Returns a bound translator for the current language. */
export function useT() {
  const { lang } = useContext(LangContext);
  return (key: StringKey, params?: Record<string, string | number>) => translate(lang, key, params);
}
