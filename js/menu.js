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