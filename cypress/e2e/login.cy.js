describe('Flujo de Autenticación', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Muestra error al usar credenciales incorrectas', () => {
    // Mockeamos la respuesta de error para no depender del backend
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Credenciales incorrectas' }
    }).as('loginFail');

    cy.get('input[name="username"]').type('usuario_falso');
    cy.get('input[name="password"]').type('clave_falsa');
    cy.get('button[type="submit"]').click();
    // Buscar el texto literal del error en lugar de la clase autogenerada
    cy.contains('Credenciales incorrectas').should('be.visible');
  });

  it('Inicia sesión exitosamente y redirige a Home', () => {
    // Nota: Para una prueba real, el backend debe estar corriendo o la red debe ser mockeada.
    // Mockear la ruta correcta y con la estructura esperada por useAuth (success, data)
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          usuario: { id: 1, username: 'paul', rol: 'ADMIN', nombres: 'Paul' }
        }
      }
    }).as('loginRequest');

    cy.get('input[name="username"]').type('paul');
    cy.get('input[name="password"]').type('hola');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    
    // Debería redirigir al dashboard
    cy.url().should('include', '/home');
    cy.contains('Bienvenido de vuelta, paul').should('be.visible');
  });
});
