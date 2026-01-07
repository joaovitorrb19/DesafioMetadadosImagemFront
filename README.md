# APP SAPUI5 com.desafio.imagecrud
- Projeto desenvolvido para o desafio
- Single Page Application da parte visual do CRUD de MetadadosDeImagem
- Os testes cobrem todas as possibilidades nos metodos Post, Delete, Put, Update, e toda a parte de modais,botoes,validações de arquivos incluindo o formato permitido 
- As requisições foram feitas com JQuery
- As requisições em /webapp/test/unit/controller/Main.qunit.js e /webapp/controller/Main.controller.js estão apontando para http://localhost:5050/api/MetadadosDeImagem, modificar se necessário

## Tecnologias
- Node 22.20.0
- Npm 10.9.3
- SAPUI5 > ui 1.141.0
- QUnit 2.24.1

## Localização dos Arquivos
- /webapp/view/Main.view.xml - Pagina da view SPA do CRUD
- /webapp/test/unit/controller/Main.qunit.js - Arquivo contendo os testes do Controller
- /webapp/controller/Main.controller.js - Arquivo contendo todo o codigo do CRUD

## Rodar o App
  git clone https://github.com/joaovitorrb19/DesafioMetadadosImagemAPI.git

### Iniciar o servidor de desenvolvimento localmente
    npm update
    npm start

---
# Testar o CRUD
http://localhost:8080/index.html

---
# Pagina para executar os testes
http://localhost:8080/test/testsuite.qunit.html
