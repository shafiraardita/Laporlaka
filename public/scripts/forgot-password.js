document.addEventListener('DOMContentLoaded', () => {
  // Initialize validCredentials in localStorage if not already set
  if (!localStorage.getItem('validCredentials')) {
    const initialCredentials = [
      { username: 'admin', password: 'admin123', email: 'admin@gmail.com', phone: '081234567890' },
      { username: 'pimpinan', password: 'p123', email: 'pimpinan@.com', phone: '089639358118' }
    ];
    localStorage.setItem('validCredentials', JSON.stringify(initialCredentials));
  }

  function handlePasswordReset(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const newPassword = document.getElementById('newPassword').value;

    // Retrieve credentials from localStorage
    let validCredentials = JSON.parse(localStorage.getItem('validCredentials'));

    const user = validCredentials.find(cred =>
      cred.email === email && cred.phone === phone
    );

    if (user) {
      // Update password in the found user object
      user.password = newPassword;
      // Save updated credentials back to localStorage
      localStorage.setItem('validCredentials', JSON.stringify(validCredentials));
      alert('Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru.');
      window.location.href = 'login.html';
    } else {
      alert('Email atau nomor telepon tidak ditemukan.');
    }
  }

  const passwordInput = document.getElementById('newPassword');
  const toggleBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');

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

  // Attach the submit event listener to the form
  const form = document.querySelector('.forgot-password-form');
  form.addEventListener('submit', handlePasswordReset);
});