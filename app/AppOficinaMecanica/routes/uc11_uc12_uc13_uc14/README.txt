Universidade Estadual de Campinas - Faculdade de Engenharia Elétrica e de Computação
Aluno: Mateus Henrique Silva Araújo            RA: 184940           Data: 13/11/2023

Descrição dos casos de uso implementados:
    Os casos de uso separados neste diretório dão continuidade às funcionalidades essenciais do projeto da Oficina Mecânica. 
Dentre eles, temos:
    - Requisição de serviço de orçamento (uc11);
    - Visualização de planilha de orçamentos (uc12);
    - Visualização de serviço de orçamento agendado (uc13);
    - Visualização de serviço de reparo agendado (uc14);
    O primeiro consiste na realização de um agendamento de um serviço de orçamento por um cliente para avaliação de um possível
reparo de um veículo cadastrado. O segundo consiste na iniciação, aprovação, rejeição, deleção e Visualização de serviços de orçamento
que pode ser realizada por um funcionário com cargo de Gerente de Orçamento. O terceiro engloba o processo de execução de um serviço de
orçamento agendado por um mecâncico e o quarto, o processo de execução de um serviço de reparo por ele.
    A escolha destes casos de uso como preferências sobre os demais ocorreu em virtude do fato de que eles são representativos para o
domínio da aplicação, fazendo com que ela perca sua característica em sua ausência.

Procedimento para teste:
    Neste diretório, existem 3 subdiretórios contendo scripts bash: uc11_12_scripts, uc13_scripts e uc14_scripts. Cada um destes sub-
diretórios contém scripts que configuram o banco de dados da aplicação para o teste das funcionalidades que os casos de uso que os nomeiam
implementam. Portanto, para testar os casos de uso 11 e 12, execute o script setDB.sh do diretório uc11_12_scripts. Ele produzirá um usuário
cliente de login='dummy1' e senha='dummy1' o qual pode ser usado para testar a requisição de novos serviços de orçamento. Além disso, este
script também gerará um usuário gerente de orçamento de login='gerente' e senha='gerente' para se testar a Visualização, geração, deleção,
rejeição e aprovação de um novo serviço de orçamento.
    Para testar o caso de uso 13, execute o script setDB.sh do diretório uc13_scripts. Ele produzirá um usuário mecânico com senha='mecanico'
e login='mecanico' a partir do qual se pode testar a Visualização e execução de serviços de orçamentos agendados (os quais também serão
gerados automaticamente pelo script). De forma análoga, para testar o caso de uso 14, execute o script setDB.sh do diretório uc14_scripts.
Este gerará um usuário mecâncico com mesmo login e senha do caso anterior a partir do qual se poderá visualizar e executar serviços de re-
paros (os quais também são gerados automaticamente).