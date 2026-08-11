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
        activeColor: '#176B9A',
        code: 'ЦФО',
        name: 'Центральный федеральный округ',
        location: 'Центральном федеральном округе'
      },
      northwestern: {
        sourceColor: '#62d2c5',
        color: '#4C8097',
        activeColor: '#1685A6',
        code: 'СЗФО',
        name: 'Северо-Западный федеральный округ',
        location: 'Северо-Западном федеральном округе'
      },
      southern: {
        sourceColor: '#fc8b8b',
        color: '#B95D3B',
        activeColor: '#D95F2A',
        code: 'ЮФО',
        name: 'Южный федеральный округ',
        location: 'Южном федеральном округе'
      },
      'north-caucasian': {
        sourceColor: '#aa6ca6',
        color: '#8C5873',
        activeColor: '#A83F74',
        code: 'СКФО',
        name: 'Северо-Кавказский федеральный округ',
        location: 'Северо-Кавказском федеральном округе'
      },
      volga: {
        sourceColor: '#37ce04',
        color: '#34756D',
        activeColor: '#128774',
        code: 'ПФО',
        name: 'Приволжский федеральный округ',
        location: 'Приволжском федеральном округе'
      },
      ural: {
        sourceColor: '#c7cb8f',
        color: '#777A5F',
        activeColor: '#8A8B43',
        code: 'УФО',
        name: 'Уральский федеральный округ',
        location: 'Уральском федеральном округе'
      },
      siberian: {
        sourceColor: '#01bee7',
        color: '#337C99',
        activeColor: '#078DB7',
        code: 'СФО',
        name: 'Сибирский федеральный округ',
        location: 'Сибирском федеральном округе'
      },
      'far-eastern': {
        sourceColor: '#fece2c',
        color: '#BE8437',
        activeColor: '#E69422',
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
    var districtNodes = {};
    var pinnedDistrict = null;
    var renderedDistrict = null;
    var mapReady = false;
    var mapColorFrame = null;
    var tooltipFrame = null;
    var pendingTooltip = null;
    var districtHoverResetTimer = null;

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

    function colorToRgb(value) {
      var hexMatch = value && value.match(/^#([0-9a-f]{6})$/i);
      if (hexMatch) {
        return {
          r: parseInt(hexMatch[1].slice(0, 2), 16),
          g: parseInt(hexMatch[1].slice(2, 4), 16),
          b: parseInt(hexMatch[1].slice(4, 6), 16)
        };
      }

      var rgbMatch = value && value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
      if (!rgbMatch) return null;
      return {
        r: Number(rgbMatch[1]),
        g: Number(rgbMatch[2]),
        b: Number(rgbMatch[3])
      };
    }

    function animateDistrictColors(activeId) {
      if (mapColorFrame) {
        cancelAnimationFrame(mapColorFrame);
        mapColorFrame = null;
      }

      var changes = [];
      Object.keys(districtData).forEach(function (districtId) {
        var data = districtData[districtId];
        var target = colorToRgb(districtId === activeId ? data.activeColor : data.color);
        var nodes = districtNodes[districtId] || [];

        nodes.forEach(function (node) {
          var nodeWindow = node.ownerDocument && node.ownerDocument.defaultView;
          var currentValue = nodeWindow ? nodeWindow.getComputedStyle(node).fill : data.color;
          var current = colorToRgb(currentValue) || colorToRgb(data.color);
          if (!current || !target) return;
          if (Math.abs(current.r - target.r) < 1 && Math.abs(current.g - target.g) < 1 && Math.abs(current.b - target.b) < 1) return;
          changes.push({ node: node, from: current, to: target });
        });
      });

      if (!changes.length) return;

      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        changes.forEach(function (change) {
          change.node.style.setProperty('fill', 'rgb(' + change.to.r + ',' + change.to.g + ',' + change.to.b + ')', 'important');
        });
        return;
      }

      var startedAt = null;
      var duration = 240;
      function drawFrame(timestamp) {
        if (startedAt === null) startedAt = timestamp;
        var progress = Math.min((timestamp - startedAt) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);

        changes.forEach(function (change) {
          var red = Math.round(change.from.r + (change.to.r - change.from.r) * eased);
          var green = Math.round(change.from.g + (change.to.g - change.from.g) * eased);
          var blue = Math.round(change.from.b + (change.to.b - change.from.b) * eased);
          change.node.style.setProperty('fill', 'rgb(' + red + ',' + green + ',' + blue + ')', 'important');
        });

        if (progress < 1) {
          mapColorFrame = requestAnimationFrame(drawFrame);
        } else {
          mapColorFrame = null;
        }
      }

      mapColorFrame = requestAnimationFrame(drawFrame);
    }

    function renderDistrict(districtId, force) {
      var validId = districtId && districtData[districtId] ? districtId : null;
      if (!force && validId === renderedDistrict) return;

      if (renderedDistrict && districtNodes[renderedDistrict]) {
        districtNodes[renderedDistrict].forEach(function (node) {
          node.classList.remove('district-active');
        });
      }
      if (validId && districtNodes[validId]) {
        districtNodes[validId].forEach(function (node) {
          node.classList.add('district-active');
        });
      }
      renderedDistrict = validId;
      animateDistrictColors(validId);

      districtButtons.forEach(function (button) {
        var buttonId = button.getAttribute('data-district');
        button.classList.toggle('active', buttonId === validId);
        button.setAttribute('aria-pressed', buttonId === pinnedDistrict ? 'true' : 'false');
      });

      updatePanel(validId);
    }

    function pinDistrict(districtId) {
      pinnedDistrict = districtId;
      if (districtHoverResetTimer) {
        clearTimeout(districtHoverResetTimer);
        districtHoverResetTimer = null;
      }

      if (renderedDistrict === pinnedDistrict) {
        districtButtons.forEach(function (button) {
          button.setAttribute('aria-pressed', button.getAttribute('data-district') === pinnedDistrict ? 'true' : 'false');
        });
        return;
      }

      renderDistrict(pinnedDistrict);
    }

    function cancelDistrictReset() {
      if (!districtHoverResetTimer) return;
      clearTimeout(districtHoverResetTimer);
      districtHoverResetTimer = null;
    }

    function scheduleDistrictReset() {
      cancelDistrictReset();
      districtHoverResetTimer = setTimeout(function () {
        districtHoverResetTimer = null;
        renderDistrict(pinnedDistrict);
        hideTooltip();
      }, 70);
    }

    function hideTooltip() {
      if (!mapTooltip) return;
      pendingTooltip = null;
      if (tooltipFrame) {
        cancelAnimationFrame(tooltipFrame);
        tooltipFrame = null;
      }
      if (mapTooltip.hidden) return;
      mapTooltip.hidden = true;
      mapTooltip.setAttribute('aria-hidden', 'true');
    }

    function queueTooltip(districtId, clientX, clientY, anchoredToDistrict) {
      if (!mapTooltip || !mapTooltipLabel || !districtData[districtId]) return;
      pendingTooltip = {
        districtId: districtId,
        clientX: clientX,
        clientY: clientY,
        anchoredToDistrict: Boolean(anchoredToDistrict)
      };
      if (tooltipFrame) return;

      tooltipFrame = requestAnimationFrame(function () {
        var tooltip = pendingTooltip;
        tooltipFrame = null;
        if (!tooltip) return;

        var objectLeft = mapObject.offsetLeft;
        var objectTop = mapObject.offsetTop;
        var x = objectLeft + tooltip.clientX;
        var y = objectTop + tooltip.clientY;
        var minX = objectLeft + 92;
        var maxX = Math.max(minX, objectLeft + mapObject.offsetWidth - 92);

        mapTooltipLabel.textContent = districtData[tooltip.districtId].name;
        mapTooltip.classList.toggle('geography-map__tooltip_list', tooltip.anchoredToDistrict);
        mapTooltip.style.setProperty('--tooltip-color', districtData[tooltip.districtId].activeColor);
        mapTooltip.style.setProperty('--tooltip-x', Math.min(Math.max(x, minX), maxX) + 'px');
        mapTooltip.style.setProperty('--tooltip-y', Math.max(y, 58) + 'px');
        mapTooltip.hidden = false;
        mapTooltip.setAttribute('aria-hidden', 'false');
      });
    }

    function showTooltip(districtId, event) {
      queueTooltip(districtId, event.clientX, event.clientY, false);
    }

    function showDistrictTooltip(districtId) {
      var nodes = districtNodes[districtId] || [];
      var bounds = null;

      nodes.forEach(function (node) {
        if (!node.getBoundingClientRect) return;
        var rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        if (!bounds) {
          bounds = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
          return;
        }
        bounds.left = Math.min(bounds.left, rect.left);
        bounds.top = Math.min(bounds.top, rect.top);
        bounds.right = Math.max(bounds.right, rect.right);
        bounds.bottom = Math.max(bounds.bottom, rect.bottom);
      });

      if (!bounds) return;
      queueTooltip(
        districtId,
        bounds.left + (bounds.right - bounds.left) / 2,
        bounds.top + (bounds.bottom - bounds.top) * 0.52,
        true
      );
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
          '[data-district]{cursor:pointer;stroke:#dce7ee!important;stroke-width:.72!important;stroke-linejoin:round;}' +
          '[data-district].district-active{stroke:#fff!important;}';
        svgRoot.insertBefore(interactionStyle, svgRoot.firstChild);
        svgRoot.style.width = '100%';
        svgRoot.style.height = '100%';
        svgRoot.style.background = 'transparent';
        svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        var foundDistrictNodes = 0;
        Object.keys(districtData).forEach(function (districtId) {
          var data = districtData[districtId];
          var sourceColor = data.sourceColor.toLowerCase();
          districtNodes[districtId] = [];

          svgDocument.querySelectorAll('[style]').forEach(function (node) {
            var styleValue = (node.getAttribute('style') || '').toLowerCase();
            if (styleValue.indexOf('fill:' + sourceColor) === -1) return;
            node.setAttribute('data-district', districtId);
            node.style.setProperty('fill', data.color, 'important');
            districtNodes[districtId].push(node);
            foundDistrictNodes += 1;
          });
        });

        if (!foundDistrictNodes) throw new Error('District shapes were not found');
        renderDistrict(renderedDistrict, true);

        svgRoot.addEventListener('pointerover', function (event) {
          var target = event.target.closest && event.target.closest('[data-district]');
          if (!target) return;
          renderDistrict(target.getAttribute('data-district'));
        });

        svgRoot.addEventListener('pointermove', function (event) {
          var target = event.target.closest && event.target.closest('[data-district]');
          if (!target) {
            renderDistrict(pinnedDistrict);
            hideTooltip();
            return;
          }

          var districtId = target.getAttribute('data-district');
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
        cancelDistrictReset();
        renderDistrict(districtId);
        showDistrictTooltip(districtId);
      });
      button.addEventListener('mouseleave', function () {
        scheduleDistrictReset();
      });
      button.addEventListener('focus', function () {
        cancelDistrictReset();
        renderDistrict(districtId);
        showDistrictTooltip(districtId);
      });
      button.addEventListener('blur', function () {
        scheduleDistrictReset();
      });
      button.addEventListener('click', function () {
        pinDistrict(districtId);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !pinnedDistrict) return;
      pinnedDistrict = null;
      renderDistrict(null, true);
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

})();
