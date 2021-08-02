import originalFetch from 'isomorphic-unfetch';

const fetch = async <SuccessResponse extends unknown, ErrorResponse extends unknown = string>(
  url: Parameters<typeof originalFetch>[0],
  optionsParam?: Parameters<typeof originalFetch>[1],
): Promise<
  | { ok: true; status: number; response: SuccessResponse }
  | { ok: false; status: number; response: ErrorResponse }
> => {
  const options: typeof optionsParam = {
    ...optionsParam,
    headers: {
      'Content-Type': 'application/json',
      ...optionsParam?.headers,
    },
  };

  const result = await originalFetch(url, options);

  const response = await (async () => {
    const str = await result.text();
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  })();

  if (!result.ok) {
    return { ok: false, status: result.status, response: response?.message ?? response };
  }

  return { ok: true, status: result.status, response };
};

export const fetcher = async <Data extends unknown = unknown>(
  ...args: Parameters<typeof fetch>
) => {
  const result = await fetch<Data>(...args);
  if (!result.ok) {
    throw new Error(`${result.status}: ${JSON.stringify(result.response)}`);
  }

  return result.response;
};
