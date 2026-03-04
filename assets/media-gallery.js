if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
          // 既存要素取得
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        };
          // PCかどうかのメディアクエリ
        this.mql = window.matchMedia('(min-width: 768px)');
        if (!this.elements.thumbnails) return;
          // スライド（上部メディア）の配列を取得
const sliderList = this.elements.viewer.querySelector('.product__media-list');
const slides = Array.from(this.elements.viewer.querySelectorAll('li[data-media-id]'));
     // 初期状態で is-active が付いているスライドをインデックス取得
let currentSlideIndex = slides.findIndex((el) => el.classList.contains('is-active'));
          // 矢印ボタンの要素を取得
    
const prevBtn = this.elements.viewer.querySelector('.slider-button--prev');
const nextBtn = this.elements.viewer.querySelector('.slider-button--next');
const goToSlide = (index) => {
  if (index < 0 || index >= slides.length) return;

  slides.forEach((el) => el.classList.remove('is-active'));
  slides[index].classList.add('is-active');

  sliderList.scrollTo({
    left: slides[index].offsetLeft,
    behavior: 'smooth',
  });
    // スライド枚数表示も更新（1オリジン表示）

  const counter = document.querySelector('.slider-counter--current');
  if (counter) counter.textContent = index + 1;

  currentSlideIndex = index;
  updateButtonState(index);
};
                  // 🔁 ボタンの有効/無効をスライド位置に応じて更新
const updateButtonState = (index) => {
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;
};
    // ▶️ 前へボタンクリック時の処理
        prevBtn?.addEventListener('click', () => {
  goToSlide(currentSlideIndex - 1);
});
  // ▶️ 次へボタンクリック時の処理
nextBtn?.addEventListener('click', () => {
  goToSlide(currentSlideIndex + 1);
});
// === スライド要素と状態の管理 ===
// === PC用マウススワイプ検知 ===
let isDragging = false;
let mouseStartX = 0;
let mouseEndX = 0;

sliderList.addEventListener('mousedown', (e) => {
  isDragging = true;
  mouseStartX = e.clientX;
});

sliderList.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  mouseEndX = e.clientX;
  const deltaX = mouseEndX - mouseStartX;

  if (Math.abs(deltaX) > 50) {
    if (deltaX < 0) {
      nextBtn.click();
    } else {
      prevBtn.click();
    }
  }
});

sliderList.addEventListener('mouseleave', () => {
  isDragging = false;
});

// === スマホ用タッチスワイプ検知 ===
let touchStartX = 0;
let touchEndX = 0;
let swipeLocked = false;
const threshold = 80;

const slidesWrapper = this.querySelector('.product__media-list');

slidesWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

slidesWrapper.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
});

const handleSwipe = () => {
  if (swipeLocked) return;

  const distance = touchEndX - touchStartX;
  if (Math.abs(distance) > threshold) {
    swipeLocked = true;

    if (distance < 0) {
      nextBtn.click();
    } else {
      prevBtn.click();
    }

    setTimeout(() => {
      swipeLocked = false;
    }, 500);
  }
};
        this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500));
        this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
          mediaToSwitch
            .querySelector('button')
            .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
        });
        if (this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) this.removeListSemantic();


      }

      onSlideChanged(event) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
        );
        this.setActiveThumbnail(thumbnail);
      }

      setActiveMedia(mediaId, prepend) {
        const activeMedia =
          this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
          this.elements.viewer.querySelector('[data-media-id]');
        if (!activeMedia) {
          return;
        }
        this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
          element.classList.remove('is-active');
        });
        activeMedia?.classList?.add('is-active');

        if (prepend) {
          activeMedia.parentElement.firstChild !== activeMedia && activeMedia.parentElement.prepend(activeMedia);

          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
            activeThumbnail.parentElement.firstChild !== activeThumbnail && activeThumbnail.parentElement.prepend(activeThumbnail);
          }

          if (this.elements.viewer.slider) this.elements.viewer.resetPages();
        }

        this.preventStickyHeader();
        window.setTimeout(() => {
          if (!this.mql.matches || this.elements.thumbnails) {
          setTimeout(() => {
            activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft, behavior: 'smooth' });
          }, 0);          }
          const activeMediaRect = activeMedia.getBoundingClientRect();
          // Don't scroll if the image is already in view
          if (activeMediaRect.top > -0.5) return;
          const top = activeMediaRect.top + window.scrollY;
          window.scrollTo({ top: top, behavior: 'smooth' });
        });
        this.playActiveMedia(activeMedia);

        if (!this.elements.thumbnails) return;
        const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
        this.setActiveThumbnail(activeThumbnail);
        this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return;

        this.elements.thumbnails
          .querySelectorAll('button')
          .forEach((element) => element.removeAttribute('aria-current'));
        thumbnail.querySelector('button').setAttribute('aria-current', true);
        if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

        this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector('.product__modal-opener--image img');
        if (!image) return;
        image.onload = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false);
          this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true);
          }, 2000);
        };
        image.src = image.src;
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia();
        const deferredMedia = activeItem.querySelector('.deferred-media');
        if (deferredMedia) deferredMedia.loadContent(false);
      }

      preventStickyHeader() {
        this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
        if (!this.stickyHeader) return;
        this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
      }

      removeListSemantic() {
        if (!this.elements.viewer.slider) return;
        this.elements.viewer.slider.setAttribute('role', 'presentation');
        this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'));
      }
    }
  );
}
