import { setLanguage, t } from "../utils/translator";
import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";

export function createExportDataPage(navigate: (path: string) => void): HTMLElement {
  
  // 전체 페이지 컨테이너 생성
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  //왼쪽 사이드바 추가
  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40');
  container.appendChild(sidebar);

  // 배경 이미지 설정
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage';
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';

  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage);


  //콘텐츠 섹션(제목, 설명, 버튼 포함)
  const exportSection = document.createElement('div');
  exportSection.className = 'relative mt-24 flex flex-col items-center z-30';

  //페이지 제목
  const title = document.createElement('h2');
  title.textContent = t('settings.export.button');
  title.className = 'text-4xl font-bold mb-8 text-white';
  exportSection.appendChild(title);

  //데이터 카드 박스
  const card = document.createElement('div');
  card.className = 'bg-gray-700/80 backdrop-blur-md p-8 rounded-lg shadow-lg w-[28rem] text-center';

  //설명 문구
  const description = document.createElement('p');
  description.textContent = t('settings.export.description');
  description.className = 'mb-6 text-white';
  card.appendChild(description);

  //내보내기 버튼 생성
  const exportButton = document.createElement('button');
  exportButton.textContent = t('settings.export.button');;
  exportButton.className = 'bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded transition duration-300';

  //버튼 클릭 시: API 호출 후 JSON 다운로드
  exportButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('auth.must_be_logged_in'));
      return;
    }

    try {
      const res = await fetch('/api/me/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert(t('error.download_failed'));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mes-donnees.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(t('error.export_failed'));
    }
  });

  card.appendChild(exportButton);
  exportSection.appendChild(card);
  container.appendChild(exportSection);

  // // Sidebar hover logic (identique à Leaderboard)
  // sidebar.addEventListener('mouseenter', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.remove('opacity-0');
  //     (label as HTMLElement).classList.add('opacity-100');
  //   });
  //   const backgroundImage = document.getElementById('backgroundImage');
  //   if (backgroundImage) {
  //     backgroundImage.className = 'absolute top-0 left-64 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';
  //   }
  // });

  // sidebar.addEventListener('mouseleave', () => {
  //   document.querySelectorAll('.sidebar-label').forEach(label => {
  //     (label as HTMLElement).classList.add('opacity-0');
  //     (label as HTMLElement).classList.remove('opacity-100');
  //   });
  //   const backgroundImage = document.getElementById('backgroundImage');
  //   if (backgroundImage) {
  //     backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300 z-10';
  //   }
  // });

  return container;
}
