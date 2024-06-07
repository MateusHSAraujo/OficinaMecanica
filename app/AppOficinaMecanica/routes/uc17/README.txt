Thiago Maximo Pavão - RA: 247381

Caso de uso: Busca de peças no estoque (uc17)

Como resultado, foi desenvolvida a página de requisições de compra, 
que é acessível através do Menu de trabalho de um usuário com role = gerente_de_estoque.

Nesta página, é possível:

Ver as requisições de compra de peça em aberto, excluir uma requisição e concluir uma requisição.
Ao concluir uma requisição, as peças que foram pedidas são automaticamente inseridas no estoque.

Para testar o caso de uso, execute o script nesta pasta: init_uc17.sh
Este script inicia o servidor, limpa o banco de dados, 
cria uma conta de gerente de estoque e cria algumas requisições de compra de peça.

Em seguida, acesse em seu navegador o endereço localhost:3000, faça login com os dados

usuário: gerenteEstoque
senha:   gerenteEstoqueSenha

No Menu de trabalho, pressione o botão "Acessar Requisições de Compra de Peças".

Agora é possível ver as requisições de compra "dummy" que foram criadas, e as funcionalidades podem ser testadas.

Para ver que as peças estão realmente sendo inseridas no estoque ao concluir uma requisição de compra de peça, basta pressionar "Menu do Trabalho" na navbar e em seguida ver a planilha do estoque clicando em "Acessar Gerenciamento de Estoque".

Rodar denovo o script reinicia as modificações feitas.
Para fechar os containers, ao fim dos testes, basta executar close_server.sh
