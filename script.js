const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const addCartButtons = document.querySelectorAll('.add-cart');
const orderForm = document.getElementById('orderForm');
const paymentMethod = document.getElementById('paymentMethod');
const cartPanel = document.getElementById('cartPanel');
const cartItemsList = document.getElementById('cartItemsList');
const cartEmpty = document.getElementById('cartEmpty');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');
const completeOrder = document.getElementById('completeOrder');
const cart = new Map();

const categoryTabs = document.querySelectorAll('.category-tab');
const catalogItems = document.querySelectorAll('.showcase-card');

function setCategory(category) {
  categoryTabs.forEach((tab) => {
    const isActive = tab.dataset.category === category;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });

  catalogItems.forEach((item) => {
    const isVisible = item.dataset.category === category;
    item.hidden = !isVisible;
  });
}

function updatePaymentFields() {
  if (!paymentMethod) return;
}

categoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => setCategory(tab.dataset.category));
});

paymentMethod?.addEventListener('change', updatePaymentFields);

setCategory('bebidas');
updatePaymentFields();

menuToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

addCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.product-card, .showcase-card');
    if (!card) return;

    const productName = button.getAttribute('data-product');
    const image = card.querySelector('img');
    const priceText = card.querySelector('.price, .showcase-price')?.textContent.trim() || 'Q0';
    const prices = priceText.match(/[0-9]+(?:\.[0-9]+)?/g) || [];
    const price = Number.parseFloat(prices.at(-1)) || 0;
    const key = `${productName}|${image?.getAttribute('src') || ''}|${price}`;
    const existingItem = cart.get(key);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.set(key, {
        name: productName,
        image: image?.getAttribute('src') || '',
        alt: image?.getAttribute('alt') || productName,
        price,
        priceText,
        quantity: 1
      });
    }

    renderCart();
    cartPanel.hidden = false;
  });
});

cartButton?.addEventListener('click', () => {
  cartPanel.hidden = false;
});

document.querySelectorAll('[data-cart-close]').forEach((closeButton) => {
  closeButton.addEventListener('click', () => {
    cartPanel.hidden = true;
  });
});

completeOrder?.addEventListener('click', () => {
  cartPanel.hidden = true;
  document.getElementById('pedidos')?.scrollIntoView({ behavior: 'smooth' });
});

function renderCart() {
  const items = [...cart.entries()];
  const totalItems = items.reduce((total, [, item]) => total + item.quantity, 0);
  cartCount.textContent = String(totalItems);
  cartItemsList.innerHTML = '';

  items.forEach(([key, item]) => {
    const cartItem = document.createElement('article');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.alt}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <span>${item.priceText}</span>
      </div>
      <div class="cart-quantity">
        <button type="button" data-action="decrease" aria-label="Disminuir cantidad">-</button>
        <input type="number" min="1" value="${item.quantity}" aria-label="Cantidad de ${item.name}">
        <button type="button" data-action="increase" aria-label="Aumentar cantidad">+</button>
      </div>`;

    const quantityInput = cartItem.querySelector('input');
    cartItem.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      item.quantity -= 1;
      if (item.quantity <= 0) cart.delete(key);
      renderCart();
    });
    cartItem.querySelector('[data-action="increase"]').addEventListener('click', () => {
      item.quantity += 1;
      renderCart();
    });
    quantityInput.addEventListener('change', () => {
      item.quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
      renderCart();
    });
    cartItemsList.appendChild(cartItem);
  });

  const total = items.reduce((sum, [, item]) => sum + item.price * item.quantity, 0);
  cartEmpty.hidden = items.length > 0;
  cartSummary.hidden = items.length === 0;
  cartTotal.textContent = `Q${total.toFixed(2).replace('.00', '')}`;
}

renderCart();

orderForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    alert('No es posible enviar el pedido porque no has agregado ningún producto al carrito.');
    return;
  }

  const name = document.getElementById('orderName').value;
  const phone = document.getElementById('orderPhone').value;
  const address = document.getElementById('orderAddress').value;
  const paymentType = document.getElementById('paymentMethod').value;

  if (!name || !phone || !address || !paymentType) {
    alert('Por favor completa todos los campos del pedido y selecciona un método de pago.');
    return;
  }

  const paymentSummary = `Método de pago: ${paymentType === 'card' ? 'Con tarjeta' : 'En efectivo'}`;

  const isOrderConfirmed = confirm('¿Estás seguro de realizar esta orden?');
  if (!isOrderConfirmed) return;

  alert(`¡Pedido enviado!\n\nSu orden de pedido es: #${Date.now()}\n\nCliente: ${name}\nTeléfono: ${phone}\nDirección: ${address}\n\n${paymentSummary}`);
  orderForm.reset();
  updatePaymentFields();
});
