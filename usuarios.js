let usuarioActual = null;
let usuariosRegistrados = [];
let pedidosUsuario = [];
let favoritosUsuario = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    configurarEventListeners();
    verificarSesion();
    cargarPedidosDemo();
    cargarFavoritosDemo();
});

function cargarDatos() {
    const usuariosGuardados = localStorage.getItem('lubrimaxUsuarios');
    if (usuariosGuardados) {
        usuariosRegistrados = JSON.parse(usuariosGuardados);
    } else {
        usuariosRegistrados = [
            {
                id: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'demo@lubrimax.com',
                telefono: '+51 987 654 321',
                password: 'demo123',
                direccion: 'Av. Principal #123, Ciudad',
                fechaRegistro: 'Ene 2024',
                avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=2c3e50&color=fff&size=128'
            }
        ];
        guardarUsuarios();
    }
    
    const usuarioGuardado = localStorage.getItem('lubrimaxUsuarioActual');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        actualizarInterfazUsuario();
    }
}

function guardarUsuarios() {
    localStorage.setItem('lubrimaxUsuarios', JSON.stringify(usuariosRegistrados));
}

function guardarUsuarioActual() {
    if (usuarioActual) {
        localStorage.setItem('lubrimaxUsuarioActual', JSON.stringify(usuarioActual));
    } else {
        localStorage.removeItem('lubrimaxUsuarioActual');
    }
}

function configurarEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            cambiarSeccion(section);
        });
    });
    
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            iniciarSesion();
        });
    }
    
    const formRegister = document.getElementById('formRegister');
    if (formRegister) {
        formRegister.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarUsuario();
        });
    }
    
    const formProfile = document.getElementById('formProfile');
    if (formProfile) {
        formProfile.addEventListener('submit', function(e) {
            e.preventDefault();
            actualizarPerfil();
        });
    }
    
    const btnChangePassword = document.getElementById('btnChangePassword');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', function() {
            mostrarModal('passwordModal');
        });
    }
    
    const formChangePassword = document.getElementById('formChangePassword');
    if (formChangePassword) {
        formChangePassword.addEventListener('submit', function(e) {
            e.preventDefault();
            cambiarContraseña();
        });
    }
    
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarModal('recoveryModal');
        });
    }
    
    const formRecovery = document.getElementById('formRecovery');
    if (formRecovery) {
        formRecovery.addEventListener('submit', function(e) {
            e.preventDefault();
            recuperarContraseña();
        });
    }
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }
    
    const btnDeleteAccount = document.getElementById('btnDeleteAccount');
    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', eliminarCuenta);
    }
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            ocultarModal(modalId);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                ocultarModal(this.id);
            }
        });
    });
    
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    if (cancelPasswordChange) {
        cancelPasswordChange.addEventListener('click', function() {
            ocultarModal('passwordModal');
        });
    }
    
    const cancelRecovery = document.getElementById('cancelRecovery');
    if (cancelRecovery) {
        cancelRecovery.addEventListener('click', function() {
            ocultarModal('recoveryModal');
        });
    }
    
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
    
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', validarFortalezaPassword);
    }
}
function cambiarSeccion(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const seccion = document.getElementById(sectionId);
    if (seccion) {
        seccion.classList.add('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    if (!usuarioActual && sectionId !== 'login' && sectionId !== 'register') {
        alert('Debes iniciar sesión para acceder a esta sección');
        cambiarSeccion('login');
        return;
    }
    switch(sectionId) {
        case 'profile':
            cargarDatosPerfil();
            break;
        case 'orders':
            renderizarPedidos();
            break;
        case 'wishlist':
            renderizarFavoritos();
            break;
    }
}

function iniciarSesion() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        mostrarAlerta('Por favor, completa todos los campos', 'error');
        return;
    }
    
    const usuario = usuariosRegistrados.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        const usuarioSinPassword = {...usuario};
        delete usuarioSinPassword.password;
        
        usuarioActual = usuarioSinPassword;
        
        if (rememberMe) {
            guardarUsuarioActual();
        }
        
        actualizarInterfazUsuario();
        mostrarAlerta(`¡Bienvenido de nuevo, ${usuario.nombre}!`, 'exito');
        
        cambiarSeccion('profile');
    } else {
        mostrarAlerta('Correo o contraseña incorrectos', 'error');
    }
}
function registrarUsuario() {
    const nombre = document.getElementById('registerNombre').value;
    const apellido = document.getElementById('registerApellido').value;
    const email = document.getElementById('registerEmail').value;
    const telefono = document.getElementById('registerTelefono').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validaciones
    if (!nombre || !apellido || !email || !password || !confirmPassword) {
        mostrarAlerta('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (!acceptTerms) {
        mostrarAlerta('Debes aceptar los términos y condiciones', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        mostrarAlerta('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (usuariosRegistrados.some(u => u.email === email)) {
        mostrarAlerta('Este correo electrónico ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: usuariosRegistrados.length + 1,
        nombre: nombre,
        apellido: apellido,
        email: email,
        telefono: telefono || '',
        password: password,
        direccion: '',
        fechaRegistro: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        avatar: `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=2c3e50&color=fff&size=128`
    };
    
    usuariosRegistrados.push(nuevoUsuario);
    guardarUsuarios();
    
    const usuarioSinPassword = {...nuevoUsuario};
    delete usuarioSinPassword.password;
    usuarioActual = usuarioSinPassword;
    guardarUsuarioActual();
    
    actualizarInterfazUsuario();
    mostrarAlerta(`¡Cuenta creada con éxito, ${nombre}!`, 'exito');
    
    cambiarSeccion('profile');
}

function cerrarSesion() {
    usuarioActual = null;
    guardarUsuarioActual();
    actualizarInterfazUsuario();
    mostrarAlerta('Has cerrado sesión correctamente', 'info');
    cambiarSeccion('login');
}

function verificarSesion() {
    if (usuarioActual) {
        cambiarSeccion('profile');
    } else {
        cambiarSeccion('login');
    }
}

function actualizarInterfazUsuario() {
    const userInfo = document.getElementById('userInfo');
    const btnLogout = document.getElementById('btnLogout');
    
    if (usuarioActual) {
        userInfo.innerHTML = `
            <p><strong>${usuarioActual.nombre} ${usuarioActual.apellido}</strong></p>
            <p>${usuarioActual.email}</p>
        `;
        btnLogout.style.display = 'block';
    } else {
        userInfo.innerHTML = '<p>No has iniciado sesión</p>';
        btnLogout.style.display = 'none';
    }
}

function cargarDatosPerfil() {
    if (!usuarioActual) return;
    
    document.getElementById('profileName').textContent = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
    document.getElementById('profileEmail').textContent = usuarioActual.email;
    document.getElementById('memberSince').textContent = usuarioActual.fechaRegistro;
    
    document.getElementById('profileNombre').value = usuarioActual.nombre;
    document.getElementById('profileApellido').value = usuarioActual.apellido;
    document.getElementById('profileEmail').value = usuarioActual.email;
    document.getElementById('profileTelefono').value = usuarioActual.telefono || '';
    
    const profileDireccion = document.getElementById('profileDireccion');
    if (profileDireccion) {
        profileDireccion.value = usuarioActual.direccion || '';
    }
    
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar && usuarioActual.avatar) {
        profileAvatar.src = usuarioActual.avatar;
    }
}

function actualizarPerfil() {
    if (!usuarioActual) return;
    
    const nombre = document.getElementById('profileNombre').value;
    const apellido = document.getElementById('profileApellido').value;
    const email = document.getElementById('profileEmail').value;
    const telefono = document.getElementById('profileTelefono').value;
    const direccion = document.getElementById('profileDireccion').value;
    
    if (!nombre || !apellido || !email) {
        mostrarAlerta('Los campos nombre, apellido y email son obligatorios', 'error');
        return;
    }
    
    const emailEnUso = usuariosRegistrados.some(u => 
        u.email === email && u.id !== usuarioActual.id
    );
    
    if (emailEnUso) {
        mostrarAlerta('Este correo electrónico ya está en uso por otro usuario', 'error');
        return;
    }
    
    const usuarioIndex = usuariosRegistrados.findIndex(u => u.id === usuarioActual.id);
    if (usuarioIndex !== -1) {
        usuariosRegistrados[usuarioIndex].nombre = nombre;
        usuariosRegistrados[usuarioIndex].apellido = apellido;
        usuariosRegistrados[usuarioIndex].email = email;
        usuariosRegistrados[usuarioIndex].telefono = telefono;
        usuariosRegistrados[usuarioIndex].direccion = direccion;
        
        guardarUsuarios();
    }
    usuarioActual.nombre = nombre;
    usuarioActual.apellido = apellido;
    usuarioActual.email = email;
    usuarioActual.telefono = telefono;
    usuarioActual.direccion = direccion;
    
    guardarUsuarioActual();
    actualizarInterfazUsuario();
    mostrarAlerta('Perfil actualizado correctamente', 'exito');
}

function cambiarContraseña() {
    if (!usuarioActual) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validaciones
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        mostrarAlerta('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        mostrarAlerta('Las nuevas contraseñas no coinciden', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const usuarioCompleto = usuariosRegistrados.find(u => u.id === usuarioActual.id);
    if (!usuarioCompleto || usuarioCompleto.password !== currentPassword) {
        mostrarAlerta('La contraseña actual es incorrecta', 'error');
        return;
    }
    
    usuarioCompleto.password = newPassword;
    guardarUsuarios();
    document.getElementById('formChangePassword').reset();
    
    ocultarModal('passwordModal');
    
    mostrarAlerta('Contraseña cambiada correctamente', 'exito');
}

function recuperarContraseña() {
    const email = document.getElementById('recoveryEmail').value;
    
    if (!email) {
        mostrarAlerta('Por favor, ingresa tu correo electrónico', 'error');
        return;
    }
    
    const usuario = usuariosRegistrados.find(u => u.email === email);
    
    if (usuario) {
        mostrarAlerta(`Se ha enviado un enlace de recuperación a ${email}`, 'exito');
        document.getElementById('formRecovery').reset();
        ocultarModal('recoveryModal');
    } else {
        mostrarAlerta('No se encontró ninguna cuenta con ese correo electrónico', 'error');
    }
}

// Eliminar cuenta
function eliminarCuenta() {
    if (!usuarioActual) return;
    
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y se perderán todos tus datos.');
    
    if (confirmacion) {
        // Eliminar usuario de la lista
        usuariosRegistrados = usuariosRegistrados.filter(u => u.id !== usuarioActual.id);
        guardarUsuarios();
        
        // Cerrar sesión
        usuarioActual = null;
        guardarUsuarioActual();
        
        actualizarInterfazUsuario();
        cambiarSeccion('login');
        
        mostrarAlerta('Tu cuenta ha sido eliminada correctamente', 'info');
    }
}

// Mostrar modal
function mostrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Ocultar modal
function ocultarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Validar fortaleza de contraseña
function validarFortalezaPassword() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let color = '';
    let text = '';
    
    // Verificar longitud
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    
    // Verificar caracteres especiales
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    // Determinar color y texto
    if (strength <= 25) {
        color = '#e74c3c';
        text = 'Débil';
    } else if (strength <= 50) {
        color = '#f39c12';
        text = 'Regular';
    } else if (strength <= 75) {
        color = '#3498db';
        text = 'Buena';
    } else {
        color = '#27ae60';
        text = 'Excelente';
    }
    
    // Actualizar UI
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `Seguridad: ${text}`;
    strengthText.style.color = color;
}

// Cargar pedidos demo
function cargarPedidosDemo() {
    pedidosUsuario = [
        {
            id: 1001,
            fecha: '15 Mar 2024',
            productos: [
                { nombre: 'Aceite Sintético 5W-30', cantidad: 2, precio: 24.99 },
                { nombre: 'Filtro de Aceite', cantidad: 1, precio: 12.50 }
            ],
            total: 62.48,
            estado: 'completado'
        },
        {
            id: 1002,
            fecha: '22 Mar 2024',
            productos: [
                { nombre: 'Aceite para Moto 4T', cantidad: 1, precio: 22.99 },
                { nombre: 'Grasa Industrial', cantidad: 3, precio: 15.75 }
            ],
            total: 70.24,
            estado: 'enviado'
        },
        {
            id: 1003,
            fecha: '28 Mar 2024',
            productos: [
                { nombre: 'Aceite Hidráulico', cantidad: 1, precio: 32.99 }
            ],
            total: 32.99,
            estado: 'pendiente'
        }
    ];
}

// Cargar favoritos demo
function cargarFavoritosDemo() {
    favoritosUsuario = [
        {
            id: 1,
            nombre: 'Aceite Sintético 5W-30',
            precio: 24.99,
            categoria: 'Automóvil',
            imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 3,
            nombre: 'Aceite para Moto 4T',
            precio: 22.99,
            categoria: 'Motocicleta',
            imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 6,
            nombre: 'Aceite Hidráulico',
            precio: 32.99,
            categoria: 'Industrial',
            imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        }
    ];
}

// Renderizar pedidos
function renderizarPedidos() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    if (pedidosUsuario.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>No tienes pedidos</h3>
                <p>Aún no has realizado ninguna compra</p>
                <a href="../index.html#productos" class="btn btn-primary">Ver Productos</a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = pedidosUsuario.map(pedido => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h4>Pedido #${pedido.id}</h4>
                    <p>${pedido.fecha}</p>
                </div>
                <div>
                    <span class="order-status status-${pedido.estado}">
                        ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                    <p class="order-total">Total: $${pedido.total.toFixed(2)}</p>
                </div>
            </div>
            <div class="order-products">
                ${pedido.productos.map(producto => `
                    <div class="order-product">
                        <span>${producto.cantidad}x ${producto.nombre}</span>
                        <span>$${(producto.cantidad * producto.precio).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Renderizar favoritos
function renderizarFavoritos() {
    const wishlistContainer = document.getElementById('wishlistContainer');
    if (!wishlistContainer) return;
    
    if (favoritosUsuario.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No tienes favoritos</h3>
                <p>Agrega productos a tus favoritos para verlos aquí</p>
                <a href="../index.html#productos" class="btn btn-primary">Ver Productos</a>
            </div>
        `;
        return;
    }
    
    wishlistContainer.innerHTML = favoritosUsuario.map(producto => `
        <div class="wishlist-card">
            <div class="wishlist-header">
                <div>
                    <h4>${producto.nombre}</h4>
                    <p class="product-category">${producto.categoria}</p>
                </div>
                <div class="wishlist-actions">
                    <span class="product-price">$${producto.precio.toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm" onclick="comprarProducto(${producto.id})">
                        <i class="fas fa-cart-plus"></i> Comprar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="eliminarFavorito(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
            <div class="wishlist-body">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="wishlist-image">
                <div class="wishlist-description">
                    <p>Producto de alta calidad para el cuidado de tu motor</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para comprar producto desde favoritos
function comprarProducto(id) {
    const producto = favoritosUsuario.find(p => p.id === id);
    if (producto) {
        mostrarAlerta(`Producto "${producto.nombre}" agregado al carrito`, 'exito');
    }
}

// Función para eliminar de favoritos
function eliminarFavorito(id) {
    favoritosUsuario = favoritosUsuario.filter(p => p.id !== id);
    renderizarFavoritos();
    mostrarAlerta('Producto eliminado de favoritos', 'info');
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.innerHTML = `
        <span>${mensaje}</span>
        <button class="alerta-cerrar">&times;</button>
    `;
    
    // Estilos para la alerta
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Colores según tipo
    const colores = {
        exito: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        advertencia: '#f39c12'
    };
    
    alerta.style.backgroundColor = colores[tipo] || colores.info;
    
    // Botón para cerrar
    const btnCerrar = alerta.querySelector('.alerta-cerrar');
    btnCerrar.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 15px;
        line-height: 1;
    `;
    
    btnCerrar.addEventListener('click', () => {
        alerta.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 300);
    });
    
    // Agregar al documento
    document.body.appendChild(alerta);
    
    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (alerta.parentNode) {
                    alerta.parentNode.removeChild(alerta);
                }
            }, 300);
        }
    }, 5000);
    
    // Agregar animaciones CSS
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Funciones para usar desde la tienda principal
function obtenerUsuarioActual() {
    return usuarioActual;
}

function estaLogueado() {
    return usuarioActual !== null;
}

function agregarFavoritoDesdeTienda(producto) {
    if (!usuarioActual) {
        mostrarAlerta('Debes iniciar sesión para agregar favoritos', 'error');
        return false;
    }
    
    // Verificar si ya está en favoritos
    const yaEnFavoritos = favoritosUsuario.some(p => p.id === producto.id);
    
    if (!yaEnFavoritos) {
        favoritosUsuario.push(producto);
        mostrarAlerta(`"${producto.nombre}" agregado a favoritos`, 'exito');
        return true;
    } else {
        mostrarAlerta('Este producto ya está en tus favoritos', 'info');
        return false;
    }
}

// Exportar funciones para uso global
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.estaLogueado = estaLogueado;
window.agregarFavoritoDesdeTienda = agregarFavoritoDesdeTienda;