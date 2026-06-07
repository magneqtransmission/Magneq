import React, {useState} from "react";
import {useSelector} from "react-redux";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-hot-toast";
import useProduction from "../../services/useProduction";
import OrderItemsForm from "../../components/sales/OrderItemsForm";
import Button from "../../components/buttons/Button";
import { useNavigate } from "react-router-dom";


const CreatePRO = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [model, setModel] = useState("");
    const [type, setType] = useState("");
    const [ratio, setRatio] = useState("");
    const [quantity, setQuantity] = useState("");
    const [power, setPower] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editedItem, setEditedItem] = useState({});
    const queryClient = useQueryClient();
    const user = useSelector((state) => state.auth.user);
    const {createProductionOrder} = useProduction();

      const {
        mutate: createOrder,
        isPending,
        isSuccess,
        isError,
        error,
      } = useMutation({
        mutationFn: (orderPayload) => createProductionOrder(orderPayload),
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ["pendingProductions"]});
          toast.success("Order submitted successfully!");
          setItems([]);
          navigate("/production");
        },
        onError: (err) => {
          console.error("Order creation failed:", err);
          toast.error("Failed to create order. Please try again.");
        },
      });

    const handleSubmit = (e) =>{
        e.preventDefault();
        
            if (items.length === 0) {
              toast.error("Please add at least one item before submitting.");
              return;
            }
        
            const payload = {
              created_by: user?._id || null,
              finished_goods: items.map((item) => ({
                model: item.model,
                type: item.type,
                ratio: item.ratio,
                power: item.power,
                quantity: item.quantity,
              })),
            };
            console.log(payload)
            createOrder(payload)
    }

    return(
        <div className="grid gap-4 md:gap-6 bg-background text-text p-15 md:p-15 rounded-lg shadow-sm">
            <h1 className="text-3xl font-semibold text-text">Create Production Order</h1>
            <form onSubmit={handleSubmit}>
                <OrderItemsForm
                    items={items}
                    setItems={setItems}
                    model={model}
                    setModel={setModel}
                    type={type}
                    setType={setType}
                    ratio={ratio}
                    setRatio={setRatio}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    power={power}
                    setPower={setPower}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    editedItem={editedItem}
                    setEditedItem={setEditedItem}
                />
                <div className="mt-6">
                    <Button
                        type="submit"
                        size="xl"
                        variant="primary"
                        className="p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={items.length === 0 }
                    >
                        Submit Production Order
                    </Button>
                </div>
            </form>
        </div>
    );
}
export default CreatePRO;