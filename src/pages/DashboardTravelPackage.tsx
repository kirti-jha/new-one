import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, Users, Star } from "lucide-react";

const packages = [
  { id: 1, name: "Goa Beach Getaway", destination: "Goa", duration: "3N/4D", price: 12999, rating: 4.5, persons: "2 Adults", highlights: ["Beach Resort", "Water Sports", "Nightlife Tour"], popular: true },
  { id: 2, name: "Kerala Backwaters", destination: "Kerala", duration: "4N/5D", price: 18999, rating: 4.8, persons: "2 Adults", highlights: ["Houseboat Stay", "Ayurveda Spa", "Munnar Hills"], popular: true },
  { id: 3, name: "Rajasthan Royal Tour", destination: "Jaipur-Udaipur", duration: "5N/6D", price: 24999, rating: 4.6, persons: "2 Adults", highlights: ["Palace Visit", "Desert Safari", "Cultural Shows"], popular: false },
  { id: 4, name: "Himachal Adventure", destination: "Manali-Shimla", duration: "4N/5D", price: 15999, rating: 4.4, persons: "2 Adults", highlights: ["Paragliding", "Snow Activities", "River Rafting"], popular: false },
  { id: 5, name: "Andaman Islands", destination: "Port Blair", duration: "5N/6D", price: 32999, rating: 4.9, persons: "2 Adults", highlights: ["Scuba Diving", "Island Hopping", "Beach Camping"], popular: true },
  { id: 6, name: "Varanasi Spiritual Tour", destination: "Varanasi", duration: "2N/3D", price: 8999, rating: 4.3, persons: "2 Adults", highlights: ["Ganga Aarti", "Temple Visit", "Boat Ride"], popular: false },
];

export default function DashboardTravelPackage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Travel Packages</h1>
        <p className="text-sm text-muted-foreground">Curated travel packages and holiday deals for your customers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="overflow-hidden flex flex-col">
            <div className="h-3 bg-gradient-to-r from-primary/80 to-primary/40" />
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{pkg.destination}</p>
                </div>
                {pkg.popular && <Badge variant="default" className="text-[10px]">Popular</Badge>}
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground my-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{pkg.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pkg.persons}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />{pkg.rating}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {pkg.highlights.map((h) => <Badge key={h} variant="secondary" className="text-[10px] font-normal">{h}</Badge>)}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">₹{pkg.price.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">per person</p>
                </div>
                <Button size="sm"><Package className="w-4 h-4 mr-1" /> Book Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
