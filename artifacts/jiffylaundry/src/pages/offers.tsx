import { motion } from "framer-motion";
import { useListOffers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Tag } from "lucide-react";
import { Link } from "wouter";

export default function Offers() {
  const { data: offers, isLoading } = useListOffers();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="p-4 md:p-0 space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
        <p className="text-gray-500 mt-1">Exclusive deals to keep your wardrobe fresh.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))
        ) : offers?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No active offers right now. Check back soon!</p>
          </div>
        ) : (
          offers?.map((offer) => (
            <Link key={offer.id} href="/schedule">
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                <div className="h-32 bg-primary/10 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
                  {offer.imageUrl ? (
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-primary text-5xl font-black italic -rotate-6 scale-110 group-hover:scale-125 transition-transform duration-500">
                      {offer.discount}
                    </div>
                  )}
                  {offer.badgeText && (
                    <Badge className="absolute top-3 right-3 bg-white text-primary border-none font-bold">
                      {offer.badgeText}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5 relative">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </motion.div>
  );
}