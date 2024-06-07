
function validateField(fieldId,pattern){
  let fieldEl = document.getElementById(fieldId);
  if(pattern.test(fieldEl.value)){
      fieldEl.classList.remove('is-invalid');
      fieldEl.classList.add('is-valid');
      return true;
  }else{
      fieldEl.classList.remove('is-valid');
      fieldEl.classList.add('is-invalid');
      return false;
  }
}

function validateAtualizaPecaPriceField() {
  if(!validateField('priceAtualiza',/^[0-9]+([.][0-9]{1,2})?$/)) return;
  this.pecaAtualiza.price = parseFloat(this.pecaAtualiza.price).toFixed(2);
}

function eraseInvalidState(id){
  let containerEl = document.getElementById(id);
  containerEl.classList.remove('is-invalid');
}

function appendAlert(message, type, id){
  let alertPlaceholder = document.getElementById(id)
  let wrapper = document.createElement('div');
  let icon = '';
  if(type == 'danger') icon = 'exclamation-triangle';
  else if(type == 'success') icon = 'check';
  wrapper.innerHTML = [
      `<div class="row alert alert-${type} alert-dismissible fade show" role="alert">`,
      `   <div class="col-auto small">`,
      `     <i class="col-1 bi bi-${icon}"></i>`,
      `     <span>${message}</span>`,
      '   </div>',
      '   <button type="button" class="col-1 btn-close" data-bs-dismiss="alert" aria-label="Close" id="alertCloseBtn"></button>',
      '</div>'
  ].join('');

  alertPlaceholder.appendChild(wrapper);
  setTimeout(()=> {
      document.getElementById('alertCloseBtn').click();
  },3000);
}

function clearForm(form) {
  if(!form) return;

  form.reset();

  // Get all form elements inside the form
  const formElements = form.elements;

  for (let i = 0; i < formElements.length; i++) {
    const fieldEl = formElements[i];
    if (fieldEl.classList.contains('is-valid')) {
      fieldEl.classList.remove('is-valid');
    }
    if (fieldEl.classList.contains('is-invalid')) {
      fieldEl.classList.remove('is-invalid');
    }
  }
}

function clearRetiraForm() {
  clearForm(this.$refs.retiraForm);
  this.quantityRetira = '';
}

function clearAtualizaForm() {
  clearForm(this.$refs.atualizaForm);
  this.pecaAtualiza= {id: '', name: '', car: '', type: '', price: '', quantity: ''};
}

function formatQuantityDisponivel(quantity) {
  if(quantity == 1) return '1 unidade disponível';
  return quantity + ' unidades disponíveis';
}

var modalConfirmaRetira;
function openConfirmRetiraPopUp(peca) {
  this.clearRetiraForm();
  this.pecaRetira = peca;
  modalConfirmaRetira = new bootstrap.Modal(document.getElementById('confirmRetiraModal'));
  modalConfirmaRetira.show();
}

var modalAtualizaPeca;
function openAtualizaPecaModal(peca) {
  this.clearAtualizaForm();
  this.pecaAtualiza = Object.assign({}, peca);
  modalAtualizaPeca = new bootstrap.Modal(document.getElementById('atualizaPecaModal'));
  modalAtualizaPeca.show();
}

var modalWarning;
function openWarningModal() {
  modalWarning = new bootstrap.Modal(document.getElementById('warningModal'));
  modalWarning.show();
}

async function getPecas() {
  var response;
  var request = axios({
    "method": "get",
    "url": '/estoque',
  });
  try {
    response = await request;
    this.pecas = response.data;
  } catch (error) {
    appendAlert(error.response.data,'danger','visualizacaoPecasAlertPlaceholder');
    return;
  }
}

async function checkQuantityThenRetiraPeca() {
  if(this.pecaRetira.quantity < this.quantityRetira) {
    modalConfirmaRetira.hide();
    this.openWarningModal();
    if(this.fillcreaterequisicaocompraformcb!=undefined)
      this.fillcreaterequisicaocompraformcb(this.pecaRetira.name,
                                            this.pecaRetira.car,
                                            this.pecaRetira.type,
                                            this.quantityRetira - this.pecaRetira.quantity);

  } else {
    var data = JSON.stringify({quantity: this.quantityRetira});
    var response;
    var request = axios({
      "method": "delete",
      "url": "/estoque/" + this.pecaRetira._id,
      "headers": { "Content-Type": "application/json" },
      "data": data
    });
    try {
      response = await request;
      this.pecas = response.data;
      appendAlert('Peça retirada com sucesso!','success','visualizacaoPecasAlertPlaceholder');
      modalConfirmaRetira.hide();
    } catch (error) {
      appendAlert(error.response.data,'danger','retiraPecaModalAlertPlaceholder');
      return;
    }
  }
}

