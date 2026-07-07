// FrameYuk - Core Logic & State Management
// File: script.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize local storage dummy database
    initDatabase();
    
    // 2. Global Sign In / User greeting logic
    updateHeaderUserInfo();
    
    // 3. Dropdown visibility handler
    initDropdowns();

    // 4. Page-specific routes and initializations
    const path = window.location.pathname;
    
    if (path.includes('profil.html')) {
        initProfilePage();
    } else if (path.includes('katalog.html')) {
        initKatalogPage();
    } else if (path.includes('detail.html')) {
        initDetailPage();
    } else if (path.includes('ringkasan.html')) {
        initRingkasanPage();
    } else if (path.includes('pembayaran.html')) {
        initPembayaranPage();
    } else if (path.includes('sukses.html')) {
        initSuksesPage();
    } else if (path.includes('pesanan.html')) {
        initPesananPage();
    } else if (path.includes('status.html')) {
        initStatusPage();
    } else if (path.includes('notifikasi.html')) {
        initNotifikasiPage();
    } else {
        // Default (index.html / Home)
        initHomePage();
    }
});

// ==========================================
// 1. DATABASE & STORAGE LAYER (Dummy LocalStorage)
// ==========================================
function initDatabase() {
    // Initialize default logged in user if not set
    if (!localStorage.getItem('fy_logged_in_user')) {
        // Check if old profile_name existed, otherwise default
        const oldName = localStorage.getItem('profile_name') || 'Ahmad';
        const user = {
            name: oldName,
            email: localStorage.getItem('profile_email') || 'ahmad@example.com',
            phone: localStorage.getItem('profile_phone') || '081234567890',
            dob: localStorage.getItem('profile_dob') || '2004-08-15',
            avatar: localStorage.getItem('profile_avatar') || ''
        };
        localStorage.setItem('fy_logged_in_user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true'); // Auto-login for techdemo
    }

    // Initialize default orders
    if (!localStorage.getItem('fy_orders')) {
        const defaultOrders = [
            {
                id: "FY-00089",
                date: "05 Jul 2026",
                frameId: "anniversary-floral",
                frameName: "Frame Anniversary Floral",
                packageType: "premium",
                packageName: "Premium",
                color: "#800000",
                colorName: "Maroon",
                size: "4R",
                qty: 1,
                price: 30000,
                subtotal: 30000,
                discount: 3000,
                total: 27000,
                status: "process", // unpaid, process, shipping, done
                statusStep: 2, // Stepper index (0: Dibuat, 1: Pembayaran, 2: Diproses, 3: QC, 4: Pengiriman PNG, 5: Selesai)
                texts: { name: "Rian & Siska", campus: "Jakarta", date: "05 Okt 2026", quote: "Happy Anniversary!" },
                photos: ["", "", ""],
                font: "'Playfair Display', serif",
                statusHistory: [
                    { step: "Pesanan Dibuat", time: "05 Jul 2026, 10:00" },
                    { step: "Pembayaran Berhasil", time: "05 Jul 2026, 10:15" },
                    { step: "Diproses/Desain", time: "05 Jul 2026, 11:30" }
                ]
            },
            {
                id: "FY-00045",
                date: "20 Jun 2026",
                frameId: "family-tree",
                frameName: "Frame Keluarga Minimalis",
                packageType: "standar",
                packageName: "Standar",
                color: "#10263f",
                colorName: "Navy",
                size: "10R",
                qty: 1,
                price: 15000,
                subtotal: 15000,
                discount: 1500,
                total: 13500,
                status: "done",
                statusStep: 5,
                texts: { name: "Keluarga Pratama", campus: "Bandung", date: "20 Jun 2026", quote: "Home Sweet Home" },
                photos: [""],
                font: "'Inter', sans-serif",
                statusHistory: [
                    { step: "Pesanan Dibuat", time: "20 Jun 2026, 09:00" },
                    { step: "Pembayaran Berhasil", time: "20 Jun 2026, 09:10" },
                    { step: "Diproses/Desain", time: "20 Jun 2026, 11:00" },
                    { step: "Quality Control", time: "20 Jun 2026, 14:00" },
                    { step: "Pengiriman PNG", time: "20 Jun 2026, 15:30" },
                    { step: "Selesai", time: "20 Jun 2026, 16:00" }
                ]
            }
        ];
        localStorage.setItem('fy_orders', JSON.stringify(defaultOrders));
    }

    // Initialize default notifications
    if (!localStorage.getItem('fy_notifications')) {
        const defaultNotifications = [
            {
                id: "notif-1",
                orderId: "FY-00089",
                title: "Pesanan Diproses",
                message: "Pesanan #FY-00089 Anda sedang dalam tahap pengerjaan desain oleh tim kami.",
                time: "05 Jul 2026, 11:30",
                read: true
            },
            {
                id: "notif-2",
                orderId: "FY-00045",
                title: "Pesanan Selesai",
                message: "Pesanan #FY-00045 telah selesai. Silakan unduh hasil PNG Anda.",
                time: "20 Jun 2026, 16:00",
                read: true
            }
        ];
        localStorage.setItem('fy_notifications', JSON.stringify(defaultNotifications));
    }
}

// Helpers to get/set data
function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('fy_logged_in_user'));
}

function saveLoggedInUser(user) {
    localStorage.setItem('fy_logged_in_user', JSON.stringify(user));
    // Backwards compatibility for old code
    localStorage.setItem('profile_name', user.name);
    localStorage.setItem('profile_avatar', user.avatar);
    localStorage.setItem('profile_email', user.email);
    localStorage.setItem('profile_phone', user.phone);
    localStorage.setItem('profile_dob', user.dob);
}

function getOrders() {
    return JSON.parse(localStorage.getItem('fy_orders')) || [];
}

function saveOrders(orders) {
    localStorage.setItem('fy_orders', JSON.stringify(orders));
}

function getNotifications() {
    return JSON.parse(localStorage.getItem('fy_notifications')) || [];
}

function saveNotifications(notifs) {
    localStorage.setItem('fy_notifications', JSON.stringify(notifs));
}

function addNotification(orderId, title, message) {
    const notifs = getNotifications();
    const newNotif = {
        id: "notif-" + Date.now(),
        orderId: orderId,
        title: title,
        message: message,
        time: getCurrentTimeString(),
        read: false
    };
    notifs.unshift(newNotif);
    saveNotifications(notifs);
}

function getCurrentTimeString() {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

// ==========================================
// 2. NAV & HEADER RENDERER
// ==========================================
function updateHeaderUserInfo() {
    const user = getLoggedInUser();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!user) return;

    // Header index page / Landing
    const btnSignin = document.querySelector('.btn-signin');
    const navbar = document.querySelector('.navbar');

    if (isLoggedIn && btnSignin && navbar) {
        const userProfileHTML = `
            <div class="user-profile">
                <div class="user-info" style="color: var(--white); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    ${user.avatar ? `<img src="${user.avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">` : '<i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>'}
                    <span>Halo, ${user.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="user-dropdown" style="margin-top: 15px;">
                    <ul>
                        <li><a href="profil.html"><i class="fas fa-user"></i> Profil</a></li>
                        <li><a href="pesanan.html"><i class="fas fa-shopping-bag"></i> Pesanan Saya</a></li>
                        <li><a href="notifikasi.html"><i class="fas fa-bell"></i> Notifikasi</a></li>
                        <li><a href="#" class="text-danger" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
                    </ul>
                </div>
            </div>
        `;
        btnSignin.outerHTML = userProfileHTML;
    }

    // Header pages internal (Katalog, Detail, dll)
    const profileSpans = document.querySelectorAll('.user-info span');
    profileSpans.forEach(span => {
        span.textContent = `Halo, ${user.name}`;
    });

    if (user.avatar) {
        const userInfos = document.querySelectorAll('.user-info');
        userInfos.forEach(info => {
            const icon = info.querySelector('i.fa-user-circle');
            if (icon) {
                const img = document.createElement('img');
                img.src = user.avatar;
                img.style.width = '30px';
                img.style.height = '30px';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                icon.parentNode.replaceChild(img, icon);
            } else {
                const existingImg = info.querySelector('img:not(.logo-img):not(.qr-code)');
                if (existingImg) {
                    existingImg.src = user.avatar;
                }
            }
        });
    }

    // Add logout click listener
    document.addEventListener('click', function(e) {
        const logoutBtn = e.target.closest('#logout-btn') || (e.target.closest('.user-dropdown a.text-danger') && e.target.closest('.user-dropdown'));
        if (logoutBtn) {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('fy_logged_in_user');
            // Reset compat profiles
            localStorage.removeItem('profile_name');
            localStorage.removeItem('profile_avatar');
            window.location.href = 'index.html';
        }
    });
}

