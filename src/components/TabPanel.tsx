export interface Props {
  // Current value of tabIndex
  value: number;
  // Index of this TabPanel. TabPanel will only be visible when value matches index
  index: number;
  children: React.ReactNode;
}

export default function TabPanel({ value, index, children }: Props) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {children}
    </div>
  );
}
