let usuarios = [];
let productos = [];
let pedidos = [];
let ventas = [];
let currentFilter = 'all';
let currentDateRange = '30';
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    inicializarEventListeners();
    inicializarGraficos();
    cargarDatosDemo();
    actualizarEstadisticas();
    cambiarSeccion('dashboard');
});

function cargarDatos() {
    const usuariosGuardados = localStorage.getItem('lubrimaxUsuarios');
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
    }
    
    const productosGuardados = localStorage.getItem('lubrimaxProductos');
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
    } else {
        productos = cargarProductosDemo();
    }
    
    const pedidosGuardados = localStorage.getItem('lubrimaxPedidos');
    if (pedidosGuardados) {
        pedidos = JSON.parse(pedidosGuardados);
    }
    
    const ventasGuardadas = localStorage.getItem('lubrimaxVentas');
    if (ventasGuardadas) {
        ventas = JSON.parse(ventasGuardadas);
    }
}

function guardarDatos() {
    localStorage.setItem('lubrimaxProductos', JSON.stringify(productos));
    localStorage.setItem('lubrimaxPedidos', JSON.stringify(pedidos));
    localStorage.setItem('lubrimaxVentas', JSON.stringify(ventas));
}

function inicializarEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            cambiarSeccion(section);
        });
    });
    
    document.getElementById('btnToday')?.addEventListener('click', () => filtrarPorTiempo('hoy'));
    document.getElementById('btnWeek')?.addEventListener('click', () => filtrarPorTiempo('semana'));
    document.getElementById('btnMonth')?.addEventListener('click', () => filtrarPorTiempo('mes'));
    
    document.getElementById('exportPDF')?.addEventListener('click', exportarPDF);
    document.getElementById('exportExcel')?.addEventListener('click', exportarExcel);
    document.getElementById('exportCSV')?.addEventListener('click', exportarCSV);
    document.getElementById('exportProducts')?.addEventListener('click', exportarProductos);
    
    document.getElementById('searchUsers')?.addEventListener('input', filtrarUsuarios);
    document.getElementById('filterUserType')?.addEventListener('change', filtrarUsuarios);
    document.getElementById('filterUserStatus')?.addEventListener('change', filtrarUsuarios);
    document.getElementById('resetFilters')?.addEventListener('click', resetearFiltrosUsuarios);
    
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            filtrarPedidos();
        });
    });
    
    document.getElementById('salesRange')?.addEventListener('change', function() {
        const value = this.value;
        const customRange = document.getElementById('customDateRange');
        const customRangeTo = document.getElementById('customDateRangeTo');
        
        if (value === 'custom') {
            customRange.classList.remove('d-none');
            customRangeTo.classList.remove('d-none');
        } else {
            customRange.classList.add('d-none');
            customRangeTo.classList.add('d-none');
        }
    });
    
    document.getElementById('applySalesFilter')?.addEventListener('click', aplicarFiltroVentas);
    
    document.getElementById('saveUser')?.addEventListener('click', guardarUsuario);
    document.getElementById('saveProduct')?.addEventListener('click', guardarProducto);
    document.getElementById('btnLogout')?.addEventListener('click', cerrarSesion);
    document.getElementById('selectAllUsers')?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#usersTable tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    document.querySelector('[data-bs-target="#sidebar"]')?.addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('show');
    });
}
function cambiarSeccion(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const seccion = document.getElementById(sectionId);
    if (seccion) {
        seccion.classList.add('active');
    }
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            pageTitle.textContent = activeLink.textContent.trim();
        }
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    switch(sectionId) {
        case 'usuarios':
            renderizarUsuarios();
            break;
        case 'productos':
            renderizarProductos();
            actualizarEstadisticasProductos();
            break;
        case 'pedidos':
            renderizarPedidos();
            actualizarEstadisticasPedidos();
            break;
        case 'ventas':
            aplicarFiltroVentas();
            break;
    }
}

