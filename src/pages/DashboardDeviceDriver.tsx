import { Download, Monitor, Fingerprint, Smartphone, Cpu, Usb, ExternalLink, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DriverItem {
  name: string;
  description: string;
  category: string;
  icon: typeof Monitor;
  links: { label: string; url: string }[];
}

const drivers: DriverItem[] = [
  // Morpho Biometric Devices
  {
    name: "Morpho MSO 1300 E2 / E3",
    description: "Most popular fingerprint scanner for AEPS. Supports RD Service for authentication.",
    category: "Biometric",
    icon: Fingerprint,
    links: [
      { label: "Windows Driver + RD Service", url: "https://download.morpho.com/MorphoRDServiceSetup_V2.0.2.0.exe" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.scl.rdservice" },
    ],
  },
  {
    name: "Mantra MFS100 V2",
    description: "Widely used single fingerprint scanner for AEPS and Aadhaar authentication.",
    category: "Biometric",
    icon: Fingerprint,
    links: [
      { label: "Windows Driver", url: "https://download.mantratec.com/Forms/DriverDownload.aspx" },
      { label: "RD Service (Windows)", url: "https://download.mantratec.com/RDService/MantraRDService.exe" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.mantra.rdservice" },
    ],
  },
  {
    name: "Mantra MFS110 L1",
    description: "L1 certified biometric device for AEPS transactions.",
    category: "Biometric",
    icon: Fingerprint,
    links: [
      { label: "Windows Driver + RD", url: "https://download.mantratec.com/Forms/DriverDownload.aspx" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.mantra.rdservice" },
    ],
  },
  {
    name: "Startek FM220U",
    description: "Compact USB fingerprint scanner with L0/L1 certification.",
    category: "Biometric",
    icon: Fingerprint,
    links: [
      { label: "Windows Driver + RD", url: "https://www.startekfingerprint.com/downloads" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.acpl.registersdk" },
    ],
  },
  {
    name: "Secugen Hamster Pro 20 (HU20)",
    description: "FBI PIV certified fingerprint scanner for secure biometric capture.",
    category: "Biometric",
    icon: Fingerprint,
    links: [
      { label: "Windows Driver", url: "https://secugen.com/download" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.secugen.rdservice" },
    ],
  },

  // Iris Scanner
  {
    name: "Mantra MIS100V2 Iris Scanner",
    description: "Iris-based authentication device for Aadhaar eKYC and AEPS.",
    category: "Biometric",
    icon: Cpu,
    links: [
      { label: "Windows Driver + RD", url: "https://download.mantratec.com/Forms/DriverDownload.aspx" },
      { label: "Android RD Service (Play Store)", url: "https://play.google.com/store/apps/details?id=com.mantra.iris.rdservice" },
    ],
  },

  // mATM / mPOS Devices
  {
    name: "PAX D180 mPOS",
    description: "Mobile POS terminal for card-based mATM transactions.",
    category: "mATM / POS",
    icon: Smartphone,
    links: [
      { label: "Android App (Play Store)", url: "https://play.google.com/store/apps/details?id=com.pax.market.android.app" },
    ],
  },
  {
    name: "Morefun MP35 / MP45",
    description: "Portable mPOS device for card swipe, chip, and contactless transactions.",
    category: "mATM / POS",
    icon: Smartphone,
    links: [
      { label: "Driver Download", url: "https://www.morefun-et.com/en/support/download" },
    ],
  },

  // Printer Drivers
  {
    name: "Bluetooth Thermal Printer (58mm / 80mm)",
    description: "Common receipt printer used with AEPS, mATM, and other services.",
    category: "Printer",
    icon: Monitor,
    links: [
      { label: "Windows Driver (Generic)", url: "https://www.seagullscientific.com/drivers/thermal/" },
      { label: "Android App — RawBT (Play Store)", url: "https://play.google.com/store/apps/details?id=ru.a402.rawbtprinter" },
    ],
  },

  // USB to Serial / Common Utilities
  {
    name: "Prolific USB-to-Serial Driver",
    description: "Required when connecting biometric devices via USB-to-Serial adapters.",
    category: "Utility",
    icon: Usb,
    links: [
      { label: "Windows Driver", url: "https://www.prolific.com.tw/US/ShowProduct.aspx?p_id=225&pcid=41" },
    ],
  },
  {
    name: "Java Runtime Environment (JRE)",
    description: "Required by many RD Service applications and banking portals.",
    category: "Utility",
    icon: Cpu,
    links: [
      { label: "Download Java (Windows)", url: "https://www.java.com/en/download/" },
    ],
  },
];

const categories = [...new Set(drivers.map((d) => d.category))];

const categoryIcons: Record<string, typeof Fingerprint> = {
  Biometric: Fingerprint,
  "mATM / POS": Smartphone,
  Printer: Monitor,
  Utility: Cpu,
};

export default function DashboardDeviceDriver() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-primary p-6">
        <div className="flex items-center gap-3">
          <Download className="w-7 h-7 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground">Device Drivers & Software</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">Download all required drivers for biometric, mATM, POS and printer devices</p>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
        <strong>⚠️ Important:</strong> Always download RD Service and drivers from official sources. After installing, restart your device and register the biometric device before first use.
      </div>

      {/* Driver Categories */}
      {categories.map((cat) => {
        const CatIcon = categoryIcons[cat] || Cpu;
        const catDrivers = drivers.filter((d) => d.category === cat);
        return (
          <div key={cat} className="rounded-xl bg-gradient-card border border-border overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <CatIcon className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">{cat}</h2>
              <Badge variant="secondary" className="ml-2 text-xs">{catDrivers.length} devices</Badge>
            </div>
            <div className="divide-y divide-border">
              {catDrivers.map((driver) => (
                <div key={driver.name} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <driver.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{driver.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{driver.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {driver.links.map((link) => (
                          <Button
                            key={link.label}
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                          >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-3.5 h-3.5 mr-1" />
                              {link.label}
                              <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
