describe('Password Recovery Flow', () => {
  beforeEach(() => {
    // Interceptar llamadas a la API de recuperación
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 200,
      body: { success: true, message: 'Correo enviado' }
    }).as('forgotPassword');

    cy.intercept('POST', '**/auth/reset-password', {
      statusCode: 200,
      body: { success: true, message: 'Contraseña restablecida exitosamente' }
    }).as('resetPassword');
  });

  describe('Forgot Password UI', () => {
    it('should navigate to forgot password page from login', () => {
      cy.visit('/');
      cy.contains('¿Olvidaste tu contraseña?').click();
      cy.url().should('include', '/forgot-password');
      cy.contains('¿Olvidaste tu contraseña?').should('be.visible');
    });

    it('should show an error if email is empty', () => {
      cy.visit('/forgot-password');
      // Intenta enviar sin correo (debería estar bloqueado por el HTML5 'required' o mostrar error)
      // Como el input tiene 'required', Cypress nos dejaría hacer click pero el form no se envía
      cy.get('button[type="submit"]').click();
      cy.get('input[type="email"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should show success message when sending a valid email', () => {
      cy.visit('/forgot-password');
      cy.get('input[type="email"]').type('usuario@ejemplo.com');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@forgotPassword');
      
      cy.contains('¡Solicitud Enviada!').should('be.visible');
      cy.contains('usuario@ejemplo.com').should('be.visible');
    });
  });

  describe('Reset Password UI', () => {
    it('should show an error state if no token is provided', () => {
      cy.visit('/reset-password');
      cy.contains('Enlace Inválido').should('be.visible');
      cy.contains('El enlace de recuperación es inválido').should('be.visible');
    });

    it('should show validation errors for password length and mismatch', () => {
      cy.visit('/reset-password?token=fake-token-123');
      
      // Contraseñas cortas
      cy.get('input[placeholder="Mínimo 6 caracteres"]').type('123');
      cy.get('input[placeholder="Vuelve a escribir la contraseña"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');

      // Contraseñas no coinciden
      cy.get('input[placeholder="Mínimo 6 caracteres"]').clear().type('123456');
      cy.get('input[placeholder="Vuelve a escribir la contraseña"]').clear().type('abcdef');
      cy.get('button[type="submit"]').click();
      cy.contains('Las contraseñas no coinciden').should('be.visible');
    });

    it('should allow the user to toggle password visibility', () => {
      cy.visit('/reset-password?token=fake-token-123');
      cy.get('input[placeholder="Mínimo 6 caracteres"]').should('have.attr', 'type', 'password');
      cy.get('.eye').first().click();
      cy.get('input[placeholder="Mínimo 6 caracteres"]').should('have.attr', 'type', 'text');
    });

    it('should show success message on successful reset', () => {
      cy.visit('/reset-password?token=fake-token-123');
      
      cy.get('input[placeholder="Mínimo 6 caracteres"]').type('NuevaPass123!');
      cy.get('input[placeholder="Vuelve a escribir la contraseña"]').type('NuevaPass123!');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@resetPassword').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          token: 'fake-token-123',
          password: 'NuevaPass123!'
        });
      });

      cy.contains('¡Contraseña Actualizada!').should('be.visible');
      cy.contains('Tu contraseña ha sido restablecida exitosamente').should('be.visible');
      
      // Debe haber un botón para volver al login
      cy.contains('Iniciar Sesión').click();
      cy.url().should('include', '/');
    });
  });
});
