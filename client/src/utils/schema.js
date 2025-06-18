// Утилиты для создания структурированных данных Schema.org

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
    "@type": "LocalBusiness",
    "name": "Smart Nails Stuttgart"
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
  "name": "Smart Nails Stuttgart",
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
  "name": "Smart Nails Stuttgart",
  "url": "https://stuttgartnails.de",
  "description": "Профессиональный маникюр и педикюр в Штутгарте. Современные технологии, качественные материалы, опытные мастера.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://stuttgartnails.de/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://instagram.com/smartnails_stuttgart",
    "https://facebook.com/smartnailsstuttgart"
  ]
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Smart Nails Stuttgart",
  "url": "https://stuttgartnails.de",
  "logo": "https://stuttgartnails.de/images/logo.png",
  "description": "Профессиональная студия маникюра и педикюра в Штутгарте",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Königstraße 123",
    "addressLocality": "Stuttgart",
    "postalCode": "70173",
    "addressCountry": "DE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+49-711-1234567",
    "contactType": "customer service",
    "availableLanguage": ["German", "Russian", "English"]
  },
  "sameAs": [
    "https://instagram.com/smartnails_stuttgart",
    "https://facebook.com/smartnailsstuttgart"
  ]
}); 