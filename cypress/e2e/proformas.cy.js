describe('Gestión de Proformas', () => {
  beforeEach(() => {
    // 1. Mock de Login
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          usuario: { id: 1, username: 'admin', rol: 'ADMIN', nombres: 'Admin' }
        }
      }
    }).as('loginRequest');

    // 2. Mocks de datos generales para evitar deslogueo en Home
    cy.intercept('GET', '**/api/v1/clientes*', { 
      statusCode: 200, 
      body: { data: [{ id: 1, nombres: 'Juan', apellidosRazonSocial: 'Pérez', identificacion: '1712345678' }], total: 1 } 
    }).as('getClientes');
    cy.intercept('GET', '**/api/v1/productos*', { 
      statusCode: 200, 
      body: { data: [{ id: 1, nombre: 'Producto de Prueba', precioBase: 10.00, stockActual: 100, tipo: 'producto', estado: true }], total: 1 } 
    }).as('getProductos');
    cy.intercept('GET', '**/api/v1/proveedores*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProveedores');
    cy.intercept('GET', '**/api/v1/config*', { statusCode: 200, body: { data: {} } }).as('getConfig');
    cy.intercept('GET', '**/api/v1/facturas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getFacturas');

    // 3. Mock de proformas
    cy.intercept('GET', '**/api/v1/proformas*', (req) => {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const estado = url.searchParams.get('estado') || '';
      
      let mockData = [
        { id: 1, numeroProforma: 'PROF-2023-0001', clienteId: 1, cliente: { nombres: 'Juan', apellidosRazonSocial: 'Pérez' }, fechaEmision: '2023-12-01T00:00:00Z', totalFinal: 500.00, estado: 'EMITIDA' },
        { id: 2, numeroProforma: 'PROF-2023-0002', clienteId: 2, cliente: { nombres: 'Maria', apellidosRazonSocial: 'Gomez' }, fechaEmision: '2023-12-05T00:00:00Z', totalFinal: 1200.50, estado: 'ACEPTADA' },
        { id: 3, numeroProforma: 'PROF-2023-0003', clienteId: 3, cliente: { nombres: 'Carlos', apellidosRazonSocial: 'López' }, fechaEmision: '2023-12-10T00:00:00Z', totalFinal: 300.00, estado: 'ANULADA' }
      ];

      if (search) {
        const q = search.toLowerCase();
        mockData = mockData.filter(p => 
          p.numeroProforma.toLowerCase().includes(q) || 
          (p.cliente && p.cliente.nombres.toLowerCase().includes(q))
        );
      }

      if (estado) {
        mockData = mockData.filter(p => p.estado === estado);
      }

      req.reply({
        statusCode: 200,
        body: { data: mockData, total: mockData.length }
      });
    }).as('getProformas');

    // 3. Flujo natural
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    // Navegar a Proformas
    cy.get('.sidebar-menu').contains('Proformas').click();
    cy.url().should('include', '/proformas');
    cy.wait('@getProformas');
  });

  it('Muestra la lista de proformas correctamente', () => {
    cy.contains('PROF-2023-0001').should('be.visible');
    cy.contains('Juan Pérez').should('be.visible');
    cy.contains('EMITIDA').should('be.visible');
  });

  it('Filtra proformas usando la barra de búsqueda', () => {
    cy.get('input[placeholder="Buscar por número o cliente..."]').type('PROF-2023-0002{enter}');
    cy.wait('@getProformas');
    
    cy.contains('Maria Gomez').should('be.visible');
    cy.contains('Juan Pérez').should('not.exist');
  });

  it('Filtra proformas por estado usando el dropdown', () => {
    cy.get('select').first().select('ACEPTADA');
    cy.wait('@getProformas');
    
    cy.contains('PROF-2023-0002').should('be.visible');
    cy.contains('PROF-2023-0001').should('not.exist');
  });

  it('Permite llenar el formulario y crear nueva proforma', () => {
    cy.intercept('POST', '**/api/v1/proformas', {
      statusCode: 201,
      body: { success: true, message: 'Proforma creada' }
    }).as('createProforma');

    cy.get('.btn-create-new').click();
    cy.get('.proforma-modal-premium').should('exist');
    cy.contains('Nueva Proforma').should('be.visible');

    // Seleccionar cliente
    cy.get('.btn-select-client-empty').click();
    cy.get('.search-input-group input').type('Juan Pérez');
    cy.get('.client-result-item').contains('Juan Pérez').click();

    // Seleccionar producto
    cy.get('.item-row-card select').select('1');
    cy.get('.item-row-card input[type="number"]').eq(0).clear().type('5'); // cantidad

    // Guardar
    cy.get('.btn-save-full').click();
    cy.wait('@createProforma');
    cy.get('.proforma-modal-premium').should('not.exist');
  });
});
