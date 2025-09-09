// Script pour le bouton flottant Retour à l'accueil
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('floatingBackButton');
  
  // Si le bouton flottant n'existe pas, on ne fait rien
  if (!backButton) {
    console.log("Bouton flottant non trouvé");
    return;
  }
  
  let scrollTimeout;
  const scrollThreshold = 100; // Seuil de défilement en pixels
  
  window.addEventListener('scroll', function() {
    // Cacher le bouton pendant le défilement
    backButton.classList.remove('visible');
    
    // Effacer le timeout précédent
    clearTimeout(scrollTimeout);
    
    // Définir un nouveau timeout pour afficher le bouton après l'arrêt du défilement
    scrollTimeout = setTimeout(function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > scrollThreshold) {
        backButton.classList.add('visible');
      } else {
        backButton.classList.remove('visible');
      }
    }, 500); // Délai de 500ms après l'arrêt du défilement
  });
  
  // Afficher le bouton au chargement si on est déjà en bas de page
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > scrollThreshold) {
    backButton.classList.add('visible');
  }
});

// Script pour les autres fonctionnalités de votre site
// Script pour le bouton flottant Retour à l'accueil
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('floatingBackButton');
  
  // Si le bouton flottant n'existe pas, on ne fait rien
  if (!backButton) {
    console.log("Bouton flottant non trouvé");
    return;
  }
  
  let scrollTimeout;
  const scrollThreshold = 100; // Seuil de défilement en pixels
  
  window.addEventListener('scroll', function() {
    // Cacher le bouton pendant le défilement
    backButton.classList.remove('visible');
    
    // Effacer le timeout précédent
    clearTimeout(scrollTimeout);
    
    // Définir un nouveau timeout pour afficher le bouton après l'arrêt du défilement
    scrollTimeout = setTimeout(function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > scrollThreshold) {
        backButton.classList.add('visible');
      } else {
        backButton.classList.remove('visible');
      }
    }, 500); // Délai de 500ms après l'arrêt du défilement
  });
  
  // Afficher le bouton au chargement si on est déjà en bas de page
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > scrollThreshold) {
    backButton.classList.add('visible');
  }
});

// Gestion des menus déroulants
document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.menu-item');
  const dropdownPanels = document.querySelectorAll('.dropdown-panel');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      const section = this.getAttribute('data-section');
      
      // Fermer tous les panneaux
      dropdownPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Ouvrir le panneau correspondant
      const targetPanel = document.getElementById(`${section}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      // Mettre à jour l'état actif du menu
      menuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
  
  // Fermer les panneaux en cliquant à l'extérieur
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.menu-item') && !event.target.closest('.dropdown-panel')) {
      dropdownPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      menuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
      });
    }
  });
});