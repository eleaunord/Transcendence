// export function create2FAPage(navigate: (path: string) => void): HTMLElement {
//   console.log('✅ Page 2FA chargée');

//   let error = '';

//   const container = document.createElement('div');
//   container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

//   const form = document.createElement('form');
//   form.id = '2FAForm';
//   form.className = 'w-[450px] p-10 bg-gray-800 rounded-lg border-2 border-white';

//   // Header
//   const usernameDiv = document.createElement('div');
//   usernameDiv.className = 'mb-4';
//   const usernameLabel = document.createElement('label');
//   usernameLabel.className = 'text-2xl font-bold mb-8 flex mt-4 mb-5 px-6 py-2 text-center';
//   usernameLabel.textContent = 'Vérification en deux étapes.';
//   usernameDiv.appendChild(usernameLabel);

//   // Subtext
//   const textDiv = document.createElement('div');
//   textDiv.className = 'mb-4';
//   const textLabel = document.createElement('label');
//   textLabel.className = 'block text-base mb-5 px-6 py-2 text-center';
//   textLabel.textContent = 'Protégez votre compte avec une couche de sécurité supplémentaire.';
//   textDiv.appendChild(textLabel);

//   // Buttons
//   const ActivationButton = document.createElement('button');
//   ActivationButton.type = 'button';
//   ActivationButton.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';
//   ActivationButton.textContent = '🔒 Activer la double authentification';

//   const laterContainer = document.createElement('div');
//   laterContainer.className = 'flex justify-center mt-4';

//   const laterButton = document.createElement('button');
//   laterButton.type = 'button';
//   laterButton.className = 'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
//   laterButton.textContent = 'Plus tard';
//   laterButton.addEventListener('click', () => navigate('/'));

//   ActivationButton.addEventListener('click', () => {
//     alert('Fonction 2FA à venir');
//   });

//   laterContainer.appendChild(laterButton);

//   const errorMessage = document.createElement('p');
//   errorMessage.className = 'mt-4 text-red-500';
//   errorMessage.style.display = 'none';

//   const updateError = () => {
//     if (error) {
//       errorMessage.textContent = error;
//       errorMessage.style.display = 'block';
//     } else {
//       errorMessage.textContent = '';
//       errorMessage.style.display = 'none';
//     }
//   };

//   form.appendChild(usernameDiv);
//   form.appendChild(textDiv);
//   form.appendChild(ActivationButton);
//   form.appendChild(laterContainer);
//   form.appendChild(errorMessage);
//   container.appendChild(form);

//   return container;
// }



// import { IS_DEV_MODE } from '../config';

// export function create2FAPage(navigate: (path: string) => void): HTMLElement {
//   let error = '';


//   const container = document.createElement('div');
//   container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

//   const form = document.createElement('form');
//   form.id = '2FAForm';
//   form.className = 'w-[450px] p-10 bg-gray-800 rounded-lg border-2 border-white';

//   // Verification a deux etapes
//   const usernameDiv = document.createElement('div');
//   usernameDiv.className = 'mb-4';
//   const usernameLabel = document.createElement('label');
//   usernameLabel.htmlFor = '2Fa';
//   usernameLabel.className = ' text-2xl font-bold mb-8 flex mt-4 mb-5 px-6 py-2  text-center';
//   usernameLabel.textContent = 'Two-Factor Verification.';
  

//   const textDiv = document.createElement('div');
//   textDiv.className = 'mb-4';
//   const textLabel = document.createElement('label');
//   textLabel.htmlFor = '2Fa';
//   textLabel.className = 'block text-base  mb-5 px-6 py-2 text-center';
//   textLabel.textContent = 'Protect your account with an extra layer of security.';

//   usernameDiv.appendChild(usernameLabel);
// //   usernameDiv.appendChild(usernameInput);

// // Bouton Activation (plein largeur)
// const ActivationButton = document.createElement('button');
// ActivationButton.type = 'button';
// ActivationButton.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg';
// ActivationButton.textContent = '🔒 Enable Two-Factor Authentication';

// // Conteneur pour centrer le bouton "Later"
// const laterContainer = document.createElement('div');
// laterContainer.className = 'flex justify-center mt-4';

// // Bouton "Later" (centré avec largeur auto)
// const laterButton = document.createElement('button');
// laterButton.type = 'button';
// laterButton.className = 'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
// laterButton.textContent = 'Later';

// laterContainer.appendChild(laterButton);

//   //button.addEventListener('click', handleLogin);
//   // Error Message
//   const errorMessage = document.createElement('p');
//   errorMessage.className = 'mt-4 text-red-500';
//   errorMessage.style.display = 'none';

//   const updateError = () => {
//     if (error) {
//       errorMessage.textContent = error;
//       errorMessage.style.display = 'block';
//     } else {
//       errorMessage.textContent = '';
//       errorMessage.style.display = 'none';
//     }
//   };

//   // Assemble form
// form.appendChild(usernameDiv);
// form.appendChild(textLabel);
// form.appendChild(ActivationButton);
// form.appendChild(laterContainer);

// form.appendChild(errorMessage);

// container.appendChild(form);

//   return container;
// }


export function create2FAPage(navigate: (path: string) => void): HTMLElement {
  let error = '';

  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center h-screen bg-gray-900 text-white';

  const form = document.createElement('form');
  form.id = '2FAForm';
  form.className = 'w-[450px] p-10 bg-gray-800 rounded-lg border-2 border-white text-center';

  // Titre
  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent = 'Two-Factor Verification.';

  // Description
  const description = document.createElement('p');
  description.className = 'text-base mb-8';
  description.textContent = 'Protect your account with an extra layer of security.';

  // Bouton d'activation
  const activationButton = document.createElement('button');
  activationButton.type = 'button';
  activationButton.className = 'w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg mb-4';
  activationButton.textContent = '🔒 Enable Two-Factor Authentication';

  // Bouton "Later"
  const laterButton = document.createElement('button');
  laterButton.type = 'button';
  laterButton.className = 'px-6 py-2 bg-gray-700 hover:bg-red-700 text-white font-semibold rounded-lg';
  laterButton.textContent = 'Later';

  // Message d'erreur
  const errorMessage = document.createElement('p');
  errorMessage.className = 'mt-4 text-red-500';
  errorMessage.style.display = 'none';

  const updateError = () => {
    if (error) {
      errorMessage.textContent = error;
      errorMessage.style.display = 'block';
    } else {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }
  };

  form.appendChild(title);
  form.appendChild(description);
  form.appendChild(activationButton);
  form.appendChild(laterButton);
  form.appendChild(errorMessage);

  container.appendChild(form);

  return container;
}