function cargarDatosDemo() {
    if (usuarios.length === 0) {
        usuarios = [
            {
                id: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@email.com',
                tipo: 'cliente',
                fechaRegistro: '2024-01-15',
                estado: 'activo'
            },
            {
                id: 2,
                nombre: 'María',
                apellido: 'Gómez',
                email: 'maria@email.com',
                tipo: 'cliente',
                fechaRegistro: '2024-02-10',
                estado: 'activo'
            },
            {
                id: 3,
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                email: 'carlos@email.com',
                tipo: 'admin',
                fechaRegistro: '2024-01-05',
                estado: 'activo'
            }
        ];
    }
    
    if (productos.length === 0) {
        productos = cargarProductosDemo();
    }
    
    if (pedidos.length === 0) {
        pedidos = [
            {
                id: 1001,
                usuarioId: 1,
                cliente: 'Juan Pérez',
                fecha: '2024-03-15',
                productos: [
                    { id: 1, nombre: 'Aceite Sintético 5W-30', cantidad: 2, precio: 24.99 },
                    { id: 7, nombre: 'Filtro de Aceite', cantidad: 1, precio: 12.50 }
                ],
                total: 62.48,
                estado: 'completado'
            },
            {
                id: 1002,
                usuarioId: 2,
                cliente: 'María Gómez',
                fecha: '2024-03-16',
                productos: [
                    { id: 3, nombre: 'Aceite para Moto 4T', cantidad: 1, precio: 22.99 }
                ],
                total: 22.99,
                estado: 'procesando'
            },
            {
                id: 1003,
                usuarioId: 1,
                cliente: 'Juan Pérez',
                fecha: '2024-03-17',
                productos: [
                    { id: 4, nombre: 'Grasa Industrial', cantidad: 3, precio: 15.75 }
                ],
                total: 47.25,
                estado: 'pendiente'
            }
        ];
    }
    
    if (ventas.length === 0) {
        ventas = generarVentasDemo();
    }
    
    guardarDatos();
}

function cargarProductosDemo() {
    return [
        {
            id: 1,
            nombre: 'Aceite Sintético 5W-30',
            categoria: 'automovil',
            precio: 24.99,
            stock: 50,
            vendidos: 125,
            estado: 'disponible',
            descripcion: 'Aceite full sintético para alto rendimiento',
            imagen: 'assets/images/aceite-Hidráulico.png'
        },
        {
            id: 2,
            nombre: 'Aceite Mineral 10W-40',
            categoria: 'automovil',
            precio: 18.50,
            stock: 75,
            vendidos: 89,
            estado: 'disponible',
            descripcion: 'Aceite mineral para motores a gasolina',
            imagen: 'assets/images/aceite-Industrial.png'
        },
        {
            id: 3,
            nombre: 'Aceite para Moto 4T',
            categoria: 'moto',
            precio: 22.99,
            stock: 30,
            vendidos: 67,
            estado: 'disponible',
            descripcion: 'Especial para motores de 4 tiempos',
            imagen: 'assets/images/aceite-para-Moto-4T.png'
        },
        {
            id: 4,
            nombre: 'Grasa Industrial',
            categoria: 'industrial',
            precio: 15.75,
            stock: 100,
            vendidos: 45,
            estado: 'disponible',
            descripcion: 'Grasa multipropósito para aplicaciones industriales',
            imagen: 'assets/images/aceite-para-Moto-4T.png'
        },
        {
            id: 5,
            nombre: 'Aceite Transmisión ATF',
            categoria: 'automovil',
            precio: 27.50,
            stock: 25,
            vendidos: 32,
            estado: 'disponible',
            descripcion: 'Fluido para transmisiones automáticas',
            imagen: 'assets/images/Grasa-Industrial.png'
        },
        {
            id: 6,
            nombre: 'Aceite Hidráulico',
            categoria: 'industrial',
            precio: 32.99,
            stock: 15,
            vendidos: 28,
            estado: 'disponible',
            descripcion: 'Para sistemas hidráulicos industriales',
            imagen: 'assets/images/aceite-Transmisión-ATF.png'
        },
        {
            id: 7,
            nombre: 'Filtro de Aceite',
            categoria: 'automovil',
            precio: 12.50,
            stock: 5,
            vendidos: 95,
            estado: 'bajo stock',
            descripcion: 'Filtro de aceite estándar',
            imagen: 'assets/images/Aceite-Hidráulico.png'
        }
    ];
}

