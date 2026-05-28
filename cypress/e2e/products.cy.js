describe('Gestión de Productos', () => {
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

    // 2. Mock de productos dinámico
    cy.intercept('GET', '**/api/v1/productos*', (req) => {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const tipo = url.searchParams.get('tipo') || '';
      
      let mockData = [
        { id: 1, nombre: 'Parquet Guayacán', tipo: 'producto', precioBase: 12.50, stockActual: 100, aplicaIva: true, estado: true, codigo: 'PROD-001' },
        { id: 2, nombre: 'Instalación', tipo: 'servicio', precioBase: 5.00, stockActual: 0, aplicaIva: false, estado: true, codigo: 'SERV-001' }
      ];

      if (search.includes('Guayacán')) {
        mockData = mockData.filter(p => p.nombre.includes('Guayacán'));
      }
      
      if (tipo === 'servicio') {
        mockData = mockData.filter(p => p.tipo === 'servicio');
      }

      req.reply({
        statusCode: 200,
        body: { data: mockData, total: mockData.length }
      });
    }).as('getProductos');

    // 3. Flujo natural
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/home');
    
    // 4. Navegar a productos
    cy.get('.sidebar-menu').contains('Productos').click();
    cy.url().should('include', '/products');
    cy.wait('@getProductos');
  });

  it('Filtra productos usando la barra de búsqueda', () => {
    cy.get('input[placeholder="Buscar producto por nombre o código..."]').type('Guayacán{enter}');
    cy.wait('@getProductos');
    
    // Debería verse el parquet pero no la instalación
    cy.contains('Parquet Guayacán').should('be.visible');
    cy.contains('Instalación').should('not.exist');
  });

  it('Filtra por tipo de producto/servicio', () => {
    cy.get('select').first().select('servicio'); // Selecciona servicios
    cy.wait('@getProductos');
    
    cy.contains('Instalación').should('be.visible');
    cy.contains('Parquet Guayacán').should('not.exist');
  });

  it('Permite llenar el formulario y crear un nuevo producto', () => {
    // Interceptamos la petición POST
    cy.intercept('POST', '**/api/v1/productos', {
      statusCode: 201,
      body: { success: true, message: 'Producto creado' }
    }).as('createProducto');

    // Abre el modal
    cy.get('.btn-create-new').click();
    cy.get('.product-modal-container').should('exist');

    // Llena el formulario
    cy.get('input[name="codigo"]').type('NVO-100');
    cy.get('input[name="nombre"]').type('Nuevo Producto Prueba');
    cy.get('select[name="tipo"]').select('producto');
    cy.get('input[name="precioBase"]').type('25.50');
    cy.get('input[name="stockActual"]').type('50');
    cy.get('textarea[name="descripcion"]').type('Descripción de prueba Cypress');
    
    // Checkbox de IVA
    cy.get('input[name="aplicaIva"]').check();

    // Guardar
    cy.get('.btn-save').click();

    // Verificamos que se haya enviado la petición
    cy.wait('@createProducto');
    
    // Verificamos que el modal se cierre
    cy.get('.product-modal-container').should('not.exist');
  });
});
