document.addEventListener('DOMContentLoaded', function() {
    // Ambil nama user yang tersimpan atau gunakan default 'User'
    const userName = localStorage.getItem('profile_name') || 'User';
    const savedAvatar = localStorage.getItem('profile_avatar');

    // 1. Check Login Status and Update Navbar (khusus untuk index.html / Landing Page)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const btnSignin = document.querySelector('.btn-signin');
    const navbar = document.querySelector('.navbar');

    if (isLoggedIn && btnSignin && navbar) {
        // Ganti tombol "Sign In" dengan dropdown User di landing page
        const userProfileHTML = `
            <div class="user-profile">
                <div class="user-info" style="color: var(--white); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    ${savedAvatar ? `<img src="${savedAvatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">` : '<i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>'}
                    <span>Halo, ${userName}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="user-dropdown" style="margin-top: 15px;">
                    <ul>
                        <li><a href="profil.html"><i class="fas fa-user"></i> Profil</a></li>
                        <li><a href="pesanan.html"><i class="fas fa-shopping-bag"></i> Pesanan Saya</a></li>
                        <li><a href="#"><i class="fas fa-cog"></i> Pengaturan</a></li>
                        <li><a href="#" class="text-danger" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
                    </ul>
                </div>
            </div>
        `;
        btnSignin.outerHTML = userProfileHTML;
    }

    // Update teks nama dan avatar di header secara global untuk halaman lain
    const profileSpans = document.querySelectorAll('.user-info span');
    profileSpans.forEach(span => {
        span.textContent = `Halo, ${userName}`;
    });

    if (savedAvatar) {
        const userInfos = document.querySelectorAll('.user-info');
        userInfos.forEach(info => {
            const icon = info.querySelector('i.fa-user-circle');
            if (icon) {
                const img = document.createElement('img');
                img.src = savedAvatar;
                img.style.width = '30px';
                img.style.height = '30px';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                icon.parentNode.replaceChild(img, icon);
            } else {
                const existingImg = info.querySelector('img:not(.logo-img)');
                if (existingImg) {
                    existingImg.src = savedAvatar;
                }
            }
        });
    }

    // 2. Profile Dropdown Click Logic (Tutup/Buka Dropdown)
    document.addEventListener('click', function(e) {
        const userProfile = e.target.closest('.user-profile');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userProfile && userDropdown) {
            // Jika yang diklik adalah link/tombol di dalam dropdown, biarkan navigasi berjalan
            if (e.target.closest('.user-dropdown')) {
                return;
            }
            
            // Toggle dropdown jika mengklik area pemicu (user-info)
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        } else {
            // Tutup semua dropdown jika mengklik di luar
            const allDropdowns = document.querySelectorAll('.user-dropdown');
            allDropdowns.forEach(d => d.classList.remove('show'));
        }
    });

    // Handle Logout Click
    document.addEventListener('click', function(e) {
        const logoutBtn = e.target.closest('#logout-btn') || (e.target.closest('.user-dropdown a.text-danger') && e.target.closest('.user-dropdown'));
        if (logoutBtn) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('profile_name'); // Reset profil saat logout
            localStorage.removeItem('profile_avatar');
            localStorage.removeItem('profile_email');
            localStorage.removeItem('profile_phone');
            localStorage.removeItem('profile_dob');
            localStorage.removeItem('order_FY00123_status'); // Reset status order
            localStorage.removeItem('pending_order_active');
            localStorage.removeItem('pending_order_color');
            localStorage.removeItem('pending_order_qty');
            localStorage.removeItem('pending_order_total');
            localStorage.removeItem('pending_order_photos_count');
            window.location.href = 'index.html';
        }
    });

    // 3. Profile Page Initialization & Save Logic (khusus profil.html)
    if (window.location.pathname.includes('profil.html')) {
        // Load data yang tersimpan
        const savedName = localStorage.getItem('profile_name') || 'Ahmad User';
        const savedEmail = localStorage.getItem('profile_email') || 'user@example.com';
        const savedPhone = localStorage.getItem('profile_phone') || '081234567890';
        const savedDob = localStorage.getItem('profile_dob') || '1998-05-15';
        const currentAvatar = localStorage.getItem('profile_avatar');

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const dobInput = document.getElementById('dob');
        const avatarContainer = document.getElementById('profile-avatar-container');
        const avatarInput = document.getElementById('profile-pic-input');
        const changeAvatarBtn = document.getElementById('btn-change-avatar');

        if (nameInput) nameInput.value = savedName;
        if (emailInput) emailInput.value = savedEmail;
        if (phoneInput) phoneInput.value = savedPhone;
        if (dobInput) dobInput.value = savedDob;
        if (currentAvatar && avatarContainer) {
            avatarContainer.innerHTML = `<img src="${currentAvatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }

        // Trigger input file saat tombol "Ubah Foto" diklik
        if (changeAvatarBtn && avatarInput) {
            changeAvatarBtn.addEventListener('click', () => {
                avatarInput.click();
            });

            // Baca file dan simpan ke localStorage
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64 = event.target.result;
                        localStorage.setItem('profile_avatar', base64);
                        
                        // Update visual preview di halaman profil
                        if (avatarContainer) {
                            avatarContainer.innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                        }

                        // Perbarui avatar di header secara instan
                        const userInfos = document.querySelectorAll('.user-info');
                        userInfos.forEach(info => {
                            const icon = info.querySelector('i.fa-user-circle');
                            if (icon) {
                                const img = document.createElement('img');
                                img.src = base64;
                                img.style.width = '30px';
                                img.style.height = '30px';
                                img.style.borderRadius = '50%';
                                img.style.objectFit = 'cover';
                                icon.parentNode.replaceChild(img, icon);
                            } else {
                                const existingImg = info.querySelector('img:not(.logo-img)');
                                if (existingImg) {
                                    existingImg.src = base64;
                                }
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Fungsi Simpan Perubahan (dipanggil oleh form onsubmit)
        window.saveProfile = function(event) {
            event.preventDefault();
            
            const newName = nameInput.value;
            localStorage.setItem('profile_name', newName);
            localStorage.setItem('profile_email', emailInput.value);
            localStorage.setItem('profile_phone', phoneInput.value);
            localStorage.setItem('profile_dob', dobInput.value);
            
            // Perbarui nama di header secara instan
            const spans = document.querySelectorAll('.user-info span');
            spans.forEach(span => {
                span.textContent = `Halo, ${newName}`;
            });

            alert('Profil berhasil diperbarui!');
        };
    }

    // 4. Order Status Simulation & Tab Filtering (Halaman pesanan.html)
    if (window.location.pathname.includes('pesanan.html')) {
        // Tampilkan order baru jika ada dari localStorage (pending_order_active)
        const pendingOrderActive = localStorage.getItem('pending_order_active') === 'true';
        if (pendingOrderActive) {
            const color = localStorage.getItem('pending_order_color') || 'Navy';
            const qty = localStorage.getItem('pending_order_qty') || '1';
            const total = parseInt(localStorage.getItem('pending_order_total')) || 45000;
            const status = localStorage.getItem('order_FY00123_status') || 'unpaid';

            const rows = document.querySelectorAll('.table tbody tr');
            rows.forEach(row => {
                const idCell = row.querySelector('td:first-child');
                if (idCell && idCell.textContent.trim() === '#FY-00123') {
                    // Update data-status attribute agar filtering tab akurat
                    row.setAttribute('data-status', status === 'diproses' ? 'process' : 'unpaid');

                    // Update nama produk dengan warna & kuantitas pilihan
                    const productCell = row.querySelector('td:nth-child(3)');
                    if (productCell) {
                        productCell.textContent = `Frame Wisuda 3 Slot (${color}) x${qty}`;
                    }

                    // Update total harga
                    const totalCell = row.querySelector('td:nth-child(4)');
                    if (totalCell) {
                        totalCell.textContent = `Rp ${total.toLocaleString('id-ID')}`;
                    }

                    // Update Status Badge di layar
                    const statusCell = row.querySelector('td:nth-child(5)');
                    if (statusCell) {
                        if (status === 'diproses') {
                            statusCell.innerHTML = '<span class="status-badge status-process">Diproses</span>';
                        } else {
                            statusCell.innerHTML = '<span class="status-badge status-unpaid">Belum Bayar</span>';
                        }
                    }
                    
                    // Update Button Aksi
                    const actionCell = row.querySelector('td:nth-child(6)');
                    if (actionCell) {
                        if (status === 'diproses') {
                            actionCell.innerHTML = '<button class="btn-action btn-outline">Detail</button>';
                        } else {
                            actionCell.innerHTML = '<a href="pembayaran.html" class="btn-action btn-pay">Bayar</a>';
                        }
                    }
                }
            });
        } else {
            // Simulasi default jika tidak ada order pending baru
            const status = localStorage.getItem('order_FY00123_status');
            if (status === 'diproses') {
                const rows = document.querySelectorAll('.table tbody tr');
                rows.forEach(row => {
                    const idCell = row.querySelector('td:first-child');
                    if (idCell && idCell.textContent.trim() === '#FY-00123') {
                        row.setAttribute('data-status', 'process');
                        const statusCell = row.querySelector('td:nth-child(5)');
                        if (statusCell) statusCell.innerHTML = '<span class="status-badge status-process">Diproses</span>';
                        const actionCell = row.querySelector('td:nth-child(6)');
                        if (actionCell) actionCell.innerHTML = '<button class="btn-action btn-outline">Detail</button>';
                    }
                });
            }
        }

        // Logic Filter Tab Status Pesanan (Semua, Belum Bayar, Diproses, dll)
        const tabBtns = document.querySelectorAll('.tab-btn');
        const orderRows = document.querySelectorAll('.table tbody tr');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Hapus class active dari semua tombol tab
                tabBtns.forEach(b => b.classList.remove('active'));
                // Tambahkan class active ke tombol yang diklik
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // Saring baris tabel
                orderRows.forEach(row => {
                    const rowStatus = row.getAttribute('data-status');
                    if (filterValue === 'all' || rowStatus === filterValue) {
                        row.style.display = ''; // Tampilkan baris
                    } else {
                        row.style.display = 'none'; // Sembunyikan baris
                    }
                });
            });
        });
    }

    // 5. Payment Page Dynamics (Halaman pembayaran.html)
    if (window.location.pathname.includes('pembayaran.html')) {
        const pendingOrderActive = localStorage.getItem('pending_order_active') === 'true';
        if (pendingOrderActive) {
            const total = parseInt(localStorage.getItem('pending_order_total')) || 45000;
            const totalAmountEl = document.querySelector('.total-amount');
            if (totalAmountEl) {
                totalAmountEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
            }
        }
    }
});
