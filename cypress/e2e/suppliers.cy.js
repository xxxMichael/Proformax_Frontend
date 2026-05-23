describe('Gestión de Proveedores', () => {
  Cypress.on('uncaught:exception', (err, runnable) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    return false;
  });

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

    // 2. Mocks de datos generales para que el Dashboard no falle y nos desloguee
    cy.intercept('GET', '**/api/v1/clientes*', { statusCode: 200, body: { data: [], total: 0 } }).as('getClientes');
    cy.intercept('GET', '**/api/v1/productos*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProductos');
    cy.intercept('GET', '**/api/v1/proformas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProformas');
    cy.intercept('GET', '**/api/v1/config*', { statusCode: 200, body: { data: {} } }).as('getConfig');
    cy.intercept('GET', '**/api/v1/facturas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getFacturas');

    // 3. Mock dinámico de proveedores
    cy.intercept('GET', '**/api/v1/proveedores*', (req) => {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      
      let mockData = [
        { id: 1, idType: 'RUC', identificacion: '1791234567001', razonSocial: 'Distribuidora XYZ', nombreComercial: 'XYZ', telefono: '0987654321', email: 'contacto@xyz.com', direccion: 'Quito' },
        { id: 2, idType: 'RUC', identificacion: '0998765432001', razonSocial: 'Importadora ABC', nombreComercial: 'ABC', telefono: '022345678', email: 'ventas@abc.com', direccion: 'Guayaquil' }
      ];

      const busqueda = url.searchParams.get('search') || '';
      let result = mockData;
      if (busqueda) {
        result = result.filter(p => p.razonSocial.includes(busqueda) || p.identificacion.includes(busqueda));
      }
      req.reply({ statusCode: 200, body: { data: result, total: result.length } });
    }).as('getProveedores');

    // Mover checkDuplicados ABAJO para que no sea tapado por el intercept wildcard
    cy.intercept('GET', '**/api/v1/proveedores/duplicados*', { statusCode: 200, body: [] }).as('checkDuplicados');

    // 4. Mock para crear y editar proveedor
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    // Navegar a proveedores
    cy.get('.sidebar-menu').contains('Proveedores').click();
    cy.url().should('include', '/suppliers');
    cy.wait('@getProveedores'); // Esperar carga inicial
  });

  it('Muestra la lista de proveedores correctamente', () => {
    cy.contains('Distribuidora XYZ').should('be.visible');
    cy.contains('Importadora ABC').should('be.visible');
  });

  it('Filtra proveedores usando la barra de búsqueda', () => {
    cy.get('input[placeholder="Buscar proveedor por nombre o identificación..."]').type('ABC{enter}');
    cy.wait('@getProveedores');
    
    cy.contains('Importadora ABC').should('be.visible');
    cy.contains('Distribuidora XYZ').should('not.exist');
  });

  it('Permite llenar el formulario y crear un nuevo proveedor', () => {
    // Interceptamos la petición POST para crear proveedor
    cy.intercept('POST', '**/api/v1/proveedores', {
      statusCode: 201,
      body: { success: true, message: 'Proveedor creado' }
    }).as('createProveedor');

    // Abre el modal
    cy.get('.btn-create-new').click();
    cy.get('.supplier-modal-container').should('exist');

    // Llena el formulario
    cy.get('select[name="idType"]').select('RUC');
    cy.get('input[name="identificacion"]').type('1712345675001');
    cy.get('input[name="razonSocial"]').type('Maderera Los Andes S.A.');
    cy.get('input[name="nombreComercial"]').type('Maderera Andes');
    cy.get('input[name="telefono"]').type('0999888777');
    cy.get('input[name="email"]').type('proveedor@maderera.com');
    cy.get('input[name="direccion"]').type('Av. 10 de Agosto, Quito');
    
    // Guardar
    cy.get('.btn-save').click();

    // Verificamos que se haya enviado la petición
    cy.wait('@createProveedor');
    
    // Verificamos que el modal se cierre
    cy.get('.supplier-modal-container').should('not.exist');
  });
});
