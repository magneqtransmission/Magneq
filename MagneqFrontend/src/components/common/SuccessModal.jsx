import React from "react";
import {IoMdClose} from "react-icons/io";
import {MdOutlineDoneOutline} from "react-icons/md";

const SuccessModal = ({open, onClose}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-transparent  flex justify-center items-center z-50">
      <div className="relative bg-green-100  border border-green-500 rounded-[12px] px-8 py-6 shadow-md w-[350px]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#999] hover:text-black"
        >
          <IoMdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold text-[#222]">
          Congratulations , Stock <br />
          added successfully
        </h2>

        <div className="flex justify-center mt-4">
          <MdOutlineDoneOutline size={45}/>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
