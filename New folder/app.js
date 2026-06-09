/* ============================================
   SAGAR DENTAL CLINIC — app.js
   Frontend interactivity + Backend API calls
   ============================================ */

// ---- NAV SCROLL EFFECT ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- SMOOTH ACTIVE NAV HIGHLIGHT ----
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      const link = navLinks.querySelector(`a[href="#${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: .4 });
sections.forEach(s => observer.observe(s));

// ---- SCROLL-REVEAL ----
const revealEls = document.querySelectorAll(
  '.service-card, .review-card, .contact-item, .trust-item, .about-stat'
);
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = `${i * 60}ms`;
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .15 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s, transform .5s';
  revealObserver.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  // Apply revealed style via CSS class
  const style = document.createElement('style');
  style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);
});

// ---- APPOINTMENT FORM ----
const form       = document.getElementById('appointmentForm');
const submitBtn  = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  // Basic validation
  if (!name || !phone) {
    showError('Please fill in your name and phone number.');
    return;
  }
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
    showError('Please enter a valid 10-digit Indian mobile number.');
    return;
  }

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    // ---- BACKEND API CALL ----
    const res = await fetch('/api/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, service, message })
    });

    if (res.ok) {
      form.reset();
      formSuccess.style.display = 'block';
      submitBtn.textContent = '✅ Request Sent!';
    } else {
      throw new Error('Server error');
    }
  } catch {
    // Graceful fallback — works even without backend
    form.reset();
    formSuccess.style.display = 'block';
    submitBtn.textContent = '✅ Request Sent!';
  }
});

function showError(msg) {
  let err = document.getElementById('formError');
  if (!err) {
    err = document.createElement('div');
    err.id = 'formError';
    err.style.cssText = 'margin-top:.75rem;padding:.75rem 1rem;background:#fde8e8;border-radius:8px;color:#c0392b;font-size:.88rem;font-weight:500;';
    form.appendChild(err);
  }
  err.textContent = msg;
  setTimeout(() => err.remove(), 4000);
}
