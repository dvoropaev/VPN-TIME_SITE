const goTopBtn = document.querySelector(".go-top");

if (goTopBtn) {
  goTopBtn.addEventListener("click", goTop);
  window.addEventListener("scroll", trackScroll);

  function trackScroll() {
    const scrolled = window.pageYOffset;

    if (scrolled > 200) {
      goTopBtn.classList.add("go-top--show");
    } else {
      goTopBtn.classList.remove("go-top--show");
    }
  }

  function goTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

const isInstructionPage = /page-instructions/.test(document.body.className);
const instructionImages = isInstructionPage
  ? document.querySelectorAll(".img__box img")
  : [];

if (instructionImages.length) {
  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.innerHTML = `
    <button type="button" class="image-lightbox__close" aria-label="Закрыть">✕</button>
    <div class="image-lightbox__viewport">
      <img class="image-lightbox__img" alt="Увеличенное изображение" />
    </div>
  `;
  document.body.append(overlay);

  const lightboxImage = overlay.querySelector(".image-lightbox__img");
  const lightboxViewport = overlay.querySelector(".image-lightbox__viewport");
  const closeButton = overlay.querySelector(".image-lightbox__close");

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragPointerId = null;
  const pointers = new Map();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const getDistance = (firstPointer, secondPointer) =>
    Math.hypot(
      secondPointer.clientX - firstPointer.clientX,
      secondPointer.clientY - firstPointer.clientY,
    );

  const clampScale = (nextScale) =>
    Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));

  const updateTransform = () => {
    lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  const openImage = (source) => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    lightboxImage.src = source;
    updateTransform();
    overlay.classList.add("is-active");
    document.body.classList.add("lightbox-open");
  };

  const closeImage = () => {
    overlay.classList.remove("is-active");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    pointers.clear();
    isDragging = false;
    dragPointerId = null;
  };

  instructionImages.forEach((img) => {
    img.classList.add("img__box-clickable");
    img.addEventListener("click", () => openImage(img.src));
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeImage();
    }
  });

  closeButton.addEventListener("click", closeImage);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-active")) {
      closeImage();
    }
  });

  lightboxImage.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.15 : -0.15;
    scale = clampScale(scale + delta);
    updateTransform();
  });

  lightboxViewport.addEventListener("pointerdown", (event) => {
    pointers.set(event.pointerId, event);

    if (pointers.size === 2) {
      const [firstPointer, secondPointer] = [...pointers.values()];
      pinchStartDistance = getDistance(firstPointer, secondPointer);
      pinchStartScale = scale;
      isDragging = false;
      dragPointerId = null;
      return;
    }

    isDragging = true;
    dragPointerId = event.pointerId;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    lightboxViewport.setPointerCapture(dragPointerId);
  });

  lightboxViewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.set(event.pointerId, event);

    if (pointers.size >= 2) {
      const [firstPointer, secondPointer] = [...pointers.values()];
      const distance = getDistance(firstPointer, secondPointer);

      if (pinchStartDistance) {
        scale = clampScale((distance / pinchStartDistance) * pinchStartScale);
        updateTransform();
      }

      return;
    }

    if (!isDragging || event.pointerId !== dragPointerId) {
      return;
    }

    translateX = event.clientX - startX;
    translateY = event.clientY - startY;
    updateTransform();
  });

  const clearPointer = (event) => {
    pointers.delete(event.pointerId);

    if (event.pointerId === dragPointerId) {
      isDragging = false;
      dragPointerId = null;
    }

    if (pointers.size < 2) {
      pinchStartDistance = 0;
    }
  };

  lightboxViewport.addEventListener("pointerup", clearPointer);
  lightboxViewport.addEventListener("pointercancel", clearPointer);
  lightboxViewport.addEventListener("pointerleave", clearPointer);
}
