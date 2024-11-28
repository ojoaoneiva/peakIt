// Elements
const navbar = document.querySelector('nav');
const scrollIndicator = document.getElementById('scroll-indicator');
const imgElement = document.getElementById('image-sequence');
const container1 = document.querySelector('.container-1');
const location1 = document.querySelector('.location');
const container2 = document.querySelector('.container-2');

// Initial image Sequence configurations: folder names, total frames, and animation effect
const sequences = [
  { folder: "Sequence_cam_02", totalFrames: 480, effect: "exponential-decelerate" },
  { folder: "Sequence_cam_01", totalFrames: 420, effect: "exponential-accelerate" }
];

// Preload images for each sequence
function preloadImages(folder, totalFrames) {
  return Array.from({ length: totalFrames }, (_, i) => {
    const frameNumber = String(i).padStart(5, '0');
    const img = new Image();
    img.src = `assets/${folder}/${folder}_${frameNumber}.webp`;
    return img;
  });
}

// Preload all sequences
const preloadedSequences = sequences.map(seq =>
  preloadImages(seq.folder, seq.totalFrames)
);

// Calculate the timing for exponential effects
function calculateExponentialTimes(totalFrames, totalDuration, effect) {
  const times = [];
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / (totalFrames - 1); // Progress from 0 to 1
    if (effect === "exponential-accelerate") {
      times.push(totalDuration * Math.pow(progress, 4)); // Accelerate effect
    } else if (effect === "exponential-decelerate") {
      times.push(totalDuration * (1 - Math.pow(1 - progress, 4))); // Decelerate effect
    }
  }
  return times;
}

// Play the image sequence with animation timing
function playSequence(images, totalDuration, effect, onComplete) {
  const totalFrames = images.length;
  const times = calculateExponentialTimes(totalFrames, totalDuration, effect);

  const tl = gsap.timeline({ onComplete });

  images.forEach((image, i) => {
    const time = i === 0 ? 0 : (times[i] - times[i - 1]) / 1000; // Convert time to seconds
    tl.to(imgElement, {
      duration: time,
      onUpdate: () => {
        imgElement.src = image.src;

        // Show elements based on specific frames
        if (image.src.includes('Sequence_cam_01_00000.webp') && !container1.classList.contains('visible')) {
          container1.classList.add('visible');
          animateLetters();
        }
        if (image.src.includes('Sequence_cam_01_00180.webp') && !location1.classList.contains('visible')) {
          location1.classList.add('visible');
        }
        if (image.src.includes('Sequence_cam_01_00230.webp') && !navbar.classList.contains('visible')) {
          navbar.classList.add('visible');
          scrollIndicator.classList.add('visible');
        }
        if (image.src.includes('Sequence_cam_01_00300.webp') && !container2.classList.contains('visible')) {
          container2.classList.add('visible');
          animateContainer2();
        }
      }
    });
  });
}

// Animating the h2 text from Section #1:
// Wrap each letter in a span for animation
function wrapLettersInSpan() {
  const lines = document.querySelectorAll('.line');
  lines.forEach(line => {
    const text = line.textContent;
    line.innerHTML = ''; // Clear the content
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Preserve spaces
      line.appendChild(span);
    });
  });
}

// Animate the letters with GSAP
function animateLetters() {
  gsap.timeline()
    .to(".line:nth-child(1) span", {
      duration: 0.6,
      y: "0%",
      opacity: 1,
      stagger: { amount: 1, from: "start", ease: "power3.out" }
    }, 0)
    .to(".line:nth-child(2) span", {
      duration: 0.6,
      y: "0%",
      opacity: 1,
      stagger: { amount: 1, from: "start", ease: "power3.out" }
    }, 0.5)
    .to(".line:nth-child(3) span", {
      duration: 0.6,
      y: "0%",
      opacity: 1,
      stagger: { amount: 1, from: "start", ease: "power3.out" }
    }, 1);
}

// Animate the container2 from Section #1
function animateContainer2() {
  gsap.fromTo(
    container2,
    { y: "100%", opacity: 0 }, // Starts from the bottom off-screen
    { y: "0%", opacity: 1, duration: 2, ease: "power3.out" } // Final position
  );
}

// Start the animation after preloading images
Promise.all(
  preloadedSequences.flat().map(img => new Promise(resolve => (img.onload = resolve)))
)
  .then(() => {
    const totalDuration = 10000; // Total duration of the animation (10 seconds)
    
    // Play the first sequence (35% duration) then the second sequence (65% duration)
    playSequence(preloadedSequences[0], totalDuration * 0.4, "exponential-decelerate", () =>
      playSequence(preloadedSequences[1], totalDuration * 0.6, "exponential-accelerate")
    );
  })
  .catch(err => console.error("Error loading images:", err));

// Wrap letters in span on page load
wrapLettersInSpan();
