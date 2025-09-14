// script.js - Version unifiée et optimisée
class PortfolioUtils {
  constructor() {
    this.floatingButton = null;
    this.scrollTimeout = null;
    this.isScrolling = false;
    this.scrollThreshold = 100;
    this.observers = new Map();
    
    this.init();
  }

  init() {
    try {
      this.initFloatingButton();
      this.initScrollSpy();
      this.initSmoothScrolling();
      this.initPerformanceOptimizations();
      this.initProgressIndicator();
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation des utilitaires:', error);
    }
  }

  /* ===== BOUTON FLOTTANT RETOUR ACCUEIL ===== */
  initFloatingButton() {
    this.floatingButton = document.getElementById('floatingBackButton');
    
    if (!this.floatingButton) {
      console.log("Bouton flottant non trouvé, création automatique");
      this.createFloatingButton();
    }

    if (this.floatingButton) {
      this.setupFloatingButtonEvents();
      this.updateButtonVisibility();
    }
  }

  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'floatingBackButton';
    button.className = 'floating-back-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
      </svg>
      <span class="sr-only">Retour à l'accueil</span>
    `;
    button.setAttribute('aria-label', 'Retour à l\'accueil');
    button.setAttribute('title', 'Retour à l\'accueil');
    
    document.body.appendChild(button);
    this.floatingButton = button;
    
    // Ajouter les styles si nécessaire
    this.addFloatingButtonStyles();
  }

  setupFloatingButtonEvents() {
    // Gestion du scroll avec throttle
    const throttledScroll = this.throttle(() => {
      this.handleScroll();
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Gestion du clic
    this.floatingButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToTop();
    });

    // Support clavier
    this.floatingButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToTop();
      }
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', this.debounce(() => {
      this.updateButtonVisibility();
    }, 250));
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolling = true;
    
    // Masquer pendant le scroll pour les performances
    if (this.floatingButton.classList.contains('visible')) {
      this.floatingButton.style.opacity = '0.7';
    }
    
    clearTimeout(this.scrollTimeout);
    
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.updateButtonVisibility();
      
      if (this.floatingButton.classList.contains('visible')) {
        this.floatingButton.style.opacity = '1';
      }
    }, 150);
  }

  updateButtonVisibility() {
    if (!this.floatingButton) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShow = scrollTop > this.scrollThreshold;
    
    if (shouldShow && !this.floatingButton.classList.contains('visible')) {
      this.floatingButton.classList.add('visible');
      this.floatingButton.setAttribute('aria-hidden', 'false');
    } else if (!shouldShow && this.floatingButton.classList.contains('visible')) {
      this.floatingButton.classList.remove('visible');
      this.floatingButton.setAttribute('aria-hidden', 'true');
    }
  }

  scrollToTop() {
    // Animation smooth avec fallback
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback pour anciens navigateurs
      this.animateScrollTo(0, 500);
    }
    
    // Focus sur l'élément principal pour l'accessibilité
    setTimeout(() => {
      const mainContent = document.querySelector('main, #main, .main-content');
      if (mainContent) {
        mainContent.focus();
      }
    }, 600);
  }

  animateScrollTo(target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    const startTime = performance.now();
    
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    
    const scroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, start + distance * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };
    
    requestAnimationFrame(scroll);
  }

  /* ===== SCROLL SPY ET NAVIGATION ===== */
  initScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) {
      return;
    }

    // Intersection Observer pour détecter les sections visibles
    const observerOptions = {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`nav a[href="#${id}"]`);
        
        if (entry.isIntersecting) {
          // Retirer active de tous les liens
          navLinks.forEach(l => l.classList.remove('active'));
          // Ajouter active au lien actuel
          if (link) {
            link.classList.add('active');
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });

    this.observers.set('scrollSpy', observer);
  }

  initSmoothScrolling() {
    // Smooth scrolling pour tous les liens d'ancre
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const headerOffset = document.querySelector('header')?.offsetHeight || 80;
        const targetPosition = targetElement.offsetTop - headerOffset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Mise à jour de l'URL sans rechargement
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }
        
        // Focus pour l'accessibilité
        setTimeout(() => {
          targetElement.focus();
          targetElement.setAttribute('tabindex', '-1');
        }, 500);
      }
    });
  }

  /* ===== OPTIMISATIONS PERFORMANCES ===== */
  initPerformanceOptimizations() {
    // Lazy loading des images
    this.initLazyLoading();
    
    // Preload des ressources critiques
    this.preloadCriticalResources();
    
    // Gestion de la visibilité de l'onglet
    this.initVisibilityAPI();
  }

  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src], iframe[data-src]');
    
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const src = element.getAttribute('data-src');
          
          if (src) {
            element.src = src;
            element.removeAttribute('data-src');
            element.classList.add('loaded');
            imageObserver.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));
    this.observers.set('lazyLoading', imageObserver);
  }

  preloadCriticalResources() {
    const criticalResources = [
      'data/config.json',
      'files/RobotSaludando.json'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  initVisibilityAPI() {
    if (typeof document.hidden === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause des animations coûteuses
        this.pauseExpensiveAnimations();
      } else {
        // Reprendre les animations
        this.resumeExpensiveAnimations();
      }
    });
  }

  pauseExpensiveAnimations() {
    // Pause des animations Lottie
    if (window.portfolioNav?.robotAnimation) {
      window.portfolioNav.robotAnimation.pause();
    }
    
    // Pause des particules Three.js
    if (window.portfolioApp) {
      window.portfolioApp.pauseAnimation = true;
    }
  }

  resumeExpensiveAnimations() {
    // Reprendre les animations Lottie
    if (window.portfolioNav?.robotAnimation) {
      window.portfolioNav.robotAnimation.play();
    }
    
    // Reprendre les particules Three.js
    if (window.portfolioApp) {
      window.portfolioApp.pauseAnimation = false;
    }
  }

  /* ===== INDICATEUR DE PROGRESSION ===== */
  initProgressIndicator() {
    const progressBar = this.createProgressBar();
    
    const updateProgress = this.throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }, 16);

    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    return progressBar;
  }

  /* ===== UTILITAIRES ===== */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

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

  /* ===== STYLES CSS INTÉGRÉS ===== */
  addFloatingButtonStyles() {
    if (document.getElementById('floating-button-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'floating-button-styles';
    styles.textContent = `
      .floating-back-button {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 56px;
        height: 56px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transform: translateY(100px) scale(0.8);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        outline: none;
      }
      
