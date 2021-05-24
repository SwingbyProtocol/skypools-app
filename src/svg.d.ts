declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.SFC<Omit<React.SVGProps<SVGSVGElement>, 'className'>>;
  export default ReactComponent;
}
