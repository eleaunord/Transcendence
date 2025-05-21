export function createSettingsPanel(navigate: (path: string) => void): HTMLElement {
  const settingsSection = document.createElement('div');
  settingsSection.className = `
    relative mt-7
    w-full max-w-5xl mx-auto px-4
  `.replace(/\s+/g, ' ').trim();

  const settingsContainer = document.createElement('div');
  settingsContainer.className = `
    bg-white/10 backdrop-blur-md
    rounded-2xl shadow-2xl
    transform transition-all duration-300
    hover:scale-105 hover:shadow-3xl
    px-6 pt-6 pb-10 min-h-[200px] w-full max-w-5xl
  `.replace(/\s+/g, ' ').trim();

  const settingsTitle = document.createElement('h3');
  settingsTitle.textContent = 'Settings';
  settingsTitle.className = 'text-xl font-semibold mb-4';
  settingsContainer.appendChild(settingsTitle);

  const buttonsRow = document.createElement('div');
  buttonsRow.className = `
    flex flex-row justify-between items-start
    w-full
  `.replace(/\s+/g, ' ').trim();

  const commonButtonClass = `
    w-48 py-2 px-4 rounded-lg text-white font-semibold
    transition-colors duration-300 text-center
  `.replace(/\s+/g, ' ').trim();

  // === 2FA Button ===
  const twoFAContainer = document.createElement('div');
  twoFAContainer.className = 'flex flex-col items-center text-center w-56';

  const twoFAButton = document.createElement('button');
  twoFAButton.id = 'toggle2FAButton';
  twoFAButton.textContent = 'OFF';
  twoFAButton.className = `${commonButtonClass} bg-red-400 hover:bg-red-500`;

  const twoFADescription = document.createElement('p');
  twoFADescription.className = 'mt-2 text-sm text-gray-300 italic';
  twoFADescription.textContent = 'Clicking 2FA ON/OFF will enable or disable two-factor authentication.';

  twoFAButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated.');

    twoFAButton.disabled = true;

    try {
      const isCurrentlyEnabled = twoFAButton.textContent === 'ON';
      const newValue = !isCurrentlyEnabled;

      const res = await fetch('/api/me/2fa', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enable: newValue })
      });

      if (!res.ok) throw new Error('Failed to toggle 2FA');

      const result = await res.json();

      if (result.is_2fa_enabled) {
        twoFAButton.textContent = 'ON';
        twoFAButton.className = twoFAButton.className.replace('bg-red-400 hover:bg-red-500', 'bg-green-400 hover:bg-green-500');
      } else {
        twoFAButton.textContent = 'OFF';
        twoFAButton.className = twoFAButton.className.replace('bg-green-400 hover:bg-green-500', 'bg-red-400 hover:bg-red-500');
      }
    } catch (err) {
      console.error('2FA toggle error:', err);
      alert('Error toggling 2FA');
    } finally {
      twoFAButton.disabled = false;
    }
  });

  twoFAContainer.appendChild(twoFAButton);
  twoFAContainer.appendChild(twoFADescription);

  // === Export Data ===
  const exportContainer = document.createElement('div');
  exportContainer.className = 'flex flex-col items-center text-center w-56';

  const exportDataButton = document.createElement('button');
  exportDataButton.textContent = 'Export my data';
  exportDataButton.className = `${commonButtonClass} bg-purple-500 hover:bg-purple-600`;

  const exportDescription = document.createElement('p');
  exportDescription.className = 'mt-2 text-sm text-gray-300 italic';
  exportDescription.textContent = 'Clicking Export my data will download a copy of your account information.';

  exportDataButton.addEventListener('click', () => {
    navigate('/export-data');
  });

  exportContainer.appendChild(exportDataButton);
  exportContainer.appendChild(exportDescription);

  // === Anonymize ===
  const anonymizeContainer = document.createElement('div');
  anonymizeContainer.className = 'flex flex-col items-center text-center w-56';

  const anonymizeButton = document.createElement('button');
  anonymizeButton.textContent = 'Anonymize my account';
  anonymizeButton.className = `${commonButtonClass} bg-yellow-500 hover:bg-yellow-600`;

  const anonymizeDescription = document.createElement('p');
  anonymizeDescription.className = 'mt-2 text-sm text-gray-300 italic';
  anonymizeDescription.textContent = "Click here to anonymize your account — you'll appear as anonymous_something on the leaderboard instead of your username.";

  anonymizeButton.addEventListener('click', () => {
    navigate('/anonymize');
  });

  anonymizeContainer.appendChild(anonymizeButton);
  anonymizeContainer.appendChild(anonymizeDescription);

  // === Delete ===
  const deleteContainer = document.createElement('div');
  deleteContainer.className = 'flex flex-col items-center text-center w-56';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete account';
  deleteButton.className = `${commonButtonClass} bg-red-600 hover:bg-red-700`;

  const deleteDescription = document.createElement('p');
  deleteDescription.className = 'mt-2 text-sm text-gray-300 italic';
  deleteDescription.textContent = 'Clicking Delete my account will permanently remove your account.';

  deleteButton.addEventListener('click', () => {
    navigate('/delete-account');
  });

  deleteContainer.appendChild(deleteButton);
  deleteContainer.appendChild(deleteDescription);

  // === Assemble settings section ===
  buttonsRow.appendChild(twoFAContainer);
  buttonsRow.appendChild(exportContainer);
  buttonsRow.appendChild(anonymizeContainer);
  buttonsRow.appendChild(deleteContainer);

  settingsContainer.appendChild(buttonsRow);
  settingsSection.appendChild(settingsContainer);

  return settingsSection;
}

