# Data Visualization

In this project, I built a webpage visualizing the relation between the Educational Attainment Rate and the Average Yearly Income in the USA. <br>
I used [VueJS](https://vuejs.org/) in conjunction with [d3js](https://d3js.org/) to implement it. <br>
The deployed website can be found [here](https://wwwlab.cs.univie.ac.at/~simone99/VIS21W/A3/).

## Visualization Methods

### Scatterplot
The first chart shows a Scatterplot, where each state of the USA corresponds to one datapoint on the plot. The background is divided into 9 parts using a bivariate color scheme. <br>
The chart implements tooltips, highlighting of selected datapoint and filtering using brushing.

### Choropleth Map
The second chart shows a map of the USA, where every state is highlighted, accoriding to its data, in the corresponding color of the bivariate color scheme. <br>
This chart also implements tooltips and custom selection of states. Furthermore, the selection is synced with the Scatterplot.

### Year Slider
Data is provided for a year range of 2006 until 2019. The user can select a year using a slider at the top, which responsively redraws both visualizations.

## What I´ve learned
- Developing a Webpage using VueJs with VueX as State Management
- Using different techniques to show data in a user-friendly way
- Interactivity on visualizations
- In-depth usage of d3js <sup>and what a bitch it can be sometimes ;)</sup>
