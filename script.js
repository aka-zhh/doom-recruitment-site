/**
 * ==============================================================================
 * DOOMSDAY COLLEGE CLUB RECRUITMENT SYSTEM
 * Modular Script Engine: Gateway Intro, Synth Audio, VFX Canvas, 3D Tilt & Form
 * ==============================================================================
 */

(function () {
  'use strict';

  // State Management
  const State = {
    audioEnabled: false,
    audioContext: null,
    introCompleted: false,
    particles: [],
    lightningActive: false,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  };

  /* ============================================================================
     1. WEB AUDIO SYNTHESIZER (Cinematic Sci-Fi SFX Without External Files)
     ============================================================================ */
  const AudioFX = {
    init: function () {
      if (!State.audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          State.audioContext = new AudioContextClass();
        }
      }
      if (State.audioContext && State.audioContext.state === 'suspended') {
        State.audioContext.resume();
      }
    },

    playDrone: function () {
      if (!State.audioEnabled || !State.audioContext) return;
      try {
        const ctx = State.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 3);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 4.5);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    },

    playDoorOpen: function () {
      if (!State.audioEnabled || !State.audioContext) return;
      try {
        const ctx = State.audioContext;
        // Low rumble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 2.8);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.3);

        // Noise burst (hydraulics / heavy iron friction)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 2.5);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.6);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + 2.7);
      } catch (e) {}
    },

    playClick: function () {
      if (!State.audioEnabled || !State.audioContext) return;
      try {
        const ctx = State.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    },

    playInitiationSuccess: function () {
      if (!State.audioEnabled || !State.audioContext) return;
      try {
        const ctx = State.audioContext;
        const notes = [220, 277.18, 329.63, 440, 554.37, 659.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, ctx.currentTime);

          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
        });
      } catch (e) {}
    }
  };

  /* ============================================================================
     2. INTRO ANIMATION CONTROLLER (The Gateway of Doom)
     ============================================================================ */
  const GatewayIntro = {
    overlay: null,
    viewport: null,
    skipBtn: null,
    triggerBtn: null,
    isOpening: false,

    init: function () {
      this.overlay = document.getElementById('gateway-overlay');
      this.viewport = document.getElementById('door-viewport');
      this.skipBtn = document.getElementById('skip-intro-btn');
      this.triggerBtn = document.getElementById('trigger-open-btn');

      if (!this.overlay) return;

      // Check if user already viewed intro in this session
      const hasSeenIntro = sessionStorage.getItem('doom_gateway_opened');

      if (hasSeenIntro === 'true') {
        // Fast unlock for returning navigation, but keep replay button ready
        this.unlockImmediate();
      } else {
        // Prepare initial animation
        this.bindEvents();
        // Automatically start the sequence after brief atmospheric pause (1.4s)
        this.autoTimer = setTimeout(() => {
          if (!this.isOpening && !State.introCompleted) {
            this.executeSequence();
          }
        }, 1400);
      }

      // Replay gateway button in header/footer
      const replayButtons = document.querySelectorAll('.btn-replay-gateway');
      replayButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.replaySequence();
        });
      });
    },

    bindEvents: function () {
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearTimeout(this.autoTimer);
          this.unlockImmediate();
        });
      }

      if (this.triggerBtn) {
        this.triggerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearTimeout(this.autoTimer);
          AudioFX.init();
          this.executeSequence();
        });
      }
    },

    executeSequence: function () {
      if (this.isOpening) return;
      this.isOpening = true;

      // Play audio cues
      AudioFX.playDrone();
      setTimeout(() => AudioFX.playDoorOpen(), 600);

      // Stage 1: Crack of energy and doors begin opening
      this.viewport.classList.add('doors-opening');

      // Update Doom Figure visual state
      const doomFig = document.querySelector('.doom-figure-container');
      if (doomFig) {
        doomFig.classList.add('doom-energy-glow');
      }

      // Stage 2: Doors swing fully outward (animation takes ~3.2s)
      // Reveal the lair, fade out gateway overlay
      setTimeout(() => {
        this.overlay.classList.add('unlocked');
        State.introCompleted = true;
        sessionStorage.setItem('doom_gateway_opened', 'true');
      }, 2600);

      setTimeout(() => {
        this.overlay.style.display = 'none';
        this.isOpening = false;
      }, 3800);
    },

    unlockImmediate: function () {
      clearTimeout(this.autoTimer);
      if (this.overlay) {
        this.overlay.classList.add('unlocked');
        this.overlay.style.display = 'none';
      }
      State.introCompleted = true;
      sessionStorage.setItem('doom_gateway_opened', 'true');
    },

    replaySequence: function () {
      if (!this.overlay) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.overlay.style.display = 'block';
      this.overlay.classList.remove('unlocked');
      this.viewport.classList.remove('doors-opening');

      const doomFig = document.querySelector('.doom-figure-container');
      if (doomFig) {
        doomFig.classList.remove('doom-energy-glow');
      }

      this.isOpening = false;
      setTimeout(() => {
        this.executeSequence();
      }, 300);
    }
  };

  /* ============================================================================
     3. POST-APOCALYPTIC CANVAS (Lightning, Green Embers & Atmospheric Fog)
     ============================================================================ */
  const AtmosphericCanvas = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    lightning: null,

    init: function () {
      this.canvas = document.getElementById('storm-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Create floating green radiation embers
      const count = window.innerWidth < 768 ? 35 : 70;
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle());
      }

      // Random lightning scheduler
      this.scheduleLightning();

      this.render();
    },

    resize: function () {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    },

    createParticle: function () {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 1.2 + 0.3),
        speedX: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        decay: Math.random() * 0.005 + 0.002,
        color: Math.random() > 0.35 ? '#39ff14' : '#a3e635'
      };
    },

    scheduleLightning: function () {
      const delay = Math.random() * 6000 + 4000;
      setTimeout(() => {
        this.strikeLightning();
        this.scheduleLightning();
      }, delay);
    },

    strikeLightning: function () {
      const startX = Math.random() * this.width * 0.8 + this.width * 0.1;
      this.lightning = {
        segments: this.generateBolt(startX, 0, startX + (Math.random() - 0.5) * 200, this.height * 0.5),
        alpha: 0.95
      };

      // Sound if close
      if (Math.random() > 0.5) {
        AudioFX.playDrone();
      }
    },

    generateBolt: function (x1, y1, x2, y2) {
      const segments = [{ x: x1, y: y1 }];
      let currentX = x1;
      let currentY = y1;
      const steps = 18;
      const dy = (y2 - y1) / steps;

      for (let i = 0; i < steps; i++) {
        currentX += (Math.random() - 0.5) * 45;
        currentY += dy;
        segments.push({ x: currentX, y: currentY });
      }
      return segments;
    },

    render: function () {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render Lightning if active
      if (this.lightning && this.lightning.alpha > 0.02) {
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(57, 255, 20, ${this.lightning.alpha})`;
        this.ctx.shadowColor = '#39ff14';
        this.ctx.shadowBlur = 25;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.lightning.segments.forEach((pt, idx) => {
          if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
          else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();

        // Inner white hot core
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.lightning.alpha * 0.85})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.restore();

        this.lightning.alpha *= 0.85;
      }

      // Render Embers
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -10 || p.x < 0 || p.x > this.width) {
          this.particles[i] = this.createParticle();
          this.particles[i].y = this.height + 10;
        }

        this.ctx.save();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = '#39ff14';
        this.ctx.shadowBlur = 8;
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.render());
    }
  };

  /* ============================================================================
     4. 3D CARD TILT FOR "THE INNER CIRCLE" (Menacing Leadership Grid)
     ============================================================================ */
  const CardTiltEffect = {
    init: function () {
      const cards = document.querySelectorAll('.card-inner-circle');
      if (!cards.length) return;

      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });

        card.addEventListener('mouseenter', () => {
          AudioFX.playClick();
        });
      });
    }
  };

  /* ============================================================================
     5. RECRUITMENT FORM (Initiation Sequence) & CUSTOM MODAL
     ============================================================================ */
  const InitiationForm = {
    form: null,
    submitBtn: null,
    modal: null,

    init: function () {
      this.form = document.getElementById('initiation-form');
      this.submitBtn = document.getElementById('btn-initiate');
      this.modal = document.getElementById('dossier-modal');

      if (!this.form) return;

      // Realtime character count
      const reasonArea = document.getElementById('recruit-reason');
      const charCounter = document.getElementById('reason-char-count');
      if (reasonArea && charCounter) {
        reasonArea.addEventListener('input', () => {
          charCounter.textContent = `${reasonArea.value.length} / 500`;
        });
      }

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmission();
      });

      // Modal close handlers
      const closeModalBtns = document.querySelectorAll('.btn-close-dossier');
      closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal();
        });
      });

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.closeModal();
          }
        });
      }
    },

    handleSubmission: function () {
      const name = document.getElementById('recruit-name').value.trim();
      const major = document.getElementById('recruit-major').value.trim();
      const alias = document.getElementById('recruit-alias').value.trim() || 'UNREGISTERED_ENTITY';
      const reason = document.getElementById('recruit-reason').value.trim();

      if (!name || !major || !reason) {
        alert('CRITICAL: All requisite initiation parameters must be specified.');
        return;
      }

      // Trigger metallic flash on submit button
      if (this.submitBtn) {
        this.submitBtn.classList.add('btn-submitting');
        const origText = this.submitBtn.innerHTML;
        this.submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          TRANSMITTING TO CITADEL...
        `;

        AudioFX.playInitiationSuccess();

        setTimeout(() => {
          this.submitBtn.classList.remove('btn-submitting');
          this.submitBtn.innerHTML = origText;
          this.displayDossierModal({ name, major, alias, reason });
          this.form.reset();
          const charCounter = document.getElementById('reason-char-count');
          if (charCounter) charCounter.textContent = '0 / 500';
        }, 1100);
      }
    },

    displayDossierModal: function (data) {
      if (!this.modal) return;

      // Generate random Latverian security clearance code
      const hash = Math.floor(1000 + Math.random() * 9000);
      const initiateCode = `DOOM-INITIATE #LAT-${hash}`;

      document.getElementById('modal-recruit-name').textContent = data.name;
      document.getElementById('modal-recruit-alias').textContent = data.alias.toUpperCase();
      document.getElementById('modal-recruit-major').textContent = data.major;
      document.getElementById('modal-recruit-code').textContent = initiateCode;
      document.getElementById('modal-timestamp').textContent = new Date().toUTCString();

      this.modal.classList.remove('hidden');
      this.modal.classList.add('flex');
    },

    closeModal: function () {
      if (!this.modal) return;
      this.modal.classList.add('hidden');
      this.modal.classList.remove('flex');
    }
  };

  /* ============================================================================
     6. UI CONTROLS & PARALLAX SCROLLING
     ============================================================================ */
  const UIController = {
    init: function () {
      // Audio toggle button
      const audioBtn = document.getElementById('audio-toggle-btn');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          AudioFX.init();
          State.audioEnabled = !State.audioEnabled;
          this.updateAudioButton(audioBtn);
          if (State.audioEnabled) {
            AudioFX.playDrone();
          }
        });
      }

      // Smooth scroll for CTAs
      const pledgeBtns = document.querySelectorAll('.scroll-to-initiation');
      pledgeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          AudioFX.playClick();
          const target = document.getElementById('initiation-section');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Mouse Parallax on Hero elements
      const heroContent = document.querySelector('.hero-parallax-layer');
      if (heroContent) {
        window.addEventListener('mousemove', (e) => {
          const moveX = (e.clientX - window.innerWidth / 2) * 0.012;
          const moveY = (e.clientY - window.innerHeight / 2) * 0.012;
          heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      }
    },

    updateAudioButton: function (btn) {
      const icon = btn.querySelector('.audio-icon');
      const label = btn.querySelector('.audio-label');
      if (State.audioEnabled) {
        btn.classList.add('border-doom-glow', 'text-doom-glow');
        if (label) label.textContent = 'SFX: ONLINE';
        if (icon) {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/>
          `;
        }
      } else {
        btn.classList.remove('border-doom-glow', 'text-doom-glow');
        if (label) label.textContent = 'SFX: MUTED';
        if (icon) {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          `;
        }
      }
    }
  };

  /* ============================================================================
     INITIALIZE ON DOM READY
     ============================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    GatewayIntro.init();
    AtmosphericCanvas.init();
    CardTiltEffect.init();
    InitiationForm.init();
    UIController.init();
  });

})();
