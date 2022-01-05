export const SkybridgeWidget = ({ src }: { src: string }) => {
  return (
    <iframe
      id="widget-iframe"
      allow="clipboard-write"
      title="Skybridge Swap Widget"
      src={src}
      style={{ width: '100%', height: 510, borderRadius: 6 }}
      frameBorder={0}
    />
  );
};
