/* =========================================================
   Carlos Cruz — Portafolio
   Interacciones: navegación, reveal, timeline, typing,
   contadores, copiar correo y detalles de UI.
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Helpers ---------- */
  function $(selector, context) {
    return (context || doc).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || doc).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /* ---------- Años de experiencia (calculados) ---------- */
  var CAREER_START_YEAR = 2018;
  var CAREER_START_MONTH = 6; // Julio (0 = enero)

  function yearsOfExperience() {
    var now = new Date();
    var years = now.getFullYear() - CAREER_START_YEAR;
    if (now.getMonth() < CAREER_START_MONTH) {
      years -= 1;
    }
    return Math.max(1, years);
  }

  var experienceYears = yearsOfExperience();

  function paintYears() {
    $$('[data-years]').forEach(function (el) {
      el.textContent = experienceYears + '+';
    });

    var stat = $('[data-years-count]');
    if (stat) {
      stat.dataset.count = String(experienceYears);
      stat.dataset.suffix = '+';
      stat.textContent = experienceYears + '+';
    }
  }

  /* ---------- Año del footer ---------- */
  function paintYear() {
    var year = $('#year');
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  /* ---------- Barra de progreso y header ---------- */
  function initScrollUI() {
    var header = $('#siteHeader');
    var bar = $('#scrollBar');
    var toTop = $('#toTop');
    var sections = $$('main section[id]').filter(function (section) {
      return $('.nav-link[href="#' + section.id + '"]');
    });
    var navLinks = $$('.nav-link');
    var activeId = null;

    function setActiveLink(id) {
      if (!id || id === activeId) {
        return;
      }
      activeId = id;
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function updateActiveLink() {
      if (!sections.length) {
        return;
      }
      var headerHeight = header ? header.offsetHeight : 0;
      var probe = window.scrollY + headerHeight + 130;
      var current = sections[0].id;

      sections.forEach(function (section) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= probe) {
          current = section.id;
        }
      });

      var atBottom =
        window.innerHeight + window.scrollY >= doc.body.offsetHeight - 4;
      if (atBottom) {
        current = sections[sections.length - 1].id;
      }

      setActiveLink(current);
    }

    function updateScrollUI() {
      var y = window.scrollY;
      var max = doc.documentElement.scrollHeight - window.innerHeight;

      if (header) {
        header.classList.toggle('is-scrolled', y > 8);
      }
      if (bar) {
        bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      }
      if (toTop) {
        toTop.classList.toggle('is-visible', y > 520);
      }

      updateActiveLink();
    }

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: reducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    }

    return updateScrollUI;
  }

  /* ---------- Timeline (línea que se dibuja al hacer scroll) ---------- */
  function initTimeline() {
    var timeline = $('.timeline');
    var progress = $('#timelineProgress');
    var items = $$('.timeline-item');

    if (!timeline || !progress) {
      return function () {};
    }

    return function updateTimeline() {
      var rect = timeline.getBoundingClientRect();
      var trigger = window.innerHeight * 0.6;
      var ratio = rect.height > 0 ? (trigger - rect.top) / rect.height : 0;
      progress.style.transform = 'scaleY(' + clamp(ratio, 0, 1) + ')';

      items.forEach(function (item) {
        var itemTop = item.getBoundingClientRect().top;
        item.classList.toggle('is-active', itemTop + 30 <= trigger);
      });
    };
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var elements = $$('.reveal');

    // Retraso escalonado en grupos con data-stagger
    $$('[data-stagger]').forEach(function (group) {
      var children = Array.prototype.slice.call(group.children).filter(function (child) {
        return child.classList.contains('reveal');
      });
      children.forEach(function (child, index) {
        child.style.setProperty('--reveal-delay', Math.min(index * 90, 540) + 'ms');
      });
    });

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      elements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    var counters = $$('.stat-num[data-count]');
    if (!counters.length) {
      return;
    }

    function animate(el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var suffix = el.dataset.suffix || '';

      if (reducedMotion.matches) {
        el.textContent = target + suffix;
        return;
      }

      var duration = 1500;
      var start = performance.now();

      function frame(now) {
        var progress = clamp((now - start) / duration, 0, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      counter.textContent = '0' + (counter.dataset.suffix || '');
      observer.observe(counter);
    });
  }

  /* ---------- Efecto de máquina de escribir ---------- */
  function initTyping() {
    var el = $('#typedRole');
    if (!el) {
      return;
    }

    var roles = [
      'Desarrollador .NET Full Stack',
      'APIs REST · Microservicios',
      'Angular · SQL Server · Kafka',
      'Cloud Native con Kubernetes'
    ];

    if (reducedMotion.matches) {
      el.textContent = roles[0];
      return;
    }

    var roleIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typeSpeed = 62;
    var deleteSpeed = 30;
    var holdTime = 2100;

    function tick() {
      if (reducedMotion.matches) {
        el.textContent = roles[0];
        return;
      }

      var current = roles[roleIndex];

      if (!deleting) {
        charIndex += 1;
        el.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          deleting = true;
          window.setTimeout(tick, holdTime);
          return;
        }
        window.setTimeout(tick, typeSpeed);
        return;
      }

      charIndex -= 1;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(tick, 380);
        return;
      }
      window.setTimeout(tick, deleteSpeed);
    }

    window.setTimeout(tick, 900);
  }

  /* ---------- Menú móvil ---------- */
  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#siteNav');
    if (!toggle || !nav) {
      return;
    }

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      nav.classList.toggle('is-open', open);
      doc.body.classList.toggle('nav-open', open);
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    doc.addEventListener('click', function (event) {
      if (!isOpen()) {
        return;
      }
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    window.addEventListener(
      'resize',
      function () {
        if (window.innerWidth > 991) {
          setOpen(false);
        }
      },
      { passive: true }
    );
  }

  /* ---------- Copiar correo + toast ---------- */
  function initCopy() {
    var toast = $('#toast');
    var toastTimer = null;

    function showToast(message) {
      if (!toast) {
        return;
      }
      toast.textContent = message;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 2800);
    }

    function legacyCopy(text) {
      var area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-100px';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();

      var copied = false;
      try {
        copied = doc.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      doc.body.removeChild(area);
      return copied;
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(
          function () {
            return true;
          },
          function () {
            return legacyCopy(text);
          }
        );
      }
      return Promise.resolve(legacyCopy(text));
    }

    $$('[data-copy]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.dataset.copy;
        if (!value) {
          return;
        }

        copyText(value).then(function (ok) {
          if (!ok) {
            showToast('No se pudo copiar. Correo: ' + value);
            return;
          }

          showToast('Correo copiado al portapapeles ✓');

          var icon = button.querySelector('i');
          if (icon) {
            var original = icon.className;
            icon.className = 'fa-solid fa-check';
            window.setTimeout(function () {
              icon.className = original;
            }, 1800);
          }
        });
      });
    });

    return showToast;
  }

  /* ---------- Resplandor que sigue al cursor ---------- */
  function initCursorGlow() {
    var glow = $('.cursor-glow');
    if (!glow) {
      return;
    }

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    var frame = null;
    var x = 0;
    var y = 0;
    var shown = false;

    window.addEventListener(
      'pointermove',
      function (event) {
        x = event.clientX;
        y = event.clientY;

        if (!shown) {
          shown = true;
          glow.style.setProperty('--mx', x + 'px');
          glow.style.setProperty('--my', y + 'px');
          glow.classList.add('is-active');
        }

        if (frame) {
          return;
        }
        frame = requestAnimationFrame(function () {
          glow.style.setProperty('--mx', x + 'px');
          glow.style.setProperty('--my', y + 'px');
          frame = null;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Arranque ---------- */
  function boot() {
    paintYears();
    paintYear();
    initNav();
    initReveal();
    initCounters();
    initTyping();
    initCopy();
    initCursorGlow();

    var updateScrollUI = initScrollUI();
    var updateTimeline = initTimeline();

    var ticking = false;

    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(function () {
        updateScrollUI();
        updateTimeline();
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', function () {
      updateScrollUI();
      updateTimeline();
    });

    // Estado inicial
    updateScrollUI();
    updateTimeline();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
