define( [
		'./properties',
		'jquery',
		'./javascript/opencpu-0.5'
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
//			console.log( layout );

			$element.empty();
			var ordering_parameter = layout.props.section1.item3;
			

			// Initialise some objects for the occasion
			var r_dimensions = [];
			var r_columns = {};
			var r_data = [];
			var r_analysis_axes = [];
			
			// Traverse the dimension and measure info in the hypercube
			for(var i = 0; i < layout.qHyperCube.qDimensionInfo.length; i++ ) {
				if( layout.qHyperCube.qDimensionInfo[i].qFallbackTitle != ordering_parameter) {
					r_dimensions.push(i);
					r_data.push(layout.qHyperCube.qDimensionInfo[i].qFallbackTitle);
					r_columns[layout.qHyperCube.qDimensionInfo[i].qFallbackTitle] = [];
					r_analysis_axes.push(layout.qHyperCube.qDimensionInfo[i].qFallbackTitle);
				}
			}
			
			// Create the regression formula to pass to R's lm function.
			var measurename = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle;
			
			measurename = measurename.replace(/\W+/g, "_"); // Avoid confusing R by removing non-alphanumeric characters from measure.
			measurename = measurename.replace(/_$/, ''); // Remove trailing '_' for teh pretties.

			var r_formula = measurename +  '~'
				+ r_analysis_axes.join( '+' );
				
			r_data.push(measurename)
			r_columns[measurename] = [];
			
			r_dimensions.push(layout.qHyperCube.qDimensionInfo.length);
		
			// Traverse the hypercube to pick up the data we need and stuff it into a structure that R likes
			for(var m = 0; m < layout.qHyperCube.qDataPages[0].qMatrix.length; m++ ) {
				for(var d=0; d < r_dimensions.length; d++) {
					var cellvalue = layout.qHyperCube.qDataPages[0].qMatrix[m][r_dimensions[d]].qText;
					
					// Check that the value is a number, otherwise add null to the data we send to R
					if(cellvalue - parseFloat(cellvalue) >= 0) {
						r_columns[r_data[d]].push(Number(cellvalue));
					}
					else {
						r_columns[r_data[d]].push(null);
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
						data : r_columns
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
	};
});