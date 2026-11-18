/* MyCredit concept — shared components.
   Nothing is ever sent from the page: every action writes a WhatsApp or email
   message that the visitor chooses to send. */
(() => {
  const WA_NUMBER = '254711349805';
  const EMAIL = 'talktous@mycredit.co.ke';
  const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const mail = (subject, body) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const q = new URLSearchParams(location.search); // state hooks for the states board
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let uid = 0;

  /* ---------- Logo: use the supplied file; mark the slot if it is missing ---------- */
  $$('img[data-logo]').forEach((img) => {
    const fail = () => {
      const s = document.createElement('span');
      s.className = 'logo-missing';
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', img.alt);
      s.textContent = 'Add MyCredit logo';
      img.replaceWith(s);
    };
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener('error', fail);
  });

  /* ---------- Phone menu ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  if (menuBtn && menu) {
    const scrim = $('.menu-scrim');
    const head = $('.site-head');
    const set = (open) => {
      if (open && head) {
        // The sheet opens just below the header, wherever the header sits right now
        document.documentElement.style.setProperty('--menu-top', `${Math.max(0, head.getBoundingClientRect().bottom)}px`);
      }
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
      menu.hidden = !open;
      document.documentElement.classList.toggle('menu-open', open);
    };
    menuBtn.addEventListener('click', () => set(menuBtn.getAttribute('aria-expanded') !== 'true'));
    if (scrim) scrim.addEventListener('click', () => { set(false); menuBtn.focus(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { set(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    matchMedia('(min-width: 940px)').addEventListener('change', (e) => { if (e.matches) set(false); });
    if (q.get('menu') === 'open') set(true);
  }

  /* ---------- Hero enquiry slip ---------- */
  const SLIP = {
    business: { label: 'a business owner', items: ['Certificate of incorporation', 'Company KRA PIN and CR-12', "Directors' IDs and KRA PINs", 'Business licence, records, invoices'] },
    employee: { label: 'an employee', items: ['Three current payslips', 'Three months of M-Pesa statements', 'National ID', 'Passport photo'] },
    school: { label: 'a school owner', items: ['Certificate of incorporation', 'Resolution to borrow', 'Six months of business records', 'Sketch map for the home visit'] },
  };
  const slip = $('[data-slip]');
  if (slip) {
    const lists = $('.slip-lists', slip);
    lists.innerHTML = Object.entries(SLIP).map(([k, v]) =>
      `<ul class="checklist slip-list" data-key="${k}" aria-labelledby="bring-label">${
        v.items.map((i) => `<li><span class="box" aria-hidden="true"></span><span>${esc(i)}</span></li>`).join('')
      }</ul>`).join('');
    const send = $('.slip-send', slip);
    const show = (k) => {
      $$('.slip-list', slip).forEach((l) => {
        const on = l.dataset.key === k;
        l.classList.toggle('is-on', on);
        l.setAttribute('aria-hidden', String(!on));
      });
      const v = SLIP[k];
      send.href = wa(`Hello MyCredit. I am ${v.label}. Before I apply, please confirm that this is what I should bring:\n${v.items.map((i) => `- ${i}`).join('\n')}`);
    };
    const radios = $$('input[name="iam"]', slip);
    radios.forEach((r) => r.addEventListener('change', () => show(r.value)));
    const start = q.get('chip');
    if (start && SLIP[start]) radios.find((r) => r.value === start).checked = true;
    show(radios.find((r) => r.checked).value);
  }

  /* ---------- Documents: tabs + ticking checklist ---------- */
  const DOCS = {
    payroll: { tab: 'On a payroll', who: 'an employee on a payroll', items: ['Three current payslips', 'Three months of M-Pesa statements', 'National ID', 'Passport photo'] },
    business: { tab: 'Business owner', who: 'a business owner', items: ['Copy of your logbook', 'National ID and KRA PIN', 'Passport photo', 'Six months of bank or M-Pesa statements', 'Proof of your business'] },
    company: {
      tab: 'Company or school', who: 'a company or school',
      items: ['Certificate of incorporation', 'Resolution to borrow', 'Company KRA PIN', 'CR-12', 'Passport photos, IDs and KRA PINs of the directors', 'Business licence, records and invoices', "Sketch map to the office or a director's home, for the home visit"],
      note: 'Companies and schools must also have been operating for at least six months.',
    },
  };

  $$('[data-docs]').forEach((root) => {
    const keys = root.dataset.docs.split(',');
    const id = `docs${++uid}`;
    root.innerHTML = `
      <div class="tabs" role="tablist" aria-label="Who is applying" style="--n:${keys.length}">
        ${keys.map((k) => `<button class="tab" type="button" role="tab" id="${id}-t-${k}" aria-controls="${id}-p-${k}" aria-selected="false" tabindex="-1" data-k="${k}">${DOCS[k].tab}</button>`).join('')}
      </div>
      ${keys.map((k) => {
        const d = DOCS[k];
        return `<div class="tabpanel" role="tabpanel" id="${id}-p-${k}" aria-labelledby="${id}-t-${k}" data-k="${k}" hidden>
          <ul class="checklist docs-list">
            ${d.items.map((it) => `<li><label class="tick"><input type="checkbox" value="${esc(it)}"><span class="box" aria-hidden="true"></span><span class="tick-text">${esc(it)}</span></label></li>`).join('')}
          </ul>
          ${d.note ? `<p class="note docs-note">${d.note}</p>` : ''}
          <div class="progress">
            <p class="count" aria-live="polite"><span class="n">0</span> of ${d.items.length} ready</p>
            <div class="bar" role="progressbar" aria-label="Documents ready" aria-valuemin="0" aria-valuemax="${d.items.length}" aria-valuenow="0"><span></span></div>
          </div>
        </div>`;
      }).join('')}
      <a class="btn btn-primary docs-send" href="#" target="_blank" rel="noopener">Send what I still need to WhatsApp</a>`;

    const tabs = $$('.tab', root);
    const send = $('.docs-send', root);
    let active = keys[0];

    const update = () => {
      const panel = $(`.tabpanel[data-k="${active}"]`, root);
      const boxes = $$('input', panel);
      const done = boxes.filter((b) => b.checked);
      const missing = boxes.filter((b) => !b.checked).map((b) => b.value);
      $('.n', panel).textContent = done.length;
      $('.bar', panel).setAttribute('aria-valuenow', done.length);
      $('.bar span', panel).style.width = `${(done.length / boxes.length) * 100}%`;
      const d = DOCS[active];
      const text = missing.length
        ? `Hello MyCredit. I am applying as ${d.who}. I have ${done.length} of ${boxes.length} documents ready. I still need:\n${missing.map((m) => `- ${m}`).join('\n')}\nCan you tell me what to do about these?`
        : `Hello MyCredit. I am applying as ${d.who}. I have all ${boxes.length} documents on the list ready. What is the next step?`;
      send.href = wa(text);
    };

    const select = (k, focus) => {
      active = k;
      tabs.forEach((t) => {
        const on = t.dataset.k === k;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      $$('.tabpanel', root).forEach((p) => { p.hidden = p.dataset.k !== k; });
      update();
    };

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t.dataset.k));
      t.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j].dataset.k, true); }
      });
    });
    root.addEventListener('change', update);

    const startTab = q.get('tab');
    select(keys.includes(startTab) ? startTab : keys[0]);
    const pre = parseInt(q.get('tick'), 10);
    if (pre > 0) {
      $$(`.tabpanel[data-k="${active}"] input`, root).slice(0, pre).forEach((b) => { b.checked = true; });
      update();
    }
  });

  /* ---------- The statement: repayment calculator ---------- */
  $$('[data-calc]').forEach((root) => {
    const id = `calc${++uid}`;
    root.innerHTML = `
      <div class="calc-fields">
        <div class="field">
          <label class="field-label" for="${id}-amt">Amount you want to borrow (KES)</label>
          <input class="input num" id="${id}-amt" inputmode="numeric" autocomplete="off" value="500,000">
          <input class="range" type="range" min="50000" max="5000000" step="10000" value="500000" aria-label="Amount you want to borrow, slider" aria-controls="${id}-amt">
          <div class="range-ends num" aria-hidden="true"><span>50,000</span><span>5,000,000</span></div>
        </div>
        <div class="field">
          <label class="field-label" for="${id}-mon">Months to repay</label>
          <input class="input num" id="${id}-mon" inputmode="numeric" autocomplete="off" value="12">
          <input class="range" type="range" min="3" max="72" step="1" value="12" aria-label="Months to repay, slider" aria-controls="${id}-mon">
          <div class="range-ends num" aria-hidden="true"><span>3</span><span>72</span></div>
        </div>
        <div class="field">
          <label class="field-label" for="${id}-rate">Annual rate % <span class="hint">from your offer</span></label>
          <input class="input num" id="${id}-rate" inputmode="decimal" autocomplete="off" placeholder="e.g. 24">
        </div>
      </div>
      <table class="ledger">
        <caption class="sr-only">Repayment statement</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Instalment</th><th scope="col">Balance</th></tr></thead>
        <tbody></tbody>
        <tfoot></tfoot>
      </table>
      <div class="result" aria-live="polite">
        <p class="result-fig"></p>
        <p class="result-note"></p>
      </div>`;

    const [amt, mon, rate] = ['amt', 'mon', 'rate'].map((s) => $(`#${id}-${s}`, root));
    const [amtR, monR] = $$('.range', root);
    const tbody = $('tbody', root);
    const tfoot = $('tfoot', root);
    const fig = $('.result-fig', root);
    const note = $('.result-note', root);
    const digits = (v) => parseFloat(String(v).replace(/[^\d.]/g, '')) || 0;
    let first = true;
    let dimTimer;

    const render = () => {
      const P = digits(amt.value);
      const n = Math.round(digits(mon.value));
      const r = parseFloat(String(rate.value).replace(/[^\d.]/g, ''));
      const ok = P > 0 && n > 0 && r > 0;

      if (!ok) {
        const cell = '<td class="pending">Enter your rate</td>';
        tbody.innerHTML = [1, 2, 3].map((m) => `<tr><td>${m}</td>${cell}${cell}</tr>`).join('');
        tfoot.innerHTML = `<tr><td>Total</td>${cell}${cell}</tr>`;
        fig.textContent = P > 0 && n > 0 ? 'Add your rate.' : 'Add your amount and months.';
        note.textContent = 'Type the annual interest rate from your offer. Without it, a monthly payment would be a guess.';
      } else {
        const i = r / 100 / 12;
        const pay = Math.round((P * i) / (1 - Math.pow(1 + i, -n)));
        const total = pay * n;
        let bal = P;
        const rows = [];
        for (let m = 1; m <= Math.min(3, n); m++) {
          bal = Math.max(0, bal * (1 + i) - pay);
          rows.push(`<tr><td>${m}</td><td>KES ${fmt(pay)}</td><td>KES ${fmt(bal)}</td></tr>`);
        }
        tbody.innerHTML = rows.join('');
        tfoot.innerHTML = `<tr><td>Total</td><td>KES ${fmt(total)}</td><td>KES 0</td></tr>`;
        fig.textContent = `KES ${fmt(pay)} a month.`;
        note.textContent = `Over ${n} months you would repay about KES ${fmt(total)}, of which about KES ${fmt(total - P)} is interest. Estimate on a reducing balance. It leaves out fees and insurance. Your offer letter is the only binding figure.`;
      }
      if (!first) {
        fig.classList.add('dim');
        clearTimeout(dimTimer);
        dimTimer = setTimeout(() => fig.classList.remove('dim'), 160);
      }
      first = false;
    };

    amtR.addEventListener('input', () => { amt.value = fmt(amtR.value); render(); });
    monR.addEventListener('input', () => { mon.value = monR.value; render(); });
    amt.addEventListener('input', () => { amtR.value = digits(amt.value); render(); });
    amt.addEventListener('blur', () => { const v = digits(amt.value); if (v) amt.value = fmt(v); });
    mon.addEventListener('input', () => { monR.value = digits(mon.value); render(); });
    rate.addEventListener('input', render);

    if (q.get('rate')) rate.value = q.get('rate');
    render();
  });

  /* ---------- Enquiry: writes a message, never sends ---------- */
  const NEEDS = ['Business loan', 'Salary check-off loan', 'Kuza Elimu unsecured loan', 'Kuza Elimu secured loan', 'Kuza Elimu asset finance (school bus or van)', 'Insurance', 'Something else'];

  $$('[data-enquiry]').forEach((root, idx) => {
    const id = `enq${++uid}`;
    const pre = root.dataset.preselect || '';
    root.innerHTML = `
      <div class="panel-wrap">
        <form class="panel perf" novalidate>
          <div class="field">
            <label class="field-label" for="${id}-name">Your name</label>
            <input class="input" id="${id}-name" name="name" autocomplete="name">
          </div>
          <div class="field">
            <label class="field-label" for="${id}-phone">Phone <span class="hint">so we can call you back</span></label>
            <input class="input" id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel">
          </div>
          <div class="field">
            <label class="field-label" for="${id}-need">What do you need?</label>
            <select class="input" id="${id}-need" name="need">
              <option value="">Choose one</option>
              ${NEEDS.map((n) => `<option${n === pre ? ' selected' : ''}>${esc(n)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="${id}-amount">Amount <span class="hint">optional</span></label>
            <input class="input num" id="${id}-amount" name="amount" inputmode="numeric" autocomplete="off">
          </div>
          <div class="field">
            <label class="field-label" for="${id}-notes">Anything we should know? <span class="hint">optional</span></label>
            <textarea class="input" id="${id}-notes" name="notes" rows="4"></textarea>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Write my message</button>
          <p class="note">Nothing is sent from this page. We write the message and you choose to send it by WhatsApp or email. You do not need to share ID numbers or financial details to ask.</p>
        </form>
        <div class="panel perf ready" hidden>
          <p class="stamp" tabindex="-1">Ready</p>
          <p class="msg"></p>
          <div class="ready-actions">
            <a class="btn btn-primary r-wa" target="_blank" rel="noopener" href="#">Send on WhatsApp</a>
            <a class="btn btn-secondary r-mail" href="#">Send by email</a>
            <button class="btn btn-secondary r-copy" type="button">Copy text</button>
          </div>
        </div>
      </div>`;

    const form = $('form', root);
    const ready = $('.ready', root);
    const f = (n) => form.elements[n];

    const clearErr = (el) => {
      const field = el.closest('.field');
      field.classList.remove('invalid');
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
      const e = $('.err', field);
      if (e) e.remove();
    };
    const setErr = (el, msg) => {
      const field = el.closest('.field');
      field.classList.add('invalid');
      const p = document.createElement('p');
      p.className = 'err';
      p.id = `${el.id}-err`;
      p.textContent = msg;
      field.appendChild(p);
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', p.id);
    };
    ['name', 'phone', 'need'].forEach((n) => f(n).addEventListener('input', () => clearErr(f(n))));
    f('need').addEventListener('change', () => clearErr(f('need')));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ['name', 'phone', 'need'].forEach((n) => clearErr(f(n)));
      const errs = [];
      if (!f('name').value.trim()) errs.push([f('name'), 'Enter your name.']);
      if (f('phone').value.replace(/\D/g, '').length < 9) errs.push([f('phone'), 'Enter a phone number we can call back.']);
      if (!f('need').value) errs.push([f('need'), 'Choose what you need.']);
      if (errs.length) {
        errs.forEach(([el, m]) => setErr(el, m));
        errs[0][0].focus();
        return;
      }
      const lines = [`Hello MyCredit. My name is ${f('name').value.trim()}.`, `I would like to ask about: ${f('need').value}.`];
      const amount = f('amount').value.trim();
      if (amount) lines.push(`Amount: KES ${digits(amount) ? fmt(digits(amount)) : amount}.`);
      const notes = f('notes').value.trim();
      if (notes) lines.push(notes);
      lines.push(`Please call me back on ${f('phone').value.trim()}.`);
      const text = lines.join('\n');

      $('.msg', ready).textContent = text;
      $('.r-wa', ready).href = wa(text);
      $('.r-mail', ready).href = mail(`Enquiry: ${f('need').value}`, text);
      const copy = $('.r-copy', ready);
      copy.textContent = 'Copy text';
      copy.onclick = async () => {
        try { await navigator.clipboard.writeText(text); }
        catch {
          const t = document.createElement('textarea');
          t.value = text; document.body.appendChild(t); t.select();
          document.execCommand('copy'); t.remove();
        }
        copy.textContent = 'Copied';
        setTimeout(() => { copy.textContent = 'Copy text'; }, 2400);
      };
      form.hidden = true;
      ready.hidden = false;
      $('.stamp', ready).focus({ preventScroll: true });
    });

    function digits(v) { return parseFloat(String(v).replace(/[^\d.]/g, '')) || 0; }

    // States board hooks (first form on the page only)
    if (idx === 0) {
      if (q.get('form') === 'error') form.requestSubmit();
      if (q.get('form') === 'ready') {
        f('name').value = 'Sample name';
        f('phone').value = '0700 000 000';
        if (!f('need').value) f('need').value = 'Business loan';
        f('amount').value = '500,000';
        form.requestSubmit();
      }
    }
  });
})();