function generarVentasDemo() {
    const ventasDemo = [];
    const productosIds = [1, 2, 3, 4, 5, 6, 7];
    const categorias = ['automovil', 'moto', 'industrial'];
    const fechas = [];
    
    for (let i = 29; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fechas.push(fecha.toISOString().split('T')[0]);
    }
    
    fechas.forEach(fecha => {
        const ventasDelDia = Math.floor(Math.random() * 8) + 3;
        
        for (let i = 0; i < ventasDelDia; i++) {
            const productoId = productosIds[Math.floor(Math.random() * productosIds.length)];
            const producto = productos.find(p => p.id === productoId);
            const cantidad = Math.floor(Math.random() * 3) + 1;
            const cliente = usuarios[Math.floor(Math.random() * usuarios.length)];
            
            ventasDemo.push({
                id: ventasDemo.length + 1,
                fecha: fecha,
                productoId: productoId,
                producto: producto.nombre,
                categoria: producto.categoria,
                cantidad: cantidad,
                precioUnitario: producto.precio,
                total: producto.precio * cantidad,
                cliente: `${cliente.nombre} ${cliente.apellido}`,
                clienteEmail: cliente.email
            });
        }
    });
    
    return ventasDemo;
}

function actualizarEstadisticas() {
    document.getElementById('totalUsers').textContent = usuarios.length;
    document.getElementById('userCount').textContent = usuarios.length;
    const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
    document.getElementById('totalSales').textContent = totalVentas.toFixed(2);
    document.getElementById('userGrowth').textContent = '+3 este mes';
    document.getElementById('salesGrowth').textContent = '+15% este mes';
    const hoy = new Date().toISOString().split('T')[0];
    const pedidosHoy = pedidos.filter(p => p.fecha === hoy).length;
    document.getElementById('todayOrders').textContent = pedidosHoy;
    const totalProductosVendidos = productos.reduce((sum, p) => sum + p.vendidos, 0);
    document.getElementById('productsSold').textContent = totalProductosVendidos;
    const productoMasVendido = productos.reduce((max, p) => p.vendidos > max.vendidos ? p : max, productos[0]);
    document.getElementById('topProduct').textContent = productoMasVendido ? productoMasVendido.nombre : 'N/A';
    
    document.getElementById('productCount').textContent = productos.length;
    document.getElementById('orderCount').textContent = pedidos.length;
    actualizarPedidosRecientes();
}

function actualizarEstadisticasProductos() {
    const total = productos.length;
    const disponibles = productos.filter(p => p.estado === 'disponible').length;
    const bajoStock = productos.filter(p => p.stock < 10 && p.stock > 0).length;
    const agotados = productos.filter(p => p.stock === 0).length;
    
    document.getElementById('totalProducts').textContent = total;
    document.getElementById('availableProducts').textContent = disponibles;
    document.getElementById('lowStockProducts').textContent = bajoStock;
    document.getElementById('outOfStockProducts').textContent = agotados;
}

