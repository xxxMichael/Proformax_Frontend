describe('Navegación Global', () => {
  beforeEach(() => {
    // 1. Mock de Login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          usuario: { id: 1, username: 'admin', rol: 'ADMIN', nombres: 'Test Admin' }
        }
      }
    }).as('loginRequest');

    // 2. Mocks de datos generales
    cy.intercept('GET', '**/api/v1/clientes*', { statusCode: 200, body: { data: [], total: 0 } }).as('getClientes');
    cy.intercept('GET', '**/api/v1/productos*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProductos');
    cy.intercept('GET', '**/api/v1/proformas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProformas');
    cy.intercept('GET', '**/api/v1/proveedores*', { statusCode: 200, body: { data: [], total: 0 } }).as('getProveedores');
    cy.intercept('GET', '**/api/v1/config*', { statusCode: 200, body: { data: {} } }).as('getConfig');
    cy.intercept('GET', '**/api/v1/facturas*', { statusCode: 200, body: { data: [], total: 0 } }).as('getFacturas');

    // 3. Flujo de Login natural
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    
    // Esperamos que inicie sesión y llegue al home
    cy.wait('@loginRequest');
    cy.url().should('include', '/home');
    
    // Aseguramos que la página principal cargue
    cy.wait(['@getProformas', '@getClientes', '@getProductos', '@getProveedores']);
    cy.get('.sidebar-menu').should('be.visible');
  });

  it('Navega correctamente por las secciones principales del menú', () => {
    // Ir a Clientes
    cy.get('.sidebar-menu').contains('Clientes').click();
    cy.url().should('include', '/clients');
    cy.contains('Nuevo Cliente').should('be.visible');

    // Ir a Productos
    cy.get('.sidebar-menu').contains('Productos').click();
    cy.url().should('include', '/products');
    cy.contains('Nuevo Producto').should('be.visible');

    // Ir a Proveedores
    cy.get('.sidebar-menu').contains('Proveedores').click();
    cy.url().should('include', '/suppliers');
    cy.contains('Nuevo Proveedor').should('exist');

    // Ir a Facturas
    cy.get('.sidebar-menu').contains('Facturas').click();
    cy.url().should('include', '/facturas');

    // Ir a Proformas
    cy.get('.sidebar-menu').contains('Proformas').click();
    cy.url().should('include', '/proformas');
  });
});
