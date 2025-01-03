// ===================== ELEMENTS ==================================

// DOM Elements
const navbar = document.querySelector('nav');
const scrollIndicator = document.getElementById('scroll-indicator');
const imgElement = document.getElementById('image-sequence');
const container1 = document.querySelector('.container-1');
const location1 = document.querySelector('.location');
const container2 = document.querySelector('.container-2');
const button = navbar.querySelector('button');
const logo = navbar.querySelector('.logo');

// ===================== PRELOAD CONFIGURATIONS =====================

const imagesCache = {};
async function preloadAdditionalImages(basePath, folderName, framestep, endFrame = null) {
  const effectiveEndFrame = endFrame;
  if (!imagesCache[folderName]) {
    imagesCache[folderName] = [];
  }

  for (let frame = 1; frame <= effectiveEndFrame; frame += framestep) {
    const frameNumber = String(frame).padStart(4, '0');
    const img = new Image();

    if (folderName === "Sequence_cam_02" || folderName === "Sequence_cam_01") {
      img.src = `${basePath}/${folderName}/${folderName}_0${frameNumber}.webp`;
    } else if (folderName === "PC_2") {
      img.src = `${basePath}/${folderName}/PC_anim${frameNumber}.webp`;
    } else if (folderName === "Sc4webp") {
      img.src = `${basePath}/${folderName}/Sequence_cam_04.${frameNumber}.webp`;
    } else if (folderName === "Sequence_cam_03") {
      img.src = `${basePath}/${folderName}/Sequence_cam_03_0${frameNumber}.webp`;
    } else {
      img.src = `${basePath}/${folderName}/${folderName}${frameNumber}.webp`;
    }

    await new Promise((resolve) => {
      img.onload = () => {
        resolve();
      };
      img.onerror = resolve;
    });

    if (!imagesCache[folderName]) {
      imagesCache[folderName] = [];
    }
    imagesCache[folderName].push(img);
  }

  return imagesCache;
}

function playSequenceOnCanvas(canvasId, images, totalDuration, effect, onComplete) {
  const canvas = document.getElementById(canvasId);
  const context = canvas.getContext("2d");

  const totalFrames = images.length;
  const times = calculateExponentialTimes(totalFrames, totalDuration, effect);

  let startTime = null;

  function renderNextFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    const currentFrame = times.findIndex((time) => time > elapsed);
    if (currentFrame === -1 || currentFrame >= totalFrames) {
      if (onComplete) onComplete();
      return;
    }
    const image = images[currentFrame];
    canvas.width = image.width;
    canvas.height = image.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, image.width, image.height);
    handleImageSequenceEffectsByFrame(currentFrame);

    requestAnimationFrame(renderNextFrame);
  }

  requestAnimationFrame(renderNextFrame);
}

