<template>
  <section class="container">
    <div class="drag-calendar" style="display: block background-color: 'transparent'">
      <div class="wrapper">
        <div ref="monthly" state="monthly" class="months ui-draggable" style="left: 0px;" @mousedown="handleDrag($event)" @touchstart="handleDrag($event)" :style="monthly.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} ">
          <div v-for="month in calendar.months" class="month-cell cell" :class="month.past ? 'past' : ''" @click="toggleSelectMonth($event, month)" :month-id="`${month.fullYear}-${month.monthNumber}`">
            <div class="date-formatted">
              <span class="cell-content month-name">{{MONTHS[month.monthNumber] | abr}}</span> {{month.fullYear%1000}}
            </div>
          </div>
        </div>
      </div>
      <div class="arrow top left" @click="goLeft($event, 'monthly')" :style="{visibility: monthly.realOffset === 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow top right" @click="goRight($event, 'monthly')" :style="{visibility: monthly.realOffset <= monthly.maxOffset ? 'hidden' : 'visible'}">
      </div>
      <div class="wrapper">
        <div ref="daily" state="daily" class="days ui-draggable" :style="daily.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} " style="left: 0px;" @mousedown="handleDrag($event)" @touchstart="handleDrag($event)">
          <div v-for="day in calendar.days" :key="`${day.fullYear}-${day.monthNumber}-${day.day}`" :date="`${day.fullYear}-${day.monthNumber}-${day.day}`" class="cal-cell cell" :class="day.day === 1 ? 'first' : ''" :month="day.monthNumber" :year="day.fullYear" @click="toggleSelect($event, day)">
            <div class="cell-content">
              <div class="day-number">
                {{day.day}}
              </div>
              <div class="day">
                {{DAYS[day.dayOfTheWeek] | abr}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="arrow bottom left" @click="goLeft($event, 'daily')" :style="{visibility: daily.realOffset === 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow bottom right" @click="goRight($event, 'daily')" :style="{visibility: daily.realOffset <= daily.maxOffset ? 'hidden' : 'visible'}">
      </div>
    </div>
  </section>
</template>
<script>
import {abr} from '@/utils/filters';
import {language} from '@/utils/CONSTANTS';
import {buildCalendar} from '@/utils/buildCalendar';
import props from '@/utils/props';
export default {
  name: 'VueCal',
  filters: {abr},
  props: props,
  computed: {
    currentMonth() {
      let past = this.daily.pastBreakPoints;
      let future = this.daily.monthBreakPoints;
      let off = Math.abs(this.daily.realOffset) + this.$refs.monthly.parentNode.clientWidth / 2;
      while (off <= past[past.length - 1].offset) {
        future.unshift(past.pop());
        this.toggleSelectMonth(null, past[past.length - 1]);
      }
      while (future.length > 0 && off >= future[0].offset) {
        this.toggleSelectMonth(null, future[0]);
        past.push(future.shift());
      }
      return past[past.length - 1];
    },
  },
  data() {
    return {
      NUMBER_OF_DAYS: this.days,
      NUMBER_OF_MONTHS: this.months,
      PREPEND_MONTHS: this.prepended,
      DAYS: language[this.lang].DAYS,
      MONTHS: language[this.lang].MONTHS,
      selectedDate: this.selected,
      selectedMonth: null,
      calendar: {
        months: [],
        days: [],
      },
      monthly: {
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
      daily: {
        monthBreakPoints: [],
        pastBreakPoints: [
          {
            offset: 0,
            monthNumber: new Date().getMonth(),
            fullYear: new Date().getFullYear(),
          },
        ],
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
    };
  },
  methods: {
    goLeft(e, state) {
      if (this[state].realOffset >= 0) return;
      let elem = e.target.parentNode.querySelector('.ui-draggable');
      let cell = elem.firstChild.firstChild;
      this[state].realOffset =
        this[state].realOffset + Math.floor(elem.clientWidth / cell.clientWidth) * cell.clientWidth;
      if (this[state].realOffset > 0) this[state].realOffset = 0;
      this.$refs[state].style.left = `${this[state].realOffset}px`;
      this.currentMonth;
    },
    goRight(e, state) {
      let elem = e.target.parentNode.querySelector('.ui-draggable');
      let cell = elem.firstChild.firstChild;
      this[state].realOffset =
        this[state].realOffset - Math.floor(elem.clientWidth / cell.clientWidth) * cell.clientWidth;
      if (this[state].realOffset < this[state].maxOffset)
        this[state].realOffset = this[state].maxOffset;
      this.$refs[state].style.left = `${this[state].realOffset}px`;
      this.currentMonth;
    },
    handleDrag(e) {
      let state;

      if (e.type === 'mouseup' || e.type === 'mouseleave' || e.type === 'touchend') {
        document.body.removeEventListener('mousemove', this.handleDrag, false);
        document.body.removeEventListener('touchmove', this.handleDrag, false);
        this.daily.phase = 'sleep';
        this.monthly.phase = 'sleep';
        return true;
      }

      if (this.daily.phase !== 'sleep') state = this.daily;
      else if (this.monthly.phase !== 'sleep') state = this.monthly;
      else {
        state = this[
          `${e.path.find(el => el.classList.contains('ui-draggable')).getAttribute('state')}`
        ];
      }

      if ((e.type === 'mousedown' && e.button === 0) || e.type === 'touchstart') {
        document.body.addEventListener('mousemove', this.handleDrag, false);
        document.body.addEventListener('touchmove', this.handleDrag, false);
        state.phase = 'listen';
        state.startX = e.screenX || e.touches[0].screenX;
        let row = e.path.find(el => el.className.includes('ui-draggable'));
        state.style = row.style;
        state.initLeft = Number(state.style.left.match(/-?[0-9]+/g)[0]);
      }

      if (e.type === 'mousemove' || e.type === 'touchmove') {
        console.log(state.style, state);
        state.phase = 'dragging';
        state.currentOffset = (e.screenX || e.touches[0].screenX) - state.startX;
        state.realOffset = state.initLeft + state.currentOffset;
        if (Math.abs(state.realOffset) > Math.abs(state.maxOffset)) {
          state.realOffset = state.maxOffset;
        }
        state.style.left = state.realOffset <= 0 ? `${state.realOffset}px` : '0px';
        this.currentMonth;
      }
    },
    toggleSelectMonth(e, month) {
      let exist = this.$refs.monthly.querySelector('.month-cell[selected="true"]');
      if (exist) exist.setAttribute('selected', false);
      this.$refs.monthly
        .querySelector(`[month-id="${month.fullYear}-${month.monthNumber}"]`)
        .setAttribute('selected', true);
      this.selectedMonth = `${month.fullYear}-${month.monthNumber}`;
      if (e) {
        const id = `[year="${month.fullYear}"][month="${month.monthNumber}"].cal-cell`;
        this.scrollIntoView(this.$refs.daily.querySelector(id));
      }
    },
    toggleSelect(e, day) {
      let exist = this.$refs.daily.querySelector('.cal-cell[selected="true"]');
      if (exist) {
        exist.setAttribute('selected', false);
        if (e.target === exist) {
          this.selectedDate = null;
          this.selectedMonth = null;
          return this.$emit('dateCleared');
        }
      }
      this.selectedDate = day;
      this.selectedMonth = `${day.fullYear}-${day.monthNumber}`;
      this.toggleSelectMonth(null, day);
      e.target.setAttribute('selected', true);
      this.dateSelected(day);
    },
    scrollIntoView(element) {
      let cal = element;
      if (!element) cal = this.$refs.daily.querySelector(`[selected=true].cal-cell`);
      let offset = cal.offsetLeft - cal.parentNode.parentNode.clientWidth * 0.3 - cal.clientWidth;
      this.daily.realOffset = offset > 0 ? -offset : 0;
      this.$refs.daily.style.left = `${this.daily.realOffset}px`;
    },
    dateSelected(date) {
      const formattedDate = new Date(Date.UTC(date.fullYear, date.monthNumber, date.day));
      this.$emit('dateSelected', formattedDate);
    },
  },
  created() {
    this.calendar = buildCalendar(
      this.NUMBER_OF_DAYS,
      this.NUMBER_OF_MONTHS,
      this.PREPEND_MONTHS,
      this.fullMonths
    );
    document.body.addEventListener('mouseup', e => this.handleDrag(e), false);
    document.body.addEventListener('mouseleave', e => this.handleDrag(e), false);
    document.body.addEventListener('touchend', e => this.handleDrag(e), false);
  },
  mounted() {
    this.$refs.monthly.querySelector('div:not(.past).month-cell.cell').click();
    if (this.selected) {
      this.$refs.daily
        .querySelector(
          `[date="${this.selected.fullYear}-${this.selected.monthNumber}-${this.selected.day}"]`
        )
        .setAttribute('selected', true);
      this.scrollIntoView();
    }
    this.daily.monthBreakPoints = [...this.$refs.daily.querySelectorAll('.cal-cell')]
      .filter(cell => /-1$/g.test(cell.getAttribute('date')))
      .map(el => ({
        offset: el.offsetLeft,
        monthNumber: el.getAttribute('month'),
        fullYear: el.getAttribute('year'),
      }));
    this.daily.maxOffset = this.$refs.daily.parentNode.clientWidth - this.$refs.daily.clientWidth;
    this.monthly.maxOffset =
      this.$refs.monthly.parentNode.clientWidth - this.$refs.monthly.clientWidth;
    if (this.daily.maxOffset > 0) this.daily.maxOffset = 0;
    if (this.monthly.maxOffset > 0) this.monthly.maxOffset = 0;
  },
  beforeDestroy() {
    document.body.removeEventListener('mouseup', e => this.handleDrag(e), false);
    document.body.removeEventListener('mouseleave', e => this.handleDrag(e), false);
    document.body.removeEventListener('touchend', e => this.handleDrag(e), false);
  },
};
</script>
<style lang="scss" scoped>
@mixin responsive-font($responsive, $min, $max: false, $fallback: false) {
  $responsive-unitless: $responsive / ($responsive - $responsive + 1);
  $dimension: if(unit($responsive) == 'vh', 'height', 'width');
  $min-breakpoint: $min / $responsive-unitless * 100;

  @media (max-#{$dimension}: #{$min-breakpoint}) {
    font-size: $min;
  }

  @if $max {
    $max-breakpoint: $max / $responsive-unitless * 100;

    @media (min-#{$dimension}: #{$max-breakpoint}) {
      font-size: $max;
    }
  }

  @if $fallback {
    font-size: $fallback;
  }

  font-size: $responsive;
}
/* ========================================================================== */
@font-face {
  font-family: 'Oswald';
  font-style: normal;
  font-weight: 400;
  src: url('public/font.woff2') format('woff2');
}
/* ========================================================================== */
:root {
  @include responsive-font(2vw, 10px, 16px, 16px);
}

.container {
  padding-top: 1em;
  width: 95%;
  margin: auto;
}

.drag-calendar {
  box-sizing: content-box;
  clear: both;
  height: 9.6em;
  overflow: hidden;
  width: 100%;
  position: relative;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 0;
  background-color: transparent;
  .cal-cell[selected='true'],
  .month-cell[selected='true'] {
    border-radius: 0.5em;
    transform: scale(1.1);
    transition: transform 0.3s ease;
    padding: 1.25em;
    .cell-content {
      div {
        transform: scale(1.5);
        color: white;
      }
      .day-number {
        margin-bottom: 4px;
      }
    }
  }
  .month-cell {
    padding: 0;
  }
}

.arrow {
  font-family: 'Oswald', Arial, sans-serif;
  width: 2rem;
  justify-content: center;
  position: absolute;
  display: flex;
  align-items: center;
  z-index: 1000;
  transition: 0.2s all;
  background-color: white;
  color: darkgrey;
  &:hover {
    background-color: #f8f8ff;
    box-shadow: inset 0px 0px 5px 1px rgba(0, 0, 0, 0.1), inset 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    color: black;
  }
  &.bottom {
    height: 1.75em;
    bottom: 0.15em;
    font-size: 3rem;
  }
  &.top {
    top: 0;
    height: 1.2em;
    font-size: 2rem;
  }
  &.left {
    left: 0;
    &:before {
      content: '<';
      height: 1.75em;
    }
  }
  &.right {
    right: 0;
    &:before {
      content: '>';
      height: 1.75em;
    }
  }
  &:active {
    transform: scale(0.8);
  }
}

.cell-content,
.date-formatted {
  pointer-events: none;
}

.months .cell[selected='true'] {
  .date-formatted {
    opacity: 0.5;
    color: white;
    background-color: darkblue;
    border-radius: 0.5em;
    padding: 0.3em;
    margin-top: -0.3em;
    font-weight: 350;
  }
}
.drag-calendar .days {
  z-index: 1;
  list-style: none;
  float: left;
  margin: 0;
  padding: 0;
  position: relative;
  width: max-content;
  transition: all 1s ease;
  .cell.cal-cell[selected='true'] {
    background-color: darkblue;
  }
  > .cell:first-child {
    color: red;
    margin-left: 0.4em;
    .day-number {
      text-decoration: underline;
    }
  }
  > .cell:last-child {
    margin-right: 0.4em;
  }
}

.drag-calendar .days .cal-cell {
  float: left;
  width: 4em;
  padding: 1.5em 1.25em;
  margin: 0px;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
  text-align: center;
  position: relative;
  color: #888;
  &.first {
    background-color: rgba(0, 0, 0, 0.02);
    color: #666;
    .day {
      font-weight: bold;
    }
    .day-number {
      font-size: 1.2em;
    }
  }
}

.drag-calendar .days .cell .day-number {
  display: block;
  clear: both;
  font-weight: bold;
  font-size: 1.2em;
  z-index: 1;
  position: relative;
}

.drag-calendar .days .cell .day {
  display: block;
  clear: both;
  text-transform: uppercase;
  width: 100%;
  font-weight: 100;
  font-size: 12px;
  margin-top: 0px;
  z-index: 1;
  position: relative;
}

.drag-calendar .days .cell .month {
  width: 100%;
  font-size: 12px;
  z-index: 1;
  text-transform: uppercase;
  position: absolute;
  opacity: 1;
  left: 0;
  top: 10px;
  font-weight: bold;
}

.drag-calendar .months {
  z-index: 1;
  float: left;
  margin: 0;
  padding: 0;
  position: relative;
  width: max-content;
  border-bottom: 0px solid ghostwhite;
  margin-bottom: 1em;
  background-color: transparent;
  transition: all 1s ease;
}

.drag-calendar .months .cell {
  float: left;
  width: 105px;
  padding: 10px 10px;
  text-align: center;
  position: relative;
  color: #888;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
}

.drag-calendar .months .cell .month-name {
  font-weight: bold;
  font-size: 0.8em;
  z-index: 1;
  position: relative;
  text-transform: uppercase;
}

.drag-calendar .months .cell .date-formatted {
  font-weight: 200;
  font-size: 1em;
}

.drag-calendar .ui-draggable {
  cursor: move;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.drag-calendar .months .cell.past {
  background-color: rgba(222, 222, 222, 0.6);
  color: lightgrey;
  opacity: 0.8;
  pointer-events: none;
  border-right: solid 0.5px rgba(222, 222, 222, 0.8);
}
</style>
