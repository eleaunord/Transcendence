import { createSidebar } from "../utils/sidebar";

export function createDeleteAccountPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

  // 사이드바 그대로 유지
  const sidebar = createSidebar(navigate);
  container.appendChild(sidebar);

  // 배경 이미지 그대로 유지
  const backgroundImage = document.createElement('div');
  backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';
  backgroundImage.style.backgroundImage = 'url(/assets/profile-themes/arabesque.png)';
  container.appendChild(backgroundImage);

  // 중앙 정렬 래퍼 (섹션을 정중앙에 배치)
  const centerWrapper = document.createElement('div');
  centerWrapper.className = `
    absolute inset-0 flex items-center justify-center z-30
  `.replace(/\s+/g, ' ').trim();

  // 삭제 확인 섹션
  const section = document.createElement('div');
  section.className = `
    flex flex-col items-center justify-center gap-6
    bg-gray-800 bg-opacity-60 p-10 rounded-xl shadow-xl
    max-w-md w-full
  `.replace(/\s+/g, ' ').trim();

  const title = document.createElement('h1');
  title.textContent = 'Delete Your Account';
  title.className = 'text-2xl font-bold text-red-400';

  const warning = document.createElement('p');
  warning.textContent = 'This action is irreversible. All your data will be permanently deleted.';
  warning.className = 'text-yellow-300 text-center';

  const prompt = document.createElement('p');
  prompt.textContent = 'To confirm, type "42" below:';
  prompt.className = 'text-white';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type 42 to confirm';
  input.className = `
    p-2 rounded bg-gray-900 border border-gray-600 text-white text-center
    focus:outline-none focus:ring-2 focus:ring-red-500
  `.replace(/\s+/g, ' ').trim();

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'flex gap-4 mt-2';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete My Account';
  deleteButton.disabled = true;
  deleteButton.className = `
    p-2 px-4 bg-red-700 text-white rounded hover:bg-red-800
    disabled:opacity-50 disabled:cursor-not-allowed
  `.replace(/\s+/g, ' ').trim();

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = `
    p-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700
  `.replace(/\s+/g, ' ').trim();

  // 입력값 확인
  input.addEventListener('input', () => {
    deleteButton.disabled = input.value.trim() !== '42';
  });

  // 삭제 요청 처리
  deleteButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      const res = await fetch('/api/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Your account and all associated data have been permanently deleted. This action cannot be undone.');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Server error');
    }
  });

  cancelButton.addEventListener('click', () => {
    navigate('/user-profile');
  });

  // 섹션 구성
  buttonGroup.appendChild(deleteButton);
  buttonGroup.appendChild(cancelButton);

  section.appendChild(title);
  section.appendChild(warning);
  section.appendChild(prompt);
  section.appendChild(input);
  section.appendChild(buttonGroup);

  // 중앙 정렬로 섹션 감싸서 container에 추가
  centerWrapper.appendChild(section);
  container.appendChild(centerWrapper);

  return container;
}
