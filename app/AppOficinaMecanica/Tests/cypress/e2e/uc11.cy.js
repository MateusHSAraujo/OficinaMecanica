/// <reference types="cypress" />

describe('Testes para caso de uso 11 (Requisição de serviço de orçamento):', ()=>{

    beforeEach(()=>{
        cy.viewport(1500,1000)
        // Insere usuários no banco de dados
        cy.fixture('uc11').then( (data)=>{
            for(let client of data.clients){
                cy.task('insertClient', {user: client.user, client: client.clientData, vehicles: client.vehicles})
            }
            for(let employee of data.employees){
                cy.task('insertEmployee', {user: employee.user, employee: employee.employeeData})
            }
        })
        cy.visit('http://node.js:3000');
        cy.contains('Iniciar Sessão').click();
        cy.wait(500);
        cy.get('#username').type('dummy1');
        cy.get('#password').type('dummy1');
        cy.contains('Login').click();
        cy.contains('Acessar serviços de orçamento').click();
    })

    afterEach(()=>{
        cy.task('resetDB')
    })

    
    it('CT1: Teste de requisição de serviço de orçamento para um veículo',()=>{
        cy.fixture('uc11').then( (data)=>{
            let client = data.clients[0]
            let vehicle = client.vehicles[0]

            let BS = {
                repairType: 'Troca de peça',
                details: 'Trocar calota do pneu dianteiro esquerdo',
                date: '2024-01-19',
                time: '09:00',
            }

            cy.get('#vehicle').select(''+vehicle.model+' - '+vehicle.year+' - '+vehicle.licensePlate)
            cy.get('#repairType').select(BS.repairType)
            cy.get('#details').type(BS.details)
            cy.get('#date').type(BS.date).blur()
            cy.get('#time').select(BS.time)
            cy.contains('Agendar serviço').click()

    
            cy.task('findBS',{clientInfo:client.user,vehicleInfo:vehicle,BSInfo:BS}).then((res)=>{
                expect(res).not.to.eq(false);
            })
        })
    })
    
    it('CT2: Teste de requisição de serviço de orçamento para outro veículo',()=>{
        cy.fixture('uc11').then( (data)=>{
            let client = data.clients[0]
            let vehicle = client.vehicles[1]

            let BS = {
                repairType: 'Conserto de Lataria',
                details: 'Reparar amassado na capota',
                date: '2024-01-19',
                time: '09:30',
            }

            cy.get('#vehicle').select(''+vehicle.model+' - '+vehicle.year+' - '+vehicle.licensePlate)
            cy.get('#repairType').select(BS.repairType)
            cy.get('#details').type(BS.details)
            cy.get('#date').type(BS.date).blur()
            cy.get('#time').select(BS.time)
            cy.contains('Agendar serviço').click()

            cy.task('findBS',{clientInfo:client.user,vehicleInfo:vehicle,BSInfo:BS}).then((res)=>{               
                expect(res).not.to.eq(false);
            })
            
        })
    })
    
    it('CT3: Teste de requisição de serviço de orçamento para ainda outro veículo',()=>{
        cy.fixture('uc11').then( (data)=>{
            let client = data.clients[0]
            let vehicle = client.vehicles[2]

            let BS = {
                repairType: 'Pintura',
                details: 'Remover risco na porta do passageiro esquerda',
                date: '2024-01-19',
                time: '10:00',
            }

            cy.get('#vehicle').select(''+vehicle.model+' - '+vehicle.year+' - '+vehicle.licensePlate)
            cy.get('#repairType').select(BS.repairType)
            cy.get('#details').type(BS.details)
            cy.get('#date').type(BS.date).blur()
            cy.get('#time').select(BS.time)
            cy.contains('Agendar serviço').click()

    
            cy.task('findBS',{clientInfo:client.user,vehicleInfo:vehicle,BSInfo:BS}).then((res)=>{
                expect(res).not.to.eq(false);
            })
        })
    })
    
    it('CT4: Teste de requisição de reparo para um serviço de orçamento concluído',()=>{
        cy.fixture('uc11').then((data)=>{
            let client = data.clients[0]
            let vehicle = client.vehicles[0]
            let mechanic = data.employees[0]
            let manager = data.employees[1]
            let BS = data.BS[0]
            let budget = data.budgets[0]

            cy.task('insertBS',{clientInfo: client.user, 
                                managerInfo: manager.user, 
                                mechanicInfo: mechanic.user, 
                                vehicleInfo: vehicle, 
                                budgetInfo: budget,
                                BSInfo: BS })
                    .then((res)=>{
                                    expect(res).to.eq(true);
                                    cy.visit('http://node.js:3000/budget/home');
                                    cy.get('button').contains('Requisitar reparo').click()
                                    cy.url().should('eq','http://node.js:3000/repairs/home')
                                })
            
            
        })
    })
    

    it('CT5: Teste de input incorretos',()=>{
        let btn = cy.contains('Agendar serviço');
        
        // Gerar requisição com todos os campos vazios
        btn.click();
        cy.focused().should('have.id','vehicle').select(0);
    
        // Gerar requisição comt todos os campos menos o de veículo vazio
        btn.click();
        cy.focused().should('have.id','repairType').select(0);

        // Gerar requisição sem descrição, data e horário
        btn.click()
        cy.focused().should('have.id','details').type('Trocar filtro de ar')

        // Gerar uma requisição sem hora e data
        btn.click()
        cy.focused().should('have.id','date').type('2024-01-19').blur()

        // Gerar requisição sem descrição
        cy.get('#details').clear()
        btn.click()

        // Gerar requisição cuja descrição são só espaços
        cy.focused().should('have.id','details').type('                       ')
        btn.click()
        cy.contains('Campo de detalhes preenchido incorretamente. Reescreva-o e tente novamente.').should('exist')
    })
    
})
    