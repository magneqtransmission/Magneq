import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useMutation, useQueryClient, useQuery} from "@tanstack/react-query";
import {toast} from "react-hot-toast";
import useFinishedGoods from "../../../services/useFinishedGoods";
import Input from "../../../components/forms/Input";
import Button from "../../../components/buttons/Button";
import Select from "../../../components/forms/Select";

const formatPowerLabel = (hp) => `${hp.toFixed(2)} HP`;

const normalizePowerString = (value = "") => {
  if (!value) return "";
  const trimmed = value.toString().trim().toUpperCase();
  const match = trimmed.match(/^(\d+(?:\.\d{0,2})?)(?:\s*HP)?$/);
  if (!match) return trimmed;
  const numeric = Number(match[1]);
  if (Number.isNaN(numeric)) return trimmed;
  return `${numeric.toFixed(2)} HP`;
};

const validatePower = (value) => {
  if (!value) return "Power is required";
  const normalized = normalizePowerString(value);
  return /^\d+\.\d{2} HP$/.test(normalized) ? "" : "Use format X.XX HP (e.g. 1.50 HP)";
};

const validateFrame = (value) => {
  if (value === null || value === "" || value === undefined) {
    return "Frame size is required";
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return "Frame size must be a whole number";
  if (numeric <= 0) return "Frame size must be positive";
  return "";
};

const CreateFinishedGood = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {createFinishedGood, getModalConfig, getAllFinishedGoods} = useFinishedGoods();

  // Fetch model config and all finished goods to build power-frame mappings
  const { data: modelConfig } = useQuery({
    queryKey: ["modelConfig"],
    queryFn: () => getModalConfig(),
  });

  const { data: allFinishedGoods } = useQuery({
    queryKey: ["allFinishedGoods"],
    queryFn: () => getAllFinishedGoods(),
  });

  // Build powerFrameOptions dynamically from backend data
  const powerFrameOptions = useMemo(() => {
    if (!allFinishedGoods || !Array.isArray(allFinishedGoods)) return [];
    
    const powerFrameMap = new Map();
    
    // Extract power-frame mappings from all finished goods
    allFinishedGoods.forEach((fg) => {
      if (fg.power && fg.other_specification?.motor_frame_size != null) {
        const powerStr = fg.power.trim().toUpperCase();
        const frame = Number(fg.other_specification.motor_frame_size);
        
        // Extract numeric HP value from power string (e.g., "1.50 HP" -> 1.5)
        const hpMatch = powerStr.match(/^(\d+(?:\.\d+)?)/);
        if (hpMatch && !isNaN(frame)) {
          const hp = parseFloat(hpMatch[1]);
          // Keep the first frame size found for each power, or update if different
          if (!powerFrameMap.has(hp) || powerFrameMap.get(hp) !== frame) {
            powerFrameMap.set(hp, frame);
          }
        }
      }
    });

    // Convert to array and sort by HP
    return Array.from(powerFrameMap.entries())
      .map(([hp, frame]) => ({ hp, frame }))
      .sort((a, b) => a.hp - b.hp);
  }, [allFinishedGoods]);

  // Get unique powers from model config
  const availablePowers = useMemo(() => {
    if (!modelConfig || typeof modelConfig !== 'object') return [];
    const allPowers = new Set();
    Object.values(modelConfig).forEach((model) => {
      if (model && model.powers && Array.isArray(model.powers)) {
        model.powers.forEach((power) => allPowers.add(power.trim()));
      }
    });
    return Array.from(allPowers).sort();
  }, [modelConfig]);

  const uniqueFrameOptions = useMemo(() => {
    return [...new Set(powerFrameOptions.map((item) => item.frame))].sort((a, b) => a - b);
  }, [powerFrameOptions]);

  // Helper function to get frame for a given power value
  const getFrameForPower = (value) => {
    const normalized = normalizePowerString(value);
    const match = powerFrameOptions.find((option) => formatPowerLabel(option.hp) === normalized);
    return match ? match.frame : null;
  };

  const [form, setForm] = useState({
    model: "",
    power: "",
    type: "",
    ratio: "",
    base_price:"",
    gst_slab:"",
    frame:null,
  });

  const [errors, setErrors] = useState({
    power: "",
    frame: "",
  });

  const mutation = useMutation({
    mutationFn: (data) => createFinishedGood(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["finishedGoods"]);
      toast.success("Finished good created successfully.");
      navigate("/finished_good");
    },
    onError: (err) => {
      toast.error("Error creating finished good: " + err.message);
    },
  });

  const handleChange = (e) => {
    const {name, value} = e.target;

    if (name === "power") {
      const frameForPower = getFrameForPower(value);
      setForm((prev) => {
        const newFrame = frameForPower ?? prev.frame;
        const nextState = {
          ...prev,
          power: value,
          frame: newFrame,
        };
        setErrors((prevErrors) => ({
          ...prevErrors,
          power: validatePower(value),
          frame: validateFrame(newFrame),
        }));
        return nextState;
      });
      return;
    }

    if (name === "frame") {
      const numeric = value === "" ? null : Number(value);
      setForm((prev) => ({
        ...prev,
        frame: numeric,
      }));
      setErrors((prev) => ({
        ...prev,
        frame: validateFrame(numeric),
      }));
      return;
    }

    setForm((prev) => ({...prev, [name]: value}));
  };

  const handlePowerPresetSelect = (e) => {
    const { value } = e.target;
    if (!value) return;
    handleChange({ target: { name: "power", value } });
  };

  const handleFramePresetSelect = (e) => {
    const { value } = e.target;
    handleChange({ target: { name: "frame", value } });
  };

  const availableFrameOptions = useMemo(() => {
    if (!form.power) {
      return uniqueFrameOptions;
    }
    const frameMatch = getFrameForPower(form.power);
    if (frameMatch) {
      return [frameMatch];
    }
    return uniqueFrameOptions;
  }, [form.power]);

  const handlePowerBlur = () => {
    setForm((prev) => {
      const formatted = normalizePowerString(prev.power);
      const frameForPower = getFrameForPower(formatted);
      setErrors((prevErrors) => ({
        ...prevErrors,
        power: validatePower(formatted),
        frame: validateFrame(frameForPower ?? prev.frame),
      }));
      return {
        ...prev,
        power: formatted,
        frame: frameForPower ?? prev.frame,
      };
    });
  };

  const handleFrameBlur = () => {
    setErrors((prev) => ({
      ...prev,
      frame: validateFrame(form.frame),
    }));
  };

  const handleSubmit = () => {
    const {
      model,
      power,
      type,
      ratio,
      base_price,
      gst_slab,
      frame,
    } = form;

    const normalizedPower = normalizePowerString(power);
    const powerError = validatePower(normalizedPower);
    const frameError = validateFrame(frame);

    if (!model || !type || !ratio || !gst_slab) {
      toast.error("Model, Power, Type, Ratio, GST slab, and Frame are required.");
      return;
    }

    if (powerError || frameError) {
      setErrors({
        power: powerError,
        frame: frameError,
      });
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    const payload = {
      model,
      power: normalizedPower,
      type,
      ratio,
      base_price,
      gst_slab,
      other_specification:{
        motor_frame_size:frame,
      }
    };

    mutation.mutate(payload);
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Create Finished Good</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Model</label>
          <Input name="model" value={form.model} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Power
            </label>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
              Choose an existing value or type a new power in the field.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              name="power"
              value={form.power}
              onChange={handleChange}
              onBlur={handlePowerBlur}
              placeholder="e.g. 1.50 HP"
            />
            <select
              value={
                availablePowers.includes(normalizePowerString(form.power))
                  ? normalizePowerString(form.power)
                  : ""
              }
              onChange={handlePowerPresetSelect}
              className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {availablePowers.map((power) => (
                <option key={power} value={power}>
                  {power}
                </option>
              ))}
            </select>
          </div>
          {errors.power && (
            <p className="mt-1 text-xs text-red-500">{errors.power}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Frame
            </label>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
              Pick from presets or enter a new frame size to match the motor.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              name="frame"
              value={form.frame ?? ""}
              onChange={handleChange}
              onBlur={handleFrameBlur}
              placeholder="e.g. 132"
              disabled={!form.power}
            />
            <select
              value={
                form.frame != null && availableFrameOptions.includes(form.frame)
                  ? String(form.frame)
                  : ""
              }
              onChange={handleFramePresetSelect}
              className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!form.power}
            >
              <option value="">Select</option>
              {availableFrameOptions.map((option) => (
                <option key={option} value={String(option)}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {errors.frame && (
            <p className="mt-1 text-xs text-red-500">{errors.frame}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Ratio</label>
          <Input name="ratio" value={form.ratio} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border  bg-white dark:bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Base (Foot)">Base (Foot)</option>
            <option value="Vertical (Flange)">Vertical (Flange)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Base Price</label>
          <Input name="base_price" value={form.base_price} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">GST Slab</label>
          <Select
            name="gst_slab"
            value={form.gst_slab}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select GST slab</option>
            <option value="0">0 %</option>
            <option value="0.25">0.25 %</option>
            <option value="3">3 %</option>
            <option value="5">5 %</option>
            <option value="18">18 %</option>
            <option value="40">40 %</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={mutation.isLoading}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CreateFinishedGood;
