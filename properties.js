define( [], function () {
	'use strict';
	
	var dimensions = {
		uses: "dimensions",
		min: 0,
		max: 3
	};
	
	var measures = {
		uses: "measures",
		min: 0,
		max: 1
	};
	
	// Use this technique for the URL to the web service
	var header1_item1 = {
		ref: "props.section1.item1",
		label: "Open CPU server URL",
		type: "string",
		expression: "optional"
	};

	var header1_item2 = {
		ref: "props.section1.item2",
		label: "Open CPU command",
		type: "string",
		expression: "optional"
	};

	var header1_item3 = {
		ref: "props.section1.item3",
		label: "Group by",
		type: "string",
		expression: "optional"
	};
	
	
	// Use this technique for parameters to the relevant R snippet
	var myCustomSection = {
		component: "expandable-items",
		label: "R command",
		items: {
			header1: {
				type: "items",
				label: "Open CPU parameters",
				items: {
					header1_item1: header1_item1,
					header1_item2: header1_item2,
					header1_item3: header1_item3
				}
			}
		}
	};
	
	// var mycustomsection = {
		// component: "expandable-items",
		// label: "r command",
			// header1: {
				// type: "items",
				// label: "open cpu parameters",
				// items: {
					// header1_item1: header1_item1,
					// header1_item2: header1_item2
			// }
		// }
	// };

	
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: {
				uses: "dimensions"
			},
			measures: {
				uses: "measures"
			},
			sorting: {
				uses: "sorting"
			},
			appearance: {
				uses: "settings"
			},
			customSection: myCustomSection
		}
	};
} );