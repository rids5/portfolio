/* ===================================================
   script.js  —  Riddhi Sibal Portfolio
   Three.js: warm desert-gold colour palette
   =================================================== */

const canvas = document.getElementById("bg");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 6000);
camera.position.z = 55;

/* ===== LIGHT ===== */

scene.add(new THREE.AmbientLight(0xfff3d0, 0.8));   // warm amber ambient

const sunLight = new THREE.PointLight(0xffcc66, 7);  // golden sun light
scene.add(sunLight);

/* ===== TEXTURES ===== */

const loader = new THREE.TextureLoader();

const tex = {
  sun:    loader.load("https://threejs.org/examples/textures/lava/lavatile.jpg"),
  earth:  loader.load("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"),
  moon:   loader.load("https://threejs.org/examples/textures/planets/moon_1024.jpg"),

  mercury: loader.load("https://threejs.org/examples/textures/lava/lavatile.jpg"),
  venus:   loader.load("https://threejs.org/examples/textures/hardwood2_diffuse.jpg"),
  mars:    loader.load("https://threejs.org/examples/textures/lava/cloud.png"),
  jupiter: loader.load("https://threejs.org/examples/textures/brick_diffuse.jpg"),
  saturn:  loader.load("https://threejs.org/examples/textures/water.jpg"),
  uranus:  loader.load("https://threejs.org/examples/textures/cube/Bridge2/posx.jpg"),
  neptune: loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"),

  saturnRing: loader.load("https://threejs.org/examples/textures/alphaMap.jpg")
};

/* ===== STARS — warm gold tones ===== */

const starGeo = new THREE.BufferGeometry();
const starCount = 12000;
const starPos = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPos[i * 3]     = (Math.random() - 0.5) * 3000;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 3000;
  starPos[i * 3 + 2] = -Math.random() * 4500;
}

starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

scene.add(new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffd580, size: 1.2 })   // golden stars
));

/* ===== SUN ===== */

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(18, 64, 64),
  new THREE.MeshBasicMaterial({ map: tex.sun })
);

sun.position.set(-75, 40, -120);
sunLight.position.copy(sun.position);
scene.add(sun);

/* Sun glow — amber */
const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(26, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.45
  })
);
sunGlow.position.copy(sun.position);
scene.add(sunGlow);

/* ===== PLANET CREATOR ===== */

function createPlanet(size, map, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 64, 64),
    new THREE.MeshPhongMaterial({ map: map, shininess: 15 })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

/* ===== PLANETS ===== */

const mercury = createPlanet(6,    tex.mercury, -20,  8,  -220);
const venus   = createPlanet(7,    tex.venus,    22, -8,  -340);
const earth   = createPlanet(7.5,  tex.earth,  -18,  10, -480);
const mars    = createPlanet(6.5,  tex.mars,    20,  8,  -620);
const jupiter = createPlanet(12,   tex.jupiter, -22, -8,  -820);
const saturn  = createPlanet(11,   tex.saturn,   24,  6,  -1000);
const uranus  = createPlanet(9,    tex.uranus,  -20, -10, -1200);
const neptune = createPlanet(9,    tex.neptune,  22,  9,  -1400);

const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

/* ===== SATURN RINGS ===== */

const ring = new THREE.Mesh(
  new THREE.RingGeometry(16, 26, 128),
  new THREE.MeshBasicMaterial({
    map: tex.saturnRing,
    side: THREE.DoubleSide,
    transparent: true
  })
);
ring.position.copy(saturn.position);
ring.rotation.x = Math.PI / 2.2;
scene.add(ring);

/* ===== MOON ===== */

const moon = createPlanet(2.2, tex.moon, 0, 0, 0);

/* ===== INTERACTION ===== */

let mx = 0, my = 0;

document.addEventListener("mousemove", e => {
  mx = (e.clientX / innerWidth  - 0.5) * 2;
  my = (e.clientY / innerHeight - 0.5) * 2;
});

let scrollY = 0;
window.addEventListener("scroll", () => { scrollY = window.scrollY; });

