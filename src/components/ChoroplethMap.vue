<template>
  <div class="vis-component" ref="chart">
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
    // Use the following map geoJSON object ("mapStatesUSA") for your projection
    console.log(mapStatesUSA);

    this.drawVis();
  },
  methods: {
    drawVis() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      // d3.selectAll("#scatterLabel").remove();
      d3.select(this.$refs.map).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      // TODO add map
      this.drawMap();
    },

    drawMap() {
      const path = this.getGeopath();

      d3.select(this.$refs.map)
        .selectAll("path")
        .data(mapStatesUSA.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "white")
        .attr("stroke", "black");
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
  watch: {},
};
</script>

<style></style>
