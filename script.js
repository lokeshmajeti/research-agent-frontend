document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

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
  loginGoogleBtn.addEventListener('click', () => {
    enterDashboard("Google Researcher");
  });

  signupGoogleBtn.addEventListener('click', () => {
    enterDashboard("Google Researcher (New Account)");
  });

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

  function runAnalysis() {
    pipelineStepper.classList.remove('hidden');
    const stepIds = ['step-0', 'step-1', 'step-2', 'step-3'];
    let cur = 0;

    stepIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(stepIds[0]).classList.add('active');

    const interval = setInterval(() => {
      cur++;
      if (cur < stepIds.length) {
        document.getElementById(stepIds[cur]).classList.add('active');
      } else {
        clearInterval(interval);
        setTimeout(() => pipelineStepper.classList.add('hidden'), 800);
      }
    }, 800);
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