async function startRendering() {

  const sequences = [
    { basePath: "/assets", folder: "Sequence_cam_02", endFrame: 420, effect: "exponential-decelerate", framestep: 3 },
    { basePath: "/assets", folder: "Sequence_cam_01", endFrame: 420, effect: "exponential-accelerate", framestep: 3 },
    { basePath: "/assets/PC_anim", folder: "keycap", framestep: 6, endFrame: 360 },
  ];

  try {
    for (const sequence of sequences) {
      const { basePath, folder, framestep, endFrame } = sequence;
      await preloadAdditionalImages(basePath, folder, framestep, endFrame);
    }

    const playSequence = (id, images, duration, effect) => {
      return new Promise((resolve) => {
        playSequenceOnCanvas(id, images, duration, effect, resolve);
      });
    };

    await playSequence("image-sequence", imagesCache["Sequence_cam_02"], 4000, "exponential-accelerate");
    await playSequence("image-sequence", imagesCache["Sequence_cam_01"], 4000, "exponential-decelerate");

    const preloadConfigs = [
      { basePath: "/assets/PC_anim", folderName: "PC", framestep: 12, endFrame: 360 },
      { basePath: "/assets/PC_anim", folderName: "PC_2", framestep: 6, endFrame: 360 },
      { basePath: "/assets/PC_anim", folderName: "headphones", framestep: 12, endFrame: 360 },
      { basePath: "/assets", folderName: "01-Logo", framestep: 3, endFrame: 300 },
      { basePath: "/assets", folderName: "Sc4webp", framestep: 6, endFrame: 889, },
      { basePath: "/assets", folderName: "Sequence_cam_03", framestep: 2, endFrame: 599 },
    ];

    for (const config of preloadConfigs) {
      const { basePath, folderName, framestep, endFrame, } = config;
      await preloadAdditionalImages(basePath, folderName, framestep, endFrame,);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

startRendering();

// ===================== FIRST ANIMATION SEQUENCE =====================

const accelerateEffect = (t, duration) => duration * (1 - Math.pow(1 - t, 3));
const decelerateEffect = (t, duration) => duration * Math.pow(t, 3);

// Function to calculate exponential timing effects
function calculateExponentialTimes(totalFrames, duration, effect) {
  const times = [];
  const effectFunction = effect === "exponential-decelerate" ? decelerateEffect : accelerateEffect;

  for (let i = 0; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    times.push(effectFunction(t, duration));
  }

  return times;
}

// Handle specific effects when certain frames are shown
function handleImageSequenceEffectsByFrame(currentFrame) {
  if (currentFrame >= 85 && !location1.classList.contains('visible')) {
    container1.classList.add('visible');
    location1.classList.add('visible');
    if (!hasAnimated) {
      animateLines('.line');
      hasAnimated = true;
    }
  }
  if (currentFrame >= 94 && !navbar.classList.contains('visible')) {
    navbar.classList.add('visible');
    scrollIndicator.classList.add('visible');
  }
  if (currentFrame >= 114 && !container2.classList.contains('visible')) {
    container2.classList.add('visible');
    gsap.fromTo(container2, { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 2, ease: "power3.out" });
  }
  if (currentFrame >= 138) {
    phase = 1;
    hasAnimated = false;
  }
}

// ===================== LETTERS ANIMATIONS =====================

function animateLines(id) {

  const lines = document.querySelectorAll(id);

  lines.forEach(line => {
    const chars = line.textContent.split('');
    line.innerHTML = chars.map(char => {
      return char === ' ' ? `<span>&nbsp;</span>` : `<span>${char}</span>`;
    }).join('');
  });

  lines.forEach((line, index) => {
    const chars = line.querySelectorAll('span');
    gsap.fromTo(
      chars,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        delay: index * 0.5,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power2.out',
      }
    );
  });
}

// ===================== UPDATE NAVBAR STYLE =====================

async function updateStylesForPhase(phase, buttons) {
  if (buttons) {
    if (phase === 4) {
      button.style.backgroundColor = '#ffffff';
      button.style.color = 'var(--color-1)';
    } else {
      button.style.backgroundColor = 'var(--color-1)';
      button.style.color = '#ffffff';
    }
  }
  if (phase === 4) {
    logo.src = '/assets/logo/PeakIT-Logomark-White-Dark Background.svg';
    navbar.style.backgroundColor = '#FFFFFF29';
  } else {
    logo.src = '/assets/logo/PeakIT-Logomark-Dark-Blue Background.svg';
    navbar.style.backgroundColor = '#4a4a4a29';
  }
}

// ===================== AUXILIAR FUNCTIONS =====================

function element(id) {
  return document.getElementById(id);
}

function triggerGSAPAnimation(target, y = "0%", duration = 1, animationProps, ease = "power2.out") {
  gsap.to(document.getElementById(target), { duration, y, ...animationProps, ease });
}
function triggerGSAPAnimation2(target, animationProps, duration = 1, ease = "power2.out") {
  gsap.to(target, { duration, ...animationProps, ease });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===================== SCROLL ANIMATION =====================

let scrollTriggered = false;
let sectionPosition = 100;
let phase = 0;
let scrollDirection = 0;
let isAnimating = false;
let hasAnimated = false;
let isAnimatingPhase = false;

async function scrollAnimate(delta) {
  if (isAnimating) return;

  scrollDirection = delta > 0 ? 1 : -1;
  isAnimating = true;

  if (phase === 0) {
    isAnimating = false;
    return;
  }

  const phases = {
    1: handlePhase1,
    2: handlePhase2,
    3: handlePhase3,
    4: handlePhase4,
    5: handlePhase5,
    6: handlePhase6,
    6.2: handlePhase6_part2,
    6.3: handlePhase6_part3,
    7: handlePhase7,
    7.2: handlePhase7_part2,
    7.3: handlePhase7_part3,
    8: handlePhase8,
    10: handlePhase10,
    11: handlePhase11,
    12: handlePhase12,
    12.2: handlePhase12_part2,
    12.3: handlePhase12_part3,
    13: handlePhase13,
    14: handlePhase14,
    15: handlePhase15
  };

  await phases[phase](delta);
  sectionPosition = 100;

  isAnimating = false;
}

// ===================== SECTION 1 =====================

const isMobileGlobal = window.matchMedia("(max-width: 768px)").matches;

async function handlePhase1(delta) {
  sectionPosition -= delta;
  container2Position = Math.min(Math.max(sectionPosition - 100, -100), 0);

  const isMobileOrTablet = window.matchMedia("(max-width: 768px)").matches;
  const scrollIndicator = document.getElementById("scroll-indicator");

  // scroll down:
  if (scrollDirection === 1) {
    triggerGSAPAnimation2(imgElement, { scale: 1.2, filter: "blur(10px)" });
    triggerGSAPAnimation2(location1, { y: "-500%", opacity: 0, display: "none" });
    triggerGSAPAnimation2(container1, { y: "-200%", opacity: 0, display: "none" });
    triggerGSAPAnimation2(container2, { y: `${container2Position}%`, duration: 0.2 });

    if (isMobileOrTablet) {
      triggerGSAPAnimation2(scrollIndicator, { bottom: null, top: "5vh", duration: 1 });
    }
    await delay(1000);
    phase = 2;

    // scroll up:
  } else {
    triggerGSAPAnimation2(imgElement, { scale: 1, filter: "blur(0px)" });
    triggerGSAPAnimation2(location1, { y: "0", opacity: 1, display: "block" });
    triggerGSAPAnimation2(container1, { y: "0", opacity: 1, display: "block" });
    triggerGSAPAnimation2(container2, { y: `${container2Position}%`, duration: 0.2 });
    if (isMobileOrTablet) {
      triggerGSAPAnimation2(scrollIndicator, { bottom: "4vh", top: null, duration: 1 });
    }
    phase = 1;
  }
}

// ===================== SECTION 2 =====================

async function handlePhase2(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 100 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    if (!hasAnimated) {
      animateLines('.line2');
      hasAnimated = true;
    }
    await Promise.all([
      triggerGSAPAnimation('section2', "0%", 2),
      triggerGSAPAnimation('section1', "-120%", 2),
      updateStylesForPhase(2),
      await delay(500),
      renderKeycapImagesFrom180To360(500),
    ])
    console.log("aa")
    phase = 3;
    hasAnimated = false;
    isAnimatingPhase = false;

    // scroll up:
  } else {
    renderKeycapImagesFrom1To180();
    triggerGSAPAnimation('section2', "120%", 1);
    triggerGSAPAnimation('section1', "0", 1);
    updateStylesForPhase(4);
    phase = 1;
  }
}

// ===================== SECTION 3 =====================

async function handlePhase3(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    await Promise.all([
      renderKeycapImagesFrom1To180(),
      await delay(200),
      triggerGSAPAnimation('section3', "0%", 1),
      triggerGSAPAnimation('section2', `-50%`, 1),
      triggerGSAPAnimation('keyboard-sequence', "100%", 1),
      triggerGSAPAnimation('PC-sequence', "0%", 1),
      renderPCImages().then(() => {
        renderPCImages2();
      }),
      updateStylesForPhase(4, true)
    ])
    phase = 4;
    isAnimatingPhase = false;

    // scroll up:
  } else {
    renderKeycapImagesFrom180To360(500);
    triggerGSAPAnimation('section3', "100%", 1);
    triggerGSAPAnimation('section2', `0`, 1);
    triggerGSAPAnimation('keyboard-sequence', "0%", 1);
    triggerGSAPAnimation('PC-sequence', "-150%", 1);
    renderPCImages();
    updateStylesForPhase(2, true);
    phase = 2;
  }
}

// ===================== SECTION 4 =====================

async function handlePhase4(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    await Promise.all([
      triggerGSAPAnimation('section4', "0%", 1),
      triggerGSAPAnimation('section3', `-100%`, 1),
      triggerGSAPAnimation('headphones-sequence', "0%", 1),
      triggerGSAPAnimation('PC-sequence', "150%", 1),
      renderheadphonesImages(),
      renderPCImages(),
      updateStylesForPhase(2, true)
    ]);
    phase = 5;
    isAnimatingPhase = false;

    // scroll up:
  } else if (scrollDirection === -1) {
    triggerGSAPAnimation('section4', "100%", 1);
    triggerGSAPAnimation('section3', `0`, 1);
    triggerGSAPAnimation('PC-sequence', "0%", 1);
    triggerGSAPAnimation('headphones-sequence', "-150%", 1);
    renderheadphonesImages();
    renderPCImages();
    updateStylesForPhase(4, true);
    phase = 3;
  }
}

