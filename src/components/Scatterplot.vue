<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSVG">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="scatter-group" ref="scatterGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

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
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawXAxis();
      this.drawYAxis();
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

    drawScatter() {
      d3.select(this.$refs.scatterGroup)
        .selectAll(".scatter")
        .data(this.getScatterData)
        .join("circle")
        .attr("class", "scatter")
        .attr("stroke", "white")
        .attr("fill", "black")
        .attr("cx", (d) => this.xScale(d.x))
        .attr("cy", (d) => this.yScale(d.y))
        .attr("r", 4);
    },

    getScatterData() {
      return this.$store.getters.personalIncome.map((pInc, i) => ({
        state: pInc.state,
        x: this.$store.getters.educationRates[i].value,
        y: pInc.value,
      }));
      // let returnArray = [];
      // for (let i = 0; i < this.$store.getters.personalIncome.length; ++i) {
      //   returnArray.push({
      //     state: this.$store.getters.educationRates[i].state,
      //     x: this.$store.getters.educationRates[i].value,
      //     y: this.$store.getters.personalIncome[i].value,
      //   });
      // }
      // return returnArray;
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
  },
};
</script>

<style></style>
