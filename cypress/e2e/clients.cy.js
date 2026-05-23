describe('Gestión de Clientes', () => {
  beforeEach(() => {
    // 1. Mock de Login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          usuario: { id: 1, username: 'admin', rol: 'ADMIN', nombres: 'Admin' }
        }
      }
    }).as('loginRequest');

    // 2. Mock de clientes
    cy.intercept('GET', '**/api/v1/clientes*', {
      statusCode: 200,
      body: {
        data: [
          { id: 1, nombres: 'Juan', apellidosRazonSocial: 'Perez', identificacion: '1234567890' }
        ],
        total: 1
      }
    }).as('getClientes');

    // 3. Flujo natural
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/home');
    
    // 4. Navegar a clientes
    cy.get('.sidebar-menu').contains('Clientes').click();
    cy.url().should('include', '/clients');
    cy.wait('@getClientes');
  });

  it('Muestra la lista de clientes correctamente', () => {
    cy.contains('Juan').should('be.visible');
    cy.contains('Perez').should('be.visible');
    cy.contains('1234567890').should('be.visible');
  });

  it('Abre el modal para crear un nuevo cliente', () => {
    cy.get('button').contains('Nuevo Cliente').click();
    cy.get('.modal-overlay').should('exist'); // Verifica que se renderice el modal
    cy.contains('Nuevo Cliente').should('be.visible');
    
    // Cierra el modal
    cy.get('.btn-cancel').click();
    cy.get('.modal-overlay').should('not.exist');
  });

  it('Permite llenar el formulario y crear un nuevo cliente', () => {
    // Interceptamos la petición POST para crear el cliente
    cy.intercept('POST', '**/api/v1/clientes', {
      statusCode: 201,
      body: { success: true, message: 'Cliente creado' }
    }).as('createCliente');

    cy.get('button').contains('Nuevo Cliente').click();
    
    // Llenamos los datos del cliente
    cy.get('input[name="idNumber"]').type('1712345678');
    cy.get('input[name="names"]').type('Maria');
    cy.get('input[name="lastnames"]').type('Gomez');
    cy.get('input[name="phone"]').type('0991234567');
    cy.get('input[name="email"]').type('maria@correo.com');
    
    // Guardamos el cliente
    cy.get('.btn-save').click();
    
    // Verificamos que se haya hecho la petición de guardado
    cy.wait('@createCliente');
    
    // El modal debería cerrarse
    cy.get('.modal-overlay').should('not.exist');
  });
});
