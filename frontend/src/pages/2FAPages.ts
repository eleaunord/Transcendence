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
	title.textContent = mode === 'activation' ? 'Two-Factor Verification' : 'Enter 2FA Code';
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
		fetch('http://localhost:3001/api/me/seen-2fa', {
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
	  description.textContent = 'Protect your account with an extra layer of security.';
	  form.appendChild(description);
  
	  const activateBtn = document.createElement('button');
	  activateBtn.type = 'button';
	  activateBtn.textContent = '🔒 Enable Two-Factor Authentication';
	  activateBtn.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg mb-4';
  
	  activateBtn.onclick = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
		  alert('Token not found');
		  return;
		}
  
		const res = await fetch('http://localhost:3001/api/enable-2fa', {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
  
		if (!res.ok) {
		  const err = await res.json();
		  alert('Failed to send 2FA code: ' + (err.error || 'unknown error'));
		  return;
		}
  
		alert('A 2FA code has been sent to your email.');
		navigate('/2fa?mode=input');
	  };
  
	  const skipBtn = document.createElement('button');
	  skipBtn.type = 'button';
	  skipBtn.textContent = 'Later';
	  skipBtn.className = 'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
	  skipBtn.onclick = () => navigate('/profile-creation');
  
	  form.appendChild(activateBtn);
	  form.appendChild(skipBtn);
	}
  
	if (mode === 'input') {
	  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
	//   const email = sessionStorage.getItem('userEmail');

	  if (token) {
		fetch('http://localhost:3001/api/enable-2fa', {
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
	
	  // msg 출력 부분
	  const infoMessage = document.createElement('p');
	  infoMessage.className = 'mb-4 text-sm text-gray-300';
	  infoMessage.textContent = 'A verification code has been sent to your email address. Please enter it below.';
	  form.appendChild(infoMessage);

	  const input = document.createElement('input');
	  input.placeholder = '6-digit code';
	  input.className = 'w-full mb-4 p-2 text-black rounded';
	  input.maxLength = 6;
  
	  const verifyBtn = document.createElement('button');
	  verifyBtn.type = 'button';
	  verifyBtn.textContent = 'Verify';
	  verifyBtn.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';
  
	  verifyBtn.onclick = async () => {
		const code = input.value;
		if (!token || !code) {
		  alert('Missing info');
		  return;
		}
  
		const res = await fetch('http://localhost:3001/api/verify-2fa', {
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
		  alert('2FA Verified!');
		  navigate('/profile-creation');
		} else {
		  alert(data.error || 'Verification failed');
		}
	  };
  
	  form.appendChild(input);
	  form.appendChild(verifyBtn);
	}
  
	container.appendChild(form);
	return container;
  }
  
