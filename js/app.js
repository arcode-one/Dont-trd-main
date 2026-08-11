(function () {
  'use strict';

  // Hero Slider
  var slides = document.querySelectorAll('.hero__slide');
  var dotsContainer = document.getElementById('heroDots');
  var currentSlide = 0;
  var autoplayInterval;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('hero__slide_active', i === currentSlide);
    });

    var dots = dotsContainer.querySelectorAll('.hero__dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function createDots() {
    if (!dotsContainer) return;
    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
      (function (j) {
        function goToSlide() {
          showSlide(j);
          resetAutoplay();
        }
        dot.addEventListener('pointerenter', goToSlide);
        dot.addEventListener('focus', goToSlide);
        dot.addEventListener('click', goToSlide);
      })(i);
      dotsContainer.appendChild(dot);
    }
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  if (slides.length) {
    createDots();
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  // Mobile Menu
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });

    mobileNav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
      });
    });
  }

  // Scroll Reveal
  var revealEls = document.querySelectorAll('.reveal');
  var observerOptions = {
    root: null,
    rootMargin: '-100px 0px 0px 0px',
    threshold: 0
  };

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Geography — интерактивные федеральные округа
  (function initFederalDistrictMap() {
    var districtData = {
      central: {
        sourceColor: '#ffff80',
        color: '#3B6888',
        code: 'ЦФО',
        name: 'Центральный федеральный округ',
        location: 'Центральном федеральном округе'
      },
      northwestern: {
        sourceColor: '#62d2c5',
        color: '#4C8097',
        code: 'СЗФО',
        name: 'Северо-Западный федеральный округ',
        location: 'Северо-Западном федеральном округе'
      },
      southern: {
        sourceColor: '#fc8b8b',
        color: '#B95D3B',
        code: 'ЮФО',
        name: 'Южный федеральный округ',
        location: 'Южном федеральном округе'
      },
      'north-caucasian': {
        sourceColor: '#aa6ca6',
        color: '#8C5873',
        code: 'СКФО',
        name: 'Северо-Кавказский федеральный округ',
        location: 'Северо-Кавказском федеральном округе'
      },
      volga: {
        sourceColor: '#37ce04',
        color: '#34756D',
        code: 'ПФО',
        name: 'Приволжский федеральный округ',
        location: 'Приволжском федеральном округе'
      },
      ural: {
        sourceColor: '#c7cb8f',
        color: '#777A5F',
        code: 'УФО',
        name: 'Уральский федеральный округ',
        location: 'Уральском федеральном округе'
      },
      siberian: {
        sourceColor: '#01bee7',
        color: '#337C99',
        code: 'СФО',
        name: 'Сибирский федеральный округ',
        location: 'Сибирском федеральном округе'
      },
      'far-eastern': {
        sourceColor: '#fece2c',
        color: '#BE8437',
        code: 'ДФО',
        name: 'Дальневосточный федеральный округ',
        location: 'Дальневосточном федеральном округе'
      }
    };

    var mapObject = document.getElementById('federalDistrictMap');
    var mapLoading = document.getElementById('districtMapLoading');
    var mapTooltip = document.getElementById('districtMapTooltip');
    var mapTooltipLabel = document.getElementById('districtMapTooltipLabel');
    var districtCode = document.getElementById('districtCode');
    var districtTitle = document.getElementById('districtTitle');
    var districtDescription = document.getElementById('districtDescription');
    var districtButtons = document.querySelectorAll('.geography-district[data-district]');
    var districtNodes = [];
    var pinnedDistrict = null;
    var mapReady = false;

    if (!mapObject || !districtButtons.length) return;

    function updatePanel(districtId) {
      var data = districtId ? districtData[districtId] : null;
      if (!data) {
        if (districtCode) districtCode.textContent = 'Вся Россия';
        if (districtTitle) districtTitle.textContent = 'Федеральные округа';
        if (districtDescription) {
          districtDescription.textContent = 'Выберите территорию на карте. Условия, объём и маршрут поставки рассчитываются индивидуально под задачу бизнеса.';
        }
        return;
      }

      if (districtCode) districtCode.textContent = data.code + ' · География поставок';
      if (districtTitle) districtTitle.textContent = data.name;
      if (districtDescription) {
        districtDescription.textContent = 'Работаем с корпоративными клиентами в ' + data.location + '. Маршрут, сроки и условия поставки рассчитываем индивидуально.';
      }
    }

    function renderDistrict(districtId) {
      var validId = districtId && districtData[districtId] ? districtId : null;

      districtNodes.forEach(function (node) {
        var isActive = validId && node.getAttribute('data-district') === validId;
        node.classList.toggle('district-active', Boolean(isActive));
        node.classList.toggle('district-muted', Boolean(validId && !isActive));
      });

      districtButtons.forEach(function (button) {
        var buttonId = button.getAttribute('data-district');
        button.classList.toggle('active', buttonId === validId);
        button.setAttribute('aria-pressed', buttonId === pinnedDistrict ? 'true' : 'false');
      });

      updatePanel(validId);
    }

    function pinDistrict(districtId) {
      pinnedDistrict = districtId;
      renderDistrict(pinnedDistrict);
    }

    function hideTooltip() {
      if (!mapTooltip) return;
      mapTooltip.hidden = true;
      mapTooltip.setAttribute('aria-hidden', 'true');
    }

    function showTooltip(districtId, event) {
      if (!mapTooltip || !mapTooltipLabel || !districtData[districtId]) return;
      var objectLeft = mapObject.offsetLeft;
      var objectTop = mapObject.offsetTop;
      var x = objectLeft + event.clientX;
      var y = objectTop + event.clientY;
      var minX = objectLeft + 92;
      var maxX = Math.max(minX, objectLeft + mapObject.offsetWidth - 92);

      mapTooltipLabel.textContent = districtData[districtId].name;
      mapTooltip.style.setProperty('--tooltip-x', Math.min(Math.max(x, minX), maxX) + 'px');
      mapTooltip.style.setProperty('--tooltip-y', Math.max(y, 58) + 'px');
      mapTooltip.hidden = false;
      mapTooltip.setAttribute('aria-hidden', 'false');
    }

    function setupSvgMap() {
      if (mapReady) return;

      try {
        var svgDocument = mapObject.contentDocument;
        var svgRoot = svgDocument && svgDocument.documentElement;
        if (!svgRoot) return;

        var svgNamespace = 'http://www.w3.org/2000/svg';
        var interactionStyle = svgDocument.createElementNS(svgNamespace, 'style');
        interactionStyle.textContent =
          '[data-district]{cursor:pointer;stroke:#dce7ee!important;stroke-width:.72!important;stroke-linejoin:round;transition:opacity .22s ease,filter .22s ease,fill .22s ease;}' +
          '[data-district].district-muted{opacity:.23!important;filter:saturate(.48);}' +
          '[data-district].district-active{fill:#f07922!important;stroke:#fff!important;stroke-width:1.35!important;opacity:1!important;filter:drop-shadow(0 3px 3px rgba(0,0,0,.28));}' +
          '@media(prefers-reduced-motion:reduce){[data-district]{transition:none;}}';
        svgRoot.insertBefore(interactionStyle, svgRoot.firstChild);
        svgRoot.style.width = '100%';
        svgRoot.style.height = '100%';
        svgRoot.style.background = 'transparent';
        svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        Object.keys(districtData).forEach(function (districtId) {
          var data = districtData[districtId];
          var sourceColor = data.sourceColor.toLowerCase();

          svgDocument.querySelectorAll('[style]').forEach(function (node) {
            var styleValue = (node.getAttribute('style') || '').toLowerCase();
            if (styleValue.indexOf('fill:' + sourceColor) === -1) return;
            node.setAttribute('data-district', districtId);
            node.style.fill = data.color;
            districtNodes.push(node);
          });
        });

        if (!districtNodes.length) throw new Error('District shapes were not found');

        svgRoot.addEventListener('pointermove', function (event) {
          var target = event.target.closest && event.target.closest('[data-district]');
          if (!target) {
            renderDistrict(pinnedDistrict);
            hideTooltip();
            return;
          }

          var districtId = target.getAttribute('data-district');
          renderDistrict(districtId);
          showTooltip(districtId, event);
        });

        svgRoot.addEventListener('pointerleave', function () {
          renderDistrict(pinnedDistrict);
          hideTooltip();
        });

        svgRoot.addEventListener('click', function (event) {
          var target = event.target.closest && event.target.closest('[data-district]');
          if (!target) return;
          pinDistrict(target.getAttribute('data-district'));
          hideTooltip();
        });

        mapReady = true;
        if (mapLoading) mapLoading.hidden = true;
      } catch (error) {
        if (mapLoading) mapLoading.textContent = 'Выберите округ в панели справа';
      }
    }

    districtButtons.forEach(function (button) {
      var districtId = button.getAttribute('data-district');

      button.addEventListener('mouseenter', function () {
        renderDistrict(districtId);
      });
      button.addEventListener('mouseleave', function () {
        renderDistrict(pinnedDistrict);
      });
      button.addEventListener('focus', function () {
        renderDistrict(districtId);
      });
      button.addEventListener('blur', function () {
        renderDistrict(pinnedDistrict);
      });
      button.addEventListener('click', function () {
        pinDistrict(districtId);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !pinnedDistrict) return;
      pinnedDistrict = null;
      renderDistrict(null);
      hideTooltip();
    });

    mapObject.addEventListener('load', setupSvgMap);
    if (mapObject.contentDocument && mapObject.contentDocument.documentElement) {
      setupSvgMap();
    }
  })();

  // Current Year
  var yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Smooth Scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Yandex Map — контейнер .contacts-map__overlay (#contactsYandexMap)
  (function initContactsYandexMap() {
    var YANDEX_MAPS_API_KEY = 'YOUR_YANDEX_MAPS_API_KEY';
    var SCRIPT_ID = 'ymaps-2-1-script';
    var COORDS = [47.2272756, 39.7613446];
    var LABEL_W = 224;
    var ICON_OFFSET = [-LABEL_W / 2, -88];
    var container = document.getElementById('contactsYandexMap');
    if (!container) return;

    function contactsMapLabelHtml() {
      return (
        '<div style="display:flex;flex-direction:column;align-items:center;width:' + LABEL_W + 'px;pointer-events:none;">' +
          '<div style="background:#ffffff;border:1px solid #d0d0d0;border-radius:7px;box-shadow:0 3px 16px rgba(0,0,0,0.22);padding:10px 14px;width:100%;box-sizing:border-box;">' +
            '<div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111111;white-space:nowrap;">ДОН ТРЕЙД</div>' +
            '<div style="font-family:Arial,sans-serif;font-size:11px;color:#555555;margin-top:3px;line-height:1.5;">ул. Мясникова, зд. 31</div>' +
          '</div>' +
          '<div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:10px solid #ffffff;margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.13));"></div>' +
          '<div style="width:16px;height:16px;background:#E86F1F;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);margin-top:2px;flex-shrink:0;"></div>' +
        '</div>'
      );
    }

    function initMap() {
      if (!container || container.getAttribute('data-map-initialized') === '1') return;
      if (!window.ymaps) return;
      window.ymaps.ready(function () {
        if (!container || container.getAttribute('data-map-initialized') === '1') return;
        container.setAttribute('data-map-initialized', '1');

        var map = new window.ymaps.Map(container, {
          center: COORDS,
          zoom: 16,
          controls: ['zoomControl', 'fullscreenControl']
        });

        var LabelLayout = window.ymaps.templateLayoutFactory.createClass(contactsMapLabelHtml());
        var placemark = new window.ymaps.Placemark(
          COORDS,
          {},
          {
            iconLayout: LabelLayout,
            iconOffset: ICON_OFFSET,
            iconShape: {
              type: 'Rectangle',
              coordinates: [
                [-LABEL_W / 2, -88],
                [LABEL_W / 2, 8]
              ]
            }
          }
        );
        map.geoObjects.add(placemark);
      });
    }

    function ensureScript() {
      var existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        if (window.ymaps) initMap();
        else existing.addEventListener('load', initMap);
        return;
      }
      var script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=' + encodeURIComponent(YANDEX_MAPS_API_KEY) + '&load=package.full';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    var mapObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          mapObserver.disconnect();
          ensureScript();
        });
      },
      { rootMargin: '100px 0px', threshold: 0.05 }
    );
    mapObserver.observe(container);
  })();

  // Consent: cookies & privacy modals
  var STORAGE_COOKIES = 'dontrade_cookies_consent';
  var STORAGE_PRIVACY = 'dontrade_privacy_consent';

  var cookieBanner = document.getElementById('cookieBanner');
  var privacyModal = document.getElementById('privacyModal');
  var cookiesModal = document.getElementById('cookiesModal');
  var modals = { privacy: privacyModal, cookies: cookiesModal };
  var activeModal = null;

  function setConsent(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) { /* ignore */ }
  }

  function getConsent(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function showCookieBanner() {
    if (!cookieBanner || getConsent(STORAGE_COOKIES)) return;
    cookieBanner.classList.add('cookie-banner_visible');
    cookieBanner.setAttribute('aria-hidden', 'false');
  }

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.remove('cookie-banner_visible');
    cookieBanner.setAttribute('aria-hidden', 'true');
  }

  function openModal(name) {
    var modal = modals[name];
    if (!modal) return;
    if (activeModal && activeModal !== modal) {
      closeModal(activeModal);
    }
    activeModal = modal;
    modal.classList.add('modal-overlay_open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-overlay_open');
    modal.setAttribute('aria-hidden', 'true');
    if (activeModal === modal) activeModal = null;
  }

  function acceptCookies() {
    setConsent(STORAGE_COOKIES, 'accepted');
    hideCookieBanner();
    closeModal(cookiesModal);
  }

  function declineCookies() {
    setConsent(STORAGE_COOKIES, 'declined');
    hideCookieBanner();
    closeModal(cookiesModal);
  }

  function acceptPrivacy() {
    setConsent(STORAGE_PRIVACY, 'accepted');
    closeModal(privacyModal);
  }

  function declinePrivacy() {
    setConsent(STORAGE_PRIVACY, 'declined');
    closeModal(privacyModal);
  }

  function bindModalTrigger(trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-open-modal'));
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(trigger.getAttribute('data-open-modal'));
      }
    });
  }

  document.querySelectorAll('[data-open-modal]').forEach(bindModalTrigger);

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  [privacyModal, cookiesModal].forEach(function (modal) {
    if (!modal) return;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeModal) closeModal(activeModal);
  });

  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');
  if (cookieAccept) cookieAccept.addEventListener('click', acceptCookies);
  if (cookieDecline) cookieDecline.addEventListener('click', declineCookies);

  var cookiesAccept = document.getElementById('cookiesAccept');
  var cookiesDecline = document.getElementById('cookiesDecline');
  if (cookiesAccept) cookiesAccept.addEventListener('click', acceptCookies);
  if (cookiesDecline) cookiesDecline.addEventListener('click', declineCookies);

  var privacyAccept = document.getElementById('privacyAccept');
  var privacyDecline = document.getElementById('privacyDecline');
  if (privacyAccept) privacyAccept.addEventListener('click', acceptPrivacy);
  if (privacyDecline) privacyDecline.addEventListener('click', declinePrivacy);

  showCookieBanner();
})();
