/* COART Sculpture Studio — main script (data-driven) */
(function () {
  var D = window.NBCOART || { categories: [], products: [] };
  var WA = 'https://wa.me/8613566930986';
  // HTML inline/attribute escaper (DO NOT URL-encode visible text)
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function fmtPrice(p) {
    if (!p || !p.price) return '';
    var n = String(p.price).replace(/[^\d.]/g, '');
    var num = parseFloat(n);
    if (isNaN(num)) return p.price;
    return '$' + Math.round(num).toLocaleString('en-US');
  }
  function waLink(p) {
    var txt = 'Hi David, I’m interested in your ' + (p.name || 'sculpture') +
              (p.model ? ' (' + p.model + ')' : '') + '. Could you please share the price and details?';
    return WA + '?text=' + encodeURIComponent(txt);
  }

  // ---- Mobile menu ----
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); }); });
  }

  var byId = {};
  D.products.forEach(function (p) { byId[p.id] = p; });

  // clean a scraped description; hide layout/nav junk so the detail view reads well
  function cleanDesc(p) {
    if (!p || !p.desc) return '';
    var d = String(p.desc).replace(/\s+/g, ' ').trim();
    if (d.length < 12) return '';
    if (/scd-maintenance|Home Home Products|Products\s+Products/i.test(d)) return '';
    return d;
  }
  function productCard(p) {
    return '<article class="product-card">'
      + '<div class="product-thumb"><button class="pd-open" style="border:0;padding:0;background:none;width:100%;height:100%" data-id="' + esc(p.id) + '" aria-label="View details">'
      + '<img loading="lazy" src="' + esc(p.img) + '" alt="' + esc(p.name) + '"></button>'
      + (p.model ? '<span class="product-tag">' + esc(p.model) + '</span>' : '')
      + '</div>'
      + '<div class="product-body">'
      + '<h3 class="pd-open" data-id="' + esc(p.id) + '">' + esc(p.name) + '</h3>'
      + '<div class="product-model">' + esc(p.subcategory || p.model || (p.category_name || 'Sculpture')) + '</div>'
      + '<div class="product-foot">'
      + '<div class="price">' + fmtPrice(p) + '</div>'
      + '<div class="card-actions">'
      + '<button class="gbtn pd-open" data-id="' + esc(p.id) + '">Details</button>'
      + '<a class="gbtn inquiry-btn" href="' + waLink(p) + '" target="_blank" rel="noopener">Get Price</a>'
      + '</div></div></div></article>';
  }

  function renderInto(sel, list) {
    var host = document.querySelector(sel);
    if (!host) return;
    host.innerHTML = list.map(productCard).join('');
    host.querySelectorAll('.pd-open').forEach(function (b) {
      b.addEventListener('click', function () {
        openDetail(b.getAttribute('data-id'));
      });
    });
  }

  // ---- 1. Category overview cards (products.html) ----
  function catCount(cid) { return D.products.filter(function (p) { return p.category === cid; }).length; }
  var catGrid = document.getElementById('category-cards');
  if (catGrid && D.categories.length) {
    catGrid.innerHTML = D.categories.filter(function (c) { return catCount(c.id) > 0; }).map(function (c) {
      return '<a class="cat-card" href="' + esc(c.page) + '">'
        + '<img loading="lazy" src="' + esc(c.img) + '" alt="' + esc(c.name) + '">'
        + '<span class="cc-arrow">→</span>'
        + '<div class="cc-overlay"><h3>' + esc(c.name) + '</h3>'
        + '<span class="cc-count">' + catCount(c.id) + ' designs</span></div></a>';
    }).join('');
  }

  // ---- 2. Category chip strip (home) ----
  var strip = document.getElementById('cat-strip');
  if (strip && D.categories.length) {
    strip.innerHTML = D.categories.map(function (c) {
      return '<a class="cat-chip" href="' + esc(c.page) + '"><span class="icon">' + (c.icon || '●') + '</span>'
        + '<span class="name">' + esc(c.name) + '</span></a>';
    }).join('');
  }

  // ---- 3. Per-category product grid (with metal subcategory filter) ----
  var grid = document.getElementById('product-grid');
  if (grid) {
    var cat = grid.getAttribute('data-category');
    var list = D.products.filter(function (p) { return p.category === cat; });
    var cntEl = document.querySelector('[data-count="' + cat + '"]');
    if (cntEl) cntEl.textContent = list.length + ' designs';

    // sub-category tabs (metal only)
    var tabsHost = document.getElementById('subcat-tabs');
    var activeSub = '';
    if (tabsHost && D.subcategories && D.subcategories[cat]) {
      var subs = D.subcategories[cat];
      var btnHtml = ['<button class="subcat-btn active" data-sub="">All</button>'].concat(
        subs.map(function (s) {
          var n = list.filter(function (p) { return p.subcategory === s; }).length;
          return '<button class="subcat-btn" data-sub="' + esc(s) + '">' + esc(s) + ' (' + n + ')</button>';
        })).join('');
      tabsHost.innerHTML = btnHtml;
      tabsHost.querySelectorAll('.subcat-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          activeSub = b.getAttribute('data-sub');
          tabsHost.querySelectorAll('.subcat-btn').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          var filtered = activeSub ? list.filter(function (p) { return p.subcategory === activeSub; }) : list;
          renderInto('#product-grid', filtered);
          var bar = document.getElementById('grid-count');
          if (bar) bar.textContent = filtered.length + ' designs';
        });
      });
    }
    renderInto('#product-grid', list);
    var bar = document.getElementById('grid-count');
    if (bar) bar.textContent = list.length + ' designs';
  }

  // ---- 4. Featured / original-design grid ----
  var feat = document.getElementById('featured-grid');
  if (feat) {
    var cats = D.categories.map(function (c) { return c.id; });
    var picks = D.products.filter(function (p) {
      var name = p.name.toLowerCase();
      return /landmark|tree|gold|sphere|moon|dolphin|hand|gate|flame|star/i.test(name);
    });
    if (picks.length < 6) picks = D.products.slice(0, 6);
    renderInto('#featured-grid', picks.slice(0, 6));
  }

  // ---- 5. Hero carousel ----
  var heroSection = document.getElementById('hero');
  var heroBg = document.getElementById('hero-bg');
  if (heroBg && D.hero && D.hero.length) {
    var hi = 0, t;
    function heroSet(n) {
      hi = (n + D.hero.length) % D.hero.length;
      heroBg.style.backgroundImage = 'url("' + D.hero[hi] + '")';
    }
    function restart() { if (t) clearInterval(t); if (D.hero.length > 1) t = setInterval(function () { heroSet(hi + 1); }, 5000); }
    heroSet(0); restart();
    function bind(id, delta) { var b = document.getElementById(id); if (b) b.addEventListener('click', function (e) { e.preventDefault(); heroSet(hi + delta); restart(); }); }
    bind('hero-prev', -1); bind('hero-next', 1);
  }

  // ---- 6. About: production-photo carousel (arrows + click to lightbox) ----
  var aboutCar = document.getElementById('about-carousel');
  var aboutImg = document.getElementById('about-carousel-img');
  var pool = (D.production && D.production.length) ? D.production.slice() : [];
  if (aboutCar && aboutImg && pool.length) {
    var ai = 0, at;
    function aboutSet(n) {
      ai = (n + pool.length) % pool.length;
      aboutImg.src = pool[ai];
    }
    function aboutRestart() { if (at) clearInterval(at); if (pool.length > 1) at = setInterval(function () { aboutSet(ai + 1); }, 3800); }
    aboutSet(0); aboutRestart();
    var ap = document.getElementById('about-prev'), an = document.getElementById('about-next');
    if (ap) ap.addEventListener('click', function (e) { e.stopPropagation(); aboutSet(ai - 1); aboutRestart(); });
    if (an) an.addEventListener('click', function (e) { e.stopPropagation(); aboutSet(ai + 1); aboutRestart(); });
    aboutImg.addEventListener('click', function () { openLightbox(pool[ai], ''); });
  }

  // ---- 7. Lightbox ----
  var lb = document.getElementById('lightbox');
  var idx = 0;
  function openLightbox(src, name, setArr) {
    if (!lb) return;
    if (setArr && setArr.length) { setArrN = setArr.slice(); idx = Math.max(0, setArrN.indexOf(src)); }
    else { setArrN = [src]; idx = 0; }
    renderLb(name);
  }
  var setArrN = [];
  function renderLb(name) {
    if (!lb) return;
    var nav = (setArrN.length > 1)
      ? '<button class="lightbox-nav prev" data-d="-1">‹</button><button class="lightbox-nav next" data-d="1">›</button>' : '';
    lb.innerHTML = '<div class="lightbox-overlay"></div><div class="lightbox-body">'
      + '<img src="' + setArrN[idx] + '" alt="">'
      + '<p>' + (idx + 1) + ' / ' + setArrN.length + '</p>' + nav
      + '<button class="lightbox-close">×</button></div>';
    document.body.style.overflow = 'hidden';
    lb.style.display = 'flex';
    lb.querySelector('.lightbox-close').addEventListener('click', close);
    lb.querySelector('.lightbox-overlay').addEventListener('click', close);
    lb.querySelectorAll('.lightbox-nav').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); idx = (idx + parseInt(b.getAttribute('data-d'), 10) + setArrN.length) % setArrN.length; renderLb(name); });
    });
    var key = function (e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', key); }
      else if (e.key === 'ArrowRight') { idx = (idx + 1) % setArrN.length; renderLb(name); }
      else if (e.key === 'ArrowLeft') { idx = (idx - 1 + setArrN.length) % setArrN.length; renderLb(name); }
    };
    document.removeEventListener('keydown', key); document.addEventListener('keydown', key);
  }
  function close() { if (lb) { lb.style.display = 'none'; document.body.style.overflow = ''; } }
  function openSet(arr, shotIdx) {
    if (!lb || !arr.length) return;
    setArrN = arr.slice(); idx = shotIdx || 0; renderLb('');
  }
  // expose for gallery arrays if ever needed
  window.openCoartSet = openSet;
  window.openCoartLb = openLightbox;

  // ---- 7b. Product detail overlay ----
  var pdSrc = [], pdIdx = 0, pdWrap = null;
  function getPd() {
    if (pdWrap) return pdWrap;
    pdWrap = document.createElement('div');
    pdWrap.id = 'product-detail';
    pdWrap.style.display = 'none';
    document.body.appendChild(pdWrap);
    return pdWrap;
  }
  function openDetail(id) {
    var p = byId[id];
    if (!p) return;
    pdSrc = (p.images && p.images.length) ? p.images.slice() : [p.img];
    pdIdx = 0;
    renderDetail(p);
  }
  function renderDetail(p) {
    var el = getPd();
    var imgs = pdSrc;
    var thumbs = imgs.length > 1
      ? '<div class="pd-thumbs">' + imgs.map(function (src, i) {
          return '<button class="pd-thumb' + (i === pdIdx ? ' active' : '') + '" data-i="' + i + '" style="background-image:url(\'' + esc(src) + '\')" aria-label="Image ' + (i + 1) + '"></button>';
        }).join('') + '</div>' : '';
    var nav = imgs.length > 1
      ? '<button class="pd-nav prev" data-d="-1">‹</button><button class="pd-nav next" data-d="1">›</button>' : '';
    var sub = p.subcategory || p.category_name || 'Sculpture';
    var crumbs = p.category_name ? p.category_name + (p.subcategory && p.subcategory !== p.category_name ? ' · ' + p.subcategory : '') : sub;
    var desc = cleanDesc(p);
    var descHtml = desc
      ? '<p class="pd-desc">' + esc(desc) + '</p>'
      : '<p class="pd-desc pd-alt">Customisable size, material and finish — contact us for full details, dimensions and pricing.</p>';
    el.innerHTML = '<div class="pd-overlay"></div><div class="pd-panel">'
      + '<button class="pd-close" aria-label="Close">×</button>'
      + '<div class="pd-media"><div class="pd-main">'
      + '<img id="pd-img" src="' + esc(imgs[pdIdx]) + '" alt="' + esc(p.name) + '">' + nav + '</div>' + thumbs + '</div>'
      + '<div class="pd-info">'
      + '<div class="pd-cat">' + esc(crumbs) + '</div>'
      + (p.model ? '<div class="pd-model">' + esc(p.model) + '</div>' : '')
      + '<h2 class="pd-title">' + esc(p.name) + '</h2>'
      + (p.price ? '<div class="pd-price">' + fmtPrice(p) + '</div>' : '')
      + descHtml
      + '<div class="pd-actions">'
      + '<a class="btn btn-primary" href="' + waLink(p) + '" target="_blank" rel="noopener">Get Price on WhatsApp</a>'
      + '<a class="btn btn-ghost" href="contact.html">Send an Enquiry</a>'
      + '</div></div></div>';
    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    el.querySelector('.pd-close').addEventListener('click', closeDetail);
    el.querySelector('.pd-overlay').addEventListener('click', closeDetail);
    el.querySelectorAll('.pd-thumb').forEach(function (b) {
      b.addEventListener('click', function () { pdIdx = parseInt(b.getAttribute('data-i'), 10); syncPd(); });
    });
    el.querySelectorAll('.pd-nav').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); pdIdx = (pdIdx + parseInt(b.getAttribute('data-d'), 10) + pdSrc.length) % pdSrc.length; syncPd(); });
    });
    document.getElementById('pd-img').addEventListener('click', function () { openSet(pdSrc, pdIdx); });
    var key = function (e) {
      if (lb && lb.style.display === 'flex') return;          // lightbox on top owns the keys
      if (e.key === 'Escape') { closeDetail(); document.removeEventListener('keydown', key); }
      else if (e.key === 'ArrowRight') { pdIdx = (pdIdx + 1) % pdSrc.length; syncPd(); }
      else if (e.key === 'ArrowLeft') { pdIdx = (pdIdx - 1 + pdSrc.length) % pdSrc.length; syncPd(); }
    };
    document.removeEventListener('keydown', key);
    document.addEventListener('keydown', key);
    el._key = key;
  }
  function syncPd() {
    var img = document.getElementById('pd-img');
    if (img) img.src = pdSrc[pdIdx];
    pdWrap.querySelectorAll('.pd-thumb').forEach(function (t, i) { t.classList.toggle('active', i === pdIdx); });
  }
  function closeDetail() {
    if (!pdWrap) return;
    pdWrap.style.display = 'none';
    document.body.style.overflow = '';
    if (pdWrap._key) document.removeEventListener('keydown', pdWrap._key);
  }

  // ---- 8. Inquiry form (Web3Forms) ----
  var ACCESS_KEY = '53c393a4-c7b9-4f3e-8d91-a87fc7799c11';
  var form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-submit'), orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = new FormData(form);
      data.append('access_key', ACCESS_KEY);
      data.append('subject', 'New sculpture inquiry from nbcoart.com');
      data.append('from_name', 'COART Sculpture');
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          var ok = document.getElementById('form-success');
          if (json.success && ok) {
            ok.classList.add('show');
            form.querySelectorAll('input, select, textarea').forEach(function (f) { f.value = ''; });
            setTimeout(function () { ok.classList.remove('show'); }, 8000);
          } else { alert('Something went wrong. Please email us directly: davidchensimo@foxmail.com'); }
        })
        .catch(function () { alert('Network error. Please email us directly: davidchensimo@foxmail.com'); })
        .finally(function () { btn.disabled = false; btn.textContent = orig; });
    });
  }

  // ---- 9. Notify us when a visitor downloads the e-catalogue ----
  // Uses a dedicated access key that delivers to foxmail. The email inherits
  // Web3Forms auto metadata (timestamp, IP, approx location, browser/OS) plus
  // our custom message (triggering page + PDF filename).
  var DOWNLOAD_KEY = '294b7805-88e6-4892-a955-a7f0e00effe3';
  var dlBtn = document.querySelector('a[download]');
  if (dlBtn) {
    dlBtn.addEventListener('click', function () {
      var d = new FormData();
      d.append('access_key', DOWNLOAD_KEY);
      d.append('subject', '📥 2026 e-Catalogue downloaded');
      d.append('from_name', 'COART Website');
      d.append('from_name', 'COART Website');
      d.append('message',
        'A visitor downloaded the 2026 COART sculpture e-catalogue PDF from nbcoart.com.\n\n' +
        'Page: ' + location.href + '\n' +
        'File: ' + (dlBtn.getAttribute('download') || 'Coart-Sculpture-Catalogue-2026.pdf'));
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: d }).catch(function () {});
    });
  }
})();
