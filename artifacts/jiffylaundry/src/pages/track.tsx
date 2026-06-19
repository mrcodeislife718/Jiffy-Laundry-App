import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle, Package, Truck, WashingMachine, Shirt, Home, XCircle } from "lucide-react";
import { getServiceLabel, getStatusColor } from "./account";
type OrderStatus = "pending" | "confirmed" | "picked_up" | "in_progress" | "ready" | "delivered" | "cancelled";

const STATUS_TIMELINE = [
  { id: "pending", label: "Order Received", icon: Package },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "picked_up", label: "Picked Up", icon: Truck },
  { id: "in_progress", label: "Cleaning", icon: WashingMachine },
  { id: "ready", label: "Ready for Delivery", icon: Shirt },
  { id: "delivered", label: "Delivered", icon: Home },
] as const;

export default function Track() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  
  const { data: order, isLoading, isError } = useGetOrder(id);

  if (isError) {
    return (
      <div className="p-4 md:p-8 text-center max-w-md mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find tracking information for this order.</p>
        <Link href="/account"><Button>Back to Account</Button></Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="p-4 md:p-0 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const currentStatusIndex = STATUS_TIMELINE.findIndex(s => s.id === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 max-w-2xl mx-auto space-y-6"
    >
      <Link href="/account" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Track Order #{order.id}</h1>
          <p className="text-gray-500 mt-1">{getServiceLabel(order.serviceType)} • {new Date(order.scheduledDate).toLocaleDateString()}</p>
        </div>
        <Badge variant="outline" className={`text-sm px-3 py-1 border ${getStatusColor(order.status)}`}>
          {order.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Status Timeline</span>
        </div>
        <CardContent className="p-6">
          {isCancelled ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Order Cancelled</h3>
              <p className="text-gray-500 mt-2">This order was cancelled and will not be processed.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="relative pl-8">
                    {/* Circle Node */}
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2
                      ${isCompleted ? 'border-primary' : 'border-gray-200'}
                      ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                    `}>
                      {isCompleted ? (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      ) : null}
                    </div>
                    
                    {/* Content */}
                    <div className={`${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-5 h-5 ${isCurrent ? 'text-primary' : (isCompleted ? 'text-gray-600' : 'text-gray-300')}`} />
                        <h4 className={`font-bold ${isCurrent ? 'text-primary text-lg' : 'text-base'}`}>
                          {step.label}
                        </h4>
                      </div>
                      {isCurrent && (
                        <p className="text-sm text-gray-500 mt-1">
                          {step.id === 'pending' && "We've received your order and are assigning a driver."}
                          {step.id === 'confirmed' && "Driver assigned. We'll see you at the scheduled time."}
                          {step.id === 'picked_up' && "Your laundry is safe with us and heading to the facility."}
                          {step.id === 'in_progress' && "We're currently cleaning your items with care."}
                          {step.id === 'ready' && "All clean! We're preparing for delivery."}
                          {step.id === 'delivered' && "Delivered! Enjoy your clean clothes."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Delivery Address</span>
              <span className="font-medium text-gray-900">{order.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block mb-1">Contact Name</span>
                <span className="font-medium text-gray-900">{order.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Phone</span>
                <span className="font-medium text-gray-900">{order.phone}</span>
              </div>
            </div>
            {order.specialInstructions && (
              <div>
                <span className="text-gray-500 block mb-1">Instructions</span>
                <span className="font-medium text-gray-900 bg-gray-50 p-2 rounded block">{order.specialInstructions}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {order.estimatedPrice && (
          <Card className="border-gray-200 shadow-sm bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col justify-center h-full items-center text-center">
              <span className="text-gray-600 font-medium mb-2">Estimated Total</span>
              <span className="text-5xl font-extrabold text-primary">${order.estimatedPrice.toFixed(2)}</span>
              <p className="text-xs text-gray-500 mt-4 max-w-xs">
                Final price may vary slightly based on exact weight at facility.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}