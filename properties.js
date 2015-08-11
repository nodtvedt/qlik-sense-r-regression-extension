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
	
	var header1_item1 = {
		ref: "props.section1.item1",
		label: "Open CPU server URL",
		type: "string",
		expression: "optional"
	};

	// This one is from when I tried to get this to be a flexible module that took R commands as a parameter
	var header1_item2 = {
		ref: "props.section1.item2",
		label: "Open CPU server url",
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
		label: "R configuration",
		items: {
			header1_item1: header1_item1
		}
	};
	
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
			grouping: header1_item3,
			customSection: header1_item1,
			appearance: {
				uses: "settings"
			}
		},
		snapshot: {
			canTakeSnapshot: true
		}
	};
} );