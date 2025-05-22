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
  
	const title = document.createElement('h2');
	title.className = 'text-2xl font-bold mb-4';
	title.textContent = mode === 'activation' ? t('2fa.title_activation') : t('2fa.title_input');
	form.appendChild(title);
  
	if (mode === 'activation') {
	  const urlParams = new URLSearchParams(window.location.search);
	  const token = urlParams.get('token');
	  const email = urlParams.get('email');
  
	  if (token) sessionStorage.setItem('token', token);
	  if (email) sessionStorage.setItem('userEmail', email);
  
	  // seen_2fa_prompt 업데이트 (await 제거)
	  const finalToken = token || localStorage.getItem('token');
	  if (finalToken) {
		fetch('/api/me/seen-2fa', {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${finalToken}`,
		  },
		})
		  .then(() => {
			console.log('[2FA] seen_2fa_prompt successfully updated');
		  })
		  .catch((err) => {
			console.warn('[2FA] Failed to update seen_2fa_prompt:', err);
		  });
	  }
  
	  const description = document.createElement('p');
	  description.className = 'text-base mb-8';
	  description.textContent = t('2fa.description');
	  form.appendChild(description);
  
	  const activateBtn = document.createElement('button');
	  activateBtn.type = 'button';
	  activateBtn.textContent = t('2fa.enable_button');
	  activateBtn.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg mb-4';
  
	  activateBtn.onclick = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
		  alert(t('2fa.token_missing'));
		  return;
		}
  
		const res = await fetch('/api/enable-2fa', {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
  
		if (!res.ok) {
		  const err = await res.json();
		  alert(t('auth.2fa_code_not_sent') + (err.error || t('auth.default_error')));
		  return;
		}
  
		alert(t('auth.2fa_code_sent'));
		navigate('/2fa?mode=input');
	  };
  
	  const skipBtn = document.createElement('button');
	  skipBtn.type = 'button';
	  skipBtn.textContent = t('2fa.skip_button');
	  skipBtn.className = 'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
	  skipBtn.onclick = () => navigate('/profile-creation');
  
	  form.appendChild(activateBtn);
	  form.appendChild(skipBtn);
	}
  
if (mode === 'input') {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  if (token) {
    fetch('/api/enable-2fa', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to send 2FA code');
      console.log('[2FA] Code sent automatically for verification');
    })
    .catch((err) => {
      console.warn('[2FA] Auto-send error:', err);
    });
  }

  const infoMessage = document.createElement('p');
  infoMessage.className = 'mb-4 text-sm text-gray-300';
  infoMessage.textContent = t('2fa.input_message');
  form.appendChild(infoMessage);

  const input = document.createElement('input');
  input.placeholder = t('2fa.input_placeholder');
  input.className = 'w-full mb-4 p-2 text-black rounded';
  input.maxLength = 6;

  const verifyBtn = document.createElement('button');
  verifyBtn.type = 'button';
  verifyBtn.textContent = t('2fa.verify_button');
  verifyBtn.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';

  verifyBtn.onclick = async () => {
    const code = input.value;
    if (!token || !code) {
      alert(t('2fa.missing_info'));
      return;
    }

    const res = await fetch('/api/verify-2fa', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (res.ok) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('2fa_verified', 'true');
      alert(t('2fa.verified'));
      navigate('/profile-creation');
    } else {
      alert(t(data.error) || t('auth.default_error'));
    }
  };

  form.appendChild(input);
  form.appendChild(verifyBtn);

  // ⬇️ Your new "Back to home" button
  const backToHomeBtn = document.createElement('button');
  backToHomeBtn.type = 'button';
  backToHomeBtn.textContent = 'Back to home';
  //backToHomeBtn.className = 'w-full mt-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-lg';
  backToHomeBtn.className = 'block w-full mt-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-lg';

backToHomeBtn.onclick = () => {
  navigate('/');
};

	
// 	backToHomeBtn.onclick = () => {
//     window.location.href = 'https://localhost:8443/';
//   };

  form.appendChild(backToHomeBtn);
}

  
	container.appendChild(form);
	return container;
  }
  
