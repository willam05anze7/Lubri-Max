let carrito = [];
let totalCarrito = 0;

document.addEventListener('DOMContentLoaded', function() {
    cargarCarrito();
    actualizarContadorCarrito();
    configurarEventListeners();
});

function configurarEventListeners() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtro-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const categoria = this.getAttribute('data-categoria');
            filtrarProductos(categoria);
        });
    });
    
    document.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            agregarAlCarrito(id);
        });
    });
    
    const contactoForm = document.getElementById('contactoForm');
    if (contactoForm) {
        contactoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nombre = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const mensaje = this.querySelector('textarea').value;
            
            if (nombre && email && mensaje) {
                alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
                this.reset();
            } else {
                alert('Por favor, completa todos los campos obligatorios.');
            }
        });
    }
    
    const carritoIcon = document.querySelector('.carrito-icon a');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    
    if (carritoIcon && carritoModal) {
        carritoIcon.addEventListener('click', (e) => {
            e.preventDefault();
            carritoModal.classList.add('active');
            renderizarCarrito();
        });
    }
    
    if (cerrarCarrito && carritoModal) {
        cerrarCarrito.addEventListener('click', () => {
            carritoModal.classList.remove('active');
        });
    }
    
    carritoModal?.addEventListener('click', (e) => {
        if (e.target === carritoModal) {
            carritoModal.classList.remove('active');
        }
    });
}

function filtrarProductos(categoria) {
    const productos = document.querySelectorAll('.producto-card');
    
    productos.forEach(producto => {
        const productoCat = producto.getAttribute('data-categoria');
        
        if (categoria === 'todos' || productoCat === categoria) {
            producto.style.display = 'block';
            setTimeout(() => {
                producto.style.opacity = '1';
                producto.style.transform = 'translateY(0)';
            }, 10);
        } else {
            producto.style.opacity = '0';
            producto.style.transform = 'translateY(20px)';
            setTimeout(() => {
                producto.style.display = 'none';
            }, 300);
        }
    });
}
function agregarAlCarrito(id) {
    const productoElement = document.querySelector(`.btn-agregar[data-id="${id}"]`).closest('.producto-card');
    const nombre = productoElement.querySelector('h3').textContent;
    const precioTexto = productoElement.querySelector('.precio').textContent;
    const precio = parseFloat(precioTexto.replace('$', ''));
    
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    const btn = productoElement.querySelector('.btn-agregar');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
    btn.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 1500);
}
function renderizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const carritoTotal = document.getElementById('carritoTotal');
    
    if (!carritoItems) return;
    
    carritoItems.innerHTML = '';
    totalCarrito = 0;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        carritoTotal.textContent = '$0.00';
        return;
    }
    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        totalCarrito += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'carrito-item';
        itemElement.innerHTML = `
            <div class="carrito-item-info">
                <h4>${item.nombre}</h4>
                <p class="carrito-item-precio">$${item.precio.toFixed(2)}</p>
            </div>
            <div class="carrito-item-cantidad">
                <button onclick="modificarCantidad('${item.id}', -1)">-</button>
                <span>${item.cantidad}</span>
                <button onclick="modificarCantidad('${item.id}', 1)">+</button>
            </div>
            <div class="carrito-item-total">
                $${itemTotal.toFixed(2)}
            </div>
        `;
        
        carritoItems.appendChild(itemElement);
    });
    
    carritoTotal.textContent = `$${totalCarrito.toFixed(2)}`;
}
function modificarCantidad(id, cambio) {
    const itemIndex = carrito.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        carrito[itemIndex].cantidad += cambio;
        
        if (carrito[itemIndex].cantidad <= 0) {
            carrito.splice(itemIndex, 1);
        }
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('carritoContador');
    if (!contador) return;
    
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalItems;
    
    if (totalItems > 0) {
        contador.style.display = 'flex';
    } else {
        contador.style.display = 'none';
    }
}

function guardarCarrito() {
    localStorage.setItem('carritoLubriMax', JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carritoLubriMax');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
}

function suscribirNewsletter() {
    const emailInput = document.querySelector('.newsletter input');
    const email = emailInput.value;
    
    if (email && validarEmail(email)) {
        alert('¡Gracias por suscribirte a nuestro newsletter!');
        emailInput.value = '';
    } else {
        alert('Por favor, ingresa un email válido.');
    }
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
    const btnSuscribir = document.querySelector('.newsletter .btn');
    if (btnSuscribir) {
        btnSuscribir.addEventListener('click', suscribirNewsletter);
    }
});