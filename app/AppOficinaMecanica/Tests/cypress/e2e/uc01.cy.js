/// <reference types="cypress" />

describe('Testes para caso de uso 1 (Inicialização de sistema):', ()=>{
    
    before(()=>{
        // Insere usuários no banco de dados
        cy.fixture('uc1').then( (data)=>{
            for(let client of data.clients){
                cy.task('insertClient', {user: client.user, client: client.clientData, vehicles: client.vehicles})
            }
            for(let employee of data.employees){
                cy.task('insertEmployee', {user: employee.user, employee: employee.employeeData})
            }
        })
    })

    beforeEach(()=>{
        // Visita a página principal
        cy.visit('http://node.js:3000');
    })
    
    after(()=>{
        // Reseta banco de dados
        cy.task('resetDB');
    });

    
    it('CT1: Teste de acesso a página de cadastramento', () => {
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.contains('Cadastrar').click();
        cy.url().should('eq', 'http://node.js:3000/register');
        cy.visit('http://node.js:3000');
        cy.contains('Quero me cadastrar').click()
        cy.url().should('eq', 'http://node.js:3000/register');
    });
    
    it('CT2: Teste de login com de usuário e senha inválidos', () => {
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('user1');
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();
        cy.contains('Nome de usuário ou senha fornecidos incorretos').should('exist');
        cy.get('#alertCloseBtn').click();
        cy.get('#username').clear().type('dummy1');
        cy.get('#password').clear().type('senha1');
        cy.contains('Login').click();
        cy.contains('Nome de usuário ou senha fornecidos incorretos').should('exist');
        cy.get('#alertCloseBtn').click();
        cy.contains('Fechar').click();
        cy.get('#loginModal').should('not.be.visible');
    });
    
    it('CT3: Teste de login com de usuário e senha em branco', () => {
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();
        cy.focused().should('have.id','username');
        cy.get('#username').clear().type('dummy1');
        cy.get('#password').clear();
        cy.contains('Login').click();
        cy.focused().should('have.id','password');
        cy.get('#username').clear();
        cy.get('#password').clear();
        cy.contains('Login').click();
        cy.focused().should('have.id','username');
        cy.contains('Fechar').click();
        cy.get('#loginModal').should('not.be.visible');
    });

    it('CT4: Teste de login com de usuário cliente', () => {    
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('dummy1');
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();

        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, José!').should('exist');
        cy.contains('Acessar serviços de orçamento').should('exist');
        cy.contains('Acessar serviços de reparo').should('exist');
        cy.contains('Acessar serviços de motorista').should('exist');
    });

    it('CT5: Teste de login com de usuário mecânico',()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('mecanico');
        cy.get('#password').type('mecanico');
        cy.contains('Login').click();

        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, Cláudio!').should('exist');
        cy.contains('Acessar serviços de orçamento').should('exist');
        cy.contains('Acessar serviços de reparo').should('exist');
        cy.contains('Acessar busca de peças no estoque').should('exist');
    });

    it('CT6: Teste de login com de usuário gerente de orçamento',()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('gerente1');
        cy.get('#password').type('gerente1');
        cy.contains('Login').click();

        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, Márcio!').should('exist');
        cy.contains('Acessar área de orçamentos').should('exist');
        cy.contains('Acessar área de faturas').should('exist');
    });
    
    it('CT7: Teste de login com de usuário gerente de estoque',()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('gerente2');
        cy.get('#password').type('gerente2');
        cy.contains('Login').click();

        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, Roberto!').should('exist');
        cy.contains('Acessar Gerenciamento de Estoque').should('exist');
        cy.contains('Acessar Requisições de Compra de Peças').should('exist');
    });
});
