import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { useGetOrder, useCancelOrder, getGetOrderQueryKey, getGetOrderStatsQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, ShieldCheck, MapPin, Calendar, Clock, Phone, Mail, PackageSearch } from "lucide-react";
import { getServiceLabel, getStatusColor } from "./account";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function OrderDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  
  const { data: order, isLoading, isError } = useGetOrder(id);
  const cancelOrder = useCancelOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = () => {
    cancelOrder.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        toast({ title: "Order Cancelled", description: "Your order has been cancelled." });
      }
    });
  };

  if (isError) {
    return (
      <div className="p-4 md:p-8 text-center max-w-md mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find details for this order.</p>
        <Link href="/account"><Button>Back to Account</Button></Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="p-4 md:p-0 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  const serviceCharge = order.estimatedPrice || 0;
  const isPending = order.status === "pending";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 max-w-3xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center">
        <Link href="/account" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
          <Printer className="w-4 h-4 mr-2" /> Print Receipt
        </Button>
      </div>

      <Card className="border-gray-200 shadow-lg overflow-hidden bg-white print:shadow-none print:border-none">
        <div className="h-2 bg-primary w-full"></div>
        
        <CardHeader className="pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-primary">Jiffy</span>
              <span className="text-2xl font-bold text-gray-900">Laundry</span>
            </div>
            <CardTitle className="text-xl text-gray-800">Order Receipt</CardTitle>
            <p className="text-sm text-gray-500">Order #{order.id}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="outline" className={`text-sm px-3 py-1 border mb-2 ${getStatusColor(order.status)}`}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-900">{order.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" /> {order.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" /> {order.email}
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" /> 
                  <span className="max-w-[200px]">{order.address}</span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Service Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{getServiceLabel(order.serviceType)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" /> 
                  {new Date(order.scheduledDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" /> 
                  {order.scheduledTime}
                </div>
              </div>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">Special Instructions</h4>
              <p className="text-sm text-amber-900">{order.specialInstructions}</p>
            </div>
          )}

          {/* Price Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Price Estimate</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{getServiceLabel(order.serviceType)} Base Charge</span>
                <span>${serviceCharge > 0 ? serviceCharge.toFixed(2) : "TBD"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pickup & Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-4 border-t border-gray-100 mt-4">
                <span>Estimated Total</span>
                <span>${serviceCharge > 0 ? serviceCharge.toFixed(2) : "TBD"}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">
                *Final price depends on exact weight/count at facility.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 flex flex-col items-center justify-center p-6 border-t border-gray-100 text-center">
          <ShieldCheck className="w-8 h-8 text-primary mb-2 opacity-50" />
          <p className="font-medium text-gray-900">Thank you for choosing JiffyLaundry!</p>
          <p className="text-sm text-gray-500 mb-6">24 Hours or It's Free.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm print:hidden">
            <Link href={`/track/${order.id}`} className="flex-1">
              <Button className="w-full"><PackageSearch className="w-4 h-4 mr-2" /> Track Order</Button>
            </Link>
            
            {isPending && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this pickup? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}