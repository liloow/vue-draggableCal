# VueCal

A datepicker Vue component. Compatible with Vue 2.x

- [Demo](#demo)
- [Install](#install)
- [Usage](#usage)
- [Available Languages](#Available Languages)


## Demo

To view a demo online: [demo](https://liloow.github.io/vue-cal/dist/demo)

To view demo examples locally clone the repo and run `npm i && npm serve --open App.vue`

## Install

``` bash
npm i vue-cal --save
```
or
``` bash
yarn add vue-cal
```

``` javascript
import VueCal from 'vue-cal';

export default {
  // ...
  components: {
    Vuecal
  }
  // ...
}
```

Or use directly from a CDN
``` html
<div id="app">
  <vue-cal />
</div>
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/vue-cal"></script>
<script>
const app = new Vue({
  el: '#app',
  components: {
  	VueCal
  }
})
</script>
```

## Usage

``` html
<VueCal />
```

Emits events
``` html
<VueCal @selectedDate="doSomethingInParentComponentFunction" />
```

## Available props

| Prop                          | Type            | Default     | Description                              |
|-------------------------------|-----------------|-------------|------------------------------------------|
| days                         | Number    | 365            | Number of days to append              |
| months                          | Number          | 12             | Numbers of months to append (has precedence over days if present)                      |
| lang                         | String          |   EN          | Language (see available in [Transations](#Translation)                                 |

## Events

These events are emitted on actions in the datepicker

| Event             | Output     | Description                          |
|-------------------|------------|--------------------------------------|
| selectedDate      | Object     | A date has been selected. It outputs an object : {
formatedDate: String of the date,
raw: An array of [YYYY, MM, DD] that can be used to build the date object via `Date.UTC(YYYY,MM,DD)`
}             |
| dateCleared       | null       | The previously selected date has been unselected by the user    |


## Available languages

| Abbr        | Language         |          |
| ----------- |------------------|----------|
| EN          | English          | *Default*|
| FR          | French           |          |