/* ===== ANIMATION LOOP ===== */

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(p => p.rotation.y += 0.003);

  moon.position.x = earth.position.x + Math.sin(Date.now() * 0.001) * 8;
  moon.position.z = earth.position.z + Math.cos(Date.now() * 0.001) * 8;
  moon.position.y = earth.position.y;

  camera.position.z = 55 - scrollY * 0.18;

  scene.rotation.y += (mx * 0.8  - scene.rotation.y) * 0.02;
  scene.rotation.x += (-my * 0.4 - scene.rotation.x) * 0.02;

  camera.lookAt(0, 0, camera.position.z - 400);

  renderer.render(scene, camera);
}

animate();

/* ===== RESIZE ===== */

addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

/* ===================================================
   CURSOR ORB + SHORT TRAIL
   =================================================== */

const orb = document.getElementById("orb");
const trailContainer = document.getElementById("trail-container");

const TRAIL_COUNT = 5;
const trail = [];

for (let i = 0; i < TRAIL_COUNT; i++) {
  const dot = document.createElement("div");
  dot.className = "trail";
  trailContainer.appendChild(dot);
  trail.push({ el: dot, x: 0, y: 0 });
}

let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  orb.style.left = mouseX + "px";
  orb.style.top  = mouseY + "px";

  let prevX = mouseX;
  let prevY = mouseY;

  trail.forEach(t => {
    t.x += (prevX - t.x) * 0.45;
    t.y += (prevY - t.y) * 0.45;
    t.el.style.left = t.x + "px";
    t.el.style.top  = t.y + "px";
    prevX = t.x;
    prevY = t.y;
  });

  requestAnimationFrame(animateCursor);
}

animateCursor();

/* ===================================================
   ABOUT — TYPING EFFECT
   =================================================== */

const aboutSection = document.querySelector("#about");
const aboutTextEl  = document.getElementById("about-text");

const aboutText = `
▣ INITIALIZING PROFILE...

> I'm a Computer Science student at Graphic Era University, Dehradun — driven by curiosity, data, and the ambition to build technology that creates real impact.

> Raised in Abu Dhabi 🇦🇪, I grew up in a multicultural environment that shaped my global mindset. Moving to India for my B.Tech, I've channelled that perspective into projects spanning cloud computing, fraud detection, data analysis, and UI/UX design.

> AWS Certified Cloud Practitioner | Power BI | Data Analytics | UI/UX | Open to internships and collaborations.
`;

let typed = false;

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !typed) {
    typeText();
    typed = true;
  }
}, { threshold: 0.5 });

observer.observe(aboutSection);

function typeText() {
  let i = 0;
  function typing() {
    if (i < aboutText.length) {
      aboutTextEl.textContent += aboutText.charAt(i);
      i++;
      setTimeout(typing, 18);
    }
  }
  typing();
}

/* ===================================================
   SKILLS ORBIT CONSTELLATION
   =================================================== */

const field  = document.getElementById("skillField");
const skills = [...field.querySelectorAll(".skill-btn")];
const title  = document.querySelector(".skills-title");

function placeSkills() {
  const W = field.clientWidth;
  const H = field.clientHeight;

  const tRect = title.getBoundingClientRect();
  const fRect = field.getBoundingClientRect();

  let cx = tRect.left - fRect.left + tRect.width / 2;
  const cy = tRect.top - fRect.top + tRect.height / 2;

  cx -= W * 0.069;

  const total = skills.length;
  const baseRX = W * 0.20;
  const baseRY = H * 0.12;
  const stepRX = W * 0.13;
  const stepRY = H * 0.09;
  const perRing = 10;

  let skillIndex = 0;
  let ring = 0;

  while (skillIndex < total) {
    const count = Math.min(perRing, total - skillIndex);
    const rx = baseRX + ring * stepRX;
    const ry = baseRY + ring * stepRY;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      const btn = skills[skillIndex++];
      btn.style.left = x + "px";
      btn.style.top  = y + "px";

      const phase = Math.random() * Math.PI * 2;
      const amp   = 6;
      const speed = 0.001 + Math.random() * 0.001;

      function animateSkill(time) {
        const dx = Math.cos(time * speed + phase) * amp;
        const dy = Math.sin(time * speed + phase) * amp * 0.6;
        btn.style.left = (x + dx) + "px";
        btn.style.top  = (y + dy) + "px";
        requestAnimationFrame(animateSkill);
      }

      requestAnimationFrame(animateSkill);
    }

    ring++;
  }
}