function initDropdowns() {
    document.addEventListener('click', function(e) {
        const userProfile = e.target.closest('.user-profile');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userProfile && userDropdown) {
            if (e.target.closest('.user-dropdown')) return;
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        } else {
            const allDropdowns = document.querySelectorAll('.user-dropdown');
            allDropdowns.forEach(d => d.classList.remove('show'));
        }
    });
}

// ==========================================
// 3. HOME PAGE (index.html)
// ==========================================
function initHomePage() {
    // Nav links smooth scrolling
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                let targetId = href;
                if (targetId === '#about-us') targetId = '.features';
                if (targetId === '#testimoni') targetId = '#testimoni-section';
                if (targetId === '#contact') targetId = 'footer';
                
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // Populate pricing on cards (Wisuda, Anniversary, Keluarga, Birthday)
    const cards = document.querySelectorAll('.product-card');
    const pricingMap = {
        'Frame Wisuda': 'Mulai Rp 12.000',
        'Frame Anniversary': 'Mulai Rp 15.000',
        'Frame Keluarga': 'Mulai Rp 15.000',
        'Frame Ulang Tahun': 'Mulai Rp 15.000'
    };

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.trim();
        const priceSpan = card.querySelector('.price');
        if (priceSpan && pricingMap[title]) {
            priceSpan.textContent = pricingMap[title];
        }
        
        // Make card clickable to katalog
        const imgWrap = card.querySelector('.image-wrapper');
        if (imgWrap) {
            imgWrap.style.cursor = 'pointer';
            imgWrap.addEventListener('click', () => {
                window.location.href = 'katalog.html';
            });
        }
    });
}

// ==========================================
// 4. LOGIN PAGE (login.html)
// ==========================================
// Handled inline in login.html but let's make sure it handles session correctly
window.handleLogin = function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const name = email.split('@')[0];
    const user = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        phone: '081234567890',
        dob: '2004-08-15',
        avatar: ''
    };
    saveLoggedInUser(user);
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'katalog.html';
};

// ==========================================
// 5. KATALOG PAGE (katalog.html)
// ==========================================
function initKatalogPage() {
    const cards = document.querySelectorAll('.product-card');

    // Implement category tabs filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'semua' || filterValue === 'rekomendasi' || category === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Implement search bar functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// ==========================================
// 6. DETAIL PAGE - DYNAMIC CUSTOMIZATION (detail.html)
// ==========================================
let detailState = {
    frameId: 'grad-stripe-showcase',
    frameName: 'Grad Stripe Showcase',
    packageType: 'premium',
    packageName: 'Premium',
    color: '#10263f',
    colorName: 'Navy',
    size: 'Strip', // Strip, 4R, 5R, 10R
    qty: 1,
    texts: { name: 'Ahmad S.Kom', campus: 'Universitas Indonesia', date: '08 Juli 2026', quote: 'Perjuangan telah usai, petualangan dimulai!' },
    photos: ['', '', ''], // slots URL
    font: "'Inter', sans-serif"
};

const designTemplates = {
    'royal-red-damask': { name: 'Royal Red Damask', defaultSlots: 6, category: 'wedding', overlayType: 'wedding' },
    'starry-blue-celebration': { name: 'Starry Blue Celebration', defaultSlots: 6, category: 'ulang-tahun', overlayType: 'birthday' },
    'nature-duo-split-screen': { name: 'Nature duo Split-Screen', defaultSlots: 2, category: 'keluarga', overlayType: 'family' },
    'grad-stripe-showcase': { name: 'Grad Stripe Showcase', defaultSlots: 3, category: 'wisuda', overlayType: 'wisuda' },
    'sweetheart-lace-frame': { name: 'Sweetheart Lace Frame', defaultSlots: 6, category: 'valentine', overlayType: 'valentine' },
    'minimalist-love': { name: 'Minimalist Love', defaultSlots: 3, category: 'valentine', overlayType: 'valentine' }
};

function initDetailPage() {
    // Get frame id from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'grad-stripe-showcase';
    const template = designTemplates[id] || designTemplates['grad-stripe-showcase'];
    
    // Set dynamic defaults based on design ID
    detailState.frameId = id;
    detailState.frameName = template.name;
    detailState.packageType = 'premium';
    detailState.packageName = 'Premium';
    detailState.qty = 1;
    detailState.size = 'Strip';
    
    if (id === 'royal-red-damask') {
        detailState.color = '#800000'; // Maroon
        detailState.colorName = 'Maroon';
        detailState.texts = {
            name: 'Jasmin & Reza',
            campus: 'the wedding of',
            date: '07 | 12 | 2026',
            quote: 'Abadi dalam Kasih dan Janji Suci'
        };
        detailState.font = "'Playfair Display', serif";
        detailState.photos = Array(6).fill('');
    } else if (id === 'starry-blue-celebration') {
        detailState.color = '#10263f'; // Navy
        detailState.colorName = 'Navy';
        detailState.texts = {
            name: 'Happy Birthday',
            campus: 'Starry Blue Celebration',
            date: '08 Juli 2026',
            quote: 'Semoga panjang umur dan bahagia selalu!'
        };
        detailState.font = "'Inter', sans-serif";
        detailState.photos = Array(6).fill('');
    } else if (id === 'nature-duo-split-screen') {
        detailState.color = '#0f5257'; // Emerald
        detailState.colorName = 'Emerald';
        detailState.texts = {
            name: 'Keluarga Pratama',
            campus: 'Nature duo Split-Screen',
            date: '08 Juli 2026',
            quote: 'Kehangatan rumah dalam kebersamaan'
        };
        detailState.font = "'Inter', sans-serif";
        detailState.photos = Array(2).fill('');
    } else if (id === 'grad-stripe-showcase') {
        detailState.color = '#10263f'; // Navy
        detailState.colorName = 'Navy';
        detailState.texts = {
            name: 'Ahmad S.Kom',
            campus: 'Universitas Indonesia',
            date: '08 Juli 2026',
            quote: 'Perjuangan telah usai, petualangan dimulai!'
        };
        detailState.font = "'Inter', sans-serif";
        detailState.photos = Array(3).fill('');
    } else if (id === 'sweetheart-lace-frame') {
        detailState.color = '#8a2542'; // Magenta Maroon
        detailState.colorName = 'Maroon Valentine';
        detailState.texts = {
            name: '',
            campus: '',
            date: '',
            quote: 'Every story is beautiful, but ours is my favorite.'
        };
        detailState.font = "'Playfair Display', serif";
        detailState.photos = Array(6).fill('');
    } else if (id === 'minimalist-love') {
        detailState.color = '#b76e79'; // Rose Gold
        detailState.colorName = 'Rose Gold';
        detailState.texts = {
            name: 'Kisah Kasih Abadi',
            campus: 'Minimalist Love',
            date: '08 Juli 2026',
            quote: 'Sederhana namun penuh dengan cinta'
        };
        detailState.font = "'Playfair Display', serif";
        detailState.photos = Array(3).fill('');
    }

    // Restore previous active draft if existing
    const savedDraft = localStorage.getItem('fy_current_order');
    if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.frameId === id) {
            detailState = parsedDraft;
        }
    }

    // Set page headings
    const titleEl = document.querySelector('.product-title');
    if (titleEl) titleEl.textContent = template.name;
    
    const breadcrumbSpan = document.querySelector('.breadcrumb span');
    if (breadcrumbSpan) breadcrumbSpan.textContent = template.name;

    // Render forms & dynamic preview base
    renderDetailPageLayout(template);
    
    // Add event listeners
    bindDetailEvents(template);

    // Initial render
    updatePreviewAndForm();
}

