import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListOrders, useGetOrderStats, useCancelOrder, getListOrdersQueryKey, getGetOrderStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Clock, XCircle, MapPin, Calendar, ChevronRight, FileText } from "lucide-react";
import { Show, useUser } from "@clerk/react";

type OrderStatus = "pending" | "confirmed" | "picked_up" | "in_progress" | "ready" | "delivered" | "cancelled";

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "picked_up": return "bg-purple-100 text-purple-800 border-purple-200";
    case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
    case "ready": return "bg-teal-100 text-teal-800 border-teal-200";
    case "delivered": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getServiceLabel = (service: string) => {
  switch (service) {
    case "wash_fold": return "Wash & Fold";
    case "dry_cleaning": return "Dry Cleaning";
    case "ironing": return "Ironing";
    case "express": return "Express (Same Day)";
    default: return service;
  }
};

export default function Account() {
  const { isSignedIn, user } = useUser();
  const { data: orders, isLoading } = useListOrders(isSignedIn ? ({ mine: "true" } as any) : undefined);
  const { data: stats } = useGetOrderStats();
  const cancelOrder = useCancelOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = (id: number) => {
    cancelOrder.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        toast({ title: "Order Cancelled", description: "Your order has been cancelled." });
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <Show when="signed-in">
            <p className="text-gray-500 mt-1">{user?.firstName} {user?.lastName} • {user?.emailAddresses?.[0]?.emailAddress}</p>
          </Show>
        </div>
      </div>

      <Show when="signed-out">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in to track your orders</h2>
          <p className="text-gray-600 mb-4">View your complete order history, track active pickups, and manage your account.</p>
          <Link href="/sign-in">
            <Button>Sign In / Register</Button>
          </Link>
        </div>
      </Show>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 font-medium">Total Orders</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">{stats.pending + stats.inProgress}</div>
            <div className="text-xs text-gray-500 font-medium">Active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs text-gray-500 font-medium">Delivered</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.todayPickups}</div>
            <div className="text-xs text-gray-500 font-medium">Pickups Today</div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
        
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : orders?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mb-4">Schedule your first pickup today!</p>
              <Link href="/schedule">
                <Button>Schedule a Pickup</Button>
              </Link>
            </div>
          ) : (
            orders?.map((order) => (
              <Card key={order.id} className="border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-5 flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 font-medium mb-1">Order #{order.id}</div>
                        <h3 className="font-bold text-lg text-gray-900">{getServiceLabel(order.serviceType)}</h3>
                      </div>
                      <Badge variant="outline" className={`capitalize font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(order.scheduledDate).toLocaleDateString()} at {order.scheduledTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{order.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 sm:w-48 flex flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100">
                    <Link href={`/track/${order.id}`} className="w-full">
                      <Button variant="default" className="w-full justify-between group">
                        Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    
                    <Link href={`/orders/${order.id}`} className="w-full">
                      <Button variant="outline" className="w-full justify-center text-gray-600 bg-white hover:bg-gray-50">
                        <FileText className="w-4 h-4 mr-2" /> Receipt
                      </Button>
                    </Link>

                    {order.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
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
                            <AlertDialogAction onClick={() => handleCancel(order.id)} className="bg-red-600 hover:bg-red-700">
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}