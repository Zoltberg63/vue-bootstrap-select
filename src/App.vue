<template>
  <div id="app">
    <h2>Array of strings</h2>
    <div class="options">
      <p><b>Options:</b></p>
      <div>
        <input type="checkbox" v-model="disabledName">
        disabled
      </div>
      <div>
        <input type="checkbox" v-model="searchableName">
        searchable
      </div>
    </div>
    <VSelect
      v-model="selectedName"
      :options="names"
      :disabled="disabledName"
      :searchable="searchableName"/>
    <h2>Array of objects</h2>
    <div class="options">
      <p><b>Options:</b></p>
      <div>
        <input type="checkbox" v-model="disabledContinent">
        disabled
      </div>
      <div>
        <input type="checkbox" v-model="searchableContinent">
        searchable
      </div>      
    </div>
    <VSelect
      v-model="selectedContinent"
      :options="contients"
      :disabled="disabledContinent"
      @searchChanged="onSearchChanged"
      disabled-prop="inactive"
      add-item-label="Добавить новое"
      loading-label="Поиск продолжается..."
      :loading="true"
      :searchable="searchableContinent" />
  </div>
</template>

<script>
import VSelect from "@/vue-bootstrap-select";

export default {
  name: "App",
  components: {
    VSelect
  },
  data() {
    return {
      names: [
        "John Doe",
        "Olive Yew",
        "Aida Bugg",
        "Teri Dactyl",
        "Paige Turner"
      ],
      contients: [
        { value: 0, text: "Africa" },
        { value: 1, text: "America" },
        { value: 2, text: "Asia" },
        { value: 3, text: "Europe" },
        { value: 4, text: "Oceania" },
        { value: 5, text: "Antartica" },
        { value: 6, text: "Russia" },
        { value: 7, text: "Belarus" },
        { value: 8, text: "Ukraine" },
        { value: 9, text: "Japan" },
        { value: 10, text: "Kazakstan" }
      ],
      selectedName: null,
      searchableName: false,
      disabledName: false,
      selectedContinent: null,
      searchableContinent: false,
      disabledContinent: false
    };
  },
  methods: {
    onSearchChanged(search) {
      if (search.length < 2) {
        return;
      }
      setTimeout(() => {
        this.contients = [
          { value: 6, text: "Russia" },
          { value: 7, text: "Belarus" },
          { value: 8, text: "Ukraine" },
          { value: 9, text: "Japan" },
          { value: 10, text: "Kazakstan" }
        ];
      }, 1000);
    }
  }
};
</script>


<style lang="scss" scoped>
#app {
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 2em 1em;
}

.options {
  text-align: left;
  padding: 1em 0em;
}
</style>
