<template>
  <section class="container">
    <div class="drag-calendar" style="display: block; background-color: 'transparent'" :style="{height: years ? '12.6rem' : '9.6rem'}">
      <div v-if="years" :class="yearly.maxOffset < 0 ? 'wrapper' : 'wrapper-flex'">
        <div ref="yearly" state="yearly" class="years ui-draggable" style="left: 0px;" @mousedown="initDrag($event, yearly)" @touchstart="initDrag($event, yearly)" :style="yearly.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} ">
          <div v-for="year in calendar.years" :key="year" class="year-cell cell" @click="toggleSelectYear($event, year)" :year-id="year" :selected="isSelected(null,null,year)">
            <div class="cell-content" :style="{backgroundColor: `${isSelected(null, null, year) ? accentColor : ''}` }">
              <span class="year">{{year}}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="years" class="arrow top left" @click="goTo($event, yearly, -1)" :style="{visibility: yearly.realOffset >= 0 ? 'hidden' : 'visible'}">
      </div>
      <div v-if="years" class="arrow top right" @click="goTo($event, yearly, 1)" :style="{visibility: yearly.realOffset <= yearly.maxOffset ? 'hidden' : 'visible'}">
      </div>
      <div :class="monthly.maxOffset < 0 ? 'wrapper' : 'wrapper-flex'">
        <div ref="monthly" state="monthly" class="months ui-draggable" style="left: 0px;" @mousedown="initDrag($event, monthly)" @touchstart="initDrag($event, monthly)" :style="monthly.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} ">
          <div v-for="month in calendar.months" :key="`${month.fullYear}-${month.monthNumber}`" v-if="month" class="month-cell cell" :class="{prev: month.prev, next: month.next, past: month.past}" @click="toggleSelectMonth($event, month)" :month-id="`${month.fullYear}-${month.monthNumber}`" :year-id="month.fullYear" :selected="isSelected(null, month, null)">
            <div class="cell-content" :selected="selectedDate.monthNumber == month.monthNumber && selectedDate.fullYear == month.fullYear" :style="{backgroundColor: `${isSelected(null, month, null) || (selectedDate.monthNumber == month.monthNumber && selectedDate.fullYear == month.fullYear) ? accentColor : ''}` }" @click.stop="scrollDayIntoView()">
              <span class="cell-content month-name">{{MONTHS[month.monthNumber] | abr}} </span>
              <div class="hover" v-if="month.next"> {{month.fullYear}}</div>
              <div class="hover" v-if="month.prev"> {{month.fullYear}}</div>
              <span v-if="!years"> {{month.fullYear%1000}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="arrow left" :class="years ? 'middle' : 'top'" @click="goTo($event, monthly, -1)" :style="{visibility: monthly.realOffset >= 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow right" :class="years ? 'middle' : 'top'" @click="goTo($event, monthly, 1)" :style="{visibility: monthly.realOffset <= monthly.maxOffset ? 'hidden' : 'visible'}">
      </div>
      <div class="wrapper">
        <div ref="daily" state="daily" class="days ui-draggable" :style="daily.phase === 'dragging' ? {pointerEvents: 'none', transition: 'none', cursor:'-webkit-grab'} : {} " style="left: 0px;" @mousedown="initDrag($event, daily)" @touchstart="initDrag($event, daily)">
          <div v-for="day in calendar.days" :key="day | ymd" :date="day | ymd" :closed="day.disabled" class="cal-cell cell" :class="{first: day.day == 1, next: day.next, prev: day.prev, today: day.today, }" :month-id="day.monthNumber" :year-id="day.fullYear" :day-id="day.day" @click="toggleSelect($event, day)" :selected="isSelected(day, null, null)" :style="{backgroundColor: `${isSelected(day, null, null) ? accentColor : ''}` }">
            <div class="hover" v-if="day.next"> {{day.fullYear}}</div>
            <div class="hover" v-if="day.prev"> {{day.fullYear}}</div>
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
      <div class="arrow bottom left" @click="goTo($event, daily, -1)" :style="{visibility: daily.realOffset >= 0 ? 'hidden' : 'visible'}">
      </div>
      <div class="arrow bottom right" @click="goTo($event, daily, 1)" :style="{visibility: daily.realOffset <= daily.maxOffset ? 'hidden' : 'visible'}">
      </div>
    </div>
  </section>
</template>
<script>
import {abr, ymd} from '@/utils/filters'
import {buildCalendar, buildEntireCalendar} from '@/utils/buildCalendar'
import props from '@/utils/props'
import languages from '@/utils/CONSTANTS'
export default {
  name: 'VueCal',
  filters: {abr, ymd},
  props: props,
  computed: {
    currentMonth() {
      let past = this.daily.pastBreakPoints
      let future = this.daily.monthBreakPoints
      if (!this.$refs.daily) return past[past.length - 1]
      let off = -this.daily.realOffset + this.$refs.daily.parentNode.clientWidth / 2
      if (this.daily.realOffset === 0) off = 1
      let modified = false
      while (past.length > 0 && off <= past[past.length - 1].offset) {
        modified = true
        future.unshift(past.pop())
      }
      while (future.length > 0 && off >= future[0].offset) {
        modified = true
        past.push(future.shift())
      }
      if (modified) this.checkElementIsInView(this.monthly)
      return past[past.length - 1]
    },
    currentState() {
      return [this.daily, this.monthly, this.yearly].filter(el => el.phase !== 'sleep')[0]
    },
  },
  data() {
    return {
      TODAY: new Date(),
      DAYS: languages[this.lang].DAYS,
      MONTHS: languages[this.lang].MONTHS,
      selectedDate: this.selected,
      calendar: {
        months: [],
        days: [],
      },
      entireCalendar: {},
      yearly: {
        id: 'yearly',
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
      monthly: {
        id: 'monthly',
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
      daily: {
        id: 'daily',
        monthBreakPoints: [],
        pastBreakPoints: [],
        phase: 'sleep',
        startX: 0,
        currentOffset: 0,
        initLeft: 0,
        realOffset: 0,
        maxOffset: 0,
      },
    }
  },
  methods: {
    goTo(e, state, coef) {
      if (state.realOffset > 0 || state.realOffset <= state.maxOffset) return false
      let elem = this.$refs[`${state.id}`]
      let cell = elem.firstChild.clientWidth
      state.realOffset -= Math.floor(elem.parentNode.clientWidth / cell) * cell * coef
      if (state.realOffset > 0) state.realOffset = 0
      if (state.realOffset < state.maxOffset) state.realOffset = state.maxOffset
      elem.style.left = `${state.realOffset}px`
      return true
    },
    initDrag(e, state) {
      document.body.addEventListener('mousemove', this.handleDrag, false)
      document.body.addEventListener('touchmove', this.handleDrag, false)
      state.phase = 'listen'
      state.startX = e.screenX || e.touches[0].screenX
      state.initLeft = Number(state.style.left.slice(0, -2))
      return true
    },
    handleDrag(e) {
      let state = this.currentState
      state.phase = 'dragging'
      state.currentOffset = (e.screenX || e.touches[0].screenX) - state.startX
      state.realOffset = state.initLeft + state.currentOffset
      if (state.realOffset < state.maxOffset) state.realOffset = state.maxOffset
      state.style.left = state.realOffset <= 0 ? `${state.realOffset}px` : '0px'
      return true
    },
    endDrag(e) {
      if (!this.currentState) return false
      this.currentState.phase = 'sleep'
      document.body.removeEventListener('mousemove', this.handleDrag, false)
      document.body.removeEventListener('touchmove', this.handleDrag, false)
      return true
    },
    isSelected(day, month, year) {
      const d = this.selectedDate
      const cm = this.currentMonth
      if (day) {
        return d.day == day.day && d.monthNumber == day.monthNumber && d.fullYear == day.fullYear
      }
      if (month) {
        return cm && cm.monthNumber == month.monthNumber && cm.fullYear == month.fullYear
      }
      if (year) {
        return cm && cm.fullYear == year
      }
      return false
    },
    toggleSelectMonth(e, month) {
      if (/next|prev/g.test(e.target.className)) {
        this.$refs.yearly.querySelector(`[year-id="${e.target.getAttribute('year-id')}"]`).click()
        return true
      }
      const id = `[year-id="${month.fullYear}"][month-id="${month.monthNumber}"].cal-cell`
      this.scrollDayIntoView(this.$refs.daily.querySelector(id))
      this.checkElementIsInView(this.monthly)
    },
    toggleSelectYear(e, year) {
      this.appendYear(year)
    },
    toggleSelect(e, day) {
      if (e && /next|prev/g.test(e.target.className)) {
        this.$refs.yearly.querySelector(`[year-id="${e.target.getAttribute('year-id')}"]`).click()
        return
      }
      if (e.target.getAttribute('selected')) {
        this.selectedDate = {}
        return this.$emit('dateCleared')
      }
      this.dateSelected(day)
    },
    dateSelected(date) {
      this.selectedDate = date
      const formattedDate = new Date(Date.UTC(date.fullYear, date.monthNumber, date.day))
      this.$emit('dateSelected', formattedDate)
    },
    handleResize() {
      this.daily.phase = 'dragging'
      this.monthly.phase = 'dragging'
      this.yearly.phase = 'dragging'
      this.maxOffsets()
      this.computeBreakPoints()
      setTimeout(() => {
        this.daily.phase = 'sleep'
        this.monthly.phase = 'sleep'
        this.yearly.phase = 'sleep'
      }, 200)
    },
    maxOffsets() {
      const d = this.daily
      const m = this.monthly
      const y = this.yearly
      d.maxOffset = this.$refs.daily.parentNode.clientWidth - this.$refs.daily.clientWidth
      m.maxOffset = this.$refs.monthly.parentNode.clientWidth - this.$refs.monthly.clientWidth
      if (d.maxOffset > 0) d.maxOffset = 0
      if (m.maxOffset > 0) m.maxOffset = 0
      if (d.style.left.slice(0, -2) < d.maxOffset) d.style.left = `${d.maxOffset}px`
      if (m.style.left.slice(0, -2) < m.maxOffset) m.style.left = `${m.maxOffset}px`
      if (this.years) {
        y.maxOffset = this.$refs.yearly.parentNode.clientWidth - this.$refs.yearly.clientWidth
        if (y.maxOffset > 0) y.maxOffset = 0
        if (y.style.left.slice(0, -2) < y.maxOffset) y.style.left = `${y.maxOffset}px`
      }
    },
    computeBreakPoints() {
      this.daily.pastBreakPoints = []
      this.daily.monthBreakPoints = [
        this.$refs.daily.querySelector('.cal-cell.today'),
        ...this.$refs.daily.querySelectorAll('.cal-cell:not(.next)[day-id="1"]'),
      ]
        .filter(Boolean)
        .map((el, i) => ({
          offset: i === 0 ? 0 : el.offsetLeft,
          monthNumber: el.getAttribute('month-id'),
          fullYear: el.getAttribute('year-id'),
        }))
    },
    appendYear(year) {
      const ec = this.entireCalendar
      let m = this.calendar.months
      let d = this.calendar.days
      year = Number(year)
      if (this.selectedDate.day) {
        this.selectedDate = {}
        this.$emit('dateCleared')
      }
      this.monthly.realOffset = 0
      this.daily.realOffset = 0
      m.splice(0, 14)
      d.splice(0, 368)
      m.push(...ec[year].months)
      d.push(...ec[year].days)
      if (ec[year + 1]) {
        m[m.push({...ec[year + 1].months[0]}) - 1].next = true
        d[d.push({...ec[year + 1].days[0]}) - 1].next = true
      }
      if (ec[year - 1]) {
        m.unshift({...ec[year - 1].months[ec[year - 1].months.length - 1], prev: true})
        d.unshift({...ec[year - 1].days[ec[year - 1].days.length - 1], prev: true})
      }
      this.$nextTick(() => {
        this.maxOffsets()
        if (!this.prependedYears) {
          this.$refs.daily.style.left = '0px'
          this.$refs.monthly.style.left = '0px'
        }
        this.computeBreakPoints()
        this.checkElementIsInView(this.yearly)
      })
    },
    scrollDayIntoView(el) {
      if (!el) el = this.$refs.daily.querySelector(`[selected="selected"]`)
      let offset = -el.offsetLeft + el.parentNode.parentNode.clientWidth / 2 - el.clientWidth / 2
      this.daily.realOffset = offset < 0 ? offset : 0
      this.$refs.daily.style.left = `${this.daily.realOffset}px`
    },
    checkElementIsInView(state) {
      this.$nextTick(() => {
        const sel = this.$refs[`${state.id}`].querySelector('[selected="selected"]')
        if (!sel) return false
        const cw = sel.parentNode.parentNode.clientWidth
        if (sel.offsetLeft > -state.realOffset - sel.clientWidth + cw) {
          state.realOffset = -sel.offsetLeft - sel.clientWidth / 2 + cw / 2
          if (state.realOffset < state.maxOffset) state.realOffset = state.maxOffset
          state.style.left = `${state.realOffset}px`
        }
        if (-sel.offsetLeft > state.realOffset) {
          state.realOffset = -sel.offsetLeft - sel.clientWidth / 2 + cw / 2
          if (state.realOffset > 0) state.realOffset = 0
          state.style.left = `${state.realOffset}px`
        }
      })
    },
    disableDays() {
      this.disabledDates.forEach(date => {
        this.$refs.daily.querySelector(`[date="${date}"]`).setAttribute('disabled', 'disabled')
      })
    },
  },
  updated() {
    this.currentMonth
  },
  created() {
    if (this.years) {
      this.entireCalendar = buildEntireCalendar(this.years, this.disabledWeekDays, this.prependedYears)
      this.calendar.years = Object.keys(this.entireCalendar)
      this.appendYear(`${Number(this.calendar.years[0]) + this.prependedYears}`)
    } else {
      this.calendar = buildCalendar(this.days, this.months, this.prependedMonths, this.disabledWeekDays, {
        fullMonths: this.fullMonths,
        pastIsDisabled: this.pastIsDisabled,
      })
    }
    document.body.addEventListener('mouseup', this.endDrag, false)
    document.body.addEventListener('mouseleave', this.endDrag, false)
    document.body.addEventListener('touchend', this.endDrag, false)
    window.addEventListener('resize', this.handleResize, false)
  },
  mounted() {
    if (this.years) {
      this.yearly.style = this.$refs.yearly.style
    }
    this.daily.style = this.$refs.daily.style
    this.monthly.style = this.$refs.monthly.style
    this.disableDays()
    this.maxOffsets()
    this.computeBreakPoints()
    this.scrollDayIntoView(this.$refs.daily.querySelector('.today'))
  },
  beforeDestroy() {
    document.body.removeEventListener('mouseup', this.endDrag, false)
    document.body.removeEventListener('mouseleave', this.endDrag, false)
    document.body.removeEventListener('touchend', this.endDrag, false)
    window.removeEventListener('resize', this.handleResize, false)
  },
}
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

@font-face {
  font-family: 'Oswald';
  font-style: normal;
  font-weight: 400;
  src: url('public/font.woff2') format('woff2');
}
:root {
  @include responsive-font(1.75vw, 13px, 16px, 14px);
}

.container {
  padding-top: 1em;
  width: 95%;
  margin: auto;
}

.drag-calendar {
  box-sizing: content-box;
  clear: both;
  overflow: hidden;
  width: 100%;
  position: relative;
  padding: 0;
  line-height: 1;
  background-color: transparent;
  .wrapper-flex {
    display: inline-flex;
    width: 100%;
  }
  .ui-draggable {
    cursor: move;
    cursor: -moz-grab;
    cursor: -webkit-grab;
    .cell-content {
      pointer-events: none;
    }
  }
  .cal-cell[selected='selected'],
  .month-cell[selected='selected'] {
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
        margin-bottom: 0.25rem;
      }
    }
  }
  .arrow {
    font-family: 'Oswald';
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
      height: 5rem;
      bottom: 1.1rem;
      font-size: 3rem;
    }
    &.middle {
      top: 3.25rem;
      height: 2.5rem;
      font-size: 2rem;
    }
    &.top {
      top: 0.25rem;
      height: 2.5rem;
      font-size: 2rem;
    }
    &.left {
      left: 0;
      &.middle:before {
        content: '<';
        height: 2.5rem;
      }
      &.top:before {
        content: '<';
        height: 2.5rem;
      }
      &.bottom:before {
        content: '<';
        height: 4rem;
      }
    }
    &.right {
      right: 0;
      &.middle:before {
        content: '>';
        height: 2.5rem;
      }
      &.top:before {
        content: '>';
        height: 2.5rem;
      }
      &:before {
        content: '>';
        height: 4rem;
      }
    }
    &:active {
      transform: scale(0.8);
    }
  }
  .days {
    z-index: 1;
    float: left;
    margin: 0;
    padding: 0;
    position: relative;
    width: max-content;
    height: 5rem;
    transition: all 1s ease;
    .cell {
      float: left;
      width: 4rem;
      padding: 1.5rem 1.25rem;
      margin: 0;
      border-right: 1px solid rgba(0, 0, 0, 0.03);
      text-align: center;
      position: relative;
      color: #888;
      &:first-child {
        margin-left: 0.4em;
      }
      &:last-child {
        margin-right: 0.4em;
      }
      &[disabled='disabled'],
      &[closed] {
        background-color: rgba(235, 235, 235, 0.5);
        color: #a0a0a0;
        opacity: 0.8;
        pointer-events: none;
        border-radius: 0.5em;
      }
      &.next,
      &.prev {
        background-color: rgba(0, 0, 0, 0.02);
        margin-right: 0.4rem;
        opacity: 0.5;
        .hover {
          position: absolute;
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
        }
        &:hover {
          opacity: 1;
          .hover {
            transition: all 1s ease;
            pointer-events: none;
            opacity: 1;
          }
          .cell-content {
            pointer-events: none;
            transition: all 1s ease;
            opacity: 0;
          }
        }
      }
      &.today {
        .day-number {
          color: red;
          text-decoration: underline;
        }
      }
      .day-number {
        display: block;
        clear: both;
        font-weight: bold;
        font-size: 1.2em;
        z-index: 1;
        position: relative;
      }
      .day {
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
  }
  .months {
    z-index: 1;
    float: left;
    margin: 0;
    height: 2.5rem;
    padding: 0;
    padding-left: 0.6rem;
    position: relative;
    width: max-content;
    margin: 0.25rem 0 0.75rem;
    background-color: transparent;
    transition: all 1s ease;
    display: inline-flex;
    flex: 1;
    .cell {
      float: left;
      width: 8rem;
      padding: 0.6rem;
      text-align: center;
      position: relative;
      color: #888;
      border-right: 1px solid rgba(0, 0, 0, 0.03);
      position: relative;
      flex: 1;
      &:not([selected='selected']) {
        .cell-content[selected='selected'] {
          opacity: 1;
          color: white;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          padding: 0.4rem;
          margin-top: -0.4rem;
          border-radius: 0.5rem;
          pointer-events: auto;
          cursor: pointer;
          z-index: 3;
        }
      }
      &.past {
        background-color: rgba(222, 222, 222, 0.6);
        color: lightgrey;
        opacity: 0.8;
        pointer-events: none;
        border-right: solid 0.5px rgba(222, 222, 222, 0.8);
      }
      &.next,
      &.prev {
        background-color: rgba(0, 0, 0, 0.02);
        margin-right: 0.4rem;
        opacity: 0.5;
        &:hover {
          opacity: 1;
          .hover {
            transition: all 1s ease;
            opacity: 1;
            pointer-events: none;
          }
          .month-name {
            transition: all 1s ease;
            opacity: 0;
          }
        }
        .hover {
          position: absolute;
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .cell-content {
          pointer-events: none;
          opacity: 0.5;
          color: black;
          font-weight: bold;
          font-size: 1rem;
        }
      }
      &[selected='selected'] {
        .cell-content {
          opacity: 0.5;
          color: white;
          border-radius: 0.5rem;
          padding: 0.3em;
          margin-top: -0.3rem;
          font-weight: 350;
          .month-name {
            font-size: 0.9rem;
            padding: 0;
          }
        }
      }
      &.next {
        flex: 0.5;
      }
      .cell-content {
        font-weight: 200;
        font-size: 1em;
        .month-name {
          opacity: 1;
          font-weight: bold;
          font-size: 0.9rem;
          z-index: 1;
          position: relative;
          text-transform: uppercase;
        }
      }
    }
  }
  .years {
    z-index: 1;
    float: left;
    margin: 0;
    height: 2.5rem;
    padding: 0;
    position: relative;
    width: max-content;
    border-bottom: 0px solid ghostwhite;
    margin: 0.25rem 0 0.25rem;
    background-color: transparent;
    transition: all 1s ease;
    display: flex;
    flex: 1;
    .cell {
      float: left;
      width: 16rem;
      flex: 1;
      padding: 0.6rem;
      text-align: center;
      position: relative;
      color: #888;
      border-right: 1px solid rgba(0, 0, 0, 0.03);
      position: relative;
      .cell-content {
        font-weight: 600;
        font-size: 1rem;
        .month-name {
          font-weight: bold;
          font-size: 1rem;
          z-index: 1;
          position: relative;
          text-transform: uppercase;
        }
      }
      &[selected='selected'] {
        .cell-content {
          opacity: 0.25;
          color: white;
          border-radius: 0.5rem;
          padding: 0.3rem;
          margin-top: -0.3rem;
          .year {
            font-weight: 600;
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