// ===================== SECTION 5 =====================

async function handlePhase5(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    if (!hasAnimated) {
      animateLines('.line3');
      hasAnimated = true;
    }
    await Promise.all([
      triggerGSAPAnimation2(element('section4'), { scale: 0.8, }, 2),
      triggerGSAPAnimation2(element('section5'), { opacity: 1 }, 0.2),
    ]);
    await delay(2000);
    phase = 6;
    hasAnimated = false;
    isAnimatingPhase = false;

    // scroll up:
  } else if (scrollDirection === -1) {
    isAnimatingPhase = true;
    await Promise.all([
      triggerGSAPAnimation2(element('section4'), { scale: 1, }, 2),
      triggerGSAPAnimation2(element('section5'), { opacity: 0 }, 0.2)
    ]);
    phase = 4; isAnimatingPhase = false;
  }
}

let isRendering = false;

// ===================== SECTION 6 =====================

async function handlePhase6(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    await Promise.all([
      triggerGSAPAnimation('section6', "0%", 1),
      triggerGSAPAnimation('section5', `-100%`, 1),
      await renderSc4ImagesPart1(),
      updateStylesForPhase(4)
    ])
    phase = 6.2;
    isAnimatingPhase = false;
    // scroll up:
  } else if (scrollDirection === -1) {
    triggerGSAPAnimation('section6', "100%", 1);
    triggerGSAPAnimation('section5', `0`, 1);
    renderSc4ImagesReversedPart1()
    updateStylesForPhase(2, true);
    phase = 5;
  }
}

