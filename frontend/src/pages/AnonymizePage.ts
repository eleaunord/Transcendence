// frontend/pages/AnonymizePage.ts
import { createSidebar } from "../utils/sidebar";
import { applyUserTheme } from "../utils/theme";

export function createAnonymizePage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  // 사이드바 추가
  const sidebar = createSidebar(navigate);
  sidebar.classList.add('z-40');
  container.appendChild(sidebar);

  // 배경 이미지 추가
  const backgroundImage = document.createElement('div');
  backgroundImage.id = 'backgroundImage'; 
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  container.appendChild(backgroundImage);
  applyUserTheme(backgroundImage); // 배경 테마 적용

  // 중앙 정렬 래퍼
  const centerWrapper = document.createElement('div');
  centerWrapper.className = `
    absolute inset-0 flex items-center justify-center z-30
  `.replace(/\s+/g, ' ').trim();

  // 익명화 섹션
  const section = document.createElement('div');
  section.className = `
    flex flex-col items-center justify-center gap-6
    bg-gray-800 bg-opacity-60 p-10 rounded-xl shadow-xl
    max-w-md w-full
  `.replace(/\s+/g, ' ').trim();

  const title = document.createElement('h1');
  title.textContent = 'Anonymize Your Account';
  title.className = 'text-2xl font-bold text-yellow-400';

  const description = document.createElement('p');
  description.textContent = '이 작업은 되돌릴 수 없습니다. 이메일, 비밀번호, Google ID 등 개인 정보는 삭제되며, 게임 기록만 익명으로 남습니다.';
  description.className = 'text-yellow-300 text-center';

  const confirm = document.createElement('p');
  confirm.textContent = '익명화를 진행하려면 "anonymous"라고 입력하세요.';
  confirm.className = 'text-white';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type anonymous to confirm';
  input.className = `
    p-2 rounded bg-gray-900 border border-gray-600 text-white text-center
    focus:outline-none focus:ring-2 focus:ring-yellow-500
  `.replace(/\s+/g, ' ').trim();

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'flex gap-4 mt-2';

  const anonymizeButton = document.createElement('button');
  anonymizeButton.textContent = 'Anonymize My Account';
  anonymizeButton.disabled = true;
  anonymizeButton.className = `
    p-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700
    disabled:opacity-50 disabled:cursor-not-allowed
  `.replace(/\s+/g, ' ').trim();

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = `
    p-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700
  `.replace(/\s+/g, ' ').trim();

  // 입력값 확인
  input.addEventListener('input', () => {
    anonymizeButton.disabled = input.value.trim().toLowerCase() !== 'anonymous';
  });

  anonymizeButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      const res = await fetch('/api/me/anonymize', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Your account has been anonymized. You will now be logged out.');
        sessionStorage.clear();
        localStorage.clear();
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Anonymization failed.');
      }
    } catch (err) {
      console.error('Anonymization error:', err);
      alert('Server error');
    }
  });

  cancelButton.addEventListener('click', () => {
    navigate('/user-profile');
  });

  // 구성 정리
  buttonGroup.appendChild(anonymizeButton);
  buttonGroup.appendChild(cancelButton);

  section.appendChild(title);
  section.appendChild(description);
  section.appendChild(confirm);
  section.appendChild(input);
  section.appendChild(buttonGroup);

  centerWrapper.appendChild(section);
  container.appendChild(centerWrapper);

  return container;
}
