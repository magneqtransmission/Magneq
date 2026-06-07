import React, {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Button from "../../components/buttons/Button";
import SuccessModal from "../../components/common/SuccessModal";
import useFinishedGoods from "../../services/useFinishedGoods";
import {useMutation, useQuery} from "@tanstack/react-query";
import useQuality from "../../services/useQuality";
import {useQueryClient} from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const issueTypes = [
  {value: "Material", label: "Material"},
  {value: "Delivery", label: "Delivery"},
  {value: "Process", label: "Process"},
  {value: "Employee", label: "Employee"},
];

const typeOptions = [
  {value: "Base (Foot)", label: "Base (Foot)"},
  {value: "Vertical (Flange)", label: "Vertical (Flange)"},
];

const initialItem = () => ({
  model: "",
  power: "",
  ratio: "",
  type: "",
  order_number: "",
});

const CreateTicket = () => {
  const queryClient = useQueryClient();
  const {getModalConfig} = useFinishedGoods();
  const {createQualityIssue} = useQuality();
  const [issueType, setIssueType] = useState("Material");
  const [items, setItems] = useState([initialItem()]);
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const modalTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const {
    data: modelConfig,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["modalConfig"],
    queryFn: async () => {
      const data = await getModalConfig();
      Object.keys(data).forEach((modelKey) => {
        data[modelKey].powers = data[modelKey].powers.map(item=>item);
        const normalizedRatios = {};
        Object.keys(data[modelKey].ratios).forEach((powerKey) => {
          normalizedRatios[powerKey.toString()] =
            data[modelKey].ratios[powerKey];
        });
        data[modelKey].ratios = normalizedRatios;
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: createQualityIssue,
    onSuccess: () => {
      toast.success("Quality Ticket Raised Successfully")
      queryClient.invalidateQueries({queryKey: ["quality-issues"]});
      navigate("/quality")
    },
    onError: (error) => {
      console.error("Failed to create quality issue:", error);
      toast.error("Failed to submit ticket. Please try again.");
    },
  });

  const handleItemChange = (idx, key, value) => {
    const newItems = [...items];
    newItems[idx][key] = value;

    if (key === "model") {
      newItems[idx].power = "";
      newItems[idx].ratio = "";
    } else if (key === "power") {
      newItems[idx].ratio = "";
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, initialItem()]);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const isFormValid =
    issueType === "Material"
      ? items.every(
          (item) => item.model && item.power && item.ratio && item.type
        )
      : description.trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    if(!description) {
      toast.error("Desription is Required");
      return;
    }
    const payload =
      issueType === "Material"
        ? {
            issue_type: issueType,
            items: items.map((item) => ({
              model: item.model,
              power: item.power,
              ratio: item.ratio,
              type: item.type,
              order_number: item.order_number,
            })),
            description,
          }
        : {
            issue_type: issueType,
            description,
          };

    mutation.mutate(payload);
  };

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  const modelOptions = modelConfig
    ? Object.keys(modelConfig).map((model) => ({
        value: model,
        label: model,
      }))
    : [];

  return (
    <div
      className="rounded-2xl shadow border ml-0 mt-8"
      style={{
        background: "rgba(var(--background))",
        borderColor: "rgba(var(--border))",
        color: "rgba(var(--text))",
        maxWidth: 900,
        padding: "3rem 2rem",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "2.5rem",
          color: "rgba(var(--text))",
        }}
      >
        Create Ticket
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6" style={{maxWidth: 500}}>
          <label className="block text-sm font-medium mb-1">Issue Type</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{
              background: "rgba(var(--background))",
              color: "rgba(var(--text))",
              border: "1px solid rgba(var(--border))",
              borderRadius: "0.5rem",
            }}
          >
            {issueTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {issueType === "Material" &&
          items.map((item, idx) => {
            const powers =
              modelConfig && item.model
                ? modelConfig[item.model]?.powers || []
                : [];

            const ratios =
              (modelConfig &&
                item.model &&
                item.power &&
                Array.isArray(modelConfig[item.model]?.ratios?.[item.power])
                  ? [...modelConfig[item.model].ratios[item.power]]
                      .map(parseFloat)
                      .filter((r) => !isNaN(r))
                      .sort((a, b) => a - b)
                      .map(String)
                  : []
              );
            return (
              <div key={idx} className="flex flex-wrap gap-4 mb-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium mb-1">
                    Model
                  </label>
                  <select
                    value={item.model}
                    onChange={(e) =>
                      handleItemChange(idx, "model", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{
                      background: "rgba(var(--background))",
                      color: "rgba(var(--text))",
                      border: "1px solid rgba(var(--border))",
                    }}
                  >
                    <option value="">Select Model</option>
                    {modelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium mb-1">
                    Power
                  </label>
                  <select
                    value={item.power}
                    onChange={(e) =>
                      handleItemChange(idx, "power", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    disabled={!item.model}
                    style={{
                      background: "rgba(var(--background))",
                      color: "rgba(var(--text))",
                      border: "1px solid rgba(var(--border))",
                    }}
                  >
                    <option value="">Select Power</option>
                    {powers.map((power) => (
                      <option key={power} value={power}>
                        {power}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium mb-1">
                    Ratio
                  </label>
                  <select
                    value={item.ratio}
                    onChange={(e) =>
                      handleItemChange(idx, "ratio", e.target.value)
                    }
                    disabled={!item.power}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{
                      background: "rgba(var(--background))",
                      color: "rgba(var(--text))",
                      border: "1px solid rgba(var(--border))",
                    }}
                  >
                    <option value="">Select Ratio</option>
                    {ratios.map((ratio) => (
                      <option key={ratio} value={ratio}>
                        {ratio}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleItemChange(idx, "type", e.target.value)
                    }
                    disabled={!item.ratio}
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{
                      background: "rgba(var(--background))",
                      color: "rgba(var(--text))",
                      border: "1px solid rgba(var(--border))",
                    }}
                  >
                    <option value="">Select Type</option>
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium mb-1">
                    Order Number
                  </label>
                  <input
                    value={item.order_number}
                    onChange={(e) =>
                      handleItemChange(idx, "order_number", e.target.value)
                    }
                    placeholder="ORD-XXX"
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{
                      background: "rgba(var(--background))",
                      color: "rgba(var(--text))",
                      border: "1px solid rgba(var(--border))",
                    }}
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 text-xs font-medium ml-2 mb-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

        {/* <div className="mb-6">
          {issueType === "Material" && (
            <button
              type="button"
              onClick={handleAddItem}
              className="text-[#4F7FFF] text-sm font-medium hover:underline"
            >
              + Add more Items
            </button>
          )}
        </div> */}

        <div className="mb-8" style={{maxWidth: 500}}>
          <label className="block text-sm font-medium mb-1">
            Description / Other Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write additional details here"
            className="w-full px-3 py-2 text-sm rounded-lg"
            rows={4}
            style={{
              background: "rgba(var(--background))",
              color: "rgba(var(--text))",
              border: "1px solid rgba(var(--border))",
            }}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isFormValid}
          className="px-8 py-3 text-base"
        >
          Submit Ticket
        </Button>
      </form>

      <SuccessModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default CreateTicket;