async function handlePhase6_part2(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;
  const section6 = element('fade-in-out');

  if (section6) {
    // scroll down:
    if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
      isAnimatingPhase = true;

      await Promise.all([
        fadeOut(section6),
        renderSc4ImagesPart2(),
        delay(200),
        new Promise((resolve) => {
          section6.innerHTML = generateSectionContent(
            'Automation',
            'Streamline your operations with our intelligent automation solutions. We reduce manual workloads, minimise errors, and free up your team to focus on strategic initiatives that drive growth.',
            [
              { text: 'Process Optimization', icon: 'V' },
              { text: 'AI-Driven Workflows', icon: 'V' },
              { text: 'Integration Services', icon: 'V' },
              { text: 'Scalable Solutions', icon: 'V' }
            ]
          )
          resolve();
        }),
        fadeIn(section6)
      ])
      phase = 6.3;
      isAnimatingPhase = false;

      // scroll up:
    } else if (scrollDirection === -1) {
      phase = 6;
      section6.innerHTML = generateSectionContent(
        'Web Development',
        'At PeakIT, we craft bespoke websites that are more than just visually stunning— they are engineered for performance and conversion. Our team combines creativity with the latest technologies to deliver digital experiences that captivate and convert.',
        [
          { text: 'Custom Design & Development', icon: 'V' },
          { text: 'Responsive & Mobile-First Approach', icon: 'V' },
          { text: 'SEO & Accessibility Optimization', icon: 'V' },
          { text: 'E-Commerce Solutions', icon: 'V' }
        ]
      );
      renderSc4ImagesReversedPart2();
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

async function handlePhase6_part3(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;
  const section6 = element('fade-in-out');

  if (section6) {
    // scroll down:
    if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
      isAnimatingPhase = true;

      await Promise.all([
        fadeOut(section6),
        renderSc4ImagesPart3(),
        delay(200),
        new Promise((resolve) => {
          section6.innerHTML = generateSectionContent(
            'Cloud Solutions',
            'Harness the power of the cloud with our secure and scalable solutions. We help you migrate, manage, and optimize your cloud infrastructure, ensuring agility and resilience in a rapidly changing market.',
            [
              { text: 'Cloud Migration & Management', icon: 'V' },
              { text: 'Enhanced Security Protocols', icon: 'V' },
              { text: 'Integration Services', icon: 'V' },
              { text: 'Global Accessibility & Collaboration', icon: 'V' }
            ]
          );
          resolve();
        }),
        fadeIn(section6)
      ])
      isAnimatingPhase = false;
      phase = 7;

      // scroll up:
    } else if (scrollDirection === -1) {
      phase = 6.2;

      section6.innerHTML = generateSectionContent(
        'Automation',
        'Streamline your operations with our intelligent automation solutions. We reduce manual workloads, minimise errors, and free up your team to focus on strategic initiatives that drive growth.',
        [
          { text: 'Process Optimization', icon: 'V' },
          { text: 'AI-Driven Workflows', icon: 'V' },
          { text: 'Integration Services', icon: 'V' },
          { text: 'Scalable Solutions', icon: 'V' }
        ]
      );
      renderSc4ImagesReversedPart3();
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

function fadeOut(element) {
  element.style.transition = "opacity 0.5s ease-in-out";
  element.style.opacity = "0";
}

function fadeIn(element) {
  element.style.transition = "opacity 0.5s ease-in-out";
  element.style.opacity = "1";
}

function generateSectionContent(title, description, listItems) {
  const listHTML = listItems.map(item => `
    <li>
      <p>${item.text}</p>
      <h3>${item.icon}</h3>
    </li>
  `).join('');

  return `
    <div>
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
    <ul>${listHTML}</ul>
  `;
}

// ===================== SECTION 7 =====================

let isAnimatingPhase7 = false;

async function handlePhase7(delta) {
  if (isAnimatingPhase) return;
  sectionPosition = 100;
  sectionPosition -= delta;
  const section6 = element('fade-in-out');
  const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;

    fadeOut(section6);
    renderSc4ImagesPart4();
    await delay(500);
    triggerGSAPAnimation('section7', "0%", 1);
    triggerGSAPAnimation('section6', `-100%`, 1);
    if (isMobileOrTablet) {
      await animateLettersAndCardsMobile();
    } else {
      animateLettersAndCardsDesketop();
    }

    // scroll up:
  } else if (scrollDirection === -1) {
    phase = 6.3;
    triggerGSAPAnimation('section7', "100%", 1);
    triggerGSAPAnimation('section6', `0`, 1);
    activeIndexPhase7 = 0;
    isAnimatingPhase = false;

    const cards = document.querySelectorAll('.card');
    if (isMobileOrTablet) {

      gsap.set('.s7-title span span', { opacity: 0 });
      gsap.set('.s7-title:nth-child(1)', { left: null, right: null, opacity: 1 });
      gsap.set('.s7-title:nth-child(2)', { left: null, right: 0, opacity: 1 });

      gsap.set('#linetop', { left: null });
      gsap.set('#linebottom', { left: "35%" });

      cards.forEach(card => {
        gsap.set(card, {
          y: "100%",
          opacity: 0,
          scale: 1,
        });
      });

    } else {
      cards.forEach(card => gsap.killTweensOf(card));
      gsap.set('.s7-title span span', { opacity: 0 });
      gsap.set('.s7-title:nth-child(1)', { left: 0, opacity: 1 });
      gsap.set('.s7-title:nth-child(2)', { left: null, right: 0, opacity: 1 });

      gsap.set('#linetop', { left: "0%" });
      gsap.set('#linebottom', { left: "35%" });

      cards.forEach(card => {
        gsap.set(card, {
          x: 0,
          y: "180%",
          rotation: 0,
          rotationY: 0,
          opacity: 0,
        });
      });
    }

    section6.innerHTML = generateSectionContent(
      'Automation',
      'Streamline your operations with our intelligent automation solutions. We reduce manual workloads, minimise errors, and free up your team to focus on strategic initiatives that drive growth.',
      [
        { text: 'Process Optimization', icon: 'V' },
        { text: 'AI-Driven Workflows', icon: 'V' },
        { text: 'Integration Services', icon: 'V' },
        { text: 'Scalable Solutions', icon: 'V' }
      ]
    );
    fadeIn(section6);
    renderSc4ImagesReversedPart4();
  }
}

const cards = document.querySelectorAll(".card");

function animateLettersAndCardsDesketop() {
  const allLetters = document.querySelectorAll('.s7-title span span');
  gsap.set(cards, {
    x: 0,
    y: "180%",
    rotation: 0,
    rotationY: 0,
    opacity: 0,
  });

  gsap.timeline()
    .to(allLetters, { opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" })
    .to('.s7-title:nth-child(1)', { right: 0, opacity: 0.3, duration: 2, ease: "power2.inOut" })
    .to('.s7-title:nth-child(2)', { right: null, left: 0, opacity: 0.3, duration: 2, ease: "power2.inOut" }, "<")
    .to('#linetop', { left: '22%', duration: 2, ease: "power2.inOut" }, "<")
    .to('#linebottom', { left: 0, duration: 2, ease: "power2.inOut" }, "<")
    .to(cards, { x: 0, y: "-50%", opacity: 1, duration: 2, ease: "power3.out" }, "<")
    .to(cards, {
      rotation: (index) => 5 + index * 8, stagger: 0.1, duration: 1, ease: "power3.inOut"
    }, "-=1.3")
    .to(cards, { rotationY: "+=720", x: (index) => (index - 1) * 350, rotation: 0, duration: 0.9, ease: "power2.inOut" })
    .add(() => {
      cards.forEach((card, index) => {
        const delay = index === 1 ? 0.7 : 0;
        gsap.to(card, { y: "-=3", yoyo: true, repeat: -1, duration: 1, ease: "sine.inOut", delay });
        gsap.to(card, { x: "-=3", yoyo: true, repeat: -1, duration: 2, ease: "sine.inOut", delay });
      });
    })
    .add(() => {
      setTimeout(() => {
        phase = 8;
        isAnimatingPhase = false;
      }, 200);
    });
}
let currentCardIndex;
let activeIndexPhase7 = 0;

async function animateLettersAndCardsMobile() {
  const allLetters = document.querySelectorAll('.s7-title span span');
  cards.forEach(card => {
    gsap.set(card, {
      y: "100%",
      opacity: 0,
      scale: 1,
    });
  });

  const timeline = gsap.timeline();
  timeline
    .to(allLetters, { opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" })
    .to('.s7-title:nth-child(1)', { right: "0%", opacity: 0.3, duration: 2, ease: "power2.inOut" })
    .to('.s7-title:nth-child(2)', { right: "0%", left: 0, opacity: 0.3, duration: 2, ease: "power2.inOut" }, "<")
    .to('#linetop', { left: '22%', duration: 2, ease: "power2.inOut" }, "<")
    .to('#linebottom', { left: 0, duration: 2, ease: "power2.inOut" }, "<")
  await delay(2500);

  cards.forEach((card, index) => {
    timeline.to(card, {
      y: `${index * 115}%`,
      opacity: 1,
      duration: 1,
      delay: index * 0.1,
      ease: "power3.out",
    });
  });

  await delay(2000);
  phase = 7.2;
  isAnimatingPhase = false;
}

async function handlePhase7_part2(delta) {
  if (isAnimatingPhase) return;
  sectionPosition = 100;
  sectionPosition -= delta;
  const container = document.getElementById('container');

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    gsap.to(container, {
      y: "-=50vh",
      duration: 1.5,
      ease: "power2.out",
    });
    await delay(1500);
    phase = 7.3;
    isAnimatingPhase = false;

    // scroll up:
  } else if (scrollDirection === -1) {
    isAnimatingPhase = true;
    gsap.to(container, {
      y: "+=50vh",
      duration: 1.5,
      ease: "power2.out",
    });
    await delay(1500);
    phase = 7;
    isAnimatingPhase = false;
  }
}

async function handlePhase7_part3(delta) {
  if (isAnimatingPhase) return;
  sectionPosition = 100;
  sectionPosition -= delta;
  const container = document.getElementById('container');

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    gsap.to(container, {
      y: "-=50vh",
      duration: 1.5,
      ease: "power2.out",
    });
    await delay(1500);
    phase = 8;
    isAnimatingPhase = false;

    // scroll up:
  } else if (scrollDirection === -1) {
    isAnimatingPhase = true;
    gsap.to(container, {
      y: "+=50vh",
      duration: 1.5,
      ease: "power2.out",
    });
    await delay(1500);
    phase = 7.2;
    isAnimatingPhase = false;
  }
}

let handlePhase8Mounted = false;

// ===================== SECTION 8 =====================

async function handlePhase8(delta) {
  if (isAnimatingPhase) return;

  const isMobile = window.innerWidth <= 767;
  const isTablet = window.innerWidth > 767 && window.innerWidth <= 1024;

  // Variables for mobile, desktop and tablet:
  const shapeClipMobile = {
    x: '-3000%',
    y: '-200%',
    scale: 50,
    duration: 0.01,
  };

  const sectionTitleMobile = {
    scale: 1.1,
    x: '0%',
    opacity: 0,
    duration: 1.2,
  };

  const shapeClipTablet = {
    x: '-1500%',
    y: '-150%',
    scale: 40,
    duration: 0.01,
  };

  const sectionTitleTablet = {
    scale: 1.15,
    x: '0%',
    duration: 1.4,
    opacity: 0,
  };

  const shapeClipDesktop = {
    x: '-700%',
    y: '-300%',
    scale: 30,
    opacity: 1,
    duration: 0.01,
    ease: "power2.inOut",
  };

  const sectionTitleDesktop = {
    scale: 1.2,
    x: '0%',
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut",
  };

  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    if (!handlePhase8Mounted) {
      isAnimatingPhase = true;

      triggerGSAPAnimation('section8', "0%", 1);
      triggerGSAPAnimation('section7', `-100%`, 1);
      await delay(800);

      gsap.to("#shape-clip",
        isMobile ? shapeClipMobile :
          isTablet ? shapeClipTablet :
            shapeClipDesktop
      );
      gsap.to("#section8-title",
        isMobile ? sectionTitleMobile :
          isTablet ? sectionTitleTablet :
            sectionTitleDesktop
      );
      gsap.to("#background-image", {
        scale: isMobile ? 1.3 : isTablet ? 1.3 : 1.2,
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut",
      });
      await delay(800);

      await new Promise(resolve => {
        gsap.to("#shape-clip", {
          x: isMobile ? '5%' : isTablet ? '15%' : '50%',
          y: isMobile ? '15%' : isTablet ? '15%' : '20%',
          scale: isMobile ? 0.5 : isTablet ? 0.9 : 0.8,
          opacity: 1,
          duration: 2,
          ease: "power2.inOut",
          onComplete: resolve,
        });
        gsap.to("#background-image", {
          scale: isMobile ? 1.1 : isTablet ? 1.1 : 0.8,
          x: isMobile ? '0%' : isTablet ? '0%' : '25%',
          duration: 1.8,
          delay: 0.8,
          ease: "power2.inOut",
          onComplete: resolve,
        });
      });

      phase = 10;
      handlePhase8Mounted = true;
      isAnimatingPhase = false;
    } else {
      triggerGSAPAnimation('section8', "0%", 1);
      triggerGSAPAnimation('section7', `-100%`, 1);
      phase = 10;
    }
    // scroll up:
  } else {
    triggerGSAPAnimation('section8', "100%", 1);
    triggerGSAPAnimation('section7', `0`, 1);
    await delay(1000);
    if (isMobile || isTablet) {
      phase = 7.3;
    } else {
      phase = 7;
    }

    handlePhase8Mounted = false;

    gsap.to("#shape-clip",
      isMobile ? shapeClipMobile :
        isTablet ? shapeClipTablet :
          shapeClipDesktop
    );
    gsap.to("#section8-title",
      isMobile ? sectionTitleMobile :
        isTablet ? sectionTitleTablet :
          {
            scale: 1,
            x: '0%',
            opacity: 1,
            duration: 0.01,
            filter: "blur(0px)",
            ease: "power2.inOut",
          }
    );
    gsap.to("#background-image", {
      scale: 1,
      opacity: 1,
      x: '0%',
      duration: 0.01,
      ease: "power2.inOut",
    });
  }
}

// ===================== SECTION 10 =====================

let phaseStep = 0;

async function handlePhase10(delta) {
  if (isAnimatingPhase) return;
  const isMobile = window.innerWidth <= 768;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    if (phaseStep === 0) {
      isAnimatingPhase = true;
      if (!hasAnimated) {
        animateLines('.lineSection10');
        hasAnimated = true;
      }
      triggerGSAPAnimation('dancers', "-10%", 1.5);
      triggerGSAPAnimation('section10', "0%", 1.5);
      triggerGSAPAnimation('section8', `-100%`, 1.5);
      await delay(1500);
      phaseStep = 1; isAnimatingPhase = false;
      return;
    }
    if (phaseStep === 1) {
      isAnimatingPhase = true;
      triggerGSAPAnimation('dancers', "0%", 2);
      triggerGSAPAnimation('column-section10', isMobile ? "-80%" : "-20%", 2);
      triggerGSAPAnimation('section10Title', isMobile ? "-80vh" : "0%", 2);
      await delay(2000);
      phaseStep = 0;
      isAnimatingPhase = false; hasAnimated = false; phase = 11;
    }
    // scroll up:
  } else {
    isAnimatingPhase = true;
    triggerGSAPAnimation('section10', "100%", 1);
    triggerGSAPAnimation('section8', "0%", 1);
    triggerGSAPAnimation('dancers', "-20%", 2);
    triggerGSAPAnimation('column-section10', `0%`, 2);
    triggerGSAPAnimation('section10Title', isMobile ? "0%" : "-80vh", 2);
    await delay(2000);
    phase = 8; phaseStep = 0;
    isAnimatingPhase = false;
  }
}

// ===================== SECTION 11 =====================

async function handlePhase11(delta) {
  if (isAnimatingPhase) return;
  const isMobile = window.innerWidth <= 768;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    if (phaseStep === 0) {
      triggerGSAPAnimation('section11', "0%", 1.5);
      triggerGSAPAnimation('section10', `-100%`, 1.5);
      isAnimatingPhase = true;
      if (!hasAnimated) {
        animateLines('.lineSection11');
        hasAnimated = true;
      }
      triggerGSAPAnimation('notebook', "-10%", 1.5);
      await delay(2000);
      phaseStep = 1; isAnimatingPhase = false;
      return;
    }
    if (phaseStep === 1) {
      isAnimatingPhase = true;
      triggerGSAPAnimation('notebook', "0%", 2);
      triggerGSAPAnimation('column-section11', isMobile ? "-80%" : `-20%`, 2);
      triggerGSAPAnimation('section11Title', isMobile ? "-80vh" : "0%", 2);
      await delay(2000);
      phaseStep = 0; isAnimatingPhase = false; phase = 12; hasAnimated = false;
    }
    // scroll up:
  } else {
    triggerGSAPAnimation('section11', "100%", 1);
    triggerGSAPAnimation('section10', `0`, 1);
    triggerGSAPAnimation('notebook', "-20%", 2);
    triggerGSAPAnimation('column-section11', `0%`, 2);
    triggerGSAPAnimation('section11Title', isMobile ? "0%" : "-80vh", 2);
    phase = 10; phaseStep = 0;
  }
}

// ===================== SECTION 12 =====================

async function handlePhase12(delta) {
  if (isAnimatingPhase) return;
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    isAnimatingPhase = true;
    triggerGSAPAnimation('section12', "0vh", 1.5),
      triggerGSAPAnimation('section11', `-100%`, 1.5)
    updateStylesForPhase(2)
    if (!hasAnimated) {
      animateLines('.lineSection12');
      hasAnimated = true;
    }
    if (!isRendering) {
      renderLogoImages();
    }
    await delay(2000);
    phase = 12.2; isAnimatingPhase = false; hasAnimated = false;
    // scroll up:
  } else if (sectionPosition > 0 && scrollDirection === -1) {
    triggerGSAPAnimation('section11', "0%", 0.5),
      triggerGSAPAnimation('section12', "100%", 1.5);
    phase = 11;
    updateStylesForPhase(4);
  }
}

async function handlePhase12_part2(delta) {
  sectionPosition -= delta;
  const isMobile = window.innerWidth <= 1024;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    triggerGSAPAnimation('section12', isMobile ? "-80vh" : "-50vh", 1.5);
    triggerGSAPAnimation('Logo-sequence', isMobile ? "80vh" : "50vh", 1.5);
    await delay(1000);
    phase = 12.3;
    // scroll up:
  } else {
    triggerGSAPAnimation('section12', "0vh", 1);
    triggerGSAPAnimation('Logo-sequence', "0vh", 1);
    phase = 12;
  }
}

