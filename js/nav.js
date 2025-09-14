// nav.js - Version optimisée avec gestion du robot
class NavigationManager {
  constructor() {
    this.subLinksContainer = null;
    this.mainLinks = [];
    this.backButton = null;
    this.robotAnimation = null;
    
    this.subLinksMap = {
      biographie: [
        { text: "À propos", href: "#a-propos", icon: "👤" },
        { text: "Parcours", href: "#parcours", icon: "🎓" },
      ],
      alternance: [
        { text: "Entreprise", href: "#entreprise", icon: "🏢" },
        { text: "Compétences", href: "#competences", icon: "💪" },
        { text: "Certifications", href: "#certifications", icon: "🏆" },
      ],
      veille: [
        { text: "Cybersécurité", href: "https://www.cert.ssi.gouv.fr/", target: "_blank", icon: "🔐" },
        { text: "Technique & Systèmes", href: "https://www.lemondeinformatique.fr/", target: "_blank", icon: "⚙️" },
        { text: "Veille digitale & IA", href: "https://www.technologyreview.com/", target: "_blank", icon: "🤖" },
      ],
      "centre-entreprise": [
        { text: "AFPI", href: "https://www.afpi.fr/", target: "_blank", icon: "🎯" },
        { text: "Novares", href: "https://www.novares.com/", target: "_blank", icon: "🚗" },
      ],
    };

    this.init();
  }

  init() {
    try {
      this.initializeElements();
      this.setupEventListeners();
      this.initRobot();
      this.setDefaultState();
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation de la navigation:', error);
    }
  }

  initializeElements() {
    this.subLinksContainer = document.getElementById("sub-links");
    this.mainLinks = Array.from(document.querySelectorAll(".main-link"));
    this.backButton = document.getElementById("back-button");

    if (!this.subLinksContainer) {
      throw new Error("Élément #sub-links non trouvé. Vérifiez que navbar.html est chargé.");
    }

    if (this.mainLinks.length === 0) {
      console.warn("Aucun lien principal trouvé (.main-link)");
    }
  }