function renderDetailPageLayout(template) {
    const mainContainer = document.querySelector('.detail-layout');
    if (!mainContainer) return;

    // We replace the layout content to make it fully dynamic
    mainContainer.innerHTML = `
        <!-- Left Column: Frame Live Preview -->
        <div class="detail-gallery">
            <div class="main-image-preview-container">
                <div id="live-frame-preview" class="live-frame-preview size-${detailState.size} design-${detailState.frameId}">
                    <!-- Frame Borders -->
                    <div class="frame-border-outer">
                        <div class="frame-border-inner">
                            <!-- Photo Slots Container -->
                            <div class="photo-slots-grid slots-count-${detailState.photos.length}">
                                ${detailState.photos.map((photo, i) => `
                                    <div class="photo-slot-item" id="preview-slot-${i}" data-index="${i}">
                                        ${photo ? `<img src="${photo}">` : `<div class="slot-placeholder"><i class="fas fa-image"></i><span>Slot Foto ${i+1}</span></div>`}
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- Overlay Decorations -->
                            <div class="frame-decorations ${template.overlayType}">
                                ${getSVGDecorations(template.overlayType)}
                            </div>
                            
                            <!-- Personalisasi Teks Overlay -->
                            <div class="text-overlay-container">
                                <div class="overlay-text overlay-name">${detailState.texts.name}</div>
                                <div class="overlay-text overlay-campus">${detailState.texts.campus}</div>
                                <div class="overlay-text overlay-date">${detailState.texts.date}</div>
                                <div class="overlay-text overlay-quote">"${detailState.texts.quote}"</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px;">
                <button type="button" class="btn-action btn-outline" id="btn-trigger-preview"><i class="fas fa-expand"></i> Lihat Preview Sekarang</button>
            </div>
        </div>

        <!-- Right Column: Customization Forms -->
        <div class="detail-info">
            <h1 class="product-title" style="font-size: 2.2rem; margin-bottom: 5px;">${template.name}</h1>
            <div class="product-price" style="font-size: 1.8rem; font-weight: 700; color: var(--primary-color); margin-bottom: 20px;">Rp 30.000</div>
            
            <div class="package-alert" style="background-color: rgba(181, 97, 51, 0.05); border-left: 4px solid var(--primary-color); padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9rem;">
                <strong>Premium</strong> - 1 Frame, 8+ warna lengkap, kualitas HD, gratis revisi.
            </div>

            <div class="customization-form">
                <!-- 1. Pilih Paket -->
                <div class="form-group">
                    <label>Pilih Paket</label>
                    <div class="package-selector-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <button class="pkg-btn ${detailState.packageType === 'standar' ? 'active' : ''}" data-pkg="standar">
                            <span class="pkg-name">Standar</span>
                            <span class="pkg-price">Rp 15.000</span>
                        </button>
                        <button class="pkg-btn ${detailState.packageType === 'premium' ? 'active' : ''}" data-pkg="premium">
                            <span class="pkg-name">Premium</span>
                            <span class="pkg-price">Rp 30.000</span>
                        </button>
                        <button class="pkg-btn ${detailState.packageType === 'bundle' ? 'active' : ''}" data-pkg="bundle">
                            <span class="pkg-name">Bundle 5 Frame</span>
                            <span class="pkg-price">Rp 60.000</span>
                        </button>
                        <button class="pkg-btn ${detailState.packageType === 'kampus' ? 'active' : ''}" data-pkg="kampus">
                            <span class="pkg-name">Paket Kampus</span>
                            <span class="pkg-price">Rp 12.000<span style="font-size: 0.7rem; font-weight:normal;">/frame</span></span>
                        </button>
                    </div>
                </div>

                <!-- 2. Pilih Warna Frame -->
                <div class="form-group">
                    <label>Warna Frame</label>
                    <div class="color-options" id="detail-color-options">
                        <!-- Rendered dynamically based on package -->
                    </div>
                </div>

                <!-- 3. Pilih Ukuran Foto -->
                <div class="form-group">
                    <label>Ukuran Foto</label>
                    <select id="size-selector" class="form-input" style="border: 1px solid #ddd; width: 100%; height:45px; border-radius:8px;">
                        <option value="Strip" ${detailState.size === 'Strip' ? 'selected' : ''}>Strip (Fotobooth) [Rasio 1:3]</option>
                        <option value="4R" ${detailState.size === '4R' ? 'selected' : ''}>4R [Rasio 2:3]</option>
                        <option value="5R" ${detailState.size === '5R' ? 'selected' : ''}>5R [Rasio 5:7]</option>
                        <option value="10R" ${detailState.size === '10R' ? 'selected' : ''}>10R [Rasio 5:6]</option>
                    </select>
                </div>

                <!-- 4. Upload Foto Slots -->
                <div class="form-group">
                    <label id="upload-slots-label">Upload Foto (${detailState.photos.length} Slot)</label>
                    <div class="upload-slots" id="detail-upload-slots">
                        <!-- Slots file inputs will be generated here -->
                    </div>
                    <small class="text-muted">*Unggah foto sesuai slot frame. Klik slot untuk memilih gambar.</small>
                </div>

                <!-- 5. Teks Personalisasi -->
                <div class="form-group">
                    <label>Teks Personalisasi</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="text-name" class="form-input" placeholder="Nama Lengkap" value="${detailState.texts.name}" style="border: 1px solid #ddd;">
                        <input type="text" id="text-campus" class="form-input" placeholder="Jurusan / Kampus / Lokasi" value="${detailState.texts.campus}" style="border: 1px solid #ddd;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="text-date" class="form-input" placeholder="Tanggal / Tahun" value="${detailState.texts.date}" style="border: 1px solid #ddd;">
                        <select id="font-selector" class="form-input" style="border: 1px solid #ddd; height:45px; border-radius:8px;">
                            <option value="'Inter', sans-serif" ${detailState.font.includes('Inter') ? 'selected' : ''}>Font Modern (Inter)</option>
                            <option value="'Playfair Display', serif" ${detailState.font.includes('Playfair') ? 'selected' : ''}>Font Elegan (Playfair)</option>
                            <option value="'Pacifico', cursive" ${detailState.font.includes('Pacifico') ? 'selected' : ''}>Font Script (Pacifico)</option>
                        </select>
                    </div>
                    <textarea id="text-quote" class="form-input" placeholder="Ucapan / Quote Singkat" style="border: 1px solid #ddd; width: 100%; height: 70px; border-radius:8px; padding:10px; resize:none;">${detailState.texts.quote}</textarea>
                </div>

                <!-- 6. Kuantitas dan Tombol Pesan -->
                <div class="form-group action-group">
                    <div class="quantity-control">
                        <button type="button" class="qty-btn" id="qty-minus">-</button>
                        <input type="number" id="qty-number" value="${detailState.qty}" min="1" class="qty-input" readonly>
                        <button type="button" class="qty-btn" id="qty-plus">+</button>
                    </div>
                    <button type="button" id="btn-submit-order" class="btn-primary btn-large" style="border:none; cursor:pointer;">Pesan Sekarang</button>
                </div>
            </div>
        </div>
    `;
}

function getSVGDecorations(type) {
    if (type === 'wisuda') {
        return `
            <svg class="decor-cap" viewBox="0 0 100 100" style="position:absolute; bottom: 80px; right: 10px; width: 40px; height: 40px; fill: var(--primary-color);">
                <path d="M50,15 L90,30 L50,45 L10,30 Z" />
                <path d="M25,38.5 L25,60 C25,70 75,70 75,60 L75,38.5 L50,48 Z" />
                <path d="M80,31.5 L80,75 L83,75 L83,32.5 Z" />
            </svg>
            <div style="position:absolute; top: 12px; left: 12px; color: rgba(255,255,255,0.5); font-size: 0.8rem; z-index: 10;">
                <i class="fas fa-graduation-cap"></i> GRADUATION
            </div>
        `;
    } else if (type === 'anniversary') {
        return `
            <!-- Lace scalloped borders on left and right -->
            <div style="position:absolute; top:15px; bottom:75px; left:8px; width:4px; background: radial-gradient(rgba(255,255,255,0.4) 2px, transparent 0) repeat-y; background-size: 8px 8px; z-index:10;"></div>
            <div style="position:absolute; top:15px; bottom:75px; right:8px; width:4px; background: radial-gradient(rgba(255,255,255,0.4) 2px, transparent 0) repeat-y; background-size: 8px 8px; z-index:10;"></div>
            
            <!-- Hearts stickers -->
            <div style="position:absolute; top: 12px; left: 15px; color: #ff4d6d; font-size: 1rem; z-index: 10;"><i class="fas fa-heart"></i></div>
            <div style="position:absolute; top: 12px; right: 15px; color: #ff4d6d; font-size: 1rem; z-index: 10;"><i class="fas fa-heart"></i></div>
            
            <!-- Heart frame tag at the bottom label -->
            <div style="position:absolute; bottom: 82px; left: 50%; transform: translateX(-50%); color: #ff4d6d; font-size: 1.1rem; z-index: 12;"><i class="fas fa-heart"></i></div>
        `;
    } else if (type === 'birthday') {
        return `
            <!-- Theater Curtain at top -->
            <div class="theater-curtain" style="position:absolute; top:0; left:0; width:100%; height:25px; background: repeating-linear-gradient(90deg, #d90429, #d90429 10px, #ef233c 10px, #ef233c 20px); border-bottom: 3px solid #ffb703; z-index: 10; border-radius: 6px 6px 0 0;"></div>
            
            <!-- Cartoon Cat Sticker bottom-left -->
            <div class="party-sticker sticker-cat" style="position:absolute; bottom: 80px; left: -10px; z-index: 12; width: 60px; height: 60px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transform: rotate(-10deg);">
                <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
                    <!-- Hat -->
                    <polygon points="50,5 35,40 65,40" fill="#ffb703" stroke="#fff" stroke-width="2"/>
                    <circle cx="50" cy="5" r="5" fill="#d90429"/>
                    <!-- Cat Head -->
                    <circle cx="50" cy="65" r="25" fill="#eaeaea" stroke="#333" stroke-width="2"/>
                    <!-- Ears -->
                    <polygon points="30,48 20,25 40,48" fill="#eaeaea" stroke="#333" stroke-width="2"/>
                    <polygon points="70,48 80,25 60,48" fill="#eaeaea" stroke="#333" stroke-width="2"/>
                    <!-- Eyes -->
                    <circle cx="42" cy="60" r="3" fill="#333"/>
                    <circle cx="58" cy="60" r="3" fill="#333"/>
                    <!-- Nose & Whiskers -->
                    <circle cx="50" cy="67" r="2" fill="#d90429"/>
                    <line x1="32" y1="67" x2="15" y2="65" stroke="#333" stroke-width="2"/>
                    <line x1="32" y1="72" x2="15" y2="75" stroke="#333" stroke-width="2"/>
                    <line x1="68" y1="67" x2="85" y2="65" stroke="#333" stroke-width="2"/>
                    <line x1="68" y1="72" x2="85" y2="75" stroke="#333" stroke-width="2"/>
                </svg>
            </div>

            <!-- Bat Sticker top-right -->
            <div class="party-sticker sticker-bat" style="position:absolute; top: 110px; right: 15px; z-index: 12; width: 35px; height: 25px; filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.4)); transform: rotate(15deg);">
                <svg viewBox="0 0 100 60" style="width:100%; height:100%; fill: #2b2d42;">
                    <path d="M50,15 C45,5 30,5 20,15 C10,25 0,15 5,35 C10,45 35,50 50,35 C65,50 90,45 95,35 C100,15 90,25 80,15 C70,5 55,5 50,15 Z" />
                    <circle cx="44" cy="20" r="2" fill="#d90429"/>
                    <circle cx="56" cy="20" r="2" fill="#d90429"/>
                </svg>
            </div>

            <!-- Teddy Bear Sticker -->
            <div class="party-sticker sticker-bear" style="position:absolute; bottom: 85px; right: 10px; z-index: 12; width: 35px; height: 35px; filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.3)); transform: rotate(5deg);">
                <svg viewBox="0 0 100 100" style="width:100%; height:100%; fill: #c6a47e;">
                    <circle cx="30" cy="30" r="15" fill="#c6a47e" stroke="#fff" stroke-width="2"/>
                    <circle cx="70" cy="30" r="15" fill="#c6a47e" stroke="#fff" stroke-width="2"/>
                    <circle cx="50" cy="60" r="30" fill="#c6a47e" stroke="#fff" stroke-width="2"/>
                    <circle cx="40" cy="55" r="3" fill="#333"/>
                    <circle cx="60" cy="55" r="3" fill="#333"/>
                    <circle cx="50" cy="67" r="10" fill="#eaeaea"/>
                    <circle cx="50" cy="65" r="3" fill="#333"/>
                </svg>
            </div>

            <!-- Comic Splash "HAPPY BIRTHDAY" at bottom -->
            <div class="comic-splash-wrapper" style="position:absolute; bottom: -8px; left: 50%; transform: translateX(-50%); z-index: 15; width: 85%; height: 75px; display:flex; align-items:center; justify-content:center;">
                <div class="comic-splash-bubble" style="position:relative; width:100%; height:100%;">
                    <svg viewBox="0 0 200 80" style="width:100%; height:100%;">
                        <polygon points="100,5 120,25 150,15 140,40 180,35 150,55 170,75 125,65 110,78 95,65 75,78 70,60 30,70 50,50 20,35 60,35 50,15 80,25" fill="#ffd700" stroke="#d90429" stroke-width="3"/>
                        <polygon points="100,10 115,28 142,20 134,42 170,38 143,54 160,70 123,61 110,72 97,61 77,72 73,57 37,65 54,47 28,38 63,38 55,20 83,28" fill="#ffb703"/>
                    </svg>
                    <div style="position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-4deg); font-family: 'Arial Black', Impact, sans-serif; font-size: 1.15rem; font-weight:900; color: #fff; text-shadow: 2px 2px 0 #d90429, -2px -2px 0 #d90429, 2px -2px 0 #d90429, -2px 2px 0 #d90429, 3px 3px 0 #000; text-align:center; white-space:nowrap; width:100%;">
                        HAPPY<br>BIRTHDAY
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'family') {
        return `
            <!-- Split screen border -->
            <div style="position:absolute; top:12px; bottom:78px; left:12px; right:12px; border-right: 2px dashed rgba(255,255,255,0.3); pointer-events:none; z-index:1;"></div>
            <div style="position:absolute; bottom: 80px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: 1.2rem; z-index: 10;"><i class="fas fa-seedling"></i></div>
        `;
    } else if (type === 'wedding') {
        return `
            <!-- Top elegant bar -->
            <div style="position:absolute; top:12px; left:12px; right:12px; border-top: 2px solid rgba(255,255,255,0.4); z-index: 10;"></div>
            
            <!-- Ribbon at bottom -->
            <div style="position:absolute; bottom: 78px; left: 50%; transform: translateX(-50%); z-index: 12; width: 40px; height: 20px; color: rgba(255,255,255,0.7); display:flex; justify-content:center; align-items:center;">
                <i class="fas fa-ribbon" style="font-size:1.5rem;"></i>
            </div>
            
            <!-- Double elegant border inside text overlay -->
            <div class="wedding-overlay-border" style="position:absolute; bottom:10px; left:12px; right:12px; height:60px; border: 1.5px solid rgba(255,255,255,0.5); border-radius: 8px; pointer-events:none; z-index: 1;"></div>
        `;
    } else if (type === 'minimalist-love') {
        return `
            <div style="position:absolute; bottom: 80px; left: 15px; color: rgba(255,255,255,0.6); font-size: 1.2rem; z-index:10;"><i class="fas fa-feather-alt"></i></div>
            <div style="position:absolute; bottom: 80px; right: 15px; color: rgba(255,255,255,0.6); font-size: 1.2rem; z-index:10; transform: scaleX(-1);"><i class="fas fa-feather-alt"></i></div>
        `;
    }
    return '';
}

