import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListOrders, useGetOrderStats, useUpdateOrder, getListOrdersQueryKey, getGetOrderStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, ShieldCheck, MapPin, Calendar, CheckCircle2, Truck, Shirt, Home, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceLabel, getStatusColor } from "./account";

type OrderStatus = "pending" | "confirmed" | "picked_up" | "in_progress" | "ready" | "delivered" | "cancelled";

export default function Admin() {
  const { data: orders, isLoading } = useListOrders();
  const { data: stats } = useGetOrderStats();
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState("all");

  const handleStatusUpdate = (id: number, status: OrderStatus) => {
    updateOrder.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
          toast({ title: "Order Updated", description: `Order #${id} status changed to ${status.replace("_", " ")}.` });
        },
      }
    );
  };

  const filteredOrders = orders?.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "confirmed", "picked_up", "in_progress", "ready"].includes(order.status);
    return order.status === filter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 space-y-6 mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage all laundry orders</p>
        </div>
      </div>

      <Show when="signed-out">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
          <p className="text-gray-600 mb-6">You must be signed in to an authorized staff account to access the admin dashboard.</p>
          <Link href="/sign-in">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </Show>

      <Show when="signed-in">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500 font-medium">Total Orders</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-sm text-gray-500 font-medium">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-500 font-medium">In Progress</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-sm text-gray-500 font-medium">Delivered</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
              <TabsList className="bg-gray-200/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Service & Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-3 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link href={`/orders/${order.id}`} className="hover:text-primary">#{order.id}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={order.address}>{order.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">{getServiceLabel(order.serviceType)}</div>
                        <div className="text-xs text-gray-500">{new Date(order.scheduledDate).toLocaleDateString()} @ {order.scheduledTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize font-semibold border whitespace-nowrap ${getStatusColor(order.status)}`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.estimatedPrice ? `$${order.estimatedPrice.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Select
                          disabled={updateOrder.isPending}
                          value={order.status}
                          onValueChange={(val) => handleStatusUpdate(order.id, val as OrderStatus)}
                        >
                          <SelectTrigger className="w-[140px] ml-auto h-8 text-xs bg-white border-gray-200">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="picked_up">Picked Up</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Show>
    </motion.div>
  );
}