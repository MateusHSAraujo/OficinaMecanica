Thiago Maximo Pavão - RA: 247381

Caso de uso: Gerenciamento de estoque (uc4)

Este caso de uso é composto pelas funcionalidades de outros casos de uso:

 - Visualização de planilha do estoque de peças (uc6)
   - Alteração de informação de peça (uc8)
   - Retirada de peça do estoque (uc7)
 - Inserção de peça no estoque (uc5)

Como resultado, foi desenvolvida a página de gerenciamento de estoque, que é acessível através do Menu de trabalho de um usuário com role = gerente_de_estoque.

Nesta página, é possível:

Ver as peças disponíveis no estoque, alterar as informações de uma peça, retirar peças e inserir peças no estoque. Assim como descrito pelos casos de uso.

Para testar o caso de uso, execute o script nesta pasta: init_uc4_uc5.sh
Este script inicia o servidor, limpa o banco de dados, 
cria uma conta de gerente de estoque e insere algumas peças no estoque.

Em seguida, acesse em seu navegador o endereço localhost:3000, faça login com os dados

usuário: gerenteEstoque
senha:   gerenteEstoqueSenha

No Menu de trabalho, pressione o botão "Acessar Gerenciamento de Estoque".

Agora é possível ver as peças "dummy" que foram inseridas e o formulário de inserção de peça,
e as funcionalidades podem ser testadas.

Para finalizar o caso de uso, basta clicar no botão "Menu do Trabalho" na navbar.

Rodar denovo o script reinicia as modificações feitas.
Para fechar os containers, ao fim dos testes, basta executar close_server.sh
