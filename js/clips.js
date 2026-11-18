/* Growth stories: MyCredit's own published films from youtube.com/@mycreditlimited.
   Titles are as MyCredit published them (sentence case for display). Nothing is invented.
   The player is a poster until pressed, then a youtube-nocookie embed loads and plays. */
(() => {
  const CLIPS = {
    SqSah1pYvYQ: 'Fadhili Group of Schools: a story of growth and partnership',
    sSzkDHywrwM: 'Empowering customers, elevating experiences',
    yYBiKGvArI0: 'Clean cooking transition in Kenyan schools: KSh 500 million committed',
    biTmi2Oydko: 'Apollo Science: making learning simpler and smarter',
    nH2GkxKpuWY: 'The future of school financing is here',
  };
  const thumb = (id, size) => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

  document.querySelectorAll('[data-clips]').forEach((root) => {
    const ids = root.dataset.clips.split(',').filter((id) => CLIPS[id]);
    if (!ids.length) return;

    root.innerHTML = `
      <div class="clip-main">
        <div class="clip-stage"></div>
        <div class="clip-meta">
          <p class="clip-src">MyCredit on YouTube</p>
          <h3 class="clip-title" aria-live="polite"></h3>
        </div>
      </div>
      <ol class="clip-list" aria-label="More films">
        ${ids.map((id, i) => `
          <li><button class="clip-item" type="button" data-id="${id}" aria-current="${i === 0}">
            <span class="clip-thumb"><img src="${thumb(id, 'mqdefault')}" alt="" loading="lazy" width="320" height="180"></span>
            <span class="clip-item-title">${esc(CLIPS[id])}</span>
          </button></li>`).join('')}
      </ol>`;

    const stage = root.querySelector('.clip-stage');
    const title = root.querySelector('.clip-title');
    const items = [...root.querySelectorAll('.clip-item')];

    const poster = (id) => {
      stage.innerHTML = `
        <button class="clip-play" type="button" aria-label="Play film: ${esc(CLIPS[id])}">
          <img class="clip-poster" src="${thumb(id, 'maxresdefault')}" alt="" loading="lazy">
          <span class="play-btn">${PLAY}</span>
        </button>`;
      const img = stage.querySelector('img');
      // maxresdefault is missing for some uploads; YouTube then serves a 120px placeholder
      img.addEventListener('load', () => { if (img.naturalWidth < 200) img.src = thumb(id, 'hqdefault'); });
      img.addEventListener('error', () => { img.src = thumb(id, 'hqdefault'); }, { once: true });
      stage.querySelector('.clip-play').addEventListener('click', () => play(id));
      title.textContent = CLIPS[id];
    };

    const play = (id) => {
      stage.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
        title="${esc(CLIPS[id])}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      stage.querySelector('iframe').focus();
    };

    const select = (id) => {
      items.forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
      stage.classList.add('swap');
      setTimeout(() => { poster(id); stage.classList.remove('swap'); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
    };

    items.forEach((b) => b.addEventListener('click', () => select(b.dataset.id)));
    poster(ids[0]);
  });
})();
