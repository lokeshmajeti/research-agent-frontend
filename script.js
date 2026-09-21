document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // ================= CONFIGURATION =================
  // Your live Render backend endpoint
  const BACKEND_API_URL = "https://research-agent-backend-r30f.onrender.com/api/analyze";

  // Paste your Google OAuth Client ID here (ending in .apps.googleusercontent.com)
  const GOOGLE_CLIENT_ID = "591396653103-lm4bvmtdt2stbfd0g5qn5akr28vskufj.apps.googleusercontent.com";

  // Screens & Navigation
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const container = document.querySelector('.container');
  const signUpLink = document.querySelector('.SignUpLink');
  const signInLink = document.querySelector('.SignInLink');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');

  // ================= LOGIN TABS =================
  const tabLoginGoogleBtn = document.getElementById('tab-login-google-btn');
  const tabLoginPhoneBtn = document.getElementById('tab-login-phone-btn');
  const tabLoginEmailBtn = document.getElementById('tab-login-email-btn');

  const loginGoogleView = document.getElementById('login-google-view');
  const loginPhoneView = document.getElementById('login-phone-view');
  const loginEmailView = document.getElementById('login-email-form');

  // ================= SIGNUP TABS =================
  const tabSignupGoogleBtn = document.getElementById('tab-signup-google-btn');
  const tabSignupPhoneBtn = document.getElementById('tab-signup-phone-btn');
  const tabSignupEmailBtn = document.getElementById('tab-signup-email-btn');

  const signupGoogleView = document.getElementById('signup-google-view');
  const signupPhoneView = document.getElementById('signup-phone-view');
  const signupEmailView = document.getElementById('signup-email-form');

  // Google Buttons
  const loginGoogleBtn = document.getElementById('login-google-btn');
  const signupGoogleBtn = document.getElementById('signup-google-btn');

  // Login Phone & OTP Elements
  const loginPhoneStep = document.getElementById('login-phone-step');
  const loginOtpStep = document.getElementById('login-otp-step');
  const loginSendOtpBtn = document.getElementById('login-send-otp-btn');
  const loginVerifyOtpBtn = document.getElementById('login-verify-otp-btn');
  const loginUserPhone = document.getElementById('login-user-phone');
  const loginUserOtp = document.getElementById('login-user-otp');
  const loginOtpTimer = document.getElementById('login-otp-timer');
  const loginResendOtpLink = document.getElementById('login-resend-otp-link');

  // Signup Phone & OTP Elements
  const signupPhoneStep = document.getElementById('signup-phone-step');
  const signupOtpStep = document.getElementById('signup-otp-step');
  const signupSendOtpBtn = document.getElementById('signup-send-otp-btn');
  const signupVerifyOtpBtn = document.getElementById('signup-verify-otp-btn');
  const signupUserPhone = document.getElementById('signup-user-phone');
  const signupUserOtp = document.getElementById('signup-user-otp');
  const signupOtpTimer = document.getElementById('signup-otp-timer');
  const signupResendOtpLink = document.getElementById('signup-resend-otp-link');

  // Dashboard Workspace Elements
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const analyzeBtn = document.getElementById('analyze-btn');
  const pipelineStepper = document.getElementById('pipeline-stepper');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const exportBriefBtn = document.getElementById('export-brief-btn');
  const sourceTabs = document.querySelectorAll('.mode-tab');
  const modeSections = document.querySelectorAll('.mode-section');
  const searchInput = document.getElementById('search-input');
  const queryPills = document.querySelectorAll('.query-pill');
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const browseTrigger = document.getElementById('browse-trigger');
  const paperCountTag = document.getElementById('paper-count-tag');
  const papersContainer = document.getElementById('papers-container');
  const matrixTableBody = document.querySelector('#tab-matrix tbody');
  const gapsContainer = document.getElementById('tab-gaps');
  const approachContainer = document.getElementById('tab-approach');

  let selectedPdfFile = null;

  /* ----------------------------------------------------
     1. CARD SLIDING & SCREEN NAVIGATION
     ---------------------------------------------------- */
  signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add('active');
  });

  signInLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove('active');
  });

  function enterDashboard(name = "Authenticated Researcher") {
    userDisplayName.textContent = name;
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    lucide.createIcons();
  }

  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
  });

  /* ----------------------------------------------------
     2. SWITCHING TABS (Google / Phone / Email)
     ---------------------------------------------------- */
  function switchTab(buttons, views, activeBtn, activeView) {
    buttons.forEach(b => b.classList.remove('active'));
    views.forEach(v => {
      v.classList.remove('active');
      v.classList.add('hidden');
    });
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
  }

  tabLoginGoogleBtn.addEventListener('click', () => switchTab(
    [tabLoginGoogleBtn, tabLoginPhoneBtn, tabLoginEmailBtn],
    [loginGoogleView, loginPhoneView, loginEmailView],
    tabLoginGoogleBtn, loginGoogleView
  ));
  tabLoginPhoneBtn.addEventListener('click', () => switchTab(
    [tabLoginGoogleBtn, tabLoginPhoneBtn, tabLoginEmailBtn],
    [loginGoogleView, loginPhoneView, loginEmailView],
    tabLoginPhoneBtn, loginPhoneView
  ));
  tabLoginEmailBtn.addEventListener('click', () => switchTab(
    [tabLoginGoogleBtn, tabLoginPhoneBtn, tabLoginEmailBtn],
    [loginGoogleView, loginPhoneView, loginEmailView],
    tabLoginEmailBtn, loginEmailView
  ));

  tabSignupGoogleBtn.addEventListener('click', () => switchTab(
    [tabSignupGoogleBtn, tabSignupPhoneBtn, tabSignupEmailBtn],
    [signupGoogleView, signupPhoneView, signupEmailView],
    tabSignupGoogleBtn, signupGoogleView
  ));
  tabSignupPhoneBtn.addEventListener('click', () => switchTab(
    [tabSignupGoogleBtn, tabSignupPhoneBtn, tabSignupEmailBtn],
    [signupGoogleView, signupPhoneView, signupEmailView],
    tabSignupPhoneBtn, signupPhoneView
  ));
  tabSignupEmailBtn.addEventListener('click', () => switchTab(
    [tabSignupGoogleBtn, tabSignupPhoneBtn, tabSignupEmailBtn],
    [signupGoogleView, signupPhoneView, signupEmailView],
    tabSignupEmailBtn, signupEmailView
  ));

  /* ----------------------------------------------------
     3. GOOGLE IDENTITY SERVICES AUTHENTICATION
     ---------------------------------------------------- */
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      return null;
    }
  }

  function handleGoogleCredential(response) {
    const user = parseJwt(response.credential);
    if (user && user.name) {
      enterDashboard(user.name);
    } else {
      enterDashboard("Google Researcher");
    }
  }

 function initGoogleAuth() {
    if (window.google && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID")) {
      
      // 1. Initialize the Google Auth Client
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
      });

      // 2. Button styling to match your dark theme
      const btnOptions = { 
        theme: "filled_black", 
        size: "large", 
        width: 320, 
        shape: "pill" 
      };
      
      // 3. Render the official button in the Login tab
      google.accounts.id.renderButton(
        document.getElementById("login-google-btn"),
        { ...btnOptions, text: "signin_with" }
      );
      
      // 4. Render the official button in the Signup tab
      google.accounts.id.renderButton(
        document.getElementById("signup-google-btn"),
        { ...btnOptions, text: "signup_with" }
      );
    }
  }

  window.addEventListener('load', initGoogleAuth);
  /* ----------------------------------------------------
     4. PHONE OTP FLOW (DEMO: OTP 123456)
     ---------------------------------------------------- */
  function setupOtp(sendBtn, phoneInput, phoneStep, otpStep, otpInput, verifyBtn, timerSpan, resendBtn, prefix) {
    let timer = null;
    sendBtn.addEventListener('click', () => {
      const phone = phoneInput.value.trim();
      if (!phone || phone.length < 8) {
        alert("Please enter a valid phone number");
        return;
      }
      phoneStep.classList.add('hidden');
      otpStep.classList.remove('hidden');
      otpInput.focus();

      let timeLeft = 30;
      timerSpan.textContent = `Resend OTP in ${timeLeft}s`;
      resendBtn.classList.add('hidden');

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
          timerSpan.textContent = `Resend OTP in ${timeLeft}s`;
        } else {
          clearInterval(timer);
          timerSpan.textContent = "";
          resendBtn.classList.remove('hidden');
        }
      }, 1000);
    });

    resendBtn.addEventListener('click', () => {
      alert("New OTP sent: 123456");
      otpInput.value = "";
      sendBtn.click();
    });

    verifyBtn.addEventListener('click', () => {
      if (otpInput.value.trim() === "123456") {
        clearInterval(timer);
        enterDashboard(`${prefix} (+${phoneInput.value.replace(/\D/g, '').slice(-4) || 'User'})`);
      } else {
        alert("Invalid OTP. Enter 123456 for this demo.");
      }
    });
  }

  setupOtp(loginSendOtpBtn, loginUserPhone, loginPhoneStep, loginOtpStep, loginUserOtp, loginVerifyOtpBtn, loginOtpTimer, loginResendOtpLink, "Phone");
  setupOtp(signupSendOtpBtn, signupUserPhone, signupPhoneStep, signupOtpStep, signupUserOtp, signupVerifyOtpBtn, signupOtpTimer, signupResendOtpLink, "Member");

  /* ----------------------------------------------------
     5. EMAIL FORMS
     ---------------------------------------------------- */
  loginEmailView.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    enterDashboard(user || "Researcher");
  });

  signupEmailView.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    enterDashboard(name || "Researcher");
  });

  /* ----------------------------------------------------
     6. SEARCH, DROPZONE & TABS
     ---------------------------------------------------- */
  sourceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sourceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sectionId = tab.id.replace('tab-btn-', 'section-');
      modeSections.forEach(sec => sec.classList.toggle('hidden', sec.id !== sectionId));
    });
  });

  queryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      searchInput.value = pill.dataset.query || '';
      searchInput.focus();
    });
  });

  const handleFiles = (files) => {
    if (!files.length) return;
    selectedPdfFile = files[0];
    dropZone.querySelector('p').textContent = `Loaded file: ${selectedPdfFile.name}`;
  };

  browseTrigger.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    handleFiles(e.dataTransfer.files);
  });

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
      lucide.createIcons();
    });
  });

  /* ----------------------------------------------------
     7. LIVE PIPELINE: FASTAPI + GEMINI CALL
     ---------------------------------------------------- */
  analyzeBtn.addEventListener('click', async () => {
    const question = searchInput.value.trim();
    if (!question) {
      alert("Please enter a research question or topic.");
      return;
    }

    // Activate visual stepper animation
    pipelineStepper.classList.remove('hidden');
    const stepIds = ['step-0', 'step-1', 'step-2', 'step-3'];
    let stepIndex = 0;
    stepIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(stepIds[0]).classList.add('active');

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < stepIds.length) {
        document.getElementById(stepIds[stepIndex]).classList.add('active');
      }
    }, 1500);

    // Prepare FormData payload for FastAPI
    const formData = new FormData();
    formData.append("research_question", question);
    if (selectedPdfFile) {
      formData.append("file", selectedPdfFile);
    }

    try {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<i data-lucide="loader-2"></i> Analyzing...`;
      lucide.createIcons();

      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();

      // Render Papers to Left Panel
      if (result.papers && Array.isArray(result.papers)) {
        paperCountTag.textContent = `${result.papers.length} Papers Found`;
        papersContainer.innerHTML = result.papers.map(p => `
          <div class="paper-item">
            <div class="paper-title-row">
              <h4>${p.title || 'Untitled Research'}</h4>
              <a href="${p.url || p.entry_id || 'https://arxiv.org'}" target="_blank" class="ext-link">
                <i data-lucide="external-link"></i>
              </a>
            </div>
            <div class="paper-meta">
              <span>${p.authors ? p.authors.join(', ') : 'Academic Authors'}</span>
              <span class="badge-year">${p.published ? p.published.slice(0, 4) : '2024'}</span>
            </div>
            <div class="tag-row"><span class="dataset-tag">arXiv Index</span></div>
          </div>
        `).join('');
      }

      // Render Comparison Matrix
      if (result.matrix && Array.isArray(result.matrix)) {
        matrixTableBody.innerHTML = result.matrix.map(row => `
          <tr>
            <td class="bold-text">${row.paper || row.title || 'Paper'}</td>
            <td>${row.methodology || 'N/A'}</td>
            <td>${row.dataset || 'N/A'}</td>
            <td class="success-text">${row.key_result || row.accuracy || 'N/A'}</td>
            <td class="lim-text">${row.limitation || 'N/A'}</td>
          </tr>
        `).join('');
      }

      // Render Research Gaps
      if (result.gaps) {
        const gapsList = Array.isArray(result.gaps) ? result.gaps : [result.gaps];
        gapsContainer.innerHTML = gapsList.map(g => `
          <div class="gap-card">
            <div class="gap-top">
              <span class="gap-badge">Synthesized Gap</span>
              <h4>${typeof g === 'string' ? g : (g.title || 'Identified Void')}</h4>
            </div>
            <div class="gap-reason">
              <p>${typeof g === 'object' && g.description ? g.description : 'Identified limitation across benchmark evaluations.'}</p>
            </div>
          </div>
        `).join('');
      }

      // Render Suggested Approach
      if (result.approach || result.solution) {
        const approach = result.approach || result.solution;
        approachContainer.innerHTML = `
          <div class="blueprint-box">
            <h3>Proposed Solution Direction</h3>
            <p>${typeof approach === 'string' ? approach : (approach.summary || 'Novel architecture proposed.')}</p>
          </div>
        `;
      }

      lucide.createIcons();
    } catch (err) {
      console.error("Analysis Pipeline Failed:", err);
      alert(`API Request Failed: ${err.message}. Please verify the Render backend is live.`);
    } finally {
      clearInterval(stepInterval);
      setTimeout(() => pipelineStepper.classList.add('hidden'), 500);
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `<i data-lucide="play"></i> Discover Gaps`;
      lucide.createIcons();
    }
  });

  /* ----------------------------------------------------
     8. EXPORT AND COPY HANDLERS
     ---------------------------------------------------- */
  const getAnalysisText = () => {
    const text = document.querySelector('.insights-panel');
    return text ? text.innerText.trim() : '';
  };

  copySummaryBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getAnalysisText());
      alert('Analysis copied to clipboard.');
    } catch {
      alert('Failed to copy. Please check browser permissions.');
    }
  });

  exportBriefBtn.addEventListener('click', () => {
    const report = `LitGap AI Research Brief\n\nTopic: ${searchInput.value.trim() || 'Not specified'}\n\n${getAnalysisText()}`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    link.download = 'litgap-research-brief.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  });
});