  setupEventListeners() {
    // Gestion des liens principaux
    this.mainLinks.forEach(link => {
      link.addEventListener("click", (e) => this.handleMainLinkClick(e, link));
      
      // Amélioration accessibilité
      link.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleMainLinkClick(e, link);
        }
      });
    });

    // Bouton retour
    if (this.backButton) {
      this.backButton.addEventListener("click", () => this.handleBackClick());
      this.backButton.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleBackClick();
        }
      });
    }
  }

  handleMainLinkClick(e, link) {
    e.preventDefault();
    
    // Mise à jour de l'état actif
    this.mainLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    
    // Mise à jour des sous-liens
    const section = link.getAttribute("data-section");
    this.updateSubLinks(section);
    
    // Analytics/tracking si nécessaire
    this.trackNavigation(section);
  }

  handleBackClick() {
    const biographieLink = this.mainLinks.find(l => 
      l.getAttribute("data-section") === "biographie"
    );
    
    if (biographieLink) {
      this.mainLinks.forEach(l => l.classList.remove("active"));
      biographieLink.classList.add("active");
      this.updateSubLinks("biographie");
    }
  }

  updateSubLinks(section) {
    if (!this.subLinksContainer) return;

    // Animation de sortie
    this.subLinksContainer.style.opacity = '0';
    this.subLinksContainer.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      this.subLinksContainer.innerHTML = "";
      const links = this.subLinksMap[section] || [];
      
      if (links.length === 0) {
        this.subLinksContainer.innerHTML = '<p class="no-links">Aucun sous-lien disponible</p>';
      } else {
        links.forEach((link, index) => {
          const linkElement = this.createSubLink(link, index);
          this.subLinksContainer.appendChild(linkElement);
        });
      }
      
      // Animation d'entrée
      this.subLinksContainer.style.opacity = '1';
      this.subLinksContainer.style.transform = 'translateY(0)';
    }, 150);
  }

  createSubLink(linkData, index) {
    const a = document.createElement("a");
    a.href = linkData.href;
    a.className = "sub-link";
    a.textContent = `${linkData.icon || ''} ${linkData.text}`.trim();
    
    if (linkData.target) {
      a.target = linkData.target;
      a.rel = "noopener noreferrer"; // Sécurité
    }
    
    // Amélioration UX
    a.style.animationDelay = `${index * 0.1}s`;
    a.setAttribute('role', 'menuitem');
    
    // Gestion du focus
    a.addEventListener('focus', () => {
      a.style.transform = 'translateX(5px)';
    });
    
    a.addEventListener('blur', () => {
      a.style.transform = 'translateX(0)';
    });
    
    return a;
  }

  setDefaultState() {
    const defaultLink = this.mainLinks.find(l => 
      l.getAttribute("data-section") === "biographie"
    );
    
    if (defaultLink) {
      defaultLink.classList.add("active");
      this.updateSubLinks("biographie");
    }
  }

  trackNavigation(section) {
    // Pour analytics futurs
    if (window.gtag) {
      window.gtag('event', 'navigation', {
        'section': section,
        'event_category': 'portfolio_navigation'
      });
    }
  }

  /* ===== GESTION DU ROBOT ASSISTANT ===== */
  initRobot() {
    const robot = document.getElementById('robot');
    const bubble = document.getElementById('robot-bubble');
    const animationContainer = document.getElementById('lottie-animation');

    if (!robot || !bubble || !animationContainer) {
      console.log('Éléments du robot non trouvés, fonctionnalité désactivée');
      return;
    }

    this.setupRobotAnimation(animationContainer);
    this.setupRobotInteractions(robot, bubble);
  }

  setupRobotAnimation(container) {
    if (!window.lottie) {
      console.warn('Lottie non disponible, robot statique');
      container.innerHTML = '🤖';
      return;
    }

    try {
      this.robotAnimation = window.lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'files/RobotSaludando.json'
      });

      // Gestion d'erreur pour l'animation
      this.robotAnimation.addEventListener('data_failed', () => {
        console.warn('Animation robot échouée, fallback');
        container.innerHTML = '🤖';
      });

    } catch (error) {
      console.warn('Erreur lors du chargement de l\'animation robot:', error);
      container.innerHTML = '🤖';
    }
  }

  setupRobotInteractions(robot, bubble) {
    const closeBtn = bubble.querySelector('.close-bubble');
    
    if (!closeBtn) {
      console.warn('Bouton de fermeture du robot non trouvé');
      return;
    }

    // Click sur le robot
    robot.addEventListener('click', (e) => {
      e.stopPropagation();
      bubble.classList.toggle('show');
      
      // Message contextuel selon la section active
      this.updateRobotMessage(bubble);
      
      // Accessibility
      robot.setAttribute('aria-expanded', bubble.classList.contains('show'));
    });

    // Fermeture du bubble
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bubble.classList.remove('show');
      robot.setAttribute('aria-expanded', 'false');
    });

    // Fermeture en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!robot.contains(e.target) && !bubble.contains(e.target)) {
        bubble.classList.remove('show');
        robot.setAttribute('aria-expanded', 'false');
      }
    });

    // Support clavier
    robot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        robot.click();
      }
    });

    // Fermeture avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bubble.classList.contains('show')) {
        bubble.classList.remove('show');
        robot.setAttribute('aria-expanded', 'false');
        robot.focus(); // Retour du focus
      }
    });
  }

  updateRobotMessage(bubble) {
    const activeSection = document.querySelector('.main-link.active')?.getAttribute('data-section');
    const messageElement = bubble.querySelector('.robot-message');
    
    if (!messageElement) return;

    const messages = {
      biographie: "👋 Découvrez mon parcours et ma passion pour l'informatique !",
      alternance: "💼 Explorez mon expérience en entreprise et mes compétences techniques.",
      veille: "📚 Consultez ma veille technologique et mes sources d'information.",
      "centre-entreprise": "🏢 En savoir plus sur mes lieux de formation et d'alternance."
    };

    const defaultMessage = "🤖 Bonjour ! Je suis là pour vous guider dans ce portfolio.";
    messageElement.textContent = messages[activeSection] || defaultMessage;
  }

  // Méthodes publiques pour interaction externe
  navigateTo(section) {
    const targetLink = this.mainLinks.find(l => 
      l.getAttribute("data-section") === section
    );
    
    if (targetLink) {
      targetLink.click();
    }
  }

  getCurrentSection() {
    const activeLink = document.querySelector('.main-link.active');
    return activeLink ? activeLink.getAttribute("data-section") : null;
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  window.portfolioNav = new NavigationManager();
});

// CSS d'amélioration pour les animations
const navStyles = document.createElement('style');
navStyles.textContent = `
  .sub-link {
    transition: all 0.3s ease;
    opacity: 0;
    animation: slideInUp 0.3s ease forwards;
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .sub-link:hover {
    transform: translateX(5px) !important;
    color: #007bff;
  }
  
  .sub-link:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  .no-links {
    color: #666;
    font-style: italic;
    padding: 1rem;
    text-align: center;
  }
  
  #sub-links {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .robot-message {
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

document.head.appendChild(navStyles);
