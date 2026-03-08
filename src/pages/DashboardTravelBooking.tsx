import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Bus, Hotel, CheckCircle2, Clock } from "lucide-react";

const bookings = [
  { id: "TB01", customer: "Arun Kumar", type: "Flight", route: "DEL → BOM", date: "2026-03-15", amount: 5400, status: "confirmed" },
  { id: "TB02", customer: "Priya Jain", type: "Bus", route: "BLR → CHN", date: "2026-03-12", amount: 850, status: "confirmed" },
  { id: "TB03", customer: "Manish Verma", type: "Hotel", route: "Goa, 2N", date: "2026-03-20", amount: 4200, status: "pending" },
];

export default function DashboardTravelBooking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Travel Booking</h1>
        <p className="text-sm text-muted-foreground">Flight, bus, and hotel booking services.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Flights Booked", value: "42", icon: Plane }, { label: "Bus Tickets", value: "78", icon: Bus }, { label: "Hotel Bookings", value: "15", icon: Hotel }].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon className="w-6 h-6 text-primary" /></div>
              <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="flight">
        <TabsList>
          <TabsTrigger value="flight"><Plane className="w-4 h-4 mr-1.5" /> Flights</TabsTrigger>
          <TabsTrigger value="bus"><Bus className="w-4 h-4 mr-1.5" /> Bus</TabsTrigger>
          <TabsTrigger value="hotel"><Hotel className="w-4 h-4 mr-1.5" /> Hotels</TabsTrigger>
        </TabsList>

        <TabsContent value="flight">
          <Card>
            <CardHeader><CardTitle className="text-lg">Search Flights</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>From</Label><Input placeholder="City or airport" /></div>
                <div className="space-y-2"><Label>To</Label><Input placeholder="City or airport" /></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Passengers</Label><Input type="number" defaultValue={1} min={1} /></div>
              </div>
              <Button><Plane className="w-4 h-4 mr-2" /> Search Flights</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bus">
          <Card>
            <CardHeader><CardTitle className="text-lg">Search Buses</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>From</Label><Input placeholder="Origin city" /></div>
                <div className="space-y-2"><Label>To</Label><Input placeholder="Destination city" /></div>
                <div className="space-y-2"><Label>Travel Date</Label><Input type="date" /></div>
                <div className="space-y-2">
                  <Label>Bus Type</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ac">AC Sleeper</SelectItem>
                      <SelectItem value="nonac">Non-AC</SelectItem>
                      <SelectItem value="volvo">Volvo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button><Bus className="w-4 h-4 mr-2" /> Search Buses</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotel">
          <Card>
            <CardHeader><CardTitle className="text-lg">Search Hotels</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>City</Label><Input placeholder="Destination city" /></div>
                <div className="space-y-2"><Label>Check-in</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Check-out</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Rooms</Label><Input type="number" defaultValue={1} min={1} /></div>
              </div>
              <Button><Hotel className="w-4 h-4 mr-2" /> Search Hotels</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-foreground text-sm">{b.customer}</p>
                  <p className="text-xs text-muted-foreground">{b.type} • {b.route} • {b.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{b.amount.toLocaleString("en-IN")}</p>
                  <Badge variant={b.status === "confirmed" ? "default" : "secondary"} className="gap-1 mt-1">
                    {b.status === "confirmed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
