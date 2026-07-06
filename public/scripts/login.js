document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput');

  // Toggle lihat/sembunyikan password
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';

      togglePassword.classList.toggle('fa-eye', isHidden);
      togglePassword.classList.toggle('fa-eye-slash', !isHidden);
    });
  }

  // Proses Login Lokal
  function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    // ==========================
    // LOGIN ADMIN
    // ==========================
    if (email === 'admin@gmail.com' && password === 'Admin123') {

      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', 'Administrator');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'admin');

      alert('Login berhasil sebagai Admin');
      window.location.href = 'admin.html';
      return;
    }

    // ==========================
    // LOGIN PIMPINAN
    // ==========================
    if (email === 'pimpinan@gmail.com' && password === 'P123456') {

      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', 'Pimpinan');
      localStorage.setItem('user_id', '2');
      localStorage.setItem('user_role', 'pimpinan');

      alert('Login berhasil sebagai Pimpinan');
      window.location.href = 'pimpinan.html';
      return;
    }

    // Jika tidak sesuai
    alert('Email atau password salah!');
  }

  // Event Form Login
  const form = document.querySelector('.login-form');

  if (form) {
    form.addEventListener('submit', handleLogin);
  } else {
    console.error('Form login tidak ditemukan.');
  }
});