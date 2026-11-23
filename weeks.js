/* 멘토링 주차 설정 + 주차 이동 바 + 잠금
   - 각 주차 HTML의 </body> 바로 앞에 <script src="weeks.js"></script> 한 줄
   - index.html도 이 파일의 설정(MENTORING)을 같이 씀 */
(function () {
  // ===== 설정: 여기만 고치면 됨 =====
  var CONFIG = {
    prefix: 'CL7_2_Week',
    // 주차별 공개 날짜 (그날 0시부터 열림) - 매주 목요일 멘토링
    openDates: {
      1: '2026-11-26',
      2: '2026-12-03',
      3: '2026-12-10',
      4: '2026-12-17',
      5: '2026-12-24',
      6: '2026-12-31'
    }
  };
  // =================================

  var maxWeek = Object.keys(CONFIG.openDates).length;

  function openDate(n) {
    var p = CONFIG.openDates[n].split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]); // 브라우저 현지 시각 0시
  }

  // ----- 멘토 모드: 잠금 무시 -----
  // 1) 내 PC에서 열 때(file://, localhost)는 항상 멘토 모드
  // 2) 배포 주소에서는 ?preview 로 한 번 열면 그 브라우저에 기억됨
  // 3) ?preview=off 로 열면 해제 (조원 화면 확인용)
  var MENTOR_KEY = 'mentoring-mentor';
  var mentor = (function () {
    var w = window;
    try {
      if (window.top.location.href) w = window.top; // index 안 iframe이면 바깥 주소 기준
    } catch (e) {}

    var host = w.location.hostname;
    if (w.location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') {
      return true;
    }

    var q = w.location.search;
    try {
      if (/[?&]preview=off\b/.test(q)) {
        localStorage.removeItem(MENTOR_KEY);
        return false;
      }
      if (/[?&]preview\b/.test(q)) {
        localStorage.setItem(MENTOR_KEY, '1');
        return true;
      }
      return localStorage.getItem(MENTOR_KEY) === '1';
    } catch (e) {
      return /[?&]preview\b/.test(q) && !/[?&]preview=off\b/.test(q);
    }
  })();

  function isPreview() {
    return mentor;
  }

  function isOpen(n) {
    return isPreview() || new Date() >= openDate(n);
  }

  function label(n) {
    var d = openDate(n);
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  window.MENTORING = {
    prefix: CONFIG.prefix,
    maxWeek: maxWeek,
    isOpen: isOpen,
    openLabel: label,
    isPreview: isPreview
  };

  // index.html에서 설정만 읽으려고 불렀으면 여기서 끝
  if (!/Week\d+\.html$/i.test(location.pathname)) return;

  var current = parseInt(location.pathname.match(/Week(\d+)\.html$/i)[1], 10);

  // ----- 잠긴 주차를 주소로 직접 열었을 때 -----
  if (current && CONFIG.openDates[current] && !isOpen(current)) {
    document.title = current + '주차 · 아직 공개 전';
    document.body.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;' +
      'font-family:\'Noto Sans KR\',\'Malgun Gothic\',sans-serif;background:#fbfcfd;color:#1b2330;text-align:center">' +
      '<div><div style="font-size:2.5rem">🔒</div>' +
      '<h1 style="font-size:1.3rem;margin:.6rem 0">' + current + '주차는 아직 공개 전이에요</h1>' +
      '<p style="color:#5a6574">' + label(current) + '에 열려요.</p>' +
      '<p><a href="index.html" style="color:#2357a8">멘토링 첫 화면으로</a></p></div></div>';
    return;
  }

  // ----- 이동 바 (index 안에서 열렸으면 index의 페이징을 사용) -----
  if (window.self !== window.top) return;

  var css = document.createElement('style');
  css.textContent =
    '.wk-nav{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;' +
    'padding:.55rem 1rem;background:var(--paper,#fff);border-bottom:1px solid var(--line,#dde3ea);' +
    'font-family:var(--font-body,sans-serif);font-size:.9rem}' +
    '.wk-nav a,.wk-nav span{padding:.25rem .7rem;border-radius:999px;text-decoration:none;' +
    'border:1px solid var(--line,#dde3ea);color:var(--fg,#1b2330)}' +
    '.wk-nav a:hover{background:var(--accent-soft,#e9f0fb)}' +
    '.wk-nav .on{background:var(--accent,#2357a8);border-color:var(--accent,#2357a8);color:#fff;font-weight:700}' +
    '.wk-nav .off{opacity:.35;cursor:default}' +
    '.wk-nav .home{margin-right:.4rem;font-weight:700}' +
    '.wk-nav .mentor{margin-left:auto;border-color:#e0b84c;background:#fff6dc;color:#7a5a00;font-size:.8rem}';
  document.head.appendChild(css);

  var nav = document.createElement('nav');
  nav.className = 'wk-nav';
  document.body.insertBefore(nav, document.body.firstChild);

  var html = '<a class="home" href="index.html#' + current + '">멘토링</a>';
  for (var n = 1; n <= maxWeek; n++) {
    if (n === current) {
      html += '<span class="on">' + n + '주차</span>';
    } else if (isOpen(n)) {
      html += '<a href="' + CONFIG.prefix + n + '.html">' + n + '주차</a>';
    } else {
      html += '<span class="off" title="' + label(n) + ' 공개">🔒 ' + n + '주차</span>';
    }
  }
  if (isPreview()) {
    html += '<span class="mentor" title="공개 전 주차도 보이는 상태">멘토 모드</span>';
  }
  nav.innerHTML = html;
})();
