(function () {
  'use strict';

  /**
   * Заявки «Связаться с нами» — Web3Forms: https://web3forms.com
   * 1) Зарегистрируйтесь, создайте форму, укажите email получателя заявок.
   * 2) Скопируйте Access Key и вставьте в WEB3FORMS_ACCESS_KEY ниже.
   * 3) В кабинете при желании ограничьте домен сайта (защита от спама с чужих страниц).
   */
  var WEB3FORMS_ACCESS_KEY = '9357caf7-9e27-492c-a734-811d12c9a2a3';

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

  // Geography Markers
  var markers = document.querySelectorAll('.marker');
  var geographyItems = document.querySelectorAll('.geography-item');

  function setActiveCity(cityId) {
    var id = cityId != null ? String(cityId) : null;
    markers.forEach(function (m) {
      m.classList.toggle('active', id && m.getAttribute('data-city') === id);
    });
    geographyItems.forEach(function (item) {
      item.classList.toggle('active', id && item.getAttribute('data-city') === id);
    });
  }

  markers.forEach(function (marker) {
    marker.addEventListener('mouseenter', function () {
      setActiveCity(marker.getAttribute('data-city'));
    });
    marker.addEventListener('mouseleave', function () {
      setActiveCity(null);
    });
  });

  geographyItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      setActiveCity(item.getAttribute('data-city'));
    });
    item.addEventListener('mouseleave', function () {
      setActiveCity(null);
    });
  });

  function clearActiveCity() {
    markers.forEach(function (m) { m.classList.remove('active'); });
    geographyItems.forEach(function (item) { item.classList.remove('active'); });
  }

  document.querySelector('.geography-map') && document.querySelector('.geography-map').addEventListener('mouseleave', clearActiveCity);
  document.querySelector('.geography-list') && document.querySelector('.geography-list').addEventListener('mouseleave', clearActiveCity);

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

  // Contact Form — валидация + отправка через Web3Forms
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var contactStatus = document.getElementById('contactFormStatus');
    var contactSubmitBtn = document.getElementById('contactSubmitBtn');
    var nameInput = document.getElementById('contactName');
    var phoneInput = document.getElementById('contactPhone');
    var emailInput = document.getElementById('contactEmail');
    var messageInput = document.getElementById('contactMessage');
    var nameError = document.getElementById('contactNameError');
    var phoneError = document.getElementById('contactPhoneError');
    var emailError = document.getElementById('contactEmailError');

    function hideStatus() {
      if (!contactStatus) return;
      contactStatus.hidden = true;
      contactStatus.textContent = '';
      contactStatus.classList.remove('form__status_ok', 'form__status_err');
    }

    function showStatus(ok, text) {
      if (!contactStatus) return;
      contactStatus.hidden = false;
      contactStatus.textContent = text;
      contactStatus.classList.toggle('form__status_ok', ok);
      contactStatus.classList.toggle('form__status_err', !ok);
    }

    function clearFieldErrors() {
      [nameInput, phoneInput, emailInput].forEach(function (input) {
        if (!input) return;
        var group = input.closest('.form__group');
        if (group) group.classList.remove('form__group_invalid');
        input.removeAttribute('aria-invalid');
      });
      [nameError, phoneError, emailError].forEach(function (el) {
        if (!el) return;
        el.hidden = true;
        el.textContent = '';
      });
    }

    function setFieldError(input, errorEl, message) {
      if (!input || !errorEl) return;
      var group = input.closest('.form__group');
      if (group) group.classList.add('form__group_invalid');
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    function trimVal(input) {
      return input && input.value ? input.value.trim() : '';
    }

    function isValidEmail(str) {
      if (!str) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    }

    function validateClient() {
      clearFieldErrors();
      var ok = true;
      var name = trimVal(nameInput);
      var phone = trimVal(phoneInput);
      var email = trimVal(emailInput);

      if (!name) {
        setFieldError(nameInput, nameError, 'Укажите имя');
        ok = false;
      }
      if (!phone) {
        setFieldError(phoneInput, phoneError, 'Укажите телефон');
        ok = false;
      }
      if (!isValidEmail(email)) {
        setFieldError(emailInput, emailError, 'Укажите корректный email');
        ok = false;
      }
      return ok;
    }

    [nameInput, phoneInput, emailInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        var group = input.closest('.form__group');
        if (group) group.classList.remove('form__group_invalid');
        input.removeAttribute('aria-invalid');
        var errId = input.id === 'contactName' ? nameError : input.id === 'contactPhone' ? phoneError : emailError;
        if (errId) {
          errId.hidden = true;
          errId.textContent = '';
        }
        hideStatus();
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideStatus();

      if (!validateClient()) {
        var firstInvalid = contactForm.querySelector('.form__group_invalid input, .form__group_invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (!WEB3FORMS_ACCESS_KEY) {
        showStatus(false, 'Заявки не настроены: вставьте Access Key с web3forms.com в js/app.js (см. комментарий в начале файла).');
        return;
      }

      var name = trimVal(nameInput);
      var phone = trimVal(phoneInput);
      var email = trimVal(emailInput);
      var message = messageInput ? trimVal(messageInput) : '';

      var payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'Заявка с сайта ДОНТРЕЙД',
        from_name: name,
        name: name,
        email: email,
        phone: phone,
        message: message || '—'
      };

      if (contactSubmitBtn) {
        contactSubmitBtn.classList.add('btn_pending');
        contactSubmitBtn.disabled = true;
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { data: data };
          });
        })
        .then(function (res) {
          var d = res.data || {};
          if (d.success === true) {
            showStatus(true, 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
            contactForm.reset();
            clearFieldErrors();
            return;
          }
          showStatus(false, d.message || 'Не удалось отправить. Попробуйте позже.');
        })
        .catch(function () {
          showStatus(false, 'Нет связи с интернетом или сервис временно недоступен.');
        })
        .then(function () {
          if (contactSubmitBtn) {
            contactSubmitBtn.classList.remove('btn_pending');
            contactSubmitBtn.disabled = false;
          }
        });
    });
  }

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
            '<div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111111;white-space:nowrap;">ДОНТРЕЙД</div>' +
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
