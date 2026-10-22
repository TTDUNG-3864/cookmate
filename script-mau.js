// ====== GENERATE STARS ======
const starsContainer = document.getElementById('starsContainer');
for (let i = 0; i < 80; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 100 + '%';
  s.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
  s.style.setProperty('--delay', (Math.random() * 3) + 's');
  const sz = (1 + Math.random() * 2) + 'px';
  s.style.width = sz;
  s.style.height = sz;
  starsContainer.appendChild(s);
}

// ====== GENERATE DUST PARTICLES ======
const dustContainer = document.getElementById('dustContainer');
for (let i = 0; i < 30; i++) {
  const d = document.createElement('div');
  d.className = 'dust';
  d.style.left = (20 + Math.random() * 60) + '%';
  d.style.top = (10 + Math.random() * 80) + '%';
  d.style.setProperty('--size', (2 + Math.random() * 4) + 'px');
  d.style.setProperty('--duration', (4 + Math.random() * 8) + 's');
  d.style.setProperty('--delay', (Math.random() * 5) + 's');
  d.style.setProperty('--dx', (-30 + Math.random() * 60) + 'px');
  d.style.setProperty('--dy', (-40 + Math.random() * 80) + 'px');
  dustContainer.appendChild(d);
}

// ====== LAMP TOGGLE ======
const lampToggle = document.getElementById('lampToggle');
const cardWrapper = document.getElementById('cardWrapper');
let isOn = false;

lampToggle.addEventListener('click', (e) => {
  isOn = !isOn;
  createSparks(e.clientX, e.clientY);
  if (isOn) {
    document.body.classList.add('lamp-on');
    cardWrapper.classList.add('active');
  } else {
    document.body.classList.remove('lamp-on');
    cardWrapper.classList.remove('active');
  }
});

// ====== SPARK PARTICLES ======
function createSparks(x, y) {
  const spark = document.createElement('div');
  spark.className = 'spark';
  spark.style.left = x + 'px';
  spark.style.top = y + 'px';
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'spark-particle';
    const angle = (Math.PI * 2 / 8) * i + (Math.random() * 0.5);
    const dist = 20 + Math.random() * 40;
    p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    spark.appendChild(p);
  }
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 700);
}

// ====== VIEW SWITCHING (Login ↔ Register) ======
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const goToRegister = document.getElementById('goToRegister');
const goToLogin = document.getElementById('goToLogin');
let switching = false;

function switchView(fromView, toView, direction) {
  if (switching) return;
  switching = true;

  // Reset stagger children on target
  toView.querySelectorAll('.fc').forEach(el => {
    el.style.animation = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
  });

  // Exit current view
  fromView.classList.remove('view-active', 'view-enter-left');
  fromView.classList.add(direction === 'right' ? 'view-exit' : 'view-exit-right');

  setTimeout(() => {
    fromView.classList.remove('view-exit', 'view-exit-right');
    fromView.style.display = 'none';

    // Reset fc animation so it can replay
    toView.querySelectorAll('.fc').forEach(el => {
      el.style.animation = '';
    });

    // Enter new view
    toView.style.display = 'block';
    toView.classList.add(direction === 'right' ? 'view-active' : 'view-enter-left');

    switching = false;
  }, 300);
}

goToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  switchView(loginView, registerView, 'right');
});

goToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  switchView(registerView, loginView, 'left');
});

// ====== PASSWORD TOGGLES (generic) ======
document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const isPw = target.type === 'password';
    target.type = isPw ? 'text' : 'password';
    btn.innerHTML = isPw
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
         </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
         </svg>`;
  });
});

// ====== PASSWORD STRENGTH INDICATOR ======
const regPassword = document.getElementById('regPassword');
const segs = [
  document.getElementById('seg1'),
  document.getElementById('seg2'),
  document.getElementById('seg3'),
  document.getElementById('seg4')
];
const strengthText = document.getElementById('strengthText');

function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthClasses = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#10b981'];

regPassword.addEventListener('input', () => {
  const score = checkStrength(regPassword.value);
  segs.forEach((seg, i) => {
    seg.className = 'strength-segment';
    if (i < score) seg.classList.add(strengthClasses[score]);
  });
  strengthText.textContent = regPassword.value ? strengthLabels[score] || 'Too short' : '';
  strengthText.style.color = strengthColors[score] || 'rgba(255,255,255,0.3)';
});

// ====== ACTION BUTTON RIPPLE + LOADING ======
function setupActionBtn(btn) {
  btn.addEventListener('click', function (e) {
    if (this.classList.contains('loading') || this.classList.contains('success')) return;

    // Ripple
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Loading → Success
    this.classList.add('loading');
    setTimeout(() => {
      this.classList.remove('loading');
      this.classList.add('success');
      setTimeout(() => {
        this.classList.remove('success');
      }, 1500);
    }, 1800);
  });
}

setupActionBtn(document.getElementById('signinBtn'));
setupActionBtn(document.getElementById('signupBtn'));
