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


    const header = document.createElement('div');
    header.className = 'flex justify-between items-center w-full mb-4';

    const title = document.createElement('h3');
    title.textContent = titleText;
    title.className = 'text-xl font-semibold';

    const nav = document.createElement('div');
    nav.className = 'flex items-center gap-2';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀';
    prevBtn.className = 'text-white px-2 py-1 rounded hover:bg-white/20';

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '▶';
    nextBtn.className = 'text-white px-2 py-1 rounded hover:bg-white/20';

    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'text-sm text-gray-400';

    nav.appendChild(prevBtn);
    nav.appendChild(pageIndicator);
    nav.appendChild(nextBtn);

    header.appendChild(title);
    header.appendChild(nav);

    const list = document.createElement('div');
    list.className = 'text-gray-300 space-y-2 italic min-h-[80px] transition-opacity duration-300';

    container.append(header, list);
    section.appendChild(container);

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


          const rawOpp       = game.opponent;
          const opponentLabel =

            ( rawOpp === 'Invité' || rawOpp === 'Guest' )
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
      if (currentPage > 0) {
        currentPage--;
        renderPage();
      }
    });

    nextBtn.addEventListener('click', () => {
      if ((currentPage + 1) * 3 < data.length) {
        currentPage++;
        renderPage();
      }
    });

    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(games => {
        if (!Array.isArray(games)) {
          const errorMsg = document.createElement('p');
          errorMsg.textContent = t('history.loadError');
          list.appendChild(errorMsg);
          return;
        }

        if (games.length === 0) {
          const emptyMsg = document.createElement('p');
          emptyMsg.textContent = t('history.empty');
          list.appendChild(emptyMsg);
          return;
        }

        data = games.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        renderPage();
      })
      .catch(err => {
        console.error(`Erreur lors du chargement de ${titleText.toLowerCase()}:`, err);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = t('history.error');
        list.appendChild(errorMsg);
      });

    return section;
  }

  const pongSection = createPaginatedHistorySection(t('history.pong'), '/api/me/pong-games', '🏓');
  const memorySection = createPaginatedHistorySection(t('history.memory'), '/api/me/memory-games', '🃏');

  historyWrapper.appendChild(pongSection);
  historyWrapper.appendChild(memorySection);

  return historyWrapper;
}
