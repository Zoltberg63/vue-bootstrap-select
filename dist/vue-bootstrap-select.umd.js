(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue-clickaway'), require('sweetalert2')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue-clickaway', 'sweetalert2'], factory) :
  (factory((global.VueBootstrapSelect = {}),global.vueClickaway,global.Swal));
}(this, (function (exports,vueClickaway,Swal) { 'use strict';

  Swal = Swal && Swal.hasOwnProperty('default') ? Swal['default'] : Swal;

  //

  var script = {
    name: "VSelect",
    mixins: [vueClickaway.mixin],
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
        default: function () { return []; }
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
      loading: {
        type: Boolean,
        default: false
      },
      loadingLabel: {
        type: String,
        default: "Loading..."
      }
    },
    data: function data() {
      return {
        show: false,
        selectedValue: null,
        searchValue: "",
        typeAheadPointer: -1,
        searchTimeout: null
      };
    },
    computed: {
      title: function title() {
        return this.selectedValue
          ? this.getOptionLabel(this.selectedValue)
          : this.labelTitle;
      },
      filteredOptions: function filteredOptions() {
        var this$1 = this;

        if (this.searchable && this.searchValue.length > 0) {
          return this.options.filter(function (item) {
            if (typeof item === "object") {
              return (
                item[this$1.textProp]
                  .toLowerCase()
                  .indexOf(this$1.searchValue.toLowerCase()) !== -1
              );
            } else {
              return (
                item.toLowerCase().indexOf(this$1.searchValue.toLowerCase()) !== -1
              );
            }
          });
        }
        return this.options;
      },
      reversedOptions: function reversedOptions() {
        return [].concat( this.filteredOptions ).reverse();
      },
      lastOptionIndex: function lastOptionIndex() {
        return this.filteredOptions.length - 1;
      },
      noItemsLabel: function noItemsLabel() {
        return this.loading
          ? this.loadingLabel
          : ((this.labelNotFound) + " \"" + (this.searchValue) + "\"");
      }
    },
    watch: {
      value: {
        immediate: true,
        handler: function handler(newVal) {
          var this$1 = this;

          var index = this.options.findIndex(function (op) { return this$1.isEqualOption(op, newVal); }
          );
          this.onSelect(newVal, index);
        }
      },
      searchValue: function searchValue() {
        var this$1 = this;

        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(function () {
          this$1.$emit("searchChanged", this$1.searchValue);
        }, this.eventTimeout);
      }
    },
    methods: {
      onSelect: function onSelect(option, index) {
        if (option && !option[this.disabledProp]) {
          this.selectedValue = option;
          this.typeAheadPointer = index;
          this.hideDropdown();
          this.$emit("input", option, option[this.valueProp], index);
        } else if (option === null) {
          this.selectedValue = null;
        }
      },
      onEscape: function onEscape() {
        this.hideDropdown();
      },
      typeAheadUp: function typeAheadUp() {
        var this$1 = this;

        if (!this.show) {
          this.show = true;
        }
        if (this.typeAheadPointer > 0) {
          var nextPointer = this.typeAheadPointer - 1;
          var option = this.filteredOptions[nextPointer];
          var isDisabled = option ? option[this.disabledProp] || false : false;
          if (!isDisabled) {
            this.typeAheadPointer--;
          } else {
            this.typeAheadPointer--;
            this.typeAheadUp();
          }
        } else {
          var nextEnabledOption = this.reversedOptions.findIndex(
            function (o) { return o[this$1.disabledProp] !== true; }
          );
          this.typeAheadPointer = this.lastOptionIndex - nextEnabledOption;
        }
      },
      typeAheadDown: function typeAheadDown() {
        var this$1 = this;

        if (!this.show) {
          this.show = true;
        }
        if (this.typeAheadPointer < this.lastOptionIndex) {
          var nextPointer = this.typeAheadPointer + 1;
          var option = this.filteredOptions[nextPointer];
          var isDisabled = option ? option[this.disabledProp] || false : false;
          if (!isDisabled) {
            this.typeAheadPointer++;
          } else {
            this.typeAheadPointer++;
            this.typeAheadDown();
          }
        } else {
          var nextEnabledOption = this.filteredOptions.findIndex(
            function (o) { return o[this$1.disabledProp] !== true; }
          );
          this.typeAheadPointer = nextEnabledOption;
        }
      },
      typeAheadSelect: function typeAheadSelect() {
        if (this.filteredOptions[this.typeAheadPointer]) {
          this.onSelect(
            this.filteredOptions[this.typeAheadPointer],
            this.typeAheadPointer
          );
        }
      },
      hideDropdown: function hideDropdown() {
        this.show = false;
        this.searchValue = "";
      },
      getOptionLabel: function getOptionLabel(option) {
        if (typeof option === "object") {
          return option[this.textProp];
        }
        return option;
      },
      isSelectedOption: function isSelectedOption(option, index) {
        if (this.typeAheadPointer === -1 && this.selectedValue) {
          return this.isEqualOption(option, this.selectedValue);
        }
        return this.typeAheadPointer === index;
      },
      isEqualOption: function isEqualOption(a, b) {
        if (a && b && typeof a === "object" && typeof b === "object") {
          return (
            a[this.textProp] === b[this.textProp] &&
            a[this.valueProp] === b[this.valueProp]
          );
        }
        return a === b;
      },
      toggle: function toggle() {
        if (!this.disabled) {
          this.show = !this.show;
        }
      },
      addItemMethod: function addItemMethod() {
        var this$1 = this;

        Swal.fire({
          input: "text",
          inputValue: this.searchValue,
          showCancelButton: true
        }).then(function (result) {
          if (result.value) {
            var addItem = {};
            addItem[this$1.valueProp] = null;
            addItem[this$1.textProp] = result.value;
            this$1.options.unshift(addItem);
            this$1.onSelect(addItem, 0);
          }
        });
      }
    }
  };

  /* script */
              var __vue_script__ = script;
              
  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        directives: [
          {
            name: "on-clickaway",
            rawName: "v-on-clickaway",
            value: _vm.hideDropdown,
            expression: "hideDropdown"
          }
        ],
        staticClass: "v-select",
        class: { disabled: _vm.disabled },
        on: {
          keyup: function($event) {
            if (
              "keyCode" in $event &&
              _vm._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])
            ) {
              return null
            }
            return _vm.onEscape($event)
          },
          keydown: [
            function($event) {
              if (
                "keyCode" in $event &&
                _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])
              ) {
                return null
              }
              $event.preventDefault();
              return _vm.typeAheadUp($event)
            },
            function($event) {
              if (
                "keyCode" in $event &&
                _vm._k($event.keyCode, "down", 40, $event.key, [
                  "Down",
                  "ArrowDown"
                ])
              ) {
                return null
              }
              $event.preventDefault();
              return _vm.typeAheadDown($event)
            },
            function($event) {
              if (
                "keyCode" in $event &&
                _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
              ) {
                return null
              }
              $event.preventDefault();
              return _vm.typeAheadSelect($event)
            }
          ]
        }
      },
      [
        _c(
          "button",
          {
            staticClass: "v-select-toggle",
            attrs: { type: "button" },
            on: { click: _vm.toggle }
          },
          [
            _c("div", [_vm._v(_vm._s(_vm.title))]),
            _vm._v(" "),
            _c("div", { staticClass: "arrow-down" })
          ]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.show,
                expression: "show"
              }
            ],
            staticClass: "v-dropdown-container"
          },
          [
            _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.searchable,
                    expression: "searchable"
                  }
                ],
                staticClass: "v-bs-searchbox"
              },
              [
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.searchValue,
                      expression: "searchValue"
                    }
                  ],
                  staticClass: "form-control",
                  attrs: {
                    placeholder: _vm.labelSearchPlaceholder,
                    type: "text",
                    autofocus: ""
                  },
                  domProps: { value: _vm.searchValue },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.searchValue = $event.target.value;
                    }
                  }
                })
              ]
            ),
            _vm._v(" "),
            _c(
              "ul",
              [
                _c(
                  "li",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.addItemLabel,
                        expression: "addItemLabel"
                      }
                    ],
                    staticClass: "v-dropdown-item"
                  },
                  [
                    _c(
                      "a",
                      {
                        attrs: { href: "#" },
                        on: {
                          click: function($event) {
                            $event.preventDefault();
                            return _vm.addItemMethod($event)
                          }
                        }
                      },
                      [_vm._v(_vm._s(_vm.addItemLabel))]
                    )
                  ]
                ),
                _vm._v(" "),
                _c(
                  "li",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.searchable && _vm.filteredOptions.length === 0,
                        expression: "searchable && filteredOptions.length === 0"
                      }
                    ],
                    staticClass: "v-dropdown-item"
                  },
                  [_vm._v(_vm._s(_vm.noItemsLabel))]
                ),
                _vm._v(" "),
                _vm.showDefaultOption
                  ? _c(
                      "li",
                      { staticClass: "v-dropdown-item disabled default-option" },
                      [_vm._v(_vm._s(_vm.labelTitle))]
                    )
                  : _vm._e(),
                _vm._v(" "),
                _vm._l(_vm.filteredOptions, function(option, index) {
                  return _c(
                    "li",
                    {
                      key: "v-select-" + index,
                      staticClass: "v-dropdown-item",
                      class: {
                        selected: _vm.isSelectedOption(option, index),
                        disabled: option[_vm.disabledProp]
                      },
                      on: {
                        click: function($event) {
                          return _vm.onSelect(option, index)
                        }
                      }
                    },
                    [_vm._v(_vm._s(_vm.getOptionLabel(option)))]
                  )
                })
              ],
              2
            )
          ]
        )
      ]
    )
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = function (inject) {
      if (!inject) { return }
      inject("data-v-6b0e5941_0", { source: "\n*[data-v-6b0e5941] {\n  box-sizing: border-box;\n}\ninput[data-v-6b0e5941] {\n  width: 100%;\n}\nul[data-v-6b0e5941] {\n  color: #424242;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  padding: 0px;\n  margin: 2px 0px 0px 0px;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.v-select[data-v-6b0e5941] {\n  position: relative;\n  width: 100%;\n  height: 30px;\n  cursor: pointer;\n}\n.v-select.disabled[data-v-6b0e5941] {\n    cursor: not-allowed;\n}\n.v-select.disabled .v-select-toggle[data-v-6b0e5941] {\n      background-color: #f8f9fa;\n      border-color: #f8f9fa;\n      opacity: 0.65;\n      cursor: not-allowed;\n}\n.v-select.disabled .v-select-toggle[data-v-6b0e5941]:focus {\n        outline: 0 !important;\n}\n.v-select-toggle[data-v-6b0e5941] {\n  display: flex;\n  justify-content: space-between;\n  user-select: none;\n  padding: 0.375rem 0.75rem;\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #d3d9df;\n  width: 100%;\n  text-align: right;\n  white-space: nowrap;\n  border: 1px solid transparent;\n  padding: 0.375rem 0.75rem;\n  line-height: 1.5;\n  border-radius: 0.25rem;\n  transition: background-color, border-color, box-shadow, 0.15s ease-in-out;\n  cursor: pointer;\n}\n.v-select-toggle[data-v-6b0e5941]:hover {\n    background-color: #e2e6ea;\n    border-color: #dae0e5;\n}\n.arrow-down[data-v-6b0e5941] {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  margin-top: 7px;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0;\n  border-left: 0.3em solid transparent;\n}\n.v-dropdown-container[data-v-6b0e5941] {\n  position: absolute;\n  width: 100%;\n  background: red;\n  padding: 0.5rem 0;\n  margin: 0.125rem 0 0;\n  color: #212529;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  border-radius: 0.25rem;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  z-index: 1000;\n}\n.v-dropdown-item[data-v-6b0e5941] {\n  text-decoration: none;\n  line-height: 25px;\n  padding: 0.5rem 1.25rem;\n  user-select: none;\n}\n.v-dropdown-item[data-v-6b0e5941]:hover:not(.default-option) {\n    background-color: #f8f9fa;\n}\n.v-dropdown-item.disabled[data-v-6b0e5941] {\n    color: #9a9b9b;\n}\n.v-dropdown-item.selected[data-v-6b0e5941] {\n    background-color: #007bff;\n    color: #fff;\n}\n.v-dropdown-item.selected[data-v-6b0e5941]:hover {\n      background-color: #007bff;\n      color: #fff;\n}\n.v-dropdown-item.disabled[data-v-6b0e5941] {\n    cursor: not-allowed;\n}\n.v-dropdown-item.disabled[data-v-6b0e5941]:hover {\n      background-color: #fff;\n}\n.v-bs-searchbox[data-v-6b0e5941] {\n  padding: 4px 8px;\n}\n.v-bs-searchbox .form-control[data-v-6b0e5941] {\n    display: block;\n    width: 100%;\n    padding: 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n/*# sourceMappingURL=vue-bootstrap-select.vue.map */", map: {"version":3,"sources":["E:\\vue-bootstrap-select/E:\\vue-bootstrap-select/E:\\vue-bootstrap-select\\src\\vue-bootstrap-select.vue","vue-bootstrap-select.vue"],"names":[],"mappings":";AAoSA;EACA,uBAAA;CACA;AAEA;EACA,YAAA;CACA;AAEA;EACA,eAAA;EACA,iBAAA;EACA,iBAAA;EACA,uBAAA;EACA,6BAAA;EACA,aAAA;EACA,wBAAA;EACA,kBAAA;EACA,iBAAA;CACA;AAEA;EACA,mBAAA;EACA,YAAA;EACA,aAAA;EACA,gBAAA;CAgBA;AApBA;IAOA,oBAAA;CAYA;AAnBA;MAUA,0BAAA;MACA,sBAAA;MACA,cAAA;MACA,oBAAA;CAKA;AAlBA;QAgBA,sBAAA;CACA;AAKA;EACA,cAAA;EACA,+BAAA;EACA,kBAAA;EACA,0BAAA;EACA,eAAA;EACA,0BAAA;EACA,sBAAA;EACA,YAAA;EACA,kBAAA;EACA,oBAAA;EACA,8BAAA;EACA,0BAAA;EACA,iBAAA;EACA,uBAAA;EACA,0EAAA;EACA,gBAAA;CAMA;AAtBA;IAmBA,0BAAA;IACA,sBAAA;CACA;AAGA;EACA,sBAAA;EACA,SAAA;EACA,UAAA;EACA,qBAAA;EACA,gBAAA;EACA,wBAAA;EACA,YAAA;EACA,wBAAA;EACA,sCAAA;EACA,iBAAA;EACA,qCAAA;CACA;AAEA;EACA,mBAAA;EACA,YAAA;EACA,gBAAA;EACA,kBAAA;EACA,qBAAA;EACA,eAAA;EACA,iBAAA;EACA,iBAAA;EACA,uBAAA;EACA,6BAAA;EACA,uBAAA;EACA,sCAAA;EACA,cAAA;CACA;AAEA;EACA,sBAAA;EACA,kBAAA;EACA,wBAAA;EACA,kBAAA;CA2BA;AA/BA;IAOA,0BAAA;CACA;AARA;IAWA,eAAA;CACA;AAZA;IAeA,0BAAA;IACA,YAAA;CAMA;AAtBA;MAmBA,0BAAA;MACA,YAAA;CACA;AArBA;IAyBA,oBAAA;CAKA;AA9BA;MA4BA,uBAAA;CACA;AAIA;EACA,iBAAA;CAcA;AAfA;IAIA,eAAA;IACA,YAAA;IACA,0BAAA;IACA,iBAAA;IACA,eAAA;IACA,uBAAA;IACA,6BAAA;IACA,0BAAA;IACA,uBAAA;IACA,yEAAA;CACA;;AChUA,oDAAoD","file":"vue-bootstrap-select.vue","sourcesContent":[null,"* {\n  box-sizing: border-box; }\n\ninput {\n  width: 100%; }\n\nul {\n  color: #424242;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  padding: 0px;\n  margin: 2px 0px 0px 0px;\n  max-height: 300px;\n  overflow-y: auto; }\n\n.v-select {\n  position: relative;\n  width: 100%;\n  height: 30px;\n  cursor: pointer; }\n  .v-select.disabled {\n    cursor: not-allowed; }\n    .v-select.disabled .v-select-toggle {\n      background-color: #f8f9fa;\n      border-color: #f8f9fa;\n      opacity: 0.65;\n      cursor: not-allowed; }\n      .v-select.disabled .v-select-toggle:focus {\n        outline: 0 !important; }\n\n.v-select-toggle {\n  display: flex;\n  justify-content: space-between;\n  user-select: none;\n  padding: 0.375rem 0.75rem;\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #d3d9df;\n  width: 100%;\n  text-align: right;\n  white-space: nowrap;\n  border: 1px solid transparent;\n  padding: 0.375rem 0.75rem;\n  line-height: 1.5;\n  border-radius: 0.25rem;\n  transition: background-color, border-color, box-shadow, 0.15s ease-in-out;\n  cursor: pointer; }\n  .v-select-toggle:hover {\n    background-color: #e2e6ea;\n    border-color: #dae0e5; }\n\n.arrow-down {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  margin-top: 7px;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0;\n  border-left: 0.3em solid transparent; }\n\n.v-dropdown-container {\n  position: absolute;\n  width: 100%;\n  background: red;\n  padding: 0.5rem 0;\n  margin: 0.125rem 0 0;\n  color: #212529;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  border-radius: 0.25rem;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  z-index: 1000; }\n\n.v-dropdown-item {\n  text-decoration: none;\n  line-height: 25px;\n  padding: 0.5rem 1.25rem;\n  user-select: none; }\n  .v-dropdown-item:hover:not(.default-option) {\n    background-color: #f8f9fa; }\n  .v-dropdown-item.disabled {\n    color: #9a9b9b; }\n  .v-dropdown-item.selected {\n    background-color: #007bff;\n    color: #fff; }\n    .v-dropdown-item.selected:hover {\n      background-color: #007bff;\n      color: #fff; }\n  .v-dropdown-item.disabled {\n    cursor: not-allowed; }\n    .v-dropdown-item.disabled:hover {\n      background-color: #fff; }\n\n.v-bs-searchbox {\n  padding: 4px 8px; }\n  .v-bs-searchbox .form-control {\n    display: block;\n    width: 100%;\n    padding: 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    background-color: #fff;\n    background-clip: padding-box;\n    border: 1px solid #ced4da;\n    border-radius: 0.25rem;\n    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }\n\n/*# sourceMappingURL=vue-bootstrap-select.vue.map */"]}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__ = "data-v-6b0e5941";
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* component normalizer */
    function __vue_normalize__(
      template, style, script$$1,
      scope, functional, moduleIdentifier,
      createInjector, createInjectorSSR
    ) {
      var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

      // For security concerns, we use only base name in production mode.
      component.__file = "E:\\vue-bootstrap-select\\src\\vue-bootstrap-select.vue";

      if (!component.render) {
        component.render = template.render;
        component.staticRenderFns = template.staticRenderFns;
        component._compiled = true;

        if (functional) { component.functional = true; }
      }

      component._scopeId = scope;

      {
        var hook;
        if (style) {
          hook = function(context) {
            style.call(this, createInjector(context));
          };
        }

        if (hook !== undefined) {
          if (component.functional) {
            // register for functional component in vue file
            var originalRender = component.render;
            component.render = function renderWithStyleInjection(h, context) {
              hook.call(context);
              return originalRender(h, context)
            };
          } else {
            // inject component registration as beforeCreate hook
            var existing = component.beforeCreate;
            component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
        }
      }

      return component
    }
    /* style inject */
    function __vue_create_injector__() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
      var isOldIE =
        typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

      return function addStyle(id, css) {
        if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

        var group = isOldIE ? css.media || 'default' : id;
        var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

        if (!style.ids.includes(id)) {
          var code = css.source;
          var index = style.ids.length;

          style.ids.push(id);

          if (isOldIE) {
            style.element = style.element || document.querySelector('style[data-group=' + group + ']');
          }

          if (!style.element) {
            var el = style.element = document.createElement('style');
            el.type = 'text/css';

            if (css.media) { el.setAttribute('media', css.media); }
            if (isOldIE) {
              el.setAttribute('data-group', group);
              el.setAttribute('data-next-index', '0');
            }

            head.appendChild(el);
          }

          if (isOldIE) {
            index = parseInt(style.element.getAttribute('data-next-index'));
            style.element.setAttribute('data-next-index', index + 1);
          }

          if (style.element.styleSheet) {
            style.parts.push(code);
            style.element.styleSheet.cssText = style.parts
              .filter(Boolean)
              .join('\n');
          } else {
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index]) { style.element.removeChild(nodes[index]); }
            if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
            else { style.element.appendChild(textNode); }
          }
        }
      }
    }
    /* style inject SSR */
    

    
    var component = __vue_normalize__(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      __vue_create_injector__,
      undefined
    );

  // Import vue component

  // install function executed by Vue.use()
  function install(Vue) {
    if (install.installed) { return; }
    install.installed = true;
    Vue.component('VueBootstrapSelect', component);
  }

  // Create module definition for Vue.use()
  var plugin = {
    install: install,
  };

  // To auto-install when vue is found
  /* global window global */
  var GlobalVue = null;
  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  // It's possible to expose named exports when writing components that can
  // also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
  // export const RollupDemoDirective = component;

  exports.default = component;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
