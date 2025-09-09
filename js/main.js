// main.js
document.addEventListener("DOMContentLoaded", function () {
  const lottieEl = document.querySelector("lottie-player");

  lottieEl.addEventListener("click", function () {
    // Redirige vers une page de navigation ou affiche un menu
    const navOptions = `
      <div class="quick-nav">
        <h2>Navigation rapide</h2>
        <ul>
          <li><a href="#a-propos">À propos</a></li>
          <li><a href="#entreprise">Entreprise</a></li>
          <li><a href="#competences">Compétences</a></li>
          <li><a href="veille.html">Veilles</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
        <p><a href="pdf/cv.pdf" target="_blank">Télécharger mon CV (PDF)</a></p>
      </div>
    `;
    // Ici, tu pourrais ouvrir une modale ou rediriger
    alert("Navigation : À propos, Entreprise, Compétences, Veilles, Contact\nCV disponible en téléchargement.");
    // En vrai projet : utiliser une modale ou router
  });
});
import { buildParticles, updateParticles } from './particles.js';

let scene, camera, renderer, particleSystem, textMesh, cfg;

async function loadConfig() {
  const res = await fetch('data/config.json');
  cfg = await res.json();
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
  camera.position.z = cfg.camera.distance;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  buildParticles(scene, cfg);
  buildText(scene, cfg);

  animate();
}

function buildText(scene, cfg) {
  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
    const geom = new THREE.TextGeometry(cfg.text.content, {
      font: font,
      size: cfg.text.size,
      height: 0.4
    });
    geom.center();
    const mat = new THREE.MeshBasicMaterial({ color: cfg.text.color });
    textMesh = new THREE.Mesh(geom, mat);
    textMesh.position.fromArray(cfg.text.position);
    scene.add(textMesh);
  });
}

function animate() {
  requestAnimationFrame(animate);
  updateParticles(particleSystem, cfg);
  if (textMesh) textMesh.rotation.y += 0.002;
  renderer.render(scene, camera);
}

loadConfig().then(init);