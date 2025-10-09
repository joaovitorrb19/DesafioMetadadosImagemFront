sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.desafio.imagecrud.controller.Main", {

		onInit: function () {
			this.onGetMetadados();
		},
		//Testado e funcionando
		onGetMetadados: function () {
			const oModel = new JSONModel();

			jQuery.ajax({
				url: "http://localhost:5050/api/MetadadosDeImagem",
				type: "GET",
				dataType: "json",
				success: function (data) {
					const metadadosResposta = data || [];
					oModel.setData({ metadados: metadadosResposta });
					this.getView().setModel(oModel, "metadados");
					MessageToast.show("Metadados carregados com sucesso!");
				}.bind(this),
				error: function (err) {
					if (err.status === 0) {
						MessageToast.show("Servidor provalvelmente está desligado.");
					} else {
						MessageToast.show("Erro ao carregar metadados: " + err.responseText);
					}
				}.bind(this)
			});
		},
		//Testado e funcionando
		onAbrirUploadDialog: function () {
			this.byId("uploadDialog").open();
		},
		//Testado e funcionando
		onSelecionarArquivo: function (oEvent) {
			const fileUploader = oEvent.getSource();
			const files = oEvent.getParameter("files");
			const extensoesPermitidas = ["png", "jpg", "jpeg", "bmp", "gif"];
			if (files && files.length > 0 && files[0] && files[0].name) {
				const file = files[0];
				const extensao = file.name.split('.').pop().toLowerCase();
				if (extensoesPermitidas.includes(extensao)) {
					MessageToast.show("Arquivo carregado com sucesso: " + file.name, { duration: 300, my: "center top", at: "center top" });
				} else {
					MessageToast.show("Extensão de arquivo não permitida. Por favor, selecione um arquivo de imagem (png, jpg, jpeg, bmp, gif).", {
						duration: 3000,
						my: "center top",
						at: "center top"
					});
					fileUploader.clear();
				}
			}
		},
		//Testado e funcionando
		onPressionarUpload: function () {
			const fileInput = this.byId("fileUploader").getDomRef().querySelector("input[type='file']");
			const file = fileInput.files[0];

			if (!file) {
				MessageToast.show("Por favor, selecione um arquivo antes de enviar.", {
					duration: 3000,
					my: "center top",
					at: "center top"
				});
				return;
			}

			const formData = new FormData();
			formData.append("imagem", file);
			jQuery.ajax({
				url: "http://localhost:5050/api/MetadadosDeImagem",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					if (data && (data.error || data.erro)) {
						MessageToast.show("Erro ao realizar upload, " + (data.error || data.erro), {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
						setTimeout(this.onGetMetadados.bind(this), 0);
					} else {
						MessageToast.show("Cadastrado com sucesso!", {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
						this.byId("uploadDialog").close();
						this.byId("fileUploader").clear();
						setTimeout(this.onGetMetadados.bind(this), 0);
					}
				}.bind(this),
				error: function (err) {
					if (err && err.status === 0) {
						MessageToast.show("Servidor provalvelmente está desligado.", {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					} else {
						const msg = (err && err.responseJSON && err.responseJSON.erro) || (err && err.responseText) || "Erro desconhecido.";
						MessageToast.show(msg, {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					}
				}.bind(this)
			});


		},
		//Testado e funcionando
		onCancelarUpload: function () {
			this.byId("uploadDialog").close();
			this.byId("fileUploader").clear();
		},
		//Testado e funcionando
		onPressionarUpdate: function (oEvent) {
			const oItemToUpdate = oEvent.getSource().getParent().getParent();
			const oContext = oItemToUpdate.getBindingContext("metadados");
			const id = oContext.getProperty("id");
			const nomeDoArquivo = oContext.getProperty("nomeDoArquivo");

			const oModelUpdate = new JSONModel({ Id: id, NomeDoArquivo: nomeDoArquivo });

			this.getView().setModel(oModelUpdate, "update");
			this.byId("updateDialog").open();
		},
		//Testado e funcionando
		onConfirmarUpdate: function () {
			const idUpdate = this.getView().getModel("update").getProperty("/Id");
			const fileInput = this.byId("fileUploaderUpdate").getDomRef().querySelector("input[type='file']");
			const file = fileInput.files[0];

			if (!file) {
				MessageToast.show("Por favor, selecione um arquivo antes de enviar.", {
					duration: 3000,
					my: "center top",
					at: "center top"
				});
				return;
			}

			const formData = new FormData();
			formData.append("imagem", file);

			jQuery.ajax({
				url: "http://localhost:5050/api/MetadadosDeImagem/" + idUpdate,
				type: "PUT",
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					if (data && (data.error || data.erro)) {
						MessageToast.show("Erro ao realizar update, " + (data.error || data.erro), {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
						setTimeout(this.onGetMetadados.bind(this), 0);
					} else {
						MessageToast.show("Atualizado com sucesso!", {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
						this.byId("updateDialog").close();
						this.byId("fileUploaderUpdate").clear();
						setTimeout(this.onGetMetadados.bind(this), 0);
					}
				}.bind(this),
				error: function (err) {
					if (err && err.status === 0) {
						MessageToast.show("Servidor provalvelmente está desligado.", {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					} else {
						const msg = (err && err.responseJSON && err.responseJSON.erro) || (err && err.responseText) || "Erro desconhecido.";
						MessageToast.show(msg, {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					}
				}.bind(this)
			});
		},
		//Testado e funcionando
		onCancelarUpdate: function () {
			this.byId("updateDialog").close();
			this.byId("fileUploaderUpdate").clear();
		},
		//Testado e funcionando
		onPressionarDelete: function (oEvent) {

			const oItemToDelete = oEvent.getSource().getParent().getParent();
			const oContext = oItemToDelete.getBindingContext("metadados");
			const id = oContext.getProperty("id");
			const nomeDoArquivo = oContext.getProperty("nomeDoArquivo");

			const oModelDelete = new JSONModel({ Id: id, NomeDoArquivo: nomeDoArquivo });

			this.getView().setModel(oModelDelete, "delete");
			this.byId("deleteDialog").open();
		},
		//Testado e funcionando
		onConfirmarDelete: function () {
			const idDelete = this.getView().getModel("delete").getProperty("/Id");
			jQuery.ajax({
				url: "http://localhost:5050/api/MetadadosDeImagem/" + idDelete,
				type: "DELETE",
				success: function () {
					MessageToast.show("Deletado com sucesso!", {
						duration: 3000,
						my: "center top",
						at: "center top"
					});
					this.byId("deleteDialog").close();
					setTimeout(this.onGetMetadados.bind(this), 0);
				}.bind(this),
				error: function (err) {
					if (err.status === 0) {
						MessageToast.show("Servidor provalvelmente está desligado.", {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					} else {
						MessageToast.show("Erro ao deletar: " + (
							(err && err.responseJSON && err.responseJSON.erro) ||
							(err && err.responseText) ||
							err.statusText ||
							err.message
						), {
							duration: 3000,
							my: "center top",
							at: "center top"
						});
					}
				}.bind(this)
			});
		},
		//Testado e funcionando
		onCancelarDelete: function () {
			this.byId("deleteDialog").close();
		},
	});
});
