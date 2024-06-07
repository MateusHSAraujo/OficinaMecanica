var mongoOpUser = require('../models/mongo').userModel;
var mongoOpClient = require('../models/mongo').clientModel;
var mongoOpVehicle = require('../models/mongo').vehicleModel;
var mongoOpEmployee = require('../models/mongo').employeeModel;
var mongoOpBS = require('../models/mongo').budgetServiceModel;
var mongoOpOcamento = require('../models/mongo').orcamentoModel;
var mongoOpRS = require('../models/mongo').repairServiceModel;
var mongoOpPecas = require('../models/mongo').pecaModel;

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async resetDB(){
          await mongoOpUser.deleteMany({});
          await mongoOpClient.deleteMany({});
          await mongoOpVehicle.deleteMany({});
          await mongoOpEmployee.deleteMany({});
          await mongoOpBS.deleteMany({});
          await mongoOpOcamento.deleteMany({});
          await mongoOpRS.deleteMany({});
          await mongoOpPecas.deleteMany({});
          return null;
        },

        async insertClient( {user,client,vehicles} ){
          console.log('User',user,'Client:',client,'Vehicles:',vehicles)
          user.role = 'cliente';
          var newUserDoc = new mongoOpUser(user);
          
          client.user = newUserDoc._id
          var newClientDoc = new mongoOpClient(client);
          
          newUserDoc.accountData = newClientDoc._id;
         
          
          for(let itrVehicle of vehicles){
            itrVehicle.owner = newUserDoc._id;
          }

          newUserDoc.save();
          newClientDoc.save();
          await mongoOpVehicle.insertMany(vehicles);
          
          return {user:newUserDoc,client:newClientDoc,vehicles:vehicles} ;
        },

        async insertEmployee({user,employee}){
          console.log('Inserindo usuário:',user,'Com cadastro de funcionário:',employee)
          
          var newUserDoc = new mongoOpUser(user);
      
          employee.user = newUserDoc._id;
          var newEmployeeDoc = new mongoOpEmployee(employee);

          newUserDoc.accountData = newEmployeeDoc._id;
          
          newUserDoc.save();
          newEmployeeDoc.save();
          return null;
        },
      
        async findClient({userInfo,clientInfo,vehiclesInfo}){
          console.log(userInfo,clientInfo,vehiclesInfo)
          let user = await mongoOpUser.findOne(userInfo)
          console.log('Usuário encontrado:',user);
          if(user == null) return false;
          
          let clientData = await mongoOpClient.findOne(clientInfo)
          console.log('Cadastro de cliente encontrado:',clientData);
          if (clientData == null || !clientData.user.equals(user._id) ) return false;

          for(let itrv of vehiclesInfo){
            let res = await mongoOpVehicle.findOne(itrv);
            console.log('Veículo encontrado:',res);
            console.log(!res.owner.equals(user._id))
            if(res == null || !res.owner.equals(user._id)) return false;
          }

          return true;
        } ,

        async findBS({clientInfo,vehicleInfo,BSInfo,managerInfo,mechanicInfo,budgetInfo}){

          console.log(clientInfo,vehicleInfo,BSInfo,managerInfo,mechanicInfo,budgetInfo)
          let user = await mongoOpUser.findOne(clientInfo)
          console.log('Usuário encontrado:',user);
          if(user == null) return false;
          
          BSInfo.client = user._id;
          vehicleInfo.owner = user._id

          let vehicle = await mongoOpVehicle.findOne(vehicleInfo);
          console.log('Veículo encontrado:',vehicle);
          if(vehicle == null) return false;

          BSInfo.vehicle = vehicle._id
          
          if(managerInfo!=undefined){
            let manager = await mongoOpUser.findOne(managerInfo)
            console.log('Gerente encontrado:',manager);
            if(manager == null) return false;
            BSInfo.budgetManager = manager._id
          }
          if(mechanicInfo!=undefined){
            let mechanic = await mongoOpUser.findOne(mechanicInfo)
            console.log('Mecânico encontrado:',mechanic);
            if(mechanic == null) return false;
            BSInfo.mechanic = mechanic._id
          }
          if(budgetInfo!=undefined){
            let budget = await mongoOpOcamento.findOne(budgetInfo)
            console.log('Orçamento encontrado:',budget);
            if(budget == null) return false;
            BSInfo.budget = budget._id
          }
        
          console.log('Serviço de orçamento pesquisado:',BSInfo)
          let BS = await mongoOpBS.findOne(BSInfo)
          console.log('Serviço de orçamento encontrado:',BS);
          if (BS == null) return false;

          return BS;
        } ,

        async insertParts({partsInfo}){
          await mongoOpPecas.insertMany(partsInfo);
          return null
        },

        async insertBS({clientInfo,managerInfo,mechanicInfo,vehicleInfo,BSInfo,budgetInfo}){
          let client = await mongoOpUser.findOne(clientInfo)

          let mechanic
          if(mechanicInfo!=undefined) mechanic = await mongoOpUser.findOne(mechanicInfo);
          let manager = await mongoOpUser.findOne(managerInfo)
          
          vehicleInfo.owner = client._id
          
          let vehicle = await mongoOpVehicle.findOne(vehicleInfo)
          console.log('Cliente:',client,'Mecanico:',mechanic,'Gerente:',manager,'Veículo:',vehicle)
          if(client == null || (mechanic == null && mechanicInfo != undefined) || manager == null || vehicle == null) return false;
          
          let newBudgetDoc;
          if(budgetInfo!=undefined){
            newBudgetDoc  = new mongoOpOcamento(budgetInfo)
            BSInfo.budget = newBudgetDoc._id
            console.log('Inserindo o orçamento:',newBudgetDoc)
          }

          BSInfo.client = client._id
          if(mechanicInfo!=undefined) BSInfo.mechanic = mechanic._id
          BSInfo.budgetManager = manager._id
          BSInfo.vehicle = vehicle._id

          let newBSDoc = new mongoOpBS(BSInfo)
          console.log('Inserindo o serviço de orçamento:',newBSDoc)

          try{
            newBSDoc.save()
            console.log('AQUI 2:')
            console.log(budgetInfo)
            console.log(budgetInfo==undefined)
            if(budgetInfo!=undefined){
              newBudgetDoc.save();
            } 
          } catch (err){
            console.error(err);
            return false
          }
          return true
        },

        async insertRS({clientInfo,mechanicInfo,BSInfo,RSInfo}){
          let client = await mongoOpUser.findOne(clientInfo)
          let mechanic = await mongoOpUser.findOne(mechanicInfo);
          let BS = await mongoOpBS.findOne(BSInfo)
          console.log('Cliente:',client,'Mecanico:',mechanic,'Serviço de orçamento:',BS)
          if(client == null || mechanic == null || BS==null) return false;

          RSInfo.budgetService = BS._id
          RSInfo.client = client._id
          RSInfo.mechanic = mechanic._id
          
          let newRSDoc = new mongoOpRS(RSInfo)
          try{
            newRSDoc.save()
            
          } catch (err){
            console.error(err);
            return false
          }
          return true
        },

        async findRS({clientInfo,managerInfo,mechanicInfo,vehicleInfo,BSInfo,budgetInfo,RSInfo,partsInfo}){
          
          console.log(clientInfo,vehicleInfo,BSInfo,managerInfo,mechanicInfo,budgetInfo)
          let user = await mongoOpUser.findOne(clientInfo)
          console.log('Usuário encontrado:',user);
          if(user == null) return false;
          
          BSInfo.client = user._id;
          RSInfo.client = user._id;
          vehicleInfo.owner = user._id

          let vehicle = await mongoOpVehicle.findOne(vehicleInfo);
          console.log('Veículo encontrado:',vehicle);
          if(vehicle == null) return false;

          BSInfo.vehicle = vehicle._id
          
          if(managerInfo!=undefined){
            let manager = await mongoOpUser.findOne(managerInfo)
            console.log('Gerente encontrado:',manager);
            if(manager == null) return false;
            BSInfo.budgetManager = manager._id
          }
          if(mechanicInfo!=undefined){
            let mechanic = await mongoOpUser.findOne(mechanicInfo)
            console.log('Mecânico encontrado:',mechanic);
            if(mechanic == null) return false;
            BSInfo.mechanic = mechanic._id
            RSInfo.mechanic = mechanic._id
          }
          if(budgetInfo!=undefined){
            let budget = await mongoOpOcamento.findOne(budgetInfo)
            console.log('Orçamento encontrado:',budget);
            if(budget == null) return false;
            BSInfo.budget = budget._id
          }
        
          console.log('Serviço de orçamento pesquisado:',BSInfo)
          let BS = await mongoOpBS.findOne(BSInfo)
          console.log('Serviço de orçamento encontrado:',BS);
          if (BS == null) return false;

          RSInfo.budgetService = BS._id

          let parts = []
          for(let itrp of partsInfo){
            let res = await mongoOpPecas.findOne({name: itrp.name})
            if(res == null) return false
            parts.push({part: res._id, ammount: itrp.ammount})
          }

          RSInfo.usedParts = parts
          console.log('Partes do serviço de reparo buscado:',parts)

          console.log('Serviço de reparo buscado:',RSInfo )
          let RS =await mongoOpRS.findOne(RSInfo)
          console.log('Serviço de reparo encontrado:',RS)
          if (RS == null) return false;

          return RS;
        }



      }) 
    },
  },
};