function bindDetailEvents(template) {
    // Package selector buttons
    const pkgButtons = document.querySelectorAll('.pkg-btn');
    pkgButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            pkgButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const pkg = btn.getAttribute('data-pkg');
            detailState.packageType = pkg;
            
            const pkgMap = {
                'standar': 'Standar',
                'premium': 'Premium',
                'bundle': 'Bundle 5 Frame',
                'kampus': 'Paket Kampus'
            };
            detailState.packageName = pkgMap[pkg];

            // If Kampus, enforce min quantity 3
            if (pkg === 'kampus') {
                if (detailState.qty < 3) {
                    detailState.qty = 3;
                    const qtyNumber = document.getElementById('qty-number');
                    if (qtyNumber) qtyNumber.value = 3;
                }
            }

            updatePreviewAndForm();
        });
    });

    // Size Selector
    const sizeSelector = document.getElementById('size-selector');
    if (sizeSelector) {
        sizeSelector.addEventListener('change', (e) => {
            detailState.size = e.target.value;
            
            // Re-calculate number of photo slots depending on size
            // Strip = 3, 4R = 2, 5R/10R = 1
            let slotCount = 1;
            if (detailState.size === 'Strip') slotCount = 3;
            else if (detailState.size === '4R') slotCount = 2;
            
            detailState.photos = Array(slotCount).fill('');
            
            // Re-render layout grid & upload slots
            const gridContainer = document.querySelector('.photo-slots-grid');
            if (gridContainer) {
                gridContainer.className = `photo-slots-grid slots-count-${slotCount}`;
                gridContainer.innerHTML = detailState.photos.map((photo, i) => `
                    <div class="photo-slot-item" id="preview-slot-${i}" data-index="${i}">
                        <div class="slot-placeholder"><i class="fas fa-image"></i><span>Slot Foto ${i+1}</span></div>
                    </div>
                `).join('');
            }
            
            const previewBox = document.getElementById('live-frame-preview');
            if (previewBox) {
                previewBox.className = `live-frame-preview size-${detailState.size}`;
            }

            updateUploadSlotsUI();
            updatePreviewAndForm();
        });
    }

    // Text inputs mapping directly to preview
    const inputName = document.getElementById('text-name');
    const inputCampus = document.getElementById('text-campus');
    const inputDate = document.getElementById('text-date');
    const inputQuote = document.getElementById('text-quote');

    if (inputName) inputName.addEventListener('input', (e) => {
        detailState.texts.name = e.target.value;
        document.querySelector('.overlay-name').textContent = e.target.value;
    });
    if (inputCampus) inputCampus.addEventListener('input', (e) => {
        detailState.texts.campus = e.target.value;
        document.querySelector('.overlay-campus').textContent = e.target.value;
    });
    if (inputDate) inputDate.addEventListener('input', (e) => {
        detailState.texts.date = e.target.value;
        document.querySelector('.overlay-date').textContent = e.target.value;
    });
    if (inputQuote) inputQuote.addEventListener('input', (e) => {
        detailState.texts.quote = e.target.value;
        document.querySelector('.overlay-quote').textContent = `"${e.target.value}"`;
    });

    // Font family selector
    const fontSelector = document.getElementById('font-selector');
    if (fontSelector) {
        fontSelector.addEventListener('change', (e) => {
            detailState.font = e.target.value;
            const container = document.querySelector('.text-overlay-container');
            if (container) {
                container.style.fontFamily = e.target.value;
            }
        });
    }

    // Quantity buttons
    const btnMinus = document.getElementById('qty-minus');
    const btnPlus = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('qty-number');

    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            const minVal = detailState.packageType === 'kampus' ? 3 : 1;
            if (val > minVal) {
                val -= 1;
                qtyInput.value = val;
                detailState.qty = val;
                updatePreviewAndForm();
            }
        });
        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            val += 1;
            qtyInput.value = val;
            detailState.qty = val;
            updatePreviewAndForm();
        });
    }

    // "Lihat Preview Sekarang" modal trigger
    const previewBtn = document.getElementById('btn-trigger-preview');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            showHDPreviewModal();
        });
    }

    // Submit Order button
    const submitBtn = document.getElementById('btn-submit-order');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            // Save state to localStorage
            localStorage.setItem('fy_current_order', JSON.stringify(detailState));
            window.location.href = 'ringkasan.html';
        });
    }

    // Initialize Upload Slot file controls
    updateUploadSlotsUI();
}

