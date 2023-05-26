import { Button } from "@mui/material"
import buttonNormal from "./btn_google_signin_light_normal_web@2x.png"
import buttonDisabled from "./btn_google_signin_light_disabled_web@2x.png"

export interface Props {
    disabled?: boolean,
    onClick?: React.MouseEventHandler,
}

export default function GoogleSigninButton({disabled = false, onClick}: Props) {
    return (
        <Button onClick={onClick} disabled={disabled}>
            <img
                height="50"
                src={disabled ? buttonDisabled : buttonNormal}
                alt="Sign in with Google"
            />
        </Button>
    )
}