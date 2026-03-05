const goTopBtn = document.querySelector('.go-top');

if (goTopBtn) {
  goTopBtn.addEventListener('click', goTop);
  window.addEventListener('scroll', trackScroll);

  function trackScroll() {
    const scrolled = window.pageYOffset;

    if (scrolled > 200) {
      goTopBtn.classList.add('go-top--show');
    } else {
      goTopBtn.classList.remove('go-top--show');
    }
  }

  function goTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

const isInstructionPage = /page-instructions/.test(document.body.className);
const instructionImages = isInstructionPage
  ? document.querySelectorAll('.img__box img')
  : [];

if (instructionImages.length) {
  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox';
  overlay.innerHTML = `
    <button type="button" class="image-lightbox__close" aria-label="Закрыть">✕</button>
    <img class="image-lightbox__img" alt="Увеличенное изображение" />
  `;
  document.body.append(overlay);

  const lightboxImage = overlay.querySelector('.image-lightbox__img');
  const closeButton = overlay.querySelector('.image-lightbox__close');

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let activePointerId = null;

  const updateTransform = () => {
    lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  const openImage = (source) => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    lightboxImage.src = source;
    updateTransform();
    overlay.classList.add('is-active');
    document.body.classList.add('lightbox-open');
  };

  const closeImage = () => {
    overlay.classList.remove('is-active');
    document.body.classList.remove('lightbox-open');
    lightboxImage.src = '';
  };

  instructionImages.forEach((img) => {
    img.classList.add('img__box-clickable');
    img.addEventListener('click', () => openImage(img.src));
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeImage();
    }
  });

  closeButton.addEventListener('click', closeImage);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeImage();
    }
  });

  lightboxImage.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.15 : -0.15;
    scale = Math.max(1, Math.min(4, scale + delta));
    updateTransform();
  });

  lightboxImage.addEventListener('pointerdown', (event) => {
    isDragging = true;
    activePointerId = event.pointerId;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    lightboxImage.setPointerCapture(activePointerId);
  });

  lightboxImage.addEventListener('pointermove', (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    translateX = event.clientX - startX;
    translateY = event.clientY - startY;
    updateTransform();
  });

  lightboxImage.addEventListener('pointerup', () => {
    isDragging = false;
    activePointerId = null;
  });

  lightboxImage.addEventListener('pointercancel', () => {
    isDragging = false;
    activePointerId = null;
  });
}
