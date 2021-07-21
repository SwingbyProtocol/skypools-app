import { enumType, inputObjectType } from 'nexus';

export const StringFilterMode = enumType({
  name: 'StringFilterMode',
  members: ['default', 'insensitive'],
});

export const IdFilter = inputObjectType({
  name: 'IdFilter',
  definition(t) {
    t.id('equals');
    t.id('gt');
    t.id('gte');
    t.list.id('in');
    t.id('lt');
    t.id('lte');
    t.field('not', { type: 'IdFilter' });
    t.list.id('notIn');
  },
});

export const StringFilter = inputObjectType({
  name: 'StringFilter',
  definition(t) {
    t.string('contains');
    t.string('endsWith');
    t.string('equals');
    t.string('gt');
    t.string('gte');
    t.list.string('in');
    t.string('lt');
    t.string('lte');
    t.field('mode', { type: StringFilterMode });
    t.field('not', { type: 'StringFilter' });
    t.list.string('notIn');
    t.string('startsWith');
  },
});

export const DecimalFilter = inputObjectType({
  name: 'DecimalFilter',
  definition(t) {
    t.decimal('equals');
    t.decimal('gt');
    t.decimal('gte');
    t.list.decimal('in');
    t.decimal('lt');
    t.decimal('lte');
    t.field('not', { type: 'DecimalFilter' });
    t.list.decimal('notIn');
  },
});

export const IntFilter = inputObjectType({
  name: 'IntFilter',
  definition(t) {
    t.int('equals');
    t.int('gt');
    t.int('gte');
    t.list.int('in');
    t.int('lt');
    t.int('lte');
    t.field('not', { type: 'IntFilter' });
    t.list.int('notIn');
  },
});

export const DateTimeFilter = inputObjectType({
  name: 'DateTimeFilter',
  definition(t) {
    t.dateTime('equals');
    t.dateTime('gt');
    t.dateTime('gte');
    t.list.dateTime('in');
    t.dateTime('lt');
    t.dateTime('lte');
    t.field('not', { type: 'DateTimeFilter' });
    t.list.dateTime('notIn');
  },
});
