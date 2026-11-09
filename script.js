// Alvéa Odontologia — efeitos de rolagem, menu em ilha e agendamento
(function () {
  'use strict';

  /* ---------- Efeitos de rolagem ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); });
  }, { threshold: 0.12, rootMargin: '-6% 0px -8% 0px' });
  document.querySelectorAll('.rv, .rvl, .rvq').forEach(function (el) { io.observe(el); });

  var hero = document.getElementById('topo');
  var bar = document.querySelector('.navbar');
  var raf = null;

  function tick() {
    raf = null;
    var vh = window.innerHeight || 800;

    // Menu vira ilha ao descer
    if (hero && bar) bar.classList.toggle('isl', hero.getBoundingClientRect().top < -40);

    // Títulos fixos só quando as colunas estão lado a lado
    document.querySelectorAll('.stick').forEach(function (el) {
      var sib = el.nextElementSibling;
      el.classList.toggle('flat', !!sib && sib.offsetTop > el.offsetTop + 20);
    });

    // Parallax das fotos
    document.querySelectorAll('.px').forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      el.style.transform = 'translateY(' + (p * -9).toFixed(2) + '%) scale(1.14)';
    });

    // Imagem da clínica cresce e arredonda
    document.querySelectorAll('.scl').forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, 1 - (r.top - vh * 0.15) / (vh * 0.85)));
      el.style.transform = 'scale(' + (0.82 + p * 0.18).toFixed(3) + ')';
      el.style.borderRadius = '4px ' + Math.round(40 + p * 460) + 'px 4px 4px';
    });
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();

  /* ---------- Agendamento ---------- */
  // Dados de exemplo: no sistema real, tratamentos e horários vêm do painel.
  var SERVICES = ['Avaliação e prevenção', 'Estética e clareamento', 'Ortodontia', 'Implantes', 'Endodontia', 'Odontopediatria'];
  var HOURS = ['08:00', '09:00', '10:30', '13:30', '15:00', '16:30'];
  var WDS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MONS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var days = [];
  var d = new Date(); d.setHours(12, 0, 0, 0);
  while (days.length < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    days.push({ wd: WDS[d.getDay()], num: d.getDate(), mon: MONS[d.getMonth()], label: d.getDate() + ' de ' + MONS[d.getMonth()], sat: d.getDay() === 6 });
  }

  var state = { svc: null, day: null, time: null };
  var $ = function (id) { return document.getElementById(id); };
  var form = $('bk-form'), done = $('bk-done');
  var nameEl = $('bk-name'), phoneEl = $('bk-phone'), confirmBtn = $('bk-confirm');

  function chip(label, selected, onClick, extraClass) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (extraClass ? ' ' + extraClass : '') + (selected ? ' sel' : '');
    b.setAttribute('aria-pressed', selected ? 'true' : 'false');
    if (typeof label === 'string') b.textContent = label; else b.appendChild(label);
    b.addEventListener('click', onClick);
    return b;
  }

  function dayLabel(day) {
    var f = document.createDocumentFragment();
    [['wd', 'display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.75', ''],
     ['num', 'display:block;font-size:30px;line-height:1.1', 'serif'],
     ['mon', 'display:block;font-size:12px;opacity:.75', '']].forEach(function (p) {
      var s = document.createElement('span');
      s.style.cssText = p[1]; if (p[2]) s.className = p[2];
      s.textContent = day[p[0]];
      f.appendChild(s);
    });
    return f;
  }

  function isBusy(dayIdx, i) { return ((dayIdx * 3 + i * 5) % 7 === 0) || (days[dayIdx].sat && i > 2); }

  function ready() {
    return state.svc !== null && state.day !== null && state.time &&
      nameEl.value.trim().length > 1 && phoneEl.value.replace(/\D/g, '').length >= 10;
  }

  function render() {
    var svcs = $('bk-svcs'); svcs.innerHTML = '';
    SERVICES.forEach(function (s, i) {
      svcs.appendChild(chip(s, state.svc === i, function () { state.svc = i; render(); }));
    });

    var ds = $('bk-days'); ds.innerHTML = '';
    days.forEach(function (day, i) {
      ds.appendChild(chip(dayLabel(day), state.day === i, function () { state.day = i; state.time = null; render(); }, 'day'));
    });

    var ts = $('bk-times'); ts.innerHTML = '';
    $('bk-noday').hidden = state.day !== null;
    if (state.day !== null) {
      HOURS.forEach(function (h, i) {
        var busy = isBusy(state.day, i);
        var b = chip(h, state.time === h, function () { if (!busy) { state.time = h; render(); } });
        b.disabled = busy;
        b.setAttribute('aria-label', busy ? h + ' indisponível' : h);
        ts.appendChild(b);
      });
    }

    var sum = {
      svc: state.svc === null ? '—' : SERVICES[state.svc],
      day: state.day === null ? '—' : days[state.day].label,
      time: state.time || '—'
    };
    document.querySelectorAll('[data-sum]').forEach(function (el) { el.textContent = sum[el.dataset.sum]; });
    confirmBtn.disabled = !ready();
    return sum;
  }

  nameEl.addEventListener('input', function () { confirmBtn.disabled = !ready(); });
  phoneEl.addEventListener('input', function () { confirmBtn.disabled = !ready(); });

  // Clicar numa especialidade da lista já a seleciona no agendamento
  document.querySelectorAll('[data-svc]').forEach(function (a) {
    a.addEventListener('click', function () { state.svc = Number(a.dataset.svc); render(); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!ready()) return;
    var sum = render();
    // TODO: enviar o pedido para o backend (Supabase) quando o sistema estiver ligado.
    $('bk-first').textContent = nameEl.value.trim().split(' ')[0];
    $('bk-msg').textContent = 'Recebemos sua solicitação de ' + sum.svc + ' para ' + sum.day + ', às ' + sum.time + '. Em breve confirmaremos pelo WhatsApp.';
    form.hidden = true; done.hidden = false;
  });

  $('bk-reset').addEventListener('click', function () {
    state = { svc: null, day: null, time: null };
    nameEl.value = ''; phoneEl.value = '';
    form.hidden = false; done.hidden = true;
    render();
  });

  render();
})();
