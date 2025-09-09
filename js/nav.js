// js/nav.js
document.addEventListener("DOMContentLoaded", () => {
  const mainLinks = document.querySelectorAll(".main-link");
  const subLinksContainer = document.getElementById("sub-links");
  const backButton = document.getElementById("back-button");

  if (!subLinksContainer) {
    console.error("Élément #sub-links non trouvé. Vérifiez que navbar.html est chargé.");
    return;
  }

  const subLinksMap = {
    biographie: [
      { text: "À propos", href: "#a-propos" },
      { text: "Parcours", href: "#parcours" },
    ],
    alternance: [
      { text: "Entreprise", href: "#entreprise" },
      { text: "Compétences", href: "#competences" },
      { text: "Certifications", href: "#certifications" },
    ],
    veille: [
      { text: "Cybersécurité", href: "https://www.cert.ssi.gouv.fr/", target: "_blank" },
      { text: "Technique & Systèmes", href: "https://www.lemondeinformatique.fr/", target: "_blank" },
      { text: "Veille digitale & IA", href: "https://www.technologyreview.com/", target: "_blank" },
    ],
    "centre-entreprise": [
      { text: "AFPI", href: "https://www.afpi.fr/", target: "_blank" },
      { text: "Novares", href: "https://www.novares.com/", target: "_blank" },
    ],
  };

  function updateSubLinks(section) {
    subLinksContainer.innerHTML = "";
    const links = subLinksMap[section] || [];
    links.forEach(link => {
      const a = document.createElement("a");
      a.href = link.href;
      a.className = "sub-link";
      a.textContent = link.text;
      if (link.target) a.target = link.target;
      subLinksContainer.appendChild(a);
    });
  }

  // Gestion des clics sur les liens principaux
  mainLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      mainLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      const section = this.getAttribute("data-section");
      updateSubLinks(section);
    });
  });

  // Bouton retour
  if (backButton) {
    backButton.addEventListener("click", () => {
      const biographieLink = document.querySelector('[data-section="biographie"]');
      mainLinks.forEach(l => l.classList.remove("active"));
      biographieLink.classList.add("active");
      updateSubLinks("biographie");
    });
  }

  // Initialisation par défaut
  const defaultLink = document.querySelector('[data-section="biographie"]');
  defaultLink.classList.add("active");
  updateSubLinks("biographie");
});
/* ===== ROBOT ASSISTANT ===== */
function initRobot() {
  const robot = document.getElementById('robot');
  const bubble = document.getElementById('robot-bubble');
  const closeBtn = bubble.querySelector('.close-bubble');
  const animationContainer = document.getElementById('lottie-animation');

  if (!robot || !bubble || !closeBtn || !animationContainer) return;

  // Charger l’animation Lottie
  const robotAnimation = lottie.loadAnimation({
    container: animationContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'files/RobotSaludando.json'
  });

  // Gestion du clic
  robot.addEventListener('click', () => {
    bubble.classList.toggle('show');
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    bubble.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (!robot.contains(e.target) && !bubble.contains(e.target)) {
      bubble.classList.remove('show');
    }
  });
}

document.addEventListener('DOMContentLoaded', initRobot);
