/* ==========================================================================
   VANGUARD ROOFING & WATERPROOFING - CORE JAVASCRIPT ENGINE
   Features:
   - Theme Toggle (Dark/Light with localStorage persistence)
   - RTL/LTR Direction Toggle (with localStorage persistence)
   - Navbar Auth State Management (Login before auth -> Logout after auth; Logout redirects to login.html)
   - Mobile Drawer Navigation
   - Interactive Before & After Drag Comparison Sliders
   - Pricing Estimator Calculator
   - Free Inspection Booking Modal & Form Handler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDirection();
  initNavbarAuth();
  initMobileNav();
  initBeforeAfterSliders();
  initEstimator();
  initInspectionBooking();
  initActiveNavLink();
});

/* --------------------------------------------------------------------------
   1. THEME MANAGEMENT (DARK / LIGHT)
   -------------------------------------------------------------------------- */
function initTheme() {
  const savedTheme = localStorage.getItem('vanguard_theme') || 'light';
  applyTheme(savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vanguard_theme', theme);

  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    const iconContainer = btn.querySelector('.theme-icon');
    const labelContainer = btn.querySelector('.label-text');

    if (theme === 'dark') {
      if (iconContainer) iconContainer.innerHTML = '☀️';
      if (labelContainer) labelContainer.textContent = 'Light';
      btn.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
      if (iconContainer) iconContainer.innerHTML = '🌙';
      if (labelContainer) labelContainer.textContent = 'Dark';
      btn.setAttribute('aria-label', 'Switch to Dark Mode');
    }
  });
}

/* --------------------------------------------------------------------------
   2. RTL / LTR DIRECTION TOGGLE
   -------------------------------------------------------------------------- */
function initDirection() {
  const savedDir = localStorage.getItem('vanguard_dir') || 'ltr';
  applyDirection(savedDir);

  const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
      showToast(`Direction flipped to ${newDir.toUpperCase()}`, 'info');
    });
  });
}

function applyDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('vanguard_dir', dir);

  const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggles.forEach(btn => {
    const label = btn.querySelector('.label-text');
    if (label) {
      label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    }
    btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to Left to Right' : 'Switch to Right to Left');
  });

  // Re-sync before/after sliders on dir change
  updateAllSliders();
}

/* --------------------------------------------------------------------------
   3. AUTHENTICATION & NAVBAR STATE (CONSTANT NAVBAR & DUMMY LOGIN)
   Requirement:
   - Navbar must remain 100% constant across every single page.
   - Always display the constant Login button in the top right of the navbar.
   - Login page is a dummy simulation and NEVER redirects to any page.
   -------------------------------------------------------------------------- */
function getAuthUser() {
  try {
    const raw = localStorage.getItem('vanguard_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setAuthUser(user) {
  // Store dummy user session
  localStorage.setItem('vanguard_user', JSON.stringify(user));
  // Keep navbar constant across all pages
  initNavbarAuth();
}

function logoutUser() {
  localStorage.removeItem('vanguard_user');
  showToast('Signed out successfully.', 'info');
  initLoginPageUI(null);
}

function initNavbarAuth() {
  // Clear any legacy user so navbar remains 100% constant and unshifted
  const authContainers = document.querySelectorAll('.nav-auth-container');

  authContainers.forEach(container => {
    // REQUIREMENT: Keep navbar CONSTANT for every page (always standard Login button)
    container.innerHTML = `
      <a href="login.html" class="btn btn-primary btn-sm login-btn" title="Client & Contractor Portal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Login</span>
      </a>
    `;
  });

  // Handle Login Page UI if currently on login.html
  initLoginPageUI(getAuthUser());
}

function initLoginPageUI(currentUser) {
  const loginCard = document.getElementById('loginFormCard');
  const loggedInCard = document.getElementById('alreadyLoggedInCard');

  // Keep login form visible as dummy so users can always test credentials
  if (loginCard) {
    loginCard.style.display = 'block';
  }
  if (loggedInCard) {
    loggedInCard.style.display = 'none';
  }

  // Handle Login / Register tab forms on login.html
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (tabBtns.length && loginForm && registerForm) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if (tab === 'login') {
          loginForm.style.display = 'block';
          registerForm.style.display = 'none';
        } else {
          loginForm.style.display = 'none';
          registerForm.style.display = 'block';
        }
      });
    });

    // Form submit handlers - DUMMY MODE: NO REDIRECT TO ANY PAGES
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('loginEmail');
      const email = emailInput ? emailInput.value.trim() : '';

      // Strict Email validation (disallow formats like ice@g)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address with a valid domain (e.g., name@domain.com)', 'warning');
        if (emailInput) emailInput.focus();
        return;
      }

      const name = email.split('@')[0].replace('.', ' ');
      setAuthUser({
        name: capitalizeWords(name) || 'Valued Client',
        email: email,
        role: 'Client'
      });
      // Display clean success toast without mentioning dummy
      showToast('Successfully signed in.', 'success');
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('regName');
      const emailInput = document.getElementById('regEmail');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      // Strict Name validation (reject single letters like "a")
      const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
      if (!nameRegex.test(name)) {
        showToast('Please enter a valid full name (at least 2 letters, alphabetic only).', 'warning');
        if (nameInput) nameInput.focus();
        return;
      }

      // Strict Email validation (reject ice@g)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address with a valid domain (e.g., name@domain.com)', 'warning');
        if (emailInput) emailInput.focus();
        return;
      }

      setAuthUser({
        name: name,
        email: email,
        role: 'Property Owner'
      });
      showToast('Successfully created account and signed in.', 'success');
    });

    // Quick 1-Click Demo Logins - NO REDIRECT
    const demoClientBtn = document.getElementById('demoClientBtn');
    if (demoClientBtn) {
      demoClientBtn.addEventListener('click', () => {
        setAuthUser({
          name: 'Robert Miller',
          email: 'robert.miller@example.com',
          role: 'Commercial Client'
        });
        showToast('Successfully signed in as Robert Miller.', 'success');
      });
    }

    const demoInspectorBtn = document.getElementById('demoInspectorBtn');
    if (demoInspectorBtn) {
      demoInspectorBtn.addEventListener('click', () => {
        setAuthUser({
          name: 'Sarah Jenkins',
          email: 's.jenkins@vanguardroofing.com',
          role: 'Lead Waterproofing Inspector'
        });
        showToast('Successfully signed in as Sarah Jenkins.', 'success');
      });
    }
  }
}

