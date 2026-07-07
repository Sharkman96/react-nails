/**
 * После react-snap создаёт/обновляет build/ru/index.html
 * с русскими meta, canonical, hreflang и fallback-контентом для краулеров.
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const ROOT_INDEX = path.join(BUILD_DIR, 'index.html');
const RU_DIR = path.join(BUILD_DIR, 'ru');
const RU_INDEX = path.join(RU_DIR, 'index.html');

const RU_DESCRIPTION =
  'Маникюр, смарт-педикюр, гель-лак, наращивание и дизайн ногтей в Штутгарте (70191). Запись в WhatsApp или Instagram. Русский и немецкий языки.';
const RU_KEYWORDS =
  'маникюр Штутгарт, педикюр Штутгарт, наращивание ногтей Штутгарт, гель лак Штутгарт, дизайн ногтей, салон Im Kaisemer 26A Stuttgart, русский мастер маникюра Германия';

const RU_FAQ_JSON_LD = `        {
          "@type": "FAQPage",
          "@id": "https://stuttgartnails.de/ru#faq",
          "inLanguage": "ru",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Как записаться на приём?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Вы можете записаться через Instagram @smartnails_stuttgart или по WhatsApp. Просто напишите нам сообщение с желаемой датой."
              }
            },
            {
              "@type": "Question",
              "name": "Сколько держится гель-лак?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "При правильном уходе гель-лак держится 2-3 недели. Стойкость зависит от вашего образа жизни и ухода за ногтями."
              }
            },
            {
              "@type": "Question",
              "name": "Какие материалы вы используете?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Мы используем только качественные и сертифицированные материалы ведущих брендов, безопасные для вашего здоровья."
              }
            },
            {
              "@type": "Question",
              "name": "Могу ли я принести свой дизайн?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Конечно! Приносите фото или идеи, и мы вместе обсудим, как воплотить ваш желаемый дизайн."
              }
            }
          ]
        }`;

function patchRuHtml(html) {
  let out = html;

  out = out.replace(/<html lang="de"/, '<html lang="ru"');
  out = out.replace(/<html lang="ru" data-theme/, '<html lang="ru" data-theme');

  out = out.replace(
    /<meta http-equiv="content-language" content="de">/,
    '<meta http-equiv="content-language" content="ru">'
  );

  out = out.replace(
    /<link rel="canonical" href="https:\/\/stuttgartnails\.de\/">/,
    '<link rel="canonical" href="https://stuttgartnails.de/ru">'
  );

  let descDone = false;
  out = out.replace(/<meta name="description" content="[^"]*">/g, (match) => {
    if (descDone) return match;
    descDone = true;
    return `<meta name="description" content="${RU_DESCRIPTION}">`;
  });

  out = out.replace(
    /<meta name="keywords" content="[^"]*">/,
    `<meta name="keywords" content="${RU_KEYWORDS}">`
  );

  out = out.replace(
    /<meta property="og:url" content="https:\/\/stuttgartnails\.de\/">/,
    '<meta property="og:url" content="https://stuttgartnails.de/ru">'
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*">/,
    '<meta property="og:title" content="Маникюр и педикюр Штутгарт | SmartNails Stuttgart">'
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*">/,
    '<meta property="og:description" content="Маникюр, гель-лак, наращивание и дизайн ногтей в Штутгарте. Запись в WhatsApp или Instagram.">'
  );
  out = out.replace(
    /<meta property="og:locale" content="de_DE">/,
    '<meta property="og:locale" content="ru_RU">'
  );
  out = out.replace(
    /<meta property="og:locale:alternate" content="ru_RU">/,
    '<meta property="og:locale:alternate" content="de_DE">'
  );

  out = out.replace(
    /<meta name="twitter:url" content="https:\/\/stuttgartnails\.de\/">/,
    '<meta name="twitter:url" content="https://stuttgartnails.de/ru">'
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    '<meta name="twitter:title" content="Маникюр и педикюр Штутгарт | SmartNails Stuttgart">'
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    '<meta name="twitter:description" content="Маникюр, гель-лак, наращивание и дизайн ногтей в Штутгарте.">'
  );

  out = out.replace(
    /<title>[^<]*<\/title>/,
    '<title>Маникюр и педикюр Штутгарт | SmartNails Stuttgart</title>'
  );

  // Заменяем весь объект FAQPage в @graph (включая { … }), иначе JSON-LD ломается
  out = out.replace(
    /\{\s*\n\s*"@type": "FAQPage"[\s\S]*?\n\s*\]\s*\n\s*\}/,
    RU_FAQ_JSON_LD.trim()
  );

  const ldJsonMatch = out.match(
    /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/
  );
  if (ldJsonMatch) {
    try {
      JSON.parse(ldJsonMatch[1]);
    } catch (error) {
      throw new Error(
        `patch-ru-html: invalid JSON-LD after patch — ${error.message}`
      );
    }
  }

  return out;
}

if (!fs.existsSync(ROOT_INDEX)) {
  console.warn('patch-ru-html: build/index.html not found, skip');
  process.exit(0);
}

const source = fs.existsSync(RU_INDEX)
  ? fs.readFileSync(RU_INDEX, 'utf8')
  : fs.readFileSync(ROOT_INDEX, 'utf8');

fs.mkdirSync(RU_DIR, { recursive: true });
fs.writeFileSync(RU_INDEX, patchRuHtml(source), 'utf8');
console.log('patch-ru-html: wrote build/ru/index.html');
