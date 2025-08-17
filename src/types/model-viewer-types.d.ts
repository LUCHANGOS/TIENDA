declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<ModelViewerElementAttributes, HTMLElement>;
  }
}

interface ModelViewerElementAttributes extends React.HTMLAttributes<HTMLElement> {
  src?: string;
  alt?: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  'interaction-policy'?: string;
  loading?: string;
  onLoad?: () => void;
  onError?: () => void;
}
