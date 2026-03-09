import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, Users, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardTravelPackage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem("travel_packages");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Goa Beach Getaway", destination: "Goa", duration: "3N/4D", price: 12999, rating: 4.5, persons: "2 Adults", highlights: ["Beach Resort", "Water Sports", "Nightlife Tour"], popular: true },
      { id: 2, name: "Kerala Backwaters", destination: "Kerala", duration: "4N/5D", price: 18999, rating: 4.8, persons: "2 Adults", highlights: ["Houseboat Stay", "Ayurveda Spa", "Munnar Hills"], popular: true },
      { id: 3, name: "Rajasthan Royal Tour", destination: "Jaipur-Udaipur", duration: "5N/6D", price: 24999, rating: 4.6, persons: "2 Adults", highlights: ["Palace Visit", "Desert Safari", "Cultural Shows"], popular: false },
      { id: 4, name: "Himachal Adventure", destination: "Manali-Shimla", duration: "4N/5D", price: 15999, rating: 4.4, persons: "2 Adults", highlights: ["Paragliding", "Snow Activities", "River Rafting"], popular: false },
      { id: 5, name: "Andaman Islands", destination: "Port Blair", duration: "5N/6D", price: 32999, rating: 4.9, persons: "2 Adults", highlights: ["Scuba Diving", "Island Hopping", "Beach Camping"], popular: true },
      { id: 6, name: "Varanasi Spiritual Tour", destination: "Varanasi", duration: "2N/3D", price: 8999, rating: 4.3, persons: "2 Adults", highlights: ["Ganga Aarti", "Temple Visit", "Boat Ride"], popular: false },
    ];
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "", destination: "", duration: "", price: "", persons: "", highlights: "", popular: false
  });

  useEffect(() => {
    localStorage.setItem("travel_packages", JSON.stringify(packages));
  }, [packages]);

  const handleSave = () => {
    if (editingPackage) {
      setPackages(packages.map((p: any) => p.id === editingPackage.id ? {
        ...formData,
        id: p.id,
        price: Number(formData.price),
        rating: p.rating,
        highlights: formData.highlights.split(",").map(h => h.trim())
      } : p));
    } else {
      const newPkg = {
        ...formData,
        id: Date.now(),
        price: Number(formData.price),
        rating: 5.0,
        highlights: formData.highlights.split(",").map(h => h.trim())
      };
      setPackages([...packages, newPkg]);
    }
    setIsAddOpen(false);
    setEditingPackage(null);
    setFormData({ name: "", destination: "", duration: "", price: "", persons: "", highlights: "", popular: false });
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price.toString(),
      persons: pkg.persons,
      highlights: pkg.highlights.join(", "),
      popular: pkg.popular
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages(packages.filter((p: any) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Travel Packages</h1>
          <p className="text-sm text-muted-foreground">Curated travel packages and holiday deals for your customers.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingPackage(null); setFormData({ name: "", destination: "", duration: "", price: "", persons: "", highlights: "", popular: false }); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add New Package
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg: any) => (
          <Card key={pkg.id} className="overflow-hidden flex flex-col group relative">
            <div className="h-3 bg-gradient-to-r from-primary/80 to-primary/40" />

            {isAdmin && (
              <div className="absolute top-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(pkg)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(pkg.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="pr-16">
                  <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{pkg.destination}</p>
                </div>
                {pkg.popular && <Badge variant="default" className="text-[10px] shrink-0">Popular</Badge>}
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground my-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{pkg.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pkg.persons}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary shrink-0" />{pkg.rating}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {pkg.highlights.map((h: string) => <Badge key={h} variant="secondary" className="text-[10px] font-normal">{h}</Badge>)}
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Package" : "Add New Travel Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Dubai Luxury Tour" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="e.g. Dubai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 4N/5D" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 45000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persons">Persons</Label>
                <Input id="persons" value={formData.persons} onChange={(e) => setFormData({ ...formData, persons: e.target.value })} placeholder="e.g. 2 Adults" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlights">Highlights (Comma separated)</Label>
              <Textarea id="highlights" value={formData.highlights} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} placeholder="e.g. Burj Khalifa, Desert Safari, Marina Cruise" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="popular">Mark as Popular</Label>
              <Switch id="popular" checked={formData.popular} onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
