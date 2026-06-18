import { Fragment } from "react";
import { useLang } from "../lib/i18n";

interface Section {
  icon: string;
  title: string;
  body: string;
}
interface Source {
  label: string;
  url: string;
}
interface Content {
  title: string;
  intro: string;
  sections: Section[];
  footer: string;
  sourcesTitle: string; // CHANGED: data source links
  sources: Source[]; // CHANGED: data source links
  contactPrompt: string;
  contactLabel: string;
}

const EMAIL = "krupka.ua@gmail.com"; // CHANGED: contact address

const EN: Content = {
  title: "About World Explorer",
  intro:
    "World Explorer is a free, kid-friendly app for learning the world's 195 countries — and Ukraine in depth. It runs entirely in your browser, works offline, shows no ads and tracks nothing.",
  sections: [
    {
      icon: "🗺️",
      title: "Map",
      body: "An interactive world map of all 195 countries, coloured by continent. Drag to pan, scroll or pinch to zoom (centred on the cursor), double-click to zoom in, or jump straight to a continent. Click a country to open its details; tiny island states have clickable dots so they're reachable. Selecting a country outlines its land neighbours, and a pulse helps you spot it.",
    },
    {
      icon: "🧭",
      title: "Explore",
      body: "Browse by continent from a sidebar with live country counts. Each country is a tile showing its flag, name, capital and outline — click it for the full profile. Search instantly by country or capital name (in either language).",
    },
    {
      icon: "📋",
      title: "Country details",
      body: "For every country: capital, population and world share, density, median age, fertility, urban %, births per day, GDP and income per person, land & total area, the Global Peace Index, ISO and phone codes, clickable land neighbours, and 2–4 short 'Known for' facts written for children.",
    },
    {
      icon: "🎯",
      title: "Quiz — eight games", // CHANGED
      body: "Guess the capital, the country by its flag, the country by its outline, the population, the continent, 'Where in the world?', and now 'Match the flags' (connect 4 flags to 4 countries). Plus a dedicated Ukraine Quiz with three games: find the oblast on the map, guess the administrative centre, and name the oblast from a fun fact.", // CHANGED
    },
    {
      icon: "🌍",
      title: "Where in the world?",
      body: "Read a country's name and click it on the real map. Correct answers turn green; a wrong pick turns red and the right country is revealed with a pulse. A round is eight questions.",
    },
    {
      icon: "🇺🇦",
      title: "Ukraine in depth",
      body: "A dedicated Ukraine tab: a clickable map of the 25 regions (oblasts) that drills into a collapsible tree of districts, hromadas and 29,582 settlements with their 2001-census population. There's also a settlement search and a full country-wide tree.",
    },
    {
      icon: "🌐",
      title: "Two languages",
      body: "A global English / Ukrainian toggle (top-right) switches the whole interface, continent names, country names and capitals, and number formatting. Your browser's language is used by default and your choice is remembered.",
    },
    {
      icon: "💾",
      title: "Offline & open",
      body: "All data is bundled as static files, so the app needs no server and works offline — ideal for classrooms and tablets. It's built with Vite, React and TypeScript and hosted for free on GitHub Pages.",
    },
  ],
  footer:
    "Data from public sources (population 2025, GDP 2023). Flags: flag-icons. Country outlines & world map: Natural Earth. Ukraine oblasts: amCharts geodata. Settlement figures: 2001 census.",
  sourcesTitle: "Primary sources", // CHANGED
  sources: [ // CHANGED
    { label: "Worldometers (country data)", url: "https://www.worldometers.info/" },
    { label: "State Statistics of Ukraine", url: "https://www.lv.ukrstat.gov.ua/dem/piramid/all.php" },
  ],
  contactPrompt: "Spotted a mistake, or have an idea to make it better? I'd love to hear from you.",
  contactLabel: "Write",
};

