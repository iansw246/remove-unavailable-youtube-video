import { Link } from "@mui/material"

export interface Props extends React.ComponentPropsWithoutRef<typeof Link> {

}

export default function NewTabLink(props: Props) {
    return (
        <Link rel="noreferrer" target="_blank" {...props}></Link>
    );
}