/* --------------------------------------------------------------------------
   4. MOBILE NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navbarMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on navigation link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('active');
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE BEFORE & AFTER COMPARISON SLIDERS
   -------------------------------------------------------------------------- */
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.ba-slider-container');
  sliders.forEach(container => {
    const range = container.querySelector('.ba-range-input');
    const afterImg = container.querySelector('.ba-image-after');
    const divider = container.querySelector('.ba-divider');
    const handle = container.querySelector('.ba-handle');

    if (!range || !afterImg || !divider || !handle) return;

    function setSliderPosition(val) {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      const percent = Math.min(Math.max(val, 0), 100);

      divider.style.left = `${percent}%`;
      handle.style.left = `${percent}%`;

      if (isRtl) {
        // In RTL mode, clip from the right
        afterImg.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
      } else {
        // In LTR mode, clip from the left
        afterImg.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
      }
    }

    range.addEventListener('input', (e) => {
      setSliderPosition(e.target.value);
    });

    // Initialize to 50%
    setSliderPosition(50);
  });
}

function updateAllSliders() {
  const sliders = document.querySelectorAll('.ba-slider-container');
  sliders.forEach(container => {
    const range = container.querySelector('.ba-range-input');
    if (range) {
      range.dispatchEvent(new Event('input'));
    }
  });
}

/* --------------------------------------------------------------------------
   6. PRICING & COST ESTIMATOR CALCULATOR
   -------------------------------------------------------------------------- */
function initEstimator() {
  const areaInput = document.getElementById('calcArea');
  const areaDisplay = document.getElementById('calcAreaDisplay');
  const serviceSelect = document.getElementById('calcService');
  const roofTypeSelect = document.getElementById('calcRoofType');
  const priceDisplay = document.getElementById('calcEstimateResult');
  const warrantyDisplay = document.getElementById('calcWarrantyResult');
  const timelineDisplay = document.getElementById('calcTimelineResult');
  const ctaBtn = document.getElementById('calcCtaBtn');

  if (!areaInput || !priceDisplay) return;

  function calculate() {
    const sqft = parseInt(areaInput.value, 10) || 500;
    if (areaDisplay) areaDisplay.textContent = `${sqft.toLocaleString()} sq ft`;

    const service = serviceSelect ? serviceSelect.value : 'terrace';
    const roofType = roofTypeSelect ? roofTypeSelect.value : 'concrete';

    let ratePerSqFt = 75;
    let warranty = '20-Year Heavy Duty';
    let timeline = '3 - 5 Days';

    if (service === 'repair') {
      ratePerSqFt = 45;
      warranty = '10-Year Workmanship';
      timeline = '1 - 2 Days';
    } else if (service === 'terrace') {
      ratePerSqFt = 75;
      warranty = '20-Year Heavy Duty';
      timeline = '3 - 5 Days';
    } else if (service === 'gutter') {
      ratePerSqFt = 35;
      warranty = '15-Year Anti-Clog';
      timeline = '1 Day';
    } else if (service === 'complete') {
      ratePerSqFt = 125;
      warranty = '25-Year Platinum Guarantee';
      timeline = '4 - 7 Days';
    } else if (service === 'commercial') {
      ratePerSqFt = 95;
      warranty = '25-Year Commercial Shield';
      timeline = '5 - 10 Days';
    }

    // Material multiplier
    let materialMultiplier = 1.0;
    if (roofType === 'metal') materialMultiplier = 1.15;
    if (roofType === 'tile') materialMultiplier = 1.25;

    const baseTotal = sqft * ratePerSqFt * materialMultiplier;
    const lowEst = Math.round(baseTotal * 0.9);
    const highEst = Math.round(baseTotal * 1.15);

    priceDisplay.textContent = `₹${lowEst.toLocaleString('en-IN')} - ₹${highEst.toLocaleString('en-IN')}`;
    if (warrantyDisplay) warrantyDisplay.textContent = warranty;
    if (timelineDisplay) timelineDisplay.textContent = timeline;
    if (ctaBtn) {
      ctaBtn.href = `contact.html?service=${encodeURIComponent(service)}`;
    }
  }

  areaInput.addEventListener('input', calculate);
  if (serviceSelect) serviceSelect.addEventListener('change', calculate);
  if (roofTypeSelect) roofTypeSelect.addEventListener('change', calculate);

  // Run on start
  calculate();
}

