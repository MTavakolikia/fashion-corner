import DesktopNav from "./DesktopNav";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";

interface NavbarProps {
    userId: string | null;
}

function Navbar({ userId }: NavbarProps) {
    return (
        <>
            <DesktopNav userId={userId} />
            <MobileHeader userId={userId} />
            <BottomNav userId={userId} />
        </>
    );
}

export default Navbar;
