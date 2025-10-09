sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: com.desafio.imagecrud",
		defaults: {
			page: "ui5://test-resources/com/desafio/imagecrud/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "com/desafio/imagecrud/",
				never: "test-resources/com/desafio/imagecrud/"
			},
			loader: {
				paths: {
					"com/desafio/imagecrud": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for com.desafio.imagecrud"
			},
			"integration/opaTests": {
				title: "Integration tests for com.desafio.imagecrud"
			}
		}
	};
});