function actualizarEstadisticasPedidos() {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const procesando = pedidos.filter(p => p.estado === 'procesando').length;
    const completados = pedidos.filter(p => p.estado === 'completado').length;
    const cancelados = pedidos.filter(p => p.estado === 'cancelado').length;
    
    const hoy = new Date().toISOString().split('T')[0];
    const ingresosHoy = pedidos
        .filter(p => p.fecha === hoy && p.estado !== 'cancelado')
        .reduce((sum, p) => sum + p.total, 0);
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pendientes;
    document.getElementById('processingOrders').textContent = procesando;
    document.getElementById('completedOrders').textContent = completados;
    document.getElementById('cancelledOrders').textContent = cancelados;
    document.getElementById('todayRevenue').textContent = `$${ingresosHoy.toFixed(2)}`;
}

function actualizarPedidosRecientes() {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    if (!tbody) return;
    
    const pedidosRecientes = [...pedidos]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    tbody.innerHTML = pedidosRecientes.map(pedido => `
        <tr>
            <td>#${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${formatFecha(pedido.fecha)}</td>
            <td>$${pedido.total.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${pedido.estado}">
                    ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetallePedido(${pedido.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editarPedido(${pedido.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderizarUsuarios() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input" value="${usuario.id}">
            </td>
            <td>${usuario.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=2c3e50&color=fff&size=32" 
                        class="rounded-circle me-2" width="32" height="32">
                    <div>
                        <strong>${usuario.nombre} ${usuario.apellido}</strong>
                        <div class="small text-muted">ID: ${usuario.id}</div>
                    </div>
                </div>
            </td>
            <td>${usuario.email}</td>
            <td>
                <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : 'bg-info'}">
                    ${usuario.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
            </td>
            <td>${formatFecha(usuario.fechaRegistro)}</td>
            <td>
                <span class="badge ${usuario.estado === 'activo' ? 'bg-success' : 'bg-secondary'}">
                    ${usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editarUsuario(${usuario.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="verUsuario(${usuario.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="eliminarUsuario(${usuario.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderizarProductos() {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td>${producto.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${producto.imagen}" class="rounded me-2" width="40" height="40" 
                         style="object-fit: cover;">
                    <div>
                        <strong>${producto.nombre}</strong>
                        <div class="small text-muted">${producto.descripcion.substring(0, 50)}...</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${getCategoriaBadgeClass(producto.categoria)}">
                    ${getCategoriaNombre(producto.categoria)}
                </span>
            </td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>
                <span class="${getStockClass(producto.stock)}">
                    ${producto.stock} unidades
                </span>
            </td>
            <td>${producto.vendidos}</td>
            <td>
                <span class="badge ${getEstadoProductoClass(producto.estado)}">
                    ${producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1)}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="verProducto(${producto.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="ajustarStock(${producto.id})">
                        <i class="fas fa-boxes"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderizarPedidos() {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    
    let pedidosFiltrados = pedidos;
    
    if (currentFilter !== 'all') {
        pedidosFiltrados = pedidos.filter(p => p.estado === currentFilter);
    }
    
    tbody.innerHTML = pedidosFiltrados.map(pedido => `
        <tr>
            <td>
                <strong>#${pedido.id}</strong>
            </td>
            <td>
                <div>
                    <strong>${pedido.cliente}</strong>
                    <div class="small text-muted">ID: ${pedido.usuarioId}</div>
                </div>
            </td>
            <td>${formatFecha(pedido.fecha)}</td>
            <td>
                <div class="small">
                    ${pedido.productos.map(p => `${p.cantidad}x ${p.nombre}`).join('<br>')}
                </div>
            </td>
            <td>
                <strong>$${pedido.total.toFixed(2)}</strong>
            </td>
            <td>
                <span class="status-badge status-${pedido.estado}">
                    ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="cambiarEstadoPedido(${pedido.id}, 'completado')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="cambiarEstadoPedido(${pedido.id}, 'procesando')">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="cambiarEstadoPedido(${pedido.id}, 'cancelado')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filtrarPorTiempo(periodo) {
    mostrarAlerta(`Filtrando por: ${periodo}`, 'info');
}

function filtrarUsuarios() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const tipo = document.getElementById('filterUserType').value;
    const estado = document.getElementById('filterUserStatus').value;
    
    let usuariosFiltrados = usuarios.filter(usuario => {
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
        const email = usuario.email.toLowerCase();
        
        const coincideBusqueda = !searchTerm || 
            nombreCompleto.includes(searchTerm) || 
            email.includes(searchTerm);
        
        const coincideTipo = !tipo || usuario.tipo === tipo;
        const coincideEstado = !estado || usuario.estado === estado;
        
        return coincideBusqueda && coincideTipo && coincideEstado;
    });
    
    renderizarUsuariosFiltrados(usuariosFiltrados);
}

function renderizarUsuariosFiltrados(usuariosFiltrados) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = usuariosFiltrados.map(usuario => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input" value="${usuario.id}">
            </td>
            <td>${usuario.id}</td>
            <td>${usuario.nombre} ${usuario.apellido}</td>
            <td>${usuario.email}</td>
            <td>
                <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : 'bg-info'}">
                    ${usuario.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
            </td>
            <td>${formatFecha(usuario.fechaRegistro)}</td>
            <td>
                <span class="badge ${usuario.estado === 'activo' ? 'bg-success' : 'bg-secondary'}">
                    ${usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function resetearFiltrosUsuarios() {
    document.getElementById('searchUsers').value = '';
    document.getElementById('filterUserType').value = '';
    document.getElementById('filterUserStatus').value = '';
    renderizarUsuarios();
}

function filtrarPedidos() {
    renderizarPedidos();
    actualizarEstadisticasPedidos();
}

function aplicarFiltroVentas() {
    const rango = document.getElementById('salesRange').value;
    const categoria = document.getElementById('salesCategory').value;
    
    let ventasFiltradas = ventas;
    
    if (rango !== 'custom') {
        const dias = parseInt(rango);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        ventasFiltradas = ventasFiltradas.filter(v => 
            new Date(v.fecha) >= fechaLimite
        );
    } else {
        const fechaDesde = document.getElementById('dateFrom').value;
        const fechaHasta = document.getElementById('dateTo').value;
        
        if (fechaDesde && fechaHasta) {
            ventasFiltradas = ventasFiltradas.filter(v => 
                v.fecha >= fechaDesde && v.fecha <= fechaHasta
            );
        }
    }
    if (categoria) {
        ventasFiltradas = ventasFiltradas.filter(v => v.categoria === categoria);
    }
    
    actualizarGraficosVentas(ventasFiltradas);
    actualizarTablaVentas(ventasFiltradas);
}

function inicializarGraficos() {
    const salesChartCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesChartCtx) {
        charts.salesChart = new Chart(salesChartCtx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [1200, 1900, 1500, 2500, 2200, 3000, 2800, 3200, 2900, 3500, 4000, 3800],
                    backgroundColor: 'rgba(243, 156, 18, 0.7)',
                    borderColor: 'rgba(243, 156, 18, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    const categoriesChartCtx = document.getElementById('categoriesChart')?.getContext('2d');
    if (categoriesChartCtx) {
        charts.categoriesChart = new Chart(categoriesChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Automóvil', 'Motocicleta', 'Industrial', 'Especiales'],
                datasets: [{
                    data: [65, 15, 15, 5],
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#2ecc71',
                        '#f39c12'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    const salesTrendCtx = document.getElementById('salesTrendChart')?.getContext('2d');
    if (salesTrendCtx) {
        charts.salesTrendChart = new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    const topProductsCtx = document.getElementById('topProductsChart')?.getContext('2d');
    if (topProductsCtx) {
        charts.topProductsChart = new Chart(topProductsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: [],
                    backgroundColor: 'rgba(46, 204, 113, 0.7)'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

function actualizarGraficosVentas(ventasFiltradas) {
    const ventasPorFecha = {};
    ventasFiltradas.forEach(venta => {
        if (!ventasPorFecha[venta.fecha]) {
            ventasPorFecha[venta.fecha] = 0;
        }
        ventasPorFecha[venta.fecha] += venta.total;
    });
    const fechas = Object.keys(ventasPorFecha).sort();
    const montos = fechas.map(fecha => ventasPorFecha[fecha]);
    
    if (charts.salesTrendChart) {
        charts.salesTrendChart.data.labels = fechas;
        charts.salesTrendChart.data.datasets[0].data = montos;
        charts.salesTrendChart.update();
    }
    const productosVentas = {};
    ventasFiltradas.forEach(venta => {
        if (!productosVentas[venta.producto]) {
            productosVentas[venta.producto] = 0;
        }
        productosVentas[venta.producto] += venta.cantidad;
    });
    
    const topProductos = Object.entries(productosVentas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (charts.topProductsChart) {
        charts.topProductsChart.data.labels = topProductos.map(p => p[0]);
        charts.topProductsChart.data.datasets[0].data = topProductos.map(p => p[1]);
        charts.topProductsChart.update();
    }
}

function actualizarTablaVentas(ventasFiltradas) {
    const tbody = document.querySelector('#salesDetailTable tbody');
    if (!tbody) return;
    
    const ventasOrdenadas = [...ventasFiltradas].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
    ).slice(0, 20); 
    
    tbody.innerHTML = ventasOrdenadas.map(venta => `
        <tr>
            <td>${formatFecha(venta.fecha)}</td>
            <td>${venta.producto}</td>
            <td>
                <span class="badge ${getCategoriaBadgeClass(venta.categoria)}">
                    ${getCategoriaNombre(venta.categoria)}
                </span>
            </td>
            <td>${venta.cantidad}</td>
            <td>$${venta.precioUnitario.toFixed(2)}</td>
            <td>
                <strong>$${venta.total.toFixed(2)}</strong>
            </td>
            <td>${venta.cliente}</td>
        </tr>
    `).join('');
}

function guardarUsuario() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const nuevoUsuario = {
        id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
        nombre: formData.get('nombre') || form.querySelector('input[type="text"]').value,
        apellido: formData.get('apellido') || form.querySelectorAll('input[type="text"]')[1].value,
        email: formData.get('email') || form.querySelector('input[type="email"]').value,
        tipo: form.querySelector('select').value,
        fechaRegistro: new Date().toISOString().split('T')[0],
        estado: form.querySelectorAll('select')[1].value,
        password: '123456' 
    };
    
    usuarios.push(nuevoUsuario);
    
    const usuariosCompletos = JSON.parse(localStorage.getItem('lubrimaxUsuarios') || '[]');
    usuariosCompletos.push({
        ...nuevoUsuario,
        password: '123456'
    });
    localStorage.setItem('lubrimaxUsuarios', JSON.stringify(usuariosCompletos));
    
    bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
    renderizarUsuarios();
    actualizarEstadisticas();
    mostrarAlerta('Usuario creado correctamente', 'success');
}

function guardarProducto() {
    const form = document.getElementById('addProductForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    const nuevoProducto = {
        id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
        nombre: inputs[0].value,
        categoria: inputs[1].value,
        precio: parseFloat(inputs[2].value),
        stock: parseInt(inputs[3].value),
        vendidos: 0,
        descripcion: inputs[4].value,
        imagen: inputs[5].value || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        estado: inputs[6].value
    };
    
    productos.push(nuevoProducto);
    guardarDatos();
    
    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    renderizarProductos();
    actualizarEstadisticas();
    actualizarEstadisticasProductos();
    mostrarAlerta('Producto creado correctamente', 'success');
}

function formatFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getCategoriaNombre(categoria) {
    const categorias = {
        'automovil': 'Automóvil',
        'moto': 'Motocicleta',
        'industrial': 'Industrial',
        'especial': 'Especial'
    };
    return categorias[categoria] || categoria;
}

function getCategoriaBadgeClass(categoria) {
    const clases = {
        'automovil': 'bg-primary',
        'moto': 'bg-danger',
        'industrial': 'bg-success',
        'especial': 'bg-warning'
    };
    return clases[categoria] || 'bg-secondary';
}

function getStockClass(stock) {
    if (stock === 0) return 'stock-out';
    if (stock < 10) return 'stock-low';
    return 'stock-good';
}

function getEstadoProductoClass(estado) {
    const clases = {
        'disponible': 'bg-success',
        'agotado': 'bg-danger',
        'bajo stock': 'bg-warning',
        'descontinuado': 'bg-secondary'
    };
    return clases[estado] || 'bg-secondary';
}

function exportarPDF() {
    mostrarAlerta('Exportando a PDF...', 'info');
}

function exportarExcel() {
    mostrarAlerta('Exportando a Excel...', 'info');
}

function exportarCSV() {
    const headers = ['ID', 'Producto', 'Categoría', 'Precio', 'Stock', 'Vendidos', 'Estado'];
    const rows = productos.map(p => [
        p.id,
        p.nombre,
        getCategoriaNombre(p.categoria),
        p.precio,
        p.stock,
        p.vendidos,
        p.estado
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_lubrimax_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarAlerta('CSV exportado correctamente', 'success');
}

function exportarProductos() {
    exportarCSV();
}

function verDetallePedido(id) {
    mostrarAlerta(`Viendo detalle del pedido #${id}`, 'info');
}

function editarPedido(id) {
    mostrarAlerta(`Editando pedido #${id}`, 'info');
}

function cambiarEstadoPedido(id, estado) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estado = estado;
        guardarDatos();
        renderizarPedidos();
        actualizarEstadisticas();
        mostrarAlerta(`Pedido #${id} actualizado a ${estado}`, 'success');
    }
}

function editarUsuario(id) {
    mostrarAlerta(`Editando usuario #${id}`, 'info');
}

function verUsuario(id) {
    mostrarAlerta(`Viendo usuario #${id}`, 'info');
}

function eliminarUsuario(id) {
    if (confirm(`¿Estás seguro de eliminar al usuario #${id}?`)) {
        usuarios = usuarios.filter(u => u.id !== id);
        const usuariosCompletos = JSON.parse(localStorage.getItem('lubrimaxUsuarios') || '[]');
        const nuevosUsuarios = usuariosCompletos.filter(u => u.id !== id);
        localStorage.setItem('lubrimaxUsuarios', JSON.stringify(nuevosUsuarios));
        
        renderizarUsuarios();
        actualizarEstadisticas();
        mostrarAlerta('Usuario eliminado correctamente', 'success');
    }
}

function editarProducto(id) {
    mostrarAlerta(`Editando producto #${id}`, 'info');
}

function verProducto(id) {
    mostrarAlerta(`Viendo producto #${id}`, 'info');
}

function ajustarStock(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        const nuevoStock = prompt(`Stock actual: ${producto.stock}\nIngrese nuevo stock:`, producto.stock);
        if (nuevoStock !== null) {
            producto.stock = parseInt(nuevoStock);
            guardarDatos();
            renderizarProductos();
            actualizarEstadisticasProductos();
            mostrarAlerta(`Stock del producto #${id} actualizado`, 'success');
        }
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.removeItem('adminSession');
        window.location.href = '../index.html';
    }
}
function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        if (alerta.parentNode) {
            bootstrap.Alert.getOrCreateInstance(alerta).close();
        }
    }, 5000);
}

window.verDetallePedido = verDetallePedido;
window.editarPedido = editarPedido;
window.cambiarEstadoPedido = cambiarEstadoPedido;
window.editarUsuario = editarUsuario;
window.verUsuario = verUsuario;
window.eliminarUsuario = eliminarUsuario;
window.editarProducto = editarProducto;
window.verProducto = verProducto;
window.ajustarStock = ajustarStock;