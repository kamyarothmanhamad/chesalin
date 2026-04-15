/* ═══════════════════════════════════════
   gallery.js — Gallery & Lightbox engine
   ═══════════════════════════════════════ */

const ALBUMS = [
  { nameRu: 'Ул. Клинская',   nameEn: 'Klinskaya St.',    id: 0 },
  { nameRu: 'Красносельская', nameEn: 'Krasnoselskaya',   id: 1 },
  { nameRu: 'Новокосино',     nameEn: 'Novokosino',       id: 2 },
  { nameRu: 'Альбом 4',       nameEn: 'Album 4',          id: 3 },
];

const LAYOUT_MODS = [
  { idx: 0, cls: 'tall' }, { idx: 5, cls: 'wide' },
  { idx: 9, cls: 'tall' }, { idx: 14, cls: 'wide' },
];

let photos = [];
let lbIndex = 0;

function getAlbumName(albumId) {
  const alb = ALBUMS.find(a => a.id === albumId);
  if (!alb) return '';
  return currentLang === 'en' ? alb.nameEn : alb.nameRu;
}

/* ── UPLOAD HANDLER ── */
document.getElementById('photo-upload-input').addEventListener('change', function(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  let loaded = 0;
  files.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const name = file.name.toLowerCase();
      let albumIdx = 0;
      if (name.includes('klinsk') || name.includes('клинск')) albumIdx = 0;
      else if (name.includes('krasnos') || name.includes('красносел')) albumIdx = 1;
      else if (name.includes('novok') || name.includes('новокосин')) albumIdx = 2;
      else if (name.includes('alb4') || name.includes('альбом4')) albumIdx = 3;
      else albumIdx = (photos.length + i) % 4;
      photos.push({ src: ev.target.result, album: albumIdx });
      loaded++;
      if (loaded === files.length) renderGallery();
    };
    reader.readAsDataURL(file);
  });
  this.value = '';
});

/* ── RENDER GALLERY ── */
function renderGallery() {
  const hint = document.getElementById('uploadHint');
  if (photos.length > 0) hint.style.display = 'none';

  document.getElementById('cnt-all').textContent = photos.length;
  ALBUMS.forEach((alb, i) => {
    const cnt = photos.filter(p => p.album === i).length;
    const el = document.getElementById('cnt-' + i);
    if (el) el.textContent = cnt || '—';
  });

  const shownEl = document.getElementById('shown-count');
  if (shownEl) shownEl.textContent = photos.length;

  // All grid
  const allGrid = document.getElementById('grid-all');
  allGrid.innerHTML = '';
  if (photos.length === 0) {
    renderPlaceholders(allGrid, 8, true);
  } else {
    photos.forEach((photo, i) => {
      const cell = document.createElement('div');
      cell.className = 'gitem';
      const mod = LAYOUT_MODS.find(m => m.idx === i);
      if (mod) cell.classList.add(mod.cls);
      cell.innerHTML = `
        <img src="${photo.src}" alt="${getAlbumName(photo.album)}" loading="lazy"/>
        <div class="gitem-overlay"><span class="gitem-label">${getAlbumName(photo.album)}</span></div>
        <div class="gitem-zoom">⊕</div>`;
      cell.addEventListener('click', () => openLightbox(photos, i, getAlbumName(photo.album)));
      allGrid.appendChild(cell);
    });
  }

  // Per-album grids
  ALBUMS.forEach((alb, i) => {
    const grid = document.getElementById('grid-' + i);
    if (!grid) return;
    grid.innerHTML = '';
    const items = photos.filter(p => p.album === i);
    if (items.length === 0) {
      renderPlaceholders(grid, 6, false);
    } else {
      items.forEach((photo, idx) => {
        const cell = document.createElement('div');
        cell.className = 'gitem';
        cell.innerHTML = `
          <img src="${photo.src}" alt="${getAlbumName(alb.id)}" loading="lazy"/>
          <div class="gitem-overlay"><span class="gitem-label">${getAlbumName(alb.id)}</span></div>
          <div class="gitem-zoom">⊕</div>`;
        cell.addEventListener('click', () => openLightbox(items, idx, getAlbumName(alb.id)));
        grid.appendChild(cell);
      });
    }
  });
}

function renderPlaceholders(grid, count, useLayout) {
  for (let i = 0; i < count; i++) {
    const cell = document.createElement('div');
    cell.className = 'gitem';
    if (useLayout) {
      const mod = LAYOUT_MODS.find(m => m.idx === i);
      if (mod) cell.classList.add(mod.cls);
    }
    cell.innerHTML = `<div class="gitem-placeholder">
      <div class="placeholder-icon">◻</div>
      <div class="placeholder-tag" data-i18n="lb_placeholder"></div>
    </div>`;
    grid.appendChild(cell);
  }
}

/* ── LIGHTBOX ── */
let lbItems = [];

function openLightbox(items, startIdx, albumName) {
  lbItems = items;
  lbIndex = startIdx;
  document.getElementById('lb-album-name').textContent = albumName || '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderStrip();
  showLbPhoto(lbIndex);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbStep(dir) {
  lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
  showLbPhoto(lbIndex);
  scrollThumbIntoView(lbIndex);
}

function showLbPhoto(idx) {
  const item = lbItems[idx];
  const img = document.getElementById('lightbox-img');
  const ph = document.getElementById('lightbox-placeholder');
  document.getElementById('lb-counter').textContent = `${idx + 1} / ${lbItems.length}`;
  if (item && item.src) {
    img.src = item.src;
    img.style.display = 'block';
    ph.style.display = 'none';
    document.getElementById('lb-title').textContent = '';
  } else {
    img.style.display = 'none';
    ph.style.display = 'flex';
  }
  document.querySelectorAll('.lb-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

function renderStrip() {
  const strip = document.getElementById('lb-strip');
  strip.innerHTML = '';
  lbItems.forEach((item, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'lb-thumb' + (i === lbIndex ? ' active' : '');
    if (item && item.src) {
      thumb.innerHTML = `<img src="${item.src}" alt=""/>`;
    } else {
      thumb.innerHTML = `<span style="font-family:var(--serif);font-size:0.65rem;color:rgba(201,169,110,0.4)">${i+1}</span>`;
      thumb.style.cssText = 'display:flex;align-items:center;justify-content:center';
    }
    thumb.addEventListener('click', () => { lbIndex = i; showLbPhoto(i); scrollThumbIntoView(i); });
    strip.appendChild(thumb);
  });
}

function scrollThumbIntoView(idx) {
  const strip = document.getElementById('lb-strip');
  const thumbs = strip.querySelectorAll('.lb-thumb');
  if (thumbs[idx]) thumbs[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

/* ── KEYBOARD & SWIPE ── */
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') lbStep(1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') lbStep(-1);
  if (e.key === 'Escape') closeLightbox();
});

let tsX = 0;
document.getElementById('lightbox-img-wrap').addEventListener('touchstart', e => { tsX = e.touches[0].clientX; });
document.getElementById('lightbox-img-wrap').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tsX;
  if (Math.abs(dx) > 40) lbStep(dx < 0 ? 1 : -1);
});

/* ── ALBUM TABS ── */
document.getElementById('albumTabs').addEventListener('click', e => {
  const tab = e.target.closest('.atab');
  if (!tab) return;
  const albumIdx = parseInt(tab.dataset.album);
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  document.querySelectorAll('.gallery-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + albumIdx).classList.add('active');
});

/* Init */
renderGallery();