/* --------------------------------------------------------------------------
   7. FREE INSPECTION BOOKING FORM & STRICT FIELD VALIDATIONS
   -------------------------------------------------------------------------- */
function initInspectionBooking() {
  // Pre-select service from URL parameter if present (e.g. ?service=repair or ?tier=terrace)
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = (urlParams.get('service') || urlParams.get('tier') || '').toLowerCase();
  const contactService = document.getElementById('contactService');
  if (contactService && serviceParam) {
    if (serviceParam.includes('terrace')) {
      contactService.value = 'Terrace Waterproofing';
    } else if (serviceParam.includes('repair')) {
      contactService.value = 'Roof Repair';
    } else if (serviceParam.includes('gutter')) {
      contactService.value = 'Gutter Installation';
    } else if (serviceParam.includes('re-roof') || serviceParam.includes('complete')) {
      contactService.value = 'Full Re-Roofing';
    } else if (serviceParam.includes('commercial')) {
      contactService.value = 'Commercial Coating';
    }
  }

  // Global real-time sanitization: Prevent typing alphabetic characters in phone inputs
  const allPhoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"], #clientPhone, #contactPhone, #phone');
  allPhoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      // Disallow any alphabetic characters or symbols other than digits, +, -, (, ), spaces
      e.target.value = e.target.value.replace(/[^\d+\s()-]/g, '');
    });
  });

  const bookingForms = document.querySelectorAll('.inspection-form, #contactForm, #rfpForm');
  const modal = document.getElementById('bookingConfirmationModal');
  const closeModalBtns = document.querySelectorAll('.close-modal-btn');

  bookingForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect field inputs
      const nameInput = form.querySelector('[name="client_name"], [name="name"], #clientName, #contactName');
      const emailInput = form.querySelector('[name="client_email"], [name="email"], [type="email"], #clientEmail, #contactEmail');
      const phoneInput = form.querySelector('[name="client_phone"], [name="phone"], [type="tel"], #clientPhone, #contactPhone');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';

      // 1. Strict Name Validation: reject single letters like 'a'
      if (nameInput) {
        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (!nameRegex.test(nameVal)) {
          showToast('Please enter a valid full name (at least 2 letters, alphabetic only).', 'warning');
          nameInput.focus();
          return;
        }
      }

      // 2. Strict Email Validation: reject invalid emails like 'ice@g'
      if (emailInput && (emailInput.required || emailVal.length > 0)) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailVal)) {
          showToast('Please enter a valid email address with a valid domain (e.g., name@domain.com)', 'warning');
          emailInput.focus();
          return;
        }
      }

      // 3. Strict Phone Number Validation: reject alphabetic characters & ensure min 10 digits
      if (phoneInput && (phoneInput.required || phoneVal.length > 0)) {
        const hasAlphabets = /[a-zA-Z]/.test(phoneVal);
        const digitsOnly = phoneVal.replace(/\D/g, '');
        if (hasAlphabets || digitsOnly.length < 10) {
          showToast('Please enter a valid phone number (at least 10 digits, numbers only).', 'warning');
          phoneInput.focus();
          return;
        }
      }

      const address = form.querySelector('[name="property_address"]')?.value || 'Property Location Specified';
      const service = form.querySelector('[name="service_type"]')?.value || 'Free Comprehensive Inspection';
      const date = form.querySelector('[name="preferred_date"]')?.value || 'Next Available Slot';

      // Generate random ticket
      const ticketId = 'INSP-' + Math.floor(1000 + Math.random() * 9000);

      // Populate modal details if modal exists
      const ticketEl = document.getElementById('modalTicketId');
      const nameEl = document.getElementById('modalClientName');
      const serviceEl = document.getElementById('modalServiceType');
      const dateEl = document.getElementById('modalDate');

      if (ticketEl) ticketEl.textContent = ticketId;
      if (nameEl) nameEl.textContent = nameVal || 'Valued Client';
      if (serviceEl) serviceEl.textContent = service;
      if (dateEl) dateEl.textContent = date;

      // Show modal
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      form.reset();
      showToast(`Inspection request submitted! Reference #${ticketId}`, 'success');
    });
  });

  if (modal) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   8. ACTIVE NAV LINK HIGHLIGHT
   -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const dropdownLinks = document.querySelectorAll('.nav-menu .dropdown-link');

  const isHome = currentPath === 'index.html' || currentPath === 'home-2.html' || currentPath === '';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (link.classList.contains('dropdown-toggle') && isHome) {
      link.classList.add('active');
    } else if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  dropdownLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   9. UTILITY HELPERS
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}
