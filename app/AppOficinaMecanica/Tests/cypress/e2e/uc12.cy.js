/// <reference types="cypress" />

describe('Testes para caso de uso 12 (Visualização de planilha de orçamentos) e relacionados (Geração de novo orçamento, Aprovação de orçamento registrado, Rejeição de orçamento registrado, Deleção de orçamento registrado):', ()=>{

    beforeEach(()=>{
        cy.viewport(1800,1000)
        cy.task('resetDB')
        // Insere usuários no banco de dados
        cy.fixture('uc12').then( (data)=>{
            
            cy.task('insertClient', {user: data.client.user, client: data.client.clientData, vehicles: data.client.vehicles})
            
            for(let employee of data.employees){
                cy.task('insertEmployee', {user: employee.user, employee: employee.employeeData})
            }

            // Insere requisição de serviço ainda não iniciado
            cy.task('insertBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: undefined, 
                vehicleInfo: data.client.vehicles[0], 
                budgetInfo: undefined,
                BSInfo: data.BS[0]
            })

            // Insere requisição de serviço cujo orçamento tem status aprovação pendente
            cy.task('insertBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[0].user, 
                vehicleInfo: data.client.vehicles[1], 
                budgetInfo: data.budgets[0],
                BSInfo: data.BS[1]
            })

            // Insere requisição de serviço cujo orçamento tem status reprovação pendente
            cy.task('insertBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[1].user, 
                vehicleInfo: data.client.vehicles[2], 
                budgetInfo: data.budgets[1],
                BSInfo: data.BS[2]
            })

            // Insere requisição de serviço finalizado
            cy.task('insertBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[2].user, 
                vehicleInfo: data.client.vehicles[3], 
                budgetInfo: data.budgets[2],
                BSInfo: data.BS[3]
            })

        })
        cy.visit('http://node.js:3000');
        cy.contains('Iniciar Sessão').click();
        cy.get('#username').type('gerente');
        cy.get('#password').type('gerente');
        cy.contains('Login').click();
        cy.contains('Acessar área de orçamentos').click();
    })

    after(()=>{
        cy.task('resetDB')
    })
    
    it('CT1: Teste de geração de novo orçamento',()=>{  
        cy.get('button').contains('Gerar').trigger('mousedown').trigger('mouseup').click()
        
        cy.get('#initiateServiceModal').should('be.visible').then(()=>{
            cy.get('#mechanic').select('Cláudio')
            cy.get('#initialValue').type(100)
            cy.get('button[type=submit]').contains('Enviar').click()
        })

        cy.reload()
        cy.fixture('uc12').then((data)=>{
            let changedBS = data.BS[0]
            changedBS.status = "Em andamento"

            let newBudget = {   status: 'Aguardando avaliação',
                                total_cost: 100
            }
            // Busca serviço recém criado
            cy.task('findBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[0].user, 
                vehicleInfo: data.client.vehicles[0], 
                budgetInfo: newBudget,
                BSInfo: changedBS
            }).then((res)=>{
                expect(res).to.not.eq(false)
            })
        })
    })

    it('CT2: Teste de aprovação de orçamento registrado',()=>{
        cy.contains('Aprovação pendente').next().contains('Aprovar').click()

        cy.reload()
        cy.fixture('uc12').then((data)=>{
            let changedBS = data.BS[1]
            changedBS.status = "Serviço encerrado"

            let changedBudget = data.budgets[0]
            changedBudget.status = "Aprovado"

            // Busca serviço recém criado
            cy.task('findBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[0].user, 
                vehicleInfo: data.client.vehicles[1], 
                budgetInfo: changedBudget,
                BSInfo: changedBS
            }).then((res)=>{
                expect(res).to.not.eq(false)
            })
        })
    })

    it('CT3: Teste de rejeição de serviço com orçamento cujo status é \'Rejeição pendente\'',()=>{
        cy.contains('Rejeição pendente').next().contains('Rejeitar').click()

        cy.reload()
        cy.fixture('uc12').then((data)=>{
            let changedBS = data.BS[2]
            changedBS.status = "Serviço encerrado"

            let changedBudget = data.budgets[1]
            changedBudget.status = "Rejeitado"

            // Busca serviço recém criado
            cy.task('findBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[1].user, 
                vehicleInfo: data.client.vehicles[2], 
                budgetInfo: changedBudget,
                BSInfo: changedBS
            }).then((res)=>{
                expect(res).to.not.eq(false)
            })
        })
    })
    

    it('CT4: Teste de rejeição de serviço com orçamento cujo status é \'Aprovação pendente\'',()=>{
        cy.contains('Aprovação pendente').next().contains('Rejeitar').click()
        cy.get('#details').type('Houve um erro na contabilidade do serviço. Por isso, ele foi cancelado!')
        cy.contains('Confirmar Rejeição').click()

        cy.reload()
        cy.fixture('uc12').then((data)=>{
            let changedBS = data.BS[1]
            changedBS.status = "Serviço encerrado"
            changedBS.budgetManagerComment = 'Houve um erro na contabilidade do serviço. Por isso, ele foi cancelado!'

            let changedBudget = data.budgets[0]
            changedBudget.status = "Rejeitado"

            // Busca serviço recém criado
            cy.task('findBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[0].user, 
                vehicleInfo: data.client.vehicles[1], 
                budgetInfo: changedBudget,
                BSInfo: changedBS
            }).then((res)=>{
                expect(res).to.not.eq(false)
            })
        })
    })
    
    it('CT5: Teste de deleção de serviço de orçamento finalziado',()=>{
        cy.contains('Aprovado').next().contains('Deletar').click()
        cy.reload()
        cy.fixture('uc12').then((data)=>{

            // Busca serviço recém criado
            cy.task('findBS',{
                clientInfo: data.client.user,
                managerInfo: data.employees[3].user, 
                mechanicInfo: data.employees[2].user, 
                vehicleInfo: data.client.vehicles[3], 
                budgetInfo: data.budgets[2],
                BSInfo: data.BS[3]
            }).then((res)=>{
                expect(res).to.eq(false)
            })
        })
    })

    it('CT6: Teste de inputs incorretos',()=>{
        cy.get('button').contains('Gerar').trigger('mousedown').trigger('mouseup').click()
        
        // Tenta gerar novo serviço sem selecionar um mecâncico ou um valor inicial
        cy.get('button[type=submit]').contains('Enviar').click()
        cy.focused().should('have.id','mechanic')

        // Tenta gerar novo serviço sem selecionar um valor inicial
        cy.get('#mechanic').select(0)
        cy.get('button[type=submit]').contains('Enviar').click()
        cy.focused().should('have.id','initialValue')

        cy.reload()
        cy.get('button').contains('Gerar').trigger('mousedown').trigger('mouseup').click()
        
        // Tenta gerar novo serviço sem fornecer um valor inicial
        cy.get('#mechanic').select(0)
        cy.get('button[type=submit]').contains('Enviar').click()
        cy.focused().should('have.id','initialValue')

        // Tenta gerar novo serviço com um valor inicial negativo
        cy.get('#initialValue').type(-100)
        cy.get('button[type=submit]').contains('Enviar').click()
        cy.focused().should('have.id','initialValue')

        cy.reload()
        cy.contains('Rejeitar').click()

        // Tenta rejeitar um orçamento sem fornecer justificativa
        cy.contains('Confirmar Rejeição').click()
        cy.focused().should('have.id','details')

        // Tenta rejeitar um orçamento com uma justificativa contendo somente espaços
        cy.get('#details').type('                ')
        cy.contains('Confirmar Rejeição').click()
        cy.contains('Fechar').click()
        cy.contains('Campo de detalhes preenchido incorretamente. Reescreva-o e tente novamente.').should('exist')

    })
})