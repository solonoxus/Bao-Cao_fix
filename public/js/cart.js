// Cart functionality
$(document).ready(function() {
    // Function to update product quantity
    function updateQuantity(productId, quantity, maxQuantity) {
        // Kiểm tra số lượng tồn kho
        if (quantity > maxQuantity) {
            alert('Số lượng vuien quá tồn kho! Tối đa: ' + maxQuantity);
            return false;
        }

        $.ajax({
            url: '/updatecart',
            method: 'POST',
            data: {
                productId: productId,
                productQuantity: quantity
            },
            success: function(response) {
                if (response.success) {
                    // Cập nhật giá tiền của sản phẩm
                    const price = parseFloat($('#price-' + productId).data('price'));
                    const newTotal = price * quantity;
                    $('#total-' + productId).text('$' + newTotal.toFixed(2));
                    
                    // Cập nhật tổng tiền
                    updateTotalPrice();
                } else {
                    window.location.reload();
                }
            },
            error: function(error) {
                console.error('Error updating quantity:', error);
            }
        });
    }

    // Function to remove product from cart
    window.removeFromCart = function(productId) {
        $.ajax({
            url: '/removecartproduct',
            method: 'POST',
            data: { productId: productId },
            success: function(response) {
                if (response.success) {
                    // Xóa dòng sản phẩm khỏi bảng
                    $(`tr[data-product-id="${productId}"]`).remove();
                    
                    // Kiểm tra nếu không còn sản phẩm nào
                    if ($('.table_row').length === 0) {
                        $('.wrap-table-shopping-cart').html(
                            '<div class="empty-cart-message">Giỏ hàng trống</div>'
                        );
                    }
                    
                    // Cập nhật tổng tiền
                    updateTotalPrice();
                }
            },
            error: function(error) {
                console.error('Error removing product:', error);
            }
        });
    };

    // Event handlers for quantity buttons
    $('.btn-num-product-up').click(function() {
        const input = $(this).siblings('.num-product');
        const productId = $(this).siblings('input[name="productId"]').val();
        const maxQuantity = parseInt(input.data('max-quantity'));
        const newVal = parseInt(input.val()) + 1;
        
        if (updateQuantity(productId, newVal, maxQuantity) !== false) {
            input.val(newVal);
        }
    });

    $('.btn-num-product-down').click(function() {
        const input = $(this).siblings('.num-product');
        const productId = $(this).siblings('input[name="productId"]').val();
        const maxQuantity = parseInt(input.data('max-quantity'));
        const newVal = Math.max(1, parseInt(input.val()) - 1);
        
        if (updateQuantity(productId, newVal, maxQuantity) !== false) {
            input.val(newVal);
        }
    });

    // Handle direct input changes
    $('.num-product').on('input', function() {
        const input = $(this);
        let val = parseInt(input.val()) || 0;
        const maxQuantity = parseInt(input.data('max-quantity'));
        const productId = input.siblings('input[name="productId"]').val();

        // Đảm bảo giá trị nằm trong khoảng cho phép
        if (val < 1) val = 1;
        if (val > maxQuantity) {
            val = maxQuantity;
            alert('Số lượng vượt quá tồn kho! Tối đa: ' + maxQuantity);
        }

        // Cập nhật giá trị vào input
        input.val(val);
        
        // Cập nhật server và UI
        updateQuantity(productId, val, maxQuantity);
    });

    // Khi blur khỏi input, đảm bảo giá trị hợp lệ
    $('.num-product').on('blur', function() {
        const input = $(this);
        let val = parseInt(input.val()) || 1;
        input.val(val);
    });

    // Update total price
    function updateTotalPrice() {
        let total = 0;
        $('.total-prod:visible').each(function() {
            if ($(this).closest('tr').find('.product-checkbox').prop('checked')) {
                const price = parseFloat($(this).text().replace('$', '')) || 0;
                total += price;
            }
        });
        $('#sumPrice').text('$' + total.toFixed(2));
    }

    // Update total when checkboxes change
    $('.product-checkbox').change(function() {
        updateTotalPrice();
    });

    // Initial total price update
    updateTotalPrice();
});
