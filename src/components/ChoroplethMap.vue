<template>
  <div class="vis-component" ref="vis">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="choropleth-map" ref="map"></g>
    </svg>
  </div>
</template>

<script>
import mapStatesUSA from "@/assets/us-states-geo.json";
import * as d3 from "d3";

export default {
  name: "ChoroplethMap",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    };
  },
  mounted() {
    this.drawVis();
  },
  methods: {
    // TODO: put rect behind and add onClick to remove highlights
    drawVis() {
      if (this.$refs.vis) this.svgWidth = this.$refs.vis.clientWidth;
      // d3.selectAll("#scatterLabel").remove();
      this.initTooltip();

      // TODO: unselect by clicking next to map
      // d3.select(this.$refs.test).on("click", () => {
      //   this.$store.commit("clearStateSelection");
      // });

      d3.select(this.$refs.map).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawMap();
    },

    drawMap() {
      const path = this.getGeopath();

      const colorMap = this.$store.state.colorMap;

      d3.select(this.$refs.map)
        .selectAll("path")
        .data(mapStatesUSA.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) =>
          this.selectedStates.includes(d.properties.name)
            ? colorMap.get(d.properties.name)
            : "white"
        )
        .attr("stroke", "black")
        .on("click", (_, d) => {
          this.$store.commit("changeStateSelection", d.properties.name);
        })
        .on("mouseover", this.showTooltip)
        .on("mouseout", this.hideTooltip);
    },

    initTooltip() {
      d3.select("#mapTooltip").remove();
      // the idea of how to use tooltips was inspired by this website, but heavily changed to my own needs
      // https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
      d3.select("body")
        .append("div")
        .attr("id", "mapTooltip");
    },
    showTooltip(event, data) {
      d3.select("#mapTooltip")
        .style("left", `${event.pageX - 50}px`)
        .style("top", `${event.pageY + 50}px`)
        .style("opacity", 1)
        .text(data.properties.name);
    },
    hideTooltip() {
      d3.select(`#mapTooltip`).style("opacity", 0);
    },

    getGeopath() {
      return d3.geoPath().projection(this.getProjection());
    },
    getProjection() {
      return (
        d3
          // this projection was chosen due to the recommendation during the tutorial
          .geoAlbersUsa()
          // the next two lines were inspired by this website: https://bl.ocks.org/cmgiven/abca90f6ba5f0a14c54d1eb952f8949c
          .scale([this.svgWidth * 0.75])
          .translate([this.svgWidth / 2, this.svgHeight / 2])
      );
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
  },
  // TODO add watchers
  watch: {
    selectedStates: {
      handler() {
        this.drawVis();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.drawVis();
      },
      deep: true,
    },
    educationRates: {
      handler() {
        this.drawVis();
      },
      deep: true,
    },
  },
};
</script>

<style>
#mapTooltip {
  position: absolute;
  text-align: center;
  width: 110px;
  height: 30px;
  background: lightgrey;
  border-radius: 5px;
  font-size: 14px;
  opacity: 0;
}
</style>
