/* global _ */
/* global PDFJS */
(function (ng, __, PDFJS) {
	'use strict';
	var pdfbox;
	try {
		pdfbox = ng.module('pdfjs-box');
	} catch (e) {
		pdfbox = ng.module('pdfjs-box', ['boxes.scroll']);
	}
	pdfbox.run(config);
	/* @ngInject */
	function config($templateCache, pdfjsConfig) {
		var pdfapi = PDFJS.PDFJS ? PDFJS.PDFJS : PDFJS;
		if (pdfjsConfig.workerSrc) {
			pdfapi.GlobalWorkerOptions.workerSrc = pdfjsConfig.workerSrc;
		}
		pdfapi.cMapUrl = pdfjsConfig.cMapUrl || 'cmaps/';
		pdfapi.cMapPacked = pdfjsConfig.cMapPacked === true;
		$templateCache.put('pdfthumbnails.html', require('./pdfthumbnails.html'));
		$templateCache.put('pdfthumbnail.html', require('./pdfthumbnail.html'));
		$templateCache.put('pdfview.html', require('./pdfview.html'));
		$templateCache.put('pdfcommands.html', require('./pdfcommands.html'));
	}
})(angular, _, PDFJS);