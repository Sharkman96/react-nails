'use strict';

const LANDING_SLUGS = [
  'gelnagel-stuttgart',
  'manikure-stuttgart',
  'preise',
  'stuttgart-nord',
];

function landingSpaPaths() {
  return LANDING_SLUGS.flatMap((slug) => [`/${slug}`, `/ru/${slug}`]);
}

module.exports = {
  LANDING_SLUGS,
  landingSpaPaths,
};
