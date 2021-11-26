<template>
  <div class="vis-component" ref="vis">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="bg" ref="bg"></g>
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
      svgHeight: 600,
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
    this.initTooltip();
  },

  methods: {
    drawVis() {
      if (this.$refs.vis) this.svgWidth = this.$refs.vis.clientWidth;
      this.transformSVG();
      this.drawMap();
      this.addBackground();
    },

    transformSVG() {
      d3.select(this.$refs.map).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
    },

    drawMap() {
      const path = this.getGeopath();

      const colorMap = this.$store.state.colorMap;

      d3.select(this.$refs.map)
        .selectAll("path")
        .data(mapStatesUSA.features)
        .join("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", "0.5")
        .attr("fill", (d) => {
          if (!this.selectedStates.length) {
            return colorMap.get(d.properties.name);
          }
          return this.selectedStates.includes(d.properties.name)
            ? colorMap.get(d.properties.name)
            : "white";
        })
        .on("click", (_, d) => {
          this.$store.commit("changeStateSelection", d.properties.name);
        })
        .on("mouseover", this.showTooltip)
        .on("mouseout", this.hideTooltip);
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

    addBackground() {
      // add transparent rect "behind" map with onClick handler unselecting everything
      d3.select(this.$refs.bg)
        .append("rect")
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight)
        .attr("style", `fill:transparent;`)
        .on("click", () => {
          this.$store.commit("clearStateSelection");
        });
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
      // additional styling by css
      d3.select("#mapTooltip")
        .style("left", `${event.pageX - 50}px`)
        .style("top", `${event.pageY + 50}px`)
        .style("opacity", 1)
        .style("display", "block")
        .text(data.properties.name);
    },
    hideTooltip() {
      d3.select(`#mapTooltip`)
        .style("opacity", 0)
        .style("display", "none");
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