async function handlePhase12_part3(delta) {
  sectionPosition -= delta;
  const isMobile = window.innerWidth <= 1024;

  // scroll down:
  if (scrollDirection === 1) {
    if (isMobile) {
      if (phaseStep === 0) {
        triggerGSAPAnimation('section12', "-160vh", 1.5);
        triggerGSAPAnimation('Logo-sequence', "160vh", 1.5);
        await delay(1000);
        phaseStep = 1;
      } else if (phaseStep === 1) {
        triggerGSAPAnimation('section12', "-280vh", 1.5);
        triggerGSAPAnimation('Logo-sequence', "280vh", 1.5);
        await delay(1000);
        phase = 13;
      }
    } else {
      triggerGSAPAnimation('section12', "-100vh", 1.5);
      triggerGSAPAnimation('Logo-sequence', "100vh", 1.5);
      await delay(1000);
      phase = 13;
    }
    // scroll up:
  } else {
    if (isMobile) {
      if (phaseStep == 1) {
        triggerGSAPAnimation('section12', "-160vh", 1.5);
        triggerGSAPAnimation('Logo-sequence', "160vh", 1.5);
        phaseStep = 0;
      } else {
        triggerGSAPAnimation('section12', "-80vh", 1.5);
        triggerGSAPAnimation('Logo-sequence', "80vh", 1.5);
        phase = 12.2;
      }
    } else {
      triggerGSAPAnimation('section12', "-50vh", 1.5);
      triggerGSAPAnimation('Logo-sequence', "50vh", 1.5);
      phase = 12.2;
    }
  }
}

