const WIDTH_DEFAULT = 4;

export function shortenAddress({
  value: valueParam,
  width = WIDTH_DEFAULT,
}: {
  value: string | null | undefined;
  width?: number;
}) {
  if (!valueParam) return null;

  const value = valueParam.replace(/^0x/, '');
  const isHex = value !== valueParam;

  if (value.length <= width * 2) return value;
  return `${isHex ? '0x' : ''}${value.slice(0, width)}…${value.slice(-width)}`;
}