async function atualizaPeca() {
  var data = JSON.stringify(this.pecaAtualiza);
  var response;
  var request = axios({
    "method": "put",
    "url": "/estoque/" + this.pecaAtualiza._id,
    "headers": { "Content-Type": "application/json" },
    "data": data
  });
  try {
    response = await request;
    this.pecas = response.data;
    appendAlert('Peça atualizada com sucesso!','success','visualizacaoPecasAlertPlaceholder');
    modalAtualizaPeca.hide();
  } catch (error) {
    appendAlert(error.response.data,'danger','atualizaPecaModalAlertPlaceholder');
    return;
  }
}

export default {
  props: {
    fillcreaterequisicaocompraformcb: undefined,
    hideatualiza: false
  },
  data() {
    return {
      pecas: [],
      // pecas: [
      //   {id: 1, name: "Coletor de Escape", car: "Palio 2011", type: "Escapamento", price: 644.40, quantity: 3},
      //   {id: 2, name: "Vela de Ignição", car: "Gol 2003", type: "Motor", price: 72.81, quantity: 1},
      //   {id: 3, name: "Para-lama dianteiro", car: "Onix 2007", type: "Carroceria", price: 303.86, quantity: 5}
      // ],
      pecaRetira: {_id: '', name: '', car: '', type: '', price: '', quantity: ''},
      pecaAtualiza: {_id: '', name: '', car: '', type: '', price: '', quantity: ''},
      quantityRetira: ''
    }
  },
  template: `
    <div>
      <div>
        <table class="table align-middle table-light table-striped table-hover" v-if="pecas.length>0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Carro compatível</th>
              <th>Tipo</th>
              <th>Preço (R$)</th>
              <th>Quantidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="itrP in pecas">
              <td>{{itrP.name}}</td>
              <td>{{itrP.car}}</td>
              <td>{{itrP.type}}</td>
              <td>{{itrP.price.toFixed(2)}}</td>
              <td>{{itrP.quantity}}</td>
              <td>
                <button class="btn btn-outline-info" v-if="!hideatualiza" v-on:click="doOpenAtualizaPecaModal(itrP)">Atualizar</button>
                <button class="btn btn-outline-danger" v-on:click="doOpenConfirmRetiraPopUp(itrP)">Retirar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <span v-if="pecas.length==0">
          Não há peças disponíveis no estoque no momento, elas serão listadas aqui quando existirem.
        </span>
        <div id="visualizacaoPecasAlertPlaceholder" class="row container-fluid"></div>
      </div>
      <div class="modal fade" id="confirmRetiraModal" tabindex="-1" aria-labelledby="confirmRetiraModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <form ref="retiraForm" @submit.prevent="doCheckQuantityThenRetiraPeca">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="confirmRetiraModalLabel">Confirmação de Retirada</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <span>Confirme os dados da peça a ser retirada e insira a quantidade de peças desse tipo que serão retiradas.</span>
                <pre class="mt-3">
Nome da peça:     {{pecaRetira.name}}
Carro compatível: {{pecaRetira.car}}
Tipo da peça:     {{pecaRetira.type}}</pre>
                <!-- Campo de quantidade -->
                <div class="col-8" id="quantityContainer">
                  <label for="quantityRetira" class="form-label">Quantidade ({{formatQuantityDisponivel(pecaRetira.quantity)}})</label>
                  <input type="text" class="form-control" id="quantityRetira" v-model="quantityRetira" @blur="doValidateField('quantityRetira',/^0*[1-9]+[0-9]*$/)" @input="doEraseInvalidState('quantityRetira')" pattern="^0*[1-9]+[0-9]*$" required>
                  <div class="invalid-feedback"><small>A quantidade deve ser um número inteiro positivo.</small></div>
                </div>
              </div>
              <div class="modal-footer">
                <div id="retiraPecaModalAlertPlaceholder" class="row container-fluid"></div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-success">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="modal fade" id="warningModal" tabindex="-1" aria-labelledby="warningModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="warningModalLabel">Fora de estoque</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              A quantidade requisitada da peça especificada não está disponível em estoque.
              <div v-if="fillcreaterequisicaocompraformcb!=undefined" class="mt-3">
                O formulário de requisição de compra de peça foi preenchido com as informações da peça e com a quantidade faltante.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-info" data-bs-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="atualizaPecaModal" tabindex="-1" aria-labelledby="atualizaPecaModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <form ref="atualizaForm" @submit.prevent="doAtualizaPeca">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="atualizaPecaModalLabel">Atualização de Informações</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                Altere as informações desejadas nos campos abaixo.

                <div class="row mb-3 gx-3 gy-2 justify-content-center">
                  <!-- Campo de nome da peça -->
                  <div class="col-8" id="nameAtualizaContainer">
                      <label for="nameAtualiza" class="form-label">Nome</label>
                      <input type="text" class="form-control" id="nameAtualiza" v-model="pecaAtualiza.name" @blur="doValidateField('nameAtualiza',/^.+$/)" @input="doEraseInvalidState('nameAtualiza')" pattern="^.+$" required>
                      <div class="invalid-feedback"><small>O nome da peça é um campo obrigatório</small></div>
                  </div>
                  
                  <!-- Campo de Carro compatível da peça -->
                  <div class="col-4" id="carAtualizaContainer">
                    <label for="carAtualiza" class="form-label">Carro compatível</label>
                    <input type="text" class="form-control" id="carAtualiza" v-model="pecaAtualiza.car" @blur="doValidateField('carAtualiza',/^.+$/)" @input="doEraseInvalidState('carAtualiza')" pattern="^.+$" required>
                    <div class="invalid-feedback"><small>O carro compatível é um campo obrigatório.</small></div>
                  </div>

                  <div class="v-100"></div>

                  <!-- Campo de Tipo da peça -->
                  <div class="col-4" id="typeAtualizaContainer">
                    <label for="typeAtualiza" class="form-label">Tipo</label>
                    <input type="text" class="form-control" id="typeAtualiza" v-model="pecaAtualiza.type" @blur="doValidateField('typeAtualiza',/^.+$/)" @input="doEraseInvalidState('typeAtualiza')" pattern="^.+$" required>
                    <div class="invalid-feedback"><small>O tipo da peça é um campo obrigatório.</small></div>
                  </div>

                  <!-- Campo de valor (preço) da peça -->
                  <div class="col-4" id="priceAtualizaContainer">
                    <label for="priceAtualiza" class="form-label">Preço (R$)</label>
                    <input type="text" class="form-control" id="priceAtualiza" v-model="pecaAtualiza.price" @blur="doValidateAtualizaPecaPriceField('priceAtualiza')" @input="doEraseInvalidState('priceAtualiza')" pattern="^[0-9]+([.][0-9]{1,2})?$" required>
                    <div class="invalid-feedback"><small>O preço da peça deve ser um número decimal com duas casas. Ex: 1234.23</small></div>
                  </div>

                  <!-- Campo de quantidade -->
                  <div class="col-4" id="quantityAtualizaContainer">
                    <label for="quantityAtualiza" class="form-label">Quantidade</label>
                    <input type="text" class="form-control" id="quantityAtualiza" v-model="pecaAtualiza.quantity" @blur="doValidateField('quantityAtualiza',/^0*[1-9]+[0-9]*$/)" @input="doEraseInvalidState('quantityAtualiza')" pattern="^0*[1-9]+[0-9]*$" required>
                    <div class="invalid-feedback"><small>A quantidade deve ser um número inteiro positivo.</small></div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <div id="atualizaPecaModalAlertPlaceholder" class="row container-fluid"></div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-success">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    doValidateAtualizaPecaPriceField: validateAtualizaPecaPriceField,
    doValidateField: validateField,
    doEraseInvalidState: eraseInvalidState,
    formatQuantityDisponivel: formatQuantityDisponivel,
    clearRetiraForm: clearRetiraForm,
    clearAtualizaForm: clearAtualizaForm,
    doOpenConfirmRetiraPopUp: openConfirmRetiraPopUp,
    doOpenAtualizaPecaModal: openAtualizaPecaModal,
    openWarningModal: openWarningModal,
    doGetPecas: getPecas,
    doCheckQuantityThenRetiraPeca: checkQuantityThenRetiraPeca,
    doAtualizaPeca: atualizaPeca,
  },
  created() {
    this.doGetPecas();
  },
}
