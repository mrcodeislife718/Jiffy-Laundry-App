import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useCreateOrder, getListOrdersQueryKey, getGetOrderStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, User, Package } from "lucide-react";
type ServiceType = "wash_fold" | "dry_cleaning" | "ironing" | "express";

export default function Schedule() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    serviceType: "wash_fold" as ServiceType,
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    specialInstructions: ""
  });

  const createOrder = useCreateOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        toast({
          title: "Pickup Scheduled!",
          description: "Your laundry pickup has been confirmed.",
        });
        setLocation("/account");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not schedule pickup. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule Pickup</h1>
        <p className="text-gray-500 mt-1">Book your laundry service in seconds.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={formData.name} onChange={e => updateField("name", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" required type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="address">Pickup/Delivery Address</Label>
                  <Textarea id="address" required rows={3} value={formData.address} onChange={e => updateField("address", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Service Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(val) => updateField("serviceType", val)}>
                    <SelectTrigger id="serviceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wash_fold">Wash & Fold</SelectItem>
                      <SelectItem value="dry_cleaning">Dry Cleaning</SelectItem>
                      <SelectItem value="ironing">Ironing</SelectItem>
                      <SelectItem value="express">Express (Same Day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea 
                    id="instructions" 
                    placeholder="E.g., Please use hypoallergenic detergent, leave at back door..." 
                    rows={2}
                    value={formData.specialInstructions} 
                    onChange={e => updateField("specialInstructions", e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Schedule Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Pickup Date</Label>
                    <Input id="date" type="date" required min={new Date().toISOString().split("T")[0]} value={formData.scheduledDate} onChange={e => updateField("scheduledDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time Window</Label>
                    <Select value={formData.scheduledTime} onValueChange={(val) => updateField("scheduledTime", val)}>
                      <SelectTrigger id="time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00 AM - 10:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12:00">12:00 PM - 02:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM - 04:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM - 06:00 PM</SelectItem>
                        <SelectItem value="18:00">06:00 PM - 08:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full font-bold text-lg h-14 rounded-xl" disabled={createOrder.isPending}>
              {createOrder.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Confirm Pickup
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}