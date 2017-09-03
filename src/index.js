import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import angular from 'angular';
//var angular = require('angular');

require('./pdfs/conditions.pdf');
require('./pdfs/guide.pdf');
require('./pdfs/UnicodeStandard.pdf');
require('./favicon.ico');
require('./pdfjsbox/pdfjsbox.css');
require('./pdfjsbox/pdfjsbox.config.js');
require('./pdfjsbox/pdfjsbox.pdfdocscale.js');
require('./pdfjsbox/pdfjsbox.pdfcommands.js');
require('./pdfjsbox/pdfjsbox.pdfdocument.js');
require('./pdfjsbox/pdfjsbox.pdfthumbnail.js');
require('./pdfjsbox/pdfjsbox.pdfthumbnails.js');
require('./pdfjsbox/pdfjsbox.pdfview.js');
require('./pdfjsbox/pdfjsbox.services.js');

(function (ng, __) {
	'use strict';
	ng.module('app', ['pdfjs-box'])
			  .constant('pdfjsConfig', { workerSrc: './pdf.worker.bundle.js', preloadRecursivePages:7 } )
			  .controller('AppCtrl', AppCtrl);
	function AppCtrl() {
		var ctrl = this;
		ctrl.documents = [{label:'Conditions générales', url:'conditions.pdf'}, 
			{label:'guide renovation 2016', url:'guide.pdf'}, 
			{label:'UnicodeStandard', url:'UnicodeStandard.pdf'}];
		ctrl.items = [];
		ctrl.items2 = [];
		ctrl.selectedDocument;
		ctrl.docscale = 'fitV';
		ctrl.scale;
		ctrl.selectedItem;
		ctrl.globalData = {test:5};
		ctrl.labelSupplier = labelSupplier;
		ctrl.onSave = onSave;
		
		
		function labelSupplier(document, data, index) {
			return document.label + ' ('+index+')';
		}
		function onSave(items) {
			alert('document PDF de '+items.length+' pages sauvegardées');
			items.splice(0, items.length);
		}
	}
})(angular, _);
