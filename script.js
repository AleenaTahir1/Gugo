// Gugo — Guess the Right Logo
// Our team: Aleena & Saqlain

(() => {
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  const intro = qs('#intro');
  const board = qs('#board');
  const outro = qs('#outro');
  const optionsEl = qs('#options');
  const questionText = qs('#questionText');
  const progressBar = qs('#progressBar');

  const levelPill = qs('#levelPill');
  const scorePill = qs('#scorePill');

  const startBtn = qs('#startBtn');
  const nextBtn = qs('#nextBtn');
  const skipBtn = qs('#skipBtn');
  const replayBtn = qs('#replayBtn');
  const finalSummary = qs('#finalSummary');
  const finalMessage = qs('#finalMessage');
  const toast = qs('#toast');
  const levelup = qs('#levelup');
  const continueBtn = qs('#continueBtn');
  const confettiCanvas = qs('#confettiCanvas');

  // Utility: shuffle an array
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Enhanced feedback popup system
  function showFeedbackPopup(message, type = 'success', duration = 2000) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.feedback-popup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.className = `feedback-popup ${type}`;
    popup.innerHTML = `
      <div class="popup-icon">${type === 'success' ? '🎉' : '❌'}</div>
      <div class="popup-message">${message}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Trigger animation
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
      popup.classList.add('hide');
      setTimeout(() => popup.remove(), 300);
    }, duration);
  }
  
  // Legacy toast helper for backwards compatibility
  function showToast(message, type = 'success') {
    showFeedbackPopup(message, type, 1500);
  }

  // Helper to build an option using an image source
  const imgOption = (src, alt, correct) => ({
    render: () => `<img src="${src}" alt="${alt}" onerror="this.style.opacity=0.2;this.alt='Missing image';" />`,
    correct,
    src,
  });

  // Properly organized levels by difficulty - Easy to Hard
  const level1 = [
    {
      brand: 'Samsung',
      prompt: 'Find the correct Samsung logo',
      options: [
        imgOption('assets/samsung_right.jpg', 'Samsung right', true),
        imgOption('assets/samsung_wrong.jpg', 'Samsung wrong', false),
      ],
    },
    {
      brand: 'Coca Cola',
      prompt: 'Which Coca Cola logo is correct?',
      options: [
        imgOption('assets/coca_right.jpg', 'Coca Cola right', true),
        imgOption('assets/coca_wrong.jpg', 'Coca Cola wrong', false),
      ],
    },
    {
      brand: 'HP',
      prompt: 'Find the correct HP logo',
      options: [
        imgOption('assets/hp_right.jpg', 'HP right', true),
        imgOption('assets/hp_wrong.jpg', 'HP wrong', false),
      ],
    },
    {
      brand: 'Oreo',
      prompt: 'Which Oreo logo is the real one?',
      options: [
        imgOption('assets/oreo_right.jpg', 'Oreo right', true),
        imgOption('assets/oreo_wrong.jpg', 'Oreo wrong', false),
      ],
    },
  ];

  const level2 = [
    {
      brand: 'Android',
      prompt: 'Select the correct Android logo',
      options: [
        imgOption('assets/andriod_right.jpg', 'Android right', true),
        imgOption('assets/andriod_wrong.jpg', 'Android wrong', false),
      ],
    },
    {
      brand: 'PayPal',
      prompt: 'Which PayPal logo is authentic?',
      options: [
        imgOption('assets/paypal_right.jpg', 'PayPal right', true),
        imgOption('assets/paypal_wrong.jpg', 'PayPal wrong', false),
      ],
    },
    {
      brand: 'Puma',
      prompt: 'Which Puma logo is correct?',
      options: [
        imgOption('assets/puma_right.jpg', 'Puma right', true),
        imgOption('assets/puma_wrong.jpg', 'Puma wrong', false),
      ],
    },
    {
      brand: 'Chrome',
      prompt: 'Pick the correct Chrome logo',
      options: [
        imgOption('assets/chrome_right.jpg', 'Chrome right', true),
        imgOption('assets/chrome_wrong.jpg', 'Chrome wrong', false),
      ],
    },
  ];

  const level3 = [
    {
      brand: 'LT Logo',
      prompt: 'Spot the correct LT logo',
      options: [
        imgOption('assets/lt_rightt.jpg', 'LT right', true),
        imgOption('assets/lt_wrong.jpg', 'LT wrong', false),
      ],
    },
    {
      brand: 'Honda',
      prompt: 'Select the correct Honda logo',
      options: [
        imgOption('assets/honda_right.jpg', 'Honda right', true),
        imgOption('assets/honda_wrong.jpg', 'Honda wrong', false),
      ],
    },
    {
      brand: 'NASA',
      prompt: 'Pick the authentic NASA logo',
      options: [
        imgOption('assets/nasa_right.jpg', 'NASA right', true),
        imgOption('assets/nasa_wrong.jpg', 'NASA wrong', false),
      ],
    },
    {
      brand: 'Citroën',
      prompt: 'Find the correct Citroën logo',
      options: [
        imgOption('assets/citroen_right.jpg', 'Citroën right', true),
        imgOption('assets/citroen_wrong.jpg', 'Citroën wrong', false),
      ],
    },
  ];

  const LEVELS = [level1, level2, level3];
  const LEVEL_LABELS = ['Level 1 • Easy', 'Level 2 • Intermediate', 'Level 3 • Hard'];

  let state = {
    levelIndex: 0,
    roundIndex: 0,
    score: 0,
    locked: false,
    order: [], // randomized order of rounds within a level
    pendingNextLevel: null,
  };

  function resetGame() {
    state.levelIndex = 0;
    state.roundIndex = 0;
    state.score = 0;
    state.locked = false;
    state.order = [];
    updateScore();
    updateLevelPill();
    setProgress(0, totalRounds());
  }

  function totalRounds() {
    return LEVELS.reduce((acc, lv) => acc + lv.length, 0);
  }

  function roundsInCurrentLevel() {
    return LEVELS[state.levelIndex].length;
  }

  function updateScore() {
    scorePill.textContent = `Score: ${state.score}`;
  }

  function updateLevelPill() {
    levelPill.textContent = LEVEL_LABELS[state.levelIndex];
  }

  function setProgress(done, total) {
    const pct = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));
    progressBar.style.width = pct + '%';
  }

  function showIntro() {
    intro.classList.remove('hidden');
    board.classList.add('hidden');
    outro.classList.add('hidden');
  }

  function showBoard() {
    intro.classList.add('hidden');
    board.classList.remove('hidden');
    outro.classList.add('hidden');
  }

  function showOutro() {
    intro.classList.add('hidden');
    board.classList.add('hidden');
    outro.classList.remove('hidden');
  }

  function prepareLevel(index) {
    state.levelIndex = index;
    state.roundIndex = 0;
    state.locked = false;
    const rounds = LEVELS[state.levelIndex];
    state.order = shuffle([...Array(rounds.length).keys()]);
    updateLevelPill();
  }

  function currentRound() {
    const rounds = LEVELS[state.levelIndex];
    return rounds[state.order[state.roundIndex]];
  }

  function renderRound() {
    nextBtn.disabled = true;
    optionsEl.innerHTML = '';
    state.locked = false;

    const round = currentRound();
    questionText.textContent = round.prompt;

    // Randomly place correct/incorrect
    const opts = shuffle(round.options);

    opts.forEach((opt, idx) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.dataset.correct = String(!!opt.correct);
      card.innerHTML = `
        <div class="art">${opt.render()}</div>
        <div class="caption">Option ${idx + 1}</div>
      `;
      card.addEventListener('click', () => onSelect(card, opt));
      optionsEl.appendChild(card);
    });
  }

  function onSelect(card, opt) {
    if (state.locked) return;
    state.locked = true;

    qsa('.card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');

    if (opt.correct) {
      card.classList.add('correct');
      state.score += 1; // 1 point per correct guess
      updateScore();
      showFeedbackPopup('Correct! Well done!', 'success', 2000);
      // Add green light effect
      document.body.classList.add('success-flash');
      setTimeout(() => document.body.classList.remove('success-flash'), 800);
    } else {
      card.classList.add('wrong');
              showFeedbackPopup('Oops! That\'s not right', 'error', 2500);
      // Add red flash effect
      document.body.classList.add('error-flash');
      setTimeout(() => document.body.classList.remove('error-flash'), 800);
      // highlight the correct one
      const cards = qsa('.card');
      const found = cards.find((c) => c.dataset.correct === 'true');
      if (found) {
        found.classList.add('correct');
        setTimeout(() => {
          found.classList.add('reveal-correct');
        }, 500);
      }
    }

    nextBtn.disabled = false;
  }

  function nextRound() {
    const totalSoFar = LEVELS.slice(0, state.levelIndex).reduce((acc, lv) => acc + lv.length, 0);
    const doneWithinLevel = state.roundIndex + 1;
    setProgress(totalSoFar + doneWithinLevel, totalRounds());

    if (state.roundIndex < roundsInCurrentLevel() - 1) {
      state.roundIndex += 1;
      renderRound();
      return;
    }

    // Move to next level or finish
    if (state.levelIndex < LEVELS.length - 1) {
      // Show enhanced level-up modal with success animation
      state.pendingNextLevel = state.levelIndex + 1;
      const levelupTitle = qs('#levelupTitle');
      const levelupSub = qs('#levelupSub');
      
      levelupTitle.innerHTML = `🎆 Level ${state.levelIndex + 1} Complete!`;
      levelupSub.innerHTML = `Fantastic! You've successfully passed level ${state.levelIndex + 1}.<br>Ready for the next challenge?`;
      
      // Hide the game board first
      showBoard();
      
      // Force show the modal with a slight delay
      setTimeout(() => {
        levelup.classList.remove('hidden');
        levelup.style.display = 'grid';
        // Add celebration effect
        levelup.classList.add('celebrate');
        
        // Mini confetti for level completion
        setTimeout(() => launchMiniConfetti(), 200);
        
        // Try to focus the button for accessibility
        setTimeout(() => continueBtn.focus(), 100);
      }, 100);
      
      return;
    }

    // Finished all levels - Enhanced finale with Synnapic chatbot message
    const totalQuestions = totalRounds();
    const percentage = Math.round((state.score / totalQuestions) * 100);
    
    finalSummary.innerHTML = `🏆 Final Score: <span class="big-score">${state.score}/${totalQuestions}</span> (${percentage}%)`;
    finalMessage.innerHTML = `<div class="score-message">${endMessage()}</div>`;
    
    showOutro();
    
    // Enhanced celebration based on performance
    if (percentage >= 90) {
      launchConfetti(4000);
      setTimeout(() => launchFireworks(), 1000);
    } else if (percentage >= 70) {
      launchConfetti(3000);
    } else {
      launchConfetti(2000);
    }
    
    // removed Synapix/Synnapic popup trigger
  }

  function skipRound() {
    if (!board.classList.contains('hidden')) {
      nextBtn.disabled = false;
      nextRound();
    }
  }

  // Event bindings
  startBtn.addEventListener('click', () => {
    resetGame();
    prepareLevel(0);
    showBoard();
    renderRound();
  });

  nextBtn.addEventListener('click', () => {
    nextRound();
  });

  skipBtn.addEventListener('click', () => {
    skipRound();
  });

  replayBtn.addEventListener('click', () => {
    resetGame();
    prepareLevel(0);
    showIntro();
  });

  // Persistent handler for Continue button to avoid multiple bindings
  continueBtn.addEventListener('click', () => {
    if (state.pendingNextLevel != null) {
      const nextLevel = state.pendingNextLevel;
      state.pendingNextLevel = null;
      levelup.classList.add('hidden');
      levelup.style.display = 'none';
      levelup.classList.remove('celebrate');
      prepareLevel(nextLevel);
      renderRound();
    }
  });

  // Initialize landing view
  showIntro();

  function endMessage() {
    const total = totalRounds();
    const pct = (state.score / total) * 100;
    if (pct === 100) return '🏆 PERFECT SCORE! You are a logo master! Absolutely incredible!';
    if (pct >= 90) return '🎆 Legendary! You have a logo genius brain! Outstanding performance!';
    if (pct >= 80) return '🌟 Excellent! Your attention to detail is remarkable!';
    if (pct >= 70) return '🚀 Awesome! Strong eye for detail. You\'re really good at this!';
    if (pct >= 60) return '💪 Great job! You have a solid understanding of brand design!';
    if (pct >= 50) return '👍 Nice work! Keep sharpening those observational skills!';
    return '🎯 Good effort! Practice makes perfect — give it another try to improve!';
  }
  
  
  // Enhanced confetti system
  function launchConfetti(durationMs = 2000) {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    const W = confettiCanvas.width = confettiCanvas.offsetWidth;
    const H = confettiCanvas.height = confettiCanvas.offsetHeight;
    const colors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#f15bb5','#ff9500','#ff006e'];
    const pieces = Array.from({ length: 250 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H,
      w: 4 + Math.random() * 8,
      h: 8 + Math.random() * 16,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: 1.5 + Math.random() * 4,
      a: Math.random() * Math.PI * 2,
      r: (Math.random() - 0.5) * 0.3,
    }));

    let start = performance.now();
    function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.y += p.s;
        p.x += Math.sin((p.y + p.a) * 0.015);
        p.a += p.r;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
        if (p.y > H + 20) {
          p.y = -20 - Math.random() * 100;
          p.x = Math.random() * W;
        }
      });
      if (elapsed < durationMs) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Mini confetti for level completion
  function launchMiniConfetti() {
    const miniCanvas = document.createElement('canvas');
    miniCanvas.style.position = 'fixed';
    miniCanvas.style.top = '0';
    miniCanvas.style.left = '0';
    miniCanvas.style.width = '100%';
    miniCanvas.style.height = '100%';
    miniCanvas.style.pointerEvents = 'none';
    miniCanvas.style.zIndex = '3000';
    document.body.appendChild(miniCanvas);
    
    const ctx = miniCanvas.getContext('2d');
    const W = miniCanvas.width = window.innerWidth;
    const H = miniCanvas.height = window.innerHeight;
    const colors = ['#30d158','#6c8bff','#ffd93d','#ff6b6b'];
    const pieces = Array.from({ length: 60 }, () => ({
      x: W/2 + (Math.random() - 0.5) * 200,
      y: H/2,
      vx: (Math.random() - 0.5) * 8,
      vy: -3 - Math.random() * 5,
      w: 4 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * Math.PI * 2,
      r: (Math.random() - 0.5) * 0.3,
    }));

    let start = performance.now();
    function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.a += p.r;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < 1500) {
        requestAnimationFrame(frame);
      } else {
        miniCanvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  // Fireworks for perfect scores
  function launchFireworks() {
    const fireworksCanvas = document.createElement('canvas');
    fireworksCanvas.style.position = 'fixed';
    fireworksCanvas.style.top = '0';
    fireworksCanvas.style.left = '0';
    fireworksCanvas.style.width = '100%';
    fireworksCanvas.style.height = '100%';
    fireworksCanvas.style.pointerEvents = 'none';
    fireworksCanvas.style.zIndex = '2500';
    document.body.appendChild(fireworksCanvas);
    
    const ctx = fireworksCanvas.getContext('2d');
    const W = fireworksCanvas.width = window.innerWidth;
    const H = fireworksCanvas.height = window.innerHeight;
    
    const fireworks = [];
    
    function createFirework() {
      const colors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#f15bb5','#ff9500'];
      const x = Math.random() * W;
      const y = H * 0.3 + Math.random() * H * 0.3;
      const particles = [];
      
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          decay: 0.015 + Math.random() * 0.01
        });
      }
      
      fireworks.push({ particles, born: performance.now() });
    }
    
    // Create multiple fireworks
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createFirework(), i * 300);
    }
    
    function frame() {
      ctx.clearRect(0, 0, W, H);
      
      fireworks.forEach((fw, fwIndex) => {
        fw.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1; // gravity
          p.life -= p.decay;
          
          if (p.life > 0) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
        
        // Remove dead fireworks
        if (fw.particles.every(p => p.life <= 0)) {
          fireworks.splice(fwIndex, 1);
        }
      });
      
      if (fireworks.length > 0) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => fireworksCanvas.remove(), 1000);
      }
    }
    
    requestAnimationFrame(frame);
  }
})();
