// React, Next.js
import { FC } from "react";
import Image from "next/image";

import LogoImg from "/images/fashion-corner.png";

interface LogoProps {
  width: string;
  height: string;
}

const Logo: FC<LogoProps> = ({ width, height }) => {
  return (
    <div className="z-50 relative" style={{ width, height }}>
      <Image
        src={LogoImg}
        alt="Fashion Corner"
        fill
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
