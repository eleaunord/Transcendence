import { t } from '../utils/translator';

export function create2FAPage(
  navigate: (path: string) => void,
  mode: 'activation' | 'input' = 'activation'
): HTMLElement {
  console.log('[2FA PAGE] mode:', mode);

  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const form = document.createElement('form');
  form.id = '2FAForm';
  form.className = 'w-[450px] p-10 bg-gray-800 rounded-lg border-2 border-white text-center';
  container.appendChild(form);

  // ─── Title ─────────────────────────────────────────────────────────────
  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent =
    mode === 'activation' ? t('2fa.title_activation') : t('2fa.title_input');
  form.appendChild(title);

  // ─── ACTIVATION MODE ────────────────────────────────────────────────────
  if (mode === 'activation') {
    // grab token/email from URL ONCE
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    if (urlToken)  sessionStorage.setItem('token', urlToken);
    if (urlEmail)  sessionStorage.setItem('userEmail', urlEmail);

    // mark prompt seen
    const seenToken = urlToken || localStorage.getItem('token');
    if (seenToken) {
      fetch('/api/me/seen-2fa', {
        method: 'POST',
        headers: { Authorization: `Bearer ${seenToken}` },
      }).catch(() => console.warn('[2FApages.ts :2FA] failed to mark seen'));
    }

    // description
    const desc = document.createElement('p');
    desc.className = 'text-base mb-8';
    desc.textContent = t('2fa.description');
    form.appendChild(desc);

    // enable button
    const enableBtn = document.createElement('button');
    enableBtn.type = 'button';
    enableBtn.textContent = t('2fa.enable_button');
    enableBtn.className =
      'w-full py-2 mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';
    form.appendChild(enableBtn);

    // Track if request is in progress
    let isRequestInProgress = false;

    enableBtn.addEventListener('click', async () => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress) {
        console.log('[2FApages.ts :2FA] Request already in progress, ignoring click');
        return;
      }

      // Check if code was already sent (using consistent storage)
      if (sessionStorage.getItem('2fa_code_sent') === 'true') {
        console.log('[2FApages.ts :2FA] Code already sent, redirecting to input');
        navigate('/2fa?mode=input');
        return;
      }

      // Set flag immediately to prevent race conditions
      isRequestInProgress = true;
      enableBtn.disabled = true;
      enableBtn.textContent = t('2fa.sending') || 'Sending...'; // Show loading state

      // Get token consistently (prioritize sessionStorage, fallback to localStorage)
      const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!tok) {
        alert(t('2fa.token_missing'));
        enableBtn.disabled = false;
        enableBtn.textContent = t('2fa.enable_button');
        isRequestInProgress = false;
        return;
      }

      try {
        const res = await fetch('/api/enable-2fa', {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok}` },
        });

        if (!res.ok) {
          const err = await res.json();
          alert(
            t('auth.2fa_code_not_sent') +
              (err.error || t('auth.default_error'))
          );
          enableBtn.disabled = false;
          enableBtn.textContent = t('2fa.enable_button');
          isRequestInProgress = false;
          return;
        }

        // Mark it as sent ONLY after successful response
        sessionStorage.setItem('2fa_code_sent', 'true');
        alert(t('auth.2fa_code_sent'));
        navigate('/2fa?mode=input');
        
      } catch (error) {
        console.error('[2FApages.ts :2FA] Network error:', error);
        alert(t('auth.network_error') || 'Network error occurred');
        enableBtn.disabled = false;
        enableBtn.textContent = t('2fa.enable_button');
        isRequestInProgress = false;
      }
    });

    // skip button
    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.textContent = t('2fa.skip_button');
    skipBtn.className =
      'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
    skipBtn.addEventListener('click', () => navigate('/profile-creation'));
    form.appendChild(skipBtn);
  }

  // ─── INPUT MODE ─────────────────────────────────────────────────────────
  if (mode === 'input') {
    if (sessionStorage.getItem('2fa_verified') === 'true') {
    console.log('[2FA] Already verified, redirecting to profile');
    navigate('/profile-creation');
    return container;
  }

     // send a fresh code if we haven't already in this session
  const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (tok && !sessionStorage.getItem('2fa_code_sent')) {
    fetch('/api/enable-2fa', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}` },
    })
    .then(res => {
      if (!res.ok) throw new Error('2FA send failed');
      sessionStorage.setItem('2fa_code_sent','true');
      console.log('[2FApages.ts :2FA] new code sent on input page');
    })
    .catch(err => console.warn('[2FA] auto-send error:', err));
  }

    
    // just the input and verify, no auto-sends!
    const info = document.createElement('p');
    info.className = 'mb-4 text-sm text-gray-300';
    info.textContent = t('2fa.input_message');
    form.appendChild(info);

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 6;
    input.placeholder = t('2fa.input_placeholder');
    input.className = 'w-full mb-4 p-2 text-black rounded';
    form.appendChild(input);

    const verifyBtn = document.createElement('button');
    verifyBtn.type = 'button';
    verifyBtn.textContent = t('2fa.verify_button');
    verifyBtn.className =
      'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';
    form.appendChild(verifyBtn);

    // Replace the verify button event listener in your 2FA input mode with this:

verifyBtn.addEventListener('click', async () => {
  const code = input.value.trim();
  const tok = sessionStorage.getItem('token') || localStorage.getItem('token');

  if (!tok || !code) {
    alert(t('2fa.missing_info'));
    return;
  }

  try {
    const res = await fetch('/api/verify-2fa', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tok}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      alert(t(data.error) || t('auth.default_error'));
      return;
    }

    // ─── SUCCESS: Store the new fully-validated token ───────────────────
    console.log('[2FA] Verification successful, storing new token');
    localStorage.setItem('token', data.token);
    sessionStorage.setItem('token', data.token);
    
    sessionStorage.setItem('2fa_verified', 'true');
    // Clear 2FA session state
    sessionStorage.removeItem('2fa_code_sent');
    window.history.replaceState({}, '', '/profile-creation');
    console.log('[2FA] Redirect to profile page (history replaced)');
    navigate('/profile-creation');

    
    // Fetch and store user profile
    try {
      const meRes = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      
      if (meRes.ok) {
        const user = await meRes.json();
        localStorage.setItem('user', JSON.stringify(user));
        console.log('[2FApages.ts :2FA] User profile loaded and stored');
      }
    } catch (profileError) {
      console.warn('[2FApages.ts :2FA] Could not load profile after verification:', profileError);
    }

    alert(t('2fa.verified'));

    // Redirect to appropriate page
    navigate('/profile-creation');
    
  } catch (error) {
    console.error('[2FA] Verification error:', error);
    alert(t('auth.network_error') || 'Network error occurred');
  }
});

    // back to home
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'Back to home';
    back.className =
      'block w-full mt-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-lg';
    back.addEventListener('click', () => {
      sessionStorage.clear();
      sessionStorage.removeItem('2fa_verified'); //26
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.replace(window.location.origin + '/');
    });
    form.appendChild(back);
  }

  return container;
}