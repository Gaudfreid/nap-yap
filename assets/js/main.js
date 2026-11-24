// Nap & Yap Staycation — shared interactions

document.addEventListener('DOMContentLoaded', () => {

  /* Nav: solidify on scroll */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 60) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger?.classList.remove('open');
    links?.classList.remove('open');
  }));

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Deep-linked FAQ item (e.g. footer policy links → rates.html#downpayment):
     open that item instead of leaving visitors staring at a collapsed question. */
  if (location.hash) {
    const target = document.querySelector('.faq-item' + location.hash);
    if (target) {
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      target.classList.add('open');
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }

  /* Four Moments progress line (fills as section scrolls into view) */
  const moments = document.querySelector('.moments');
  const line = document.querySelector('.progress-line');
  if (moments && line) {
    const onMomentsScroll = () => {
      const rect = moments.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
      line.style.setProperty('--fill', `${progress * 100}%`);
    };
    window.addEventListener('scroll', onMomentsScroll, { passive: true });
    onMomentsScroll();
  }

});


/* =====================================================================
   Live chat (talks to the "chat" function; the Nap & Yap team replies
   from the owner app). Hidden from the public until CHAT_PUBLIC is true.
   To try it before then, open any page with ?chat=1 at the end of the link.
   ===================================================================== */
