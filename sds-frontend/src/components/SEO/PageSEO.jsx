import { Helmet } from 'react-helmet-async';
import { absoluteUrl, SITE } from '../../config/site.js';

export const PageSEO = ({
    title,
    description,
    canonical,
    ogImage = SITE.defaultImage,
    ogImageAlt,
    ogImageWidth = SITE.defaultImageWidth,
    ogImageHeight = SITE.defaultImageHeight,
    noIndex = false,
}) => {
    const fullCanonical = absoluteUrl(canonical);
    const fullTitle = title === SITE.name ? title : `${title} | ${SITE.name}`;
    const fullImage = absoluteUrl(ogImage);
    const imageAlt = ogImageAlt || `${SITE.name}, academia de danza en Palermo`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta
                name="robots"
                content={noIndex ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large'}
            />
            <link rel="canonical" href={fullCanonical} />

            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:secure_url" content={fullImage} />
            <meta property="og:image:alt" content={imageAlt} />
            <meta property="og:image:width" content={String(ogImageWidth)} />
            <meta property="og:image:height" content={String(ogImageHeight)} />
            <meta property="og:locale" content={SITE.locale} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE.name} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
            <meta name="twitter:image:alt" content={imageAlt} />

            <meta name="geo.region" content="AR-C" />
            <meta name="geo.placename" content="Palermo, Buenos Aires, Argentina" />
            <meta name="geo.position" content={`${SITE.geo.latitude};${SITE.geo.longitude}`} />
            <meta name="ICBM" content={`${SITE.geo.latitude}, ${SITE.geo.longitude}`} />
        </Helmet>
    );
};

export default PageSEO;