const UK: Content = {
  title: "Про застосунок World Explorer",
  intro:
    "World Explorer — це безкоштовний застосунок для вивчення 195 країн світу разом із дітьми, а також України в деталях. Він працює повністю у браузері, офлайн, без реклами й без жодного відстеження.",
  sections: [
    {
      icon: "🗺️",
      title: "Карта",
      body: "Інтерактивна карта світу з усіма 195 країнами, розфарбованими за континентами. Тягни для панорамування, колесо/щипок — зум (до точки під курсором), подвійний клік — наблизити, або одразу перейди до континенту. Клік по країні відкриває деталі; крихітні острівні держави мають клікабельні крапки. При виборі країни обводяться її сухопутні сусіди, а пульс допомагає її знайти.",
    },
    {
      icon: "🧭",
      title: "Огляд",
      body: "Перегляд за континентами з бічної панелі з лічильниками країн. Кожна країна — плитка з прапором, назвою, столицею та контуром; клік відкриває повний профіль. Миттєвий пошук за назвою країни або столиці (будь-якою мовою).",
    },
    {
      icon: "📋",
      title: "Деталі країни",
      body: "Для кожної країни: столиця, населення і частка у світі, густота, медіанний вік, народжуваність, % міського населення, народжень на день, ВВП і дохід на людину, площа суші й загальна, Глобальний індекс миру, коди ISO і телефонний, клікабельні сусіди та 2–4 короткі факти «Відома чим», написані для дітей.",
    },
    {
      icon: "🎯",
      title: "Квіз — вісім ігор", // CHANGED
      body: "Вгадай столицю, країну за прапором, країну за контуром, населення, континент, «Де у світі?» і «Підбери прапори» (з'єднай 4 прапори з 4 країнами). Плюс окремий Квіз про Україну з трьома іграми: знайди область на карті, вгадай адміністративний центр та назви область за цікавим фактом.", // CHANGED
    },
    {
      icon: "🌍",
      title: "Де у світі?",
      body: "Читаєш назву країни і клікаєш її на справжній карті. Правильна відповідь стає зеленою; помилковий вибір — червоним, а правильна країна підсвічується з пульсом. Раунд — вісім питань.",
    },
    {
      icon: "🇺🇦",
      title: "Україна детально",
      body: "Окрема вкладка України: клікабельна карта 25 областей, що провалюється в згорнуте дерево районів, громад і 29 582 населених пунктів із населенням за переписом 2001 року. Є також пошук населеного пункту і повне дерево всієї країни.",
    },
    {
      icon: "🌐",
      title: "Дві мови",
      body: "Глобальний перемикач English / Українська (вгорі праворуч) змінює увесь інтерфейс, назви континентів, назви країн і столиці та формат чисел. За замовчуванням береться мова браузера, а ваш вибір запам'ятовується.",
    },
    {
      icon: "💾",
      title: "Офлайн і відкритість",
      body: "Усі дані вбудовані як статичні файли, тож застосунок не потребує сервера і працює офлайн — ідеально для класів і планшетів. Зроблено на Vite, React і TypeScript, розміщено безкоштовно на GitHub Pages.",
    },
  ],
  footer:
    "Дані з відкритих джерел (населення 2025, ВВП 2023). Прапори: flag-icons. Контури країн і карта світу: Natural Earth. Області України: геодані amCharts. Населення пунктів: перепис 2001 року.",
  sourcesTitle: "Первинні джерела", // CHANGED
  sources: [ // CHANGED
    { label: "Worldometers (дані про країни)", url: "https://www.worldometers.info/" },
    { label: "Держстат України", url: "https://www.lv.ukrstat.gov.ua/dem/piramid/all.php" },
  ],
  contactPrompt: "Знайшли неточність або маєте ідею, як зробити краще? Буду радий почути.",
  contactLabel: "Написати",
};

export function AboutTab() {
  const { lang } = useLang();
  const c = lang === "uk" ? UK : EN;
  return (
    <div className="about">
      <h1 className="about__title">{c.title}</h1>
      <p className="about__intro">{c.intro}</p>
      <div className="about__grid">
        {c.sections.map((s, i) => (
          <section key={i} className="about__card">
            <h2 className="about__card-title">
              <span aria-hidden>{s.icon}</span> {s.title}
            </h2>
            <p className="about__card-body">{s.body}</p>
          </section>
        ))}
      </div>
      <p className="about__contact">
        <span aria-hidden>✉️</span> {c.contactPrompt}{" "}
        <b>{c.contactLabel}:</b>{" "}
        <a className="about__email" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </p>
      <p className="about__footer">
        {c.footer}
        {" — "}
        {c.sourcesTitle}:{" "}
        {c.sources.map((s, i) => ( // CHANGED: render source links
          <Fragment key={s.url}>
            {i > 0 && ", "}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="about__source-link"
            >
              {s.label}
            </a>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
