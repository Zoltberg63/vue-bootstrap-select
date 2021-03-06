<template>
  <div
    v-on-clickaway="hideDropdown"
    @keyup.esc="onEscape"
    @keydown.up.prevent="typeAheadUp"
    @keydown.down.prevent="typeAheadDown"
    @keydown.enter.prevent="typeAheadSelect"
    class="v-select"
    :class="{'disabled': disabled}">
    <button @click="toggle" type="button" class="v-select-toggle" :class="{'v-focus': show }">
      <div>{{ title }}</div>
      <div class="arrow-down"></div>
    </button>
    <div v-show="show" class="v-dropdown-container" ref="dropdown-container">
      <div v-show="searchable" class="v-bs-searchbox">
        <input
          :placeholder="labelSearchPlaceholder"
          class="form-control"
          type="text"
          ref="search"
          v-model="searchValue">
      </div>
      <ul>
        <li v-show="addItemButtonLabel || addItemLabel"
            class="v-dropdown-item"><a href="#" @click.prevent="addItemMethod" >{{ addItemButtonLabel || addItemLabel }}</a></li>
        <li
          v-show="searchable && filteredOptions.length === 0 && searchValue.length !== 0"
          class="v-dropdown-item"
        >{{ noItemsLabel }}</li>
        <li
          v-if="showDefaultOption"
          class="v-dropdown-item disabled default-option"
        >{{ labelTitle }}</li>
        <li
          v-for="(option, index) in filteredOptions"
          :key="`v-select-${index}`"
          class="v-dropdown-item"
          :class="getOptionClasses(option, index)"
          @click.prevent="onSelect(option, index)"
        >
          <slot name="beforeItem" :item="option"></slot>
          {{ getOptionLabel(option) }}
          <slot name="afterItem" :item="option"></slot></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";
import Swal from "sweetalert2";