// ===================== SECTION 13 =====================

async function handlePhase13(delta) {
  sectionPosition -= delta;
  const isMobile = window.innerWidth <= 767;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    stopRendering = false; infiniteLoopCanvas = null;
    updateStylesForPhase(4)
    triggerGSAPAnimation('section13', "0%", 1.5);
    triggerGSAPAnimation('section12', `-100%`, 1.5);
    if (!hasAnimated) {
      animateLines('.lineSection13');
      hasAnimated = true;
    }

    if (activeIndex < cards2.length) {
      activateNextCard();
    } else {
      hasAnimated = false;
      phase = 14;
    }

    // scroll up:
  } else if (sectionPosition > 0 && scrollDirection === -1) {
    if (activeIndex > 0) {
      activatePreviousCard();
    }
    if (activeIndex === 0) {
      renderLogoImages();
      triggerGSAPAnimation('section12', "0%", 1),
        triggerGSAPAnimation('section13', "100%", 1);
      phase = 12;
      updateStylesForPhase(2)
    }
  }
}

const cards2 = document.querySelectorAll('.card2');
let activeIndex = 0;

function activateNextCard() {
  const isMobile = window.innerWidth <= 1024;

  if (activeIndex < cards2.length) {
    gsap.to(cards2[activeIndex], {
      duration: 0.8,
      y: 0,
      opacity: 1,
      scale: 1,
      ease: 'power3.out',
    });
    for (let i = 0; i < activeIndex; i++) {
      gsap.to(cards2[i], {
        duration: 0.8,
        y: isMobile ? `-${(activeIndex - i) * 50}px` : `-${(activeIndex - i) * 20}px`,
        opacity: 1 - (activeIndex - i) * 0.3,
        scale: 1 - (activeIndex - i) * 0.1,
        ease: 'power3.out',
      });
    }
    activeIndex++;
  }
}

