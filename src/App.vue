<template>
  <section class="container">
    <div class="drag-calendar" style="display: block background-color: 'transparent'">
      <div class="wrapper">
        <div id="monthly" class="ui-draggable" style="left: 0px;" @mousedown="handleDrag($event)" @touchstart="handleDrag($event)" :style="monthlyState.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} ">
          <div v-for="month in calendar.months" class="month-cell cell" :class="month.past ? 'past' : ''" @click="toggleSelectMonth($event, month)" :month-id="`${month.fullYear}-${month.monthNumber}`">
            <div class="date-formatted">
              <span class="cell-content month-name">{{MONTHS[month.monthNumber] | abr}}</span> {{month.fullYear%1000}}
            </div>
          </div>
        </div>
      </div>
      <div class="arrow top left" @click="goLeft($event, 'monthly')" :style="{visibility: monthlyState.realOffset === 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow top right" @click="goRight($event, 'monthly')" :style="{visibility: monthlyState.realOffset <= monthlyState.maxOffset ? 'hidden' : 'visible'}">
      </div>
      <div class="wrapper">
        <div id="daily" class="days ui-draggable" :style="dailyState.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} " style="left: 0px;" @mousedown="handleDrag($event)" @touchstart="handleDrag($event)">
          <div v-for="day in calendar.days" :id="`${day.fullYear}-${day.monthNumber}-${day.day}`" class="cal-cell cell" :class="day.day === 1 ? 'first' : ''"  :month="day.monthNumber" :year="day.fullYear" @click="toggleSelect($event, day)">
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
      <div class="arrow bottom left" @click="goLeft($event, 'daily')" :style="{visibility: dailyState.realOffset === 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow bottom right" @click="goRight($event, 'daily')" :style="{visibility: dailyState.realOffset <= dailyState.maxOffset ? 'hidden' : 'visible'}">
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
      let past = this.dailyState.pastBreakPoints;
      let future = this.dailyState.monthBreakPoints;
      let off =
        Math.abs(this.dailyState.realOffset) +
        document.querySelector('#monthly').parentNode.clientWidth / 2;
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
      PREPEND_MONTHS: this.prepended || 2,
      DAYS: language[this.lang].DAYS,
      MONTHS: language[this.lang].MONTHS,
      selectedDate: null,
      selectedMonth: null,
      calendar: {
        months: [],
        days: [],
      },
      monthlyState: {
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
      dailyState: {
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
      if (this[`${state}State`].realOffset >= 0) return;
      let elem = e.target.previousSibling;
      let cell = elem.firstChild.firstChild;
      this[`${state}State`].realOffset =
        this[`${state}State`].realOffset +
        Math.floor(elem.clientWidth / cell.clientWidth) * cell.clientWidth;
      if (this[`${state}State`].realOffset > 0) this[`${state}State`].realOffset = 0;
      document.querySelector(`#${state}`).style.left = `${this[`${state}State`].realOffset}px`;
      this.currentMonth;
    },
    goRight(e, state) {
      let elem = e.target.previousSibling.previousSibling;
      let cell = elem.firstChild.firstChild;
      this[`${state}State`].realOffset =
        this[`${state}State`].realOffset -
        Math.floor(elem.clientWidth / cell.clientWidth) * cell.clientWidth;
      if (this[`${state}State`].realOffset < this[`${state}State`].maxOffset)
        this[`${state}State`].realOffset = this[`${state}State`].maxOffset;
      document.querySelector(`#${state}`).style.left = `${this[`${state}State`].realOffset}px`;
      this.currentMonth;
    },
    handleDrag(e) {
      let state;

      if (e.type === 'mouseup' || e.type === 'mouseleave' || e.type === 'touchend') {
        document.body.removeEventListener('mousemove', this.handleDrag, false);
        document.body.removeEventListener('touchmove', this.handleDrag, false);
        this.dailyState.phase = 'sleep';
        this.monthlyState.phase = 'sleep';
        return true;
      }

      if (this.dailyState.phase !== 'sleep') state = this.dailyState;
      else if (this.monthlyState.phase !== 'sleep') state = this.monthlyState;
      else state = this[`${e.path.find(el => el.id === 'monthly' || el.id === 'daily').id}State`];

      if ((e.type === 'mousedown' && e.button === 0) || e.type === 'touchstart') {
        document.body.addEventListener('mousemove', this.handleDrag, false);
        document.body.addEventListener('touchmove', this.handleDrag, false);
        state.phase = 'listen';
        state.startX = e.screenX || e.touches[0].screenX;
        let row = e.path.find(el => el.className.includes('ui-draggable'));
        state.style = row.style;
        state.maxOffset = row.parentNode.clientWidth - row.clientWidth;
        state.initLeft = Number(state.style.left.match(/-?[0-9]+/g)[0]);
      }

      if (e.type === 'mousemove' || e.type === 'touchmove') {
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
      let exist = document.querySelector('.month-cell[selected="true"]');
      if (exist) exist.setAttribute('selected', false);
      document
        .querySelector(`[month-id="${month.fullYear}-${month.monthNumber}"]`)
        .setAttribute('selected', true);
      this.selectedMonth = `${month.fullYear}-${month.monthNumber}`;
      if (e) {
        const id = `[year="${month.fullYear}"][month="${month.monthNumber}"].cal-cell`;
        this.scrollIntoView(document.querySelector(id));
      }
    },
    toggleSelect(e, day) {
      let exist = document.querySelector('.cal-cell[selected="true"]');
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
      if (!element) cal = document.querySelector(`[selected=true].cal-cell`);
      let offset = cal.offsetLeft - cal.parentNode.parentNode.clientWidth * 0.3 - cal.clientWidth;
      this.dailyState.realOffset = offset > 0 ? -offset : 0;
      document.querySelector('#daily').style.left = `${this.dailyState.realOffset}px`;
    },
    dateSelected(date) {
      const formattedDate = new Date(Date.UTC(date.fullYear, date.monthNumber, date.day));
      this.$emit('dateSelected', formattedDate);
    },
  },
  created() {
    this.calendar = buildCalendar(this.NUMBER_OF_DAYS, this.NUMBER_OF_MONTHS, this.PREPEND_MONTHS);
    console.log(this.calendar.days);
    document.body.addEventListener('mouseup', e => this.handleDrag(e), false);
    document.body.addEventListener('mouseleave', e => this.handleDrag(e), false);
    document.body.addEventListener('touchend', e => this.handleDrag(e), false);
  },
  mounted() {
    document.querySelector('div:not(.past).month-cell.cell').click(); //.setAttribute('selected', true);
    if (this.selectedDate) {
      this.scrollIntoView();
    }
    this.dailyState.monthBreakPoints = [...document.querySelectorAll('.cal-cell')]
      .filter(cell => /-1$/g.test(cell.id))
      .map(el => ({
        offset: el.offsetLeft,
        monthNumber: el.getAttribute('month'),
        fullYear: el.getAttribute('year'),
      }));
    this.dailyState.maxOffset =
      document.querySelector('#daily').parentNode.clientWidth -
      document.querySelector('#daily').clientWidth;
    this.monthlyState.maxOffset =
      document.querySelector('#monthly').parentNode.clientWidth -
      document.querySelector('#monthly').clientWidth;
    if (this.dailyState.maxOffset > 0) this.dailyState.maxOffset = 0;
    if (this.monthlyState.maxOffset > 0) this.monthlyState.maxOffset = 0;
  },
  beforeDestroy() {
    document.body.removeEventListener('mouseup', e => this.handleDrag(e), false);
    document.body.removeEventListener('mouseleave', e => this.handleDrag(e), false);
    document.body.removeEventListener('touchend', e => this.handleDrag(e), false);
  },
};
</script>
<style lang="scss" scoped>
/* ========================================================================== */
@font-face {
  font-family: 'Oswald';
  font-style: normal;
  font-weight: 400;
  src: url('public/font.woff2') format('woff2');
}
/* ========================================================================== */

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

  .cell.cal-cell[selected='true'] {
    background-color: darkblue;
  }

  #monthly .cell[selected='true'] {
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

.drag-calendar .days {
  z-index: 1;
  list-style: none;
  float: left;
  margin: 0;
  padding: 0;
  position: relative;
  width: max-content;
  transition: all 1s ease;
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
    .day,
    .day-number {
      font-weight: bold;
      transform: scale(1.1);
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

.drag-calendar #monthly {
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

.drag-calendar #monthly .cell {
  float: left;
  width: 105px;
  padding: 10px 10px;
  text-align: center;
  position: relative;
  color: #888;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
}

.drag-calendar #monthly .cell .month-name {
  font-weight: bold;
  font-size: 0.8em;
  z-index: 1;
  position: relative;
  text-transform: uppercase;
}

.drag-calendar #monthly .cell .date-formatted {
  font-weight: 200;
  font-size: 1em;
}

.drag-calendar .ui-draggable {
  cursor: move;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.drag-calendar #monthly .cell.past {
  background-color: rgba(222, 222, 222, 0.6);
  color: lightgrey;
  opacity: 0.8;
  pointer-events: none;
  border-right: solid 0.5px rgba(222, 222, 222, 0.8);
}
</style>