function updateUploadSlotsUI() {
    const slotsContainer = document.getElementById('detail-upload-slots');
    const slotsLabel = document.getElementById('upload-slots-label');
    if (!slotsContainer) return;

    slotsLabel.textContent = `Upload Foto (${detailState.photos.length} Slot)`;
    slotsContainer.innerHTML = detailState.photos.map((photo, i) => `
        <div class="upload-box" id="slot-box-${i}" style="position:relative;">
            ${photo ? `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : `<i class="fas fa-plus"></i><span>Slot ${i+1}</span>`}
            <input type="file" id="slot-input-${i}" accept="image/*" style="display: none;">
        </div>
    `).join('');

    // Bind triggers
    detailState.photos.forEach((_, i) => {
        const box = document.getElementById(`slot-box-${i}`);
        const input = document.getElementById(`slot-input-${i}`);
        
        if (box && input) {
            box.addEventListener('click', () => {
                input.click();
            });

            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64 = event.target.result;
                        detailState.photos[i] = base64;
                        
                        // Update detail upload slot thumbnail
                        box.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                        
                        // Update preview grid item
                        const previewItem = document.getElementById(`preview-slot-${i}`);
                        if (previewItem) {
                            previewItem.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover;">`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

function updatePreviewAndForm() {
    // 1. Calculate price
    let basePrice = 30000; // default premium
    if (detailState.packageType === 'standar') basePrice = 15000;
    else if (detailState.packageType === 'bundle') basePrice = 60000;
    else if (detailState.packageType === 'kampus') basePrice = 12000;

    const unitPrice = basePrice;
    const finalPrice = unitPrice * detailState.qty;

    // Update Price text in details
    const priceEl = document.querySelector('.product-price');
    if (priceEl) {
        if (detailState.packageType === 'kampus') {
            priceEl.textContent = `Rp ${finalPrice.toLocaleString('id-ID')} (${detailState.qty} frame x Rp 12.000)`;
        } else {
            priceEl.textContent = `Rp ${finalPrice.toLocaleString('id-ID')}`;
        }
    }

    // Update Alert Text description
    const alertEl = document.querySelector('.package-alert');
    if (alertEl) {
        if (detailState.packageType === 'standar') {
            alertEl.innerHTML = `<strong>Standar — Rp15.000</strong>: 1 frame, 4 warna dasar.`;
        } else if (detailState.packageType === 'premium') {
            alertEl.innerHTML = `<strong>Premium — Rp30.000</strong>: 1 frame, 8+ warna lengkap, kualitas HD, gratis revisi.`;
        } else if (detailState.packageType === 'bundle') {
            alertEl.innerHTML = `<strong>Bundle 5 Frame — Rp60.000</strong>: 5 frame sekaligus.`;
        } else if (detailState.packageType === 'kampus') {
            alertEl.innerHTML = `<strong>Paket Kampus — Rp12.000/frame</strong>: Harga khusus mahasiswa (minimal order 3 frame).`;
        }
    }

    // 2. Render Color Option Radio buttons
    const colorContainer = document.getElementById('detail-color-options');
    if (colorContainer) {
        // Standard gets 4 basic colors. Premium/others get 8+ colors
        let colors = [
            { name: 'Navy', hex: '#10263f' },
            { name: 'Black', hex: '#000000' },
            { name: 'Maroon', hex: '#800000' },
            { name: 'White', hex: '#ffffff' }
        ];

        if (detailState.packageType !== 'standar') {
            colors = colors.concat([
                { name: 'Orange', hex: '#b56133' },
                { name: 'Emerald', hex: '#0f5257' },
                { name: 'Gold', hex: '#d4af37' },
                { name: 'Rose Gold', hex: '#b76e79' },
                { name: 'Biru Cerah', hex: '#4895ef' },
                { name: 'Ungu', hex: '#7209b7' },
                { name: 'Tosca', hex: '#20b2aa' },
                { name: 'Coksu', hex: '#c6a47e' },
                { name: 'Abu Muda', hex: '#cccccc' },
                { name: 'Abu Tua', hex: '#555555' },
                { name: 'Abu Monyet', hex: '#968574' }
            ]);
        }

        // Keep active color if still in array, otherwise fallback to Navy
        const stillExists = colors.find(c => c.hex === detailState.color);
        if (!stillExists) {
            detailState.color = colors[0].hex;
            detailState.colorName = colors[0].name;
        }

        colorContainer.innerHTML = colors.map(c => `
            <label class="color-radio" data-name="${c.name}" data-hex="${c.hex}">
                <input type="radio" name="color" value="${c.hex}" ${detailState.color === c.hex ? 'checked' : ''}>
                <span class="color-swatch" style="background-color: ${c.hex}; ${c.hex === '#ffffff' ? 'border: 2px solid #ccc;' : ''}"></span>
            </label>
        `).join('');

        // Bind color triggers
        const radios = colorContainer.querySelectorAll('input[name="color"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const label = e.target.closest('.color-radio');
                detailState.color = e.target.value;
                detailState.colorName = label.getAttribute('data-name');
                applyColorToPreview();
            });
        });
    }

    // Apply active CSS states
    applyColorToPreview();
    
    const textOverlay = document.querySelector('.text-overlay-container');
    if (textOverlay) {
        textOverlay.style.fontFamily = detailState.font;
    }
}

function applyColorToPreview() {
    const preview = document.getElementById('live-frame-preview');
    if (preview) {
        // Set CSS variable
        preview.style.setProperty('--frame-color', detailState.color);
        
        // Handle white background frame text readability
        if (detailState.color === '#ffffff') {
            preview.style.setProperty('--frame-text-color', 'var(--text-dark)');
        } else {
            preview.style.setProperty('--frame-text-color', 'var(--white)');
        }
    }
}

function showHDPreviewModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'hd-modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(16, 38, 63, 0.9); z-index: 9999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.3s ease;
    `;

    // Clone the preview box
    const originalPreview = document.getElementById('live-frame-preview');
    if (!originalPreview) return;
    
    const clone = originalPreview.cloneNode(true);
    clone.id = 'hd-preview-clone';
    clone.style.transform = 'scale(1.2)';
    clone.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
    clone.style.margin = '20px';

    modal.innerHTML = `
        <div style="position:absolute; top: 20px; right: 20px; color: white; font-size: 2rem; cursor: pointer;" id="close-hd-modal">
            <i class="fas fa-times"></i>
        </div>
        <h3 style="color: white; margin-bottom: 20px; font-weight:600;">Lihat Preview HD</h3>
        <div class="hd-preview-wrapper" style="overflow:auto; max-height:80%; max-width:90%; display:flex; align-items:center; justify-content:center; padding:20px;">
        </div>
        <p style="color: rgba(255,255,255,0.7); margin-top:20px; font-size:0.9rem;">*Ini adalah visual cetak frame Anda. Anda dapat mengunduh format resolusi tinggi setelah pemesanan selesai.</p>
    `;

    modal.querySelector('.hd-preview-wrapper').appendChild(clone);
    document.body.appendChild(modal);

    // Fade in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    const closeBtn = modal.querySelector('#close-hd-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

// ==========================================
// 7. RINGKASAN PESANAN PAGE (ringkasan.html)
// ==========================================
function initRingkasanPage() {
    const currentOrder = JSON.parse(localStorage.getItem('fy_current_order'));
    if (!currentOrder) {
        window.location.href = 'katalog.html';
        return;
    }

    // Set preview details
    const previewContainer = document.getElementById('summary-preview-slot');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div id="live-frame-preview" class="live-frame-preview size-${currentOrder.size} design-${currentOrder.frameId}" style="--frame-color: ${currentOrder.color}; --frame-text-color: ${currentOrder.color === '#ffffff' ? 'var(--text-dark)' : 'var(--white)'}; font-family: ${currentOrder.font}; width: 100%; height: auto; min-height: 380px;">
                <div class="frame-border-outer">
                    <div class="frame-border-inner">
                        <div class="photo-slots-grid slots-count-${currentOrder.photos.length}">
                            ${currentOrder.photos.map((photo, i) => `
                                <div class="photo-slot-item">
                                    ${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover;">` : `<div class="slot-placeholder"><i class="fas fa-image"></i></div>`}
                                </div>
                            `).join('')}
                        </div>
                        <div class="frame-decorations ${designTemplates[currentOrder.frameId]?.overlayType || 'wisuda'}">
                            ${getSVGDecorations(designTemplates[currentOrder.frameId]?.overlayType || 'wisuda')}
                        </div>
                        <div class="text-overlay-container">
                            <div class="overlay-text overlay-name">${currentOrder.texts.name}</div>
                            <div class="overlay-text overlay-campus">${currentOrder.texts.campus}</div>
                            <div class="overlay-text overlay-date">${currentOrder.texts.date}</div>
                            <div class="overlay-text overlay-quote">"${currentOrder.texts.quote}"</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Math pricing calculations
    let basePrice = 30000;
    if (currentOrder.packageType === 'standar') basePrice = 15000;
    else if (currentOrder.packageType === 'bundle') basePrice = 60000;
    else if (currentOrder.packageType === 'kampus') basePrice = 12000;

    const subtotal = basePrice * currentOrder.qty;
    
    // Check if user qualifies for 10% first-time discount
    // (If they have no previous completed orders)
    const user = getLoggedInUser();
    const orders = getOrders();
    const completedOrders = orders.filter(o => o.status === 'done');
    
    // First order discount
    const discount = Math.round(subtotal * 0.10);
    const total = subtotal - discount;

    // Render price breakdown table
    const detailsContainer = document.getElementById('summary-details-box');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div style="background: var(--white); padding: 30px; border-radius: 20px; box-shadow: 0 5px 25px rgba(0,0,0,0.03);">
                <h3 style="margin-bottom: 20px; font-weight:600; font-size:1.3rem;">Rincian Pesanan</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="border-bottom: 1px solid var(--border-color); height: 50px;">
                        <td style="color: var(--text-light);">Produk</td>
                        <td style="text-align: right; font-weight:600;">${currentOrder.frameName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color); height: 50px;">
                        <td style="color: var(--text-light);">Paket</td>
                        <td style="text-align: right; font-weight:600;">${currentOrder.packageName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color); height: 50px;">
                        <td style="color: var(--text-light);">Pilihan Warna</td>
                        <td style="text-align: right; font-weight:600; display:flex; align-items:center; justify-content:flex-end; gap:8px; height:50px;">
                            <span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${currentOrder.color}; border:1px solid #ccc;"></span>
                            ${currentOrder.colorName}
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color); height: 50px;">
                        <td style="color: var(--text-light);">Ukuran</td>
                        <td style="text-align: right; font-weight:600;">${currentOrder.size}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color); height: 50px;">
                        <td style="color: var(--text-light);">Kuantitas</td>
                        <td style="text-align: right; font-weight:600;">${currentOrder.qty} item</td>
                    </tr>
                </table>

                <h3 style="margin-bottom: 20px; font-weight:600; font-size:1.3rem; margin-top:30px;">Data Pemesan</h3>
                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:6px;">Nama Pemesan</label>
                        <input type="text" id="cust-name" class="form-input" value="${user?.name || ''}" placeholder="Nama Lengkap" style="border: 1px solid #ddd; width: 100%; height:40px; border-radius:6px; padding:0 12px; font-size:0.9rem;" required>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:6px;">Nomor WhatsApp</label>
                        <input type="tel" id="cust-phone" class="form-input" value="${user?.phone || ''}" placeholder="Contoh: 081234567890" style="border: 1px solid #ddd; width: 100%; height:40px; border-radius:6px; padding:0 12px; font-size:0.9rem;" required>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:6px;">Email Pengiriman (Hasil PNG)</label>
                        <input type="email" id="cust-email" class="form-input" value="${user?.email || ''}" placeholder="nama@email.com" style="border: 1px solid #ddd; width: 100%; height:40px; border-radius:6px; padding:0 12px; font-size:0.9rem;" required>
                    </div>
                </div>

                <h3 style="margin-bottom: 20px; font-weight:600; font-size:1.3rem; margin-top:30px;">Rincian Pembayaran</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-light);">
                    <span>Subtotal</span>
                    <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #2ecc71;">
                    <span>Diskon Pemesanan Pertama (10%)</span>
                    <span>-Rp ${discount.toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 15px; margin-bottom: 30px;">
                    <span style="font-weight: 700; font-size: 1.1rem;">Total Pembayaran</span>
                    <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary-color);">Rp ${total.toLocaleString('id-ID')}</span>
                </div>

                <div style="display: flex; gap: 15px;">
                    <a href="detail.html?id=${currentOrder.frameId}" class="btn-action btn-outline" style="flex:1; text-align:center; padding:12px 0;">Kembali</a>
                    <button type="button" class="btn-primary" id="btn-ringkasan-checkout" style="flex:2; text-align:center; border:none; cursor:pointer; font-weight:600;">Bayar Sekarang</button>
                </div>
            </div>
        `;
    }

    // Checkout trigger
    const checkoutBtn = document.getElementById('btn-ringkasan-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const customerName = document.getElementById('cust-name').value.trim();
            const customerPhone = document.getElementById('cust-phone').value.trim();
            const customerEmail = document.getElementById('cust-email').value.trim();

            if (!customerName || !customerPhone || !customerEmail) {
                alert("Harap lengkapi semua Data Pemesan sebelum melanjutkan pembayaran.");
                return;
            }

            const orders = getOrders();
            const newOrderId = "FY-00" + (100 + orders.length + 1);
            
            const newOrder = {
                id: newOrderId,
                date: getCurrentDateShortString(),
                frameId: currentOrder.frameId,
                frameName: currentOrder.frameName,
                packageType: currentOrder.packageType,
                packageName: currentOrder.packageName,
                color: currentOrder.color,
                colorName: currentOrder.colorName,
                size: currentOrder.size,
                qty: currentOrder.qty,
                price: basePrice,
                subtotal: subtotal,
                discount: discount,
                total: total,
                status: 'unpaid',
                statusStep: 0, // Pesanan Dibuat
                texts: currentOrder.texts,
                photos: currentOrder.photos,
                font: currentOrder.font,
                customerName: customerName,
                customerPhone: customerPhone,
                customerEmail: customerEmail,
                statusHistory: [
                    { step: "Pesanan Dibuat", time: getCurrentTimeString() }
                ]
            };

            orders.unshift(newOrder);
            saveOrders(orders);

            // Add notification
            addNotification(newOrderId, "Pesanan Dibuat", `Pesanan #${newOrderId} berhasil dibuat. Silakan lakukan pembayaran untuk memproses desain.`);

            // Save active order ID for payment page
            localStorage.setItem('fy_active_order_id', newOrderId);
            // Clear current draft
            localStorage.removeItem('fy_current_order');

            window.location.href = 'pembayaran.html';
        });
    }
}

function getCurrentDateShortString() {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ==========================================
// 8. PEMBAYARAN PAGE - DYNAMIC QRIS (pembayaran.html)
// ==========================================
function initPembayaranPage() {
    const activeOrderId = localStorage.getItem('fy_active_order_id');
    const orders = getOrders();
    const order = orders.find(o => o.id === activeOrderId);

    if (!order) {
        window.location.href = 'pesanan.html';
        return;
    }

    // Update UI elements with exact order info
    const idEl = document.querySelector('.payment-details .detail-row:nth-child(1) strong');
    if (idEl) idEl.textContent = `#${order.id}`;

    const totalEl = document.querySelector('.total-amount');
    if (totalEl) totalEl.textContent = `Rp ${order.total.toLocaleString('id-ID')}`;

    // Make "Saya Sudah Bayar" functional
    const payBtn = document.querySelector('.btn-primary.btn-full.mt-4');
    if (payBtn) {
        payBtn.removeAttribute('href'); // remove default anchor redirect
        payBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Advance stage to Process (index 2)
            order.status = 'process';
            order.statusStep = 2; // "Diproses/Desain"
            order.statusHistory.push({
                step: "Pembayaran Berhasil",
                time: getCurrentTimeString()
            });
            order.statusHistory.push({
                step: "Diproses/Desain",
                time: getCurrentTimeString()
            });

            saveOrders(orders);

            // Trigger notification logs
            addNotification(order.id, "Pembayaran Berhasil", `Pembayaran untuk pesanan #${order.id} telah kami terima. Desain sedang diproses.`);

            window.location.href = 'sukses.html';
        });
    }
}

