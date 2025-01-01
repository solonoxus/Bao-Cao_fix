function processVNPayPayment(orderId) {
    // Hiển thị loading
    showLoading();
    
    // Gọi API tạo URL thanh toán
    fetch('/create_payment_url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId: orderId,
            bankCode: '',
            language: 'vn'
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.code === '00') {
            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = data.data;
        } else {
            hideLoading();
            alert('Có lỗi xảy ra khi tạo thanh toán!');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tạo thanh toán!');
    });
}

function showLoading() {
    // Thêm overlay loading nếu cần
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}
