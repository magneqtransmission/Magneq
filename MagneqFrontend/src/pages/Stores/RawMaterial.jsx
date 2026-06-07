import React, {useState} from "react";
import StoreHeader from "./StoreHeader";
import RawItemList from "./RawItemList";

const RawMaterial = () => {
  const [activeClass, setActiveClass] = useState("A");

  return (
    <div>
      <StoreHeader
        activeClass={activeClass}
        onClassChange={(cls) => setActiveClass(cls)}
      />

      <RawItemList classType={activeClass} />
    </div>
  );
};

export default RawMaterial;
