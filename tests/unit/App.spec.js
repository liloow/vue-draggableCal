import {shallowMount, mount} from '@vue/test-utils';
import App from '@/App.vue';
import {gDay, gMonth, gYear} from '@/utils/buildCalendar';

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

  const noyear = mount(App, {
    sync: false,
    attachToDocument: true,
    propsData: {
      selected: {
        day: gDay(new Date()) + 100,
        monthNumber: gMonth(new Date()),
        fullYear: gYear(new Date()),
      },
    },
  });

  const years = mount(App, {
    sync: false,
    attachToDocument: true,
    propsData: {
      years: 10,
    },
  });

  it('should build noyear', async () => {
    noyear.element.querySelector('.arrow.top.right').click();
    noyear.vm.$nextTick(() => expect(Number(noyear.vm.monthly.realOffset)).toBeLessThan(0));

    noyear.element.querySelector('.arrow.bottom.right').click();
    noyear.vm.$nextTick(() => expect(Number(noyear.vm.daily.realOffset)).toBeLessThan(0));

    noyear.vm.$refs.monthly.childNodes[2].click();
    noyear.vm.$nextTick(() =>
      expect(noyear.vm.$refs.monthly.childNodes[2].getAttribute('selected')).toBe('selected')
    );

    noyear.vm.$refs.daily.childNodes[5].click();
    expect(noyear.vm.selectedDate).not.toBe(null);

    noyear.vm.$refs.daily.childNodes[5].click();
    noyear.vm.$nextTick(() => expect(noyear.vm.selectedDate).toBe({}));

    expect(noyear.element).toMatchSnapshot();
    noyear.vm.$destroy();
  });

  it('should build year', async () => {
    years.vm.$refs.yearly.childNodes[2].click();
    years.vm.$nextTick(() =>
      expect(years.vm.$refs.yearly.childNodes[2].getAttribute('selected')).toBe('selected')
    );

    years.element.querySelector('.arrow.top.right').click();
    years.vm.$nextTick(() => expect(Number(years.vm.yearly.realOffset)).toBeLessThan(0));

    years.element.querySelector('.arrow.middle.right').click();
    years.vm.$nextTick(() => expect(Number(years.vm.monthly.realOffset)).toBeLessThan(0));

    years.element.querySelector('.arrow.bottom.right').click();
    years.vm.$nextTick(() => expect(Number(years.vm.daily.realOffset)).toBeLessThan(0));

    years.vm.$refs.monthly.childNodes[2].click();
    years.vm.$nextTick(() =>
      expect(years.vm.$refs.monthly.childNodes[2].getAttribute('selected')).toBe('selected')
    );

    years.vm.$refs.daily.childNodes[5].click();
    years.vm.$nextTick(() => expect(years.vm.selectedDate).not.toBe({}));

    years.vm.$refs.daily.childNodes[5].click();
    years.vm.$nextTick(() => expect(years.vm.selectedDate).toBe({}));

    expect(years.element).toMatchSnapshot();
    years.vm.$destroy();
  });
});
