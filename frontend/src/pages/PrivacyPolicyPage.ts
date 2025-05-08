export function createPrivacyPolicyPage(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'p-8 bg-gray-900 text-white h-full overflow-auto';
  
    container.innerHTML = `
      <h1 class="text-3xl font-bold mb-4">Politique de confidentialité</h1>
      <p class="mb-4">Cette politique de confidentialité est établie dans le cadre de notre engagement à respecter le RGPD.</p>
  
      <h2 class="text-2xl font-semibold mt-4">1. Responsable du traitement des données</h2>
      <p>Transcendance est responsable du traitement de vos données personnelles. Vous pouvez nous contacter à : haneulpong42@gmail.com.</p>
  
      <h2 class="text-2xl font-semibold mt-4">2. Données personnelles collectées</h2>
      <ul class="list-disc list-inside ml-4">
        <li>Nom d'utilisateur</li>
        <li>Adresse email</li>
        <li>Identifiant Google (lors d'une connexion via Google OAuth)</li>
        <li>Image de profil (facultative)</li>
        <li>Mot de passe sous forme hachée</li>
        <li>Activation et codes temporaires d'authentification à deux facteurs (2FA)</li>
      </ul>
      <p class="mt-2">Nous ne collectons pas d'adresse IP, cookies, ou informations techniques similaires.</p>
  
      <h2 class="text-2xl font-semibold mt-4">3. Finalité du traitement</h2>
      <p>Gestion du compte, authentification sécurisée, amélioration du service, communication avec les utilisateurs, statistiques anonymisées.</p>
  
      <h2 class="text-2xl font-semibold mt-4">4. Durée de conservation des données</h2>
      <p>Conservées tant que le compte est actif, suppression sous 30 jours après suppression du compte.</p>
  
      <h2 class="text-2xl font-semibold mt-4">5. Vos droits</h2>
      <p>Droit d'accès, rectification, suppression, opposition, limitation, portabilité, retrait du consentement. Contactez-nous : haneulpong42@gmail.com.</p>
  
      <h2 class="text-2xl font-semibold mt-4">6. Sécurité</h2>
      <p>Mesures techniques et organisationnelles strictes, mots de passe chiffrés.</p>
  
      <h2 class="text-2xl font-semibold mt-4">8. Réclamations</h2>
      <p>Commission Nationale de l’Informatique et des Libertés (CNIL): <a href="https://www.cnil.fr" class="underline">www.cnil.fr</a></p>
    `;
  
    return container;
  }
  