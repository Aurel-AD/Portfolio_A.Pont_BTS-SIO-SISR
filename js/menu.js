// menu.js - Version optimisée
class MenuManager {
  constructor() {
    this.menuItems = [];
    this.dropdownPanels = [];
    this.activePanel = null;
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    try {
      this.initializeElements();
      this.setupEventListeners();
      this.setupKeyboardNavigation();
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation du menu:', error);
    }
  }

  initializeElements() {
    this.menuItems = Array.from(document.querySelectorAll('.menu-item'));
    this.dropdownPanels = Array.from(document.querySelectorAll('.dropdown-panel'));
    
    if (this.menuItems.length === 0) {
      console.warn('Aucun élément de menu trouvé (.menu-item)');
    }
    
    if (this.dropdownPanels.length === 0) {
      console.warn('Aucun panneau dropdown trouvé (.dropdown-panel)');
    }

    // Initialisation ARIA pour l'accessibilité
    this.setupAccessibility();
  }

  setupAccessibility() {
    this.menuItems.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('aria-expanded', 'false');
      item.setAttribute('aria-haspopup', 'true');
      item.setAttribute('tabindex', '0');
      item.setAttribute('id', `menu-item-${index}`);
      
      const section = item.getAttribute('data-section');
      if (section) {
        const panel = document.getElementById(`${section}-panel`);
        if (panel) {
          panel.setAttribute('role', 'region');
          panel.setAttribute('aria-labelledby', `menu-item-${index}`);
          panel.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  setupEventListeners() {
    // Événements sur les éléments de menu
    this.menuItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleMenuClick(e, item));
      
      // Gestion du hover avec debounce
      let hoverTimeout;
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          if (!this.isAnimating) {
            this.previewPanel(item);
          }
        }, 200);
      });
      
      item.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });
    });

    // Fermeture en cliquant à l'extérieur
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Fermeture avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPanels();
      }
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', this.debounce(() => {
      this.adjustPanelPositions();
    }, 250));
  }

  setupKeyboardNavigation() {
    this.menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.handleMenuClick(e, item);
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            this.focusNextItem(index);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            this.focusPreviousItem(index);
            break;
          case 'Home':
            e.preventDefault();
            this.focusFirstItem();
            break;
          case 'End':
            e.preventDefault();
            this.focusLastItem();
            break;
        }
      });
    });
  }

  handleMenuClick(e, item) {
    e.stopPropagation();
    
    if (this.isAnimating) return;
    
    const section = item.getAttribute('data-section');
    if (!section) return;

    const targetPanel = document.getElementById(`${section}-panel`);
    if (!targetPanel) {
      console.warn(`Panneau ${section}-panel non trouvé`);
      return;
    }

    // Si le panneau est déjà actif, le fermer
    if (this.activePanel === targetPanel && targetPanel.classList.contains('active')) {
      this.closePanel(targetPanel, item);
    } else {
      this.openPanel(targetPanel, item);
    }
  }

  async openPanel(panel, menuItem) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    try {
      // Fermer le panneau actif s'il existe
      if (this.activePanel && this.activePanel !== panel) {
        await this.closePanel(this.activePanel, this.getActiveMenuItem());
      }

      // Ouvrir le nouveau panneau
      this.setActiveMenuItem(menuItem);
      this.activePanel = panel;
      
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
      menuItem.setAttribute('aria-expanded', 'true');
      
      // Animation d'entrée
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-20px)';
      
      // Force reflow
      panel.offsetHeight;
      
      panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
      
      // Ajuster la position si nécessaire
      this.adjustPanelPosition(panel);
      
      // Focus sur le premier élément focusable du panneau
      this.focusFirstInPanel(panel);

    } catch (error) {
      console.warn('Erreur lors de l\'ouverture du panneau:', error);
    } finally {
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    }
  }

  async closePanel(panel, menuItem) {
    if (!panel || this.isAnimating) return;
    this.isAnimating = true;

    try {
      // Animation de sortie
      panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-10px)';
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
      
      if (menuItem) {
        menuItem.classList.remove('active');
        menuItem.setAttribute('aria-expanded', 'false');
      }
      
      if (this.activePanel === panel) {
        this.activePanel = null;
      }

    } catch (error) {
      console.warn('Erreur lors de la fermeture du panneau:', error);
    } finally {
      setTimeout(() => {
        this.isAnimating = false;
      }, 50);
    }
  }

  closeAllPanels() {
    if (this.isAnimating) return;
    
    this.dropdownPanels.forEach(panel => {
      if (panel.classList.contains('active')) {
        const menuItem = this.getMenuItemForPanel(panel);
        this.closePanel(panel, menuItem);
      }
    });
    
    this.menuItems.forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-expanded', 'false');
    });
    
    this.activePanel = null;
  }

  previewPanel(item) {
    // Effet de prévisualisation subtil au survol
    const section = item.getAttribute('data-section');
    const panel = document.getElementById(`${section}-panel`);
    
    if (panel && !panel.classList.contains('active')) {
      item.style.transform = 'scale(1.05)';
      item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      
      setTimeout(() => {
        if (!item.classList.contains('active')) {
          item.style.transform = '';
          item.style.boxShadow = '';
        }
      }, 2000);
    }
  }

  handleOutsideClick(event) {
    const isMenuClick = event.target.closest('.menu-item');
    const isPanelClick = event.target.closest('.dropdown-panel');
    
    if (!isMenuClick && !isPanelClick) {
      this.closeAllPanels();
    }
  }

  // Navigation au clavier
  focusNextItem(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.menuItems.length;
    this.menuItems[nextIndex].focus();
  }

  focusPreviousItem(currentIndex) {
    const prevIndex = currentIndex === 0 ? this.menuItems.length - 1 : currentIndex - 1;
    this.menuItems[prevIndex].focus();
  }

  focusFirstItem() {
    if (this.menuItems.length > 0) {
      this.menuItems[0].focus();
    }
  }

  focusLastItem() {
    if (this.menuItems.length > 0) {
      this.menuItems[this.menuItems.length - 1].focus();
    }
  }

  focusFirstInPanel(panel) {
    const focusableElements = panel.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  // Utilitaires
  setActiveMenuItem(menuItem) {
    this.menuItems.forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-expanded', 'false');
    });
    
    menuItem.classList.add('active');
    menuItem.setAttribute('aria-expanded', 'true');
  }

  getActiveMenuItem() {
    return this.menuItems.find(item => item.classList.contains('active'));
  }

  getMenuItemForPanel(panel) {
    const panelId = panel.id;
    const section = panelId.replace('-panel', '');
    return this.menuItems.find(item => item.getAttribute('data-section') === section);
  }

  adjustPanelPositions() {
    this.dropdownPanels.forEach(panel => {
      if (panel.classList.contains('active')) {
        this.adjustPanelPosition(panel);
      }
    });
  }

  adjustPanelPosition(panel) {
    const rect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ajustement horizontal
    if (rect.right > viewportWidth) {
      panel.style.left = `${viewportWidth - rect.width - 20}px`;
    }
    
    if (rect.left < 0) {
      panel.style.left = '20px';
    }
    
    // Ajustement vertical
    if (rect.bottom > viewportHeight) {
      panel.style.top = `${viewportHeight - rect.height - 20}px`;
    }
  }

  // Utilitaire de debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Méthodes publiques pour interaction externe
  openSection(sectionName) {
    const menuItem = this.menuItems.find(item => 
      item.getAttribute('data-section') === sectionName
    );
    
    if (menuItem) {
      this.handleMenuClick(new Event('click'), menuItem);
    }
  }

  getCurrentSection() {
    const activeItem = this.getActiveMenuItem();
    return activeItem ? activeItem.getAttribute('data-section') : null;
  }

  isOpen(sectionName) {
    const panel = document.getElementById(`${sectionName}-panel`);
    return panel ? panel.classList.contains('active') : false;
  }

  // Méthode pour ajouter dynamiquement des sections
  addSection(sectionData) {
    const { id, title, content, menuItemClass = 'menu-item' } = sectionData;
    
    try {
      // Créer l'élément de menu
      const menuItem = document.createElement('div');
      menuItem.className = menuItemClass;
      menuItem.setAttribute('data-section', id);
      menuItem.textContent = title;
      
      // Créer le panneau
      const panel = document.createElement('div');
      panel.id = `${id}-panel`;
      panel.className = 'dropdown-panel';
      panel.innerHTML = content;
      
      // Ajouter au DOM
      const menuContainer = document.querySelector('.menu-container');
      const panelContainer = document.querySelector('.panels-container');
      
      if (menuContainer && panelContainer) {
        menuContainer.appendChild(menuItem);
        panelContainer.appendChild(panel);
        
        // Réinitialiser les événements
        this.initializeElements();
        this.setupEventListeners();
      }
      
    } catch (error) {
      console.warn('Erreur lors de l\'ajout de section:', error);
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioMenu = new MenuManager();
});

