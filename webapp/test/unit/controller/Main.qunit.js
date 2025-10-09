
sap.ui.define([
    "com/desafio/imagecrud/controller/Main.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/base/ManagedObject"
], function (MainController, JSONModel, MessageToast, ManagedObject) {
    "use strict";

    QUnit.module("Main Controller Tests", {
        beforeEach: function () {
            // instancia o controller real
            this.oController = new MainController();
            // cria uma view fake para substituir a view nos testes
            this.oViewStub = new ManagedObject();
            // simula os métodos setModel e getModel
            this.oViewStub.setModel = function (model, name) { this[name] = model; };
            this.oViewStub.getModel = function (name) { return this[name]; };
            //substituto do metodo byId
            this.oByIdStub = sinon.stub(this.oController, "byId");
            // retorna o substituto da view quando getView é chamado
            sinon.stub(this.oController, "getView").returns(this.oViewStub);
            // cria o stub (substituto) para o jQuery.ajax e MessageToast, impedindo chamadas reais
            // e permitindo verificar se foram chamados corretamente
            this.ajaxStub = sinon.stub(jQuery, "ajax");
            this.messageToastStub = sinon.stub(MessageToast, "show");
        },
        afterEach: function () {
            this.oController.destroy();
            this.oViewStub.destroy();
            this.oByIdStub.restore();
            this.ajaxStub.restore();
            this.messageToastStub.restore();
        }
    });

    QUnit.test("onInit: ao iniciar, testar o onGetMetadados", function (assert) {
        const onGetMetadadosSpy = sinon.spy(this.oController, "onGetMetadados");
        this.oController.onInit();
        assert.ok(onGetMetadadosSpy.calledOnce, "onGetMetadados foi chamado uma vez.");
        onGetMetadadosSpy.restore();
    });
    QUnit.test("onGetMetadados: sucesso no carregamento dos metadados", function (assert) {

        const oDataMockada = [
            { id: "zasdad-12ED", nome: "imagem1.png", TipoDoArquivo: "png", Altura: 600, Comprimento: 800, Proporcao: "3:4", DataDeCriacao: "2023-10-01T12:00:00Z" },
            { id: "zdad-2", nome: "imagem2.jpg", TipoDoArquivo: "jpg", Altura: 800, Comprimento: 600, Proporcao: "4:3", DataDeCriacao: "2023-10-02T12:00:00Z" }
        ];

        this.ajaxStub.yieldsTo("success", oDataMockada);

        this.oController.onGetMetadados();

        const oModel = this.oViewStub.getModel("metadados");

        assert.ok(oModel, "Modelo 'metadados' foi definido na view.");
        assert.deepEqual(oModel.getData().metadados, oDataMockada, "Dados do modelo estão corretos.");
        assert.ok(this.messageToastStub.calledWith("Metadados carregados com sucesso!"), "MessageToast de sucesso exibido.");

    });
    QUnit.test("onGetMetadados: erro no carregamento dos metadados - servidor desligado", function (assert) {
        const oErroMockado = { status: 0, responseText: "Servidor não está respondendo." };
        this.ajaxStub.yieldsTo("error", oErroMockado);

        this.oController.onGetMetadados();

        assert.ok(this.messageToastStub.calledWith("Servidor provalvelmente está desligado."), "MessageToast de erro exibido para servidor desligado.");
    });
    QUnit.test("onGetMetadados: erro no carregamento dos metadados - outro erro", function (assert) {
        const oErroMockado = { status: 500, responseText: "Erro interno do servidor." };
        this.ajaxStub.yieldsTo("error", oErroMockado);

        this.oController.onGetMetadados();

        assert.ok(this.messageToastStub.calledWith("Erro ao carregar metadados: " + oErroMockado.responseText), "MessageToast de erro exibido para outro erro.");
    });
    QUnit.test("onAbrirUploadDialog: deve abrir o diálogo de upload", function (assert) {
        const oUploadDialogMock = { open: sinon.stub() };
        this.oByIdStub.withArgs("uploadDialog").returns(oUploadDialogMock);
        this.oController.onAbrirUploadDialog();
        assert.ok(oUploadDialogMock.open.calledOnce, "Diálogo de upload foi aberto.");
    });
    QUnit.test("onPressionarUpdate: deve abrir o diálogo de atualização com metadado selecionado", function (assert) {
        const oUpdateDialogMock = { open: sinon.stub() };
        this.oByIdStub.withArgs("updateDialog").returns(oUpdateDialogMock);
        // Simula que um metadado está selecionado para atualização
        const oContextMock = {
            getProperty: sinon.stub()
        };
        oContextMock.getProperty.withArgs("Id").returns("zzz-sdasdDd-2");
        oContextMock.getProperty.withArgs("nomeDoArquivo").returns("imagem_teste.png");

        const oItemMock = { getBindingContext: sinon.stub().returns(oContextMock) };
        const oSourceMock = { getParent: sinon.stub().returns({ getParent: sinon.stub().returns(oItemMock) }) };

        const oEventoMock = { getSource: sinon.stub().returns(oSourceMock) };

        this.oController.onPressionarUpdate(oEventoMock);

        assert.ok(oUpdateDialogMock.open.calledOnce, "Diálogo de atualização foi aberto.");

    });
    QUnit.test("onPressionarUpload: sem arquivo selecionado", function (assert) {
        const oFileUploaderMock = {
            getDomRef: function () {
                return {
                    querySelector: function () {
                        return { files: [] };
                    }
                };
            }
        };
        this.oByIdStub.withArgs("fileUploader").returns(oFileUploaderMock);

        this.oController.onPressionarUpload();

        assert.ok(this.messageToastStub.calledWith("Por favor, selecione um arquivo antes de enviar.", {
            duration: 3000,
            my: "center top",
            at: "center top"
        }), "MessageToast de aviso exibido para nenhum arquivo selecionado.");
    });
    QUnit.test("onPressionarUpload: com arquivo selecionado", function (assert) {
        const done = assert.async();

        // Mock do arquivo
        const oFileMock = new Blob(["file content"], { type: "image/png" });
        oFileMock.name = "imagem_teste.png";

        // NOVA ABORDAGEM: Use um Array simples para simular a FileList.
        // É mais simples e menos propenso a erros.
        const fileListArrayMock = [oFileMock];

        // Mock do FileUploader
        const oFileUploaderMock = {
            getDomRef: function () {
                return {
                    querySelector: function (selector) {
                        if (selector === "input[type='file']") {
                            // Agora retornamos um objeto cuja propriedade 'files' é um Array
                            return { files: fileListArrayMock };
                        }
                        return null;
                    }
                };
            },
            clear: sinon.stub()
        };

        // Stub do uploadDialog
        const oUploadDialogMock = { close: sinon.stub() };

        // Substitui o byId do controller para retornar os mocks
        this.oByIdStub.withArgs("fileUploader").returns(oFileUploaderMock);
        this.oByIdStub.withArgs("uploadDialog").returns(oUploadDialogMock);

        // Stub do jQuery.ajax simulando sucesso
        this.ajaxStub.yieldsTo("success", { message: "Upload bem-sucedido." });

        // Chama o método real
        this.oController.onPressionarUpload();

        // Verifica se ajax foi chamado
        assert.ok(this.ajaxStub.calledOnce, "jQuery.ajax foi chamado uma vez.");
        // Verifica os argumentos da chamada do ajax
        const ajaxCallArgs = this.ajaxStub.getCall(0).args[0];
        assert.strictEqual(ajaxCallArgs.url, "http://localhost:5050/api/MetadadosDeImagem", "URL correta foi usada.");
        assert.strictEqual(ajaxCallArgs.type, "POST", "Método POST foi usado.");
        assert.ok(ajaxCallArgs.data instanceof FormData, "Dados enviados são uma instância de FormData.");
        assert.strictEqual(ajaxCallArgs.processData, false, "processData está definido como false.");
        assert.strictEqual(ajaxCallArgs.contentType, false, "contentType está definido como false.");

        // Verifica se MessageToast de sucesso foi exibido
        // Verifica se MessageToast de sucesso foi exibido
        setTimeout(function () {
            assert.ok(this.messageToastStub.calledWith("Cadastrado com sucesso!", {
                duration: 3000,
                my: "center top",
                at: "center top"
            }), "MessageToast de sucesso exibido após upload.");

            // Verifica se o FileUploader foi limpo
            assert.ok(oFileUploaderMock.clear.calledOnce, "FileUploader.clear() foi chamado.");
            // Verifica se o dialog foi fechado
            assert.ok(oUploadDialogMock.close.calledOnce, "Upload dialog foi fechado.");

            done();
        }.bind(this), 0);
    });
    QUnit.test("onCancelarUpload: deve fechar o diálogo de upload", function (assert) {
        // Mocks para o diálogo e FileUploader
        const oUploadDialogMock = { close: sinon.stub() };
        const oFileUploaderMock = { close: sinon.stub() };
        // Configura os stubs para retornar os mocks
        this.oByIdStub.withArgs("uploadDialog").returns(oUploadDialogMock);
        this.oByIdStub.withArgs("fileUploader").returns(oFileUploaderMock);
        // mocka o metodo clear dentro do FileUploader
        oFileUploaderMock.clear = sinon.stub();

        this.oController.onCancelarUpload();
        assert.ok(oUploadDialogMock.close.calledOnce, "Diálogo de upload foi fechado.");
    });
    QUnit.test("onConfirmarUpdate:Sem arquivo selecionado", function (assert) {

        const oFileUpdateMock = {
            getDomRef: function () {
                return {
                    querySelector: function () {
                        return { files: [] };
                    }
                };
            }
        };

        this.oByIdStub.withArgs("fileUploaderUpdate").returns(oFileUpdateMock);

        // Simula que um metadado está selecionado para atualização
        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "update");

        this.oController.onConfirmarUpdate();

        assert.ok(this.messageToastStub.calledWith("Por favor, selecione um arquivo antes de enviar.", {
            duration: 3000,
            my: "center top",
            at: "center top"
        }), "MessageToast de aviso exibido para nenhum arquivo selecionado.");
    });
    QUnit.test("onConfirmarUpdate: Com arquivo selecionado e sucesso", function (assert) {
        const done = assert.async();

        // Mock do arquivo
        const oFileMock = new Blob(["file content"], { type: "image/png" });
        oFileMock.name = "imagem_teste.png";

        // NOVA ABORDAGEM: Use um Array simples para simular a FileList.
        // É mais simples e menos propenso a erros.
        const fileListArrayMock = [oFileMock];

        // Mock do FileUploader
        const oFileUpdateMock = {
            getDomRef: function () {
                return {
                    querySelector: function (selector) {
                        if (selector === "input[type='file']") {
                            // Agora retornamos um objeto cuja propriedade 'files' é um Array
                            return { files: fileListArrayMock };
                        }
                        return null;
                    }
                };
            },
            clear: sinon.stub()
        };

        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "update");

        // Stub do uploadDialog
        const oUpdateDialogMock = { close: sinon.stub() };

        // Substitui o byId do controller para retornar os mocks
        this.oByIdStub.withArgs("fileUploaderUpdate").returns(oFileUpdateMock);
        this.oByIdStub.withArgs("updateDialog").returns(oUpdateDialogMock);

        // Stub do jQuery.ajax simulando sucesso
        this.ajaxStub.yieldsTo("success", { message: "Upload bem-sucedido." });

        // Chama o método real (confirmar update)
        this.oController.onConfirmarUpdate();

        // Verifica se ajax foi chamado
        assert.ok(this.ajaxStub.calledOnce, "jQuery.ajax foi chamado uma vez.");
        // Verifica os argumentos da chamada do ajax
        const ajaxCallArgs = this.ajaxStub.getCall(0).args[0];
        assert.strictEqual(ajaxCallArgs.url, "http://localhost:5050/api/MetadadosDeImagem/1", "URL correta foi usada (com id).");
        assert.strictEqual(ajaxCallArgs.type, "PUT", "Método PUT foi usado.");
        assert.ok(ajaxCallArgs.data instanceof FormData, "Dados enviados são uma instância de FormData.");

        // Verifica se MessageToast de sucesso foi exibido
        setTimeout(function () {
            assert.ok(this.messageToastStub.calledWith("Atualizado com sucesso!", {
                duration: 3000,
                my: "center top",
                at: "center top"
            }), "MessageToast de sucesso exibido após upload.");

            // Verifica se o FileUploader foi limpo
            assert.ok(oFileUpdateMock.clear.calledOnce, "FileUploader.clear() foi chamado.");
            // Verifica se o dialog foi fechado
            assert.ok(oUpdateDialogMock.close.calledOnce, "Update dialog foi fechado.");

            done();
        }.bind(this), 0);
    });
    QUnit.test("onConfirmarUpdate: sucesso com payload de erro (server returned error in success)", function (assert) {
        const done = assert.async();

        // Mock do arquivo
        const oFileMock = new Blob(["file content"], { type: "image/png" });
        oFileMock.name = "imagem_teste.png";
        const fileListArrayMock = [oFileMock];

        const oFileUpdateMock = {
            getDomRef: function () {
                return {
                    querySelector: function (selector) {
                        if (selector === "input[type='file']") {
                            return { files: fileListArrayMock };
                        }
                        return null;
                    }
                };
            },
            clear: sinon.stub()
        };

        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "update");
        const oUpdateDialogMock = { close: sinon.stub() };
        this.oByIdStub.withArgs("fileUploaderUpdate").returns(oFileUpdateMock);
        this.oByIdStub.withArgs("updateDialog").returns(oUpdateDialogMock);

        // Spy on onGetMetadados to ensure it gets scheduled
        const onLoadSpy = sinon.spy(this.oController, "onGetMetadados");

        // Stub do jQuery.ajax simulando sucesso, porém com payload de erro
        this.ajaxStub.yieldsTo("success", { error: "Erro de validação" });

        this.oController.onConfirmarUpdate();

        // Verifica se ajax foi chamado
        assert.ok(this.ajaxStub.called, "jQuery.ajax foi chamado.");
        // Verifica a mensagem de erro exibida pelo controller
        setTimeout(function () {
            assert.ok(this.messageToastStub.calledWith("Erro ao realizar update, Erro de validação"), "MessageToast de erro exibido quando payload contém error.");
            // onGetMetadados deve ser agendado mesmo no caso de erro no payload
            assert.ok(onLoadSpy.calledOnce, "onGetMetadados foi agendado (setTimeout) após resposta com erro no payload.");
            onLoadSpy.restore();
            done();
        }.bind(this), 0);
    });
    QUnit.test("onConfirmarUpdate: erro de requisição ajax (servidor desligado)", function (assert) {
        // sem async necessário pois o error handler é chamado sincronamente pelo yieldsTo
        // Mock do arquivo
        const oFileMock = new Blob(["file content"], { type: "image/png" });
        oFileMock.name = "imagem_teste.png";
        const fileListArrayMock = [oFileMock];

        const oFileUpdateMock = {
            getDomRef: function () {
                return {
                    querySelector: function (selector) {
                        if (selector === "input[type='file']") {
                            return { files: fileListArrayMock };
                        }
                        return null;
                    }
                };
            },
            clear: sinon.stub()
        };


        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "update");
        this.oByIdStub.withArgs("fileUploaderUpdate").returns(oFileUpdateMock);

        // Simula erro de rede / servidor desligado
        const oErro = { status: 0, responseText: "Servidor não está respondendo." };
        this.ajaxStub.yieldsTo("error", oErro);

        this.oController.onConfirmarUpdate();

        assert.ok(this.messageToastStub.calledWith("Servidor provalvelmente está desligado.", {
            duration: 3000,
            my: "center top",
            at: "center top"
        }), "MessageToast de erro exibido quando servidor está desligado.");
    });
    QUnit.test("onCancelUpdate: deve fechar o diálogo de atualização", function (assert) {
        // Mocks para o diálogo e FileUploader
        const oUpdateDialogMock = { close: sinon.stub() };
        const oFileUploaderMock = { close: sinon.stub() };
        // Configura os stubs para retornar os mocks
        this.oByIdStub.withArgs("updateDialog").returns(oUpdateDialogMock);
        this.oByIdStub.withArgs("fileUploaderUpdate").returns(oFileUploaderMock);
        // mocka o metodo clear dentro do FileUploader
        oFileUploaderMock.clear = sinon.stub();
        this.oController.onCancelarUpdate();
        assert.ok(oUpdateDialogMock.close.calledOnce, "Diálogo de atualização foi fechado.");
    });
    QUnit.test("onSelecionarArquivo: com extensão permitida", function (assert) {
        const done = assert.async();
        const oFileMock = new Blob(["file content"], { type: "image/png" });
        oFileMock.name = "imagem_teste.png";
        const oEventMock = {
            getSource: function () {
                return { clear: sinon.stub() };
            },
            getParameter: function (param) {
                if (param === "files") {
                    return [oFileMock];
                }
                return null;
            }
        };

        this.oController.onSelecionarArquivo(oEventMock);

        setTimeout(function () {
            assert.ok(this.messageToastStub.calledWith("Arquivo carregado com sucesso: " + oFileMock.name, { duration: 300, my: "center top", at: "center top" }), "MessageToast de sucesso exibido para arquivo permitido.");
            done();
        }.bind(this), 0);
    });
    QUnit.test("onSelecionarArquivo: com extensão não permitida", function (assert) {
        const done = assert.async();
        const oFileMock = new Blob(["file content"], { type: "image/pn" });
        oFileMock.name = "imagem_teste.pn";
        const oEventMock = {
            getSource: function () {
                return { clear: sinon.stub() };
            },
            getParameter: function (param) {
                if (param === "files") {
                    return [oFileMock];
                }
                return null;
            }
        };

        this.oController.onSelecionarArquivo(oEventMock);

        setTimeout(function () {
            assert.ok(this.messageToastStub.calledWith("Extensão de arquivo não permitida. Por favor, selecione um arquivo de imagem (png, jpg, jpeg, bmp, gif).", { duration: 3000, my: "center top", at: "center top" }), "MessageToast de erro exibido para arquivo não permitido.");
            done();
        }.bind(this), 0);
    });
    QUnit.test("onPressionarDelete: deve abrir o diálogo de deleção com metadado selecionado", function (assert) {
        const oDeleteDialogMock = { open: sinon.stub() };
        this.oByIdStub.withArgs("deleteDialog").returns(oDeleteDialogMock);
        // Simula que um metadado está selecionado para deleção
        const oContextMock = {
            getProperty: sinon.stub()
        };
        oContextMock.getProperty.withArgs("Id").returns("zzz-sdasdDd-2");
        oContextMock.getProperty.withArgs("nomeDoArquivo").returns("imagem_teste.png");

        const oItemMock = { getBindingContext: sinon.stub().returns(oContextMock) };
        const oSourceMock = { getParent: sinon.stub().returns({ getParent: sinon.stub().returns(oItemMock) }) };
        const oEventoMock = { getSource: sinon.stub().returns(oSourceMock) };

        this.oController.onPressionarDelete(oEventoMock);
        assert.ok(oDeleteDialogMock.open.calledOnce, "Diálogo de deleção foi aberto.");
    });
    QUnit.test("onCancelarDelete: deve fechar o diálogo de deleção", function (assert) {
        const oDeleteDialogMock = { close: sinon.stub() };
        this.oByIdStub.withArgs("deleteDialog").returns(oDeleteDialogMock);
        this.oController.onCancelarDelete();
        assert.ok(oDeleteDialogMock.close.calledOnce, "Diálogo de deleção foi fechado.");
    });
    QUnit.test("onConfirmarDelete: sucesso na deleção", function (assert) {
        const done = assert.async();

        const oDeleteDialogMock = { close: sinon.stub() };
        this.oByIdStub.withArgs("deleteDialog").returns(oDeleteDialogMock);
        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "delete");

        this.ajaxStub.yieldsTo("success", { message: "Deleção bem-sucedida." });
        this.oController.onConfirmarDelete();

        setTimeout(function () {
            assert.ok(this.ajaxStub.called, "jQuery.ajax foi chamado.");
            const ajaxCallArgs = this.ajaxStub.getCall(0).args[0];
            assert.strictEqual(ajaxCallArgs.url, "http://localhost:5050/api/MetadadosDeImagem/1", "URL correta foi usada (com id).");
            assert.strictEqual(ajaxCallArgs.type, "DELETE", "Método DELETE foi usado.");
            setTimeout(function () {
                assert.ok(this.messageToastStub.calledWith("Deletado com sucesso!", {
                    duration: 3000,
                    my: "center top",
                    at: "center top"
                }), "MessageToast de sucesso exibido após deleção.");
                assert.ok(oDeleteDialogMock.close.calledOnce, "Delete dialog foi fechado.");
                done();
            }.bind(this), 0);
        }.bind(this), 0);
    });
    QUnit.test("onConfirmarDelete: erro na deleção - servidor desligado", function (assert) {
        const oDeleteDialogMock = { close: sinon.stub() };
        this.oByIdStub.withArgs("deleteDialog").returns(oDeleteDialogMock);
        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "delete");
        this.ajaxStub.yieldsTo("error", { status: 0 });

        this.oController.onConfirmarDelete();

        assert.ok(this.messageToastStub.calledWith("Servidor provalvelmente está desligado.", {
            duration: 3000,
            my: "center top",
            at: "center top"
        }), "MessageToast de erro exibido para servidor desligado.");
    });
    QUnit.test("onConfirmarDelete: erro na deleção - outro erro", function (assert) {
        const oDeleteDialogMock = { close: sinon.stub() };
        this.oByIdStub.withArgs("deleteDialog").returns(oDeleteDialogMock);
        this.oViewStub.setModel(new JSONModel({ Id: 1 }), "delete");
        const oErroMock = { status: 500, responseText: "Erro interno do servidor." };
        this.ajaxStub.yieldsTo("error", oErroMock);
        this.oController.onConfirmarDelete();

        assert.ok(this.messageToastStub.calledWith("Erro ao deletar: " + oErroMock.responseText, {
            duration: 3000,
            my: "center top",
            at: "center top"
        }), "MessageToast de erro exibido para outro erro.");
    });

});

