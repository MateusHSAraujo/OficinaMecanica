/// <reference types="cypress" />

describe('Testes para caso de uso 14 (Visualização de serviços de reparos agendados) e relacionados (Execução de serviço de reparo):',()=>{

    beforeEach(()=>{
        cy.viewport(1800,1000)
        cy.task('resetDB')
        cy.fixture('uc14').then((data)=>{
            cy.task('insertClient', {user: data.client.user, client: data.client.clientData, vehicles: data.client.vehicles})
            cy.task('insertEmployee', {user: data.mechanic.user, employee:  data.mechanic.employeeData})
            cy.task('insertEmployee', {user: data.manager.user, employee:  data.manager.employeeData})

            cy.task('insertBS',{clientInfo: data.client.user,
                                vehicleInfo: data.client.vehicles[0],
                                BSInfo: data.BS,
                                managerInfo: data.manager.user,
                                mechanicInfo: data.mechanic.user,
                                budgetInfo: data.budget })

            cy.task('insertRS',{
                clientInfo: data.client.user ,mechanicInfo: data.mechanic.user, BSInfo:data.BS ,RSInfo: data.RS
            })
            
            cy.task('insertParts',{partsInfo: data.parts})
        })

        cy.visit('http://node.js:3000');
        cy.contains('Iniciar Sessão').click();
        cy.get('#username').type('mecanico');
        cy.get('#password').type('mecanico');
        cy.contains('Login').click();
        cy.contains('Acessar serviços de reparo').click();
    })

    afterEach(()=>{
        cy.task('resetDB')
    })

    it('CT1: Teste de execução de serviço de reparo',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()

        cy.get('#piece').select('Parafuso P740')
        cy.get('#quantity').type(4)
        cy.get('button').contains('Adicionar peça').click()
        cy.get('#piece').select('Porca P530')
        cy.get('#quantity').type(3)
        cy.get('button').contains('Adicionar peça').click()

        cy.get('#comments').type('Reparo realizado sem maiores problemas.')
        cy.get('button').contains('Enviar').click()

        cy.fixture('uc14').then((data)=>{
            let changedRS = data.RS
            changedRS.status = 'Serviço encerrado'
            changedRS.completed = true
            changedRS.mechanicComment = 'Reparo realizado sem maiores problemas.'

            let usedParts = [
                {
                    name: 'Parafuso P740',
                    ammount: 4
                },
                {
                    name: 'Porca P530',
                    ammount: 3
                }
            ]
            
            cy.task('findRS',{
                clientInfo: data.client.user,
                managerInfo: data.manager.user,
                mechanicInfo: data.mechanic.user,
                vehicleInfo: data.client.vehicles[0],
                BSInfo: data.BS,
                budgetInfo: data.budget,
                RSInfo: changedRS,
                partsInfo: usedParts
            })
        })
    })

    it('CT2: Teste de remoção de peças da lista de peças usadas',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()

        cy.get('#piece').select('Parafuso P740')
        cy.get('#quantity').type(4)
        cy.get('button').contains('Adicionar peça').click()
        cy.get('#piece').select('Porca P530')
        cy.get('#quantity').type(3)
        cy.get('button').contains('Adicionar peça').click()

        cy.contains('Porca P530').next().next().next().contains('Remover').click()

        cy.get('#comments').type('Reparo realizado sem maiores problemas.')
        cy.get('button').contains('Enviar').click()

        cy.fixture('uc14').then((data)=>{
            let changedRS = data.RS
            changedRS.status = 'Serviço encerrado'
            changedRS.completed = true
            changedRS.mechanicComment = 'Reparo realizado sem maiores problemas.'

            let usedParts = [
                {
                    name: 'Parafuso P740',
                    ammount: 4
                }
            ]
            
            cy.task('findRS',{
                clientInfo: data.client.user,
                managerInfo: data.manager.user,
                mechanicInfo: data.mechanic.user,
                vehicleInfo: data.client.vehicles[0],
                BSInfo: data.BS,
                budgetInfo: data.budget,
                RSInfo: changedRS,
                partsInfo: usedParts
            })
        })
    })

    it('CT3: Teste de inputs incorretos',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()

        let btn = cy.get('button').contains('Enviar')

        // Tenta finalizar o serviço sem descrição
        btn.click()
        cy.focused().should('have.id','comments')

        // Tenta finalizar o serviço com uma descrição contendo só espaços
        cy.get('#comments').type('                                 ')
        btn.click()
        cy.contains('Campo de detalhes preenchido incorretamente. Reescreva-o e tente novamente.').should('exist')

        // Tenta selecionar uma quantidade de peças maior do que o disponível
        cy.get('#comments').clear().type('Reparo realizado sem maiores problemas.')
        cy.get('#piece').select('Parafuso P740')
        cy.get('#quantity').type(80000)
        cy.get('button').contains('Adicionar peça').should('be.disabled')

        // Tenta selecionar uma quantidade de peças negativa
        cy.get('#piece').select('Parafuso P740')
        cy.get('#quantity').clear().type(-2)
        cy.get('button').contains('Adicionar peça').should('be.disabled')
    })
    
})