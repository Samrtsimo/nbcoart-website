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

  function productCard(p) {
    return '<article class="product-card">'
      + '<div class="product-thumb"><button class="view" style="border:0;padding:0;background:none;width:100%;height:100%" data-img="' + esc(p.img) + '" data-name="' + esc(p.name) + '">'
      + '<img loading="lazy" src="' + esc(p.img) + '" alt="' + esc(p.name) + '"></button>'
      + (p.model ? '<span class="product-tag">' + esc(p.model) + '</span>' : '')
      + '</div>'
      + '<div class="product-body">'
      + '<h3>' + esc(p.name) + '</h3>'
      + '<div class="product-model">' + esc(p.model || (p.category_name || 'Sculpture')) + '</div>'
      + '<div class="product-foot">'
      + '<div class="price">' + fmtPrice(p) + '</div>'
      + '<div class="card-actions">'
      + '<button class="gbtn view" data-img="' + esc(p.img) + '" data-name="' + esc(p.name) + '">View</button>'
      + '<a class="gbtn inquiry-btn" href="' + waLink(p) + '" target="_blank" rel="noopener">Get Price</a>'
      + '</div></div></div></article>';
  }

  function renderInto(sel, list) {
    var host = document.querySelector(sel);
    if (!host) return;
    host.innerHTML = list.map(productCard).join('');
    host.querySelectorAll('.view').forEach(function (b) {
      b.addEventListener('click', function () {
        openLightbox(b.getAttribute('data-img'), b.getAttribute('data-name') || '');
      });
    });
  }

  // ---- 1. Category overview cards (products.html) ----
  var catGrid = document.getElementById('category-cards');
  if (catGrid && D.categories.length) {
    catGrid.innerHTML = D.categories.filter(function (c) { return c.count > 0; }).map(function (c) {
      return '<a class="cat-card" href="' + esc(c.page) + '">'
        + '<img loading="lazy" src="' + esc(c.img) + '" alt="' + esc(c.name) + '">'
        + '<span class="cc-arrow">→</span>'
        + '<div class="cc-overlay"><h3>' + esc(c.name) + '</h3>'
        + '<span class="cc-count">' + c.count + ' designs</span></div></a>';
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

  // ---- 3. Per-category product grid ----
  var grid = document.getElementById('product-grid');
  if (grid) {
    var cat = grid.getAttribute('data-category');
    var list = D.products.filter(function (p) { return p.category === cat; });
    renderInto('#product-grid', list);
    var cnt = document.querySelector('[data-count="' + cat + '"]');
    if (cnt) cnt.textContent = list.length + ' designs';
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

  // ---- 6. About carousel (optional single image via data/products) ----
  var aboutImg = document.getElementById('about-photo');
  var aboutPool = [];
  D.products.forEach(function (p) { if (p.model === 'CAS-AS35' || p.model === '3577548') aboutPool.push(p.img); });
  if (aboutImg && aboutPool.length) {
    aboutImg.setAttribute('src', aboutPool[0]);
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
})();
