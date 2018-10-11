export default {
  lang: {
    type: String,
    enum: ['EN', 'FR'],
    default: 'EN',
  },
  days: {
    type: Number,
    default: 365,
  },
  months: {
    type: Number,
    default: 12,
  },
  prepended: {
    type: Number,
    default: 1,
  },
  pastIsDisabled: {
    type: Boolean,
    default: true,
  },
  years: {
    type: Number,
    default: 5,
  },
  prependedYears: {
    type: Number,
    default: 3,
  },
  selected: {
    type: Object,
    default: () => ({}),
  },
  startYear: {
    type: Number,
    default: new Date().getFullYear(),
  },
  fullMonths: {
    type: Boolean,
    default: false,
  },
  accentColor: {
    type: String,
    default: '#00008b',
  },
}
