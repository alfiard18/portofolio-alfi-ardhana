(() => {
  'use strict';

  // =========================================
  // HELPER
  // =========================================

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // =========================================
  // NOTIFICATION
  // =========================================

  const toast = $('#toast');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    window.clearTimeout(toastTimeout);

    toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================
  // MOBILE NAVIGATION
  // =========================================

  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen =
        menuToggle.getAttribute('aria-expanded') === 'true';

      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Buka menu navigasi' : 'Tutup menu navigasi'
      );

      navLinks.classList.toggle('open', !isOpen);
    });

    $$('#navLinks a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', event => {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // =========================================
  // HEADER AND SCROLL PROGRESS
  // =========================================

  const header = $('.site-header');
  const progress = $('#scrollProgress');

  let scrollPending = false;

  function updateScrollUI() {
    const totalScrollable =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (progress) {
      const percentage = totalScrollable > 0
        ? (window.scrollY / totalScrollable) * 100
        : 0;

      progress.style.width = `${percentage}%`;
    }

    if (header) {
      header.classList.toggle(
        'scrolled',
        window.scrollY > 20
      );
    }

    scrollPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      window.requestAnimationFrame(updateScrollUI);
      scrollPending = true;
    }
  }, { passive: true });

  updateScrollUI();

  // =========================================
  // ACTIVE NAVIGATION
  // =========================================

  const navAnchors = $$('#navLinks a[href^="#"]');

  const navSections = navAnchors
    .map(link => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navAnchors.forEach(link => {
          const active =
            link.getAttribute('href') === `#${entry.target.id}`;

          link.classList.toggle('active', active);
        });
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    navSections.forEach(section => navObserver.observe(section));
  }

  // =========================================
  // SCROLL REVEAL
  // =========================================

  const revealElements = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => {
      element.classList.add('visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -25px 0px'
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }

  // =========================================
  // HERO ROLE ROTATION
  // =========================================

  const roleText = $('#roleText');

  const roles = [
    'Full Stack Developer',
    'UI/UX Designer',
    'Information Systems Graduate'
  ];

  let roleIndex = 0;

  if (roleText && !reduceMotion) {
    window.setInterval(() => {
      roleText.style.opacity = '0';

      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleText.textContent = roles[roleIndex];
        roleText.style.opacity = '1';
      }, 220);
    }, 3000);
  }

  // =========================================
  // UPLOAD PERSONAL PROFILE PHOTO
  // =========================================

  const photoInput = $('#photoInput');
  const uploadPhotoBtn = $('#uploadPhotoBtn');
  const removePhotoBtn = $('#removePhotoBtn');
  const profilePhoto = $('#profilePhoto');
  const photoPlaceholder = $('#photoPlaceholder');

  let currentPhotoURL = null;

  function resetPhoto() {
    if (currentPhotoURL) {
      URL.revokeObjectURL(currentPhotoURL);
      currentPhotoURL = null;
    }

    if (profilePhoto) {
      profilePhoto.removeAttribute('src');
      profilePhoto.style.display = 'none';
    }

    if (photoPlaceholder) {
      photoPlaceholder.style.display = 'flex';
    }

    if (removePhotoBtn) {
      removePhotoBtn.hidden = true;
    }

    if (photoInput) {
      photoInput.value = '';
    }
  }

  if (uploadPhotoBtn && photoInput) {
    uploadPhotoBtn.addEventListener('click', () => {
      photoInput.click();
    });
  }

  if (photoInput && profilePhoto) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Silakan pilih file gambar.');
        photoInput.value = '';
        return;
      }

      // Batasi ukuran gambar hingga 10 MB
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 10 MB.');
        photoInput.value = '';
        return;
      }

      if (currentPhotoURL) {
        URL.revokeObjectURL(currentPhotoURL);
      }

      currentPhotoURL = URL.createObjectURL(file);

      profilePhoto.onload = () => {
        profilePhoto.style.display = 'block';

        if (photoPlaceholder) {
          photoPlaceholder.style.display = 'none';
        }

        if (removePhotoBtn) {
          removePhotoBtn.hidden = false;
        }

        showToast('Foto profil berhasil dipasang.');
      };

      profilePhoto.onerror = () => {
        resetPhoto();
        showToast('Foto tidak dapat dibuka. Coba gambar lain.');
      };

      profilePhoto.src = currentPhotoURL;
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      resetPhoto();
      showToast('Foto profil telah dihapus.');
    });
  }

  // =========================================
  // PROJECT FILTER
  // =========================================

  const filterButtons = $$('.filter-btn');
  const projectCards = $$('#projectsGrid .project-card');
  const visibleCount = $('#visibleCount');

  function filterProjects(filter) {
    let count = 0;

    projectCards.forEach(card => {
      const matches =
        filter === 'all' ||
        card.dataset.category === filter;

      card.classList.toggle('hidden', !matches);

      if (matches) count++;
    });

    if (visibleCount) {
      visibleCount.textContent = String(count).padStart(2, '0');
    }

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;

      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterProjects(button.dataset.filter);
    });
  });

  filterProjects('all');

  // =========================================
  // PROJECT DETAIL CONTENT
  // =========================================

  const projectDetails = {
    sensor: {
      category: 'WEB APPLICATION · 2026',
      title: 'Sistem Pemantauan Sensor Online',
      description:
        'Aplikasi web untuk pemantauan data sensor infrastruktur. Sistem mencakup dashboard visualisasi data, perbandingan grafik pembacaan sensor, visual mapping lokasi sensor, dan integrasi database PostgreSQL.',
      contributions: [
        'Mengembangkan aplikasi web pemantauan sensor menggunakan Laravel.',
        'Membangun dashboard interaktif untuk visualisasi data sensor.',
        'Mengembangkan fitur perbandingan grafik beberapa pembacaan sensor.',
        'Membuat visual mapping lokasi sensor pada struktur yang dipantau.',
        'Mengintegrasikan pengelolaan data menggunakan PostgreSQL.',
        'Membangun antarmuka responsif menggunakan HTML, CSS, JavaScript, dan Bootstrap.'
      ],
      tech: [
        'Laravel',
        'PHP',
        'PostgreSQL',
        'HTML',
        'CSS',
        'JavaScript',
        'Bootstrap'
      ]
    },

    buma: {
      category: 'UI/UX DESIGN · 2025',
      title: 'BUMA — Pakan dan Perlengkapan Hamster',
      description:
        'Konsep desain aplikasi untuk membantu pengguna menelusuri kebutuhan pakan dan perlengkapan hamster.',
      contributions: [
        'Merancang antarmuka aplikasi pakan dan perlengkapan hamster.',
        'Menyusun konsep beranda dan kategori produk.',
        'Merancang bagian riwayat pesanan dan profil pengguna.'
      ],
      tech: [
        'UI Design',
        'User Experience',
        'Mobile App Concept'
      ]
    },

    asbun: {
      category: 'UI/UX DESIGN · 2024',
      title: 'ASBUN — Asuransi Bunda',
      description:
        'Konsep antarmuka aplikasi asuransi yang mencakup pilihan paket, penyesuaian layanan, dan pelacakan nomor resi.',
      contributions: [
        'Merancang antarmuka untuk pilihan paket asuransi.',
        'Menyusun konsep kustomisasi layanan.',
        'Merancang fitur pelacakan nomor resi.'
      ],
      tech: [
        'UI Design',
        'User Flow',
        'Prototyping'
      ]
    },

    dapoer: {
      category: 'UI/UX DESIGN · 2024',
      title: 'Dapoer Ibu Doki',
      description:
        'Konsep desain aplikasi pemesanan kue berbasis Android dengan informasi produk dan pengiriman.',
      contributions: [
        'Merancang antarmuka aplikasi pemesanan kue.',
        'Menyusun bagian layanan pengiriman.',
        'Menyajikan estimasi waktu tiba.',
        'Merancang halaman detail produk.'
      ],
      tech: [
        'UI Design',
        'Android App Concept',
        'Mobile Experience'
      ]
    },

    barbershop: {
      category: 'UI/UX DESIGN · 2023',
      title: 'Aplikasi Pemesanan Barbershop',
      description:
        'Konsep desain antarmuka aplikasi pemesanan barbershop untuk membantu pengguna mendapatkan informasi layanan dan antrean.',
      contributions: [
        'Merancang antarmuka fitur layanan barbershop.',
        'Menyusun konsep informasi antrean.',
        'Menampilkan estimasi waktu tunggu.',
        'Menyajikan informasi barbershop.'
      ],
      tech: [
        'UI Design',
        'Wireframing',
        'Mobile App Concept'
      ]
    }
  };

  // =========================================
  // PROJECT DETAIL DIALOG
  // =========================================

  const dialog = $('#projectDialog');
  const dialogClose = $('#dialogClose');

  const dialogCategory = $('#dialogCategory');
  const dialogTitle = $('#dialogTitle');
  const dialogDescription = $('#dialogDescription');
  const dialogContributions = $('#dialogContributions');
  const dialogTech = $('#dialogTech');

  function closeProjectDialog() {
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  function addListItems(container, items) {
    container.replaceChildren();

    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }

  function addTechTags(container, items) {
    container.replaceChildren();

    items.forEach(item => {
      const span = document.createElement('span');
      span.textContent = item;
      container.appendChild(span);
    });
  }

  $$('[data-open-project]').forEach(button => {
    button.addEventListener('click', () => {
      const projectId = button.dataset.openProject;
      const detail = projectDetails[projectId];

      if (
        !detail ||
        !dialog ||
        !dialogCategory ||
        !dialogTitle ||
        !dialogDescription ||
        !dialogContributions ||
        !dialogTech
      ) {
        showToast('Detail proyek belum tersedia.');
        return;
      }

      dialogCategory.textContent = detail.category;
      dialogTitle.textContent = detail.title;
      dialogDescription.textContent = detail.description;

      addListItems(dialogContributions, detail.contributions);
      addTechTags(dialogTech, detail.tech);

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        showToast('Browser kamu tidak mendukung popup detail proyek.');
      }
    });
  });

  if (dialogClose) {
    dialogClose.addEventListener('click', closeProjectDialog);
  }

  if (dialog) {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        closeProjectDialog();
      }
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeProjectDialog();
    }
  });

  // =========================================
  // CURRENT YEAR
  // =========================================

  const currentYear = $('#currentYear');

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

})();
