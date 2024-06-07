/// <reference types="cypress" />

describe('Testes para caso de uso 2 (Cadastramento de novo usuário cliente):',()=>{
    beforeEach(()=>{
        // Visita a página principal
        cy.visit('http://node.js:3000/register');
    })
    
    afterEach(()=>{
        // Reseta banco de dados
        cy.task('resetDB');
    });
    
    it('CT1: Cadastro de novo usuário',()=>{
        cy.fixture('uc2').then((data)=>{
            let userInfo = data.ct1.user;
            let clientInfo = data.ct1.clientData;
            
            cy.get('#name').type(clientInfo.name);
            cy.get('#surname').type(clientInfo.surname);
            cy.get('#birthday').type(clientInfo.birthday);
            cy.get('#cpf').type(clientInfo.cpf);
            cy.get('#email').type(clientInfo.email);
            cy.get('#address').type(clientInfo.address);
            cy.get('#phone').type(clientInfo.phone);
            cy.get('#cep').type(clientInfo.cep);

            cy.get('#username').type(userInfo.username);
            cy.get('#password').type(userInfo.password);
            
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                    for(let itrV of data.ct1.vehicles){
                        cy.get('#model').should('exist').type(itrV.model);
                        cy.get('#licensePlate').should('exist').type(itrV.licensePlate);
                        cy.get('#year').should('exist').type(itrV.year);
                        cy.get('#addCarBtn').should('exist').click().then(()=>{
                        cy.contains('Veículo adicionado com sucesso')
                            .should('be.visible')
                            .get('#alertCloseBtn')
                            .should('be.visible').and('be.enabled').then($el=>{
                                if($el != null) $el.click()
                            })
                        })
                            
                    }
                })
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            
            cy.contains('Finalizar cadastro').click().then(()=>{
                    cy.contains('Cadastro realizado com sucesso! Retornando para página principal em segundos.').should('exist');
            });
            
            cy.contains('Voltar').click();
            cy.url().should('eq', 'http://node.js:3000/');
            cy.task('findClient',{userInfo:userInfo, clientInfo:clientInfo, vehiclesInfo:data.ct1.vehicles}).then((data)=>{
                expect(data).to.eq(true);
            })            
        })
    })
    
    it('CT2: Tentativa de cadastrar um usuário com nome de usuário já existente',()=>{
        cy.fixture('uc2').then((data)=>{
            cy.task('insertClient',({user: data.ct1.user, client: data.ct1.clientData, vehicles: data.ct1.vehicles}))

            let userInfo = data.ct2.user;
            let clientInfo = data.ct2.clientData;

            cy.get('#name').type(clientInfo.name);
            cy.get('#surname').type(clientInfo.surname);
            cy.get('#birthday').type(clientInfo.birthday);
            cy.get('#cpf').type(clientInfo.cpf);
            cy.get('#email').type(clientInfo.email);
            cy.get('#address').type(clientInfo.address);
            cy.get('#phone').type(clientInfo.phone);
            cy.get('#cep').type(clientInfo.cep);

            cy.get('#username').type(data.ct1.user.username);
            cy.get('#password').type(userInfo.password);
            
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                    for(let itrV of data.ct2.vehicles){
                        cy.get('#model').should('exist').type(itrV.model);
                        cy.get('#licensePlate').should('exist').type(itrV.licensePlate);
                        cy.get('#year').should('exist').type(itrV.year);
                        cy.get('#addCarBtn').should('exist').click().then(()=>{
                        cy.contains('Veículo adicionado com sucesso')
                            .should('be.visible')
                            .get('#alertCloseBtn')
                            .should('be.visible').and('be.enabled').then($el=>{
                                if($el != null) $el.click()
                            })
                        })
                            
                    }
                })
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            
            cy.contains('Finalizar cadastro').click().then(()=>{
                    cy.contains('Nome de usuário já cadastrado. Escolha outro e tente novamente!').should('exist');
            });
            
            cy.contains('Voltar').click();
            cy.url().should('eq', 'http://node.js:3000/');
            cy.task('findClient',{userInfo:userInfo, clientInfo:clientInfo, vehiclesInfo:data.ct2.vehicles}).then((data)=>{
                expect(data).to.eq(false);
            })   
        })

    })

    it('CT3: Tentativa de cadastrar um usuário com cpf já existente',()=>{
        cy.fixture('uc2').then((data)=>{
            cy.task('insertClient',({user: data.ct1.user, client: data.ct1.clientData, vehicles: data.ct1.vehicles}))
            let userInfo = data.ct2.user;
            let clientInfo = data.ct2.clientData;

            cy.get('#name').type(clientInfo.name);
            cy.get('#surname').type(clientInfo.surname);
            cy.get('#birthday').type(clientInfo.birthday);
            cy.get('#cpf').type(data.ct1.clientData.cpf);
            cy.get('#email').type(clientInfo.email);
            cy.get('#address').type(clientInfo.address);
            cy.get('#phone').type(clientInfo.phone);
            cy.get('#cep').type(clientInfo.cep);

            cy.get('#username').type(userInfo.username);
            cy.get('#password').type(userInfo.password);
            
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                    for(let itrV of data.ct2.vehicles){
                        cy.get('#model').should('exist').type(itrV.model);
                        cy.get('#licensePlate').should('exist').type(itrV.licensePlate);
                        cy.get('#year').should('exist').type(itrV.year);
                        cy.get('#addCarBtn').should('exist').click().then(()=>{
                        cy.contains('Veículo adicionado com sucesso')
                            .should('be.visible')
                            .get('#alertCloseBtn')
                            .should('be.visible').and('be.enabled').then($el=>{
                                if($el != null) $el.click()
                            })
                        })
                            
                    }
                })
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            
            cy.contains('Finalizar cadastro').click().then(()=>{
                    cy.contains('Cadastro com cpf fornecido já existente. Impossível finalizar cadastramento!')
                    .should('exist')
            });
            
            cy.contains('Voltar').click();
            cy.url().should('eq', 'http://node.js:3000/');
            cy.task('findClient',{userInfo:userInfo, clientInfo:clientInfo, vehiclesInfo:data.ct2.vehicles}).then((data)=>{
                expect(data).to.eq(false);
            })   
        })

    })

    it('CT4: Tentativa de cadastrar um novo usuário com um veículo de placa já cadastrada.',()=>{
        cy.fixture('uc2').then((data)=>{
            cy.task('insertClient',({user: data.ct1.user, client: data.ct1.clientData, vehicles: data.ct1.vehicles}))
            let userInfo = data.ct2.user;
            let clientInfo = data.ct2.clientData;

            cy.get('#name').type(clientInfo.name);
            cy.get('#surname').type(clientInfo.surname);
            cy.get('#birthday').type(clientInfo.birthday);
            cy.get('#cpf').type(clientInfo.cpf);
            cy.get('#email').type(clientInfo.email);
            cy.get('#address').type(clientInfo.address);
            cy.get('#phone').type(clientInfo.phone);
            cy.get('#cep').type(clientInfo.cep);

            cy.get('#username').type(userInfo.username);
            cy.get('#password').type(userInfo.password);
            
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                let itrV = data.ct1.vehicles[0]
                cy.get('#model').should('exist').type(itrV.model);
                cy.get('#licensePlate').should('exist').type(itrV.licensePlate);
                cy.get('#year').should('exist').type(itrV.year);
                cy.get('#addCarBtn').should('exist').click().then(()=>{
                cy.contains('Veículo adicionado com sucesso')
                    .should('be.visible')
                    .get('#alertCloseBtn')
                    .should('be.visible').and('be.enabled').then($el=>{
                        if($el != null) $el.click()
                    })
                })                
            })
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            
            cy.contains('Finalizar cadastro').click().then(()=>{
                    cy.contains('Veículo com cadastro já existente fornecido. Impossível finalizar cadastramento de usuário!')
                    .should('exist')
            });
            
            cy.contains('Voltar').click();
            cy.url().should('eq', 'http://node.js:3000/');
            cy.task('findClient',{userInfo:userInfo, clientInfo:clientInfo, vehiclesInfo:[data.ct1.vehicles[0]]}).then((data)=>{
                expect(data).to.eq(false);
            })   
        })

    })

    it('CT5: Tentativa de inserir um mesmo veículo na lista de veículos cadastrados do novo cliente.',()=>{
        cy.fixture('uc2').then((data)=>{
            cy.task('insertClient',({user: data.ct1.user, client: data.ct1.clientData, vehicles: data.ct1.vehicles}))
            let userInfo = data.ct2.user;
            let clientInfo = data.ct2.clientData;

            cy.get('#name').type(clientInfo.name);
            cy.get('#surname').type(clientInfo.surname);
            cy.get('#birthday').type(clientInfo.birthday);
            cy.get('#cpf').type(clientInfo.cpf);
            cy.get('#email').type(clientInfo.email);
            cy.get('#address').type(clientInfo.address);
            cy.get('#phone').type(clientInfo.phone);
            cy.get('#cep').type(clientInfo.cep);

            cy.get('#username').type(userInfo.username);
            cy.get('#password').type(userInfo.password);
            
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                let itrV = data.ct2.vehicles[0]
                for(let i=0; i<2;i++){
                    cy.get('#model').should('exist').type(itrV.model);
                        cy.get('#licensePlate').should('exist').type(itrV.licensePlate);
                        cy.get('#year').should('exist').type(itrV.year);
                        cy.get('#addCarBtn').should('exist').click()
                }
            })
            cy.contains('Veículo adicionado com sucesso')
                .should('be.visible')
                .get('#alertCloseBtn')
                .should('be.visible').and('be.enabled').then($el=>{
                    if($el != null) $el.click()
            })
            cy.contains('Veículo de mesma placa já adicionado');
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            
            cy.contains('Finalizar cadastro').click().then(()=>{
                    cy.contains('Cadastro realizado com sucesso! Retornando para página principal em segundos.')
                    .should('exist')
            });
            
            cy.contains('Voltar').click();
            cy.url().should('eq', 'http://node.js:3000/');
            cy.task('findClient',{userInfo:userInfo, clientInfo:clientInfo, vehiclesInfo:[data.ct2.vehicles[0]]}).then((data)=>{
                expect(data).to.eq(true);
            })   
        })

    })
    
    it('CT6: Inputs incorretos',()=>{
        cy.task('resetDB')
        cy.fixture('uc2').then((data)=>{
            let userInfo = data.ct1.user;
            let clientInfo = data.ct1.clientData;
            let btn = cy.contains('Finalizar cadastro');
            
            btn.click()
            cy.contains('Seu nome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','name').type('Nome com Número 123');
            btn.click()
            cy.contains('Seu nome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','name').clear().type('CaracteresEspecias!@#$%¨&*()/*-+.,[}{}');
            btn.click()
            cy.contains('Seu nome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','name').clear().type('                                      ');
            btn.click()
            cy.contains('Seu nome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','name').clear().type(clientInfo.name);

            btn.click()
            cy.contains('Seu sobrenome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','surname').type('Nome com Número 123');
            btn.click()
            cy.contains('Seu sobrenome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','surname').clear().type('CaracteresEspecias!@#$%¨&*()/*-+.,[}{}');
            btn.click()
            cy.contains('Seu sobrenome deve conter somente letras e espaços.').should('exist');
            cy.focused().should('have.id','surname').clear().type(clientInfo.surname);
            
            btn.click()
            cy.contains('Selecione uma data de nascimento válida.').should('exist');
            cy.focused().should('have.id','birthday').type(clientInfo.birthday);
            
            btn.click()
            cy.contains('Forneça um CPF válido').should('exist');
            cy.focused().should('have.id','cpf').clear().type('aaaaaaaaaaaaaaaaaaaaaaaaa');
            btn.click()
            cy.contains('Forneça um CPF válido').should('exist');
            cy.focused().should('have.id','cpf').clear().type('  1111111115   ');
            btn.click()
            cy.contains('Forneça um CPF válido').should('exist');
            cy.focused().should('have.id','cpf').clear().type('456123789');
            btn.click()
            cy.contains('Forneça um CPF válido').should('exist');
            cy.focused().should('have.id','cpf').clear().type('070.229.541.86');
            btn.click()
            cy.contains('Forneça um CPF válido').should('exist');
            cy.focused().should('have.id','cpf').clear().type(clientInfo.cpf);

            btn.click()
            cy.contains('Forneça um email válido.').should('exist');
            cy.focused().should('have.id','email').clear().type('          ');
            btn.click()
            cy.contains('Forneça um email válido.').should('exist');
            cy.focused().should('have.id','email').clear().type('123123');
            btn.click()
            cy.contains('Forneça um email válido.').should('exist');
            cy.focused().should('have.id','email').clear().type('-------------asdas');
            btn.click()
            cy.contains('Forneça um email válido.').should('exist');
            cy.focused().should('have.id','email').clear().type('   mateusaraujo@gmail.com       ');
            btn.click()
            cy.contains('Forneça um email válido.').should('exist');
            cy.focused().should('have.id','email').clear().type(clientInfo.email);
            
            btn.click()
            cy.contains('Forneça um endereço válido.').should('exist');
            cy.focused().should('have.id','address').clear().type('          ');
            btn.click()
            cy.contains('Forneça um endereço válido.').should('exist');
            cy.focused().should('have.id','address').clear().type('Rua Luverci!');
            btn.click()
            cy.contains('Forneça um endereço válido.').should('exist');
            cy.focused().should('have.id','address').clear().type(clientInfo.address);

            btn.click()
            cy.contains('Forneça um telefone válido').should('exist');
            cy.focused().should('have.id','phone').clear().type('aaaaaaaaaaaaaaaaaaaaaaaaa');
            btn.click()
            cy.contains('Forneça um telefone válido').should('exist');
            cy.focused().should('have.id','phone').clear().type('  1111111115   ');
            btn.click()
            cy.contains('Forneça um telefone válido').should('exist');
            cy.focused().should('have.id','phone').clear().type('456123789');
            btn.click()
            cy.contains('Forneça um telefone válido').should('exist');
            cy.focused().should('have.id','phone').clear().type('070.229.541.86');
            btn.click()
            cy.contains('Forneça um telefone válido').should('exist');
            cy.focused().should('have.id','phone').clear().type(clientInfo.phone);
            
            btn.click()
            cy.contains('Forneça um CEP válido').should('exist');
            cy.focused().should('have.id','cep').clear().type('aaaaaaaaaaaaaaaaaaaaaaaaa');
            btn.click()
            cy.contains('Forneça um CEP válido').should('exist');
            cy.focused().should('have.id','cep').clear().type('  1111111115   ');
            btn.click()
            cy.contains('Forneça um CEP válido').should('exist');
            cy.focused().should('have.id','cep').clear().type('456123789');
            btn.click()
            cy.contains('Forneça um CEP válido').should('exist');
            cy.focused().should('have.id','cep').clear().type('070.229.541.86');
            btn.click()
            cy.contains('Forneça um CEP válido').should('exist');
            cy.focused().should('have.id','cep').clear().type(clientInfo.cep);
            
            btn.click()
            cy.contains('Nome de usuário inválido.').should('exist');
            cy.get('#username').clear().type('       user 1 ');
            btn.click()
            cy.contains('Nome de usuário inválido.').should('exist');
            cy.get('#username').clear().type('user 1');
            btn.click()
            cy.contains('Nome de usuário inválido.').should('exist');
            cy.get('#username').clear().type('user!!!+++*1');
            btn.click()
            cy.contains('Nome de usuário inválido.').should('exist');
            cy.get('#username').clear().type(userInfo.username);
            
            btn.click()
            cy.contains('Senha inválida').should('exist');
            cy.get('#password').clear().type('       senha 1 ');
            btn.click()
            cy.contains('Senha inválida').should('exist');
            cy.get('#password').clear().type('senha 1');
            btn.click()
            cy.contains('Senha inválida').should('exist');
            cy.get('#password').clear().type('     ');
            btn.click()
            cy.contains('Senha inválida').should('exist');
            cy.get('#password').clear().type(userInfo.username);
            btn.click();
            cy.contains('Você deve adicionar ao menos um veículo para poder fazer cadastro').should('exist')
            
            cy.contains('Cadastrar novo veículo').click()
            cy.get('#addCarModal').should('be.visible').then(()=>{
                let itrV = data.ct1.vehicles[0]
                let btn2 = cy.contains('Adicionar veículo')

                btn2.click()
                cy.contains('Modelo inválido.').should('exist');
                cy.focused().should('have.id','model').clear().type('    ABC2TY09   ');
                btn2.click()
                cy.contains('Modelo inválido.').should('exist');
                cy.focused().should('have.id','model').clear().type('!!!!____!!!');
                btn2.click()
                cy.contains('Modelo inválido.').should('exist');
                cy.focused().should('have.id','model').clear().type('      ');
                btn2.click()
                cy.contains('Modelo inválido.').should('exist');
                cy.focused().should('have.id','model').clear().type(itrV.model);

                btn2.click()
                cy.focused().should('have.id','licensePlate').clear().type('    ABC2TY09   ');
                btn2.click()
                cy.contains('Placa inválida').should('exist');
                cy.focused().should('have.id','licensePlate').clear().type('ABCD2002');
                btn2.click()
                cy.contains('Placa inválida').should('exist');
                cy.focused().should('have.id','licensePlate').clear().type('12312312');
                btn2.click()
                cy.contains('Placa inválida').should('exist');
                cy.focused().should('have.id','licensePlate').clear().type('      ');
                btn2.click()
                cy.contains('Placa inválida').should('exist');
                cy.focused().should('have.id','licensePlate').clear().type(itrV.licensePlate);

                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type('    ABC2TY09   ');
                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type('ABCD2002');
                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type('12312312');
                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type('123');
                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type('      ');
                btn2.click()
                cy.contains('Ano inválido.').should('exist');
                cy.focused().should('have.id','year').clear().type(itrV.year);
                
                btn2.click()
                cy.contains('Veículo adicionado com sucesso')
                            .should('be.visible')
                            .get('#alertCloseBtn')
                            .should('be.visible').and('be.enabled').then($el=>{
                                if($el != null) $el.click()
                            })
                        
            })
            cy.get('#closeCarBtn').click().then(()=>{
                cy.get('#addCarModal').should('not.be.visible')
            })
            cy.contains('Voltar').click()
                     
        })
    })

})