import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://stuttgartnails.de';
const SITE_NAME = 'SmartNails Stuttgart';

/**
 * Нормализует schema prop: один объект | массив объектов | null
 */
const serializeSchemas = (schema) => {
  if (!schema) return null;
  const list = Array.isArray(schema) ? schema : [schema];
  return list.filter(Boolean);
};

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema = null,
  canonical = null,
  noindex = false,
  nofollow = false,
  /** Язык интерфейса: de | ru — для <html lang> и части мета */
  lang = 'de',
  /** Только JSON-LD (без title/canonical), чтобы не дублировать главный SEO */
  schemaOnly = false,
}) => {
  const defaultImage = `${SITE_URL}/og-image.jpg`;
  const defaultImageWidth = 1200;
  const defaultImageHeight = 630;

  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Stuttgart`;
  const canonicalHref = canonical || SITE_URL;
  const fullUrl = canonicalHref;
  const ogLocale = lang === 'ru' ? 'ru_RU' : 'de_DE';
  const ogLocaleAlternate = lang === 'ru' ? 'de_DE' : 'ru_RU';

  const imagePath = image && image.startsWith('/') ? image : null;
  const fullImage = imagePath ? `${SITE_URL}${imagePath}` : defaultImage;

  const schemas = serializeSchemas(schema);

  if (schemaOnly) {
    return (
      <Helmet>
        {schemas?.map((piece, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(piece)}
          </script>
        ))}
      </Helmet>
    );
  }

  return (
    <Helmet htmlAttributes={{ lang: lang === 'ru' ? 'ru' : 'de' }}>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}

      <link rel="canonical" href={canonicalHref} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />
      <link rel="alternate" hrefLang="de" href={`${SITE_URL}/`} />
      <link rel="alternate" hrefLang="de-DE" href={`${SITE_URL}/`} />
      <link rel="alternate" hrefLang="ru" href={`${SITE_URL}/ru`} />
      <link rel="alternate" hrefLang="ru-RU" href={`${SITE_URL}/ru`} />
      <meta httpEquiv="content-language" content={lang === 'ru' ? 'ru' : 'de'} />

      <meta
        name="robots"
        content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`}
      />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      {fullImage.includes('/og-image.jpg') ? (
        <>
          <meta property="og:image:width" content={String(defaultImageWidth)} />
          <meta property="og:image:height" content={String(defaultImageHeight)} />
          <meta property="og:image:alt" content={`${SITE_NAME} — Nageldesign Stuttgart`} />
        </>
      ) : null}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlternate} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@smartnails_stuttgart" />

      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content="#C47088" />
      <meta name="geo.region" content="DE-BW" />
      <meta name="geo.placename" content="Stuttgart" />
      <meta name="geo.position" content="48.787838;9.178071" />
      <meta name="ICBM" content="48.787838, 9.178071" />

      {schemas?.map((piece, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(piece)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
