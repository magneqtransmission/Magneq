import { HiOutlineArchiveBox } from "react-icons/hi2";
import SearchBar from "../../components/common/Searchbar";
import Button from "../../components/buttons/Button";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Store = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/store/class/A");
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "rgba(var(--background))",
        color: "rgba(var(--text))",
      }}
    >
      <div className="flex flex-row  gap-4 md:gap-6 bg-transparent mx-auto">
        <div className="w-72">
          <SearchBar placeholder="Search using Name" />
        </div>
        <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
        >
          Add Stock
        </Button>
        {/* <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
        >
          Edit Stock
        </Button> */}
        <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
          onClick={{}}
        >
          Purchase Goods
        </Button>
      </div>

      <Outlet />
    </div>
  );
};

export default Store;
