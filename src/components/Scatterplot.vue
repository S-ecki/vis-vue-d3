<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSVG">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="scatter-group" ref="scatterGroup">
          <g class="rect-group" ref="rectGroup"></g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import bivariate_colors from "../store/bivariate_colors.js";

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
    this.drawChart();
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.selectAll("#scatterLabel").remove(); // TODO:removing of everything in own function

      this.initTooltip();

      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawXAxis();
      this.drawYAxis();
      this.drawBackground();
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

      d3.select(this.$refs.axisY)
        .call(yAxis)
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
      let colorInd = 0;
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
          this.appendRect(i, j, colorInd++);
        }
      }
    },
    appendRect(xInd, yInd, colorInd) {
      const color = bivariate_colors.colors[colorInd];
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
        .style("top", `${event.pageY + 50}px`)
        .style("opacity", 1)
        .text(data.state);
    },
    hideTooltip() {
      d3.select(`#scatterTooltip`).style("opacity", 0);
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
        this.drawChart();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedStates: {
      handler() {
        this.drawChart();
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
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
