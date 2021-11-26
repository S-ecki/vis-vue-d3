<template>
  <div id="app">
    <h1>
      Relation between the Educational Attainment Rate and the Average yearly
      Income in the USA
    </h1>
    <div class="container-fluid">
      <div class="row justify-content-center p-5">
        <div class="col-md-8">
          <YearSlider />
        </div>
      </div>
      <div class="row p-4">
        <div class="col-md-5">
          <Scatterplot />
        </div>
        <div class="col-md-7">
          <ChoroplethMap />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChoroplethMap from "./components/ChoroplethMap.vue";
import Scatterplot from "./components/Scatterplot.vue";
import YearSlider from "./components/YearSlider.vue";

export default {
  name: "App",
  components: {
    ChoroplethMap,
    YearSlider,
    Scatterplot,
  },
  mounted() {
    this.$store.dispatch("loadData");
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
