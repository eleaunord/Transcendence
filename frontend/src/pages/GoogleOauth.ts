import { t } from '../utils/translator';

export function createGoogleOauthPage(navigate: (path: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const title = document.createElement('h1');
  title.className = 'text-3xl font-bold';
  title.textContent = t('google.connecting');

  const spinner = document.createElement('div');
  spinner.className = 'mt-4 animate-spin rounded-full h-10 w-10 border-b-2 border-white';

  container.appendChild(title);
  container.appendChild(spinner);

  // get token from url
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  const error = urlParams.get('error'); // 1905 추가
  const is2FA = urlParams.get('is_2fa_enabled') === '1' || urlParams.get('is_2fa_enabled') === 'true';
  const seen2FA = urlParams.get('seen_2fa_prompt') === '1' || urlParams.get('seen_2fa_prompt') === 'true';

  //0519 추가!!
  if (error === 'access_denied') {
    // 사용자가 Google 로그인 취소했을 경우
    title.textContent = 'Google login was cancelled by the user.';
    spinner.style.display = 'none';

    setTimeout(() => {
      navigate('/'); // 첫 페이지로 되돌림
    }, 2000);
    return container;
  }
// 0519 추가 끝!!

  // 0527 추가: 이미 가입된 이메일인 경우 안내 
  if (error === 'oauth_failed') {
    title.textContent = 'This email is already registered.\nPlease log in using your password.';
    spinner.style.display = 'none';

    setTimeout(() => {
      navigate('/');
    }, 3000);
    return container;
  }

  if (token) {
    //1505 추가
    const id = urlParams.get('id');
    if (id) sessionStorage.setItem('userId', id);

    // store token and redirect
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
    if (email) sessionStorage.setItem('userEmail', email);  // email 저장

    sessionStorage.setItem('is_2fa_enabled', String(is2FA));
    sessionStorage.setItem('seen_2fa_prompt', String(seen2FA));
    

    setTimeout(() => {
      if (!seen2FA) {
        navigate('/2fa'); // 처음이면 2FA 활성화 여부 질문
      } else if (is2FA) {
        navigate('/2fa?mode=input'); // 이미 활성화되었으면 코드 입력
      } else {
        navigate('/profile-creation'); // 사용 안 한다면 프로필 설정
      }
    }, 1000);
  } else {
    title.textContent = t('google.error.noToken');
    spinner.style.display = 'none';
  }

  return container;
}
