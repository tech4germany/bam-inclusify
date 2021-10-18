/* eslint-disable import/no-webpack-loader-syntax */
import { FC } from "react";

// Since we use a CRA setup with pre-configured SVG-as-resource loaders,
// we need to specifically tell webpack not to use that before passing the
// contents to react-svg-loader, by prepending the "-!".
// Found in https://github.com/jhamlet/svg-react-loader/issues/84#issuecomment-444219995
import CheckIconSvg from "-!react-svg-loader!./check.svg";
import CopyIconSvg from "-!react-svg-loader!./copy.svg";
import DownChevronIconSvg from "-!react-svg-loader!./down-chevron.svg";
import GearIconSvg from "-!react-svg-loader!./gear.svg";

export const CheckIcon: FC<React.SVGProps<SVGSVGElement>> = CheckIconSvg as any;
export const CopyIcon: FC<React.SVGProps<SVGSVGElement>> = CopyIconSvg as any;
export const DownChevronIcon: FC<React.SVGProps<SVGSVGElement>> = DownChevronIconSvg as any;
export const GearIcon: FC<React.SVGProps<SVGSVGElement>> = GearIconSvg as any;
