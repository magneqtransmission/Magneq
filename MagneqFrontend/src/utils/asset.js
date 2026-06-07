import {HiOutlineArchiveBox} from "react-icons/hi2";
import {PiCubeDuotone} from "react-icons/pi";
import {TbFileInvoice} from "react-icons/tb";
import {IoChatbubblesOutline} from "react-icons/io5";
import {GoMail} from "react-icons/go";
import {HiOutlineSquares2X2} from "react-icons/hi2";
import {BsBox} from "react-icons/bs";
import {IoDocumentTextOutline} from "react-icons/io5";
import {PiGear} from "react-icons/pi";
import {FaRegUser} from "react-icons/fa";
import {BsHouseGear} from "react-icons/bs";
import {RiSubtractLine} from "react-icons/ri";
import { VscGraphLine } from "react-icons/vsc";
import { BsExclamationCircle } from "react-icons/bs";
import { PiTruck } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";

export const getIcon = (key) => {
  const iconMap = {
    manage_suppliers:PiTruck,
    manage_customers:HiOutlineUserGroup,
    create_order: HiOutlineArchiveBox,
    track_order: PiCubeDuotone,
    ledger: TbFileInvoice,
    sales:VscGraphLine,
    quality: BsExclamationCircle,
    dashboard: HiOutlineSquares2X2,
    production: BsBox,
    purchase: IoDocumentTextOutline,
    store: HiOutlineArchiveBox,
    chat: IoChatbubblesOutline,
    email: GoMail,
    class_a: RiSubtractLine,
    class_b: RiSubtractLine,
    class_c: RiSubtractLine,
    raw_material: PiGear,
    manage_fg: BsHouseGear,
    manage_users: FaRegUser,
  };

  return iconMap[key] || HiOutlineSquares2X2;
};