      .floating-back-button.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      .floating-back-button:hover {
        background: #0056b3;
        transform: translateY(-2px) scale(1.1);
        box-shadow: 0 8px 20px rgba(0, 123, 255, 0.5);
      }
      
      .floating-back-button:focus {
        outline: 2px solid #fff;
        outline-offset: 2px;
      }
      
      .floating-back-button:active {
        transform: translateY(0) scale(0.95);
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .scroll-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        z-index: 9999;
        pointer-events: none;
      }
      
      .scroll-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #00c851);
        width: 0%;
        transition: width 0.1s ease;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .floating-back-button {
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
        }
      }
      
      /* Réduction de mouvement */
      @media (prefers-reduced-motion: reduce) {
        .floating-back-button {
          transition: opacity 0.3s ease;
          transform: none !important;
        }
        
        .floating-back-button.visible {
          transform: none !important;
        }
        
        .floating-back-button:hover {
          transform: none !important;
        }
      }
      
      /* Mode sombre */
      @media (prefers-color-scheme: dark) {
        .scroll-progress-container {
          background: rgba(255, 255, 255, 0.1);
        }
      }
      
      /* Images lazy-loading */
      img[data-src] {
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      img.loaded {
        opacity: 1;
      }
    `;
    
    document.head.appendChild(styles);
  }

  /* ===== MÉTHODES PUBLIQUES ===== */
  // Méthode pour nettoyer les observers (utile pour SPA)
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  // Méthode pour recalculer les positions (après ajout de contenu dynamique)
  refresh() {
    this.updateButtonVisibility();
    
    // Re-observer les nouvelles images lazy
    const newImages = document.querySelectorAll('img[data-src]:not(.observed)');
    const lazyObserver = this.observers.get('lazyLoading');
    
    if (lazyObserver && newImages.length > 0) {
      newImages.forEach(img => {
        img.classList.add('observed');
        lazyObserver.observe(img);
      });
    }
  }

  // Getter pour l'état du scroll
  get scrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  // Getter pour le pourcentage de scroll
  get scrollPercentage() {
    const scrollTop = this.scrollPosition;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min((scrollTop / scrollHeight) * 100, 100);
  }
}

/* ===== GESTIONNAIRE D'ERREURS GLOBAL ===== */
class ErrorHandler {
  constructor() {
    this.initGlobalErrorHandling();
  }

  initGlobalErrorHandling() {
    // Erreurs JavaScript
    window.addEventListener('error', (e) => {
      this.logError('JavaScript Error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
      });
    });

    // Erreurs de promesses non gérées
    window.addEventListener('unhandledrejection', (e) => {
      this.logError('Unhandled Promise Rejection', {
        reason: e.reason,
        promise: e.promise
      });
      
      // Empêcher l'affichage d'erreur par défaut
      e.preventDefault();
    });

    // Erreurs de ressources (images, scripts, etc.)
    window.addEventListener('error', (e) => {
      if (e.target && e.target !== window) {
        this.logError('Resource Loading Error', {
          element: e.target.tagName,
          source: e.target.src || e.target.href,
          message: 'Failed to load resource'
        });
        
        this.handleResourceError(e.target);
      }
    }, true);
  }

  logError(type, details) {
    const errorInfo = {
      type,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.warn(`[Portfolio Error] ${type}:`, errorInfo);
    
    // Ici on pourrait envoyer à un service d'analytics
    // this.sendToAnalytics(errorInfo);
  }

  handleResourceError(element) {
    switch (element.tagName.toLowerCase()) {
      case 'img':
        this.handleImageError(element);
        break;
      case 'script':
        this.handleScriptError(element);
        break;
      case 'link':
        this.handleStyleError(element);
        break;
    }
  }

  handleImageError(img) {
    // Image de fallback ou placeholder
    if (!img.classList.contains('fallback-applied')) {
      img.classList.add('fallback-applied');
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
      img.alt = 'Image non disponible';
    }
  }

  handleScriptError(script) {
    console.warn(`Script failed to load: ${script.src}`);
    
    // Identifier le script et activer un mode dégradé
    if (script.src.includes('three')) {
      document.body.classList.add('no-threejs');
    } else if (script.src.includes('lottie')) {
      document.body.classList.add('no-lottie');
    }
  }

  handleStyleError(link) {
    console.warn(`Stylesheet failed to load: ${link.href}`);
    document.body.classList.add('css-fallback');
  }
}

/* ===== GESTIONNAIRE DE PERFORMANCES ===== */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initPerformanceMonitoring();
  }

  initPerformanceMonitoring() {
    // Métriques de chargement de page
    window.addEventListener('load', () => {
      this.collectLoadMetrics();
    });

    // Observer les layouts shifts (CLS)
    this.observeLayoutShifts();
    
    // Monitor les long tasks
    this.observeLongTasks();
    
    // FPS monitoring pour les animations
    this.initFPSMonitoring();
  }

  collectLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
      this.metrics.firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
    }

    // Taille du DOM
    this.metrics.domSize = document.querySelectorAll('*').length;
    
    // Ressources chargées
    this.metrics.resourceCount = performance.getEntriesByType('resource').length;

    console.log('Performance Metrics:', this.metrics);
  }

  observeLayoutShifts() {
    if ('LayoutShift' in window) {
      let clsScore = 0;
      
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        this.metrics.cls = clsScore;
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  observeLongTasks() {
    if ('PerformanceLongTaskTiming' in window) {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  initFPSMonitoring() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = (currentTime) => {
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.metrics.fps = fps;
        
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
          document.body.classList.add('low-performance');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/* ===== GESTIONNAIRE D'ACCESSIBILITÉ ===== */
class AccessibilityEnhancer {
  constructor() {
    this.initAccessibilityFeatures();
  }

  initAccessibilityFeatures() {
    this.enhanceKeyboardNavigation();
    this.addSkipLinks();
    this.improveScreenReaderSupport();
    this.handleReducedMotion();
    this.initHighContrastSupport();
  }

  enhanceKeyboardNavigation() {
    // Tab trap pour les modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('.navigation-modal, .dropdown-panel.active');
        if (modal) {
          this.trapFocus(e, modal);
        }
      }
    });

    // Navigation par flèches pour les menus
    const menuItems = document.querySelectorAll('.menu-item, .main-link');
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextItem = menuItems[index + 1] || menuItems[0];
            nextItem.focus();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
            prevItem.focus();
            break;
        }
      });
    });
  }

  trapFocus(e, modal) {
    const focusableElements = modal.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  improveScreenReaderSupport() {
    // Annoncer les changements de contenu
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-announcer';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(announcer);
    window.announceToScreenReader = (message) => {
      announcer.textContent = message;
    };

    // Améliorer les boutons sans texte
    const buttonIcons = document.querySelectorAll('button:not([aria-label]):not([title])');
    buttonIcons.forEach(button => {
      if (!button.textContent.trim()) {
        button.setAttribute('aria-label', 'Bouton');
      }
    });
  }

  handleReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = () => {
      if (mediaQuery.matches) {
        document.body.classList.add('reduce-motion');
        // Désactiver les animations Three.js
        if (window.portfolioApp) {
          window.portfolioApp.pauseAnimation = true;
        }
      } else {
        document.body.classList.remove('reduce-motion');
      }
    };
    
    handleMotionPreference();
    mediaQuery.addListener(handleMotionPreference);
  }

  initHighContrastSupport() {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleContrastPreference = () => {
      if (mediaQuery.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    };
    
    handleContrastPreference();
    mediaQuery.addListener(handleContrastPreference);
  }
}

/* ===== INITIALISATION GLOBALE ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser tous les gestionnaires
  window.portfolioUtils = new PortfolioUtils();
  window.errorHandler = new ErrorHandler();
  window.performanceMonitor = new PerformanceMonitor();
  window.accessibilityEnhancer = new AccessibilityEnhancer();
  
  // Debug info en mode développement
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Portfolio initialisé en mode développement');
    console.log('📊 Métriques disponibles via window.performanceMonitor.getMetrics()');
  }
});

// Nettoyage avant déchargement de la page
window.addEventListener('beforeunload', () => {
  if (window.portfolioUtils) {
    window.portfolioUtils.cleanup();
  }
});

// CSS global pour l'accessibilité
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  /* Mode motion réduit */
  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Mode high contrast */
  .high-contrast {
    filter: contrast(150%);
  }
  
  .high-contrast .floating-back-button {
    border: 2px solid currentColor;
  }
  
  /* Mode dégradé sans Three.js */
  .no-threejs #bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.3;
  }
  
  /* Mode dégradé sans Lottie */
  .no-lottie #robot {
    font-size: 2rem;
  }
  
  /* Performance dégradée */
  .low-performance * {
    animation: none !important;
    transition: none !important;
  }
  
  /* Focus visible amélioré */
  *:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  /* Amélioration des contrastes */
  .sr-announcer {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
`;

document.head.appendChild(globalStyles);
