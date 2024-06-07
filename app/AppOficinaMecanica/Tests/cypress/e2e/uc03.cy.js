/// <reference types="cypress" />

describe('Testes para caso de uso 3 (Encerramento de sistema):',()=>{

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
        cy.visit('http://node.js:3000/');
    })
    
    after(()=>{
        cy.task('resetDB')
    })

    it('CT1: Testa logout com usuário cliente', ()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('dummy1');
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();

        cy.url().should('eq','http://node.js:3000/home');
        cy.contains('Bem-vindo, José!').should('exist');
        cy.contains('Acessar serviços de orçamento').should('exist');
        cy.contains('Acessar serviços de reparo').should('exist');
        cy.contains('Acessar serviços de motorista').should('exist');

        cy.contains('Encerrar sessão').click();
        cy.contains('Finalizar').click();
        cy.url().should('eq','http://node.js:3000/');      
    })

    it('CT2: Testa logout com usuário mecânico', ()=>{
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

        cy.contains('Encerrar sessão').click();
        cy.contains('Finalizar').click();
        cy.url().should('eq','http://node.js:3000/');      
    })

    it('CT3: Testa logout com usuário gerente de orçamento',()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('gerente1');
        cy.get('#password').type('gerente1');
        cy.contains('Login').click();

        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, Márcio!').should('exist');
        cy.contains('Acessar área de orçamentos').should('exist');
        cy.contains('Acessar área de faturas').should('exist');

        cy.contains('Encerrar sessão').click();
        cy.contains('Finalizar').click();
        cy.url().should('eq','http://node.js:3000/');
    });
    
    it('CT4: Testa logout com usuário gerente de estoque',()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('gerente2');
        cy.get('#password').type('gerente2');
        cy.contains('Login').click();

        
        cy.url().should('eq', 'http://node.js:3000/home');
        cy.contains('Bem-vindo, Roberto!').should('exist');
        cy.contains('Acessar Gerenciamento de Estoque').should('exist');
        cy.contains('Acessar Requisições de Compra de Peças').should('exist');

        cy.contains('Encerrar sessão').click();
        cy.contains('Finalizar').click();
        cy.url().should('eq','http://node.js:3000/');
    });

    it('CT1: Testa desistência de logout', ()=>{
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('dummy1');
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();

        cy.url().should('eq','http://node.js:3000/home');
        cy.contains('Bem-vindo, José!').should('exist');
        cy.contains('Acessar serviços de orçamento').should('exist');
        cy.contains('Acessar serviços de reparo').should('exist');
        cy.contains('Acessar serviços de motorista').should('exist');

        cy.contains('Encerrar sessão').click();
        cy.wait(500);
        cy.contains('Cancelar').click();

        cy.url().should('eq','http://node.js:3000/home');
        cy.contains('Bem-vindo, José!').should('exist');
        cy.contains('Acessar serviços de orçamento').should('exist');
        cy.contains('Acessar serviços de reparo').should('exist');
        cy.contains('Acessar serviços de motorista').should('exist');      
    })
})