// ==========================================
// 9. SUKSES PAGE (sukses.html)
// ==========================================
function initSuksesPage() {
    const activeOrderId = localStorage.getItem('fy_active_order_id');
    const descText = document.querySelector('.success-card p');
    
    if (activeOrderId && descText) {
        descText.innerHTML = `Terima kasih, pembayaran untuk pesanan <strong>#${activeOrderId}</strong> telah kami terima. Tim kami akan segera memproses pesanan Anda.`;
    }

    const checkBtn = document.querySelector('.success-actions .btn-primary');
    if (checkBtn) {
        checkBtn.setAttribute('href', `status.html?id=${activeOrderId}`);
    }
}

// ==========================================
// 10. DAFTAR PESANAN MY DASHBOARD (pesanan.html)
// ==========================================
function initPesananPage() {
    const orders = getOrders();
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;

    // Render dynamically
    renderOrdersTable(orders);

    // Bind Filter Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            let filtered = [];

            if (filter === 'all') {
                filtered = orders;
            } else if (filter === 'unpaid') {
                filtered = orders.filter(o => o.status === 'unpaid');
            } else if (filter === 'process') {
                filtered = orders.filter(o => o.status === 'process' || o.status === 'design');
            } else if (filter === 'shipping') {
                filtered = orders.filter(o => o.status === 'shipping');
            } else if (filter === 'done') {
                filtered = orders.filter(o => o.status === 'done');
            }

            renderOrdersTable(filtered);
        });
    });
}

