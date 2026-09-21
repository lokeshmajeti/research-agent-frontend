window.handleCredentialResponse = function (response) {
  try {
    const encodedPayload = response.credential.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload));
    const userName = payload.name || payload.email || 'Google Researcher';

    document.getElementById('user-display-name').textContent = userName;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    lucide.createIcons();
  } catch (error) {
    console.error('Google authentication response could not be read.', error);
    alert('Google sign-in could not be completed. Please try again.');
  }
};

window.initializeGoogleButtons = function () {
  const renderButtons = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Identity Services did not load.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: '591396653103-lm4bvmtdt2stbfd0g5qn5akr28vskufj.apps.googleusercontent.com',
      callback: window.handleCredentialResponse
    });

    ['login-google-button', 'signup-google-button'].forEach(buttonId => {
      window.google.accounts.id.renderButton(document.getElementById(buttonId), {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: buttonId === 'login-google-button' ? 'signin_with' : 'signup_with'
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderButtons, { once: true });
  } else {
    renderButtons();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  window.initializeGoogleButtons();

  // Screens
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

  // Dashboard Tabs & Stepper
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const analyzeBtn = document.getElementById('analyze-btn');
  const modeTabs = document.querySelectorAll('.mode-tab');
  const modeSections = document.querySelectorAll('.mode-section');
  const dropZone = document.getElementById('drop-zone');
  const browseTrigger = document.getElementById('browse-trigger');
  const fileInput = document.getElementById('file-input');
  const uploadActions = document.getElementById('upload-actions');
  const fileSelectionStatus = document.getElementById('file-selection-status');
  const analyzeFilesBtn = document.getElementById('analyze-files-btn');
  const pipelineStepper = document.getElementById('pipeline-stepper');

  /* ----------------------------------------------------
     1. CARD SLIDING: LOGIN <---> SIGN UP
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
     2. SWITCHING LOGIN TABS (Google / Phone / Email)
     ---------------------------------------------------- */
  function switchLoginTab(activeBtn, activeView) {
    [tabLoginGoogleBtn, tabLoginPhoneBtn, tabLoginEmailBtn].forEach(b => b.classList.remove('active'));
    [loginGoogleView, loginPhoneView, loginEmailView].forEach(v => {
      v.classList.remove('active');
      v.classList.add('hidden');
    });

    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
  }

  tabLoginGoogleBtn.addEventListener('click', () => switchLoginTab(tabLoginGoogleBtn, loginGoogleView));
  tabLoginPhoneBtn.addEventListener('click', () => switchLoginTab(tabLoginPhoneBtn, loginPhoneView));
  tabLoginEmailBtn.addEventListener('click', () => switchLoginTab(tabLoginEmailBtn, loginEmailView));

  /* ----------------------------------------------------
     3. SWITCHING SIGNUP TABS (Google / Phone / Email)
     ---------------------------------------------------- */
  function switchSignupTab(activeBtn, activeView) {
    [tabSignupGoogleBtn, tabSignupPhoneBtn, tabSignupEmailBtn].forEach(b => b.classList.remove('active'));
    [signupGoogleView, signupPhoneView, signupEmailView].forEach(v => {
      v.classList.remove('active');
      v.classList.add('hidden');
    });

    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
  }

  tabSignupGoogleBtn.addEventListener('click', () => switchSignupTab(tabSignupGoogleBtn, signupGoogleView));
  tabSignupPhoneBtn.addEventListener('click', () => switchSignupTab(tabSignupPhoneBtn, signupPhoneView));
  tabSignupEmailBtn.addEventListener('click', () => switchSignupTab(tabSignupEmailBtn, signupEmailView));

  /* ----------------------------------------------------
     4. GOOGLE AUTHENTICATION (FOR BOTH LOGIN & SIGNUP)
     ---------------------------------------------------- */

  /* ----------------------------------------------------
     5. PHONE + OTP FLOW: LOGIN
     ---------------------------------------------------- */
  let loginTimerInterval = null;

  loginSendOtpBtn.addEventListener('click', () => {
    const phone = loginUserPhone.value.trim();
    if (!phone || phone.length < 8) {
      alert("Please enter a valid phone number");
      return;
    }
    loginPhoneStep.classList.add('hidden');
    loginOtpStep.classList.remove('hidden');
    loginUserOtp.focus();

    let timeLeft = 30;
    loginOtpTimer.textContent = `Resend OTP in ${timeLeft}s`;
    loginResendOtpLink.classList.add('hidden');

    clearInterval(loginTimerInterval);
    loginTimerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        loginOtpTimer.textContent = `Resend OTP in ${timeLeft}s`;
      } else {
        clearInterval(loginTimerInterval);
        loginOtpTimer.textContent = "";
        loginResendOtpLink.classList.remove('hidden');
      }
    }, 1000);
  });

  loginResendOtpLink.addEventListener('click', () => {
    alert("New OTP sent: 123456");
    loginUserOtp.value = "";
    loginSendOtpBtn.click();
  });

  loginVerifyOtpBtn.addEventListener('click', () => {
    const otp = loginUserOtp.value.trim();
    if (otp === "123456" || otp.length === 6) {
      clearInterval(loginTimerInterval);
      const phone = loginUserPhone.value;
      enterDashboard(`Phone (+${phone.replace(/\D/g, '').slice(-4) || 'User'})`);
    } else {
      alert("Invalid OTP. Enter 123456 for the demo.");
    }
  });

  /* ----------------------------------------------------
     6. PHONE + OTP FLOW: SIGNUP
     ---------------------------------------------------- */
  let signupTimerInterval = null;

  signupSendOtpBtn.addEventListener('click', () => {
    const phone = signupUserPhone.value.trim();
    if (!phone || phone.length < 8) {
      alert("Please enter a valid phone number");
      return;
    }
    signupPhoneStep.classList.add('hidden');
    signupOtpStep.classList.remove('hidden');
    signupUserOtp.focus();

    let timeLeft = 30;
    signupOtpTimer.textContent = `Resend OTP in ${timeLeft}s`;
    signupResendOtpLink.classList.add('hidden');

    clearInterval(signupTimerInterval);
    signupTimerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        signupOtpTimer.textContent = `Resend OTP in ${timeLeft}s`;
      } else {
        clearInterval(signupTimerInterval);
        signupOtpTimer.textContent = "";
        signupResendOtpLink.classList.remove('hidden');
      }
    }, 1000);
  });

  signupResendOtpLink.addEventListener('click', () => {
    alert("New OTP sent: 123456");
    signupUserOtp.value = "";
    signupSendOtpBtn.click();
  });

  signupVerifyOtpBtn.addEventListener('click', () => {
    const otp = signupUserOtp.value.trim();
    if (otp === "123456" || otp.length === 6) {
      clearInterval(signupTimerInterval);
      const phone = signupUserPhone.value;
      enterDashboard(`New Member (+${phone.replace(/\D/g, '').slice(-4) || 'User'})`);
    } else {
      alert("Invalid OTP. Enter 123456 for the demo.");
    }
  });

  /* ----------------------------------------------------
     7. EMAIL FORM SUBMISSIONS
     ---------------------------------------------------- */
  loginEmailView.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    enterDashboard(user || "Email User");
  });

  signupEmailView.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    enterDashboard(name || "New Registered User");
  });

  /* ----------------------------------------------------
     8. DASHBOARD NAVIGATION & ANALYSIS PIPELINE
     ---------------------------------------------------- */
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      modeSections.forEach(section => section.classList.add('hidden'));

      tab.classList.add('active');
      const section = document.getElementById(`section-${tab.id.replace('tab-btn-', '')}`);
      section.classList.remove('hidden');
    });
  });

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById(target).classList.add('active');
      lucide.createIcons();
    });
  });

 const BACKEND_URL = "https://research-agent-backend-r30f.onrender.com/api/analyze";

  async function runAnalysis() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    const fileInput = document.getElementById('file-input');

    if (!query && fileInput.files.length === 0) {
      alert("Please enter a research topic or upload a file.");
      return;
    }

    // Show pipeline and reset steps
    pipelineStepper.classList.remove('hidden');
    const stepIds = ['step-0', 'step-1', 'step-2', 'step-3'];
    stepIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(stepIds[0]).classList.add('active');

    // Prepare data for FastAPI
    const formData = new FormData();
    formData.append("research_question", query || "Analyze this document.");
    if (fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0]);
    }

    // Simulate step 2 while waiting for Render
    document.getElementById(stepIds[1]).classList.add('active');

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      document.getElementById(stepIds[2]).classList.add('active');
      const data = await response.json();
      
      document.getElementById(stepIds[3]).classList.add('active');
      
      // Push live data into the UI
      renderRealData(data);
      
      setTimeout(() => pipelineStepper.classList.add('hidden'), 1500);

    } catch (error) {
      alert(`Backend connection failed: ${error.message}. Is Render awake?`);
      pipelineStepper.classList.add('hidden');
    }
  }

  function renderRealData(data) {
    // 1. Inject Live Papers
    const papersContainer = document.getElementById('papers-container');
    papersContainer.innerHTML = '';
    document.getElementById('paper-count-tag').textContent = `${data.papers ? data.papers.length : 0} Papers Found`;
    
    if (data.papers) {
      data.papers.forEach(p => {
        const authors = p.authors ? p.authors.slice(0, 2).join(', ') + (p.authors.length > 2 ? ' et al.' : '') : 'Unknown';
        const year = p.published ? p.published.substring(0, 4) : 'N/A';
        papersContainer.innerHTML += `
          <div class="paper-item">
            <div class="paper-title-row">
              <h4>${p.title}</h4>
              <a href="${p.url}" target="_blank" class="ext-link"><i data-lucide="external-link"></i></a>
            </div>
            <div class="paper-meta"><span>${authors}</span> <span class="badge-year">${year}</span></div>
            <div class="tag-row"><span class="dataset-tag">arXiv</span></div>
          </div>`;
      });
    }

    // 2. Inject Live Matrix
    const matrixBody = document.querySelector('#tab-matrix tbody');
    matrixBody.innerHTML = '';
    if (data.matrix) {
      data.matrix.forEach(row => {
        matrixBody.innerHTML += `
          <tr>
            <td class="bold-text">${row.paper}</td>
            <td>${row.methodology}</td>
            <td>${row.dataset}</td>
            <td class="success-text">${row.key_result}</td>
            <td class="lim-text">${row.limitation}</td>
          </tr>`;
      });
    }

    // 3. Inject Live Gaps
    const gapsTab = document.getElementById('tab-gaps');
    gapsTab.innerHTML = '';
    if (data.gaps) {
      data.gaps.forEach(gap => {
        gapsTab.innerHTML += `
          <div class="gap-card">
            <div class="gap-top">
              <span class="gap-badge">AI Identified Gap</span>
              <h4>${gap.title}</h4>
            </div>
            <div class="gap-reason">
              <p>${gap.description}</p>
            </div>
          </div>`;
      });
    }

    // 4. Inject Live Approach
    const approachTab = document.getElementById('tab-approach');
    if (data.approach) {
      approachTab.innerHTML = `
        <div class="blueprint-box">
          <h3>Proposed Solution Direction</h3>
          <p>${data.approach.summary}</p>
        </div>
        <div class="blueprint-grid">
          <div class="bp-card" style="grid-column: span 2;">
            <h4>Suggested Methodology</h4>
            <p>${data.approach.methodology}</p>
          </div>
        </div>`;
    }
    
    lucide.createIcons();
  }
  analyzeBtn.addEventListener('click', runAnalysis);

  function updateSelectedFiles(files) {
    if (!files.length) {
      uploadActions.classList.add('hidden');
      fileSelectionStatus.textContent = '';
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const invalidFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length) {
      alert('Please upload only PDF, DOC, DOCX, or TXT files.');
      fileInput.value = '';
      uploadActions.classList.add('hidden');
      fileSelectionStatus.textContent = '';
      return;
    }

    fileSelectionStatus.textContent = `${files.length} file${files.length === 1 ? '' : 's'} selected`;
    uploadActions.classList.remove('hidden');
    lucide.createIcons();
  }

  browseTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => updateSelectedFiles(Array.from(fileInput.files)));

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const files = Array.from(event.dataTransfer.files);
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
    updateSelectedFiles(files);
  });

  analyzeFilesBtn.addEventListener('click', () => {
    if (!fileInput.files.length) {
      alert('Please upload at least one file before analyzing.');
      return;
    }
    runAnalysis();
  });
});