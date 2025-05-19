import { t, getLanguage } from '../utils/translator';

export function createPrivacyPolicyPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-8 bg-gray-900 text-white h-full overflow-auto';

  const listItems = t('privacy.2.items')  as unknown as string[];

  container.innerHTML = `
    <h1 class="text-3xl font-bold mb-4" data-i18n="privacy.title">${t('privacy.title')}</h1>
    <p class="mb-4" data-i18n="privacy.intro">${t('privacy.intro')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.1.title">${t('privacy.1.title')}</h2>
    <p data-i18n="privacy.1.content">${t('privacy.1.content')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.2.title">${t('privacy.2.title')}</h2>
    <ul class="list-disc list-inside ml-4">
      ${listItems.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <p class="mt-2" data-i18n="privacy.2.note">${t('privacy.2.note')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.3.title">${t('privacy.3.title')}</h2>
    <p data-i18n="privacy.3.content">${t('privacy.3.content')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.4.title">${t('privacy.4.title')}</h2>
    <p data-i18n="privacy.4.content">${t('privacy.4.content')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.5.title">${t('privacy.5.title')}</h2>
    <p data-i18n="privacy.5.content">${t('privacy.5.content')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.6.title">${t('privacy.6.title')}</h2>
    <p data-i18n="privacy.6.content">${t('privacy.6.content')}</p>

    <h2 class="text-2xl font-semibold mt-4" data-i18n="privacy.8.title">${t('privacy.8.title')}</h2>
    <p>${t('privacy.8.content')} <a href="https://www.cnil.fr" class="underline">www.cnil.fr</a></p>
  `;

  return container;
}
