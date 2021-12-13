import { formatQuoteError } from '../formatQuoteError';

const message =
  'Unexpected error value: { status: 400, message: "No routes found with enough liquidity", data: { error: "No routes found with enough liquidity" } }';

const expectResult = 'No routes found with enough liquidity';

it('convert graphql error message', () => {
  expect(formatQuoteError(message)).toEqual(expectResult);
});
