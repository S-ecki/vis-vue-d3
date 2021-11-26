<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSVG">
      <g class="chart-group" ref="chartGroup">
        <g class="rect-group" ref="rectGroup"></g>
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
      </g>
      <g class="brush-group" ref="brushGroup"></g>
      <g class="scatter-group" ref="scatterGroup"></g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import bivariate_colors from "../helpers/bivariate_colors.js";

export default {
  name: "Scatterplot",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 70,
      },
    };
  },

  mounted() {
    this.drawVis();
    this.refillColorMap();
    this.initTooltip();
  },

  methods: {
    drawVis() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      this.drawChart();
      this.transformSVGs();
    },

    transformSVGs() {
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      d3.select(this.$refs.scatterGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      d3.select(this.$refs.brushGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
    },

    drawChart() {
      d3.selectAll("#scatterLabel").remove();
      this.drawXAxis();
      this.drawYAxis();
      this.drawBackground();
      this.addBrush();
      this.drawScatter();
    },

    drawXAxis() {
      const xAxis = d3
        .axisBottom(this.xScale)
        .ticks(6)
        .tickFormat((data) => `${data}%`);

      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom} )`
        )
        .call(xAxis);

      this.drawXLabel();
    },
    drawXLabel() {
      d3.select(this.$refs.axisY) // TODO: fix this
        .append("text")
        .attr("id", "scatterLabel")
        .attr("y", this.svgHeight - this.svgPadding.top - 10)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("Educational Attainment: Bachelor's Degree or Higher (%)");
    },

    drawYAxis() {
      const yAxis = d3
        .axisLeft(this.yScale)
        .ticks(6)
        .tickFormat((data) => `${data}`);

      d3.select(this.$refs.axisY).call(yAxis);

      this.drawYLabel();
    },
    drawYLabel() {
      d3.select(this.$refs.axisY)
        .append("text")
        .attr("id", "scatterLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.svgPadding.left + 15)
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Average Yearly Personal Income (in $)");
    },

    // draws 9 same size rects with colors from "bivariate_colors" behind scatter
    drawBackground() {
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
          this.appendRect(i, j);
        }
      }
    },
    appendRect(xInd, yInd) {
      const color = bivariate_colors[xInd][yInd];

      d3.select(this.$refs.rectGroup)
        .append("rect")
        .attr("x", xInd * this.rectWidth)
        .attr("y", yInd * this.rectHeight)
        .attr("width", this.rectWidth)
        .attr("height", this.rectHeight)
        .attr("style", `fill:${color};`);
    },

    drawScatter() {
      d3.select(this.$refs.scatterGroup)
        .selectAll(".scatter")
        .data(this.getScatterData)
        .join("circle")
        .attr("class", "scatter")
        .attr("stroke", "white")
        .attr("fill", (d) =>
          this.selectedStates.includes(d.state) ? "red" : "black"
        )
        .attr("cx", (d) => this.xScale(d.x))
        .attr("cy", (d) => this.yScale(d.y))
        .attr("r", 4)
        .on("click", (_, d) => {
          this.$store.commit("changeStateSelection", d.state);
        })
        .on("mouseover", this.showTooltip)
        .on("mouseout", this.hideTooltip);
    },

    getScatterData() {
      return this.$store.getters.personalIncome.map((pInc, i) => ({
        state: pInc.state,
        x: this.$store.getters.educationRates[i].value,
        y: pInc.value,
      }));
    },

    initTooltip() {
      d3.select("#scatterTooltip").remove();
      // the idea of how to use tooltips was inspired by this website, but heavily changed to my own needs
      // https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
      d3.select("body")
        .append("div")
        .attr("id", "scatterTooltip");
    },
    showTooltip(event, data) {
      d3.select("#scatterTooltip")
        .style("left", `${event.pageX - 50}px`)
        .style("top", `${event.pageY + 30}px`)
        .style("opacity", 1)
        .style("display", "block")
        .text(data.state);
    },
    hideTooltip() {
      d3.select(`#scatterTooltip`)
        .style("opacity", 0)
        .style("display", "none");
    },

    // this fills up the Map in the store, which saves the colors
    // each state should be highlighted on the choropleth map when selected
    // gets called every time eduRate/ persIncome change
    refillColorMap() {
      let colorMap = new Map();
      const data = this.getScatterData();

      for (let datapoint of data) {
        const color = this.getColorForDatapoint(datapoint.x, datapoint.y);
        colorMap.set(datapoint.state, color);
      }

      this.$store.commit("setColorMap", colorMap);
    },
    // returns hex code that the state should be highlighted with
    getColorForDatapoint(eduRate, persIncome) {
      const x = this.getXColorIndex(eduRate);
      const y = this.getYColorIndex(persIncome);

      const color = bivariate_colors[x][y];
      return color;
    },
    // determines the x-"index" of the field the datapoint is on
    // the left column is be 0, middle 1 and right 2
    getXColorIndex(eduRate) {
      const scale = d3
        .scaleLinear()
        .domain([this.educationalRatesMin, this.educationalRatesMax]);

      const xColorIndex = Math.floor(scale(eduRate) * 3);
      return xColorIndex == 3 ? xColorIndex - 1 : xColorIndex;
    },
    // determines the y-"index" of the field the datapoint is on
    // the left row is be 0, middle 1 and right 2
    getYColorIndex(persIncome) {
      const scale = d3
        .scaleLinear()
        .domain([this.personalIncomeMin, this.personalIncomeMax]);

      const yColorIndex = 2 - Math.floor(scale(persIncome) * 3);
      return yColorIndex == -1 ? 0 : yColorIndex;
    },

    // !

    onStartBrush(event) {
      const selection = event.selection;

      // if (!selection) {
      //   this.$store.commit("clearStateSelection");
      //   return;
      // }
      // console.log(" x: s" + selection[0][0] + " e" + selection[1][0]);
      // console.log(" y: s" + selection[1][1] + " e" + selection[0][1]);

      // gets the actual values of the corners of the brush
      const eduStart = this.xScale.invert(selection[0][0]);
      const eduEnd = this.xScale.invert(selection[1][0]);
      const incStart = this.yScale.invert(selection[1][1]);
      const incEnd = this.yScale.invert(selection[0][1]);

      console.log("start " + eduStart, "end " + eduEnd);
      console.log("start " + incStart, "end " + incEnd);

      const selectedStates = this.getScatterData()
        .filter((datapoint) => {
          console.log("dreckscheiß warum gehst du nicht");
          console.log(datapoint);
          const edu = datapoint.x;
          const inc = datapoint.y;

          return (
            edu >= eduStart && edu <= eduEnd && inc >= incStart && inc <= incEnd
          );
        })
        .map((datapoint) => datapoint.state);
      this.$store.commit("changeSelectedStates", selectedStates);
    },

    // !

    addBrush() {
      // Brush control
      const brush = d3
        .brush()
        .extent([
          [0, 0],
          [
            this.svgWidth - this.svgPadding.left - this.svgPadding.right,
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          ],
        ])
        .on("start brush", this.onStartBrush);

      // d3.select("#brush").remove();

      d3.select(this.$refs.brushGroup)
        .attr("id", "brush")
        // .attr(
        //   "transform",
        //   `translate(${this.svgPadding.left}, ${this.svgPadding.top})`
        // )
        .attr("class", "brush")
        .call(brush);

      d3.select("scatter-group").raise();
    },
  },

  computed: {
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    personalIncome: {
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },

    educationalRatesMax() {
      return d3.max(this.educationRates, (d) => d.value);
    },
    educationalRatesMin() {
      return d3.min(this.educationRates, (d) => d.value);
    },

    personalIncomeMax() {
      return d3.max(this.personalIncome, (d) => d.value);
    },
    personalIncomeMin() {
      return d3.min(this.personalIncome, (d) => d.value);
    },

    xScale() {
      return d3
        .scaleLinear()
        .domain([this.educationalRatesMin, this.educationalRatesMax])
        .range([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ]);
    },
    yScale() {
      return d3
        .scaleLinear()
        .domain([this.personalIncomeMin, this.personalIncomeMax])
        .range([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ]);
    },

    rectWidth() {
      return (this.svgWidth - this.svgPadding.right - this.svgPadding.left) / 3;
    },
    rectHeight() {
      return (
        (this.svgHeight - this.svgPadding.top - this.svgPadding.bottom) / 3
      );
    },
  },

  watch: {
    educationRates: {
      handler() {
        this.drawVis();
        this.refillColorMap();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.drawVis();
        this.refillColorMap();
      },
      deep: true,
    },
    selectedStates: {
      handler() {
        this.drawVis();
      },
      deep: true,
    },
  },
};
</script>

<style>
#scatterTooltip {
  position: absolute;
  text-align: center;
  width: 110px;
  height: 45px;
  background: lightgrey;
  border-radius: 5px;
  font-size: 14px;
  opacity: 0;
  display: none;
}
</style>
