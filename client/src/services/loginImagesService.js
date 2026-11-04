/**
 * Sorgente delle immagini del carosello della pagina di Login.
 *
 * Attualmente le immagini sono statiche e servite da /public/assets/login/<variante>/.
 * In futuro sarà sufficiente sostituire il corpo di getLoginImages con una chiamata
 * al backend che restituisca lo stesso formato: [{ src, alt }].
 */

export const LOGIN_IMAGE_VARIANTS = {
  MOBILE: "mobile",
  DESKTOP: "desktop",
};

const STATIC_LOGIN_IMAGES = {
  [LOGIN_IMAGE_VARIANTS.MOBILE]: [
    {
      src: "/assets/login/mobile/Vietvodao_Sfondo_Pagoda.jpg",
      alt: "Pagoda Vietnam",
    },
  ],
  [LOGIN_IMAGE_VARIANTS.DESKTOP]: [
    {
      src: "/assets/login/desktop/7X5A2309_1.jpg",
      alt: "Atleta con ventaglio",
    },
    {
      src: "/assets/login/desktop/Rubino_Riccardo.LongGian.jpg",
      alt: "Atleta con armi tradizionali",
    },
    { src: "/assets/login/desktop/7X5A2537_1.jpg", alt: "Atleta in posizione" },
  ],
};

/**
 * Restituisce le immagini da mostrare nel carosello di Login.
 * @param {string} variant - Variante (LOGIN_IMAGE_VARIANTS.MOBILE | LOGIN_IMAGE_VARIANTS.DESKTOP)
 * @returns {Promise<Array<{src: string, alt: string}>>}
 */
export const getLoginImages = async (variant) => {
  return (
    STATIC_LOGIN_IMAGES[variant] ||
    STATIC_LOGIN_IMAGES[LOGIN_IMAGE_VARIANTS.DESKTOP]
  );
};
