import {shallowMount, mount} from '@vue/test-utils';
import App from '@/App.vue';
import {gWeekDay, gDay, gMonth, gYear} from '@/utils/buildCalendar';

describe('VueCal', () => {
  it('should build without props', () => {
    const wrapper = shallowMount(App, {sync: false});
    expect(wrapper.vm.calendar.days.length).toEqual(365);
    expect(wrapper.vm.calendar.months.length).toEqual(14);
  });
  it('should build with custom days', () => {
    const wrapper = shallowMount(App, {
      propsData: {days: 900},
      sync: false,
    });
    expect(wrapper.vm.calendar.days.length).toEqual(900);
  });
  it('should discard days if months is set', () => {
    const wrapper = shallowMount(App, {
      propsData: {days: 900, months: 6},
      sync: false,
    });
    expect(wrapper.vm.calendar.months.length).toEqual(8);
  });
  it('should change the language', () => {
    const wrapper = shallowMount(App, {
      propsData: {lang: 'FR'},
      sync: false,
    });
    expect(wrapper.vm.MONTHS[0]).toMatch('JANVIER');
  });
  const wrapper = mount(App, {
    sync: false,
    attachToDocument: true,
    propsData: {
      selected: {
        dayOfTheWeek: gWeekDay(new Date()),
        day: gDay(new Date()),
        monthNumber: gMonth(new Date()),
        fullYear: gYear(new Date()),
      },
    },
  });
  it('should', async () => {
    wrapper.element.querySelector('.arrow.bottom.left').click();
    wrapper.element.querySelector('.arrow.bottom.right').click();
    wrapper.vm.$refs.monthly.childNodes[2].click();
    wrapper.vm.$refs.daily.childNodes[5].click();
    expect(wrapper.vm.selectedDate).not.toBe(null);
    expect(wrapper.element).toMatchSnapshot();
    wrapper.vm.$refs.daily.childNodes[5].click();
    expect(wrapper.vm.selectedDate).toBe(null);
    wrapper.vm.$destroy();
  });
});
