import { intArg, objectType, stringArg } from 'nexus';

export const buildCursor = (value: string) => `0x${Buffer.from(value, 'utf-8').toString('hex')}`;

const ForwardPaginationPageInfo = objectType({
  name: 'ForwardPaginationPageInfo',
  definition(t) {
    t.nonNull.string('startCursor');
    t.nonNull.string('endCursor');
    t.nonNull.boolean('hasNextPage');
    t.nonNull.boolean('hasPreviousPage');
  },
});

export const paginationArgs = {
  first: intArg({
    description: 'Limits the number of items that are retuned. Can be combined with "after".',
  }),
  after: stringArg({
    description:
      'Only items coming immediately after this will be returned. Can be combined with "first".',
  }),

  last: intArg({
    description: 'Limits the number of items that are retuned. Can be combined with "before".',
  }),
  before: stringArg({
    description:
      'Only items coming immediately after this will be returned. Can be combined with "last".',
  }),
};

export const paginatedType = ({
  nodeType,
  alias,
}: {
  nodeType: NexusGen['objectNames'];
  alias?: string;
}) => {
  const name = alias ?? nodeType;
  return objectType({
    name: `${name}Connection`,
    definition(t) {
      t.nonNull.int('totalCount');
      t.nonNull.list.nonNull.field('edges', {
        type: objectType({
          name: `${name}ConnectionEdges`,
          definition(t) {
            t.nonNull.field('node', { type: nodeType });
            t.nonNull.string('cursor');
          },
        }),
      });
      t.nonNull.field('pageInfo', {
        type: ForwardPaginationPageInfo,
      });
    },
  });
};

export const paginate = <T extends { id: string }>({
  allEdges: allEdgesParam,
  after,
  first,
  before,
  last,
}: {
  allEdges: T[];
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}) => {
  const allEdges = allEdgesParam.map((it) => ({ node: it, cursor: buildCursor(it.id) }));

  const edges = (() => {
    if (typeof after === 'string' && typeof last === 'number') {
      throw new Error('"after" cannot be combined with "last"');
    }

    if (typeof after === 'string' && typeof before === 'string') {
      throw new Error('"after" cannot be combined with "before"');
    }

    if (typeof before === 'string' && typeof first === 'number') {
      throw new Error('"before" cannot be combined with "first"');
    }

    if (typeof after === 'string' || typeof first === 'number') {
      const startIndex = (() => {
        if (!after) return 0;
        const afterEdgeIndex = allEdges.findIndex((it) => it.cursor === after);
        if (afterEdgeIndex < 0) {
          throw new Error(`Could not find node with cursor "${after}`);
        }

        return afterEdgeIndex + 1;
      })();

      return allEdges.slice(startIndex, first ? startIndex + first : undefined);
    }

    if (typeof before === 'string' || typeof last === 'number') {
      const beforeEdgeIndex = (() => {
        const result = before ? allEdges.findIndex((it) => it.cursor === before) : allEdges.length;
        if (result < 0) {
          throw new Error(`Could not find node with cursor "${before}`);
        }

        return result;
      })();

      const moveLeft = typeof last === 'number' ? last : beforeEdgeIndex;
      return allEdges.slice(Math.max(0, beforeEdgeIndex - moveLeft), beforeEdgeIndex);
    }

    return allEdges;
  })();

  return {
    totalCount: allEdges.length,
    edges,
    pageInfo: {
      startCursor: edges[0]?.cursor || '',
      endCursor: edges[edges.length - 1]?.cursor || '',
      hasPreviousPage:
        allEdges.length > 0 && edges.length > 0 && allEdges[0].cursor !== edges[0].cursor,
      hasNextPage:
        allEdges.length > 0 &&
        edges.length > 0 &&
        allEdges[allEdges.length - 1].cursor !== edges[edges.length - 1].cursor,
    },
  };
};
