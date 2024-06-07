Universidade Estadual de Campinas - Faculdade de Engenharia Elétrica e de Computação
Aluno: Mateus Henrique Silva Araújo            RA: 184940           Data: 03/11/2023

Descrição dos casos de uso implementados:
    Os casos de uso separados neste diretório representam a base do funcionamento da aplicação desenvolvida,
sendo a sua implementação prioritária ao passo que, sem estes, todo o restante do processo de desenvolvimento
seria dificultado. Os casos de uso abordao são os seguintes:
- Inicialização do sistema (uc1);
- Cadastramento de novo usuário cliente (uc2);
- Encerramento do sistema (uc3);
    O primeiro consiste no login de um usuário no sistema implementado; o segundo, do cadastramento de um usuário
cliente que ainda não tenha uma conta e o último do processo de encerramento de sessão que todo usuário pode fazer
para encerrar o programa.
    O motivo principal para agrupar estes três casos de uso em um único pacote foi o fato dos três se comunicarem
majoritariamente com o mesmo módulo do servidor responsável por fornecer a operar os endpoints associados à login,
cadastro e logout.

Procedimento para teste:
    Estes casos de uso não nescessitam de dados preliminares para serem testados, ao passo que, seguindo a lógica
de cadastramento, login e logout, todos os dados necessários para observação do funcionamento de cada caso serão 
gerados durante o teste. Deste modo, basta executar o script bash init_uc1_uc2_uc3.sh (que simplesmente inicia
os containers docker e ativa o servidor) para poder testar as funcionalidades desenvolvidas. Vale destacar que,
caso seja desejado reiniciar o banco de dados por algum motivo, pode-se usar do script resetBD.sh deste mesmo 
diretório que essa exata funcionalidade.