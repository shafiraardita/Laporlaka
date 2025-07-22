document.addEventListener('DOMContentLoaded', () => {
  // Initialize validCredentials in localStorage if not already set
  if (!localStorage.getItem('validCredentials')) {
    const initialCredentials = [
      { username: 'admin', password: 'admin123', email: 'admin@laporlaka.com', phone: '081234567890' },
      { username: 'pimpinan', password: 'p123', email: 'pimpinan@laporlaka.com', phone: '089639358118' }
    ];
    localStorage.setItem('validCredentials', JSON.stringify(initialCredentials));
  }

  function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('passwordInput').value;

    let validCredentials;
    try {
      validCredentials = JSON.parse(localStorage.getItem('validCredentials')) || [];
    } catch (e) {
      console.error('Error parsing localStorage credentials:', e);
      alert('Terjadi kesalahan saat memuat data kredensial. Mengatur ulang kredensial.');
      const initialCredentials = [
        { username: 'admin', password: 'admin123', email: 'admin@laporlaka.com', phone: '081234567890' },
        { username: 'pimpinan', password: 'p123', email: 'pimpinan@laporlaka.com', phone: '089639358118' }
      ];
      localStorage.setItem('validCredentials', JSON.stringify(initialCredentials));
      validCredentials = initialCredentials;
    }

    const isValid = validCredentials.some(cred =>
      cred.username === username && cred.password === password
    );

    if (isValid) {
      if (username === 'admin') {
        alert('Login berhasil, Selamat datang Admin!');
        window.location.href = `admin.html?user=${username}`;
      } else if (username === 'pimpinan') {
        alert('Login berhasil, Selamat datang Pimpinan!');
        window.location.href = `pimpinan.html?user=${username}`;
      }
    } else {
      alert('Username atau password salah.');
    }
  }

  const passwordInput = document.getElementById('passwordInput');
  const toggleBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');

  if (passwordInput && toggleBtn && eyeIcon) {
    const eyeOpen = `
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    `;

    const eyeClosed = `
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8
              a21.51 21.51 0 0 1 5.17-5.94"/>
      <path d="M1 1l22 22"/>
      <path d="M9.53 9.53a3.5 3.5 0 0 0 4.95 4.95"/>
    `;

    toggleBtn.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      eyeIcon.innerHTML = isHidden ? eyeOpen : eyeClosed;
    });
  } else {
    console.error('One or more elements (passwordInput, toggleBtn, eyeIcon) not found.');
  }

  if (document.referrer === '') {
    history.replaceState(null, '', 'index.html');
    history.pushState(null, '', 'login.html');
  }

  window.addEventListener('popstate', function () {
    window.location.href = 'index.html';
  });

  const form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  } else {
    console.error('Form with class "login-form" not found.');
  }
});