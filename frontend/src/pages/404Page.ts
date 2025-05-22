
export function renderNotFoundPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative min-h-screen flex flex-col items-center text-center justify-center';
    const title = document.createElement('p');
    title.className = 'text-9xl font-bold text-yellow-600 mb-1';
    title.textContent = '404';
    const blackhole = document.createElement('h1');
    blackhole.className = 'text-3xl font-bold text-white mb-1';
    blackhole.textContent = 'Don\'t panic !';

    const blackhole1 = document.createElement('h1');
    blackhole1.className = 'text-1xl font-bold text-orange-600 mb-1';
    blackhole1.textContent = 'You\'re not in the Black Hole... but this page is ...';

    const backLink = document.createElement('a');
    backLink.href = '/';
    backLink.className = 'text-orange-500 hover:underline';
    backLink.textContent = 'Back to the homepage';   

    const background = document.createElement('div');
    background.className = 'absolute inset-0 bg-cover bg-center';
    background.style.backgroundImage = 'url("/assets/background/blackhole4.jpg")'; 
    background.style.zIndex = '-1';
    
    container.appendChild(title);
    container.appendChild(blackhole);
    container.appendChild(blackhole1);
    container.appendChild(backLink);
    container.appendChild(background);
  return container;
}
