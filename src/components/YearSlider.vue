<template>
  <div>
    <b-form-input
      id="range-year"
      v-model="selectedYear"
      type="range"
      min="2006"
      max="2019"
    ></b-form-input>
    <div class="mt-2 font-weight-bold h5">
      Data from the year: {{ selectedYear }}
    </div>
  </div>
</template>

<script>
export default {
  name: "YearSlider",
  props: {},
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  computed: {
    selectedYear: {
      get() {
        return this.$store.getters.selectedYear;
      },
      set(val) {
        this.$store.commit("changeSelectedYear", val);
      },
    },
  },
  watch: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
