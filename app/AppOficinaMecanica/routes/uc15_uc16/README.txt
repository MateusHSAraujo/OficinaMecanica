Thiago Maximo Pavão - RA: 247381

Caso de uso: Busca de peças no estoque (uc15)

Este caso de uso é composto pelas funcionalidades de outros casos de uso:

 - Visualização de planilha do estoque de peças (uc6)
   - Retirada de peça do estoque (uc7)
 - Requisição de compra de peça (uc16)

Como resultado, foi desenvolvida a página de busca de peças, que é acessível através do Menu de trabalho de um usuário com role = mecânico.

Nesta página, é possível:

Ver as peças disponíveis no estoque, retirar peças e criar requisições de compra de peça. Assim como descrito pelos casos de uso.

Para testar o caso de uso, execute o script nesta pasta: init_uc15_uc16.sh
Este script inicia o servidor, limpa o banco de dados, 
cria uma conta de mecânico e uma conta de gerente de estoque e insere algumas peças no estoque.

Em seguida, acesse em seu navegador o endereço localhost:3000, faça login com os dados

usuário: mecanico
senha:   mecanicoSenha

No Menu de trabalho, pressione o botão "Acessar busca de peças no estoque".

Agora é possível ver as peças "dummy" que foram inseridas e o formulário de requisição de compra de peça, e as funcionalidades podem ser testadas.

Para ver que as requisições de compra de peça foram criadas corretamente, basta encerrar a sessão e fazer login como gerente de estoque, com os dados

usuário: gerenteEstoque
senha:   gerenteEstoqueSenha

E no Menu de trabalho pressionar o botão "Acessar Requisições de Compra de Peças"

Para finalizar o caso de uso, basta clicar no botão "Menu do Trabalho" na navbar.

Rodar denovo o script reinicia as modificações feitas.
Para fechar os containers, ao fim dos testes, basta executar close_server.sh
