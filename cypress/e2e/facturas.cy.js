describe('Gestión de Facturas', () => {
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

    // 2. Mocks de datos generales para evitar deslogueo
    cy.intercept('GET', '**/api/v1/clientes*', { statusCode: 200, body: { data: [], total: 0 } }).as('getClientes');
    cy.intercept('GET', '**/api/v1/productos*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProductos');
    cy.intercept('GET', '**/api/v1/proformas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProformas');
    cy.intercept('GET', '**/api/v1/config*', { statusCode: 200, body: { data: {} } }).as('getConfig');

    // 3. Mocks de proveedores y facturas
    cy.intercept('GET', '**/api/v1/proveedores*', {
      statusCode: 200,
      body: {
        data: [
          { id: 1, razonSocial: 'Distribuidora XYZ', identificacion: '1791234567001' },
          { id: 2, razonSocial: 'Importadora ABC', identificacion: '0998765432001' }
        ]
      }
    }).as('getProveedoresList');

    cy.intercept('GET', '**/api/v1/facturas*', (req) => {
      const url = new URL(req.url);
      const proveedorId = url.searchParams.get('proveedorId') || '';
      
      let mockData = [
        { id: 1, numeroFactura: 'FAC-001-002-000000123', proveedorId: 1, proveedor: { razonSocial: 'Distribuidora XYZ', identificacion: '1791234567001' }, fechaEmision: '2023-10-15T00:00:00Z', total: 1500.50, items: [{}, {}] },
        { id: 2, numeroFactura: 'FAC-001-002-000000456', proveedorId: 2, proveedor: { razonSocial: 'Importadora ABC', identificacion: '0998765432001' }, fechaEmision: '2023-11-20T00:00:00Z', total: 850.00, items: [{}] }
      ];

      if (proveedorId) {
        mockData = mockData.filter(f => f.proveedorId.toString() === proveedorId);
      }

      req.reply({
        statusCode: 200,
        body: { data: mockData, total: mockData.length }
      });
    }).as('getFacturas');

    // 3. Flujo natural
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    // Navegar a facturas
    cy.get('.sidebar-menu').contains('Facturas').click();
    cy.url().should('include', '/facturas');
    cy.wait('@getFacturas'); // Esperar carga inicial
  });

  it('Muestra la lista de facturas correctamente', () => {
    cy.wait('@getProveedoresList');
    cy.contains('FAC-001-002-000000123').should('be.visible');
    cy.contains('Distribuidora XYZ').should('be.visible');
    cy.contains('$1500.50').should('be.visible');
  });

  it('Filtra facturas usando la barra de búsqueda', () => {
    cy.get('input[placeholder="Buscar por número de factura o proveedor..."]').type('FAC-001-002-000000456');
    // En facturas.jsx la búsqueda es local, no requiere Enter ni Network Wait
    
    cy.contains('Importadora ABC').should('be.visible');
    cy.contains('FAC-001-002-000000123').should('not.exist');
  });

  it('Filtra facturas por proveedor usando el dropdown', () => {
    cy.get('.filter-select-premium').select('1'); // Selecciona proveedor XYZ
    cy.wait('@getFacturas');
    cy.wait(500); // Dar tiempo al react para re-renderizar
    
    cy.contains('FAC-001-002-000000123').should('be.visible');
    cy.contains('FAC-001-002-000000456').should('not.exist');
  });

  it('Abre el modal, analiza un documento y registra nueva factura', () => {
    // 1. Interceptar el análisis de IA
    cy.intercept('POST', '**/api/v1/facturas/analizar', {
      statusCode: 200,
      body: {
        datosExtraidos: {
          numeroFactura: '001-001-123456789',
          fechaEmision: '2023-11-20',
          total: 150.00,
          items: [{ descripcion: 'Monitor Dell 24"', cantidad: 1, precioUnitario: 150.00, totalItem: 150.00 }]
        },
        candidatosProveedor: [{ id: 1, razonSocial: 'Distribuidora XYZ', identificacion: '1791234567001', _score: 100 }],
        avisos: []
      }
    }).as('analizarFactura');

    // 2. Interceptar la confirmación
    cy.intercept('POST', '**/api/v1/facturas/confirmar', {
      statusCode: 201,
      body: { success: true, message: 'Factura confirmada' }
    }).as('confirmarFactura');

    // Abrir modal
    cy.get('.btn-create-new').click();
    cy.get('.factura-modal-premium').should('exist');

    // Subir archivo (simulado)
    cy.get('input[type="file"]').selectFile('cypress/fixtures/factura_test.pdf', { force: true });
    
    // Clic en Analizar
    cy.get('.btn-analizar').click();
    cy.wait('@analizarFactura');

    // Verificar Paso 2 (Revisión)
    cy.contains('Revisar y Confirmar').should('be.visible');
    cy.get('.factura-field input[type="text"]').should('have.value', '001-001-123456789');
    
    // Confirmar
    cy.get('.btn-confirmar-factura').click();
    cy.wait('@confirmarFactura');
    
    cy.get('.factura-modal-premium').should('not.exist');
  });
});
