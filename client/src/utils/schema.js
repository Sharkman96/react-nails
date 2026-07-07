// Утилиты для создания структурированных данных Schema.org

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/sZyBieEk21ARVjF37';

export const BUSINESS = {
  name: "SmartNails Stuttgart",
  alternateName: ["Stuttgart Nails", "smartnails_stuttgart"],
  url: "https://stuttgartnails.de",
  phone: "+49-170-1264472",
  email: "snezhana.aksenchikova@gmail.com",
  logo: "https://stuttgartnails.de/logo512.png",
  ogImage: "https://stuttgartnails.de/og-image.jpg",
  image: [
    "https://stuttgartnails.de/og-image.jpg",
    "https://stuttgartnails.de/images/gallery/20251219_135103.jpg",
  ],
  address: {
    street: "Im Kaisemer 26A",
    city: "Stuttgart",
    postalCode: "70191",
    region: "Baden-Württemberg",
    country: "DE",
  },
  geo: {
    latitude: 48.787838,
    longitude: 9.178071,
  },
  priceRange: "€€",
  openingHours: ["Mo-Sa by appointment"],
  googleMaps: GOOGLE_MAPS_URL,
  sameAs: [
    "https://instagram.com/smartnails_stuttgart",
    "https://wa.me/491701264472",
    GOOGLE_MAPS_URL,
  ],
  languages: ["German", "Russian"],
};

export const createLocalBusinessSchema = (businessData) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": businessData.name,
  "description": businessData.description,
  "url": businessData.url,
  "telephone": businessData.phone,
  "email": businessData.email,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": businessData.address.street,
    "addressLocality": businessData.address.city,
    "postalCode": businessData.address.postalCode,
    "addressCountry": businessData.address.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": businessData.geo.latitude,
    "longitude": businessData.geo.longitude
  },
  "openingHours": businessData.openingHours,
  "priceRange": businessData.priceRange,
  "paymentAccepted": businessData.paymentMethods,
  "currenciesAccepted": businessData.currencies,
  "image": businessData.images,
  "logo": businessData.logo,
  "sameAs": businessData.socialMedia,
  "areaServed": {
    "@type": "City",
    "name": "Stuttgart"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": businessData.geo.latitude,
      "longitude": businessData.geo.longitude
    },
    "geoRadius": "10000"
  }
});

export const createServiceSchema = (serviceData) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": serviceData.name,
  "description": serviceData.description,
  "provider": {
    "@type": "BeautySalon",
    "@id": `${BUSINESS.url}/#beautysalon`,
    "name": BUSINESS.name,
  },
  "areaServed": {
    "@type": "City",
    "name": "Stuttgart"
  },
  "serviceType": serviceData.category,
  "offers": {
    "@type": "Offer",
    "price": serviceData.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
});

export const createBeautySalonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${BUSINESS.url}/#beautysalon`,
  "name": BUSINESS.name,
  "alternateName": BUSINESS.alternateName,
  "description":
    "Nagelstudio in Stuttgart-Nord: Maniküre, Smart-Pediküre, Gel-Lack, Nagelverlängerung und Nageldesign. Termine nach Vereinbarung per WhatsApp oder Instagram.",
  "url": BUSINESS.url,
  "telephone": BUSINESS.phone,
  "logo": BUSINESS.logo,
  "image": BUSINESS.image,
  "priceRange": BUSINESS.priceRange,
  "openingHours": BUSINESS.openingHours,
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      "description": "Termine nach Vereinbarung per WhatsApp oder Instagram",
    },
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": BUSINESS.address.street,
    "addressLocality": BUSINESS.address.city,
    "postalCode": BUSINESS.address.postalCode,
    "addressRegion": BUSINESS.address.region,
    "addressCountry": BUSINESS.address.country,
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": BUSINESS.geo.latitude,
    "longitude": BUSINESS.geo.longitude,
  },
  "areaServed": {
    "@type": "City",
    "name": "Stuttgart",
  },
  "hasMap": BUSINESS.googleMaps,
  "sameAs": BUSINESS.sameAs,
  "knowsLanguage": BUSINESS.languages,
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Termine",
      "value": "Nach Vereinbarung / по предварительной записи",
    },
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nagelservice Preise",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Maniküre",
          "description": "Maniküre ohne Lackierung, mit Gel-Lack oder Aufbau-Gel.",
        },
        "priceCurrency": "EUR",
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Nagelverlängerung",
          "description": "Nagelverlängerung mit Gel in verschiedenen Längen.",
        },
        "priceCurrency": "EUR",
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Smart-Pediküre",
          "description": "Smart-Pediküre mit Lackierungsoptionen.",
        },
        "priceCurrency": "EUR",
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Nageldesign",
          "description": "Nail Art und Design je nach Schwierigkeit.",
        },
        "priceCurrency": "EUR",
      },
    ],
  },
});

export const createBreadcrumbSchema = (breadcrumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createReviewSchema = (reviews) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": BUSINESS.name,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": reviews.averageRating,
    "reviewCount": reviews.totalReviews,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": reviews.items.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": 5,
      "worstRating": 1
    },
    "reviewBody": review.text,
    "datePublished": review.date
  }))
});

export const createFAQSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createImageObjectSchema = (imageData) => ({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": imageData.url,
  "name": imageData.name,
  "description": imageData.description,
  "thumbnailUrl": imageData.thumbnail,
  "uploadDate": imageData.uploadDate
});

export const createWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BUSINESS.url}/#website`,
  "name": BUSINESS.name,
  "alternateName": ["Stuttgart Nails", "stuttgartnails.de"],
  "url": BUSINESS.url,
  "description":
    "Professionelle Maniküre, Pediküre, Gel-Lack, Nagelverlängerung und Naildesign in Stuttgart. Termin über WhatsApp oder Instagram.",
  "inLanguage": ["de", "ru"],
  "publisher": {
    "@id": `${BUSINESS.url}/#beautysalon`,
  },
  "sameAs": BUSINESS.sameAs,
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BUSINESS.url}/#organization`,
  "name": BUSINESS.name,
  "url": BUSINESS.url,
  "logo": BUSINESS.logo,
  "description":
    "Nagelstudio in Stuttgart: Maniküre, Smart-Pediküre, Gel-Lack und Nageldesign. Kommunikation auf Deutsch und Russisch.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": BUSINESS.address.street,
    "addressLocality": BUSINESS.address.city,
    "postalCode": BUSINESS.address.postalCode,
    "addressRegion": BUSINESS.address.region,
    "addressCountry": BUSINESS.address.country,
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": BUSINESS.phone,
    "contactType": "customer service",
    "availableLanguage": BUSINESS.languages,
    "areaServed": "DE",
  },
  "sameAs": BUSINESS.sameAs,
  "hasMap": BUSINESS.googleMaps,
}); 