// CSS d'amélioration
const menuStyles = document.createElement('style');
menuStyles.textContent = `
  .menu-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    user-select: none;
    position: relative;
    outline: none;
  }
  
  .menu-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  .menu-item:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  .menu-item.active {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0,123,255,0.3);
    z-index: 10;
  }
  
  .dropdown-panel {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(-20px);
    opacity: 0;
    pointer-events: none;
    backface-visibility: hidden;
    will-change: transform, opacity;
  }
  
  .dropdown-panel.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  
  .dropdown-panel::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 16px;
    height: 16px;
    background: inherit;
    transform: rotate(45deg);
    border-radius: 2px;
    box-shadow: -2px -2px 8px rgba(0,0,0,0.1);
  }
  
  @media (prefers-reduced-motion: reduce) {
    .menu-item,
    .dropdown-panel {
      transition: none !important;
    }
  }
  
  @media (max-width: 768px) {
    .dropdown-panel {
      position: fixed !important;
      left: 10px !important;
      right: 10px !important;
      top: auto !important;
      bottom: 80px !important;
      width: auto !important;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .menu-item:hover {
      transform: none;
    }
  }
  
  /* Amélioration de l'accessibilité */
  @media (forced-colors: active) {
    .menu-item:focus {
      outline: 2px solid ButtonText;
    }
    
    .dropdown-panel {
      border: 1px solid ButtonText;
    }
  }
`;

document.head.appendChild(menuStyles);