function activatePreviousCard() {
  if (activeIndex > 0) {
    activeIndex--;

    gsap.to(cards2[activeIndex], {
      duration: 0.8,
      y: '100%',
      opacity: 0,
      scale: 1,
      ease: 'power3.out',
    });

    for (let i = 0; i < activeIndex; i++) {
      gsap.to(cards2[i], {
        duration: 0.8,
        y: `-${(activeIndex - i) * 20}px`,
        opacity: 1 - (activeIndex - i) * 0.3,
        scale: 1 - (activeIndex - i) * 0.05,
        ease: 'power3.out',
      });
    }
  }
}

// ===================== SECTION 14 =====================

let cardAnimation = null;
let cardsCreated = null;

async function handlePhase14(delta) {
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    updateStylesForPhase(4, true)
    triggerGSAPAnimation('section14', "0%", 1);
    triggerGSAPAnimation('section13', `-100%`, 1);
    if (!hasAnimated) {
      animateLines('.lineSection14');
      hasAnimated = true;
    }
    let totalCards;
    if (!cardsCreated) {
      const cardContainer = document.querySelector(".card-container3");
      const cards = document.querySelectorAll(".card3");
      totalCards = 6;

      for (let i = 0; i < 3; i++) {
        cards.forEach((card) => {
          const clone = card.cloneNode(true);
          cardContainer.appendChild(clone);
        });
      }
    }
    if (!cardAnimation) {
      gsap.to(".card-container3", {
        x: `-=${300 * totalCards}px`,
        ease: "linear",
        repeat: -1,
        duration: 20,
        paused: false
      });
    }
    await delay(700)
    phase = 15; cardAnimation = null;

    // scroll up:
  } else if (sectionPosition > 0 && scrollDirection === -1) {
    updateStylesForPhase(2, true)
    triggerGSAPAnimation('section14', "100%", 1);
    triggerGSAPAnimation('section13', `0`, 1);
    phase = 13; cardAnimation = null;
  }
}

// ===================== SECTION 15 =====================