function renderOrdersTable(ordersList) {
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;

    if (ordersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-light);">Tidak ada pesanan ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = ordersList.map(order => {
        let badgeClass = 'status-unpaid';
        let badgeText = 'Belum Bayar';

        if (order.status === 'process') {
            badgeClass = 'status-process';
            badgeText = 'Diproses';
        } else if (order.status === 'shipping') {
            badgeClass = 'status-process';
            badgeText = 'Dikirim';
        } else if (order.status === 'done') {
            badgeClass = 'status-done';
            badgeText = 'Selesai';
        }

        let actionButtonHTML = '';
        if (order.status === 'unpaid') {
            actionButtonHTML = `<button onclick="triggerOrderPayment('${order.id}')" class="btn-action btn-pay">Bayar</button>`;
        } else {
            actionButtonHTML = `<a href="status.html?id=${order.id}" class="btn-action btn-outline">Detail</a>`;
        }

        return `
            <tr data-status="${order.status}">
                <td>#${order.id}</td>
                <td>${order.date}</td>
                <td>${order.frameName} (${order.colorName}) x${order.qty}</td>
                <td style="font-weight:600;">Rp ${order.total.toLocaleString('id-ID')}</td>
                <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <div style="display:flex; gap:10px;">
                        ${actionButtonHTML}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.triggerOrderPayment = function(id) {
    localStorage.setItem('fy_active_order_id', id);
    window.location.href = 'pembayaran.html';
};

// ==========================================
// 11. STATUS PESANAN STEPPER & AUTO-PROGRESS SIMULATION (status.html)
// ==========================================
let autoAdvanceTimer = null;

function initStatusPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const orders = getOrders();
    let order = orders.find(o => o.id === id);

    // If order not found, fallback to latest
    if (!order && orders.length > 0) {
        order = orders[0];
    }

    if (!order) {
        window.location.href = 'katalog.html';
        return;
    }

    renderStatusPageLayout(order);
    
    // Bind buttons
    bindStatusEvents(order);

    // Run auto-advance simulation every 10 seconds if not already Done
    startStepperSimulation(order);
}

function renderStatusPageLayout(order) {
    const mainContainer = document.querySelector('.dashboard-content');
    if (!mainContainer) return;

    // List of stepper steps
    const steps = [
        { label: "Pesanan Dibuat", desc: "Pesanan terdaftar" },
        { label: "Pembayaran", desc: "Verifikasi dana" },
        { label: "Diproses/Desain", desc: "Tim mengerjakan" },
        { label: "Quality Control", desc: "Validasi cetak" },
        { label: "Pengiriman PNG", desc: "Siap diunduh" },
        { label: "Selesai", desc: "Momen diabadikan" }
    ];

    mainContainer.style.maxWidth = '1000px';
    mainContainer.style.margin = '40px auto';
    mainContainer.innerHTML = `
        <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
            <a href="pesanan.html" style="color: var(--primary-color); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-arrow-left"></i> Kembali ke Daftar Pesanan
            </a>
            <div style="display:flex; gap:10px;">
                <button type="button" class="btn-action btn-outline" id="btn-manual-advance" style="background-color:rgba(181, 97, 51, 0.1); color:var(--primary-color); border:1px solid var(--primary-color);">
                    <i class="fas fa-forward"></i> Majukan Tahap (Demo)
                </button>
            </div>
        </div>

        <div class="page-header-small">
            <h2 style="font-size:1.8rem;">Status Detail Pesanan #${order.id}</h2>
            <p>Dibuat pada ${order.date} &bull; Paket ${order.packageName}</p>
        </div>

        <!-- 1. Stepper Progress Grid -->
        <div class="stepper-progress-wrapper" style="margin: 40px 0; background: var(--white); padding: 30px; border-radius: 20px; box-shadow: 0 5px 25px rgba(0,0,0,0.02);">
            <div class="stepper-timeline">
                <div class="stepper-line" style="width: ${((order.statusStep) / 5) * 100}%;"></div>
                <div class="stepper-nodes">
                    ${steps.map((step, idx) => {
                        let nodeClass = '';
                        if (idx < order.statusStep) nodeClass = 'completed';
                        else if (idx === order.statusStep) nodeClass = 'active';
                        
                        return `
                            <div class="step-node ${nodeClass}">
                                <div class="step-circle">${idx < order.statusStep ? '<i class="fas fa-check"></i>' : idx + 1}</div>
                                <span class="step-label">${step.label}</span>
                                <span class="step-desc">${step.desc}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- 2. Dual Column Layout: Preview and Logs -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-top:30px;" class="status-layout-grid">
            <!-- Left: Frame design and Download action -->
            <div style="background:var(--white); padding:25px; border-radius:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 5px 25px rgba(0,0,0,0.02);">
                <div style="margin-bottom:20px; font-weight:600; font-size:1.1rem; color:var(--text-dark);">
                    Visual Frame Foto Digital Anda
                </div>
                
                <div id="live-frame-preview" class="live-frame-preview size-${order.size} design-${order.frameId}" style="--frame-color: ${order.color}; --frame-text-color: ${order.color === '#ffffff' ? 'var(--text-dark)' : 'var(--white)'}; font-family: ${order.font}; width: 100%; height: auto; min-height: 400px; transform: scale(0.9); transform-origin: top center; margin-bottom: -40px;">
                    <div class="frame-border-outer">
                        <div class="frame-border-inner">
                            <div class="photo-slots-grid slots-count-${order.photos.length}">
                                ${order.photos.map((photo, i) => `
                                    <div class="photo-slot-item">
                                        ${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover;">` : `<div class="slot-placeholder"><i class="fas fa-image"></i></div>`}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="frame-decorations ${designTemplates[order.frameId]?.overlayType || 'wisuda'}">
                                ${getSVGDecorations(designTemplates[order.frameId]?.overlayType || 'wisuda')}
                            </div>
                            <div class="text-overlay-container">
                                <div class="overlay-text overlay-name">${order.texts.name}</div>
                                <div class="overlay-text overlay-campus">${order.texts.campus}</div>
                                <div class="overlay-text overlay-date">${order.texts.date}</div>
                                <div class="overlay-text overlay-quote">"${order.texts.quote}"</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="width:100%; margin-top:20px;" id="download-button-wrapper">
                    ${order.statusStep >= 4 ? `
                        <button type="button" class="btn-primary" id="btn-download-frame-png" style="width:100%; justify-content:center; padding:15px 0;">
                            <i class="fas fa-download"></i> Unduh Hasil PNG Resolusi Tinggi
                        </button>
                    ` : `
                        <div style="background: #f7f9fc; padding: 15px; border-radius: 8px; text-align:center; color: var(--text-light); font-size:0.9rem; border:1px dashed #ddd;">
                            <i class="fas fa-lock" style="margin-right:8px;"></i> Download PNG akan terbuka ketika status mencapai <strong>Pengiriman PNG</strong>
                        </div>
                    `}
                </div>
            </div>

            <!-- Right: Logs History & Details -->
            <div style="background:var(--white); padding:25px; border-radius:20px; box-shadow: 0 5px 25px rgba(0,0,0,0.02); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="font-weight:600; margin-bottom:20px; font-size:1.2rem;">Riwayat Aktivitas</h3>
                    <div class="stepper-log-list" style="display:flex; flex-direction:column; gap:20px; border-left:2px solid #eaeaea; padding-left:20px; margin-left:10px;">
                        ${order.statusHistory.map(log => `
                            <div style="position:relative;">
                                <span style="position:absolute; left:-27px; top:4px; width:12px; height:12px; border-radius:50%; background-color:var(--primary-color); border:3px solid var(--white);"></span>
                                <div style="font-weight:600; font-size:0.95rem;">${log.step}</div>
                                <div style="font-size:0.8rem; color:var(--text-light);">${log.time}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="border-top:1px solid var(--border-color); padding-top:20px; margin-top:20px;">
                    <h4 style="font-weight:600; font-size:0.95rem; margin-bottom:10px;">Informasi Teks</h4>
                    <ul style="font-size:0.85rem; color:var(--text-light); display:flex; flex-direction:column; gap:5px;">
                        <li><strong>Nama:</strong> ${order.texts.name}</li>
                        <li><strong>Jurusan/Kampus:</strong> ${order.texts.campus}</li>
                        <li><strong>Tanggal:</strong> ${order.texts.date}</li>
                        <li><strong>Quotes:</strong> "${order.texts.quote}"</li>
                    </ul>
                </div>

                <div style="border-top:1px solid var(--border-color); padding-top:20px; margin-top:10px;">
                    <h4 style="font-weight:600; font-size:0.95rem; margin-bottom:10px;">Data Pemesan</h4>
                    <ul style="font-size:0.85rem; color:var(--text-light); display:flex; flex-direction:column; gap:5px;">
                        <li><strong>Nama Pemesan:</strong> ${order.customerName || 'User'}</li>
                        <li><strong>No. WhatsApp:</strong> ${order.customerPhone || '081234567890'}</li>
                        <li><strong>Email Kirim:</strong> ${order.customerEmail || 'user@example.com'}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function bindStatusEvents(order) {
    // 1. Manual stage advancement button (Demo Mode)
    const manualBtn = document.getElementById('btn-manual-advance');
    if (manualBtn) {
        manualBtn.addEventListener('click', () => {
            advanceStepperOrder(order);
        });
    }

    // 2. Download PNG Action
    // Set listener on body to capture dynamically rendered button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'btn-download-frame-png') {
            downloadFrameAsPNG(order);
        }
    });
}

function startStepperSimulation(order) {
    // Clear any previous running timers
    if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
    }

    if (order.statusStep < 5) {
        autoAdvanceTimer = setInterval(() => {
            advanceStepperOrder(order);
        }, 10000); // 10 seconds interval
    }
}

function advanceStepperOrder(order) {
    if (order.statusStep >= 5) {
        clearInterval(autoAdvanceTimer);
        return;
    }

    const steps = [
        "Pesanan Dibuat",
        "Pembayaran Berhasil",
        "Diproses/Desain",
        "Quality Control",
        "Pengiriman PNG",
        "Selesai"
    ];

    const nextStepIdx = order.statusStep + 1;
    order.statusStep = nextStepIdx;

    // Update status string mapped to table badges
    if (nextStepIdx >= 5) {
        order.status = 'done';
    } else if (nextStepIdx === 4) {
        order.status = 'shipping'; // shipping / dikirim
    } else if (nextStepIdx >= 2) {
        order.status = 'process'; // diproses
    }

    // Add log history entry
    order.statusHistory.push({
        step: steps[nextStepIdx],
        time: getCurrentTimeString()
    });

    // Save updated order database
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
        orders[index] = order;
        saveOrders(orders);
    }

    // Trigger Notification logs
    if (nextStepIdx === 4) {
        addNotification(order.id, "Pengiriman PNG Siap", `Hasil desain frame untuk pesanan #${order.id} siap diunduh! Silakan unduh file PNG.`);
    } else if (nextStepIdx === 5) {
        addNotification(order.id, "Pesanan Selesai", `Pesanan #${order.id} telah diselesaikan. Terima kasih telah menggunakan FrameYuk!`);
    } else {
        addNotification(order.id, steps[nextStepIdx], `Pesanan #${order.id} sekarang berada di tahap: ${steps[nextStepIdx]}.`);
    }

    // Re-render UI page state
    renderStatusPageLayout(order);

    // Stop auto-timer if just finished
    if (nextStepIdx === 5) {
        clearInterval(autoAdvanceTimer);
    }
}

function downloadFrameAsPNG(order) {
    const previewContainer = document.getElementById('live-frame-preview');
    if (!previewContainer) return;

    // Show processing indicator
    const btn = document.getElementById('btn-download-frame-png');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Merender berkas PNG...`;
    btn.disabled = true;

    // Verify if html2canvas is loaded. If not, load it dynamically.
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => {
            renderAndSaveCanvas(previewContainer, order, btn, originalText);
        };
        document.head.appendChild(script);
    } else {
        renderAndSaveCanvas(previewContainer, order, btn, originalText);
    }
}

function renderAndSaveCanvas(element, order, btn, originalText) {
    // Set canvas options for high quality rendering
    const options = {
        backgroundColor: null, // transparent where applicable
        scale: 2, // 2x resolution for HD
        useCORS: true, // allow external image urls if loaded
        allowTaint: true
    };

    html2canvas(element, options).then(canvas => {
        // Trigger file download
        const imageURI = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `FrameYuk_${order.id}_${order.size}.png`;
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset button state
        btn.innerHTML = `<i class="fas fa-check"></i> Berhasil Diunduh!`;
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }).catch(err => {
        console.error("Canvas render error: ", err);
        alert("Gagal merender file PNG. Pastikan browser Anda mendukung HTML5 canvas.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// ==========================================
// 12. NOTIFIKASI PAGE (notifikasi.html)
// ==========================================
function initNotifikasiPage() {
    const notifs = getNotifications();
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    if (notifs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:var(--text-light); background:#fff; border-radius:20px; box-shadow:0 5px 25px rgba(0,0,0,0.02);">
                <i class="fas fa-bell-slash" style="font-size:3rem; color:#ccc; margin-bottom:20px;"></i>
                <p>Tidak ada notifikasi aktivitas baru.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notifs.map(n => `
        <div class="notification-card ${n.read ? 'read' : 'unread'}" onclick="markNotifRead('${n.id}', '${n.orderId}')" style="background:${n.read ? '#fff' : 'rgba(181, 97, 51, 0.04)'}; border-left: 4px solid ${n.read ? '#eaeaea' : 'var(--primary-color)'}; padding:20px; border-radius:12px; margin-bottom:15px; box-shadow:0 3px 15px rgba(0,0,0,0.01); display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:all 0.2s;">
            <div>
                <div style="font-weight:600; font-size:1.05rem; color:var(--text-dark); margin-bottom:5px;">
                    ${n.title}
                </div>
                <div style="font-size:0.9rem; color:var(--text-light); margin-bottom:8px;">
                    ${n.message}
                </div>
                <div style="font-size:0.75rem; color:#999;">
                    <i class="fas fa-clock" style="margin-right:5px;"></i>${n.time}
                </div>
            </div>
            <div style="color:var(--primary-color); font-size:0.9rem; font-weight:600;">
                Cek Detail <i class="fas fa-chevron-right" style="margin-left:5px;"></i>
            </div>
        </div>
    `).join('');
}

window.markNotifRead = function(notifId, orderId) {
    const notifs = getNotifications();
    const index = notifs.findIndex(n => n.id === notifId);
    if (index !== -1) {
        notifs[index].read = true;
        saveNotifications(notifs);
    }
    window.location.href = `status.html?id=${orderId}`;
};

// ==========================================
// 13. DUMMY PROFILE PAGE INITIALIZATION (profil.html)
// ==========================================
function initProfilePage() {
    const user = getLoggedInUser();
    if (!user) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    const avatarContainer = document.getElementById('profile-avatar-container');
    const avatarInput = document.getElementById('profile-pic-input');
    const changeAvatarBtn = document.getElementById('btn-change-avatar');

    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone;
    if (dobInput) dobInput.value = user.dob;
    
    if (user.avatar && avatarContainer) {
        avatarContainer.innerHTML = `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }

    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64 = event.target.result;
                    user.avatar = base64;
                    saveLoggedInUser(user);
                    
                    if (avatarContainer) {
                        avatarContainer.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    }
                    updateHeaderUserInfo();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const form = document.getElementById('profileForm');
    if (form) {
        form.onsubmit = function(event) {
            event.preventDefault();
            user.name = nameInput.value;
            user.email = emailInput.value;
            user.phone = phoneInput.value;
            user.dob = dobInput.value;
            saveLoggedInUser(user);
            updateHeaderUserInfo();
            alert('Profil berhasil diperbarui!');
        };
    }
}
