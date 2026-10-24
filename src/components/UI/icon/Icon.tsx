import type { IconBaseProps } from "react-icons";
import {
  LuArrowRight,
  LuCalendarDays,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuClock3,
  LuDoorOpen,
  LuGlobe,
  LuInfo,
  LuLoaderCircle,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuTrash2,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

const ICONS = {
  calendar: LuCalendarDays,
  room: LuDoorOpen,
  clock: LuClock3,
  plus: LuPlus,
  chevronLeft: LuChevronLeft,
  chevronRight: LuChevronRight,
  arrowRight: LuArrowRight,
  refresh: LuRefreshCw,
  edit: LuPencil,
  trash: LuTrash2,
  close: LuX,
  check: LuCheck,
  info: LuInfo,
  warning: LuTriangleAlert,
  globe: LuGlobe,
  loader: LuLoaderCircle,
} as const;

export type T_IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: IconBaseProps & { name: T_IconName }) {
  const IconComponent = ICONS[name];

  return (
    <IconComponent
      size={20}
      strokeWidth={1.6}
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}