placeSkills();
window.addEventListener("resize", placeSkills);

/* ===================================================
   PROJECTS CAROUSEL
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#projects .card");
  if (!cards.length) return;

  let index = 0;

  function updateCarousel() {
    const total = cards.length;
    cards.forEach((card, i) => {
      const diff = (i - index + total) % total;

      if (diff === 0) {
        card.style.transform    = "translate(-50%, -50%) scale(1.1)";
        card.style.opacity      = 1;
        card.style.zIndex       = 3;
        card.style.pointerEvents = "auto";
      } else if (diff === 1) {
        card.style.transform    = "translate(calc(-50% + 260px), -50%) scale(0.9)";
        card.style.opacity      = 0.6;
        card.style.zIndex       = 2;
        card.style.pointerEvents = "auto";
      } else if (diff === total - 1) {
        card.style.transform    = "translate(calc(-50% - 260px), -50%) scale(0.9)";
        card.style.opacity      = 0.6;
        card.style.zIndex       = 2;
        card.style.pointerEvents = "auto";
      } else {
        card.style.transform    = "translate(-50%, -50%) scale(0.6)";
        card.style.opacity      = 0;
        card.style.zIndex       = 1;
        card.style.pointerEvents = "none";
      }
    });
  }

  cards.forEach((card, i) => {
    card.addEventListener("click", e => {
      if (e.target.closest("button, a")) return;
      const total = cards.length;
      const diff  = (i - index + total) % total;
      if (diff === 1)          index = (index + 1) % total;
      else if (diff === total - 1) index = (index - 1 + total) % total;
      updateCarousel();
    });
  });

  document.querySelectorAll("#projects button, #projects a").forEach(el => {
    el.addEventListener("click", e => e.stopPropagation());
  });

  updateCarousel();
});

/* ===================================================
   EXPERIENCE & ACHIEVEMENTS — Riddhi's data
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const timelineSection  = document.querySelector("#timeline");
  const experienceRow    = timelineSection?.querySelector(".timeline-experience");
  const achievementsRow  = timelineSection?.querySelector(".timeline-achievements");

  if (!experienceRow || !achievementsRow) return;

  const experienceData = [
    { title: "Internship",          sub: "Data Analytics (ongoing)" },
    { title: "Internship",          sub: "UI/UX Design" },
    { title: "Internship",          sub: "Content Writing" },
  ];

  const achievementData = [
    { title: "AWS Cloud Practitioner", sub: "Certified — Amazon Web Services" },
    { title: "AWS Security",           sub: "Specialty Badge" },
    { title: "AWS GenAI",              sub: "Generative AI Badge" },
    { title: "Power BI",               sub: "Microsoft Data Analytics" },
    { title: "UI/UX Certification",    sub: "Design Fundamentals" },
    { title: "Diwali Sales EDA",       sub: "Top Project — Data Analysis" },
  ];

  const renderCards = (row, items) => {
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card-mini";
      card.innerHTML = `<strong>${item.title}</strong><span>${item.sub}</span>`;
      row.appendChild(card);
    });
  };

  renderCards(experienceRow, experienceData);
  renderCards(achievementsRow, achievementData);
});

/* ===================================================
   CONTACT — send via mailto
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btn   = document.getElementById("sendBtn");
  const input = document.querySelector(".contact-input");

  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const message = input.value;
    if (!message.trim()) { alert("Please write a message"); return; }

    btn.innerText = "Opening Mail...";

    const email   = "sibal.riddhi@gmail.com";
    const subject = "Message from Portfolio";
    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  });
});

/* ===================================================
   MODALS
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  };

  const closeModal = (modal) => {
    if (modal) modal.style.display = "none";
  };

  document.querySelectorAll(".view-more").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-modal")));
  });

  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal(modal);
    });
  });
});

/* force-fix for any timing edge cases */
setTimeout(() => {
  document.querySelectorAll(".view-more").forEach(btn => {
    btn.onclick = function () {
      const modal = document.getElementById(this.getAttribute("data-modal"));
      if (modal) modal.style.display = "flex";
    };
  });

  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.onclick = function () {
      const modal = this.closest(".modal");
      if (modal) modal.style.display = "none";
    };
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.onclick = function (e) {
      if (e.target === this) this.style.display = "none";
    };
  });
}, 500);
