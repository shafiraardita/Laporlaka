document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput');

  // 👁️ Toggle lihat/sembunyi password
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPasswordHidden = passwordInput.type === 'password';
      passwordInput.type = isPasswordHidden ? 'text' : 'password';
      togglePassword.classList.toggle('fa-eye', isPasswordHidden);
      togglePassword.classList.toggle('fa-eye-slash', !isPasswordHidden);
    });
  }

  // 🔐 Proses login
  async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    // ✅ Login lokal admin
    if (email === 'opetest@gmail.com' && password === 'Asdf@1') {
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', 'Operator test');
      localStorage.setItem('user_id', '2');
      localStorage.setItem('user_role', 'admin');
      alert('Login berhasil sebagai admin.');
      window.location.href = 'admin.html';
      return;
    }

    // ✅ Login lokal pimpinan
    if (email === 'pimpinan@gmail.com' && password === 'Pimpinan@1') {
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', 'Pimpinan');
      localStorage.setItem('user_id', '99');
      localStorage.setItem('user_role', 'pimpinan');
      alert('Login berhasil sebagai pimpinan.');
      window.location.href = 'pimpinan.html';
      return;
    }

    // 🔄 Kalau tidak cocok dengan akun lokal, cek API
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
        if (userData.kategori === 0) {
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

  // Event listener untuk form login
  const form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  } else {
    console.error('Form login tidak ditemukan.');
  }
});
