document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput');

  // 👁️ Toggle lihat/sembunyi password
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPasswordHidden = passwordInput.type === 'password';

      if (isPasswordHidden) {
        passwordInput.type = 'text';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye'); // Mata terbuka = terlihat
      } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash'); // Mata tertutup = disembunyikan
      }
    });
  }

  // 🔐 Proses login saat form disubmit
  async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('https://dragonmontainapi.com/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const text = await response.text();
      console.log("Respons dari API:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        alert("Format data tidak valid dari server.");
        return;
      }

      if (result.kode === 200) {
        const userData = result.data;
        localStorage.setItem('user_email', userData.email);
        localStorage.setItem('user_name', userData.nama);
        localStorage.setItem('user_id', userData.id);

        let role = 'user';
        if (email === 'opetest@gmail.com' && password === 'Asdf@1') {
          role = 'admin';
        } else if (userData.kategori === 1) {
          role = 'pimpinan';
        }

        localStorage.setItem('user_role', role);
        alert(`Login berhasil sebagai ${role}.`);

        if (role === 'admin') {
          window.location.href = 'admin.html';
        } else if (role === 'pimpinan') {
          window.location.href = 'pimpinan.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      } else {
        alert(result.message || 'Login gagal.');
      }

    } catch (err) {
      console.error('Login error:', err);
      alert('Terjadi kesalahan saat login.');
    }
  }

  // Tambahkan event listener untuk form
  const form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  } else {
    console.error('Form login tidak ditemukan.');
  }
});
