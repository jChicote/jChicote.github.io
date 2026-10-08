/* Image viewer: click a page image to open it full size in a modal.
   Covers, gallery shots and the about portrait are picked up automatically.
   Esc / backdrop / close button to exit, arrow keys to step through. */
(function () {
  var SELECTOR = '.project-cover img, .shot-grid img, .about-frame img';

  var images = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!images.length) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML =
    '<div class="image-viewer-bar">' +
      '<span class="image-viewer-count"></span>' +
      '<button type="button" class="image-viewer-close" aria-label="Close image viewer">Esc <i class="fas fa-times" aria-hidden="true"></i></button>' +
    '</div>' +
    '<figure class="image-viewer-stage">' +
      '<div class="image-viewer-frame">' +
        '<span class="hud-corner tl"></span><span class="hud-corner tr"></span>' +
        '<span class="hud-corner bl"></span><span class="hud-corner br"></span>' +
        '<img alt="">' +
      '</div>' +
      '<figcaption class="image-viewer-caption"></figcaption>' +
    '</figure>' +
    '<button type="button" class="image-viewer-nav image-viewer-prev" aria-label="Previous image"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>' +
    '<button type="button" class="image-viewer-nav image-viewer-next" aria-label="Next image"><i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
  document.body.appendChild(dialog);

  var viewImg = dialog.querySelector('.image-viewer-frame img');
  var count = dialog.querySelector('.image-viewer-count');
  var caption = dialog.querySelector('.image-viewer-caption');
  var prev = dialog.querySelector('.image-viewer-prev');
  var next = dialog.querySelector('.image-viewer-next');
  var current = 0;
  var opener = null;

  if (images.length < 2) dialog.classList.add('is-single');

  // Reuse the gallery figcaption (keeps its <strong> title) or fall back to the alt text
  function setCaption(img) {
    var figure = img.closest('figure');
    var figcaption = figure && figure.querySelector('figcaption');
    caption.textContent = '';
    if (figcaption) {
      Array.prototype.forEach.call(figcaption.childNodes, function (node) {
        caption.appendChild(node.cloneNode(true));
      });
    } else {
      caption.textContent = img.alt;
    }
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function show(index) {
    current = (index + images.length) % images.length;
    var img = images[current];
    viewImg.src = img.currentSrc || img.src;
    viewImg.alt = img.alt;
    setCaption(img);
    count.textContent = 'IMG ' + pad(current + 1) + ' / ' + pad(images.length);
  }

  function open(index, trigger) {
    opener = trigger;
    show(index);
    document.documentElement.classList.add('image-viewer-open');
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    dialog.querySelector('.image-viewer-close').focus();
  }

  function close() {
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      onClosed();
    }
  }

  function onClosed() {
    document.documentElement.classList.remove('image-viewer-open');
    viewImg.removeAttribute('src');
    if (opener) opener.focus();
  }

  images.forEach(function (img, index) {
    // Gallery shots are already wrapped in a link to the full image (no-JS fallback);
    // standalone images get made focusable so the viewer works from the keyboard too.
    var trigger = img.closest('a') || img;
    if (trigger === img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
    }
    trigger.setAttribute('aria-label', 'View larger: ' + (img.alt || 'image'));
    trigger.classList.add('is-zoomable');

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      open(index, trigger);
    });

    trigger.addEventListener('keydown', function (event) {
      if (trigger === img && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        open(index, trigger);
      }
    });
  });

  dialog.addEventListener('close', onClosed);
  dialog.querySelector('.image-viewer-close').addEventListener('click', close);
  prev.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });

  // Clicking the dark backdrop (anything that isn't the image or a control) closes
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog || event.target.classList.contains('image-viewer-stage')) close();
  });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'Escape' && !dialog.showModal) close();
  });
})();
