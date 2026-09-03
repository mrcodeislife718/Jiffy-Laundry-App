import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useCreateOrder, useCreateQuote, useListOffers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ShieldCheck, Clock, Truck, Sparkles } from "lucide-react";
type ServiceType = "wash_fold" | "dry_cleaning" | "ironing" | "express";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="space-y-8 p-4 md:p-0"
    >
      <section className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            24 HOURS OR IT'S FREE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
            Fast & Reliable Laundry Service Delivered Right to Your Door!
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg">
            Clean clothes. Happy life. Let us handle the laundry while you focus on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="font-bold rounded-full shadow-lg" onClick={() => setLocation("/schedule")}>
              Schedule a Pickup
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 rounded-full" onClick={() => {
              document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Get a Quick Quote
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Clock, title: "24-Hour Turnaround", desc: "We pickup, clean, and deliver within 24 hours. Express same-day available." },
          { icon: ShieldCheck, title: "Premium Care", desc: "Expert stain removal, perfect folding, and eco-friendly products." },
          { icon: Truck, title: "Free Delivery", desc: "No delivery fees for orders over $30. Track your driver in real-time." }
        ].map((feature, i) => (
          <Card key={i} className="border-none shadow-sm bg-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="quote-section" className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-primary w-6 h-6" /> Quick Quote
        </h2>
        <QuickQuoteForm />
      </section>
    </motion.div>
  );
}

function QuickQuoteForm() {
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("wash_fold");
  const [weight, setWeight] = useState("");
  const createQuote = useCreateQuote();
  
  const handleQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    createQuote.mutate({
      data: {
        address,
        serviceType,
        estimatedWeight: weight ? Number(weight) : undefined
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleQuote} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="q-address">Delivery Address</Label>
          <Input id="q-address" placeholder="123 Main St, Apt 4B" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="q-service">Service Type</Label>
            <Select value={serviceType} onValueChange={(val) => setServiceType(val as ServiceType)}>
              <SelectTrigger id="q-service">
                <SelectValue placeholder="Select service" />
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
            <Label htmlFor="q-weight">Estimated Weight (lbs) - Optional</Label>
            <Input id="q-weight" type="number" placeholder="15" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={createQuote.isPending || !address}>
          {createQuote.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Calculate Estimate
        </Button>
      </form>

      {createQuote.isSuccess && createQuote.data && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-700">Estimated Price</CardTitle>
            <div className="text-4xl font-bold text-gray-900">
              ${createQuote.data.estimatedPrice.toFixed(2)}
            </div>
            <CardDescription>{createQuote.data.note}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {createQuote.data.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/schedule" className="w-full">
              <Button className="w-full gap-2">Book This Service <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
