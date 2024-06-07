describe('Testes para caso de uso 13 (Visualização de serviços de orçamentos agendados) e relacionados (Execução de serviço de orçamento): ',()=>{

    beforeEach(()=>{
        cy.viewport(1800,1000)
        cy.task('resetDB')
        cy.fixture('uc13').then((data)=>{
            cy.task('insertClient', {user: data.client.user, client: data.client.clientData, vehicles: data.client.vehicles})
            cy.task('insertEmployee', {user: data.mechanic.user, employee:  data.mechanic.employeeData})
            cy.task('insertEmployee', {user: data.manager.user, employee:  data.manager.employeeData})

            cy.task('insertBS',{clientInfo: data.client.user,
                                vehicleInfo: data.client.vehicles[0],
                                BSInfo: data.BS,
                                managerInfo: data.manager.user,
                                mechanicInfo: data.mechanic.user,
                                budgetInfo: data.budget })

        })

        cy.visit('http://node.js:3000');
        cy.contains('Iniciar Sessão').click();
        cy.get('#username').type('mecanico');
        cy.get('#password').type('mecanico');
        cy.contains('Login').click();
        cy.contains('Acessar serviços de orçamento').click();
    })

    after(()=>{
        cy.task('resetDB')
    })

    it('CT1: Teste de execução de um serviço de orçamento possível',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()
        cy.get('#flexSwitchCheckDefault').check()
        cy.get('#handworkPrice').type(150)
        cy.get('#partsPrice').type(100)
        cy.get('#comments').type('Reparo pode ser relaizado sem maiores problemas.')
        cy.get('button').contains('Enviar').click()


        cy.fixture('uc13').then((data)=>{
            
            let changedBS = data.BS
            changedBS.status = "Avaliação finalizada"
            changedBS.mechanicComment = 'Reparo pode ser relaizado sem maiores problemas.'

            let changedBudget = data.budget
            changedBudget.status = "Aprovação pendente"
            changedBudget.parts_cost = 100
            changedBudget.service_cost = 150
            changedBudget.total_cost += 250

            cy.contains('Serviço executado com sucesso!').should('exist')
            cy.task('findBS',{clientInfo: data.client.user,
                vehicleInfo: data.client.vehicles[0],
                BSInfo: changedBS,
                managerInfo: data.manager.user,
                mechanicInfo: data.mechanic.user,
                budgetInfo: changedBudget }).then((data)=>{expect(data).to.not.eq(false)})
        })
    })
    
    it('CT2: Teste de execução de um serviço de orçamento impossível',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()
        cy.get('#comments').type('Reparo não pode ser relaizado. Faltam ferramentas na oficina.')
        cy.get('button').contains('Enviar').click()


        cy.fixture('uc13').then((data)=>{
            
            let changedBS = data.BS
            changedBS.status = "Avaliação finalizada"
            changedBS.mechanicComment = 'Reparo não pode ser relaizado. Faltam ferramentas na oficina.'

            let changedBudget = data.budget
            changedBudget.status = "Rejeição pendente"

            cy.contains('Serviço executado com sucesso!').should('exist')
            cy.task('findBS',{clientInfo: data.client.user,
                vehicleInfo: data.client.vehicles[0],
                BSInfo: changedBS,
                managerInfo: data.manager.user,
                mechanicInfo: data.mechanic.user,
                budgetInfo: changedBudget }).then((data)=>{expect(data).to.not.eq(false)})
        })
    })
    
    it('CT3: Teste de inputs incorretos',()=>{
        cy.get('button').contains('Executar').trigger('mousedown').click()

        // Tenta finalizar um serviço impossível sem qualquer comentário
        cy.get('button').contains('Enviar').click()
        cy.focused().should('have.id','comments')

        // Tenta finalizar um serviço impossível com comentário composto de espaços em branco
        cy.get('#comments').type('               ')
        cy.get('button').contains('Enviar').click()
        cy.contains('Campo de detalhes preenchido incorretamente. Reescreva-o e tente novamente.').should('exist')

        cy.get('#comments').clear()
        cy.get('#flexSwitchCheckDefault').check()

        // Tenta finalizar um serviço possível sem preço de mão-de-obra, preço de peças e comentário
        cy.get('button').contains('Enviar').click()
        cy.focused().should('have.id','handworkPrice')

        // Tenta finalizar um serviço possível sem preço de peças e comentário
        cy.get('#handworkPrice').type(100)
        cy.get('button').contains('Enviar').click()
        cy.focused().should('have.id','partsPrice')

        cy.get('#comments').clear().type('Serviço pode ser realizado com tranquilidade.')
        // Tenta finalizar um serviço possível com preço de mão-de-obra negativo
        cy.get('#handworkPrice').clear().type(-100)
        cy.get('#partsPrice').clear().type(100)
        cy.get('button').contains('Enviar').click()
        cy.focused().should('have.id','handworkPrice')

        // Tenta finalizar um serviço possível com preço de peças negativo
        cy.get('#handworkPrice').clear().type(100)
        cy.get('#partsPrice').clear().type(-100)
        cy.get('button').contains('Enviar').click()
        cy.focused().should('have.id','partsPrice')
    })
})