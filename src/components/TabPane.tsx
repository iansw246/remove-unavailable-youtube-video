export interface Props {
    value: number;
    index: number;
    children: React.ReactNode;
}

export default function TabPanel({value, index, children}: Props) {
    return (<div hidden={value !== index} role="tabpanel">
        {children}
    </div>);
}