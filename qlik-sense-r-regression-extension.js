function runRegression($element, layout, fullMatrix) {
	console.log("Run a regression on a dataset with " + fullMatrix.length + " rows.");

	$element.empty();
	var ordering_parameter = layout.props.section1.item3;
	var keymap = new Map(); // Want to store dimension names and qDatapages indices

	// Initialise some objects for the occasion
	var r_analysis_axes = [];
	
	// Traverse the dimension info in the hypercube and store dimension names and the column index in the qMatrix.
	// Note that we are using the layout's hypercube for this, as it contains the parameter names and other metadata
	// that we need to construct the formula and retain the ordering we need.
	for(var i = 0; i < layout.qHyperCube.qDimensionInfo.length; i++ ) {
		if( layout.qHyperCube.qDimensionInfo[i].qFallbackTitle != ordering_parameter) {
			var dimension_name = layout.qHyperCube.qDimensionInfo[i].qFallbackTitle;
			
			r_analysis_axes.push(dimension_name);
			keymap.set(i, dimension_name);
		}
	}

	// Find the measure name. We can have one measure.
	var measurename = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle;
	
	measurename = measurename.replace(/\W+/g, "_").// Avoid confusing R by removing non-alphanumeric characters from measure.
			replace(/_$/, ''); // Remove trailing '_' for teh pretties.

	// Create the regression formula to pass to R's lm function.  Add the measure to the column map.
	var r_formula = measurename +  '~' + r_analysis_axes.join( '+' );
	keymap.set(layout.qHyperCube.qDimensionInfo.length, measurename);
	
	// The data structure that we will pass to r, which will become a dataframe on the r-end of things. Add a first row with
	// the column names.
	var r_dataframe = {};
	for(var column_name of keymap.values()) {
		r_dataframe[column_name] = [];
	}
	// Traverse the flattened data structure we get from senseUtils and populate the data frame.
	for(var m = 0; m < fullMatrix.length; m++ ) {
		for(var column_index of keymap.keys()) {
			var cellvalue = fullMatrix[m][column_index].qText;

			if(cellvalue - parseFloat(cellvalue) >= 0) {
				r_dataframe[keymap.get(column_index)].push(Number(cellvalue));
			}
			else {
				r_dataframe[keymap.get(column_index)].push(null);
			}

		}
	}
	
	// Read some parameters from the Sense Extension and construct the Open CPU service URL and command
	var url = layout.props.section1.item1;
	
	if(url === undefined || url === null || url == '') {
		$element.append('<p>Please use a valid Open CPU server URL parameter. You <i>could</i> use https://public.opencpu.org, but you <i>should</i> use a local installation to keep track of your own CPU usage.</p>');
	}
	else {
		// url = "https://public.opencpu.org";			
		url = url.replace(/\/?$/, '/');
		var command = url + 'ocpu/library/stats/R';

		ocpu.seturl(command)
		
		// Pass the structured data and formula to lm
		var req = $element.rplot(
			"lm", // This is the magic R function that does multi-factor regressions. Check ?lm in an R console for help
			{
				formula : r_formula,
				data : r_dataframe
			},
			function(output){
				$element.empty();

				
				var innerurl = url + output.output[0];

				$.ajax({
					type: "get",
					url: innerurl,
					
					success: function(inner) {$element.append('<pre>' + inner + '</pre>')},
					error: function(einner) {console.log(einner); $element.append( 'Failed to retrieve result.' )}
				
				})
			}); 			
		
		// Catch error from rplot and say something hopefully useful
		req.fail(function(){
			$element.append("<pre>R returned an error: " + req.responseText + '</pre>'); 
		});
	}
}	
	

define( [
		'./properties',
		'jquery',
		'./javascript/opencpu-0.5',
		'./javascript/senseUtils'
	],
	function ( props ) {
		'use strict';
		
		return {

		definition : props,
        initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [
					{
						qWidth: 10,
						qHeight: 1000
					}
				]
			}
		},
		paint: function ( $element, layout )  {

			// We use senseUtils to consolidate the hypercube into a single data matrix, and pass our regression function to it.
            senseUtils.pageExtensionData(this, $element, layout, runRegression);
		}
	};
});