async function handlePhase15(delta) {
  sectionPosition -= delta;

  // scroll down:
  if ((sectionPosition <= 0 || isMobileGlobal) && scrollDirection === 1) {
    if (!isRendering) {
      renderSequence_cam_03Images();
    }
    triggerGSAPAnimation('section15', "0%", 1);
    triggerGSAPAnimation('section14', `-100%`, 1);

    // scroll up:
  } else if (sectionPosition > 0 && scrollDirection === -1) {
    triggerGSAPAnimation('section15', "100%", 1);
    triggerGSAPAnimation('section14', `0`, 1);
    phase = 14;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

// ===================== SCROLL EVENT LISTNER =====================

let lastScrollTime = 0;
let lastTouchY = 0;

function onScroll(event) {
  const now = performance.now();
  if (now - lastScrollTime < 100) return;
  lastScrollTime = now;

  const delta = event.deltaY || event.detail || -event.wheelDelta || 0;
  scrollAnimate(delta);
}

function onTouchMove(event) {
  const touchY = event.touches[0].clientY;
  const delta = lastTouchY ? lastTouchY - touchY : 0;
  lastTouchY = touchY;

  if (Math.abs(delta) > 10) {
    scrollAnimate(delta);
  }
}

window.addEventListener('wheel', onScroll, { passive: false });

window.addEventListener('touchmove', onTouchMove, { passive: false });

window.addEventListener('touchend', () => {
  lastTouchY = 0;
});


// ===================== FUNCTION TO RENDER IMAGE'S SEQUENCES FOR SECTIONS 2, 3, 4, 6 AND 15 ===================

let stopRendering = false;
let infiniteLoopCanvas = null;

async function renderImagesWithCanvas({ canvasId, folderName, startFrame = 0, endFrame, duration, reverse = false }) {
  const canvas = element(canvasId);
  const context = canvas.getContext('2d');

  if (endFrame === undefined) {
    endFrame = imagesCache[folderName].length - 1;
  }

  let images = imagesCache[folderName].slice(startFrame, endFrame + 1);
  if (reverse) {
    images = images.reverse();
  }
  const interval = duration / images.length;

  return new Promise((resolve) => {
    let currentFrame = 0;

    function loadAndDrawImage() {
      if (stopRendering && infiniteLoopCanvas !== canvasId) {
        isRendering = false;
        resolve();
        return;
      }

      const img = images[currentFrame];

      if (img) {
        canvas.width = img.width;
        canvas.height = img.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width, img.height);
      }
      currentFrame++;

      if (currentFrame >= images.length) {
        if (infiniteLoopCanvas === canvasId) {
          currentFrame = 0;
        } else {
          isRendering = false;
          resolve()
          return;
        }
      }
      setTimeout(loadAndDrawImage, interval);
    }
    loadAndDrawImage();
  });
}

// Each animation's function:

// Section 2:

function renderKeycapImagesFrom180To360(time) {
  renderImagesWithCanvas({
    canvasId: 'keyboard-sequence',
    folderName: 'keycap',
    startFrame: 30,
    endFrame: 60,
    duration: time,
  });
}

function renderKeycapImagesFrom1To180() {
  renderImagesWithCanvas({
    canvasId: 'keyboard-sequence',
    folderName: 'keycap',
    endFrame: 30,
    duration: 500,
  });
}

// Section 3:

function renderheadphonesImages() {
  renderImagesWithCanvas({
    canvasId: 'headphones-sequence',
    folderName: 'headphones',
    duration: 800,
  });
}

// Section 4:

function renderPCImages() {
  return renderImagesWithCanvas({
    canvasId: 'PC-sequence',
    folderName: 'PC',
    duration: 800,
  });
}

function renderPCImages2() {
  renderImagesWithCanvas({
    canvasId: 'PC-sequence',
    folderName: 'PC_2',
    duration: 2000,
  });
}

// Section 6:

async function renderSc4ImagesPart1() {
  await renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 1,
    endFrame: 38,
    duration: 1000,
  });
}

async function renderSc4ImagesPart2() {
  await renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 38,
    endFrame: 76,
    duration: 1000,
  });
}

async function renderSc4ImagesPart3() {
  await renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 76,
    endFrame: 108,
    duration: 1000,
  });
}

async function renderSc4ImagesPart4() {
  await renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 108,
    endFrame: 149,
    duration: 1000,
  });
}

// Section 6 Reversed:

function renderSc4ImagesReversedPart1() {
  renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 1,
    endFrame: 38,
    duration: 1000,
    reverse: true
  });
}

function renderSc4ImagesReversedPart2() {
  renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 38,
    endFrame: 76,
    duration: 1000,
    reverse: true
  });
}

function renderSc4ImagesReversedPart3() {
  renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 76,
    endFrame: 108,
    duration: 1000,
    reverse: true
  });
}

function renderSc4ImagesReversedPart4() {
  renderImagesWithCanvas({
    canvasId: 'Sc4-sequence',
    folderName: 'Sc4webp',
    startFrame: 108,
    endFrame: 148,
    duration: 1000,
    reverse: true
  });
}

// Section 12:

async function renderLogoImages() {
  if (isRendering) return;
  isRendering = true;

  stopRendering = false;
  infiniteLoopCanvas = 'Logo-sequence';
  await renderImagesWithCanvas({
    canvasId: 'Logo-sequence',
    folderName: '01-Logo',
    duration: 3000,
  });
}

// Section 15:

async function renderSequence_cam_03Images() {
  if (isRendering) return;
  isRendering = true;

  stopRendering = false;
  infiniteLoopCanvas = 'Sequence_cam_03';
  await renderImagesWithCanvas({
    canvasId: 'Sequence_cam_03',
    folderName: 'Sequence_cam_03',
    duration: 10000,
  });
}