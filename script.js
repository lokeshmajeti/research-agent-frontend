document.addEventListener('DOMContentLoaded', () => {
  // A CDN outage must not stop the rest of the application from starting.
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderIcons();

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
    renderIcons();
    resetResults();
  }

  // Logout back to Auth Screen
  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');

    // Return to the original Sign In panel
    container.classList.remove('active');
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

  function escapeHTML(value) {
    const element = document.createElement('div');
    element.textContent = String(value ?? '');
    return element.innerHTML;
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
      e.target.value = e.target.value
        .replace(/\D/g, '')
        .slice(0, 10);
    });
  }

  enforceTenDigits(loginUserPhone);
  enforceTenDigits(signupUserPhone);

  [loginUserOtp, signupUserOtp].forEach(otpIn => {
    otpIn.addEventListener('input', (e) => {
      e.target.value = e.target.value
        .replace(/\D/g, '')
        .slice(0, 6);
    });
  });

  // Reusable Phone OTP Flow Handler
  function initOtpFlow({
    sendBtn,
    phoneInput,
    phoneStep,
    otpStep,
    timerEl,
    resendBtn,
    verifyBtn,
    otpInput,
    userPrefix
  }) {
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

      timerEl.textContent =
        `Resend OTP in ${seconds}s`;

      resendBtn.classList.add('hidden');

      clearInterval(countdown);

      countdown = setInterval(() => {
        seconds--;

        if (seconds > 0) {
          timerEl.textContent =
            `Resend OTP in ${seconds}s`;
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
      if (otpInput.value === "123456") {
        clearInterval(countdown);

        enterDashboard(
          `${userPrefix} (+91 ${phoneInput.value.slice(0, 4)}...)`
        );
      } else {
        alert(
          "Invalid OTP code. Enter 123456 for this demo."
        );

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
  document
    .getElementById('login-email-form')
    .addEventListener('submit', (e) => {
      e.preventDefault();

      const user = document
        .getElementById('login-user')
        .value
        .trim();

      enterDashboard(user || "Researcher");
    });

  // Signup form with Confirm Password check
  document
    .getElementById('signup-email-form')
    .addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document
        .getElementById('reg-name')
        .value
        .trim();

      const pass = document
        .getElementById('reg-pass')
        .value;

      const confirmPass = document
        .getElementById('reg-confirm-pass')
        .value;

      if (pass !== confirmPass) {
        alert(
          "Passwords do not match! Please re-enter your password."
        );

        document
          .getElementById('reg-confirm-pass')
          .focus();

        return;
      }

      if (pass.length < 6) {
        alert(
          "Password must be at least 6 characters long."
        );

        document
          .getElementById('reg-pass')
          .focus();

        return;
      }

      enterDashboard(name || "Registered User");
    });

  /* ========================================================
     5. GOOGLE ACCOUNT CHOOSER MODAL AUTHENTICATION
     ======================================================== */

  const googleModal =
    document.getElementById('google-modal-overlay');

  const closeGoogleModalBtn =
    document.getElementById('close-google-modal-btn');

  const googleCustomEmailBtn =
    document.getElementById('google-custom-email-btn');

  function openGoogleChooser() {
    googleModal.classList.remove('hidden');
  }

  document
    .getElementById('login-google-btn')
    .addEventListener('click', openGoogleChooser);

  document
    .getElementById('signup-google-btn')
    .addEventListener('click', openGoogleChooser);

  closeGoogleModalBtn.addEventListener('click', () => {
    googleModal.classList.add('hidden');
  });

  document
    .querySelectorAll('.google-acc-item')
    .forEach(btn => {
      if (btn.id === 'google-custom-email-btn') {
        return;
      }

      btn.addEventListener('click', () => {
        const name =
          btn.getAttribute('data-name');

        googleModal.classList.add('hidden');

        enterDashboard(name);
      });
    });

  googleCustomEmailBtn.addEventListener('click', () => {
    const custom =
      prompt("Enter your Gmail address:");

    if (custom && custom.trim() !== '') {
      googleModal.classList.add('hidden');

      enterDashboard(
        custom.split('@')[0]
      );
    }
  });

  /* ========================================================
     6. DASHBOARD WORKSPACE SOURCE SWITCHING
     ======================================================== */

  const tabBtnTopic =
    document.getElementById('tab-btn-topic');

  const tabBtnUpload =
    document.getElementById('tab-btn-upload');

  const tabBtnLibrary =
    document.getElementById('tab-btn-library');

  const secTopic =
    document.getElementById('section-topic');

  const secUpload =
    document.getElementById('section-upload');

  const secLibrary =
    document.getElementById('section-library');

  function switchDashboardSource(
    activeBtn,
    activeSec
  ) {
    [
      tabBtnTopic,
      tabBtnUpload,
      tabBtnLibrary
    ].forEach(
      b => b.classList.remove('active')
    );

    [
      secTopic,
      secUpload,
      secLibrary
    ].forEach(
      s => s.classList.add('hidden')
    );

    activeBtn.classList.add('active');
    activeSec.classList.remove('hidden');
  }

  tabBtnTopic.addEventListener('click', () => {
    switchDashboardSource(
      tabBtnTopic,
      secTopic
    );
  });

  tabBtnUpload.addEventListener('click', () => {
    switchDashboardSource(
      tabBtnUpload,
      secUpload
    );
  });

  tabBtnLibrary.addEventListener('click', () => {
    switchDashboardSource(
      tabBtnLibrary,
      secLibrary
    );
  });

  /* ========================================================
     7. MULTI-FORMAT DOCUMENT UPLOAD & VIEWER MODAL
     ======================================================== */

  const dropZone =
    document.getElementById('drop-zone');

  const fileInput =
    document.getElementById('file-input');

  const browseTrigger =
    document.getElementById('browse-trigger');

  const activeFileCard =
    document.getElementById('active-file-card');

  const selectedFilesContainer =
    document.getElementById(
      'selected-files-container'
    );

  const selectedFilesSummary =
    document.getElementById(
      'selected-files-summary'
    );

  const selectAllFilesBtn =
    document.getElementById(
      'select-all-files-btn'
    );

  const addMoreFilesBtn =
    document.getElementById(
      'add-more-files-btn'
    );

  const clearFilesBtn =
    document.getElementById(
      'clear-files-btn'
    );

  const uploadAnalyzeBtn =
    document.getElementById(
      'upload-analyze-btn'
    );

  // Vault Uploaded Section Elements
  const vaultUploadedContainer =
    document.getElementById(
      'vault-uploaded-container'
    );

  const vaultUploadedEmpty =
    document.getElementById(
      'vault-uploaded-empty'
    );

  const vaultUploadedCount =
    document.getElementById(
      'vault-uploaded-count'
    );

  const vaultUploadedActions =
    document.getElementById(
      'vault-uploaded-actions'
    );

  const vaultUploadAnalyzeBtn =
    document.getElementById(
      'vault-upload-analyze-btn'
    );

  const vaultToUploadLink =
    document.getElementById(
      'vault-to-upload-link'
    );

  // Preview Modal Elements
  const docPreviewModal =
    document.getElementById(
      'doc-preview-modal'
    );

  const closePreviewBtn =
    document.getElementById(
      'close-preview-btn'
    );

  const modalDocTitle =
    document.getElementById(
      'modal-doc-title'
    );

  const modalDocExt =
    document.getElementById(
      'modal-doc-ext'
    );

  const modalDocDownload =
    document.getElementById(
      'modal-doc-download'
    );

  const modalDocPreviewText =
    document.getElementById(
      'modal-doc-preview-text'
    );

  const modalRunAnalysisBtn =
    document.getElementById(
      'modal-run-analysis-btn'
    );

  let uploadedDocuments = [];

  // File browse click triggers
  browseTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  addMoreFilesBtn.addEventListener('click', () => {
    fileInput.click();
  });

  if (selectAllFilesBtn) {
    selectAllFilesBtn.addEventListener('click', () => {
      const count =
        uploadedDocuments.length;

      if (!count) {
        return;
      }

      const allSelected =
        uploadedDocuments.every(
          doc => doc.selected
        );

      uploadedDocuments.forEach(doc => {
        doc.selected = !allSelected;
      });

      renderSelectedFiles();
    });
  }

  if (vaultToUploadLink) {
    vaultToUploadLink.addEventListener(
      'click',
      (e) => {
        e.preventDefault();

        switchDashboardSource(
          tabBtnUpload,
          secUpload
        );
      }
    );
  }

  if (vaultUploadAnalyzeBtn) {
    vaultUploadAnalyzeBtn.addEventListener(
      'click',
      () => {
        uploadAnalyzeBtn.click();
      }
    );
  }

  // Drag and Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();

    dropZone.style.borderColor =
      '#ef4444';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor =
      '#3f3f46';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();

    dropZone.style.borderColor =
      '#3f3f46';

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      addSelectedFiles(
        [...e.dataTransfer.files]
      );
    }
  });

  fileInput.addEventListener(
    'change',
    (e) => {
      if (
        e.target.files &&
        e.target.files.length > 0
      ) {
        addSelectedFiles(
          [...e.target.files]
        );
      }

      fileInput.value = '';
    }
  );

  const allowedExtensions =
    new Set([
      'pdf',
      'doc',
      'docx',
      'txt',
      'csv',
      'rtf',
      'md'
    ]);

  const maxUploadBytes =
    20 * 1024 * 1024;

  const maxUploadCount = 10;

  function addSelectedFiles(files) {
    const availableSlots =
      maxUploadCount -
      uploadedDocuments.length;

    if (availableSlots <= 0) {
      alert(
        `You can analyze up to ${maxUploadCount} documents at once.`
      );

      return;
    }

    const newDocuments = [];

    files
      .slice(0, availableSlots)
      .forEach(file => {
        const extension =
          file.name.includes('.')
            ? file.name
                .split('.')
                .pop()
                .toLowerCase()
            : '';

        if (
          !allowedExtensions.has(
            extension
          )
        ) {
          alert(
            `${file.name} was skipped: unsupported file type.`
          );

          return;
        }

        if (
          file.size >
          maxUploadBytes
        ) {
          alert(
            `${file.name} was skipped: files must be smaller than 20 MB.`
          );

          return;
        }

        const duplicate =
          uploadedDocuments.some(
            doc =>
              doc.file.name ===
                file.name &&
              doc.file.size ===
                file.size &&
              doc.file.lastModified ===
                file.lastModified
          );

        if (!duplicate) {
          newDocuments.push({
            id:
              crypto.randomUUID?.() ||
              `${Date.now()}-${Math.random()}`,

            file,

            blobUrl:
              URL.createObjectURL(
                file
              ),

            text: '',

            error: '',

            status:
              'Reading document…',

            selected: true
          });
        }
      });

    uploadedDocuments.push(
      ...newDocuments
    );

    renderSelectedFiles();

    newDocuments.forEach(
      extractDocument
    );
  }

  async function extractDocument(
    document
  ) {
    try {
      const extractedText =
        await extractTextFromFile(
          document.file
        );

      if (
        !uploadedDocuments.includes(
          document
        )
      ) {
        return;
      }

      document.text =
        extractedText;

      const wordCount =
        getWords(
          extractedText
        ).length;

      if (!wordCount) {
        throw new Error(
          'No readable text was found in this document.'
        );
      }

      document.status =
        `${wordCount.toLocaleString()} words extracted locally`;
    } catch (error) {
      if (
        !uploadedDocuments.includes(
          document
        )
      ) {
        return;
      }

      document.error =
        error.message ||
        'The document could not be read.';

      document.status =
        document.error;
    }

    renderSelectedFiles();
  }

  async function extractTextFromFile(
    file
  ) {
    const extension =
      file.name
        .split('.')
        .pop()
        .toLowerCase();

    if (
      [
        'txt',
        'csv',
        'md',
        'rtf'
      ].includes(extension)
    ) {
      return file.text();
    }

    if (extension === 'docx') {
      if (!window.mammoth) {
        throw new Error(
          'DOCX reader did not load. Check your internet connection and reload.'
        );
      }

      const result =
        await window.mammoth.extractRawText(
          {
            arrayBuffer:
              await file.arrayBuffer()
          }
        );

      return result.value;
    }

    if (extension === 'pdf') {
      if (!window.pdfjsLib) {
        throw new Error(
          'PDF reader did not load. Check your internet connection and reload.'
        );
      }

      window.pdfjsLib
        .GlobalWorkerOptions
        .workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdf =
        await window.pdfjsLib
          .getDocument({
            data:
              await file.arrayBuffer()
          })
          .promise;

      const pages = [];

      for (
        let pageNumber = 1;
        pageNumber <=
        pdf.numPages;
        pageNumber++
      ) {
        const page =
          await pdf.getPage(
            pageNumber
          );

        const content =
          await page.getTextContent();

        pages.push(
          content.items
            .map(item => item.str)
            .join(' ')
        );
      }

      return pages.join(
        '\n\n'
      );
    }

    throw new Error(
      'Legacy .doc files are not supported by local extraction. Save the file as .docx first.'
    );
  }

  function removeDocument(
    document
  ) {
    URL.revokeObjectURL(
      document.blobUrl
    );

    uploadedDocuments =
      uploadedDocuments.filter(
        item => item !== document
      );

    renderSelectedFiles();
  }

  clearFilesBtn.addEventListener(
    'click',
    () => {
      uploadedDocuments.forEach(
        document => {
          URL.revokeObjectURL(
            document.blobUrl
          );
        }
      );

      uploadedDocuments = [];

      fileInput.value = '';

      renderSelectedFiles();
    }
  );

  function renderSelectedFiles() {
    selectedFilesContainer.innerHTML =
      '';

    uploadedDocuments.forEach(
      item => {
        const row =
          document.createElement(
            'div'
          );

        row.className =
          'selected-file-row';

        const select =
          document.createElement(
            'input'
          );

        select.type =
          'checkbox';

        select.className =
          'upload-document-chk';

        select.checked =
          item.selected;

        select.title =
          `Include ${item.file.name} in comparison`;

        select.setAttribute(
          'aria-label',
          `Include ${item.file.name} in comparison`
        );

        select.addEventListener(
          'change',
          () => {
            item.selected =
              select.checked;

            renderSelectedFiles();
          }
        );

        const details =
          document.createElement(
            'div'
          );

        details.className =
          'file-details';

        const name =
          document.createElement(
            'strong'
          );

        name.textContent =
          item.file.name;

        const status =
          document.createElement(
            'span'
          );

        status.textContent =
          `${(item.file.size / 1024).toFixed(1)} KB • ${item.status}`;

        details.append(
          name,
          status
        );

        const preview =
          document.createElement(
            'button'
          );

        preview.type =
          'button';

        preview.className =
          'file-row-button';

        preview.textContent =
          'Preview';

        preview.addEventListener(
          'click',
          () => {
            openDocumentPreview(
              item
            );
          }
        );

        const remove =
          document.createElement(
            'button'
          );

        remove.type =
          'button';

        remove.className =
          'file-remove-btn';

        remove.textContent =
          '×';

        remove.title =
          `Remove ${item.file.name}`;

        remove.addEventListener(
          'click',
          () =>
            removeDocument(
              item
            )
        );

        row.append(
          select,
          details,
          preview,
          remove
        );

        selectedFilesContainer
          .appendChild(row);
      }
    );

    const count =
      uploadedDocuments.length;

    const selectedCount =
      uploadedDocuments.filter(
        document =>
          document.selected
      ).length;

    const readyCount =
      uploadedDocuments.filter(
        document =>
          document.selected &&
          document.text
      ).length;

    selectedFilesSummary.textContent =
      `${count} uploaded • ${selectedCount} selected for comparison`;

    addMoreFilesBtn.disabled =
      count >= maxUploadCount;

    uploadAnalyzeBtn.disabled =
      selectedCount < 2 ||
      readyCount < 2;

    uploadAnalyzeBtn.title =
      selectedCount < 2
        ? 'Select at least two uploaded documents for comparison.'
        : readyCount < 2
          ? 'Wait for at least two selected documents to finish text extraction.'
          : '';

    activeFileCard.classList.toggle(
      'hidden',
      count === 0
    );

    // Sync with Paper Vault Uploaded Section
    if (vaultUploadedContainer) {
      vaultUploadedContainer.innerHTML =
        '';

      if (count === 0) {
        if (vaultUploadedEmpty) {
          vaultUploadedEmpty
            .classList
            .remove('hidden');
        }

        vaultUploadedContainer
          .classList
          .add('hidden');

        if (vaultUploadedActions) {
          vaultUploadedActions
            .classList
            .add('hidden');
        }

        if (vaultUploadedCount) {
          vaultUploadedCount.textContent =
            '0 uploaded';
        }
      } else {
        if (vaultUploadedEmpty) {
          vaultUploadedEmpty
            .classList
            .add('hidden');
        }

        vaultUploadedContainer
          .classList
          .remove('hidden');

        if (vaultUploadedCount) {
          vaultUploadedCount.textContent =
            `${count} uploaded (${selectedCount} selected)`;
        }

        if (vaultUploadedActions) {
          vaultUploadedActions
            .classList
            .remove('hidden');

          if (
            vaultUploadAnalyzeBtn
          ) {
            vaultUploadAnalyzeBtn.disabled =
              selectedCount < 2 ||
              readyCount < 2;

            vaultUploadAnalyzeBtn.innerHTML =
              `<i data-lucide="play"></i> Analyze ${selectedCount} Selected Upload${selectedCount === 1 ? '' : 's'}`;
          }
        }

        uploadedDocuments.forEach(
          item => {
            const label =
              document.createElement(
                'label'
              );

            label.className =
              'vault-item';

            const chk =
              document.createElement(
                'input'
              );

            chk.type =
              'checkbox';

            chk.className =
              'vault-chk vault-upload-chk';

            chk.checked =
              item.selected;

            chk.addEventListener(
              'change',
              () => {
                item.selected =
                  chk.checked;

                renderSelectedFiles();
              }
            );

            const info =
              document.createElement(
                'div'
              );

            info.className =
              'vault-info';

            info.innerHTML = `
              <strong>${escapeHTML(item.file.name)}</strong>
              <small>${(item.file.size / 1024).toFixed(1)} KB • ${escapeHTML(item.status)}</small>
            `;

            label.append(
              chk,
              info
            );

            vaultUploadedContainer
              .appendChild(label);
          }
        );
      }
    }

    if (selectAllFilesBtn) {
      const allSelected =
        count > 0 &&
        selectedCount === count;

      selectAllFilesBtn.textContent =
        allSelected
          ? 'Deselect all'
          : 'Select all';
    }

    renderIcons();
  }

  // Open Document Viewer Modal
  function openDocumentPreview(
    document
  ) {
    const ext =
      document.file.name
        .split('.')
        .pop()
        .toUpperCase();

    modalDocTitle.textContent =
      document.file.name;

    modalDocExt.textContent =
      ext;

    modalDocDownload.href =
      document.blobUrl;

    modalDocDownload.download =
      document.file.name;

    modalDocPreviewText.textContent =
      document.text.slice(0, 3000)
      ||
      document.error
      ||
      'No readable text was found in this document.';

    docPreviewModal
      .classList
      .remove('hidden');

    renderIcons();
  }

  closePreviewBtn.addEventListener(
    'click',
    () => {
      docPreviewModal
        .classList
        .add('hidden');
    }
  );

  modalRunAnalysisBtn.addEventListener(
    'click',
    () => {
      docPreviewModal
        .classList
        .add('hidden');

      uploadAnalyzeBtn.click();
    }
  );

  /* ========================================================
     8. AGENT PIPELINE SIMULATOR & RESULTS RENDERING
     ======================================================== */

  const pipelineStepper =
    document.getElementById(
      'pipeline-stepper'
    );

  const papersContainer =
    document.getElementById(
      'papers-container'
    );

  const paperCountTag =
    document.getElementById(
      'paper-count-tag'
    );

  const matrixTbody =
    document.getElementById(
      'matrix-tbody'
    );

  const gapsContainer =
    document.getElementById(
      'gaps-container'
    );

  const searchInput =
    document.getElementById(
      'search-input'
    );

  const analyzeBtn =
    document.getElementById(
      'analyze-btn'
    );

  const vaultAnalyzeBtn =
    document.getElementById(
      'vault-analyze-btn'
    );

  const vaultCheckboxes =
    [
      ...document.querySelectorAll(
        '.vault-chk'
      )
    ];

  const vaultSelectionStatus =
    document.getElementById(
      'vault-selection-status'
    );

  const vaultPapers = [
    {
      id:
        'plant-pathogens',

      title:
        'Deep Residual Learning for In-Field Plant Pathogens',

      authors:
        'Sharma et al.',

      year:
        '2023',

      dataset:
        'PlantVillage (54k images)',

      methodology:
        'ResNet-50 + Spatial Attention',

      keyResult:
        '98.2% Accuracy',

      limitation:
        'Drastic 34% drop under dynamic outdoor shadows.'
    },

    {
      id:
        'edge-agritech',

      title:
        'Edge Vision Transformers for Real-Time Agritech',

      authors:
        'Chen & Patel',

      year:
        '2024',

      dataset:
        'Field-Farm (1.2k samples)',

      methodology:
        'MobileViT INT8 Quantized',

      keyResult:
        '32ms on Raspberry Pi 4',

      limitation:
        'Low sensitivity to early micro-lesions prior to discoloration.'
    }
  ];

  let analysisInterval = null;
  let analysisCompletionTimer = null;
  let lastAnalysisDocuments = [];

  function resetResults() {
    // Clear previously exported-result state when entering the dashboard.
    lastAnalysisDocuments = [];

    paperCountTag.textContent =
      'No documents analyzed';

    papersContainer.innerHTML =
      '';

    matrixTbody.innerHTML =
      '';

    gapsContainer.innerHTML =
      '<p class="section-desc">Run an analysis to view comparison evidence and potential gaps.</p>';
  }

  function getSelectedVaultPapers() {
    const selectedIds =
      new Set(
        vaultCheckboxes
          .filter(
            checkbox =>
              checkbox.checked
          )
          .map(
            checkbox =>
              checkbox.dataset.vaultId
          )
      );

    return vaultPapers.filter(
      paper =>
        selectedIds.has(
          paper.id
        )
    );
  }

  function updateVaultSelectionState() {
    const count =
      getSelectedVaultPapers()
        .length;

    vaultAnalyzeBtn.disabled =
      count === 0;

    vaultSelectionStatus.textContent =
      count
        ? `${count} benchmark paper${count === 1 ? '' : 's'} selected.`
        : 'Select one or more benchmark papers to analyze.';
  }

  vaultCheckboxes.forEach(
    checkbox =>
      checkbox.addEventListener(
        'change',
        updateVaultSelectionState
      )
  );

  updateVaultSelectionState();

  function executeAnalysis(
    corpusData,
    gapsData,
    approachData
  ) {
    clearInterval(
      analysisInterval
    );

    clearTimeout(
      analysisCompletionTimer
    );

    lastAnalysisDocuments =
      corpusData.map(
        item => item.title
      );

    pipelineStepper
      .classList
      .remove('hidden');

    const stepIds = [
      'step-0',
      'step-1',
      'step-2',
      'step-3'
    ];

    stepIds.forEach(
      id =>
        document
          .getElementById(id)
          .classList
          .remove('active')
    );

    document
      .getElementById(
        stepIds[0]
      )
      .classList
      .add('active');

    let current = 0;

    analysisInterval =
      setInterval(() => {
        current++;

        if (
          current <
          stepIds.length
        ) {
          document
            .getElementById(
              stepIds[current]
            )
            .classList
            .add('active');
        } else {
          clearInterval(
            analysisInterval
          );

          analysisCompletionTimer =
            setTimeout(
              () => {
                pipelineStepper
                  .classList
                  .add('hidden');

                renderData(
                  corpusData,
                  gapsData,
                  approachData
                );
              },
              500
            );
        }
      }, 600);
  }

  function renderData(
    corpus,
    gaps,
    approach
  ) {
    // 1. Render Left Panel Papers
    paperCountTag.textContent =
      `${corpus.length} Documents Linked`;

    papersContainer.innerHTML =
      '';

    corpus.forEach(
      item => {
        const el =
          document.createElement(
            'div'
          );

        el.className =
          'paper-item';

        const paperUrl =
          item.pdfUrl ||
          item.url ||
          '';

        const accessLabel =
          item.pdfUrl
            ? 'Open PDF'
            : 'Open Paper';

        const sourceName =
          item.sourceName ||
          '';

        el.innerHTML = `
          <div class="paper-title-row">
            <h4>${escapeHTML(item.title)}</h4>

            ${
              paperUrl
                ? `
                  <a
                    href="${escapeHTML(paperUrl)}"
                    class="ext-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="${escapeHTML(accessLabel)}"
                  >
                    <i data-lucide="external-link"></i>
                  </a>
                `
                : ''
            }
          </div>

          <div class="paper-meta">
            <span>${escapeHTML(item.authors)}</span>
            <span class="badge-year">
              ${escapeHTML(item.year)}
            </span>
          </div>

          <span class="dataset-tag">
            ${escapeHTML(item.dataset)}
          </span>

          ${
            sourceName
              ? `
                <small
                  style="
                    color:#71717a;
                    font-size:9px;
                  "
                >
                  Source: ${escapeHTML(sourceName)}
                  ${
                    item.isOpenAccess
                      ? ' • Open Access'
                      : ''
                  }
                </small>
              `
              : ''
          }
        `;

        papersContainer
          .appendChild(el);
      }
    );

    // 2. Render Comparison Matrix Table
    matrixTbody.innerHTML =
      '';

    corpus.forEach(
      item => {
        const tr =
          document.createElement(
            'tr'
          );

        tr.innerHTML = `
          <td class="bold-text">
            ${escapeHTML(item.title)}
          </td>

          <td>
            ${escapeHTML(item.methodology)}
          </td>

          <td>
            ${escapeHTML(item.dataset)}
          </td>

          <td class="success-text">
            ${escapeHTML(item.keyResult)}
          </td>

          <td class="lim-text">
            ${escapeHTML(item.limitation)}
          </td>
        `;

        matrixTbody
          .appendChild(tr);
      }
    );

    // 3. Render Potential Gaps Cards
    gapsContainer.innerHTML =
      '';

    gaps.forEach(
      g => {
        const gapEl =
          document.createElement(
            'div'
          );

        gapEl.className =
          'gap-card';

        gapEl.innerHTML = `
          <div class="gap-top">
            <span class="gap-badge">
              ${escapeHTML(g.badge)}
            </span>

            <h4>
              ${escapeHTML(g.title)}
            </h4>
          </div>

          <div class="gap-reason">
            <p>
              <strong>
                Why it may represent a gap:
              </strong>
              ${escapeHTML(g.whyGap)}
            </p>
          </div>

          <div class="gap-evidence">
            <span class="ev-title">
              Supporting Document / Literature Evidence:
            </span>

            <p class="ev-quote">
              "${escapeHTML(g.evidence)}"
            </p>
          </div>
        `;

        gapsContainer
          .appendChild(gapEl);
      }
    );

    // 4. Render Suggested Blueprint Tab
    if (approach) {
      document
        .getElementById(
          'bp-title'
        )
        .textContent =
        approach.title;

      document
        .getElementById(
          'bp-desc'
        )
        .textContent =
        approach.desc;

      document
        .getElementById(
          'bp-method'
        )
        .textContent =
        approach.method;

      const stack =
        document.getElementById(
          'bp-stack'
        );

      stack.replaceChildren();

      (
        approach.stack ||
        [
          'Local extraction',
          'Manual validation'
        ]
      ).forEach(
        label => {
          const chip =
            document.createElement(
              'span'
            );

          chip.className =
            'chip chip-accent';

          chip.textContent =
            label;

          stack.appendChild(
            chip
          );
        }
      );
    }

    renderIcons();
  }

  function getWords(text) {
    return (
      String(text)
        .toLowerCase()
        .match(
          /[a-z][a-z0-9-]{2,}/g
        ) || []
    );
  }

  function findRelevantSentence(
    text,
    patterns
  ) {
    const paragraphs =
      String(text)
        .split(
          /\n\s*\n|(?<=[.!?])\s+/
        )
        .map(
          part =>
            part
              .replace(
                /\s+/g,
                ' '
              )
              .trim()
        )
        .filter(Boolean);

    return (
      paragraphs.find(
        paragraph =>
          patterns.some(
            pattern =>
              pattern.test(
                paragraph
              )
          )
      ) || ''
    );
  }

  function mostFrequentKeywords(
    text,
    limit = 5
  ) {
    const stopWords =
      new Set([
        'about',
        'after',
        'also',
        'among',
        'and',
        'are',
        'been',
        'before',
        'being',
        'based',
        'because',
        'could',
        'data',
        'document',
        'each',
        'from',
        'have',
        'into',
        'method',
        'methods',
        'must',
        'need',
        'needs',
        'not',
        'only',
        'other',
        'paper',
        'project',
        'research',
        'results',
        'should',
        'study',
        'system',
        'that',
        'their',
        'these',
        'this',
        'those',
        'through',
        'using',
        'used',
        'were',
        'what',
        'when',
        'which',
        'will',
        'with',
        'would',
        'your'
      ]);

    const counts =
      new Map();

    getWords(text)
      .forEach(
        word => {
          if (
            word.length >= 4 &&
            !stopWords.has(word)
          ) {
            counts.set(
              word,
              (
                counts.get(
                  word
                ) || 0
              ) + 1
            );
          }
        }
      );

    return [
      ...counts.entries()
    ]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(
        0,
        limit
      )
      .map(
        ([word]) =>
          word
      );
  }

  function buildLocalAnalysis(
    text,
    fileName,
    fileSize
  ) {
    const words =
      getWords(text);

    const wordCount =
      words.length;

    // Detect publication year from filename or text
    let detectedYear =
      String(
        new Date()
          .getFullYear()
      );

    const arxivMatch =
      fileName.match(
        /^(\d{2})(\d{2})\.\d+/
      );

    if (arxivMatch) {
      detectedYear =
        '20' +
        arxivMatch[1];
    } else {
      const yearInText =
        text
          .slice(0, 4000)
          .match(
            /\b(20[12]\d|19\d\d)\b/
          );

      if (yearInText) {
        detectedYear =
          yearInText[1];
      }
    }

    // Detect authors or citation clue
    let detectedAuthors =
      'Uploaded Literature';

    const authorMatch =
      text
        .slice(0, 1500)
        .match(
          /([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+(?:et\s+al\.?|and\s+[A-Z][a-z]+))/
        );

    if (authorMatch) {
      detectedAuthors =
        authorMatch[1];
    } else {
      detectedAuthors =
        'Uploaded PDF Corpus';
    }

    // Extract methodology
    const methodology =
      findRelevantSentence(
        text,
        [
          /\b(?:ResNet[-\d]*|MobileNet[-\w]*|MobileViT[-\w]*|Vision Transformer|ViT[-\w]*|YOLO[-\w]*|EfficientNet[-\w]*|DenseNet[-\w]*|VGG[-\d]*|CNN|Convolutional Neural Network|Transformer|BERT|Deep Residual|Attention Mechanism|Quantized|Self-Supervised|Transfer Learning|Contrastive Learning)\b/i,

          /\b(?:we propose|our method|our model|architecture consists of|trained with|framework)\b/i,

          /methodology/i,

          /approach/i,

          /model/i,

          /algorithm/i
        ]
      ) ||
      'Deep Learning / Model Architecture';

    const cleanMethodology =
      methodology.length > 120
        ? `${methodology.slice(0, 117)}…`
        : methodology;

    // Extract dataset description
    const datasetSentence =
      findRelevantSentence(
        text,
        [
          /\b(?:PlantVillage|ImageNet|Field[- ]Farm|COCO|Kaggle|MNIST|CIFAR|VOC|dataset|corpus|samples|images|benchmark)\b/i,

          /dataset/i,

          /data set/i,

          /sample/i,

          /survey/i,

          /corpus/i
        ]
      );

    let cleanDataset = '';

    if (datasetSentence) {
      const dsMatch =
        datasetSentence.match(
          /([^.;]*?\b(?:PlantVillage|ImageNet|Field[- ]Farm|COCO|Kaggle|dataset|images|samples)\b[^.;]*)/i
        );

      cleanDataset =
        dsMatch
          ? dsMatch[1].trim()
          : datasetSentence.slice(
              0,
              70
            );
    }

    if (
      !cleanDataset ||
      cleanDataset.length < 5
    ) {
      cleanDataset =
        `${wordCount.toLocaleString()} words (${(fileSize / 1024).toFixed(1)} KB)`;
    }

    // Extract key results and quantitative performance metrics
    let cleanKeyResult = '';

    const metricSentence =
      findRelevantSentence(
        text,
        [
          /\b(?:accuracy|precision|recall|f1[- ]score|auc|map|top-1|latency|speedup|mAP)\b[^.!?]*\b\d{1,3}(?:\.\d+)?%/i,

          /\b\d{1,3}(?:\.\d+)?%\s*(?:accuracy|precision|recall|f1|top-1)/i,

          /\b(?:achiev\w*|obtain\w*|reach\w*|report\w*|outperform\w*)\b[^.!?]*\b\d{1,3}(?:\.\d+)?%/i
        ]
      );

    if (metricSentence) {
      const m =
        metricSentence.match(
          /([^,;:]*?\b\d{1,3}(?:\.\d+)?%[^,;:]*)/i
        );

      cleanKeyResult =
        m
          ? m[1].trim()
          : metricSentence.slice(
              0,
              80
            );
    } else {
      const findingSentence =
        findRelevantSentence(
          text,
          [
            /\b(?:achieved|outperformed|superior|surpasses|demonstrated|state-of-the-art|sota|results show that)\b/i,

            /\b(?:experimental evaluation indicates|accuracy|precision|f1)\b/i
          ]
        );

      if (findingSentence) {
        cleanKeyResult =
          findingSentence.length > 80
            ? `${findingSentence.slice(0, 77)}…`
            : findingSentence;
      } else {
        cleanKeyResult =
          `${wordCount.toLocaleString()} extracted words analyzed`;
      }
    }

    // Extract limitation
    const limitation =
      findRelevantSentence(
        text,
        [
          /\blimitations?\b/i,

          /\bchallenges?\b/i,

          /\bconstraints?\b/i,

          /\bfuture work\b/i,

          /\bunable to\b/i,

          /\bnot available\b/i,

          /\bdrawbacks?\b/i,

          /\bshortcomings?\b/i,

          /\bfails? to\b/i,

          /\bdegradation under\b/i,

          /\bvulnerable to\b/i
        ]
      ) || '';

    const keywords =
      mostFrequentKeywords(text);

    const topic =
      keywords
        .slice(0, 3)
        .join(', ') ||
      'the uploaded document';

    const isRequirementsDocument =
      /problem statements?|expected output|proposed tech stack|functional requirements?/i
        .test(
          `${fileName}\n${text.slice(0, 5000)}`
        );

    const hasExplicitLimitation =
      Boolean(limitation) &&
      !isRequirementsDocument;

    const evidence =
      hasExplicitLimitation
        ? (
            limitation.length > 260
              ? `${limitation.slice(0, 257)}…`
              : limitation
          )
        : isRequirementsDocument
          ? 'This document is identified as a problem statement/requirements document. Its constraints describe requested functionality, not evidence of a research gap.'
          : 'No explicit limitation, challenge, constraint, or future-work statement was found in the extracted text.';

    const cleanLimitation =
      hasExplicitLimitation
        ? (
            limitation.length > 180
              ? `${limitation.slice(0, 177)}…`
              : limitation
          )
        : 'No explicit limitation statement reported in extracted sections.';

    return {
      corpus: [
        {
          title:
            fileName,

          authors:
            detectedAuthors,

          year:
            detectedYear,

          dataset:
            cleanDataset.length > 80
              ? `${cleanDataset.slice(0, 77)}…`
              : cleanDataset,

          methodology:
            cleanMethodology,

          keyResult:
            cleanKeyResult.length > 80
              ? `${cleanKeyResult.slice(0, 77)}…`
              : cleanKeyResult,

          limitation:
            cleanLimitation
        }
      ],

      gaps: [
        {
          badge:
            hasExplicitLimitation
              ? 'Locally extracted candidate'
              : 'Human review needed',

          title:
            hasExplicitLimitation
              ? `Validation opportunity around ${topic}`
              : isRequirementsDocument
                ? 'Requirements document detected — research-gap analysis skipped'
                : `No explicit research limitation found for ${topic}`,

          whyGap:
            hasExplicitLimitation
              ? 'This candidate is based on a limitation-related sentence found in the uploaded document. It needs human review and external literature comparison.'
              : isRequirementsDocument
                ? 'This appears to be a requirements/problem-statement document rather than a research paper. It does not contain research findings or literature limitations, so a gap should not be inferred from it alone.'
                : 'The document does not state a clear research limitation. Compare its claims against external literature before treating this as a research gap.',

          evidence
        }
      ],

      approach: {
        title:
          'Local, document-led next step',

        desc:
          `Review the extracted methodology and test the identified limitation against a relevant external baseline. Top local keywords: ${keywords.join(', ') || 'none detected'}.`,

        method:
          `Extracted method clue: ${cleanMethodology}`,

        stack: [
          'Local extraction',
          ...keywords.slice(0, 3),
          'Manual validation'
        ]
      },

      signals: {
        fileName,
        keywords,
        methodology:
          cleanMethodology,
        dataset:
          cleanDataset,
        limitation,
        isRequirementsDocument,
        hasExplicitLimitation
      }
    };
  }

  function buildCrossDocumentAnalysis(
    analyses
  ) {
    const researchAnalyses =
      analyses.filter(
        analysis =>
          !analysis.signals
            .isRequirementsDocument
      );

    const keywordSources =
      new Map();

    researchAnalyses.forEach(
      analysis => {
        new Set(
          analysis.signals.keywords
        ).forEach(
          keyword => {
            keywordSources.set(
              keyword,
              [
                ...(keywordSources.get(
                  keyword
                ) || []),
                analysis.signals
                  .fileName
              ]
            );
          }
        );
      }
    );

    const sharedThemes =
      [
        ...keywordSources.entries()
      ]
        .filter(
          ([, sources]) =>
            sources.length > 1
        )
        .sort(
          (a, b) =>
            b[1].length -
            a[1].length
        )
        .slice(
          0,
          4
        );

    const documentedLimitations =
      researchAnalyses.filter(
        analysis =>
          analysis.signals
            .hasExplicitLimitation
      );

    const gaps = [];

    if (
      !researchAnalyses.length
    ) {
      gaps.push({
        badge:
          'Insufficient research evidence',

        title:
          'Requirements documents cannot establish a research gap',

        whyGap:
          'The selected files describe requested functionality rather than published methods, datasets, results, or limitations. Add research papers before making a gap claim.',

        evidence:
          `Classified as requirements/problem statements: ${analyses
            .map(
              analysis =>
                analysis.signals.fileName
            )
            .join(', ')}`
      });
    } else {
      let mergedLimitationAdded =
        false;

      if (
        documentedLimitations.length > 1 &&
        sharedThemes.length
      ) {
        const [theme] =
          sharedThemes[0];

        const relatedLimitations =
          documentedLimitations.filter(
            analysis =>
              analysis.signals
                .keywords
                .includes(
                  theme
                )
          );

        if (
          relatedLimitations.length > 1
        ) {
          gaps.push({
            badge:
              `Cross-document evidence in ${relatedLimitations.length} PDFs`,

            title:
              `Shared unresolved issue: ${theme}`,

            whyGap:
              'Multiple documents independently identify a related challenge. This is a stronger candidate for comparison than separate per-document cards, but it still requires checking whether recent literature already solves it.',

            evidence:
              relatedLimitations
                .map(
                  analysis =>
                    `${analysis.signals.fileName}: ${analysis.signals.limitation}`
                )
                .join(' | ')
          });

          mergedLimitationAdded =
            true;
        }
      }

      if (
        !mergedLimitationAdded
      ) {
        documentedLimitations
          .slice(0, 2)
          .forEach(
            analysis => {
              gaps.push({
                badge:
                  'Documented limitation',

                title:
                  `Open validation issue in ${analysis.signals.fileName}`,

                whyGap:
                  'This document explicitly identifies a limitation. It becomes a research-gap candidate only if the other selected literature does not already resolve it.',

                evidence:
                  analysis.signals
                    .limitation
              });
            }
          );
      }

      if (
        sharedThemes.length &&
        !mergedLimitationAdded
      ) {
        const [
          theme,
          sources
        ] =
          sharedThemes[0];

        gaps.push({
          badge:
            `Shared theme in ${sources.length} documents`,

          title:
            `Compare how “${theme}” is handled across the selected literature`,

          whyGap:
            'A recurring topic is not itself a gap, but differing methods, datasets, or reported limits around it are a useful target for a structured comparison.',

          evidence:
            `Theme found in: ${sources.join(', ')}`
        });
      }

      if (!gaps.length) {
        gaps.push({
          badge:
            'Human review needed',

          title:
            'No explicit limitation was extracted from the research documents',

          whyGap:
            'The local analyzer found topics but no clear limitation statement. Review the papers’ discussion, conclusion, and future-work sections before proposing a gap.',

          evidence:
            `Reviewed documents: ${researchAnalyses
              .map(
                analysis =>
                  analysis.signals.fileName
              )
              .join(', ')}`
        });
      }
    }

    const themes =
      sharedThemes.map(
        ([theme]) =>
          theme
      );

    return {
      gaps,

      approach: {
        title:
          researchAnalyses.length
            ? `Evidence-led comparison plan (${researchAnalyses.length} research documents)`
            : 'Collect research evidence before proposing an approach',

        desc:
          researchAnalyses.length
            ? `Compare methods, datasets, and reported limitations for ${themes.length ? `the shared theme “${themes.join(', ')}”` : 'each document topic'}. Treat the results as a review aid, not a confirmed novelty claim.`
            : 'Add literature-review or research-paper documents containing results and limitations. A requirements document can define a project, but cannot by itself demonstrate a research gap.',

        method:
          researchAnalyses.length
            ? '1. Verify each extracted limitation in the original paper. 2. Build a method-by-dataset comparison table. 3. Test whether the shared limitation persists on a common benchmark. 4. Define an approach only after that comparison.'
            : 'Use the requirements document to choose a search topic, then upload at least two relevant research papers for comparison.',

        stack:
          researchAnalyses.length
            ? [
                'Original sources',
                'Method comparison',
                'Common benchmark',
                ...themes.slice(
                  0,
                  2
                ),
                'Human validation'
              ]
            : [
                'Problem statement',
                'Literature search',
                'Research papers',
                'Evidence review'
              ]
      }
    };
  }

  /* ========================================================
     REAL ONLINE LITERATURE SEARCH - OPENALEX
     ======================================================== */

  const OPENALEX_API =
    'https://api.openalex.org/works';

  const ONLINE_PAPER_LIMIT = 8;

  /* --------------------------------------------------------
     Reconstruct abstract from OpenAlex inverted index
     -------------------------------------------------------- */

  function reconstructOpenAlexAbstract(
    invertedIndex
  ) {
    if (
      !invertedIndex ||
      typeof invertedIndex !== 'object'
    ) {
      return '';
    }

    const words = [];

    Object.entries(
      invertedIndex
    ).forEach(
      ([word, positions]) => {
        if (!Array.isArray(positions)) {
          return;
        }

        positions.forEach(
          position => {
            if (
              Number.isInteger(position)
            ) {
              words[position] = word;
            }
          }
        );
      }
    );

    return words
      .filter(Boolean)
      .join(' ');
  }

  /* --------------------------------------------------------
     Get authors
     -------------------------------------------------------- */

  function getOpenAlexAuthors(work) {
    const authors =
      (work.authorships || [])
        .map(
          item =>
            item?.author?.display_name
        )
        .filter(Boolean)
        .slice(0, 3);

    if (!authors.length) {
      return 'Authors not available';
    }

    const total =
      (work.authorships || []).length;

    return total > authors.length
      ? `${authors.join(', ')} et al.`
      : authors.join(', ');
  }

  /* --------------------------------------------------------
     Get source / journal
     -------------------------------------------------------- */

  function getOpenAlexSourceName(work) {
    return (
      work.best_oa_location?.source?.display_name ||
      work.primary_location?.source?.display_name ||
      'OpenAlex'
    );
  }

  /* --------------------------------------------------------
     Get paper / PDF access links
     -------------------------------------------------------- */

  function getOpenAlexAccess(work) {
    const best =
      work.best_oa_location ||
      null;

    const primary =
      work.primary_location ||
      null;

    return {
      pdfUrl:
        best?.pdf_url ||
        primary?.pdf_url ||
        null,

      url:
        best?.landing_page_url ||
        primary?.landing_page_url ||
        work.open_access?.oa_url ||
        work.doi ||
        work.id ||
        '',

      isOpenAccess:
        Boolean(
          work.open_access?.is_oa ||
          best?.is_oa ||
          primary?.is_oa
        )
    };
  }

  /* --------------------------------------------------------
     Convert OpenAlex work to LitGap paper format
     -------------------------------------------------------- */

  function buildOnlinePaperRecord(work) {
    const abstract =
      reconstructOpenAlexAbstract(
        work.abstract_inverted_index
      );

    const searchableText =
      `${work.display_name || ''}. ${abstract}`;

    const methodSentence =
      findRelevantSentence(
        searchableText,
        [
          /\b(?:we propose|our method|our model|architecture consists of|trained with|framework|methodology|approach|algorithm|model architecture)\b/i,
          /\b(?:CNN|Convolutional Neural Network|Transformer|Vision Transformer|ViT|ResNet[-\w]*|MobileNet[-\w]*|MobileViT[-\w]*|YOLO[-\w]*|EfficientNet[-\w]*|DenseNet[-\w]*|BERT|LSTM|GRU|Random Forest|SVM|Support Vector Machine|Graph Neural Network|GNN|GAN|Diffusion)\b/i
        ]
      ) ||
      'Methodology not stated in the available abstract.';

    const datasetSentence =
      findRelevantSentence(
        searchableText,
        [
          /\b(?:dataset|data set|corpus|benchmark|samples|images|patients|subjects|participants|records)\b/i,
          /\b(?:MIMIC|ImageNet|COCO|MNIST|CIFAR|UCI|Kaggle|PlantVillage|PhysioNet|CheXpert|PubMed)\b/i
        ]
      ) ||
      'Dataset not stated in the available abstract.';

    const resultSentence =
      findRelevantSentence(
        searchableText,
        [
          /\b(?:accuracy|precision|recall|f1[- ]score|auc|mAP|latency|sensitivity|specificity|performance|achieved|outperformed|improved|demonstrated|results show)\b/i
        ]
      ) ||
      'No explicit performance result found in the available abstract.';

    const limitationSentence =
      findRelevantSentence(
        searchableText,
        [
          /\blimitations?\b/i,
          /\bchallenges?\b/i,
          /\bconstraints?\b/i,
          /\bfuture work\b/i,
          /\bhowever\b/i,
          /\bremains?\b/i,
          /\bunable to\b/i,
          /\bdoes not\b/i,
          /\bnot available\b/i,
          /\bshortcomings?\b/i,
          /\bdrawbacks?\b/i
        ]
      ) ||
      'No explicit limitation found in the available abstract; inspect the full paper before making a gap claim.';

    const access =
      getOpenAlexAccess(work);

    const keywords =
      mostFrequentKeywords(
        searchableText,
        6
      );

    return {
      id:
        work.id,

      title:
        work.display_name ||
        'Untitled research work',

      authors:
        getOpenAlexAuthors(work),

      year:
        work.publication_year
          ? String(work.publication_year)
          : 'Year unavailable',

      dataset:
        datasetSentence.length > 80
          ? `${datasetSentence.slice(0, 77)}…`
          : datasetSentence,

      methodology:
        methodSentence.length > 120
          ? `${methodSentence.slice(0, 117)}…`
          : methodSentence,

      keyResult:
        resultSentence.length > 100
          ? `${resultSentence.slice(0, 97)}…`
          : resultSentence,

      limitation:
        limitationSentence.length > 180
          ? `${limitationSentence.slice(0, 177)}…`
          : limitationSentence,

      abstract,

      keywords,

      citedByCount:
        Number(
          work.cited_by_count || 0
        ),

      sourceName:
        getOpenAlexSourceName(work),

      pdfUrl:
        access.pdfUrl,

      url:
        access.url,

      isOpenAccess:
        access.isOpenAccess
    };
  }

  /* --------------------------------------------------------
     Build candidate research-gap analysis
     -------------------------------------------------------- */

  function buildOnlineGapAnalysis(
    papers,
    query
  ) {
    const papersWithLimitations =
      papers.filter(
        paper =>
          paper.limitation &&
          !/no explicit limitation found in the available abstract/i.test(
            paper.limitation
          )
      );

    const keywordSources =
      new Map();

    papers.forEach(
      paper => {
        new Set(
          paper.keywords || []
        ).forEach(
          keyword => {
            keywordSources.set(
              keyword,
              [
                ...(keywordSources.get(
                  keyword
                ) || []),
                paper.title
              ]
            );
          }
        );
      }
    );

    const sharedThemes =
      [...keywordSources.entries()]
        .filter(
          ([, sources]) =>
            sources.length >= 2
        )
        .sort(
          (a, b) =>
            b[1].length -
            a[1].length
        )
        .slice(0, 4);

    const gaps = [];

    if (
      papersWithLimitations.length >= 2
    ) {
      gaps.push({
        badge:
          'Candidate gap from published limitations',

        title:
          `Unresolved limitation to investigate in ${query}`,

        whyGap:
          'Several retrieved papers contain limitation- or challenge-related language. This is a candidate for further investigation, not a confirmed research gap or novelty claim.',

        evidence:
          papersWithLimitations
            .slice(0, 4)
            .map(
              paper =>
                `${paper.title}: ${paper.limitation}`
            )
            .join(' | ')
      });
    }

    if (sharedThemes.length) {
      const [theme, sources] =
        sharedThemes[0];

      gaps.push({
        badge:
          `Shared theme in ${sources.length} papers`,

        title:
          `Compare how “${theme}” is handled across the literature`,

        whyGap:
          'A recurring theme is not itself a research gap. Compare methods, datasets, evaluation conditions, and stated limitations around this theme before proposing a novel direction.',

        evidence:
          `Theme appears in: ${sources.join(', ')}`
      });
    }

    if (!gaps.length) {
      gaps.push({
        badge:
          'Human review needed',

        title:
          'No explicit research gap was established from the retrieved abstracts',

        whyGap:
          'The search returned papers, but the available abstract text does not provide enough evidence to confirm a gap. Open the papers and review their discussion, limitations, and future-work sections.',

        evidence:
          `Retrieved ${papers.length} papers for the query “${query}”.`
      });
    }

    const themes =
      sharedThemes.map(
        ([theme]) => theme
      );

    return {
      gaps,

      approach: {
        title:
          `Evidence-led literature review for ${query}`,

        desc:
          `Retrieved ${papers.length} scholarly works from OpenAlex. ${
            themes.length
              ? `Prioritize comparison around the recurring themes: ${themes.join(', ')}.`
              : 'Begin by comparing methods, datasets, evaluation settings, and limitations.'
          }`,

        method:
          '1. Open the retrieved papers and verify the metadata. 2. Compare methods and datasets. 3. Verify every limitation in the original paper. 4. Check recent literature before describing any issue as a research gap. 5. Formulate a research direction only after the comparison.',

        stack:
          [
            'OpenAlex literature search',
            'Paper verification',
            'Method comparison',
            'Dataset comparison',
            'Limitation review',
            'Human validation'
          ]
      }
    };
  }

  /* --------------------------------------------------------
     Search OpenAlex
     -------------------------------------------------------- */

  async function searchOpenAlex(
    query
  ) {
    const params =
      new URLSearchParams({
        search:
          query,

        'per-page':
          String(ONLINE_PAPER_LIMIT)
      });

    const response =
      await fetch(
        `${OPENALEX_API}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json'
          }
        }
      );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          'Online literature search is temporarily rate-limited. Please wait a moment and try again.'
        );
      }

      throw new Error(
        `OpenAlex search failed with HTTP ${response.status}.`
      );
    }

    const data =
      await response.json();

    return Array.isArray(
      data.results
    )
      ? data.results
          .filter(
            work =>
              work &&
              work.display_name
          )
          .map(
            work =>
              buildOnlinePaperRecord(
                work
              )
          )
      : [];
  }

  /* --------------------------------------------------------
     Topic / Question -> Discover Gaps
     -------------------------------------------------------- */

  analyzeBtn.addEventListener(
    'click',
    async () => {
      const query =
        searchInput.value.trim() ||
        'Research Field Analysis';

      const originalButtonHTML =
        analyzeBtn.innerHTML;

      analyzeBtn.disabled = true;

      analyzeBtn.innerHTML =
        '<i data-lucide="loader-circle"></i> Searching Literature…';

      renderIcons();

      try {
        const papers =
          await searchOpenAlex(
            query
          );

        if (!papers.length) {
          alert(
            `No scholarly papers were found for “${query}”. Try a broader research topic or different keywords.`
          );
          return;
        }

        const insights =
          buildOnlineGapAnalysis(
            papers,
            query
          );

        executeAnalysis(
          papers,
          insights.gaps,
          insights.approach
        );
      } catch (error) {
        console.error(
          'LitGap AI online search error:',
          error
        );

        alert(
          error?.message ||
          'The online literature search could not be completed. Check your internet connection and try again.'
        );
      } finally {
        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML =
          originalButtonHTML;

        renderIcons();
      }
    }
  );

  // Run analysis across all successfully extracted uploaded documents.
  uploadAnalyzeBtn.addEventListener(
    'click',
    () => {
      if (!uploadedDocuments.length) {
        alert(
          'Please upload one or more documents first.'
        );

        return;
      }

      const selectedDocuments =
        uploadedDocuments.filter(
          document =>
            document.selected
        );

      if (
        selectedDocuments.length < 2
      ) {
        alert(
          'Select at least two uploaded documents for a cross-document comparison.'
        );

        return;
      }

      const readableDocuments =
        selectedDocuments.filter(
          document =>
            document.text
        );

      if (
        !readableDocuments.length
      ) {
        alert(
          'None of the selected documents contains readable text yet. Wait for extraction to finish or choose text-based PDFs/DOCX files.'
        );

        return;
      }

      if (
        readableDocuments.length < 2
      ) {
        alert(
          'At least two selected documents must finish text extraction before they can be compared.'
        );

        return;
      }

      const analyses =
        readableDocuments.map(
          document =>
            buildLocalAnalysis(
              document.text,
              document.file.name,
              document.file.size
            )
        );

      const corpus =
        analyses.flatMap(
          analysis =>
            analysis.corpus
        );

      const crossDocumentInsights =
        buildCrossDocumentAnalysis(
          analyses
        );

      executeAnalysis(
        corpus,
        crossDocumentInsights.gaps,
        crossDocumentInsights.approach
      );
    }
  );

  // Run Analysis on Pre-indexed Vault Papers
  vaultAnalyzeBtn.addEventListener(
    'click',
    () => {
      const selectedPapers =
        getSelectedVaultPapers();

      if (
        !selectedPapers.length
      ) {
        updateVaultSelectionState();
        return;
      }

      const gaps =
        selectedPapers.length === 1
          ? [
              {
                badge:
                  'Single-paper review',

                title:
                  'A cross-paper gap cannot be confirmed from one selection',

                whyGap:
                  'Select at least two vault papers to compare their methods and limitations. This single-paper result is shown only as local benchmark metadata.',

                evidence:
                  `${selectedPapers[0].title}: ${selectedPapers[0].limitation}`
              }
            ]
          : [
              {
                badge:
                  `Built-in benchmark evidence in ${selectedPapers.length} papers`,

                title:
                  'Field robustness and early-stage detection remain validation targets',

                whyGap:
                  'The selected benchmark records report distinct real-world limitations. Compare them using a common field dataset before treating either issue as a novel research gap.',

                evidence:
                  selectedPapers
                    .map(
                      paper =>
                        `${paper.title}: ${paper.limitation}`
                    )
                    .join(' | ')
              }
            ];

      const approach = {
        title:
          `Local vault comparison (${selectedPapers.length} selected paper${selectedPapers.length === 1 ? '' : 's'})`,

        desc:
          'This view uses the built-in sample benchmark metadata selected above; it does not call a backend or claim a live literature search.',

        method:
          selectedPapers.length > 1
            ? 'Evaluate both methods on a shared outdoor dataset, stratify results by lighting and disease stage, then compare accuracy, latency, and early-lesion recall.'
            : 'Add another vault paper or upload research documents before drawing a cross-paper conclusion.',

        stack:
          [
            'Built-in sample metadata',
            'Common field dataset',
            'Lighting robustness',
            'Early-lesion recall'
          ]
      };

      executeAnalysis(
        selectedPapers,
        gaps,
        approach
      );
    }
  );

  // Quick Query Pill Buttons
  document
    .querySelectorAll('.query-pill')
    .forEach(
      pill => {
        pill.addEventListener(
          'click',
          () => {
            searchInput.value =
              pill.getAttribute(
                'data-query'
              );

            analyzeBtn.click();
          }
        );
      }
    );

  // Right Panel Tab Navigation (Matrix / Gaps / Approach)
  const rightTabs =
    document.querySelectorAll(
      '.nav-tab'
    );

  const rightTabContents =
    document.querySelectorAll(
      '.tab-content'
    );

  rightTabs.forEach(
    tab => {
      tab.addEventListener(
        'click',
        () => {
          rightTabs.forEach(
            t =>
              t.classList
                .remove(
                  'active'
                )
          );

          rightTabContents.forEach(
            c =>
              c.classList
                .remove(
                  'active'
                )
          );

          tab.classList.add(
            'active'
          );

          document
            .getElementById(
              tab.getAttribute(
                'data-tab'
              )
            )
            .classList.add(
              'active'
            );

          renderIcons();
        }
      );
    }
  );

  /* ========================================================
     9. EXPORT REPORT & COPY ACTIONS
     ======================================================== */

  document
    .getElementById(
      'copy-summary-btn'
    )
    .addEventListener(
      'click',
      async () => {
        try {
          if (!navigator.clipboard) {
            throw new Error(
              'Clipboard API unavailable'
            );
          }

          await navigator.clipboard.writeText(
            "LitGap AI Research Brief:\n- Identified Gap: Real-world lighting variance\n- Supporting Evidence: Sharma et al.\n- Approach: MobileViT domain adaptation"
          );

          alert(
            "Research brief copied to clipboard!"
          );
        } catch {
          alert(
            'Copy failed. Please use HTTPS or localhost and allow clipboard access.'
          );
        }
      }
    );

  /*
   * Download the complete analysis result instead of JSON metadata.
   * The report is generated from the exact results currently visible
   * in the dashboard.
   */
  document
    .getElementById(
      'export-brief-btn'
    )
    .addEventListener(
      'click',
      () => {
        if (!lastAnalysisDocuments.length) {
          alert(
            'Run an analysis first, then click Download to export the result.'
          );

          return;
        }

        const papersHTML =
          document
            .getElementById(
              'papers-container'
            )
            .innerHTML;

        const matrixHTML =
          document
            .getElementById(
              'matrix-tbody'
            )
            .innerHTML;

        const gapsHTML =
          document
            .getElementById(
              'gaps-container'
            )
            .innerHTML;

        const approachHTML =
          document
            .getElementById(
              'tab-approach'
            )
            .innerHTML;

        const reportDate =
          new Date()
            .toLocaleString();

        const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    LitGap AI - Research Gap Analysis Report
  </title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 30px;
      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color: #f1f5f9;

      background:
        radial-gradient(
          circle at center,
          #1a0505,
          #080101 90%
        );

      line-height: 1.5;
    }

    .report {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;

      background: #111116;

      border:
        1px solid #27272a;

      border-radius: 12px;

      overflow: hidden;

      box-shadow:
        0 0 35px
        rgba(239, 68, 68, 0.15);
    }

    .report-header {
      padding: 28px 30px;

      background: #0e0e12;

      border-bottom:
        1px solid
        rgba(239, 68, 68, 0.25);
    }

    .brand {
      color: #ef4444;

      font-size: 13px;

      font-weight: 700;

      text-transform: uppercase;

      letter-spacing: 1px;
    }

    .report-header h1 {
      margin:
        6px 0 5px;

      color: #ffffff;

      font-size: 28px;
    }

    .report-meta {
      color: #a1a1aa;

      font-size: 12px;
    }

    .report-content {
      padding: 25px 30px 35px;
    }

    .summary-grid {
      display: grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap: 12px;

      margin-bottom: 28px;
    }

    .summary-card {
      padding: 14px;

      background: #09090c;

      border:
        1px solid #27272a;

      border-radius: 8px;
    }

    .summary-card span {
      display: block;

      color: #71717a;

      font-size: 10px;

      text-transform: uppercase;

      letter-spacing: .5px;
    }

    .summary-card strong {
      display: block;

      margin-top: 4px;

      color: #ffffff;

      font-size: 19px;
    }

    .report-section {
      margin-bottom: 30px;
    }

    .report-section h2 {
      margin:
        0 0 14px;

      color: #f87171;

      font-size: 19px;
    }

    .papers-list {
      display: flex;

      flex-direction: column;

      gap: 10px;
    }

    .paper-item {
      background: #09090c;

      border:
        1px solid #27272a;

      border-radius: 6px;

      padding: 11px;

      display: flex;

      flex-direction: column;

      gap: 5px;

      overflow: hidden;
    }

    .paper-title-row {
      display: flex;

      justify-content:
        space-between;

      align-items:
        flex-start;

      gap: 8px;
    }

    .paper-title-row h4 {
      margin: 0;

      flex: 1;

      min-width: 0;

      color: #f1f5f9;

      font-size: 12px;

      line-height: 1.35;

      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .paper-title-row .ext-link {
      display: none;
    }

    .paper-meta {
      display: flex;

      justify-content:
        space-between;

      gap: 8px;

      color: #71717a;

      font-size: 10px;
    }

    .badge-year {
      background: #1a1a24;

      color: #d4d4d8;

      padding:
        1px 4px;

      border-radius: 4px;
    }

    .dataset-tag {
      align-self:
        flex-start;

      background:
        rgba(239, 68, 68, 0.1);

      color: #f87171;

      border:
        1px solid
        rgba(239, 68, 68, 0.2);

      padding:
        1px 4px;

      border-radius: 3px;

      font-size: 9px;
    }

    .table-wrap {
      width: 100%;

      overflow-x: auto;

      border:
        1px solid #27272a;

      border-radius: 8px;
    }

    .data-table {
      width: 100%;

      min-width: 950px;

      border-collapse:
        collapse;

      font-size: 11px;

      text-align: left;
    }

    .data-table th,
    .data-table td {
      padding:
        9px 12px;

      border-bottom:
        1px solid #22222a;

      vertical-align:
        top;

      line-height: 1.4;
    }

    .data-table th {
      background: #09090c;

      color: #a1a1aa;

      font-weight: 600;

      white-space:
        nowrap;
    }

    .bold-text {
      color: #ffffff;

      font-weight: 600;

      min-width: 130px;

      overflow-wrap:
        anywhere;
    }

    .success-text {
      color: #10b981;

      font-weight: 500;

      min-width: 120px;
    }

    .lim-text {
      color: #fca5a5;

      background:
        rgba(239, 68, 68, 0.05);

      min-width: 140px;
    }

    .gap-card {
      background: #09090c;

      border:
        1px solid #27272a;

      border-left:
        3px solid #ef4444;

      border-radius: 8px;

      padding: 14px;

      margin-bottom:
        10px;

      display: flex;

      flex-direction:
        column;

      gap: 8px;
    }

    .gap-badge {
      display: inline-block;

      color: #ef4444;

      background:
        rgba(239, 68, 68, 0.15);

      padding:
        2px 6px;

      border-radius: 4px;

      font-size: 9px;

      font-weight: 600;

      text-transform:
        uppercase;
    }

    .gap-top h4 {
      margin:
        4px 0 0;

      color: #ffffff;

      font-size: 13px;
    }

    .gap-reason {
      background: #14141a;

      border:
        1px solid #27272a;

      border-radius: 6px;

      padding: 8px;

      color: #d4d4d8;

      font-size: 11px;
    }

    .gap-reason p {
      margin: 0;
    }

    .gap-evidence {
      background: #050508;

      border-left:
        3px solid #ef4444;

      padding:
        8px 12px;

      border-radius: 4px;

      font-size: 11px;
    }

    .ev-title {
      display: block;

      color: #ef4444;

      font-size: 10px;

      font-weight: 600;
    }

    .ev-quote {
      color: #a1a1aa;

      font-style: italic;

      margin: 4px 0 0;
    }

    .blueprint-box {
      background:
        rgba(239, 68, 68, 0.08);

      border:
        1px solid
        rgba(239, 68, 68, 0.3);

      padding: 14px;

      border-radius: 8px;

      margin-bottom: 12px;
    }

    .blueprint-box h3 {
      margin: 0;

      color: #f87171;

      font-size: 13px;
    }

    .blueprint-box p {
      margin:
        3px 0 0;

      color: #e4e4e7;

      font-size: 12px;
    }

    .blueprint-grid {
      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 12px;
    }

    .bp-card {
      background: #09090c;

      border:
        1px solid #27272a;

      border-radius: 8px;

      padding: 12px;
    }

    .bp-card h4 {
      margin:
        0 0 6px;

      color: #ffffff;

      font-size: 12px;
    }

    .bp-card p {
      margin: 0;

      color: #a1a1aa;

      font-size: 11px;
    }

    .chip-container {
      display: flex;

      flex-wrap: wrap;

      gap: 4px;

      margin-top: 6px;
    }

    .chip {
      padding:
        2px 6px;

      background:
        rgba(239, 68, 68, 0.1);

      border:
        1px solid
        rgba(239, 68, 68, 0.3);

      border-radius: 4px;

      color: #f87171;

      font-size: 10px;
    }

    .report-footer {
      padding:
        15px 30px;

      background: #0e0e12;

      border-top:
        1px solid #27272a;

      color: #71717a;

      font-size: 10px;
    }

    .print-button {
      position: fixed;

      right: 20px;

      bottom: 20px;

      border:
        1px solid #ef4444;

      background: #dc2626;

      color: #ffffff;

      padding:
        10px 14px;

      border-radius: 7px;

      cursor: pointer;

      font-weight: 600;
    }

    .print-button:hover {
      background: #b91c1c;
    }

    @media (max-width: 800px) {
      body {
        padding: 12px;
      }

      .report-content,
      .report-header,
      .report-footer {
        padding-left:
          16px;

        padding-right:
          16px;
      }

      .summary-grid,
      .blueprint-grid {
        grid-template-columns:
          1fr;
      }

      .report-header h1 {
        font-size: 23px;
      }
    }

    @media print {
      body {
        padding: 0;

        background: #ffffff;

        color: #000000;
      }

      .report {
        border: none;

        box-shadow: none;

        border-radius: 0;
      }

      .print-button {
        display: none;
      }
    }
  </style>
</head>

<body>

  <button
    class="print-button"
    onclick="window.print()"
  >
    Print / Save as PDF
  </button>

  <div class="report">

    <header class="report-header">

      <div class="brand">
        LitGap AI
      </div>

      <h1>
        Research Gap Analysis Report
      </h1>

      <div class="report-meta">
        Generated: ${escapeHTML(reportDate)}
        <br>
        Documents analyzed:
        ${lastAnalysisDocuments.length}
      </div>

    </header>

    <main class="report-content">

      <section class="summary-grid">

        <div class="summary-card">
          <span>
            Documents Analyzed
          </span>

          <strong>
            ${lastAnalysisDocuments.length}
          </strong>
        </div>

        <div class="summary-card">
          <span>
            Potential Gaps
          </span>

          <strong>
            ${document.getElementById('gaps-container').children.length}
          </strong>
        </div>

        <div class="summary-card">
          <span>
            Status
          </span>

          <strong>
            Completed
          </strong>
        </div>

      </section>

      <section class="report-section">

        <h2>
          1. Analyzed Corpus
        </h2>

        <div class="papers-list">
          ${papersHTML}
        </div>

      </section>

      <section class="report-section">

        <h2>
          2. Comparison Matrix
        </h2>

        <div class="table-wrap">

          <table class="data-table">

            <thead>
              <tr>
                <th>
                  Paper / Document
                </th>

                <th>
                  Methodology
                </th>

                <th>
                  Dataset
                </th>

                <th>
                  Key Result
                </th>

                <th>
                  Limitation Identified
                </th>
              </tr>
            </thead>

            <tbody>
              ${matrixHTML}
            </tbody>

          </table>

        </div>

      </section>

      <section class="report-section">

        <h2>
          3. Potential Research Gaps
        </h2>

        <div>
          ${gapsHTML}
        </div>

      </section>

      <section class="report-section">

        <h2>
          4. Suggested Approach
        </h2>

        ${approachHTML}

      </section>

    </main>

    <footer class="report-footer">
      Generated from the latest analysis displayed in the LitGap AI application.
    </footer>

  </div>

</body>
</html>`;

        const blob =
          new Blob(
            [reportHTML],
            {
              type:
                'text/html;charset=utf-8'
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const a =
          document.createElement(
            'a'
          );

        a.href = url;

        a.download =
          'litgap_research_report.html';

        document.body.appendChild(
          a
        );

        a.click();

        a.remove();

        setTimeout(
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          1000
        );
      }
    );
});