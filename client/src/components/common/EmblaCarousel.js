import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './EmblaCarousel.css';

/**
 * Componente di integrazione per Embla Carousel.
 *
 * @param {Array<{src: string, alt?: string}>} slides - Immagini da visualizzare
 * @param {number} slidesPerView - Numero di slide visibili contemporaneamente
 * @param {number|false} autoplayDelay - Intervallo autoplay in ms (false per disabilitarlo)
 * @param {boolean} showArrows - Mostra le frecce di navigazione
 * @param {boolean} showDots - Mostra gli indicatori di posizione
 * @param {string} objectFit - Modalità di adattamento delle immagini (cover, contain)
 * @param {Object} options - Opzioni aggiuntive di Embla (https://www.embla-carousel.com/api/options/)
 * @param {string} className - Classe CSS aggiuntiva per il contenitore
 */
const EmblaCarousel = ({
  slides = [],
  slidesPerView = 1,
  autoplayDelay = 5000,
  showArrows = true,
  showDots = true,
  objectFit = 'cover',
  options = {},
  className = '',
}) => {
  const hasMultipleSlides = slides.length > slidesPerView;

  const plugins = useMemo(() => (
    autoplayDelay && hasMultipleSlides
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
      : []
  ), [autoplayDelay, hasMultipleSlides]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultipleSlides, align: 'start', active: hasMultipleSlides, ...options },
    plugins
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onInit = useCallback((api) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onInit).off('reInit', onSelect).off('select', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`embla ${className}`}
      style={{ '--embla-slides-per-view': slidesPerView, '--embla-object-fit': objectFit }}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div className="embla__slide" key={slide.src + index}>
              <img
                className="embla__slide-img"
                src={slide.src}
                alt={slide.alt || `Slide ${index + 1}`}
                loading={index < slidesPerView ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && hasMultipleSlides && (
        <>
          <button type="button" className="embla__arrow embla__arrow--prev" onClick={scrollPrev} aria-label="Precedente">
            &#8249;
          </button>
          <button type="button" className="embla__arrow embla__arrow--next" onClick={scrollNext} aria-label="Successiva">
            &#8250;
          </button>
        </>
      )}

      {showDots && hasMultipleSlides && (
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`embla__dot${index === selectedIndex ? ' embla__dot--selected' : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmblaCarousel;
