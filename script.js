document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide SVG icons
  lucide.createIcons();

  /* ========================================================
     1. SCREEN ROUTING & MAIN CONTAINERS
     ======================================================== */
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const container = document.querySelector('.container');
  const signUpLink = document.querySelector('.SignUpLink');
  const signInLink = document.querySelector('.SignInLink');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');

  // Slide between Sign In and Sign Up panels
  signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add('active');
  });

  signInLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove('active');
  });

  // Transition into the Dashboard
  function enterDashboard(name = "Researcher") {
    userDisplayName.textContent = name;
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    lucide.createIcons();
    loadInitialData(); // Load default benchmark comparison
  }

  // Logout back to Auth Screen
  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
  });

  /* ========================================================
     2. AUTH TABS SWITCHING (GOOGLE / PHONE / EMAIL)
     ======================================================== */
  function setupTabSwitch(buttons, views) {
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        views.forEach(v => {
          v.classList.remove('active');
          v.classList.add('hidden');
        });
        btn.classList.add('active');
        views[idx].classList.remove('hidden');
        views[idx].classList.add('active');
      });
    });
  }

  // Login Tabs
  const loginTabs = [
    document.getElementById('tab-login-google-btn'),
    document.getElementById('tab-login-phone-btn'),
    document.getElementById('tab-login-email-btn')
  ];
  const loginViews = [
    document.getElementById('login-google-view'),
    document.getElementById('login-phone-view'),
    document.getElementById('login-email-form')
  ];
  setupTabSwitch(loginTabs, loginViews);

  // Signup Tabs
  const signupTabs = [
    document.getElementById('tab-signup-google-btn'),
    document.getElementById('tab-signup-phone-btn'),
    document.getElementById('tab-signup-email-btn')
  ];
  const signupViews = [
    document.getElementById('signup-google-view'),
    document.getElementById('signup-phone-view'),
    document.getElementById('signup-email-form')
  ];
  setupTabSwitch(signupTabs, signupViews);

  /* ========================================================
     3. STRICT 10-DIGIT NUMERIC ENFORCEMENT & OTP LOGIC
     ======================================================== */
  const loginUserPhone = document.getElementById('login-user-phone');
  const signupUserPhone = document.getElementById('signup-user-phone');
  const loginUserOtp = document.getElementById('login-user-otp');
  const signupUserOtp = document.getElementById('signup-user-otp');

  // Blocks non-numeric keys and strictly clamps length to 10 digits
  function enforceTenDigits(input) {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }
  enforceTenDigits(loginUserPhone);
  enforceTenDigits(signupUserPhone);

  [loginUserOtp, signupUserOtp].forEach(otpIn => {
    otpIn.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
  });

  // Reusable Phone OTP Flow Handler
  function initOtpFlow({ sendBtn, phoneInput, phoneStep, otpStep, timerEl, resendBtn, verifyBtn, otpInput, userPrefix }) {
    let countdown = null;

    sendBtn.addEventListener('click', () => {
      if (phoneInput.value.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        phoneInput.focus();
        return;
      }

      phoneStep.classList.add('hidden');
      otpStep.classList.remove('hidden');
      otpInput.focus();

      let seconds = 30;
      timerEl.textContent = `Resend OTP in ${seconds}s`;
      resendBtn.classList.add('hidden');

      clearInterval(countdown);
      countdown = setInterval(() => {
        seconds--;
        if (seconds > 0) {
          timerEl.textContent = `Resend OTP in ${seconds}s`;
        } else {
          clearInterval(countdown);
          timerEl.textContent = "";
          resendBtn.classList.remove('hidden');
        }
      }, 1000);
    });

    resendBtn.addEventListener('click', () => {
      alert("Demo OTP sent: 123456");
      otpInput.value = "";
      sendBtn.click();
    });

    verifyBtn.addEventListener('click', () => {
      if (otpInput.value === "123456" || otpInput.value.length === 6) {
        clearInterval(countdown);
        enterDashboard(`${userPrefix} (+91 ${phoneInput.value.slice(0, 4)}...)`);
      } else {
        alert("Invalid OTP code. Enter 123456 for this demo.");
        otpInput.focus();
      }
    });
  }

  // Login Phone OTP
  initOtpFlow({
    sendBtn: document.getElementById('login-send-otp-btn'),
    phoneInput: loginUserPhone,
    phoneStep: document.getElementById('login-phone-step'),
    otpStep: document.getElementById('login-otp-step'),
    timerEl: document.getElementById('login-otp-timer'),
    resendBtn: document.getElementById('login-resend-otp-link'),
    verifyBtn: document.getElementById('login-verify-otp-btn'),
    otpInput: loginUserOtp,
    userPrefix: "Member"
  });

  // Signup Phone OTP
  initOtpFlow({
    sendBtn: document.getElementById('signup-send-otp-btn'),
    phoneInput: signupUserPhone,
    phoneStep: document.getElementById('signup-phone-step'),
    otpStep: document.getElementById('signup-otp-step'),
    timerEl: document.getElementById('signup-otp-timer'),
    resendBtn: document.getElementById('signup-resend-otp-link'),
    verifyBtn: document.getElementById('signup-verify-otp-btn'),
    otpInput: signupUserOtp,
    userPrefix: "New Researcher"
  });

  /* ========================================================
     4. EMAIL AUTHENTICATION & PASSWORD MATCH CHECK
     ======================================================== */
  // Login form
  document.getElementById('login-email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    enterDashboard(user || "Researcher");
  });

  // Signup form with Confirm Password check
  document.getElementById('signup-email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;

    if (pass !== confirmPass) {
      alert("Passwords do not match! Please re-enter your password.");
      document.getElementById('reg-confirm-pass').focus();
      return;
    }

    if (pass.length < 6) {
      alert("Password must be at least 6 characters long.");
      document.getElementById('reg-pass').focus();
      return;
    }

    enterDashboard(name || "Registered User");
  });

  /* ========================================================
     5. GOOGLE ACCOUNT CHOOSER MODAL AUTHENTICATION
     ======================================================== */
  const googleModal = document.getElementById('google-modal-overlay');
  const closeGoogleModalBtn = document.getElementById('close-google-modal-btn');
  const googleCustomEmailBtn = document.getElementById('google-custom-email-btn');

  function openGoogleChooser() {
    googleModal.classList.remove('hidden');
  }

  document.getElementById('login-google-btn').addEventListener('click', openGoogleChooser);
  document.getElementById('signup-google-btn').addEventListener('click', openGoogleChooser);

  closeGoogleModalBtn.addEventListener('click', () => {
    googleModal.classList.add('hidden');
  });

  document.querySelectorAll('.google-acc-item').forEach(btn => {
    if (btn.id === 'google-custom-email-btn') return;
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      googleModal.classList.add('hidden');
      enterDashboard(name);
    });
  });

  googleCustomEmailBtn.addEventListener('click', () => {
    const custom = prompt("Enter your Gmail address:");
    if (custom && custom.trim() !== '') {
      googleModal.classList.add('hidden');
      enterDashboard(custom.split('@')[0]);
    }
  });

  /* ========================================================
     6. DASHBOARD WORKSPACE SOURCE SWITCHING
     ======================================================== */
  const tabBtnTopic = document.getElementById('tab-btn-topic');
  const tabBtnUpload = document.getElementById('tab-btn-upload');
  const tabBtnLibrary = document.getElementById('tab-btn-library');
  const secTopic = document.getElementById('section-topic');
  const secUpload = document.getElementById('section-upload');
  const secLibrary = document.getElementById('section-library');

  function switchDashboardSource(activeBtn, activeSec) {
    [tabBtnTopic, tabBtnUpload, tabBtnLibrary].forEach(b => b.classList.remove('active'));
    [secTopic, secUpload, secLibrary].forEach(s => s.classList.add('hidden'));
    activeBtn.classList.add('active');
    activeSec.classList.remove('hidden');
  }

  tabBtnTopic.addEventListener('click', () => switchDashboardSource(tabBtnTopic, secTopic));
  tabBtnUpload.addEventListener('click', () => switchDashboardSource(tabBtnUpload, secUpload));
  tabBtnLibrary.addEventListener('click', () => switchDashboardSource(tabBtnLibrary, secLibrary));

  /* ========================================================
     7. MULTI-FORMAT DOCUMENT UPLOAD & VIEWER MODAL
     ======================================================== */
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseTrigger = document.getElementById('browse-trigger');
  const activeFileCard = document.getElementById('active-file-card');
  const activeFileName = document.getElementById('active-file-name');
  const activeFileSize = document.getElementById('active-file-size');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const previewFileBtn = document.getElementById('preview-file-btn');
  const uploadAnalyzeBtn = document.getElementById('upload-analyze-btn');

  // Preview Modal Elements
  const docPreviewModal = document.getElementById('doc-preview-modal');
  const closePreviewBtn = document.getElementById('close-preview-btn');
  const modalDocTitle = document.getElementById('modal-doc-title');
  const modalDocExt = document.getElementById('modal-doc-ext');
  const modalDocDownload = document.getElementById('modal-doc-download');
  const modalDocPreviewText = document.getElementById('modal-doc-preview-text');
  const modalRunAnalysisBtn = document.getElementById('modal-run-analysis-btn');

  let currentUploadedFile = null;
  let currentFileBlobUrl = null;

  // File browse click triggers
  browseTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  dropZone.addEventListener('click', () => fileInput.click());

  // Drag and Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ef4444';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#3f3f46';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#3f3f46';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  // Display the active uploaded file card
  function handleSelectedFile(file) {
    currentUploadedFile = file;
    currentFileBlobUrl = URL.createObjectURL(file);

    activeFileName.textContent = file.name;
    const sizeKb = (file.size / 1024).toFixed(1);
    activeFileSize.textContent = `${sizeKb} KB • Ready for Analysis`;

    activeFileCard.classList.remove('hidden');
    dropZone.classList.add('hidden');
    lucide.createIcons();
  }

  // Remove the currently staged file
  removeFileBtn.addEventListener('click', () => {
    currentUploadedFile = null;
    if (currentFileBlobUrl) URL.revokeObjectURL(currentFileBlobUrl);
    currentFileBlobUrl = null;
    fileInput.value = '';
    activeFileCard.classList.add('hidden');
    dropZone.classList.remove('hidden');
  });

  // Open Document Viewer Modal
  function openDocumentPreview(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toUpperCase();
    modalDocTitle.textContent = file.name;
    modalDocExt.textContent = ext;
    modalDocDownload.href = currentFileBlobUrl || '#';
    modalDocDownload.download = file.name;

    modalDocPreviewText.textContent = `Document "${file.name}" (${(file.size / 1024).toFixed(1)} KB) successfully parsed into client cache. PyMuPDF extracted methodology definitions, dataset citations, and constraint parameters ready for cross-comparison.`;

    docPreviewModal.classList.remove('hidden');
    lucide.createIcons();
  }

  previewFileBtn.addEventListener('click', () => {
    if (currentUploadedFile) openDocumentPreview(currentUploadedFile);
  });

  closePreviewBtn.addEventListener('click', () => {
    docPreviewModal.classList.add('hidden');
  });

  modalRunAnalysisBtn.addEventListener('click', () => {
    docPreviewModal.classList.add('hidden');
    uploadAnalyzeBtn.click();
  });

  /* ========================================================
     8. AGENT PIPELINE SIMULATOR & RESULTS RENDERING
     ======================================================== */
  const pipelineStepper = document.getElementById('pipeline-stepper');
  const papersContainer = document.getElementById('papers-container');
  const paperCountTag = document.getElementById('paper-count-tag');
  const matrixTbody = document.getElementById('matrix-tbody');
  const gapsContainer = document.getElementById('gaps-container');
  const searchInput = document.getElementById('search-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const vaultAnalyzeBtn = document.getElementById('vault-analyze-btn');

  function executeAnalysis(corpusData, gapsData, approachData) {
    pipelineStepper.classList.remove('hidden');
    const stepIds = ['step-0', 'step-1', 'step-2', 'step-3'];
    stepIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(stepIds[0]).classList.add('active');

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < stepIds.length) {
        document.getElementById(stepIds[current]).classList.add('active');
      } else {
        clearInterval(interval);
        setTimeout(() => {
          pipelineStepper.classList.add('hidden');
          renderData(corpusData, gapsData, approachData);
        }, 500);
      }
    }, 600);
  }

  function renderData(corpus, gaps, approach) {
    // 1. Render Left Panel Papers
    paperCountTag.textContent = `${corpus.length} Documents Linked`;
    papersContainer.innerHTML = '';
    
    corpus.forEach(item => {
      const el = document.createElement('div');
      el.className = 'paper-item';
      el.innerHTML = `
        <div class="paper-title-row">
          <h4>${item.title}</h4>
          <a href="#" class="ext-link"><i data-lucide="external-link"></i></a>
        </div>
        <div class="paper-meta">
          <span>${item.authors}</span>
          <span class="badge-year">${item.year}</span>
        </div>
        <span class="dataset-tag">${item.dataset}</span>
      `;
      papersContainer.appendChild(el);
    });

    // 2. Render Comparison Matrix Table
    matrixTbody.innerHTML = '';
    corpus.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="bold-text">${item.title}</td>
        <td>${item.methodology}</td>
        <td>${item.dataset}</td>
        <td class="success-text">${item.keyResult}</td>
        <td class="lim-text">${item.limitation}</td>
      `;
      matrixTbody.appendChild(tr);
    });

    // 3. Render Potential Gaps Cards
    gapsContainer.innerHTML = '';
    gaps.forEach(g => {
      const gapEl = document.createElement('div');
      gapEl.className = 'gap-card';
      gapEl.innerHTML = `
        <div class="gap-top">
          <span class="gap-badge">${g.badge}</span>
          <h4>${g.title}</h4>
        </div>
        <div class="gap-reason">
          <p><strong>Why it may represent a gap:</strong> ${g.whyGap}</p>
        </div>
        <div class="gap-evidence">
          <span class="ev-title">Supporting Document / Literature Evidence:</span>
          <p class="ev-quote">"${g.evidence}"</p>
        </div>
      `;
      gapsContainer.appendChild(gapEl);
    });

    // 4. Render Suggested Blueprint Tab
    if (approach) {
      document.getElementById('bp-title').textContent = approach.title;
      document.getElementById('bp-desc').textContent = approach.desc;
      document.getElementById('bp-method').textContent = approach.method;
    }

    lucide.createIcons();
  }

  // Initial Seed Data (Rendered on load)
  function loadInitialData() {
    const defaultPapers = [
      {
        title: "Deep Residual Learning for In-Field Plant Pathogens",
        authors: "Sharma et al.",
        year: "2023",
        dataset: "PlantVillage (54k images)",
        methodology: "ResNet-50 + Spatial Attention",
        keyResult: "98.2% Accuracy",
        limitation: "Drastic 34% drop under dynamic outdoor shadows."
      },
      {
        title: "Edge Vision Transformers for Agritech",
        authors: "Chen & Patel",
        year: "2024",
        dataset: "Field-Farm (1.2k samples)",
        methodology: "MobileViT INT8 Quantized",
        keyResult: "32ms on Raspberry Pi 4",
        limitation: "Low sensitivity to early micro-lesions prior to discoloration."
      }
    ];

    const defaultGaps = [
      {
        badge: "Consensus Bottleneck in 2/2 Papers",
        title: "Environmental Lighting Robustness in Real-World Mobile Edge Capture",
        whyGap: "Benchmark models perform near 100% on studio leaf datasets but collapse under uncontrolled farmer outdoor conditions.",
        evidence: "Sharma et al. validation collapsed outdoors, while Chen et al. recorded failures under angled sunlight."
      }
    ];

    renderData(defaultPapers, defaultGaps, null);
  }

  // Run Analysis on Search Query
  analyzeBtn.addEventListener('click', () => {
    const q = searchInput.value.trim() || "Research Field Analysis";
    executeAnalysis([
      {
        title: `Empirical Literature on ${q}`,
        authors: "arXiv / OpenAccess",
        year: "2024",
        dataset: "Open Source Benchmark",
        methodology: "Transformer / ViT Architecture",
        keyResult: "High baseline precision",
        limitation: "Limited generalization across cross-domain distributions."
      },
      {
        title: `Self-Supervised Adaptations for ${q}`,
        authors: "Semantic Scholar",
        year: "2023",
        dataset: "Synthesized Field Set",
        methodology: "Contrastive Pretraining",
        keyResult: "Robust representations",
        limitation: "Computationally intensive inference latency on edge devices."
      }
    ], [
      {
        badge: "Cross-Disciplinary Bottleneck",
        title: `Edge Inference vs Generalization Dilemma in ${q}`,
        whyGap: `Published literature in ${q} fails to preserve sub-millimeter features after quantization.`,
        evidence: "Reported limitations show an acute trade-off between model compression and fine-grained lesion recall."
      }
    ], {
      title: `Proposed Solution Framework for ${q}`,
      desc: "Knowledge-distilled lightweight vision backbone with synthetic perturbation pipelines.",
      method: "Simulate dynamic blur and occlusion transforms before running quantization-aware training."
    });
  });

  // Run Analysis on Uploaded File
  uploadAnalyzeBtn.addEventListener('click', () => {
    if (!currentUploadedFile) {
      alert("Please upload a paper or document first.");
      return;
    }

    const fileName = currentUploadedFile.name;
    const fileSize = (currentUploadedFile.size / 1024).toFixed(1);

    const uploadedCorpus = [
      {
        title: `[Uploaded] ${fileName}`,
        authors: "Local Ingestion Parser",
        year: "2024",
        dataset: `${fileSize} KB (Local File)`,
        methodology: "Document Vector Extraction",
        keyResult: "Experimental Scope Identified",
        limitation: "Requires statistical significance tests and validation against cross-domain benchmarks."
      },
      {
        title: "Deep Residual Learning for In-Field Plant Pathogens",
        authors: "Sharma et al.",
        year: "2023",
        dataset: "PlantVillage (54k images)",
        methodology: "ResNet-50 + Spatial Attention",
        keyResult: "98.2% Accuracy",
        limitation: "Degrades under outdoor shadows and occluded angles."
      }
    ];

    const uploadedGaps = [
      {
        badge: "Extracted from Uploaded File",
        title: `Empirical Limitation in '${fileName.slice(0, 32)}...'`,
        whyGap: "The uploaded paper methods do not provide comparative validation against recent state-of-the-art architectures under real-world noise.",
        evidence: `Extracted from ${fileName}: The experimental scope lacks cross-dataset domain adaptation benchmarks.`
      }
    ];

    const uploadedApproach = {
      title: "Targeted Research Augmentation Proposal",
      desc: "Expand your uploaded research by integrating synthetic domain augmentation into your existing pipeline.",
      method: "Benchmark against MobileViT baselines and incorporate cross-validation across heterogeneous datasets."
    };

    executeAnalysis(uploadedCorpus, uploadedGaps, uploadedApproach);
  });

  // Run Analysis on Pre-indexed Vault Papers
  vaultAnalyzeBtn.addEventListener('click', () => {
    loadInitialData();
  });

  // Quick Query Pill Buttons
  document.querySelectorAll('.query-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      searchInput.value = pill.getAttribute('data-query');
      analyzeBtn.click();
    });
  });

  // Right Panel Tab Navigation (Matrix / Gaps / Approach)
  const rightTabs = document.querySelectorAll('.nav-tab');
  const rightTabContents = document.querySelectorAll('.tab-content');

  rightTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rightTabs.forEach(t => t.classList.remove('active'));
      rightTabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
      lucide.createIcons();
    });
  });

  /* ========================================================
     9. EXPORT BRIEF & COPY ACTIONS
     ======================================================== */
  document.getElementById('copy-summary-btn').addEventListener('click', () => {
    navigator.clipboard.writeText("LitGap AI Research Brief:\n- Identified Gap: Real-world lighting variance\n- Supporting Evidence: Sharma et al.\n- Approach: MobileViT domain adaptation");
    alert("Research brief copied to clipboard!");
  });

  document.getElementById('export-brief-btn').addEventListener('click', () => {
    const brief = {
      timestamp: new Date().toISOString(),
      source: "LitGap AI Discovery Engine",
      activeDocument: currentUploadedFile ? currentUploadedFile.name : "Benchmark Corpus",
      status: "Evidence Synthesized"
    };
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "litgap_research_brief.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});