export default {
  name: "VSelect",
  mixins: [clickaway],
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    disabledProp: {
      type: String,
      default: "disabled"
    },
    labelTitle: {
      type: String,
      default: "Nothing selected"
    },
    labelNotFound: {
      type: String,
      default: "No results matched"
    },
    labelSearchPlaceholder: {
      type: String,
      default: "Search"
    },
    options: {
      type: Array,
      default: () => []
    },
    searchable: {
      type: Boolean,
      default: false
    },
    showDefaultOption: {
      type: Boolean,
      default: false
    },
    textProp: {
      type: String,
      default: "text"
    },
    value: {
      type: [Object, String, Number],
      default: null
    },
    valueProp: {
      type: String,
      default: "value"
    },
    eventTimeout: {
      type: Number,
      default: 2000
    },
    addItemLabel: {
      type: String,
      default: null
    },
    addItemButtonLabel: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingLabel: {
      type: String,
      default: "Loading..."
    },
    confirmButtonText: {
      type: String,
      default: "Ok"
    },
    cancelButtonText: {
      type: String,
      default: "Cancel"
    }
  },
  data() {
    return {
      show: false,
      selectedValue: null,
      searchValue: "",
      typeAheadPointer: -1,
      searchTimeout: null
    };
  },
  computed: {
    title() {
      return this.getOptionLabel(this.selectedValue) || this.labelTitle;
    },
    filteredOptions() {
      if (this.searchable && this.searchValue.length > 0) {
        return this.options.filter(item => {
          if (typeof item === "object") {
            return (
              item[this.textProp]
                .toLowerCase()
                .indexOf(this.searchValue.toLowerCase()) !== -1
            );
          } else {
            return (
              item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1
            );
          }
        });
      }
      return this.options;
    },
    reversedOptions() {
      return [...this.filteredOptions].reverse();
    },
    lastOptionIndex() {
      return this.filteredOptions.length - 1;
    },
    noItemsLabel() {
      return this.loading
        ? this.loadingLabel
        : `${this.labelNotFound} "${this.searchValue}"`;
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const index = this.options.findIndex(op =>
          this.isEqualOption(op, newVal)
        );
        this.onSelect(newVal, index);
      }
    },
    searchValue() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.$emit("searchChanged", this.searchValue);
      }, this.eventTimeout);
    },
    show() {
      if (this.show && this.searchable) {
        this.$nextTick(() => this.$refs.search.focus());
      }
      if (this.show) {
        this.$nextTick(() =>
          this.$refs["dropdown-container"].scrollIntoView({
            behavior: "smooth",
            block: "center"
          })
        );
      }
    }
  },
  methods: {
    onSelect(option, index) {
      if (option && !option[this.disabledProp]) {
        this.selectedValue = option;
        this.typeAheadPointer = index;
        this.hideDropdown();
        this.$emit("input", option, option[this.valueProp], index);
      } else if (option === null) {
        this.selectedValue = null;
      }
    },
    onEscape() {
      this.hideDropdown();
    },
    typeAheadUp() {
      if (!this.show) {
        this.show = true;
      }
      if (this.typeAheadPointer > 0) {
        const nextPointer = this.typeAheadPointer - 1;
        const option = this.filteredOptions[nextPointer];
        const isDisabled = option ? option[this.disabledProp] || false : false;
        if (!isDisabled) {
          this.typeAheadPointer--;
        } else {
          this.typeAheadPointer--;
          this.typeAheadUp();
        }
      } else {
        const nextEnabledOption = this.reversedOptions.findIndex(
          o => o[this.disabledProp] !== true
        );
        this.typeAheadPointer = this.lastOptionIndex - nextEnabledOption;
      }
    },
    typeAheadDown() {
      if (!this.show) {
        this.show = true;
      }
      if (this.typeAheadPointer < this.lastOptionIndex) {
        const nextPointer = this.typeAheadPointer + 1;
        const option = this.filteredOptions[nextPointer];
        const isDisabled = option ? option[this.disabledProp] || false : false;
        if (!isDisabled) {
          this.typeAheadPointer++;
        } else {
          this.typeAheadPointer++;
          this.typeAheadDown();
        }
      } else {
        const nextEnabledOption = this.filteredOptions.findIndex(
          o => o[this.disabledProp] !== true
        );
        this.typeAheadPointer = nextEnabledOption;
      }
    },
    typeAheadSelect() {
      if (this.filteredOptions[this.typeAheadPointer]) {
        this.onSelect(
          this.filteredOptions[this.typeAheadPointer],
          this.typeAheadPointer
        );
      }
    },
    hideDropdown() {
      this.show = false;
      this.searchValue = "";
    },
    getOptionLabel(option) {
      if (typeof option === "object" && option !== null) {
        return option[this.textProp];
      }
      return option;
    },
    getOptionClasses(option, index) {
      let classes = {
        selected: this.isSelectedOption(option, index),
        disabled: option[this.disabledProp]
      };
      if (
        option !== null &&
        typeof option === "object" &&
        typeof option.classes === "object"
      ) {
        return Object.assign(classes, option.classes);
      }
      return classes;
    },
    isSelectedOption(option, index) {
      if (this.typeAheadPointer === -1 && this.selectedValue) {
        return this.isEqualOption(option, this.selectedValue);
      }
      return this.typeAheadPointer === index;
    },
    isEqualOption(a, b) {
      if (a && b && typeof a === "object" && typeof b === "object") {
        return (
          a[this.textProp] === b[this.textProp] &&
          a[this.valueProp] === b[this.valueProp]
        );
      }
      return a === b;
    },
    toggle() {
      if (!this.disabled) {
        this.show = !this.show;
      }
    },
    addItemMethod() {
      Swal.fire({
        title: this.addItemLabel || this.addItemButtonLabel,
        input: "text",
        inputValue: this.searchValue,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: this.confirmButtonText,
        cancelButtonText: this.cancelButtonText
      }).then(result => {
        if (result.value) {
          let addItem = {
            [this.textProp]: result.value
          };
          this.options.unshift(addItem);
          this.onSelect(addItem, 0);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

input {
  width: 100%;
}

ul {
  color: #424242;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  padding: 0px;
  margin: 2px 0px 0px 0px;
  max-height: 300px;
  overflow-y: auto;
}

.v-select {
  position: relative;
  width: 100%;
  height: 30px;
  cursor: pointer;

  &.disabled {
    cursor: not-allowed;

    .v-select-toggle {
      background-color: #f8f9fa;
      border-color: #f8f9fa;
      opacity: 0.65;
      cursor: not-allowed;

      &:focus {
        outline: 0 !important;
      }
    }
  }
}

.v-select-toggle {
  display: flex;
  justify-content: space-between;
  user-select: none;
  padding: 0.375rem 0.75rem;
  color: #212529;
  background-color: #f8f9fa;
  border-color: #d3d9df;
  width: 100%;
  text-align: right;
  white-space: nowrap;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: background-color, border-color, box-shadow, 0.15s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: #e2e6ea;
    border-color: #dae0e5;
  }
}

.arrow-down {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 0.255em;
  margin-top: 7px;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}

.v-dropdown-container {
  position: absolute;
  width: 100%;
  background: red;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.v-dropdown-item {
  text-decoration: none;
  line-height: 25px;
  padding: 0.5rem 1.25rem;
  user-select: none;

  &:hover:not(.default-option) {
    background-color: #f8f9fa;
  }

  &.disabled {
    color: #9a9b9b;
  }

  &.selected {
    background-color: #007bff;
    color: #fff;

    &:hover {
      background-color: #007bff;
      color: #fff;
    }
  }

  &.disabled {
    cursor: not-allowed;

    &:hover {
      background-color: #fff;
    }
  }
}

.v-bs-searchbox {
  padding: 4px 8px;

  .form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
}
</style>