(function () {
  'use strict';
  try {
    var CHAT_ENDPOINT = 'https://skczajswyzkkvgmwzdmi.supabase.co/functions/v1/chat';
    var CHAT_PUBLIC = false;
    var STORE_KEY = 'ny_chat_v1';

    var preview = /[?&]chat=1(&|$)/.test(location.search);
    if (!CHAT_PUBLIC && !preview) return;

    var css = [
      '.nyc-btn{position:fixed;right:16px;bottom:16px;z-index:9998;display:flex;align-items:center;gap:.5rem;border:0;border-radius:999px;padding:.8rem 1.2rem;background:var(--gold,#C99A3C);color:var(--navy,#16233F);font:600 .95rem var(--font-body,Inter,system-ui,sans-serif);box-shadow:0 6px 20px rgba(22,35,63,.25);cursor:pointer}',
      '.nyc-btn .nyc-dot{width:.6rem;height:.6rem;border-radius:50%;background:var(--terracotta,#B4694A);display:none}',
      '.nyc-btn.has-new .nyc-dot{display:inline-block}',
      '.nyc-panel{position:fixed;right:16px;bottom:16px;z-index:9999;width:340px;max-width:calc(100vw - 32px);max-height:min(560px,calc(100vh - 32px));display:none;flex-direction:column;background:#fff;border:1px solid var(--line,#E6DCC8);border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(22,35,63,.28);font-family:var(--font-body,Inter,system-ui,sans-serif);color:var(--ink,#2A2620)}',
      '.nyc-panel.open{display:flex}',
      '.nyc-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.8rem 1rem;background:var(--navy,#16233F);color:var(--cream,#FAF5EC)}',
      '.nyc-head strong{font-size:1rem}',
      '.nyc-x{background:none;border:0;color:inherit;font-size:1.4rem;line-height:1;cursor:pointer;padding:.1rem .4rem}',
      '.nyc-body{padding:1rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.6rem}',
      '.nyc-intro{font-size:.88rem;color:var(--ink-soft,#6B6459);margin:0}',
      '.nyc-body label{font-size:.78rem;font-weight:600;color:var(--navy,#16233F);display:block;margin-bottom:.2rem}',
      '.nyc-body input,.nyc-body textarea{width:100%;box-sizing:border-box;padding:.6rem .75rem;border-radius:10px;border:1px solid var(--line,#E6DCC8);background:var(--cream,#FAF5EC);font:inherit;font-size:.92rem;color:var(--ink,#2A2620)}',
      '.nyc-body input:focus,.nyc-body textarea:focus{outline:none;border-color:var(--gold,#C99A3C)}',
      '.nyc-hp{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}',
      '.nyc-err{color:#B3261E;font-size:.8rem;margin:.2rem 0 0}',
      '.nyc-go{border:0;border-radius:999px;padding:.7rem 1rem;background:var(--gold,#C99A3C);color:var(--navy,#16233F);font:600 .92rem var(--font-body,Inter,system-ui,sans-serif);cursor:pointer}',
      '.nyc-go[disabled]{opacity:.55;cursor:not-allowed}',
      '.nyc-small{font-size:.74rem;color:var(--ink-soft,#6B6459);margin:0}',
      '.nyc-msgs{display:flex;flex-direction:column;gap:.5rem}',
      '.nyc-b{max-width:85%;padding:.5rem .75rem;border-radius:14px;font-size:.9rem;white-space:pre-wrap;word-break:break-word}',
      '.nyc-b.me{align-self:flex-end;background:var(--navy,#16233F);color:var(--cream,#FAF5EC)}',
      '.nyc-b.team{align-self:flex-start;background:var(--cream-dark,#F1E8D8)}',
      '.nyc-b small{display:block;font-size:.68rem;opacity:.7;margin-top:.2rem}',
      '.nyc-send{display:flex;gap:.4rem;padding:.7rem;border-top:1px solid var(--line,#E6DCC8);align-items:flex-end}',
      '.nyc-send textarea{flex:1;resize:none;box-sizing:border-box;padding:.55rem .7rem;border-radius:10px;border:1px solid var(--line,#E6DCC8);background:var(--cream,#FAF5EC);font:inherit;font-size:.9rem}',
      '@media (max-width:480px){.nyc-panel{right:8px;bottom:8px;max-width:calc(100vw - 16px)}.nyc-btn{right:12px;bottom:12px}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'ny-chat-style';
    style.textContent = css;
    document.head.appendChild(style);

    function el(tag, props, kids) {
      var n = document.createElement(tag);
      if (props) Object.keys(props).forEach(function (k) {
        if (k === 'class') n.className = props[k];
        else if (k === 'text') n.textContent = props[k];
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), props[k]);
        else n.setAttribute(k, props[k]);
      });
      (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
      return n;
    }

    var token = null;
    try { token = localStorage.getItem(STORE_KEY); } catch (e) { token = null; }
    var seen = {};
    var last = null;
    var isOpen = false;
    var busy = false;
    var primed = false;   // first background check only catches up; it never raises the "new message" dot

    var btn = el('button', { class: 'nyc-btn', type: 'button', 'aria-label': 'Open chat' }, [el('span', { text: 'Chat with us' }), el('span', { class: 'nyc-dot' })]);
    var title = el('strong', { text: 'Chat with Nap & Yap' });
    var closeBtn = el('button', { class: 'nyc-x', type: 'button', 'aria-label': 'Close chat', text: '×' });
    var body = el('div', { class: 'nyc-body' });
    var panel = el('div', { class: 'nyc-panel', role: 'dialog', 'aria-label': 'Chat with Nap & Yap' }, [
      el('div', { class: 'nyc-head' }, [title, closeBtn]), body
    ]);
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function api(payload) {
      return fetch(CHAT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (b) { return { status: res.status, body: b }; });
        });
    }
    function saveToken(t) { token = t; try { if (t) localStorage.setItem(STORE_KEY, t); else localStorage.removeItem(STORE_KEY); } catch (e) { /* private mode: chat still works this visit */ } }
    function fmtTime(s) { try { return new Date(s).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }

    // ---------------------------------------------------------- start form ----
    function showForm() {
      clearBar();
      var f = {};
      function field(key, label, type, ph) {
        var input = el('input', { id: 'nyc-' + key, type: type, placeholder: ph, autocomplete: key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'email', maxlength: key === 'email' ? '254' : '200' });
        f[key] = input;
        return el('div', null, [el('label', { for: 'nyc-' + key, text: label }), input]);
      }
      var msg = el('textarea', { id: 'nyc-message', rows: '3', maxlength: '2000', placeholder: 'How can we help?' });
      var hp = el('input', { type: 'text', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
      var err = el('p', { class: 'nyc-err', style: 'display:none' });
      var go = el('button', { class: 'nyc-go', type: 'button', text: 'Start chat' });

      function showErr(t) { err.textContent = t; err.style.display = t ? 'block' : 'none'; }
      go.addEventListener('click', function () {
        showErr('');
        var name = f.name.value.trim(), phone = f.phone.value.trim(), email = f.email.value.trim(), text = msg.value.trim();
        if (!name) return showErr('Please tell us your name.');
        if (!phone && !email) return showErr('Please give us a phone number or an email so we can reply.');
        if (!text) return showErr('Please type a message.');
        go.disabled = true; go.textContent = 'Starting...';
        api({ action: 'start', name: name, phone: phone, email: email, message: text, website: hp.value }).then(function (r) {
          go.disabled = false; go.textContent = 'Start chat';
          if (r.body && r.body.ok) {
            saveToken(r.body.token);
            seen = {}; last = null;
            showThread(r.body.messages || []);
            return;
          }
          if (r.body && r.body.errors) {
            var first = r.body.errors.name || r.body.errors.contact || r.body.errors.phone || r.body.errors.email || r.body.errors.message;
            return showErr(first || 'Please check your details.');
          }
          showErr((r.body && r.body.message) || 'We couldn’t start the chat just now. Please try again, or send us an inquiry on the booking page.');
        }).catch(function () {
          go.disabled = false; go.textContent = 'Start chat';
          showErr('We couldn’t reach our server. Please check your connection and try again.');
        });
      });

      body.replaceChildren(
        el('p', { class: 'nyc-intro', text: 'Hi! Ask us anything about your stay. We reply as soon as we can. Leave a phone number or email so we can follow up if we miss you here.' }),
        field('name', 'Your name', 'text', 'Juan Dela Cruz'),
        field('phone', 'Phone (optional if you give an email)', 'tel', '09XX XXX XXXX'),
        field('email', 'Email (optional if you give a phone)', 'email', 'you@email.com'),
        el('div', null, [el('label', { for: 'nyc-message', text: 'Message' }), msg]),
        el('div', { class: 'nyc-hp' }, [hp]),
        err, go,
        el('p', { class: 'nyc-small', text: 'Your name and contact details are shared with the Nap & Yap team so we can reply. A chat is not a booking: to reserve dates, please send a booking inquiry.' })
      );
    }

    // -------------------------------------------------------------- thread ----
    var list = null, sendBox = null, sendErr = null;

    function addMessages(rows) {
      var added = 0, fromTeam = 0;
      (rows || []).forEach(function (m) {
        if (!m || seen[m.id]) return;
        seen[m.id] = true; added++;
        if (!last || Date.parse(m.created_at) > Date.parse(last)) last = m.created_at;
        if (m.sender === 'owner') fromTeam++;
        if (list) list.appendChild(el('div', { class: 'nyc-b ' + (m.sender === 'owner' ? 'team' : 'me') }, [m.body, el('small', { text: (m.sender === 'owner' ? 'Nap & Yap team · ' : '') + fmtTime(m.created_at) })]));
      });
      if (added && isOpen) body.scrollTop = body.scrollHeight;
      return fromTeam;
    }

    function showThread(rows) {
      clearBar();
      list = el('div', { class: 'nyc-msgs' });
      body.replaceChildren(list,
        el('p', { class: 'nyc-small', text: 'We reply as soon as we can. You can close this box and come back later: your chat will be here.' }));
      sendErr = el('p', { class: 'nyc-err', style: 'display:none' });
      sendBox = el('textarea', { rows: '2', maxlength: '2000', placeholder: 'Type a message...' });
      var send = el('button', { class: 'nyc-go', type: 'button', text: 'Send' });
      function doSend() {
        var text = sendBox.value.trim();
        if (!text || busy) return;
        busy = true; send.disabled = true; sendErr.style.display = 'none';
        api({ action: 'send', token: token, message: text }).then(function (r) {
          busy = false; send.disabled = false;
          if (r.body && r.body.ok && r.body.message) { sendBox.value = ''; addMessages([r.body.message]); return; }
          if (r.body && r.body.reason === 'unknown_chat') { saveToken(null); showForm(); return; }
          sendErr.textContent = ((r.body && (r.body.message || (r.body.errors && r.body.errors.message))) || 'Your message was not sent. Please try again.');
          sendErr.style.display = 'block';
        }).catch(function () {
          busy = false; send.disabled = false;
          sendErr.textContent = 'Your message was not sent. Please check your connection and try again.';
          sendErr.style.display = 'block';
        });
      }
      send.addEventListener('click', doSend);
      sendBox.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
      // the send bar sits under the scrolling area
      var bar = el('div', { class: 'nyc-send' }, [sendBox, send]);
      panel.appendChild(bar);
      panel.__bar = bar;
      body.appendChild(sendErr);
      addMessages(rows);
      body.scrollTop = body.scrollHeight;
    }

    function clearBar() { if (panel.__bar) { panel.__bar.remove(); panel.__bar = null; } }

    // -------------------------------------------------------------- polling ----
    function poll() {
      if (!token || document.hidden || busy) return Promise.resolve();
      return api({ action: 'poll', token: token, after: last || undefined }).then(function (r) {
        if (r.body && r.body.ok) {
          var fromTeam = addMessages(r.body.messages);
          if (fromTeam && !isOpen && primed) btn.classList.add('has-new');
          primed = true;
        } else if (r.body && r.body.reason === 'unknown_chat') {
          saveToken(null); clearBar(); if (isOpen) showForm();
        }
      }).catch(function () { /* offline: try again next round */ });
    }
    (function loop() {
      setTimeout(function () { poll().then(loop, loop); }, isOpen ? 4000 : 20000);
    })();

    // ----------------------------------------------------------- open/close ----
    function openPanel() {
      isOpen = true; btn.style.display = 'none'; btn.classList.remove('has-new');
      panel.classList.add('open');
      clearBar();
      if (token) {
        // restore this guest's chat from the server
        body.replaceChildren(el('p', { class: 'nyc-small', text: 'Loading your chat...' }));
        seen = {}; last = null;
        api({ action: 'poll', token: token }).then(function (r) {
          if (r.body && r.body.ok) { showThread(r.body.messages || []); }
          else if (r.body && r.body.reason === 'unknown_chat') { saveToken(null); showForm(); }
          else { body.replaceChildren(el('p', { class: 'nyc-err', text: 'We couldn’t load your chat. Please try again in a moment.' })); }
        }).catch(function () {
          body.replaceChildren(el('p', { class: 'nyc-err', text: 'We couldn’t reach our server. Please check your connection and try again.' }));
        });
      } else {
        showForm();
      }
    }
    function closePanel() { isOpen = false; panel.classList.remove('open'); btn.style.display = 'flex'; }
    btn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
  } catch (e) {
    // The chat must never break the rest of the website.
    if (window.console) console.warn('Chat unavailable', e);
  }
})();
