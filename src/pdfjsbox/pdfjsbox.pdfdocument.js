(function (ng, __, PDFJS) {
	'use strict';
	var pdfbox;
	try {
		pdfbox = ng.module('pdfjs-box');
	} catch (e) {
		pdfbox = ng.module('pdfjs-box', []);
	}
	pdfbox.directive('pdfDocument', pdfDocument);
	/* @ngInject */
	function pdfDocument($q, pdfjsConfig, pdfjsboxWatcherServices, pdfjsboxItemServices) {
		return {
			restrict: 'E',
			scope: {
				// nom interne : nom externe
				'pdf': '<', // le document sous forme d'objet
				'ngItems': '=' // la liste de items representant les pages du document
			},
			link: function (scope, elm, attrs, ctrl) {
				var watcherClears = [];
				watcherClears.push(scope.$watch('pdf', function (v1, v2, s) {
					updatePdf(s, v1);
				}, true));
				pdfjsboxWatcherServices.cleanWatchersOnDestroy(scope, watcherClears);
				updatePdf(scope, scope.pdf);
			}
		};
		/**
		 * Changement de document
		 * @param {Angular scope} scope
		 * @param {Document|url} pdf
		 */
		function updatePdf(scope, pdf) {
			var items = scope.ngItems || [];
			items.splice(0, items.length);
			if (pdf) {
				var task = PDFJS.getDocument(pdf);
				return task.promise.then(function (pdfDocument) {
					var t0 = new Date().getTime();
					return loadRecursivePage(scope, pdf, pdfDocument, items, 0, pdfjsConfig.preloadRecursivePages).then(function () {
						console.log('Preload recursive ' + Math.min(pdfjsConfig.preloadRecursivePages, pdfDocument.numPages) + ' pages in %sms', new Date().getTime() - t0);
					}, function (reason) {
						console.log('Recursive preloading cancel cause document changed.');
					});
				}).catch(function (reason) {
					console.error('Error: ' + reason);
				});
			}
			return null;
		}
		/**
		 * Pré-Charge une page, utilisé dans le mode séquenciel
		 * @param {Document} pdf : document fournit par l'application
		 * @param {PdfDocument} pdfDocument : le docuzment pdf fournit par le framework pdfjs
		 * @param {Array<Item>} items : chaque item represente une page du pdf : {document: document, pageIdx: idx, rotate: 0}
		 * @param {Number} idx : index de la page à charger
		 * @param {Number} skiped : nombre d'element sauté avant de commencer l'iteration, sert pour le log
		 * @param {Number} t0 : pour le timing
		 */
		function loadSinglePage(pdf, pdfDocument, items, idx, skiped, t0) {
			var deferred = $q.defer();
			var item = {document: pdf, pageIdx: idx + 1, rotate: 0, items: items, getPage: function () {
					return deferred.promise;
				}};
			items.push(item);
			pdfDocument.getPage(idx + 1).then(function (pdfPage) {
				deferred.resolve(pdfPage);
				if ((idx + 1) === pdfDocument.numPages) {
					console.log('Preload sequence ' + (pdfDocument.numPages - skiped) + ' pages in %sms', new Date().getTime() - t0);
				}
			});
		}
		/**
		 * Charge les pages de facon récursive ou mix si max est inferieur à numPages 
		 * @param {Angular Scope} scope
		 * @param {Document} pdf : document fournit par l'application
		 * @param {PdfDocument} pdfDocument : le docuzment pdf fournit par le framework pdfjs
		 * @param {Array<Item>} items : chaque item represente une page du pdf : {document: document, pageIdx: idx, rotate: 0}
		 * @param {Number} idx : index de la page à charger
		 * @param {Number} max : nombre de page à charger en mode récursive avant de passer au mode séquentiel
		 */
		function loadRecursivePage(scope, pdf, pdfDocument, items, idx, max) {
			if (idx < max && idx < pdfDocument.numPages) {
				var deferred = $q.defer();
				var item = {document: pdf, pageIdx: idx + 1, rotate: 0, items: items, getPage: function () {
						return deferred.promise;
					}};
				items.push(item);
				scope.$apply();
				return pdfDocument.getPage(idx + 1).then(function (pdfPage) {
					deferred.resolve(pdfPage);
					if (scope.pdf === pdf) { // on s'assure que l'on a pas changé de document
						return loadRecursivePage(scope, pdf, pdfDocument, items, idx + 1, max);
					} else {
						throw new Error();
					}
				});
			} else {
				for (var i = idx; i < pdfDocument.numPages; i++) {
					loadSinglePage(pdf, pdfDocument, items, i, idx, new Date().getTime());
				}
				scope.$apply();
			}
			return null;
		}
	}
})(angular, _, PDFJS);