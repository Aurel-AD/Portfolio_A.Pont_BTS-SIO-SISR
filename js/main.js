// main.js - Version optimisée
class PortfolioApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleSystem = null;
    this.textMesh = null;
    this.config = null;
    this.isWebGLSupported = this.checkWebGLSupport();
    
    this.init();
  }

  // Vérification du support WebGL
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  }

  async init() {
    try {
      await this.loadConfig();
      this.initLottieNavigation();
      
      if (this.isWebGLSupported && window.THREE) {
        this.initThreeJS();
      } else {
        this.showFallbackBackground();
      }
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation:', error);
      this.showFallbackBackground();
    }
  }

  // Chargement de la configuration avec gestion d'erreurs
  async loadConfig() {
    try {
      const response = await fetch('data/config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.config = await response.json();
    } catch (error) {
      console.warn('Configuration non trouvée, utilisation des valeurs par défaut');
      this.config = this.getDefaultConfig();
    }
  }

  // Configuration par défaut
  getDefaultConfig() {
    return {
      camera: { distance: 5 },
      text: {
        content: 'Portfolio',
        size: 0.5,
        color: 0x00ff88,
        position: [0, 0, 0]
      }
    };
  }

  // Initialisation de Three.js
  initThreeJS() {
    try {
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      this.camera.position.z = this.config.camera.distance;

      const canvas = document.getElementById('bg');
      if (!canvas) {
        throw new Error('Canvas #bg non trouvé');
      }

      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.setupEventListeners();
      this.buildParticles();
      this.buildText();
      this.animate();

    } catch (error) {
      console.warn('Erreur Three.js:', error);
      this.showFallbackBackground();
    }
  }

  // Configuration des événements
  setupEventListeners() {
    const handleResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Pause animation si tab inactif (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimation = true;
      } else {
        this.pauseAnimation = false;
      }
    });
  }

  // Construction des particules (simplifié pour l'exemple)
  buildParticles() {
    if (!window.buildParticles) return;
    
    try {
      this.particleSystem = window.buildParticles(this.scene, this.config);
    } catch (error) {
      console.warn('Erreur lors de la création des particules:', error);
    }
  }

  // Construction du texte 3D
  buildText() {
    const loader = new THREE.FontLoader();
    const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
    
    loader.load(
      fontUrl,
      (font) => {
        try {
          const geometry = new THREE.TextGeometry(this.config.text.content, {
            font: font,
            size: this.config.text.size,
            height: 0.4,
            curveSegments: 12
          });
          
          geometry.computeBoundingBox();
          geometry.center();
          
          const material = new THREE.MeshBasicMaterial({ 
            color: this.config.text.color 
          });
          
          this.textMesh = new THREE.Mesh(geometry, material);
          this.textMesh.position.fromArray(this.config.text.position);
          this.scene.add(this.textMesh);
        } catch (error) {
          console.warn('Erreur lors de la création du texte 3D:', error);
        }
      },
      undefined,
      (error) => {
        console.warn('Erreur lors du chargement de la police:', error);
      }
    );
  }

  // Boucle d'animation
  animate() {
    if (this.pauseAnimation) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    requestAnimationFrame(() => this.animate());
    
    try {
      if (window.updateParticles && this.particleSystem) {
        window.updateParticles(this.particleSystem, this.config);
      }
      
      if (this.textMesh) {
        this.textMesh.rotation.y += 0.002;
      }
      
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      console.warn('Erreur dans la boucle d\'animation:', error);
    }
  }

  // Fallback si WebGL/Three.js non disponible
  showFallbackBackground() {
    const canvas = document.getElementById('bg');
    if (canvas) {
      canvas.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      canvas.style.opacity = '0.3';
    }
  }

  // Gestion de la navigation Lottie
  initLottieNavigation() {
    const lottieEl = document.querySelector("lottie-player");
    if (!lottieEl) return;

    lottieEl.addEventListener("click", () => {
      this.showNavigationModal();
    });
  }

  // Modale de navigation moderne
  showNavigationModal() {
    const existingModal = document.getElementById('nav-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'nav-modal';
    modal.className = 'navigation-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Navigation rapide</h2>
          <button class="close-btn" aria-label="Fermer">&times;</button>
        </div>
        <nav class="modal-nav">
          <ul class="nav-list">
            <li><a href="#a-propos" class="nav-link">À propos</a></li>
            <li><a href="#entreprise" class="nav-link">Entreprise</a></li>
            <li><a href="#competences" class="nav-link">Compétences</a></li>
            <li><a href="veille.html" class="nav-link">Veilles</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
          </ul>
          <div class="cv-section">
            <a href="pdf/cv.pdf" target="_blank" rel="noopener" class="cv-link">
              📄 Télécharger mon CV
            </a>
          </div>
        </nav>
      </div>
    `;

    // Styles intégrés pour la modale
    const style = document.createElement('style');
    style.textContent = `
      .navigation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
      }
      .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        transform: scale(0.9);
        animation: modalShow 0.3s ease-out forwards;
      }
      @keyframes modalShow {
        to { transform: scale(1); }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close-btn:hover {
        background: #f0f0f0;
        color: #333;
      }
      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .nav-list li {
        margin-bottom: 0.5rem;
      }
      .nav-link {
        display: block;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: #333;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .nav-link:hover {
        background: #f8f9fa;
        color: #007bff;
        transform: translateX(5px);
      }
      .cv-section {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }
      .cv-link {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s;
        font-weight: 500;
      }
      .cv-link:hover {
        background: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Gestion des événements de fermeture
    const closeBtn = modal.querySelector('.close-btn');
    const overlay = modal.querySelector('.modal-overlay');
    const navLinks = modal.querySelectorAll('.nav-link');

    const closeModal = () => {
      modal.style.animation = 'modalHide 0.3s ease-out forwards';
      setTimeout(() => {
        modal.remove();
        style.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Fermer en cliquant sur un lien de navigation
    navLinks.forEach(link => {
      link.addEventListener('click', closeModal);
    });

    // Fermeture avec Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Animation de fermeture
    const styleClose = document.createElement('style');
    styleClose.textContent = `
      @keyframes modalHide {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(styleClose);
  }
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioApp();
});
