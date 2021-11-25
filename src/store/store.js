import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedYear: 2006,
    selectedStates: [],
    educationRates: [],
    personalIncome: [],

    colorMap: new Map(),

  },
  mutations: {
    changeSelectedYear(state, year) {
      state.selectedYear = year;
    },
    changeStateSelection(state, stateName) {
      state.selectedStates.includes(stateName) ?
        // remove element if in array
        state.selectedStates.splice(state.selectedStates.indexOf(stateName), 1) :
        // add element if not in array
        state.selectedStates.push(stateName);
    },
    clearStateSelection(state) {
      state.selectedStates = []
    },

    setColorMap(state, colorMap) {
      state.colorMap = colorMap;
    }
  },
  getters: {
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    educationRates(state) {
      let result = [];
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    personalIncome(state) {
      let result = [];
      for (let i = 0; i < state.personalIncome.length; i++) {
        if (state.selectedYear in state.personalIncome[i]) {
          result.push({
            state: state.personalIncome[i].State,
            value: +state.personalIncome[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    colorMap: (state) => state.colorMap,
  },
  actions: {
    loadData({ state }) {
      d3.csv('./usa_ba-degree-or-higher_2006-2019.csv').then((data) => {
        state.educationRates = data;
      })

      d3.csv('./usa_personal-income-by-state_2006-2019.csv').then((data) => {
        state.personalIncome = data;
      })
    },
  }
})

export default store;
