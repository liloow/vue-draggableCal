# DraggableCal

A datepicker Vue component. Compatible with Vue 2.x

- [Demo](#demo)
- [Install](#install)
- [Usage](#usage)
- [Available Languages](#available-languages)
- [Thanks](#thanks)

## Demo

To view a demo online: [demo](https://liloow.github.io/vue-draggableCal/dist/demo)

To view demo examples locally clone the repo and run `npm i && npm serve --open App.vue`

## Install

```bash
npm i vue-draggable-cal --save
```

or

```bash
yarn add vue-draggable-call
```

```javascript
import DraggableCal from 'vue-draggable-call';

export default {
  // ...
  components: {
    DraggableCal,
  },
  // ...
};
```

Or use directly from a CDN

```html
<div id="app">
  <DraggableCal />
</div>
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/vue-draggable-call"></script>
<script>
new Vue({
  el: '#app',
  components: {
    DraggableCal,
  }
})
</script>
```

## Usage

```html
<DraggableCal />
```

Emits events

```html
<DraggableCal @selectedDate="doSomething($event)" />
```

## Available props

| Prop       | Type    | Default | Description                                                                                                           |
| :--------- | :------ | :------ | :-------------------------------------------------------------------------------------------------------------------- |
| days       | Number  | 365     | Number of days to append                                                                                              |
| months     | Number  | 12      | Numbers of months to append (has precedence over `days` if custom set)                                                |
| lang       | String  | EN      | Language (see available in [Transations](#Translation))                                                               |  |
| fullMonths | Boolean | false   | Weither or not to always use complete months (i.e. `days=1` if set to `true` the whole month is going to be appended) |

## Events

These events are emitted on actions in the datepicker

| Event        | Output | Description                                                                                                                                                                                   |
| :----------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| selectedDate | Object | A date has been selected. It outputs an object : `formatedDate`: String of the date and`raw`: An array of [YYYY, MM, DD] that can be used to build the date object via `Date.UTC(YYYY,MM,DD)` |
| dateCleared  | null   | The previously selected date has been unselected by the user                                                                                                                                  |

## Available languages

| Abbr | Language |           |
| ---- | -------- | --------- |
| EN   | English  | _Default_ |
| FR   | French   |           |

## License
MIT

## Thanks

Credits to [@webAngelo](https://github.com/webangelo) for his range-calendar from which this is highly inspired.
