import { t } from '../utils/translator';

export function createHistorySection(token: string): HTMLElement {
  const historyWrapper = document.createElement('div');
  historyWrapper.className = `
    relative z-20 mt-7 mb-4
    flex flex-col md:flex-row justify-center items-start gap-8
    w-full max-w-5xl mx-auto px-4
  `.replace(/\s+/g, ' ').trim();

  // ======= PAGINATED HISTORY HELPER =======
  function createPaginatedHistorySection(
    titleText: string,
    endpoint: string,
    icon: string
  ): HTMLElement {
    const section = document.createElement('div');
    section.className = 'relative flex flex-col items-center w-full';

    const container = document.createElement('div');
    container.className = `
      bg-black/60 rounded-2xl shadow-2xl
      transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl
      px-6 pt-4 pb-4 w-full max-w-[496px]
      h-[200px] overflow-hidden
    `.replace(/\s+/g, ' ').trim();

    // — HEADER + STATS —
    const header = document.createElement('div');
    header.className = 'flex justify-between items-start w-full mb-4';

    // title + subtitle stacked
    const titleColumn = document.createElement('div');
    titleColumn.className = 'flex flex-col';

    const title = document.createElement('h3');
    title.textContent = titleText;
    title.className = 'text-xl font-semibold';

    const statsLine = document.createElement('p');
    statsLine.className = 'text-sm text-gray-300 italic';
    statsLine.textContent = ''; // filled in below for Pong

    titleColumn.append(title, statsLine);

    // nav buttons
    const nav = document.createElement('div');
    nav.className = 'flex items-center gap-2';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀';
    prevBtn.className = 'text-white px-2 py-1 rounded hover:bg-white/20';
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'text-sm text-gray-400';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '▶';
    nextBtn.className = 'text-white px-2 py-1 rounded hover:bg-white/20';
    nav.append(prevBtn, pageIndicator, nextBtn);

    header.append(titleColumn, nav);

    // the list of past games
    const list = document.createElement('div');
    list.className = 'text-gray-300 space-y-2 italic min-h-[80px] transition-opacity duration-300';

    // assemble container once
    container.append(header, list);
    section.appendChild(container);

    // fetch and fill stats if this is the Pong section
    if (endpoint === '/api/me/pong-games') {
      fetch('/api/me/pong-stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(({ victories, defeats }) => {
        statsLine.textContent =
          `${t('history.victories')}: ${victories} – ${t('history.defeats')}: ${defeats}`;
      })

        .catch(err => console.error('Could not load pong stats:', err));
    }

  if (endpoint === '/api/me/memory-games') {
    fetch('/api/me/memory-stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(({ victories, defeats }) => {
        statsLine.textContent = 
          `${t('history.victories')}: ${victories} – ${t('history.defeats')}: ${defeats}`;
      })
      .catch(console.error);
  }


    // pagination state
    let currentPage = 0;
    let data: any[] = [];

    const renderPage = () => {
      list.style.opacity = '0';
      setTimeout(() => {
        list.innerHTML = '';
        const start = currentPage * 3;
        const pageItems = data.slice(start, start + 3);

        pageItems.forEach(game => {
          const p = document.createElement('p');
          const date = new Date(game.timestamp);
          const dateOnly = [
            String(date.getDate()).padStart(2,'0'),
            String(date.getMonth()+1).padStart(2,'0'),
            date.getFullYear()
          ].join('/');

          const rawOpp = game.opponent;
          const opponentLabel =
            (rawOpp === 'Invité' || rawOpp === 'Guest')
              ? t('opponent.guest')
              : rawOpp;

          p.textContent =
            `${icon} ${game.score1} - ${game.score2} ` +
            `${t('history.against')} ${opponentLabel} • ${dateOnly}`;

          list.appendChild(p);
        });

        pageIndicator.textContent = `${currentPage + 1} / ${Math.ceil(data.length / 3)}`;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = start + 3 >= data.length;

        list.style.opacity = '1';
      }, 150);
    };

    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) { currentPage--; renderPage(); }
    });
    nextBtn.addEventListener('click', () => {
      if ((currentPage + 1) * 3 < data.length) { currentPage++; renderPage(); }
    });

    // initial fetch of game history
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(games => {
        if (!Array.isArray(games)) {
          list.textContent = t('history.loadError');
          return;
        }
        if (games.length === 0) {
          list.textContent = t('history.empty');
          return;
        }
        data = games.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        renderPage();
      })
      .catch(err => {
        console.error(`Erreur loading ${titleText}:`, err);
        list.textContent = t('history.error');
      });

    return section;
  }

  const pongSection = createPaginatedHistorySection(t('history.pong'), '/api/me/pong-games', '🏓');
  const memorySection = createPaginatedHistorySection(t('history.memory'), '/api/me/memory-games', '🃏');

  historyWrapper.append(pongSection, memorySection);
  return historyWrapper;
}
