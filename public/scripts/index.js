// Inisialisasi dashboard untuk admin
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('username-display').textContent = 'Pengguna: ' + currentUser.username;
    renderSidebar('admin');
    showTab('home');
    initChart();
});

// Fungsi untuk menampilkan tab
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.sidebar ul li a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('.tabs span').forEach(tab => {
        tab.classList.remove('active-tab');
    });

    const tabContent = document.getElementById(tabName + '-content');
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    const tabLink = document.querySelector(`a[onclick="showTab('${tabName}')"]`);
    if (tabLink) {
        tabLink.classList.add('active');
    }

    if (tabName === 'monitoring') {
        updateChart();
    }
}
